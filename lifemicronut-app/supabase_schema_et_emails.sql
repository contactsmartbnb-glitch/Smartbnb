-- ============================================================
--  LifeMicroNut — Backend "rapport relu & validé"  (Supabase / Postgres)
--  À coller EN ENTIER dans : Supabase -> SQL Editor -> Run
--  Script idempotent : il peut être relancé sans risque. Il REMPLACE les
--  deux scripts précédents (demandes_setup.sql et demandes_backoffice.sql).
--
--  AVANT D'EXÉCUTER, remplacer les 2 valeurs entre chevrons :
--    <TA_CLE_RESEND>        la clé Resend (reste côté serveur, jamais dans une page)
--    <UID_COMPTE_PHARMA>    l'identifiant (UUID) du compte de connexion du back-office
--                           (Supabase -> Authentication -> Users -> colonne "UID")
-- ============================================================

-- 1) TABLE ---------------------------------------------------------------
create table if not exists public.demandes (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  bilan         text not null,                 -- 'digestion' | 'fatigue'
  email         text not null,
  reponses      jsonb,                          -- réponses du questionnaire
  rapport_auto  text,                           -- rapport généré automatiquement (HTML)
  rapport_final text,                           -- rapport corrigé par la pharmacienne (HTML)
  consentement  boolean not null default false,
  consent_at    timestamptz,
  paiement      text not null default 'a_verifier',   -- a_verifier | verifie
  statut        text not null default 'en_attente',   -- en_attente | valide | envoye
  note_interne  text,
  sent_at       timestamptz
);
create index if not exists demandes_created_idx on public.demandes (created_at desc);
create index if not exists demandes_email_idx   on public.demandes (lower(email), created_at desc);

-- 2) QUI EST LA PHARMACIENNE ---------------------------------------------
-- IMPORTANT : "authenticated" = N'IMPORTE QUEL compte créé sur le projet. Tant que
-- l'inscription publique est ouverte dans Supabase, donner les droits au rôle
-- "authenticated" reviendrait à ouvrir les données de santé à qui s'inscrit.
-- Les droits sont donc liés à UN compte précis.
create or replace function public.lmn_est_pharma() returns boolean
language sql stable security definer set search_path = public as $$
  select auth.uid() = '<UID_COMPTE_PHARMA>'::uuid
$$;

-- 3) SÉCURITÉ (RLS + droits par colonne) ----------------------------------
alter table public.demandes enable row level security;

-- 3a) Le public (page web) peut seulement INSÉRER, et seulement ces colonnes.
revoke all on public.demandes from anon;
grant insert (bilan, email, reponses, rapport_auto, consentement, consent_at) on public.demandes to anon;

drop policy if exists "anon_insert_demandes" on public.demandes;
create policy "anon_insert_demandes" on public.demandes
  for insert to anon
  with check (
    consentement = true
    and bilan in ('digestion', 'fatigue')
    and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]{2,}$'
    and char_length(email) <= 254
    and octet_length(coalesce(rapport_auto, '')) <= 300000
    and pg_column_size(coalesce(reponses, '{}'::jsonb)) <= 100000
  );

-- 3b) La pharmacienne (et elle seule) lit et met à jour, sur quelques colonnes.
revoke all on public.demandes from authenticated;
grant select on public.demandes to authenticated;
grant update (rapport_final, statut, paiement, note_interne) on public.demandes to authenticated;

drop policy if exists "auth_select_demandes" on public.demandes;
create policy "auth_select_demandes" on public.demandes
  for select to authenticated using (public.lmn_est_pharma());

drop policy if exists "auth_update_demandes" on public.demandes;
create policy "auth_update_demandes" on public.demandes
  for update to authenticated
  using (public.lmn_est_pharma())
  with check (public.lmn_est_pharma() and statut in ('en_attente', 'valide') and paiement in ('a_verifier', 'verifie'));

-- 4) GARDE-FOU ANTI-ABUS ---------------------------------------------------
-- Limite le nombre de demandes (par adresse et au total) pour protéger la boîte
-- mail de la pharmacienne et le quota d'envoi.
create or replace function public.lmn_garde_demande() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.email := lower(trim(new.email));
  if (select count(*) from public.demandes where lower(email) = new.email and created_at > now() - interval '24 hours') >= 3 then
    raise exception 'Trop de demandes pour cette adresse aujourd''hui.' using errcode = 'P0001';
  end if;
  if (select count(*) from public.demandes where created_at > now() - interval '24 hours') >= 300 then
    raise exception 'Trop de demandes aujourd''hui, réessayez demain.' using errcode = 'P0001';
  end if;
  return new;
end;$$;
drop trigger if exists trg_demande_garde on public.demandes;
create trigger trg_demande_garde before insert on public.demandes
  for each row execute function public.lmn_garde_demande();

-- 5) E-MAILS (Resend via pg_net ; clé côté serveur) -----------------------
create extension if not exists pg_net;

create or replace function public.lmn_esc(t text) returns text
language sql immutable as $$
  select replace(replace(replace(replace(coalesce(t, ''), '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), '"', '&quot;')
$$;

-- 5a) Nouvelle demande -> notification à la pharmacienne (contenu échappé)
create or replace function public.notify_demande() returns trigger
language plpgsql security definer set search_path = public as $$
declare k text := '<TA_CLE_RESEND>';
begin
  perform net.http_post(
    url     := 'https://api.resend.com/emails',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || k),
    body    := jsonb_build_object(
      'from', 'Bilan LifeMicroNut <bilan@lifemicronut.fr>',
      'to',   jsonb_build_array('lifemicronut@gmail.com'),
      'subject', 'Nouvelle demande de bilan à relire — ' || public.lmn_esc(new.bilan),
      'html', '<p>Une nouvelle demande vient d''arriver.</p>'
           || '<ul><li>Bilan : ' || public.lmn_esc(new.bilan) || '</li>'
           || '<li>E-mail : ' || public.lmn_esc(new.email) || '</li>'
           || '<li>Date : ' || to_char(new.created_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') || '</li></ul>'
           || '<p>Ouvrez l''espace pharmacien pour la relire et la valider.</p>'
    ));
  return new;
end;$$;
drop trigger if exists trg_demande_notif on public.demandes;
create trigger trg_demande_notif after insert on public.demandes
  for each row execute function public.notify_demande();

-- 5b) Validation (statut -> 'valide') -> rapport final envoyé au client
create or replace function public.send_rapport() returns trigger
language plpgsql security definer set search_path = public as $$
declare k text := '<TA_CLE_RESEND>';
begin
  if new.statut = 'valide' and coalesce(old.statut, '') <> 'valide'
     and new.email is not null and position('@' in new.email) > 1 then
    perform net.http_post(
      url     := 'https://api.resend.com/emails',
      headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || k),
      body    := jsonb_build_object(
        'from', 'Bilan LifeMicroNut <bilan@lifemicronut.fr>',
        'to',   jsonb_build_array(new.email),
        'reply_to', 'lifemicronut@gmail.com',
        'subject', 'Votre bilan LifeMicroNut, relu par une pharmacienne',
        'html', '<div style="font-family:Arial,Helvetica,sans-serif;color:#1C2530;max-width:640px;margin:auto;line-height:1.55">'
             || '<p>Bonjour,</p><p>Votre bilan a été relu et validé par Dr AICHE, pharmacienne. Vous le trouverez ci-dessous.</p><hr>'
             || coalesce(new.rapport_final, new.rapport_auto, '')
             || '<hr><p style="color:#666;font-size:12px">Ce bilan est une orientation éducative, relue par une pharmacienne. '
             || 'Il ne pose pas de diagnostic et ne remplace pas une consultation médicale. En cas d''urgence, appelez le 15.<br>'
             || 'Pour demander la suppression de vos données : lifemicronut@gmail.com.</p></div>'
      ));
    update public.demandes set statut = 'envoye', sent_at = now() where id = new.id;
  end if;
  return new;
end;$$;
drop trigger if exists trg_demande_send on public.demandes;
create trigger trg_demande_send after update on public.demandes
  for each row execute function public.send_rapport();

-- 6) À FAIRE AUSSI DANS LE TABLEAU DE BORD SUPABASE -------------------------
--   a) Authentication -> Sign In / Providers : désactiver "Allow new users to sign up"
--      (un seul compte suffit : celui de la pharmacienne).
--   b) Le plan gratuit met le projet EN PAUSE après 7 jours sans activité : la page
--      de demande et le back-office cessent alors de fonctionner. Pour un service
--      en production : plan payant, ou un appel planifié qui garde le projet actif.
--   c) Conservation : supprimer régulièrement les demandes anciennes, par exemple :
--        delete from public.demandes where created_at < now() - interval '12 months';

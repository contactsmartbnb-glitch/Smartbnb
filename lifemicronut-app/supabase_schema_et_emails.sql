-- ============================================================
--  LifeMicroNut — Backend "rapport relu & validé"  (Supabase / Postgres)
--  À coller dans : Supabase -> SQL Editor -> Run
--  NOTE SÉCURITÉ : remplacer <TA_CLE_RESEND> par la vraie clé Resend
--  (elle reste côté serveur, dans la fonction — JAMAIS dans une page web).
-- ============================================================

-- 1) TABLE des demandes -------------------------------------------------
create table if not exists public.demandes (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  bilan         text not null,                 -- 'digestion' | 'fatigue' | ...
  email         text not null,                 -- e-mail du client
  reponses      jsonb,                          -- réponses brutes du questionnaire (window.A)
  rapport_auto  text,                           -- rapport généré automatiquement (HTML)
  rapport_final text,                           -- rapport corrigé par la pharmacienne (HTML)
  consentement  boolean not null default false,
  consent_at    timestamptz,
  paiement      text not null default 'a_verifier',
  statut        text not null default 'en_attente',  -- en_attente | valide | envoye
  note_interne  text,
  sent_at       timestamptz
);

-- 2) SÉCURITÉ (RLS) -----------------------------------------------------
alter table public.demandes enable row level security;

-- 2a) Insertion publique (depuis la page), UNIQUEMENT avec consentement + e-mail valide.
--     Clé "publishable/anon" côté page (sans danger). Aucune lecture publique.
drop policy if exists "anon_insert_demandes" on public.demandes;
create policy "anon_insert_demandes" on public.demandes
  for insert to anon
  with check (consentement = true and email is not null and position('@' in email) > 1);

-- 2b) Lecture + validation réservées au compte connecté (la pharmacienne).
drop policy if exists "auth_select_demandes" on public.demandes;
create policy "auth_select_demandes" on public.demandes
  for select to authenticated using (true);
drop policy if exists "auth_update_demandes" on public.demandes;
create policy "auth_update_demandes" on public.demandes
  for update to authenticated using (true) with check (true);

-- 3) E-MAILS automatiques (Resend via pg_net ; clé côté serveur) --------
create extension if not exists pg_net;

-- 3a) Nouvelle demande -> notification à la pharmacienne
create or replace function public.notify_demande()
returns trigger language plpgsql security definer set search_path=public as $$
declare k text := '<TA_CLE_RESEND>';
begin
  perform net.http_post(
    url     := 'https://api.resend.com/emails',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||k),
    body    := jsonb_build_object(
      'from','Bilan LifeMicroNut <bilan@lifemicronut.fr>',
      'to',  jsonb_build_array('lifemicronut@gmail.com'),
      'subject','Nouvelle demande de bilan a relire - '||new.bilan,
      'html','<p>Une nouvelle demande vient d''arriver.</p>'
           ||'<ul><li>Bilan : '||coalesce(new.bilan,'-')||'</li>'
           ||'<li>E-mail : '||coalesce(new.email,'-')||'</li>'
           ||'<li>Date : '||to_char(new.created_at,'DD/MM/YYYY HH24:MI')||'</li></ul>'
           ||'<p>Ouvre ton back-office pour la relire et la valider.</p>'
    ));
  return new;
end;$$;
drop trigger if exists trg_demande_notif on public.demandes;
create trigger trg_demande_notif after insert on public.demandes
  for each row execute function public.notify_demande();

-- 3b) Validation (statut -> 'valide') -> rapport final envoyé au client
create or replace function public.send_rapport()
returns trigger language plpgsql security definer set search_path=public as $$
declare k text := '<TA_CLE_RESEND>';
begin
  if new.statut = 'valide' and coalesce(old.statut,'') <> 'valide'
     and new.email is not null and position('@' in new.email) > 1 then
    perform net.http_post(
      url     := 'https://api.resend.com/emails',
      headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||k),
      body    := jsonb_build_object(
        'from','Bilan LifeMicroNut <bilan@lifemicronut.fr>',
        'to',  jsonb_build_array(new.email),
        'subject','Votre bilan LifeMicroNut, relu par une pharmacienne',
        'html','<div style="font-family:Arial,Helvetica,sans-serif;color:#1C2530;max-width:640px;margin:auto">'
             ||'<p>Bonjour,</p><p>Votre bilan a ete relu et valide par Dr AICHE, pharmacienne. Vous le trouverez ci-dessous.</p><hr>'
             ||coalesce(new.rapport_final, new.rapport_auto, '')
             ||'<hr><p style="color:#777;font-size:12px">Ce bilan est une orientation educative, relue par une pharmacienne. Il ne pose pas de diagnostic et ne remplace pas une consultation medicale.</p></div>'
      ));
    update public.demandes set statut='envoye', sent_at=now() where id=new.id;
  end if;
  return new;
end;$$;
drop trigger if exists trg_demande_send on public.demandes;
create trigger trg_demande_send after update on public.demandes
  for each row execute function public.send_rapport();

-- 4) COMPTE pharmacien (back-office) ------------------------------------
--    Créé via l'API Admin Supabase (service_role), e-mail + mot de passe.
--    Le back-office se connecte en Supabase Auth (password grant) ; les
--    policies 2b lui donnent lecture + validation. Aucune clé secrète
--    n'est jamais présente dans une page.

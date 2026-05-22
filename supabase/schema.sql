-- ============================================================
--  SmartBNB — Schéma automatisation réseaux sociaux
--  À exécuter dans Supabase > SQL Editor (une seule fois)
-- ============================================================

-- 1) File d'attente éditoriale
create table if not exists public.social_posts (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  content_type  text not null,            -- conseil | bien | marche | temoignage
  caption       text not null,
  hashtags      text,
  image_url     text,
  link_url      text,
  platforms     text[] not null default '{}',   -- instagram, facebook, linkedin, whatsapp, tiktok
  status        text not null default 'brouillon', -- brouillon | publie | erreur | a_publier
  result        jsonb,                    -- réponses des API par plateforme
  scheduled_for date not null default current_date
);

create index if not exists social_posts_date_idx on public.social_posts (scheduled_for desc);

-- 2) RLS : lecture publique (page reseaux.html), écriture réservée au service role
alter table public.social_posts enable row level security;

drop policy if exists "lecture social_posts" on public.social_posts;
create policy "lecture social_posts" on public.social_posts
  for select using (true);

-- 3) Planificateur : déclenche l'Edge Function chaque jour à 09h00
--    Nécessite les extensions pg_cron et pg_net (Database > Extensions).
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Remplacer <PROJECT_REF> et <ANON_KEY> avant exécution :
select cron.schedule(
  'smartbnb-social-autopilot',
  '0 9 * * *',
  $$
  select net.http_post(
    url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/social-autopilot',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer <ANON_KEY>"}'::jsonb,
    body    := '{}'::jsonb
  );
  $$
);

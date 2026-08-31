-- Patch: site settings (admin-editable) + per-user reading preferences.
-- Run once in the Supabase SQL Editor.

-- ── SITE SETTINGS ── singleton row, admin-editable from Admin > Settings.
create table if not exists site_settings (
  id integer primary key default 1 check (id = 1),
  site_name text not null default 'KOKORO Manhwa',
  tagline text not null default 'Монгол хэлээр хамгийн сайхан роман манхва',
  contact_email text not null default 'admin@kokoro.mn',
  updated_at timestamptz not null default now()
);

insert into site_settings (id) values (1) on conflict (id) do nothing;

alter table site_settings enable row level security;

create policy "Site settings are publicly readable"
  on site_settings for select
  using (true);

create policy "Only admins can update site settings"
  on site_settings for update
  using (exists (select 1 from profiles where id = auth.uid() and is_admin));

-- ── READING PREFERENCES ── per-user, set from Profile > Settings.
alter table profiles
  add column if not exists notif_new_chapters boolean not null default true,
  add column if not exists show_progress boolean not null default true,
  add column if not exists auto_bookmark boolean not null default false;

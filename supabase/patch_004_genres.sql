-- Patch: a genres table so genres can be added/removed from the Admin panel
-- instead of being hardcoded in the app. Seeded with the genres already in
-- use so nothing disappears from existing dropdowns.
-- Run once in the Supabase SQL Editor.

create table if not exists genres (
  id bigint generated always as identity primary key,
  name text unique not null,
  created_at timestamptz not null default now()
);

alter table genres enable row level security;

create policy "Genres are publicly readable"
  on genres for select
  using (true);

create policy "Admins can manage genres"
  on genres for all
  using (exists (select 1 from profiles where id = auth.uid() and is_admin))
  with check (exists (select 1 from profiles where id = auth.uid() and is_admin));

insert into genres (name) values
  ('Royal Romance'), ('Fantasy Romance'), ('Modern Romance'),
  ('Isekai Romance'), ('Historical Romance'), ('Dark Romance')
on conflict (name) do nothing;

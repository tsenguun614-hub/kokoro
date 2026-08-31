-- Kokoro Manhwa — initial schema
-- Run this once in the Supabase SQL Editor (Dashboard > SQL Editor > New query).
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE where possible.

-- ── PROFILES ──────────────────────────────────────────────
-- One row per auth.users row. Created automatically by the trigger below.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Profiles are viewable by their owner"
  on profiles for select
  using (auth.uid() = id);

create policy "Profiles are editable by their owner"
  on profiles for update
  using (auth.uid() = id);

-- Users can edit their own profile (e.g. username), but cannot grant themselves
-- admin — only an existing admin (or a direct SQL Editor session, which has no
-- auth.uid()) can flip is_admin. Without this, the update policy above would let
-- any authenticated user self-promote via the client.
create or replace function protect_is_admin()
returns trigger as $$
begin
  if new.is_admin is distinct from old.is_admin
     and auth.uid() is not null
     and not exists (select 1 from profiles where id = auth.uid() and is_admin) then
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists protect_is_admin_trigger on profiles;
create trigger protect_is_admin_trigger
  before update on profiles
  for each row execute procedure protect_is_admin();

-- Auto-create a profile row whenever a new user signs up.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ── SERIES ────────────────────────────────────────────────
create table if not exists series (
  id bigint generated always as identity primary key,
  slug text unique,
  title text not null,
  cover_url text,
  banner_url text,
  status text not null default 'Ongoing' check (status in ('Ongoing', 'Completed', 'Hiatus')),
  rating numeric(3,1) not null default 0 check (rating >= 0 and rating <= 10),
  description text,
  author text,
  artist text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table series enable row level security;

create policy "Series are publicly readable"
  on series for select
  using (true);

create policy "Admins can manage series"
  on series for all
  using (exists (select 1 from profiles where id = auth.uid() and is_admin))
  with check (exists (select 1 from profiles where id = auth.uid() and is_admin));

-- ── CHAPTERS ──────────────────────────────────────────────
create table if not exists chapters (
  id bigint generated always as identity primary key,
  series_id bigint not null references series(id) on delete cascade,
  chapter_number numeric not null,
  title text,
  created_at timestamptz not null default now(),
  unique (series_id, chapter_number)
);

alter table chapters enable row level security;

create policy "Chapters are publicly readable"
  on chapters for select
  using (true);

create policy "Admins can manage chapters"
  on chapters for all
  using (exists (select 1 from profiles where id = auth.uid() and is_admin))
  with check (exists (select 1 from profiles where id = auth.uid() and is_admin));

-- ── CHAPTER PAGES ─────────────────────────────────────────
-- One row per page image, so pages can be added/reordered individually.
create table if not exists chapter_pages (
  id bigint generated always as identity primary key,
  chapter_id bigint not null references chapters(id) on delete cascade,
  page_number int not null,
  image_url text not null,
  unique (chapter_id, page_number)
);

alter table chapter_pages enable row level security;

create policy "Chapter pages are publicly readable"
  on chapter_pages for select
  using (true);

create policy "Admins can manage chapter pages"
  on chapter_pages for all
  using (exists (select 1 from profiles where id = auth.uid() and is_admin))
  with check (exists (select 1 from profiles where id = auth.uid() and is_admin));

-- ── BOOKMARKS ─────────────────────────────────────────────
create table if not exists bookmarks (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  series_id bigint not null references series(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, series_id)
);

alter table bookmarks enable row level security;

create policy "Users can view their own bookmarks"
  on bookmarks for select
  using (auth.uid() = user_id);

create policy "Users can add their own bookmarks"
  on bookmarks for insert
  with check (auth.uid() = user_id);

create policy "Users can remove their own bookmarks"
  on bookmarks for delete
  using (auth.uid() = user_id);

-- ── READING HISTORY ───────────────────────────────────────
-- One row per (user, series): tracks the last chapter read, upserted on each read.
create table if not exists reading_history (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  series_id bigint not null references series(id) on delete cascade,
  chapter_id bigint not null references chapters(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  unique (user_id, series_id)
);

alter table reading_history enable row level security;

create policy "Users can view their own reading history"
  on reading_history for select
  using (auth.uid() = user_id);

create policy "Users can upsert their own reading history"
  on reading_history for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own reading history"
  on reading_history for update
  using (auth.uid() = user_id);

create policy "Users can clear their own reading history"
  on reading_history for delete
  using (auth.uid() = user_id);

-- ── INDEXES ───────────────────────────────────────────────
create index if not exists idx_chapters_series_id on chapters(series_id);
create index if not exists idx_chapter_pages_chapter_id on chapter_pages(chapter_id);
create index if not exists idx_bookmarks_user_id on bookmarks(user_id);
create index if not exists idx_reading_history_user_id on reading_history(user_id);

-- ── STORAGE ───────────────────────────────────────────────
-- Before running this section: Dashboard -> Storage -> New bucket -> name it
-- "manhwa-images" -> toggle "Public bucket" ON -> Create. Bucket creation
-- itself can't be done from SQL / the anon key, only from the dashboard.

create policy "Public can view manhwa images"
on storage.objects for select
using (bucket_id = 'manhwa-images');

create policy "Admins can upload manhwa images"
on storage.objects for insert
with check (
  bucket_id = 'manhwa-images'
  and exists (select 1 from profiles where id = auth.uid() and is_admin)
);

create policy "Admins can delete manhwa images"
on storage.objects for delete
using (
  bucket_id = 'manhwa-images'
  and exists (select 1 from profiles where id = auth.uid() and is_admin)
);

-- ── TRENDING ──────────────────────────────────────────────
create table if not exists series_views (
  id bigint generated always as identity primary key,
  series_id bigint not null references series(id) on delete cascade,
  viewed_at timestamptz not null default now()
);

alter table series_views enable row level security;

-- Anyone (including anonymous readers) can log a view. There is deliberately
-- no public SELECT policy — the raw log is only readable through the
-- security-definer function below, which returns aggregates, not raw rows.
create policy "Anyone can log a view"
  on series_views for insert
  with check (true);

create index if not exists idx_series_views_series_id_viewed_at on series_views(series_id, viewed_at);

-- Returns the top N series by view count within a period ('day' | 'week' | 'month').
-- Dropped first since CREATE OR REPLACE can't change a function's return columns.
drop function if exists get_trending_series(text, int);

create function get_trending_series(period text default 'week', result_limit int default 5)
returns table (
  id bigint, title text, cover_url text, genres text[], status text, rating numeric,
  chapter_count bigint, view_count bigint
)
language sql stable security definer set search_path = public
as $$
  select s.id, s.title, s.cover_url,
         (select coalesce(array_agg(g.name order by g.name), '{}')
            from series_genres sg join genres g on g.id = sg.genre_id
            where sg.series_id = s.id) as genres,
         s.status, s.rating,
         (select count(*) from chapters c where c.series_id = s.id) as chapter_count,
         count(v.id) as view_count
  from series s
  join series_views v on v.series_id = s.id
  where v.viewed_at > now() - (
    case period
      when 'day' then interval '1 day'
      when 'month' then interval '30 days'
      else interval '7 days'
    end
  )
  group by s.id
  order by view_count desc
  limit result_limit;
$$;

grant execute on function get_trending_series(text, int) to anon, authenticated;

-- ── GENRES ────────────────────────────────────────────────
-- Admin-managed list of genres (add/remove from the Admin panel), instead of
-- a hardcoded list in the app. series.genre stays a plain text column — no
-- foreign key — so this is a simple tag list, not a strict constraint.
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

-- ── SERIES GENRES ─────────────────────────────────────────
-- Many-to-many: a series can have multiple genres.
create table if not exists series_genres (
  series_id bigint not null references series(id) on delete cascade,
  genre_id bigint not null references genres(id) on delete cascade,
  primary key (series_id, genre_id)
);

alter table series_genres enable row level security;

create policy "Series genres are publicly readable"
  on series_genres for select
  using (true);

create policy "Admins can manage series genres"
  on series_genres for all
  using (exists (select 1 from profiles where id = auth.uid() and is_admin))
  with check (exists (select 1 from profiles where id = auth.uid() and is_admin));

create index if not exists idx_series_genres_series_id on series_genres(series_id);
create index if not exists idx_series_genres_genre_id on series_genres(genre_id);

-- ── SITE STATS ────────────────────────────────────────────
-- Total series/chapter counts and today's newly-added chapter count,
-- for the Home page's hero stats and "Нийт Сан" widget.
create or replace function get_site_stats()
returns table (series_count bigint, chapter_count bigint, today_count bigint)
language sql stable security definer set search_path = public
as $$
  select
    (select count(*) from series) as series_count,
    (select count(*) from chapters) as chapter_count,
    (select count(*) from chapters where created_at >= date_trunc('day', now())) as today_count;
$$;

grant execute on function get_site_stats() to anon, authenticated;

-- ── CHAPTER COMMENTS ──────────────────────────────────────
-- user_id references profiles (not auth.users directly) so PostgREST can
-- embed the commenter's username in one query without a separate lookup.
create table if not exists chapter_comments (
  id bigint generated always as identity primary key,
  chapter_id bigint not null references chapters(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  parent_id bigint references chapter_comments(id) on delete cascade
);

alter table chapter_comments enable row level security;

create policy "Comments are publicly readable"
  on chapter_comments for select
  using (true);

create policy "Signed-in users can post their own comments"
  on chapter_comments for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on chapter_comments for delete
  using (auth.uid() = user_id);

-- Separate permissive policy — combined with the one above via OR, so a
-- delete succeeds if the caller owns the comment OR is an admin.
create policy "Admins can delete any comment"
  on chapter_comments for delete
  using (exists (select 1 from profiles where id = auth.uid() and is_admin));

create index if not exists idx_chapter_comments_chapter_id on chapter_comments(chapter_id, created_at);
create index if not exists idx_chapter_comments_parent_id on chapter_comments(parent_id);

-- One-level replies use parent_id above; likes are a separate table so a
-- user can only like a given comment once (enforced by the composite key).
create table if not exists chapter_comment_likes (
  comment_id bigint not null references chapter_comments(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

alter table chapter_comment_likes enable row level security;

create policy "Likes are publicly readable"
  on chapter_comment_likes for select
  using (true);

create policy "Signed-in users can like as themselves"
  on chapter_comment_likes for insert
  with check (auth.uid() = user_id);

create policy "Users can remove their own like"
  on chapter_comment_likes for delete
  using (auth.uid() = user_id);

create index if not exists idx_chapter_comment_likes_comment_id on chapter_comment_likes(comment_id);

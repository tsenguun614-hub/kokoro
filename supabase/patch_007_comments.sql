-- Patch: real chapter comments, replacing the Reader page's mock data.
-- user_id references profiles (not auth.users directly) so PostgREST can
-- embed the commenter's username in one query without a separate lookup.
-- Run once in the Supabase SQL Editor.

create table if not exists chapter_comments (
  id bigint generated always as identity primary key,
  chapter_id bigint not null references chapters(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
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

create index if not exists idx_chapter_comments_chapter_id on chapter_comments(chapter_id, created_at);

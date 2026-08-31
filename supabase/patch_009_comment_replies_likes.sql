-- Patch: one-level comment replies + likes.
-- Run once in the Supabase SQL Editor.

alter table chapter_comments
  add column if not exists parent_id bigint references chapter_comments(id) on delete cascade;

create index if not exists idx_chapter_comments_parent_id on chapter_comments(parent_id);

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

-- Patch: lets admins delete any comment, not just their own. The existing
-- "Users can delete their own comments" policy stays — Postgres combines
-- multiple permissive policies for the same action with OR, so a delete
-- succeeds if either condition is true.
-- Run once in the Supabase SQL Editor.

create policy "Admins can delete any comment"
  on chapter_comments for delete
  using (exists (select 1 from profiles where id = auth.uid() and is_admin));

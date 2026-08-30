-- Patch: exposes total series/chapter counts and today's newly-added chapter
-- count for the Home page's "Нийт Сан" widget and hero stats.
-- Run once in the Supabase SQL Editor.

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

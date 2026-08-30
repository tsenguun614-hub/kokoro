-- Patch: view tracking + trending series (day/week/month).
-- Run once in the Supabase SQL Editor.

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
create or replace function get_trending_series(period text default 'week', result_limit int default 5)
returns table (
  id bigint, title text, cover_url text, genre text, status text, rating numeric,
  chapter_count bigint, view_count bigint
)
language sql stable security definer set search_path = public
as $$
  select s.id, s.title, s.cover_url, s.genre, s.status, s.rating,
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

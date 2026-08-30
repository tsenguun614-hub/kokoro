-- Patch: series can have multiple genres (many-to-many via series_genres),
-- replacing the single series.genre text column.
-- Run once in the Supabase SQL Editor.

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

-- Migrate each series' existing single genre into the new junction table.
insert into series_genres (series_id, genre_id)
select s.id, g.id
from series s
join genres g on g.name = s.genre
where s.genre is not null
on conflict do nothing;

-- The single-genre column is now redundant.
alter table series drop column if exists genre;

-- Trending function updated to return an array of genre names instead of one.
-- The return type is changing, so CREATE OR REPLACE isn't allowed — drop first.
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

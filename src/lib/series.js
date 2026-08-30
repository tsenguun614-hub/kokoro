import { supabase } from "./supabaseClient";

const GENRES_SELECT = "series_genres(genres(id,name))";

// Flattens the nested chapters(count)/series_genres(genres(...)) join shape
// PostgREST returns into { ...series, genres: [{id,name}], chapterCount }.
function shapeSeries(s) {
  const { series_genres, chapters, ...rest } = s;
  const genres = (series_genres || []).map((sg) => sg.genres).filter(Boolean);
  const shaped = { ...rest, genres };
  if (chapters !== undefined) shaped.chapterCount = chapters?.[0]?.count ?? 0;
  return shaped;
}

export async function getFeaturedSeries(limit = 6) {
  const { data, error } = await supabase
    .from("series")
    .select(`*, chapters(count), ${GENRES_SELECT}`)
    .order("rating", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data.map(shapeSeries);
}

// period: "day" | "week" | "month"
export async function getTrendingSeries(period = "week", limit = 5) {
  const { data, error } = await supabase.rpc("get_trending_series", { period, result_limit: limit });
  if (error) throw error;
  return data.map((s) => ({ ...s, chapterCount: s.chapter_count }));
}

// Logs one view for a series. Deduped per browser tab so refreshing/re-reading
// doesn't inflate a single visitor's count.
export function logSeriesView(seriesId) {
  const key = `viewed_series_${seriesId}`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, "1");
  supabase.from("series_views").insert({ series_id: seriesId }).then(() => {});
}

export async function getSiteStats() {
  const { data, error } = await supabase.rpc("get_site_stats").single();
  if (error) throw error;
  return {
    seriesCount: data.series_count,
    chapterCount: data.chapter_count,
    todayCount: data.today_count,
  };
}

export async function getRecentChapters(limit = 5) {
  const { data, error } = await supabase
    .from("chapters")
    .select("id, chapter_number, title, created_at, series:series_id (id, title, cover_url)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

// filters: { status, search, sortBy: "rating" | "newest" | "chapters" }
// Genre filtering happens client-side (a series can have multiple genres).
export async function getAllSeries(filters = {}) {
  let query = supabase.from("series").select(`*, chapters(count), ${GENRES_SELECT}`);

  if (filters.status && filters.status !== "All") {
    query = query.eq("status", filters.status);
  }
  if (filters.search) {
    query = query.ilike("title", `%${filters.search}%`);
  }

  if (filters.sortBy === "rating") {
    query = query.order("rating", { ascending: false });
  } else if (filters.sortBy === "newest") {
    query = query.order("created_at", { ascending: false });
  } else {
    query = query.order("updated_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;
  return data.map(shapeSeries);
}

export async function getSeriesById(id) {
  const { data, error } = await supabase.from("series").select(`*, ${GENRES_SELECT}`).eq("id", id).single();
  if (error) throw error;
  return shapeSeries(data);
}

export async function getSeriesBySlug(slug) {
  const { data, error } = await supabase.from("series").select(`*, ${GENRES_SELECT}`).eq("slug", slug).single();
  if (error) throw error;
  return shapeSeries(data);
}

export async function getChaptersForSeries(seriesId) {
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("series_id", seriesId)
    .order("chapter_number", { ascending: false });
  if (error) throw error;
  return data;
}

// Series sharing at least one of the given genre ids, excluding the current series.
export async function getRelatedSeries(genreIds, excludeId, limit = 3) {
  if (!genreIds || genreIds.length === 0) return [];
  const { data: links, error: linkErr } = await supabase
    .from("series_genres")
    .select("series_id")
    .in("genre_id", genreIds)
    .neq("series_id", excludeId);
  if (linkErr) throw linkErr;

  const ids = [...new Set(links.map((l) => l.series_id))].slice(0, limit);
  if (ids.length === 0) return [];

  const { data, error } = await supabase.from("series").select(`*, ${GENRES_SELECT}`).in("id", ids);
  if (error) throw error;
  return data.map(shapeSeries);
}

// ── ADMIN WRITES ── (require the caller to be authenticated with profiles.is_admin — enforced by RLS)

export async function createSeries(fields) {
  const { data, error } = await supabase.from("series").insert(fields).select().single();
  if (error) throw error;
  return data;
}

export async function updateSeriesRecord(id, fields) {
  const { data, error } = await supabase.from("series").update(fields).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// Replaces a series' genre associations with exactly the given genre ids.
export async function setSeriesGenres(seriesId, genreIds) {
  const { error: delErr } = await supabase.from("series_genres").delete().eq("series_id", seriesId);
  if (delErr) throw delErr;
  if (!genreIds || genreIds.length === 0) return;
  const rows = genreIds.map((genre_id) => ({ series_id: seriesId, genre_id }));
  const { error: insErr } = await supabase.from("series_genres").insert(rows);
  if (insErr) throw insErr;
}

export async function deleteSeries(id) {
  const { error } = await supabase.from("series").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteChapter(id) {
  const { error } = await supabase.from("chapters").delete().eq("id", id);
  if (error) throw error;
}

export async function createChapterWithPages({ seriesId, chapterNumber, title, imageUrls }) {
  const { data: chapter, error: chapterError } = await supabase
    .from("chapters")
    .insert({ series_id: seriesId, chapter_number: chapterNumber, title })
    .select()
    .single();
  if (chapterError) throw chapterError;

  const pageRows = imageUrls.map((image_url, i) => ({ chapter_id: chapter.id, page_number: i + 1, image_url }));
  const { error: pagesError } = await supabase.from("chapter_pages").insert(pageRows);
  if (pagesError) throw pagesError;

  return chapter;
}

export async function getChapterWithPages(seriesId, chapterNumber) {
  const { data: chapter, error: chapterError } = await supabase
    .from("chapters")
    .select("*")
    .eq("series_id", seriesId)
    .eq("chapter_number", chapterNumber)
    .single();
  if (chapterError) throw chapterError;

  const { data: pages, error: pagesError } = await supabase
    .from("chapter_pages")
    .select("*")
    .eq("chapter_id", chapter.id)
    .order("page_number", { ascending: true });
  if (pagesError) throw pagesError;

  return { ...chapter, pages };
}

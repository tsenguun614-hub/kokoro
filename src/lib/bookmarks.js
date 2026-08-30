import { supabase } from "./supabaseClient";

export async function getBookmarks(userId) {
  const { data, error } = await supabase
    .from("bookmarks")
    .select("id, created_at, series:series_id (*, chapters(count))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((b) => ({ ...b.series, chapterCount: b.series.chapters?.[0]?.count ?? 0, bookmarkId: b.id }));
}

export async function getBookmarkCount(seriesId) {
  const { count, error } = await supabase
    .from("bookmarks")
    .select("id", { count: "exact", head: true })
    .eq("series_id", seriesId);
  if (error) throw error;
  return count ?? 0;
}

export async function isBookmarked(userId, seriesId) {
  const { data, error } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", userId)
    .eq("series_id", seriesId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function addBookmark(userId, seriesId) {
  const { error } = await supabase.from("bookmarks").insert({ user_id: userId, series_id: seriesId });
  if (error) throw error;
}

export async function removeBookmark(userId, seriesId) {
  const { error } = await supabase.from("bookmarks").delete().eq("user_id", userId).eq("series_id", seriesId);
  if (error) throw error;
}

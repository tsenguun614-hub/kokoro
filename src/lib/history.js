import { supabase } from "./supabaseClient";

export async function getReadingHistory(userId) {
  const { data, error } = await supabase
    .from("reading_history")
    .select("id, last_read_at, series:series_id (id, title, cover_url), chapter:chapter_id (id, chapter_number, title)")
    .eq("user_id", userId)
    .order("last_read_at", { ascending: false });
  if (error) throw error;
  return data;
}

// One row per (user, series) — upserted every time a chapter is read.
export async function recordChapterRead(userId, seriesId, chapterId) {
  const { error } = await supabase
    .from("reading_history")
    .upsert(
      { user_id: userId, series_id: seriesId, chapter_id: chapterId, last_read_at: new Date().toISOString() },
      { onConflict: "user_id,series_id" }
    );
  if (error) throw error;
}

export async function clearReadingHistory(userId) {
  const { error } = await supabase.from("reading_history").delete().eq("user_id", userId);
  if (error) throw error;
}

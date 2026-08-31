import { supabase } from "./supabaseClient";

export async function getComments(chapterId) {
  const { data, error } = await supabase
    .from("chapter_comments")
    .select("id, body, created_at, user_id, profiles(username)")
    .eq("chapter_id", chapterId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((c) => ({
    id: c.id,
    body: c.body,
    created_at: c.created_at,
    userId: c.user_id,
    username: c.profiles?.username || "Хэрэглэгч",
  }));
}

export async function addComment(chapterId, userId, body) {
  const { data, error } = await supabase
    .from("chapter_comments")
    .insert({ chapter_id: chapterId, user_id: userId, body })
    .select("id, body, created_at, user_id, profiles(username)")
    .single();
  if (error) throw error;
  return {
    id: data.id,
    body: data.body,
    created_at: data.created_at,
    userId: data.user_id,
    username: data.profiles?.username || "Хэрэглэгч",
  };
}

export async function deleteComment(id) {
  const { error } = await supabase.from("chapter_comments").delete().eq("id", id);
  if (error) throw error;
}

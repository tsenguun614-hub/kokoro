import { supabase } from "./supabaseClient";

export async function getGenres() {
  const { data, error } = await supabase.from("genres").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function createGenre(name) {
  const { data, error } = await supabase.from("genres").insert({ name }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteGenre(id) {
  const { error } = await supabase.from("genres").delete().eq("id", id);
  if (error) throw error;
}

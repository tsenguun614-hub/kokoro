import { supabase } from "./supabaseClient";

export async function getSiteSettings() {
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  if (error) throw error;
  return data;
}

export async function updateSiteSettings(fields) {
  const { data, error } = await supabase
    .from("site_settings")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", 1)
    .select()
    .single();
  if (error) throw error;
  return data;
}

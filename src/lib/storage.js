import { supabase } from "./supabaseClient";

// Public base URL of the Cloudflare R2 bucket (r2.dev dev URL, or a custom
// domain later). Not a secret — just where uploaded images are served from.
const PUBLIC_URL = "https://pub-41156f88af5e49629bf08ebff92b995a.r2.dev";

// All actual R2 credentials stay server-side in the "r2-storage" Supabase
// Edge Function, which only signs uploads/deletes for authenticated admins.
async function callGateway(body) {
  const { data, error } = await supabase.functions.invoke("r2-storage", { body });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

export async function uploadFile(file, path) {
  const { uploadUrl, publicUrl } = await callGateway({ action: "upload", path });
  const res = await fetch(uploadUrl, { method: "PUT", body: file });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
  return publicUrl;
}

export async function uploadCoverImage(file) {
  const path = `covers/${Date.now()}-${sanitizeFilename(file.name)}`;
  return uploadFile(file, path);
}

// Uploads page images in order and returns their public URLs in the same order.
export async function uploadChapterPages(files, seriesId, chapterNumber, onProgress) {
  const urls = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const path = `chapters/${seriesId}/${chapterNumber}/${String(i + 1).padStart(3, "0")}-${sanitizeFilename(file.name)}`;
    const url = await uploadFile(file, path);
    urls.push(url);
    if (onProgress) onProgress(i + 1, files.length);
  }
  return urls;
}

// ── CLEANUP ── (used when deleting/replacing content so files don't orphan in the bucket)

export function isOwnStorageUrl(url) {
  return typeof url === "string" && url.startsWith(`${PUBLIC_URL}/`);
}

function pathFromPublicUrl(url) {
  return url.startsWith(`${PUBLIC_URL}/`) ? url.slice(PUBLIC_URL.length + 1) : null;
}

export async function deleteCoverIfOwned(coverUrl) {
  if (!isOwnStorageUrl(coverUrl)) return;
  const path = pathFromPublicUrl(coverUrl);
  if (!path) return;
  await callGateway({ action: "delete", path });
}

// Deletes every file under a folder prefix, e.g. "chapters/12" or "chapters/12/3".
export async function deleteFolder(prefix) {
  await callGateway({ action: "delete-prefix", prefix });
}

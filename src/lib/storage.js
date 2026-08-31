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

// Manga pages are routinely uploaded as raw, multi-megabyte scans. Nobody's
// screen needs more than ~1400px of width to read them, and JPEG at 85%
// quality is visually lossless for line art/flat color at that size while
// cutting file size by 90%+ — the difference between a chapter that opens
// instantly and one that takes several seconds per page on mobile data.
async function compressImage(file, maxWidth = 1400, quality = 0.85) {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxWidth / bitmap.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
  } catch {
    return file; // if compression fails for any reason, upload the original rather than blocking
  }
}

export async function uploadFile(file, path) {
  const { uploadUrl, publicUrl } = await callGateway({ action: "upload", path });
  const res = await fetch(uploadUrl, { method: "PUT", body: file });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
  return publicUrl;
}

export async function uploadCoverImage(file) {
  const compressed = await compressImage(file, 800, 0.85);
  const path = `covers/${Date.now()}-${sanitizeFilename(compressed.name)}`;
  return uploadFile(compressed, path);
}

// Uploads page images in order and returns their public URLs in the same order.
export async function uploadChapterPages(files, seriesId, chapterNumber, onProgress) {
  const urls = [];
  for (let i = 0; i < files.length; i++) {
    const compressed = await compressImage(files[i]);
    const path = `chapters/${seriesId}/${chapterNumber}/${String(i + 1).padStart(3, "0")}-${sanitizeFilename(compressed.name)}`;
    const url = await uploadFile(compressed, path);
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

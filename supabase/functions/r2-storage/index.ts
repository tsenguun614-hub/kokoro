// Admin-only gateway to Cloudflare R2. The browser never sees R2 credentials —
// it asks this function to mint a short-lived presigned URL (or perform a
// delete), and this function only does so after confirming the caller's
// Supabase session belongs to an admin (profiles.is_admin).
import { createClient } from "npm:@supabase/supabase-js@2";
import { AwsClient } from "https://esm.sh/aws4fetch@1.0.20";

const R2_ENDPOINT = Deno.env.get("R2_ENDPOINT")!;
const R2_BUCKET = Deno.env.get("R2_BUCKET")!;
const R2_ACCESS_KEY_ID = Deno.env.get("R2_ACCESS_KEY_ID")!;
const R2_SECRET_ACCESS_KEY = Deno.env.get("R2_SECRET_ACCESS_KEY")!;
const R2_PUBLIC_URL = Deno.env.get("R2_PUBLIC_URL")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function cleanPath(p: string) {
  return String(p || "").replace(/^\/+/, "");
}

async function listAllKeys(client: AwsClient, prefix: string) {
  const keys: string[] = [];
  let continuationToken: string | undefined;
  do {
    const listUrl = new URL(`${R2_ENDPOINT}/${R2_BUCKET}`);
    listUrl.searchParams.set("list-type", "2");
    listUrl.searchParams.set("prefix", prefix);
    if (continuationToken) listUrl.searchParams.set("continuation-token", continuationToken);
    const resp = await client.fetch(listUrl.toString());
    const xml = await resp.text();
    for (const m of xml.matchAll(/<Key>(.*?)<\/Key>/g)) keys.push(m[1]);
    const tokenMatch = xml.match(/<NextContinuationToken>(.*?)<\/NextContinuationToken>/);
    continuationToken = tokenMatch ? tokenMatch[1] : undefined;
  } while (continuationToken);
  return keys;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) return json({ error: "Not authenticated" }, 401);

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    if (!profile?.is_admin) return json({ error: "Admin only" }, 403);

    const body = await req.json();
    const client = new AwsClient({
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
      region: "auto",
      service: "s3",
    });

    if (body.action === "upload") {
      const path = cleanPath(body.path);
      if (!path) return json({ error: "path required" }, 400);
      const objectUrl = `${R2_ENDPOINT}/${R2_BUCKET}/${path}`;
      const signed = await client.sign(new Request(objectUrl, { method: "PUT" }), {
        aws: { signQuery: true },
      });
      return json({ uploadUrl: signed.url, publicUrl: `${R2_PUBLIC_URL}/${path}` });
    }

    if (body.action === "delete") {
      const path = cleanPath(body.path);
      if (!path) return json({ error: "path required" }, 400);
      const resp = await client.fetch(`${R2_ENDPOINT}/${R2_BUCKET}/${path}`, { method: "DELETE" });
      return json({ ok: resp.ok });
    }

    if (body.action === "delete-prefix") {
      const prefix = cleanPath(body.prefix);
      if (!prefix) return json({ error: "prefix required" }, 400);
      const keys = await listAllKeys(client, prefix);
      for (const key of keys) {
        await client.fetch(`${R2_ENDPOINT}/${R2_BUCKET}/${key}`, { method: "DELETE" });
      }
      return json({ deleted: keys.length });
    }

    return json({ error: "unknown action" }, 400);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

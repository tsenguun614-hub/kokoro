# Supabase setup for Kokoro

## 1. Get your project credentials

In your Supabase dashboard: **Project Settings → API**. You'll need:
- **Project URL** (e.g. `https://xxxxxxxx.supabase.co`)
- **anon public** key

## 2. Configure the app

```bash
cp .env.example .env
```

Edit `.env` and fill in the two values from step 1:

```
REACT_APP_SUPABASE_URL=https://xxxxxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

Restart `npm start` after editing `.env` — Create React App only reads it at startup.

## 3. Create the database schema

In the Supabase dashboard: **SQL Editor → New query**. Paste the contents of
[`supabase/schema.sql`](supabase/schema.sql) and run it. This creates:

- `series`, `chapters`, `chapter_pages` — publicly readable, writable only by admins
- `profiles` — one row per user, auto-created on signup, with an `is_admin` flag
- `bookmarks`, `reading_history` — readable/writable only by their own user

Row Level Security is enabled on every table, so the anon key is safe to ship in
the client bundle — it can't do anything the policies don't allow.

## 4. Add some content

Two ways: insert rows directly in the SQL Editor, or use the Admin panel (recommended).

### Using the Admin panel

1. **Sign up** at `/auth` (Бүртгүүлэх tab) with your real email/password.
2. **Find your user ID** — SQL Editor, new query:
   ```sql
   select id, email from auth.users where email = 'you@example.com';
   ```
3. **Grant yourself admin** — new query, with your UUID from step 2:
   ```sql
   update profiles set is_admin = true where id = 'paste-your-uuid-here';
   ```
4. **Open `/admin`**. If it says access denied, refresh once — the admin flag is fetched on load.
5. **Publish a series** — Series → + Add New (or Upload directly). Title and Genre are required; Cover Image URL falls back to a placeholder if left blank.
6. **Publish a chapter** — Upload → New Chapter tab. Pick the series, set the chapter number, paste one page image URL per line in reading order.
7. Check `/browse` or the homepage — the series should appear immediately.

**Where to get image URLs**: the form takes direct image links, not file uploads.
Easiest is Supabase Storage — dashboard → **Storage → New bucket** (make it
public) → upload images → click a file → **Get URL**. Any other host that
gives a direct image link (Cloudinary, Imgur, etc.) works too.

### Using the SQL Editor directly

Insert rows into `series`, then `chapters` (referencing the series `id`), then
`chapter_pages` (referencing the chapter `id`, with a `page_number` per row).

## What's wired up

- **Series/Browse/Home** read live from `series` and `chapters`.
- **Auth** uses real Supabase email/password sign-up and sign-in.
- **Bookmarks** (Series page, Profile) read/write the `bookmarks` table for the signed-in user.
- **Reading history** is recorded automatically when a signed-in user opens a chapter in the Reader, and shown on the Profile page.
- **Admin** publishing requires `profiles.is_admin = true`, enforced both in the UI and by RLS.

## Not wired up (out of scope for this pass)

- Comments on the Reader page are still static/decorative — no `comments` table exists.
- No analytics (view counts, reader counts) — nothing in the schema tracks this.
- No image upload — chapter pages are added by URL; wire up Supabase Storage if you want in-browser uploads.

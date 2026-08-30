-- Patch: storage policies for chapter/cover image uploads.
-- Before running this: Dashboard -> Storage -> New bucket -> name it
-- "manhwa-images" -> toggle "Public bucket" ON -> Create.
-- Then run this in the SQL Editor.

create policy "Public can view manhwa images"
on storage.objects for select
using (bucket_id = 'manhwa-images');

create policy "Admins can upload manhwa images"
on storage.objects for insert
with check (
  bucket_id = 'manhwa-images'
  and exists (select 1 from profiles where id = auth.uid() and is_admin)
);

create policy "Admins can delete manhwa images"
on storage.objects for delete
using (
  bucket_id = 'manhwa-images'
  and exists (select 1 from profiles where id = auth.uid() and is_admin)
);

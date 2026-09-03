-- Gearの元画像は、所有者だけがアクセスできる非公開バケットに保存する
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'gear-images',
  'gear-images',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- オブジェクト名は <user-id>/<random-file-name> とし、本人の階層だけを許可する
create policy "Users can read their own gear images"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'gear-images'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and owner_id = (select auth.uid()::text)
  );

create policy "Users can upload their own gear images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'gear-images'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and owner_id = (select auth.uid()::text)
  );

create policy "Users can delete their own gear images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'gear-images'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and owner_id = (select auth.uid()::text)
  );

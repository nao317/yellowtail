-- Supabase Storage RLS setup for bucket: posts
-- Usage: paste into Supabase SQL Editor and run.

-- 1) Ensure bucket exists and is public (public URL preview).
insert into storage.buckets (id, name, public)
values ('posts', 'posts', true)
on conflict (id) do update set public = excluded.public;

-- 2) Clean up existing policies with same names.
drop policy if exists "posts_read_authenticated" on storage.objects;
drop policy if exists "posts_insert_admin_only" on storage.objects;
drop policy if exists "posts_update_admin_only" on storage.objects;
drop policy if exists "posts_delete_admin_only" on storage.objects;

-- 3) Recreate policies.
create policy "posts_read_authenticated"
on storage.objects for select
to authenticated
using (bucket_id = 'posts');

create policy "posts_insert_admin_only"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'posts'
  and (auth.jwt() ->> 'email') = 'country.gentleman.0317@gmail.com'
);

create policy "posts_update_admin_only"
on storage.objects for update
to authenticated
using (
  bucket_id = 'posts'
  and (auth.jwt() ->> 'email') = 'country.gentleman.0317@gmail.com'
)
with check (
  bucket_id = 'posts'
  and (auth.jwt() ->> 'email') = 'country.gentleman.0317@gmail.com'
);

create policy "posts_delete_admin_only"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'posts'
  and (auth.jwt() ->> 'email') = 'country.gentleman.0317@gmail.com'
);

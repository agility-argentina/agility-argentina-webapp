-- Bucket privado para los archivos de libreta sanitaria.
-- Convención de path: <club_id>/<dupla_id>/<archivo>, así las políticas
-- pueden validar el club dueño mirando el primer segmento de la ruta.

insert into storage.buckets (id, name, public)
values ('libretas', 'libretas', false)
on conflict (id) do nothing;

create policy "club ve sus libretas, admin ve todas (storage)"
on storage.objects for select
using (
  bucket_id = 'libretas'
  and (
    rol_actual() = 'admin'
    or (storage.foldername(name))[1] = club_actual()::text
  )
);

create policy "club sube sus libretas, admin tambien (storage)"
on storage.objects for insert
with check (
  bucket_id = 'libretas'
  and (
    rol_actual() = 'admin'
    or (storage.foldername(name))[1] = club_actual()::text
  )
);

create policy "club actualiza sus libretas, admin tambien (storage)"
on storage.objects for update
using (
  bucket_id = 'libretas'
  and (
    rol_actual() = 'admin'
    or (storage.foldername(name))[1] = club_actual()::text
  )
)
with check (
  bucket_id = 'libretas'
  and (
    rol_actual() = 'admin'
    or (storage.foldername(name))[1] = club_actual()::text
  )
);

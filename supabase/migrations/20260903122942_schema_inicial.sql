-- Esquema inicial: regiones, clubes, cuentas, duplas y libretas sanitarias.
-- Traducción directa del modelo de datos validado en el mockup (first-mock.html).

create extension if not exists pgcrypto;

-- ══════════════════ ENUMS ══════════════════

create type rol_cuenta as enum ('grupo', 'admin');
create type grado_agility as enum ('G0', 'G1', 'G2', 'G3');
create type tamano_perro as enum ('XSmall', 'Small', 'Midi', 'Intermediate', 'Large');
create type estado_dupla as enum ('activa', 'inactiva');
create type estado_libreta as enum ('aprobado', 'pendiente', 'porvencer', 'vencida', 'sinvalidar');

-- ══════════════════ TABLAS ══════════════════

create table regiones (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique
);

create table clubes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  ciudad text not null,
  region_id uuid not null references regiones(id),
  homologado boolean not null default true,
  created_at timestamptz not null default now()
);

-- Perfil sobre auth.users: 1 cuenta por club (rol 'grupo') + 1 cuenta admin.
-- El alta de cuentas la hace el equipo técnico (service role), no hay alta
-- pública por eso no hay políticas de insert/update más abajo.
create table cuentas (
  user_id uuid primary key references auth.users(id) on delete cascade,
  rol rol_cuenta not null,
  club_id uuid references clubes(id),
  created_at timestamptz not null default now(),
  constraint club_solo_si_rol_grupo check (
    (rol = 'grupo' and club_id is not null) or (rol = 'admin' and club_id is null)
  )
);

create table duplas (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubes(id) on delete cascade,
  nreg text, -- null para categoría G0 (no tienen número de registro)
  guia_nombre text not null,
  guia_dni text,
  guia_email text,
  perro_nombre text not null,
  grado grado_agility not null,
  tamano tamano_perro not null,
  categoria_nota text, -- ej. "Baja a Intermediate por edad/peso"
  estado estado_dupla not null default 'activa',
  created_at timestamptz not null default now()
);
create unique index duplas_nreg_unique on duplas (nreg) where nreg is not null;

-- Libreta sanitaria vigente de cada dupla (1 fila activa por dupla, se
-- sobreescribe en cada renovación — historial no está en el alcance de v1).
create table libretas_sanitarias (
  id uuid primary key default gen_random_uuid(),
  dupla_id uuid not null unique references duplas(id) on delete cascade,
  estado estado_libreta not null default 'pendiente',
  archivo_path text,
  fecha_aplicacion date,
  fecha_vencimiento date,
  enviada_en timestamptz not null default now(),
  revisada_en timestamptz,
  revisada_por uuid references auth.users(id),
  motivo_rechazo text
);

-- ══════════════════ HELPERS PARA RLS ══════════════════
-- security definer para poder leer la propia fila de `cuentas` sin recursión
-- de políticas; solo devuelven datos del usuario autenticado (auth.uid()).

create or replace function rol_actual()
returns rol_cuenta
language sql stable security definer set search_path = public
as $$
  select rol from cuentas where user_id = auth.uid()
$$;

create or replace function club_actual()
returns uuid
language sql stable security definer set search_path = public
as $$
  select club_id from cuentas where user_id = auth.uid()
$$;

-- ══════════════════ ROW LEVEL SECURITY ══════════════════

alter table regiones enable row level security;
create policy "regiones son publicas" on regiones for select using (true);

alter table clubes enable row level security;
create policy "clubes son publicos" on clubes for select using (true);
create policy "admin administra clubes" on clubes for all
  using (rol_actual() = 'admin') with check (rol_actual() = 'admin');

alter table cuentas enable row level security;
create policy "cada uno ve su propia cuenta" on cuentas for select using (user_id = auth.uid());
create policy "admin ve todas las cuentas" on cuentas for select using (rol_actual() = 'admin');

alter table duplas enable row level security;
create policy "club ve sus duplas, admin ve todas" on duplas for select
  using (rol_actual() = 'admin' or club_id = club_actual());
create policy "club y admin dan de alta duplas" on duplas for insert
  with check (rol_actual() = 'admin' or club_id = club_actual());
create policy "club y admin editan duplas" on duplas for update
  using (rol_actual() = 'admin' or club_id = club_actual())
  with check (rol_actual() = 'admin' or club_id = club_actual());

alter table libretas_sanitarias enable row level security;
create policy "club ve sus libretas, admin ve todas" on libretas_sanitarias for select
  using (
    rol_actual() = 'admin'
    or dupla_id in (select id from duplas where club_id = club_actual())
  );
create policy "club sube su libreta, admin tambien" on libretas_sanitarias for insert
  with check (
    rol_actual() = 'admin'
    or dupla_id in (select id from duplas where club_id = club_actual())
  );
create policy "club actualiza, admin aprueba o rechaza" on libretas_sanitarias for update
  using (
    rol_actual() = 'admin'
    or dupla_id in (select id from duplas where club_id = club_actual())
  )
  with check (
    rol_actual() = 'admin'
    or dupla_id in (select id from duplas where club_id = club_actual())
  );

-- Pedido de número de registro: para pasar de G0 a G1 el club pide el número
-- y la comisión (admin) lo asigna. Los perros que ya tenían número antes de
-- la app los carga el club una única vez, al darlos de alta.
--
-- El número es del perro; como un perro corre con un solo guía, `duplas.nreg`
-- sigue siendo el lugar correcto.

-- ══════════════════ REGLAS SOBRE DUPLAS ══════════════════

-- Desde G1 el número es obligatorio. `not valid` para no frenar la migración
-- si hay filas viejas incompletas; igual se exige en todo insert/update.
alter table duplas
  add constraint nreg_obligatorio_desde_g1 check (grado = 'G0' or nreg is not null) not valid;

-- Un club puede editar sus duplas, pero no tocar el número ni cruzar entre G0
-- y G1+: eso pasa solo cuando la comisión asigna el número.
create or replace function proteger_nreg()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- Sin usuario = service role o conexión directa (scripts, SQL editor).
  if auth.uid() is null or rol_actual() = 'admin' then
    return new;
  end if;

  if new.nreg is distinct from old.nreg then
    raise exception 'El número de registro solo lo puede cambiar la comisión.';
  end if;

  if (old.grado = 'G0') <> (new.grado = 'G0') then
    raise exception 'El pase de G0 a G1 lo hace la comisión al asignar el número de registro.';
  end if;

  return new;
end
$$;

create trigger proteger_nreg
  before update on duplas
  for each row execute function proteger_nreg();

-- ══════════════════ PEDIDOS ══════════════════

create type estado_pedido_nreg as enum ('pendiente', 'asignado', 'rechazado');

create table pedidos_nreg (
  id uuid primary key default gen_random_uuid(),
  dupla_id uuid not null references duplas(id) on delete cascade,
  estado estado_pedido_nreg not null default 'pendiente',
  pedido_en timestamptz not null default now(),
  pedido_por uuid references auth.users(id),
  resuelto_en timestamptz,
  resuelto_por uuid references auth.users(id),
  nreg_asignado text,
  motivo_rechazo text
);

-- Un solo pedido en trámite por dupla; los resueltos quedan como historial.
create unique index pedidos_nreg_uno_pendiente on pedidos_nreg (dupla_id) where estado = 'pendiente';

alter table pedidos_nreg enable row level security;
create policy "club ve sus pedidos, admin ve todos" on pedidos_nreg for select
  using (
    rol_actual() = 'admin'
    or dupla_id in (select id from duplas where club_id = club_actual())
  );
-- Sin políticas de insert/update: todo pasa por las funciones de abajo, que
-- validan los requisitos y hacen los cambios de forma atómica.

-- El club pide el número. Requisitos: G0 sin número, dupla activa, microchip
-- cargado y libreta aprobada y vigente.
create or replace function pedir_nreg(p_dupla_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_dupla duplas;
  v_libreta estado_libreta;
begin
  select * into v_dupla from duplas where id = p_dupla_id;
  if not found or v_dupla.club_id is distinct from club_actual() then
    raise exception 'No autorizado.';
  end if;

  if v_dupla.nreg is not null then
    raise exception '% ya tiene número de registro.', v_dupla.perro_nombre;
  end if;
  if v_dupla.estado <> 'activa' then
    raise exception 'La dupla tiene que estar activa para pedir el número.';
  end if;
  if coalesce(trim(v_dupla.microchip), '') = '' then
    raise exception 'Cargá el microchip de % antes de pedir el número.', v_dupla.perro_nombre;
  end if;

  select estado_vigente(l) into v_libreta from libretas_sanitarias l where l.dupla_id = p_dupla_id;
  if v_libreta is null or v_libreta not in ('aprobado', 'porvencer') then
    raise exception 'La libreta sanitaria de % tiene que estar aprobada y vigente.', v_dupla.perro_nombre;
  end if;

  insert into pedidos_nreg (dupla_id, pedido_por) values (p_dupla_id, auth.uid());
exception
  when unique_violation then
    raise exception 'Ya hay un pedido de número en trámite para %.', v_dupla.perro_nombre;
end
$$;

-- La comisión asigna el número: la dupla lo recibe y pasa a G1.
create or replace function asignar_nreg(p_pedido_id uuid, p_nreg text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pedido pedidos_nreg;
  v_nreg text := nullif(trim(p_nreg), '');
begin
  if rol_actual() is distinct from 'admin' then
    raise exception 'No autorizado.';
  end if;
  if v_nreg is null then
    raise exception 'Escribí el número a asignar.';
  end if;

  select * into v_pedido from pedidos_nreg where id = p_pedido_id for update;
  if not found or v_pedido.estado <> 'pendiente' then
    raise exception 'Este pedido ya fue resuelto.';
  end if;

  update duplas set nreg = v_nreg, grado = 'G1' where id = v_pedido.dupla_id;
  update pedidos_nreg
    set estado = 'asignado', nreg_asignado = v_nreg, resuelto_en = now(), resuelto_por = auth.uid()
    where id = p_pedido_id;
exception
  when unique_violation then
    raise exception 'El número % ya lo tiene otro perro.', v_nreg;
end
$$;

create or replace function rechazar_pedido_nreg(p_pedido_id uuid, p_motivo text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if rol_actual() is distinct from 'admin' then
    raise exception 'No autorizado.';
  end if;
  if nullif(trim(p_motivo), '') is null then
    raise exception 'Escribí el motivo del rechazo.';
  end if;

  update pedidos_nreg
    set estado = 'rechazado', motivo_rechazo = trim(p_motivo), resuelto_en = now(), resuelto_por = auth.uid()
    where id = p_pedido_id and estado = 'pendiente';
  if not found then
    raise exception 'Este pedido ya fue resuelto.';
  end if;
end
$$;

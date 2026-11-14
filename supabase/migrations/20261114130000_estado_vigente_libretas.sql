-- "Por vencer" y "vencida" dejan de guardarse: dependen del día de hoy, así
-- que se calculan al leer a partir de `fecha_vencimiento`.
--
-- `estado` queda solo con el resultado de la revisión (pendiente / aprobado /
-- sinvalidar) y `estado_vigente` es un campo calculado: PostgREST expone las
-- funciones que reciben la fila como si fueran una columna más, así que se
-- puede pedir con `libretas_sanitarias(estado:estado_vigente, ...)`.

-- Las que estaban marcadas a mano como por vencer o vencidas ya habían sido
-- aprobadas; ahora su vigencia sale de la fecha.
update libretas_sanitarias set estado = 'aprobado' where estado in ('porvencer', 'vencida');

alter table libretas_sanitarias
  add constraint estado_solo_revision check (estado in ('pendiente', 'aprobado', 'sinvalidar'));

-- Días de anticipación con que una libreta aprobada pasa a "por vencer".
create or replace function estado_vigente(l libretas_sanitarias)
returns estado_libreta
language sql stable
set search_path = public
as $$
  select case
    when l.estado <> 'aprobado' or l.fecha_vencimiento is null then l.estado
    -- "Hoy" en hora argentina: la base corre en UTC y de noche daría mañana.
    when l.fecha_vencimiento < (now() at time zone 'America/Argentina/Buenos_Aires')::date
      then 'vencida'::estado_libreta
    when l.fecha_vencimiento <= (now() at time zone 'America/Argentina/Buenos_Aires')::date + 30
      then 'porvencer'::estado_libreta
    else 'aprobado'::estado_libreta
  end
$$;

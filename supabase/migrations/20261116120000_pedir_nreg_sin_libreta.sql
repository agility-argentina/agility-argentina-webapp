-- El pedido de número ya no exige la libreta aprobada y vigente: la libreta
-- sanitaria tiene su propio circuito de revisión. Quedan como requisitos
-- G0 sin número, dupla activa y microchip cargado.
create or replace function pedir_nreg(p_dupla_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_dupla duplas;
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

  insert into pedidos_nreg (dupla_id, pedido_por) values (p_dupla_id, auth.uid());
exception
  when unique_violation then
    raise exception 'Ya hay un pedido de número en trámite para %.', v_dupla.perro_nombre;
end
$$;

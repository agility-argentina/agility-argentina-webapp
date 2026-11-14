import { createClient } from "@/lib/supabase/server";
import { SolicitudesTabla, type Solicitud } from "./solicitudes-tabla";
import { TodosLosPerros, type PerroFila } from "./todos-los-perros";
import { VacunasPorVencer, type VacunaPorVencer } from "./vacunas-por-vencer";
import { PedidosNumero, type PedidoNumero } from "./pedidos-numero";
import { ordenNreg } from "@/lib/orden-nreg";

export default async function PanelAdminPage() {
  const supabase = await createClient();

  const { data: clubesData } = await supabase
    .from("clubes")
    .select("id, nombre, regiones(nombre)")
    .order("nombre");

  const clubes = (clubesData ?? []).map((c) => ({
    id: c.id,
    nombre: c.nombre,
    region: (c.regiones as unknown as { nombre: string } | null)?.nombre ?? "",
  }));

  const { data: duplasData } = await supabase
    .from("duplas")
    .select(
      "id, club_id, nreg, microchip, guia_nombre, guia_dni, guia_email, perro_nombre, grado, tamano, categoria_nota, estado, created_at, libretas_sanitarias(estado:estado_vigente, archivo_path, enviada_en, fecha_aplicacion, fecha_vencimiento, motivo_rechazo)"
    );

  const duplas = (duplasData ?? []).map((d) => {
    const libretaRaw = d.libretas_sanitarias as unknown;
    const libreta = (Array.isArray(libretaRaw) ? libretaRaw[0] : libretaRaw) as {
      estado: string;
      archivo_path: string | null;
      enviada_en: string | null;
      fecha_aplicacion: string | null;
      fecha_vencimiento: string | null;
      motivo_rechazo: string | null;
    } | null;
    return { ...d, libreta };
  });

  const clubPorId = new Map(clubes.map((c) => [c.id, c]));
  const duplaPorId = new Map(duplas.map((d) => [d.id, d]));

  const { data: pedidosData } = await supabase
    .from("pedidos_nreg")
    .select("id, dupla_id, pedido_en")
    .eq("estado", "pendiente")
    .order("pedido_en");

  const pedidosNumero: PedidoNumero[] = (pedidosData ?? []).flatMap((p) => {
    const d = duplaPorId.get(p.dupla_id);
    if (!d) return [];
    return [
      {
        id: p.id,
        perro_nombre: d.perro_nombre,
        guia_nombre: d.guia_nombre,
        tamano: d.tamano,
        microchip: d.microchip,
        club: clubPorId.get(d.club_id)?.nombre ?? "—",
        pedido_en: p.pedido_en,
      },
    ];
  });

  const duplasConPedido = new Set((pedidosData ?? []).map((p) => p.dupla_id));

  // Sugerencia para el próximo número a asignar: el más alto cargado + 1.
  const proximoNumero =
    Math.max(0, ...duplas.map((d) => ordenNreg(d.nreg)).filter((n) => Number.isFinite(n))) + 1;

  const solicitudes: Solicitud[] = duplas
    .filter((d) => d.libreta?.estado === "pendiente")
    .map((d) => ({
      duplaId: d.id,
      guia_nombre: d.guia_nombre,
      perro_nombre: d.perro_nombre,
      grado: d.grado,
      tamano: d.tamano,
      club: clubPorId.get(d.club_id)?.nombre ?? "—",
      region: clubPorId.get(d.club_id)?.region ?? "—",
      enviada_en: d.libreta?.enviada_en ?? null,
      archivo_path: d.libreta?.archivo_path ?? null,
    }))
    .sort((a, b) => (a.enviada_en ?? "").localeCompare(b.enviada_en ?? ""));

  const perros: PerroFila[] = duplas.map((d) => ({
    id: d.id,
    nreg: d.nreg,
    club: clubPorId.get(d.club_id)?.nombre ?? "—",
    region: clubPorId.get(d.club_id)?.region ?? "—",
    perro_nombre: d.perro_nombre,
    guia_nombre: d.guia_nombre,
    grado: d.grado,
    tamano: d.tamano,
    estado: d.estado,
    microchip: d.microchip,
    guia_dni: d.guia_dni,
    guia_email: d.guia_email,
    categoria_nota: d.categoria_nota,
    created_at: d.created_at,
    pedidoEnTramite: duplasConPedido.has(d.id),
    libreta: d.libreta,
  }));

  const regionesUnicas = [...new Set(clubes.map((c) => c.region))].sort();

  const totalDuplas = duplas.length;
  const pendientes = solicitudes.length;
  // Primero las que vencen antes; las que no tienen fecha cargada, al final.
  const vacunas: VacunaPorVencer[] = duplas
    .filter((d) => d.libreta?.estado === "vencida" || d.libreta?.estado === "porvencer")
    .map((d) => ({
      duplaId: d.id,
      perro_nombre: d.perro_nombre,
      guia_nombre: d.guia_nombre,
      club: clubPorId.get(d.club_id)?.nombre ?? "—",
      estado: d.libreta!.estado as VacunaPorVencer["estado"],
      fecha_vencimiento: d.libreta!.fecha_vencimiento,
    }))
    .sort((a, b) => (a.fecha_vencimiento ?? "9999").localeCompare(b.fecha_vencimiento ?? "9999"));

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1180px] mx-auto px-5 lg:px-8 py-8">
          <p className="text-[12.5px] text-slate-500">Administración general</p>
          <h1 className="font-display text-[36px] leading-none mt-1.5 text-blue-900 font-bold">
            Estado del registro
          </h1>
        </div>
      </div>

      <div className="max-w-[1180px] mx-auto px-5 lg:px-8 py-9">
          <div className="bg-white border border-slate-200 rounded-lg grid grid-cols-2 lg:grid-cols-4 divide-slate-200 lg:divide-x">
            <div className="p-6 border-b lg:border-b-0 border-slate-200">
              <p className="text-[13px] text-slate-600">Total de duplas</p>
              <p className="font-display text-[42px] leading-none mt-2 text-blue-900 tabular font-bold">
                {totalDuplas}
              </p>
            </div>
            <div className="p-6 border-b lg:border-b-0 border-l lg:border-l-0 border-slate-200">
              <p className="text-[13px] text-slate-600">Pendientes de aprobación</p>
              <p className="font-display text-[42px] leading-none mt-2 text-blue-600 tabular font-bold">
                {pendientes}
              </p>
            </div>
            <div>
              <VacunasPorVencer vacunas={vacunas} />
            </div>
            <div className="p-6 border-l lg:border-l-0 border-slate-200">
              <p className="text-[13px] text-slate-600">Grupos homologados</p>
              <p className="font-display text-[42px] leading-none mt-2 text-blue-900 tabular font-bold">
                {clubes.length}
              </p>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="font-display text-[28px] leading-none text-blue-900 font-semibold mb-5">
              Solicitudes pendientes
            </h2>
            <SolicitudesTabla solicitudes={solicitudes} />
          </div>

          <div className="mt-12">
            <h2 className="font-display text-[28px] leading-none text-blue-900 font-semibold mb-5">
              Pedidos de nº de registro
            </h2>
            <PedidosNumero pedidos={pedidosNumero} proximoNumero={proximoNumero} />
          </div>

          <div className="mt-12">
            <TodosLosPerros perros={perros} regiones={regionesUnicas} />
          </div>
        </div>
      </main>
  );
}

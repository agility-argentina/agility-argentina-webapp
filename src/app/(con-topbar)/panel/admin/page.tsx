import { createClient } from "@/lib/supabase/server";
import { SolicitudesTabla, type Solicitud } from "./solicitudes-tabla";
import { TodosLosPerros, type PerroFila } from "./todos-los-perros";
import { VacunasPorVencer, type VacunaPorVencer } from "./vacunas-por-vencer";
import { PedidosNumero, type PedidoNumero } from "./pedidos-numero";
import { PendientesTabs } from "./pendientes-tabs";
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
      {/* Sin título visible; el h1 queda para lectores de pantalla. */}
      <h1 className="sr-only">Panel de administración</h1>

      <div className="max-w-[1180px] mx-auto px-5 lg:px-8 py-6">
          <div className="bg-white border border-slate-200 rounded-lg grid grid-cols-2 lg:grid-cols-4 divide-slate-200 lg:divide-x">
            <div className="px-5 py-4 border-b lg:border-b-0 border-slate-200">
              <p className="text-[13px] text-slate-600">Total de duplas</p>
              <p className="font-display text-[34px] leading-none mt-1.5 text-blue-900 tabular font-bold">
                {totalDuplas}
              </p>
            </div>
            <div className="px-5 py-4 border-b lg:border-b-0 border-l lg:border-l-0 border-slate-200">
              <p className="text-[13px] text-slate-600">Pendientes de aprobación</p>
              <p className="font-display text-[34px] leading-none mt-1.5 text-blue-600 tabular font-bold">
                {pendientes}
              </p>
            </div>
            <div>
              <VacunasPorVencer vacunas={vacunas} />
            </div>
            <div className="px-5 py-4 border-l lg:border-l-0 border-slate-200">
              <p className="text-[13px] text-slate-600">Grupos homologados</p>
              <p className="font-display text-[34px] leading-none mt-1.5 text-blue-900 tabular font-bold">
                {clubes.length}
              </p>
            </div>
          </div>

          <div className="mt-7">
            <h2 className="font-display text-[24px] leading-none text-blue-900 font-semibold mb-3">Pendientes</h2>
            <PendientesTabs
              tabs={[
                {
                  id: "registro",
                  titulo: "Nº de registro",
                  cantidad: pedidosNumero.length,
                  contenido: <PedidosNumero pedidos={pedidosNumero} proximoNumero={proximoNumero} />,
                },
                {
                  id: "vacunas",
                  titulo: "Vacunas",
                  cantidad: solicitudes.length,
                  contenido: <SolicitudesTabla solicitudes={solicitudes} />,
                },
                {
                  id: "pase-grado",
                  titulo: "Pase de grado",
                  cantidad: null,
                  contenido: (
                    <div className="bg-white border border-dashed border-slate-300 rounded-lg px-5 py-8 text-center text-[13.5px] text-slate-500">
                      Próximamente: acá van a aparecer los pedidos de pase de grado de los clubes.
                    </div>
                  ),
                },
              ]}
            />
          </div>

          <div className="mt-8">
            <TodosLosPerros perros={perros} regiones={regionesUnicas} />
          </div>
        </div>
      </main>
  );
}

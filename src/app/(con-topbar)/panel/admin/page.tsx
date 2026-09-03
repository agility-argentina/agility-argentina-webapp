import { createClient } from "@/lib/supabase/server";
import { SolicitudesTabla, type Solicitud } from "./solicitudes-tabla";
import { TodosLosPerros, type PerroFila } from "./todos-los-perros";

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
      "id, club_id, nreg, guia_nombre, perro_nombre, grado, tamano, estado, libretas_sanitarias(estado, archivo_path, enviada_en)"
    );

  const duplas = (duplasData ?? []).map((d) => {
    const libretaRaw = d.libretas_sanitarias as unknown;
    const libreta = (Array.isArray(libretaRaw) ? libretaRaw[0] : libretaRaw) as {
      estado: string;
      archivo_path: string | null;
      enviada_en: string | null;
    } | null;
    return { ...d, libreta };
  });

  const clubPorId = new Map(clubes.map((c) => [c.id, c]));

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
  }));

  const regionesUnicas = [...new Set(clubes.map((c) => c.region))].sort();

  const totalDuplas = duplas.length;
  const pendientes = solicitudes.length;
  const vencidasPorVencer = duplas.filter(
    (d) => d.libreta?.estado === "vencida" || d.libreta?.estado === "porvencer"
  ).length;

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
            <div className="p-6">
              <p className="text-[13px] text-slate-600">Vacunas por vencer</p>
              <p className="font-display text-[42px] leading-none mt-2 text-amber-600 tabular font-bold">
                {vencidasPorVencer}
              </p>
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
            <TodosLosPerros perros={perros} regiones={regionesUnicas} />
          </div>
        </div>
      </main>
  );
}

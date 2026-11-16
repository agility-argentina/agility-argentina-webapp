import { createClient } from "@/lib/supabase/server";
import { DuplasTabla, type DuplaConLibreta } from "./duplas-tabla";

export default async function PanelGrupoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: cuenta } = await supabase
    .from("cuentas")
    .select("club_id, clubes(nombre, ciudad, regiones(nombre))")
    .eq("user_id", user!.id)
    .single();

  const club = cuenta?.clubes as unknown as {
    nombre: string;
    ciudad: string;
    regiones: { nombre: string } | null;
  } | null;

  const { data: duplasData } = await supabase
    .from("duplas")
    .select(
      "id, nreg, microchip, guia_nombre, perro_nombre, grado, tamano, categoria_nota, estado, libretas_sanitarias(estado:estado_vigente, archivo_path, fecha_aplicacion, fecha_vencimiento), pedidos_nreg(estado, pedido_en, motivo_rechazo)"
    )
    .eq("club_id", cuenta?.club_id ?? "");

  const duplas: DuplaConLibreta[] = (duplasData ?? []).map((d) => {
    const libretaRaw = d.libretas_sanitarias as unknown;
    const libreta = Array.isArray(libretaRaw) ? libretaRaw[0] : libretaRaw;
    return {
      id: d.id,
      nreg: d.nreg,
      microchip: d.microchip,
      guia_nombre: d.guia_nombre,
      perro_nombre: d.perro_nombre,
      grado: d.grado,
      tamano: d.tamano,
      categoria_nota: d.categoria_nota,
      estado: d.estado,
      libreta: (libreta as DuplaConLibreta["libreta"]) ?? null,
      // Solo importa el último pedido: uno en trámite o el rechazo más reciente.
      pedido:
        ((d.pedidos_nreg ?? []) as NonNullable<DuplaConLibreta["pedido"]>[]).sort((a, b) =>
          b.pedido_en.localeCompare(a.pedido_en)
        )[0] ?? null,
    };
  });

  return (
    <main className="min-h-screen bg-slate-50">
      {/* El nombre del club se ve en la topbar; el h1 queda para lectores de pantalla. */}
      <h1 className="sr-only">{club?.nombre ?? "Panel de grupo"}</h1>

      <div className="max-w-[1180px] mx-auto px-5 lg:px-8 py-6">
        <DuplasTabla duplas={duplas} />
      </div>
    </main>
  );
}

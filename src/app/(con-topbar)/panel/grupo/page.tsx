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
      "id, nreg, guia_nombre, perro_nombre, grado, tamano, categoria_nota, estado, libretas_sanitarias(estado, archivo_path, fecha_aplicacion, fecha_vencimiento)"
    )
    .eq("club_id", cuenta?.club_id ?? "");

  const duplas: DuplaConLibreta[] = (duplasData ?? []).map((d) => {
    const libretaRaw = d.libretas_sanitarias as unknown;
    const libreta = Array.isArray(libretaRaw) ? libretaRaw[0] : libretaRaw;
    return {
      id: d.id,
      nreg: d.nreg,
      guia_nombre: d.guia_nombre,
      perro_nombre: d.perro_nombre,
      grado: d.grado,
      tamano: d.tamano,
      categoria_nota: d.categoria_nota,
      estado: d.estado,
      libreta: (libreta as DuplaConLibreta["libreta"]) ?? null,
    };
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1180px] mx-auto px-5 lg:px-8 py-8">
          <p className="text-[12.5px] text-slate-500">
            Grupo homologado{club?.regiones ? ` · Región ${club.regiones.nombre}` : ""}
          </p>
          <h1 className="font-display text-[36px] leading-none mt-1.5 text-blue-900 font-bold">
            {club?.nombre ?? "Panel de grupo"}
          </h1>
          <p className="mt-2 text-[13.5px] text-slate-600">{club?.ciudad}</p>
        </div>
      </div>

      <div className="max-w-[1180px] mx-auto px-5 lg:px-8 py-9">
        <DuplasTabla duplas={duplas} />
      </div>
    </main>
  );
}

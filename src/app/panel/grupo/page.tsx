import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";

export default async function PanelGrupoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: cuenta } = await supabase
    .from("cuentas")
    .select("club_id, clubes(nombre, ciudad)")
    .eq("user_id", user!.id)
    .single();

  const { count: totalDuplas } = await supabase
    .from("duplas")
    .select("id", { count: "exact", head: true })
    .eq("club_id", cuenta?.club_id);

  const club = cuenta?.clubes as unknown as { nombre: string; ciudad: string } | null;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-lg p-6">
        <p className="text-xs text-slate-500 uppercase tracking-wide">Panel de grupo (stub — Fase 2)</p>
        <h1 className="mt-1 text-2xl font-bold text-blue-900">{club?.nombre ?? "Club"}</h1>
        <p className="mt-1 text-sm text-slate-600">{club?.ciudad}</p>
        <p className="mt-4 text-sm text-slate-700">Duplas cargadas: {totalDuplas ?? 0}</p>
        <p className="mt-1 text-sm text-slate-500">Logueado como: {user?.email}</p>

        <form action={logout} className="mt-6">
          <button className="text-sm text-rose-700 hover:underline">Cerrar sesión</button>
        </form>
      </div>
    </main>
  );
}

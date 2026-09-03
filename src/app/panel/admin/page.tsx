import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";

export default async function PanelAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count: totalDuplas } = await supabase
    .from("duplas")
    .select("id", { count: "exact", head: true });

  const { count: totalClubes } = await supabase
    .from("clubes")
    .select("id", { count: "exact", head: true });

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-lg p-6">
        <p className="text-xs text-slate-500 uppercase tracking-wide">Panel de administración (stub — Fase 2)</p>
        <h1 className="mt-1 text-2xl font-bold text-blue-900">Administración general</h1>
        <p className="mt-4 text-sm text-slate-700">Duplas totales visibles: {totalDuplas ?? 0}</p>
        <p className="text-sm text-slate-700">Clubes: {totalClubes ?? 0}</p>
        <p className="mt-1 text-sm text-slate-500">Logueado como: {user?.email}</p>

        <form action={logout} className="mt-6">
          <button className="text-sm text-rose-700 hover:underline">Cerrar sesión</button>
        </form>
      </div>
    </main>
  );
}

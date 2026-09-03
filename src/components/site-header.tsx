import Link from "next/link";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(con-topbar)/login/actions";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = (await headers()).get("x-pathname") ?? "";

  let panelHref = "/login";
  let label = "Mi cuenta";

  if (user) {
    const { data: cuenta } = await supabase
      .from("cuentas")
      .select("rol")
      .eq("user_id", user.id)
      .single();

    panelHref = cuenta?.rol === "admin" ? "/panel/admin" : "/panel/grupo";
    label = "Ir a mi panel";
  }

  const enPanelPropio = user && pathname === panelHref;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-[1180px] mx-auto px-5 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" className="flex items-center gap-3 shrink-0 foco">
            <span className="grid place-items-center w-9 h-9 rounded bg-blue-900" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                <path d="M4 19V7M20 19V7" stroke="#93c5fd" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M3 9.5h18" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
                <path d="M3 13.5h18" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </span>
            <span className="leading-none">
              <span className="block font-display text-[21px] font-bold tracking-tight text-blue-900">
                Agility Argentina
              </span>
            </span>
          </Link>

          {enPanelPropio ? (
            <form action={logout}>
              <button className="foco inline-flex items-center gap-2 px-3.5 py-2 text-[13px] font-semibold rounded-md border border-slate-300 text-rose-700 hover:bg-rose-50 transition-colors">
                Cerrar sesión
              </button>
            </form>
          ) : (
            <Link
              href={panelHref}
              className="foco inline-flex items-center gap-2 px-3.5 py-2 text-[13px] font-semibold rounded-md border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              {label}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

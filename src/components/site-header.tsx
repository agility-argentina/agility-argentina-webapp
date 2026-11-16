import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(con-topbar)/login/actions";
import { AccountMenu } from "@/components/account-menu";
import { SeccionTopbar } from "@/components/seccion-topbar";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let panelHref = "/login";
  let seccion: { titulo: string; detalle: string | null } | null = null;

  if (user) {
    const { data: cuenta } = await supabase
      .from("cuentas")
      .select("rol, clubes(nombre, ciudad, regiones(nombre))")
      .eq("user_id", user.id)
      .single();

    const club = cuenta?.clubes as unknown as {
      nombre: string;
      ciudad: string;
      regiones: { nombre: string } | null;
    } | null;

    panelHref = cuenta?.rol === "admin" ? "/panel/admin" : "/panel/grupo";
    seccion =
      cuenta?.rol === "admin"
        ? { titulo: "Administración general", detalle: null }
        : club
          ? {
              titulo: club.nombre,
              detalle: [club.ciudad, club.regiones && `Región ${club.regiones.nombre}`].filter(Boolean).join(" · "),
            }
          : null;
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-[1180px] mx-auto px-5 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="flex items-center gap-2.5 shrink-0 foco">
              <Image src="/logo-icon.png" alt="" width={56} height={36} className="h-9 w-auto" priority />
              <span className="leading-none">
                <span className="block font-display text-[21px] font-bold tracking-tight text-blue-900">
                  Agility Argentina
                </span>
              </span>
            </Link>
            {seccion && <SeccionTopbar panelHref={panelHref} {...seccion} />}
          </div>

          {user ? (
            <AccountMenu panelHref={panelHref} cuentaHref={`${panelHref}/cuenta`} logout={logout} />
          ) : (
            <Link
              href="/login"
              className="foco inline-flex items-center gap-2 px-3.5 py-2 text-[13px] font-semibold rounded-md border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              Mi cuenta
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

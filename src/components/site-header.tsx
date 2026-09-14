import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(con-topbar)/login/actions";
import { AccountMenu } from "@/components/account-menu";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let panelHref = "/login";

  if (user) {
    const { data: cuenta } = await supabase
      .from("cuentas")
      .select("rol")
      .eq("user_id", user.id)
      .single();

    panelHref = cuenta?.rol === "admin" ? "/panel/admin" : "/panel/grupo";
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-[1180px] mx-auto px-5 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 foco">
            <Image src="/logo-icon.png" alt="" width={56} height={36} className="h-9 w-auto" priority />
            <span className="leading-none">
              <span className="block font-display text-[21px] font-bold tracking-tight text-blue-900">
                Agility Argentina
              </span>
            </span>
          </Link>

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

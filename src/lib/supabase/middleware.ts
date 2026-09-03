import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // No sacar este await: refresca el token de sesión si venció, y
  // getUser() (a diferencia de getSession()) valida contra el servidor.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const protegido = path.startsWith("/panel/grupo") || path.startsWith("/panel/admin");

  if (protegido && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (user && protegido) {
    const { data: cuenta } = await supabase
      .from("cuentas")
      .select("rol")
      .eq("user_id", user.id)
      .single();

    if (!cuenta) {
      // Usuario autenticado pero sin perfil en `cuentas` (no debería pasar
      // en producción, las cuentas las da de alta el admin) — no dejarlo
      // entrar a ningún panel en vez de redirigir en loop.
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "sin-cuenta");
      return NextResponse.redirect(url);
    }

    const rolRequerido = path.startsWith("/panel/admin") ? "admin" : "grupo";
    if (cuenta.rol !== rolRequerido) {
      const url = request.nextUrl.clone();
      url.pathname = cuenta.rol === "admin" ? "/panel/admin" : "/panel/grupo";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

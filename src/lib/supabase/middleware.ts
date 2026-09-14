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

  const path = request.nextUrl.pathname;
  const protegido = path.startsWith("/panel/grupo") || path.startsWith("/panel/admin");

  let user;
  try {
    // No sacar este await: refresca el token de sesión si venció, y
    // getUser() (a diferencia de getSession()) valida contra el servidor.
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    // Supabase inalcanzable (ej. proyecto pausado por inactividad en el
    // plan free). Las rutas públicas siguen sirviéndose normalmente; las
    // protegidas no pueden validar sesión, así que se manda a /login con
    // un aviso en vez de dejar pasar sin auth o romper el middleware entero.
    if (protegido) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "El servicio no está disponible en este momento. Probá de nuevo en unos minutos.");
      return NextResponse.redirect(url);
    }
    return response;
  }

  if (protegido && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (user && protegido) {
    try {
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
    } catch {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "El servicio no está disponible en este momento. Probá de nuevo en unos minutos.");
      return NextResponse.redirect(url);
    }
  }

  return response;
}

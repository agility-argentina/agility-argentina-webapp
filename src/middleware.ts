import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Deja el pathname actual disponible como header de request, para que
  // Server Components (ej. SiteHeader) sepan en qué página están sin
  // tener que recibirlo como prop desde cada page.tsx.
  request.headers.set("x-pathname", request.nextUrl.pathname);

  // Portón temporal de "sitio en construcción". Se activa solo si existe
  // SITE_PIN en las variables de entorno — para lanzar de verdad, alcanza
  // con borrar SITE_PIN y SITE_UNLOCK_TOKEN en Vercel, sin tocar código.
  if (process.env.SITE_PIN) {
    const path = request.nextUrl.pathname;
    const desbloqueado = request.cookies.get("site_unlock")?.value === process.env.SITE_UNLOCK_TOKEN;

    if (!desbloqueado && path !== "/acceso-restringido") {
      const url = request.nextUrl.clone();
      url.pathname = "/acceso-restringido";
      url.search = `?next=${encodeURIComponent(path)}`;
      return NextResponse.redirect(url);
    }
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Corre en todas las rutas menos assets estáticos, para poder
     * refrescar la sesión en cualquier página.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function desbloquear(formData: FormData) {
  const pin = String(formData.get("pin") ?? "");
  const next = String(formData.get("next") ?? "/");

  if (pin !== process.env.SITE_PIN) {
    redirect(`/acceso-restringido?error=1&next=${encodeURIComponent(next)}`);
  }

  const cookieStore = await cookies();
  cookieStore.set("site_unlock", process.env.SITE_UNLOCK_TOKEN!, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90, // 90 días
  });

  redirect(next || "/");
}

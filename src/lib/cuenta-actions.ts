"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function cambiarPassword(formData: FormData) {
  const nueva = String(formData.get("nueva") ?? "");
  const confirmar = String(formData.get("confirmar") ?? "");
  const volver = String(formData.get("volver") ?? "/");

  if (nueva.length < 8) {
    redirect(`${volver}?error=${encodeURIComponent("La contraseña debe tener al menos 8 caracteres.")}`);
  }
  if (nueva !== confirmar) {
    redirect(`${volver}?error=${encodeURIComponent("Las contraseñas no coinciden.")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: nueva });

  if (error) {
    redirect(`${volver}?error=${encodeURIComponent("No se pudo actualizar la contraseña. Probá de nuevo.")}`);
  }

  redirect(`${volver}?ok=1`);
}

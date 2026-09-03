"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function idSiEsAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: cuenta } = await supabase.from("cuentas").select("rol").eq("user_id", user.id).single();
  return cuenta?.rol === "admin" ? user.id : null;
}

export async function aprobarSolicitud(duplaId: string) {
  const supabase = await createClient();
  const adminId = await idSiEsAdmin(supabase);
  if (!adminId) return { error: "No autorizado." };

  const { error } = await supabase
    .from("libretas_sanitarias")
    .update({
      estado: "aprobado",
      revisada_en: new Date().toISOString(),
      revisada_por: adminId,
      motivo_rechazo: null,
    })
    .eq("dupla_id", duplaId);
  if (error) return { error: error.message };

  revalidatePath("/panel/admin");
  return { success: true };
}

export async function rechazarSolicitud(duplaId: string, motivo: string) {
  const supabase = await createClient();
  const adminId = await idSiEsAdmin(supabase);
  if (!adminId) return { error: "No autorizado." };
  if (!motivo.trim()) return { error: "Escribí el motivo del rechazo." };

  const { error } = await supabase
    .from("libretas_sanitarias")
    .update({
      estado: "sinvalidar",
      motivo_rechazo: motivo.trim(),
      revisada_en: new Date().toISOString(),
      revisada_por: adminId,
    })
    .eq("dupla_id", duplaId);
  if (error) return { error: error.message };

  revalidatePath("/panel/admin");
  return { success: true };
}

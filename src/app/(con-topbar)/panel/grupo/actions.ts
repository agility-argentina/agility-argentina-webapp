"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function clubDelUsuarioActual(
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: cuenta } = await supabase
    .from("cuentas")
    .select("club_id")
    .eq("user_id", user.id)
    .single();

  return cuenta?.club_id ?? null;
}

export async function guardarDupla(formData: FormData) {
  const supabase = await createClient();
  const clubId = await clubDelUsuarioActual(supabase);
  if (!clubId) return { error: "No autorizado." };

  const duplaId = formData.get("dupla_id");
  const guia_nombre = String(formData.get("guia_nombre") ?? "").trim();
  const perro_nombre = String(formData.get("perro_nombre") ?? "").trim();
  const grado = String(formData.get("grado") ?? "G2");
  const tamano = String(formData.get("tamano") ?? "Intermediate");
  const archivo = formData.get("archivo") as File | null;
  const fecha_aplicacion = String(formData.get("fecha_aplicacion") ?? "").trim() || null;
  const fecha_vencimiento = String(formData.get("fecha_vencimiento") ?? "").trim() || null;

  if (!guia_nombre || !perro_nombre) {
    return { error: "Faltan el nombre del guía y el del perro." };
  }

  let duplaGuardada: { id: string };

  if (duplaId) {
    const { data, error } = await supabase
      .from("duplas")
      .update({ guia_nombre, perro_nombre, grado, tamano })
      .eq("id", String(duplaId))
      .select("id")
      .single();
    if (error || !data) return { error: error?.message ?? "No se encontró la dupla." };
    duplaGuardada = data;
  } else {
    const { data, error } = await supabase
      .from("duplas")
      .insert({ club_id: clubId, guia_nombre, perro_nombre, grado, tamano, estado: "activa" })
      .select("id")
      .single();
    if (error || !data) return { error: error?.message ?? "No se pudo registrar la dupla." };
    duplaGuardada = data;
  }

  if (archivo && archivo.size > 0) {
    const extension = archivo.name.split(".").pop() ?? "bin";
    const path = `${clubId}/${duplaGuardada.id}/${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("libretas")
      .upload(path, archivo, { upsert: true });
    if (uploadError) return { error: `No se pudo subir el archivo: ${uploadError.message}` };

    const { error: libretaError } = await supabase.from("libretas_sanitarias").upsert(
      {
        dupla_id: duplaGuardada.id,
        estado: "pendiente",
        archivo_path: path,
        fecha_aplicacion,
        fecha_vencimiento,
        enviada_en: new Date().toISOString(),
        revisada_en: null,
        revisada_por: null,
        motivo_rechazo: null,
      },
      { onConflict: "dupla_id" }
    );
    if (libretaError) return { error: libretaError.message };
  }

  revalidatePath("/panel/grupo");
  return { success: true };
}

export async function obtenerUrlLibreta(archivoPath: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("libretas")
    .createSignedUrl(archivoPath, 60 * 5);

  if (error || !data) return { error: error?.message ?? "No se pudo generar el link." };
  return { url: data.signedUrl };
}

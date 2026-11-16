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
  // Un G0 sin número que el club pasa a G1 en el formulario: se guarda como G0
  // y se le pide el número a la comisión, que es quien lo pasa a G1.
  const pedirNumero = Boolean(duplaId) && formData.get("pedir_numero") === "1";
  const tamano = String(formData.get("tamano") ?? "Intermediate");
  const archivo = formData.get("archivo") as File | null;
  const fecha_aplicacion = String(formData.get("fecha_aplicacion") ?? "").trim() || null;
  const fecha_vencimiento = String(formData.get("fecha_vencimiento") ?? "").trim() || null;

  // El número solo se carga en el alta (perros que ya lo tenían). Después lo
  // maneja la comisión, así que en una edición se ignora.
  const nreg = grado === "G0" ? null : String(formData.get("nreg") ?? "").trim() || null;
  const microchip = String(formData.get("microchip") ?? "").trim() || null;

  if (!guia_nombre || !perro_nombre) {
    return { error: "Faltan el nombre del guía y el del perro." };
  }
  if (grado !== "G0" && !microchip) {
    return { error: "Para G1, G2 y G3 hace falta el microchip del perro." };
  }
  if (!duplaId && grado !== "G0" && !nreg) {
    return { error: "Para dar de alta un perro de G1, G2 o G3 hace falta su número de registro." };
  }

  // Si se pide el número, se validan los requisitos antes de guardar nada,
  // para no dejar cambios a medias. `pedir_nreg` los vuelve a validar después.
  if (pedirNumero) {
    // La libreta no es requisito: tiene su propio circuito de revisión.
    if (!microchip) return { error: "Para pedir el número hace falta el microchip del perro." };
    const { data: actual } = await supabase
      .from("duplas")
      .select("estado, pedidos_nreg(estado)")
      .eq("id", String(duplaId))
      .single();
    const pedidos = (actual?.pedidos_nreg ?? []) as { estado: string }[];

    if (actual?.estado !== "activa") return { error: "La dupla tiene que estar activa para pedir el número." };
    if (pedidos.some((p) => p.estado === "pendiente")) {
      return { error: "Ya hay un pedido de número en trámite para este perro." };
    }
  }

  const campos = { guia_nombre, perro_nombre, grado: pedirNumero ? "G0" : grado, tamano, microchip };
  const mensajeError = (error: { code?: string; message: string } | null, porDefecto: string) =>
    error?.code === "23505" ? `El número de registro ${nreg} ya está cargado en otro perro.` : (error?.message ?? porDefecto);

  let duplaGuardada: { id: string };

  if (duplaId) {
    const { data, error } = await supabase
      .from("duplas")
      .update(campos)
      .eq("id", String(duplaId))
      .select("id")
      .single();
    if (error || !data) return { error: mensajeError(error, "No se encontró la dupla.") };
    duplaGuardada = data;
  } else {
    const { data, error } = await supabase
      .from("duplas")
      .insert({ club_id: clubId, ...campos, nreg, estado: "activa" })
      .select("id")
      .single();
    if (error || !data) return { error: mensajeError(error, "No se pudo registrar la dupla.") };
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

  if (pedirNumero) {
    // Los requisitos (dupla activa, microchip, sin pedido en trámite) los
    // vuelve a validar `pedir_nreg` en la base.
    const { error } = await supabase.rpc("pedir_nreg", { p_dupla_id: duplaGuardada.id });
    if (error) {
      return { error: `Se guardaron los cambios, pero no se pudo pedir el número: ${error.message}`, guardado: true };
    }
    revalidatePath("/panel/admin");
  }

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

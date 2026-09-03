"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    redirect(`/login?error=${encodeURIComponent("Email o contraseña incorrectos.")}`);
  }

  const { data: cuenta } = await supabase
    .from("cuentas")
    .select("rol")
    .eq("user_id", data.user.id)
    .single();

  redirect(cuenta?.rol === "admin" ? "/panel/admin" : "/panel/grupo");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

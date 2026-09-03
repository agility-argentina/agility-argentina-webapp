// Da de alta las cuentas de prueba en Supabase Auth (1 admin + 1 grupo de
// Revamp Agility) y su fila correspondiente en `cuentas`. Pensado para
// correr una sola vez en desarrollo:
//
//   node --env-file=.env.local scripts/provision-test-accounts.mjs
//
// No versiona contraseñas: las genera al vuelo e imprime por consola.

import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoConfirm: true } }
);

function generarPassword() {
  return randomBytes(18).toString("base64url");
}

async function crearCuenta({ email, password, rol, clubNombre }) {
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (userError) throw new Error(`No se pudo crear ${email}: ${userError.message}`);

  let club_id = null;
  if (clubNombre) {
    const { data: club, error: clubError } = await supabase
      .from("clubes")
      .select("id")
      .eq("nombre", clubNombre)
      .single();
    if (clubError) throw new Error(`No se encontró el club "${clubNombre}": ${clubError.message}`);
    club_id = club.id;
  }

  const { error: cuentaError } = await supabase
    .from("cuentas")
    .insert({ user_id: userData.user.id, rol, club_id });
  if (cuentaError) throw new Error(`No se pudo crear la fila en cuentas para ${email}: ${cuentaError.message}`);

  return { email, password };
}

const admin = await crearCuenta({
  email: "sistemasagilityargentina+admin@gmail.com",
  password: generarPassword(),
  rol: "admin",
});

const grupo = await crearCuenta({
  email: "sistemasagilityargentina+revamp@gmail.com",
  password: generarPassword(),
  rol: "grupo",
  clubNombre: "Revamp Agility",
});

console.log("\nCuentas creadas:\n");
console.log(`Admin  -> ${admin.email} / ${admin.password}`);
console.log(`Grupo  -> ${grupo.email} / ${grupo.password}`);
console.log("\nGuardalas en tu gestor de contraseñas, no quedan en ningún lado más.\n");

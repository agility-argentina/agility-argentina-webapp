import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente con la service role key: ignora RLS por completo.
 * Uso exclusivo en el servidor, y solo para lecturas agregadas (conteos,
 * KPIs) que son seguras de exponer públicamente aunque las filas
 * individuales no lo sean (ej. "cuántas duplas activas hay" en la home,
 * sin exponer nombres). Nunca devolver filas crudas de acá a una página
 * pública.
 */
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

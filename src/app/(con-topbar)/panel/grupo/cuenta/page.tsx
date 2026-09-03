import { CambiarPassword } from "@/components/cambiar-password";

export default async function CuentaGrupoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await searchParams;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-[1180px] mx-auto px-5 lg:px-8 py-9">
        <CambiarPassword volver="/panel/grupo/cuenta" error={error} ok={ok} />
      </div>
    </main>
  );
}

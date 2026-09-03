import { CambiarPassword } from "@/components/cambiar-password";

export default async function CuentaAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await searchParams;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-[1180px] mx-auto px-5 lg:px-8 py-9">
        <CambiarPassword volver="/panel/admin/cuenta" error={error} ok={ok} />
      </div>
    </main>
  );
}

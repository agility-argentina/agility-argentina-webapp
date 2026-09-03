import { Lock } from "lucide-react";
import { desbloquear } from "./actions";

export default async function AccesoRestringidoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-xs text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-slate-800 grid place-items-center">
          <Lock className="w-5 h-5 text-slate-300" aria-hidden="true" />
        </div>

        {error && (
          <p className="mt-4 text-sm text-rose-400">PIN incorrecto.</p>
        )}

        <form action={desbloquear} className="mt-6 space-y-3">
          <input type="hidden" name="next" value={next ?? "/"} />
          <input
            name="pin"
            type="password"
            inputMode="numeric"
            autoFocus
            required
            className="w-full text-center tracking-[0.4em] bg-slate-900 border border-slate-700 rounded px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-slate-400"
            placeholder="······"
          />
          <button
            type="submit"
            className="w-full bg-slate-100 hover:bg-white text-slate-900 text-sm font-semibold rounded px-4 py-2.5 transition-colors"
          >
            Ingresar
          </button>
        </form>
      </div>
    </main>
  );
}

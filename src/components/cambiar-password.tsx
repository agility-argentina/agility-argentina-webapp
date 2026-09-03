import { cambiarPassword } from "@/lib/cuenta-actions";

export function CambiarPassword({
  volver,
  error,
  ok,
}: {
  volver: string;
  error?: string;
  ok?: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md">
      <h2 className="font-display text-[22px] leading-none text-blue-900 font-semibold">Cambiar contraseña</h2>
      <p className="mt-2 text-[13px] text-slate-500">Elegí una contraseña nueva para tu cuenta.</p>

      {error && (
        <p className="mt-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded px-3 py-2">{error}</p>
      )}
      {ok && (
        <p className="mt-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-3 py-2">
          Contraseña actualizada correctamente.
        </p>
      )}

      <form action={cambiarPassword} className="mt-5 space-y-4">
        <input type="hidden" name="volver" value={volver} />
        <label className="block">
          <span className="block text-sm mb-1 text-slate-700">Nueva contraseña</span>
          <input
            name="nueva"
            type="password"
            required
            minLength={8}
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600"
          />
        </label>
        <label className="block">
          <span className="block text-sm mb-1 text-slate-700">Confirmar contraseña</span>
          <input
            name="confirmar"
            type="password"
            required
            minLength={8}
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600"
          />
        </label>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded px-4 py-2.5 transition-colors"
        >
          Guardar contraseña
        </button>
      </form>
    </div>
  );
}

import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h1 className="text-xl font-semibold text-blue-900">Agility Argentina</h1>
        <p className="mt-1 text-sm text-slate-500">Ingresá con tu cuenta de club o de administración.</p>

        {error && (
          <p className="mt-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded px-3 py-2">
            {error}
          </p>
        )}

        <form action={login} className="mt-5 space-y-4">
          <label className="block">
            <span className="block text-sm mb-1 text-slate-700">Email</span>
            <input
              name="email"
              type="email"
              required
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600"
            />
          </label>
          <label className="block">
            <span className="block text-sm mb-1 text-slate-700">Contraseña</span>
            <input
              name="password"
              type="password"
              required
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600"
            />
          </label>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded px-4 py-2.5 transition-colors"
          >
            Ingresar
          </button>
        </form>
      </div>
    </main>
  );
}

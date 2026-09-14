"use client";

import { useFormStatus } from "react-dom";

export function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded px-4 py-2.5 transition-colors inline-flex items-center justify-center gap-2"
    >
      {pending && (
        <span
          className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"
          aria-hidden="true"
        />
      )}
      {pending ? "Ingresando…" : "Ingresar"}
    </button>
  );
}

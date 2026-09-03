"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { User } from "lucide-react";

export function AccountMenu({
  cuentaHref,
  logout,
}: {
  cuentaHref: string;
  logout: () => Promise<void>;
}) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function alClickearAfuera(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    }
    document.addEventListener("mousedown", alClickearAfuera);
    return () => document.removeEventListener("mousedown", alClickearAfuera);
  }, []);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setAbierto((v) => !v)}
        aria-label="Mi cuenta"
        aria-expanded={abierto}
        className="foco inline-flex items-center justify-center w-9 h-9 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
      >
        <User className="w-4 h-4" />
      </button>

      {abierto && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-50">
          <Link
            href={cuentaHref}
            onClick={() => setAbierto(false)}
            className="block px-4 py-2 text-[13px] text-slate-700 hover:bg-slate-50"
          >
            Cambiar contraseña
          </Link>
          <form action={logout}>
            <button className="w-full text-left px-4 py-2 text-[13px] text-rose-700 hover:bg-rose-50">
              Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

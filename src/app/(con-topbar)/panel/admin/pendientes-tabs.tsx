"use client";

import { useState, type ReactNode } from "react";

export type TabPendiente = {
  id: string;
  titulo: string;
  cantidad: number | null; // null = todavía no implementado
  contenido: ReactNode;
};

// Arranca en la primera pestaña que tenga algo pendiente.
export function PendientesTabs({ tabs }: { tabs: TabPendiente[] }) {
  const [activa, setActiva] = useState(() => (tabs.find((t) => (t.cantidad ?? 0) > 0) ?? tabs[0]).id);
  const tab = tabs.find((t) => t.id === activa) ?? tabs[0];

  return (
    <div>
      <div role="tablist" aria-label="Pendientes" className="flex gap-1 border-b border-slate-200 mb-4">
        {tabs.map((t) => {
          const seleccionada = t.id === tab.id;
          return (
            <button
              key={t.id}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={seleccionada}
              aria-controls={`panel-${t.id}`}
              onClick={() => setActiva(t.id)}
              className={`foco -mb-px inline-flex items-center gap-2 whitespace-nowrap px-2.5 sm:px-4 py-2.5 text-[13.5px] sm:text-[14px] font-semibold border-b-2 transition-colors ${
                seleccionada
                  ? "border-blue-600 text-blue-900"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              {t.titulo}
              {t.cantidad !== null && (
                <span
                  className={`tabular rounded-full px-2 py-0.5 text-[11.5px] leading-none ${
                    t.cantidad > 0 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {t.cantidad}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`panel-${tab.id}`} aria-labelledby={`tab-${tab.id}`}>
        {tab.contenido}
      </div>
    </div>
  );
}

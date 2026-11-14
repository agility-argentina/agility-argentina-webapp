"use client";

import { useEffect, useState } from "react";
import { Send, X } from "lucide-react";

export type VacunaPorVencer = {
  duplaId: string;
  perro_nombre: string;
  guia_nombre: string;
  club: string;
  estado: "vencida" | "porvencer";
  fecha_vencimiento: string | null; // "YYYY-MM-DD"
};

// fecha_vencimiento es un `date` de Postgres: se formatea a mano para que
// `new Date()` no lo corra un día por la zona horaria.
function formatearFecha(fecha: string | null) {
  if (!fecha) return "Sin fecha";
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
}

const estados = {
  vencida: { texto: "Vencida", clase: "bg-rose-50 text-rose-800 ring-rose-200" },
  porvencer: { texto: "Por vencer", clase: "bg-amber-50 text-amber-800 ring-amber-200" },
};

export function VacunasPorVencer({ vacunas }: { vacunas: VacunaPorVencer[] }) {
  const [abierto, setAbierto] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    if (!abierto) return;
    const alPresionar = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  }, [abierto]);

  const clubesInvolucrados = new Set(vacunas.map((v) => v.club)).size;

  function cerrar() {
    setAbierto(false);
    setAviso(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="foco block w-full h-full p-6 text-left hover:bg-amber-50/50 transition-colors"
      >
        <p className="text-[13px] text-slate-600">Vacunas por vencer</p>
        <p className="font-display text-[42px] leading-none mt-2 text-amber-600 tabular font-bold">
          {vacunas.length}
        </p>
        <p className="text-[12px] text-blue-700 font-semibold mt-2">Ver detalle</p>
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-blue-950/60" onClick={cerrar} />
          <div className="relative h-full overflow-y-auto p-4 sm:p-6 flex items-start justify-center">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="vacunas-titulo"
              className="w-full max-w-3xl bg-white rounded-lg shadow-xl my-4"
            >
              <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-200">
                <div>
                  <h2 id="vacunas-titulo" className="font-display text-[22px] leading-none text-blue-900 font-semibold">
                    Vacunas por vencer
                  </h2>
                  <p className="text-[13px] text-slate-500 mt-1.5">
                    {vacunas.length} {vacunas.length === 1 ? "perro" : "perros"} de {clubesInvolucrados}{" "}
                    {clubesInvolucrados === 1 ? "club" : "clubes"}
                  </p>
                </div>
                <button onClick={cerrar} className="foco text-slate-400 hover:text-slate-700 p-1" aria-label="Cerrar">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                <button
                  type="button"
                  onClick={() =>
                    setAviso("El envío de recordatorios por mail todavía no está disponible. Lo activamos cuando esté el dominio.")
                  }
                  disabled={vacunas.length === 0}
                  className="foco inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2.5 rounded text-[14px] font-semibold transition-colors"
                >
                  <Send className="w-4 h-4" /> Enviar recordatorio a los clubes involucrados
                </button>

                {aviso && (
                  <div className="flex items-start justify-between gap-3 rounded border px-4 py-3 text-[13.5px] bg-blue-50 border-blue-200 text-blue-800">
                    <span>{aviso}</span>
                    <button onClick={() => setAviso(null)} className="foco shrink-0 text-current/70 hover:text-current">
                      Cerrar
                    </button>
                  </div>
                )}

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[12px] text-slate-600">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Perro</th>
                          <th className="px-4 py-3 font-semibold">Vence</th>
                          <th className="px-4 py-3 font-semibold">Tutor</th>
                          <th className="px-4 py-3 font-semibold">Club</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[13.5px]">
                        {vacunas.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                              No hay vacunas vencidas ni por vencer.
                            </td>
                          </tr>
                        ) : (
                          vacunas.map((v) => (
                            <tr key={v.duplaId}>
                              <td className="px-4 py-3 font-semibold">{v.perro_nombre}</td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="tabular text-slate-700">{formatearFecha(v.fecha_vencimiento)}</span>
                                <span
                                  className={`ml-2 inline-block rounded-full px-2 py-0.5 text-[11.5px] font-semibold ring-1 ring-inset ${estados[v.estado].clase}`}
                                >
                                  {estados[v.estado].texto}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-600">{v.guia_nombre}</td>
                              <td className="px-4 py-3 text-slate-600">{v.club}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

export type ClubDirectorio = {
  id: string;
  nombre: string;
  ciudad: string;
  region: string;
};

export function DirectorioClubes({
  clubes,
  regiones,
}: {
  clubes: ClubDirectorio[];
  regiones: string[];
}) {
  const [regionActiva, setRegionActiva] = useState("todas");
  const visibles = regionActiva === "todas" ? clubes : clubes.filter((c) => c.region === regionActiva);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-[34px] leading-tight text-blue-900 font-semibold">
            Clubes y grupos homologados
          </h2>
          <p className="mt-2 text-[15px] text-slate-600 max-w-[62ch]">
            Entrenan, organizan fechas y validan la documentación de sus duplas. Elegí una región para verlos.
          </p>
        </div>
        <p className="text-[13px] text-slate-500 tabular">
          <span>{visibles.length}</span> de {clubes.length} grupos
        </p>
      </div>

      <div className="mt-7 flex flex-wrap gap-2" role="group" aria-label="Filtrar clubes por región">
        <button
          onClick={() => setRegionActiva("todas")}
          aria-pressed={regionActiva === "todas"}
          className={`foco px-3.5 py-2 rounded-full text-[13px] font-semibold border transition-colors ${
            regionActiva === "todas"
              ? "bg-blue-900 text-white border-blue-900"
              : "bg-white text-slate-700 border-slate-300 hover:border-blue-600 hover:text-blue-900"
          }`}
        >
          Todas
        </button>
        {regiones.map((region) => (
          <button
            key={region}
            onClick={() => setRegionActiva(region)}
            aria-pressed={regionActiva === region}
            className={`foco px-3.5 py-2 rounded-full text-[13px] font-semibold border transition-colors ${
              regionActiva === region
                ? "bg-blue-900 text-white border-blue-900"
                : "bg-white text-slate-700 border-slate-300 hover:border-blue-600 hover:text-blue-900"
            }`}
          >
            {region}
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <p className="mt-8 py-10 text-center text-[14px] text-slate-500">
          Todavía no hay grupos homologados en esta región. Si entrenás ahí, podés iniciar el trámite de
          homologación.
        </p>
      ) : (
        <div className="mt-8 divide-y divide-slate-200 border-t border-slate-200">
          {visibles.map((club) => (
            <article key={club.id} className="py-5 grid sm:grid-cols-[1fr_auto] gap-4 items-start">
              <div>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-[17px] text-blue-900 font-semibold">{club.nombre}</h3>
                  <span className="text-[12px] text-slate-500">{club.region}</span>
                </div>
                <p className="mt-1 text-[13.5px] text-slate-600 inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  {club.ciudad}
                </p>
              </div>
              <div className="sm:text-right">
                <span className="inline-flex items-center gap-1.5 text-[12.5px] text-emerald-700 font-semibold">
                  Homologación activa
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

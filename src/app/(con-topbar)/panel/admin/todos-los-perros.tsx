"use client";

import { useMemo, useState } from "react";
import { Dog } from "lucide-react";
import { useOrden } from "@/lib/use-orden";
import { ThOrdenable } from "@/components/th-ordenable";
import { ordenNreg } from "@/lib/orden-nreg";

export type PerroFila = {
  id: string;
  nreg: string | null;
  club: string;
  region: string;
  perro_nombre: string;
  guia_nombre: string;
  grado: string;
  tamano: string;
  estado: "activa" | "inactiva";
};

const ESTADO_DUPLA = {
  activa: { texto: "Activa", clase: "bg-emerald-50 text-emerald-800 ring-emerald-200" },
  inactiva: { texto: "No activa", clase: "bg-slate-100 text-slate-500 ring-slate-200" },
};

type ColumnaOrden = "nreg" | "club" | "region" | "perro" | "guia" | "categoria" | "estado";

const COLUMNAS: { key: ColumnaOrden; etiqueta: string }[] = [
  { key: "nreg", etiqueta: "Nº Reg." },
  { key: "club", etiqueta: "Club" },
  { key: "region", etiqueta: "Región" },
  { key: "perro", etiqueta: "Perro" },
  { key: "guia", etiqueta: "Guía" },
  { key: "categoria", etiqueta: "Categoría" },
  { key: "estado", etiqueta: "Estado" },
];

function comparar(a: PerroFila, b: PerroFila, columna: ColumnaOrden, asc: boolean) {
  if (columna === "nreg") {
    const an = ordenNreg(a.nreg);
    const bn = ordenNreg(b.nreg);
    if (an === Infinity && bn === Infinity) return 0;
    if (an === Infinity) return 1;
    if (bn === Infinity) return -1;
    return asc ? an - bn : bn - an;
  }

  let valorA: string;
  let valorB: string;
  switch (columna) {
    case "club":
      valorA = a.club;
      valorB = b.club;
      break;
    case "region":
      valorA = a.region;
      valorB = b.region;
      break;
    case "perro":
      valorA = a.perro_nombre;
      valorB = b.perro_nombre;
      break;
    case "guia":
      valorA = a.guia_nombre;
      valorB = b.guia_nombre;
      break;
    case "categoria":
      valorA = `${a.grado} ${a.tamano}`;
      valorB = `${b.grado} ${b.tamano}`;
      break;
    case "estado":
      valorA = ESTADO_DUPLA[a.estado].texto;
      valorB = ESTADO_DUPLA[b.estado].texto;
      break;
  }
  const resultado = valorA.localeCompare(valorB);
  return asc ? resultado : -resultado;
}

export function TodosLosPerros({ perros, regiones }: { perros: PerroFila[]; regiones: string[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroRegion, setFiltroRegion] = useState("todas");
  const [mostrarInactivas, setMostrarInactivas] = useState(false);
  const { orden, ordenarPor } = useOrden<ColumnaOrden>("nreg");

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return perros
      .filter((p) => {
        if (texto && !`${p.perro_nombre} ${p.guia_nombre} ${p.club}`.toLowerCase().includes(texto)) return false;
        if (filtroRegion !== "todas" && p.region !== filtroRegion) return false;
        if (!mostrarInactivas && p.estado !== "activa") return false;
        return true;
      })
      .sort((a, b) => comparar(a, b, orden.columna, orden.asc));
  }, [perros, busqueda, filtroRegion, mostrarInactivas, orden]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display text-[28px] leading-none text-blue-900 font-semibold">Todos los perros</h2>
          <p className="mt-2 text-[13px] text-slate-500">{perros.length} duplas en total, en todos los clubes.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por perro, guía o club…"
          className="foco flex-1 min-w-[200px] border border-slate-300 rounded px-3 py-2 text-[13.5px] text-slate-900 outline-none focus:border-blue-600"
        />
        <select
          value={filtroRegion}
          onChange={(e) => setFiltroRegion(e.target.value)}
          className="foco border border-slate-300 rounded px-3 py-2 text-[13.5px] text-slate-900 bg-white outline-none focus:border-blue-600"
        >
          <option value="todas">Todas las regiones</option>
          {regiones.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <label className="foco inline-flex items-center gap-2 px-3 py-2 text-[13.5px] text-slate-600 cursor-pointer whitespace-nowrap">
          <input
            type="checkbox"
            checked={mostrarInactivas}
            onChange={(e) => setMostrarInactivas(e.target.checked)}
            className="w-4 h-4 accent-blue-600"
          />
          Mostrar inactivas
        </label>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-[12px] text-slate-600">
              <tr>
                {COLUMNAS.map((c) => (
                  <ThOrdenable key={c.key} columna={c.key} etiqueta={c.etiqueta} orden={orden} onClick={ordenarPor} />
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13.5px]">
              {visibles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                    {perros.length === 0 ? "Todavía no hay duplas cargadas." : "Ninguna dupla coincide con el filtro."}
                  </td>
                </tr>
              ) : (
                visibles.map((p) => {
                  const estado = ESTADO_DUPLA[p.estado];
                  return (
                    <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-5 py-2.5 tabular font-semibold">{p.nreg ?? "—"}</td>
                      <td className="px-5 py-2.5">{p.club}</td>
                      <td className="px-5 py-2.5 text-slate-600">{p.region}</td>
                      <td className="px-5 py-2.5">
                        <span className="inline-flex items-center gap-2">
                          <Dog className="w-3.5 h-3.5 text-slate-300" /> {p.perro_nombre}
                        </span>
                      </td>
                      <td className="px-5 py-2.5 text-slate-600">{p.guia_nombre}</td>
                      <td className="px-5 py-2.5 text-slate-600">
                        {p.grado} · {p.tamano}
                      </td>
                      <td className="px-5 py-2.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full ring-1 ${estado.clase} text-[12px] font-semibold`}>
                          {estado.texto}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

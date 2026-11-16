"use client";

import { useMemo, useState } from "react";
import { Dog } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { compararNreg, temaGrilla, textosGrilla } from "@/lib/ag-grid";
import { PerroDetalle } from "./perro-detalle";

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
  // Solo para el detalle ("Ver").
  microchip: string | null;
  guia_dni: string | null;
  guia_email: string | null;
  categoria_nota: string | null;
  created_at: string;
  pedidoEnTramite: boolean;
  libreta: {
    estado: string;
    archivo_path: string | null;
    enviada_en: string | null;
    fecha_aplicacion: string | null;
    fecha_vencimiento: string | null;
    motivo_rechazo: string | null;
  } | null;
};

const ESTADO_DUPLA = {
  activa: { texto: "Activa", clase: "bg-emerald-50 text-emerald-800 ring-emerald-200" },
  inactiva: { texto: "No activa", clase: "bg-slate-100 text-slate-500 ring-slate-200" },
};

export function TodosLosPerros({ perros, regiones }: { perros: PerroFila[]; regiones: string[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroRegion, setFiltroRegion] = useState("todas");
  const [mostrarInactivas, setMostrarInactivas] = useState(false);
  const [viendo, setViendo] = useState<PerroFila | null>(null);

  const visibles = useMemo(
    () =>
      perros.filter((p) => {
        if (filtroRegion !== "todas" && p.region !== filtroRegion) return false;
        if (!mostrarInactivas && p.estado !== "activa") return false;
        return true;
      }),
    [perros, filtroRegion, mostrarInactivas]
  );

  const columnas = useMemo<ColDef<PerroFila>[]>(
    () => [
      {
        field: "nreg",
        headerName: "Nº Reg.",
        width: 110,
        sort: "asc",
        comparator: compararNreg,
        valueFormatter: (p) => p.value ?? "—",
        cellClass: "tabular font-semibold",
        filter: "agNumberColumnFilter",
        filterValueGetter: (p) => (p.data?.nreg ? Number(p.data.nreg) : null),
      },
      { field: "club", headerName: "Club", flex: 1, minWidth: 150 },
      { field: "region", headerName: "Región", width: 150, cellClass: "text-slate-600" },
      {
        field: "perro_nombre",
        headerName: "Perro",
        flex: 1,
        minWidth: 130,
        cellRenderer: (p: ICellRendererParams<PerroFila>) => (
          <span className="inline-flex items-center gap-2">
            <Dog className="w-3.5 h-3.5 text-slate-300" /> {p.value}
          </span>
        ),
      },
      { field: "guia_nombre", headerName: "Guía", flex: 1, minWidth: 150, cellClass: "text-slate-600" },
      {
        colId: "categoria",
        headerName: "Categoría",
        width: 160,
        valueGetter: (p) => (p.data ? `${p.data.grado} · ${p.data.tamano}` : ""),
        cellClass: "text-slate-600",
      },
      {
        field: "estado",
        headerName: "Estado",
        width: 130,
        // El filtro y la búsqueda usan el texto visible ("No activa"), no el valor interno.
        filterValueGetter: (p) => (p.data ? ESTADO_DUPLA[p.data.estado].texto : ""),
        getQuickFilterText: (p) => ESTADO_DUPLA[p.value as PerroFila["estado"]].texto,
        cellRenderer: (p: ICellRendererParams<PerroFila>) => {
          const estado = ESTADO_DUPLA[p.value as PerroFila["estado"]];
          return (
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full ring-1 ${estado.clase} text-[12px] font-semibold leading-none`}
            >
              {estado.texto}
            </span>
          );
        },
      },
      {
        colId: "acciones",
        headerName: "",
        width: 80,
        sortable: false,
        filter: false,
        resizable: false,
        cellClass: "text-right",
        cellRenderer: (p: ICellRendererParams<PerroFila>) => (
          <button
            onClick={() => p.data && setViendo(p.data)}
            className="foco text-[13px] text-blue-700 hover:underline font-semibold"
          >
            Ver
          </button>
        ),
      },
    ],
    []
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
        <div>
          <h2 className="font-display text-[24px] leading-none text-blue-900 font-semibold">Todos los perros</h2>
          <p className="mt-1.5 text-[13px] text-slate-500">{perros.length} duplas en total, en todos los clubes.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-3">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar en todas las columnas…"
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

      <AgGridReact<PerroFila>
        theme={temaGrilla}
        localeText={textosGrilla}
        rowData={visibles}
        columnDefs={columnas}
        defaultColDef={{ sortable: true, resizable: true, filter: true }}
        getRowId={(p) => p.data.id}
        quickFilterText={busqueda}
        domLayout="autoHeight"
        pagination
        paginationPageSize={25}
        paginationPageSizeSelector={[25, 50, 100]}
        overlayNoRowsTemplate={
          perros.length === 0 ? "Todavía no hay duplas cargadas." : "Ninguna dupla coincide con el filtro."
        }
      />

      {viendo && <PerroDetalle perro={viendo} onClose={() => setViendo(null)} />}
    </div>
  );
}

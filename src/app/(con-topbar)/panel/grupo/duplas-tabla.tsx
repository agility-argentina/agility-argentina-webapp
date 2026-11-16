"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { Plus, Dog } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { obtenerUrlLibreta } from "./actions";
import { DuplaModal } from "./dupla-modal";
import { compararNreg, temaGrilla, textosGrilla } from "@/lib/ag-grid";

export type DuplaConLibreta = {
  id: string;
  nreg: string | null;
  microchip: string | null;
  guia_nombre: string;
  perro_nombre: string;
  grado: string;
  tamano: string;
  categoria_nota: string | null;
  estado: "activa" | "inactiva";
  libreta: {
    estado: "aprobado" | "pendiente" | "porvencer" | "vencida" | "sinvalidar";
    archivo_path: string | null;
    fecha_aplicacion: string | null;
    fecha_vencimiento: string | null;
  } | null;
  pedido: {
    estado: "pendiente" | "asignado" | "rechazado";
    pedido_en: string;
    motivo_rechazo: string | null;
  } | null;
};

const LIBRETA: Record<string, { texto: string; clase: string; punto: string }> = {
  aprobado: { texto: "Aprobada", clase: "bg-emerald-50 text-emerald-800 ring-emerald-200", punto: "bg-emerald-500" },
  pendiente: { texto: "Pendiente revisión", clase: "bg-blue-50 text-blue-800 ring-blue-200", punto: "bg-blue-500" },
  porvencer: { texto: "Por vencer", clase: "bg-amber-50 text-amber-800 ring-amber-200", punto: "bg-amber-500" },
  vencida: { texto: "Vencida", clase: "bg-rose-50 text-rose-800 ring-rose-200", punto: "bg-rose-500" },
  sinvalidar: { texto: "Sin validar", clase: "bg-slate-100 text-slate-600 ring-slate-200", punto: "bg-slate-400" },
  sinlibreta: { texto: "Sin comprobante", clase: "bg-slate-100 text-slate-500 ring-slate-200", punto: "bg-slate-300" },
};

const ESTADO_DUPLA = {
  activa: { texto: "Activa", clase: "bg-emerald-50 text-emerald-800 ring-emerald-200" },
  inactiva: { texto: "No activa", clase: "bg-slate-100 text-slate-500 ring-slate-200" },
};

const textoLibreta = (d: DuplaConLibreta) => LIBRETA[d.libreta?.estado ?? "sinlibreta"].texto;

// Las celdas de AG Grid se renderizan dentro del árbol de React, así que leen
// las acciones y el estado de carga por contexto; las columnas no se rearman.
type Acciones = {
  verLibreta: (d: DuplaConLibreta) => void;
  editar: (d: DuplaConLibreta) => void;
  avisar: (texto: string) => void;
  cargandoLibreta: string | null;
};
const AccionesContext = createContext<Acciones | null>(null);

function CeldaNreg({ data: d }: ICellRendererParams<DuplaConLibreta>) {
  const acciones = useContext(AccionesContext)!;
  if (!d) return null;
  return (
    <div className="leading-tight py-2">
      <span className="tabular font-semibold">{d.nreg ?? "—"}</span>
      {!d.nreg && d.pedido?.estado === "pendiente" && (
        <span className="block text-[11.5px] font-semibold text-blue-700 mt-0.5">En trámite</span>
      )}
      {!d.nreg && d.pedido?.estado === "rechazado" && (
        <button
          type="button"
          onClick={() =>
            acciones.avisar(
              `La comisión rechazó el pedido de ${d.perro_nombre}: ${d.pedido?.motivo_rechazo ?? "sin motivo"}. Cuando esté resuelto, volvé a pedirlo desde Editar eligiendo G1.`
            )
          }
          className="foco block text-[11.5px] font-semibold text-rose-700 hover:underline mt-0.5"
        >
          Pedido rechazado
        </button>
      )}
    </div>
  );
}

function CeldaCategoria({ data: d }: ICellRendererParams<DuplaConLibreta>) {
  if (!d) return null;
  return (
    <div className="leading-tight py-2 text-slate-600">
      {d.grado} · {d.tamano}
      {d.categoria_nota && (
        <span className="block text-[11.5px] text-slate-400 italic mt-0.5 whitespace-normal">{d.categoria_nota}</span>
      )}
    </div>
  );
}

function CeldaAcciones({ data: d }: ICellRendererParams<DuplaConLibreta>) {
  const a = useContext(AccionesContext)!;
  if (!d) return null;
  return (
    <span className="whitespace-nowrap">
      <button
        onClick={() => a.verLibreta(d)}
        disabled={a.cargandoLibreta === d.id}
        className="foco text-[13px] text-blue-700 hover:underline font-semibold disabled:opacity-50"
      >
        {a.cargandoLibreta === d.id ? "Abriendo…" : "Ver libreta"}
      </button>
      <span className="text-slate-300 mx-1.5">·</span>
      <button onClick={() => a.editar(d)} className="foco text-[13px] text-slate-600 hover:underline font-semibold">
        Editar
      </button>
    </span>
  );
}

const COLUMNAS: ColDef<DuplaConLibreta>[] = [
  {
    field: "nreg",
    headerName: "Nº Reg.",
    width: 130,
    sort: "asc",
    comparator: compararNreg,
    autoHeight: true,
    filter: "agNumberColumnFilter",
    filterValueGetter: (p) => (p.data?.nreg ? Number(p.data.nreg) : null),
    cellRenderer: CeldaNreg,
  },
  {
    colId: "categoria",
    headerName: "Categoría",
    width: 190,
    autoHeight: true,
    valueGetter: (p) => (p.data ? `${p.data.grado} · ${p.data.tamano}` : ""),
    cellRenderer: CeldaCategoria,
  },
  {
    field: "perro_nombre",
    headerName: "Perro",
    flex: 1,
    minWidth: 130,
    cellRenderer: (p: ICellRendererParams<DuplaConLibreta>) => (
      <span className="inline-flex items-center gap-2">
        <Dog className="w-3.5 h-3.5 text-slate-300" /> {p.value}
      </span>
    ),
  },
  { field: "guia_nombre", headerName: "Guía", flex: 1, minWidth: 150, cellClass: "font-semibold" },
  {
    colId: "libreta",
    headerName: "Libreta sanitaria",
    width: 180,
    valueGetter: (p) => (p.data ? textoLibreta(p.data) : ""),
    cellRenderer: (p: ICellRendererParams<DuplaConLibreta>) => {
      const libreta = LIBRETA[p.data?.libreta?.estado ?? "sinlibreta"];
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ring-1 ${libreta.clase} text-[12px] font-semibold leading-none`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${libreta.punto}`} />
          {libreta.texto}
        </span>
      );
    },
  },
  {
    colId: "estado",
    headerName: "Estado",
    width: 120,
    valueGetter: (p) => (p.data ? ESTADO_DUPLA[p.data.estado].texto : ""),
    cellRenderer: (p: ICellRendererParams<DuplaConLibreta>) => {
      if (!p.data) return null;
      const estado = ESTADO_DUPLA[p.data.estado];
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full ring-1 ${estado.clase} text-[12px] font-semibold leading-none`}>
          {estado.texto}
        </span>
      );
    },
  },
  {
    colId: "acciones",
    headerName: "Acciones",
    width: 190,
    sortable: false,
    filter: false,
    resizable: false,
    headerClass: "ag-right-aligned-header",
    cellClass: "text-right",
    cellRenderer: CeldaAcciones,
  },
];

export function DuplasTabla({ duplas }: { duplas: DuplaConLibreta[] }) {
  const [modal, setModal] = useState<"cerrado" | "nueva" | DuplaConLibreta>("cerrado");
  const [cargandoLibreta, setCargandoLibreta] = useState<string | null>(null);
  const [aviso, setAviso] = useState<{ texto: string; tipo: "error" | "info" } | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [mostrarInactivas, setMostrarInactivas] = useState(false);
  const [filtroLibreta, setFiltroLibreta] = useState<"todas" | keyof typeof LIBRETA>("todas");

  const activas = duplas.filter((d) => d.estado === "activa").length;
  const aResolver = duplas.filter((d) => d.libreta?.estado === "porvencer" || d.libreta?.estado === "vencida").length;

  const visibles = useMemo(
    () =>
      duplas.filter((d) => {
        if (!mostrarInactivas && d.estado !== "activa") return false;
        if (filtroLibreta !== "todas" && (d.libreta?.estado ?? "sinlibreta") !== filtroLibreta) return false;
        return true;
      }),
    [duplas, mostrarInactivas, filtroLibreta]
  );

  async function verLibreta(d: DuplaConLibreta) {
    if (!d.libreta?.archivo_path) {
      setAviso({ texto: `${d.perro_nombre} todavía no tiene un comprobante cargado.`, tipo: "info" });
      return;
    }
    setCargandoLibreta(d.id);
    const resultado = await obtenerUrlLibreta(d.libreta.archivo_path);
    setCargandoLibreta(null);
    if (resultado.error) {
      setAviso({ texto: resultado.error, tipo: "error" });
      return;
    }
    window.open(resultado.url, "_blank", "noopener,noreferrer");
  }

  const acciones: Acciones = {
    verLibreta,
    editar: (d) => setModal(d),
    avisar: (texto) => setAviso({ texto, tipo: "error" }),
    cargandoLibreta,
  };

  return (
    <div>
      {aviso && (
        <div
          className={`mb-5 flex items-start justify-between gap-3 rounded border px-4 py-3 text-[13.5px] ${
            aviso.tipo === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          <span>{aviso.texto}</span>
          <button onClick={() => setAviso(null)} className="foco shrink-0 text-current/70 hover:text-current">
            Cerrar
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-[13.5px]">
          <p className="text-slate-600">
            Duplas del grupo: <span className="text-ink tabular font-semibold">{duplas.length}</span>
          </p>
          <p className="text-slate-600">
            Duplas activas: <span className="text-emerald-700 tabular font-semibold">{activas}</span>
          </p>
          <p className="text-slate-600">
            Libretas a resolver: <span className="text-amber-700 tabular font-semibold">{aResolver}</span>
          </p>
        </div>
        <button
          onClick={() => setModal("nueva")}
          className="foco inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4.5 py-2.5 rounded text-[14px] font-semibold transition-colors self-start"
        >
          <Plus className="w-4 h-4" /> Nueva dupla
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-3">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar en todas las columnas…"
          className="foco flex-1 min-w-[200px] border border-slate-300 rounded px-3 py-2 text-[13.5px] text-slate-900 outline-none focus:border-blue-600"
        />
        <label className="foco inline-flex items-center gap-2 px-3 py-2 text-[13.5px] text-slate-700 cursor-pointer whitespace-nowrap">
          <input
            type="checkbox"
            checked={mostrarInactivas}
            onChange={(e) => setMostrarInactivas(e.target.checked)}
            className="w-4 h-4 accent-blue-600"
          />
          Mostrar inactivas
        </label>
        <select
          value={filtroLibreta}
          onChange={(e) => setFiltroLibreta(e.target.value as typeof filtroLibreta)}
          className="foco border border-slate-300 rounded px-3 py-2 text-[13.5px] text-slate-900 bg-white outline-none focus:border-blue-600"
        >
          <option value="todas">Todas las libretas</option>
          {Object.entries(LIBRETA).map(([key, v]) => (
            <option key={key} value={key}>
              {v.texto}
            </option>
          ))}
        </select>
      </div>

      <AccionesContext.Provider value={acciones}>
        <AgGridReact<DuplaConLibreta>
          theme={temaGrilla}
          localeText={textosGrilla}
          rowData={visibles}
          columnDefs={COLUMNAS}
          defaultColDef={{ sortable: true, resizable: true, filter: true }}
          getRowId={(p) => p.data.id}
          quickFilterText={busqueda}
          domLayout="autoHeight"
          pagination
          paginationPageSize={25}
          paginationPageSizeSelector={[25, 50, 100]}
          overlayNoRowsTemplate={
            duplas.length === 0
              ? "Todavía no hay duplas cargadas. Registrá la primera con el botón de arriba."
              : "Ninguna dupla coincide con el filtro."
          }
        />
      </AccionesContext.Provider>

      <p className="mt-4 text-[12.5px] text-slate-500">
        Las duplas con libreta vencida no pueden inscribirse a competencias hasta subir el comprobante actualizado.
      </p>

      {modal !== "cerrado" && (
        <DuplaModal dupla={modal === "nueva" ? null : modal} onClose={() => setModal("cerrado")} />
      )}
    </div>
  );
}

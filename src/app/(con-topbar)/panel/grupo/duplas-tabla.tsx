"use client";

import { useMemo, useState } from "react";
import { Plus, Dog } from "lucide-react";
import { obtenerUrlLibreta } from "./actions";
import { DuplaModal } from "./dupla-modal";
import { useOrden } from "@/lib/use-orden";
import { ThOrdenable } from "@/components/th-ordenable";
import { ordenNreg } from "@/lib/orden-nreg";

export type DuplaConLibreta = {
  id: string;
  nreg: string | null;
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

type ColumnaOrden = "nreg" | "categoria" | "perro" | "guia" | "libreta" | "estado";

const COLUMNAS: { key: ColumnaOrden; etiqueta: string }[] = [
  { key: "nreg", etiqueta: "Nº Reg." },
  { key: "categoria", etiqueta: "Categoría" },
  { key: "perro", etiqueta: "Perro" },
  { key: "guia", etiqueta: "Guía" },
  { key: "libreta", etiqueta: "Libreta sanitaria" },
  { key: "estado", etiqueta: "Estado" },
];

function comparar(a: DuplaConLibreta, b: DuplaConLibreta, columna: ColumnaOrden, asc: boolean) {
  if (columna === "nreg") {
    const an = ordenNreg(a.nreg);
    const bn = ordenNreg(b.nreg);
    if (an === Infinity && bn === Infinity) return 0;
    if (an === Infinity) return 1; // los sin número siempre al final
    if (bn === Infinity) return -1;
    return asc ? an - bn : bn - an;
  }

  let valorA: string;
  let valorB: string;
  switch (columna) {
    case "categoria":
      valorA = `${a.grado} ${a.tamano}`;
      valorB = `${b.grado} ${b.tamano}`;
      break;
    case "perro":
      valorA = a.perro_nombre;
      valorB = b.perro_nombre;
      break;
    case "guia":
      valorA = a.guia_nombre;
      valorB = b.guia_nombre;
      break;
    case "libreta":
      valorA = LIBRETA[a.libreta?.estado ?? "sinlibreta"].texto;
      valorB = LIBRETA[b.libreta?.estado ?? "sinlibreta"].texto;
      break;
    case "estado":
      valorA = ESTADO_DUPLA[a.estado].texto;
      valorB = ESTADO_DUPLA[b.estado].texto;
      break;
  }
  const resultado = valorA.localeCompare(valorB);
  return asc ? resultado : -resultado;
}

export function DuplasTabla({ duplas }: { duplas: DuplaConLibreta[] }) {
  const [modal, setModal] = useState<"cerrado" | "nueva" | DuplaConLibreta>("cerrado");
  const [cargandoLibreta, setCargandoLibreta] = useState<string | null>(null);
  const [aviso, setAviso] = useState<{ texto: string; tipo: "error" | "info" } | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [mostrarInactivas, setMostrarInactivas] = useState(false);
  const [filtroLibreta, setFiltroLibreta] = useState<"todas" | keyof typeof LIBRETA>("todas");
  const { orden, ordenarPor } = useOrden<ColumnaOrden>("nreg");

  const activas = duplas.filter((d) => d.estado === "activa").length;
  const aResolver = duplas.filter((d) => d.libreta?.estado === "porvencer" || d.libreta?.estado === "vencida").length;

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return duplas
      .filter((d) => {
        if (texto && !`${d.perro_nombre} ${d.guia_nombre}`.toLowerCase().includes(texto)) return false;
        if (!mostrarInactivas && d.estado !== "activa") return false;
        if (filtroLibreta !== "todas" && (d.libreta?.estado ?? "sinlibreta") !== filtroLibreta) return false;
        return true;
      })
      .sort((a, b) => comparar(a, b, orden.columna, orden.asc));
  }, [duplas, busqueda, mostrarInactivas, filtroLibreta, orden]);

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

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
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

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por perro o guía…"
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

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-[12px] text-slate-600">
              <tr>
                {COLUMNAS.map((c) => (
                  <ThOrdenable key={c.key} columna={c.key} etiqueta={c.etiqueta} orden={orden} onClick={ordenarPor} />
                ))}
                <th className="px-5 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13.5px]">
              {visibles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                    {duplas.length === 0
                      ? "Todavía no hay duplas cargadas. Registrá la primera con el botón de arriba."
                      : "Ninguna dupla coincide con el filtro."}
                  </td>
                </tr>
              ) : (
                visibles.map((d) => {
                  const libretaKey = d.libreta?.estado ?? "sinlibreta";
                  const libreta = LIBRETA[libretaKey];
                  const estado = ESTADO_DUPLA[d.estado];
                  return (
                    <tr key={d.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-5 py-3.5 tabular font-semibold">{d.nreg ?? "—"}</td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {d.grado} · {d.tamano}
                        {d.categoria_nota && (
                          <span className="block text-[11.5px] text-slate-400 italic mt-0.5">{d.categoria_nota}</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-2">
                          <Dog className="w-3.5 h-3.5 text-slate-300" /> {d.perro_nombre}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold">{d.guia_nombre}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ring-1 ${libreta.clase} text-[12px] font-semibold`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${libreta.punto}`} />
                          {libreta.texto}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full ring-1 ${estado.clase} text-[12px] font-semibold`}>
                          {estado.texto}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => verLibreta(d)}
                          disabled={cargandoLibreta === d.id}
                          className="foco text-[13px] text-blue-700 hover:underline font-semibold disabled:opacity-50"
                        >
                          {cargandoLibreta === d.id ? "Abriendo…" : "Ver libreta"}
                        </button>
                        <span className="text-slate-300 mx-1.5">·</span>
                        <button
                          onClick={() => setModal(d)}
                          className="foco text-[13px] text-slate-600 hover:underline font-semibold"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 text-[12.5px] text-slate-500">
        Las duplas con libreta vencida no pueden inscribirse a competencias hasta subir el comprobante actualizado.
      </p>

      {modal !== "cerrado" && (
        <DuplaModal dupla={modal === "nueva" ? null : modal} onClose={() => setModal("cerrado")} />
      )}
    </div>
  );
}

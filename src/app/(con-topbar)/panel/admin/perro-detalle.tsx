"use client";

import { useEffect, useState } from "react";
import { FileText, X } from "lucide-react";
import { obtenerUrlLibreta } from "@/app/(con-topbar)/panel/grupo/actions";
import type { PerroFila } from "./todos-los-perros";

const LIBRETA: Record<string, { texto: string; clase: string }> = {
  aprobado: { texto: "Aprobada", clase: "bg-emerald-50 text-emerald-800 ring-emerald-200" },
  pendiente: { texto: "Pendiente revisión", clase: "bg-blue-50 text-blue-800 ring-blue-200" },
  porvencer: { texto: "Por vencer", clase: "bg-amber-50 text-amber-800 ring-amber-200" },
  vencida: { texto: "Vencida", clase: "bg-rose-50 text-rose-800 ring-rose-200" },
  sinvalidar: { texto: "Sin validar", clase: "bg-slate-100 text-slate-600 ring-slate-200" },
  sinlibreta: { texto: "Sin comprobante", clase: "bg-slate-100 text-slate-500 ring-slate-200" },
};

// Las columnas `date` vienen como "YYYY-MM-DD"; los timestamps, en ISO completo.
function formatearFecha(valor: string | null) {
  if (!valor) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const [anio, mes, dia] = valor.split("-");
    return `${dia}/${mes}/${anio}`;
  }
  return new Date(valor).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[12px] text-slate-500">{etiqueta}</dt>
      <dd className="text-[14px] text-slate-900 mt-0.5 break-words">{valor ?? "—"}</dd>
    </div>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[12px] font-semibold uppercase tracking-wide text-slate-400 mb-3">{titulo}</h3>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4">{children}</dl>
    </section>
  );
}

export function PerroDetalle({ perro, onClose }: { perro: PerroFila; onClose: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [abriendo, setAbriendo] = useState(false);

  useEffect(() => {
    const alPresionar = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", alPresionar);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", alPresionar);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function verLibreta() {
    if (!perro.libreta?.archivo_path) return;
    setAbriendo(true);
    const resultado = await obtenerUrlLibreta(perro.libreta.archivo_path);
    setAbriendo(false);
    if (resultado.error) {
      setError(resultado.error);
      return;
    }
    window.open(resultado.url, "_blank", "noopener,noreferrer");
  }

  const libreta = LIBRETA[perro.libreta?.estado ?? "sinlibreta"];

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-blue-950/60" onClick={onClose} />
      <div className="relative h-full overflow-y-auto p-4 sm:p-6 flex items-start justify-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="perro-titulo"
          className="w-full max-w-lg bg-white rounded-lg shadow-xl my-4"
        >
          <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-200">
            <div>
              <h2 id="perro-titulo" className="font-display text-[24px] leading-none text-blue-900 font-semibold">
                {perro.perro_nombre}
              </h2>
              <p className="mt-2 text-[13px] text-slate-600">
                {perro.nreg ? `Nº de registro ${perro.nreg}` : "Sin número de registro"}
                {perro.pedidoEnTramite && " · pedido de número en trámite"}
              </p>
            </div>
            <button onClick={onClose} className="foco text-slate-400 hover:text-slate-700 p-1" aria-label="Cerrar">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-6 py-6 space-y-7">
            {error && (
              <p className="text-[13px] text-rose-700 bg-rose-50 border border-rose-200 rounded px-3 py-2">{error}</p>
            )}

            <Seccion titulo="Perro">
              <Dato etiqueta="Categoría" valor={`${perro.grado} · ${perro.tamano}`} />
              <Dato etiqueta="Microchip" valor={<span className="tabular">{perro.microchip ?? "—"}</span>} />
              <Dato etiqueta="Estado" valor={perro.estado === "activa" ? "Activa" : "No activa"} />
              <Dato etiqueta="Alta en el registro" valor={formatearFecha(perro.created_at)} />
              {perro.categoria_nota && (
                <div className="col-span-2">
                  <Dato etiqueta="Nota de categoría" valor={perro.categoria_nota} />
                </div>
              )}
            </Seccion>

            <Seccion titulo="Guía">
              <Dato etiqueta="Nombre" valor={perro.guia_nombre} />
              <Dato etiqueta="DNI" valor={perro.guia_dni} />
              <div className="col-span-2">
                <Dato
                  etiqueta="Email"
                  valor={
                    perro.guia_email ? (
                      <a href={`mailto:${perro.guia_email}`} className="text-blue-700 hover:underline">
                        {perro.guia_email}
                      </a>
                    ) : null
                  }
                />
              </div>
            </Seccion>

            <Seccion titulo="Club">
              <Dato etiqueta="Club" valor={perro.club} />
              <Dato etiqueta="Región" valor={perro.region} />
            </Seccion>

            <Seccion titulo="Libreta sanitaria">
              <Dato
                etiqueta="Estado"
                valor={
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full ring-1 ${libreta.clase} text-[12px] font-semibold`}
                  >
                    {libreta.texto}
                  </span>
                }
              />
              <Dato etiqueta="Enviada" valor={formatearFecha(perro.libreta?.enviada_en ?? null)} />
              <Dato etiqueta="Antirrábica aplicada" valor={formatearFecha(perro.libreta?.fecha_aplicacion ?? null)} />
              <Dato etiqueta="Vence" valor={formatearFecha(perro.libreta?.fecha_vencimiento ?? null)} />
              {perro.libreta?.motivo_rechazo && (
                <div className="col-span-2">
                  <Dato etiqueta="Motivo del rechazo" valor={perro.libreta.motivo_rechazo} />
                </div>
              )}
              {perro.libreta?.archivo_path && (
                <div className="col-span-2">
                  <button
                    onClick={verLibreta}
                    disabled={abriendo}
                    className="foco inline-flex items-center gap-1.5 text-[13.5px] text-blue-700 hover:underline font-semibold disabled:opacity-50"
                  >
                    <FileText className="w-3.5 h-3.5" /> {abriendo ? "Abriendo…" : "Ver comprobante"}
                  </button>
                </div>
              )}
            </Seccion>
          </div>
        </div>
      </div>
    </div>
  );
}

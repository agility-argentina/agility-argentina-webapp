"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, X } from "lucide-react";
import { guardarDupla } from "./actions";
import type { DuplaConLibreta } from "./duplas-tabla";

type EstadoAccion = { error?: string; success?: boolean };

const estadoInicial: EstadoAccion = {};

export function DuplaModal({
  dupla,
  onClose,
}: {
  dupla: DuplaConLibreta | null; // null = alta nueva
  onClose: () => void;
}) {
  const router = useRouter();
  const [nombreArchivo, setNombreArchivo] = useState<string | null>(null);
  const [fechaVencimiento, setFechaVencimiento] = useState(dupla?.libreta?.fecha_vencimiento ?? "");
  const formRef = useRef<HTMLFormElement>(null);

  function alCambiarFechaAplicacion(e: React.ChangeEvent<HTMLInputElement>) {
    const aplicacion = e.target.value;
    if (!aplicacion) return;
    const fecha = new Date(aplicacion);
    fecha.setUTCFullYear(fecha.getUTCFullYear() + 1);
    setFechaVencimiento(fecha.toISOString().slice(0, 10));
  }

  const [estado, formAction, pendiente] = useActionState(async (_prev: EstadoAccion, formData: FormData) => {
    const resultado = await guardarDupla(formData);
    if (resultado.success) {
      router.refresh();
      onClose();
    }
    return resultado;
  }, estadoInicial);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const editando = dupla !== null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-blue-950/60" onClick={onClose} />
      <div className="relative h-full overflow-y-auto p-4 sm:p-6 flex items-start justify-center">
        <div role="dialog" aria-modal="true" className="w-full max-w-lg bg-white rounded-lg shadow-xl my-4">
          <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-200">
            <div>
              <h2 className="font-display text-[24px] leading-none text-blue-900 font-semibold">
                {editando ? `Editar ${dupla.perro_nombre}` : "Registrar una nueva dupla"}
              </h2>
              <p className="mt-2 text-[13px] text-slate-600">
                {editando
                  ? dupla.nreg
                    ? `Nº de registro ${dupla.nreg} · si subís una libreta nueva, vuelve a quedar pendiente de revisión.`
                    : "Sin número de registro (categoría G0)."
                  : "Queda pendiente hasta que administración valide la libreta sanitaria."}
              </p>
            </div>
            <button onClick={onClose} className="foco text-slate-400 hover:text-slate-700 p-1" aria-label="Cerrar">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form ref={formRef} action={formAction} className="px-6 py-6 space-y-5">
            {editando && <input type="hidden" name="dupla_id" value={dupla.id} />}

            {estado.error && (
              <p className="text-[13px] text-rose-700 bg-rose-50 border border-rose-200 rounded px-3 py-2">
                {estado.error}
              </p>
            )}

            <label className="block">
              <span className="block text-[13px] mb-1.5 font-medium">Nombre y apellido del guía</span>
              <input
                name="guia_nombre"
                type="text"
                required
                defaultValue={dupla?.guia_nombre ?? ""}
                placeholder="Ej.: Martina Ferreyra"
                className="foco w-full border border-slate-300 rounded px-3 py-2.5 text-[14px] text-slate-900 outline-none focus:border-blue-600"
              />
            </label>

            <div className="grid sm:grid-cols-3 gap-4">
              <label className="block sm:col-span-1">
                <span className="block text-[13px] mb-1.5 font-medium">Nombre del perro</span>
                <input
                  name="perro_nombre"
                  type="text"
                  required
                  defaultValue={dupla?.perro_nombre ?? ""}
                  placeholder="Ej.: Tango"
                  className="foco w-full border border-slate-300 rounded px-3 py-2.5 text-[14px] text-slate-900 outline-none focus:border-blue-600"
                />
              </label>
              <label className="block">
                <span className="block text-[13px] mb-1.5 font-medium">Grado</span>
                <select
                  name="grado"
                  defaultValue={dupla?.grado ?? "G2"}
                  className="foco w-full border border-slate-300 rounded px-3 py-2.5 text-[14px] text-slate-900 bg-white outline-none focus:border-blue-600"
                >
                  <option>G0</option>
                  <option>G1</option>
                  <option>G2</option>
                  <option>G3</option>
                </select>
              </label>
              <label className="block">
                <span className="block text-[13px] mb-1.5 font-medium">Tamaño</span>
                <select
                  name="tamano"
                  defaultValue={dupla?.tamano ?? "Intermediate"}
                  className="foco w-full border border-slate-300 rounded px-3 py-2.5 text-[14px] text-slate-900 bg-white outline-none focus:border-blue-600"
                >
                  <option>XSmall</option>
                  <option>Small</option>
                  <option>Midi</option>
                  <option>Intermediate</option>
                  <option>Large</option>
                </select>
              </label>
            </div>

            <div>
              <span className="block text-[13px] mb-1.5 font-medium">Libreta sanitaria</span>
              <input
                type="file"
                name="archivo"
                id="archivo"
                accept="image/*,.pdf"
                className="sr-only"
                onChange={(e) => setNombreArchivo(e.target.files?.[0]?.name ?? null)}
              />
              <label
                htmlFor="archivo"
                className="foco flex items-center gap-3 border border-dashed border-slate-400 rounded px-4 py-5 cursor-pointer hover:border-blue-600 hover:bg-blue-50/40 transition-colors"
              >
                <Camera className="w-5 h-5 text-blue-600 shrink-0" />
                <span>
                  <span className="block text-[13.5px] font-semibold">
                    {editando ? "Actualizar foto o PDF de la libreta" : "Subir foto o PDF de la libreta"}
                  </span>
                  <span className="block text-[12.5px] text-slate-500 mt-0.5">
                    {nombreArchivo ??
                      (editando
                        ? "Dejalo vacío si no vas a reemplazar el comprobante actual."
                        : "Se ve la página de la antirrábica, con sello y firma del veterinario.")}
                  </span>
                </span>
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-[13px] mb-1.5 font-medium">Antirrábica aplicada el</span>
                <input
                  name="fecha_aplicacion"
                  type="date"
                  defaultValue={dupla?.libreta?.fecha_aplicacion ?? ""}
                  onChange={alCambiarFechaAplicacion}
                  className="foco w-full border border-slate-300 rounded px-3 py-2.5 text-[14px] text-slate-900 tabular outline-none focus:border-blue-600"
                />
              </label>
              <label className="block">
                <span className="block text-[13px] mb-1.5 font-medium">Vence el</span>
                <input
                  name="fecha_vencimiento"
                  type="date"
                  value={fechaVencimiento}
                  onChange={(e) => setFechaVencimiento(e.target.value)}
                  className="foco w-full border border-slate-300 rounded px-3 py-2.5 text-[14px] text-slate-900 tabular outline-none focus:border-blue-600"
                />
                <span className="block text-[11.5px] text-slate-400 mt-1">Se autocompleta a un año, se puede ajustar.</span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row-reverse gap-3 pt-3 border-t border-slate-200">
              <button
                type="submit"
                disabled={pendiente}
                className="foco bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2.5 rounded text-[14px] font-semibold transition-colors"
              >
                {pendiente ? "Guardando…" : editando ? "Guardar cambios" : "Registrar dupla"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="foco px-5 py-2.5 rounded text-[14px] font-semibold border border-slate-300 bg-white hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

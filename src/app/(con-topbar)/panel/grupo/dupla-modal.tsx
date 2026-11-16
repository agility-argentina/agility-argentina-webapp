"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, X } from "lucide-react";
import { guardarDupla } from "./actions";
import type { DuplaConLibreta } from "./duplas-tabla";
import { FechaInput } from "@/components/fecha-input";

type EstadoAccion = { error?: string; success?: boolean; guardado?: boolean };

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
  const [fechaAplicacion, setFechaAplicacion] = useState(dupla?.libreta?.fecha_aplicacion ?? "");
  const [fechaVencimiento, setFechaVencimiento] = useState(dupla?.libreta?.fecha_vencimiento ?? "");
  const [grado, setGrado] = useState(dupla?.grado ?? "G2");
  const esG0 = grado === "G0";
  // Al editar, un perro con número se mueve entre G1–G3. Uno en G0 puede elegir
  // G1: se guarda como G0 y se le pide el número a la comisión, que es quien
  // lo pasa a G1. Si ya hay un pedido en trámite, queda fijo en G0.
  const numeroEnTramite = dupla?.pedido?.estado === "pendiente";
  const gradosPermitidos =
    dupla === null ? ["G0", "G1", "G2", "G3"] : dupla.nreg ? ["G1", "G2", "G3"] : numeroEnTramite ? ["G0"] : ["G0", "G1"];
  const pidiendoNumero = dupla !== null && !dupla.nreg && grado === "G1";
  // Lo que impide pedir el número y no se resuelve en este formulario. El
  // microchip no está acá porque el campo ya es obligatorio al elegir G1, y
  // la libreta no es requisito: tiene su propio circuito de revisión.
  const faltaParaPedir: string[] = [];
  if (pidiendoNumero && dupla.estado !== "activa") faltaParaPedir.push("La dupla tiene que estar activa.");
  const formRef = useRef<HTMLFormElement>(null);
  // El botón de guardar queda deshabilitado mientras falte algún campo
  // obligatorio. Se usa la validación nativa de los inputs (required/pattern),
  // así la regla vive en un solo lugar: el propio campo.
  const [completo, setCompleto] = useState(false);
  // Después de un render, para leer los `required` ya actualizados (cambian con el grado).
  const revisarCompleto = () =>
    requestAnimationFrame(() => setCompleto(formRef.current?.checkValidity() ?? false));

  function alCambiarFechaAplicacion(iso: string) {
    setFechaAplicacion(iso);
    if (!iso) return;
    const fecha = new Date(iso);
    fecha.setUTCFullYear(fecha.getUTCFullYear() + 1);
    setFechaVencimiento(fecha.toISOString().slice(0, 10));
  }

  const [estado, formAction, pendiente] = useActionState(async (_prev: EstadoAccion, formData: FormData) => {
    const resultado = await guardarDupla(formData);
    // Si se guardó pero falló el pedido de número, se refresca igual y el
    // modal queda abierto mostrando por qué.
    if (resultado.guardado) router.refresh();
    if (resultado.success) {
      router.refresh();
      onClose();
    }
    return resultado;
  }, estadoInicial);

  useEffect(() => {
    revisarCompleto();
  }, []);

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

          <form ref={formRef} action={formAction} onInput={revisarCompleto} className="px-6 py-6 space-y-5">
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
                pattern=".*\S.*"
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
                  pattern=".*\S.*"
                  defaultValue={dupla?.perro_nombre ?? ""}
                  placeholder="Ej.: Tango"
                  className="foco w-full border border-slate-300 rounded px-3 py-2.5 text-[14px] text-slate-900 outline-none focus:border-blue-600"
                />
              </label>
              <label className="block">
                <span className="block text-[13px] mb-1.5 font-medium">Grado</span>
                {gradosPermitidos.length === 1 ? (
                  // G0 con el pedido de número en trámite.
                  <>
                    <input type="hidden" name="grado" value={grado} />
                    <p className="w-full border border-slate-200 bg-slate-50 rounded px-3 py-2.5 text-[14px] text-slate-500">
                      {grado}
                    </p>
                    <span className="block text-[11.5px] text-slate-400 mt-1">Nº de registro en trámite.</span>
                  </>
                ) : (
                  <select
                    name="grado"
                    value={grado}
                    onChange={(e) => {
                      setGrado(e.target.value);
                      revisarCompleto();
                    }}
                    className="foco w-full border border-slate-300 rounded px-3 py-2.5 text-[14px] text-slate-900 bg-white outline-none focus:border-blue-600"
                  >
                    {gradosPermitidos.map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>
                )}
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

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <span className="block text-[13px] mb-1.5 font-medium">Nº de registro del perro</span>
                {pidiendoNumero && <input type="hidden" name="pedir_numero" value="1" />}
                {editando || esG0 ? (
                  <>
                    <p className="w-full border border-slate-200 bg-slate-50 rounded px-3 py-2.5 text-[14px] text-slate-500 tabular">
                      {dupla?.nreg ?? "Sin número"}
                    </p>
                    <span className="block text-[11.5px] text-slate-400 mt-1">
                      {dupla?.nreg
                        ? "Lo administra la comisión."
                        : numeroEnTramite
                          ? "Pedido a la comisión, en trámite."
                          : pidiendoNumero
                            ? "Se lo pedimos a la comisión al guardar. Sigue en G0 hasta que lo asignen."
                            : "Para pasar a G1, elegí G1 en Grado."}
                    </span>
                  </>
                ) : (
                  <>
                    <input
                      name="nreg"
                      type="text"
                      inputMode="numeric"
                      required
                      pattern=".*\S.*"
                      placeholder="Ej.: 1013"
                      className="foco w-full border border-slate-300 rounded px-3 py-2.5 text-[14px] text-slate-900 outline-none focus:border-blue-600"
                    />
                    <span className="block text-[11.5px] text-slate-400 mt-1">
                      El que ya tiene asignado. Después solo lo puede cambiar la comisión.
                    </span>
                  </>
                )}
              </div>
              <label className="block">
                <span className="block text-[13px] mb-1.5 font-medium">
                  Microchip
                  {esG0 && <span className="font-normal text-slate-400"> (opcional en G0)</span>}
                </span>
                <input
                  name="microchip"
                  type="text"
                  inputMode="numeric"
                  required={!esG0}
                  pattern=".*\S.*"
                  title="Escribí el número de microchip"
                  defaultValue={dupla?.microchip ?? ""}
                  placeholder="Ej.: 032000123456789"
                  className="foco w-full border border-slate-300 rounded px-3 py-2.5 text-[14px] text-slate-900 outline-none focus:border-blue-600"
                />
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
                <FechaInput name="fecha_aplicacion" value={fechaAplicacion} onChange={alCambiarFechaAplicacion} />
              </label>
              <label className="block">
                <span className="block text-[13px] mb-1.5 font-medium">Vence el</span>
                <FechaInput name="fecha_vencimiento" value={fechaVencimiento} onChange={setFechaVencimiento} />
                <span className="block text-[11.5px] text-slate-400 mt-1">Se autocompleta a un año, se puede ajustar.</span>
              </label>
            </div>

            {faltaParaPedir.length > 0 && (
              <div className="text-[13px] text-amber-900 bg-amber-50 border border-amber-200 rounded px-3 py-2.5">
                <p className="font-semibold">Todavía no se puede pedir el nº de registro:</p>
                <ul className="list-disc pl-5 mt-1 space-y-0.5">
                  {faltaParaPedir.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <p className="mt-1.5">Para guardar otros cambios, volvé el grado a G0.</p>
              </div>
            )}

            {!completo && faltaParaPedir.length === 0 && (
              <p className="text-[12.5px] text-slate-500">
                Completá los campos obligatorios para poder guardar
                {esG0 ? "." : " (en G1 o más, el microchip es obligatorio)."}
              </p>
            )}

            <div className="flex flex-col sm:flex-row-reverse gap-3 pt-3 border-t border-slate-200">
              <button
                type="submit"
                disabled={pendiente || !completo || faltaParaPedir.length > 0}
                className="foco bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2.5 rounded text-[14px] font-semibold transition-colors"
              >
                {pendiente
                  ? "Guardando…"
                  : pidiendoNumero
                    ? "Guardar y pedir nº de registro"
                    : editando
                      ? "Guardar cambios"
                      : "Registrar dupla"}
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

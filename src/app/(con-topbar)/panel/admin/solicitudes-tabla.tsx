"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, X } from "lucide-react";
import { aprobarSolicitud, rechazarSolicitud } from "./actions";
import { obtenerUrlLibreta } from "@/app/(con-topbar)/panel/grupo/actions";

export type Solicitud = {
  duplaId: string;
  guia_nombre: string;
  perro_nombre: string;
  grado: string;
  tamano: string;
  club: string;
  region: string;
  enviada_en: string | null;
  archivo_path: string | null;
};

function formatearFecha(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function SolicitudesTabla({ solicitudes }: { solicitudes: Solicitud[] }) {
  const router = useRouter();
  const [procesando, setProcesando] = useState<string | null>(null);
  const [aviso, setAviso] = useState<{ texto: string; tipo: "error" | "info" } | null>(null);
  const [rechazando, setRechazando] = useState<Solicitud | null>(null);
  const [motivo, setMotivo] = useState("");

  async function verLibreta(s: Solicitud) {
    if (!s.archivo_path) {
      setAviso({ texto: `${s.perro_nombre} no tiene un archivo adjunto.`, tipo: "info" });
      return;
    }
    const resultado = await obtenerUrlLibreta(s.archivo_path);
    if (resultado.error) {
      setAviso({ texto: resultado.error, tipo: "error" });
      return;
    }
    window.open(resultado.url, "_blank", "noopener,noreferrer");
  }

  async function aprobar(s: Solicitud) {
    setProcesando(s.duplaId);
    const resultado = await aprobarSolicitud(s.duplaId);
    setProcesando(null);
    if (resultado.error) {
      setAviso({ texto: resultado.error, tipo: "error" });
      return;
    }
    router.refresh();
    setAviso({ texto: `${s.perro_nombre} y ${s.guia_nombre} ya pueden inscribirse a fechas.`, tipo: "info" });
  }

  async function confirmarRechazo() {
    if (!rechazando) return;
    setProcesando(rechazando.duplaId);
    const resultado = await rechazarSolicitud(rechazando.duplaId, motivo);
    setProcesando(null);
    if (resultado.error) {
      setAviso({ texto: resultado.error, tipo: "error" });
      return;
    }
    router.refresh();
    setAviso({ texto: `Solicitud de ${rechazando.perro_nombre} rechazada. Se avisó a ${rechazando.club}.`, tipo: "info" });
    setRechazando(null);
    setMotivo("");
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

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-[12px] text-slate-600">
              <tr>
                <th className="px-5 py-3 font-semibold">Dupla</th>
                <th className="px-5 py-3 font-semibold">Grupo</th>
                <th className="px-5 py-3 font-semibold">Región</th>
                <th className="px-5 py-3 font-semibold">Enviada</th>
                <th className="px-5 py-3 font-semibold">Documento</th>
                <th className="px-5 py-3 text-right font-semibold">Resolución</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13.5px]">
              {solicitudes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    No queda nada por revisar. Las próximas solicitudes de los grupos aparecen acá.
                  </td>
                </tr>
              ) : (
                solicitudes.map((s) => (
                  <tr key={s.duplaId} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="block font-semibold">{s.guia_nombre}</span>
                      <span className="block text-[12.5px] text-slate-500">
                        {s.perro_nombre} · {s.grado} · {s.tamano}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{s.club}</td>
                    <td className="px-5 py-3.5 text-slate-600">{s.region}</td>
                    <td className="px-5 py-3.5 text-slate-500">{formatearFecha(s.enviada_en)}</td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => verLibreta(s)}
                        className="foco inline-flex items-center gap-1.5 text-blue-700 hover:underline font-semibold"
                      >
                        <FileText className="w-3.5 h-3.5" /> Ver libreta
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => aprobar(s)}
                        disabled={procesando === s.duplaId}
                        className="foco bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded px-3 py-1.5 text-[12.5px] font-semibold ml-1.5"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => {
                          setRechazando(s);
                          setMotivo("");
                        }}
                        disabled={procesando === s.duplaId}
                        className="foco border border-rose-300 text-rose-700 hover:bg-rose-50 disabled:opacity-60 rounded px-3 py-1.5 text-[12.5px] font-semibold ml-1.5"
                      >
                        Rechazar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {rechazando && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-blue-950/60" onClick={() => setRechazando(null)} />
          <div className="relative h-full overflow-y-auto p-4 sm:p-6 flex items-start justify-center">
            <div role="dialog" aria-modal="true" className="w-full max-w-md bg-white rounded-lg shadow-xl my-4">
              <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-200">
                <h2 className="font-display text-[20px] leading-none text-blue-900 font-semibold">
                  Rechazar solicitud de {rechazando.perro_nombre}
                </h2>
                <button
                  onClick={() => setRechazando(null)}
                  className="foco text-slate-400 hover:text-slate-700 p-1"
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-6 py-6 space-y-4">
                <label className="block">
                  <span className="block text-[13px] mb-1.5 font-medium">
                    Motivo (se le va a avisar a {rechazando.club})
                  </span>
                  <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    rows={3}
                    placeholder="Ej.: la foto no muestra la fecha de aplicación."
                    className="foco w-full border border-slate-300 rounded px-3 py-2.5 text-[14px] text-slate-900 outline-none focus:border-blue-600"
                  />
                </label>
                <div className="flex flex-col sm:flex-row-reverse gap-3 pt-3 border-t border-slate-200">
                  <button
                    onClick={confirmarRechazo}
                    disabled={procesando === rechazando.duplaId}
                    className="foco bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white px-5 py-2.5 rounded text-[14px] font-semibold transition-colors"
                  >
                    {procesando === rechazando.duplaId ? "Rechazando…" : "Confirmar rechazo"}
                  </button>
                  <button
                    onClick={() => setRechazando(null)}
                    className="foco px-5 py-2.5 rounded text-[14px] font-semibold border border-slate-300 bg-white hover:bg-slate-100 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

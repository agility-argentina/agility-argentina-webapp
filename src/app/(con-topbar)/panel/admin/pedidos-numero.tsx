"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { asignarNumeroRegistro, rechazarPedidoNumero } from "./actions";

export type PedidoNumero = {
  id: string;
  perro_nombre: string;
  guia_nombre: string;
  tamano: string;
  microchip: string | null;
  club: string;
  pedido_en: string;
};

function formatearFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const claseInput =
  "foco w-full border border-slate-300 rounded px-3 py-2.5 text-[14px] text-slate-900 outline-none focus:border-blue-600";

export function PedidosNumero({ pedidos, proximoNumero }: { pedidos: PedidoNumero[]; proximoNumero: number }) {
  const router = useRouter();
  const [accion, setAccion] = useState<{ tipo: "asignar" | "rechazar"; pedido: PedidoNumero } | null>(null);
  const [valor, setValor] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  function abrir(tipo: "asignar" | "rechazar", pedido: PedidoNumero) {
    setAccion({ tipo, pedido });
    // Sugerencia: el próximo número libre. La comisión lo puede cambiar.
    setValor(tipo === "asignar" ? String(proximoNumero) : "");
    setErrorModal(null);
  }

  async function confirmar() {
    if (!accion) return;
    setProcesando(true);
    const { pedido, tipo } = accion;
    const resultado =
      tipo === "asignar" ? await asignarNumeroRegistro(pedido.id, valor) : await rechazarPedidoNumero(pedido.id, valor);
    setProcesando(false);
    if (resultado.error) {
      setErrorModal(resultado.error);
      return;
    }
    router.refresh();
    setAviso(
      tipo === "asignar"
        ? `${pedido.perro_nombre} tiene el número ${valor.trim()} y pasó a G1.`
        : `Pedido de ${pedido.perro_nombre} rechazado. ${pedido.club} lo ve en su panel.`
    );
    setAccion(null);
  }

  return (
    <div>
      {aviso && (
        <div className="mb-5 flex items-start justify-between gap-3 rounded border px-4 py-3 text-[13.5px] bg-blue-50 border-blue-200 text-blue-800">
          <span>{aviso}</span>
          <button onClick={() => setAviso(null)} className="foco shrink-0 text-current/70 hover:text-current">
            Cerrar
          </button>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-[12px] text-slate-600">
              <tr>
                <th className="px-5 py-3 font-semibold">Perro</th>
                <th className="px-5 py-3 font-semibold">Tutor</th>
                <th className="px-5 py-3 font-semibold">Club</th>
                <th className="px-5 py-3 font-semibold">Microchip</th>
                <th className="px-5 py-3 font-semibold">Pedido</th>
                <th className="px-5 py-3 text-right font-semibold">Resolución</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13.5px]">
              {pedidos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    No hay pedidos de número en trámite.
                  </td>
                </tr>
              ) : (
                pedidos.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="block font-semibold">{p.perro_nombre}</span>
                      <span className="block text-[12.5px] text-slate-500">G0 · {p.tamano}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{p.guia_nombre}</td>
                    <td className="px-5 py-3.5 text-slate-600">{p.club}</td>
                    <td className="px-5 py-3.5 tabular text-slate-600">{p.microchip ?? "—"}</td>
                    <td className="px-5 py-3.5 text-slate-500">{formatearFecha(p.pedido_en)}</td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => abrir("asignar", p)}
                        className="foco bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-1.5 text-[12.5px] font-semibold ml-1.5"
                      >
                        Asignar número
                      </button>
                      <button
                        onClick={() => abrir("rechazar", p)}
                        className="foco border border-rose-300 text-rose-700 hover:bg-rose-50 rounded px-3 py-1.5 text-[12.5px] font-semibold ml-1.5"
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

      {accion && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-blue-950/60" onClick={() => setAccion(null)} />
          <div className="relative h-full overflow-y-auto p-4 sm:p-6 flex items-start justify-center">
            <div role="dialog" aria-modal="true" className="w-full max-w-md bg-white rounded-lg shadow-xl my-4">
              <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-200">
                <h2 className="font-display text-[20px] leading-none text-blue-900 font-semibold">
                  {accion.tipo === "asignar"
                    ? `Asignar número a ${accion.pedido.perro_nombre}`
                    : `Rechazar pedido de ${accion.pedido.perro_nombre}`}
                </h2>
                <button
                  onClick={() => setAccion(null)}
                  className="foco text-slate-400 hover:text-slate-700 p-1"
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-6 py-6 space-y-4">
                {errorModal && (
                  <p className="text-[13px] text-rose-700 bg-rose-50 border border-rose-200 rounded px-3 py-2">
                    {errorModal}
                  </p>
                )}
                {accion.tipo === "asignar" ? (
                  <label className="block">
                    <span className="block text-[13px] mb-1.5 font-medium">Número de registro</span>
                    <input
                      value={valor}
                      onChange={(e) => setValor(e.target.value)}
                      inputMode="numeric"
                      autoFocus
                      className={`${claseInput} tabular`}
                    />
                    <span className="block text-[11.5px] text-slate-400 mt-1">
                      Sugerido: el próximo libre ({proximoNumero}). Al confirmar, {accion.pedido.perro_nombre} pasa a G1.
                    </span>
                  </label>
                ) : (
                  <label className="block">
                    <span className="block text-[13px] mb-1.5 font-medium">
                      Motivo (lo ve {accion.pedido.club} en su panel)
                    </span>
                    <textarea
                      value={valor}
                      onChange={(e) => setValor(e.target.value)}
                      rows={3}
                      autoFocus
                      placeholder="Ej.: el microchip no coincide con el de la libreta."
                      className={claseInput}
                    />
                  </label>
                )}
                <div className="flex flex-col sm:flex-row-reverse gap-3 pt-3 border-t border-slate-200">
                  <button
                    onClick={confirmar}
                    disabled={procesando}
                    className={`foco ${
                      accion.tipo === "asignar" ? "bg-blue-600 hover:bg-blue-700" : "bg-rose-600 hover:bg-rose-700"
                    } disabled:opacity-60 text-white px-5 py-2.5 rounded text-[14px] font-semibold transition-colors`}
                  >
                    {procesando ? "Guardando…" : accion.tipo === "asignar" ? "Asignar y pasar a G1" : "Confirmar rechazo"}
                  </button>
                  <button
                    onClick={() => setAccion(null)}
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

"use client";

import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import type { Orden } from "@/lib/use-orden";

export function ThOrdenable<K extends string>({
  columna,
  etiqueta,
  orden,
  onClick,
  alinearDerecha = false,
}: {
  columna: K;
  etiqueta: string;
  orden: Orden<K>;
  onClick: (columna: K) => void;
  alinearDerecha?: boolean;
}) {
  return (
    <th className={`px-5 py-3 font-semibold ${alinearDerecha ? "text-right" : ""}`}>
      <button
        onClick={() => onClick(columna)}
        className={`foco inline-flex items-center gap-1 hover:text-slate-900 ${alinearDerecha ? "flex-row-reverse" : ""}`}
      >
        {etiqueta}
        {orden.columna === columna ? (
          orden.asc ? (
            <ArrowUp className="w-3 h-3" />
          ) : (
            <ArrowDown className="w-3 h-3" />
          )
        ) : (
          <ArrowUpDown className="w-3 h-3 text-slate-300" />
        )}
      </button>
    </th>
  );
}

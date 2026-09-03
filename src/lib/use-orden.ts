"use client";

import { useState } from "react";

export type Orden<K extends string> = { columna: K; asc: boolean };

export function useOrden<K extends string>(columnaInicial: K) {
  const [orden, setOrden] = useState<Orden<K>>({ columna: columnaInicial, asc: true });

  function ordenarPor(columna: K) {
    setOrden((actual) => (actual.columna === columna ? { columna, asc: !actual.asc } : { columna, asc: true }));
  }

  return { orden, ordenarPor };
}

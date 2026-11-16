"use client";

import { usePathname } from "next/navigation";

// Etiqueta de la sección al lado del nombre del sitio en la topbar: el nombre
// del club o "Administración general". Solo dentro del panel de la cuenta.
// Es cliente porque el header vive en el layout y no recibe la ruta.
export function SeccionTopbar({
  panelHref,
  titulo,
  detalle,
}: {
  panelHref: string;
  titulo: string;
  detalle: string | null;
}) {
  const pathname = usePathname();
  if (!pathname.startsWith(panelHref)) return null;

  return (
    <span className="hidden sm:flex items-center gap-3 min-w-0">
      <span aria-hidden className="h-5 w-px bg-slate-300 shrink-0" />
      <span className="truncate text-[13.5px] text-slate-500 font-medium">
        {titulo}
        {detalle && <span className="hidden lg:inline font-normal text-slate-400"> · {detalle}</span>}
      </span>
    </span>
  );
}

// Configuración compartida de AG Grid (Community, MIT): módulos, tema con la
// estética del resto de la app y textos en español.
import { AllCommunityModule, ModuleRegistry, themeQuartz } from "ag-grid-community";
import { AG_GRID_LOCALE_ES } from "@ag-grid-community/locale";
import { ordenNreg } from "./orden-nreg";

ModuleRegistry.registerModules([AllCommunityModule]);

// Los valores replican las clases de Tailwind de las tablas hechas a mano.
export const temaGrilla = themeQuartz.withParams({
  fontFamily: "inherit",
  fontSize: 13.5,
  foregroundColor: "#0f172a", // slate-900
  backgroundColor: "#ffffff",
  accentColor: "#2563eb", // blue-600
  borderColor: "#e2e8f0", // slate-200
  wrapperBorderRadius: 8,
  headerBackgroundColor: "#f8fafc", // slate-50
  headerTextColor: "#475569", // slate-600
  headerFontSize: 12,
  headerFontWeight: 600,
  rowHoverColor: "rgb(239 246 255 / 0.4)", // blue-50/40
  rowBorder: { color: "#f1f5f9" }, // slate-100
  columnBorder: false,
  spacing: 6,
  browserColorScheme: "light",
});

export const textosGrilla = AG_GRID_LOCALE_ES;

// Comparador para la columna Nº Reg.: numérico, y los G0 (sin número) siempre
// al final, sin importar el sentido del orden.
export function compararNreg(a: string | null, b: string | null, _na: unknown, _nb: unknown, descendente: boolean) {
  const an = ordenNreg(a);
  const bn = ordenNreg(b);
  if (an === Infinity && bn === Infinity) return 0;
  if (an === Infinity) return descendente ? -1 : 1;
  if (bn === Infinity) return descendente ? 1 : -1;
  return an - bn;
}

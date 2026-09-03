// Convierte el Nº de registro a un valor ordenable. Las duplas G0, que no
// tienen número, van siempre al final (independientemente de si el orden
// es ascendente o descendente).
export function ordenNreg(nreg: string | null) {
  const n = parseInt(nreg ?? "", 10);
  return Number.isNaN(n) ? Infinity : n;
}

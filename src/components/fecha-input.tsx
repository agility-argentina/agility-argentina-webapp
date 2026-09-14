"use client";

import { useEffect, useRef, useState } from "react";

function formatearParaMostrar(iso: string) {
  const [anio, mes, dia] = iso.split("-");
  if (!anio || !mes || !dia) return "";
  return `${dia}/${mes}/${anio}`;
}

function digitosAFormato(digitos: string) {
  let texto = digitos.slice(0, 2);
  if (digitos.length > 2) texto += `/${digitos.slice(2, 4)}`;
  if (digitos.length > 4) texto += `/${digitos.slice(4, 8)}`;
  return texto;
}

function digitosAIso(digitos: string) {
  if (digitos.length !== 8) return "";

  const dia = Number(digitos.slice(0, 2));
  const mes = Number(digitos.slice(2, 4));
  const anio = Number(digitos.slice(4, 8));
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31 || anio < 1900) return "";

  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  const valida =
    fecha.getUTCFullYear() === anio && fecha.getUTCMonth() === mes - 1 && fecha.getUTCDate() === dia;
  if (!valida) return "";

  return `${String(anio).padStart(4, "0")}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

export function FechaInput({
  name,
  value,
  onChange,
  required,
}: {
  name: string;
  value: string;
  onChange: (iso: string) => void;
  required?: boolean;
}) {
  const [texto, setTexto] = useState(formatearParaMostrar(value));
  const ultimoEmitido = useRef(value);

  useEffect(() => {
    if (value !== ultimoEmitido.current) {
      setTexto(formatearParaMostrar(value));
      ultimoEmitido.current = value;
    }
  }, [value]);

  function alCambiar(e: React.ChangeEvent<HTMLInputElement>) {
    const digitos = e.target.value.replace(/\D/g, "").slice(0, 8);
    const iso = digitosAIso(digitos);
    setTexto(digitosAFormato(digitos));
    ultimoEmitido.current = iso;
    onChange(iso);
  }

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <input
        type="text"
        inputMode="numeric"
        placeholder="dd/mm/aaaa"
        maxLength={10}
        value={texto}
        onChange={alCambiar}
        required={required}
        className="foco w-full border border-slate-300 rounded px-3 py-2.5 text-[14px] text-slate-900 tabular outline-none focus:border-blue-600"
      />
    </>
  );
}

import Link from "next/link";
import { Dog, MapPin, Mail, LogIn, Syringe } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { SiteHeader } from "@/components/site-header";
import { DirectorioClubes, type ClubDirectorio } from "@/components/directorio-clubes";

export default async function Home() {
  const supabase = await createClient();

  const { data: clubesData } = await supabase
    .from("clubes")
    .select("id, nombre, ciudad, regiones(nombre)")
    .order("nombre");

  const clubes: ClubDirectorio[] = (clubesData ?? []).map((c) => ({
    id: c.id,
    nombre: c.nombre,
    ciudad: c.ciudad,
    region: (c.regiones as unknown as { nombre: string } | null)?.nombre ?? "",
  }));

  const regiones = [...new Set(clubes.map((c) => c.region))].sort();

  // Conteo agregado con service role: RLS oculta `duplas` a visitantes
  // anónimos a propósito (nombres de guías no son públicos), pero el
  // número total sí es información pública sin problema.
  const { count: duplasActivas } = await createServiceClient()
    .from("duplas")
    .select("id", { count: "exact", head: true })
    .eq("estado", "activa");

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <div className="bg-blue-900 text-white overflow-hidden">
          <div className="max-w-[1180px] mx-auto px-5 lg:px-8 py-14 lg:py-20 grid lg:grid-cols-[1fr_1.05fr] gap-12 lg:gap-16 items-center">
            <div>
              <h1 className="font-display text-[46px] leading-[0.95] sm:text-[60px] lg:text-[68px] tracking-tight font-bold">
                Bienvenidos a
                <br />
                Agility Argentina.
              </h1>
              <p className="mt-6 text-[16.5px] leading-relaxed text-blue-100 max-w-[54ch]">
                El agility es un deporte canino de velocidad, precisión y complicidad: el guía dirige a su
                perro por una pista de obstáculos, sin correa ni premios en la mano, compitiendo contra el
                reloj. Practicalo en los grupos homologados de todo el país.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href="#que-es-agility"
                  className="foco inline-flex items-center gap-2 bg-white text-blue-900 px-5 py-3 rounded text-[14px] font-semibold hover:bg-blue-50 transition-colors"
                >
                  <Dog className="w-4 h-4" aria-hidden="true" /> Qué es el agility
                </a>
                <a
                  href="#directorio"
                  className="foco inline-flex items-center gap-2 border border-blue-400/60 px-5 py-3 rounded text-[14px] font-semibold hover:bg-blue-800 transition-colors"
                >
                  <MapPin className="w-4 h-4" aria-hidden="true" /> Buscar un club cerca
                </a>
              </div>

              <dl className="mt-11 pt-8 border-t border-blue-700/60 grid grid-cols-2 gap-6 max-w-xs">
                <div>
                  <dd className="font-display text-[34px] leading-none tabular font-semibold">
                    {duplasActivas ?? 0}
                  </dd>
                  <dt className="mt-1.5 text-[12.5px] text-blue-200">duplas activas</dt>
                </div>
                <div>
                  <dd className="font-display text-[34px] leading-none tabular font-semibold">{clubes.length}</dd>
                  <dt className="mt-1.5 text-[12.5px] text-blue-200">grupos homologados</dt>
                </div>
              </dl>
            </div>

            <figure className="relative">
              <div className="rounded-lg bg-blue-950/40 ring-1 ring-blue-700/50 p-4 sm:p-6">
                <svg
                  viewBox="0 0 420 320"
                  className="w-full h-auto"
                  role="img"
                  aria-label="Plano de un recorrido de agility: doce obstáculos numerados unidos por la traza del perro."
                >
                  <defs>
                    <pattern id="cesped" width="26" height="26" patternUnits="userSpaceOnUse">
                      <path d="M26 0H0V26" fill="none" stroke="#1d4ed8" strokeWidth="0.6" opacity="0.35" />
                    </pattern>
                  </defs>
                  <rect x="6" y="6" width="408" height="308" rx="6" fill="url(#cesped)" stroke="#1d4ed8" strokeOpacity="0.5" />

                  <path
                    className="traza"
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    d="M40 282 C 70 282, 74 262, 96 258 C 128 252, 138 224, 168 220 C 208 214, 214 232, 250 236
                       C 288 240, 300 216, 330 206 C 362 195, 372 168, 356 146 C 340 124, 306 132, 292 148
                       C 274 168, 246 168, 222 156 C 196 143, 178 116, 150 112 C 118 107, 96 122, 80 112
                       C 60 100, 62 74, 44 64"
                  />

                  <g stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.95">
                    <path d="M84 244 L108 272" />
                    <path d="M156 206 L180 234" />
                    <path d="M318 192 L342 220" />
                    <path d="M68 98 L92 126" />
                  </g>

                  <path d="M234 222 q18 -22 36 0" fill="none" stroke="#93c5fd" strokeWidth="11" strokeLinecap="round" opacity="0.9" />
                  <path d="M282 250 l14 -20 l14 20" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinejoin="round" />
                  <g fill="#ffffff" opacity="0.95">
                    <circle cx="278" cy="152" r="3" />
                    <circle cx="290" cy="146" r="3" />
                    <circle cx="302" cy="140" r="3" />
                    <circle cx="314" cy="134" r="3" />
                    <circle cx="326" cy="128" r="3" />
                  </g>
                  <path d="M206 162 L242 148" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
                  <path d="M224 155 L224 166" stroke="#ffffff" strokeWidth="3" />
                  <circle cx="150" cy="112" r="12" fill="none" stroke="#93c5fd" strokeWidth="4" />

                  <g fontFamily="Inter, sans-serif" fontSize="10.5" fontWeight="700" textAnchor="middle">
                    <g fill="#0f172a">
                      <circle cx="96" cy="258" r="10" fill="#ffffff" /><text x="96" y="262">1</text>
                      <circle cx="168" cy="220" r="10" fill="#ffffff" /><text x="168" y="224">2</text>
                      <circle cx="252" cy="212" r="10" fill="#ffffff" /><text x="252" y="216">3</text>
                      <circle cx="296" cy="242" r="10" fill="#ffffff" /><text x="296" y="246">4</text>
                      <circle cx="330" cy="206" r="10" fill="#ffffff" /><text x="330" y="210">5</text>
                      <circle cx="356" cy="146" r="10" fill="#ffffff" /><text x="356" y="150">6</text>
                      <circle cx="302" cy="140" r="10" fill="#ffffff" /><text x="302" y="144">7</text>
                      <circle cx="262" cy="170" r="10" fill="#ffffff" /><text x="262" y="174">8</text>
                      <circle cx="224" cy="155" r="10" fill="#ffffff" /><text x="224" y="159">9</text>
                      <circle cx="150" cy="112" r="10" fill="#ffffff" /><text x="150" y="116">10</text>
                      <circle cx="80" cy="112" r="10" fill="#ffffff" /><text x="80" y="116">11</text>
                      <circle cx="44" cy="64" r="10" fill="#ffffff" /><text x="44" y="68">12</text>
                    </g>
                  </g>

                  <g fontFamily="Inter, sans-serif" fontSize="9" fontWeight="600" fill="#bfdbfe">
                    <path d="M32 270 L32 294" stroke="#bfdbfe" strokeWidth="2" />
                    <text x="40" y="304">LARGADA</text>
                    <path d="M28 52 L28 76" stroke="#bfdbfe" strokeWidth="2" />
                    <text x="36" y="44">LLEGADA</text>
                  </g>
                </svg>
              </div>
              <figcaption className="mt-3 text-[12px] text-blue-200">Plano de recorrido — ejemplo ilustrativo</figcaption>
            </figure>
          </div>
        </div>

        {/* Institucional + obstáculos */}
        <div id="que-es-agility" className="max-w-[1180px] mx-auto px-5 lg:px-8 py-14 lg:py-20">
          <div className="grid lg:grid-cols-[minmax(0,46ch)_1fr] gap-12 lg:gap-20">
            <div>
              <h2 className="font-display text-[34px] leading-tight text-blue-900 font-semibold">Qué es el agility</h2>
              <p className="mt-5 text-[15.5px] leading-[1.75] text-slate-700">
                El guía recorre la pista junto a su perro y lo dirige con la voz y el cuerpo. No hay correa,
                no hay premios en la mano: solo la señal a tiempo. Gana la dupla que completa el recorrido
                en el orden correcto, con menos faltas y en menos segundos.
              </p>
              <p className="mt-4 text-[15.5px] leading-[1.75] text-slate-700">
                Se compite por altura del perro —XSmall, Small, Midi, Intermediate y Large— y por grado, del
                0 (recreativo) al 3. Antes de entrar a la pista, cada perro debe tener su libreta sanitaria
                al día: es una forma de cuidar la salud de todos los que participan.
              </p>
              <div className="mt-7 flex items-start gap-3 rounded border-l-[3px] border-blue-600 bg-white p-4">
                <Syringe className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" aria-hidden="true" />
                <p className="text-[13.5px] leading-relaxed text-slate-600">
                  La antirrábica debe estar aplicada con más de 21 días y menos de 12 meses respecto de la
                  fecha de competencia.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-[13px] text-slate-500 mb-5 font-semibold">Los obstáculos del recorrido</h3>
              <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-6">
                {OBSTACULOS.map((o) => (
                  <li key={o.nombre} className="flex gap-3.5">
                    <svg viewBox="0 0 32 32" className="w-8 h-8 shrink-0 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      {o.path}
                    </svg>
                    <div>
                      <p className="text-[14.5px] font-semibold">{o.nombre}</p>
                      <p className="text-[13px] text-slate-500 leading-snug">{o.descripcion}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Directorio de clubes */}
        <div id="directorio" className="bg-white border-y border-slate-200">
          <div className="max-w-[1180px] mx-auto px-5 lg:px-8 py-14 lg:py-20">
            <DirectorioClubes clubes={clubes} regiones={regiones} />
          </div>
        </div>

        {/* Calendario y galería */}
        <div className="max-w-[1180px] mx-auto px-5 lg:px-8 py-14 lg:py-20">
          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16">
            <div>
              <h2 className="font-display text-[34px] leading-tight text-blue-900 font-semibold">Calendario 2026</h2>
              <p className="mt-2 text-[15px] text-slate-600">Fechas puntuables para el ranking nacional.</p>
              <p className="mt-8 py-10 text-center text-[14px] text-slate-500 border border-dashed border-slate-300 rounded-lg">
                Todavía no hay fechas cargadas. Se van a publicar acá apenas estén confirmadas.
              </p>
            </div>

            <div>
              <h2 className="font-display text-[34px] leading-tight text-blue-900 font-semibold">Galería</h2>
              <p className="mt-2 text-[15px] text-slate-600">Imágenes de las últimas fechas.</p>
              <p className="mt-8 py-10 text-center text-[14px] text-slate-500 border border-dashed border-slate-300 rounded-lg">
                Todavía no hay fotos cargadas.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-blue-900 text-blue-200">
        <div className="max-w-[1180px] mx-auto px-5 lg:px-8 py-10 flex flex-col sm:flex-row gap-6 justify-between items-start">
          <div>
            <p className="font-display text-[20px] text-white font-semibold">Agility Argentina</p>
            <p className="mt-1 text-[13px]">Portal oficial del deporte canino en Argentina</p>
          </div>
          <div className="text-[13px] space-y-1.5">
            <p className="inline-flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" aria-hidden="true" /> comisionagilityargentina@gmail.com
            </p>
            <a
              href="https://instagram.com/agilityargentinaoficial"
              target="_blank"
              rel="noopener noreferrer"
              className="foco flex items-center gap-1.5 hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor" aria-hidden="true">
                <path d="M12 2c-2.72 0-3.06.01-4.12.06-1.06.05-1.79.22-2.43.47a4.9 4.9 0 00-1.77 1.15A4.9 4.9 0 002.53 5.45c-.25.64-.42 1.37-.47 2.43C2.01 8.94 2 9.28 2 12s.01 3.06.06 4.12c.05 1.06.22 1.79.47 2.43a4.9 4.9 0 001.15 1.77 4.9 4.9 0 001.77 1.15c.64.25 1.37.42 2.43.47C8.94 21.99 9.28 22 12 22s3.06-.01 4.12-.06c1.06-.05 1.79-.22 2.43-.47a4.9 4.9 0 001.77-1.15 4.9 4.9 0 001.15-1.77c.25-.64.42-1.37.47-2.43.05-1.06.06-1.4.06-4.12s-.01-3.06-.06-4.12c-.05-1.06-.22-1.79-.47-2.43a4.9 4.9 0 00-1.15-1.77A4.9 4.9 0 0018.55 2.53c-.64-.25-1.37-.42-2.43-.47C15.06 2.01 14.72 2 12 2zm0 5a5 5 0 110 10 5 5 0 010-10zm0 8.2a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4zM18.4 5.6a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z" />
              </svg>
              @agilityargentinaoficial
            </a>
            <Link href="/login" className="foco flex items-center gap-1.5 hover:text-white">
              <LogIn className="w-3.5 h-3.5" aria-hidden="true" /> Acceso para clubes y administración
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}

const OBSTACULOS = [
  {
    nombre: "Salto",
    descripcion: "Valla simple. La altura depende de la categoría.",
    path: <path d="M6 26V10M26 26V10M4 14h24" />,
  },
  {
    nombre: "Rampa",
    descripcion: "Zona de contacto obligatoria al subir y bajar.",
    path: <path d="M3 26l13-18 13 18M11 19h10" strokeLinejoin="round" />,
  },
  {
    nombre: "Puente",
    descripcion: "Zona de contacto obligatoria al subir y bajar.",
    path: <path d="M4 26L12 10H20L28 26" strokeLinejoin="round" />,
  },
  {
    nombre: "Slalom",
    descripcion: "Doce postes en línea. El perro entra dejando el primer palo a su izquierda.",
    path: <path d="M5 24V16M11 24V16M17 24V16M23 24V16M29 24V16" />,
  },
  {
    nombre: "Túnel",
    descripcion: "Tubo flexible de tres a seis metros.",
    path: <path d="M4 25V16a12 12 0 0124 0v9M11 25v-9a5 5 0 0110 0v9" />,
  },
  {
    nombre: "Subibaja",
    descripcion: "Zona de contacto obligatoria al subir y bajar. Debe tocar el piso al terminar.",
    path: <path d="M4 12l24 8M16 16v10M11 26h10" />,
  },
  {
    nombre: "Aro",
    descripcion: "Salto circular suspendido en el aire.",
    path: (
      <>
        <circle cx="16" cy="14" r="8" />
        <path d="M16 22v6M10 28h12" />
      </>
    ),
  },
] as const;

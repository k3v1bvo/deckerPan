"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Printer,
  ArrowLeft,
  Download,
  QrCode,
  Sparkles,
  Coffee,
  FileText,
  CheckCircle2,
  Share2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Eye,
  Settings,
  Flame,
  UtensilsCrossed,
  Layers,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  ExternalLink,
  BookOpen
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useSystemStore } from "@/store";
import {
  DENCKER_ASSETS,
  MENU_PDF_PAGES,
  SEED_CATEGORIAS,
  SEED_PRODUCTOS,
  SEED_MESAS
} from "@/lib/seed-data";
import { Producto, Categoria, Mesa } from "@/types";
import { soundManager } from "@/lib/sound";
import { getStaffSession } from "@/lib/auth";

type ModoMenu = "oficial_pdf" | "dinamico_vivo" | "imprimir_a4" | "carpas_qr";

export default function MenuPdfPage() {
  const storeProductos = useSystemStore((state) => state.productos);
  const storeCategorias = useSystemStore((state) => state.categorias);
  const storeMesas = useSystemStore((state) => state.mesas);

  const productos: Producto[] =
    storeProductos && storeProductos.length > 0 ? storeProductos : SEED_PRODUCTOS;
  const categorias: Categoria[] =
    storeCategorias && storeCategorias.length > 0 ? storeCategorias : SEED_CATEGORIAS;
  const mesas: Mesa[] =
    storeMesas && storeMesas.length > 0 ? storeMesas : SEED_MESAS;

  const [modo, setModo] = useState<ModoMenu>("oficial_pdf");
  const [subVistaPdf, setSubVistaPdf] = useState<"tira_continua" | "por_pagina">("tira_continua");
  const [paginaActiva, setPaginaActiva] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [copiadoLink, setCopiadoLink] = useState(false);
  const [esAdmin, setEsAdmin] = useState(false);
  const [mesaFiltroCarpas, setMesaFiltroCarpas] = useState<number | "todas">("todas");
  const [baseUrl, setBaseUrl] = useState<string>("https://decker-pan.vercel.app");

  useEffect(() => {
    const session = getStaffSession();
    if (session?.user?.role === "admin") {
      setEsAdmin(true);
    }
    if (typeof window !== "undefined") {
      if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        setBaseUrl("https://decker-pan.vercel.app");
      } else {
        setBaseUrl(window.location.origin);
      }
    }
  }, []);

  // Helper para buscar producto dinámico por id o por coincidencia de nombre
  const getProd = (id: string, nombreFiltro?: string): Producto | undefined => {
    let found = productos.find((p) => p.id === id);
    if (!found && nombreFiltro) {
      found = productos.find((p) =>
        p.nombre.toLowerCase().includes(nombreFiltro.toLowerCase())
      );
    }
    return found;
  };

  // Helper para renderizar precio formateado
  const formatPrecio = (prod?: Producto, fallback: number = 0): string => {
    const val = prod ? prod.precio : fallback;
    return val % 1 === 0 ? val.toString() : val.toFixed(1);
  };

  const handleCopiarLink = () => {
    soundManager.playTactileClick();
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiadoLink(true);
      setTimeout(() => setCopiadoLink(false), 2000);
    }
  };

  const handleImprimir = () => {
    soundManager.playTactileClick();
    window.print();
  };

  // Mesas para el modo Carpas QR
  const mesasParaCarpas = useMemo(() => {
    if (mesaFiltroCarpas === "todas") {
      return mesas.slice(0, 20);
    }
    return mesas.filter((m) => m.numero === mesaFiltroCarpas);
  }, [mesas, mesaFiltroCarpas]);

  return (
    <div className="min-h-screen bg-[#F7F2EB] text-[#1E130C] font-sans print:bg-white print:p-0 selection:bg-[#EAE0D3]">
      
      {/* ── BARRA SUPERIOR DE CONTROL (NO SE IMPRIME) ── */}
      <header className="sticky top-0 z-50 bg-[#1E130C]/95 backdrop-blur-md border-b border-amber-950/40 text-[#F5EBE1] px-4 py-3 shadow-lg print:hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Logo & Marca */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              onClick={() => soundManager.playTactileClick()}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF6EF] transition flex items-center gap-1.5 text-xs font-semibold"
              title="Volver a la portada principal"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Inicio</span>
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 p-1 border border-amber-500/30 flex items-center justify-center">
                <img
                  src={DENCKER_ASSETS.logoSvg}
                  alt="Dencker Pan"
                  className="w-full h-full object-contain drop-shadow"
                />
              </div>
              <div>
                <h1 className="font-serif text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-2">
                  Menú Oficial Dencker Coffee & Pan
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 hidden md:inline">
                    En Vivo & Sincronizado
                  </span>
                </h1>
                <p className="text-[11px] text-amber-200/80 hidden sm:block">
                  Carta fiel a la edición impresa • Café 4 Llamas de Especialidad
                </p>
              </div>
            </div>
          </div>

          {/* Selector de Modo */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => {
                soundManager.playTactileClick();
                setModo("oficial_pdf");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                modo === "oficial_pdf"
                  ? "bg-[#991B24] text-white shadow-sm"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              <BookOpen size={13} className="text-amber-300" />
              <span>PDF Original (6 Páginas Reales)</span>
            </button>

            <button
              onClick={() => {
                soundManager.playTactileClick();
                setModo("dinamico_vivo");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                modo === "dinamico_vivo"
                  ? "bg-[#991B24] text-white shadow-sm"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              <Sparkles size={13} className="text-amber-300" />
              <span>Menú Dinámico (Precios en Vivo)</span>
            </button>

            <button
              onClick={() => {
                soundManager.playTactileClick();
                setModo("carpas_qr");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer hidden md:flex ${
                modo === "carpas_qr"
                  ? "bg-[#991B24] text-white shadow-sm"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              <QrCode size={13} />
              <span>Carpas de Mesa</span>
            </button>
          </div>

          {/* Acciones: Imprimir, Descargar, Admin */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleImprimir}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Imprimir menú actual"
            >
              <Printer size={14} className="text-amber-300" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            <a
              href={DENCKER_ASSETS.menuPdfDownload}
              download="MENU_DENCKER_OFICIAL.pdf"
              onClick={() => soundManager.playPastryCrinkle()}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Download size={14} />
              <span>Descargar PDF Original</span>
            </a>

            <button
              onClick={handleCopiarLink}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Copiar enlace del menú"
            >
              {copiadoLink ? <CheckCircle2 size={15} className="text-emerald-400" /> : <Copy size={15} />}
            </button>

            <Link
              href="/admin?tab=productos"
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Ir a Administrador para editar precios y productos"
            >
              <Settings size={15} />
            </Link>
          </div>

        </div>
      </header>

      {/* ── BANNER EN VIVO: SINCRONIZACIÓN CON EL ADMIN ── */}
      <div className="bg-[#991B24] text-white text-xs py-2 px-4 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              <strong>Menú Oficial Físico & Digital:</strong> Carta fiel de Dencker Coffee & Panadería Artesanal.
            </span>
            <span className="opacity-80 hidden lg:inline">
              Si editas precios o fotos en el Administrador, se sincronizan de inmediato en todo el sistema.
            </span>
          </div>
          <Link
            href="/admin?tab=productos"
            className="text-[11px] font-bold underline underline-offset-2 hover:text-amber-200 transition"
          >
            Editar Precios & Productos en Admin ↗
          </Link>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MODO 1: VISUALIZADOR OFICIAL DEL PDF (6 PÁGINAS ESCANEADAS)
      ══════════════════════════════════════════════════════════════ */}
      {modo === "oficial_pdf" && (
        <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
          
          {/* Barra de Control de Visualización (Tira Continua vs Página por Página) */}
          <div className="p-4 rounded-3xl bg-white border border-[#E5DACD] shadow-sm flex flex-wrap items-center justify-between gap-4">
            
            {/* Selector de Sub-Vista */}
            <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl border border-stone-200">
              <button
                type="button"
                onClick={() => {
                  soundManager.playTactileClick();
                  setSubVistaPdf("tira_continua");
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  subVistaPdf === "tira_continua"
                    ? "bg-[#991B24] text-white shadow-xs"
                    : "text-stone-700 hover:text-stone-900"
                }`}
              >
                <Layers size={14} />
                <span>Ver las 6 Páginas Seguidas (Tira Completa)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playTactileClick();
                  setSubVistaPdf("por_pagina");
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  subVistaPdf === "por_pagina"
                    ? "bg-[#991B24] text-white shadow-xs"
                    : "text-stone-700 hover:text-stone-900"
                }`}
              >
                <BookOpen size={14} />
                <span>Página a Página (Con Zoom)</span>
              </button>
            </div>

            {/* Acceso Rápido a Páginas (Anclas) */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {MENU_PDF_PAGES.map((p) => (
                <button
                  key={p.page}
                  onClick={() => {
                    soundManager.playTactileClick();
                    if (subVistaPdf === "por_pagina") {
                      setPaginaActiva(p.page);
                    } else {
                      const el = document.getElementById(`pdf-page-${p.page}`);
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    subVistaPdf === "por_pagina" && paginaActiva === p.page
                      ? "bg-[#991B24] text-white shadow-sm"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  Pág {p.page}
                </button>
              ))}
            </div>

            {/* Controles de Zoom (Solo en modo Página por Página) */}
            {subVistaPdf === "por_pagina" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(70, z - 15))}
                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer"
                  title="Alejar"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="text-xs font-mono font-bold text-stone-600 w-12 text-center">
                  {zoomLevel}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(160, z + 15))}
                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer"
                  title="Acercar"
                >
                  <ZoomIn size={16} />
                </button>
              </div>
            )}

          </div>

          {/* SUB-VISTA A: TIRA CONTINUA DE LAS 6 PÁGINAS ESCANEADAS */}
          {subVistaPdf === "tira_continua" && (
            <div className="space-y-8 max-w-4xl mx-auto py-2">
              {MENU_PDF_PAGES.map((p) => (
                <div
                  key={p.page}
                  id={`pdf-page-${p.page}`}
                  className="bg-white rounded-3xl shadow-2xl border-2 border-stone-200 overflow-hidden transition-all hover:border-amber-400 group"
                >
                  {/* Encabezado Editorial de la Página */}
                  <div className="p-3.5 bg-[#1E130C] text-white flex items-center justify-between text-xs font-bold border-b border-amber-900/30">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#991B24] text-white text-[11px] font-mono">
                        Página {p.page} de 6
                      </span>
                      <span className="text-amber-300 font-serif text-sm">
                        {p.title}
                      </span>
                    </div>
                    <span className="text-stone-300 text-[11px] hidden sm:inline">
                      {p.desc}
                    </span>
                  </div>

                  {/* Imagen de la Página Oficial Escaneada */}
                  <div className="p-2 sm:p-4 bg-stone-100 flex justify-center">
                    <img
                      src={`/img/menu-pdf/page_${p.page}.png`}
                      alt={`Menú Dencker Pan - Página ${p.page} (${p.title})`}
                      className="w-full max-w-3xl h-auto object-contain rounded-2xl shadow-sm block select-none bg-white"
                      loading="eager"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SUB-VISTA B: PÁGINA A PÁGINA CON ZOOM */}
          {subVistaPdf === "por_pagina" && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    soundManager.playTactileClick();
                    setPaginaActiva((p) => Math.max(1, p - 1));
                  }}
                  disabled={paginaActiva === 1}
                  className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-800 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  <span>Página Anterior</span>
                </button>

                <span className="font-serif font-black text-sm text-stone-900 px-3">
                  Pág {paginaActiva} de 6: {MENU_PDF_PAGES[paginaActiva - 1]?.title}
                </span>

                <button
                  onClick={() => {
                    soundManager.playTactileClick();
                    setPaginaActiva((p) => Math.min(MENU_PDF_PAGES.length, p + 1));
                  }}
                  disabled={paginaActiva === MENU_PDF_PAGES.length}
                  className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-800 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>Siguiente Página</span>
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="flex justify-center overflow-auto py-2">
                <div
                  style={{ width: `${zoomLevel}%`, maxWidth: "900px" }}
                  className="bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden transition-all duration-200 relative group"
                >
                  <img
                    src={`/img/menu-pdf/page_${paginaActiva}.png`}
                    alt={`Menú Dencker Pan - Página ${paginaActiva}`}
                    className="w-full h-auto object-contain block select-none"
                  />
                  <div className="p-4 bg-stone-900/90 text-white text-xs flex items-center justify-between border-t border-white/10">
                    <span className="font-semibold text-amber-300">
                      {MENU_PDF_PAGES[paginaActiva - 1]?.title}
                    </span>
                    <span className="text-stone-300">
                      {MENU_PDF_PAGES[paginaActiva - 1]?.desc}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODO 2: MENÚ DINÁMICO EN VIVO (ESTILO EXACTO AL PDF + LIVE PRECIOS)
      ══════════════════════════════════════════════════════════════ */}
      {modo === "dinamico_vivo" && (
        <main className="max-w-4xl mx-auto px-4 py-8 space-y-12">
          
          {/* ── PÁGINA 1: PORTADA OFICIAL (TOLDO VINTAGE + ME NU + DON DENCKER) ── */}
          <div className="bg-[#FAF6EF] rounded-3xl shadow-2xl border-4 border-[#991B24]/20 overflow-hidden relative flex flex-col items-center justify-between min-h-[920px] p-6 sm:p-10 text-center">
            
            {/* Toldo a rayas rojas y crema */}
            <div className="w-full h-24 sm:h-28 -mt-6 sm:-mt-10 rounded-b-[36px] overflow-hidden shadow-md flex relative border-b-4 border-[#7F1D1D]">
              {[...Array(16)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-full ${
                    i % 2 === 0 ? "bg-[#991B24]" : "bg-[#FAF6EF]"
                  } border-r border-[#991B24]/20`}
                />
              ))}
            </div>

            {/* Cabecera & Título Central ME NU */}
            <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-auto py-6">
              
              {/* Bloque ME NU Retro */}
              <div className="md:col-span-5 text-left md:text-left flex flex-col justify-center">
                <div className="space-y-0 leading-none">
                  <h2 className="text-[#991B24] font-black tracking-tighter text-7xl sm:text-9xl leading-[0.85] font-serif uppercase">
                    ME
                  </h2>
                  <h2 className="text-[#991B24] font-black tracking-tighter text-7xl sm:text-9xl leading-[0.85] font-serif uppercase">
                    NU
                  </h2>
                </div>
                <div className="mt-4 pt-4 border-t-2 border-[#991B24] max-w-[220px]">
                  <p className="font-serif font-bold text-xs uppercase tracking-widest text-[#1E130C]">
                    Carta Oficial
                  </p>
                  <p className="text-[11px] text-[#785E4F] italic">
                    Café 4 Llamas & Panadería Artesanal
                  </p>
                </div>
              </div>

              {/* Mascota Don Dencker con Taza */}
              <div className="md:col-span-7 flex flex-col items-center justify-center relative">
                <div className="relative w-64 sm:w-80 h-80 sm:h-96 flex items-center justify-center">
                  <img
                    src={DENCKER_ASSETS.mascotClean}
                    alt="Don Dencker Mascota Oficial"
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                </div>
              </div>

            </div>

            {/* Barra Inferior DENCKER COFFEE */}
            <div className="w-full bg-[#991B24] text-white py-3.5 px-6 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-3">
              <span className="font-serif font-black tracking-widest text-lg sm:text-xl uppercase">
                DENCKER COFFEE
              </span>
              <span className="text-xs font-sans tracking-wide text-amber-200">
                Av. Daniel Salamanca, Cochabamba • Bolivia
              </span>
            </div>

          </div>

          {/* ── PÁGINA 2: DESAYUNOS, CAFÉS (4 LLAMAS) & LATTES ── */}
          <div className="bg-[#FAF6EF] rounded-3xl shadow-xl border border-[#E7DFD5] p-6 sm:p-10 relative space-y-8">
            
            {/* Header con Logo Chef Hat */}
            <div className="flex flex-col items-center justify-center pb-4 border-b-2 border-[#991B24]/20 relative">
              <div className="w-16 h-12 flex items-center justify-center mb-1">
                <img
                  src={DENCKER_ASSETS.logoPng}
                  alt="Dencker Hat"
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="font-serif font-black text-3xl sm:text-4xl uppercase text-[#991B24] tracking-wider">
                DESAYUNOS & CAFÉS
              </h2>
              <span className="text-[11px] font-mono font-bold tracking-widest text-[#785E4F] uppercase">
                Página 2 • Granos de Altura Caranavi "Café 4 Llamas"
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
              
              {/* Columna Izquierda: DESAYUNOS */}
              <div className="space-y-6">
                <div className="border-b-2 border-[#1E130C] pb-1">
                  <h3 className="font-serif font-black text-2xl uppercase tracking-tight text-[#1E130C]">
                    DESAYUNOS
                  </h3>
                </div>

                <div className="space-y-4">
                  {[
                    { id: "prod_rise_shine", nombre: "Rise & Shine", desc: "Huevos revueltos, tostadas, tomate, queso criollo, granola con yogurt, café o té", precio: 45 },
                    { id: "prod_jamon_palta", nombre: "Jamón y palta", desc: "Tostadas con porción de jamón y palta, café o té", precio: 30 },
                    { id: "prod_huevos_revueltos_fritos", nombre: "Huevos revueltos o fritos", desc: "Huevos revueltos o fritos con jamón o tomate, tostadas, mantequilla, café o té", precio: 35 },
                    { id: "prod_omelette", nombre: "Omelette", desc: "Omelette, tostadas, café o té. Agrégale 2 ingredientes: tomate, jamón, champiñones, pimentón, cebolla, aceitunas o queso", precio: 40 },
                    { id: "prod_huevos_benedictinos", nombre: "Huevos escalfados (benedictinos)", desc: "Huevos escalfados, hojas de espinaca, jamón, salsa de queso sobre pan molde tostado, café o té", precio: 40 },
                    { id: "prod_continental", nombre: "Continental", desc: "Tostadas o pan baguette, mermelada y mantequilla, fruta, café o té y jugo o mimosa", precio: 35 },
                    { id: "prod_golosa_caprichosa", nombre: "Golosa y caprichosa", desc: "Frutos rojos, chocolate para untar y crema, viene con café o té. Elige base: Panqueques, Waffles o Tostadas francesas", precio: 40 },
                  ].map((item) => {
                    const prod = getProd(item.id, item.nombre);
                    return (
                      <div key={item.id} className="group border-b border-dashed border-[#E2D6C6] pb-3">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-serif font-bold text-base text-[#1E130C] group-hover:text-[#991B24] transition">
                            {prod ? prod.nombre : item.nombre}
                          </span>
                          <span className="font-serif font-black text-base text-[#991B24] shrink-0">
                            Bs {formatPrecio(prod, item.precio)}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B5344] leading-relaxed mt-0.5">
                          {prod?.descripcion || item.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Mascota Taza Sonriente con Sol */}
                <div className="pt-4 flex flex-col items-center justify-center">
                  <div className="w-36 h-36 flex items-center justify-center">
                    <img
                      src={DENCKER_ASSETS.mascotCoffee}
                      alt="Taza Sonriente Dencker"
                      className="w-full h-full object-contain drop-shadow"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[#785E4F] uppercase tracking-wider mt-1">
                    Sonríe, tenemos Café 4 Llamas fresco ☕
                  </span>
                </div>
              </div>

              {/* Columna Derecha: CAFÉS & LATTES */}
              <div className="space-y-8">
                
                {/* Sección CAFÉS */}
                <div className="space-y-4">
                  <div className="border-b-2 border-[#1E130C] pb-1 flex items-center justify-between">
                    <h3 className="font-serif font-black text-2xl uppercase tracking-tight text-[#1E130C]">
                      CAFÉS
                    </h3>
                    <span className="text-[11px] font-bold text-[#991B24] uppercase font-mono">
                      Café 4 Llamas
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { id: "prod_expresso", nombre: "Expresso (30cc)", desc: "Expresso 30cc puro", precio: 15 },
                      { id: "prod_expresso_rocas", nombre: "Expresso en las rocas", desc: "Expreso + hielo", precio: 16 },
                      { id: "prod_expresso_cortado", nombre: "Expresso cortado", desc: "Expresso cortado con leche", precio: 16 },
                      { id: "prod_cafe_americano", nombre: "Café americano", desc: "Expresso con agua caliente", precio: 16 },
                      { id: "prod_cappuccino", nombre: "Cappuccino", desc: "Expresso, leche texturizada, canela o cacao", precio: 22 },
                      { id: "prod_cappuccino_vienes", nombre: "Cappuccino vienés", desc: "Expresso, leche texturizada, crema de leche, salsa de chocolate o caramelo", precio: 23 },
                      { id: "prod_cappuccino_vainilla", nombre: "Cappuccino vainilla", desc: "Expresso, leche texturizada y esencia de vainilla", precio: 23 },
                      { id: "prod_flat_white", nombre: "Flat White", desc: "Dos expressos + leche texturizada sedosa", precio: 25 },
                      { id: "prod_affogato", nombre: "Affogato", desc: "Expresso + una porción de helado artesanal", precio: 25 },
                      { id: "prod_iced_coffee", nombre: "Iced coffee", desc: "Americano + hielo refrescante", precio: 22 },
                    ].map((item) => {
                      const prod = getProd(item.id, item.nombre);
                      return (
                        <div key={item.id} className="border-b border-dotted border-[#E2D6C6] pb-2">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="font-serif font-bold text-sm text-[#1E130C]">
                              {prod ? prod.nombre : item.nombre}
                            </span>
                            <span className="font-serif font-bold text-sm text-[#991B24] shrink-0">
                              Bs {formatPrecio(prod, item.precio)}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#785E4F]">{prod?.descripcion || item.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sección LATTES */}
                <div className="space-y-4 pt-2">
                  <div className="border-b-2 border-[#1E130C] pb-1">
                    <h3 className="font-serif font-black text-2xl uppercase tracking-tight text-[#1E130C]">
                      LATTES
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { id: "prod_latte", nombre: "Latte", desc: "Leche texturizada + expresso", precio: 22 },
                      { id: "prod_latte_caramel", nombre: "Latte caramel", desc: "Leche texturizada, expresso y caramelo", precio: 24 },
                      { id: "prod_latte_vainilla_caramelo", nombre: "Latte vainilla caramelo", desc: "Leche texturizada, expresso, vainilla y caramelo", precio: 25 },
                      { id: "prod_latte_mocha", nombre: "Latte mocha", desc: "Leche texturizada, expresso y chocolate", precio: 25 },
                      { id: "prod_latte_cinnamon", nombre: "Latte Cinnamon", desc: "Leche texturizada, expresso y canela", precio: 24 },
                    ].map((item) => {
                      const prod = getProd(item.id, item.nombre);
                      return (
                        <div key={item.id} className="border-b border-dotted border-[#E2D6C6] pb-2">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="font-serif font-bold text-sm text-[#1E130C]">
                              {prod ? prod.nombre : item.nombre}
                            </span>
                            <span className="font-serif font-bold text-sm text-[#991B24] shrink-0">
                              Bs {formatPrecio(prod, item.precio)}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#785E4F]">{prod?.descripcion || item.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* ── PÁGINA 3: CHOCOLATES, TÉS, JUGOS, FRAPPÉS, HELADOS & REFRESCOS ── */}
          <div className="bg-[#FAF6EF] rounded-3xl shadow-xl border border-[#E7DFD5] p-6 sm:p-10 relative space-y-8">
            
            {/* Header con Logo Chef Hat */}
            <div className="flex flex-col items-center justify-center pb-4 border-b-2 border-[#991B24]/20 relative">
              <div className="w-16 h-12 flex items-center justify-center mb-1">
                <img
                  src={DENCKER_ASSETS.logoPng}
                  alt="Dencker Hat"
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="font-serif font-black text-3xl sm:text-4xl uppercase text-[#991B24] tracking-wider">
                CHOCOLATES, TÉS & BEBIDAS
              </h2>
              <span className="text-[11px] font-mono font-bold tracking-widest text-[#785E4F] uppercase">
                Página 3 • Infusiones, Frappés, Helados y Jugos Frescos
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
              
              {/* Columna Izquierda: CHOCOLATES, TÉS & JUGOS */}
              <div className="space-y-8">
                
                {/* Chocolates */}
                <div className="space-y-3">
                  <h3 className="font-serif font-black text-2xl uppercase tracking-tight text-[#1E130C] border-b-2 border-[#1E130C] pb-1">
                    CHOCOLATES
                  </h3>
                  {[
                    { id: "prod_choc_leche", nombre: "Chocolate con leche", desc: "Chocolate, leche texturizada", precio: 22 },
                    { id: "prod_choc_marshmallow", nombre: "Chocolate con marshmallow", desc: "Chocolate, leche texturizada, marshmallow tostado", precio: 25 },
                    { id: "prod_choc_vainilla", nombre: "Chocolate vainilla", desc: "Chocolate, leche texturizada, esencia dulce de vainilla", precio: 25 },
                    { id: "prod_choc_agua", nombre: "Chocolate", desc: "Chocolate tradicional con agua", precio: 20 },
                  ].map((item) => {
                    const prod = getProd(item.id, item.nombre);
                    return (
                      <div key={item.id} className="flex items-baseline justify-between gap-2 border-b border-dotted border-[#E2D6C6] pb-1.5">
                        <div>
                          <span className="font-serif font-bold text-sm text-[#1E130C]">{prod ? prod.nombre : item.nombre}</span>
                          <p className="text-[11px] text-[#785E4F]">{prod?.descripcion || item.desc}</p>
                        </div>
                        <span className="font-serif font-bold text-sm text-[#991B24] shrink-0">Bs {formatPrecio(prod, item.precio)}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Tés */}
                <div className="space-y-3">
                  <h3 className="font-serif font-black text-2xl uppercase tracking-tight text-[#1E130C] border-b-2 border-[#1E130C] pb-1">
                    TES
                  </h3>
                  {[
                    { id: "prod_te_negro_verde", nombre: "Te negro o verde", precio: 12 },
                    { id: "prod_te_frutos_rojos", nombre: "Te frutos rojos", precio: 16 },
                    { id: "prod_te_verde_jazmin", nombre: "Te verde jazmin", precio: 15 },
                    { id: "prod_te_limon_jengibre", nombre: "Te limón jengibre y miel", precio: 20 },
                    { id: "prod_mates", nombre: "Mate: manzanilla, anis, coca, trimate", precio: 12 },
                    { id: "prod_chai_tea_latte", nombre: "Chai tea latte", precio: 22 },
                  ].map((item) => {
                    const prod = getProd(item.id, item.nombre);
                    return (
                      <div key={item.id} className="flex items-center justify-between gap-2 border-b border-dotted border-[#E2D6C6] pb-1">
                        <span className="font-serif font-bold text-sm text-[#1E130C]">{prod ? prod.nombre : item.nombre}</span>
                        <span className="font-serif font-bold text-sm text-[#991B24] shrink-0">Bs {formatPrecio(prod, item.precio)}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Jugos */}
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between border-b-2 border-[#1E130C] pb-1">
                    <h3 className="font-serif font-black text-2xl uppercase tracking-tight text-[#1E130C]">
                      JUGOS
                    </h3>
                    <div className="text-[11px] font-bold text-[#785E4F] flex gap-3">
                      <span>c/agua</span>
                      <span>c/leche</span>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between border-b border-dotted border-[#E2D6C6] pb-1">
                    <div>
                      <span className="font-serif font-bold text-sm text-[#1E130C]">TEMPORADA (una fruta)</span>
                      <p className="text-[11px] text-[#785E4F]">Frutilla, piña, limón, durazno, papaya, maracuyá</p>
                    </div>
                    <div className="flex gap-4 font-serif font-bold text-sm text-[#991B24]">
                      <span>Bs 15</span>
                      <span>Bs 20</span>
                    </div>
                  </div>
                  {[
                    { id: "prod_jugo_frutilla_naranja", nombre: "Mixto: Frutilla, naranja", precio: 22 },
                    { id: "prod_jugo_mango_naranja", nombre: "Mixto: Mango, naranja, maracuyá", precio: 25 },
                    { id: "prod_jugo_limon_hierbabuena", nombre: "Limón hierba buena", precio: 20 },
                    { id: "prod_jugo_pina_hierbabuena", nombre: "Piña hierba buena", precio: 20 },
                  ].map((item) => {
                    const prod = getProd(item.id, item.nombre);
                    return (
                      <div key={item.id} className="flex items-center justify-between border-b border-dotted border-[#E2D6C6] pb-1">
                        <span className="font-serif font-bold text-sm text-[#1E130C]">{prod ? prod.nombre : item.nombre}</span>
                        <span className="font-serif font-bold text-sm text-[#991B24]">Bs {formatPrecio(prod, item.precio)}</span>
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Columna Derecha: FRAPPÉS, HELADOS & REFRESCOS */}
              <div className="space-y-8">
                
                {/* Frappés */}
                <div className="space-y-3">
                  <h3 className="font-serif font-black text-2xl uppercase tracking-tight text-[#1E130C] border-b-2 border-[#1E130C] pb-1">
                    FRAPPÉS
                  </h3>
                  {[
                    { id: "prod_frappe_light", nombre: "Light", desc: "Expresso, leche, hielo, edulcorante o azúcar", precio: 24 },
                    { id: "prod_frappe_vainilla", nombre: "Vainilla", desc: "Expresso, leche, hielo, crema, salsa de caramelo", precio: 25 },
                    { id: "prod_frappe_mocha", nombre: "Mocha", desc: "Expresso, leche, hielo, chocolate, crema, salsa de chocolate", precio: 26 },
                    { id: "prod_frappe_oreo", nombre: "Oreo", desc: "Expresso, leche, hielo, galletas oreo, crema, salsa de chocolate", precio: 26 },
                    { id: "prod_frappe_dos_chocolates", nombre: "Dos chocolates", desc: "Expresso, leche, hielo, chispas de chocolate blanco y negro, crema, salsa de chocolate", precio: 26 },
                  ].map((item) => {
                    const prod = getProd(item.id, item.nombre);
                    return (
                      <div key={item.id} className="border-b border-dotted border-[#E2D6C6] pb-1.5">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-serif font-bold text-sm text-[#1E130C]">{prod ? prod.nombre : item.nombre}</span>
                          <span className="font-serif font-bold text-sm text-[#991B24]">Bs {formatPrecio(prod, item.precio)}</span>
                        </div>
                        <p className="text-[11px] text-[#785E4F]">{prod?.descripcion || item.desc}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Helados */}
                <div className="space-y-3">
                  <h3 className="font-serif font-black text-2xl uppercase tracking-tight text-[#1E130C] border-b-2 border-[#1E130C] pb-1">
                    HELADOS
                  </h3>
                  {[
                    { id: "prod_copa_vienesa_melva", nombre: "Copa Vienesa o Melva", precio: 35 },
                    { id: "prod_helado_simple", nombre: "Porción de helado simple", precio: 15 },
                    { id: "prod_helado_doble", nombre: "Porción de helado doble", precio: 20 },
                  ].map((item) => {
                    const prod = getProd(item.id, item.nombre);
                    return (
                      <div key={item.id} className="flex items-center justify-between border-b border-dotted border-[#E2D6C6] pb-1">
                        <span className="font-serif font-bold text-sm text-[#1E130C]">{prod ? prod.nombre : item.nombre}</span>
                        <span className="font-serif font-bold text-sm text-[#991B24]">Bs {formatPrecio(prod, item.precio)}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Refrescos */}
                <div className="space-y-3">
                  <h3 className="font-serif font-black text-2xl uppercase tracking-tight text-[#1E130C] border-b-2 border-[#1E130C] pb-1">
                    REFRESCOS
                  </h3>
                  {[
                    { id: "prod_iced_tea", nombre: "Iced tea", precio: 16 },
                    { id: "prod_gaseosa_500", nombre: "Gaseosas 500cc (Coca Cola, Fanta, Sprite)", precio: 10 },
                    { id: "prod_agua_500", nombre: "Agua 500cc (con o sin gas)", precio: 10 },
                  ].map((item) => {
                    const prod = getProd(item.id, item.nombre);
                    return (
                      <div key={item.id} className="flex items-center justify-between border-b border-dotted border-[#E2D6C6] pb-1">
                        <span className="font-serif font-bold text-sm text-[#1E130C]">{prod ? prod.nombre : item.nombre}</span>
                        <span className="font-serif font-bold text-sm text-[#991B24]">Bs {formatPrecio(prod, item.precio)}</span>
                      </div>
                    );
                  })}
                </div>

              </div>

            </div>

          </div>

          {/* ── PÁGINA 4: DULCES, POSTRES & MASITAS SALADAS ── */}
          <div className="bg-[#FAF6EF] rounded-3xl shadow-xl border border-[#E7DFD5] p-6 sm:p-10 relative space-y-8">
            
            {/* Header con Logo Chef Hat */}
            <div className="flex flex-col items-center justify-center pb-4 border-b-2 border-[#991B24]/20 relative">
              <div className="w-16 h-12 flex items-center justify-center mb-1">
                <img
                  src={DENCKER_ASSETS.logoPng}
                  alt="Dencker Hat"
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="font-serif font-black text-3xl sm:text-4xl uppercase text-[#991B24] tracking-wider">
                DULCES, POSTRES & SALADAS
              </h2>
              <span className="text-[11px] font-mono font-bold tracking-widest text-[#785E4F] uppercase">
                Página 4 • Hojaldres, Alfajores, Tortas y Masitas Tradicionales
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
              
              {/* Columna Izquierda: DULCES + Mascota Croissant con Lentes */}
              <div className="space-y-4">
                
                {/* Mascota Croissant Cool */}
                <div className="flex items-center gap-4 bg-white/70 p-3 rounded-2xl border border-[#E7DFD5]">
                  <div className="w-20 h-20 shrink-0">
                    <img
                      src={DENCKER_ASSETS.mascotCroissant}
                      alt="Croissant con gafas Dencker"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-2xl uppercase tracking-tight text-[#1E130C]">
                      DULCES
                    </h3>
                    <p className="text-[11px] text-[#785E4F]">Hojaldres 100% mantequilla noble y masas finas horneadas</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {[
                    { id: "prod_alfajor_maicena", nombre: "Alfajor de maicena", desc: "Galletas de maicena rellenas de dulce de leche con coco rallado", precio: 7.5 },
                    { id: "prod_muffin_arandanos", nombre: "Muffin de arándanos chocolate", desc: "", precio: 11.5 },
                    { id: "prod_alfajor_marplatense", nombre: "Alfajor marplatense", desc: "Galleta de alfajor rellena de dulce de leche con cubierta de chocolate", precio: 12.5 },
                    { id: "prod_cinnamon_roll", nombre: "Cinnamon roll", desc: "", precio: 13 },
                    { id: "prod_medialuna", nombre: "Media luna", desc: "Masa hojaldrada en forma de croissant", precio: 10.5 },
                    { id: "prod_new_york_roll", nombre: "New york roll", desc: "Masa hojaldrada circular con relleno y cobertura: chocolate, dulce de leche, pistacho", precio: 21 },
                    { id: "prod_bombitas", nombre: "Bombitas", desc: "Masa choux relleno con crema batida", precio: 10 },
                    { id: "prod_eclair", nombre: "E-clair", desc: "Masa choux relleno con crema pastelera decorado con glaseado de chocolate", precio: 9 },
                    { id: "prod_pencos", nombre: "Pencos", desc: "", precio: 10 },
                    { id: "prod_hojarascas", nombre: "Hojarascas", desc: "Masa hojaldrada rellena con crema pastelera", precio: 7.5 },
                    { id: "prod_brownie", nombre: "Brownie", desc: "", precio: 12.5 },
                    { id: "prod_galletas_chips", nombre: "Galletas con chips de chocolate", desc: "", precio: 9.5 },
                    { id: "prod_donas_rellenas", nombre: "Donas rellenas", desc: "", precio: 12.5 },
                    { id: "prod_babka", nombre: "Babka", desc: "", precio: 10 },
                  ].map((item) => {
                    const prod = getProd(item.id, item.nombre);
                    return (
                      <div key={item.id} className="border-b border-dotted border-[#E2D6C6] pb-1.5">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-serif font-bold text-sm text-[#1E130C]">{prod ? prod.nombre : item.nombre}</span>
                          <span className="font-serif font-bold text-sm text-[#991B24] shrink-0">Bs {formatPrecio(prod, item.precio)}</span>
                        </div>
                        {item.desc && <p className="text-[11px] text-[#785E4F]">{item.desc}</p>}
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Columna Derecha: POSTRES & MASITAS SALADAS */}
              <div className="space-y-8">
                
                {/* POSTRES */}
                <div className="space-y-3">
                  <h3 className="font-serif font-black text-2xl uppercase tracking-tight text-[#1E130C] border-b-2 border-[#1E130C] pb-1">
                    POSTRES
                  </h3>
                  {[
                    { id: "prod_tartaleta_chocolate", nombre: "Tartaleta de chocolate", precio: 20 },
                    { id: "prod_cheesecake", nombre: "Cheesecake", precio: 27 },
                    { id: "prod_torta_vasca", nombre: "Torta vasca", precio: 27 },
                    { id: "prod_torta_cafe", nombre: "Torta de café", precio: 17 },
                    { id: "prod_torta_chocolate", nombre: "Torta de chocolate", precio: 17 },
                    { id: "prod_pie_limon", nombre: "Pie de limón", precio: 18 },
                    { id: "prod_pie_manzana", nombre: "Pie de manzana", precio: 18 },
                    { id: "prod_tres_leches", nombre: "Tres leches", precio: 19 },
                    { id: "prod_mini_cake", nombre: "Mini cake (Chocolate, red velvet, zanahoria)", precio: 17 },
                    { id: "prod_crumble_manzana", nombre: "Crumble de manzana", precio: 19 },
                    { id: "prod_mil_hojas", nombre: "Mil hojas", precio: 19 },
                  ].map((item) => {
                    const prod = getProd(item.id, item.nombre);
                    return (
                      <div key={item.id} className="flex items-center justify-between border-b border-dotted border-[#E2D6C6] pb-1">
                        <span className="font-serif font-bold text-sm text-[#1E130C]">{prod ? prod.nombre : item.nombre}</span>
                        <span className="font-serif font-bold text-sm text-[#991B24]">Bs {formatPrecio(prod, item.precio)}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Separador a cuadros rojos y blancos */}
                <div className="w-full h-3 bg-[repeating-linear-gradient(45deg,#991B24,#991B24_10px,#FAF6EF_10px,#FAF6EF_20px)] rounded-full" />

                {/* MASITAS SALADAS */}
                <div className="space-y-3">
                  <h3 className="font-serif font-black text-2xl uppercase tracking-tight text-[#1E130C] border-b-2 border-[#1E130C] pb-1">
                    MASITAS SALADAS
                  </h3>
                  {[
                    { id: "prod_empanada_queso", nombre: "Empanada de queso", precio: 8.5 },
                    { id: "prod_cunape", nombre: "Cuñape", precio: 8.5 },
                    { id: "prod_cunape_frito", nombre: "Cuñape frito", precio: 7.5 },
                    { id: "prod_croissant_queso", nombre: "Croissant de queso", precio: 10 },
                    { id: "prod_italiano_jamon_queso", nombre: "Italianos de jamon y queso", precio: 12.5 },
                    { id: "prod_palitos_queso", nombre: "Palitos de queso", precio: 7.5 },
                    { id: "prod_empanada_ricota", nombre: "Empanada de ricota (integral)", precio: 10.5 },
                    { id: "prod_llaucha", nombre: "Llaucha paceña", precio: 12.5 },
                    { id: "prod_pan_arroz", nombre: "Pan de arroz", precio: 10.5 },
                    { id: "prod_sonso", nombre: "Sonso", precio: 15.5 },
                    { id: "prod_esfihas", nombre: "Esfihas", precio: 12 },
                  ].map((item) => {
                    const prod = getProd(item.id, item.nombre);
                    return (
                      <div key={item.id} className="flex items-center justify-between border-b border-dotted border-[#E2D6C6] pb-1">
                        <span className="font-serif font-bold text-sm text-[#1E130C]">{prod ? prod.nombre : item.nombre}</span>
                        <span className="font-serif font-bold text-sm text-[#991B24]">Bs {formatPrecio(prod, item.precio)}</span>
                      </div>
                    );
                  })}
                </div>

              </div>

            </div>

          </div>

          {/* ── PÁGINA 5: SÁNDWICHES, EXTRAS & ENSALADAS ── */}
          <div className="bg-[#FAF6EF] rounded-3xl shadow-xl border border-[#E7DFD5] p-6 sm:p-10 relative space-y-8">
            
            {/* Header con Logo Chef Hat */}
            <div className="flex flex-col items-center justify-center pb-4 border-b-2 border-[#991B24]/20 relative">
              <div className="w-16 h-12 flex items-center justify-center mb-1">
                <img
                  src={DENCKER_ASSETS.logoPng}
                  alt="Dencker Hat"
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="font-serif font-black text-3xl sm:text-4xl uppercase text-[#991B24] tracking-wider">
                SANDWICHES & ENSALADAS
              </h2>
              <span className="text-[11px] font-mono font-bold tracking-widest text-[#785E4F] uppercase">
                Página 5 • Arma tu Sándwich a tu Gusto, Guarniciones y Panes Nobles
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
              
              {/* Columna Izquierda: ARMA TU SÁNDWICH + Mascota Tostada */}
              <div className="space-y-6">
                
                {/* Sándwich especial Dencker */}
                <div className="p-5 rounded-2xl bg-white/80 border-2 border-[#991B24]/40 shadow-sm space-y-4">
                  <div className="flex items-baseline justify-between border-b border-[#991B24] pb-2">
                    <span className="font-serif font-black text-lg text-[#991B24]">
                      Sándwich especial Dencker
                    </span>
                    <span className="font-serif font-black text-xl text-[#991B24]">
                      Bs 40
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#1E130C] uppercase tracking-wider">
                    ARMA TU SANDWICH:
                  </p>

                  {/* Paso 1: Proteínas */}
                  <div className="p-3 rounded-xl bg-[#FAF6EF] border border-[#E5DACD] text-xs space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-[#991B24]">
                      <span className="w-5 h-5 rounded-full bg-[#991B24] text-white flex items-center justify-center text-[11px]">1</span>
                      <span>Elige DOS Proteínas:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[#1E130C] pl-7">
                      <span>• Pollo</span>
                      <span>• Tocino</span>
                      <span>• Jamón</span>
                      <span>• Salame</span>
                    </div>
                  </div>

                  {/* Paso 2: Complementos */}
                  <div className="p-3 rounded-xl bg-[#FAF6EF] border border-[#E5DACD] text-xs space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-[#991B24]">
                      <span className="w-5 h-5 rounded-full bg-[#991B24] text-white flex items-center justify-center text-[11px]">2</span>
                      <span>Elige TRES Complementos:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[#1E130C] pl-7">
                      <span>• Champiñones</span>
                      <span>• Choclo</span>
                      <span>• Cebolla</span>
                      <span>• Lechuga</span>
                      <span>• Tomate</span>
                      <span>• Queso</span>
                      <span>• Piña</span>
                      <span>• Palta</span>
                    </div>
                  </div>
                </div>

                {/* Mascota Tostada Sonriente con Zapatos */}
                <div className="pt-2 flex flex-col items-center justify-center">
                  <div className="w-44 h-44 flex items-center justify-center">
                    <img
                      src={DENCKER_ASSETS.mascotBread}
                      alt="Tostada Feliz Dencker"
                      className="w-full h-full object-contain drop-shadow"
                    />
                  </div>
                </div>

                {/* EXTRAS */}
                <div className="space-y-3 pt-2">
                  <h3 className="font-serif font-black text-2xl uppercase tracking-tight text-[#1E130C] border-b-2 border-[#1E130C] pb-1">
                    EXTRAS
                  </h3>
                  {[
                    { id: "prod_extra_papas", nombre: "Porción de papas fritas", precio: 15 },
                    { id: "prod_extra_palta", nombre: "Porción de palta", precio: 10 },
                    { id: "prod_extra_tocino", nombre: "Tocino", precio: 10 },
                    { id: "prod_extra_jamon", nombre: "Jamón", precio: 5 },
                    { id: "prod_extra_tostada", nombre: "Tostada", precio: 6 },
                    { id: "prod_extra_queso", nombre: "Queso", precio: 3 },
                  ].map((item) => {
                    const prod = getProd(item.id, item.nombre);
                    return (
                      <div key={item.id} className="flex items-center justify-between border-b border-dotted border-[#E2D6C6] pb-1">
                        <span className="font-serif font-bold text-sm text-[#1E130C]">{prod ? prod.nombre : item.nombre}</span>
                        <span className="font-serif font-bold text-sm text-[#991B24]">Bs {formatPrecio(prod, item.precio)}</span>
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Columna Derecha: SÁNDWICHES TRADICIONALES & ENSALADAS */}
              <div className="space-y-8">
                
                {/* Sándwiches Tradicionales */}
                <div className="space-y-3">
                  <h3 className="font-serif font-black text-2xl uppercase tracking-tight text-[#1E130C] border-b-2 border-[#1E130C] pb-1">
                    SANDWICHES
                  </h3>
                  {[
                    { id: "prod_sandwich_lomito", nombre: "Lomito", desc: "Lomito picado, cebolla salteada, pimentón, queso mozzarella, lechuga y tomate (pan a elección)", precio: 35 },
                    { id: "prod_sandwich_pesto", nombre: "Pesto", desc: "Filete de pollo grillado, pesto de albahaca, queso mozzarella, tomate, aceite de oliva (pan a elección)", precio: 35 },
                    { id: "prod_sandwich_st_germain", nombre: "St. Germain", desc: "Lomito picado, tocino, queso mozzarella, tomate, champiñones, mayonesa casera (pan a elección)", precio: 40 },
                    { id: "prod_sandwich_atun", nombre: "Atún", desc: "Atún, lechuga, tomate, pepinillo, mayonesa casera (pan a elección)", precio: 45 },
                    { id: "prod_sandwich_jamon_queso", nombre: "Jamón y queso", desc: "Jamón y queso mozzarella (pan a elección)", precio: 30 },
                    { id: "prod_croque_monsieur", nombre: "Croque Monsieur", desc: "Jamón, queso mozzarella, salsa bechamel en pan molde", precio: 30 },
                    { id: "prod_sandwich_pavita", nombre: "Pavita", desc: "Mayonesa de la casa, pollo, maíz (pan a elección)", precio: 27 },
                  ].map((item) => {
                    const prod = getProd(item.id, item.nombre);
                    return (
                      <div key={item.id} className="border-b border-dotted border-[#E2D6C6] pb-2">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-serif font-bold text-sm text-[#1E130C]">{prod ? prod.nombre : item.nombre}</span>
                          <span className="font-serif font-bold text-sm text-[#991B24] shrink-0">Bs {formatPrecio(prod, item.precio)}</span>
                        </div>
                        <p className="text-[11px] text-[#785E4F]">{prod?.descripcion || item.desc}</p>
                      </div>
                    );
                  })}
                </div>

                {/* PAN A ELECCIÓN */}
                <div className="p-4 rounded-2xl bg-white border border-[#E7DFD5] text-xs space-y-2">
                  <span className="font-serif font-black text-sm uppercase text-[#1E130C] block">
                    PAN A ELECCIÓN:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-[#1E130C]">
                    <span>• Pan molde blanco</span>
                    <span>• Pan molde integral</span>
                    <span>• Pan ciabatta</span>
                    <span>• Pan baguette</span>
                    <span className="col-span-2 text-[#991B24] font-bold">• Croissant (con 5 bs extra)</span>
                  </div>
                </div>

                {/* ENSALADAS */}
                <div className="space-y-3">
                  <h3 className="font-serif font-black text-2xl uppercase tracking-tight text-[#1E130C] border-b-2 border-[#1E130C] pb-1">
                    ENSALADAS
                  </h3>
                  {[
                    { id: "prod_ensalada_cesar", nombre: "Ensalada César", desc: "Lechuga, crutons, pollo y salsa cesar", precio: 30 },
                    { id: "prod_ensalada_thai", nombre: "Ensalada Thai", desc: "Lechuga, col, zanahoria, tomate cherry, gajos de naranja, pimentón caramelizado, pollo y tortilla tostada", precio: 30 },
                    { id: "prod_pasta_salad", nombre: "Pasta Salad", desc: "Pasta fusilli, lechuga, tomate cherry, pepino, choclitos, poroto negro, palta, pollo", precio: 35 },
                  ].map((item) => {
                    const prod = getProd(item.id, item.nombre);
                    return (
                      <div key={item.id} className="border-b border-dotted border-[#E2D6C6] pb-2">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-serif font-bold text-sm text-[#1E130C]">{prod ? prod.nombre : item.nombre}</span>
                          <span className="font-serif font-bold text-sm text-[#991B24] shrink-0">Bs {formatPrecio(prod, item.precio)}</span>
                        </div>
                        <p className="text-[11px] text-[#785E4F]">{prod?.descripcion || item.desc}</p>
                      </div>
                    );
                  })}
                </div>

              </div>

            </div>

          </div>

          {/* ── PÁGINA 6: PIZZAS ARTESANALES (PORCIONES 4, 6 Y 8) ── */}
          <div className="bg-[#FAF6EF] rounded-3xl shadow-xl border border-[#E7DFD5] p-6 sm:p-10 relative space-y-8">
            
            {/* Header con Logo Chef Hat */}
            <div className="flex flex-col items-center justify-center pb-4 border-b-2 border-[#991B24]/20 relative">
              <div className="w-16 h-12 flex items-center justify-center mb-1">
                <img
                  src={DENCKER_ASSETS.logoPng}
                  alt="Dencker Hat"
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="font-serif font-black text-3xl sm:text-4xl uppercase text-[#991B24] tracking-wider">
                PIZZAS ARTESANALES
              </h2>
              <span className="text-[11px] font-mono font-bold tracking-widest text-[#785E4F] uppercase">
                Página 6 • Masa Fermentada, Queso Mozzarella & Horno de Piedra
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
              
              {/* Columna Izquierda: ARMA TU PIZZA & Mascota Pizza Skater */}
              <div className="space-y-6">
                
                {/* Pizza Especial Dencker */}
                <div className="p-5 rounded-2xl bg-white/80 border-2 border-[#991B24]/40 shadow-sm space-y-4">
                  <div className="flex items-baseline justify-between border-b border-[#991B24] pb-2">
                    <span className="font-serif font-black text-lg text-[#991B24]">
                      PIZZA ESPECIAL DENCKER
                    </span>
                    <span className="font-serif font-black text-xl text-[#991B24]">
                      Bs 95
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#1E130C] uppercase tracking-wider">
                    ARMA TU PIZZA:
                  </p>

                  {/* Paso 1: Proteínas */}
                  <div className="p-3 rounded-xl bg-[#FAF6EF] border border-[#E5DACD] text-xs space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-[#991B24]">
                      <span className="w-5 h-5 rounded-full bg-[#991B24] text-white flex items-center justify-center text-[11px]">1</span>
                      <span>Elige DOS Proteínas:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[#1E130C] pl-7">
                      <span>• Jamón</span>
                      <span>• Carne</span>
                      <span>• Salame</span>
                      <span>• Pollo</span>
                      <span>• Tocino</span>
                      <span>• Anchoa</span>
                    </div>
                  </div>

                  {/* Paso 2: Complementos */}
                  <div className="p-3 rounded-xl bg-[#FAF6EF] border border-[#E5DACD] text-xs space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-[#991B24]">
                      <span className="w-5 h-5 rounded-full bg-[#991B24] text-white flex items-center justify-center text-[11px]">2</span>
                      <span>Elige TRES Complementos:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[#1E130C] pl-7">
                      <span>• Champiñón fresco</span>
                      <span>• Tomate deshidratado</span>
                      <span>• Cebolla</span>
                      <span>• Locoto</span>
                      <span>• Tomate</span>
                      <span>• Aceituna</span>
                      <span>• Piña</span>
                      <span>• Huevo</span>
                      <span>• Choclo</span>
                      <span>• Palmito</span>
                      <span>• Pimentón</span>
                      <span>• Albahaca</span>
                    </div>
                  </div>
                </div>

                {/* Mascota Pizza Skater con Gafas */}
                <div className="pt-2 flex flex-col items-center justify-center">
                  <div className="w-48 h-48 flex items-center justify-center">
                    <img
                      src={DENCKER_ASSETS.mascotPizza}
                      alt="Pizza Skater Dencker"
                      className="w-full h-full object-contain drop-shadow"
                    />
                  </div>
                </div>

              </div>

              {/* Columna Derecha: PIZZAS TRADICIONALES EN 4, 6 Y 8 PORCIONES */}
              <div className="space-y-4">
                
                <div className="border-b-2 border-[#1E130C] pb-2 flex items-baseline justify-between">
                  <h3 className="font-serif font-black text-2xl uppercase tracking-tight text-[#1E130C]">
                    PIZZAS
                  </h3>
                  <div className="text-xs font-serif font-bold text-[#991B24] flex gap-3 sm:gap-5">
                    <span className="w-8 text-center">4 porc</span>
                    <span className="w-8 text-center">6 porc</span>
                    <span className="w-8 text-center">8 porc</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { id: "prod_pizza_margarita", nombre: "Margarita", desc: "Salsa de tomate, mozzarella, tomate, albahaca y aceite de oliva", p4: 40, p6: 55, p8: 70 },
                    { id: "prod_pizza_jamon_queso", nombre: "Jamón y queso", desc: "Salsa de tomate, mozzarella y jamon", p4: 35, p6: 50, p8: 65 },
                    { id: "prod_pizza_hawaina", nombre: "Hawaina", desc: "Salsa de tomate, mozzarella, jamón, piña", p4: 40, p6: 55, p8: 70 },
                    { id: "prod_pizza_funghi", nombre: "Pizza funghi", desc: "Salsa de tomate, mozzarella, champiñones frescos y jamón", p4: 35, p6: 50, p8: 65 },
                    { id: "prod_pizza_choclo", nombre: "Choclo amarillo", desc: "Salsa de tomate, mozzarella, choclo amarillo, tocino", p4: 35, p6: 50, p8: 70 },
                    { id: "prod_pizza_bacon", nombre: "Bacon", desc: "Salsa de tomate, mozzarella, tocino, cebolla", p4: 40, p6: 55, p8: 70 },
                    { id: "prod_pizza_palmito", nombre: "Palmito", desc: "Salsa de tomate, mozzarella, palmitos, jamón, aceitunas, huevo", p4: 40, p6: 55, p8: 70 },
                    { id: "prod_pizza_portuguesa", nombre: "Portuguesa", desc: "Salsa de tomate, mozzarella, jamón, tomate, huevo, choclo amarillo, cebolla y aceitunas", p4: 45, p6: 55, p8: 80 },
                    { id: "prod_pizza_criolla", nombre: "Criolla", desc: "Salsa de tomate, mozzarella, carne molida, cebolla, tomate", p4: 45, p6: 65, p8: 80 },
                    { id: "prod_pizza_salame", nombre: "Salame", desc: "Salsa de tomate, mozzarella, salame, champiñones frescos, cebolla", p4: 45, p6: 65, p8: 80 },
                    { id: "prod_pizza_pollo", nombre: "Pollo", desc: "Salsa de tomate, mozzarella, pollo desmenuzado, queso catupiri", p4: 45, p6: 65, p8: 80 },
                  ].map((p) => {
                    const prod = getProd(p.id, p.nombre);
                    // Si el admin editó el precio base de la pizza de 4 porciones en el store:
                    const basePrice = prod ? prod.precio : p.p4;
                    const ratio = basePrice / p.p4;
                    const p6Display = Math.round(p.p6 * ratio);
                    const p8Display = Math.round(p.p8 * ratio);

                    return (
                      <div key={p.id} className="border-b border-dotted border-[#E2D6C6] pb-2">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-serif font-bold text-sm text-[#1E130C]">{prod ? prod.nombre : p.nombre}</span>
                          <div className="flex gap-3 sm:gap-5 text-sm font-serif font-black text-[#991B24]">
                            <span className="w-8 text-center">{basePrice}</span>
                            <span className="w-8 text-center">{p6Display}</span>
                            <span className="w-8 text-center">{p8Display}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-[#785E4F]">{prod?.descripcion || p.desc}</p>
                      </div>
                    );
                  })}
                </div>

              </div>

            </div>

          </div>

        </main>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODO 3: CARPAS QR DE MESA (IMPRIMIBLES)
      ══════════════════════════════════════════════════════════════ */}
      {modo === "carpas_qr" && (
        <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
          
          <div className="p-4 rounded-3xl bg-white border border-[#E5DACD] shadow-sm flex flex-wrap items-center justify-between gap-4 print:hidden">
            <div>
              <h2 className="font-serif font-bold text-lg text-stone-900">
                Carpas QR de Mesa Imprimibles
              </h2>
              <p className="text-xs text-stone-500">
                Imprime en cartulina A4 o papel couché. Cada comensal escanea el QR y pide directo a cocina.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={mesaFiltroCarpas}
                onChange={(e) => {
                  const val = e.target.value === "todas" ? "todas" : parseInt(e.target.value);
                  setMesaFiltroCarpas(val);
                }}
                className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-800"
              >
                <option value="todas">Imprimir Todas las Mesas (1 al 20)</option>
                {mesas.map((m) => (
                  <option key={m.id} value={m.numero}>
                    Solo Mesa {m.numero}
                  </option>
                ))}
              </select>

              <button
                onClick={handleImprimir}
                className="px-4 py-2 rounded-xl bg-[#991B24] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer size={15} />
                <span>Imprimir Carpas</span>
              </button>
            </div>
          </div>

          {/* Grid de Carpas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mesasParaCarpas.map((mesa) => {
              const urlMesa = `${baseUrl}/mesa/${mesa.numero}`;
              return (
                <div
                  key={mesa.id}
                  className="bg-[#FAF6EF] p-6 rounded-3xl border-2 border-[#991B24]/40 shadow-lg text-center flex flex-col items-center justify-between space-y-4 print:border-2 print:border-black print:break-inside-avoid print:shadow-none"
                >
                  {/* Toldo mini */}
                  <div className="w-full h-8 rounded-t-xl overflow-hidden flex border-b-2 border-[#7F1D1D]">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-full ${i % 2 === 0 ? "bg-[#991B24]" : "bg-[#FAF6EF]"}`}
                      />
                    ))}
                  </div>

                  <div className="space-y-1">
                    <div className="w-12 h-10 mx-auto">
                      <img
                        src={DENCKER_ASSETS.logoPng}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="font-serif font-black text-2xl uppercase text-[#991B24] block">
                      MESA {mesa.numero}
                    </span>
                    <span className="text-[11px] font-sans text-[#785E4F] block">
                      Escanea para ver la carta y pedir a cocina
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border-2 border-[#E7DFD5] shadow-xs">
                    <QRCodeSVG value={urlMesa} size={150} level="M" />
                  </div>

                  <div className="space-y-1 text-center w-full pt-2 border-t border-dashed border-[#E2D6C6]">
                    <span className="text-[11px] font-bold text-[#1E130C] block">
                      DENCKER COFFEE & PAN
                    </span>
                    <span className="text-[10px] text-[#785E4F] block">
                      Wi-Fi: <strong className="text-[#991B24]">Dencker_Clientes</strong> • Pass: <strong className="text-[#991B24]">panfresco123</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </main>
      )}

      {/* ── FOOTER DE LA CARTA (PRINT FRIENDLY) ── */}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center text-xs text-[#785E4F] border-t border-[#E7DFD5] space-y-2 mt-12 print:border-t print:border-black">
        <div className="flex items-center justify-center gap-2">
          <img
            src={DENCKER_ASSETS.logoPng}
            alt="Dencker"
            className="w-6 h-6 object-contain"
          />
          <span className="font-serif font-bold text-[#1E130C] text-sm">
            DENCKER COFFEE & PANADERÍA S.R.L.
          </span>
        </div>
        <p>
          Av. Daniel Salamanca, Cochabamba, Bolivia • WhatsApp Pedidos: +591 76911000
        </p>
        <p className="text-[10px] text-stone-400">
          Café de Especialidad 4 Llamas (1,700 msnm Caranavi) • Panadería de Masa Madre con 24h de Fermentación
        </p>
      </footer>

    </div>
  );
}

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
  BookOpen,
  Plus,
  Minus,
  ShoppingBag,
  Check,
  MessageCircle,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useSystemStore, useCartStore, useUIStore } from "@/store";
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

  const [modo, setModo] = useState<ModoMenu>("dinamico_vivo");
  const [mostrarFotos, setMostrarFotos] = useState<boolean>(true);

  // Integración activa con el Carrito y Tienda Oficial
  const { items, addItem, updateCantidad, total, count } = useCartStore();
  const { setCartOpen } = useUIStore();
  const cartCount = count();
  const cartTotal = total();
  const [feedbackAgregado, setFeedbackAgregado] = useState<string | null>(null);

  const getItemCantidadEnCarrito = (id: string): number => {
    const item = items.find((i) => i.producto.id === id);
    return item ? item.cantidad : 0;
  };

  const handleAgregarRapido = (
    item: { id: string; nombre: string; precio: number; desc?: string },
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    let prod = getProd(item.id, item.nombre);
    if (!prod) {
      prod = {
        id: item.id,
        categoria_id: "c_saladas",
        nombre: item.nombre,
        descripcion: item.desc || "",
        precio: item.precio,
        costo: item.precio * 0.4,
        imagen_url: "/img/brand/logo-3-don-dencker-badge.png",
        disponible: true,
        es_mas_vendido: false,
        chips_personalizacion: [],
        stock: 50,
        estacion: "vitrina",
      };
    }
    addItem(prod);
    soundManager.playPastryCrinkle();
    setFeedbackAgregado(prod.nombre);
    setTimeout(() => setFeedbackAgregado(null), 1800);
  };

  const renderItemFila = (
    item: { id: string; nombre: string; precio: number; desc?: string },
    tamano: "normal" | "destacado" = "normal"
  ) => {
    const prod = getProd(item.id, item.nombre);
    const cant = prod && prod.id ? getItemCantidadEnCarrito(prod.id) : 0;
    const precioFinal = formatPrecio(prod, item.precio);

    return (
      <div
        key={item.id}
        className={`group border-b border-dotted border-[#E2D6C6] transition hover:bg-amber-500/10 px-2.5 -mx-2.5 rounded-xl flex flex-col justify-center ${
          tamano === "destacado" ? "py-2.5" : "py-1.5"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2 min-w-0">
            <span
              className={`font-serif font-bold text-[#1E130C] group-hover:text-[#991B24] transition ${
                tamano === "destacado" ? "text-base" : "text-sm"
              }`}
            >
              {prod ? prod.nombre : item.nombre}
            </span>
            {cant > 0 && (
              <span className="print:hidden text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 shadow-2xs shrink-0">
                {cant} en pedido
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`font-serif font-black text-[#991B24] ${
                tamano === "destacado" ? "text-base" : "text-sm"
              }`}
            >
              Bs {precioFinal}
            </span>

            {/* Botón táctil para añadir a la canasta (se oculta al imprimir) */}
            <button
              type="button"
              onClick={(e) => handleAgregarRapido(item, e)}
              className="print:hidden w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-[#1E130C] hover:bg-[#991B24] text-white flex items-center justify-center transition shadow-xs active:scale-90 cursor-pointer text-xs font-bold border border-amber-400/40 group-hover:scale-105"
              title={`Añadir ${prod ? prod.nombre : item.nombre} al pedido`}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {(item.desc || prod?.descripcion) && (
          <p className="text-[11px] text-[#785E4F] leading-tight mt-0.5 pr-8">
            {prod?.descripcion || item.desc}
          </p>
        )}
      </div>
    );
  };
  const [fotoModal, setFotoModal] = useState<{
    url: string;
    originalUrl?: string;
    corteUrl?: string;
    titulo: string;
    desc?: string;
    precio?: number | string;
    viendoCorte?: boolean;
  } | null>(null);
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
    <div className="min-h-screen bg-[#FAF7F2] text-[#1E130C] font-sans print:bg-white print:p-0 selection:bg-[#EAE0D3] relative">
      {/* Textura sutil y cálida de panadería (idéntica al landing page) */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#1E130C_1px,transparent_1px)] [background-size:16px_16px] print:hidden" />
      
      {/* ── SUB-BARRA DE CONTROL EDITORIAL (DEBAJO DE ROLENAV) ── */}
      <section className="w-full bg-[#1E130C] border-b border-amber-900/30 text-white py-3 px-4 sm:px-6 lg:px-8 print:hidden shadow-md">
        <div className="w-full max-w-[1560px] mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Identidad de la Carta */}
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <span className="font-serif text-sm font-bold text-white tracking-wide">
                  Carta Oficial &amp; Menú Físico
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 hidden sm:inline">
                  6 Páginas Reales
                </span>
              </div>
              <span className="text-[10px] text-amber-200/70 font-sans block">
                Café 4 Llamas de Especialidad &bull; Panadería Artesanal Cochabamba
              </span>
            </div>
          </div>

          {/* Selector de Modo */}
          <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10 overflow-x-auto scrollbar-none">
            <button
              onClick={() => { soundManager.playTactileClick(); setModo("dinamico_vivo"); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                modo === "dinamico_vivo"
                  ? "bg-[#991B24] text-white shadow-xs"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              <Sparkles size={13} className="text-amber-300 shrink-0" />
              <span>Carta Editorial + Fotos</span>
            </button>
            <button
              onClick={() => { soundManager.playTactileClick(); setModo("oficial_pdf"); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                modo === "oficial_pdf"
                  ? "bg-[#991B24] text-white shadow-xs"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              <BookOpen size={13} className="shrink-0" />
              <span>PDF Escaneado</span>
            </button>
            <button
              onClick={() => { soundManager.playTactileClick(); setModo("carpas_qr"); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap hidden md:flex ${
                modo === "carpas_qr"
                  ? "bg-[#991B24] text-white shadow-xs"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              <QrCode size={13} className="shrink-0" />
              <span>Carpas QR</span>
            </button>
          </div>

          {/* Acciones de Exportación */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleImprimir}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Imprimir en hojas A4 limpias"
            >
              <Printer size={14} className="text-amber-300 shrink-0" />
              <span className="hidden sm:inline">Imprimir A4</span>
            </button>

            <a
              href={DENCKER_ASSETS.menuPdfDownload}
              download="MENU_DENCKER_OFICIAL.pdf"
              onClick={() => soundManager.playPastryCrinkle()}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs active:scale-95 whitespace-nowrap"
            >
              <Download size={14} className="shrink-0" />
              <span className="hidden sm:inline">Descargar PDF</span>
              <span className="sm:hidden">PDF</span>
            </a>

            <button
              onClick={handleCopiarLink}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Copiar enlace del menú"
            >
              {copiadoLink ? <CheckCircle2 size={15} className="text-emerald-400" /> : <Copy size={15} />}
            </button>

            {esAdmin && (
              <Link
                href="/admin?tab=productos"
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Editar precios en el Administrador"
              >
                <Settings size={15} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── BARRA STICKY DE SECCIONES (IDÉNTICA A LA NAVEGACIÓN DEL LANDING) ── */}
      <nav className="sticky top-16 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EAE2D5] py-2.5 px-4 sm:px-6 lg:px-8 shadow-xs print:hidden">
        <div className="w-full max-w-[1560px] mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-[11px] font-bold text-[#785E4F] uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
              Secciones:
            </span>
            <button
              type="button"
              onClick={() => document.getElementById("menu-pagina-1")?.scrollIntoView({ behavior: "smooth" })}
              className="px-3 py-1 rounded-full bg-white hover:bg-[#991B24] hover:text-white border border-[#EAE2D5] text-xs font-bold text-[#1E130C] transition flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
            >
              <span>🏠 Portada</span>
            </button>
            <button
              type="button"
              onClick={() => document.getElementById("menu-pagina-2")?.scrollIntoView({ behavior: "smooth" })}
              className="px-3 py-1 rounded-full bg-white hover:bg-[#991B24] hover:text-white border border-[#EAE2D5] text-xs font-bold text-[#1E130C] transition flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
            >
              <span>☕ Cafés &amp; Desayunos</span>
            </button>
            <button
              type="button"
              onClick={() => document.getElementById("menu-pagina-3")?.scrollIntoView({ behavior: "smooth" })}
              className="px-3 py-1 rounded-full bg-white hover:bg-[#991B24] hover:text-white border border-[#EAE2D5] text-xs font-bold text-[#1E130C] transition flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
            >
              <span>🧃 Tés &amp; Refrescos</span>
            </button>
            <button
              type="button"
              onClick={() => document.getElementById("menu-pagina-4")?.scrollIntoView({ behavior: "smooth" })}
              className="px-3 py-1 rounded-full bg-white hover:bg-[#991B24] hover:text-white border border-[#EAE2D5] text-xs font-bold text-[#1E130C] transition flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
            >
              <span>🥐 Pastelería</span>
            </button>
            <button
              type="button"
              onClick={() => document.getElementById("menu-pagina-5")?.scrollIntoView({ behavior: "smooth" })}
              className="px-3 py-1 rounded-full bg-white hover:bg-[#991B24] hover:text-white border border-[#EAE2D5] text-xs font-bold text-[#1E130C] transition flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
            >
              <span>🥪 Sándwiches</span>
            </button>
            <button
              type="button"
              onClick={() => document.getElementById("menu-pagina-6")?.scrollIntoView({ behavior: "smooth" })}
              className="px-3 py-1 rounded-full bg-white hover:bg-[#991B24] hover:text-white border border-[#EAE2D5] text-xs font-bold text-[#1E130C] transition flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
            >
              <span>🍕 Pizzas</span>
            </button>
          </div>

          {modo === "dinamico_vivo" && (
            <button
              onClick={() => { soundManager.playTactileClick(); setMostrarFotos((prev) => !prev); }}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0 border ${
                mostrarFotos
                  ? "bg-amber-500/15 text-amber-900 border-amber-500/30"
                  : "bg-white text-stone-500 border-stone-300"
              }`}
              title="Mostrar u ocultar fotos gastronómicas"
            >
              <Eye size={13} />
              <span>{mostrarFotos ? "Fotos ON" : "Fotos OFF"}</span>
            </button>
          )}
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════
          MODO 1: VISUALIZADOR OFICIAL DEL PDF (6 PÁGINAS ESCANEADAS)
      ══════════════════════════════════════════════════════════════ */}
      {modo === "oficial_pdf" && (
        <main className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 space-y-8 relative z-10">
          
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
            <div className="w-full flex flex-col items-center space-y-12 max-w-4xl mx-auto py-2 print:block print:space-y-0">
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
                  style={{ width: `${zoomLevel}%`, maxWidth: "1150px" }}
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
        <main className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 space-y-8 relative z-10">



          {/* ── GRID DOBLE PÁGINA (EDITORIAL BISTRO EN PANTALLAS ANCHAS) ── */}
          <div className="w-full flex flex-col items-center space-y-12 sm:space-y-16 print:space-y-0">
          
          {/* ── PÁGINA 1: PORTADA OFICIAL (TOLDO VINTAGE + ME NU + DON DENCKER) ── */}
          <div id="menu-pagina-1" className="w-full max-w-4xl bg-[#FAF6EF] rounded-3xl shadow-xl border-2 border-[#991B24]/20 overflow-hidden relative flex flex-col justify-between min-h-0 md:min-h-0 md:min-h-[1020px] p-4 sm:p-8 lg:p-12 text-center print-page space-y-6">
            
            {/* Toldo a rayas rojas y crema de mayor presencia y escala */}
            <div className="w-full h-28 sm:h-36 -mt-6 sm:-mt-10 rounded-b-[42px] overflow-hidden shadow-lg flex relative border-b-4 border-[#7F1D1D] shrink-0">
              {[...Array(16)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-full ${
                    i % 2 === 0 ? "bg-[#991B24]" : "bg-[#FAF6EF]"
                  } border-r border-[#991B24]/20`}
                />
              ))}
            </div>

            {/* Cabecera & Título Central ME NU + Don Dencker en Gran Escala */}
            <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center my-auto py-4">
              
              {/* Bloque ME NU Retro Imponente */}
              <div className="md:col-span-5 text-center md:text-left flex flex-col justify-center items-center md:items-start">
                <div className="space-y-0 leading-none">
                  <h2 className="text-[#991B24] font-black tracking-tighter text-8xl sm:text-[10rem] lg:text-[11rem] leading-[0.8] font-serif uppercase drop-shadow-sm select-none">
                    ME
                  </h2>
                  <h2 className="text-[#991B24] font-black tracking-tighter text-8xl sm:text-[10rem] lg:text-[11rem] leading-[0.8] font-serif uppercase drop-shadow-sm select-none">
                    NU
                  </h2>
                </div>
                <div className="mt-5 pt-4 border-t-3 border-[#991B24] w-full max-w-[260px]">
                  <p className="font-serif font-black text-sm sm:text-base uppercase tracking-widest text-[#1E130C]">
                    Carta Oficial
                  </p>
                  <p className="text-xs sm:text-sm text-[#785E4F] font-medium italic mt-0.5">
                    Café 4 Llamas &amp; Panadería Artesanal
                  </p>
                </div>
              </div>

              {/* Mascota Don Dencker con Taza (Agrandado, Nítido y Prominente) */}
              <div className="md:col-span-7 flex flex-col items-center justify-center relative">
                <div className="relative w-72 sm:w-96 h-88 sm:h-[420px] flex items-center justify-center">
                  <img
                    src={DENCKER_ASSETS.mascotClean}
                    alt="Don Dencker Mascota Oficial"
                    className="w-full h-full object-contain drop-shadow-2xl select-none transform hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>

            </div>

            {/* Vitrina de Especialidades de la Casa (Tarjetas Más Grandes, Armónicas y Robustas) */}
            {mostrarFotos && (
              <div className="w-full p-5 sm:p-6 rounded-2xl bg-white/95 border-2 border-[#991B24]/20 shadow-md print:my-2 print:border-black/20 text-left shrink-0">
                <div className="flex items-center justify-between mb-4 border-b-2 border-[#991B24]/15 pb-2.5">
                  <span className="text-xs sm:text-sm font-mono font-black tracking-wider text-[#991B24] uppercase flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500" />
                    Iconos &amp; Especialidades de la Casa
                  </span>
                  <span className="text-xs text-[#785E4F] font-bold hidden sm:inline">
                    Horneado fresco a mano cada mañana
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Item 1: Tartaleta */}
                  <div
                    onClick={() => setFotoModal({
                      url: "/img/products/tartaleta_chocolate_artesanal.jpg",
                      originalUrl: "/img/products/tartaleta_chocolate_artesanal.jpg",
                      corteUrl: "/img/products/tartaleta_chocolate_corte.jpg",
                      titulo: "Tartaleta de Chocolate Belga",
                      desc: "Masa sablée crujiente dorada, ganache puro de chocolate oscuro belga, quenelles suaves de mousse y disco sablé con cacao fino.",
                      precio: 20
                    })}
                    className="flex flex-col items-center text-center cursor-pointer group p-3 rounded-2xl hover:bg-stone-50 transition border border-stone-200/60 shadow-2xs hover:shadow-md"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-[#991B24] shadow-md mb-2 bg-stone-100 group-hover:scale-105 transition">
                      <img
                        src="/img/products/tartaleta_chocolate_artesanal.jpg"
                        alt="Tartaleta de Chocolate"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="font-serif font-black text-xs sm:text-sm text-[#1E130C] leading-snug block truncate w-full">Tartaleta Belga</span>
                    <span className="text-[11px] sm:text-xs text-white font-bold bg-[#991B24] px-2.5 py-0.5 rounded-full mt-1 shadow-xs">Bs 20</span>
                  </div>

                  {/* Item 2: Queque Japonés */}
                  <div
                    onClick={() => setFotoModal({
                      url: "/img/products/queque_japones_artesanal.jpg",
                      originalUrl: "/img/products/queque_japones_artesanal.jpg",
                      corteUrl: "/img/products/queque_japones_corte.jpg",
                      titulo: "Queque Japonés (Cotton Soufflé)",
                      desc: "Famoso soufflé cake japonés ultra esponjoso y aireado con textura de nube que se deshace en boca. Horneado al baño maría.",
                      precio: 25
                    })}
                    className="flex flex-col items-center text-center cursor-pointer group p-3 rounded-2xl hover:bg-stone-50 transition border border-stone-200/60 shadow-2xs hover:shadow-md"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-amber-600 shadow-md mb-2 bg-stone-100 group-hover:scale-105 transition">
                      <img
                        src="/img/products/queque_japones_artesanal.jpg"
                        alt="Queque Japonés"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="font-serif font-black text-xs sm:text-sm text-[#1E130C] leading-snug block truncate w-full">Queque Japonés</span>
                    <span className="text-[11px] sm:text-xs text-white font-bold bg-[#991B24] px-2.5 py-0.5 rounded-full mt-1 shadow-xs">Bs 25</span>
                  </div>

                  {/* Item 3: Expresso 4 Llamas */}
                  <div
                    onClick={() => setFotoModal({
                      url: "/img/products/espresso_4_llamas.jpg",
                      originalUrl: "/img/products/espresso_4_llamas.jpg",
                      corteUrl: "/img/products/cafe_4llamas_pack_gourmet.jpg",
                      titulo: "Café Expresso 4 Llamas de Especialidad",
                      desc: "Extracción pura de 30cc con granos bolivianos 4 Llamas de Caranavi (1,700 msnm). Crema color avellana atigrada.",
                      precio: 15
                    })}
                    className="flex flex-col items-center text-center cursor-pointer group p-3 rounded-2xl hover:bg-stone-50 transition border border-stone-200/60 shadow-2xs hover:shadow-md"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-amber-800 shadow-md mb-2 bg-stone-100 group-hover:scale-105 transition">
                      <img
                        src="/img/products/espresso_4_llamas.jpg"
                        alt="Expresso 4 Llamas"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="font-serif font-black text-xs sm:text-sm text-[#1E130C] leading-snug block truncate w-full">Café 4 Llamas</span>
                    <span className="text-[11px] sm:text-xs text-white font-bold bg-[#991B24] px-2.5 py-0.5 rounded-full mt-1 shadow-xs">Bs 15</span>
                  </div>

                  {/* Item 4: Cuñapé Tradicional */}
                  <div
                    onClick={() => setFotoModal({
                      url: "/img/products/cunape_caliente_tradicional.jpg",
                      originalUrl: "/img/products/cunape_caliente_tradicional.jpg",
                      corteUrl: "/img/products/cunape_tradicional_real.jpg",
                      titulo: "Cuñapé Caliente Tradicional",
                      desc: "Almidón de yuca y queso criollo fundido recién horneado, crocante por fuera y elástico por dentro.",
                      precio: 8.5
                    })}
                    className="flex flex-col items-center text-center cursor-pointer group p-3 rounded-2xl hover:bg-stone-50 transition border border-stone-200/60 shadow-2xs hover:shadow-md"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-amber-600 shadow-md mb-2 bg-stone-100 group-hover:scale-105 transition">
                      <img
                        src="/img/products/cunape_caliente_tradicional.jpg"
                        alt="Cuñapé Caliente"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="font-serif font-black text-xs sm:text-sm text-[#1E130C] leading-snug block truncate w-full">Cuñapé Caliente</span>
                    <span className="text-[11px] sm:text-xs text-white font-bold bg-[#991B24] px-2.5 py-0.5 rounded-full mt-1 shadow-xs">Bs 8.5</span>
                  </div>
                </div>
              </div>
            )}

            {/* Sello de Esencia Artesanal Dencker Pan */}
            <div className="w-full px-5 py-3 rounded-2xl bg-amber-500/10 border-2 border-[#991B24]/15 flex items-center justify-between text-xs sm:text-sm text-[#785E4F] shrink-0">
              <span className="font-serif font-black text-[#1E130C]">
                Masa Madre &bull; Fermentación 24h &bull; Mantequilla Pura
              </span>
              <span className="font-mono text-xs sm:text-sm font-black text-[#991B24]">
                Cochabamba &bull; Bolivia
              </span>
            </div>

            {/* Barra Inferior DENCKER COFFEE (Armonizada con Pág. 02) */}
            <div className="w-full mt-auto bg-[#991B24] text-white py-4 px-6 rounded-2xl shadow-lg flex items-center justify-between gap-3 shrink-0">
              <span className="font-serif font-black tracking-widest text-lg sm:text-xl uppercase">
                DENCKER COFFEE
              </span>
              <span className="text-xs sm:text-sm font-sans font-semibold tracking-wide text-amber-200 hidden sm:inline">
                Av. Daniel Salamanca, Cochabamba • Bolivia
              </span>
              <span className="font-serif font-bold text-xs sm:text-sm px-3.5 py-1 rounded-full bg-white/20 text-white shadow-xs">
                Pág. 01
              </span>
            </div>

          </div>

          {/* ── PÁGINA 2: DESAYUNOS, CAFÉS (4 LLAMAS) & LATTES ── */}
          <div id="menu-pagina-2" className="w-full max-w-4xl bg-[#FAF6EF] rounded-3xl shadow-xl border-2 border-[#991B24]/20 overflow-hidden relative flex flex-col justify-between min-h-0 md:min-h-[1020px] p-4 sm:p-8 lg:p-12 print-page space-y-8">
            
            {/* Header Oficial: Mascota Café Barista & Sello Catuaí Caranavi */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b-2 border-[#991B24]/25 relative">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
                  <img
                    src="/img/brand/mascot-coffee.png"
                    alt="Mascota Café Barista Dencker"
                    className="w-full h-full object-contain drop-shadow-md select-none transform hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#991B24] uppercase block">
                    Cochabamba &bull; 4 Llamas Specialty Coffee
                  </span>
                  <h2 className="font-serif font-black text-2xl sm:text-4xl uppercase text-[#991B24] tracking-tight">
                    DESAYUNOS & CAFÉS
                  </h2>
                  <p className="text-xs sm:text-sm text-[#785E4F]">
                    Granos de altura Caranavi "Café 4 Llamas" (1,700 msnm) &amp; horneados frescos
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <img
                  src="/img/brand/cafe-catuai-badge-hd.png"
                  alt="Catuaí Lavado Caranavi"
                  className="h-12 w-auto object-contain drop-shadow-xs"
                />
                <span className="font-serif font-bold text-xs px-3.5 py-1.5 rounded-full bg-[#991B24] text-white shadow-xs">
                  Pág. 02
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
              
              {/* Columna Izquierda: DESAYUNOS */}
              <div className="space-y-6">
                <div className="border-b-2 border-[#1E130C] pb-1">
                  <h3 className="font-serif font-black text-2xl uppercase tracking-tight text-[#1E130C]">
                    DESAYUNOS
                  </h3>
                </div>

                {mostrarFotos && (
                  <div className="grid grid-cols-2 gap-2.5 pb-1">
                    <div
                      onClick={() => setFotoModal({
                        url: "/img/products/medialuna_hojaldrada.jpg",
                        originalUrl: "/img/products/medialuna_hojaldrada.jpg",
                        titulo: "Medialuna Hojaldrada de Desayuno",
                        desc: "Clásica medialuna artesanal de masa hojaldrada con 100% mantequilla pura, dorada y brillante para acompañar tu café matutino.",
                        precio: 10.5
                      })}
                      className="bg-white/90 p-2 rounded-xl border border-[#E7DFD5] flex items-center gap-2.5 cursor-pointer hover:border-[#991B24]/40 transition group shadow-2xs"
                    >
                      <img
                        src="/img/products/medialuna_hojaldrada.jpg"
                        alt="Medialuna Hojaldrada"
                        className="w-12 h-12 rounded-lg object-cover shrink-0 group-hover:scale-105 transition"
                      />
                      <div className="min-w-0">
                        <span className="font-serif font-bold text-xs text-[#1E130C] block truncate">Medialuna Noble</span>
                        <span className="text-[10px] text-[#785E4F] block">100% Mantequilla</span>
                        <span className="font-serif font-bold text-xs text-[#991B24]">Bs 10.5</span>
                      </div>
                    </div>

                    <div
                      onClick={() => setFotoModal({
                        url: "/img/products/croissant_queso_real.jpg",
                        originalUrl: "/img/products/croissant_queso_real.jpg",
                        titulo: "Croissant de Queso Caliente",
                        desc: "Hojaldre francés crujiente con abundante queso fundido al calor del horno, perfecto para el desayuno.",
                        precio: 10
                      })}
                      className="bg-white/90 p-2 rounded-xl border border-[#E7DFD5] flex items-center gap-2.5 cursor-pointer hover:border-[#991B24]/40 transition group shadow-2xs"
                    >
                      <img
                        src="/img/products/croissant_queso_real.jpg"
                        alt="Croissant de Queso"
                        className="w-12 h-12 rounded-lg object-cover shrink-0 group-hover:scale-105 transition"
                      />
                      <div className="min-w-0">
                        <span className="font-serif font-bold text-xs text-[#1E130C] block truncate">Croissant Queso</span>
                        <span className="text-[10px] text-[#785E4F] block">Recién horneado</span>
                        <span className="font-serif font-bold text-xs text-[#991B24]">Bs 10</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {
  [
                    { id: "prod_rise_shine", nombre: "Rise & Shine", desc: "Huevos revueltos, tostadas, tomate, queso criollo, granola con yogurt, café o té", precio: 45 },
                    { id: "prod_jamon_palta", nombre: "Jamón y palta", desc: "Tostadas con porción de jamón y palta, café o té", precio: 30 },
                    { id: "prod_huevos_revueltos_fritos", nombre: "Huevos revueltos o fritos", desc: "Huevos revueltos o fritos con jamón o tomate, tostadas, mantequilla, café o té", precio: 35 },
                    { id: "prod_omelette", nombre: "Omelette", desc: "Omelette, tostadas, café o té. Agrégale 2 ingredientes: tomate, jamón, champiñones, pimentón, cebolla, aceitunas o queso", precio: 40 },
                    { id: "prod_huevos_benedictinos", nombre: "Huevos escalfados (benedictinos)", desc: "Huevos escalfados, hojas de espinaca, jamón, salsa de queso sobre pan molde tostado, café o té", precio: 40 },
                    { id: "prod_continental", nombre: "Continental", desc: "Tostadas o pan baguette, mermelada y mantequilla, fruta, café o té y jugo o mimosa", precio: 35 },
                    { id: "prod_golosa_caprichosa", nombre: "Golosa y caprichosa", desc: "Frutos rojos, chocolate para untar y crema, viene con café o té. Elige base: Panqueques, Waffles o Tostadas francesas", precio: 40 },
                  ].map((item) => renderItemFila(item, 'destacado'))
}
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

                  {mostrarFotos && (
                    <div className="grid grid-cols-2 gap-2.5 pb-1">
                      <div
                        onClick={() => setFotoModal({
                          url: "/img/products/espresso_4_llamas.jpg",
                          originalUrl: "/img/products/espresso_4_llamas.jpg",
                          corteUrl: "/img/products/cafe_4llamas_pack_gourmet.jpg",
                          titulo: "Expresso 4 Llamas (30cc)",
                          desc: "Extracción pura de 30cc con granos bolivianos 4 Llamas de Caranavi. Crema color avellana atigrada.",
                          precio: 15
                        })}
                        className="bg-white/80 p-2 rounded-xl border border-[#991B24]/30 flex items-center gap-2 cursor-pointer hover:border-[#991B24] transition group"
                      >
                        <img
                          src="/img/products/espresso_4_llamas.jpg"
                          alt="Expresso 4 Llamas"
                          className="w-12 h-12 rounded-lg object-cover shrink-0 group-hover:scale-105 transition"
                        />
                        <div className="min-w-0">
                          <span className="font-serif font-bold text-xs text-[#1E130C] block truncate">Expresso 4 Llamas</span>
                          <span className="text-[10px] text-amber-700 font-bold block">Caranavi</span>
                          <span className="font-serif font-bold text-xs text-[#991B24]">Bs 15</span>
                        </div>
                      </div>

                      <div
                        onClick={() => setFotoModal({
                          url: "/img/products/cafe_4llamas_pack_gourmet.jpg",
                          originalUrl: "/img/products/cafe_4llamas_pack_gourmet.jpg",
                          titulo: "Café 4 Llamas Pack Gourmet Caranavi",
                          desc: "Paquete oficial de café de especialidad en grano entero o molido (1,700 msnm), perfil achocolatado con notas cítricas para disfrutar en casa.",
                          precio: 65
                        })}
                        className="bg-white/90 p-2 rounded-xl border border-[#E7DFD5] flex items-center gap-2.5 cursor-pointer hover:border-[#991B24]/40 transition group shadow-2xs"
                      >
                        <img
                          src="/img/products/cafe_4llamas_pack_gourmet.jpg"
                          alt="Café 4 Llamas Pack"
                          className="w-12 h-12 rounded-lg object-cover shrink-0 group-hover:scale-105 transition"
                        />
                        <div className="min-w-0">
                          <span className="font-serif font-bold text-xs text-[#1E130C] block truncate">Pack 4 Llamas</span>
                          <span className="text-[10px] text-[#785E4F] block">Grano Gourmet</span>
                          <span className="font-serif font-bold text-xs text-[#991B24]">Bs 65</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2.5">
                    {
  [
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
                    ].map((item) => renderItemFila(item))
}
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
                    {
  [
                      { id: "prod_latte_clasico", nombre: "Latte", desc: "Leche texturizada + expresso", precio: 22 },
                      { id: "prod_latte_caramel", nombre: "Latte caramel", desc: "Leche texturizada, expresso y caramelo", precio: 24 },
                      { id: "prod_latte_vainilla_caramelo", nombre: "Latte vainilla caramelo", desc: "Leche texturizada, expresso, vainilla y caramelo", precio: 25 },
                      { id: "prod_latte_mocha", nombre: "Latte mocha", desc: "Leche texturizada, expresso y chocolate", precio: 25 },
                      { id: "prod_latte_cinnamon", nombre: "Latte Cinnamon", desc: "Leche texturizada, expresso y canela", precio: 24 },
                    ].map((item) => renderItemFila(item))
}
                  </div>
                </div>

              </div>

            </div>

                      {/* Barra Inferior Pág. 02 */}
            <div className="w-full mt-auto bg-[#991B24] text-white py-3.5 px-6 rounded-2xl shadow-md flex items-center justify-between gap-3 shrink-0">
              <span className="font-serif font-black tracking-widest text-base sm:text-lg uppercase">
                DENCKER COFFEE
              </span>
              <span className="text-xs font-sans tracking-wide text-amber-200 hidden sm:inline">
                Café 4 Llamas de Especialidad &bull; Caranavi (1,700 msnm)
              </span>
              <span className="font-serif font-bold text-xs px-3 py-1 rounded-full bg-white/20 text-white shadow-xs">
                Pág. 02
              </span>
            </div>
          </div>

          {/* ── PÁGINA 3: CHOCOLATES, TÉS, JUGOS, FRAPPÉS, HELADOS & REFRESCOS ── */}
          <div id="menu-pagina-3" className="w-full max-w-4xl bg-[#FAF6EF] rounded-3xl shadow-xl border-2 border-[#991B24]/20 overflow-hidden relative flex flex-col justify-between min-h-0 md:min-h-[1020px] p-4 sm:p-8 lg:p-12 print-page space-y-8">
            
            {/* Header Oficial: Mascota Don Dencker & Bebidas Artesanales */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b-2 border-[#991B24]/25 relative">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
                  <img
                    src={DENCKER_ASSETS.mascotClean}
                    alt="Don Dencker Mascota"
                    className="w-full h-full object-contain drop-shadow-md select-none transform hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#991B24] uppercase block">
                    Bebidas Frías, Tés en Hebras &amp; Barra
                  </span>
                  <h2 className="font-serif font-black text-2xl sm:text-4xl uppercase text-[#991B24] tracking-tight">
                    CHOCOLATES, TÉS & BEBIDAS
                  </h2>
                  <p className="text-xs sm:text-sm text-[#785E4F]">
                    Infusiones botánicas, chocolates espesos, helados artesanales y jugos de pura fruta
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-xs px-3.5 py-1.5 rounded-full bg-[#991B24] text-white shadow-xs">
                  Pág. 03
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
              
              {/* Columna Izquierda: CHOCOLATES, TÉS & JUGOS */}
              <div className="space-y-8">
                
                {/* Chocolates */}
                <div className="space-y-3">
                  <h3 className="font-serif font-black text-2xl uppercase tracking-tight text-[#1E130C] border-b-2 border-[#1E130C] pb-1">
                    CHOCOLATES
                  </h3>

                  {mostrarFotos && (
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-600/20 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#991B24] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Coffee size={20} className="text-amber-200" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-serif font-bold text-xs text-[#1E130C] block">
                          Chocolates Calientes &amp; Tés en Hebras
                        </span>
                        <span className="text-[10.5px] text-[#785E4F] block leading-tight">
                          Elaborados con cacao puro boliviano y hojas seleccionadas servidas en tetera bistro.
                        </span>
                      </div>
                    </div>
                  )}
                  {
  [
                    { id: "prod_chocolate_leche", nombre: "Chocolate con leche", desc: "Chocolate, leche texturizada", precio: 22 },
                    { id: "prod_chocolate_marshmallow", nombre: "Chocolate con marshmallow", desc: "Chocolate, leche texturizada, marshmallow tostado", precio: 25 },
                    { id: "prod_chocolate_vainilla", nombre: "Chocolate vainilla", desc: "Chocolate, leche texturizada, esencia dulce de vainilla", precio: 25 },
                    { id: "prod_chocolate_agua", nombre: "Chocolate", desc: "Chocolate tradicional con agua", precio: 20 },
                  ].map((item) => renderItemFila(item))
}
                </div>

                {/* Tés */}
                <div className="space-y-3">
                  <h3 className="font-serif font-black text-2xl uppercase tracking-tight text-[#1E130C] border-b-2 border-[#1E130C] pb-1">
                    TES
                  </h3>
                  {
  [
                    { id: "prod_te_negro_verde", nombre: "Te negro o verde", precio: 12 },
                    { id: "prod_te_frutos_rojos", nombre: "Te frutos rojos", precio: 16 },
                    { id: "prod_te_verde_jazmin", nombre: "Te verde jazmin", precio: 15 },
                    { id: "prod_te_limon_jengibre_miel", nombre: "Te limón jengibre y miel", precio: 20 },
                    { id: "prod_mate_tradicional", nombre: "Mate: manzanilla, anis, coca, trimate", precio: 12 },
                    { id: "prod_chai_tea_latte", nombre: "Chai tea latte", precio: 22 },
                  ].map((item) => renderItemFila(item))
}
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
                  {
  [
                    { id: "prod_jugo_frutilla_naranja", nombre: "Mixto: Frutilla, naranja", precio: 22 },
                    { id: "prod_jugo_mango_naranja_maracuya", nombre: "Mixto: Mango, naranja, maracuyá", precio: 25 },
                    { id: "prod_limonada_hierbabuena", nombre: "Limón hierba buena", precio: 20 },
                    { id: "prod_pina_hierbabuena", nombre: "Piña hierba buena", precio: 20 },
                  ].map((item) => renderItemFila(item))
}
                </div>

              </div>

              {/* Columna Derecha: FRAPPÉS, HELADOS & REFRESCOS */}
              <div className="space-y-8">
                
                {/* Frappés */}
                <div className="space-y-3">
                  <h3 className="font-serif font-black text-2xl uppercase tracking-tight text-[#1E130C] border-b-2 border-[#1E130C] pb-1">
                    FRAPPÉS
                  </h3>

                  {mostrarFotos && (
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-600/20 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#991B24] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Sparkles size={20} className="text-amber-200" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-serif font-bold text-xs text-[#1E130C] block">
                          Frappés Batidos &amp; Helados de la Casa
                        </span>
                        <span className="text-[10.5px] text-[#785E4F] block leading-tight">
                          Licuados al momento con hielo frappé, espresso 4 Llamas y coronados con crema Chantilly.
                        </span>
                      </div>
                    </div>
                  )}
                  {
  [
                    { id: "prod_frappe_light", nombre: "Light", desc: "Expresso, leche, hielo, edulcorante o azúcar", precio: 24 },
                    { id: "prod_frappe_vainilla", nombre: "Vainilla", desc: "Expresso, leche, hielo, crema, salsa de caramelo", precio: 25 },
                    { id: "prod_frappe_mocha", nombre: "Mocha", desc: "Expresso, leche, hielo, chocolate, crema, salsa de chocolate", precio: 26 },
                    { id: "prod_frappe_oreo", nombre: "Oreo", desc: "Expresso, leche, hielo, galletas oreo, crema, salsa de chocolate", precio: 26 },
                    { id: "prod_frappe_dos_chocolates", nombre: "Dos chocolates", desc: "Expresso, leche, hielo, chispas de chocolate blanco y negro, crema, salsa de chocolate", precio: 26 },
                  ].map((item) => renderItemFila(item))
}
                </div>

                {/* Helados */}
                <div className="space-y-3">
                  <h3 className="font-serif font-black text-2xl uppercase tracking-tight text-[#1E130C] border-b-2 border-[#1E130C] pb-1">
                    HELADOS
                  </h3>
                  {
  [
                    { id: "prod_copa_vienesa_melva", nombre: "Copa Vienesa o Melva", precio: 35 },
                    { id: "prod_helado_simple", nombre: "Porción de helado simple", precio: 15 },
                    { id: "prod_helado_doble", nombre: "Porción de helado doble", precio: 20 },
                  ].map((item) => renderItemFila(item))
}
                </div>

                {/* Refrescos */}
                <div className="space-y-3">
                  <h3 className="font-serif font-black text-2xl uppercase tracking-tight text-[#1E130C] border-b-2 border-[#1E130C] pb-1">
                    REFRESCOS
                  </h3>
                  {
  [
                    { id: "prod_iced_tea", nombre: "Iced tea", precio: 16 },
                    { id: "prod_gaseosa_500", nombre: "Gaseosas 500cc (Coca Cola, Fanta, Sprite)", precio: 10 },
                    { id: "prod_agua_500", nombre: "Agua 500cc (con o sin gas)", precio: 10 },
                  ].map((item) => renderItemFila(item))
}
                </div>

              </div>

            </div>

                      {/* Barra Inferior Pág. 03 */}
            <div className="w-full mt-auto bg-[#991B24] text-white py-3.5 px-6 rounded-2xl shadow-md flex items-center justify-between gap-3 shrink-0">
              <span className="font-serif font-black tracking-widest text-base sm:text-lg uppercase">
                DENCKER COFFEE
              </span>
              <span className="text-xs font-sans tracking-wide text-amber-200 hidden sm:inline">
                Infusiones Botánicas &bull; Tés en Hebras &bull; Chocolates de Autor
              </span>
              <span className="font-serif font-bold text-xs px-3 py-1 rounded-full bg-white/20 text-white shadow-xs">
                Pág. 03
              </span>
            </div>
          </div>

          {/* ── PÁGINA 4: DULCES, POSTRES & MASITAS SALADAS ── */}
          <div id="menu-pagina-4" className="w-full max-w-4xl bg-[#FAF6EF] rounded-3xl shadow-xl border-2 border-[#991B24]/20 overflow-hidden relative flex flex-col justify-between min-h-0 md:min-h-[1020px] p-4 sm:p-8 lg:p-12 print-page space-y-8">
            
            {/* Header Oficial: Mascota Croissant & Hojaldres de Mantequilla */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b-2 border-[#991B24]/25 relative">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
                  <img
                    src="/img/brand/mascot-croissant.png"
                    alt="Croissant Mascota Dencker"
                    className="w-full h-full object-contain drop-shadow-md select-none transform hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#991B24] uppercase block">
                    Panadería Francesa &bull; 100% Pura Mantequilla
                  </span>
                  <h2 className="font-serif font-black text-2xl sm:text-4xl uppercase text-[#991B24] tracking-tight">
                    DULCES, POSTRES & SALADAS
                  </h2>
                  <p className="text-xs sm:text-sm text-[#785E4F]">
                    100% pura mantequilla noble, tortas de vitrina y masitas saladas tradicionales
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-xs px-3.5 py-1.5 rounded-full bg-[#991B24] text-white shadow-xs">
                  Pág. 04
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
              
              {/* Columna Izquierda: DULCES + Mascota Croissant con Lentes */}
              <div className="space-y-4">
                
                {/* Mascota Croissant Cool */}
                <div className="flex items-center gap-4 bg-white/80 p-3.5 rounded-2xl border border-[#E7DFD5] shadow-2xs">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
                    <img
                      src={DENCKER_ASSETS.mascotCroissant}
                      alt="Croissant con gafas Dencker"
                      className="w-full h-full object-contain drop-shadow-md select-none transform hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#1E130C]">
                      DULCES
                    </h3>
                    <p className="text-xs text-[#785E4F]">Hojaldres 100% mantequilla noble y masas finas horneadas a mano</p>
                  </div>
                </div>

                {mostrarFotos && (
                  <div className="grid grid-cols-2 gap-2.5 pb-1">
                    <div
                      onClick={() => setFotoModal({
                        url: "/img/products/galletas_chips_chocolate.jpg",
                        originalUrl: "/img/products/galletas_chips_chocolate.jpg",
                        corteUrl: "/img/products/galletas_chips_real.jpg",
                        titulo: "Galletas con Chips de Chocolate",
                        desc: "Galleta horneada artesanal con trozos de chocolate oscuro derretido y centro suave.",
                        precio: 9.5
                      })}
                      className="bg-white/80 p-2 rounded-xl border border-[#E7DFD5] flex items-center gap-2 cursor-pointer hover:border-[#991B24]/40 transition group"
                    >
                      <img
                        src="/img/products/galletas_chips_chocolate.jpg"
                        alt="Galletas con Chips"
                        className="w-12 h-12 rounded-lg object-cover shrink-0 group-hover:scale-105 transition"
                      />
                      <div className="min-w-0">
                        <span className="font-serif font-bold text-xs text-[#1E130C] block truncate">Cookies Choco</span>
                        <span className="text-[10px] text-[#785E4F] block">Chips belgas</span>
                        <span className="font-serif font-bold text-xs text-[#991B24]">Bs 9.5</span>
                      </div>
                    </div>

                    <div
                      onClick={() => setFotoModal({
                        url: "/img/products/mini_cake_corona_glaseado.jpg",
                        originalUrl: "/img/products/mini_cake_corona_glaseado.jpg",
                        corteUrl: "/img/products/mini_cake_corona_real.jpg",
                        titulo: "Mini Cake Corona Glaseado",
                        desc: "Queque corona artesanal esponjoso con chispas y glaseado royal de limón y vainilla.",
                        precio: 17
                      })}
                      className="bg-white/80 p-2 rounded-xl border border-[#E7DFD5] flex items-center gap-2 cursor-pointer hover:border-[#991B24]/40 transition group"
                    >
                      <img
                        src="/img/products/mini_cake_corona_glaseado.jpg"
                        alt="Mini Cake Corona"
                        className="w-12 h-12 rounded-lg object-cover shrink-0 group-hover:scale-105 transition"
                      />
                      <div className="min-w-0">
                        <span className="font-serif font-bold text-xs text-[#1E130C] block truncate">Corona Glaseada</span>
                        <span className="text-[10px] text-[#785E4F] block">Glaseado limón</span>
                        <span className="font-serif font-bold text-xs text-[#991B24]">Bs 17</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2.5">
                  {
  [
                    { id: "prod_alfajor_maicena", nombre: "Alfajor de maicena", desc: "Galletas de maicena rellenas de dulce de leche con coco rallado", precio: 7.5 },
                    { id: "prod_muffin_arandanos_choco", nombre: "Muffin de arándanos chocolate", desc: "", precio: 11.5 },
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
                  ].map((item) => renderItemFila(item))
}
                </div>

              </div>

              {/* Columna Derecha: POSTRES & MASITAS SALADAS */}
              <div className="space-y-8">
                
                {/* POSTRES */}
                <div className="space-y-3">
                  <h3 className="font-serif font-black text-2xl uppercase tracking-tight text-[#1E130C] border-b-2 border-[#1E130C] pb-1">
                    POSTRES
                  </h3>

                  {mostrarFotos && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                      {/* Tartaleta de Chocolate */}
                      <div
                        onClick={() => setFotoModal({
                          url: "/img/products/tartaleta_chocolate_artesanal.jpg",
                          originalUrl: "/img/products/tartaleta_chocolate_artesanal.jpg",
                          corteUrl: "/img/products/tartaleta_chocolate_corte.jpg",
                          titulo: "Tartaleta de Chocolate Belga",
                          desc: "Masa sablée crujiente dorada, ganache puro de chocolate oscuro belga, quenelles suaves de mousse y disco sablé con cacao fino.",
                          precio: 20
                        })}
                        className="bg-white/95 p-3 rounded-2xl border-2 border-[#991B24]/40 shadow-xs flex flex-col justify-between overflow-hidden cursor-pointer hover:border-[#991B24] transition group"
                      >
                        <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 mb-2">
                          <img
                            src="/img/products/tartaleta_chocolate_artesanal.jpg"
                            alt="Tartaleta de Chocolate"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <span className="absolute top-2 left-2 bg-[#991B24] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            ★ Especialidad
                          </span>
                          <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-medium px-1.5 py-0.5 rounded-md flex items-center gap-1">
                            🔍 Ver corte
                          </span>
                        </div>
                        <div>
                          <div className="flex items-baseline justify-between">
                            <h4 className="font-serif font-black text-sm text-[#1E130C]">Tartaleta de Chocolate</h4>
                            <span className="font-serif font-black text-sm text-[#991B24]">Bs 20</span>
                          </div>
                          <p className="text-[10.5px] text-[#785E4F] leading-tight mt-0.5">
                            Masa sablée crocante, ganache belga brillante y mousse sedoso.
                          </p>
                        </div>
                      </div>

                      {/* Queque Japonés */}
                      <div
                        onClick={() => setFotoModal({
                          url: "/img/products/queque_japones_artesanal.jpg",
                          originalUrl: "/img/products/queque_japones_artesanal.jpg",
                          corteUrl: "/img/products/queque_japones_corte.jpg",
                          titulo: "Queque Japonés (Cotton Soufflé)",
                          desc: "Auténtico cheesecake soufflé japonés de textura de algodón ultra esponjosa, horneado al baño maría con dorado suave que se derrite en boca.",
                          precio: 25
                        })}
                        className="bg-white/95 p-3 rounded-2xl border-2 border-amber-500/50 shadow-xs flex flex-col justify-between overflow-hidden cursor-pointer hover:border-amber-600 transition group"
                      >
                        <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 mb-2">
                          <img
                            src="/img/products/queque_japones_artesanal.jpg"
                            alt="Queque Japonés"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <span className="absolute top-2 left-2 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            ✨ Novedad
                          </span>
                          <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-medium px-1.5 py-0.5 rounded-md flex items-center gap-1">
                            🔍 Ver corte
                          </span>
                        </div>
                        <div>
                          <div className="flex items-baseline justify-between">
                            <h4 className="font-serif font-black text-sm text-[#1E130C]">Queque Japonés</h4>
                            <span className="font-serif font-black text-sm text-[#991B24]">Bs 25</span>
                          </div>
                          <p className="text-[10.5px] text-[#785E4F] leading-tight mt-0.5">
                            Soufflé de algodón ultra esponjoso horneado al baño maría.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {
  [
                    { id: "prod_tartaleta_chocolate", nombre: "Tartaleta de chocolate", precio: 20 },
                    { id: "prod_queque_japones", nombre: "Queque japonés", precio: 25 },
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
                  ].map((item) => renderItemFila(item))
}
                </div>

                {/* Separador a cuadros rojos y blancos */}
                <div className="w-full h-3 bg-[repeating-linear-gradient(45deg,#991B24,#991B24_10px,#FAF6EF_10px,#FAF6EF_20px)] rounded-full" />

                {/* MASITAS SALADAS */}
                <div className="space-y-3">
                  <h3 className="font-serif font-black text-2xl uppercase tracking-tight text-[#1E130C] border-b-2 border-[#1E130C] pb-1">
                    MASITAS SALADAS
                  </h3>

                  {mostrarFotos && (
                    <div className="grid grid-cols-2 gap-2.5 pb-1">
                      <div
                        onClick={() => setFotoModal({
                          url: "/img/products/cunape_caliente_tradicional.jpg",
                          originalUrl: "/img/products/cunape_caliente_tradicional.jpg",
                          corteUrl: "/img/products/cunape_tradicional_real.jpg",
                          titulo: "Cuñapé Caliente Tradicional",
                          desc: "Almidón de yuca y queso criollo fundido recién horneado, crocante por fuera y elástico por dentro.",
                          precio: 8.5
                        })}
                        className="bg-white/80 p-2 rounded-xl border border-[#E7DFD5] flex items-center gap-2 cursor-pointer hover:border-[#991B24]/40 transition group"
                      >
                        <img
                          src="/img/products/cunape_caliente_tradicional.jpg"
                          alt="Cuñapé Caliente"
                          className="w-12 h-12 rounded-lg object-cover shrink-0 group-hover:scale-105 transition"
                        />
                        <div className="min-w-0">
                          <span className="font-serif font-bold text-xs text-[#1E130C] block truncate">Cuñapé Caliente</span>
                          <span className="text-[10px] text-[#785E4F] block">Queso criollo</span>
                          <span className="font-serif font-bold text-xs text-[#991B24]">Bs 8.5</span>
                        </div>
                      </div>

                      <div
                        onClick={() => setFotoModal({
                          url: "/img/products/empanada_queso_boliviana.jpg",
                          originalUrl: "/img/products/empanada_queso_boliviana.jpg",
                          corteUrl: "/img/products/empanada_queso_real.jpg",
                          titulo: "Empanada de Queso Tradicional",
                          desc: "Empanada artesanal dorada con repulgue trenzado y abundante queso derretido.",
                          precio: 8.5
                        })}
                        className="bg-white/80 p-2 rounded-xl border border-[#E7DFD5] flex items-center gap-2 cursor-pointer hover:border-[#991B24]/40 transition group"
                      >
                        <img
                          src="/img/products/empanada_queso_boliviana.jpg"
                          alt="Empanada de Queso"
                          className="w-12 h-12 rounded-lg object-cover shrink-0 group-hover:scale-105 transition"
                        />
                        <div className="min-w-0">
                          <span className="font-serif font-bold text-xs text-[#1E130C] block truncate">Empanada Queso</span>
                          <span className="text-[10px] text-[#785E4F] block">Repulgue casero</span>
                          <span className="font-serif font-bold text-xs text-[#991B24]">Bs 8.5</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {
  [
                    { id: "prod_empanada_queso", nombre: "Empanada de queso", precio: 8.5 },
                    { id: "prod_cunape", nombre: "Cuñape", precio: 8.5 },
                    { id: "prod_cunape_frito", nombre: "Cuñape frito", precio: 7.5 },
                    { id: "prod_croissant_queso", nombre: "Croissant de queso", precio: 10 },
                    { id: "prod_italiano_jamon_queso", nombre: "Italianos de jamon y queso", precio: 12.5 },
                    { id: "prod_palitos_queso", nombre: "Palitos de queso", precio: 7.5 },
                    { id: "prod_empanada_ricota", nombre: "Empanada de ricota (integral)", precio: 10.5 },
                    { id: "prod_llaucha_pacena", nombre: "Llaucha paceña", precio: 12.5 },
                    { id: "prod_pan_arroz", nombre: "Pan de arroz", precio: 10.5 },
                    { id: "prod_sonso", nombre: "Sonso", precio: 15.5 },
                    { id: "prod_esfihas", nombre: "Esfihas", precio: 12 },
                  ].map((item) => renderItemFila(item))
}
                </div>

              </div>

            </div>

                      {/* Barra Inferior Pág. 04 */}
            <div className="w-full mt-auto bg-[#991B24] text-white py-3.5 px-6 rounded-2xl shadow-md flex items-center justify-between gap-3 shrink-0">
              <span className="font-serif font-black tracking-widest text-base sm:text-lg uppercase">
                DENCKER COFFEE
              </span>
              <span className="text-xs font-sans tracking-wide text-amber-200 hidden sm:inline">
                Pastelería Francesa &bull; 100% Pura Mantequilla Noble
              </span>
              <span className="font-serif font-bold text-xs px-3 py-1 rounded-full bg-white/20 text-white shadow-xs">
                Pág. 04
              </span>
            </div>
          </div>

          {/* ── PÁGINA 5: SÁNDWICHES, EXTRAS & ENSALADAS ── */}
          <div id="menu-pagina-5" className="w-full max-w-4xl bg-[#FAF6EF] rounded-3xl shadow-xl border-2 border-[#991B24]/20 overflow-hidden relative flex flex-col justify-between min-h-0 md:min-h-[1020px] p-4 sm:p-8 lg:p-12 print-page space-y-8">
            
            {/* Header Oficial: Mascota Pan Tostada & Masa Madre */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b-2 border-[#991B24]/25 relative">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
                  <img
                    src="/img/brand/mascot-bread.png"
                    alt="Pan Tostada Mascota Dencker"
                    className="w-full h-full object-contain drop-shadow-md select-none transform hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#991B24] uppercase block">
                    Masa Madre &bull; Fermentación Natural 24h
                  </span>
                  <h2 className="font-serif font-black text-2xl sm:text-4xl uppercase text-[#991B24] tracking-tight">
                    SANDWICHES &amp; ENSALADAS
                  </h2>
                  <p className="text-xs sm:text-sm text-[#785E4F]">
                    Pan de masa madre horneado hoy, vegetales frescos, carnes selectas y guarniciones
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-xs px-3.5 py-1.5 rounded-full bg-[#991B24] text-white shadow-xs">
                  Pág. 05
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
              
              {/* Columna Izquierda: ARMA TU SÁNDWICH + Mascota Tostada */}
              <div className="space-y-6">
                
                {/* Sándwich especial Dencker */}
                <div className="p-5 rounded-2xl bg-white/95 border-2 border-[#991B24]/40 shadow-sm space-y-4">
                  {mostrarFotos && (
                    <div
                      onClick={() => setFotoModal({
                        url: "/img/products/sandwich_dencker_especial.jpg",
                        titulo: "Sándwich Especial Dencker",
                        desc: "Arma tu sándwich con DOS proteínas (pollo, tocino, jamón, salame) y TRES complementos en pan a elección.",
                        precio: 35
                      })}
                      className="relative aspect-16/9 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 cursor-pointer group"
                    >
                      <img
                        src="/img/products/sandwich_dencker_especial.jpg"
                        alt="Sándwich Especial Dencker"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <span className="absolute top-2 left-2 bg-[#991B24] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        ⭐ Especial Dencker
                      </span>
                    </div>
                  )}
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
                  {
  [
                    { id: "prod_extra_papas_fritas", nombre: "Porción de papas fritas", precio: 15 },
                    { id: "prod_extra_palta", nombre: "Porción de palta", precio: 10 },
                    { id: "prod_extra_tocino", nombre: "Tocino", precio: 10 },
                    { id: "prod_extra_jamon", nombre: "Jamón", precio: 5 },
                    { id: "prod_extra_tostada", nombre: "Tostada", precio: 6 },
                    { id: "prod_extra_queso", nombre: "Queso", precio: 3 },
                  ].map((item) => renderItemFila(item))
}
                </div>

              </div>

              {/* Columna Derecha: SÁNDWICHES TRADICIONALES & ENSALADAS */}
              <div className="space-y-8">
                
                {/* Sándwiches Tradicionales */}
                <div className="space-y-3">
                  <h3 className="font-serif font-black text-2xl uppercase tracking-tight text-[#1E130C] border-b-2 border-[#1E130C] pb-1">
                    SANDWICHES
                  </h3>
                  {
  [
                    { id: "prod_sandwich_lomito", nombre: "Lomito", desc: "Lomito picado, cebolla salteada, pimentón, queso mozzarella, lechuga y tomate (pan a elección)", precio: 35 },
                    { id: "prod_sandwich_pesto", nombre: "Pesto", desc: "Filete de pollo grillado, pesto de albahaca, queso mozzarella, tomate, aceite de oliva (pan a elección)", precio: 35 },
                    { id: "prod_sandwich_st_germain", nombre: "St. Germain", desc: "Lomito picado, tocino, queso mozzarella, tomate, champiñones, mayonesa casera (pan a elección)", precio: 40 },
                    { id: "prod_sandwich_atun", nombre: "Atún", desc: "Atún, lechuga, tomate, pepinillo, mayonesa casera (pan a elección)", precio: 45 },
                    { id: "prod_sandwich_jamon_queso", nombre: "Jamón y queso", desc: "Jamón y queso mozzarella (pan a elección)", precio: 30 },
                    { id: "prod_croque_monsieur", nombre: "Croque Monsieur", desc: "Jamón, queso mozzarella, salsa bechamel en pan molde", precio: 30 },
                    { id: "prod_sandwich_pavita", nombre: "Pavita", desc: "Mayonesa de la casa, pollo, maíz (pan a elección)", precio: 27 },
                  ].map((item) => renderItemFila(item))
}
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

                  {mostrarFotos && (
                    <div className="grid grid-cols-2 gap-2.5 pb-1">
                      <div
                        onClick={() => setFotoModal({
                          url: "/img/products/sandwich_dencker_especial.jpg",
                          originalUrl: "/img/products/sandwich_dencker_especial.jpg",
                          titulo: "Sándwich Especial Dencker Gourmet",
                          desc: "Exclusivo sándwich en pan artesanal de masa madre recién horneado, jamón seleccionado, queso fundido, vegetales frescos y aderezo especial de la casa.",
                          precio: 35
                        })}
                        className="bg-white/90 p-2 rounded-xl border border-[#E7DFD5] flex items-center gap-2.5 cursor-pointer hover:border-[#991B24]/40 transition group shadow-2xs"
                      >
                        <img
                          src="/img/products/sandwich_dencker_especial.jpg"
                          alt="Sándwich Especial Dencker"
                          className="w-12 h-12 rounded-lg object-cover shrink-0 group-hover:scale-105 transition"
                        />
                        <div className="min-w-0">
                          <span className="font-serif font-bold text-xs text-[#1E130C] block truncate">Sándwich Dencker</span>
                          <span className="text-[10px] text-[#785E4F] block">Masa Madre</span>
                          <span className="font-serif font-bold text-xs text-[#991B24]">Bs 35</span>
                        </div>
                      </div>

                      <div
                        onClick={() => setFotoModal({
                          url: "/img/products/palitos_queso_real.jpg",
                          originalUrl: "/img/products/palitos_queso_real.jpg",
                          titulo: "Palitos de Queso Crujientes",
                          desc: "Crujientes palitos horneados a mano con masa hojaldrada y queso parmesano gratinado, ideales para picar.",
                          precio: 7.5
                        })}
                        className="bg-white/90 p-2 rounded-xl border border-[#E7DFD5] flex items-center gap-2.5 cursor-pointer hover:border-[#991B24]/40 transition group shadow-2xs"
                      >
                        <img
                          src="/img/products/palitos_queso_real.jpg"
                          alt="Palitos de Queso"
                          className="w-12 h-12 rounded-lg object-cover shrink-0 group-hover:scale-105 transition"
                        />
                        <div className="min-w-0">
                          <span className="font-serif font-bold text-xs text-[#1E130C] block truncate">Palitos de Queso</span>
                          <span className="text-[10px] text-[#785E4F] block">Hojaldre y queso</span>
                          <span className="font-serif font-bold text-xs text-[#991B24]">Bs 7.5</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {
  [
                    { id: "prod_ensalada_cesar", nombre: "Ensalada César", desc: "Lechuga, crutons, pollo y salsa cesar", precio: 30 },
                    { id: "prod_ensalada_thai", nombre: "Ensalada Thai", desc: "Lechuga, col, zanahoria, tomate cherry, gajos de naranja, pimentón caramelizado, pollo y tortilla tostada", precio: 30 },
                    { id: "prod_pasta_salad", nombre: "Pasta Salad", desc: "Pasta fusilli, lechuga, tomate cherry, pepino, choclitos, poroto negro, palta, pollo", precio: 35 },
                  ].map((item) => renderItemFila(item))
}
                </div>

              </div>

            </div>

                      {/* Barra Inferior Pág. 05 */}
            <div className="w-full mt-auto bg-[#991B24] text-white py-3.5 px-6 rounded-2xl shadow-md flex items-center justify-between gap-3 shrink-0">
              <span className="font-serif font-black tracking-widest text-base sm:text-lg uppercase">
                DENCKER COFFEE
              </span>
              <span className="text-xs font-sans tracking-wide text-amber-200 hidden sm:inline">
                Panes de Masa Madre &bull; Fermentación Natural 24h
              </span>
              <span className="font-serif font-bold text-xs px-3 py-1 rounded-full bg-white/20 text-white shadow-xs">
                Pág. 05
              </span>
            </div>
          </div>

          {/* ── PÁGINA 6: PIZZAS ARTESANALES (PORCIONES 4, 6 Y 8) ── */}
          <div id="menu-pagina-6" className="w-full max-w-4xl bg-[#FAF6EF] rounded-3xl shadow-xl border-2 border-[#991B24]/20 overflow-hidden relative flex flex-col justify-between min-h-0 md:min-h-[1020px] p-4 sm:p-8 lg:p-12 print-page space-y-8">
            
            {/* Header Oficial: Mascota Pizza Skater & Horno de Piedra */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b-2 border-[#991B24]/25 relative">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
                  <img
                    src="/img/brand/mascot-pizza.png"
                    alt="Pizza Mascota Dencker"
                    className="w-full h-full object-contain drop-shadow-md select-none transform hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#991B24] uppercase block">
                    Horno de Piedra &bull; Masa Madurada 24 Horas
                  </span>
                  <h2 className="font-serif font-black text-2xl sm:text-4xl uppercase text-[#991B24] tracking-tight">
                    PIZZAS ARTESANALES
                  </h2>
                  <p className="text-xs sm:text-sm text-[#785E4F]">
                    Masa madurada 24 horas, salsa pomodoro casera y queso Catupiri fundido
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-xs px-3.5 py-1.5 rounded-full bg-[#991B24] text-white shadow-xs">
                  Pág. 06
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
              
              {/* Columna Izquierda: ARMA TU PIZZA & Mascota Pizza Skater */}
              <div className="space-y-6">
                
                {/* Pizza Especial Dencker */}
                <div className="p-5 rounded-2xl bg-white/95 border-2 border-[#991B24]/40 shadow-sm space-y-4">
                  {mostrarFotos && (
                    <div
                      onClick={() => setFotoModal({
                        url: "/img/products/pizza_especial_suprema.jpg",
                        titulo: "Pizza Especial Dencker",
                        desc: "Arma tu pizza con DOS proteínas y TRES complementos. Masa fermentada en horno de piedra.",
                        precio: 95
                      })}
                      className="relative aspect-16/9 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 cursor-pointer group"
                    >
                      <img
                        src="/img/products/pizza_especial_suprema.jpg"
                        alt="Pizza Especial Dencker"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <span className="absolute top-2 left-2 bg-[#991B24] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        🔥 Horno de Piedra
                      </span>
                    </div>
                  )}
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
                  <div className="text-[11px] sm:text-xs font-serif font-bold text-[#991B24] flex gap-2 sm:gap-5">
                    <span className="w-8 text-center">4 porc</span>
                    <span className="w-8 text-center">6 porc</span>
                    <span className="w-8 text-center">8 porc</span>
                  </div>
                </div>

                <div className="space-y-3">
                                    {[
                    { id: "prod_pizza_margarita", nombre: "Margarita", desc: "Salsa de tomate, mozzarella, tomate, albahaca y aceite de oliva", p4: 40, p6: 55, p8: 70 },
                    { id: "prod_pizza_jamon_queso", nombre: "Jamón y queso", desc: "Salsa de tomate, mozzarella y jamon", p4: 35, p6: 50, p8: 65 },
                    { id: "prod_pizza_hawaiana", nombre: "Hawaina", desc: "Salsa de tomate, mozzarella, jamón, piña", p4: 40, p6: 55, p8: 70 },
                    { id: "prod_pizza_funghi", nombre: "Pizza funghi", desc: "Salsa de tomate, mozzarella, champiñones frescos y jamón", p4: 35, p6: 50, p8: 65 },
                    { id: "prod_pizza_choclo_amarillo", nombre: "Choclo amarillo", desc: "Salsa de tomate, mozzarella, choclo amarillo, tocino", p4: 35, p6: 50, p8: 70 },
                    { id: "prod_pizza_bacon", nombre: "Bacon", desc: "Salsa de tomate, mozzarella, tocino, cebolla", p4: 40, p6: 55, p8: 70 },
                    { id: "prod_pizza_palmito", nombre: "Palmito", desc: "Salsa de tomate, mozzarella, palmitos, jamón, aceitunas, huevo", p4: 40, p6: 55, p8: 70 },
                    { id: "prod_pizza_portuguesa", nombre: "Portuguesa", desc: "Salsa de tomate, mozzarella, jamón, tomate, huevo, choclo amarillo, cebolla y aceitunas", p4: 45, p6: 55, p8: 80 },
                    { id: "prod_pizza_criolla", nombre: "Criolla", desc: "Salsa de tomate, mozzarella, carne molida, cebolla, tomate", p4: 45, p6: 65, p8: 80 },
                    { id: "prod_pizza_salame", nombre: "Salame", desc: "Salsa de tomate, mozzarella, salame, champiñones frescos, cebolla", p4: 45, p6: 65, p8: 80 },
                    { id: "prod_pizza_pollo_catupiri", nombre: "Pollo", desc: "Salsa de tomate, mozzarella, pollo desmenuzado, queso catupiri", p4: 45, p6: 65, p8: 80 },
                  ].map((p) => {
                    const prod = getProd(p.id, p.nombre);
                    const basePrice = prod ? prod.precio : p.p4;
                    const ratio = basePrice / p.p4;
                    const p6Display = Math.round(p.p6 * ratio);
                    const p8Display = Math.round(p.p8 * ratio);
                    const cant = prod && prod.id ? getItemCantidadEnCarrito(prod.id) : 0;

                    return (
                      <div key={p.id} className="group border-b border-dotted border-[#E2D6C6] pb-2 transition hover:bg-amber-500/10 px-2.5 -mx-2.5 rounded-xl">
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="flex items-baseline gap-2 min-w-0">
                            <span className="font-serif font-bold text-sm text-[#1E130C] group-hover:text-[#991B24] transition">
                              {prod ? prod.nombre : p.nombre}
                            </span>
                            {cant > 0 && (
                              <span className="print:hidden text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 shadow-2xs shrink-0">
                                {cant} en pedido
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex gap-2 sm:gap-5 text-xs sm:text-sm font-serif font-black text-[#991B24]">
                              <span className="w-8 text-center">{basePrice}</span>
                              <span className="w-8 text-center">{p6Display}</span>
                              <span className="w-8 text-center">{p8Display}</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => handleAgregarRapido({ id: p.id, nombre: `Pizza ${p.nombre}`, precio: basePrice, desc: p.desc }, e)}
                              className="print:hidden w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-[#1E130C] hover:bg-[#991B24] text-white flex items-center justify-center transition shadow-xs active:scale-90 cursor-pointer text-xs font-bold border border-amber-400/40 group-hover:scale-105"
                              title={`Añadir Pizza ${p.nombre} al pedido`}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-[#785E4F] leading-tight mt-0.5 pr-8">{prod?.descripcion || p.desc}</p>
                      </div>
                    );
                  })}
                </div>

              </div>

            </div>

          </div>

          {/* ── COLOFÓN OFICIAL DENCKER: LOS 3 EMBLEMAS DE LA CASA ── */}
          <div className="bg-[#FAF6EF] rounded-3xl shadow-xl border-2 border-[#991B24]/30 p-6 sm:p-10 space-y-6 text-center">
            <div className="max-w-2xl mx-auto space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#991B24]">
                Identidad & Tradición Familiar
              </span>
              <h3 className="font-serif font-black text-2xl sm:text-3xl text-[#1E130C]">
                Dencker Coffee & Panadería Artesanal
              </h3>
              <p className="text-xs text-[#785E4F] leading-relaxed">
                Cada receta es fruto de la dedicación, la masa madre viva y los granos de café de altura seleccionados en Caranavi. Gracias por compartir la mesa con nosotros.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 items-center">
              {/* Logo 1 */}
              <div className="p-4 rounded-2xl bg-white border border-[#E7DFD5] flex flex-col items-center space-y-2 shadow-2xs">
                <div className="w-16 h-14 flex items-center justify-center">
                  <img
                    src="/img/brand/logo-1-chef-hat.svg"
                    alt="Sombrero Chef Dencker"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-serif font-bold text-xs text-[#1E130C]">Insignia de Obrador</span>
                <span className="text-[10px] text-[#785E4F]">Panadería y repostería artesanal</span>
              </div>

              {/* Logo 2 */}
              <div className="p-4 rounded-2xl bg-white border border-[#E7DFD5] flex flex-col items-center space-y-2 shadow-2xs">
                <div className="w-24 h-14 rounded-lg overflow-hidden flex items-center justify-center shadow-xs">
                  <img
                    src="/img/brand/logo-2-dencker-coffee-vintage.png"
                    alt="Boleto Vintage Dencker Coffee"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-serif font-bold text-xs text-[#1E130C]">Boleto Nostálgico</span>
                <span className="text-[10px] text-[#785E4F]">Dencker Coffee & Tradición</span>
              </div>

              {/* Logo 3 */}
              <div className="p-4 rounded-2xl bg-white border border-[#E7DFD5] flex flex-col items-center space-y-2 shadow-2xs">
                <div className="w-14 h-14 flex items-center justify-center">
                  <img
                    src="/img/brand/logo-3-don-dencker-badge.png"
                    alt="Sello Don Dencker"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-serif font-bold text-xs text-[#1E130C]">Sello de Autenticidad</span>
                <span className="text-[10px] text-[#785E4F]">Garantía de sabor y calidad</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E7DFD5] flex flex-wrap items-center justify-between gap-3 text-xs text-[#785E4F]">
              <span>Av. Daniel Salamanca, Cochabamba • Bolivia</span>
              <span>Pedidos & Reservas: +591 76911000</span>
              <span className="font-mono font-bold text-[#991B24]">www.denckerpan.com</span>
            </div>
                      {/* Barra Inferior Pág. 06 */}
            <div className="w-full mt-auto bg-[#991B24] text-white py-3.5 px-6 rounded-2xl shadow-md flex items-center justify-between gap-3 shrink-0">
              <span className="font-serif font-black tracking-widest text-base sm:text-lg uppercase">
                DENCKER COFFEE
              </span>
              <span className="text-xs font-sans tracking-wide text-amber-200 hidden sm:inline">
                Pizzas al Horno de Piedra &bull; Salsa Pomodoro Casera
              </span>
              <span className="font-serif font-bold text-xs px-3 py-1 rounded-full bg-white/20 text-white shadow-xs">
                Pág. 06
              </span>
            </div>
          </div>

          </div> {/* Cierre del contenedor de páginas verticales */}

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

            {/* Toast de confirmación de adición rápida */}
      {feedbackAgregado && (
        <div className="fixed top-20 right-6 z-50 bg-[#1E130C] border-2 border-amber-400 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-bounce print:hidden">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <div className="text-xs">
            <span className="font-bold text-amber-300 block">¡Añadido a tu pedido!</span>
            <span className="text-stone-300 line-clamp-1">{feedbackAgregado}</span>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          BARRA FLOTANTE DE PEDIDO RÁPIDO (BISTRO ORDER DOCK)
      ══════════════════════════════════════════════════════════════ */}
      <div className="fixed bottom-0 inset-x-0 z-40 p-3 sm:p-4 print:hidden pointer-events-none">
        <div className="max-w-4xl mx-auto bg-[#160D08]/98 backdrop-blur-2xl border-2 border-amber-500/50 rounded-3xl p-3 sm:p-4 shadow-[0_10px_40px_rgba(0,0,0,0.7)] flex items-center justify-between gap-3 text-white pointer-events-auto">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shrink-0">
              <ShoppingBag className="text-amber-300 w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-sm sm:text-base text-white truncate">
                  {cartCount > 0 ? `Tu Pedido (${cartCount})` : "Carta Oficial Dencker Pan"}
                </span>
                {cartCount > 0 && (
                  <span className="font-mono font-black text-xs sm:text-sm px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 shrink-0 shadow-xs">
                    Bs {cartTotal.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-300 truncate hidden sm:block">
                {cartCount > 0
                  ? "Toca en 'Ver Canasta & Pedir' para enviar a cocina, mesero o pedir por WhatsApp."
                  : "Toca el botón '+' en cualquier producto para agregarlo a tu pedido mientras lees la carta."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setCartOpen(true);
              }}
              className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-[#991B24] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#991B24] text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center gap-2 active:scale-95 transition cursor-pointer border border-amber-400/50"
            >
              <ShoppingBag size={16} className="text-amber-300" />
              <span>{cartCount > 0 ? "Ver Canasta & Pedir" : "Abrir Canasta"}</span>
            </button>

            <button
              type="button"
              onClick={handleImprimir}
              className="p-2.5 sm:p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white transition cursor-pointer hidden md:flex items-center justify-center border border-white/10"
              title="Imprimir Carta A4"
            >
              <Printer size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ── MODAL DE FOTO GASTRONÓMICA EN ALTA RESOLUCIÓN (EXTERIOR VS CORTE) ── */}
      {fotoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 print:hidden animate-fade-in"
          onClick={() => setFotoModal(null)}
        >
          <div
            className="bg-[#FAF6EF] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border-2 border-[#991B24]/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-4/3 bg-stone-900">
              <img
                src={fotoModal.url}
                alt={fotoModal.titulo}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setFotoModal(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition cursor-pointer"
              >
                ✕
              </button>
              {fotoModal.corteUrl && (
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-md p-1 rounded-xl border border-white/20">
                  <button
                    onClick={() => {
                      soundManager.playTactileClick();
                      setFotoModal((prev) => prev ? { ...prev, url: prev.originalUrl || prev.url, viendoCorte: false } : null);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      !fotoModal.viendoCorte ? "bg-[#991B24] text-white" : "text-stone-300 hover:text-white"
                    }`}
                  >
                    Exterior
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playTactileClick();
                      setFotoModal((prev) => prev ? { ...prev, url: prev.corteUrl!, viendoCorte: true } : null);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      fotoModal.viendoCorte ? "bg-[#991B24] text-white" : "text-stone-300 hover:text-white"
                    }`}
                  >
                    Corte Interior
                  </button>
                </div>
              )}
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-black text-xl text-[#1E130C]">{fotoModal.titulo}</h3>
                {fotoModal.precio && (
                  <span className="font-serif font-black text-xl text-[#991B24]">Bs {fotoModal.precio}</span>
                )}
              </div>
              {fotoModal.desc && (
                <p className="text-xs text-[#785E4F] leading-relaxed">{fotoModal.desc}</p>
              )}

              {/* Botón táctil para añadir a la canasta desde el Modal */}
              <button
                type="button"
                onClick={() => {
                  handleAgregarRapido({
                    id: fotoModal.titulo,
                    nombre: fotoModal.titulo,
                    precio: typeof fotoModal.precio === "number" ? fotoModal.precio : parseFloat(String(fotoModal.precio || 0)),
                    desc: fotoModal.desc
                  });
                  setFotoModal(null);
                }}
                className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-[#991B24] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#991B24] text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition border border-amber-400/40"
              >
                <ShoppingBag size={18} className="text-amber-300" />
                <span>Añadir a mi Pedido {fotoModal.precio ? `• Bs ${fotoModal.precio}` : ""}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ESTILOS GLOBALES DE IMPRESIÓN A4 ── */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 6mm 8mm 6mm;
          }
          body, html {
            background-color: #ffffff !important;
            color: #1e130c !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-page {
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            min-height: 96vh !important;
            border: 2px solid #991b24 !important;
            border-radius: 20px !important;
            box-shadow: none !important;
            margin-bottom: 0 !important;
            padding: 24px !important;
          }
          .print-page:last-of-type {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          .print-no-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

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

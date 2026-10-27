"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Printer,
  ArrowLeft,
  Download,
  QrCode,
  Sparkles,
  Coffee,
  Flame,
  ShieldCheck,
  LayoutGrid,
  FileText,
  UtensilsCrossed,
  Layers,
  CheckCircle2,
  Share2,
  Copy,
  ChevronRight
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useSystemStore } from "@/store";
import { DENCKER_ASSETS, SEED_CATEGORIAS, SEED_PRODUCTOS, SEED_MESAS } from "@/lib/seed-data";
import { Producto, Categoria, Mesa } from "@/types";
import { soundManager } from "@/lib/sound";
import { getStaffSession } from "@/lib/auth";

type TipoDocumento = "menu" | "carpas" | "takeaway";
type EstiloColor = "kraft" | "blanco_negro";

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

  const [baseUrl, setBaseUrl] = useState<string>("https://decker-pan.vercel.app");
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento>("menu");
  const [mesaFiltro, setMesaFiltro] = useState<number | "todas">("todas");
  const [estiloColor, setEstiloColor] = useState<EstiloColor>("kraft");
  const [copiadoLink, setCopiadoLink] = useState(false);
  const [esAdmin, setEsAdmin] = useState(false);

  useEffect(() => {
    const session = getStaffSession();
    if (session?.user?.role === "admin") {
      setEsAdmin(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        setBaseUrl("https://decker-pan.vercel.app");
      } else {
        setBaseUrl(window.location.origin);
      }
    }
  }, []);

  const handleImprimir = () => {
    soundManager.playTactileClick();
    window.print();
  };

  const handleCopiarLink = (url: string) => {
    soundManager.playTactileClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiadoLink(true);
      setTimeout(() => setCopiadoLink(false), 2000);
    }
  };

  // Categorías curadas para el menú editorial A4
  const seccionesMenu = [
    {
      id: "panaderia",
      titulo: "Panadería Tradicional & Masa Madre (24h)",
      icono: "🥖",
      badge: "Masa Madre Viva",
      descripcion: "Horneados a la piedra en dos tandas diarias (07:30 y 16:30). Harinas seleccionadas sin aditivos.",
      items: productos.filter(
        (p) =>
          p.categoria_id === "c2" ||
          p.categoria_id === "c3" ||
          p.nombre.toLowerCase().includes("pan") ||
          p.nombre.toLowerCase().includes("cauka") ||
          p.nombre.toLowerCase().includes("marraqueta")
      ),
    },
    {
      id: "pasteleria",
      titulo: "Pastelería Fina & Hojaldres 100% Mantequilla",
      icono: "🥐",
      badge: "72 Capas Francesas",
      descripcion: "Laminado artesanal con mantequilla noble pura. New York Rolls, croissants y alfajores de autor.",
      items: productos.filter(
        (p) =>
          p.categoria_id === "c4" ||
          p.nombre.toLowerCase().includes("roll") ||
          p.nombre.toLowerCase().includes("croissant") ||
          p.nombre.toLowerCase().includes("alfajor") ||
          p.nombre.toLowerCase().includes("torta") ||
          p.nombre.toLowerCase().includes("milhojas")
      ),
    },
    {
      id: "cafe",
      titulo: "Cafetería de Especialidad Caranavi (1,600 msnm)",
      icono: "☕",
      badge: "La Marzocco",
      descripcion: "Granos 100% arábica cosechados en los Yungas. Extracción doble y microfoam sedoso a 65°C.",
      items: productos.filter(
        (p) =>
          p.categoria_id === "c7" ||
          p.nombre.toLowerCase().includes("café") ||
          p.nombre.toLowerCase().includes("espresso") ||
          p.nombre.toLowerCase().includes("cappuccino") ||
          p.nombre.toLowerCase().includes("latte")
      ),
    },
    {
      id: "salados",
      titulo: "Masitas Saladas, Cuñapés & Especialidades Calientes",
      icono: "🥟",
      badge: "Queso Criollo",
      descripcion: "Tradición cochabambina con abundante queso criollo fresco y horneados al punto exacto.",
      items: productos.filter(
        (p) =>
          p.categoria_id === "c1" ||
          p.categoria_id === "c5" ||
          p.categoria_id === "c6" ||
          p.nombre.toLowerCase().includes("cuñape") ||
          p.nombre.toLowerCase().includes("empanada") ||
          p.nombre.toLowerCase().includes("pizza") ||
          p.nombre.toLowerCase().includes("esfiha")
      ),
    },
  ];

  // Mesas a imprimir en modo carpas
  const mesasAImprimir =
    mesaFiltro === "todas" ? mesas.slice(0, 12) : mesas.filter((m) => m.numero === mesaFiltro);

  return (
    <div className={`min-h-screen font-sans py-8 px-4 sm:px-6 lg:px-8 transition-colors ${
      estiloColor === "kraft"
        ? "bg-[#F4EFEB] text-[#1E130C]"
        : "bg-stone-100 text-stone-900"
    } print:bg-white print:text-black print:p-0`}>

      {/* ── BARRA DE CONTROL SUPERIOR (OCULTA EN IMPRESIÓN) ── */}
      <header className="max-w-5xl mx-auto mb-8 print:hidden bg-white p-5 rounded-3xl border border-[#D9CDBF] shadow-xl space-y-5">
        
        {/* Fila 1: Botón Volver + Acciones de Impresión */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EAE2D5] pb-4">
          <Link
            href="/"
            onClick={() => soundManager.playTactileClick()}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#785E4F] hover:text-[#1E130C] transition group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Volver a Dencker Pan Digital</span>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleCopiarLink(`${baseUrl}/menu-pdf`)}
              className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              {copiadoLink ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copiadoLink ? "¡Enlace Copiado!" : "Copiar Enlace"}</span>
            </button>

            <button
              onClick={handleImprimir}
              className="px-6 py-2.5 rounded-xl bg-[#1E130C] hover:bg-[#322015] text-[#FAF7F2] font-black text-xs shadow-lg flex items-center gap-2 active:scale-95 transition cursor-pointer"
            >
              <Printer size={16} className="text-[#87A987]" />
              <span>Imprimir / Guardar en PDF</span>
            </button>
          </div>
        </div>

        {/* Fila 2: Selector de Tipo de Documento */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#F5EFEB]">
            <button
              onClick={() => {
                soundManager.playTactileClick();
                setTipoDocumento("menu");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                tipoDocumento === "menu"
                  ? "bg-[#1E130C] text-[#FAF7F2] shadow-sm"
                  : "text-[#785E4F] hover:text-[#1E130C]"
              }`}
            >
              <FileText size={15} />
              <span>📜 Carta Completa A4</span>
            </button>

            {esAdmin && (
              <button
                onClick={() => {
                  soundManager.playTactileClick();
                  setTipoDocumento("carpas");
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  tipoDocumento === "carpas"
                    ? "bg-[#1E130C] text-[#FAF7F2] shadow-sm"
                    : "text-[#785E4F] hover:text-[#1E130C]"
                }`}
              >
                <QrCode size={15} />
                <span>🏷️ Carpas de Mesa con QR (Admin)</span>
              </button>
            )}

            <button
              onClick={() => {
                soundManager.playTactileClick();
                setTipoDocumento("takeaway");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                tipoDocumento === "takeaway"
                  ? "bg-[#1E130C] text-[#FAF7F2] shadow-sm"
                  : "text-[#785E4F] hover:text-[#1E130C]"
              }`}
            >
              <UtensilsCrossed size={15} />
              <span>🧁 Para Llevar & Catering</span>
            </button>
          </div>

          {/* Opciones de Estilo y Selector de Mesas */}
          <div className="flex flex-wrap items-center gap-3">
            {esAdmin && tipoDocumento === "carpas" && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#785E4F]">Mesa:</span>
                <select
                  value={mesaFiltro === "todas" ? "todas" : String(mesaFiltro)}
                  onChange={(e) => {
                    const val = e.target.value === "todas" ? "todas" : parseInt(e.target.value);
                    setMesaFiltro(val);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-[#D9CDBF] bg-white text-xs font-bold text-[#1E130C] focus:outline-none focus:ring-2 focus:ring-[#527953]"
                >
                  <option value="todas">Todas las Mesas (Planilla x12)</option>
                  {mesas.slice(0, 12).map((m) => (
                    <option key={m.id} value={m.numero}>
                      Mesa {m.numero} {m.zona?.nombre ? `• ${m.zona.nombre}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F5EFEB]">
              <button
                onClick={() => setEstiloColor("kraft")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  estiloColor === "kraft"
                    ? "bg-[#1E130C] text-[#FAF7F2]"
                    : "text-[#785E4F] hover:text-[#1E130C]"
                }`}
              >
                Kraft & Oro
              </button>
              <button
                onClick={() => setEstiloColor("blanco_negro")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  estiloColor === "blanco_negro"
                    ? "bg-[#1E130C] text-[#FAF7F2]"
                    : "text-[#785E4F] hover:text-[#1E130C]"
                }`}
              >
                Monocromo B&N
              </button>
            </div>
          </div>
        </div>

        {/* Tip informativo según el modo */}
        <div className="p-3.5 rounded-2xl bg-[#EBF3EA] border border-[#527953]/20 flex items-center justify-between text-xs text-[#2D452E]">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#527953] shrink-0" />
            <span>
              {tipoDocumento === "menu" &&
                "💡 Listo para imprimir en hoja A4 y colocar en las mesas o plastificar en carta doble faz."}
              {tipoDocumento === "carpas" &&
                "💡 Cada carpa incluye el QR directo a /mesa/[numero]. El cliente escanea y su orden va directo al mozo y a cocina."}
              {tipoDocumento === "takeaway" &&
                "💡 Formato resumido con números de contacto para pedidos para llevar, tandas calientes y eventos."}
            </span>
          </div>
          <span className="font-bold text-[11px] hidden sm:inline">Ctrl + P para Imprimir</span>
        </div>
      </header>


      {/* ═════════════════════════════════════════════════════════════════════
          DOCUMENTO 1: CARTA COMPLETA EDITORIAL A4
      ═════════════════════════════════════════════════════════════════════ */}
      {tipoDocumento === "menu" && (
        <article className="max-w-4xl mx-auto bg-white p-8 sm:p-14 rounded-3xl border border-[#EAE2D5] print:border-none print:shadow-none print:p-0 shadow-2xl space-y-10">
          
          {/* Cabecera Editorial */}
          <header className="text-center border-b-2 border-[#1E130C] pb-6 space-y-3">
            <div className="flex items-center justify-center gap-3.5">
              <img
                src={DENCKER_ASSETS.logo}
                alt="Dencker Pan"
                className="w-16 h-16 object-contain"
              />
              <div className="text-left">
                <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1E130C]">
                  DENCKER PAN
                </h1>
                <p className="text-[11px] uppercase tracking-widest font-semibold text-[#527953]">
                  Panadería Tradicional • Masa Madre • Café de Especialidad
                </p>
              </div>
            </div>

            <p className="text-xs text-[#785E4F] max-w-xl mx-auto italic leading-relaxed">
              "Elaboramos cada pieza con 24 horas de fermentación natural, masa madre viva, 100% mantequilla noble y café cosechado en los Yungas a 1,600 msnm. Cochabamba, Bolivia."
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-bold text-[#785E4F] uppercase tracking-wider pt-2 border-t border-stone-200">
              <span>• Tandas Calientes: 07:30 y 16:30 •</span>
              <span>• Precios en Bolivianos (Bs) •</span>
              <span>• WhatsApp: +591 76911000 •</span>
            </div>
          </header>

          {/* Secciones del Menú */}
          <div className="space-y-10">
            {seccionesMenu.map((sec) => {
              const itemsAMostrar = sec.items.slice(0, 14);
              if (itemsAMostrar.length === 0) return null;

              return (
                <section key={sec.id} className="space-y-4 break-inside-avoid">
                  <div className="border-b border-[#D9CDBF] pb-2 flex items-baseline justify-between">
                    <div>
                      <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1E130C] flex items-center gap-2">
                        <span>{sec.icono}</span>
                        <span>{sec.titulo}</span>
                      </h2>
                      <p className="text-[11px] text-[#785E4F] mt-0.5">{sec.descripcion}</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-[#527953] bg-[#EBF3EA] px-2 py-0.5 rounded">
                      {sec.badge}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 pt-1">
                    {itemsAMostrar.map((prod) => (
                      <div
                        key={prod.id}
                        className="flex items-baseline justify-between gap-2 border-b border-dotted border-stone-200 pb-1.5"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-[#1E130C] truncate">
                              {prod.nombre}
                            </span>
                            {prod.es_mas_vendido && (
                              <span className="text-[9px] font-bold uppercase text-[#527953]">
                                ★
                              </span>
                            )}
                          </div>
                          {prod.descripcion && (
                            <p className="text-[10px] text-[#785E4F] line-clamp-1">
                              {prod.descripcion}
                            </p>
                          )}
                        </div>

                        <span className="font-mono font-bold text-xs text-[#1E130C] shrink-0">
                          Bs {prod.precio.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {/* Pie con QR Dinámico General */}
          <footer className="pt-6 border-t-2 border-[#1E130C] flex flex-wrap items-center justify-between gap-6 break-inside-avoid">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 p-2 bg-white border-2 border-[#1E130C] rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                <QRCodeSVG
                  value={`${baseUrl}`}
                  size={68}
                  level="M"
                />
              </div>
              <div className="space-y-1">
                <p className="font-serif font-bold text-sm text-[#1E130C]">
                  Pide desde tu móvil sin esperas
                </p>
                <p className="text-[10px] text-[#785E4F] max-w-sm leading-relaxed">
                  Escanea este código QR con la cámara de tu celular para ver fotos reales, corte interior con IA y pedir a tu mesa.
                </p>
                <p className="text-[11px] font-mono text-[#527953] font-bold">
                  {baseUrl}
                </p>
              </div>
            </div>

            <div className="text-right text-[10px] text-[#785E4F] space-y-0.5">
              <p className="font-bold text-xs text-[#1E130C]">Dencker Pan • Cochabamba</p>
              <p>Atención continua de Lunes a Domingo: 07:00 a 21:30</p>
              <p>Masa madre viva de 24 horas y barismo de altura</p>
            </div>
          </footer>
        </article>
      )}


      {/* ═════════════════════════════════════════════════════════════════════
          DOCUMENTO 2: CARPAS DE MESA CON QR INDIVIDUAL (10x15 CM O STAND ACRÍLICO)
          [SOLO ACCESIBLE PARA GERENCIA / ADMIN]
      ═════════════════════════════════════════════════════════════════════ */}
      {esAdmin && tipoDocumento === "carpas" && (
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:block">
            {mesasAImprimir.map((mesa, idx) => {
              const tableUrl = `${baseUrl}/mesa/${mesa.numero}`;

              return (
                <div
                  key={mesa.id}
                  className={`bg-white rounded-3xl border-2 p-8 shadow-xl flex flex-col justify-between relative overflow-hidden transition-all break-inside-avoid print:shadow-none print:rounded-none print:border-black print:mb-12 print:page-break-after ${
                    estiloColor === "kraft"
                      ? "border-[#D49B54]/40"
                      : "border-stone-800"
                  }`}
                  style={{ minHeight: "480px" }}
                >
                  {/* Marco decorativo orlado de alta panadería */}
                  <div className="absolute inset-2 border border-dashed border-[#D9CDBF] rounded-2xl pointer-events-none" />

                  {/* Cabecera de la Carpa */}
                  <div className="text-center space-y-2 relative z-10 pt-2">
                    <div className="flex items-center justify-center gap-2">
                      <img
                        src={DENCKER_ASSETS.logo}
                        alt="Dencker Pan"
                        className="w-10 h-10 object-contain"
                      />
                      <span className="font-serif font-extrabold text-xl tracking-wider text-[#1E130C]">
                        DENCKER PAN
                      </span>
                    </div>

                    <div className="py-2">
                      <div className="inline-block px-6 py-2 rounded-2xl bg-[#1E130C] text-white shadow-md">
                        <span className="font-serif text-3xl sm:text-4xl font-black tracking-tight">
                          MESA {mesa.numero < 10 ? `0${mesa.numero}` : mesa.numero}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-[#527953] uppercase tracking-widest mt-1">
                        {mesa.zona?.nombre || "Salón & Terraza Jardín"} • Capacidad {mesa.capacidad} personas
                      </p>
                    </div>
                  </div>

                  {/* Cuerpo Central con QR Grande y Nítido */}
                  <div className="my-4 flex flex-col items-center justify-center relative z-10 space-y-3">
                    <div className="p-3 bg-white border-2 border-[#1E130C] rounded-2xl shadow-md">
                      <QRCodeSVG
                        value={tableUrl}
                        size={160}
                        level="H"
                        includeMargin={true}
                      />
                    </div>

                    <div className="text-center space-y-1 max-w-xs">
                      <p className="font-bold text-xs text-[#1E130C]">
                        📱 Escanea con tu cámara para pedir
                      </p>
                      <p className="text-[10px] text-[#785E4F] leading-snug">
                        Tu comanda va directo al barista y a la cocina. También puedes pedir la cuenta o llamar al mozo con 1 toque.
                      </p>
                    </div>
                  </div>

                  {/* Pie de la Carpa con WiFi y Enlace Directo */}
                  <div className="relative z-10 pt-3 border-t border-stone-200 text-center space-y-1 text-[10px] text-[#785E4F]">
                    <p className="font-mono font-bold text-[#527953]">
                      {tableUrl}
                    </p>
                    <div className="flex items-center justify-center gap-4 font-semibold text-stone-600">
                      <span>📶 WiFi: <strong>DenckerPan2026</strong></span>
                      <span>•</span>
                      <span>🥐 Tandas: <strong>07:30 y 16:30</strong></span>
                    </div>
                    <p className="text-[9px] text-stone-400 print:block">
                      ✂️ Línea de corte / Carpa acrílica 10x15 cm • Dencker Pan Cochabamba
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* ═════════════════════════════════════════════════════════════════════
          DOCUMENTO 3: CARTA RESUMIDA PARA LLEVAR (TAKEAWAY) & CATERING
      ═════════════════════════════════════════════════════════════════════ */}
      {tipoDocumento === "takeaway" && (
        <article className="max-w-4xl mx-auto bg-white p-8 sm:p-14 rounded-3xl border border-[#EAE2D5] print:border-none print:shadow-none print:p-0 shadow-2xl space-y-10">
          
          <header className="text-center border-b-2 border-[#1E130C] pb-6 space-y-3">
            <div className="flex items-center justify-center gap-3">
              <img
                src={DENCKER_ASSETS.logo}
                alt="Dencker Pan"
                className="w-14 h-14 object-contain"
              />
              <div className="text-left">
                <h1 className="font-serif text-3xl font-bold text-[#1E130C]">
                  DENCKER PAN — PARA LLEVAR & EVENTOS
                </h1>
                <p className="text-[11px] uppercase tracking-widest font-semibold text-[#527953]">
                  Servicio Express en Mostrador • Pedidos WhatsApp: +591 76911000
                </p>
              </div>
            </div>
            <p className="text-xs text-[#785E4F]">
              Pide tu tanda caliente con anticipación y recógela lista en sucursal sin esperas.
            </p>
          </header>

          {/* Grilla de Paquetes de Catering */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-[#1E130C] flex items-center gap-2 border-b pb-2">
              <span>🎉</span>
              <span>Paquetes de Catering & Mesas Dulces</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  nombre: "Defensa de Tesis & Brindis",
                  precio: "Bs 35 / persona",
                  incluye: "Mini croissants 100% mantequilla, cuñapés calientes, alfajores de maicena y termos de café Caranavi."
                },
                {
                  nombre: "Cumpleaños & Festejo Familiar",
                  precio: "Bs 45 / persona",
                  incluye: "Mesa dulce con mini tortas Mil Hojas, New York Rolls de pistacho, empanaditas y batidos tropicales."
                },
                {
                  nombre: "Coffee Break Corporativo",
                  precio: "Bs 40 / persona",
                  incluye: "Croissants rellenos de jamón y queso maduro, alfajores marplatenses y café de altura recién extraído."
                },
                {
                  nombre: "Té de la Tarde Gourmet Imperial",
                  precio: "Bs 50 / persona",
                  incluye: "Degustación de pastelería fina de autor, barismo en vivo con microfoam y panes de masa madre."
                }
              ].map((pkg, i) => (
                <div key={i} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-bold text-sm text-[#1E130C]">{pkg.nombre}</h3>
                    <span className="font-bold text-xs text-[#527953]">{pkg.precio}</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">{pkg.incluye}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Especialidades Insignia para Llevar */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-[#1E130C] flex items-center gap-2 border-b pb-2">
              <span>🥐</span>
              <span>Especialidades del Día para Retiro en Mostrador</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
              {[
                { n: "New York Roll de Pistacho Siciliano", p: "Bs 26.00" },
                { n: "Croissant Francés 100% Mantequilla (72 capas)", p: "Bs 18.00" },
                { n: "Cuñapé Abizcochado en Bolsa (200 gr)", p: "Bs 18.00" },
                { n: "Alfajor Boliviano de Autor a la Leña", p: "Bs 10.00" },
                { n: "Baguette Artesanal en Horno de Leña", p: "Bs 12.00" },
                { n: "Cappuccino de Altura Yungas (La Marzocco)", p: "Bs 18.00" },
                { n: "Alfajor Marplatense con Chocolate Belga", p: "Bs 12.50" },
                { n: "Torta Mil Hojas Mini Caramelizada", p: "Bs 20.00" },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between border-b border-dotted py-1.5">
                  <span className="font-semibold">{item.n}</span>
                  <span className="font-mono font-bold text-[#527953]">{item.p}</span>
                </div>
              ))}
            </div>
          </section>

          <footer className="pt-6 border-t-2 border-[#1E130C] text-center text-xs text-stone-600 space-y-1">
            <p className="font-bold text-[#1E130C]">Dencker Pan • Cochabamba, Bolivia</p>
            <p>Coordina tu retiro o delivery por WhatsApp: <strong>+591 76911000</strong></p>
            <p className="font-mono text-[11px] text-[#527953]">{baseUrl}</p>
          </footer>
        </article>
      )}

      {/* Estilos específicos de impresión */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
            font-size: 11pt;
          }
          .print\\:hidden {
            display: none !important;
          }
          .break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .print\\:page-break-after {
            page-break-after: always;
            break-after: page;
          }
        }
      `}</style>
    </div>
  );
}

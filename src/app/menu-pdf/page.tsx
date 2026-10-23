"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Printer, ArrowLeft, Download, QrCode, Sparkles, Coffee, Flame, ShieldCheck } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useSystemStore } from "@/store";
import { DENCKER_ASSETS, SEED_CATEGORIAS, SEED_PRODUCTOS } from "@/lib/seed-data";
import { Producto, Categoria } from "@/types";

export default function MenuPdfPage() {
  const storeProductos = useSystemStore((state) => state.productos);
  const storeCategorias = useSystemStore((state) => state.categorias);

  const productos: Producto[] =
    storeProductos && storeProductos.length > 0 ? storeProductos : SEED_PRODUCTOS;
  const categorias: Categoria[] =
    storeCategorias && storeCategorias.length > 0 ? storeCategorias : SEED_CATEGORIAS;

  const [baseUrl, setBaseUrl] = useState<string>("https://decker-pan.vercel.app");

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
    window.print();
  };

  // Agrupar productos por categorías principales
  const categoriasPrincipales = [
    {
      id: "panaderia",
      titulo: "Panadería Tradicional & Masa Madre (24h)",
      icono: "🥖",
      descripcion: "Horneados a la piedra diariamente a las 07:30 y 16:30. Harinas seleccionadas sin aditivos.",
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
      descripcion: "Laminado artesanal europeo con mantequilla noble pura.",
      items: productos.filter(
        (p) =>
          p.categoria_id === "c4" ||
          p.nombre.toLowerCase().includes("roll") ||
          p.nombre.toLowerCase().includes("croissant") ||
          p.nombre.toLowerCase().includes("alfajor") ||
          p.nombre.toLowerCase().includes("torta")
      ),
    },
    {
      id: "cafe",
      titulo: "Cafetería de Especialidad Caranavi (1,600 msnm)",
      icono: "☕",
      descripcion: "Granos 100% arábica seleccionados. Extracción doble y microfoam sedoso a 65°C.",
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
      titulo: "Masitas Saladas Tradicionales & Bocaditos",
      icono: "🥟",
      descripcion: "Recetas tradicionales de Cochabamba elaboradas con queso criollo fresco.",
      items: productos.filter(
        (p) =>
          p.categoria_id === "c1" ||
          p.categoria_id === "c5" ||
          p.categoria_id === "c6" ||
          p.nombre.toLowerCase().includes("cuñape") ||
          p.nombre.toLowerCase().includes("empanada") ||
          p.nombre.toLowerCase().includes("queque")
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4EFEB] text-[#1E130C] print:bg-white print:text-black font-sans py-8 px-4 sm:px-6 lg:px-8">
      {/* ── Barra de Control Superior (Oculta en Impresión) ── */}
      <div className="max-w-4xl mx-auto mb-8 print:hidden flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#D9CDBF] shadow-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#785E4F] hover:text-[#1E130C] transition"
        >
          <ArrowLeft size={16} />
          <span>Volver al Menú Digital</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleImprimir}
            className="px-5 py-2.5 rounded-xl bg-[#1E130C] hover:bg-[#322015] text-[#FAF7F2] font-bold text-xs shadow-md flex items-center gap-2 active:scale-95 transition"
          >
            <Printer size={16} className="text-[#87A987]" />
            <span>Descargar / Imprimir en PDF</span>
          </button>
        </div>
      </div>

      {/* ── Documento Menú Editorial (Listo para Impresión / Guardar PDF) ── */}
      <article className="max-w-4xl mx-auto bg-white p-8 sm:p-14 rounded-3xl border border-[#EAE2D5] print:border-none print:shadow-none print:p-0 shadow-xl space-y-10">
        
        {/* Cabecera Editorial */}
        <header className="text-center border-b-2 border-[#1E130C] pb-6 space-y-3">
          <div className="flex items-center justify-center gap-3">
            <img
              src={DENCKER_ASSETS.logo}
              alt="Dencker Pan"
              className="w-14 h-14 object-contain"
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

          <p className="text-xs text-[#785E4F] max-w-lg mx-auto italic">
            "Elaboramos cada pieza con 24 horas de fermentación natural, harinas seleccionadas y café cosechado en los Yungas a 1,600 msnm. Cochabamba, Bolivia."
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-bold text-[#785E4F] uppercase tracking-wider pt-2">
            <span>• Tandas Calientes: 07:30 y 16:30 •</span>
            <span>• Precios en Bolivianos (Bs) •</span>
            <span>• WhatsApp: +591 76911000 •</span>
          </div>
        </header>

        {/* Categorías y Listado de Productos */}
        <div className="space-y-10">
          {categoriasPrincipales.map((cat) => {
            const itemsAMostrar = cat.items.slice(0, 14);
            if (itemsAMostrar.length === 0) return null;

            return (
              <section key={cat.id} className="space-y-4 break-inside-avoid">
                <div className="border-b border-[#D9CDBF] pb-2 flex items-baseline justify-between">
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1E130C] flex items-center gap-2">
                      <span>{cat.icono}</span>
                      <span>{cat.titulo}</span>
                    </h2>
                    <p className="text-[11px] text-[#785E4F] mt-0.5">{cat.descripcion}</p>
                  </div>
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

        {/* Pie de Página con Código QR para Pedidos en Mesa */}
        <footer className="pt-6 border-t-2 border-[#1E130C] flex flex-wrap items-center justify-between gap-6 break-inside-avoid">
          <div className="flex items-center gap-4">
            <div className="w-18 h-18 p-1.5 bg-white border border-[#1E130C] rounded-xl flex items-center justify-center shrink-0">
              <QRCodeSVG
                value={`${baseUrl}`}
                size={64}
                level="M"
              />
            </div>
            <div className="space-y-0.5">
              <p className="font-serif font-bold text-xs text-[#1E130C]">
                Pide desde tu móvil sin esperas
              </p>
              <p className="text-[10px] text-[#785E4F]">
                Escanea este código QR con tu cámara para ver el menú interactivo con fotos, personalizaciones y despachos a mesa.
              </p>
              <p className="text-[10px] font-mono text-[#527953] font-bold">
                {baseUrl}
              </p>
            </div>
          </div>

          <div className="text-right text-[10px] text-[#785E4F] space-y-0.5">
            <p className="font-bold text-[#1E130C]">Dencker Pan Cochabamba</p>
            <p>Atención continua de Lunes a Domingo</p>
            <p>Horneados frescos en dos tandas diarias</p>
          </div>
        </footer>
      </article>

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
        }
      `}</style>
    </div>
  );
}

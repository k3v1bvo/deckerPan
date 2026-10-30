"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  MessageCircle,
  Menu,
  X,
  Lock,
  Calendar,
  MapPin,
  Coffee,
  FileText,
} from "lucide-react";
import { useCartStore, useUIStore } from "@/store";
import { soundManager } from "@/lib/sound";
import { DENCKER_ASSETS } from "@/lib/seed-data";

export default function RoleNav() {
  const pathname = usePathname();
  const { count, total } = useCartStore();
  const { setCartOpen } = useUIStore();
  const cartCount = count();
  const cartTotal = total();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // REGLA DE PRODUCCIÓN:
  // RoleNav SOLO se muestra en la página web pública principal ("/").
  // En las pantallas de comensal sentado en mesa (/mesa/[numero]),
  // en el documento imprimible (/menu-pdf) y en los terminales de
  // personal (/admin, /caja, /mesero, /kds), RoleNav devuelve null
  // para evitar fugas de navegación o barras redundantes.
  // ─────────────────────────────────────────────────────────────
  if (pathname !== "/") {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#160D08]/98 backdrop-blur-2xl border-b-2 border-amber-500/30 text-white transition-all shadow-2xl">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-22 flex items-center justify-between gap-4">
          {/* Logo Oficial de Dencker Pan con Don Dencker Badge */}
          <Link
            href="/"
            onClick={() => soundManager.playSuccessTone()}
            className="flex items-center gap-3.5 group shrink-0"
          >
            <div className="relative w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-white p-1 border-2 border-amber-400/90 shadow-[0_0_15px_rgba(245,158,11,0.35)] flex items-center justify-center overflow-hidden group-hover:scale-105 group-hover:border-amber-300 transition-all">
              <img
                src={DENCKER_ASSETS.logo}
                alt="Don Dencker Sello Oficial"
                className="w-full h-full object-contain select-none"
              />
            </div>

            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-xl sm:text-2xl text-white tracking-wide drop-shadow-sm">
                  Dencker Pan
                </span>
                <span className="hidden sm:inline-flex items-center text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#991B24] to-[#B91C1C] text-white border border-amber-400/40 shadow-xs">
                  Café 4 Llamas
                </span>
              </div>
              <span className="text-[11px] sm:text-xs text-amber-300 font-sans uppercase tracking-widest block font-semibold mt-0.5">
                Panadería & Café • Cochabamba
              </span>
            </div>
          </Link>

          {/* Navegación Principal para Clientes (Desktop) con Iconos más Grandes y Alto Contraste */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2 text-sm font-semibold text-stone-100">
            <a
              href="#catalogo"
              className="hover:text-amber-300 hover:bg-white/10 transition-all flex items-center gap-2 py-2 px-3 rounded-xl"
            >
              <Coffee size={19} className="text-amber-400 shrink-0" />
              <span>Catálogo & Precios</span>
            </a>
            <a
              href="#catering"
              className="hover:text-amber-300 hover:bg-white/10 transition-all flex items-center gap-2 py-2 px-3 rounded-xl"
            >
              <Calendar size={19} className="text-amber-400 shrink-0" />
              <span>Catering & Eventos</span>
            </a>
            <a
              href="#contacto"
              className="hover:text-amber-300 hover:bg-white/10 transition-all flex items-center gap-2 py-2 px-3 rounded-xl"
            >
              <MapPin size={19} className="text-amber-400 shrink-0" />
              <span>Nuestra Casa</span>
            </a>
            
            {/* Botón Destacado: Carta Oficial PDF (6 Páginas Reales) */}
            <Link
              href="/menu-pdf"
              className="text-white hover:text-amber-100 transition-all flex items-center gap-2 py-2.5 px-4 rounded-full bg-gradient-to-r from-[#991B24] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#991B24] border border-amber-400/50 shadow-md font-bold text-xs active:scale-95 ml-1 cursor-pointer"
            >
              <FileText size={18} className="text-amber-300 shrink-0" />
              <span>Carta Oficial PDF (6 Págs)</span>
            </Link>
          </nav>

          {/* Acciones de Cabecera: Carrito, WhatsApp & Acceso Discreto */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Botón WhatsApp Oficial Verde */}
            <a
              href={DENCKER_ASSETS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <MessageCircle size={18} className="shrink-0" />
              <span>WhatsApp</span>
            </a>

            {/* Carrito de Compras Flotante / Badge Alto Contraste */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                soundManager.playClick();
                setCartOpen(true);
              }}
              className="relative px-4 sm:px-5 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 border-2 border-amber-400/80 text-white font-bold text-xs shadow-lg flex items-center gap-2.5 active:scale-95 transition cursor-pointer"
            >
              <ShoppingBag size={18} className="text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Canasta</span>
              {cartCount > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 font-mono text-xs font-black shadow-xs">
                  {cartCount} • Bs {cartTotal.toFixed(0)}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-mono text-xs font-bold">
                  0
                </span>
              )}
            </motion.button>

            {/* Acceso Discreto a Terminales de Personal (Producción) */}
            <Link
              href="/admin"
              onClick={() => soundManager.playClick()}
              title="Acceso seguro al Terminal de Personal"
              aria-label="Acceso al Personal"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-stone-200 hover:text-amber-300 flex items-center justify-center transition active:scale-95 cursor-pointer"
            >
              <Lock size={17} />
            </Link>

            {/* Menú Hamburguesa para Móvil */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menú"
              className="lg:hidden w-10 h-10 rounded-full bg-white/15 text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Cajón Móvil Desplegable (Solo contenido de cliente) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t-2 border-amber-500/30 bg-[#140D08] px-4 py-5 space-y-3.5 text-xs overflow-hidden"
            >
              <div className="space-y-2">
                <a
                  href="#catalogo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-stone-100 font-semibold flex items-center gap-3 text-sm"
                >
                  <Coffee size={20} className="text-amber-400 shrink-0" />
                  <span>Catálogo & Precios (114 Productos Oficiales)</span>
                </a>
                <a
                  href="#catering"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-stone-100 font-semibold flex items-center gap-3 text-sm"
                >
                  <Calendar size={20} className="text-amber-400 shrink-0" />
                  <span>Cotizador de Catering & Eventos</span>
                </a>
                <a
                  href="#contacto"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-stone-100 font-semibold flex items-center gap-3 text-sm"
                >
                  <MapPin size={20} className="text-amber-400 shrink-0" />
                  <span>Sucursal & Horarios Cochabamba</span>
                </a>
                <Link
                  href="/menu-pdf"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-[#991B24] to-[#B91C1C] text-white font-bold flex items-center gap-3 text-sm border border-amber-400/40 shadow-md"
                >
                  <FileText size={20} className="text-amber-300 shrink-0" />
                  <span>Carta Oficial PDF (Ver las 6 Páginas Reales)</span>
                </Link>
              </div>

              <a
                href={DENCKER_ASSETS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-center flex items-center justify-center gap-2.5 shadow-md text-sm"
              >
                <MessageCircle size={20} />
                <span>Pedir directo por WhatsApp (+591 76911000)</span>
              </a>

              <div className="pt-2 border-t border-white/10 flex justify-center">
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs text-stone-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1.5 py-1"
                >
                  <Lock size={14} />
                  <span>Portal del Personal Dencker Pan</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

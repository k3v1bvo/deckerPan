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
      <header className="sticky top-0 z-40 bg-[#1E130C]/95 backdrop-blur-xl border-b border-amber-950/40 text-white transition-all shadow-xl">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo Oficial de Dencker Pan con Chef Hat + Badge Don Dencker */}
          <Link
            href="/"
            onClick={() => soundManager.playSuccessTone()}
            className="flex items-center gap-3 group shrink-0"
          >
            <div className="relative w-11 h-11 rounded-2xl bg-white/10 p-1.5 border border-amber-500/30 flex items-center justify-center overflow-hidden group-hover:border-amber-400 transition">
              <img
                src={DENCKER_ASSETS.logo}
                alt="Dencker Pan Logo Oficial"
                className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(217,119,6,0.35)] group-hover:scale-105 transition-transform"
              />
            </div>

            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-lg sm:text-xl text-white tracking-wide">
                  Dencker Pan
                </span>
                <span className="hidden sm:inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#991B24] text-white border border-red-400/30">
                  Café 4 Llamas
                </span>
              </div>
              <span className="text-[10px] text-amber-300/80 font-sans uppercase tracking-widest block font-medium">
                Panadería & Café • Cochabamba
              </span>
            </div>
          </Link>

          {/* Navegación Principal para Clientes (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-stone-300">
            <a
              href="#catalogo"
              className="hover:text-amber-400 transition-colors flex items-center gap-1.5 py-1"
            >
              <Coffee size={14} className="text-amber-400" />
              <span>Catálogo & Precios</span>
            </a>
            <a
              href="#catering"
              className="hover:text-amber-400 transition-colors flex items-center gap-1.5 py-1"
            >
              <Calendar size={14} className="text-amber-400" />
              <span>Catering & Eventos</span>
            </a>
            <a
              href="#contacto"
              className="hover:text-amber-400 transition-colors flex items-center gap-1.5 py-1"
            >
              <MapPin size={14} className="text-amber-400" />
              <span>Nuestra Casa</span>
            </a>
            
            {/* Botón Destacado: Carta Oficial PDF (6 Páginas Reales) */}
            <Link
              href="/menu-pdf"
              className="text-white hover:text-amber-200 transition-all flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-[#991B24] hover:bg-[#7F1D1D] border border-red-400/30 shadow-sm font-bold active:scale-95"
            >
              <FileText size={13} className="text-amber-300" />
              <span>Carta Oficial PDF (6 Págs)</span>
            </Link>
          </nav>

          {/* Acciones de Cabecera: Carrito, WhatsApp & Acceso Discreto */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Botón WhatsApp */}
            <a
              href={DENCKER_ASSETS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition shadow-sm active:scale-95"
            >
              <MessageCircle size={14} />
              <span>WhatsApp</span>
            </a>

            {/* Carrito de Compras Flotante / Badge */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                soundManager.playClick();
                setCartOpen(true);
              }}
              className="relative px-3.5 sm:px-4 py-2 rounded-full bg-[#991B24] hover:bg-[#7F1D1D] border border-red-400/40 text-white font-semibold text-xs shadow-md flex items-center gap-2 active:scale-95 transition cursor-pointer"
            >
              <ShoppingBag size={15} className="text-amber-300" />
              <span className="hidden sm:inline">Canasta</span>
              {cartCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 font-mono text-[10px] font-bold">
                  {cartCount} • Bs {cartTotal.toFixed(0)}
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-white font-mono text-[10px]">
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
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-stone-400 hover:text-amber-300 flex items-center justify-center transition active:scale-95"
            >
              <Lock size={14} />
            </Link>

            {/* Menú Hamburguesa para Móvil */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menú"
              className="lg:hidden w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
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
              className="lg:hidden border-t border-amber-900/40 bg-[#140D08] px-4 py-5 space-y-3 text-xs overflow-hidden"
            >
              <div className="space-y-1.5">
                <a
                  href="#catalogo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-amber-100 font-semibold flex items-center gap-2.5"
                >
                  <Coffee size={16} className="text-amber-400" />
                  <span>Catálogo & Precios (114 Productos Oficiales)</span>
                </a>
                <a
                  href="#catering"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-amber-100 font-semibold flex items-center gap-2.5"
                >
                  <Calendar size={16} className="text-amber-400" />
                  <span>Cotizador de Catering & Eventos</span>
                </a>
                <a
                  href="#contacto"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-amber-100 font-semibold flex items-center gap-2.5"
                >
                  <MapPin size={16} className="text-amber-400" />
                  <span>Sucursal & Horarios Cochabamba</span>
                </a>
                <Link
                  href="/menu-pdf"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-[#991B24] hover:bg-[#7F1D1D] text-white font-bold flex items-center gap-2.5 border border-red-400/30"
                >
                  <FileText size={16} className="text-amber-300" />
                  <span>Carta Oficial PDF (Ver las 6 Páginas Reales)</span>
                </Link>
              </div>

              <a
                href={DENCKER_ASSETS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-center flex items-center justify-center gap-2 shadow-md"
              >
                <MessageCircle size={16} />
                <span>Pedir directo por WhatsApp (+591 76911000)</span>
              </a>

              <div className="pt-2 border-t border-white/10 flex justify-center">
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[11px] text-stone-500 hover:text-amber-300 transition-colors inline-flex items-center gap-1.5 py-1"
                >
                  <Lock size={12} />
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

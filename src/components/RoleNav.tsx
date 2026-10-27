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
      <header className="sticky top-0 z-40 bg-[#160E09]/95 backdrop-blur-xl border-b border-amber-900/30 text-white transition-all shadow-xl">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo Oficial de Dencker Pan */}
          <Link
            href="/"
            onClick={() => soundManager.playSuccessTone()}
            className="flex items-center gap-3 group shrink-0"
          >
            <div className="relative">
              <img
                src={DENCKER_ASSETS.logo}
                alt="Dencker Pan Logo Oficial"
                className="w-10 h-10 sm:w-11 sm:h-11 object-contain filter drop-shadow-[0_4px_12px_rgba(217,119,6,0.35)] group-hover:scale-105 transition-transform"
              />
            </div>

            <div className="leading-tight">
              <span className="font-serif font-black text-lg sm:text-xl text-white tracking-wide flex items-center gap-1.5">
                Dencker Pan
              </span>
              <span className="text-[10px] text-amber-300/80 font-sans uppercase tracking-widest block font-medium">
                Panadería & Café • Cochabamba
              </span>
            </div>
          </Link>

          {/* Navegación Principal para Clientes (Desktop) */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-medium text-stone-300">
            <a
              href="#catalogo"
              className="hover:text-amber-400 transition-colors flex items-center gap-1.5 py-1"
            >
              <Coffee size={14} className="text-amber-500/80" />
              <span>Catálogo & Menú</span>
            </a>
            <a
              href="#catering"
              className="hover:text-amber-400 transition-colors flex items-center gap-1.5 py-1"
            >
              <Calendar size={14} className="text-amber-500/80" />
              <span>Catering & Eventos</span>
            </a>
            <a
              href="#contacto"
              className="hover:text-amber-400 transition-colors flex items-center gap-1.5 py-1"
            >
              <MapPin size={14} className="text-amber-500/80" />
              <span>Nuestra Casa</span>
            </a>
            <Link
              href="/menu-pdf"
              target="_blank"
              className="text-amber-300/90 hover:text-amber-200 transition-colors flex items-center gap-1.5 py-1 px-3 rounded-full bg-white/5 border border-amber-500/20"
            >
              <FileText size={13} className="text-amber-400" />
              <span>Menú Carta PDF</span>
            </Link>
          </nav>

          {/* Acciones de Cabecera: Carrito, WhatsApp & Acceso Discreto */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Botón WhatsApp */}
            <a
              href={DENCKER_ASSETS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-sm active:scale-95"
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
              className="relative px-3.5 sm:px-4 py-2 rounded-full bg-[#24170F] hover:bg-[#2C1C13] border border-amber-600/30 text-amber-200 font-semibold text-xs shadow-md flex items-center gap-2 active:scale-95 transition cursor-pointer"
            >
              <ShoppingBag size={15} className="text-amber-400" />
              <span className="hidden sm:inline">Canasta</span>
              {cartCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 font-mono text-[10px] font-bold">
                  {cartCount} • Bs {cartTotal.toFixed(0)}
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-stone-400 font-mono text-[10px]">
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
                  <span>Catálogo & Menú Completo (240 Productos)</span>
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
                  target="_blank"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold flex items-center gap-2.5 border border-amber-500/20"
                >
                  <FileText size={16} className="text-amber-400" />
                  <span>Menú Carta en PDF (Imprimible)</span>
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

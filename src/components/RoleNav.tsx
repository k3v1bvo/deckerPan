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
  // RoleNav se muestra en la página web pública principal ("/")
  // y en la Carta Oficial digital ("/menu-pdf").
  // En las pantallas de comensal sentado en mesa (/mesa/[numero])
  // y en los terminales de personal (/admin, /caja, /mesero, /kds),
  // RoleNav devuelve null para evitar fugas de navegación.
  // ─────────────────────────────────────────────────────────────
  if (pathname !== "/" && pathname !== "/menu-pdf") {
    return null;
  }

  return (
    <>
      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-40 bg-[#160D08] backdrop-blur-2xl border-b border-amber-500/20 text-white shadow-xl print:hidden">
        <div className="w-full max-w-screen-xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-3">

          {/* ── LOGO & BRAND IDENTITY RESPONSIVE (MÓVIL & ESCRITORIO) ── */}
          <Link
            href="/"
            onClick={() => soundManager.playSuccessTone()}
            className="flex items-center gap-2 sm:gap-3 group shrink-0 min-w-0"
          >
            <div className="h-11 sm:h-14 w-auto flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <img
                src={DENCKER_ASSETS.logoLight}
                alt="Don Dencker"
                className="h-full w-auto max-h-11 sm:max-h-14 object-contain select-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]"
              />
            </div>
            <div className="leading-tight flex flex-col justify-center">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-serif font-black text-base sm:text-xl text-white tracking-wide group-hover:text-amber-200 transition-colors whitespace-nowrap">
                  Dencker Pan
                </span>
                <span className="text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full bg-[#991B24] text-white border border-amber-400/30 whitespace-nowrap shadow-xs">
                  Café 4 Llamas
                </span>
              </div>
              <span className="text-[10px] text-amber-300/80 font-mono tracking-wider font-semibold hidden sm:block">
                Panadería &amp; Café &bull; Cochabamba
              </span>
            </div>
          </Link>

          {/* ── NAV LINKS (Desktop ≥ lg) ── */}
          <nav className="hidden lg:flex items-center gap-0.5 text-[13px] font-semibold text-stone-200">
            <a
              href="/#catalogo"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:text-amber-300 hover:bg-white/8 transition-all whitespace-nowrap"
            >
              <Coffee size={15} className="text-amber-400 shrink-0" />
              Catálogo & Precios
            </a>
            <a
              href="/#catering"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:text-amber-300 hover:bg-white/8 transition-all whitespace-nowrap"
            >
              <Calendar size={15} className="text-amber-400 shrink-0" />
              Catering & Eventos
            </a>
            <a
              href="/#contacto"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:text-amber-300 hover:bg-white/8 transition-all whitespace-nowrap"
            >
              <MapPin size={15} className="text-amber-400 shrink-0" />
              Nuestra Casa
            </a>
            <Link
              href="/menu-pdf"
              className={`ml-1 flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-[12px] border shadow transition-all active:scale-95 whitespace-nowrap ${
                pathname === "/menu-pdf"
                  ? "bg-[#991B24] text-white border-amber-400 ring-2 ring-amber-400/50"
                  : "bg-[#991B24] hover:bg-[#b91c1c] text-white border-amber-400/40"
              }`}
            >
              <FileText size={14} className="text-amber-300 shrink-0" />
              Carta Oficial PDF
            </Link>
          </nav>

          {/* ── ACCIONES DERECHA ── */}
          <div className="flex items-center gap-2">
            {/* WhatsApp */}
            <a
              href={DENCKER_ASSETS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-[12px] font-bold transition-all shadow active:scale-95 whitespace-nowrap"
            >
              <MessageCircle size={15} className="shrink-0" />
              WhatsApp
            </a>

            {/* Carrito Táctil & Compacto en Celulares */}
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => {
                soundManager.playClick();
                setCartOpen(true);
              }}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-stone-900 hover:bg-stone-800 border border-amber-400/60 sm:border-2 sm:border-amber-400/70 text-white text-xs font-bold shadow transition-all active:scale-95 cursor-pointer whitespace-nowrap min-h-[38px]"
              aria-label="Ver Canasta"
            >
              <ShoppingBag size={15} className="text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Canasta</span>
              {cartCount > 0 ? (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-400 text-stone-950 font-mono text-[10px] font-black">
                  {cartCount}
                  <span className="hidden md:inline text-stone-700">· Bs {cartTotal.toFixed(0)}</span>
                </span>
              ) : (
                <span className="w-4 h-4 rounded-full bg-white/15 text-white font-mono text-[10px] font-bold flex items-center justify-center">
                  0
                </span>
              )}
            </motion.button>

            {/* Acceso Staff (Solo en Desktop para no estorbar en móviles) */}
            <Link
              href="/admin"
              onClick={() => soundManager.playClick()}
              title="Acceso al Personal"
              aria-label="Acceso al Personal"
              className="hidden sm:flex w-9 h-9 rounded-full bg-white/8 hover:bg-white/15 border border-white/15 text-stone-300 hover:text-amber-300 items-center justify-center transition active:scale-95 cursor-pointer"
            >
              <Lock size={15} />
            </Link>

            {/* Hamburger (Móvil con tamaño táctil de 40px) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menú"
              className="lg:hidden w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
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

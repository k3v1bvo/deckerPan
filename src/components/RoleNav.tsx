"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  UtensilsCrossed,
  ChefHat,
  Receipt,
  Settings,
  QrCode,
  Bell,
  Home,
  ShoppingBag,
  MessageCircle,
  Menu,
  X,
  Sparkles,
  Layers,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useSystemStore, useCartStore, useUIStore } from "@/store";
import { SUPABASE_CONFIGURED } from "@/lib/supabase";
import { soundManager } from "@/lib/sound";
import { DENCKER_ASSETS } from "@/lib/seed-data";

export default function RoleNav() {
  const pathname = usePathname();
  const alertas = useSystemStore((state) => state.alertas);
  const alertasPendientes = alertas.filter((a) => !a.atendida);

  const { count, total } = useCartStore();
  const { setCartOpen } = useUIStore();
  const cartCount = count();
  const cartTotal = total();

  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isPublicHome = pathname === "/";

  const STAFF_ROLES = [
    {
      id: "mesero",
      href: "/mesero",
      label: "Sala & Mesero",
      badge: alertasPendientes.length > 0 ? `${alertasPendientes.length} alertas` : undefined,
      icon: UtensilsCrossed,
      color: "from-amber-600 to-amber-700",
      desc: "Croquis de mesas, toma de comandas móviles y rondas rápidas.",
    },
    {
      id: "kds",
      href: "/kds",
      label: "Cocina & Barismo KDS",
      icon: ChefHat,
      color: "from-blue-600 to-indigo-700",
      desc: "Pantalla táctil de preparación por estaciones y semáforo de tiempos.",
    },
    {
      id: "caja",
      href: "/caja",
      label: "Caja POS & Facturación",
      icon: Receipt,
      color: "from-emerald-600 to-teal-700",
      desc: "Cobro ágil con QR Simple boliviano, efectivo BOB y arqueo ciego.",
    },
    {
      id: "admin",
      href: "/admin",
      label: "Administración SaaS",
      icon: Settings,
      color: "from-stone-700 to-stone-900",
      desc: "Gestión de los 240 productos, imágenes ImgBB, stock y reportes.",
    },
    {
      id: "qr",
      href: "/mesa/1",
      label: "Mesa QR Autoservicio",
      icon: QrCode,
      color: "from-orange-600 to-amber-700",
      desc: "Experiencia del comensal sentado en mesa para pedir sin esperas.",
    },
  ];

  // ─────────────────────────────────────────────────────────────
  // 1. CASO: RUTA INTERNA DE PERSONAL (/mesero, /kds, /caja, /admin, /mesa/...)
  // ─────────────────────────────────────────────────────────────
  if (!isPublicHome) {
    const currentRole = STAFF_ROLES.find((r) => pathname.startsWith(r.href)) || {
      label: pathname.startsWith("/mesa") ? "Mesa Digital" : "Módulo Operativo",
      icon: Layers,
    };
    const CurrentIcon = currentRole.icon;

    return (
      <header className="sticky top-0 z-40 bg-[#160E09]/95 backdrop-blur-xl border-b border-amber-900/40 text-white px-3 sm:px-6 py-2.5 shadow-xl transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo + Estación Actual */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/"
              onClick={() => soundManager.playSuccessTone()}
              className="flex items-center gap-2 group hover:opacity-90 transition"
            >
              <img
                src={DENCKER_ASSETS.logo}
                alt="Dencker Pan"
                className="w-8 h-8 object-contain drop-shadow"
              />
              <span className="font-serif font-bold text-sm tracking-wide text-amber-100 hidden sm:inline">
                Dencker Pan
              </span>
            </Link>

            <span className="h-4 w-px bg-white/20 hidden sm:inline" />

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-amber-300">
              <CurrentIcon size={14} className="text-amber-400" />
              <span>{currentRole.label}</span>
            </div>
          </div>

          {/* Selector Rápido de Estaciones de Trabajo (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-black/30 p-1 rounded-full border border-white/10">
            {STAFF_ROLES.map((role) => {
              const Icon = role.icon;
              const isActive = pathname.startsWith(role.href);

              return (
                <Link
                  key={role.id}
                  href={role.href}
                  onClick={() => soundManager.playSuccessTone()}
                  className={`relative px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? "bg-amber-600 text-white font-bold shadow-sm"
                      : "text-stone-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={13} />
                  <span>{role.label.split(" ")[0]}</span>
                  {role.badge && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[9px] font-mono font-bold animate-pulse">
                      !
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Controles de Derecha: Cloud status & Volver a la Tienda */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 text-[11px] text-amber-200/80 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-mono text-[10px]">
                {SUPABASE_CONFIGURED ? "Supabase Live" : "Local Sync"}
              </span>
            </div>

            {/* Botón rápido para cambiar de estación en móviles */}
            <button
              onClick={() => setStaffModalOpen(true)}
              className="lg:hidden px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-amber-200 font-semibold flex items-center gap-1"
            >
              <Layers size={13} />
              <span>Roles</span>
            </button>

            <Link
              href="/"
              onClick={() => soundManager.playClick()}
              className="px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-200 text-xs font-semibold flex items-center gap-1 transition"
            >
              <span>Tienda</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Modal para cambiar de rol en móvil */}
        <AnimatePresence>
          {staffModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setStaffModalOpen(false)}
                className="fixed inset-0 bg-black/75 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-[#1A110B] border border-amber-500/30 rounded-3xl p-5 max-w-sm w-full text-white shadow-2xl space-y-4 z-10"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <img src={DENCKER_ASSETS.logo} alt="" className="w-6 h-6 object-contain" />
                    <span className="font-serif font-bold text-sm text-amber-100">
                      Estaciones de Personal
                    </span>
                  </div>
                  <button onClick={() => setStaffModalOpen(false)} className="text-stone-400 hover:text-white">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-2">
                  {STAFF_ROLES.map((r) => {
                    const Icon = r.icon;
                    return (
                      <Link
                        key={r.id}
                        href={r.href}
                        onClick={() => {
                          setStaffModalOpen(false);
                          soundManager.playSuccessTone();
                        }}
                        className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between group transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                            <Icon size={16} />
                          </span>
                          <div>
                            <p className="font-bold text-xs text-white">{r.label}</p>
                            <p className="text-[10px] text-stone-400">{r.desc}</p>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-stone-500 group-hover:text-amber-400" />
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </header>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. CASO: PÁGINA PRINCIPAL / TIENDA (FLAGSHIP PUBLIC STOREFRONT HEADER)
  // ─────────────────────────────────────────────────────────────
  return (
    <>
      <header className="sticky top-0 z-40 bg-[#160E09]/95 backdrop-blur-xl border-b border-amber-900/40 text-white transition-all shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Logo Oficial de Dencker Pan con Tipografía Editorial */}
          <Link
            href="/"
            onClick={() => soundManager.playSuccessTone()}
            className="flex items-center gap-3 group shrink-0"
          >
            <div className="relative">
              <img
                src={DENCKER_ASSETS.logo}
                alt="Dencker Pan Logo Oficial"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain filter drop-shadow-[0_4px_12px_rgba(217,119,6,0.35)] group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-[#160E09] flex items-center justify-center">
                <Sparkles size={8} className="text-[#160E09]" />
              </span>
            </div>

            <div className="leading-tight">
              <span className="font-serif font-black text-lg sm:text-xl text-white tracking-wide flex items-center gap-1.5">
                Dencker Pan
              </span>
              <span className="text-[10px] text-amber-300/80 font-sans uppercase tracking-widest block font-semibold">
                Panadería & Café • Cochabamba
              </span>
            </div>
          </Link>

          {/* Navegación Principal para Clientes (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-amber-100/90">
            <a
              href="#catalogo"
              className="hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <span>🥖 Catálogo & Menú</span>
            </a>
            <a
              href="#cotizador"
              className="hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <span>💼 Catering & Eventos</span>
            </a>
            <a
              href="#contacto"
              className="hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <span>📍 Nuestra Casa</span>
            </a>
          </nav>

          {/* Acciones de Cabecera: Carrito, WhatsApp & Portal de Roles */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Botón WhatsApp */}
            <a
              href={DENCKER_ASSETS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm active:scale-95"
            >
              <MessageCircle size={15} />
              <span>WhatsApp</span>
            </a>

            {/* Carrito de Compras Flotante / Badge */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                soundManager.playClick();
                setCartOpen(true);
              }}
              className="relative px-3.5 sm:px-4 py-2 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-stone-950 font-black text-xs shadow-md shadow-amber-950/30 flex items-center gap-2 active:scale-95 transition"
            >
              <ShoppingBag size={15} />
              <span className="hidden sm:inline">Canasta</span>
              {cartCount > 0 ? (
                <span className="px-1.5 py-0.5 rounded-full bg-stone-950 text-amber-300 font-mono text-[10px]">
                  {cartCount} • Bs {cartTotal.toFixed(0)}
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded-full bg-black/20 text-stone-950 font-mono text-[10px]">
                  0
                </span>
              )}
            </motion.button>

            {/* Botón de Acceso al Portal de Personal (5 Roles) */}
            <button
              onClick={() => setStaffModalOpen(true)}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold transition active:scale-95"
            >
              <Layers size={14} className="text-amber-400" />
              <span>Portal Personal</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-300 text-[10px] font-mono">
                5 Roles
              </span>
            </button>

            {/* Menú Hamburguesa para Móvil */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center transition active:scale-95"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Cajón Móvil Desplegable */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-amber-900/40 bg-[#140D08] px-4 py-5 space-y-4 text-xs overflow-hidden"
            >
              <div className="space-y-1">
                <a
                  href="#catalogo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-amber-100 font-bold"
                >
                  🥖 Catálogo & Menú Completo (240 Productos)
                </a>
                <a
                  href="#cotizador"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-amber-100 font-bold"
                >
                  💼 Cotizador de Catering & Eventos
                </a>
                <a
                  href="#contacto"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-amber-100 font-bold"
                >
                  📍 Sucursal & Horarios Cochabamba
                </a>
              </div>

              <div className="pt-2 border-t border-white/10 space-y-2">
                <p className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                  Acceso a Estaciones de Personal
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {STAFF_ROLES.map((r) => {
                    const Icon = r.icon;
                    return (
                      <Link
                        key={r.id}
                        href={r.href}
                        onClick={() => {
                          setMobileMenuOpen(false);
                          soundManager.playSuccessTone();
                        }}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-2"
                      >
                        <Icon size={14} className="text-amber-400 shrink-0" />
                        <span className="font-semibold text-stone-200 text-[11px] truncate">
                          {r.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
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
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Modal / Hub de Roles para Personal (Desktop & Tablet) */}
      <AnimatePresence>
        {staffModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStaffModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative bg-gradient-to-b from-[#1E130C] to-[#120B07] border border-amber-500/30 rounded-[32px] p-6 sm:p-8 max-w-2xl w-full text-white shadow-2xl space-y-6 z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={DENCKER_ASSETS.logo}
                    alt="Dencker Pan"
                    className="w-10 h-10 object-contain drop-shadow"
                  />
                  <div>
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-amber-100 flex items-center gap-2">
                      <span>Portal Operativo Dencker Pan</span>
                      <ShieldCheck size={18} className="text-amber-400" />
                    </h3>
                    <p className="text-xs text-amber-200/70">
                      Selecciona la estación de trabajo para tu turno en Cochabamba
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setStaffModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Roles Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {STAFF_ROLES.map((r) => {
                  const Icon = r.icon;
                  return (
                    <Link
                      key={r.id}
                      href={r.href}
                      onClick={() => {
                        setStaffModalOpen(false);
                        soundManager.playSuccessTone();
                      }}
                      className="p-4 rounded-2xl bg-white/5 hover:bg-amber-950/40 border border-white/10 hover:border-amber-500/40 transition group flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <span className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/30 text-amber-300 border border-amber-500/30 group-hover:scale-105 transition-transform">
                          <Icon size={20} />
                        </span>
                        <ChevronRight
                          size={16}
                          className="text-stone-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white group-hover:text-amber-200 transition-colors">
                          {r.label}
                        </h4>
                        <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                          {r.desc}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-amber-200/80 flex items-center justify-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>
                  Sincronización en tiempo real activa con Supabase PostgreSQL
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

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
  Calendar,
  MapPin,
  Coffee,
  FileText,
} from "lucide-react";
import { useSystemStore, useCartStore, useUIStore } from "@/store";
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
      desc: "Croquis de mesas, comandas móviles y rondas rápidas.",
    },
    {
      id: "kds",
      href: "/kds",
      label: "Cocina & Barismo KDS",
      icon: ChefHat,
      color: "from-blue-600 to-indigo-700",
      desc: "Tickets táctiles en vivo, estaciones y semáforo de tiempos.",
    },
    {
      id: "caja",
      href: "/caja",
      label: "Caja POS & Facturación",
      icon: Receipt,
      color: "from-emerald-600 to-teal-700",
      desc: "Cobro ágil con QR Simple boliviano, efectivo BOB y arqueo.",
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
    {
      id: "menu-pdf",
      href: "/menu-pdf",
      label: "Menú Carta PDF",
      icon: FileText,
      color: "from-stone-600 to-stone-800",
      desc: "Menú físico imprimible y exportable en PDF con QR de mesa.",
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
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-3">
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

            {/* Badge de Rol Actual */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-amber-200">
              <CurrentIcon size={14} className="text-amber-400" />
              <span className="font-semibold">{currentRole.label}</span>
            </div>
          </div>

          {/* Selector de Roles Desktop */}
          <div className="hidden md:flex items-center gap-1.5 bg-black/30 p-1 rounded-full border border-white/10">
            {STAFF_ROLES.map((r) => {
              const active = pathname.startsWith(r.href);
              const Icon = r.icon;
              return (
                <Link
                  key={r.id}
                  href={r.href}
                  onClick={() => soundManager.playClick()}
                  className={`relative px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    active
                      ? "bg-amber-600 text-white shadow-md shadow-amber-950/40 font-bold"
                      : "text-stone-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon size={13} />
                  <span>{r.label}</span>
                  {r.badge && (
                    <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white font-mono text-[9px] font-bold animate-pulse">
                      {r.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Acciones Rápidas */}
          <div className="flex items-center gap-2">
            {/* Modal para cambiar rol en móvil */}
            <button
              onClick={() => setStaffModalOpen(true)}
              className="md:hidden px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Layers size={13} className="text-amber-400" />
              <span>Cambiar Rol</span>
            </button>

            {/* Botón Ir a Tienda Pública */}
            <Link
              href="/"
              onClick={() => soundManager.playClick()}
              className="px-3.5 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <span>Ver Tienda</span>
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
      <header className="sticky top-0 z-40 bg-[#160E09]/95 backdrop-blur-xl border-b border-amber-900/30 text-white transition-all shadow-xl">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
          
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
          <nav className="hidden lg:flex items-center gap-8 text-xs font-medium text-stone-300">
            <a
              href="#catalogo"
              className="hover:text-amber-400 transition-colors flex items-center gap-1.5 py-1"
            >
              <Coffee size={14} className="text-amber-500/80" />
              <span>Catálogo & Menú</span>
            </a>
            <a
              href="#cotizador"
              className="hover:text-amber-400 transition-colors flex items-center gap-1.5 py-1"
            >
              <Calendar size={14} className="text-amber-500/80" />
              <span>Catering & Eventos</span>
            </a>
            <a
              href="#roles"
              className="hover:text-amber-400 transition-colors flex items-center gap-1.5 py-1"
            >
              <Layers size={14} className="text-amber-500/80" />
              <span>Plataforma de Mesas</span>
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
              className="text-amber-300/90 hover:text-amber-200 transition-colors flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-white/5 border border-amber-500/20"
            >
              <FileText size={13} className="text-amber-400" />
              <span>Menú Carta PDF</span>
            </Link>
          </nav>

          {/* Acciones de Cabecera: Carrito, WhatsApp & Portal de Roles */}
          <div className="flex items-center gap-2.5 sm:gap-3">
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
              className="relative px-3.5 sm:px-4 py-2 rounded-full bg-[#24170F] hover:bg-[#2C1C13] border border-amber-600/30 text-amber-200 font-semibold text-xs shadow-md flex items-center gap-2 active:scale-95 transition"
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

            {/* Botón de Acceso al Portal de Personal (5 Roles) */}
            <button
              onClick={() => setStaffModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold transition active:scale-95"
            >
              <ShieldCheck size={14} className="text-amber-400" />
              <span>Portal Roles</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono">
                5
              </span>
            </button>

            {/* Menú Hamburguesa para Móvil */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center transition active:scale-95"
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
              className="lg:hidden border-t border-amber-900/40 bg-[#140D08] px-4 py-5 space-y-4 text-xs overflow-hidden"
            >
              <div className="space-y-1">
                <a
                  href="#catalogo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-amber-100 font-semibold flex items-center gap-2"
                >
                  <Coffee size={15} className="text-amber-400" />
                  <span>Catálogo & Menú Completo (240 Productos)</span>
                </a>
                <a
                  href="#cotizador"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-amber-100 font-semibold flex items-center gap-2"
                >
                  <Calendar size={15} className="text-amber-400" />
                  <span>Cotizador de Catering & Eventos</span>
                </a>
                <a
                  href="#roles"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-amber-100 font-semibold flex items-center gap-2"
                >
                  <Layers size={15} className="text-amber-400" />
                  <span>Plataforma & Roles de Servicio</span>
                </a>
                <a
                  href="#contacto"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-amber-100 font-semibold flex items-center gap-2"
                >
                  <MapPin size={15} className="text-amber-400" />
                  <span>Sucursal & Horarios Cochabamba</span>
                </a>
                <Link
                  href="/menu-pdf"
                  target="_blank"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold flex items-center gap-2 border border-amber-500/20"
                >
                  <FileText size={15} className="text-amber-400" />
                  <span>Menú Carta en PDF (Imprimible)</span>
                </Link>
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
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative bg-[#1A110B] border border-amber-500/30 rounded-3xl p-6 sm:p-7 max-w-lg w-full text-white shadow-2xl space-y-5 z-10"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-1.5 flex items-center justify-center">
                    <img src={DENCKER_ASSETS.logo} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-amber-100">
                      Plataforma Operativa
                    </h3>
                    <p className="text-[11px] text-stone-400">
                      Selecciona tu estación de trabajo en tiempo real
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setStaffModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 text-stone-300 hover:text-white flex items-center justify-center transition"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2.5">
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
                      className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/40 flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Icon size={18} />
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-200 transition">
                              {r.label}
                            </p>
                            {r.badge && (
                              <span className="px-2 py-0.2 rounded-full bg-red-500 text-white font-mono text-[9px] font-bold animate-pulse">
                                {r.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">
                            {r.desc}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-stone-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0" />
                    </Link>
                  );
                })}
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center text-xs text-amber-200/90">
                <span>Conexión en vivo activa vía WebSockets & BroadcastChannel</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Lock,
  ShieldCheck,
  ArrowLeft,
  ChefHat,
  UtensilsCrossed,
  Receipt,
  Settings,
  LogOut,
  XCircle,
  HelpCircle,
  X,
  Check,
} from "lucide-react";
import {
  StaffRole,
  StaffSession,
  STAFF_USERS,
  getStaffSession,
  saveStaffSession,
  clearStaffSession,
  checkPinForRole,
  resolveRoleForPin,
} from "@/lib/auth";
import { soundManager } from "@/lib/sound";
import { DENCKER_ASSETS } from "@/lib/seed-data";

interface StaffAuthGuardProps {
  requiredRole: StaffRole;
  roleTitle: string;
  children: React.ReactNode;
}

const ROLE_ICONS: Record<StaffRole, React.ComponentType<{ size?: number; className?: string }>> = {
  admin: Settings,
  mesero: UtensilsCrossed,
  cocina: ChefHat,
  caja: Receipt,
};

const ADMIN_STATIONS = [
  { id: "admin", href: "/admin", label: "Administración", icon: Settings },
  { id: "caja", href: "/caja", label: "Caja POS", icon: Receipt },
  { id: "mesero", href: "/mesero", label: "Sala Mesero", icon: UtensilsCrossed },
  { id: "kds", href: "/kds", label: "Cocina KDS", icon: ChefHat },
];

export default function StaffAuthGuard({
  requiredRole,
  roleTitle,
  children,
}: StaffAuthGuardProps) {
  const pathname = usePathname();
  const [session, setSession] = useState<StaffSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pin, setPin] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDemoHelp, setShowDemoHelp] = useState(false);

  useEffect(() => {
    const active = getStaffSession();
    if (active) {
      // Un Administrador General tiene credenciales para entrar a cualquier estación;
      // Otros roles solo pueden ingresar si su rol coincide exactamente con el requerido.
      if (active.user.role === "admin" || active.user.role === requiredRole) {
        setSession(active);
      } else {
        // Si el rol activo es inferior (ej. mesero intentando entrar a /admin o /caja), se fuerza autenticación
        setSession(null);
      }
    }
    setIsLoading(false);
  }, [requiredRole]);

  const validarPin = useCallback(
    (pinAProbar: string) => {
      if (checkPinForRole(requiredRole, pinAProbar)) {
        soundManager.playSuccessTone();
        const roleToSave = resolveRoleForPin(requiredRole, pinAProbar);
        const newSession = saveStaffSession(roleToSave);
        setSession(newSession);
        setErrorMsg(null);
        setPin("");
      } else {
        soundManager.playAlertTone();
        setErrorMsg(`PIN no autorizado para ${roleTitle}.`);
        setPin("");
      }
    },
    [requiredRole, roleTitle]
  );

  const handleKeyPress = useCallback(
    (num: string) => {
      soundManager.playTactileClick();
      setErrorMsg(null);
      setPin((prev) => {
        if (prev.length < 4) {
          const nextPin = prev + num;
          if (nextPin.length === 4) {
            setTimeout(() => validarPin(nextPin), 80);
          }
          return nextPin;
        }
        return prev;
      });
    },
    [validarPin]
  );

  const handleBorrar = useCallback(() => {
    soundManager.playClick();
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  }, []);

  const handleLimpiar = useCallback(() => {
    soundManager.playClick();
    setPin("");
    setErrorMsg(null);
  }, []);

  // Soporte para teclado físico (0-9, Backspace, Escape) en terminales de caja y computadoras
  useEffect(() => {
    if (session) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handleKeyPress(e.key);
      } else if (e.key === "Backspace") {
        handleBorrar();
      } else if (e.key === "Escape") {
        handleLimpiar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [session, handleKeyPress, handleBorrar, handleLimpiar]);

  const handleCerrarTurno = () => {
    soundManager.playClick();
    clearStaffSession();
    setSession(null);
    setPin("");
    setErrorMsg(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#120B07] flex items-center justify-center text-white">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 1. ESTADO AUTENTICADO: RENDERIZA LA ESTACIÓN CON CONTROL SEGURO
  // ─────────────────────────────────────────────────────────────
  if (session) {
    const RoleIcon = ROLE_ICONS[session.user.role] || ShieldCheck;
    const esAdmin = session.user.role === "admin";

    return (
      <div className="relative min-h-screen">
        {/* Barra superior de Turno Activo */}
        <aside
          aria-label="Control de turno de personal"
          className="sticky top-0 z-50 bg-[#160E08]/95 backdrop-blur-md border-b border-amber-900/40 px-3 sm:px-6 py-2.5 text-white text-xs flex flex-wrap items-center justify-between gap-3 shadow-lg"
        >
          {/* Datos del Operador */}
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
              <RoleIcon size={14} />
            </div>
            <div>
              <span className="font-bold text-amber-100">{session.user.nombre}</span>
              <span className="text-stone-400 text-[11px] hidden sm:inline ml-1.5">
                • {roleTitle}
              </span>
            </div>
          </div>

          {/* Selector de Estación (ESTRICTAMENTE SOLO PARA GERENCIA / ADMIN) */}
          {esAdmin && (
            <div className="hidden md:flex items-center gap-1 p-1 rounded-full bg-black/40 border border-white/10">
              {ADMIN_STATIONS.map((st) => {
                const active = pathname.startsWith(st.href);
                const Icon = st.icon;
                return (
                  <Link
                    key={st.id}
                    href={st.href}
                    onClick={() => soundManager.playClick()}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition ${
                      active
                        ? "bg-amber-600 text-white shadow-xs"
                        : "text-stone-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon size={12} />
                    <span>{st.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Acciones de Cierre de Sesión y Salida */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCerrarTurno}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-red-950/60 hover:text-red-300 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer border border-white/10"
              title="Bloquear terminal y cerrar turno"
            >
              <LogOut size={13} className="text-red-400" />
              <span>Bloquear / Salir</span>
            </button>
            <Link
              href="/"
              onClick={() => soundManager.playClick()}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 border border-amber-400/30"
            >
              <span>Tienda</span>
            </Link>
          </div>
        </aside>

        {children}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. ESTADO BLOQUEADO: PANTALLA DE AUTENTICACIÓN PROFESIONAL
  // ─────────────────────────────────────────────────────────────
  const RequiredIcon = ROLE_ICONS[requiredRole] || Lock;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#120B07] via-[#1C120B] to-[#120B07] text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Glows ambientales sutiles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/10 blur-[140px] pointer-events-none" />

      {/* Contenedor del Terminal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="relative z-10 w-full max-w-sm rounded-[32px] bg-[#18100A]/95 border border-amber-600/30 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-5 text-center"
      >
        {/* Cabecera con Logotipo Oficial */}
        <div className="space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 p-2.5 mx-auto flex items-center justify-center shadow-inner">
            <img
              src={DENCKER_ASSETS.logo}
              alt="Dencker Pan"
              className="w-full h-full object-contain drop-shadow"
            />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">
            Terminal Operativo
          </h2>
          <p className="text-xs text-stone-400">
            Dencker Pan • Cochabamba
          </p>
        </div>

        {/* Estación a la que se intenta acceder */}
        <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center gap-2.5 text-xs">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
            <RequiredIcon size={16} />
          </div>
          <div className="text-left">
            <span className="font-bold text-white block">{roleTitle}</span>
            <span className="text-[10px] text-stone-400 capitalize">
              Estación: {requiredRole}
            </span>
          </div>
        </div>

        {/* 4 Puntos de Entrada de PIN */}
        <div className="py-2">
          <p className="text-[11px] text-stone-400 mb-2 font-medium">
            Ingresa tu código PIN de 4 dígitos:
          </p>
          <div className="flex items-center justify-center gap-4">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: pin.length > i ? 1.25 : 1,
                  borderColor: pin.length > i ? "#F59E0B" : "rgba(255,255,255,0.2)",
                }}
                className={`w-4 h-4 rounded-full border-2 transition-colors ${
                  pin.length > i
                    ? "bg-amber-400 border-amber-400 shadow-md shadow-amber-400/50"
                    : "bg-white/5 border-white/20"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Mensaje de Error */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-1.5 text-xs text-red-400 font-semibold bg-red-950/40 border border-red-800/40 py-2 px-3 rounded-xl"
          >
            <XCircle size={14} className="shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {/* Teclado Táctil y Numérico */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <motion.button
              key={num}
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => handleKeyPress(num)}
              className="h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-lg font-bold flex items-center justify-center transition active:bg-amber-600/30 cursor-pointer shadow-xs"
            >
              {num}
            </motion.button>
          ))}
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={handleLimpiar}
            className="h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-400 text-xs font-bold flex items-center justify-center cursor-pointer"
          >
            C
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => handleKeyPress("0")}
            className="h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-lg font-bold flex items-center justify-center transition active:bg-amber-600/30 cursor-pointer shadow-xs"
          >
            0
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={handleBorrar}
            className="h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-400 text-xs font-bold flex items-center justify-center cursor-pointer"
          >
            ⌫
          </motion.button>
        </div>

        {/* Pie de Pantalla de Producción */}
        <div className="pt-3 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-400 px-1">
            <Link
              href="/"
              onClick={() => soundManager.playClick()}
              className="inline-flex items-center gap-1.5 text-stone-400 hover:text-white transition"
            >
              <ArrowLeft size={13} />
              <span>Tienda Pública</span>
            </Link>

            {/* Botón de ayuda discreto (para evaluación) */}
            <button
              type="button"
              onClick={() => setShowDemoHelp(!showDemoHelp)}
              className="text-[11px] text-stone-500 hover:text-amber-300 inline-flex items-center gap-1 transition cursor-pointer"
            >
              <HelpCircle size={12} />
              <span>Guía de PINs</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Modal / Popover discreto con Guía de PINs */}
      <AnimatePresence>
        {showDemoHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDemoHelp(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative z-10 w-full max-w-xs bg-[#1C120A] border border-amber-500/30 rounded-2xl p-5 text-white shadow-2xl space-y-3 text-xs"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-bold text-amber-200 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-amber-400" />
                  PINs de Operación
                </span>
                <button
                  onClick={() => setShowDemoHelp(false)}
                  className="text-stone-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-2 font-mono">
                <div className="p-2 rounded-xl bg-white/5 flex items-center justify-between">
                  <span className="text-stone-300 font-sans">Administración (Gerencia):</span>
                  <span className="font-bold text-amber-400">2024</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 flex items-center justify-between">
                  <span className="text-stone-300 font-sans">Caja POS & Facturación:</span>
                  <span className="font-bold text-amber-400">3333</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 flex items-center justify-between">
                  <span className="text-stone-300 font-sans">Cocina & Barismo KDS:</span>
                  <span className="font-bold text-amber-400">2222</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 flex items-center justify-between">
                  <span className="text-stone-300 font-sans">Sala & Meseros:</span>
                  <span className="font-bold text-amber-400">1111</span>
                </div>
              </div>

              <p className="text-[10px] text-stone-400 text-center">
                * El PIN de Gerencia (2024) tiene acceso universal a todas las estaciones.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  ArrowLeft,
  ChefHat,
  UtensilsCrossed,
  Receipt,
  Settings,
  LogOut,
  Sparkles,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  StaffRole,
  StaffSession,
  STAFF_USERS,
  getStaffSession,
  saveStaffSession,
  clearStaffSession,
  checkPinForRole,
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

export default function StaffAuthGuard({
  requiredRole,
  roleTitle,
  children,
}: StaffAuthGuardProps) {
  const [session, setSession] = useState<StaffSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<StaffRole>(requiredRole);
  const [pin, setPin] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const active = getStaffSession();
    if (active) {
      // Si el rol es admin, tiene acceso a cualquier pantalla; si coincide con el rol requerido, también
      if (active.user.role === "admin" || active.user.role === requiredRole) {
        setSession(active);
      }
    }
    setIsLoading(false);
  }, [requiredRole]);

  const handleKeyPress = (num: string) => {
    soundManager.playTactileClick();
    setErrorMsg(null);
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        validarPin(selectedRole, nextPin);
      }
    }
  };

  const handleBorrar = () => {
    soundManager.playClick();
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleLimpiar = () => {
    soundManager.playClick();
    setPin("");
    setErrorMsg(null);
  };

  const validarPin = (role: StaffRole, pinAProbar: string) => {
    if (checkPinForRole(role, pinAProbar)) {
      soundManager.playSuccessTone();
      const newSession = saveStaffSession(role);
      setSession(newSession);
      setErrorMsg(null);
      setPin("");
    } else {
      soundManager.playAlertTone();
      setErrorMsg(`PIN incorrecto para ${STAFF_USERS[role].cargo}. Reintenta.`);
      setPin("");
    }
  };

  const handleLoginRapido = (role: StaffRole) => {
    soundManager.playSuccessTone();
    const newSession = saveStaffSession(role);
    setSession(newSession);
    setErrorMsg(null);
  };

  const handleCerrarTurno = () => {
    soundManager.playClick();
    clearStaffSession();
    setSession(null);
    setPin("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#120B07] flex items-center justify-center text-white">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // Si está autenticado, renderiza el contenido protegido con barra superior de turno
  if (session) {
    const RoleIcon = ROLE_ICONS[session.user.role] || ShieldCheck;
    return (
      <div className="relative min-h-screen">
        {/* Barra superior flotante de Turno Activo */}
        <aside aria-label="Control de turno de personal" className="sticky top-0 z-50 bg-[#160E08]/95 backdrop-blur-md border-b border-amber-900/40 px-4 py-2 text-white text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <RoleIcon size={14} className="text-amber-400" />
            <span className="font-bold text-amber-100">{session.user.nombre}</span>
            <span className="text-stone-400 hidden sm:inline">• {session.user.cargo}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCerrarTurno}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <LogOut size={12} className="text-red-400" />
              <span>Cerrar Turno</span>
            </button>
            <Link
              href="/"
              className="px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
            >
              <span>Tienda</span>
            </Link>
          </div>
        </aside>

        {children}
      </div>
    );
  }

  // PANTALLA DE LOGIN CON PIN / BIOMETRIC LOOK
  const RequiredIcon = ROLE_ICONS[selectedRole] || Lock;
  const userRoleInfo = STAFF_USERS[selectedRole];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#120B07] via-[#1C120B] to-[#120B07] text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Glows ambientales */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/10 blur-[140px] pointer-events-none" />

      {/* Contenedor Central */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="relative z-10 w-full max-w-sm rounded-[32px] bg-[#18100A]/95 border border-amber-600/30 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-center"
      >
        {/* Cabecera */}
        <div className="space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 p-2.5 mx-auto flex items-center justify-center shadow-inner">
            <img
              src={DENCKER_ASSETS.logo}
              alt="Dencker Pan"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">
            Acceso de Personal
          </h2>
          <p className="text-xs text-amber-200/70">
            Ingresa tu PIN de 4 dígitos para acceder a la estación de trabajo
          </p>
        </div>

        {/* Selector de Rol Activo */}
        <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 text-xs">
          {(["admin", "mesero", "cocina", "caja"] as StaffRole[]).map((r) => {
            const Icon = ROLE_ICONS[r];
            const isSel = selectedRole === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => {
                  soundManager.playTactileClick();
                  setSelectedRole(r);
                  setPin("");
                  setErrorMsg(null);
                }}
                className={`py-2 rounded-xl font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  isSel
                    ? "bg-amber-600 text-white shadow-md shadow-amber-950/40"
                    : "text-stone-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={14} />
                <span className="text-[10px] capitalize">{r}</span>
              </button>
            );
          })}
        </div>

        {/* Cargo del Rol Seleccionado */}
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 py-2 rounded-xl">
          <RequiredIcon size={14} className="text-amber-400" />
          <span>{userRoleInfo.cargo}</span>
        </div>

        {/* 4 Puntos de PIN */}
        <div className="flex items-center justify-center gap-4 py-2">
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

        {/* Mensaje de Error */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-1.5 text-xs text-red-400 font-semibold bg-red-950/40 border border-red-800/40 py-2 px-3 rounded-xl"
          >
            <XCircle size={14} />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {/* Teclado Virtual Numérico Táctil */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <motion.button
              key={num}
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => handleKeyPress(num)}
              className="h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-lg font-bold flex items-center justify-center transition active:bg-amber-600/30 cursor-pointer"
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
            className="h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-lg font-bold flex items-center justify-center transition active:bg-amber-600/30 cursor-pointer"
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

        {/* Botón de Acceso Rápido Demo para Testing Inmediato */}
        <div className="pt-2 border-t border-white/10 space-y-2">
          <button
            type="button"
            onClick={() => handleLoginRapido(selectedRole)}
            className="w-full py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <KeyRound size={13} />
            <span>Ingreso Directo con PIN: {userRoleInfo.pin}</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-stone-400 hover:text-white text-xs transition"
          >
            <ArrowLeft size={13} />
            <span>Volver a la Tienda Pública</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

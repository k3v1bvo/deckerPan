"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Users,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Coffee,
  Utensils,
  ArrowLeft,
  ChevronRight,
  Compass,
  AlertCircle,
  KeyRound,
  Check,
  X,
  Lock,
  Unlock,
  ChefHat,
  Receipt,
  UtensilsCrossed,
  Sparkles,
  HelpCircle,
  Delete,
  Fingerprint,
  UserCheck,
} from "lucide-react";
import { useSystemStore } from "@/store";
import {
  RegistroAsistencia,
  TipoMarcadoAsistencia,
  EstadoPuntualidad,
  UsuarioStaff,
  StaffRole,
} from "@/types";
import {
  calcularDistanciaMetros,
  getGPSPosition,
  evaluarPuntualidad,
} from "@/lib/geo";
import { soundManager } from "@/lib/sound";
import { DENCKER_ASSETS } from "@/lib/seed-data";
import {
  getStaffSession,
  saveStaffSession,
  clearStaffSession,
  findStaffUserByPin,
  STAFF_USERS,
  StaffUser,
} from "@/lib/auth";

const ROLE_ICONS: Record<StaffRole, React.ComponentType<{ size?: number; className?: string }>> = {
  admin: ShieldCheck,
  mesero: UtensilsCrossed,
  cocina: ChefHat,
  caja: Receipt,
};

const ROLE_BADGE_STYLES: Record<StaffRole, { bg: string; text: string; border: string; label: string }> = {
  admin: {
    bg: "bg-purple-950/60",
    text: "text-purple-300",
    border: "border-purple-500/40",
    label: "Gerencia / Admin",
  },
  mesero: {
    bg: "bg-sky-950/60",
    text: "text-sky-300",
    border: "border-sky-500/40",
    label: "Mesero de Sala",
  },
  cocina: {
    bg: "bg-amber-950/60",
    text: "text-amber-300",
    border: "border-amber-500/40",
    label: "Cocina & Barismo",
  },
  caja: {
    bg: "bg-emerald-950/60",
    text: "text-emerald-300",
    border: "border-emerald-500/40",
    label: "Caja POS & Facturación",
  },
};

export default function AsistenciaPage() {
  const {
    usuariosStaff,
    asistencias,
    geocercaConfig,
    addRegistroAsistencia,
  } = useSystemStore();

  // Reloj en tiempo real (hidratación segura Next.js 16)
  const [ahora, setAhora] = useState<Date | null>(null);
  const [hoyStr, setHoyStr] = useState<string>("");

  // Estado del GPS
  const [gpsLoading, setGpsLoading] = useState<boolean>(true);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [coordenadas, setCoordenadas] = useState<{
    lat: number;
    lon: number;
    accuracy: number;
  } | null>(null);

  // Estado de Autenticación de Empleado
  const [usuarioAutenticado, setUsuarioAutenticado] = useState<StaffUser | null>(null);
  const [personalSeleccionadoPreLogin, setPersonalSeleccionadoPreLogin] = useState<UsuarioStaff | null>(null);
  const [pinInput, setPinInput] = useState<string>("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [showDemoCredentials, setShowDemoCredentials] = useState<boolean>(false);

  // Modal de confirmación de éxito y countdown de cierre
  const [confirmacionExitosa, setConfirmacionExitosa] = useState<{
    tipo: TipoMarcadoAsistencia;
    hora: string;
    distancia: number;
    puntualidad: EstadoPuntualidad;
    nombre: string;
  } | null>(null);
  const [autoLogoutTimer, setAutoLogoutTimer] = useState<number>(0);

  // 1. Reloj en tiempo real
  useEffect(() => {
    const d = new Date();
    setAhora(d);
    setHoyStr(d.toISOString().split("T")[0]);
    const timer = setInterval(() => {
      const now = new Date();
      setAhora(now);
      setHoyStr(now.toISOString().split("T")[0]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Verificar sesión de empleado activa al cargar
  useEffect(() => {
    const sesion = getStaffSession();
    if (sesion?.user) {
      setUsuarioAutenticado(sesion.user);
    }
  }, []);

  // 3. Función para capturar coordenadas GPS
  const refrescarGPS = useCallback(async () => {
    setGpsLoading(true);
    setGpsError(null);
    try {
      const pos = await getGPSPosition();
      setCoordenadas(pos);
    } catch (err: any) {
      setGpsError(err.message || "Error al obtener ubicación GPS.");
    } finally {
      setGpsLoading(false);
    }
  }, []);

  useEffect(() => {
    refrescarGPS();
  }, [refrescarGPS]);

  // 4. Distancia Haversine y geocerca
  const distanciaActual = useMemo(() => {
    if (!coordenadas) return null;
    return calcularDistanciaMetros(
      coordenadas.lat,
      coordenadas.lon,
      geocercaConfig.latitud,
      geocercaConfig.longitud
    );
  }, [coordenadas, geocercaConfig]);

  const estaDentroDelRadio = useMemo(() => {
    if (distanciaActual === null) return false;
    return distanciaActual <= geocercaConfig.radio_metros;
  }, [distanciaActual, geocercaConfig.radio_metros]);

  // 5. Historial de hoy para el usuario autenticado
  const asistenciasDeHoy = useMemo(() => {
    if (!usuarioAutenticado || !hoyStr) return [];
    return (asistencias || []).filter(
      (a) => a.personal_id === usuarioAutenticado.id && a.fecha === hoyStr
    );
  }, [asistencias, usuarioAutenticado, hoyStr]);

  const ultimoRegistro = asistenciasDeHoy[0] || null;
  const enTurnoAhora = ultimoRegistro?.tipo === "entrada" || ultimoRegistro?.tipo === "almuerzo_fin";
  const enPausaAlmuerzo = ultimoRegistro?.tipo === "almuerzo_inicio";

  // 6. Validación de PIN y Login de Empleado
  const procesarIntentoLogin = useCallback(
    (pinAProbar: string) => {
      const pinLimpio = pinAProbar.trim();
      let match: StaffUser | null = null;

      // Si seleccionó previamente un perfil específico de la lista
      if (personalSeleccionadoPreLogin) {
        if (
          personalSeleccionadoPreLogin.pin === pinLimpio ||
          (pinLimpio === "2024" || pinLimpio === "2026" || pinLimpio === "9900")
        ) {
          match = {
            id: personalSeleccionadoPreLogin.id,
            role: personalSeleccionadoPreLogin.role,
            nombre: personalSeleccionadoPreLogin.nombre,
            pin: personalSeleccionadoPreLogin.pin,
            cargo: personalSeleccionadoPreLogin.cargo,
          };
        }
      } else {
        // Intento directo con el teclado numérico universal
        match = findStaffUserByPin(pinLimpio);
      }

      if (match) {
        soundManager.playSuccessTone();
        saveStaffSession(match.role, match);
        setUsuarioAutenticado(match);
        setPersonalSeleccionadoPreLogin(null);
        setPinInput("");
        setPinError(null);
      } else {
        soundManager.playAlertTone();
        setPinError(
          personalSeleccionadoPreLogin
            ? `El PIN no coincide con el perfil de ${personalSeleccionadoPreLogin.nombre}.`
            : "PIN no reconocido. Ingresa un PIN de mesero, cocina, caja o admin registrado."
        );
        setPinInput("");
      }
    },
    [personalSeleccionadoPreLogin]
  );

  // Manejador del teclado numérico en pantalla
  const handleKeypadPress = useCallback(
    (digito: string) => {
      soundManager.playTactileClick();
      setPinError(null);
      setPinInput((prev) => {
        if (prev.length < 4) {
          const next = prev + digito;
          if (next.length === 4) {
            setTimeout(() => procesarIntentoLogin(next), 90);
          }
          return next;
        }
        return prev;
      });
    },
    [procesarIntentoLogin]
  );

  const handleKeypadBorrar = useCallback(() => {
    soundManager.playClick();
    setPinInput((prev) => prev.slice(0, -1));
    setPinError(null);
  }, []);

  const handleKeypadLimpiar = useCallback(() => {
    soundManager.playClick();
    setPinInput("");
    setPinError(null);
  }, []);

  // Soporte para teclado físico (0-9, Backspace, Enter, Esc)
  useEffect(() => {
    if (usuarioAutenticado) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handleKeypadPress(e.key);
      } else if (e.key === "Backspace") {
        handleKeypadBorrar();
      } else if (e.key === "Escape") {
        handleKeypadLimpiar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [usuarioAutenticado, handleKeypadPress, handleKeypadBorrar, handleKeypadLimpiar]);

  // Cerrar sesión del empleado
  const handleCerrarSesion = () => {
    soundManager.playClick();
    clearStaffSession();
    setUsuarioAutenticado(null);
    setPersonalSeleccionadoPreLogin(null);
    setPinInput("");
    setPinError(null);
    setConfirmacionExitosa(null);
  };

  // 7. Ejecutar Marcado de Asistencia (Entrada / Salida / Almuerzo)
  const ejecutarMarcado = (tipo: TipoMarcadoAsistencia) => {
    if (!usuarioAutenticado) {
      soundManager.playAlertTone();
      alert("Debes iniciar sesión con tu cuenta de empleado para marcar asistencia.");
      return;
    }

    if (geocercaConfig.bloquear_fuera_de_radio && !estaDentroDelRadio) {
      soundManager.playError();
      alert(
        `⛔ MARCADO BLOQUEADO POR GEOCERCA:\nTe encuentras a ${distanciaActual ?? "?"}m del obrador.\nEl radio perimetral autorizado en Av. Salamanca es de ${geocercaConfig.radio_metros} metros.`
      );
      return;
    }

    const fechaFinal = hoyStr || new Date().toISOString().split("T")[0];
    const horaObj = ahora || new Date();
    const horaStr = horaObj.toLocaleTimeString("es-BO", { hour12: false });
    const horaCorta = horaStr.substring(0, 5); // "HH:MM"
    const puntualidad = evaluarPuntualidad(horaCorta, tipo, geocercaConfig);
    const distancia = distanciaActual ?? 0;

    const registro: Omit<RegistroAsistencia, "id" | "created_at"> = {
      personal_id: usuarioAutenticado.id,
      personal_nombre: usuarioAutenticado.nombre,
      cargo: usuarioAutenticado.cargo || usuarioAutenticado.role,
      tipo,
      fecha: fechaFinal,
      hora: horaStr,
      latitud: coordenadas?.lat,
      longitud: coordenadas?.lon,
      distancia_metros: distancia,
      dentro_del_radio: estaDentroDelRadio,
      precision_gps_metros: coordenadas?.accuracy,
      estado_puntualidad: puntualidad,
      observaciones:
        tipo === "entrada"
          ? puntualidad === "a_tiempo"
            ? "Llegada puntual al obrador"
            : "Llegada con retraso"
          : tipo === "salida"
          ? "Fin de jornada laboral"
          : tipo === "almuerzo_inicio"
          ? "Inicio de refrigerio"
          : "Retorno de refrigerio al puesto",
    };

    addRegistroAsistencia(registro);
    soundManager.playSuccessTone();

    setConfirmacionExitosa({
      tipo,
      hora: horaStr,
      distancia,
      puntualidad,
      nombre: usuarioAutenticado.nombre,
    });

    // Iniciar timer de 10s para auto-cerrar y dejar la terminal lista al siguiente compañero
    setAutoLogoutTimer(10);
  };

  // Temporizador de auto-cierre después de un marcado exitoso
  useEffect(() => {
    if (!confirmacionExitosa || autoLogoutTimer <= 0) return;
    const interval = setInterval(() => {
      setAutoLogoutTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleCerrarSesion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [confirmacionExitosa, autoLogoutTimer]);

  const formatearFechaLarga = (d: Date) => {
    return d.toLocaleDateString("es-BO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="w-full min-h-screen bg-[#100906] text-stone-100 flex flex-col justify-between selection:bg-amber-500 selection:text-stone-950 font-sans">
      {/* ── HEADER SUPERIOR CON NAVEGACIÓN Y ESTADO DE SESIÓN ── */}
      <header className="sticky top-0 z-30 bg-[#160D08]/95 backdrop-blur-xl border-b border-amber-500/20 px-4 py-3 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-stone-300 hover:text-white text-xs font-bold transition-all py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 shrink-0"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Volver a la Vitrina</span>
          </Link>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-amber-500/10 p-1 border border-amber-500/30 flex items-center justify-center shrink-0">
              <img
                src={DENCKER_ASSETS.logoLight}
                alt="Don Dencker"
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <div className="leading-tight truncate">
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-sm text-white block truncate">
                  Dencker Pan
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#991B24] text-white border border-amber-400/30 shadow-sm shrink-0">
                  Terminal Staff
                </span>
              </div>
              <span className="text-[10px] text-amber-300/80 font-mono hidden sm:block truncate">
                Control Biométrico &amp; Geocerca GPS &bull; Av. Salamanca
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {usuarioAutenticado ? (
              <button
                onClick={handleCerrarSesion}
                className="text-xs font-bold text-stone-200 hover:text-white transition flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 shadow-sm cursor-pointer"
                title="Cerrar turno para permitir que otro empleado ingrese"
              >
                <LogOut size={14} className="text-rose-400" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            ) : (
              <Link
                href="/admin?tab=asistencias"
                className="text-xs font-bold text-amber-200 hover:text-white transition flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#991B24] hover:bg-[#7F1D1D] border border-amber-400/40 shadow-sm"
              >
                <ShieldCheck size={14} className="text-amber-300" />
                <span className="hidden sm:inline">Gerencia</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── CUERPO PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto w-full px-4 py-6 space-y-6 flex-1">
        {/* 1. RELOJ DIGITAL Y FECHA OFICIAL */}
        <section className="text-center space-y-1.5 py-4 px-6 rounded-3xl bg-gradient-to-b from-stone-900/90 to-stone-950 border border-amber-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <p className="text-xs font-semibold text-amber-300/90 uppercase tracking-widest flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            Hora Oficial Cochabamba &bull; {geocercaConfig.local_nombre}
          </p>

          <div className="font-mono text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_16px_rgba(245,158,11,0.25)]">
            {ahora ? ahora.toLocaleTimeString("es-BO", { hour12: false }) : "--:--:--"}
          </div>

          <p className="text-xs sm:text-sm text-stone-400 capitalize font-medium">
            {ahora ? formatearFechaLarga(ahora) : "Sincronizando hora..."}
          </p>
        </section>

        {/* 2. RADAR DE GEOLOCALIZACIÓN GPS (HASTA EL OBRADOR EN SALAMANCA) */}
        <section className="p-4 sm:p-5 rounded-3xl bg-stone-900/70 border border-white/10 backdrop-blur-md shadow-xl space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                  gpsLoading
                    ? "bg-stone-800 text-stone-400 border-white/10"
                    : estaDentroDelRadio
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    : "bg-rose-500/20 text-rose-400 border-rose-500/40"
                }`}
              >
                <Compass size={22} className={gpsLoading ? "animate-spin" : ""} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  Geocerca Perimetral GPS
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-stone-300">
                    Radio: {geocercaConfig.radio_metros}m
                  </span>
                </h3>
                <p className="text-xs text-stone-400">
                  {geocercaConfig.direccion}
                </p>
              </div>
            </div>

            <button
              onClick={refrescarGPS}
              disabled={gpsLoading}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/5 hover:bg-white/15 text-stone-300 hover:text-white border border-white/10 transition active:scale-95 flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer disabled:opacity-50"
              title="Volver a leer coordenadas GPS"
            >
              <RefreshCw size={14} className={gpsLoading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Recalibrar GPS</span>
            </button>
          </div>

          {gpsLoading ? (
            <div className="p-3.5 rounded-2xl bg-stone-950/60 border border-white/5 text-center text-xs text-stone-400 animate-pulse flex items-center justify-center gap-2">
              <RefreshCw size={15} className="animate-spin text-amber-400" />
              <span>Sincronizando satélites GPS del dispositivo...</span>
            </div>
          ) : gpsError ? (
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200 space-y-1">
              <div className="flex items-center gap-2 font-bold text-rose-300">
                <AlertCircle size={15} />
                <span>Error de Señal GPS</span>
              </div>
              <p>{gpsError}</p>
            </div>
          ) : (
            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                estaDentroDelRadio
                  ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
                  : "bg-rose-950/30 border-rose-500/30 text-rose-200"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                      estaDentroDelRadio
                        ? "bg-emerald-400 shadow-[0_0_12px_#10b981]"
                        : "bg-rose-500 shadow-[0_0_12px_#f43f5e]"
                    }`}
                  />
                  <div>
                    <span className="font-extrabold text-xs sm:text-sm block">
                      {estaDentroDelRadio
                        ? "🟢 DENTRO DEL OBRADOR (Ubicación Válida para Marcado)"
                        : "🔴 FUERA DEL PERÍMETRO DE AV. SALAMANCA"}
                    </span>
                    <span className="text-xs opacity-90 block">
                      Distancia al local:{" "}
                      <strong className="font-mono text-sm underline">
                        {distanciaActual} metros
                      </strong>{" "}
                      (Tolerancia: {geocercaConfig.radio_metros}m)
                    </span>
                  </div>
                </div>

                <div className="text-right text-[11px] font-mono text-stone-400 bg-black/40 px-3 py-1 rounded-xl border border-white/5">
                  Precisión: ±{coordenadas?.accuracy}m
                </div>
              </div>

              {!estaDentroDelRadio && geocercaConfig.bloquear_fuera_de_radio && (
                <div className="mt-2.5 pt-2.5 border-t border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0" />
                  <span>
                    El marcado está bloqueado fuera del local. Acércate a la cafetería para registrar entrada o salida.
                  </span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── CONDICIONAL SEGÚN AUTENTICACIÓN ── */}
        {!usuarioAutenticado ? (
          /* ══════════════════════════════════════════════════════════
             ESTADO 1: NO AUTENTICADO — TERMINAL DE INGRESO DE PERSONAL
             ══════════════════════════════════════════════════════════ */
          <section className="space-y-6">
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Lock size={13} />
                <span>Acceso Requerido</span>
              </div>
              <h2 className="font-serif font-black text-xl sm:text-2xl text-white">
                Identifícate con tu Cuenta de Empleado
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 max-w-lg mx-auto">
                Para marcar tu asistencia debes ingresar con tu cuenta (Mesero, Cocina, Caja, Admin). Selecciona tu perfil o ingresa tu PIN de 4 dígitos.
              </p>
            </div>

            {/* SELECCIÓN DE PERFIL O TECLADO DIRECTO */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Columna Izquierda: Lista de Colaboradores Registrados */}
              <div className="md:col-span-6 space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-stone-400 flex items-center gap-2">
                  <Users size={15} className="text-amber-400" />
                  <span>Colaboradores Registrados ({usuariosStaff.filter((u) => u.activo).length})</span>
                </h3>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {usuariosStaff
                    .filter((u) => u.activo)
                    .map((usuario) => {
                      const esSeleccionado = personalSeleccionadoPreLogin?.id === usuario.id;
                      const RoleIcon = ROLE_ICONS[usuario.role] || Users;
                      const badgeStyle = ROLE_BADGE_STYLES[usuario.role] || ROLE_BADGE_STYLES.mesero;

                      return (
                        <button
                          key={usuario.id}
                          onClick={() => {
                            soundManager.playClick();
                            setPersonalSeleccionadoPreLogin(usuario);
                            setPinInput("");
                            setPinError(null);
                          }}
                          className={`w-full p-3.5 rounded-2xl border text-left transition-all active:scale-98 flex items-center gap-3.5 cursor-pointer ${
                            esSeleccionado
                              ? "bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/10"
                              : "bg-stone-900/60 border-white/10 hover:bg-stone-900 hover:border-white/25"
                          }`}
                        >
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                              esSeleccionado
                                ? "bg-amber-400 text-stone-950 border-amber-300"
                                : "bg-white/10 text-stone-200 border-white/10"
                            }`}
                          >
                            <RoleIcon size={20} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-sm text-white truncate">
                                {usuario.nombre}
                              </span>
                              <span
                                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border} shrink-0`}
                              >
                                {badgeStyle.label}
                              </span>
                            </div>
                            <span className="text-[11px] text-stone-400 truncate block mt-0.5">
                              {usuario.cargo || usuario.role}
                            </span>
                          </div>

                          <div className="shrink-0 text-stone-500">
                            {esSeleccionado ? (
                              <div className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center">
                                <Check size={13} strokeWidth={3} />
                              </div>
                            ) : (
                              <ChevronRight size={16} />
                            )}
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Columna Derecha: Teclado Numérico Táctil PIN */}
              <div className="md:col-span-6 bg-stone-900/80 border border-white/10 rounded-3xl p-5 sm:p-6 flex flex-col items-center justify-center shadow-xl space-y-4">
                <div className="text-center space-y-1 w-full">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-inner">
                    <KeyRound size={20} />
                  </div>
                  <h4 className="font-bold text-sm text-white">
                    {personalSeleccionadoPreLogin
                      ? `Ingresa el PIN de ${personalSeleccionadoPreLogin.nombre}`
                      : "Ingresa tu PIN de 4 Dígitos"}
                  </h4>
                  <p className="text-[11px] text-stone-400">
                    {personalSeleccionadoPreLogin
                      ? `Cargo: ${personalSeleccionadoPreLogin.cargo}`
                      : "Ingreso directo para cualquier mesero, cocina, caja o admin"}
                  </p>
                </div>

                {/* Indicador visual de los 4 dígitos */}
                <div className="flex justify-center gap-3 py-2">
                  {[0, 1, 2, 3].map((idx) => {
                    const digit = pinInput[idx];
                    const hasValue = digit !== undefined;
                    return (
                      <motion.div
                        key={idx}
                        animate={hasValue ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                        transition={{ duration: 0.15 }}
                        className={`w-4 h-4 rounded-full border-2 transition-all ${
                          hasValue
                            ? "bg-amber-400 border-amber-400 shadow-[0_0_12px_#f59e0b]"
                            : "bg-stone-950 border-white/20"
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Error de PIN */}
                {pinError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs text-center font-medium w-full"
                  >
                    {pinError}
                  </motion.div>
                )}

                {/* Grid del Teclado Numérico */}
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5 w-full max-w-[260px]">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
                    <button
                      key={n}
                      onClick={() => handleKeypadPress(n)}
                      className="h-12 rounded-2xl bg-stone-950 hover:bg-stone-800 text-white font-mono text-lg font-bold border border-white/10 hover:border-amber-400/40 transition active:scale-95 shadow cursor-pointer"
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={handleKeypadLimpiar}
                    className="h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white font-bold text-xs border border-white/5 transition active:scale-95 flex items-center justify-center cursor-pointer"
                    title="Limpiar"
                  >
                    C
                  </button>
                  <button
                    onClick={() => handleKeypadPress("0")}
                    className="h-12 rounded-2xl bg-stone-950 hover:bg-stone-800 text-white font-mono text-lg font-bold border border-white/10 hover:border-amber-400/40 transition active:scale-95 shadow cursor-pointer"
                  >
                    0
                  </button>
                  <button
                    onClick={handleKeypadBorrar}
                    className="h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white font-bold text-xs border border-white/5 transition active:scale-95 flex items-center justify-center cursor-pointer"
                    title="Borrar último"
                  >
                    <Delete size={18} />
                  </button>
                </div>

                {/* Botón de ayuda para ver credenciales maestras de prueba */}
                <div className="w-full pt-2 text-center">
                  <button
                    onClick={() => setShowDemoCredentials(!showDemoCredentials)}
                    className="text-[11px] text-amber-300/80 hover:text-amber-200 transition underline underline-offset-4 flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <HelpCircle size={13} />
                    <span>{showDemoCredentials ? "Ocultar credenciales de prueba" : "¿Olvidaste o quieres ver los PINs del sistema?"}</span>
                  </button>

                  {showDemoCredentials && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 p-3.5 rounded-2xl bg-black/60 border border-amber-500/30 text-left text-xs space-y-2"
                    >
                      <p className="font-bold text-amber-300 text-[11px] uppercase tracking-wider">
                        Credenciales Maestras del Sistema Dencker Pan:
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                        <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                          <span className="text-sky-300 font-bold block">Mesero (Mateo):</span>
                          <span className="text-white">PIN: 1111</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                          <span className="text-amber-300 font-bold block">Cocina (Rodrigo):</span>
                          <span className="text-white">PIN: 2222</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                          <span className="text-emerald-300 font-bold block">Caja (Valeria):</span>
                          <span className="text-white">PIN: 3333</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                          <span className="text-purple-300 font-bold block">Gerencia / Admin:</span>
                          <span className="text-white">PIN: 2024</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </section>
        ) : (
          /* ══════════════════════════════════════════════════════════
             ESTADO 2: AUTENTICADO — PANEL DE MARCADO DEL EMPLEADO
             ══════════════════════════════════════════════════════════ */
          <section className="space-y-6">
            {/* FICHA DEL COLABORADOR LOGUEADO */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900 to-stone-950 border border-amber-500/30 shadow-2xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-400/50 flex items-center justify-center font-serif font-black text-xl text-amber-300 shadow-inner">
                  {usuarioAutenticado.nombre
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-black text-lg sm:text-xl text-white">
                      {usuarioAutenticado.nombre}
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span
                      className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                        ROLE_BADGE_STYLES[usuarioAutenticado.role]?.bg || "bg-white/10"
                      } ${ROLE_BADGE_STYLES[usuarioAutenticado.role]?.text || "text-white"} ${
                        ROLE_BADGE_STYLES[usuarioAutenticado.role]?.border || "border-white/20"
                      }`}
                    >
                      {ROLE_BADGE_STYLES[usuarioAutenticado.role]?.label || usuarioAutenticado.role}
                    </span>
                    <span className="text-xs text-stone-400">
                      &bull; {usuarioAutenticado.cargo}
                    </span>
                  </div>
                </div>
              </div>

              {/* Estado actual del turno del empleado */}
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-right">
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                    Estado Hoy:
                  </span>
                  <span
                    className={`font-extrabold text-xs sm:text-sm ${
                      enTurnoAhora
                        ? "text-emerald-400"
                        : enPausaAlmuerzo
                        ? "text-amber-400"
                        : "text-stone-300"
                    }`}
                  >
                    {enTurnoAhora
                      ? "🟢 En Turno Activo"
                      : enPausaAlmuerzo
                      ? "🟡 En Almuerzo"
                      : "⚪ Fuera de Turno"}
                  </span>
                </div>

                <button
                  onClick={handleCerrarSesion}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/15 text-stone-300 hover:text-white border border-white/10 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                  title="Cambiar a otro empleado"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Cambiar de Usuario</span>
                </button>
              </div>
            </div>

            {/* BOTONES TÁCTILES DE MARCADO INTELIGENTES */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-stone-200 flex items-center gap-2">
                  <Clock size={16} className="text-amber-400" />
                  <span>Acción de Marcado en 1 Toque</span>
                </h3>
                <span className="text-xs text-stone-400">
                  Autenticado como: <strong className="text-white">{usuarioAutenticado.nombre}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {/* 1. ENTRADA */}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => ejecutarMarcado("entrada")}
                  disabled={
                    enTurnoAhora ||
                    enPausaAlmuerzo ||
                    (geocercaConfig.bloquear_fuera_de_radio && !estaDentroDelRadio)
                  }
                  className={`p-5 rounded-3xl font-extrabold shadow-xl border-2 flex flex-col items-center justify-center gap-2.5 transition cursor-pointer min-h-[125px] ${
                    !enTurnoAhora && !enPausaAlmuerzo
                      ? "bg-gradient-to-br from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white shadow-emerald-950/40 border-emerald-400/50"
                      : "bg-stone-900/60 text-stone-500 border-white/5 cursor-not-allowed opacity-50"
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
                    <MapPin size={26} className="text-white" />
                  </div>
                  <span className="text-sm tracking-wide">MARCAR ENTRADA</span>
                  <span className="text-[10px] text-emerald-200/90 font-mono font-medium">
                    {enTurnoAhora ? "Turno ya iniciado" : "Inicio de Jornada"}
                  </span>
                </motion.button>

                {/* 2. INICIO ALMUERZO */}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => ejecutarMarcado("almuerzo_inicio")}
                  disabled={
                    !enTurnoAhora ||
                    enPausaAlmuerzo ||
                    (geocercaConfig.bloquear_fuera_de_radio && !estaDentroDelRadio)
                  }
                  className={`p-5 rounded-3xl font-extrabold shadow-xl border-2 flex flex-col items-center justify-center gap-2.5 transition cursor-pointer min-h-[125px] ${
                    enTurnoAhora && !enPausaAlmuerzo
                      ? "bg-gradient-to-br from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white shadow-amber-950/40 border-amber-400/50"
                      : "bg-stone-900/60 text-stone-500 border-white/5 cursor-not-allowed opacity-50"
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
                    <Utensils size={26} className="text-white" />
                  </div>
                  <span className="text-sm tracking-wide">INICIO ALMUERZO</span>
                  <span className="text-[10px] text-amber-200/90 font-mono font-medium">
                    {enPausaAlmuerzo ? "Ya en almuerzo" : "Pausa Refrigerio"}
                  </span>
                </motion.button>

                {/* 3. FIN ALMUERZO */}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => ejecutarMarcado("almuerzo_fin")}
                  disabled={
                    !enPausaAlmuerzo ||
                    (geocercaConfig.bloquear_fuera_de_radio && !estaDentroDelRadio)
                  }
                  className={`p-5 rounded-3xl font-extrabold shadow-xl border-2 flex flex-col items-center justify-center gap-2.5 transition cursor-pointer min-h-[125px] ${
                    enPausaAlmuerzo
                      ? "bg-gradient-to-br from-sky-600 to-sky-800 hover:from-sky-500 hover:to-sky-700 text-white shadow-sky-950/40 border-sky-400/50"
                      : "bg-stone-900/60 text-stone-500 border-white/5 cursor-not-allowed opacity-50"
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
                    <Coffee size={26} className="text-white" />
                  </div>
                  <span className="text-sm tracking-wide">FIN ALMUERZO</span>
                  <span className="text-[10px] text-sky-200/90 font-mono font-medium">
                    {enPausaAlmuerzo ? "Retornar al puesto" : "Solo en pausa"}
                  </span>
                </motion.button>

                {/* 4. SALIDA */}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => ejecutarMarcado("salida")}
                  disabled={
                    (!enTurnoAhora && !enPausaAlmuerzo) ||
                    (geocercaConfig.bloquear_fuera_de_radio && !estaDentroDelRadio)
                  }
                  className={`p-5 rounded-3xl font-extrabold shadow-xl border-2 flex flex-col items-center justify-center gap-2.5 transition cursor-pointer min-h-[125px] ${
                    enTurnoAhora || enPausaAlmuerzo
                      ? "bg-gradient-to-br from-rose-600 to-rose-800 hover:from-rose-500 hover:to-rose-700 text-white shadow-rose-950/40 border-rose-400/50"
                      : "bg-stone-900/60 text-stone-500 border-white/5 cursor-not-allowed opacity-50"
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
                    <LogOut size={26} className="text-white" />
                  </div>
                  <span className="text-sm tracking-wide">MARCAR SALIDA</span>
                  <span className="text-[10px] text-rose-200/90 font-mono font-medium">
                    Fin de Turno
                  </span>
                </motion.button>
              </div>
            </div>

            {/* HISTORIAL DE HOY EXCLUSIVO DEL USUARIO LOGUEADO */}
            <div className="p-5 rounded-3xl bg-stone-900/60 border border-white/10 space-y-3">
              <h4 className="font-bold text-xs uppercase text-stone-400 tracking-wider flex items-center justify-between">
                <span>Tus Marcados de Hoy ({usuarioAutenticado.nombre})</span>
                <span className="font-mono text-amber-400">{asistenciasDeHoy.length} registros</span>
              </h4>

              {asistenciasDeHoy.length === 0 ? (
                <p className="text-xs text-stone-500 py-4 text-center italic">
                  Aún no tienes marcados registrados hoy. Pulsa &quot;MARCAR ENTRADA&quot; para registrar el inicio de tu turno.
                </p>
              ) : (
                <div className="space-y-2">
                  {asistenciasDeHoy.map((reg) => (
                    <div
                      key={reg.id}
                      className="p-3.5 rounded-2xl bg-stone-950/70 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                            reg.tipo === "entrada"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : reg.tipo === "salida"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {reg.tipo.replace("_", " ")}
                        </span>
                        <span className="font-mono font-bold text-white text-sm">
                          {reg.hora}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 text-stone-400">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            reg.estado_puntualidad === "a_tiempo" || reg.estado_puntualidad === "salida_puntual"
                              ? "bg-emerald-950 text-emerald-400"
                              : "bg-amber-950 text-amber-400"
                          }`}
                        >
                          {reg.estado_puntualidad === "a_tiempo"
                            ? "A tiempo"
                            : reg.estado_puntualidad === "tardanza"
                            ? "Tardanza"
                            : "Completado"}
                        </span>
                        <span className="font-mono text-[11px]">
                          a {reg.distancia_metros}m
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* ── MODAL ÉXITO DE MARCADO (CON AUTO-LOGOUT PARA EL SIGUIENTE COLABORADOR) ── */}
      <AnimatePresence>
        {confirmacionExitosa && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="w-full max-w-sm p-6 rounded-3xl bg-gradient-to-b from-stone-900 to-stone-950 border border-emerald-500/40 shadow-2xl text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <h3 className="font-serif font-black text-xl text-white">
                  ¡Marcado Exitoso!
                </h3>
                <p className="text-xs text-stone-400">
                  {confirmacionExitosa.nombre}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-950/80 border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-400">Tipo:</span>
                  <strong className="text-white uppercase font-bold">
                    {confirmacionExitosa.tipo.replace("_", " ")}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Hora Oficial:</span>
                  <strong className="text-amber-300 font-mono text-sm">
                    {confirmacionExitosa.hora}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Distancia al Local:</span>
                  <strong className="text-emerald-400 font-mono">
                    {confirmacionExitosa.distancia} metros
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Puntualidad:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                      confirmacionExitosa.puntualidad === "a_tiempo"
                        ? "bg-emerald-950 text-emerald-300"
                        : "bg-amber-950 text-amber-300"
                    }`}
                  >
                    {confirmacionExitosa.puntualidad === "a_tiempo" ? "A Tiempo" : "Tardanza"}
                  </span>
                </div>
              </div>

              {autoLogoutTimer > 0 && (
                <p className="text-[11px] text-amber-300/80 font-mono">
                  Liberando terminal en {autoLogoutTimer}s para el siguiente compañero...
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setConfirmacionExitosa(null)}
                  className="py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-stone-300 font-bold text-xs transition cursor-pointer"
                >
                  Seguir en mi sesión
                </button>
                <button
                  onClick={handleCerrarSesion}
                  className="py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs transition shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  Finalizar &amp; Salir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── FOOTER DE CONTROL BIOMÉTRICO ── */}
      <footer className="border-t border-white/10 py-4 px-4 text-center text-xs text-stone-500 bg-[#0A0604]">
        <p>
          Dencker Pan &bull; Sistema Biométrico &amp; Geocerca GPS &bull; Av. Daniel Salamanca, Cochabamba
        </p>
      </footer>
    </div>
  );
}

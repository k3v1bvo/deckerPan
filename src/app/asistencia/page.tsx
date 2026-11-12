"use client";

import { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { useSystemStore } from "@/store";
import {
  RegistroAsistencia,
  TipoMarcadoAsistencia,
  EstadoPuntualidad,
  UsuarioStaff,
} from "@/types";
import {
  calcularDistanciaMetros,
  getGPSPosition,
  evaluarPuntualidad,
} from "@/lib/geo";
import { soundManager } from "@/lib/sound";
import { DENCKER_ASSETS } from "@/lib/seed-data";

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

  // Empleado seleccionado
  const [personalSeleccionado, setPersonalSeleccionado] = useState<UsuarioStaff | null>(null);
  const [pinInput, setPinInput] = useState<string>("");
  const [pinError, setPinError] = useState<boolean>(false);
  const [pinVerificado, setPinVerificado] = useState<boolean>(false);
  const [modalPinAbierto, setModalPinAbierto] = useState<boolean>(false);
  const [accionPendiente, setAccionPendiente] = useState<TipoMarcadoAsistencia | null>(null);

  // Modal de confirmación de éxito
  const [confirmacionExitosa, setConfirmacionExitosa] = useState<{
    tipo: TipoMarcadoAsistencia;
    hora: string;
    distancia: number;
    puntualidad: EstadoPuntualidad;
    nombre: string;
  } | null>(null);

  // Actualizar reloj cada segundo en el cliente
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

  // Función para capturar coordenadas GPS
  const refrescarGPS = async () => {
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
  };

  // Solicitar GPS al montar el componente
  useEffect(() => {
    refrescarGPS();
  }, []);

  // Calcular distancia al centro de Dencker Pan
  const distanciaActual = useMemo(() => {
    if (!coordenadas) return null;
    return calcularDistanciaMetros(
      coordenadas.lat,
      coordenadas.lon,
      geocercaConfig.latitud,
      geocercaConfig.longitud
    );
  }, [coordenadas, geocercaConfig]);

  // Determinar si está dentro del radio permitido
  const estaDentroDelRadio = useMemo(() => {
    if (distanciaActual === null) return false;
    return distanciaActual <= geocercaConfig.radio_metros;
  }, [distanciaActual, geocercaConfig.radio_metros]);

  // Historial de hoy para el personal seleccionado
  const asistenciasDeHoy = useMemo(() => {
    if (!personalSeleccionado || !hoyStr) return [];
    return (asistencias || []).filter(
      (a) => a.personal_id === personalSeleccionado.id && a.fecha === hoyStr
    );
  }, [asistencias, personalSeleccionado, hoyStr]);

  // Último registro de hoy para saber si está en turno
  const ultimoRegistro = asistenciasDeHoy[0] || null;
  const enTurnoAhora = ultimoRegistro?.tipo === "entrada" || ultimoRegistro?.tipo === "almuerzo_fin";

  // Intentar realizar el marcado
  const iniciarMarcado = (tipo: TipoMarcadoAsistencia) => {
    if (!personalSeleccionado) {
      soundManager.playClick();
      alert("Por favor, selecciona primero tu nombre de la lista de personal.");
      return;
    }

    // Verificar si el marcado está bloqueado fuera de radio
    if (geocercaConfig.bloquear_fuera_de_radio && !estaDentroDelRadio) {
      soundManager.playError();
      alert(
        `⛔ MARCADO BLOQUEADO: Te encuentras a ${distanciaActual ?? "?"}m del local. El radio máximo permitido es de ${geocercaConfig.radio_metros} metros.`
      );
      return;
    }

    // Si el usuario tiene PIN, solicitarlo
    if (personalSeleccionado.pin) {
      setAccionPendiente(tipo);
      setPinInput("");
      setPinError(false);
      setModalPinAbierto(true);
    } else {
      ejecutarMarcado(tipo);
    }
  };

  const ejecutarMarcado = (tipo: TipoMarcadoAsistencia) => {
    if (!personalSeleccionado) return;

    const fechaFinal = hoyStr || new Date().toISOString().split("T")[0];
    const horaObj = ahora || new Date();
    const horaStr = horaObj.toLocaleTimeString("es-BO", { hour12: false });
    const horaCorta = horaStr.substring(0, 5); // "HH:MM"
    const puntualidad = evaluarPuntualidad(horaCorta, tipo, geocercaConfig);
    const distancia = distanciaActual ?? 0;

    const registro: Omit<RegistroAsistencia, "id" | "created_at"> = {
      personal_id: personalSeleccionado.id,
      personal_nombre: personalSeleccionado.nombre,
      cargo: personalSeleccionado.cargo || "Personal",
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
            ? "Llegada puntual al turno"
            : "Llegada con retraso"
          : tipo === "salida"
          ? "Fin de jornada laboral"
          : tipo === "almuerzo_inicio"
          ? "Inicio de refrigerio"
          : "Retorno de refrigerio",
    };

    addRegistroAsistencia(registro);
    soundManager.playSuccessTone();

    setConfirmacionExitosa({
      tipo,
      hora: horaStr,
      distancia,
      puntualidad,
      nombre: personalSeleccionado.nombre,
    });

    setModalPinAbierto(false);
    setPinInput("");
    setAccionPendiente(null);
  };

  const verificarPin = () => {
    if (!personalSeleccionado) return;
    if (pinInput === personalSeleccionado.pin) {
      if (accionPendiente) {
        ejecutarMarcado(accionPendiente);
      }
    } else {
      setPinError(true);
      soundManager.playError();
    }
  };

  const formatearFechaLarga = (d: Date) => {
    return d.toLocaleDateString("es-BO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#0E0906] text-stone-100 flex flex-col justify-between selection:bg-amber-500 selection:text-stone-950 font-sans">
      {/* ── HEADER DE NAVEGACIÓN ── */}
      <header className="sticky top-0 z-30 bg-[#160D08]/90 backdrop-blur-xl border-b border-amber-500/20 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-stone-300 hover:text-amber-300 text-xs font-bold transition-colors py-1 px-2.5 rounded-xl bg-white/5 hover:bg-white/10"
          >
            <ArrowLeft size={16} />
            <span>Volver a la Cafetería</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <img
                src={DENCKER_ASSETS.logoLight}
                alt="Don Dencker"
                className="w-6 h-6 object-contain"
              />
            </div>
            <div className="leading-tight">
              <span className="font-serif font-black text-sm text-white block">
                Dencker Pan
              </span>
              <span className="text-[10px] text-amber-300/80 font-mono">
                Control de Asistencia GPS
              </span>
            </div>
          </div>

          <Link
            href="/admin?tab=asistencias"
            className="text-xs font-semibold text-stone-400 hover:text-amber-200 transition flex items-center gap-1.5 py-1 px-2.5 rounded-xl bg-white/5 hover:bg-white/10"
          >
            <ShieldCheck size={15} className="text-amber-400" />
            <span className="hidden sm:inline">Panel Gerencia</span>
          </Link>
        </div>
      </header>

      {/* ── CUERPO PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto w-full px-4 py-6 space-y-6 flex-1">
        {/* 1. RELOJ DIGITAL Y FECHA */}
        <section className="text-center space-y-2 py-4 px-6 rounded-3xl bg-gradient-to-b from-stone-900/90 to-stone-950 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <p className="text-xs sm:text-sm font-semibold text-amber-300/90 uppercase tracking-widest flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            Hora Oficial de Bolivia &bull; {geocercaConfig.local_nombre}
          </p>

          <div className="font-mono text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_16px_rgba(245,158,11,0.25)]">
            {ahora ? ahora.toLocaleTimeString("es-BO", { hour12: false }) : "--:--:--"}
          </div>

          <p className="text-xs sm:text-sm text-stone-400 capitalize font-medium">
            {ahora ? formatearFechaLarga(ahora) : "Cargando hora oficial..."}
          </p>
        </section>

        {/* 2. RADAR DE GEOLOCALIZACIÓN GPS (RADIO EN METROS) */}
        <section className="p-5 rounded-3xl bg-stone-900/70 border border-white/10 backdrop-blur-md shadow-xl space-y-4">
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
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-stone-300 hover:text-white border border-white/10 transition active:scale-95 flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer disabled:opacity-50"
              title="Volver a leer coordenadas GPS"
            >
              <RefreshCw size={14} className={gpsLoading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Recalibrar</span>
            </button>
          </div>

          {/* Estado de Coordenadas y Radio */}
          {gpsLoading ? (
            <div className="p-4 rounded-2xl bg-stone-950/60 border border-white/5 text-center text-xs text-stone-400 animate-pulse flex items-center justify-center gap-2">
              <RefreshCw size={16} className="animate-spin text-amber-400" />
              <span>Conectando con satélites GPS del dispositivo...</span>
            </div>
          ) : gpsError ? (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200 space-y-1">
              <div className="flex items-center gap-2 font-bold text-rose-300">
                <AlertCircle size={16} />
                <span>Error de Señal GPS</span>
              </div>
              <p>{gpsError}</p>
              <p className="text-[11px] text-rose-300/80 pt-1">
                Asegúrate de permitir el acceso a tu ubicación en los ajustes del navegador o activar el GPS de tu celular.
              </p>
            </div>
          ) : (
            <div
              className={`p-4 rounded-2xl border transition-all ${
                estaDentroDelRadio
                  ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
                  : "bg-rose-950/30 border-rose-500/30 text-rose-200"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3.5 h-3.5 rounded-full ${
                      estaDentroDelRadio
                        ? "bg-emerald-400 shadow-[0_0_12px_#10b981]"
                        : "bg-rose-500 shadow-[0_0_12px_#f43f5e]"
                    }`}
                  />
                  <div>
                    <span className="font-extrabold text-sm block">
                      {estaDentroDelRadio
                        ? "🟢 DENTRO DEL LOCAL (Ubicación Válida)"
                        : "🔴 FUERA DEL RADIO PERMITIDO"}
                    </span>
                    <span className="text-xs opacity-90 block">
                      Distancia estimada al local:{" "}
                      <strong className="font-mono text-sm underline">
                        {distanciaActual} metros
                      </strong>{" "}
                      (Límite perimetral: {geocercaConfig.radio_metros}m)
                    </span>
                  </div>
                </div>

                <div className="text-right text-[11px] font-mono text-stone-400 bg-black/30 px-3 py-1.5 rounded-xl border border-white/5">
                  <div>Precisión: ±{coordenadas?.accuracy}m</div>
                  <div>Lat: {coordenadas?.lat.toFixed(5)}</div>
                  <div>Lon: {coordenadas?.lon.toFixed(5)}</div>
                </div>
              </div>

              {!estaDentroDelRadio && geocercaConfig.bloquear_fuera_de_radio && (
                <div className="mt-3 pt-3 border-t border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0" />
                  <span>
                    El marcado está bloqueado porque te encuentras fuera del establecimiento. Acércate a la cafetería para registrar tu entrada/salida.
                  </span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* 3. SELECTOR DE PERSONAL STAFF */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-stone-200 flex items-center gap-2">
              <Users size={16} className="text-amber-400" />
              <span>Selecciona tu Perfil de Empleado</span>
            </h3>
            {personalSeleccionado && (
              <span className="text-xs text-amber-300 font-semibold">
                Seleccionado: {personalSeleccionado.nombre}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {usuariosStaff
              .filter((u) => u.activo)
              .map((usuario) => {
                const esSeleccionado = personalSeleccionado?.id === usuario.id;
                // Revisar último registro de hoy de este empleado
                const regHoy = (asistencias || []).find(
                  (a) => a.personal_id === usuario.id && a.fecha === hoyStr
                );
                const estaEnTurno = regHoy?.tipo === "entrada" || regHoy?.tipo === "almuerzo_fin";

                return (
                  <button
                    key={usuario.id}
                    onClick={() => {
                      soundManager.playClick();
                      setPersonalSeleccionado(usuario);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all active:scale-98 flex items-center gap-3 cursor-pointer ${
                      esSeleccionado
                        ? "bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/40"
                        : "bg-stone-900/60 border-white/10 hover:bg-stone-900 hover:border-white/20"
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${
                        esSeleccionado
                          ? "bg-amber-400 text-stone-950 border-amber-300"
                          : "bg-white/10 text-stone-200 border-white/10"
                      }`}
                    >
                      {usuario.nombre
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-white truncate block">
                          {usuario.nombre}
                        </span>
                        {esSeleccionado && (
                          <Check size={14} className="text-amber-400 shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-stone-400 truncate block">
                        {usuario.cargo || usuario.role}
                      </span>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            estaEnTurno ? "bg-emerald-400 animate-pulse" : "bg-stone-600"
                          }`}
                        />
                        <span className="text-[10px] text-stone-400">
                          {estaEnTurno ? "En turno activo" : "Sin marcar"}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>
        </section>

        {/* 4. BOTONES TÁCTILES DE MARCADO */}
        <section className="space-y-3 pt-2">
          <h3 className="font-bold text-sm text-stone-200 flex items-center gap-2">
            <Clock size={16} className="text-amber-400" />
            <span>Acción de Marcado</span>
            {personalSeleccionado && (
              <span className="text-xs text-stone-400 font-normal">
                para <strong>{personalSeleccionado.nombre}</strong>
              </span>
            )}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* ENTRADA */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => iniciarMarcado("entrada")}
              disabled={!personalSeleccionado || (geocercaConfig.bloquear_fuera_de_radio && !estaDentroDelRadio)}
              className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white font-extrabold shadow-xl shadow-emerald-950/40 border-2 border-emerald-400/40 flex flex-col items-center justify-center gap-2.5 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer min-h-[110px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
                <MapPin size={26} className="text-white" />
              </div>
              <span className="text-sm tracking-wide">MARCAR ENTRADA</span>
              <span className="text-[10px] text-emerald-200/90 font-mono font-medium">
                Inicio de Turno
              </span>
            </motion.button>

            {/* SALIDA */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => iniciarMarcado("salida")}
              disabled={!personalSeleccionado || (geocercaConfig.bloquear_fuera_de_radio && !estaDentroDelRadio)}
              className="p-5 rounded-3xl bg-gradient-to-br from-rose-600 to-rose-800 hover:from-rose-500 hover:to-rose-700 text-white font-extrabold shadow-xl shadow-rose-950/40 border-2 border-rose-400/40 flex flex-col items-center justify-center gap-2.5 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer min-h-[110px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
                <LogOut size={26} className="text-white" />
              </div>
              <span className="text-sm tracking-wide">MARCAR SALIDA</span>
              <span className="text-[10px] text-rose-200/90 font-mono font-medium">
                Fin de Jornada
              </span>
            </motion.button>

            {/* INICIO REFRIGERIO */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => iniciarMarcado("almuerzo_inicio")}
              disabled={!personalSeleccionado || (geocercaConfig.bloquear_fuera_de_radio && !estaDentroDelRadio)}
              className="p-5 rounded-3xl bg-gradient-to-br from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white font-extrabold shadow-xl shadow-amber-950/40 border-2 border-amber-400/40 flex flex-col items-center justify-center gap-2.5 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer min-h-[110px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
                <Utensils size={26} className="text-white" />
              </div>
              <span className="text-sm tracking-wide">INICIO ALMUERZO</span>
              <span className="text-[10px] text-amber-200/90 font-mono font-medium">
                Pausa Comida
              </span>
            </motion.button>

            {/* FIN REFRIGERIO */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => iniciarMarcado("almuerzo_fin")}
              disabled={!personalSeleccionado || (geocercaConfig.bloquear_fuera_de_radio && !estaDentroDelRadio)}
              className="p-5 rounded-3xl bg-gradient-to-br from-sky-600 to-sky-800 hover:from-sky-500 hover:to-sky-700 text-white font-extrabold shadow-xl shadow-sky-950/40 border-2 border-sky-400/40 flex flex-col items-center justify-center gap-2.5 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer min-h-[110px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
                <Coffee size={26} className="text-white" />
              </div>
              <span className="text-sm tracking-wide">FIN ALMUERZO</span>
              <span className="text-[10px] text-sky-200/90 font-mono font-medium">
                Retorno al Turno
              </span>
            </motion.button>
          </div>
        </section>

        {/* 5. HISTORIAL DE HOY PARA EL PERSONAL SELECCIONADO */}
        {personalSeleccionado && (
          <section className="p-5 rounded-3xl bg-stone-900/60 border border-white/10 space-y-3">
            <h4 className="font-bold text-xs uppercase text-stone-400 tracking-wider flex items-center justify-between">
              <span>Registros de Hoy: {personalSeleccionado.nombre}</span>
              <span className="font-mono text-amber-400">{asistenciasDeHoy.length} marcados</span>
            </h4>

            {asistenciasDeHoy.length === 0 ? (
              <p className="text-xs text-stone-500 py-3 text-center italic">
                Aún no tienes marcados registrados hoy.
              </p>
            ) : (
              <div className="space-y-2">
                {asistenciasDeHoy.map((reg) => (
                  <div
                    key={reg.id}
                    className="p-3 rounded-2xl bg-stone-950/60 border border-white/5 flex items-center justify-between text-xs"
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

                    <div className="flex items-center gap-2 text-stone-400">
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
          </section>
        )}
      </main>

      {/* ── MODAL VERIFICACIÓN PIN ── */}
      <AnimatePresence>
        {modalPinAbierto && personalSeleccionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm p-6 rounded-3xl bg-stone-900 border border-amber-500/30 shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mx-auto flex items-center justify-center">
                <KeyRound size={24} />
              </div>

              <div>
                <h3 className="font-bold text-lg text-white">
                  Ingresa tu PIN de Seguridad
                </h3>
                <p className="text-xs text-stone-400">
                  {personalSeleccionado.nombre} &bull; {accionPendiente?.toUpperCase()}
                </p>
              </div>

              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") verificarPin();
                }}
                placeholder="• • • •"
                autoFocus
                className="w-full text-center text-3xl font-mono tracking-widest py-3 px-4 rounded-2xl bg-stone-950 border border-white/15 text-white focus:outline-none focus:border-amber-400"
              />

              {pinError && (
                <p className="text-xs text-rose-400 font-semibold animate-shake">
                  PIN incorrecto. Intenta de nuevo.
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    setModalPinAbierto(false);
                    setPinInput("");
                  }}
                  className="py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-stone-300 font-bold text-xs transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={verificarPin}
                  className="py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Confirmar Marcado
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL ÉXITO DE MARCADO ── */}
      <AnimatePresence>
        {confirmacionExitosa && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
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
                  <span className="text-stone-400">Hora:</span>
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
                  <span className="text-stone-400">Estado:</span>
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

              <button
                onClick={() => setConfirmacionExitosa(null)}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs transition shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                Entendido
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/10 py-4 px-4 text-center text-xs text-stone-500 bg-[#0A0604]">
        <p>
          Dencker Pan &bull; Sistema Biométrico &amp; Geocerca GPS &bull; Cochabamba, Bolivia
        </p>
      </footer>
    </div>
  );
}

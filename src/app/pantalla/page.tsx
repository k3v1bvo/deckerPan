"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ArrowLeft,
  Coffee,
  ChefHat,
  Flame,
  CheckCircle2,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { useSystemStore } from "@/store";
import { Pedido, EstadoPedido } from "@/types";
import { soundManager } from "@/lib/sound";
import { DENCKER_ASSETS } from "@/lib/seed-data";
import { AnimatedMascot } from "@/components/brand/AnimatedMascot";

export default function PantallaTurnosPage() {
  const { pedidos } = useSystemStore();

  const [ahora, setAhora] = useState<Date | null>(null);
  const [sonidoHabilitado, setSonidoHabilitado] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const ultimosListosIdsRef = useRef<Set<string>>(new Set());

  // Reloj digital en tiempo real
  useEffect(() => {
    setAhora(new Date());
    const timer = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filtrar pedidos activos
  const pedidosEnPreparacion = useMemo(() => {
    return pedidos
      .filter((p) => p.estado === "en_preparacion" || p.estado === "pendiente")
      .slice(0, 10);
  }, [pedidos]);

  const pedidosListos = useMemo(() => {
    return pedidos
      .filter((p) => p.estado === "listo")
      .slice(0, 10);
  }, [pedidos]);

  // Alerta sonora cuando aparece un nuevo pedido "Listo"
  useEffect(() => {
    const listosActualesIds = new Set(pedidosListos.map((p) => p.id));
    
    // Detectar si hay algún pedido nuevo en la lista de listos
    let hayNuevo = false;
    for (const id of listosActualesIds) {
      if (!ultimosListosIdsRef.current.has(id)) {
        hayNuevo = true;
        break;
      }
    }

    if (hayNuevo && ultimosListosIdsRef.current.size > 0 && sonidoHabilitado) {
      soundManager.playWaiterBell();
    }

    ultimosListosIdsRef.current = listosActualesIds;
  }, [pedidosListos, sonidoHabilitado]);

  // Manejo de Pantalla Completa
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const formatearHoraMinuto = (d: Date) => {
    return d.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  };

  return (
    <div className="w-full min-h-screen bg-[#0C0604] text-stone-100 flex flex-col justify-between selection:bg-amber-500 selection:text-stone-950 font-sans overflow-hidden">
      {/* ── BARRA SUPERIOR DE TV / MONITOR ── */}
      <header className="bg-[#140A06] border-b border-amber-500/20 px-6 py-4 shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition border border-white/10"
            title="Volver"
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 p-1 border border-amber-500/30 flex items-center justify-center">
              <img
                src={DENCKER_ASSETS.logoLight}
                alt="Don Dencker"
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <div>
              <h1 className="font-serif font-black text-xl text-white tracking-wide flex items-center gap-2">
                Dencker Pan
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#991B24] text-white border border-amber-400/30">
                  Monitor de Sala
                </span>
              </h1>
              <p className="text-[11px] text-amber-300/80 font-mono">
                Av. Salamanca &bull; Despacho de Horno &amp; Barismo en Vivo
              </p>
            </div>
          </div>
        </div>

        {/* Controles de la pantalla y Reloj Central */}
        <div className="flex items-center gap-4">
          <div className="text-right px-4 py-1.5 rounded-2xl bg-black/50 border border-white/10">
            <div className="font-mono text-2xl font-black text-white tracking-wider">
              {ahora ? formatearHoraMinuto(ahora) : "--:--:--"}
            </div>
            <div className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">
              Hora Oficial Bolivia
            </div>
          </div>

          <button
            onClick={() => {
              setSonidoHabilitado(!sonidoHabilitado);
              if (!sonidoHabilitado) soundManager.playWaiterBell();
            }}
            className={`p-3 rounded-2xl border transition active:scale-95 cursor-pointer ${
              sonidoHabilitado
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-white/5 text-stone-500 border-white/10"
            }`}
            title={sonidoHabilitado ? "Campana de retiro activada" : "Campana silenciada"}
          >
            {sonidoHabilitado ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/15 text-stone-300 hover:text-white border border-white/10 transition active:scale-95 cursor-pointer"
            title="Pantalla Completa (F11)"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </header>

      {/* ── TABLERO DE TURNOS (DIVISIÓN EN 2 COLUMNAS DE ALTO IMPACTO) ── */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-hidden">
        {/* COLUMNA 1: EN PREPARACIÓN (HORNO & BARISMO) */}
        <section className="bg-stone-900/60 border border-amber-500/20 rounded-3xl p-6 flex flex-col shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <ChefHat size={22} />
              </div>
              <div>
                <h2 className="font-serif font-black text-xl text-amber-300">
                  En Preparación
                </h2>
                <span className="text-xs text-stone-400">
                  Horneado en tanda fresca &amp; extracción de café
                </span>
              </div>
            </div>
            <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {pedidosEnPreparacion.length} en curso
            </span>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
            {pedidosEnPreparacion.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-stone-500 space-y-2">
                <Coffee size={40} className="text-stone-600 animate-pulse" />
                <p className="text-sm font-semibold">Todo al día en cocina y cafetería.</p>
                <p className="text-xs">Los nuevos pedidos ingresados aparecerán aquí.</p>
              </div>
            ) : (
              <AnimatePresence>
                {pedidosEnPreparacion.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 rounded-2xl bg-stone-950/80 border border-white/10 flex items-center justify-between gap-4 shadow-md"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-mono font-black text-lg text-amber-300 shrink-0">
                        {p.mesa_numero ? `M${p.mesa_numero}` : "PL"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-white">
                            {p.mesa_numero ? `Mesa ${p.mesa_numero}` : p.cliente_nombre || "Para Llevar"}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-stone-300">
                            {p.id}
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 truncate max-w-xs mt-0.5">
                          {p.items?.map((it) => `${it.cantidad}x ${it.producto_nombre}`).join(", ") || "Comanda en preparación"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                      <span className="text-xs font-mono font-bold text-amber-400">
                        Cocinando...
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </section>

        {/* COLUMNA 2: ¡LISTOS PARA RETIRAR EN BARRA! */}
        <section className="bg-gradient-to-b from-emerald-950/30 via-stone-900/60 to-stone-950 border-2 border-emerald-500/40 rounded-3xl p-6 flex flex-col shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-emerald-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h2 className="font-serif font-black text-xl text-emerald-300 flex items-center gap-2">
                  ¡Listos para Retirar!
                  <Sparkles size={16} className="text-emerald-400 animate-bounce" />
                </h2>
                <span className="text-xs text-stone-400">
                  Por favor, acércate a la barra de despacho
                </span>
              </div>
            </div>
            <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
              {pedidosListos.length} listos
            </span>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
            {pedidosListos.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-stone-500 space-y-2">
                <div className="w-14 h-14 rounded-full bg-stone-800/50 flex items-center justify-center">
                  <ShoppingBag size={28} className="text-stone-600" />
                </div>
                <p className="text-sm font-semibold">Esperando despachos de cocina.</p>
                <p className="text-xs">Los pedidos listos sonarán con la campana de sala.</p>
              </div>
            ) : (
              <AnimatePresence>
                {pedidosListos.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 to-stone-900 border-2 border-emerald-400/60 flex items-center justify-between gap-4 shadow-xl shadow-emerald-950/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-400 text-stone-950 flex items-center justify-center font-mono font-black text-2xl shadow-lg shadow-emerald-400/20 shrink-0">
                        {p.mesa_numero ? `M${p.mesa_numero}` : "PL"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-black text-xl text-white">
                            {p.mesa_numero ? `Mesa ${p.mesa_numero}` : p.cliente_nombre || "Para Llevar"}
                          </span>
                          <span className="text-xs font-mono font-black px-2 py-0.5 rounded-md bg-emerald-500 text-stone-950">
                            {p.id}
                          </span>
                        </div>
                        <p className="text-xs text-emerald-200/90 font-medium truncate max-w-sm mt-1">
                          {p.items?.map((it) => `${it.cantidad}x ${it.producto_nombre}`).join(", ") || "Comanda lista"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-extrabold text-xs tracking-wider uppercase">
                        ✓ RETIRAR
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </section>
      </main>

      {/* ── TICKER INFERIOR DE AMBIENTE ARTESANAL ── */}
      <footer className="bg-[#120704] border-t border-white/10 px-6 py-3 flex items-center justify-between text-xs text-stone-400">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold text-white">
            Dencker Pan Obrador &bull; Tandas Frescas de Masa Madre: 07:30 y 16:30
          </span>
        </div>

        <div className="flex items-center gap-4 text-stone-400 font-mono text-[11px]">
          <span>Café 4 Llamas (1,700 msnm Caranavi)</span>
          <span>&bull;</span>
          <span>100% Pura Mantequilla</span>
          <span>&bull;</span>
          <Link href="/asistencia" className="hover:text-amber-300 transition">
            Terminal Staff
          </Link>
        </div>
      </footer>
    </div>
  );
}

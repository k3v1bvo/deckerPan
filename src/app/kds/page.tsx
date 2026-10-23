"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat,
  Coffee,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  Filter,
  Sparkles,
  Flame,
  Check,
  Timer,
  TrendingUp,
  Activity,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { useSystemStore } from "@/store";
import { Estacion, EstadoItem, ItemPedido } from "@/types";
import { soundManager } from "@/lib/sound";

export default function KDSPage() {
  const { pedidos, updateItemEstado, updatePedidoEstado, addAlerta } = useSystemStore();
  const [estacionActiva, setEstacionActiva] = useState<Estacion | "todos">("todos");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Actualizar timer cada 2 segundos sin desfasar el renderizado
  useEffect(() => {
    setCurrentTime(Date.now());
    const interval = setInterval(() => setCurrentTime(Date.now()), 2000);
    return () => clearInterval(interval);
  }, []);

  // Filtrar pedidos no pagados ni cancelados
  const pedidosPendientes = useMemo(() => {
    return pedidos.filter(
      (p) => p.estado !== "pagado" && p.estado !== "cancelado" && p.estado !== "entregado"
    );
  }, [pedidos]);

  // Calcular tiempo transcurrido en minutos
  const getMinutosTranscurridos = (createdAt: string) => {
    if (!currentTime) return 0;
    const elapsed = Math.floor((currentTime - new Date(createdAt).getTime()) / 60000);
    return Math.max(0, elapsed);
  };

  // Métricas operativas de cocina
  const metricasCocina = useMemo(() => {
    const totalItems = pedidosPendientes.reduce((acc, p) => acc + (p.items?.length || 0), 0);
    const tiempos = pedidosPendientes.map((p) => getMinutosTranscurridos(p.created_at));
    const avgTiempo = tiempos.length ? Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length) : 0;
    const masAntiguo = tiempos.length ? Math.max(...tiempos) : 0;

    return {
      totalItems,
      avgTiempo,
      masAntiguo,
      totalComandas: pedidosPendientes.length,
    };
  }, [pedidosPendientes, currentTime]);

  const avanzarEstadoItem = (item: ItemPedido, mesaNumero?: number) => {
    let nuevoEstado: EstadoItem = "en_preparacion";
    if (item.estado === "pendiente") {
      nuevoEstado = "en_preparacion";
      if (soundEnabled) soundManager.playClick();
    } else if (item.estado === "en_preparacion") {
      nuevoEstado = "listo";
      if (soundEnabled) soundManager.playSuccessTone();

      // Notificar al mesero que el producto está listo
      if (mesaNumero) {
        addAlerta({
          mesa_numero: mesaNumero,
          tipo: "pedido_listo",
          mensaje: `Listo para servir: ${item.cantidad}x ${item.producto_nombre} (Mesa ${mesaNumero})`,
          datos_extra: { itemId: item.id },
        });
      }
    } else if (item.estado === "listo") {
      nuevoEstado = "entregado";
    }

    updateItemEstado(item.id, nuevoEstado);
  };

  const despacharTodaLaComanda = (pedidoId: string, mesaNumero?: number) => {
    const ped = pedidos.find((p) => p.id === pedidoId);
    if (!ped || !ped.items) return;

    ped.items.forEach((item) => {
      updateItemEstado(item.id, "listo");
    });
    updatePedidoEstado(pedidoId, "listo");

    if (soundEnabled) soundManager.playSuccessTone();

    if (mesaNumero) {
      addAlerta({
        mesa_numero: mesaNumero,
        tipo: "pedido_listo",
        mensaje: `¡Comanda completa lista para servir en Mesa ${mesaNumero}!`,
        datos_extra: { pedidoId },
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0907] text-stone-100 pb-28 font-sans selection:bg-amber-500 selection:text-black">
      {/* ── Header KDS Apple Pro High Contrast ── */}
      <header className="bg-[#17100b]/90 backdrop-blur-2xl border-b border-amber-900/40 px-4 lg:px-8 py-3.5 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 p-1 border border-amber-500/30 flex items-center justify-center shrink-0">
              <img
                src="https://i.ibb.co/qMkf00HN/dencker-logo.png"
                alt="Dencker Pan"
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <div>
              <h1 className="font-serif text-xl lg:text-2xl font-bold tracking-wide text-amber-100 flex items-center gap-2">
                KDS — Cocina & Barismo Dencker Pan
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> EN VIVO
                </span>
              </h1>
              <p className="text-amber-200/60 text-xs hidden sm:block">
                Despacho en tiempo real y asignación por estación operativa
              </p>
            </div>
          </div>

          {/* Filtros de Estación con estilo Apple Segmented */}
          <div className="flex items-center gap-1 bg-black/60 p-1.5 rounded-2xl border border-amber-900/30 overflow-x-auto">
            {(
              [
                { id: "todos", label: "Todas", icon: Filter },
                { id: "cafeteria", label: "Cafetería", icon: Coffee },
                { id: "vitrina", label: "Vitrina / Pan", icon: Sparkles },
                { id: "cocina", label: "Cocina Caliente", icon: Flame },
              ] as const
            ).map((est) => {
              const Icon = est.icon;
              const isActive = estacionActiva === est.id;
              return (
                <button
                  key={est.id}
                  onClick={() => {
                    setEstacionActiva(est.id);
                    soundManager.playClick();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-amber-600 text-white shadow-md shadow-amber-950"
                      : "text-stone-400 hover:text-stone-200 hover:bg-white/5"
                  }`}
                >
                  <Icon size={14} />
                  <span>{est.label}</span>
                </button>
              );
            })}
          </div>

          {/* Controles de Audio & Test */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) soundManager.playOrderChime();
              }}
              className="p-2 rounded-xl bg-amber-950/60 text-amber-200 border border-amber-800/50 hover:bg-amber-900/60 transition"
              title={soundEnabled ? "Silenciar audio" : "Activar audio"}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              onClick={() => soundManager.playOrderChime()}
              className="px-3 py-1.5 rounded-xl bg-amber-900/80 hover:bg-amber-800 text-amber-200 text-xs font-bold border border-amber-700/50 transition active:scale-95"
            >
              Probar Chime
            </button>
          </div>
        </div>
      </header>

      {/* ── Operational Kitchen Analytics Bar ── */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#19120d] border border-amber-900/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                Comandas en Cola
              </span>
              <span className="text-2xl font-serif font-black text-amber-200">
                {metricasCocina.totalComandas}
              </span>
            </div>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Layers size={18} />
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#19120d] border border-amber-900/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                Platos & Bebidas
              </span>
              <span className="text-2xl font-serif font-black text-amber-200">
                {metricasCocina.totalItems}
              </span>
            </div>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Activity size={18} />
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#19120d] border border-amber-900/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                Tiempo Promedio
              </span>
              <span className="text-2xl font-serif font-black text-amber-200">
                {metricasCocina.avgTiempo} min
              </span>
            </div>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Timer size={18} />
            </span>
          </div>

          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between transition-colors ${
              metricasCocina.masAntiguo >= 10
                ? "bg-red-950/40 border-red-700/60 text-red-200"
                : "bg-[#19120d] border-amber-900/30 text-amber-200"
            }`}
          >
            <div>
              <span className="text-[11px] font-semibold opacity-80 uppercase tracking-wider block">
                Espera Máxima
              </span>
              <span className="text-2xl font-serif font-black">
                {metricasCocina.masAntiguo} min
              </span>
            </div>
            <span
              className={`p-2 rounded-xl ${
                metricasCocina.masAntiguo >= 10
                  ? "bg-red-500/20 text-red-400 animate-pulse"
                  : "bg-amber-500/10 text-amber-400"
              }`}
            >
              <AlertTriangle size={18} />
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Orders Grid ── */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        {pedidosPendientes.length === 0 ? (
          <div className="py-28 text-center space-y-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 20 }}
              className="w-24 h-24 rounded-3xl bg-amber-950/40 border border-amber-800/40 flex items-center justify-center mx-auto text-amber-400 shadow-2xl shadow-amber-950"
            >
              <CheckCircle2 size={48} />
            </motion.div>
            <div>
              <h3 className="font-serif text-2xl font-bold text-amber-100">
                ¡Todas las comandas al día!
              </h3>
              <p className="text-sm text-stone-400 max-w-sm mx-auto mt-1">
                La cocina y el barismo están libres de órdenes pendientes. Las nuevas comandas desde las mesas sonarán automáticamente.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {pedidosPendientes.map((pedido) => {
                const minutos = getMinutosTranscurridos(pedido.created_at);

                // Filtrar items por la estación activa
                const itemsVisibles = (pedido.items || []).filter((item) => {
                  if (estacionActiva === "todos") return true;
                  return item.estacion === estacionActiva;
                });

                if (itemsVisibles.length === 0) return null;

                // Semáforo dinámico de tiempo
                const esUrgente = minutos >= 10;
                const esAlerta = minutos >= 5 && minutos < 10;

                const timerColor = esUrgente
                  ? "bg-red-950/90 text-red-300 border-red-600 animate-pulse"
                  : esAlerta
                  ? "bg-amber-950/80 text-amber-300 border-amber-700/60"
                  : "bg-emerald-950/80 text-emerald-300 border-emerald-700/50";

                return (
                  <motion.div
                    key={pedido.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className={`rounded-3xl border overflow-hidden shadow-2xl flex flex-col justify-between transition-all ${
                      esUrgente
                        ? "bg-[#1f0e0c] border-red-800/80 ring-2 ring-red-500/40"
                        : "bg-[#18110b] border-amber-900/40"
                    }`}
                  >
                    {/* Header Tarjeta */}
                    <div className="p-4 bg-[#231811] border-b border-amber-900/40 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-2xl lg:text-3xl font-black text-amber-50">
                            Mesa {pedido.mesa_numero}
                          </span>
                          <span className="text-[11px] font-mono text-amber-400/60">
                            #{pedido.id.substring(pedido.id.length - 4)}
                          </span>
                        </div>
                        <span className="text-xs text-stone-400 block mt-0.5">
                          {pedido.cliente_nombre || "Cliente en sala"}
                        </span>
                      </div>

                      {/* Timer Semáforo */}
                      <div
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-bold text-xs ${timerColor}`}
                      >
                        {esUrgente ? <Flame size={14} className="text-red-400 animate-bounce" /> : <Clock size={14} />}
                        <span>{minutos} min</span>
                        {esUrgente && <span className="text-[9px] uppercase tracking-wider">URGENTE</span>}
                      </div>
                    </div>

                    {/* Lista de Items */}
                    <div className="p-4 space-y-3 flex-1 divide-y divide-amber-900/30">
                      {itemsVisibles.map((item) => {
                        const isListo = item.estado === "listo";
                        const isPreparando = item.estado === "en_preparacion";

                        return (
                          <div
                            key={item.id}
                            className={`pt-3 first:pt-0 space-y-1.5 transition-opacity ${
                              isListo ? "opacity-60" : "opacity-100"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-black text-sm">
                                    {item.cantidad}x
                                  </span>
                                  <span
                                    className={`font-bold text-sm lg:text-base text-amber-50 ${
                                      isListo ? "line-through text-stone-400" : ""
                                    }`}
                                  >
                                    {item.producto_nombre}
                                  </span>
                                </div>

                                {item.chips_seleccionados && item.chips_seleccionados.length > 0 && (
                                  <div className="text-[11px] text-amber-300/80 mt-1 flex flex-wrap gap-1">
                                    {item.chips_seleccionados.map((chip, i) => (
                                      <span
                                        key={i}
                                        className="px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-800/40 text-amber-200"
                                      >
                                        {chip}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {item.notas && (
                                  <p className="text-[11px] text-amber-400/90 italic mt-1 font-medium">
                                    Nota: {item.notas}
                                  </p>
                                )}

                                <span className="text-[10px] text-stone-500 uppercase tracking-wider block mt-1">
                                  Estación: {item.estacion}
                                </span>
                              </div>

                              {/* Item Action Button */}
                              <button
                                onClick={() => avanzarEstadoItem(item, pedido.mesa_numero)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95 ${
                                  item.estado === "pendiente"
                                    ? "bg-amber-600/30 text-amber-300 hover:bg-amber-600/50 border border-amber-600/40"
                                    : item.estado === "en_preparacion"
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/40 animate-pulse"
                                    : "bg-emerald-600/30 text-emerald-300 border border-emerald-600/40"
                                }`}
                              >
                                {item.estado === "pendiente" && "Empezar"}
                                {item.estado === "en_preparacion" && (
                                  <>
                                    <Clock size={12} /> Listo
                                  </>
                                )}
                                {item.estado === "listo" && (
                                  <>
                                    <Check size={12} /> Despachado
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer Comanda Completa */}
                    <div className="p-4 bg-[#231811] border-t border-amber-900/40 flex items-center justify-between gap-3">
                      <span className="text-xs text-stone-400 font-mono">
                        {itemsVisibles.filter((i) => i.estado === "listo").length}/
                        {itemsVisibles.length} Listos
                      </span>

                      <button
                        onClick={() => despacharTodaLaComanda(pedido.id, pedido.mesa_numero)}
                        className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 transition flex items-center gap-1.5 active:scale-95"
                      >
                        <Check size={14} /> Despachar Comanda
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}

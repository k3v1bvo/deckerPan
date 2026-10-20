"use client";
import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useSystemStore } from "@/store";
import { Estacion, EstadoItem, ItemPedido } from "@/types";
import { soundManager } from "@/lib/sound";

export default function KDSPage() {
  const { pedidos, updateItemEstado, updatePedidoEstado, addAlerta } = useSystemStore();
  const [estacionActiva, setEstacionActiva] = useState<Estacion | "todos">("todos");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Actualizar timer cada 2 segundos
  useEffect(() => {
    setCurrentTime(Date.now());
    const interval = setInterval(() => setCurrentTime(Date.now()), 2000);
    return () => clearInterval(interval);
  }, []);

  // Filtrar pedidos no pagados ni cancelados
  const pedidosPendientes = pedidos.filter(
    (p) => p.estado !== "pagado" && p.estado !== "cancelado" && p.estado !== "entregado"
  );

  // Calcular tiempo transcurrido en minutos
  const getMinutosTranscurridos = (createdAt: string) => {
    if (!currentTime) return 0;
    const elapsed = Math.floor((currentTime - new Date(createdAt).getTime()) / 60000);
    return Math.max(0, elapsed);
  };

  const avanzarEstadoItem = (item: ItemPedido, mesaNumero?: number) => {
    let nuevoEstado: EstadoItem = "en_preparacion";
    if (item.estado === "pendiente") {
      nuevoEstado = "en_preparacion";
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
    <div className="min-h-screen bg-[#140E0A] text-stone-100 pb-20">
      {/* Header KDS de Alta Visibilidad */}
      <div className="bg-[#1F1510] border-b border-amber-900/40 px-6 py-4 shadow-xl sticky top-14 z-30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-amber-900/60 text-amber-300 border border-amber-700/50">
              <ChefHat size={24} />
            </span>
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-wide text-amber-100 flex items-center gap-2">
                KDS — Cocina & Barismo
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  EN VIVO
                </span>
              </h1>
              <p className="text-amber-200/60 text-xs">
                Despacho en tiempo real por estaciones operativas
              </p>
            </div>
          </div>

          {/* Filtros por Estación */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-amber-900/30">
            {(
              [
                { id: "todos", label: "Todas", icon: Filter },
                { id: "vitrina", label: "Vitrina / Panes", icon: Sparkles },
                { id: "cafeteria", label: "Cafetería", icon: Coffee },
                { id: "cocina", label: "Cocina Caliente", icon: Flame },
              ] as const
            ).map((est) => {
              const Icon = est.icon;
              const isActive = estacionActiva === est.id;
              return (
                <button
                  key={est.id}
                  onClick={() => setEstacionActiva(est.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-amber-600 text-white shadow-md shadow-amber-950/80"
                      : "text-amber-200/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={14} />
                  <span>{est.label}</span>
                </button>
              );
            })}
          </div>

          {/* Controles de Audio */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) soundManager.playOrderChime();
              }}
              className="p-2 rounded-xl bg-amber-900/40 text-amber-200 border border-amber-800/50 hover:bg-amber-900/60 transition"
              title={soundEnabled ? "Silenciar audio" : "Activar audio"}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              onClick={() => soundManager.playOrderChime()}
              className="px-3 py-1.5 rounded-xl bg-amber-800/80 hover:bg-amber-700 text-amber-100 text-xs font-medium border border-amber-600/40 transition"
            >
              Probar Chime
            </button>
          </div>
        </div>
      </div>

      {/* Contenedor Principal de Comandas */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {pedidosPendientes.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-amber-950/40 border border-amber-800/30 flex items-center justify-center mx-auto text-amber-400">
              <CheckCircle2 size={40} />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-amber-200">
                ¡Todas las comandas al día!
              </h3>
              <p className="text-sm text-stone-400 max-w-sm mx-auto">
                No hay órdenes pendientes en este momento. Las nuevas comandas desde las mesas o
                meseros sonarán automáticamente.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pedidosPendientes.map((pedido) => {
              const minutos = getMinutosTranscurridos(pedido.created_at);

              // Filtrar items por la estación activa
              const itemsVisibles = (pedido.items || []).filter((item) => {
                if (estacionActiva === "todos") return true;
                return item.estacion === estacionActiva;
              });

              if (itemsVisibles.length === 0) return null;

              // Semáforo dinámico de tiempo
              const timerColor =
                minutos < 5
                  ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/50"
                  : minutos < 10
                  ? "bg-amber-950/80 text-amber-300 border-amber-700/50"
                  : "bg-red-950/90 text-red-300 border-red-600 animate-pulse";

              return (
                <motion.div
                  key={pedido.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-[#1C130D] rounded-3xl border border-amber-900/30 overflow-hidden shadow-2xl flex flex-col justify-between"
                >
                  {/* Tarjeta Header */}
                  <div className="p-4 bg-[#261B12] border-b border-amber-900/40 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-2xl font-bold text-amber-100">
                          Mesa {pedido.mesa_numero}
                        </span>
                        <span className="text-[11px] font-mono text-amber-300/60">
                          #{pedido.id.substring(pedido.id.length - 4)}
                        </span>
                      </div>
                      <span className="text-xs text-stone-400">
                        {pedido.cliente_nombre || "Cliente en sala"}
                      </span>
                    </div>

                    {/* Timer Semáforo */}
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border font-mono font-bold text-xs ${timerColor}`}
                    >
                      <Clock size={13} />
                      <span>{minutos} min</span>
                    </div>
                  </div>

                  {/* Lista de Items */}
                  <div className="p-4 space-y-3 flex-1 divide-y divide-amber-900/20">
                    {itemsVisibles.map((item) => {
                      const itemStateBadge = {
                        pendiente: "bg-amber-500/20 text-amber-300 border-amber-600/40",
                        en_preparacion: "bg-blue-500/20 text-blue-300 border-blue-600/40",
                        listo: "bg-emerald-500/20 text-emerald-300 border-emerald-600/40",
                        entregado: "bg-stone-500/20 text-stone-400 border-stone-600/40",
                        cancelado: "bg-red-500/20 text-red-400 border-red-600/40",
                      }[item.estado];

                      return (
                        <div key={item.id} className="pt-3 first:pt-0 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-bold text-base text-amber-50">
                                {item.cantidad}x {item.producto_nombre}
                              </span>
                              <div className="flex items-center gap-2 text-xs text-amber-200/50">
                                <span className="uppercase text-[10px] tracking-wider font-semibold">
                                  {item.estacion}
                                </span>
                              </div>
                            </div>

                            {/* Botón Acción Rápida Estado */}
                            <button
                              onClick={() => avanzarEstadoItem(item, pedido.mesa_numero)}
                              className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                                item.estado === "pendiente"
                                  ? "bg-amber-600 hover:bg-amber-500 text-white border-amber-400"
                                  : item.estado === "en_preparacion"
                                  ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400"
                                  : "bg-emerald-950/80 text-emerald-400 border-emerald-800"
                              }`}
                            >
                              {item.estado === "pendiente" && "Comenzar"}
                              {item.estado === "en_preparacion" && "Marcar Listo ✓"}
                              {item.estado === "listo" && "Listo"}
                            </button>
                          </div>

                          {/* Chips de personalización */}
                          {item.chips_seleccionados && item.chips_seleccionados.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {item.chips_seleccionados.map((chip, i) => (
                                <span
                                  key={i}
                                  className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-amber-900/60 text-amber-200 border border-amber-700/50"
                                >
                                  ⚡ {chip}
                                </span>
                              ))}
                            </div>
                          )}

                          {item.notas && (
                            <p className="text-xs text-amber-300/80 bg-amber-950/50 p-1.5 rounded-lg border border-amber-900/40 italic">
                              Nota: {item.notas}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer Comanda */}
                  <div className="p-4 bg-[#261B12] border-t border-amber-900/40 flex items-center justify-between">
                    <span className="text-xs text-amber-200/60">
                      {itemsVisibles.filter((i) => i.estado === "listo").length} de{" "}
                      {itemsVisibles.length} listos
                    </span>

                    <button
                      onClick={() => despacharTodaLaComanda(pedido.id, pedido.mesa_numero)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      <Check size={14} /> Todo Listo
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

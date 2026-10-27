"use client";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Utensils,
  Bell,
  Clock,
  Plus,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Search,
  Sparkles,
  RefreshCw,
  X,
  Coffee,
  Layers,
  MapPin,
  Check,
  ChevronRight,
  Printer,
  ArrowRightLeft,
} from "lucide-react";
import { useSystemStore } from "@/store";
import { Mesa, EstadoMesa, Producto, ItemPedido, Zona } from "@/types";
import { soundManager } from "@/lib/sound";
import StaffAuthGuard from "@/components/StaffAuthGuard";

export default function MeseroPage() {
  const {
    zonas,
    mesas,
    pedidos,
    alertas,
    productos,
    categorias,
    setEstadoMesa,
    addPedido,
    updatePedidoEstado,
    updateItemEstado,
    addItemToPedido,
    addAlerta,
    marcarAlertaAtendida,
  } = useSystemStore();

  const [zonaSeleccionada, setZonaSeleccionada] = useState<string>("todas");
  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null);
  const [modalComandaAbierto, setModalComandaAbierto] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [modoVista, setModoVista] = useState<"plano" | "tarjetas">("plano");
  const [filtroEstado, setFiltroEstado] = useState<EstadoMesa | "todas">("todas");
  const [ticketCuentaModal, setTicketCuentaModal] = useState<boolean>(false);
  const [itemsNuevaComanda, setItemsNuevaComanda] = useState<{
    producto: Producto;
    cantidad: number;
    notas?: string;
  }[]>([]);

  // Pedidos enviados por clientes vía QR pendientes de verificación
  const pedidosPendientesQR = useMemo(() => {
    return pedidos.filter(
      (p) => p.estado === "pendiente" && typeof p.mesa_numero === "number" && p.mesa_numero > 0
    );
  }, [pedidos]);

  const verificarYMandarACocina = (pedidoId: string, mesaNumero?: number) => {
    updatePedidoEstado(pedidoId, "en_preparacion");
    const ped = pedidos.find((p) => p.id === pedidoId);
    if (ped && ped.items) {
      ped.items.forEach((it) => {
        updateItemEstado(it.id, "en_preparacion");
      });
    }

    if (typeof mesaNumero === "number" && mesaNumero > 0) {
      const mesaObj = mesas.find((m) => m.numero === mesaNumero);
      if (mesaObj) {
        setEstadoMesa(mesaObj.id, "ocupada");
      }

      alertas
        .filter((a) => a.mesa_numero === mesaNumero && !a.atendida)
        .forEach((a) => {
          marcarAlertaAtendida(a.id);
        });
    }

    soundManager.playSuccessTone();
  };

  // Sincronizar mesa seleccionada si cambia en store
  useEffect(() => {
    if (mesaSeleccionada) {
      const updated = mesas.find((m) => m.id === mesaSeleccionada.id);
      if (updated) setMesaSeleccionada(updated);
    }
  }, [mesas, mesaSeleccionada]);

  // Alertas activas sin atender
  const alertasPendientes = alertas.filter((a) => !a.atendida);

  // Mesas filtradas por zona y estado
  const mesasFiltradas = useMemo(() => {
    return mesas.filter((m) => {
      const matchZona = zonaSeleccionada === "todas" || m.zona_id === zonaSeleccionada;
      const matchEstado = filtroEstado === "todas" || m.estado === filtroEstado;
      return matchZona && matchEstado;
    });
  }, [mesas, zonaSeleccionada, filtroEstado]);

  // Contadores de estado
  const contadores = useMemo(() => {
    return {
      libres: mesas.filter((m) => m.estado === "libre").length,
      ocupadas: mesas.filter((m) => m.estado === "ocupada").length,
      reservadas: mesas.filter((m) => m.estado === "reservada").length,
      limpieza: mesas.filter((m) => m.estado === "limpieza").length,
    };
  }, [mesas]);

  // Obtener pedido activo de una mesa
  const getPedidoActivo = (mesaNumero: number) => {
    return pedidos.find(
      (p) => p.mesa_numero === mesaNumero && p.estado !== "pagado" && p.estado !== "cancelado"
    );
  };

  const abrirDetalleMesa = (mesa: Mesa) => {
    setMesaSeleccionada(mesa);
    setItemsNuevaComanda([]);
    soundManager.playClick();
  };

  const handleCambiarEstadoMesa = (nuevoEstado: EstadoMesa) => {
    if (!mesaSeleccionada) return;
    setEstadoMesa(mesaSeleccionada.id, nuevoEstado);
    setMesaSeleccionada({ ...mesaSeleccionada, estado: nuevoEstado });
    soundManager.playSuccessTone();
  };

  const agregarItemAComanda = (prod: Producto) => {
    soundManager.playClick();
    setItemsNuevaComanda((prev) => {
      const idx = prev.findIndex((i) => i.producto.id === prod.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx].cantidad += 1;
        return copy;
      }
      return [...prev, { producto: prod, cantidad: 1 }];
    });
  };

  // Ronda Express rápida de 1-clic para la mesa seleccionada
  const agregarRondaExpress = (nombreProducto: string) => {
    if (!mesaSeleccionada) return;
    const prod = productos.find((p) => p.nombre.toLowerCase().includes(nombreProducto.toLowerCase())) || productos[0];
    if (!prod) return;

    const pedidoActivo = getPedidoActivo(mesaSeleccionada.numero);
    if (pedidoActivo) {
      addItemToPedido(pedidoActivo.id, {
        producto_id: prod.id,
        producto_nombre: prod.nombre,
        cantidad: 1,
        precio_unitario: prod.precio,
        subtotal: prod.precio,
        estacion: prod.estacion,
        estado: "pendiente",
        chips_seleccionados: [],
        notas: "Ronda Express",
      });
    } else {
      const itemsPayload: ItemPedido[] = [
        {
          id: `it-${Date.now()}-0`,
          pedido_id: "",
          producto_id: prod.id,
          producto_nombre: prod.nombre,
          cantidad: 1,
          precio_unitario: prod.precio,
          subtotal: prod.precio,
          estacion: prod.estacion,
          estado: "pendiente",
          chips_seleccionados: [],
          notas: "Ronda Express",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      addPedido({
        mesa_id: mesaSeleccionada.id,
        mesa_numero: mesaSeleccionada.numero,
        estado: "pendiente",
        total: prod.precio,
        cliente_nombre: `Mesa ${mesaSeleccionada.numero}`,
        es_ronda: false,
        items: itemsPayload,
      });

      setEstadoMesa(mesaSeleccionada.id, "ocupada");
    }

    soundManager.playOrderChime();
  };

  const enviarComanda = () => {
    if (!mesaSeleccionada || itemsNuevaComanda.length === 0) return;

    const pedidoActivo = getPedidoActivo(mesaSeleccionada.numero);

    if (pedidoActivo) {
      itemsNuevaComanda.forEach((item) => {
        addItemToPedido(pedidoActivo.id, {
          producto_id: item.producto.id,
          producto_nombre: item.producto.nombre,
          cantidad: item.cantidad,
          precio_unitario: item.producto.precio,
          subtotal: item.producto.precio * item.cantidad,
          estacion: item.producto.estacion,
          estado: "pendiente",
          chips_seleccionados: [],
          notas: item.notas,
        });
      });
    } else {
      const itemsPayload: ItemPedido[] = itemsNuevaComanda.map((item, idx) => ({
        id: `it-${Date.now()}-${idx}`,
        pedido_id: "",
        producto_id: item.producto.id,
        producto_nombre: item.producto.nombre,
        cantidad: item.cantidad,
        precio_unitario: item.producto.precio,
        subtotal: item.producto.precio * item.cantidad,
        estacion: item.producto.estacion,
        estado: "pendiente",
        chips_seleccionados: [],
        notas: item.notas,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const total = itemsPayload.reduce((acc, it) => acc + it.subtotal, 0);

      addPedido({
        mesa_id: mesaSeleccionada.id,
        mesa_numero: mesaSeleccionada.numero,
        estado: "pendiente",
        total,
        cliente_nombre: `Mesa ${mesaSeleccionada.numero}`,
        es_ronda: false,
        items: itemsPayload,
      });

      setEstadoMesa(mesaSeleccionada.id, "ocupada");
    }

    soundManager.playOrderChime();
    setItemsNuevaComanda([]);
    setModalComandaAbierto(false);
  };

  const solicitarCuenta = () => {
    if (!mesaSeleccionada) return;
    addAlerta({
      mesa_numero: mesaSeleccionada.numero,
      tipo: "cuenta_pedida",
      mensaje: `Mesa ${mesaSeleccionada.numero} solicita la cuenta`,
      datos_extra: {},
    });
    soundManager.playWaiterBell();
    setTicketCuentaModal(true);
  };

  // Helper para generar sillas alrededor de la mesa
  const renderChairs = (capacidad: number, tipo: string) => {
    const chairs = [];
    const count = Math.min(capacidad, 8);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI;
      const radius = tipo === "redonda" ? 44 : 40;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      chairs.push(
        <span
          key={i}
          className="absolute w-2.5 h-2.5 rounded-full bg-stone-300 dark:bg-stone-600 border border-stone-400 dark:border-stone-500 shadow-2xs pointer-events-none transition-transform"
          style={{
            left: `calc(50% + ${x}px - 5px)`,
            top: `calc(50% + ${y}px - 5px)`,
          }}
        />
      );
    }
    return chairs;
  };

  return (
    <StaffAuthGuard requiredRole="mesero" roleTitle="Sala & Meseros">
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0c0a09] text-stone-900 dark:text-stone-100 pb-36 font-sans">
      {/* ── Apple Liquid Glass Header ── */}
      <header className="bg-stone-900/90 backdrop-blur-2xl border-b border-white/10 text-white px-4 lg:px-8 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 p-1 border border-amber-500/30 flex items-center justify-center shrink-0">
              <img
                src="/img/logo/logo.png"
                alt="Dencker Pan"
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <div>
              <h1 className="font-serif text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Sala & Servicio en Vivo
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  {mesas.length} Mesas Activas
                </span>
              </h1>
              <p className="text-stone-400 text-xs hidden sm:block">
                Plano arquitectónico, rondas de barismo y atención en tiempo real
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setFiltroEstado(filtroEstado === "libre" ? "todas" : "libre")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                filtroEstado === "libre"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105"
                  : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{contadores.libres} Libres</span>
            </button>

            <button
              onClick={() => setFiltroEstado(filtroEstado === "ocupada" ? "todas" : "ocupada")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                filtroEstado === "ocupada"
                  ? "bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/30 scale-105"
                  : "bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{contadores.ocupadas} Ocupadas</span>
            </button>

            <button
              onClick={() => setFiltroEstado(filtroEstado === "reservada" ? "todas" : "reservada")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold hidden md:flex items-center gap-1.5 transition-all ${
                filtroEstado === "reservada"
                  ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30 scale-105"
                  : "bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>{contadores.reservadas} Reservadas</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-white/10 p-1 rounded-2xl border border-white/10 ml-2">
              <button
                onClick={() => setModoVista("plano")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  modoVista === "plano"
                    ? "bg-white text-stone-900 shadow-md"
                    : "text-stone-300 hover:text-white"
                }`}
              >
                Plano 2.5D
              </button>
              <button
                onClick={() => setModoVista("tarjetas")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  modoVista === "tarjetas"
                    ? "bg-white text-stone-900 shadow-md"
                    : "text-stone-300 hover:text-white"
                }`}
              >
                Tarjetas
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* ── Pedidos QR en Mesa Pendientes de Verificación ── */}
        {pedidosPendientesQR.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-3xl bg-amber-500/15 border-2 border-amber-500/40 shadow-xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-amber-950 dark:text-amber-200 font-bold text-sm">
                <span className="p-2 rounded-2xl bg-amber-600 text-white animate-pulse">
                  <Bell size={18} />
                </span>
                <span>Pedidos QR en Mesa por Verificar ({pedidosPendientesQR.length})</span>
              </div>
              <span className="text-xs text-amber-800 dark:text-amber-300 font-medium hidden sm:inline">
                Acércate a la mesa, verifica la orden con el cliente y mándala a cocina
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {pedidosPendientesQR.map((ped) => (
                <div
                  key={ped.id}
                  className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-amber-300 dark:border-amber-700/50 shadow-md space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-base text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                        <span>Mesa {ped.mesa_numero}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                          QR Móvil
                        </span>
                      </span>
                      <span className="font-mono text-sm font-bold text-stone-900 dark:text-stone-100">
                        Bs {ped.total.toFixed(2)}
                      </span>
                    </div>

                    <div className="text-xs text-stone-600 dark:text-stone-300 space-y-1 max-h-24 overflow-y-auto pr-1">
                      {ped.items?.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="truncate">• {it.cantidad}x {it.producto_nombre}</span>
                          <span className="text-[10px] text-stone-400 font-mono">Bs {it.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-stone-700">
                    <button
                      onClick={() => {
                        const m = mesas.find((x) => x.numero === ped.mesa_numero);
                        if (m) abrirDetalleMesa(m);
                      }}
                      className="px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-xs font-semibold hover:bg-stone-50"
                    >
                      Ver Mesa
                    </button>
                    <button
                      onClick={() => verificarYMandarACocina(ped.id, ped.mesa_numero || 0)}
                      className="flex-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition"
                    >
                      <CheckCircle2 size={15} />
                      <span>Verificar y Mandar a Cocina</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Active Critical Alerts Dock ── */}
        {alertasPendientes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-3xl bg-red-500/10 border border-red-500/30 backdrop-blur-xl shadow-lg space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-bold text-sm">
                <span className="p-1.5 rounded-xl bg-red-600 text-white animate-bounce">
                  <Bell size={16} />
                </span>
                <span>Llamadas de Atención Inmediata ({alertasPendientes.length})</span>
              </div>
              <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                Prioridad de servicio
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {alertasPendientes.map((alerta) => {
                const esCuenta = alerta.tipo === "cuenta_pedida";
                return (
                  <div
                    key={alerta.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border shadow-sm transition-all ${
                      esCuenta
                        ? "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/60 shadow-amber-500/10"
                        : "bg-white dark:bg-stone-800 border-red-200 dark:border-red-900/40"
                    }`}
                  >
                    <div className="text-xs min-w-0 pr-2">
                      <span
                        className={`font-bold flex items-center gap-1.5 ${
                          esCuenta
                            ? "text-amber-800 dark:text-amber-300"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {esCuenta ? <Receipt size={14} /> : <Bell size={14} />}
                        <span>Mesa {alerta.mesa_numero}</span>
                        <span
                          className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded font-bold ${
                            esCuenta
                              ? "bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200"
                              : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
                          }`}
                        >
                          {esCuenta ? "Traer Cuenta" : alerta.tipo.replace("_", " ")}
                        </span>
                      </span>
                      <p className="text-stone-700 dark:text-stone-300 mt-1 text-[11px] font-medium leading-snug">
                        {alerta.mensaje}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        marcarAlertaAtendida(alerta.id);
                        soundManager.playSuccessTone();
                      }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl text-white transition shadow-sm active:scale-95 shrink-0 cursor-pointer ${
                        esCuenta
                          ? "bg-amber-600 hover:bg-amber-500 text-stone-950 font-extrabold"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {esCuenta ? "Llevar Cuenta" : "Atender"}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── Zone Segmented Selector ── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setZonaSeleccionada("todas")}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all relative ${
                zonaSeleccionada === "todas"
                  ? "bg-amber-900 dark:bg-amber-700 text-white shadow-md shadow-amber-950/20"
                  : "bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200/80 dark:border-stone-700"
              }`}
            >
              Todas las Zonas ({mesas.length})
            </button>
            {zonas.map((z) => {
              const count = mesas.filter((m) => m.zona_id === z.id).length;
              const isActive = zonaSeleccionada === z.id;
              return (
                <button
                  key={z.id}
                  onClick={() => setZonaSeleccionada(z.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-amber-900 dark:bg-amber-700 text-white shadow-md shadow-amber-950/20"
                      : "bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200/80 dark:border-stone-700"
                  }`}
                >
                  {z.nombre} ({count})
                </button>
              );
            })}
          </div>

          {mesaSeleccionada && (
            <div className="text-xs font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              Mesa {mesaSeleccionada.numero} seleccionada en panel
            </div>
          )}
        </div>

        {/* ── MODE 1: ARCHITECTURAL FLOOR PLAN 2.5D ── */}
        {modoVista === "plano" && (
          <div className="relative rounded-3xl bg-[#f5ede3] dark:bg-[#18120d] border border-stone-300/60 dark:border-amber-950/40 p-6 lg:p-10 shadow-inner overflow-hidden min-h-[480px]">
            {/* Ambient Wood Parquet / Terrazzo Texture lines */}
            <div
              className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06] pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(#78350f 1px, transparent 1px), radial-gradient(#78350f 1px, #f5ede3 1px)",
                backgroundSize: "24px 24px",
                backgroundPosition: "0 0, 12px 12px",
              }}
            />

            {/* Room architectural landmarks */}
            <div className="relative z-10 flex items-center justify-between mb-8 pb-3 border-b border-stone-300/70 dark:border-stone-800 text-xs font-bold text-stone-500 uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-amber-700" /> Distribución de Sala
              </span>
              <span className="text-[11px] text-stone-400 font-normal">
                Haz clic en una mesa para ver comandas y estado
              </span>
            </div>

            {/* Tables Spatial Layout */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-12 gap-x-8 justify-items-center">
              {mesasFiltradas.map((mesa) => {
                const pedido = getPedidoActivo(mesa.numero);
                const tieneAlerta = alertasPendientes.some((a) => a.mesa_numero === mesa.numero);
                const isSelected = mesaSeleccionada?.id === mesa.id;

                const statusStyles = {
                  libre: {
                    border: "border-emerald-400 dark:border-emerald-600/70",
                    bg: "bg-emerald-500/10 dark:bg-emerald-950/30",
                    glow: "shadow-emerald-500/20",
                    ring: "ring-emerald-400",
                    tag: "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300",
                    label: "Libre",
                  },
                  ocupada: {
                    border: "border-amber-400 dark:border-amber-500",
                    bg: "bg-amber-500/15 dark:bg-amber-950/40",
                    glow: "shadow-amber-500/30",
                    ring: "ring-amber-500",
                    tag: "bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300",
                    label: "Ocupada",
                  },
                  reservada: {
                    border: "border-purple-400 dark:border-purple-600/70",
                    bg: "bg-purple-500/10 dark:bg-purple-950/30",
                    glow: "shadow-purple-500/20",
                    ring: "ring-purple-400",
                    tag: "bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300",
                    label: "Reserva",
                  },
                  limpieza: {
                    border: "border-blue-400 dark:border-blue-600/70",
                    bg: "bg-blue-500/10 dark:bg-blue-950/30",
                    glow: "shadow-blue-500/20",
                    ring: "ring-blue-400",
                    tag: "bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300",
                    label: "Limpieza",
                  },
                }[mesa.estado];

                const isCircular = mesa.tipo === "redonda";

                return (
                  <motion.div
                    key={mesa.id}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => abrirDetalleMesa(mesa)}
                    className="relative flex flex-col items-center cursor-pointer select-none group"
                  >
                    {/* Rendered Physical Chairs around table */}
                    {renderChairs(mesa.capacidad, mesa.tipo)}

                    {/* Table Surface */}
                    <div
                      className={`relative w-24 h-24 flex flex-col items-center justify-center p-2 transition-all border-2 backdrop-blur-md shadow-lg ${
                        isCircular ? "rounded-full" : "rounded-2xl"
                      } ${statusStyles.border} ${statusStyles.bg} ${
                        isSelected
                          ? `ring-4 ${statusStyles.ring} shadow-xl scale-105`
                          : "hover:shadow-xl"
                      } ${tieneAlerta ? "ring-4 ring-red-500 animate-pulse bg-red-500/20" : ""}`}
                    >
                      {/* Mesa Number */}
                      <span className="font-serif font-black text-lg text-stone-900 dark:text-stone-50 leading-none">
                        M-{mesa.numero}
                      </span>

                      {/* Capacidad / Pax */}
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 font-semibold flex items-center gap-0.5 mt-0.5">
                        <Users size={10} /> {mesa.capacidad}
                      </span>

                      {/* Live Ticket Badge if occupied */}
                      {pedido ? (
                        <span className="mt-1 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-amber-900 text-amber-100 shadow-xs">
                          Bs {pedido.total.toFixed(0)}
                        </span>
                      ) : (
                        <span
                          className={`mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${statusStyles.tag}`}
                        >
                          {statusStyles.label}
                        </span>
                      )}

                      {/* Alert Icon */}
                      {tieneAlerta && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md animate-bounce text-[10px]">
                          <Bell size={11} />
                        </span>
                      )}
                    </div>

                    {/* Subtitle / Diners tag */}
                    <div className="mt-2 text-center">
                      <span className="text-[11px] font-medium text-stone-600 dark:text-stone-400 block group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">
                        {zonas.find((z) => z.id === mesa.zona_id)?.nombre || "Sala"}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── MODE 2: FAST CARDS GRID ── */}
        {modoVista === "tarjetas" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mesasFiltradas.map((mesa) => {
              const pedido = getPedidoActivo(mesa.numero);
              const tieneAlerta = alertasPendientes.some((a) => a.mesa_numero === mesa.numero);
              const isSelected = mesaSeleccionada?.id === mesa.id;

              return (
                <motion.div
                  key={mesa.id}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => abrirDetalleMesa(mesa)}
                  className={`p-4 rounded-3xl bg-white dark:bg-stone-800 border transition-all shadow-xs cursor-pointer flex flex-col justify-between h-44 ${
                    isSelected
                      ? "border-amber-600 ring-2 ring-amber-600/30 dark:ring-amber-500/40"
                      : "border-stone-200 dark:border-stone-700 hover:border-amber-300"
                  } ${tieneAlerta ? "ring-2 ring-red-500 bg-red-50/50 dark:bg-red-950/20" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-serif text-xl font-bold">Mesa {mesa.numero}</span>
                        {tieneAlerta && <Bell size={14} className="text-red-600 animate-bounce" />}
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 capitalize">
                        {zonas.find((z) => z.id === mesa.zona_id)?.nombre || "Sala"} • {mesa.tipo}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                        mesa.estado === "libre"
                          ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300"
                          : mesa.estado === "ocupada"
                          ? "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300"
                          : "bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300"
                      }`}
                    >
                      {mesa.estado}
                    </span>
                  </div>

                  {pedido ? (
                    <div className="p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 space-y-0.5">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
                        <span>Comanda activa:</span>
                        <span className="font-mono">Bs {pedido.total.toFixed(2)}</span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        {pedido.items?.length || 0} productos pedidos
                      </p>
                    </div>
                  ) : (
                    <div className="text-xs text-stone-400 italic">Mesa disponible para recibir comensales</div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-700/60 text-xs text-stone-500">
                    <span className="flex items-center gap-1">
                      <Users size={12} /> Cap. {mesa.capacidad}
                    </span>
                    <span className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1">
                      Gestionar <ChevronRight size={13} />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Apple Floating Quick Coffee Dock ── */}
      {mesaSeleccionada && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-6 inset-x-4 max-w-2xl mx-auto z-40 bg-stone-900/90 dark:bg-stone-950/95 backdrop-blur-2xl border border-white/15 p-3 rounded-3xl shadow-2xl flex items-center justify-between gap-3 text-white"
        >
          <div className="flex items-center gap-2 pl-2">
            <span className="p-2 rounded-2xl bg-amber-500 text-stone-950 font-bold">
              <Coffee size={18} />
            </span>
            <div className="leading-tight">
              <span className="font-serif font-bold text-sm block">
                Mesa {mesaSeleccionada.numero} — Ronda Express
              </span>
              <span className="text-[10px] text-stone-400">1-Tap para añadir directamente</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { name: "Café Pasado", short: "Pasado", price: 12 },
              { name: "Cortado Doble", short: "Cortado", price: 16 },
              { name: "Croissant", short: "Croissant", price: 18 },
              { name: "Cuñapé", short: "Cuñapé", price: 8 },
            ].map((express) => (
              <motion.button
                key={express.name}
                whileTap={{ scale: 0.92 }}
                onClick={() => agregarRondaExpress(express.name)}
                className="px-3 py-1.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition active:scale-95"
              >
                <span>+ {express.short}</span>
                <span className="text-[10px] text-amber-300 font-mono">Bs {express.price}</span>
              </motion.button>
            ))}

            <button
              onClick={() => setModalComandaAbierto(true)}
              className="p-2 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white shadow-md transition ml-1"
              title="Abrir menú completo"
            >
              <Plus size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Apple Spring Sheet: Detalle de Mesa ── */}
      <AnimatePresence>
        {mesaSeleccionada && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="w-full max-w-lg bg-white dark:bg-stone-900 h-full shadow-2xl flex flex-col border-l border-stone-200 dark:border-stone-800"
            >
              {/* Header Drawer */}
              <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-950">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-900 dark:bg-amber-700 text-white flex items-center justify-center font-serif text-2xl font-black shadow-md">
                    {mesaSeleccionada.numero}
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      Mesa {mesaSeleccionada.numero}
                      <span className="text-xs font-sans font-medium text-stone-500">
                        ({mesaSeleccionada.tipo})
                      </span>
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Capacidad: {mesaSeleccionada.capacidad} personas •{" "}
                      {zonas.find((z) => z.id === mesaSeleccionada.zona_id)?.nombre || "Sala"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setMesaSeleccionada(null)}
                  className="p-2.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500 transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Contenido Drawer */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Selector de Estado */}
                <div>
                  <label className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-2">
                    Estado Actual
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["libre", "ocupada", "reservada", "limpieza"] as EstadoMesa[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleCambiarEstadoMesa(st)}
                        className={`py-2.5 px-2 text-xs font-bold rounded-2xl capitalize transition-all ${
                          mesaSeleccionada.estado === st
                            ? "bg-amber-900 dark:bg-amber-600 text-white shadow-md scale-102"
                            : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pedido Activo */}
                {(() => {
                  const pedido = getPedidoActivo(mesaSeleccionada.numero);

                  if (!pedido) {
                    return (
                      <div className="p-8 text-center border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-3xl space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto">
                          <Utensils size={28} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-stone-800 dark:text-stone-200">
                            Mesa sin comanda activa
                          </p>
                          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto mt-1">
                            Abre una comanda para registrar productos y enviar comandas a Cocina y Vitrina.
                          </p>
                        </div>
                        <button
                          onClick={() => setModalComandaAbierto(true)}
                          className="px-5 py-2.5 rounded-2xl bg-amber-900 dark:bg-amber-700 text-white text-xs font-bold shadow-md hover:bg-amber-950 transition flex items-center gap-2 mx-auto active:scale-95"
                        >
                          <Plus size={16} /> Abrir Comanda
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                          Comanda Activa (#{pedido.id.substring(pedido.id.length - 4)})
                        </span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 uppercase font-mono">
                          {pedido.estado}
                        </span>
                      </div>

                      {/* Items List */}
                      <div className="divide-y divide-stone-100 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-3xl bg-stone-50/50 dark:bg-stone-950/40 p-3 max-h-72 overflow-y-auto">
                        {pedido.items?.map((it) => (
                          <div
                            key={it.id}
                            className="py-2.5 px-2 flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold text-stone-900 dark:text-stone-100">
                                {it.cantidad}x {it.producto_nombre}
                              </span>
                              {it.notas && (
                                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                                  Nota: {it.notas}
                                </p>
                              )}
                              <span className="text-[10px] text-stone-400 block capitalize">
                                Estación: {it.estacion} • Estado: {it.estado}
                              </span>
                            </div>
                            <span className="font-mono font-bold text-stone-800 dark:text-stone-200">
                              Bs {it.subtotal.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Total Box */}
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-100/70 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/50 text-amber-950 dark:text-amber-100 font-bold">
                        <span>Total Acumulado:</span>
                        <span className="text-xl font-serif font-black">
                          Bs {pedido.total.toFixed(2)}
                        </span>
                      </div>

                      {pedido.estado === "pendiente" && (
                        <button
                          onClick={() => verificarYMandarACocina(pedido.id, mesaSeleccionada.numero)}
                          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 active:scale-95 transition"
                        >
                          <CheckCircle2 size={16} />
                          <span>✅ Verificar Orden con Cliente y Mandar a Cocina 👨‍🍳</span>
                        </button>
                      )}

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                          onClick={() => setModalComandaAbierto(true)}
                          className="py-3 px-4 rounded-2xl bg-amber-900 dark:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-amber-950 shadow-md transition active:scale-95"
                        >
                          <Plus size={16} /> Agregar Ronda
                        </button>
                        <button
                          onClick={solicitarCuenta}
                          className="py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition active:scale-95"
                        >
                          <Receipt size={16} /> Pedir Cuenta
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal Comanda Completa ── */}
      <AnimatePresence>
        {modalComandaAbierto && mesaSeleccionada && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-3xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-stone-200 dark:border-stone-800"
            >
              {/* Header Modal */}
              <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-950">
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                    Comanda de Sala — Mesa {mesaSeleccionada.numero}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Selecciona productos para despachar a Cocina y Vitrina
                  </p>
                </div>
                <button
                  onClick={() => setModalComandaAbierto(false)}
                  className="p-2 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Categorías & Buscador */}
              <div className="p-4 border-b border-stone-100 dark:border-stone-800 space-y-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setFiltroCategoria("todas")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold ${
                      filtroCategoria === "todas"
                        ? "bg-amber-900 dark:bg-amber-700 text-white"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                    }`}
                  >
                    Todos
                  </button>
                  {categorias.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setFiltroCategoria(c.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 ${
                        filtroCategoria === c.id
                          ? "bg-amber-900 dark:bg-amber-700 text-white"
                          : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                      }`}
                    >
                      <span>{c.emoji}</span>
                      <span>{c.nombre}</span>
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search size={16} className="absolute left-3 top-3 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Buscar café de especialidad, marraqueta, tarta..."
                    value={busquedaProducto}
                    onChange={(e) => setBusquedaProducto(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800 dark:focus:ring-amber-500 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              {/* Split Content: Products Grid & Order Cart Summary */}
              <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200 dark:divide-stone-800">
                {/* Products Picker */}
                <div className="p-4 overflow-y-auto max-h-80 md:max-h-none space-y-2">
                  {productos
                    .filter((p) => {
                      const matchCat =
                        filtroCategoria === "todas" || p.categoria_id === filtroCategoria;
                      const matchSearch = p.nombre
                        .toLowerCase()
                        .includes(busquedaProducto.toLowerCase());
                      return matchCat && matchSearch && p.disponible;
                    })
                    .map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => agregarItemAComanda(prod)}
                        className="p-3 rounded-2xl border border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-800/80 hover:border-amber-400 dark:hover:border-amber-600 cursor-pointer flex items-center justify-between transition group shadow-2xs"
                      >
                        <div>
                          <div className="font-bold text-xs text-stone-900 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors">
                            {prod.nombre}
                          </div>
                          <span className="text-[10px] text-stone-400 capitalize">
                            {prod.estacion}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-amber-900 dark:text-amber-300">
                            Bs {prod.precio.toFixed(2)}
                          </span>
                          <span className="w-6 h-6 rounded-full bg-stone-100 dark:bg-stone-700 group-hover:bg-amber-900 group-hover:text-white flex items-center justify-center text-xs font-bold transition">
                            +
                          </span>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Current New Round Queue */}
                <div className="p-4 flex flex-col justify-between bg-stone-50/50 dark:bg-stone-950/40">
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider block">
                      Ronda a Despachar ({itemsNuevaComanda.length} ítems)
                    </span>

                    {itemsNuevaComanda.length === 0 ? (
                      <div className="py-12 text-center text-stone-400 text-xs italic">
                        Haz clic en productos a la izquierda para armar la comanda
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {itemsNuevaComanda.map((item, index) => (
                          <div
                            key={index}
                            className="p-2.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold text-stone-800 dark:text-stone-200">
                                {item.producto.nombre}
                              </span>
                              <div className="text-[10px] text-stone-400">
                                Bs {item.producto.precio.toFixed(2)} c/u
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setItemsNuevaComanda((prev) => {
                                    const copy = [...prev];
                                    if (copy[index].cantidad > 1) {
                                      copy[index].cantidad -= 1;
                                    } else {
                                      copy.splice(index, 1);
                                    }
                                    return copy;
                                  });
                                }}
                                className="w-6 h-6 rounded-lg bg-stone-100 dark:bg-stone-700 flex items-center justify-center font-bold text-xs"
                              >
                                -
                              </button>
                              <span className="font-mono font-bold w-4 text-center">
                                {item.cantidad}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setItemsNuevaComanda((prev) => {
                                    const copy = [...prev];
                                    copy[index].cantidad += 1;
                                    return copy;
                                  });
                                }}
                                className="w-6 h-6 rounded-lg bg-stone-100 dark:bg-stone-700 flex items-center justify-center font-bold text-xs"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-800 dark:text-stone-200">
                      <span>Total Ronda:</span>
                      <span className="font-serif text-base font-black text-amber-900 dark:text-amber-400">
                        Bs{" "}
                        {itemsNuevaComanda
                          .reduce((acc, it) => acc + it.producto.precio * it.cantidad, 0)
                          .toFixed(2)}
                      </span>
                    </div>

                    <button
                      disabled={itemsNuevaComanda.length === 0}
                      onClick={enviarComanda}
                      className="w-full py-3 rounded-2xl bg-amber-900 dark:bg-amber-600 hover:bg-amber-950 text-white font-bold text-xs shadow-md disabled:opacity-40 transition active:scale-95"
                    >
                      Enviar a Cocina / Vitrina
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal Ticket Cuenta Preview ── */}
      <AnimatePresence>
        {ticketCuentaModal && mesaSeleccionada && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4"
            >
              <div className="text-center pb-3 border-b border-stone-200 dark:border-stone-800">
                <span className="font-serif text-2xl font-black text-amber-950 dark:text-amber-400">
                  Dencker Pan
                </span>
                <p className="text-xs text-stone-500">Cafetería & Panadería de Autor</p>
                <div className="mt-2 text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 py-1 px-3 rounded-full inline-block">
                  Cuenta Mesa {mesaSeleccionada.numero}
                </div>
              </div>

              {(() => {
                const pedido = getPedidoActivo(mesaSeleccionada.numero);
                if (!pedido) return null;

                return (
                  <div className="space-y-2 text-xs">
                    <div className="divide-y divide-stone-100 dark:divide-stone-800 max-h-48 overflow-y-auto">
                      {pedido.items?.map((it) => (
                        <div key={it.id} className="py-1.5 flex justify-between">
                          <span>
                            {it.cantidad}x {it.producto_nombre}
                          </span>
                          <span className="font-mono font-bold">Bs {it.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t-2 border-dashed border-stone-300 dark:border-stone-700 flex justify-between text-base font-serif font-black text-amber-950 dark:text-amber-200">
                      <span>Total a Pagar:</span>
                      <span>Bs {pedido.total.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="pt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTicketCuentaModal(false)}
                  className="py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    soundManager.playSuccessTone();
                    setTicketCuentaModal(false);
                  }}
                  className="py-2.5 rounded-xl bg-amber-900 dark:bg-amber-600 text-white text-xs font-bold hover:bg-amber-950 transition flex items-center justify-center gap-1.5"
                >
                  <Printer size={14} /> Imprimir Pre-cuenta
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </StaffAuthGuard>
  );
}

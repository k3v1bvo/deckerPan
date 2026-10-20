"use client";
import { useState, useMemo } from "react";
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
} from "lucide-react";
import { useSystemStore } from "@/store";
import { Mesa, EstadoMesa, Producto, ItemPedido } from "@/types";
import { soundManager } from "@/lib/sound";

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
    addItemToPedido,
    addAlerta,
    marcarAlertaAtendida,
  } = useSystemStore();

  const [zonaSeleccionada, setZonaSeleccionada] = useState<string>("todas");
  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null);
  const [modalComandaAbierto, setModalComandaAbierto] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [itemsNuevaComanda, setItemsNuevaComanda] = useState<{
    producto: Producto;
    cantidad: number;
    notas?: string;
  }[]>([]);

  // Alertas activas
  const alertasPendientes = alertas.filter((a) => !a.atendida);

  // Mesas filtradas por zona
  const mesasFiltradas = useMemo(() => {
    if (zonaSeleccionada === "todas") return mesas;
    return mesas.filter((m) => m.zona_id === zonaSeleccionada);
  }, [mesas, zonaSeleccionada]);

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
  };

  const handleCambiarEstadoMesa = (nuevoEstado: EstadoMesa) => {
    if (!mesaSeleccionada) return;
    setEstadoMesa(mesaSeleccionada.id, nuevoEstado);
    setMesaSeleccionada({ ...mesaSeleccionada, estado: nuevoEstado });
    soundManager.playSuccessTone();
  };

  const agregarItemAComanda = (prod: Producto) => {
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

  const enviarComanda = () => {
    if (!mesaSeleccionada || itemsNuevaComanda.length === 0) return;

    const pedidoActivo = getPedidoActivo(mesaSeleccionada.numero);

    if (pedidoActivo) {
      // Agregar como ronda a pedido existente
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
      // Crear nuevo pedido
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
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24 text-amber-950">
      {/* Header Mesero */}
      <div className="bg-gradient-to-r from-amber-900 to-amber-950 text-white px-4 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold flex items-center gap-2">
              <span>👔</span> Sala & Comandas
            </h1>
            <p className="text-amber-200/80 text-xs">
              Control de mesas, rondas rápidas y atención en tiempo real
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {contadores.libres} Libres
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {contadores.ocupadas} Ocupadas
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center gap-1.5 font-medium">
              {contadores.reservadas} Reservadas
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Alertas Bar */}
        {alertasPendientes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-red-50 border border-red-200 shadow-sm space-y-2"
          >
            <div className="flex items-center gap-2 text-red-800 font-semibold text-sm">
              <Bell className="animate-bounce text-red-600" size={18} />
              <span>Alertas activas de sala ({alertasPendientes.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {alertasPendientes.map((alerta) => (
                <div
                  key={alerta.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-red-100 shadow-xs"
                >
                  <div className="text-xs">
                    <span className="font-bold text-red-700">Mesa {alerta.mesa_numero}</span>
                    <p className="text-stone-600">{alerta.mensaje}</p>
                  </div>
                  <button
                    onClick={() => {
                      marcarAlertaAtendida(alerta.id);
                      soundManager.playSuccessTone();
                    }}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    Atender
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Zona Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setZonaSeleccionada("todas")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              zonaSeleccionada === "todas"
                ? "bg-amber-900 text-white shadow-sm"
                : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
            }`}
          >
            Todas las Zonas ({mesas.length})
          </button>
          {zonas.map((z) => {
            const count = mesas.filter((m) => m.zona_id === z.id).length;
            return (
              <button
                key={z.id}
                onClick={() => setZonaSeleccionada(z.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  zonaSeleccionada === z.id
                    ? "bg-amber-900 text-white shadow-sm"
                    : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
                }`}
              >
                {z.nombre} ({count})
              </button>
            );
          })}
        </div>

        {/* Floor Plan / Mesas Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {mesasFiltradas.map((mesa) => {
            const pedido = getPedidoActivo(mesa.numero);
            const tieneAlerta = alertasPendientes.some((a) => a.mesa_numero === mesa.numero);

            const estadoConfig = {
              libre: {
                bg: "bg-emerald-50/80 hover:bg-emerald-100/80 border-emerald-300",
                badge: "bg-emerald-100 text-emerald-800",
                text: "Libre",
              },
              ocupada: {
                bg: "bg-amber-50/80 hover:bg-amber-100/80 border-amber-300",
                badge: "bg-amber-100 text-amber-800",
                text: "Ocupada",
              },
              reservada: {
                bg: "bg-purple-50/80 hover:bg-purple-100/80 border-purple-300",
                badge: "bg-purple-100 text-purple-800",
                text: "Reservada",
              },
              limpieza: {
                bg: "bg-blue-50/80 hover:bg-blue-100/80 border-blue-300",
                badge: "bg-blue-100 text-blue-800",
                text: "Limpieza",
              },
            }[mesa.estado];

            return (
              <motion.div
                key={mesa.id}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => abrirDetalleMesa(mesa)}
                className={`cursor-pointer rounded-2xl p-4 border transition-all shadow-xs relative flex flex-col justify-between h-40 ${
                  tieneAlerta ? "ring-2 ring-red-500 animate-pulse bg-red-50/60" : estadoConfig.bg
                }`}
              >
                {/* Header Mesa */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif text-lg font-bold">Mesa {mesa.numero}</span>
                    {tieneAlerta && (
                      <Bell size={14} className="text-red-600 animate-bounce" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${estadoConfig.badge}`}
                  >
                    {estadoConfig.text}
                  </span>
                </div>

                {/* Info Centro */}
                <div className="space-y-1 my-2">
                  <div className="flex items-center gap-1.5 text-xs text-stone-600">
                    <Users size={12} />
                    <span>Cap. {mesa.capacidad} personas</span>
                  </div>

                  {pedido && (
                    <div className="text-xs space-y-0.5">
                      <div className="font-semibold text-amber-900 flex items-center justify-between">
                        <span>Total:</span>
                        <span>Bs {pedido.total.toFixed(2)}</span>
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {pedido.items?.length || 0} productos
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Mesa */}
                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-stone-200/50 text-stone-500">
                  <span className="capitalize">{mesa.tipo}</span>
                  <span className="font-medium text-amber-800">Ver mesa →</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Drawer Detalle Mesa */}
      <AnimatePresence>
        {mesaSeleccionada && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
            >
              {/* Header Drawer */}
              <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                <div>
                  <h2 className="font-serif text-xl font-bold text-amber-950">
                    Mesa {mesaSeleccionada.numero}
                  </h2>
                  <p className="text-xs text-stone-500">
                    Capacidad: {mesaSeleccionada.capacidad} | Zona:{" "}
                    {zonas.find((z) => z.id === mesaSeleccionada.zona_id)?.nombre || "Principal"}
                  </p>
                </div>
                <button
                  onClick={() => setMesaSeleccionada(null)}
                  className="p-2 rounded-full hover:bg-stone-200 text-stone-500 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Contenido Drawer */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* Cambiar Estado */}
                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">
                    Estado de la Mesa
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["libre", "ocupada", "reservada", "limpieza"] as EstadoMesa[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleCambiarEstadoMesa(st)}
                        className={`py-2 px-1 text-xs font-semibold rounded-xl capitalize transition ${
                          mesaSeleccionada.estado === st
                            ? "bg-amber-900 text-white shadow-sm"
                            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
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
                      <div className="p-6 text-center border-2 border-dashed border-stone-200 rounded-2xl space-y-3">
                        <Utensils className="mx-auto text-stone-400" size={32} />
                        <div>
                          <p className="text-sm font-semibold text-stone-700">Mesa sin comanda activa</p>
                          <p className="text-xs text-stone-500">
                            Abre una comanda para registrar productos inmediatamente
                          </p>
                        </div>
                        <button
                          onClick={() => setModalComandaAbierto(true)}
                          className="px-4 py-2 rounded-xl bg-amber-800 text-white text-xs font-semibold shadow-sm hover:bg-amber-900 transition flex items-center gap-1.5 mx-auto"
                        >
                          <Plus size={14} /> Tomar Comanda
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                          Comanda Activa (#{pedido.id.substring(pedido.id.length - 4)})
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">
                          {pedido.estado}
                        </span>
                      </div>

                      {/* Lista de Items */}
                      <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl bg-stone-50/50 p-2 max-h-56 overflow-y-auto">
                        {pedido.items?.map((it) => (
                          <div key={it.id} className="py-2 px-1 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-semibold text-stone-800">
                                {it.cantidad}x {it.producto_nombre}
                              </span>
                              {it.chips_seleccionados?.length > 0 && (
                                <p className="text-[11px] text-amber-700">
                                  {it.chips_seleccionados.join(", ")}
                                </p>
                              )}
                              <span className="text-[10px] text-stone-400 capitalize">
                                Estación: {it.estacion} | {it.estado}
                              </span>
                            </div>
                            <span className="font-bold text-stone-700">
                              Bs {it.subtotal.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-amber-100/70 border border-amber-200 text-amber-950 font-bold">
                        <span>Total de la Mesa:</span>
                        <span className="text-base font-serif">Bs {pedido.total.toFixed(2)}</span>
                      </div>

                      {/* Acciones Rápidas */}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <button
                          onClick={() => setModalComandaAbierto(true)}
                          className="py-2.5 px-3 rounded-xl bg-amber-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-amber-900 transition"
                        >
                          <Plus size={14} /> Agregar Ronda
                        </button>
                        <button
                          onClick={solicitarCuenta}
                          className="py-2.5 px-3 rounded-xl bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-emerald-800 transition"
                        >
                          <Receipt size={14} /> Pedir Cuenta
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

      {/* Modal Tomar Comanda / Ronda Rápida */}
      <AnimatePresence>
        {modalComandaAbierto && mesaSeleccionada && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header Modal */}
              <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                <div>
                  <h3 className="font-serif font-bold text-lg text-amber-950">
                    Comanda Rápida — Mesa {mesaSeleccionada.numero}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Selecciona productos para enviar directamente a Cocina y Vitrina
                  </p>
                </div>
                <button
                  onClick={() => setModalComandaAbierto(false)}
                  className="p-2 rounded-full hover:bg-stone-200 text-stone-500"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Categorías & Buscador */}
              <div className="p-3 border-b border-stone-100 space-y-2">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setFiltroCategoria("todas")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                      filtroCategoria === "todas"
                        ? "bg-amber-900 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    Todos
                  </button>
                  {categorias.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setFiltroCategoria(c.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1 ${
                        filtroCategoria === c.id
                          ? "bg-amber-900 text-white"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      <span>{c.emoji}</span>
                      <span>{c.nombre}</span>
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Buscar café, pan, sandwich..."
                    value={busquedaProducto}
                    onChange={(e) => setBusquedaProducto(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-800"
                  />
                </div>
              </div>

              {/* Contenido: Grid Productos y Resumen */}
              <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200">
                {/* Lista de productos para agregar */}
                <div className="p-3 overflow-y-auto max-h-80 md:max-h-none space-y-2">
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
                        className="p-2.5 rounded-xl border border-stone-100 bg-white hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer flex items-center justify-between transition group"
                      >
                        <div>
                          <p className="text-xs font-semibold text-stone-800 group-hover:text-amber-900">
                            {prod.nombre}
                          </p>
                          <span className="text-[10px] text-stone-400 capitalize">
                            {prod.estacion}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-950">
                            Bs {prod.precio.toFixed(2)}
                          </span>
                          <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-xs group-hover:bg-amber-800 group-hover:text-white transition">
                            +
                          </span>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Resumen comanda a enviar */}
                <div className="p-4 flex flex-col justify-between bg-stone-50/50">
                  <div className="space-y-3 overflow-y-auto max-h-56">
                    <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                      Items a Enviar ({itemsNuevaComanda.reduce((acc, i) => acc + i.cantidad, 0)})
                    </h4>

                    {itemsNuevaComanda.length === 0 ? (
                      <p className="text-xs text-stone-400 italic">
                        Haz clic en productos a la izquierda para agregarlos a la comanda.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {itemsNuevaComanda.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-2 bg-white rounded-xl border border-stone-200 text-xs flex items-center justify-between"
                          >
                            <div>
                              <span className="font-semibold text-stone-800">
                                {item.cantidad}x {item.producto.nombre}
                              </span>
                              <p className="text-[10px] text-stone-500">
                                Bs {(item.producto.precio * item.cantidad).toFixed(2)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setItemsNuevaComanda((prev) =>
                                    prev
                                      .map((it, i) =>
                                        i === idx ? { ...it, cantidad: it.cantidad - 1 } : it
                                      )
                                      .filter((it) => it.cantidad > 0)
                                  );
                                }}
                                className="w-5 h-5 rounded bg-stone-100 text-stone-600 flex items-center justify-center font-bold"
                              >
                                -
                              </button>
                              <span className="font-bold text-xs">{item.cantidad}</span>
                              <button
                                onClick={() => {
                                  setItemsNuevaComanda((prev) =>
                                    prev.map((it, i) =>
                                      i === idx ? { ...it, cantidad: it.cantidad + 1 } : it
                                    )
                                  );
                                }}
                                className="w-5 h-5 rounded bg-amber-100 text-amber-800 flex items-center justify-center font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Modal Acciones */}
                  <div className="pt-3 border-t border-stone-200 space-y-2">
                    <div className="flex justify-between text-sm font-bold text-amber-950">
                      <span>Total Ronda:</span>
                      <span>
                        Bs{" "}
                        {itemsNuevaComanda
                          .reduce((acc, i) => acc + i.producto.precio * i.cantidad, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                    <button
                      disabled={itemsNuevaComanda.length === 0}
                      onClick={enviarComanda}
                      className="w-full py-2.5 rounded-xl bg-amber-800 text-white font-semibold text-xs shadow-md hover:bg-amber-900 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Utensils size={14} /> Mandar a Cocina / KDS
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

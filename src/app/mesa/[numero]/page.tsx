"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Bell,
  Search,
  ChevronDown,
  X,
  Plus,
  Minus,
  Check,
  ArrowLeft,
  Clock,
  Sparkles,
  CreditCard,
  Coffee,
  CheckCircle2,
  ChevronRight,
  Flame,
} from "lucide-react";
import { Producto, Categoria, CartItem, ItemPedido } from "@/types";
import { useCartStore, useUIStore } from "@/store";
import { SEED_CATEGORIAS, SEED_PRODUCTOS } from "@/lib/seed-data";
import { supabase } from "@/lib/supabase";
import { soundManager } from "@/lib/sound";

interface PageProps {
  params: Promise<{ numero: string }>;
}

type EstadoPedido = "pendiente" | "en_preparacion" | "listo" | "entregado" | "pagado";

const ESTADO_LABELS: Record<EstadoPedido, { label: string; step: number; color: string; desc: string }> = {
  pendiente: {
    label: "Esperando al Mesero 📋",
    step: 1,
    color: "text-amber-600 bg-amber-500/15 border-amber-500/30",
    desc: "Tu orden fue enviada desde la mesa. El mesero se acercará para verificar tu pedido y mandarlo a cocina.",
  },
  en_preparacion: {
    label: "¡Verificado! En Cocina 👨‍🍳",
    step: 2,
    color: "text-blue-600 bg-blue-500/15 border-blue-500/30",
    desc: "El mesero confirmó tu comanda y nuestro barista y panaderos la están preparando ahora mismo.",
  },
  listo: {
    label: "¡Listo para servir! 🥐",
    step: 3,
    color: "text-emerald-600 bg-emerald-500/15 border-emerald-500/30",
    desc: "Tu orden está saliendo de la barra directo a tu mesa.",
  },
  entregado: {
    label: "En mesa 🎉",
    step: 4,
    color: "text-emerald-700 bg-emerald-100 border-emerald-300",
    desc: "¡Buen provecho! Disfruta la experiencia Dencker Pan.",
  },
  pagado: {
    label: "Cuenta Pagada ✓",
    step: 5,
    color: "text-stone-700 bg-stone-200 border-stone-300",
    desc: "Gracias por tu visita. Esperamos verte muy pronto.",
  },
};

export default function MesaPage({ params }: PageProps) {
  const [numero, setNumero] = useState<string>("1");
  const [categorias, setCategorias] = useState<Categoria[]>(SEED_CATEGORIAS);
  const [productos, setProductos] = useState<Producto[]>(SEED_PRODUCTOS);
  const [categoriaActiva, setCategoriaActiva] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [mesaId, setMesaId] = useState<string | null>(null);
  const [pedidoEstado, setPedidoEstado] = useState<EstadoPedido | null>(null);
  const [pedidoItems, setPedidoItems] = useState<ItemPedido[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [llamandoMesero, setLlamandoMesero] = useState(false);
  const [productoModal, setProductoModal] = useState<Producto | null>(null);
  const [chipsSeleccionados, setChipsSeleccionados] = useState<string[]>([]);
  const [notaProducto, setNotaProducto] = useState("");
  const [showPayment, setShowPayment] = useState(false);

  const {
    items,
    addItem,
    removeItem,
    updateCantidad,
    clearCart,
    setMesa,
    setPedidoId,
    total,
    count,
    pedidoId,
  } = useCartStore();
  const { cartOpen, setCartOpen } = useUIStore();

  useEffect(() => {
    params.then((p) => {
      setNumero(p.numero);
      setMesa(parseInt(p.numero) || 1);
    });
  }, [params, setMesa]);

  useEffect(() => {
    async function load() {
      if (!supabase) return;
      const { data: cats } = await supabase
        .from("categorias")
        .select("*")
        .eq("activa", true)
        .order("orden");
      if (cats?.length) setCategorias(cats);

      const { data: prods } = await supabase
        .from("productos")
        .select("*, categoria:categorias(*)")
        .eq("disponible", true)
        .order("nombre");
      if (prods?.length) setProductos(prods);

      const { data: mesa } = await supabase
        .from("mesas")
        .select("id")
        .eq("numero", parseInt(numero))
        .single();
      if (mesa) setMesaId(mesa.id);
    }
    load();
  }, [numero]);

  // Realtime order tracker
  useEffect(() => {
    const client = supabase;
    if (!pedidoId || !client) return;
    const channel = client
      .channel(`pedido-${pedidoId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "pedidos", filter: `id=eq.${pedidoId}` },
        (p) => setPedidoEstado(p.new.estado as EstadoPedido)
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "items_pedido",
          filter: `pedido_id=eq.${pedidoId}`,
        },
        async () => {
          const { data } = await client.from("items_pedido").select("*").eq("pedido_id", pedidoId);
          if (data) setPedidoItems(data);
        }
      )
      .subscribe();
    return () => {
      client.removeChannel(channel);
    };
  }, [pedidoId]);

  const productosFiltrados = useCallback(() => {
    let lista = productos;
    if (categoriaActiva === "mas_vendidos") lista = lista.filter((p) => p.es_mas_vendido);
    else if (categoriaActiva !== "todos")
      lista = lista.filter((p) => p.categoria_id === categoriaActiva);
    if (busqueda)
      lista = lista.filter((p) => p.nombre.toLowerCase().includes(busqueda.toLowerCase()));
    return lista;
  }, [productos, categoriaActiva, busqueda]);

  // Upselling: si hay panes en el carrito, sugerir café
  const tieneProductosDePan = items.some((i) =>
    ["c3", "c4", "c5"].includes(i.producto.categoria_id || "")
  );
  const tieneCafe = items.some((i) => ["c1", "c2"].includes(i.producto.categoria_id || ""));
  const mostrarUpsell = tieneProductosDePan && !tieneCafe && items.length > 0;

  const isUUID = (str?: string | null) =>
    Boolean(
      str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
    );

  const llamarMesero = async () => {
    setLlamandoMesero(true);
    soundManager.playWaiterBell();
    const mesaNum = parseInt(numero) || 1;
    try {
      const { useSystemStore } = await import("@/store");
      useSystemStore.getState().addAlerta({
        mesa_numero: mesaNum,
        tipo: "llamado",
        mensaje: `Mesa ${mesaNum} solicita atención del personal`,
        datos_extra: {},
      });

      if (supabase) {
        await supabase.from("alertas_mesero").insert({
          mesa_id: isUUID(mesaId) ? mesaId : null,
          mesa_numero: mesaNum,
          tipo: "llamado",
          mensaje: `Mesa ${mesaNum} solicita atención del personal`,
        });
      }
      setTimeout(() => setLlamandoMesero(false), 3500);
    } catch {
      setLlamandoMesero(false);
    }
  };

  const confirmarPedido = async () => {
    if (!items.length) return;
    setSubmitting(true);
    soundManager.playOrderChime();
    const mesaNum = parseInt(numero) || 1;
    try {
      let newPedidoId = pedidoId;

      if (supabase) {
        const pedidoPayload = {
          mesa_id: isUUID(mesaId) ? mesaId : null,
          mesa_numero: mesaNum,
          estado: "pendiente",
          total: total(),
        };
        if (!newPedidoId) {
          const { data: pedido } = await supabase
            .from("pedidos")
            .insert(pedidoPayload)
            .select()
            .single();
          newPedidoId = pedido?.id;
          if (newPedidoId) setPedidoId(newPedidoId);
        }
        if (newPedidoId) {
          const itemsPayload = items.map((i) => ({
            pedido_id: newPedidoId,
            producto_id: isUUID(i.producto.id) ? i.producto.id : null,
            producto_nombre: i.producto.nombre,
            cantidad: i.cantidad,
            precio_unitario: i.producto.precio,
            subtotal: i.cantidad * i.producto.precio,
            chips_seleccionados: i.chips_seleccionados,
            notas: i.notas,
            estacion: i.producto.estacion,
            estado: "pendiente",
          }));
          await supabase.from("items_pedido").insert(itemsPayload);
          if (isUUID(mesaId)) {
            await supabase.from("mesas").update({ estado: "ocupada" }).eq("id", mesaId);
          }
          setPedidoEstado("pendiente");
        }
      }

      // Sincronizar en Store local
      const { useSystemStore } = await import("@/store");
      useSystemStore.getState().addPedido({
        mesa_numero: mesaNum,
        estado: "pendiente",
        total: total(),
        cliente_nombre: `Mesa ${mesaNum}`,
        es_ronda: false,
        items: items.map((i, idx) => ({
          id: `item-${Date.now()}-${idx}`,
          pedido_id: newPedidoId || `ped-${Date.now()}`,
          producto_id: i.producto.id,
          producto_nombre: i.producto.nombre,
          cantidad: i.cantidad,
          precio_unitario: i.producto.precio,
          subtotal: i.cantidad * i.producto.precio,
          chips_seleccionados: i.chips_seleccionados,
          notas: i.notas,
          estacion: i.producto.estacion,
          estado: "pendiente",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })),
      });

      // Emitir alerta inmediata de alta prioridad al mesero de turno
      useSystemStore.getState().addAlerta({
        mesa_numero: mesaNum,
        tipo: "llamado",
        mensaje: `🔔 Nuevo pedido QR de Mesa ${mesaNum} (${items.length} productos, Bs ${total().toFixed(2)}) — Acercarse a verificar y mandar a cocina`,
        datos_extra: { pedidoId: newPedidoId || `ped-${Date.now()}`, tipo: "pedido_qr" },
      });

      if (!newPedidoId) {
        setPedidoId(`PED-${Date.now()}`);
        setPedidoEstado("pendiente");
      }

      clearCart();
      setCartOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const abrirModal = (producto: Producto) => {
    soundManager.playClick();
    setProductoModal(producto);
    setChipsSeleccionados([]);
    setNotaProducto("");
  };

  const agregarAlCarrito = () => {
    if (!productoModal) return;
    soundManager.playSuccessTone();
    addItem(productoModal, chipsSeleccionados, notaProducto || undefined);
    setProductoModal(null);
  };

  const itemEnCarrito = (id: string) => items.find((i) => i.producto.id === id);

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0c0a09] text-stone-900 dark:text-stone-100 pb-36 font-sans">
      {/* ── Header Flotante Apple Glass ── */}
      <header className="sticky top-0 z-30 bg-[#281810]/95 backdrop-blur-2xl border-b border-white/10 text-white px-4 py-3 shadow-xl">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 p-1 border border-amber-500/30 flex items-center justify-center shrink-0">
              <img
                src="/img/logo/logo.png"
                alt="Dencker Pan"
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <div>
              <div className="font-serif font-bold text-base text-white leading-tight">
                Dencker Pan
              </div>
              <div className="text-[11px] text-amber-200/80 font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Mesa {numero} • Menú Digital
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={llamarMesero}
              className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                llamandoMesero
                  ? "bg-emerald-600 border-emerald-400 text-white animate-pulse"
                  : "bg-white/10 hover:bg-white/20 border-white/15 text-stone-200"
              }`}
            >
              <Bell size={14} className={llamandoMesero ? "animate-bounce" : ""} />
              <span>{llamandoMesero ? "Llamando..." : "Mesero"}</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                soundManager.playClick();
                setCartOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-black shadow-md flex items-center gap-1.5 relative active:scale-95 transition"
            >
              <ShoppingCart size={14} />
              <span>{count()}</span>
            </motion.button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* ── Live Order Tracker (Card Apple Pro) ── */}
        <AnimatePresence>
          {pedidoEstado && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                  <Clock size={16} className="text-amber-600" />
                  <span>Seguimiento de tu Pedido</span>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${ESTADO_LABELS[pedidoEstado].color}`}
                >
                  {ESTADO_LABELS[pedidoEstado].label}
                </span>
              </div>

              <p className="text-xs text-stone-500 dark:text-stone-400">
                {ESTADO_LABELS[pedidoEstado].desc}
              </p>

              {/* Steps Progress Indicator */}
              <div className="grid grid-cols-4 gap-1 pt-1">
                {[1, 2, 3, 4].map((step) => {
                  const currentStep = ESTADO_LABELS[pedidoEstado].step;
                  const isDone = currentStep >= step;
                  return (
                    <div
                      key={step}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        isDone ? "bg-amber-600" : "bg-stone-200 dark:bg-stone-800"
                      }`}
                    />
                  );
                })}
              </div>

              {pedidoEstado !== "pagado" && (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setCartOpen(true)}
                    className="flex-1 py-2 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-bold hover:bg-stone-200 transition"
                  >
                    + Pedir otra ronda
                  </button>
                  <button
                    onClick={() => setShowPayment(true)}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-sm"
                  >
                    💳 Pagar Cuenta
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Search Bar ── */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-3 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar en el menú artesanal (café, croissant, sándwich)..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-amber-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
          />
        </div>

        {/* ── Categorías (Horizontal Scroll Pill bar) ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "todos", nombre: "Todos", emoji: "🍽️" },
            { id: "mas_vendidos", nombre: "Top Favoritos", emoji: "⭐" },
            ...categorias,
          ].map((cat) => {
            const isActive = categoriaActiva === cat.id;
            return (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => {
                  soundManager.playClick();
                  setCategoriaActiva(cat.id);
                }}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-amber-900 dark:bg-amber-600 text-white shadow-md shadow-amber-950/20"
                    : "bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700 hover:bg-stone-100"
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.nombre}</span>
              </motion.button>
            );
          })}
        </div>

        {/* ── Upsell Coffee Banner ── */}
        <AnimatePresence>
          {mostrarUpsell && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3.5 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-2xl bg-amber-500 text-stone-950">
                  <Coffee size={18} />
                </span>
                <div>
                  <div className="font-bold text-xs text-amber-900 dark:text-amber-200">
                    ¿Acompañas con café de especialidad?
                  </div>
                  <div className="text-[11px] text-amber-800/80 dark:text-amber-300/70">
                    Nuestros granos de Caranavi combinan perfecto con tus panes
                  </div>
                </div>
              </div>
              <button
                onClick={() => setCategoriaActiva("c1")}
                className="px-3 py-1.5 rounded-xl bg-amber-800 text-white text-xs font-bold hover:bg-amber-900 whitespace-nowrap"
              >
                Ver Cafés
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Products Grid ── */}
        <div className="grid grid-cols-2 gap-3">
          {productosFiltrados().map((prod) => {
            const enCarrito = itemEnCarrito(prod.id);

            return (
              <motion.div
                key={prod.id}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => abrirModal(prod)}
                className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-3 shadow-xs hover:border-amber-300 dark:hover:border-amber-700 cursor-pointer flex flex-col justify-between transition-all select-none"
              >
                <div>
                  {/* Image / Emoji Showcase */}
                  <div className="h-28 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200/50 dark:from-stone-800 dark:to-stone-850 flex items-center justify-center text-4xl relative overflow-hidden mb-2.5">
                    {prod.imagen_url ? (
                      <img
                        src={prod.imagen_url}
                        alt={prod.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      categorias.find((c) => c.id === prod.categoria_id)?.emoji || "🥐"
                    )}

                    {prod.es_mas_vendido && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-900/90 text-amber-100 font-bold text-[9px] uppercase tracking-wider backdrop-blur-xs">
                        Top
                      </span>
                    )}

                    {enCarrito && (
                      <span className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-amber-600 text-white font-mono font-bold text-xs flex items-center justify-center shadow-md">
                        {enCarrito.cantidad}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 line-clamp-1 leading-snug">
                    {prod.nombre}
                  </h3>

                  {prod.descripcion && (
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 mt-0.5 leading-relaxed">
                      {prod.descripcion}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 mt-2 border-t border-stone-100 dark:border-stone-800/60">
                  <span className="font-mono font-bold text-sm text-amber-900 dark:text-amber-400">
                    Bs {prod.precio.toFixed(2)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      abrirModal(prod);
                    }}
                    className="w-7 h-7 rounded-xl bg-amber-900 dark:bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-xs hover:bg-amber-950 transition active:scale-90"
                  >
                    +
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {productosFiltrados().length === 0 && (
          <div className="py-20 text-center space-y-2">
            <div className="text-4xl">🔍</div>
            <p className="font-bold text-sm text-stone-600 dark:text-stone-300">
              No encontramos resultados para tu búsqueda
            </p>
            <p className="text-xs text-stone-400">Prueba con palabras como café, pan o tarta</p>
          </div>
        )}
      </div>

      {/* ── Apple Dynamic Island Bottom Cart Pill ── */}
      <AnimatePresence>
        {count() > 0 && !cartOpen && (
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="fixed bottom-6 inset-x-4 max-w-sm mx-auto z-40"
          >
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                soundManager.playClick();
                setCartOpen(true);
              }}
              className="w-full bg-stone-900/95 dark:bg-stone-950/95 backdrop-blur-2xl border border-white/20 p-3.5 rounded-full shadow-2xl flex items-center justify-between text-white group"
            >
              <div className="flex items-center gap-3 pl-1">
                <span className="w-8 h-8 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-xs shadow-md">
                  {count()}
                </span>
                <span className="font-bold text-xs tracking-wide">Ver Mi Pedido</span>
              </div>

              <div className="flex items-center gap-2 pr-1">
                <span className="font-mono font-bold text-sm text-amber-300">
                  Bs {total().toFixed(2)}
                </span>
                <span className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center text-xs transition">
                  <ChevronRight size={14} />
                </span>
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal Customización de Producto ── */}
      <AnimatePresence>
        {productoModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-t-3xl p-6 shadow-2xl border-t border-stone-200 dark:border-stone-800 max-h-[85vh] overflow-y-auto space-y-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                    {productoModal.nombre}
                  </h3>
                  <span className="font-mono font-bold text-base text-amber-900 dark:text-amber-400">
                    Bs {productoModal.precio.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() => setProductoModal(null)}
                  className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500"
                >
                  <X size={20} />
                </button>
              </div>

              {productoModal.descripcion && (
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  {productoModal.descripcion}
                </p>
              )}

              {/* Chips de Personalización */}
              {productoModal.chips_personalizacion &&
                productoModal.chips_personalizacion.length > 0 && (
                  <div>
                    <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-2">
                      Personalización rápida
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {productoModal.chips_personalizacion.map((chip) => {
                        const isSelected = chipsSeleccionados.includes(chip);
                        return (
                          <button
                            key={chip}
                            onClick={() => {
                              soundManager.playClick();
                              setChipsSeleccionados((prev) =>
                                isSelected ? prev.filter((c) => c !== chip) : [...prev, chip]
                              );
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-amber-900 dark:bg-amber-600 text-white shadow-xs"
                                : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200"
                            }`}
                          >
                            {isSelected && <Check size={12} />}
                            <span>{chip}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Notas especiales */}
              <div>
                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
                  Instrucciones para Cocina / Barista
                </label>
                <textarea
                  value={notaProducto}
                  onChange={(e) => setNotaProducto(e.target.value)}
                  placeholder="Ej. Muy caliente, sin azúcar, por favor..."
                  className="w-full p-3 text-xs rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800 text-stone-900 dark:text-stone-100 resize-none h-20"
                />
              </div>

              <button
                onClick={agregarAlCarrito}
                className="w-full py-3.5 rounded-2xl bg-amber-900 dark:bg-amber-600 hover:bg-amber-950 text-white font-bold text-xs shadow-lg transition active:scale-98 flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Agregar al Pedido • Bs {productoModal.precio.toFixed(2)}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Drawer Carrito Completo ── */}
      <AnimatePresence>
        {cartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="w-full max-w-md bg-white dark:bg-stone-900 h-full shadow-2xl flex flex-col border-l border-stone-200 dark:border-stone-800"
            >
              {/* Header Carrito */}
              <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-950">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                    Tu Pedido — Mesa {numero}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                    {count()}
                  </span>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="p-2 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {items.length === 0 ? (
                  <div className="py-24 text-center space-y-3">
                    <div className="text-5xl">🛒</div>
                    <p className="font-bold text-stone-700 dark:text-stone-300 text-sm">
                      Tu pedido está vacío
                    </p>
                    <p className="text-xs text-stone-400">
                      Selecciona productos de nuestro menú artesanal
                    </p>
                  </div>
                ) : (
                  items.map((it, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between text-xs"
                    >
                      <div className="flex-1 pr-2">
                        <div className="font-bold text-stone-900 dark:text-stone-100">
                          {it.producto.nombre}
                        </div>
                        {it.chips_seleccionados.length > 0 && (
                          <div className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
                            {it.chips_seleccionados.join(", ")}
                          </div>
                        )}
                        {it.notas && (
                          <p className="text-[10px] text-stone-400 italic">"{it.notas}"</p>
                        )}
                        <span className="font-mono font-bold text-amber-900 dark:text-amber-400">
                          Bs {(it.producto.precio * it.cantidad).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCantidad(it.producto.id, it.cantidad - 1)}
                          className="w-7 h-7 rounded-xl bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 flex items-center justify-center font-bold text-xs"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="font-mono font-bold w-4 text-center">{it.cantidad}</span>
                        <button
                          onClick={() => updateCantidad(it.producto.id, it.cantidad + 1)}
                          className="w-7 h-7 rounded-xl bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 flex items-center justify-center font-bold text-xs"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Carrito */}
              {items.length > 0 && (
                <div className="p-5 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-600 dark:text-stone-400">
                      Total a Confirmar:
                    </span>
                    <span className="font-serif text-xl font-black text-amber-900 dark:text-amber-400 font-mono">
                      Bs {total().toFixed(2)}
                    </span>
                  </div>

                  <button
                    disabled={submitting}
                    onClick={confirmarPedido}
                    className="w-full py-3.5 rounded-2xl bg-amber-900 dark:bg-amber-600 hover:bg-amber-950 text-white font-bold text-xs shadow-lg transition active:scale-98 disabled:opacity-50"
                  >
                    {submitting ? "Enviando a Cocina..." : "Confirmar y Enviar Pedido"}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal Pagar Cuenta ── */}
      <AnimatePresence>
        {showPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4"
            >
              <div className="text-center pb-2">
                <span className="text-3xl">💳</span>
                <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 mt-1">
                  Pagar Cuenta — Mesa {numero}
                </h3>
                <p className="text-xs text-stone-500">Selecciona tu método de pago preferido</p>
              </div>

              <div className="space-y-2">
                <a
                  href={`/pago/${pedidoId || "PED-1021"}?modo=efectivo`}
                  className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center gap-3 hover:border-amber-400 transition"
                >
                  <span className="text-2xl">💵</span>
                  <div>
                    <div className="font-bold text-xs text-stone-900 dark:text-stone-100">
                      Pago en Efectivo
                    </div>
                    <div className="text-[11px] text-stone-500">Calculadora de cambio y billetes</div>
                  </div>
                </a>

                <a
                  href={`/pago/${pedidoId || "PED-1021"}?modo=qr`}
                  className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center gap-3 hover:border-amber-400 transition"
                >
                  <span className="text-2xl">📱</span>
                  <div>
                    <div className="font-bold text-xs text-stone-900 dark:text-stone-100">
                      Pago por QR Simple
                    </div>
                    <div className="text-[11px] text-stone-500">BCP, BNB, Banco Unión y más</div>
                  </div>
                </a>
              </div>

              <button
                onClick={() => setShowPayment(false)}
                className="w-full py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              >
                Volver al Menú
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

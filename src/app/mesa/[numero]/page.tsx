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
  Receipt,
  Wallet,
} from "lucide-react";
import { Producto, Categoria, CartItem, ItemPedido } from "@/types";
import { useSystemStore, useCartStore, useUIStore } from "@/store";
import { SEED_CATEGORIAS, SEED_PRODUCTOS, DENCKER_ASSETS } from "@/lib/seed-data";
import { supabase } from "@/lib/supabase";
import { soundManager } from "@/lib/sound";
import { AnimatedMascot, DenckerLogo } from "@/components/brand";

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
  const storeCategorias = useSystemStore((state) => state.categorias);
  const storeProductos = useSystemStore((state) => state.productos);
  const categorias: Categoria[] = storeCategorias && storeCategorias.length > 0 ? storeCategorias : SEED_CATEGORIAS;
  const productos: Producto[] = storeProductos && storeProductos.length > 0 ? storeProductos : SEED_PRODUCTOS;
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
  const [tamanoPizzaModal, setTamanoPizzaModal] = useState<4 | 6 | 8>(4);

  const PIZZA_SIZES_MAP: Record<string, { p4: number; p6: number; p8: number }> = {
    prod_pizza_margarita: { p4: 40, p6: 55, p8: 70 },
    prod_pizza_jamon_queso: { p4: 35, p6: 50, p8: 65 },
    prod_pizza_hawaiana: { p4: 40, p6: 55, p8: 70 },
    prod_pizza_funghi: { p4: 35, p6: 50, p8: 65 },
    prod_pizza_choclo_amarillo: { p4: 35, p6: 50, p8: 70 },
    prod_pizza_bacon: { p4: 40, p6: 55, p8: 70 },
    prod_pizza_palmito: { p4: 40, p6: 55, p8: 70 },
    prod_pizza_portuguesa: { p4: 45, p6: 55, p8: 80 },
    prod_pizza_criolla: { p4: 45, p6: 65, p8: 80 },
    prod_pizza_salame: { p4: 45, p6: 65, p8: 80 },
    prod_pizza_pollo_catupiri: { p4: 45, p6: 65, p8: 80 },
  };
  const [showPayment, setShowPayment] = useState(false);
  const [modalCuentaAbierto, setModalCuentaAbierto] = useState(false);
  const [metodoCuenta, setMetodoCuenta] = useState<"efectivo" | "tarjeta" | "qr">("efectivo");
  const [solicitandoCuenta, setSolicitandoCuenta] = useState(false);
  const [avisoCuentaEnviado, setAvisoCuentaEnviado] = useState(false);
  const [cambioEfectivoEstimado, setCambioEfectivoEstimado] = useState<number | null>(null);

  // Asiento individual en la mesa
  const [asientoCliente, setAsientoCliente] = useState<number>(1);
  const [nombreComensalCliente, setNombreComensalCliente] = useState<string>("");

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

  const solicitarTraerCuenta = async (metodoOverride?: "efectivo" | "tarjeta" | "qr") => {
    const metodoElegido = metodoOverride || metodoCuenta;
    setSolicitandoCuenta(true);
    soundManager.playWaiterBell();
    const mesaNum = parseInt(numero) || 1;

    let detalleMetodo = "Efectivo";
    if (metodoElegido === "tarjeta") {
      detalleMetodo = "Datáfono / Tarjeta";
    } else if (metodoElegido === "qr") {
      detalleMetodo = "Cobro QR en mesa";
    } else if (cambioEfectivoEstimado) {
      detalleMetodo = `Efectivo (Paga con Bs ${cambioEfectivoEstimado})`;
    }

    const mensajeAlerta = `Mesa ${mesaNum} solicita la cuenta (${detalleMetodo})`;

    try {
      const { useSystemStore } = await import("@/store");
      useSystemStore.getState().addAlerta({
        mesa_numero: mesaNum,
        tipo: "cuenta_pedida",
        mensaje: mensajeAlerta,
        datos_extra: {
          metodo: metodoElegido,
          detalle: detalleMetodo,
          billete: cambioEfectivoEstimado,
          origen: "mesa_digital",
        },
      });

      if (supabase) {
        await supabase.from("alertas_mesero").insert({
          mesa_id: isUUID(mesaId) ? mesaId : null,
          mesa_numero: mesaNum,
          tipo: "cuenta_pedida",
          mensaje: mensajeAlerta,
          datos_extra: {
            metodo: metodoElegido,
            detalle: detalleMetodo,
            billete: cambioEfectivoEstimado,
            origen: "mesa_digital",
          },
        });
      }

      setAvisoCuentaEnviado(true);
      setTimeout(() => {
        setAvisoCuentaEnviado(false);
        setModalCuentaAbierto(false);
        setSolicitandoCuenta(false);
      }, 3500);
    } catch {
      setSolicitandoCuenta(false);
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
          const itemsPayload = items.map((i) => {
            const unitPrice = i.precio_unitario ?? i.producto.precio;
            return {
              pedido_id: newPedidoId,
              producto_id: isUUID(i.producto.id) ? i.producto.id : null,
              producto_nombre: i.tamanio ? `${i.producto.nombre} (${i.tamanio})` : i.producto.nombre,
              cantidad: i.cantidad,
              precio_unitario: unitPrice,
              subtotal: i.cantidad * unitPrice,
              tamanio: i.tamanio,
              chips_seleccionados: i.chips_seleccionados,
              notas: i.notas,
              estacion: i.producto.estacion,
              estado: "pendiente",
              asiento_numero: asientoCliente,
              comensal_nombre: nombreComensalCliente.trim() || `Comensal Silla ${asientoCliente}`,
            };
          });
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
        cliente_nombre: nombreComensalCliente.trim() ? `${nombreComensalCliente} (Mesa ${mesaNum})` : `Mesa ${mesaNum}`,
        es_ronda: false,
        items: items.map((i, idx) => {
          const unitPrice = i.precio_unitario ?? i.producto.precio;
          return {
            id: `item-${Date.now()}-${idx}`,
            pedido_id: newPedidoId || `ped-${Date.now()}`,
            producto_id: i.producto.id,
            producto_nombre: i.tamanio ? `${i.producto.nombre} (${i.tamanio})` : i.producto.nombre,
            cantidad: i.cantidad,
            precio_unitario: unitPrice,
            subtotal: i.cantidad * unitPrice,
            tamanio: i.tamanio,
            chips_seleccionados: i.chips_seleccionados,
            notas: i.notas,
            estacion: i.producto.estacion,
            estado: "pendiente",
            asiento_numero: asientoCliente,
            comensal_nombre: nombreComensalCliente.trim() || `Comensal Silla ${asientoCliente}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }),
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
    setTamanoPizzaModal(4);
  };

  const agregarAlCarrito = () => {
    if (!productoModal) return;
    soundManager.playSuccessTone();
    const esPizzaTradicional =
      productoModal.categoria_id === "c_pizzas" &&
      productoModal.id !== "prod_pizza_especial_dencker";
    const p4 = productoModal.tamanios?.find((t) => t.nombre.includes("4"))?.precio || PIZZA_SIZES_MAP[productoModal.id]?.p4 || productoModal.precio;
    const p6 = productoModal.tamanios?.find((t) => t.nombre.includes("6"))?.precio || PIZZA_SIZES_MAP[productoModal.id]?.p6 || Math.round(p4 * 1.38);
    const p8 = productoModal.tamanios?.find((t) => t.nombre.includes("8"))?.precio || PIZZA_SIZES_MAP[productoModal.id]?.p8 || Math.round(p4 * 1.75);
    const precioCalculado = esPizzaTradicional
      ? tamanoPizzaModal === 4
        ? p4
        : tamanoPizzaModal === 6
        ? p6
        : p8
      : productoModal.precio;

    const itemFinal = esPizzaTradicional
      ? {
          ...productoModal,
          id: `${productoModal.id}__size_${tamanoPizzaModal}p`,
          nombre: `${productoModal.nombre} (${tamanoPizzaModal} porc)`,
          precio: precioCalculado,
          chips_personalizacion: [`${tamanoPizzaModal} porciones`],
        }
      : productoModal;

    addItem(
      itemFinal,
      esPizzaTradicional ? [`${tamanoPizzaModal} Porciones`] : chipsSeleccionados,
      notaProducto || undefined,
      esPizzaTradicional ? `${tamanoPizzaModal} porc` : undefined,
      precioCalculado
    );
    setProductoModal(null);
  };

  const itemEnCarrito = (id: string) => items.find((i) => i.producto.id === id);

  return (
    <div className="w-full min-h-screen bg-[#F2ECE1] text-[#1E130C] pb-36 font-sans">
      {/* ── Header Flotante Dencker Pan ── */}
      <header className="sticky top-0 z-30 bg-[#1E130C] border-b-2 border-amber-500/30 text-white shadow-xl pt-safe">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 p-1 border border-amber-500/30 flex items-center justify-center shrink-0">
              <img
                src={DENCKER_ASSETS.logoLight}
                alt="Don Dencker"
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-base text-white leading-tight">
                  Dencker Pan
                </span>
                <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded-full bg-[#991B24] text-white border border-amber-400/30">
                  Mesa {numero}
                </span>
              </div>
              <div className="text-[11px] text-amber-200/80 font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Carta & Pedido Digital en Mesa
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={llamarMesero}
              className={`px-2 sm:px-3 py-1.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 border cursor-pointer shrink-0 ${
                llamandoMesero
                  ? "bg-emerald-600 border-emerald-400 text-white animate-pulse"
                  : "bg-white/10 hover:bg-white/20 border-white/15 text-stone-200"
              }`}
              title="Llamar al mesero para asistencia"
            >
              <Bell size={13} className={llamandoMesero ? "animate-bounce" : ""} />
              <span className="hidden sm:inline">{llamandoMesero ? "Llamando..." : "Mesero"}</span>
              <span className="sm:hidden text-[11px]">{llamandoMesero ? "..." : "Mozo"}</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                soundManager.playTactileClick();
                setModalCuentaAbierto(true);
              }}
              className={`px-2 sm:px-3 py-1.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 border cursor-pointer shrink-0 ${
                avisoCuentaEnviado
                  ? "bg-amber-600 border-amber-400 text-white animate-pulse shadow-md"
                  : "bg-amber-500/20 hover:bg-amber-500/30 border-amber-400/40 text-amber-200"
              }`}
              title="Pedir que traigan la cuenta a la mesa"
            >
              <Receipt size={13} className={avisoCuentaEnviado ? "animate-bounce" : ""} />
              <span className="hidden sm:inline">{avisoCuentaEnviado ? "Cuenta Pedida ✓" : "Traer Cuenta"}</span>
              <span className="sm:hidden text-[11px]">{avisoCuentaEnviado ? "Pedida" : "Cuenta"}</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                soundManager.playClick();
                setCartOpen(true);
              }}
              className="px-2.5 sm:px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-black shadow-md flex items-center gap-1 sm:gap-1.5 relative active:scale-95 transition cursor-pointer shrink-0"
            >
              <ShoppingCart size={14} />
              <span>{count()}</span>
            </motion.button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-4 space-y-4">
        {/* ── Live Order Tracker (Card Apple Pro con Alto Contraste) ── */}
        <AnimatePresence>
          {pedidoEstado && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="p-4 sm:p-5 rounded-3xl bg-white border-2 border-[#D5C7B5] shadow-[0_4px_20px_rgba(30,19,12,0.06)] space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-serif font-black text-sm text-stone-950">
                  <Clock size={16} className="text-[#991B24]" />
                  <span>Seguimiento de tu Pedido</span>
                </div>
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-full border-2 ${ESTADO_LABELS[pedidoEstado].color}`}
                >
                  {ESTADO_LABELS[pedidoEstado].label}
                </span>
              </div>

              <p className="text-xs text-stone-700 font-medium">
                {ESTADO_LABELS[pedidoEstado].desc}
              </p>

              {/* Steps Progress Indicator */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[1, 2, 3, 4].map((step) => {
                  const currentStep = ESTADO_LABELS[pedidoEstado].step;
                  const isDone = currentStep >= step;
                  return (
                    <div
                      key={step}
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isDone ? "bg-[#991B24]" : "bg-[#E5DCD0]"
                      }`}
                    />
                  );
                })}
              </div>

              {pedidoEstado !== "pagado" && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                  <button
                    onClick={() => setCartOpen(true)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#FAF6EF] text-stone-900 border-2 border-[#D8C7B2] text-xs font-bold hover:bg-[#F2EAE0] transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Pedir otra ronda</span>
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playTactileClick();
                      setModalCuentaAbierto(true);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-black transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer border border-amber-800"
                  >
                    <Receipt size={14} />
                    <span>Traer la Cuenta</span>
                  </button>
                  <button
                    onClick={() => setShowPayment(true)}
                    className="py-2 px-3 rounded-xl bg-white hover:bg-stone-100 text-stone-900 border-2 border-stone-300 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    title="Pagar online inmediatamente por QR o Efectivo"
                  >
                    <span>💳 Pagar Online</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Banner de Bienvenida Oficial con Don Dencker ── */}
        <div className="p-4 sm:p-4.5 rounded-3xl bg-gradient-to-r from-[#2B1810] to-[#1E130C] border-2 border-amber-500/40 text-white shadow-lg flex items-center justify-between gap-3 relative overflow-hidden">
          <div className="space-y-1 relative z-10">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
              ¡Bienvenido a Dencker Pan!
            </span>
            <h3 className="font-serif font-black text-base sm:text-lg text-white leading-tight">
              Mesa {numero} • Experiencia Artesanal
            </h3>
            <p className="text-[11px] text-amber-100/80 leading-relaxed font-sans max-w-sm">
              Pide directamente desde tu mesa. Café de especialidad 4 Llamas y pan de masa madre viva.
            </p>
          </div>
          <div className="w-24 h-32 sm:w-28 sm:h-36 shrink-0 flex items-center justify-center relative z-10">
            <AnimatedMascot
              mascot="don-dencker"
              animation="idle"
              color="#FFFDF7"
              className="w-full h-full drop-shadow-[0_6px_20px_rgba(245,158,11,0.35)]"
            />
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-amber-500/10 blur-xl pointer-events-none" />
        </div>

        {/* ── Selector de Asiento / Silla para comanda individual en mesa ── */}
        <div className="p-3.5 sm:p-4 rounded-3xl bg-white border-2 border-[#D5C7B5] shadow-[0_2px_12px_rgba(30,19,12,0.04)] space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-black text-stone-950 flex items-center gap-1.5">
              <span>👤</span>
              <span>¿En qué silla estás sentado?</span>
            </span>
            <input
              type="text"
              placeholder="Tu nombre (ej. Carlos)"
              value={nombreComensalCliente}
              onChange={(e) => setNombreComensalCliente(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-xl bg-white border-2 border-[#D5C7B5] text-stone-950 font-bold placeholder:text-stone-500 w-36 sm:w-44 focus:outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => {
                  soundManager.playTactileClick();
                  setAsientoCliente(num);
                }}
                className={`flex-1 min-w-[50px] py-1.5 rounded-xl font-bold transition flex flex-col items-center justify-center cursor-pointer ${
                  asientoCliente === num
                    ? "bg-[#991B24] text-white border-2 border-[#7F1D1D] shadow-md ring-2 ring-amber-400/40 font-black"
                    : "bg-[#FAF6EF] hover:bg-[#F2EAE0] text-stone-800 border-2 border-[#D8C7B2] font-bold"
                }`}
              >
                <span className="text-[8.5px] uppercase tracking-wider opacity-90 leading-tight">Silla</span>
                <span className="text-xs leading-none font-mono font-bold">{num}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Search Bar ── */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-3 text-stone-500" />
          <input
            type="text"
            placeholder="Buscar en el menú artesanal (café, croissant, sándwich)..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border-2 border-[#D5C7B5] bg-white shadow-sm focus:outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-500/20 text-stone-950 font-medium placeholder:text-stone-500"
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
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-[#991B24] text-white border-2 border-[#7F1D1D] shadow-md shadow-red-950/20 font-black"
                    : "bg-white hover:bg-[#FAF6EF] text-stone-800 border-2 border-[#D5C7B5] font-bold"
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
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {productosFiltrados().map((prod) => {
            const enCarrito = itemEnCarrito(prod.id);

            return (
              <motion.div
                key={prod.id}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => abrirModal(prod)}
                className="rounded-3xl bg-white border-2 border-[#D5C7B5] hover:border-amber-600 p-3 sm:p-3.5 shadow-[0_2px_12px_rgba(30,19,12,0.04)] hover:shadow-lg cursor-pointer flex flex-col justify-between transition-all select-none"
              >
                <div>
                  {/* Image / Emoji Showcase */}
                  <div className="h-32 sm:h-36 rounded-2xl bg-gradient-to-br from-[#F5EFE6] to-[#EAE0D2] border border-[#E0D5C5] flex items-center justify-center text-4xl relative overflow-hidden mb-2.5 shadow-inner">
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
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#991B24] text-white font-black text-[9px] uppercase tracking-wider shadow-sm border border-amber-400/40">
                        Top
                      </span>
                    )}

                    {enCarrito && (
                      <span className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-[#991B24] text-white font-mono font-black text-xs flex items-center justify-center shadow-md border border-white">
                        {enCarrito.cantidad}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif font-black text-xs sm:text-sm text-stone-950 line-clamp-2 min-h-[2.2rem] sm:min-h-[2.5rem] leading-snug">
                    {prod.nombre}
                  </h3>

                  {prod.descripcion && (
                    <p className="text-[11px] text-stone-600 font-medium line-clamp-2 mt-0.5 leading-relaxed hidden xs:block">
                      {prod.descripcion}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-[#EAE0D2]">
                  {(() => {
                    const esPizza = prod.categoria_id === "c_pizzas" || prod.nombre.toLowerCase().includes("pizza");
                    const p4 = prod.tamanios?.find((t) => t.nombre.includes("4"))?.precio || PIZZA_SIZES_MAP[prod.id]?.p4 || prod.precio;
                    const p6 = prod.tamanios?.find((t) => t.nombre.includes("6"))?.precio || PIZZA_SIZES_MAP[prod.id]?.p6 || Math.round(p4 * 1.38);
                    const p8 = prod.tamanios?.find((t) => t.nombre.includes("8"))?.precio || PIZZA_SIZES_MAP[prod.id]?.p8 || Math.round(p4 * 1.75);

                    if (esPizza || (prod.tamanios && prod.tamanios.length > 0)) {
                      return (
                        <div className="flex flex-col text-left">
                          <span className="text-[8px] sm:text-[9px] uppercase font-bold text-amber-900">
                            4p: {p4} | 6p: {p6} | 8p: {p8}
                          </span>
                          <span className="font-mono font-black text-xs text-[#991B24]">
                            Bs {p4} – {p8}
                          </span>
                        </div>
                      );
                    }
                    return (
                      <span className="font-mono font-black text-sm sm:text-base text-[#991B24]">
                        Bs {prod.precio.toFixed(2)}
                      </span>
                    );
                  })()}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      abrirModal(prod);
                    }}
                    className="w-8 h-8 rounded-xl bg-[#991B24] hover:bg-[#7F1D1D] text-white border border-[#7F1D1D] flex items-center justify-center font-black text-base shadow-sm transition active:scale-90"
                    title="Añadir o elegir porción"
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
            <p className="font-bold text-sm text-stone-700">
              No encontramos resultados para tu búsqueda
            </p>
            <p className="text-xs text-stone-500">Prueba con palabras como café, pan o tarta</p>
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
            className="fixed bottom-4 sm:bottom-6 inset-x-3 sm:inset-x-4 max-w-sm mx-auto z-40 pb-safe"
          >
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                soundManager.playClick();
                setCartOpen(true);
              }}
              className="w-full bg-[#1E130C] border-2 border-amber-500/50 p-3.5 rounded-full shadow-2xl flex items-center justify-between text-white group cursor-pointer"
            >
              <div className="flex items-center gap-3 pl-1">
                <span className="w-8 h-8 rounded-full bg-[#991B24] text-white font-black flex items-center justify-center text-xs shadow-md border border-amber-400/40">
                  {count()}
                </span>
                <span className="font-bold text-xs tracking-wide">Ver Mi Pedido</span>
              </div>

              <div className="flex items-center gap-2 pr-1">
                <span className="font-mono font-black text-sm text-amber-300">
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
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="w-full max-w-lg bg-white rounded-t-[28px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl border-t-2 sm:border-2 border-[#D5C7B5] max-h-[85vh] overflow-y-auto space-y-4 pb-safe text-stone-950"
            >
              {(() => {
                const esPizzaTradicional =
                  productoModal.categoria_id === "c_pizzas" &&
                  productoModal.id !== "prod_pizza_especial_dencker";
                const p4 = productoModal.tamanios?.find((t) => t.nombre.includes("4"))?.precio || PIZZA_SIZES_MAP[productoModal.id]?.p4 || productoModal.precio;
                const p6 = productoModal.tamanios?.find((t) => t.nombre.includes("6"))?.precio || PIZZA_SIZES_MAP[productoModal.id]?.p6 || Math.round(p4 * 1.38);
                const p8 = productoModal.tamanios?.find((t) => t.nombre.includes("8"))?.precio || PIZZA_SIZES_MAP[productoModal.id]?.p8 || Math.round(p4 * 1.75);
                const precioCalculado = esPizzaTradicional
                  ? tamanoPizzaModal === 4
                    ? p4
                    : tamanoPizzaModal === 6
                    ? p6
                    : p8
                  : productoModal.precio;

                return (
                  <>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-serif text-xl font-black text-stone-950">
                          {productoModal.nombre}
                        </h3>
                        <span className="font-mono font-black text-lg text-[#991B24]">
                          Bs {precioCalculado.toFixed(2)}
                          {esPizzaTradicional ? ` (${tamanoPizzaModal} porc)` : ""}
                        </span>
                      </div>
                      <button
                        onClick={() => setProductoModal(null)}
                        className="p-2 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Selector de Porciones para Pizzas */}
                    {esPizzaTradicional && (
                      <div className="p-3.5 rounded-2xl bg-[#FAF6EF] border-2 border-[#D8C7B2] space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-amber-950 uppercase tracking-wider block">
                          Selecciona Tamaño (Porciones):
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { porc: 4 as const, precio: p4, label: "4 Porc", sub: "Individual", icon: "🍕" },
                            { porc: 6 as const, precio: p6, label: "6 Porc", sub: "Compartir", icon: "🍕🍕" },
                            { porc: 8 as const, precio: p8, label: "8 Porc", sub: "Familiar", icon: "🍕🍕🍕" },
                          ].map((sz) => (
                            <button
                              key={sz.porc}
                              type="button"
                              onClick={() => {
                                soundManager.playClick();
                                setTamanoPizzaModal(sz.porc);
                              }}
                              className={`py-2 px-1 rounded-xl text-center border-2 transition flex flex-col items-center cursor-pointer ${
                                tamanoPizzaModal === sz.porc
                                  ? "bg-[#991B24] text-white border-[#7F1D1D] shadow-sm font-black"
                                  : "bg-white text-stone-800 border-[#D5C7B5] hover:bg-amber-50 font-bold"
                              }`}
                            >
                              <span className="text-xs">{sz.icon}</span>
                              <div className="text-[10px] uppercase font-bold mt-0.5">{sz.label}</div>
                              <div className={`text-[9px] ${tamanoPizzaModal === sz.porc ? "text-amber-200" : "text-stone-500"}`}>{sz.sub}</div>
                              <div className={`text-xs font-mono font-black mt-0.5 ${tamanoPizzaModal === sz.porc ? "text-amber-300" : "text-[#991B24]"}`}>
                                Bs {sz.precio}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}

              {productoModal.descripcion && (
                <p className="text-xs text-stone-600 font-medium leading-relaxed">
                  {productoModal.descripcion}
                </p>
              )}

              {/* Chips de Personalización */}
              {productoModal.chips_personalizacion &&
                productoModal.chips_personalizacion.length > 0 && (
                  <div>
                    <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block mb-2">
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
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border-2 ${
                              isSelected
                                ? "bg-[#991B24] text-white border-[#7F1D1D] shadow-xs font-black"
                                : "bg-[#FAF6EF] text-stone-800 border-[#D8C7B2] hover:bg-stone-200 font-bold"
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
                <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block mb-1.5">
                  Instrucciones para Cocina / Barista
                </label>
                <textarea
                  value={notaProducto}
                  onChange={(e) => setNotaProducto(e.target.value)}
                  placeholder="Ej. Muy caliente, sin azúcar, por favor..."
                  className="w-full p-3 text-xs rounded-2xl border-2 border-[#D5C7B5] bg-white focus:outline-none focus:border-amber-700 text-stone-950 resize-none h-20 placeholder:text-stone-400 font-medium"
                />
              </div>

              {(() => {
                const esPizzaTradicional =
                  productoModal.categoria_id === "c_pizzas" &&
                  productoModal.id !== "prod_pizza_especial_dencker";
                const p4 = productoModal.tamanios?.find((t) => t.nombre.includes("4"))?.precio || PIZZA_SIZES_MAP[productoModal.id]?.p4 || productoModal.precio;
                const p6 = productoModal.tamanios?.find((t) => t.nombre.includes("6"))?.precio || PIZZA_SIZES_MAP[productoModal.id]?.p6 || Math.round(p4 * 1.38);
                const p8 = productoModal.tamanios?.find((t) => t.nombre.includes("8"))?.precio || PIZZA_SIZES_MAP[productoModal.id]?.p8 || Math.round(p4 * 1.75);
                const precioCalculado = esPizzaTradicional
                  ? tamanoPizzaModal === 4
                    ? p4
                    : tamanoPizzaModal === 6
                    ? p6
                    : p8
                  : productoModal.precio;

                return (
                  <button
                    onClick={agregarAlCarrito}
                    className="w-full py-3.5 rounded-2xl bg-[#991B24] hover:bg-[#7F1D1D] text-white font-black text-xs border-2 border-[#7F1D1D] shadow-lg transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>
                      Agregar al Pedido • Bs {precioCalculado.toFixed(2)}
                      {esPizzaTradicional ? ` (${tamanoPizzaModal} porc)` : ""}
                    </span>
                  </button>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Drawer Carrito Completo ── */}
      <AnimatePresence>
        {cartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l-2 border-[#D5C7B5]"
            >
              {/* Header Carrito */}
              <div className="p-5 border-b-2 border-amber-500/30 flex items-center justify-between bg-[#1E130C] text-white">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-lg font-bold text-white">
                    Tu Pedido — Mesa {numero}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#991B24] text-white font-black border border-amber-400/40">
                    {count()}
                  </span>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-stone-300 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F2ECE1]/40">
                {items.length === 0 ? (
                  <div className="py-24 text-center space-y-3">
                    <div className="text-5xl">🛒</div>
                    <p className="font-bold text-stone-800 text-sm">
                      Tu pedido está vacío
                    </p>
                    <p className="text-xs text-stone-500">
                      Selecciona productos de nuestro menú artesanal
                    </p>
                  </div>
                ) : (
                  items.map((it, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white border-2 border-[#D5C7B5] shadow-xs flex items-center justify-between text-xs"
                    >
                      <div className="flex-1 pr-2">
                        <div className="font-serif font-black text-stone-950 text-sm">
                          {it.producto.nombre}
                        </div>
                        {it.chips_seleccionados.length > 0 && (
                          <div className="text-[10px] text-amber-900 font-bold mt-0.5">
                            {it.chips_seleccionados.join(", ")}
                          </div>
                        )}
                        {it.notas && (
                          <p className="text-[10px] text-stone-500 italic">"{it.notas}"</p>
                        )}
                        <span className="font-mono font-black text-[#991B24] text-sm">
                          Bs {(it.producto.precio * it.cantidad).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCantidad(it.producto.id, it.cantidad - 1)}
                          className="w-7 h-7 rounded-xl bg-white border-2 border-stone-300 text-stone-900 flex items-center justify-center font-bold text-xs hover:bg-stone-100 cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="font-mono font-black w-4 text-center text-stone-950">{it.cantidad}</span>
                        <button
                          onClick={() => updateCantidad(it.producto.id, it.cantidad + 1)}
                          className="w-7 h-7 rounded-xl bg-white border-2 border-stone-300 text-stone-900 flex items-center justify-center font-bold text-xs hover:bg-stone-100 cursor-pointer"
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
                <div className="p-5 border-t-2 border-[#D5C7B5] bg-[#FBF9F5] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-700">
                      Total a Confirmar:
                    </span>
                    <span className="font-serif text-2xl font-black text-[#991B24] font-mono">
                      Bs {total().toFixed(2)}
                    </span>
                  </div>

                  <button
                    disabled={submitting}
                    onClick={confirmarPedido}
                    className="w-full py-3.5 rounded-2xl bg-[#991B24] hover:bg-[#7F1D1D] text-white font-black text-xs border-2 border-[#7F1D1D] shadow-lg transition active:scale-98 disabled:opacity-50 cursor-pointer"
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
                <button
                  onClick={() => {
                    setShowPayment(false);
                    setModalCuentaAbierto(true);
                  }}
                  className="w-full p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 flex items-center gap-3 hover:border-amber-500 transition text-left cursor-pointer"
                >
                  <span className="text-2xl">🧾</span>
                  <div>
                    <div className="font-bold text-xs text-amber-950 dark:text-amber-200">
                      Traer la Cuenta a la Mesa (Mesero)
                    </div>
                    <div className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                      El mesero te llevará el ticket físico para abonar con efectivo o datáfono
                    </div>
                  </div>
                </button>

                <a
                  href={`/pago/${pedidoId || "PED-1021"}?modo=efectivo`}
                  className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center gap-3 hover:border-amber-400 transition"
                >
                  <span className="text-2xl">💵</span>
                  <div>
                    <div className="font-bold text-xs text-stone-900 dark:text-stone-100">
                      Pago en Efectivo (Calculadora)
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

      {/* ── Modal Traer la Cuenta a la Mesa ── */}
      <AnimatePresence>
        {modalCuentaAbierto && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              className="w-full max-w-md bg-stone-900 text-stone-100 rounded-t-[28px] sm:rounded-[32px] p-5 sm:p-6 border-t sm:border border-amber-500/40 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto pb-safe"
            >
              {/* Header Modal */}
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shadow-inner">
                    <Receipt size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                      <span>Traer la Cuenta</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                        Mesa {numero}
                      </span>
                    </h3>
                    <p className="text-[11px] text-stone-400">
                      El mesero te llevará el ticket físico para abonar en tu mesa
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setModalCuentaAbierto(false);
                    setAvisoCuentaEnviado(false);
                  }}
                  className="p-1.5 rounded-full hover:bg-white/10 text-stone-400 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {avisoCuentaEnviado ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto animate-bounce shadow-lg shadow-emerald-500/20">
                    <Check size={32} />
                  </div>
                  <h4 className="font-serif text-xl font-bold text-white">
                    ¡Aviso Enviado al Mesero!
                  </h4>
                  <p className="text-xs text-stone-300 max-w-xs mx-auto leading-relaxed">
                    Nuestro personal se dirige a la{" "}
                    <strong className="text-amber-300">Mesa {numero}</strong> con el ticket impreso y tu opción seleccionada.
                  </p>
                  <div className="pt-2">
                    <span className="text-[11px] text-stone-400 font-mono bg-stone-800/80 px-3 py-1 rounded-full border border-stone-700">
                      Atención inmediata en salón
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-2">
                      ¿Cómo deseas pagar en tu mesa?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        {
                          id: "efectivo",
                          label: "Efectivo",
                          icon: "💵",
                          desc: "Con cambio o billetes",
                        },
                        {
                          id: "tarjeta",
                          label: "Datáfono",
                          icon: "💳",
                          desc: "Tarjeta de débito/crédito",
                        },
                        {
                          id: "qr",
                          label: "QR Simple",
                          icon: "📱",
                          desc: "QR en el ticket",
                        },
                      ].map((m) => {
                        const isSelected = metodoCuenta === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              soundManager.playTactileClick();
                              setMetodoCuenta(m.id as "efectivo" | "tarjeta" | "qr");
                            }}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? "bg-amber-500/25 border-amber-400 text-white shadow-md ring-1 ring-amber-400/50"
                                : "bg-stone-800/60 border-stone-700/80 text-stone-300 hover:bg-stone-800"
                            }`}
                          >
                            <span className="text-2xl mb-1">{m.icon}</span>
                            <div className="font-bold text-xs">{m.label}</div>
                            <div className="text-[10px] text-stone-400 leading-tight mt-0.5">
                              {m.desc}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Si seleccionó efectivo, opción rápida de billete para cambio */}
                  {metodoCuenta === "efectivo" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-3 rounded-2xl bg-stone-800/50 border border-stone-700/60 space-y-2"
                    >
                      <div className="text-[11px] font-semibold text-stone-300">
                        ¿Pagas con billete grande? (Opcional para traer tu cambio listo):
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[200, 100, 50, 20].map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() =>
                              setCambioEfectivoEstimado((prev) => (prev === b ? null : b))
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition cursor-pointer ${
                              cambioEfectivoEstimado === b
                                ? "bg-amber-500 text-stone-950 border-amber-400 shadow-sm"
                                : "bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700"
                            }`}
                          >
                            Bs {b}
                          </button>
                        ))}
                        {cambioEfectivoEstimado && (
                          <button
                            type="button"
                            onClick={() => setCambioEfectivoEstimado(null)}
                            className="text-[10px] text-stone-400 hover:text-white underline ml-1 cursor-pointer"
                          >
                            Limpiar
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Botón Principal: Notificar al Mesero para Traer la Cuenta */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={solicitandoCuenta}
                    onClick={() => solicitarTraerCuenta()}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-stone-950 font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Receipt size={16} />
                    <span>
                      {solicitandoCuenta
                        ? "Avisando al mesero..."
                        : `Traer la Cuenta a la Mesa ${numero}`}
                    </span>
                  </motion.button>

                  {/* Alternativa: Pagar Online Ahora Mismo */}
                  <div className="pt-2 border-t border-stone-800 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setModalCuentaAbierto(false);
                        setShowPayment(true);
                      }}
                      className="text-xs text-amber-300/90 hover:text-amber-200 underline cursor-pointer"
                    >
                      ¿Prefieres pagar online ahora con QR desde tu celular?
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  MessageCircle,
  MapPin,
  Store,
  Utensils,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Calendar,
  Clock,
  Banknote,
  QrCode,
  CreditCard,
} from "lucide-react";
import { useCartStore, useUIStore, useSystemStore } from "@/store";
import { soundManager } from "@/lib/sound";
import { DENCKER_ASSETS } from "@/lib/seed-data";
import { supabase } from "@/lib/supabase";

const springTransition = { type: "spring", stiffness: 400, damping: 20 } as const;
const springButton = { type: "spring", stiffness: 400, damping: 15 } as const;

export default function CartDrawer() {
  const { cartOpen, setCartOpen } = useUIStore();
  const { items, updateCantidad, removeItem, clearCart, total, count, mesaNumero, setMesa } = useCartStore();

  const [tipoEntrega, setTipoEntrega] = useState<"retiro" | "delivery" | "mesa" | "reserva">(
    mesaNumero ? "mesa" : "retiro"
  );
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [zonaDelivery, setZonaDelivery] = useState("");
  const [horaRetiro, setHoraRetiro] = useState<"asap" | "tarde" | "manana" | "otra">("asap");
  const [mesaManual, setMesaManual] = useState<number>(mesaNumero || 1);
  const [fechaReserva, setFechaReserva] = useState<string>("hoy");
  const [horaReserva, setHoraReserva] = useState<string>("16:30");
  const [personasReserva, setPersonasReserva] = useState<number>(2);
  const [notas, setNotas] = useState("");
  const [metodoPago, setMetodoPago] = useState<"efectivo" | "qr" | "tarjeta">("efectivo");
  const [montoPagoEfectivo, setMontoPagoEfectivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviadoExitoso, setEnviadoExitoso] = useState(false);

  const subtotal = total();
  const totalCount = count();

  const handleEnviarWhatsApp = async () => {
    if (items.length === 0) return;
    setEnviando(true);
    soundManager.playVintageRegisterDing();

    const mesaAsignada = tipoEntrega === "mesa" ? (mesaNumero || mesaManual || 1) : 0;

    try {
      const nuevoPedido = {
        mesa_numero: mesaAsignada,
        estado: "pendiente" as const,
        total: subtotal,
        cliente_nombre:
          nombre.trim() ||
          (tipoEntrega === "delivery"
            ? "Cliente Delivery"
            : tipoEntrega === "retiro"
            ? "Cliente Retiro en Vitrina"
            : tipoEntrega === "mesa"
            ? `Mesa ${mesaAsignada}`
            : "Reserva Salón"),
        es_ronda: false,
        items: items.map((i, idx) => ({
          id: `item-web-${Date.now()}-${idx}`,
          pedido_id: `ped-web-${Date.now()}`,
          producto_id: i.producto.id,
          producto_nombre: i.producto.nombre,
          cantidad: i.cantidad,
          precio_unitario: i.producto.precio,
          subtotal: i.cantidad * i.producto.precio,
          chips_seleccionados: i.chips_seleccionados,
          notas: i.notas,
          estacion: i.producto.estacion || "vitrina",
          estado: "pendiente" as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })),
      };

      useSystemStore.getState().addPedido(nuevoPedido);

      if (tipoEntrega === "mesa" && mesaAsignada > 0) {
        useSystemStore.getState().addAlerta({
          mesa_numero: mesaAsignada,
          tipo: "llamado",
          mensaje: `Nuevo pedido comanda desde web para Mesa ${mesaAsignada} (Bs ${subtotal.toFixed(2)})`,
          datos_extra: {},
        });
      }

      if (tipoEntrega === "reserva") {
        useSystemStore.getState().addReserva({
          nombre_cliente: nombre.trim() || "Cliente Reserva",
          telefono: telefono.trim(),
          tipo_evento: "Reserva de Mesa con Consumo",
          fecha_evento: `${fechaReserva} ${horaReserva}`,
          numero_personas: personasReserva,
          descripcion: `Pedido previo: ${items.map((i) => `${i.cantidad}x ${i.producto.nombre}`).join(", ")}`,
          monto_total: subtotal,
          estado: "pendiente",
        });
      }

      if (supabase) {
        try {
          await supabase.from("pedidos").insert({
            mesa_numero: nuevoPedido.mesa_numero,
            estado: "pendiente",
            total: subtotal,
            cliente_nombre: nuevoPedido.cliente_nombre,
            es_ronda: false,
          });
        } catch {
          // Fallback silencioso en caso de desconexión momentánea
        }
      }

      let texto = "";
      if (tipoEntrega === "retiro") {
        const detalleHora =
          horaRetiro === "asap"
            ? "⚡ Lo antes posible (~15-20 min)"
            : horaRetiro === "tarde"
            ? "🔥 Tanda caliente de la tarde (16:30)"
            : horaRetiro === "manana"
            ? "🌅 Tanda caliente de la mañana (07:30)"
            : "⏰ Hora acordada en notas";

        texto += `🛍️ *PEDIDO PARA RECOGER (TAKEAWAY) — DENCKER PAN*\n`;
        texto += `━━━━━━━━━━━━━━━━━━━━━\n`;
        texto += `👤 *Cliente:* ${nombre.trim() || "Cliente Retiro"}\n`;
        texto += `📞 *WhatsApp:* ${telefono.trim() || "No especificado"}\n`;
        texto += `⏰ *Hora estimada de retiro:* ${detalleHora}\n`;
        texto += `📍 *Lugar de retiro:* Vitrina Principal Dencker Pan (Cochabamba)\n`;
      } else if (tipoEntrega === "delivery") {
        texto += `🛵 *PEDIDO DELIVERY COCHABAMBA — DENCKER PAN*\n`;
        texto += `━━━━━━━━━━━━━━━━━━━━━\n`;
        texto += `👤 *Cliente:* ${nombre.trim() || "Cliente Delivery"}\n`;
        texto += `📞 *WhatsApp:* ${telefono.trim() || "No especificado"}\n`;
        texto += `🏠 *Dirección de Entrega:* ${direccion.trim() || "Por coordinar"}\n`;
        if (zonaDelivery.trim()) {
          texto += `📍 *Zona / Referencia:* ${zonaDelivery.trim()}\n`;
        }
      } else if (tipoEntrega === "mesa") {
        texto += `🍽️ *ORDEN EN SALÓN — MESA ${mesaAsignada}*\n`;
        texto += `━━━━━━━━━━━━━━━━━━━━━\n`;
        texto += `👤 *Comensal:* ${nombre.trim() || `Mesa ${mesaAsignada}`}\n`;
        texto += `📍 *Ubicación:* Mesa ${mesaAsignada} — Salón Dencker Pan\n`;
        if (telefono.trim()) {
          texto += `📞 *WhatsApp:* ${telefono.trim()}\n`;
        }
      } else {
        texto += `📅 *SOLICITUD DE RESERVA CON PEDIDO — DENCKER PAN*\n`;
        texto += `━━━━━━━━━━━━━━━━━━━━━\n`;
        texto += `👤 *Titular:* ${nombre.trim() || "Cliente Reserva"}\n`;
        texto += `📞 *WhatsApp:* ${telefono.trim() || "No especificado"}\n`;
        texto += `📆 *Fecha:* ${fechaReserva} | ⏰ *Hora:* ${horaReserva}\n`;
        texto += `👥 *Comensales:* ${personasReserva} personas\n`;
      }

      texto += `━━━━━━━━━━━━━━━━━━━━━\n`;
      texto += `📋 *PRODUCTOS SELECCIONADOS:*\n`;

      items.forEach((item, idx) => {
        texto += `\n${idx + 1}. *${item.cantidad}x ${item.producto.nombre}*\n`;
        texto += `   • Subtotal: Bs ${(item.cantidad * item.producto.precio).toFixed(2)}\n`;
        if (item.chips_seleccionados && item.chips_seleccionados.length > 0) {
          texto += `   • Opciones: ${item.chips_seleccionados.join(", ")}\n`;
        }
        if (item.notas) {
          texto += `   • Nota: ${item.notas}\n`;
        }
      });

      const detallePago =
        metodoPago === "efectivo"
          ? `💵 Efectivo${montoPagoEfectivo ? ` (Paga con Bs ${montoPagoEfectivo}, Cambio: Bs ${(Math.max(0, parseFloat(montoPagoEfectivo) - subtotal)).toFixed(2)})` : " (Monto exacto)"}`
          : metodoPago === "qr"
          ? "📱 QR Simple Bancario (Transferencia directa)"
          : "💳 Datáfono / Tarjeta (Visa / Mastercard)";

      texto += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
      texto += `💰 *TOTAL A PAGAR:* Bs ${subtotal.toFixed(2)}\n`;
      texto += `💳 *FORMA DE PAGO:* ${detallePago}\n`;
      if (notas.trim()) {
        texto += `📝 *Observaciones:* ${notas.trim()}\n`;
      }
      texto += `━━━━━━━━━━━━━━━━━━━━━\n`;
      texto += `✨ _Enviado desde el sistema artesanal de Dencker Pan_`;

      const urlWhatsApp = `https://wa.me/59176911000?text=${encodeURIComponent(texto)}`;

      setEnviadoExitoso(true);
      setTimeout(() => {
        window.open(urlWhatsApp, "_blank");
        clearCart();
        setEnviadoExitoso(false);
        setCartOpen(false);
      }, 950);
    } catch {
      // Manejo de error controlado
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => {
              soundManager.playTactileClick();
              setCartOpen(false);
            }}
            className="fixed inset-0 bg-[#0F0A07]/75 backdrop-blur-md"
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={springTransition}
            className="relative w-full max-w-md bg-[#FAF7F2] text-[#1E130C] h-full shadow-[0_0_60px_rgba(0,0,0,0.5)] flex flex-col z-10 border-l border-[#3D271D]/15 overflow-hidden font-sans"
          >
            {/* Header Sensorial */}
            <header className="p-5 bg-gradient-to-b from-[#18100A] to-[#22160F] text-white flex items-center justify-between border-b border-[#3D271D]/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 p-1 flex items-center justify-center">
                  <img
                    src={DENCKER_ASSETS.logo}
                    alt="Dencker Pan"
                    className="w-full h-full object-contain drop-shadow"
                  />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#FAF7F2] tracking-tight">
                    Tu Canasta Artesanal
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-[#A3B899]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#527953]" />
                    <span>{totalCount} {totalCount === 1 ? "pieza seleccionada" : "piezas seleccionadas"}</span>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={springButton}
                onClick={() => {
                  soundManager.playTactileClick();
                  setCartOpen(false);
                }}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                aria-label="Cerrar canasta"
              >
                <X size={18} />
              </motion.button>
            </header>

            {/* Contenido Principal */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-5">
                <div className="w-24 h-24 rounded-full bg-[#EAE2D5]/80 text-[#3D271D] flex items-center justify-center text-4xl shadow-inner border border-[#D9CDBF]">
                  🥐
                </div>
                <div className="space-y-1.5 max-w-xs">
                  <h4 className="font-serif font-bold text-xl text-[#1E130C]">
                    Tu canasta aún reposa vacía
                  </h4>
                  <p className="text-xs text-[#785E4F] leading-relaxed">
                    Añade un New York Roll de Pistacho, caukas recién salidas del horno o nuestro café de altura Caranavi.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.96, y: 1 }}
                  transition={springButton}
                  onClick={() => {
                    soundManager.playPastryCrinkle();
                    setCartOpen(false);
                    const el = document.getElementById("menu-bento");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-6 py-3 rounded-full bg-[#1E130C] hover:bg-[#2C1C12] text-[#FAF7F2] text-xs font-bold shadow-[0_4px_16px_rgba(30,19,12,0.3)] flex items-center gap-2"
                >
                  <Sparkles size={14} className="text-[#87A987]" />
                  <span>Descubrir Especialidades</span>
                  <ArrowRight size={14} />
                </motion.button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Banner Reasegurador: Ordenar sin escanear QR */}
                <div className="p-3.5 rounded-2xl bg-[#EBF3EA] border border-[#527953]/20 flex items-start gap-2.5 shadow-xs">
                  <Sparkles size={16} className="text-[#527953] shrink-0 mt-0.5" />
                  <div className="text-[11px] text-[#2D452E] leading-relaxed">
                    <strong>¿No escaneaste código QR?</strong> ¡No hay problema! Selecciona si estás sentado en <strong>Mesa</strong> en el salón, para <strong>Retiro</strong> en vitrina o para <strong>Delivery</strong> a tu puerta e ingresa tus datos.
                  </div>
                </div>

                {/* 1. Modalidad de Entrega */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#785E4F]">
                      Modalidad de Servicio
                    </label>
                    <span className="text-[10px] font-semibold text-[#527953] bg-[#EBF3EA] px-2 py-0.5 rounded-full">
                      Cochabamba
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    <motion.button
                      whileTap={{ scale: 0.95, y: 1 }}
                      transition={springButton}
                      type="button"
                      onClick={() => {
                        soundManager.playTactileClick();
                        setTipoEntrega("retiro");
                      }}
                      className={`p-2.5 rounded-2xl border text-center flex flex-col items-center gap-1 transition-all ${
                        tipoEntrega === "retiro"
                          ? "bg-[#1E130C] text-[#FAF7F2] border-[#1E130C] shadow-md"
                          : "bg-white text-[#3D271D] border-[#EAE2D5] hover:bg-[#F5EFEB]"
                      }`}
                    >
                      <Store size={16} className={tipoEntrega === "retiro" ? "text-[#87A987]" : "text-[#785E4F]"} />
                      <span className="text-[10px] font-bold">Retiro</span>
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.95, y: 1 }}
                      transition={springButton}
                      type="button"
                      onClick={() => {
                        soundManager.playTactileClick();
                        setTipoEntrega("delivery");
                      }}
                      className={`p-2.5 rounded-2xl border text-center flex flex-col items-center gap-1 transition-all ${
                        tipoEntrega === "delivery"
                          ? "bg-[#1E130C] text-[#FAF7F2] border-[#1E130C] shadow-md"
                          : "bg-white text-[#3D271D] border-[#EAE2D5] hover:bg-[#F5EFEB]"
                      }`}
                    >
                      <MapPin size={16} className={tipoEntrega === "delivery" ? "text-[#87A987]" : "text-[#785E4F]"} />
                      <span className="text-[10px] font-bold">Delivery</span>
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.95, y: 1 }}
                      transition={springButton}
                      type="button"
                      onClick={() => {
                        soundManager.playTactileClick();
                        setTipoEntrega("mesa");
                      }}
                      className={`p-2.5 rounded-2xl border text-center flex flex-col items-center gap-1 transition-all ${
                        tipoEntrega === "mesa"
                          ? "bg-[#1E130C] text-[#FAF7F2] border-[#1E130C] shadow-md"
                          : "bg-white text-[#3D271D] border-[#EAE2D5] hover:bg-[#F5EFEB]"
                      }`}
                    >
                      <Utensils size={16} className={tipoEntrega === "mesa" ? "text-[#87A987]" : "text-[#785E4F]"} />
                      <span className="text-[10px] font-bold">En Mesa</span>
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.95, y: 1 }}
                      transition={springButton}
                      type="button"
                      onClick={() => {
                        soundManager.playTactileClick();
                        setTipoEntrega("reserva");
                      }}
                      className={`p-2.5 rounded-2xl border text-center flex flex-col items-center gap-1 transition-all ${
                        tipoEntrega === "reserva"
                          ? "bg-[#1E130C] text-[#FAF7F2] border-[#1E130C] shadow-md"
                          : "bg-white text-[#3D271D] border-[#EAE2D5] hover:bg-[#F5EFEB]"
                      }`}
                    >
                      <Calendar size={16} className={tipoEntrega === "reserva" ? "text-[#87A987]" : "text-[#785E4F]"} />
                      <span className="text-[10px] font-bold">Reserva</span>
                    </motion.button>
                  </div>
                </div>

                {/* 2. Lista de Productos */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#785E4F]">
                      Productos Seleccionados
                    </label>
                    <button
                      onClick={() => {
                        soundManager.playTactileClick();
                        clearCart();
                      }}
                      className="text-[11px] text-[#A63A2D] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Trash2 size={12} />
                      <span>Vaciar</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {items.map((item) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={springTransition}
                        key={item.producto.id}
                        className="p-3.5 rounded-2xl bg-white border border-[#EAE2D5] shadow-xs flex items-center gap-3.5"
                      >
                        <div className="w-14 h-14 rounded-xl bg-[#F5EFEB] overflow-hidden shrink-0 border border-[#EAE2D5] flex items-center justify-center">
                          {item.producto.imagen_url ? (
                            <img
                              src={item.producto.imagen_url}
                              alt={item.producto.nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl">🥐</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h5 className="font-serif font-bold text-xs text-[#1E130C] truncate">
                            {item.producto.nombre}
                          </h5>
                          <span className="text-xs font-mono font-bold text-[#1E130C] block mt-0.5">
                            Bs {(item.producto.precio * item.cantidad).toFixed(2)}
                          </span>
                          {item.chips_seleccionados && item.chips_seleccionados.length > 0 && (
                            <p className="text-[10px] text-[#527953] truncate mt-0.5 font-medium">
                              {item.chips_seleccionados.join(" • ")}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 bg-[#FAF7F2] rounded-xl p-1 border border-[#EAE2D5]">
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            transition={springButton}
                            onClick={() => {
                              soundManager.playTactileClick();
                              updateCantidad(item.producto.id, item.cantidad - 1);
                            }}
                            className="w-6 h-6 rounded-lg bg-white text-[#1E130C] flex items-center justify-center shadow-xs"
                            aria-label="Disminuir"
                          >
                            <Minus size={12} />
                          </motion.button>
                          <span className="w-5 text-center text-xs font-mono font-bold text-[#1E130C]">
                            {item.cantidad}
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            transition={springButton}
                            onClick={() => {
                              soundManager.playPastryCrinkle();
                              updateCantidad(item.producto.id, item.cantidad + 1);
                            }}
                            className="w-6 h-6 rounded-lg bg-[#1E130C] text-[#FAF7F2] flex items-center justify-center shadow-xs"
                            aria-label="Aumentar"
                          >
                            <Plus size={12} />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* 3. Datos del Despacho según Modalidad */}
                <div className="space-y-3 pt-3 border-t border-[#EAE2D5]">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#785E4F] block">
                      {tipoEntrega === "retiro"
                        ? "Datos de Retiro en Vitrina"
                        : tipoEntrega === "delivery"
                        ? "Datos de Envío a Domicilio"
                        : tipoEntrega === "mesa"
                        ? "Ubicación en Salón"
                        : "Detalles de Reserva"}
                    </label>
                  </div>

                  {/* Detalle contextual según modalidad */}
                  {tipoEntrega === "retiro" && (
                    <div className="p-3 rounded-xl bg-[#EBF3EA] border border-[#527953]/30 text-[#2D452E] space-y-2">
                      <div className="flex items-start gap-2">
                        <Store size={15} className="text-[#527953] shrink-0 mt-0.5" />
                        <p className="text-[11px] leading-relaxed">
                          <strong>Pasa a recoger sin filas:</strong> Tu bolsa estará lista en el mostrador principal de Dencker Pan.
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-[#527953] uppercase tracking-wider block">
                          ¿Cuándo pasas a recoger?
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { id: "asap", label: "⚡ En 15-20 min" },
                            { id: "tarde", label: "🔥 Tanda Tarde (16:30)" },
                            { id: "manana", label: "🌅 Tanda Mañana (07:30)" },
                            { id: "otra", label: "⏰ Indicar en notas" },
                          ].map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                soundManager.playTactileClick();
                                setHoraRetiro(t.id as any);
                              }}
                              className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition text-left ${
                                horaRetiro === t.id
                                  ? "bg-[#2D452E] text-white shadow-xs"
                                  : "bg-white text-[#2D452E] border border-[#527953]/20 hover:bg-[#F0F6EF]"
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {tipoEntrega === "delivery" && (
                    <div className="p-3 rounded-xl bg-[#FDF8F3] border border-[#D49B54]/30 text-[#6B4724] flex items-start gap-2">
                      <MapPin size={15} className="text-[#D49B54] shrink-0 mt-0.5" />
                      <p className="text-[11px] leading-relaxed">
                        <strong>Delivery en Cochabamba:</strong> Llevamos tus piezas calientes y café en moto a tu casa u oficina.
                      </p>
                    </div>
                  )}

                  {tipoEntrega === "mesa" && (
                    <div className="p-3 rounded-xl bg-[#FAF4ED] border border-[#3D271D]/20 text-[#3D271D] space-y-2.5">
                      {mesaNumero ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-[#527953]">
                          <CheckCircle2 size={16} />
                          <span>Mesa {mesaNumero} — QR Escaneado previamente</span>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#785E4F]">
                              ¿En qué mesa te encuentras?
                            </span>
                            <span className="text-[10px] text-[#A8988D]">Revisa el cartel de tu mesa</span>
                          </div>
                          <div className="grid grid-cols-6 gap-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => {
                                  soundManager.playTactileClick();
                                  setMesaManual(num);
                                  setMesa(num);
                                }}
                                className={`py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                                  (mesaManual || mesaNumero) === num
                                    ? "bg-[#1E130C] text-[#FAF7F2] shadow-sm"
                                    : "bg-white text-[#3D271D] border border-[#EAE2D5] hover:bg-[#F5EFEB]"
                                }`}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {tipoEntrega === "reserva" && (
                    <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#3D271D]/20 space-y-2 text-[#3D271D]">
                      <div className="flex items-start gap-2">
                        <Calendar size={15} className="text-[#527953] shrink-0 mt-0.5" />
                        <p className="text-[11px] leading-relaxed">
                          <strong>Reserva con Menú Anticipado:</strong> Apartamos tu mesa y tendremos tu pedido listo cuando llegues.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-[#785E4F] block font-semibold mb-0.5">Fecha:</label>
                          <select
                            value={fechaReserva}
                            onChange={(e) => setFechaReserva(e.target.value)}
                            className="w-full p-2 rounded-lg bg-white border border-[#EAE2D5] text-xs font-medium text-[#1E130C]"
                          >
                            <option value="Hoy">Hoy</option>
                            <option value="Mañana">Mañana</option>
                            <option value="Este Fin de Semana">Este Fin de Semana</option>
                            <option value="Próxima Semana">Próxima Semana</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-[#785E4F] block font-semibold mb-0.5">Hora:</label>
                          <select
                            value={horaReserva}
                            onChange={(e) => setHoraReserva(e.target.value)}
                            className="w-full p-2 rounded-lg bg-white border border-[#EAE2D5] text-xs font-medium text-[#1E130C]"
                          >
                            <option value="08:30 (Desayuno)">08:30 (Desayuno)</option>
                            <option value="10:00 (Brunch)">10:00 (Brunch)</option>
                            <option value="12:30 (Almuerzo)">12:30 (Almuerzo)</option>
                            <option value="16:30 (Tanda Pan Caliente)">16:30 (Pan Caliente)</option>
                            <option value="18:30 (Merienda)">18:30 (Merienda)</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-[#785E4F] block font-semibold mb-0.5">Personas:</label>
                        <div className="flex gap-1.5">
                          {[2, 4, 6, 8, 12].map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setPersonasReserva(p)}
                              className={`flex-1 py-1 rounded-lg text-xs font-bold transition ${
                                personasReserva === p
                                  ? "bg-[#1E130C] text-[#FAF7F2]"
                                  : "bg-white text-[#3D271D] border border-[#EAE2D5]"
                              }`}
                            >
                              {p}p
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Campos de texto comunes */}
                  <div className="space-y-2 text-xs">
                    <input
                      type="text"
                      placeholder="Tu Nombre Completo"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white border border-[#EAE2D5] focus:outline-none focus:ring-2 focus:ring-[#527953] placeholder:text-[#A8988D] text-[#1E130C]"
                    />

                    <input
                      type="tel"
                      placeholder="WhatsApp de Contacto (ej. 76911000)"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white border border-[#EAE2D5] focus:outline-none focus:ring-2 focus:ring-[#527953] placeholder:text-[#A8988D] text-[#1E130C]"
                    />

                    {tipoEntrega === "delivery" && (
                      <>
                        <input
                          type="text"
                          placeholder="Dirección exacta en Cochabamba (calle, número de puerta)"
                          value={direccion}
                          onChange={(e) => setDireccion(e.target.value)}
                          className="w-full p-3 rounded-xl bg-white border border-[#EAE2D5] focus:outline-none focus:ring-2 focus:ring-[#527953] placeholder:text-[#A8988D] text-[#1E130C]"
                        />
                        <input
                          type="text"
                          placeholder="Zona y Referencias (ej. Cala Cala, portón blanco, piso 2)"
                          value={zonaDelivery}
                          onChange={(e) => setZonaDelivery(e.target.value)}
                          className="w-full p-3 rounded-xl bg-white border border-[#EAE2D5] focus:outline-none focus:ring-2 focus:ring-[#527953] placeholder:text-[#A8988D] text-[#1E130C]"
                        />
                      </>
                    )}

                    <textarea
                      rows={2}
                      placeholder="Instrucciones al barista o panadero (ej: café tibio, servilletas extra)..."
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white border border-[#EAE2D5] focus:outline-none focus:ring-2 focus:ring-[#527953] placeholder:text-[#A8988D] text-[#1E130C] resize-none"
                    />
                  </div>

                  {/* 4. Método de Pago Preferido */}
                  <div className="space-y-2.5 pt-3 border-t border-[#EAE2D5]">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#785E4F]">
                        Forma de Pago
                      </label>
                      <span className="text-[10px] text-[#A8988D]">Elige cómo pagarás</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          soundManager.playTactileClick();
                          setMetodoPago("efectivo");
                        }}
                        className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          metodoPago === "efectivo"
                            ? "bg-[#1E130C] text-[#FAF7F2] border-[#1E130C] shadow-sm"
                            : "bg-white text-[#3D271D] border-[#EAE2D5] hover:bg-[#F5EFEB]"
                        }`}
                      >
                        <Banknote size={16} className={metodoPago === "efectivo" ? "text-emerald-400" : "text-stone-500"} />
                        <span className="text-[11px] font-bold">Efectivo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          soundManager.playTactileClick();
                          setMetodoPago("qr");
                        }}
                        className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          metodoPago === "qr"
                            ? "bg-[#1E130C] text-[#FAF7F2] border-[#1E130C] shadow-sm"
                            : "bg-white text-[#3D271D] border-[#EAE2D5] hover:bg-[#F5EFEB]"
                        }`}
                      >
                        <QrCode size={16} className={metodoPago === "qr" ? "text-amber-400" : "text-stone-500"} />
                        <span className="text-[11px] font-bold">QR Simple</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          soundManager.playTactileClick();
                          setMetodoPago("tarjeta");
                        }}
                        className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          metodoPago === "tarjeta"
                            ? "bg-[#1E130C] text-[#FAF7F2] border-[#1E130C] shadow-sm"
                            : "bg-white text-[#3D271D] border-[#EAE2D5] hover:bg-[#F5EFEB]"
                        }`}
                      >
                        <CreditCard size={16} className={metodoPago === "tarjeta" ? "text-blue-400" : "text-stone-500"} />
                        <span className="text-[11px] font-bold">Datáfono</span>
                      </button>
                    </div>

                    {metodoPago === "efectivo" && (
                      <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE2D5] flex items-center gap-2">
                        <span className="text-xs text-[#785E4F] shrink-0 font-medium">¿Pagas con cuánto?</span>
                        <input
                          type="number"
                          placeholder={`Bs ${subtotal.toFixed(0)} o más (para cambio)`}
                          value={montoPagoEfectivo}
                          onChange={(e) => setMontoPagoEfectivo(e.target.value)}
                          className="w-full p-1.5 rounded-lg bg-white border border-[#EAE2D5] text-xs font-mono font-bold text-[#1E130C] focus:outline-none focus:ring-1 focus:ring-[#527953]"
                        />
                      </div>
                    )}

                    {metodoPago === "qr" && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 flex items-center gap-2">
                        <QrCode size={15} className="text-amber-600 shrink-0" />
                        <span className="text-[11px]">Te enviaremos el código QR bancario al confirmar tu orden.</span>
                      </div>
                    )}

                    {metodoPago === "tarjeta" && (
                      <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-950 flex items-center gap-2">
                        <CreditCard size={15} className="text-blue-600 shrink-0" />
                        <span className="text-[11px]">Llevamos el datáfono inalámbrico (Visa y Mastercard).</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Footer con Resumen Financiero & Consolidación */}
            {items.length > 0 && (
              <footer className="p-5 bg-white border-t border-[#EAE2D5] shadow-[0_-8px_30px_rgba(0,0,0,0.06)] space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-[#785E4F]">
                    <span>Subtotal de piezas ({totalCount}):</span>
                    <span className="font-mono font-medium">Bs {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#785E4F]">
                    <span>Modalidad:</span>
                    <span className="font-semibold text-[#1E130C]">
                      {tipoEntrega === "delivery"
                        ? "🛵 Delivery Cochabamba"
                        : tipoEntrega === "retiro"
                        ? "🛍️ Retiro en Vitrina (Sin fila)"
                        : tipoEntrega === "mesa"
                        ? `🍽️ Consumo en Mesa ${mesaNumero || mesaManual || 1}`
                        : `📅 Reserva (${personasReserva} personas)`}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-[#F5EFEB]">
                    <span className="font-serif font-bold text-sm text-[#1E130C]">Total a Consolidar:</span>
                    <span className="font-sans font-extrabold text-2xl text-[#1E130C]">
                      Bs {subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.96, y: 1 }}
                  transition={springButton}
                  onClick={handleEnviarWhatsApp}
                  disabled={enviando || enviadoExitoso}
                  className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-[#1E130C] via-[#2A1910] to-[#1E130C] hover:from-[#2A1910] hover:to-[#382216] text-[#FAF7F2] font-bold text-xs shadow-[0_6px_20px_rgba(30,19,12,0.35)] flex items-center justify-center gap-2.5 transition-all disabled:opacity-60 border border-[#527953]/30"
                >
                  {enviadoExitoso ? (
                    <>
                      <CheckCircle2 size={18} className="text-[#87A987] animate-pulse" />
                      <span className="text-[#87A987]">¡Orden Registrada! Abriendo WhatsApp...</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle size={18} className="text-[#87A987]" />
                      <span>Confirmar Pedido vía WhatsApp</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </motion.button>

                <p className="text-[10px] text-[#A8988D] text-center font-sans">
                  Recibirás confirmación directa con los baristas y panaderos de Dencker Pan.
                </p>
              </footer>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}


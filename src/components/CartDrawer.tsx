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
} from "lucide-react";
import { useCartStore, useUIStore, useSystemStore } from "@/store";
import { soundManager } from "@/lib/sound";
import { DENCKER_ASSETS } from "@/lib/seed-data";
import { supabase } from "@/lib/supabase";

const springTransition = { type: "spring", stiffness: 400, damping: 20 } as const;
const springButton = { type: "spring", stiffness: 400, damping: 15 } as const;

export default function CartDrawer() {
  const { cartOpen, setCartOpen } = useUIStore();
  const { items, updateCantidad, removeItem, clearCart, total, count, mesaNumero } = useCartStore();

  const [tipoEntrega, setTipoEntrega] = useState<"delivery" | "retiro" | "mesa">("delivery");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [notas, setNotas] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviadoExitoso, setEnviadoExitoso] = useState(false);

  const subtotal = total();
  const totalCount = count();

  const handleEnviarWhatsApp = async () => {
    if (items.length === 0) return;
    setEnviando(true);
    soundManager.playVintageRegisterDing();

    try {
      const nuevoPedido = {
        mesa_numero: tipoEntrega === "mesa" ? (mesaNumero || 1) : 0,
        estado: "pendiente" as const,
        total: subtotal,
        cliente_nombre: nombre.trim() || (tipoEntrega === "delivery" ? "Cliente Delivery" : "Cliente Tienda"),
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

      let texto = `🥐 *PEDIDO DENCKER PAN — TIENDA ONLINE*\n`;
      texto += `━━━━━━━━━━━━━━━━━━━━━\n`;
      texto += `👤 *Cliente:* ${nombre.trim() || "Cliente Online"}\n`;
      texto += `📞 *Teléfono:* ${telefono.trim() || "No especificado"}\n`;
      texto += `📍 *Modalidad:* ${
        tipoEntrega === "delivery"
          ? `🛵 Delivery en Cochabamba\n🏠 *Dirección:* ${direccion.trim() || "Por coordinar"}`
          : tipoEntrega === "retiro"
          ? `🛍️ Retiro en Sucursal`
          : `🍽️ Consumo en Mesa ${mesaNumero || 1}`
      }\n`;
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

      texto += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
      texto += `💰 *TOTAL A PAGAR:* Bs ${subtotal.toFixed(2)}\n`;
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

                  <div className="grid grid-cols-3 gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95, y: 1 }}
                      transition={springButton}
                      type="button"
                      onClick={() => {
                        soundManager.playTactileClick();
                        setTipoEntrega("delivery");
                      }}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                        tipoEntrega === "delivery"
                          ? "bg-[#1E130C] text-[#FAF7F2] border-[#1E130C] shadow-md"
                          : "bg-white text-[#3D271D] border-[#EAE2D5] hover:bg-[#F5EFEB]"
                      }`}
                    >
                      <MapPin size={17} className={tipoEntrega === "delivery" ? "text-[#87A987]" : "text-[#785E4F]"} />
                      <span className="text-[11px] font-bold">Delivery</span>
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.95, y: 1 }}
                      transition={springButton}
                      type="button"
                      onClick={() => {
                        soundManager.playTactileClick();
                        setTipoEntrega("retiro");
                      }}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                        tipoEntrega === "retiro"
                          ? "bg-[#1E130C] text-[#FAF7F2] border-[#1E130C] shadow-md"
                          : "bg-white text-[#3D271D] border-[#EAE2D5] hover:bg-[#F5EFEB]"
                      }`}
                    >
                      <Store size={17} className={tipoEntrega === "retiro" ? "text-[#87A987]" : "text-[#785E4F]"} />
                      <span className="text-[11px] font-bold">Retiro</span>
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.95, y: 1 }}
                      transition={springButton}
                      type="button"
                      onClick={() => {
                        soundManager.playTactileClick();
                        setTipoEntrega("mesa");
                      }}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                        tipoEntrega === "mesa"
                          ? "bg-[#1E130C] text-[#FAF7F2] border-[#1E130C] shadow-md"
                          : "bg-white text-[#3D271D] border-[#EAE2D5] hover:bg-[#F5EFEB]"
                      }`}
                    >
                      <Utensils size={17} className={tipoEntrega === "mesa" ? "text-[#87A987]" : "text-[#785E4F]"} />
                      <span className="text-[11px] font-bold">En Mesa</span>
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

                {/* 3. Datos del Despacho */}
                <div className="space-y-3 pt-3 border-t border-[#EAE2D5]">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#785E4F] block">
                    Datos de Contacto & Despacho
                  </label>

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
                      <input
                        type="text"
                        placeholder="Dirección exacta en Cochabamba (calle, zona, referencias)"
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                        className="w-full p-3 rounded-xl bg-white border border-[#EAE2D5] focus:outline-none focus:ring-2 focus:ring-[#527953] placeholder:text-[#A8988D] text-[#1E130C]"
                      />
                    )}

                    <textarea
                      rows={2}
                      placeholder="Instrucciones al barista o panadero (ej: café tibio, servilletas extra)..."
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white border border-[#EAE2D5] focus:outline-none focus:ring-2 focus:ring-[#527953] placeholder:text-[#A8988D] text-[#1E130C] resize-none"
                    />
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
                    <span className="font-semibold text-[#1E130C] capitalize">
                      {tipoEntrega === "delivery" ? "Delivery Cochabamba" : tipoEntrega === "retiro" ? "Retiro en Vitrina" : "Servicio en Mesa"}
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


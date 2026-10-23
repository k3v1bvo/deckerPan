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
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useCartStore, useUIStore, useSystemStore } from "@/store";
import { soundManager } from "@/lib/sound";
import { DENCKER_ASSETS } from "@/lib/seed-data";
import { supabase } from "@/lib/supabase";

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
    soundManager.playOrderChime();

    try {
      // 1. Guardar en Store local del sistema y Supabase
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
        } catch (e) {
          console.warn("Supabase insert warning:", e);
        }
      }

      // 2. Construir mensaje elegante de WhatsApp
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
      texto += `✨ _Enviado desde el sistema digital de Dencker Pan Cochabamba_`;

      const urlWhatsApp = `https://wa.me/59176911000?text=${encodeURIComponent(texto)}`;
      
      setEnviadoExitoso(true);
      setTimeout(() => {
        window.open(urlWhatsApp, "_blank");
        clearCart();
        setEnviadoExitoso(false);
        setCartOpen(false);
      }, 900);
    } catch (err) {
      console.error(err);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop con Blur Apple Pro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
          />

          {/* Drawer Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#FAF7F2] text-stone-900 h-full shadow-2xl flex flex-col z-10 border-l border-amber-900/15 overflow-hidden"
          >
            {/* Drawer Header */}
            <header className="p-4 sm:p-5 bg-[#1C120B] text-white flex items-center justify-between border-b border-amber-900/30">
              <div className="flex items-center gap-3">
                <img
                  src={DENCKER_ASSETS.logo}
                  alt="Dencker Pan"
                  className="w-9 h-9 object-contain drop-shadow"
                />
                <div>
                  <h3 className="font-serif font-bold text-base text-amber-100 flex items-center gap-1.5">
                    <span>Tu Canasta Dencker Pan</span>
                  </h3>
                  <p className="text-[11px] text-amber-200/70 font-sans">
                    {totalCount} {totalCount === 1 ? "producto" : "productos"} seleccionados
                  </p>
                </div>
              </div>

              <button
                onClick={() => setCartOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95"
              >
                <X size={18} />
              </button>
            </header>

            {/* Drawer Body */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-3xl shadow-inner">
                  🥐
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-lg text-stone-800">
                    Tu canasta está vacía
                  </h4>
                  <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
                    Descubre nuestros 240 panes de masa madre, tortas artesanales y café de especialidad.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCartOpen(false);
                    const el = document.getElementById("catalogo");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-6 py-2.5 rounded-full bg-amber-800 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition active:scale-95 flex items-center gap-2"
                >
                  <span>Explorar el Menú Completo</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
                {/* Modalidad de Pedido */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    1. Modalidad de Entrega
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setTipoEntrega("delivery")}
                      className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                        tipoEntrega === "delivery"
                          ? "bg-amber-900 text-white border-amber-900 shadow-sm"
                          : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      <MapPin size={16} />
                      <span className="text-[11px] font-bold">Delivery</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTipoEntrega("retiro")}
                      className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                        tipoEntrega === "retiro"
                          ? "bg-amber-900 text-white border-amber-900 shadow-sm"
                          : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      <Store size={16} />
                      <span className="text-[11px] font-bold">Retiro</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTipoEntrega("mesa")}
                      className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                        tipoEntrega === "mesa"
                          ? "bg-amber-900 text-white border-amber-900 shadow-sm"
                          : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      <Utensils size={16} />
                      <span className="text-[11px] font-bold">En Salón</span>
                    </button>
                  </div>
                </div>

                {/* Lista de Productos en Canasta */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                      2. Productos en Pedido
                    </label>
                    <button
                      onClick={clearCart}
                      className="text-[11px] text-red-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                      <span>Vaciar</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.producto.id}
                        className="p-3 rounded-2xl bg-white border border-stone-200/80 shadow-2xs flex items-center gap-3"
                      >
                        {/* Imagen miniatura */}
                        <div className="w-14 h-14 rounded-xl bg-amber-50 overflow-hidden shrink-0 border border-amber-100 flex items-center justify-center">
                          {item.producto.imagen_url ? (
                            <img
                              src={item.producto.imagen_url}
                              alt={item.producto.nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xl">🥐</span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-xs text-stone-900 truncate">
                            {item.producto.nombre}
                          </h5>
                          <span className="text-[11px] font-mono font-bold text-amber-800 block">
                            Bs {(item.producto.precio * item.cantidad).toFixed(2)}
                          </span>
                          {item.chips_seleccionados && item.chips_seleccionados.length > 0 && (
                            <p className="text-[10px] text-stone-500 truncate">
                              {item.chips_seleccionados.join(", ")}
                            </p>
                          )}
                        </div>

                        {/* Controles Cantidad */}
                        <div className="flex items-center gap-1.5 bg-stone-100 rounded-xl p-1 border border-stone-200">
                          <button
                            onClick={() => updateCantidad(item.producto.id, item.cantidad - 1)}
                            className="w-6 h-6 rounded-lg bg-white text-stone-700 flex items-center justify-center hover:bg-stone-200 transition active:scale-90"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-5 text-center text-xs font-mono font-bold">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => updateCantidad(item.producto.id, item.cantidad + 1)}
                            className="w-6 h-6 rounded-lg bg-amber-800 text-white flex items-center justify-center hover:bg-amber-900 transition active:scale-90"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Datos del Cliente */}
                <div className="space-y-2.5 pt-2 border-t border-stone-200/80">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                    3. Tus Datos para el Despacho
                  </label>

                  <div className="space-y-2 text-xs">
                    <input
                      type="text"
                      placeholder="Tu Nombre Completo"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-700 placeholder:text-stone-400"
                    />

                    <input
                      type="tel"
                      placeholder="Teléfono / WhatsApp (ej. 76911000)"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-700 placeholder:text-stone-400"
                    />

                    {tipoEntrega === "delivery" && (
                      <input
                        type="text"
                        placeholder="Dirección exacta en Cochabamba (calle, zona)"
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-700 placeholder:text-stone-400"
                      />
                    )}

                    <textarea
                      rows={2}
                      placeholder="Notas especiales (ej: enviar caliente, servilletas extra...)"
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-700 placeholder:text-stone-400 resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Drawer Footer (Totales & Botón WhatsApp) */}
            {items.length > 0 && (
              <footer className="p-4 sm:p-5 bg-white border-t border-stone-200 shadow-xl space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-stone-500">
                    <span>Subtotal de productos ({totalCount}):</span>
                    <span className="font-mono">Bs {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-stone-500">
                    <span>Modalidad:</span>
                    <span className="font-medium text-stone-700 capitalize">
                      {tipoEntrega === "delivery" ? "Delivery Cochabamba" : tipoEntrega === "retiro" ? "Retiro en local" : "En Salón"}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-1 border-t border-stone-100">
                    <span className="font-serif font-bold text-sm text-stone-900">Total a Pagar:</span>
                    <span className="font-serif font-extrabold text-2xl text-amber-900">
                      Bs {subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleEnviarWhatsApp}
                  disabled={enviando || enviadoExitoso}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-60"
                >
                  {enviadoExitoso ? (
                    <>
                      <CheckCircle2 size={18} className="animate-spin-slow" />
                      <span>¡Abriendo WhatsApp Oficial!</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle size={18} />
                      <span>Enviar Pedido a WhatsApp (+591 76911000)</span>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-stone-400 text-center font-sans">
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

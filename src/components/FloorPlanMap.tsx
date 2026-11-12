"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Plus,
  Trash2,
  Edit3,
  Save,
  Move,
  Users,
  Check,
  X,
  Receipt,
  Coffee,
  Bell,
  ArrowRight,
  ChevronRight,
  CreditCard,
  QrCode,
  Wallet,
  RotateCcw,
  Sparkles,
  MapPin,
  Maximize2,
  Sun,
  Flame,
  Utensils,
  ChevronDown,
  Split,
  UserCheck,
} from "lucide-react";
import { Mesa, TipoMesa, PisoCafeteria, EstadoMesa, ItemPedido, Pedido } from "@/types";
import { useSystemStore, useCartStore, useUIStore } from "@/store";
import { soundManager } from "@/lib/sound";
import { supabase } from "@/lib/supabase";

interface FloorPlanMapProps {
  onSelectMesa?: (mesa: Mesa) => void;
  mesaSeleccionadaId?: string | null;
  readOnly?: boolean;
  allowEditLayout?: boolean;
}

export default function FloorPlanMap({
  onSelectMesa,
  mesaSeleccionadaId,
  readOnly = false,
  allowEditLayout = true,
}: FloorPlanMapProps) {
  const storeMesas = useSystemStore((state) => state.mesas);
  const updateMesa = useSystemStore((state) => state.updateMesa);
  const addMesa = useSystemStore((state) => state.addMesa);
  const deleteMesa = useSystemStore((state) => state.deleteMesa);
  const pedidos = useSystemStore((state) => state.pedidos);
  const alertas = useSystemStore((state) => state.alertas);
  const { setMesa: setCartMesa } = useCartStore();

  const [pisoActivo, setPisoActivo] = useState<PisoCafeteria>("planta_baja");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mesaArrastrando, setMesaArrastrando] = useState<string | null>(null);
  const [mesaEnEdicion, setMesaEnEdicion] = useState<Mesa | null>(null);
  const [modalNuevaMesa, setModalNuevaMesa] = useState(false);
  const [modalDetalleMesa, setModalDetalleMesa] = useState<Mesa | null>(null);
  const [subTabDetalle, setSubTabDetalle] = useState<"general" | "asientos" | "cuenta_separada">("general");

  // Estado para asignar nombre a asiento
  const [asientoEditando, setAsientoEditando] = useState<number | null>(null);
  const [nombreAsientoInput, setNombreAsientoInput] = useState("");

  // Estado para formulario de nueva mesa
  const [nuevaMesaData, setNuevaMesaData] = useState<{
    numero: number;
    piso: PisoCafeteria;
    tipo: TipoMesa;
    capacidad: number;
    subzona: string;
  }>({
    numero: storeMesas.length + 1,
    piso: "planta_baja",
    tipo: "cuadrada",
    capacidad: 4,
    subzona: "salon_interior",
  });

  const canvasRef = useRef<HTMLDivElement>(null);

  // Filtrar mesas según piso activo
  const mesasPiso = useMemo(() => {
    return storeMesas.filter((m) => {
      const p = m.piso || (m.numero >= 13 ? "terraza" : "planta_baja");
      return p === pisoActivo;
    });
  }, [storeMesas, pisoActivo]);

  // Obtener pedido activo de una mesa
  const getPedidoMesa = (mesaNum: number): Pedido | undefined => {
    return pedidos.find(
      (p) => p.mesa_numero === mesaNum && p.estado !== "pagado" && p.estado !== "cancelado"
    );
  };

  // Manejar arrastre de mesa en el canvas
  const handlePointerDown = (mesaId: string, e: React.PointerEvent) => {
    if (!modoEdicion) return;
    e.preventDefault();
    setMesaArrastrando(mesaId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!mesaArrastrando || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));

    updateMesa(mesaArrastrando, {
      pos_x: Math.round(x),
      pos_y: Math.round(y),
    });
  };

  const handlePointerUp = () => {
    if (mesaArrastrando) {
      soundManager.playTactileClick();
      setMesaArrastrando(null);
    }
  };

  // Guardar plano en Supabase y LocalStorage
  const handleGuardarDistribucion = async () => {
    soundManager.playVintageRegisterDing();
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("dencker_mesas_layout", JSON.stringify(storeMesas));
      }
      if (supabase) {
        for (const m of storeMesas) {
          await supabase
            .from("mesas")
            .update({
              pos_x: m.pos_x,
              pos_y: m.pos_y,
              capacidad: m.capacidad,
              tipo: m.tipo,
            })
            .eq("numero", m.numero);
        }
      }
    } catch (e) {
      console.error("Error guardando distribución de mesas:", e);
    }
    setModoEdicion(false);
  };

  // Crear nueva mesa
  const handleCrearMesa = () => {
    soundManager.playSuccessTone();
    const newId = `m-${Date.now()}`;
    addMesa({
      numero: nuevaMesaData.numero,
      piso: nuevaMesaData.piso,
      subzona: nuevaMesaData.subzona as any,
      tipo: nuevaMesaData.tipo,
      capacidad: nuevaMesaData.capacidad,
      sillas: nuevaMesaData.capacidad,
      pos_x: 50,
      pos_y: 50,
      ancho: nuevaMesaData.tipo === "rectangular" ? 110 : 80,
      alto: 80,
      estado: "libre",
      activa: true,
      zona_id: nuevaMesaData.piso === "terraza" ? "z2" : "z1",
    });
    setModalNuevaMesa(false);
    setNuevaMesaData((prev) => ({
      ...prev,
      numero: prev.numero + 1,
    }));
  };

  // Renderizar sillas físicas alrededor de la mesa
  const renderChairs = (capacidad: number, tipo: TipoMesa, mesaId: string) => {
    const chairs = [];
    const count = Math.max(1, capacidad);
    const radius = tipo === "redonda" ? 44 : 46;

    for (let i = 0; i < count; i++) {
      const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
      const x = Math.round(50 + radius * Math.cos(angle));
      const y = Math.round(50 + radius * Math.sin(angle));

      chairs.push(
        <div
          key={i}
          style={{
            left: `${x}%`,
            top: `${y}%`,
            transform: "translate(-50%, -50%)",
          }}
          className="absolute w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#3D2619] border-2 border-[#D49B54] shadow-xs flex items-center justify-center pointer-events-none z-0"
        >
          <span className="text-[7px] text-[#FAF7F2] font-mono font-bold leading-none">
            {i + 1}
          </span>
        </div>
      );
    }
    return chairs;
  };

  // Click en mesa
  const handleMesaClick = (mesa: Mesa) => {
    if (modoEdicion) {
      setMesaEnEdicion(mesa);
      return;
    }
    soundManager.playTactileClick();
    if (onSelectMesa) {
      onSelectMesa(mesa);
    }
    setModalDetalleMesa(mesa);
    setCartMesa(mesa.numero);
  };

  return (
    <div className="w-full space-y-4">
      {/* ── BARRA SUPERIOR DE CONTROL: PISOS & MODO EDICIÓN ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-[#EAE2D5] dark:border-stone-800 shadow-xs">
        
        {/* Selector de Piso (Planta Baja ⇄ Terraza) */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F5EFEB] dark:bg-stone-800 rounded-xl border border-[#EAE2D5] dark:border-stone-700">
          <button
            type="button"
            onClick={() => {
              soundManager.playTactileClick();
              setPisoActivo("planta_baja");
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              pisoActivo === "planta_baja"
                ? "bg-[#1E130C] text-[#FAF7F2] shadow-sm"
                : "text-[#785E4F] dark:text-stone-300 hover:text-[#1E130C]"
            }`}
          >
            <span>🏠 Planta Baja (Salón & Patio)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
              {storeMesas.filter((m) => (m.piso || (m.numero >= 13 ? "terraza" : "planta_baja")) === "planta_baja").length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.playTactileClick();
              setPisoActivo("terraza");
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              pisoActivo === "terraza"
                ? "bg-[#991B24] text-white shadow-sm"
                : "text-[#785E4F] dark:text-stone-300 hover:text-[#1E130C]"
            }`}
          >
            <span>☀️ Terraza Jardín (Piso 2)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 text-white font-mono">
              {storeMesas.filter((m) => (m.piso || (m.numero >= 13 ? "terraza" : "planta_baja")) === "terraza").length}
            </span>
          </button>
        </div>

        {/* Acciones de Edición de Distribución */}
        {allowEditLayout && !readOnly && (
          <div className="flex items-center gap-2">
            {modoEdicion ? (
              <>
                <button
                  type="button"
                  onClick={() => setModalNuevaMesa(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                >
                  <Plus size={15} />
                  <span>Agregar Mesa</span>
                </button>

                <button
                  type="button"
                  onClick={handleGuardarDistribucion}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
                >
                  <Save size={15} />
                  <span>Guardar Plano</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModoEdicion(false)}
                  className="px-3 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold transition cursor-pointer hover:bg-stone-300"
                >
                  Salir
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  soundManager.playTactileClick();
                  setModoEdicion(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-[#F5EFEB] text-[#1E130C] dark:text-stone-200 border border-[#D9CDBF] text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
              >
                <Edit3 size={14} className="text-amber-600" />
                <span>Modificar Plano & Sillas</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── LIENZO ARQUITECTÓNICO DEL PLANO (CANVAS 2.5D INTERACTIVO) ── */}
      <div
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="w-full relative min-h-[580px] sm:min-h-[640px] rounded-3xl overflow-hidden border-2 border-[#1E130C]/20 dark:border-stone-800 bg-[#FAF7F2] dark:bg-[#120D0A] shadow-inner select-none"
        style={{
          backgroundImage:
            "radial-gradient(#1E130C 0.75px, transparent 0.75px), radial-gradient(#991B24 0.75px, #FAF7F2 0.75px)",
          backgroundSize: "28px 28px",
          backgroundPosition: "0 0, 14px 14px",
        }}
      >
        {/* ── REFERENCIAS ARQUITECTÓNICAS DE PLANTA BAJA SEGÚN CROQUIS ── */}
        {pisoActivo === "planta_baja" && (
          <>
            {/* Límite / Fachada Vidriada entre Patio Exterior y Salón */}
            <div className="absolute left-0 right-0 top-[70%] border-t-2 border-dashed border-amber-900/30 flex items-center justify-between px-6 pointer-events-none">
              <span className="text-[10px] uppercase font-bold text-amber-900/60 bg-[#FAF7F2]/80 px-2 py-0.5 rounded">
                ◄ Entrada Principal • Puerta Batiente de Vidrio
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-800/60 bg-[#FAF7F2]/80 px-2 py-0.5 rounded">
                Patio Exterior &amp; Sombrillas Dencker Pan ►
              </span>
            </div>

            {/* Zona Patio Exterior (Fondo Verde Suave) */}
            <div className="absolute inset-x-0 bottom-0 top-[70%] bg-emerald-500/[0.04] pointer-events-none" />

            {/* Bloque Arquitectónico: RECEPCIÓN & MOSTRADOR DE COBRO (Derecha media) */}
            <div className="absolute right-4 top-[35%] w-36 sm:w-44 h-32 rounded-2xl bg-amber-900/10 border-2 border-amber-900/30 p-2.5 flex flex-col justify-between pointer-events-none shadow-xs">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                <Coffee size={14} />
                <span>Recepción &amp; POS</span>
              </div>
              <p className="text-[10px] text-amber-800/70 leading-tight">
                Mostrador de cobro, vitrina pastelera y empaque
              </p>
              <div className="h-1.5 w-full bg-amber-900/20 rounded-full" />
            </div>

            {/* Bloque Arquitectónico: COCINA & BARISMO (Derecha media-alta) */}
            <div className="absolute right-4 top-[10%] w-36 sm:w-44 h-32 rounded-2xl bg-red-900/10 border-2 border-red-900/30 p-2.5 flex flex-col justify-between pointer-events-none shadow-xs">
              <div className="flex items-center gap-1.5 text-red-900 font-bold text-xs">
                <Flame size={14} />
                <span>Cocina &amp; Barismo</span>
              </div>
              <p className="text-[10px] text-red-800/70 leading-tight">
                Hornos de panadería, La Marzocco 4 Llamas y KDS
              </p>
              <div className="h-1.5 w-full bg-red-900/20 rounded-full" />
            </div>

            {/* Bloque Arquitectónico: BAÑOS (Extremo superior derecho) */}
            <div className="absolute right-4 top-2 px-3 py-1.5 rounded-xl bg-stone-200/80 dark:bg-stone-800 border border-stone-300 text-[10px] font-bold text-stone-600 dark:text-stone-300 pointer-events-none">
              🚻 BAÑOS
            </div>

            {/* Bloque Arquitectónico: ESCALERAS A TERRAZA */}
            <div
              onClick={() => setPisoActivo("terraza")}
              className="absolute left-4 top-3 px-3 py-2 rounded-2xl bg-stone-900 text-[#FAF7F2] text-xs font-bold shadow-md cursor-pointer hover:bg-[#991B24] transition flex items-center gap-2 z-20 group"
            >
              <span>Subir a Terraza (Piso 2)</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>

            {/* Salón Interior (Izquierda) */}
            <div className="absolute left-6 top-14 text-xs font-mono font-bold text-stone-400 tracking-wider pointer-events-none">
              SALÓN PRINCIPAL (MESAS INTERIORES)
            </div>
          </>
        )}

        {/* ── REFERENCIAS ARQUITECTÓNICAS DE TERRAZA SEGÚN CROQUIS ── */}
        {pisoActivo === "terraza" && (
          <>
            {/* Barandado Perimetral con Vista Panorámica */}
            <div className="absolute inset-x-4 top-4 h-10 border-b-2 border-dashed border-amber-600/40 flex items-center justify-between px-4 pointer-events-none">
              <span className="text-[11px] font-bold text-amber-900/70 flex items-center gap-1.5">
                <Sun size={14} className="text-amber-500" />
                Barandado con Vista a la Alameda Salamanca (Cochabamba)
              </span>
              <span className="text-[10px] text-stone-500">Aire Libre &bull; Sombrillas</span>
            </div>

            {/* Escaleras de Llegada desde Planta Baja */}
            <div
              onClick={() => setPisoActivo("planta_baja")}
              className="absolute right-4 bottom-4 px-3.5 py-2.5 rounded-2xl bg-stone-900 text-[#FAF7F2] text-xs font-bold shadow-md cursor-pointer hover:bg-amber-900 transition flex items-center gap-2 z-20 group"
            >
              <ArrowRight size={13} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
              <span>Bajar a Planta Baja</span>
            </div>
          </>
        )}

        {/* ── RENDERIZADO ESPACIAL DE CADA MESA ── */}
        {mesasPiso.map((mesa) => {
          const pedido = getPedidoMesa(mesa.numero);
          const tieneAlerta = alertas.some((a) => a.mesa_numero === mesa.numero);
          const isSelected = mesaSeleccionadaId === mesa.id;
          const isDragging = mesaArrastrando === mesa.id;

          const statusStyles = {
            libre: {
              border: "border-emerald-600 bg-emerald-500/15 text-emerald-950",
              tag: "bg-emerald-600 text-white",
              label: "Libre",
            },
            ocupada: {
              border: "border-amber-600 bg-amber-500/25 text-amber-950",
              tag: "bg-amber-600 text-white",
              label: "Ocupada",
            },
            reservada: {
              border: "border-purple-600 bg-purple-500/20 text-purple-950",
              tag: "bg-purple-600 text-white",
              label: "Reserva",
            },
            limpieza: {
              border: "border-blue-500 bg-blue-500/20 text-blue-950",
              tag: "bg-blue-600 text-white",
              label: "Limpieza",
            },
          }[mesa.estado];

          const isRound = mesa.tipo === "redonda";
          const isRect = mesa.tipo === "rectangular";

          return (
            <div
              key={mesa.id}
              onPointerDown={(e) => handlePointerDown(mesa.id, e)}
              onClick={() => handleMesaClick(mesa)}
              style={{
                left: `${mesa.pos_x}%`,
                top: `${mesa.pos_y}%`,
                transform: "translate(-50%, -50%)",
              }}
              className={`absolute cursor-pointer transition-transform group select-none z-10 ${
                isDragging ? "scale-110 z-30 cursor-grabbing" : "hover:scale-105 active:scale-95"
              }`}
            >
              {/* Sillas alrededor */}
              {renderChairs(mesa.capacidad, mesa.tipo, mesa.id)}

              {/* Superficie de la mesa */}
              <div
                className={`relative flex flex-col items-center justify-center p-2.5 transition-all shadow-md backdrop-blur-md border-2 ${
                  statusStyles.border
                } ${isRound ? "rounded-full w-20 h-20 sm:w-22 sm:h-22" : isRect ? "rounded-2xl w-28 h-20 sm:w-32 sm:h-22" : "rounded-2xl w-20 h-20 sm:w-22 sm:h-22"} ${
                  isSelected ? "ring-4 ring-amber-600 shadow-xl" : ""
                } ${tieneAlerta ? "ring-4 ring-red-500 animate-pulse bg-red-500/30" : ""}`}
              >
                {/* Número de Mesa */}
                <span className="font-serif font-black text-base sm:text-lg leading-none">
                  M-{mesa.numero}
                </span>

                {/* Sillas / Pax */}
                <div className="flex items-center gap-1 text-[10px] font-bold text-stone-700 dark:text-stone-300 mt-0.5">
                  <Users size={11} />
                  <span>{mesa.capacidad} sillas</span>
                </div>

                {/* Pedido Activo / Subtotal */}
                {pedido ? (
                  <span className="mt-1 text-[10px] font-mono font-black px-1.5 py-0.5 rounded-md bg-[#1E130C] text-amber-300 shadow-xs">
                    Bs {pedido.total.toFixed(0)}
                  </span>
                ) : (
                  <span
                    className={`mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${statusStyles.tag}`}
                  >
                    {statusStyles.label}
                  </span>
                )}

                {/* Alerta de Mozo */}
                {tieneAlerta && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg animate-bounce text-[10px]">
                    <Bell size={11} />
                  </span>
                )}

                {/* Indicador de edición */}
                {modoEdicion && (
                  <span className="absolute -bottom-2 -right-2 p-1 rounded-full bg-stone-900 text-white shadow">
                    <Move size={10} />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── MODAL NUEVA MESA ── */}
      <AnimatePresence>
        {modalNuevaMesa && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-serif text-lg font-bold">Agregar Nueva Mesa</h3>
                <button
                  onClick={() => setModalNuevaMesa(false)}
                  className="p-1 rounded-full hover:bg-stone-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">Número de Mesa</label>
                  <input
                    type="number"
                    value={nuevaMesaData.numero}
                    onChange={(e) =>
                      setNuevaMesaData({ ...nuevaMesaData, numero: parseInt(e.target.value) || 1 })
                    }
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 font-mono font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold block mb-1">Piso</label>
                    <select
                      value={nuevaMesaData.piso}
                      onChange={(e) =>
                        setNuevaMesaData({ ...nuevaMesaData, piso: e.target.value as PisoCafeteria })
                      }
                      className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 font-medium"
                    >
                      <option value="planta_baja">Planta Baja</option>
                      <option value="terraza">Terraza (Piso 2)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Forma</label>
                    <select
                      value={nuevaMesaData.tipo}
                      onChange={(e) =>
                        setNuevaMesaData({ ...nuevaMesaData, tipo: e.target.value as TipoMesa })
                      }
                      className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 font-medium"
                    >
                      <option value="cuadrada">Cuadrada ⬛</option>
                      <option value="redonda">Redonda ⭕</option>
                      <option value="rectangular">Rectangular ▭</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold block mb-1">Cantidad de Sillas (Capacidad)</label>
                  <div className="flex gap-2">
                    {[2, 4, 6, 8, 10].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNuevaMesaData({ ...nuevaMesaData, capacidad: c })}
                        className={`flex-1 py-2 rounded-xl font-bold border transition ${
                          nuevaMesaData.capacidad === c
                            ? "bg-[#991B24] text-white border-[#7F1D1D]"
                            : "bg-stone-50 border-stone-200 hover:bg-stone-100"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNuevaMesa(false)}
                  className="flex-1 py-2.5 rounded-xl border text-stone-600 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCrearMesa}
                  className="flex-1 py-2.5 rounded-xl bg-[#1E130C] text-white font-bold text-xs hover:bg-black transition shadow"
                >
                  Crear Mesa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL EDICIÓN RÁPIDA DE MESA EN MODO DISEÑADOR ── */}
      <AnimatePresence>
        {mesaEnEdicion && modoEdicion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-serif text-lg font-bold">Mesa {mesaEnEdicion.numero}</h3>
                <button onClick={() => setMesaEnEdicion(null)} className="p-1 rounded-full">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">Capacidad / Sillas</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 4, 6, 8, 10].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          updateMesa(mesaEnEdicion.id, { capacidad: s, sillas: s });
                          setMesaEnEdicion({ ...mesaEnEdicion, capacidad: s, sillas: s });
                        }}
                        className={`flex-1 py-1.5 rounded-xl font-bold border transition ${
                          mesaEnEdicion.capacidad === s
                            ? "bg-[#991B24] text-white border-[#7F1D1D]"
                            : "bg-stone-50 border-stone-200"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold block mb-1">Forma</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["cuadrada", "redonda", "rectangular"] as TipoMesa[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          updateMesa(mesaEnEdicion.id, { tipo: t });
                          setMesaEnEdicion({ ...mesaEnEdicion, tipo: t });
                        }}
                        className={`py-2 rounded-xl font-bold border capitalize transition ${
                          mesaEnEdicion.tipo === t
                            ? "bg-[#1E130C] text-white"
                            : "bg-stone-50 border-stone-200"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`¿Eliminar Mesa ${mesaEnEdicion.numero}?`)) {
                      deleteMesa(mesaEnEdicion.id);
                      setMesaEnEdicion(null);
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs flex items-center gap-1.5"
                >
                  <Trash2 size={13} />
                  <span>Eliminar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMesaEnEdicion(null)}
                  className="px-4 py-2 rounded-xl bg-[#1E130C] text-white font-bold text-xs"
                >
                  Listo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL DETALLE DE MESA: PEDIDOS, COMENSALES & CUENTAS SEPARADAS ── */}
      <AnimatePresence>
        {modalDetalleMesa && !modoEdicion && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-t-[28px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl border-t sm:border border-stone-200 dark:border-stone-800 max-h-[88vh] overflow-y-auto space-y-4 pb-safe"
            >
              {/* Header Modal */}
              <div className="flex items-start justify-between border-b pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#1E130C] text-amber-300 flex items-center justify-center font-serif font-black text-xl shadow-md">
                    M-{modalDetalleMesa.numero}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold flex items-center gap-2">
                      <span>Mesa {modalDetalleMesa.numero}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold capitalize">
                        {modalDetalleMesa.piso === "terraza" ? "Terraza" : "Planta Baja"}
                      </span>
                    </h3>
                    <p className="text-xs text-stone-500">
                      Capacidad: {modalDetalleMesa.capacidad} sillas &bull; Estado: {modalDetalleMesa.estado}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setModalDetalleMesa(null)}
                  className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Pestañas: General / Por Asiento / Cuentas Separadas */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl text-xs font-bold">
                <button
                  onClick={() => setSubTabDetalle("general")}
                  className={`py-2 rounded-xl transition ${
                    subTabDetalle === "general"
                      ? "bg-white dark:bg-stone-900 shadow-xs text-stone-900 dark:text-stone-100"
                      : "text-stone-600 dark:text-stone-400"
                  }`}
                >
                  Comanda General
                </button>
                <button
                  onClick={() => setSubTabDetalle("asientos")}
                  className={`py-2 rounded-xl transition flex items-center justify-center gap-1 ${
                    subTabDetalle === "asientos"
                      ? "bg-white dark:bg-stone-900 shadow-xs text-stone-900 dark:text-stone-100"
                      : "text-stone-600 dark:text-stone-400"
                  }`}
                >
                  <Users size={12} />
                  <span>Sillas ({modalDetalleMesa.capacidad})</span>
                </button>
                <button
                  onClick={() => setSubTabDetalle("cuenta_separada")}
                  className={`py-2 rounded-xl transition flex items-center justify-center gap-1 ${
                    subTabDetalle === "cuenta_separada"
                      ? "bg-[#991B24] text-white shadow-xs"
                      : "text-[#991B24]"
                  }`}
                >
                  <Split size={12} />
                  <span>Dividir Cuenta</span>
                </button>
              </div>

              {/* CONTENIDO TAB 1: COMANDA GENERAL */}
              {subTabDetalle === "general" && (
                <div className="space-y-3">
                  {getPedidoMesa(modalDetalleMesa.numero)?.items?.length ? (
                    <div className="space-y-2">
                      {getPedidoMesa(modalDetalleMesa.numero)?.items?.map((it, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold block">{it.producto_nombre}</span>
                            <span className="text-[10px] text-stone-400">
                              {it.asiento_numero ? `Asignado a: Silla ${it.asiento_numero}` : "Comanda compartida"}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-amber-900 dark:text-amber-400">
                            Bs {it.subtotal.toFixed(2)}
                          </span>
                        </div>
                      ))}

                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                        <span className="font-bold text-xs">Total Comanda:</span>
                        <span className="font-mono font-black text-lg text-amber-900 dark:text-amber-300">
                          Bs {getPedidoMesa(modalDetalleMesa.numero)?.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center space-y-2">
                      <div className="text-3xl">☕</div>
                      <p className="text-xs font-bold text-stone-600">No hay comanda activa</p>
                      <p className="text-[11px] text-stone-400">La mesa está libre para nuevos clientes</p>
                    </div>
                  )}
                </div>
              )}

              {/* CONTENIDO TAB 2: COMENSALES POR SILLA (ASIENTOS) */}
              {subTabDetalle === "asientos" && (
                <div className="space-y-3">
                  <div className="text-xs text-stone-500">
                    Asigna un nombre a cada silla para rastrear pedidos individuales y dividir la cuenta:
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[...Array(modalDetalleMesa.capacidad)].map((_, i) => {
                      const seatNum = i + 1;
                      const nombreGuardado = modalDetalleMesa.asientos_nombres?.[seatNum];
                      const itemsAsiento = getPedidoMesa(modalDetalleMesa.numero)?.items?.filter(
                        (it) => it.asiento_numero === seatNum
                      );
                      const subtotalAsiento = itemsAsiento?.reduce((acc, it) => acc + it.subtotal, 0) || 0;

                      return (
                        <div
                          key={seatNum}
                          className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs flex items-center gap-1">
                              <span className="w-5 h-5 rounded-full bg-[#1E130C] text-white flex items-center justify-center text-[10px]">
                                {seatNum}
                              </span>
                              <span>{nombreGuardado || `Silla ${seatNum}`}</span>
                            </span>
                            <span className="font-mono text-[11px] font-bold text-amber-900">
                              Bs {subtotalAsiento.toFixed(2)}
                            </span>
                          </div>

                          <div className="text-[10px] text-stone-400">
                            {itemsAsiento?.length ? `${itemsAsiento.length} productos` : "Sin consumos"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CONTENIDO TAB 3: CUENTAS SEPARADAS (SPLIT BILL) */}
              {subTabDetalle === "cuenta_separada" && (
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-950 dark:text-red-200">
                    <strong>División de Cuenta Inmediata:</strong> Cobra a cada comensal exactamente lo que consumió en su asiento o divide en partes iguales.
                  </div>

                  <div className="space-y-2">
                    {[...Array(modalDetalleMesa.capacidad)].map((_, i) => {
                      const seatNum = i + 1;
                      const itemsAsiento = getPedidoMesa(modalDetalleMesa.numero)?.items?.filter(
                        (it) => it.asiento_numero === seatNum
                      );
                      const subtotal = itemsAsiento?.reduce((acc, it) => acc + it.subtotal, 0) || 0;
                      if (subtotal === 0) return null;

                      return (
                        <div
                          key={seatNum}
                          className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold block">
                              Silla {seatNum} {modalDetalleMesa.asientos_nombres?.[seatNum] ? `(${modalDetalleMesa.asientos_nombres[seatNum]})` : ""}
                            </span>
                            <span className="text-[10px] text-stone-500">
                              {itemsAsiento?.map((it) => it.producto_nombre).join(", ")}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-[#991B24]">
                              Bs {subtotal.toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                soundManager.playVintageRegisterDing();
                                alert(`Cobrando Silla ${seatNum}: Bs ${subtotal.toFixed(2)}`);
                              }}
                              className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]"
                            >
                              Cobrar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const total = getPedidoMesa(modalDetalleMesa.numero)?.total || 0;
                        const partes = modalDetalleMesa.capacidad;
                        alert(`Total Bs ${total.toFixed(2)} dividido entre ${partes} personas = Bs ${(total / partes).toFixed(2)} por persona.`);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs"
                    >
                      Dividir en Partes Iguales (÷{modalDetalleMesa.capacidad})
                    </button>
                    <a
                      href={`/pago/${getPedidoMesa(modalDetalleMesa.numero)?.id || "PED-1"}?modo=mesa`}
                      className="flex-1 py-2.5 rounded-xl bg-[#991B24] hover:bg-[#7F1D1D] text-white font-bold text-xs text-center shadow-md"
                    >
                      Cobrar Todo Junto
                    </a>
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

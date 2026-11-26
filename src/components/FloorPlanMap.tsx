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
  Thermometer,
  Activity,
  TrendingUp,
  Clock,
  Compass,
  Eye,
  EyeOff,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { Mesa, TipoMesa, PisoCafeteria, EstadoMesa, ItemPedido, Pedido } from "@/types";
import { useSystemStore, useCartStore, useUIStore } from "@/store";
import { soundManager } from "@/lib/sound";
import { supabase } from "@/lib/supabase";
import { SEED_MESAS } from "@/lib/seed-data";

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
  const setMesas = useSystemStore((state) => state.setMesas);
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

  // Visor y Superposición de Plano de Evacuación Oficial
  const [modalPlanoEvacuacion, setModalPlanoEvacuacion] = useState(false);
  const [tipoPlanoVisor, setTipoPlanoVisor] = useState<"anotado" | "original">("anotado");
  const [modoBlueprint, setModoBlueprint] = useState(false);

  // Estados Mapa de Calor & Aforo en Vivo
  const [modoCalor, setModoCalor] = useState(false);
  const [metricaCalor, setMetricaCalor] = useState<"ocupacion" | "consumo" | "tiempo">("ocupacion");

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

  // Restaurar desde localStorage al montar si existe layout guardado previo
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("dencker_mesas_layout");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMesas(parsed);
          }
        }
      } catch (e) {
        console.error("Error cargando layout guardado de mesas:", e);
      }
    }
  }, [setMesas]);

  // Filtrar mesas según piso activo (Planta Baja: 1-15 | Terraza: 16-21)
  const mesasPiso = useMemo(() => {
    return storeMesas.filter((m) => {
      const p = m.piso || (m.numero >= 16 ? "terraza" : "planta_baja");
      return p === pisoActivo;
    });
  }, [storeMesas, pisoActivo]);

  // Estadísticas globales de aforo y ocupación en vivo para el dueño/admin
  const metricasAforo = useMemo(() => {
    let capacidadPB = 0;
    let personasPB = 0;
    let capacidadTerraza = 0;
    let personasTerraza = 0;
    let mesasOcupadasCount = 0;
    let consumoTotalEnVivo = 0;

    storeMesas.forEach((mesa) => {
      const p = mesa.piso || (mesa.numero >= 16 ? "terraza" : "planta_baja");
      const ped = pedidos.find(
        (o) => o.mesa_numero === mesa.numero && o.estado !== "pagado" && o.estado !== "cancelado"
      );
      const estaOcupada = mesa.estado === "ocupada" || !!ped;

      let pax = 0;
      if (estaOcupada) {
        mesasOcupadasCount++;
        const asignados = mesa.asientos_nombres ? Object.keys(mesa.asientos_nombres).length : 0;
        pax = asignados > 0 ? asignados : mesa.capacidad;
      }

      if (ped) {
        consumoTotalEnVivo += ped.total;
      }

      if (p === "terraza") {
        capacidadTerraza += mesa.capacidad;
        personasTerraza += pax;
      } else {
        capacidadPB += mesa.capacidad;
        personasPB += pax;
      }
    });

    const capacidadTotal = capacidadPB + capacidadTerraza;
    const personasTotal = personasPB + personasTerraza;
    const porcentajeTotal = capacidadTotal > 0 ? Math.round((personasTotal / capacidadTotal) * 100) : 0;
    const porcentajePB = capacidadPB > 0 ? Math.round((personasPB / capacidadPB) * 100) : 0;
    const porcentajeTerraza = capacidadTerraza > 0 ? Math.round((personasTerraza / capacidadTerraza) * 100) : 0;

    return {
      capacidadTotal,
      personasTotal,
      porcentajeTotal,
      capacidadPB,
      personasPB,
      porcentajePB,
      capacidadTerraza,
      personasTerraza,
      porcentajeTerraza,
      mesasOcupadasCount,
      mesasLibresCount: storeMesas.length - mesasOcupadasCount,
      consumoTotalEnVivo,
    };
  }, [storeMesas, pedidos]);

  // Cálculo de intensidad térmica para cada mesa
  const getMesaHeatData = (mesa: Mesa, ped?: Pedido) => {
    const estaOcupada = mesa.estado === "ocupada" || !!ped;

    if (!estaOcupada) {
      return {
        intensity: 0,
        badge: "❄️ Libre",
        badgeBg: "bg-emerald-600/80 text-white",
        glowColor: "rgba(16, 185, 129, 0.18)",
        tableBg: "bg-emerald-500/10 border-emerald-500/40",
      };
    }

    if (metricaCalor === "ocupacion") {
      const asignados = mesa.asientos_nombres ? Object.keys(mesa.asientos_nombres).length : 0;
      const pax = asignados > 0 ? asignados : mesa.capacidad;
      const ratio = pax / mesa.capacidad;

      if (ratio >= 1) {
        return {
          intensity: 1,
          badge: `🔥 100% LLENO`,
          badgeBg: "bg-red-600 text-white shadow-md shadow-red-600/40 animate-pulse font-black",
          glowColor: "rgba(239, 68, 68, 0.70)",
          tableBg: "bg-red-600/25 border-red-500",
        };
      } else if (ratio >= 0.7) {
        return {
          intensity: 0.75,
          badge: `🌡️ ${Math.round(ratio * 100)}% (${pax}/${mesa.capacidad})`,
          badgeBg: "bg-orange-500 text-white font-bold",
          glowColor: "rgba(249, 115, 22, 0.55)",
          tableBg: "bg-orange-500/20 border-orange-400",
        };
      } else if (ratio >= 0.5) {
        return {
          intensity: 0.5,
          badge: `🟡 ${Math.round(ratio * 100)}% (${pax}/${mesa.capacidad})`,
          badgeBg: "bg-amber-500 text-stone-950 font-bold",
          glowColor: "rgba(245, 158, 11, 0.45)",
          tableBg: "bg-amber-500/20 border-amber-400",
        };
      } else {
        return {
          intensity: 0.25,
          badge: `🟡 ${Math.round(ratio * 100)}% (${pax}/${mesa.capacidad})`,
          badgeBg: "bg-yellow-400 text-stone-950",
          glowColor: "rgba(234, 179, 8, 0.35)",
          tableBg: "bg-yellow-400/15 border-yellow-300",
        };
      }
    } else if (metricaCalor === "consumo") {
      const total = ped ? ped.total : 0;
      if (total >= 100) {
        return {
          intensity: 1,
          badge: `🔥 Bs ${total.toFixed(0)}`,
          badgeBg: "bg-red-600 text-white shadow-md shadow-red-600/40 font-black",
          glowColor: "rgba(239, 68, 68, 0.70)",
          tableBg: "bg-red-600/25 border-red-500",
        };
      } else if (total >= 60) {
        return {
          intensity: 0.7,
          badge: `🌡️ Bs ${total.toFixed(0)}`,
          badgeBg: "bg-orange-500 text-white font-bold",
          glowColor: "rgba(249, 115, 22, 0.55)",
          tableBg: "bg-orange-500/20 border-orange-400",
        };
      } else {
        return {
          intensity: 0.4,
          badge: `🟡 Bs ${total.toFixed(0)}`,
          badgeBg: "bg-amber-500 text-stone-950 font-bold",
          glowColor: "rgba(245, 158, 11, 0.45)",
          tableBg: "bg-amber-500/20 border-amber-400",
        };
      }
    } else {
      // Tiempo de permanencia
      let minutos = 20;
      if (ped?.created_at) {
        minutos = Math.max(5, Math.round((Date.now() - new Date(ped.created_at).getTime()) / 60000));
      }

      if (minutos >= 50) {
        return {
          intensity: 1,
          badge: `🔥 ${minutos}m (Rotar)`,
          badgeBg: "bg-red-600 text-white shadow-md shadow-red-600/40 font-black animate-pulse",
          glowColor: "rgba(239, 68, 68, 0.70)",
          tableBg: "bg-red-600/25 border-red-500",
        };
      } else if (minutos >= 30) {
        return {
          intensity: 0.65,
          badge: `⏱️ ${minutos} min`,
          badgeBg: "bg-orange-500 text-white font-bold",
          glowColor: "rgba(249, 115, 22, 0.55)",
          tableBg: "bg-orange-500/20 border-orange-400",
        };
      } else {
        return {
          intensity: 0.3,
          badge: `✨ ${minutos} min`,
          badgeBg: "bg-amber-400 text-stone-950 font-medium",
          glowColor: "rgba(245, 158, 11, 0.35)",
          tableBg: "bg-amber-400/15 border-amber-300",
        };
      }
    }
  };

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

  // Restablecer a la distribución oficial calibrada con el Plano de Evacuación
  const handleRestablecerPlanoOficial = () => {
    if (
      confirm(
        "¿Restablecer el plano a la distribución oficial del Plano de Evacuación arquitectónico (21 mesas)?"
      )
    ) {
      soundManager.playSuccessTone();
      setMesas(SEED_MESAS);
      if (typeof window !== "undefined") {
        localStorage.setItem("dencker_mesas_layout", JSON.stringify(SEED_MESAS));
      }
    }
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
      {/* ── BARRA SUPERIOR DE CONTROL: PISOS, VISOR DE PLANO & MODO EDICIÓN ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-[#EAE2D5] dark:border-stone-800 shadow-xs">
        
        {/* Selector de Piso (Planta Baja ⇄ Terraza), Visor y Blueprint */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de Plantas */}
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
                {
                  storeMesas.filter(
                    (m) => (m.piso || (m.numero >= 16 ? "terraza" : "planta_baja")) === "planta_baja"
                  ).length
                }
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
                {
                  storeMesas.filter(
                    (m) => (m.piso || (m.numero >= 16 ? "terraza" : "planta_baja")) === "terraza"
                  ).length
                }
              </span>
            </button>
          </div>

          {/* Botón Visor Plano de Evacuación Real */}
          <button
            type="button"
            onClick={() => {
              soundManager.playTactileClick();
              setModalPlanoEvacuacion(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-950 dark:text-amber-200 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
            title="Ver fotografía oficial del Plano de Evacuación y Croquis"
          >
            <Compass size={14} className="text-[#991B24]" />
            <span>Plano Evacuación</span>
          </button>

          {/* Switch Capa Blueprint en Planta Baja */}
          {pisoActivo === "planta_baja" && (
            <button
              type="button"
              onClick={() => {
                soundManager.playTactileClick();
                setModoBlueprint((prev) => !prev);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                modoBlueprint
                  ? "bg-sky-700 text-white border-sky-600 shadow-xs"
                  : "bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:text-stone-900"
              }`}
              title="Superponer imagen técnica del plano en el lienzo"
            >
              {modoBlueprint ? <Eye size={13} /> : <EyeOff size={13} />}
              <span>{modoBlueprint ? "Blueprint Activo" : "Capa Blueprint"}</span>
            </button>
          )}

          {/* Botón Switch Modo Mapa de Calor */}
          <div className="flex items-center gap-1 bg-[#F5EFEB] dark:bg-stone-800 p-1 rounded-xl border border-[#EAE2D5] dark:border-stone-700">
            <button
              type="button"
              onClick={() => {
                soundManager.playTactileClick();
                setModoCalor(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                !modoCalor
                  ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs"
                  : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
            >
              <Layers size={13} />
              <span>Operativo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.playTactileClick();
                setModoCalor(true);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                modoCalor
                  ? "bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md shadow-red-600/30 font-black animate-pulse"
                  : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
            >
              <Thermometer size={14} className={modoCalor ? "text-white" : "text-amber-600"} />
              <span>Mapa de Calor</span>
            </button>
          </div>

          {/* Sub-selector de Métrica de Calor */}
          {modoCalor && (
            <div className="flex items-center gap-1 bg-red-950/10 dark:bg-stone-800/80 p-1 rounded-xl border border-red-500/20 text-xs">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setMetricaCalor("ocupacion");
                }}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                  metricaCalor === "ocupacion"
                    ? "bg-red-600 text-white shadow-xs"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
                }`}
              >
                👥 Aforo / Sillas
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setMetricaCalor("consumo");
                }}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                  metricaCalor === "consumo"
                    ? "bg-red-600 text-white shadow-xs"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
                }`}
              >
                💰 Consumo Bs
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setMetricaCalor("tiempo");
                }}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                  metricaCalor === "tiempo"
                    ? "bg-red-600 text-white shadow-xs"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
                }`}
              >
                ⏱️ Rotación
              </button>
            </div>
          )}
        </div>

        {/* Acciones de Edición de Distribución */}
        {allowEditLayout && !readOnly && (
          <div className="flex items-center gap-2">
            {modoEdicion ? (
              <>
                <button
                  type="button"
                  onClick={handleRestablecerPlanoOficial}
                  className="px-3 py-2 rounded-xl bg-amber-100 dark:bg-amber-950/40 hover:bg-amber-200 text-amber-900 dark:text-amber-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-amber-300 dark:border-amber-700"
                  title="Restablecer posiciones al plano oficial de evacuación"
                >
                  <RotateCcw size={13} />
                  <span>Restablecer Oficial</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalNuevaMesa(true)}
                  className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
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
                <span>Mover Mesas &amp; Sillas</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── HUD DE AFORO & OCUPACIÓN EN TIEMPO REAL (MÉTRICAS DUEÑO/ADMIN) ── */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-stone-900 via-[#1F130B] to-stone-900 text-white border border-amber-500/20 shadow-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold border ${
                metricasAforo.porcentajeTotal >= 85
                  ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse"
                  : metricasAforo.porcentajeTotal >= 50
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                  : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
              }`}
            >
              <Activity size={20} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-base text-white">
                  Ocupación de Cafetería: {metricasAforo.porcentajeTotal}%
                </span>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    metricasAforo.porcentajeTotal >= 85
                      ? "bg-red-500 text-white animate-pulse"
                      : metricasAforo.porcentajeTotal >= 50
                      ? "bg-amber-500 text-stone-950"
                      : "bg-emerald-500 text-white"
                  }`}
                >
                  {metricasAforo.porcentajeTotal >= 85
                    ? "🔥 ALTA AFLUENCIA"
                    : metricasAforo.porcentajeTotal >= 50
                    ? "🟡 MODERADO"
                    : "🟢 ESPACIO LIBRE"}
                </span>
              </div>
              <p className="text-xs text-stone-300 font-medium">
                <strong>{metricasAforo.personasTotal}</strong> comensales sentados de{" "}
                <strong>{metricasAforo.capacidadTotal}</strong> sillas máximas &bull;{" "}
                {metricasAforo.mesasOcupadasCount} mesas ocupadas, {metricasAforo.mesasLibresCount} libres
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            {/* Planta Baja */}
            <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 flex items-center gap-2">
              <span className="text-stone-300">Planta Baja:</span>
              <span className="font-bold text-amber-300">
                {metricasAforo.personasPB}/{metricasAforo.capacidadPB} pax
              </span>
              <span className="text-[10px] text-stone-400">({metricasAforo.porcentajePB}%)</span>
            </div>

            {/* Terraza */}
            <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 flex items-center gap-2">
              <span className="text-stone-300">Terraza:</span>
              <span className="font-bold text-amber-300">
                {metricasAforo.personasTerraza}/{metricasAforo.capacidadTerraza} pax
              </span>
              <span className="text-[10px] text-stone-400">({metricasAforo.porcentajeTerraza}%)</span>
            </div>

            {/* Consumo Vivo */}
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1.5">
              <span>Sala:</span>
              <span>Bs {metricasAforo.consumoTotalEnVivo.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Barra de progreso de aforo */}
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden p-0.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, metricasAforo.porcentajeTotal)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full transition-all ${
              metricasAforo.porcentajeTotal >= 85
                ? "bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 shadow-[0_0_12px_#ef4444]"
                : metricasAforo.porcentajeTotal >= 50
                ? "bg-gradient-to-r from-emerald-500 via-yellow-500 to-amber-500"
                : "bg-gradient-to-r from-emerald-400 to-emerald-500"
            }`}
          />
        </div>
      </div>

      {/* ── LIENZO ARQUITECTÓNICO DEL PLANO (CANVAS 2.5D INTERACTIVO) ── */}
      <div
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="w-full relative min-h-[600px] sm:min-h-[680px] rounded-3xl overflow-hidden border-2 border-[#1E130C]/20 dark:border-stone-800 bg-[#FAF7F2] dark:bg-[#120D0A] shadow-inner select-none"
        style={{
          backgroundImage:
            "radial-gradient(#1E130C 0.75px, transparent 0.75px), radial-gradient(#991B24 0.75px, #FAF7F2 0.75px)",
          backgroundSize: "28px 28px",
          backgroundPosition: "0 0, 14px 14px",
        }}
      >
        {/* Capa Blueprint Semitransparente (Fondo técnico del Plano de Evacuación Oficial) */}
        {modoBlueprint && pisoActivo === "planta_baja" && (
          <div className="absolute inset-0 pointer-events-none z-0 opacity-20 filter contrast-125 brightness-95 overflow-hidden flex items-center justify-center">
            <img
              src="/img/planos/plano-evacuacion-anotado.jpg"
              alt="Plano Blueprint Evacuación Oficial"
              className="w-full h-full object-fill select-none"
            />
          </div>
        )}

        {/* ── REFERENCIAS ARQUITECTÓNICAS DE PLANTA BAJA SEGÚN PLANO OFICIAL ── */}
        {pisoActivo === "planta_baja" && (
          <>
            {/* Fachada Curva Salamanca (Esquina Arquitectónica Oficial con Av. Daniel Salamanca) */}
            <div className="absolute left-0 bottom-0 w-[42%] h-[32%] rounded-bl-[70px] border-b-4 border-l-4 border-[#1E130C]/30 bg-emerald-600/[0.04] pointer-events-none z-0">
              <div className="absolute left-4 bottom-3 flex items-center gap-1.5 text-[10px] font-bold text-emerald-900 dark:text-emerald-300 bg-[#FAF7F2]/95 dark:bg-stone-900/90 px-2.5 py-1 rounded-full shadow-xs border border-emerald-900/20">
                <span>🌿 Patio Curvo Salamanca (M-1 a M-5)</span>
              </div>
            </div>

            {/* Patio Exterior Derecho (Sombrillas y mesas de entrada) */}
            <div className="absolute right-0 bottom-0 w-[44%] h-[32%] border-b-4 border-r-4 border-[#1E130C]/30 bg-amber-600/[0.04] pointer-events-none z-0">
              <div className="absolute right-4 bottom-3 flex items-center gap-1.5 text-[10px] font-bold text-amber-900 dark:text-amber-300 bg-[#FAF7F2]/95 dark:bg-stone-900/90 px-2.5 py-1 rounded-full shadow-xs border border-amber-900/20">
                <span>☀️ Patio Exterior Entrada (M-6 a M-9)</span>
              </div>
            </div>

            {/* Pasillo Central de Ingreso y Salida de Emergencia (Las 2 líneas gruesas del plano) */}
            <div className="absolute left-[44%] w-[12%] bottom-0 top-[66%] border-x-4 border-[#1E130C]/40 bg-amber-950/[0.05] pointer-events-none flex flex-col justify-end items-center pb-2 z-0">
              <div className="px-2 py-1 rounded-md bg-emerald-700 text-white text-[9px] font-black uppercase flex items-center gap-1 shadow-md border border-emerald-400 animate-pulse">
                <span>🚪 Salida Emergencia</span>
              </div>
              <span className="text-[8px] font-mono font-bold text-stone-500 mt-0.5">
                ◄ Entrada Principal ►
              </span>
            </div>

            {/* Límite / Fachada Vidriada entre Patio Exterior e Interior */}
            <div className="absolute left-0 right-0 top-[66%] border-t-2 border-dashed border-amber-900/30 flex items-center justify-between px-6 pointer-events-none z-0">
              <span className="text-[9px] uppercase font-bold text-stone-600 bg-[#FAF7F2]/90 dark:bg-stone-900/90 px-2 py-0.5 rounded">
                ◄ Puerta Batiente de Vidrio
              </span>
              <span className="text-[9px] uppercase font-bold text-emerald-800 dark:text-emerald-300 bg-[#FAF7F2]/90 dark:bg-stone-900/90 px-2 py-0.5 rounded">
                Patio Exterior &amp; Sombrillas Dencker Pan ►
              </span>
            </div>

            {/* Salón Interior Climatizado (Izquierda) */}
            <div className="absolute left-4 top-18 w-[38%] h-[47%] rounded-2xl border-2 border-stone-800/40 bg-stone-100/30 dark:bg-stone-900/20 pointer-events-none p-2.5 flex flex-col justify-between shadow-2xs z-0">
              <div className="flex items-center justify-between text-[10px] font-bold text-stone-700 dark:text-stone-300">
                <span className="flex items-center gap-1">
                  <span>🏛️ Salón Climatizado</span>
                </span>
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 font-mono">
                  M-10 a M-14
                </span>
              </div>
              <div className="border-t border-dashed border-stone-300 dark:border-stone-700 text-[8px] text-stone-400 text-center py-0.5">
                Ventanales con vista al Patio Salamanca
              </div>
            </div>

            {/* Hall Central & Extintor Oficial (Frente a la mesa central M-15) */}
            <div className="absolute left-[41%] top-[33%] pointer-events-none flex items-center gap-1 bg-red-600 text-white px-2 py-0.5 rounded-full text-[8px] font-black shadow-xs z-10 animate-pulse">
              <span>🧯 EXTINTOR PQS</span>
            </div>

            {/* Bloque Arquitectónico: ESCALERAS REALES A TERRAZA (PISO 2) */}
            <div
              onClick={() => {
                soundManager.playTactileClick();
                setPisoActivo("terraza");
              }}
              className="absolute left-4 top-2.5 w-52 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-[#FAF7F2] p-2.5 shadow-xl border border-amber-500/30 cursor-pointer hover:border-amber-400 hover:scale-[1.02] transition-all z-20 group"
              title="Clic para subir a la Terraza"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600/80 flex items-center justify-center text-white text-xs font-black">
                    🪜
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider block text-amber-300">
                      Escalera a Terraza
                    </span>
                    <span className="text-[9px] text-stone-400">
                      Subir a Piso 2 (Mesas 16 a 21)
                    </span>
                  </div>
                </div>
                <ArrowRight size={14} className="text-amber-300 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Peldaños Arquitectónicos en Vector */}
              <div className="mt-2 grid grid-cols-6 gap-1 h-3 opacity-75 group-hover:opacity-100 transition-opacity">
                {[1, 2, 3, 4, 5, 6].map((step) => (
                  <div
                    key={step}
                    className="h-full bg-stone-700 rounded-xs border-r border-stone-600 flex items-center justify-center"
                  >
                    <span className="text-[6px] text-stone-400 font-mono">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bloque Arquitectónico: BARRA DE BARISMO 4 LLAMAS & RECEPCIÓN POS (Derecha) */}
            <div className="absolute right-4 top-[14%] w-[44%] h-[50%] rounded-3xl bg-amber-950/10 border-2 border-amber-900/30 p-3 flex flex-col justify-between pointer-events-none shadow-xs z-0">
              <div className="flex items-center justify-between text-amber-900 dark:text-amber-300 font-black text-xs border-b border-amber-900/20 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <Coffee size={14} className="text-amber-700" />
                  <span>Barra de Especialidad &amp; Recepción POS</span>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-200">
                  Café 4 Llamas
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[9px] text-amber-800/80">
                <div className="p-1.5 rounded-xl bg-white/50 dark:bg-stone-900/50 border border-amber-900/10">
                  <span className="font-bold block text-amber-950 dark:text-amber-100">☕ La Marzocco</span>
                  <span>Espresso &amp; Filtrados</span>
                </div>
                <div className="p-1.5 rounded-xl bg-white/50 dark:bg-stone-900/50 border border-amber-900/10">
                  <span className="font-bold block text-amber-950 dark:text-amber-100">🥐 Vitrina Pastelería</span>
                  <span>Masa madre viva &amp; Rolls</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[9px] text-stone-500 pt-1 border-t border-amber-900/10">
                <span>Mostrador de Cobro &amp; Empaque</span>
                <span>Terminal POS</span>
              </div>
            </div>

            {/* Bloque Arquitectónico: COCINA / OBRADOIRO & BAÑOS (Fondo superior derecho) */}
            <div className="absolute right-4 top-2 flex items-center gap-2 pointer-events-none z-10">
              <div className="px-2.5 py-1 rounded-xl bg-red-950/10 border border-red-900/30 text-[9px] font-bold text-red-900 dark:text-red-300 flex items-center gap-1">
                <Flame size={12} />
                <span>Cocina &amp; Hornos</span>
              </div>
              <div className="px-2.5 py-1 rounded-xl bg-stone-200/80 dark:bg-stone-800 border border-stone-300 text-[9px] font-bold text-stone-600 dark:text-stone-300">
                🚻 Baños
              </div>
            </div>
          </>
        )}

        {/* ── REFERENCIAS ARQUITECTÓNICAS DE TERRAZA SEGÚN CROQUIS ── */}
        {pisoActivo === "terraza" && (
          <>
            {/* Barandado Perimetral con Vista Panorámica */}
            <div className="absolute inset-x-4 top-4 h-12 border-b-2 border-dashed border-amber-600/40 flex items-center justify-between px-4 pointer-events-none bg-amber-500/[0.04] rounded-t-2xl z-0">
              <div className="flex items-center gap-2">
                <Sun size={15} className="text-amber-500" />
                <div>
                  <span className="text-[11px] font-black text-amber-950 dark:text-amber-200 block">
                    Terraza Mirador Alameda Salamanca
                  </span>
                  <span className="text-[9px] text-stone-500">
                    Piso 2 al aire libre &bull; Pérgolas, toldos y sombrillas
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-200">
                6 Mesas Panorámicas (M-16 a M-21)
              </span>
            </div>

            {/* Escalera de Bajada a Planta Baja */}
            <div
              onClick={() => {
                soundManager.playTactileClick();
                setPisoActivo("planta_baja");
              }}
              className="absolute right-6 bottom-5 px-4 py-2.5 rounded-2xl bg-stone-900 text-[#FAF7F2] text-xs font-bold shadow-xl cursor-pointer hover:bg-amber-900 transition flex items-center gap-2 z-20 group border border-amber-500/30"
              title="Bajar a Planta Baja"
            >
              <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform text-amber-300" />
              <div className="text-left">
                <span className="block text-[11px] font-black text-amber-300">Bajar a Planta Baja</span>
                <span className="block text-[9px] text-stone-400">Salón &amp; Patio Exterior</span>
              </div>
            </div>
          </>
        )}

        {/* ── RENDERIZADO ESPACIAL DE CADA MESA ── */}
        {mesasPiso.map((mesa) => {
          const pedido = getPedidoMesa(mesa.numero);
          const tieneAlerta = alertas.some((a) => a.mesa_numero === mesa.numero);
          const isSelected = mesaSeleccionadaId === mesa.id;
          const isDragging = mesaArrastrando === mesa.id;
          const heat = getMesaHeatData(mesa, pedido);

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
              {/* Halo Térmico / Heatmap Bloom (Cámara Térmica Infrarroja) */}
              {modoCalor && (
                <div
                  style={{
                    background: `radial-gradient(circle, ${heat.glowColor} 0%, rgba(239,68,68,0) 70%)`,
                  }}
                  className="absolute -inset-10 sm:-inset-14 rounded-full pointer-events-none filter blur-xl z-0 transition-all duration-700 animate-pulse"
                />
              )}

              {/* Sillas alrededor */}
              {renderChairs(mesa.capacidad, mesa.tipo, mesa.id)}

              {/* Superficie de la mesa */}
              <div
                className={`relative flex flex-col items-center justify-center p-2.5 transition-all shadow-md backdrop-blur-md border-2 ${
                  modoCalor ? heat.tableBg : statusStyles.border
                } ${
                  isRound
                    ? "rounded-full w-20 h-20 sm:w-22 sm:h-22"
                    : isRect
                    ? "rounded-2xl w-28 h-20 sm:w-32 sm:h-22"
                    : "rounded-2xl w-20 h-20 sm:w-22 sm:h-22"
                } ${isSelected ? "ring-4 ring-amber-600 shadow-xl" : ""} ${
                  tieneAlerta ? "ring-4 ring-red-500 animate-pulse bg-red-500/30" : ""
                }`}
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

                {/* Badge Dinámico: Modo Calor vs Modo Operativo */}
                {modoCalor ? (
                  <span
                    className={`mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${heat.badgeBg}`}
                  >
                    {heat.badge}
                  </span>
                ) : pedido ? (
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

        {/* Leyenda Térmica Flotante en Modo Mapa de Calor */}
        {modoCalor && (
          <div className="absolute left-4 bottom-4 p-2.5 rounded-2xl bg-stone-900/90 backdrop-blur-md border border-white/10 text-white text-[10px] shadow-xl z-20 space-y-1.5 pointer-events-none">
            <span className="font-bold flex items-center gap-1 text-amber-300 uppercase tracking-wider">
              <Thermometer size={12} />
              <span>Escala Térmica de Ocupación</span>
            </span>
            <div className="flex items-center gap-2 font-mono">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Libre</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span>25%</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>50%</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span>75%</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                <span className="font-bold text-red-400">100% LLENO</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL VISOR DE PLANO DE EVACUACIÓN OFICIAL ── */}
      <AnimatePresence>
        {modalPlanoEvacuacion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4 max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#991B24] text-white flex items-center justify-center shadow-md">
                    <Compass size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <span>Plano de Evacuación Oficial &amp; Croquis de Mesas</span>
                      <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Arquitectura Real
                      </span>
                    </h3>
                    <p className="text-xs text-stone-500">
                      Av. Daniel Salamanca, Cochabamba &bull; Distribución oficial de Planta Baja y Terraza
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModalPlanoEvacuacion(false)}
                  className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Selector de Vista: Plano Anotado vs Plano Limpio Original */}
              <div className="flex items-center justify-between gap-2 bg-stone-100 dark:bg-stone-800 p-1 rounded-2xl">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setTipoPlanoVisor("anotado")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      tipoPlanoVisor === "anotado"
                        ? "bg-[#991B24] text-white shadow-xs"
                        : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
                    }`}
                  >
                    🟢 Plano Anotado (Mesas Reales &amp; Puntos)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoPlanoVisor("original")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      tipoPlanoVisor === "original"
                        ? "bg-[#1E130C] text-white shadow-xs"
                        : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
                    }`}
                  >
                    🏛️ Plano Arquitectónico Limpio
                  </button>
                </div>

                <span className="text-[10px] text-stone-500 font-mono hidden sm:inline">
                  Dencker Pan S.R.L.
                </span>
              </div>

              {/* Contenedor de la Imagen del Plano */}
              <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-950 flex items-center justify-center min-h-[380px] max-h-[550px]">
                <img
                  src={
                    tipoPlanoVisor === "anotado"
                      ? "/img/planos/plano-evacuacion-anotado.jpg"
                      : "/img/planos/plano-evacuacion-original.jpg"
                  }
                  alt="Plano de Evacuación Planta Baja"
                  className="w-full h-auto max-h-[550px] object-contain select-none"
                />
              </div>

              {/* Leyenda y Explicación Técnica */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-stone-200 dark:border-stone-800">
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-1">
                  <span className="font-bold text-emerald-900 dark:text-emerald-300 block">
                    🌿 Patios Exteriores (9 Mesas)
                  </span>
                  <p className="text-[11px] text-emerald-800/80 leading-relaxed">
                    5 mesas en el patio curvo izquierdo y 4 mesas en el patio derecho al aire libre junto al pasillo de ingreso.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-1">
                  <span className="font-bold text-amber-900 dark:text-amber-300 block">
                    🏛️ Salón &amp; Hall (6 Mesas)
                  </span>
                  <p className="text-[11px] text-amber-800/80 leading-relaxed">
                    4 mesas cuadradas idénticas al plano impreso, 1 mesa familiar ventanal y 1 mesa central junto a la escalera.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 space-y-1">
                  <span className="font-bold text-red-900 dark:text-red-300 block">
                    🪜 Escalera &amp; Terraza (Piso 2)
                  </span>
                  <p className="text-[11px] text-red-800/80 leading-relaxed">
                    Acceso superior hacia la Terraza Jardín con 6 mesas panorámicas con vista a la Alameda Salamanca.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setModalPlanoEvacuacion(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#1E130C] text-white font-bold text-xs hover:bg-black transition cursor-pointer"
                >
                  Cerrar Visor
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                              Silla {seatNum}{" "}
                              {modalDetalleMesa.asientos_nombres?.[seatNum]
                                ? `(${modalDetalleMesa.asientos_nombres[seatNum]})`
                                : ""}
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
                        alert(
                          `Total Bs ${total.toFixed(2)} dividido entre ${partes} personas = Bs ${(
                            total / partes
                          ).toFixed(2)} por persona.`
                        );
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs cursor-pointer"
                    >
                      Dividir en Partes Iguales (÷{modalDetalleMesa.capacidad})
                    </button>
                    <a
                      href={`/pago/${getPedidoMesa(modalDetalleMesa.numero)?.id || "PED-1"}?modo=mesa`}
                      className="flex-1 py-2.5 rounded-xl bg-[#991B24] hover:bg-[#7F1D1D] text-white font-bold text-xs text-center shadow-md cursor-pointer"
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

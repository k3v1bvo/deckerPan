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

  // Visor y Superposición de Plano de Evacuación Oficial y Croquis
  const [modalPlanoEvacuacion, setModalPlanoEvacuacion] = useState(false);
  const [tipoPlanoVisor, setTipoPlanoVisor] = useState<"anotado" | "original" | "croquis">("anotado");
  const [modoBlueprint, setModoBlueprint] = useState(false);

  // Estados de capas visuales arquitectónicas en Planta Baja
  const [mostrarGrid, setMostrarGrid] = useState(false);
  const [mostrarZonas, setMostrarZonas] = useState(true);
  const [mostrarPasillo, setMostrarPasillo] = useState(true);
  const [mostrarSignage, setMostrarSignage] = useState(true);

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

  // Restaurar desde localStorage al montar si existe layout guardado previo v4
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("dencker_mesas_layout_v4");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].label) {
            setMesas(parsed);
            return;
          }
        }
        // Si no existe v4 o el formato es anterior, inicializar con SEED_MESAS oficial
        setMesas(SEED_MESAS);
        localStorage.setItem("dencker_mesas_layout_v4", JSON.stringify(SEED_MESAS));
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
        localStorage.setItem("dencker_mesas_layout_v4", JSON.stringify(storeMesas));
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

  // Restablecer a la distribución oficial calibrada con el Plano Arquitectónico
  const handleRestablecerPlanoOficial = () => {
    if (
      confirm(
        "¿Restablecer el plano a la distribución oficial del Plano Arquitectónico (15 mesas en Planta Baja + 6 en Terraza)?"
      )
    ) {
      soundManager.playSuccessTone();
      setMesas(SEED_MESAS);
      if (typeof window !== "undefined") {
        localStorage.setItem("dencker_mesas_layout_v4", JSON.stringify(SEED_MESAS));
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

          {/* Controles de Capas Arquitectónicas en Planta Baja */}
          {pisoActivo === "planta_baja" && (
            <div className="flex flex-wrap items-center gap-1 bg-[#F5EFEB] dark:bg-stone-800 p-1 rounded-xl border border-[#EAE2D5] dark:border-stone-700 text-xs">
              <button
                type="button"
                onClick={() => {
                  soundManager.playTactileClick();
                  setMostrarZonas((prev) => !prev);
                }}
                className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition flex items-center gap-1 cursor-pointer ${
                  mostrarZonas
                    ? "bg-[#1E130C] text-[#FAF7F2] shadow-xs"
                    : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
                }`}
                title="Mostrar u ocultar nombres de zonas en el plano"
              >
                <span>🏷️ Zonas</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playTactileClick();
                  setMostrarPasillo((prev) => !prev);
                }}
                className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition flex items-center gap-1 cursor-pointer ${
                  mostrarPasillo
                    ? "bg-[#1E130C] text-[#FAF7F2] shadow-xs"
                    : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
                }`}
                title="Mostrar u ocultar pasillo central de acceso"
              >
                <span>🚶 Pasillo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playTactileClick();
                  setMostrarSignage((prev) => !prev);
                }}
                className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition flex items-center gap-1 cursor-pointer ${
                  mostrarSignage
                    ? "bg-[#1E130C] text-[#FAF7F2] shadow-xs"
                    : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
                }`}
                title="Mostrar u ocultar extintores y salidas"
              >
                <span>🧯 Señalética</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playTactileClick();
                  setMostrarGrid((prev) => !prev);
                }}
                className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition flex items-center gap-1 cursor-pointer ${
                  mostrarGrid
                    ? "bg-[#1E130C] text-[#FAF7F2] shadow-xs"
                    : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
                }`}
                title="Mostrar u ocultar cuadrícula técnica"
              >
                <span>📐 Grilla</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playTactileClick();
                  setModoBlueprint((prev) => !prev);
                }}
                className={`px-2 py-1.5 rounded-lg font-bold text-[11px] transition flex items-center gap-1 cursor-pointer ${
                  modoBlueprint
                    ? "bg-sky-700 text-white shadow-xs"
                    : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
                }`}
                title="Superponer fotografía técnica original del plano"
              >
                {modoBlueprint ? <Eye size={12} /> : <EyeOff size={12} />}
                <span>Blueprint</span>
              </button>
            </div>
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
        className="w-full relative min-h-[620px] sm:min-h-[720px] rounded-3xl overflow-hidden border-2 border-[#1E130C]/20 dark:border-stone-800 bg-[#FAF7F2] dark:bg-[#120D0A] shadow-inner select-none p-2 sm:p-4 flex items-center justify-center"
        style={{
          backgroundImage:
            "radial-gradient(#1E130C 0.75px, transparent 0.75px), radial-gradient(#991B24 0.75px, #FAF7F2 0.75px)",
          backgroundSize: "28px 28px",
          backgroundPosition: "0 0, 14px 14px",
        }}
      >
        {/* Contenedor Proporcional 920 x 960 (Aspect Ratio Arquitectónico Exacto) */}
        <div
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative w-full max-w-[920px] aspect-[920/960] mx-auto select-none overflow-hidden rounded-2xl shadow-xl border border-stone-300 dark:border-stone-800 bg-white"
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

          {/* ── PLANO VECTORIAL ARQUITECTÓNICO OFICIAL DE PLANTA BAJA (VIEWBOX 0 0 920 960) ── */}
          {pisoActivo === "planta_baja" && (
            <>
              <svg
                id="floorplan-svg"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 920 960"
                className="absolute inset-0 w-full h-full block drop-shadow-md overflow-visible pointer-events-none select-none z-0"
              >
                <defs>
                  {/* Patrón de sombreado diagonal cálido para Patio Exterior */}
                  <pattern id="patio-hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(42)">
                    <rect width="14" height="14" fill="#f5efe6" />
                    <line x1="0" y1="0" x2="0" y2="14" stroke="#d9cdbc" strokeWidth="1.3" />
                  </pattern>

                  {/* Cuadrícula técnica arquitectónica */}
                  <pattern id="draft-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#94a3b8" strokeWidth="0.6" strokeOpacity="0.35" />
                  </pattern>
                  <pattern id="draft-grid-major" width="100" height="100" patternUnits="userSpaceOnUse">
                    <rect width="100" height="100" fill="url(#draft-grid)" />
                    <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#64748b" strokeWidth="0.9" strokeOpacity="0.35" />
                  </pattern>

                  {/* Filtro de sombra suave */}
                  <filter id="item-shadow" x="-25%" y="-25%" width="150%" height="150%">
                    <feDropShadow dx="0" dy="1.8" stdDeviation="2.2" floodColor="#0f172a" floodOpacity="0.16" />
                  </filter>

                  {/* Polígono de Recorte Perimetral Exacto del Edificio */}
                  <clipPath id="perimeter-clip">
                    <path d="M 80 100 L 830 100 L 830 380 L 690 380 L 690 770 L 340 885 C 195 925, 80 830, 80 680 Z" />
                  </clipPath>

                  {/* Superficie Barra Barismo 4 Llamas */}
                  <linearGradient id="bar-surface" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f1f5f9" />
                    <stop offset="100%" stopColor="#e2e8f0" />
                  </linearGradient>
                </defs>

                {/* Hoja de plano */}
                <rect x="20" y="25" width="880" height="910" rx="18" fill="#ffffff" stroke="#dbe2ea" strokeWidth="1.5" />

                {/* Encabezado Arquitectónico Oficial */}
                <g id="sheet-header" pointerEvents="none">
                  <text x="80" y="68" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="700" fill="#334155" letterSpacing="1.2">
                    DENCKER PAN — PLANO ARQUITECTÓNICO PLANTA BAJA
                  </text>
                  <text x="830" y="68" textAnchor="end" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="600" fill="#94a3b8">
                    15 MESAS · 58 PAX (PATIO P1-P9 &bull; SALÓN M1-M6)
                  </text>
                  <line x1="80" y1="80" x2="830" y2="80" stroke="#e2e8f0" strokeWidth="1" />
                </g>

                {/* CAPA 1: ESTRUCTURA ARQUITECTÓNICA BASE */}
                <g id="layer-base-plan" pointerEvents="none">
                  <g clipPath="url(#perimeter-clip)">
                    {/* Suelo interior blanco pulido */}
                    <rect x="80" y="100" width="760" height="820" fill="#ffffff" />

                    {/* Zonas de Patio Exterior con trama diagonal de adoquines */}
                    <rect x="80" y="445" width="140" height="480" fill="url(#patio-hatch)" />
                    <rect x="220" y="675" width="300" height="255" fill="url(#patio-hatch)" />
                    <rect x="520" y="645" width="175" height="240" fill="url(#patio-hatch)" />

                    {/* Estructura Barra Barismo & Mostrador Central */}
                    <rect x="585" y="285" width="105" height="360" fill="#f8fafc" />
                    <rect x="585" y="285" width="43" height="340" rx="3" fill="url(#bar-surface)" stroke="#334155" strokeWidth="2.2" />
                    <line x1="591" y1="291" x2="591" y2="619" stroke="#94a3b8" strokeWidth="1" />
                    <line x1="595" y1="455" x2="626" y2="455" stroke="#cbd5e1" strokeWidth="1.2" />

                    {/* Contrabarra y vitrinas */}
                    <rect x="655" y="285" width="33" height="158" rx="2" fill="#f1f5f9" stroke="#334155" strokeWidth="2" />
                    <rect x="655" y="458" width="33" height="167" rx="2" fill="#f1f5f9" stroke="#334155" strokeWidth="2" />

                    {/* Fregadero de barismo */}
                    <rect x="662" y="340" width="19" height="32" rx="2" fill="none" stroke="#94a3b8" strokeWidth="1.1" />
                    <circle cx="671.5" cy="356" r="2.2" fill="#94a3b8" />

                    {/* Mostrador de Caja & POS */}
                    <rect x="525" y="600" width="50" height="40" rx="2.5" fill="#f1f5f9" stroke="#334155" strokeWidth="2" />
                    <rect x="533" y="608" width="34" height="24" rx="1.5" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" />

                    {/* Escaleras L-Shaped Detalladas hacia Terraza */}
                    <g id="arch-stairs">
                      <polygon points="220,195 280,195 280,295 410,295 410,355 220,355" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
                      <g stroke="#64748b" strokeWidth="1.3">
                        <line x1="220" y1="211" x2="280" y2="211" />
                        <line x1="220" y1="227" x2="280" y2="227" />
                        <line x1="220" y1="243" x2="280" y2="243" />
                        <line x1="220" y1="259" x2="280" y2="259" />
                        <line x1="220" y1="275" x2="280" y2="275" />
                        <line x1="220" y1="295" x2="280" y2="295" stroke="#334155" strokeWidth="1.8" />
                      </g>
                      <line x1="220" y1="355" x2="280" y2="295" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="4 3" />
                      <line x1="280" y1="295" x2="280" y2="355" stroke="#334155" strokeWidth="1.8" />
                      <g stroke="#64748b" strokeWidth="1.3">
                        <line x1="296" y1="295" x2="296" y2="355" />
                        <line x1="312" y1="295" x2="312" y2="355" />
                        <line x1="328" y1="295" x2="328" y2="355" />
                        <line x1="344" y1="295" x2="344" y2="355" />
                        <line x1="360" y1="295" x2="360" y2="355" />
                        <line x1="376" y1="295" x2="376" y2="355" />
                        <line x1="392" y1="295" x2="392" y2="355" />
                      </g>
                      <path d="M 250 205 L 250 325 L 400 325" fill="none" stroke="#334155" strokeWidth="1.6" />
                      <polygon points="404,325 395,320 395,330" fill="#334155" />
                      <circle cx="250" cy="205" r="3" fill="#334155" />
                    </g>

                    {/* Depósito bajo escalera */}
                    <rect x="220" y="355" width="145" height="70" fill="#f8fafc" />

                    {/* Baños & Servicios fondo */}
                    <rect x="410" y="100" width="260" height="160" fill="#fcfdfe" />
                  </g>

                  {/* Muros Interiores Portantes */}
                  <g stroke="#1e293b" strokeWidth="4.5" strokeLinecap="square" strokeLinejoin="miter" fill="none">
                    <line x1="220" y1="100" x2="220" y2="122" />
                    <line x1="80" y1="175" x2="115" y2="175" />
                    <line x1="170" y1="175" x2="220" y2="175" />
                    <line x1="220" y1="175" x2="220" y2="362" />
                    <line x1="220" y1="410" x2="220" y2="675" />

                    <line x1="80" y1="445" x2="162" y2="445" />
                    <line x1="216" y1="445" x2="220" y2="445" />

                    <line x1="220" y1="355" x2="365" y2="355" />
                    <line x1="365" y1="355" x2="365" y2="425" />

                    <line x1="220" y1="425" x2="410" y2="425" />

                    <line x1="220" y1="675" x2="405" y2="675" />
                    <line x1="490" y1="675" x2="520" y2="675" />
                    <line x1="520" y1="675" x2="520" y2="645" />
                    <line x1="520" y1="645" x2="690" y2="645" />

                    <line x1="220" y1="195" x2="410" y2="195" />
                    <line x1="410" y1="100" x2="410" y2="195" />
                    <line x1="410" y1="260" x2="475" y2="260" />
                    <line x1="525" y1="260" x2="590" y2="260" />
                    <line x1="640" y1="260" x2="670" y2="260" />

                    <line x1="545" y1="100" x2="545" y2="260" />
                    <line x1="410" y1="195" x2="432" y2="195" />
                    <line x1="482" y1="195" x2="545" y2="195" />

                    <line x1="670" y1="100" x2="670" y2="145" />
                    <line x1="670" y1="200" x2="670" y2="260" />
                    <line x1="725" y1="155" x2="830" y2="155" strokeWidth="3.5" />
                  </g>

                  {/* Puertas y Arcos de Apertura Batientes */}
                  <g stroke="#475569" fill="none">
                    <line x1="115" y1="175" x2="115" y2="228" strokeWidth="2.2" stroke="#1e293b" />
                    <path d="M 115 228 A 53 53 0 0 0 168 175" strokeWidth="1.2" strokeDasharray="3 2" />

                    <line x1="216" y1="445" x2="216" y2="393" strokeWidth="2.2" stroke="#1e293b" />
                    <path d="M 216 393 A 52 52 0 0 0 164 445" strokeWidth="1.2" strokeDasharray="3 2" />

                    <line x1="220" y1="410" x2="266" y2="410" strokeWidth="2.2" stroke="#1e293b" />
                    <path d="M 266 410 A 46 46 0 0 0 220 364" strokeWidth="1.2" strokeDasharray="3 2" />

                    <line x1="482" y1="195" x2="482" y2="147" strokeWidth="2.2" stroke="#1e293b" />
                    <path d="M 482 147 A 48 48 0 0 0 434 195" strokeWidth="1.2" strokeDasharray="3 2" />

                    <line x1="475" y1="260" x2="475" y2="308" strokeWidth="2.2" stroke="#1e293b" />
                    <path d="M 475 308 A 48 48 0 0 0 523 260" strokeWidth="1.2" strokeDasharray="3 2" />

                    <line x1="640" y1="260" x2="640" y2="212" strokeWidth="2.2" stroke="#1e293b" />
                    <path d="M 640 212 A 48 48 0 0 0 592 260" strokeWidth="1.2" strokeDasharray="3 2" />

                    <line x1="670" y1="145" x2="722" y2="145" strokeWidth="2.2" stroke="#1e293b" />
                    <path d="M 722 145 A 52 52 0 0 1 670 197" strokeWidth="1.2" strokeDasharray="3 2" />

                    {/* Puerta Doble de Ingreso Principal */}
                    <line x1="405" y1="675" x2="405" y2="634" strokeWidth="2.4" stroke="#1e293b" />
                    <path d="M 405 634 A 41 41 0 0 1 446 675" strokeWidth="1.3" strokeDasharray="3 2" />
                    <line x1="490" y1="675" x2="490" y2="634" strokeWidth="2.4" stroke="#1e293b" />
                    <path d="M 490 634 A 41 41 0 0 0 449 675" strokeWidth="1.3" strokeDasharray="3 2" />
                    <line x1="405" y1="675" x2="490" y2="675" stroke="#94a3b8" strokeWidth="1.2" />
                  </g>

                  {/* Fachada Perimetral Curva de la Esquina Salamanca */}
                  <path
                    d="M 80 100 L 830 100 L 830 380 L 690 380 L 690 770 L 340 885 C 195 925, 80 830, 80 680 Z"
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth="5.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </g>

                {/* CAPA 1B: PASILLO CENTRAL DE ACCESO Y ENTRADA */}
                {mostrarPasillo && (
                  <g id="layer-walkway" clipPath="url(#perimeter-clip)" pointerEvents="none">
                    <polygon points="388,675 504,675 504,840 388,876" fill="#ffffff" fillOpacity="0.65" />
                    <line x1="388" y1="675" x2="388" y2="876" stroke="#475569" strokeWidth="5" strokeLinecap="round" strokeOpacity="0.75" />
                    <line x1="395" y1="678" x2="395" y2="871" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="5 4" />
                    <line x1="504" y1="675" x2="504" y2="840" stroke="#475569" strokeWidth="5" strokeLinecap="round" strokeOpacity="0.75" />
                    <line x1="497" y1="678" x2="497" y2="838" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="5 4" />
                    <path d="M 446 825 L 446 730 M 439 738 L 446 728 L 453 738" fill="none" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.65" />
                  </g>
                )}

                {/* CAPA 2: CUADRÍCULA ARQUITECTÓNICA */}
                {mostrarGrid && (
                  <g id="layer-grid" clipPath="url(#perimeter-clip)" pointerEvents="none">
                    <rect x="80" y="100" width="760" height="830" fill="url(#draft-grid-major)" />
                  </g>
                )}

                {/* CAPA 3: ETIQUETAS DE ZONAS */}
                {mostrarZonas && (
                  <g id="layer-zone-labels" pointerEvents="none" fontFamily="Inter, sans-serif" fontWeight="600" fill="#94a3b8" textAnchor="middle">
                    <text x="150" y="310" fontSize="10" letterSpacing="0.8">PASILLO</text>
                    <text x="150" y="323" fontSize="10" letterSpacing="0.8">LATERAL</text>

                    <text x="330" y="255" fontSize="10" letterSpacing="0.8">ESCALERAS</text>
                    <text x="292" y="394" fontSize="9" letterSpacing="0.6">DEPÓSITO</text>

                    <text x="315" y="518" fontSize="11.5" letterSpacing="1.2" fill="#cbd5e1">SALÓN IZQUIERDO</text>
                    <text x="485" y="540" fontSize="11" letterSpacing="1" fill="#cbd5e1">SALÓN CENTRAL</text>

                    <text x="477" y="148" fontSize="9.5" letterSpacing="0.8">SERVICIOS / BAÑOS</text>
                    <text x="607" y="182" fontSize="9.5" letterSpacing="0.8">OFICINA / SERV.</text>

                    <text x="760" y="275" fontSize="10.5" letterSpacing="0.9">ANEXO DERECHO</text>

                    <text x="607" y="460" fontSize="10" letterSpacing="1.4" fill="#64748b" transform="rotate(-90, 607, 460)">BARRA 4 LLAMAS</text>
                    <text x="550" y="623" fontSize="8.5" letterSpacing="0.6" fill="#64748b">CAJA</text>

                    <text x="148" y="468" fontSize="10" letterSpacing="1.1" fill="#a89882">PATIO SALAMANCA</text>
                    <text x="242" y="772" fontSize="10.5" letterSpacing="1.1" fill="#a89882">PATIO IZQUIERDO</text>
                    <text x="446" y="790" fontSize="9" letterSpacing="1" fill="#64748b">ACCESO</text>
                    <text x="600" y="730" fontSize="10" letterSpacing="1.1" fill="#a89882">PATIO DERECHO</text>
                  </g>
                )}

                {/* CAPA 4: SEÑALÉTICA Y EXTINTORES */}
                {mostrarSignage && (
                  <g id="layer-signage" pointerEvents="none">
                    {/* Extintores PQS */}
                    <g transform="translate(560, 422)">
                      <rect x="-11" y="-13" width="22" height="26" rx="4" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
                      <rect x="-4" y="-5" width="8" height="12" rx="2.5" fill="#ffffff" />
                      <path d="M -2 -5 L -2 -8 L 3 -8 M 2 -8 L 5 -5" stroke="#ffffff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                    </g>
                    <g transform="translate(502, 620)">
                      <rect x="-11" y="-13" width="22" height="26" rx="4" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
                      <rect x="-4" y="-5" width="8" height="12" rx="2.5" fill="#ffffff" />
                      <path d="M -2 -5 L -2 -8 L 3 -8 M 2 -8 L 5 -5" stroke="#ffffff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                    </g>
                    <g transform="translate(715, 250)">
                      <rect x="-11" y="-13" width="22" height="26" rx="4" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
                      <rect x="-4" y="-5" width="8" height="12" rx="2.5" fill="#ffffff" />
                      <path d="M -2 -5 L -2 -8 L 3 -8 M 2 -8 L 5 -5" stroke="#ffffff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                    </g>

                    {/* Cartel Salida / Entrada */}
                    <g transform="translate(447, 696)">
                      <rect x="-42" y="-11" width="84" height="22" rx="4" fill="#15803d" stroke="#ffffff" strokeWidth="1.5" />
                      <text x="0" y="3.5" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="8.2" fontWeight="700" fill="#ffffff" letterSpacing="0.5">SALIDA / ENTRADA</text>
                    </g>
                    <g transform="translate(447, 650)">
                      <rect x="-9" y="-9" width="18" height="18" rx="3" fill="#16a34a" opacity="0.9" />
                      <path d="M 0 -5 L 0 4 M -3.5 1 L 0 4.5 L 3.5 1" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                  </g>
                )}
              </svg>

              {/* Botón interactivo para subir por las escaleras a Terraza */}
              <button
                type="button"
                onClick={() => {
                  soundManager.playTactileClick();
                  setPisoActivo("terraza");
                }}
                style={{ left: "34%", top: "28%", transform: "translate(-50%, -50%)" }}
                className="absolute px-3 py-1.5 rounded-xl bg-stone-900/90 hover:bg-stone-900 text-white text-[11px] font-black border border-amber-400/50 shadow-xl hover:scale-105 active:scale-95 transition flex items-center gap-1.5 z-20 cursor-pointer group"
                title="Subir a Terraza (Piso 2)"
              >
                <span>🪜 Subir a Terraza</span>
                <ArrowRight size={13} className="text-amber-300 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </>
          )}

          {/* ── REFERENCIAS ARQUITECTÓNICAS DE TERRAZA SEGÚN CROQUIS ── */}
          {pisoActivo === "terraza" && (
            <div className="absolute inset-0 bg-[#FDFBF7] dark:bg-[#1A1410] z-0 p-4">
              {/* Barandado Perimetral con Vista Panorámica */}
              <div className="w-full h-14 border-b-2 border-dashed border-amber-600/40 flex items-center justify-between px-4 bg-amber-500/[0.06] rounded-2xl">
                <div className="flex items-center gap-2">
                  <Sun size={18} className="text-amber-500" />
                  <div>
                    <span className="text-xs sm:text-sm font-black text-amber-950 dark:text-amber-200 block">
                      Terraza Mirador Alameda Salamanca (Piso 2)
                    </span>
                    <span className="text-[10px] text-stone-500">
                      Ambiente al aire libre &bull; Pérgolas, toldos y sombrillas
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-200">
                  6 Mesas Panorámicas (T16 a T21)
                </span>
              </div>

              {/* Escalera de Bajada a Planta Baja */}
              <div
                onClick={() => {
                  soundManager.playTactileClick();
                  setPisoActivo("planta_baja");
                }}
                className="absolute right-6 bottom-6 px-4 py-2.5 rounded-2xl bg-stone-900 text-[#FAF7F2] text-xs font-bold shadow-xl cursor-pointer hover:bg-amber-900 transition flex items-center gap-2 z-20 group border border-amber-500/30"
                title="Bajar a Planta Baja"
              >
                <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform text-amber-300" />
                <div className="text-left">
                  <span className="block text-[11px] font-black text-amber-300">Bajar a Planta Baja</span>
                  <span className="block text-[9px] text-stone-400">Salón &amp; Patio Exterior</span>
                </div>
              </div>
            </div>
          )}

          {/* ── RENDERIZADO ESPACIAL DE CADA MESA ── */}
          {mesasPiso.map((mesa) => {
            const pedido = getPedidoMesa(mesa.numero);
            const tieneAlerta = alertas.some((a) => a.mesa_numero === mesa.numero);
            const isSelected = mesaSeleccionadaId === mesa.id;
            const isDragging = mesaArrastrando === mesa.id;
            const heat = getMesaHeatData(mesa, pedido);

            const displayLabel = mesa.label || (
              mesa.piso === "terraza"
                ? `T${mesa.numero}`
                : mesa.numero <= 9
                ? `P${mesa.numero}`
                : `M${mesa.numero - 9}`
            );

            const statusStyles = {
              libre: {
                border: "border-emerald-600 bg-emerald-500/20 text-emerald-950",
                tag: "bg-emerald-600 text-white",
                label: "Libre",
              },
              ocupada: {
                border: "border-amber-600 bg-amber-500/30 text-amber-950",
                tag: "bg-amber-600 text-white",
                label: "Ocupada",
              },
              reservada: {
                border: "border-purple-600 bg-purple-500/25 text-purple-950",
                tag: "bg-purple-600 text-white",
                label: "Reserva",
              },
              limpieza: {
                border: "border-blue-500 bg-blue-500/25 text-blue-950",
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
                    className="absolute -inset-8 sm:-inset-10 rounded-full pointer-events-none filter blur-xl z-0 transition-all duration-700 animate-pulse"
                  />
                )}

                {/* Sillas alrededor */}
                {renderChairs(mesa.capacidad, mesa.tipo, mesa.id)}

                {/* Superficie de la mesa */}
                <div
                  className={`relative flex flex-col items-center justify-center p-1.5 sm:p-2 transition-all shadow-md backdrop-blur-md border-2 ${
                    modoCalor ? heat.tableBg : statusStyles.border
                  } ${
                    isRound
                      ? "rounded-full w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18"
                      : isRect
                      ? "rounded-2xl w-22 sm:w-26 md:w-28 h-14 sm:h-16 md:h-18"
                      : "rounded-2xl w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18"
                  } ${isSelected ? "ring-4 ring-amber-600 shadow-xl" : ""} ${
                    tieneAlerta ? "ring-4 ring-red-500 animate-pulse bg-red-500/30" : ""
                  }`}
                >
                  {/* Etiqueta Arquitectónica Oficial (P1-P9, M1-M6, T16-T21) */}
                  <div className="flex flex-col items-center leading-none">
                    <span className="font-serif font-black text-xs sm:text-sm text-[#1E130C] dark:text-[#FAF7F2]">
                      {displayLabel}
                    </span>
                    <span className="text-[7px] font-mono font-bold text-stone-500 mt-0.5">
                      M-{mesa.numero}
                    </span>
                  </div>

                  {/* Sillas / Pax */}
                  <div className="flex items-center gap-0.5 text-[8px] font-bold text-stone-700 dark:text-stone-300 mt-0.5">
                    <Users size={9} />
                    <span>{mesa.capacidad}p</span>
                  </div>

                  {/* Badge Dinámico: Modo Calor vs Modo Operativo */}
                  {modoCalor ? (
                    <span
                      className={`mt-0.5 text-[7.5px] font-bold px-1 py-0.2 rounded-full uppercase tracking-wider ${heat.badgeBg}`}
                    >
                      {heat.badge}
                    </span>
                  ) : pedido ? (
                    <span className="mt-0.5 text-[8px] font-mono font-black px-1 py-0.2 rounded-md bg-[#1E130C] text-amber-300 shadow-xs">
                      Bs {pedido.total.toFixed(0)}
                    </span>
                  ) : (
                    <span
                      className={`mt-0.5 text-[7px] font-bold px-1 py-0.2 rounded-full uppercase tracking-wider ${statusStyles.tag}`}
                    >
                      {statusStyles.label}
                    </span>
                  )}

                  {/* Alerta de Mozo */}
                  {tieneAlerta && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg animate-bounce text-[8px]">
                      <Bell size={9} />
                    </span>
                  )}

                  {/* Indicador de edición */}
                  {modoEdicion && (
                    <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-stone-900 text-white shadow">
                      <Move size={8} />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

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

              {/* Selector de Vista: Plano Anotado vs Plano Limpio Original vs Croquis Hecho a Mano */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-stone-100 dark:bg-stone-800 p-1.5 rounded-2xl">
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => setTipoPlanoVisor("anotado")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      tipoPlanoVisor === "original"
                        ? "bg-[#1E130C] text-white shadow-xs"
                        : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
                    }`}
                  >
                    🏛️ Plano Arquitectónico Limpio
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoPlanoVisor("croquis")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      tipoPlanoVisor === "croquis"
                        ? "bg-amber-700 text-white shadow-xs"
                        : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
                    }`}
                  >
                    📝 Croquis Manuscrito (PB &amp; Terraza)
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
                      : tipoPlanoVisor === "original"
                      ? "/img/planos/plano-evacuacion-original.jpg"
                      : "/img/planos/croquis-distribucion-manual.png"
                  }
                  alt={
                    tipoPlanoVisor === "croquis"
                      ? "Croquis de Distribución Planta Baja y Terraza"
                      : "Plano de Evacuación Planta Baja"
                  }
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
                  <div className="w-12 h-12 rounded-2xl bg-[#1E130C] text-amber-300 flex flex-col items-center justify-center font-serif font-black shadow-md">
                    <span className="text-base leading-none">
                      {modalDetalleMesa.label || (
                        modalDetalleMesa.piso === "terraza"
                          ? `T${modalDetalleMesa.numero}`
                          : modalDetalleMesa.numero <= 9
                          ? `P${modalDetalleMesa.numero}`
                          : `M${modalDetalleMesa.numero - 9}`
                      )}
                    </span>
                    <span className="text-[7.5px] font-mono text-stone-400 mt-0.5">
                      M-{modalDetalleMesa.numero}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold flex items-center gap-2">
                      <span>
                        {modalDetalleMesa.label || (
                          modalDetalleMesa.piso === "terraza"
                            ? `Mesa T${modalDetalleMesa.numero}`
                            : modalDetalleMesa.numero <= 9
                            ? `Mesa P${modalDetalleMesa.numero}`
                            : `Mesa M${modalDetalleMesa.numero - 9}`
                        )}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold capitalize">
                        {modalDetalleMesa.subzona === "patio_exterior"
                          ? "Patio Exterior"
                          : modalDetalleMesa.subzona === "salon_interior"
                          ? "Salón Interior"
                          : "Terraza Mirador"}
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

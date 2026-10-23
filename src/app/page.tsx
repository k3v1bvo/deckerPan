"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Calendar,
  ChefHat,
  Coffee,
  QrCode,
  Star,
  Users,
  UtensilsCrossed,
  Receipt,
  Settings,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Flame,
  ChevronRight,
  Sliders,
  DollarSign,
  Heart,
} from "lucide-react";
import { soundManager } from "@/lib/sound";

const EVENTOS_PRESETS = [
  { id: "tesis", icon: "🎓", label: "Defensa de Tesis", precioPersona: 35, desc: "Café de especialidad + surtido de masitas y bocaditos salados" },
  { id: "cumple", icon: "🎂", label: "Cumpleaños & Festejo", precioPersona: 45, desc: "Torta artesanal a elección + bebidas calientes y bocaditos" },
  { id: "corporativo", icon: "💼", label: "Reunión Corporativa", precioPersona: 40, desc: "Coffee break premium, croissants rellenos y sandwiches" },
  { id: "baby", icon: "👶", label: "Baby Shower / Té", precioPersona: 50, desc: "Mesa dulce completa, infusiones gourmet y mini repostería" },
];

export default function HomePage() {
  // Simulador de Cotización de Catering
  const [invitados, setInvitados] = useState<number>(30);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(EVENTOS_PRESETS[0]);
  const [incluirTortaEspecial, setIncluirTortaEspecial] = useState(true);
  const [incluirBarista, setIncluirBarista] = useState(true);

  // Formulario Reserva
  const [reservaForm, setReservaForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    fecha_evento: "",
    descripcion: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [enviadoExitoso, setEnviadoExitoso] = useState(false);

  // Módulo Activo en el Showcase Interactivo
  const [demoTab, setDemoTab] = useState<"qr" | "mesero" | "kds" | "caja">("qr");

  // Cálculo Dinámico en Tiempo Real de Catering
  const presupuestoEstimado = useMemo(() => {
    let base = invitados * eventoSeleccionado.precioPersona;
    if (incluirTortaEspecial) base += 220; // Torta artesanal grande
    if (incluirBarista) base += 150; // Barista en vivo
    return base;
  }, [invitados, eventoSeleccionado, incluirTortaEspecial, incluirBarista]);

  const handleReserva = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const { useSystemStore } = await import("@/store");
      useSystemStore.getState().addReserva({
        nombre_cliente: reservaForm.nombre,
        telefono: reservaForm.telefono,
        email: reservaForm.email,
        tipo_evento: eventoSeleccionado.label,
        fecha_evento: reservaForm.fecha_evento || new Date().toISOString(),
        numero_personas: invitados,
        monto_total: presupuestoEstimado,
        monto_sena: Math.round(presupuestoEstimado * 0.3),
        descripcion: `${reservaForm.descripcion || "Paquete personalizado"} - ${eventoSeleccionado.label}`,
        estado: "pendiente",
      });

      const { supabase } = await import("@/lib/supabase");
      if (supabase) {
        await supabase.from("reservas").insert({
          nombre_cliente: reservaForm.nombre,
          telefono: reservaForm.telefono,
          email: reservaForm.email,
          tipo_evento: eventoSeleccionado.label,
          fecha_evento: reservaForm.fecha_evento || new Date().toISOString(),
          numero_personas: invitados,
          monto_total: presupuestoEstimado,
          monto_sena: Math.round(presupuestoEstimado * 0.3),
          descripcion: reservaForm.descripcion,
          estado: "pendiente",
        });
      }

      soundManager.playSuccessTone();
      setEnviadoExitoso(true);
    } catch (err) {
      console.error(err);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-stone-900 selection:bg-amber-200 selection:text-amber-950 overflow-x-hidden">
      
      {/* ── HERO SECTION ── */}
      <section className="relative pt-12 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#1C120B] via-[#2A1A10] to-[#1C120B] text-white">
        {/* Glow ambient background orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-amber-600/20 via-orange-600/10 to-transparent blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-amber-500/10 blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-6">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 text-amber-300 text-xs font-semibold shadow-inner"
          >
            <Sparkles size={14} className="text-amber-400 animate-spin-slow" />
            <span>Panadería de Masa Madre & Café de Especialidad en Cochabamba</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
            className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]"
          >
            El arte del buen pan,{" "}
            <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent italic">
              elevado a la perfección.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.15 }}
            className="text-amber-200/80 text-base sm:text-lg max-w-2xl mx-auto font-sans leading-relaxed"
          >
            Harinas seleccionadas, fermentación lenta de 24 horas y café de altura boliviano.
            Pide desde tu mesa con nuestro menú inteligente sin esperas.
          </motion.p>

          {/* Call to Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
          >
            <Link
              href="/mesa/1"
              onClick={() => soundManager.playOrderChime()}
              className="px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-white font-bold text-sm shadow-[0_10px_30px_rgba(217,119,6,0.4)] transition-all active:scale-95 flex items-center gap-2"
            >
              <QrCode size={18} />
              <span>Ver Menú QR en Mesa 1</span>
              <ArrowRight size={16} />
            </Link>

            <a
              href="#cotizador"
              className="px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 text-white font-semibold text-sm transition-all active:scale-95 flex items-center gap-2"
            >
              <Calendar size={18} />
              <span>Cotizar Catering para Evento</span>
            </a>
          </motion.div>

          {/* ── INTERACTIVE SYSTEM DEMO SHOWCASE ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26, delay: 0.25 }}
            className="mt-12 rounded-[32px] bg-[#120B07]/90 border border-white/15 p-4 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl text-left max-w-4xl mx-auto"
          >
            {/* Top Selector Tabs */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 gap-2 overflow-x-auto">
              <div className="flex items-center gap-1.5">
                {(
                  [
                    { id: "qr", label: "Menú Cliente QR", icon: QrCode },
                    { id: "mesero", label: "Sala & Mesero", icon: UtensilsCrossed },
                    { id: "kds", label: "Cocina KDS", icon: ChefHat },
                    { id: "caja", label: "Caja POS", icon: Receipt },
                  ] as const
                ).map((t) => {
                  const Icon = t.icon;
                  const isSel = demoTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setDemoTab(t.id);
                        soundManager.playSuccessTone();
                      }}
                      className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        isSel
                          ? "bg-amber-600 text-white shadow-md shadow-amber-950"
                          : "text-amber-200/70 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon size={14} />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Demo
              </span>
            </div>

            {/* Showcase Display Area */}
            <AnimatePresence mode="wait">
              {demoTab === "qr" && (
                <motion.div
                  key="qr"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs"
                >
                  <div className="md:col-span-2 space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-200 text-sm">Menú Mesa 3 — Dencker Pan</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                        🥐 56 Productos
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-amber-400/40 transition">
                        <p className="font-bold text-white text-xs">Croissant Mantequilla</p>
                        <p className="text-[11px] text-amber-300 font-mono">Bs 18.00</p>
                        <span className="text-[9px] text-stone-400 block mt-1">Calentar en horno ✓</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-amber-400/40 transition">
                        <p className="font-bold text-white text-xs">Cappuccino Especial</p>
                        <p className="text-[11px] text-amber-300 font-mono">Bs 22.00</p>
                        <span className="text-[9px] text-stone-400 block mt-1">Canela encima ✓</span>
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-900/40 border border-amber-600/30 flex items-center justify-between text-[11px]">
                      <span>⚡ Pedido enviado a Cocina:</span>
                      <span className="font-bold text-amber-300">En preparación 👨‍🍳</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-800/40 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="font-bold text-amber-200">Experiencia Cliente</span>
                      <p className="text-[11px] text-stone-300 mt-1 leading-relaxed">
                        Cero filas. El cliente escanea, personaliza con chips (sin azúcar, bien caliente) y sigue el estado en tiempo real.
                      </p>
                    </div>
                    <Link
                      href="/mesa/3"
                      className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-center font-bold text-white text-xs transition"
                    >
                      Abrir Mesa 3 →
                    </Link>
                  </div>
                </motion.div>
              )}

              {demoTab === "mesero" && (
                <motion.div
                  key="mesero"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs"
                >
                  <div className="md:col-span-2 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-200">Croquis & Sala en Vivo</span>
                      <span className="text-[10px] text-emerald-400">14 Libres | 5 Ocupadas | 1 Alerta</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <div
                          key={num}
                          className={`p-2 rounded-xl text-center border font-bold ${
                            num === 3
                              ? "bg-red-500/20 border-red-500 text-red-300 animate-pulse"
                              : num === 5
                              ? "bg-amber-500/20 border-amber-500 text-amber-300"
                              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                          }`}
                        >
                          Mesa {num}
                          <span className="text-[9px] block font-normal text-stone-400">
                            {num === 3 ? "Llamando 🔔" : num === 5 ? "Bs 86.00" : "Libre"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-800/40 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="font-bold text-amber-200">Atención sin Demoras</span>
                      <p className="text-[11px] text-stone-300 mt-1 leading-relaxed">
                        Campanilla sintetizada instantánea cuando un cliente llama o pide la cuenta. Rondas rápidas en 1 toque.
                      </p>
                    </div>
                    <Link
                      href="/mesero"
                      className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-center font-bold text-white text-xs transition"
                    >
                      Ir a Sala & Meseros →
                    </Link>
                  </div>
                </motion.div>
              )}

              {demoTab === "kds" && (
                <motion.div
                  key="kds"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs"
                >
                  <div className="md:col-span-2 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-200">Pantalla KDS — Vitrina, Café & Cocina</span>
                      <span className="font-mono text-emerald-400">Timer Semáforo Activo</span>
                    </div>
                    <div className="p-3 rounded-xl bg-stone-900 border border-amber-900/40 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-amber-100 text-sm">Mesa 3 (#4012)</span>
                        <p className="text-[11px] text-stone-400">2x Cappuccino, 1x Croissant</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-600 font-mono font-bold">
                        ⏱️ 03:14 min
                      </span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-800/40 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="font-bold text-amber-200">Cero Comandas Perdidas</span>
                      <p className="text-[11px] text-stone-300 mt-1 leading-relaxed">
                        Despacho por estaciones táctil. Verde &lt;5m, ámbar 5-10m, rojo pulsante &gt;10m. Chime sonoro de panadería.
                      </p>
                    </div>
                    <Link
                      href="/kds"
                      className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-center font-bold text-white text-xs transition"
                    >
                      Abrir Pantalla KDS →
                    </Link>
                  </div>
                </motion.div>
              )}

              {demoTab === "caja" && (
                <motion.div
                  key="caja"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs"
                >
                  <div className="md:col-span-2 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-200">POS & Facturación Boliviana</span>
                      <span className="font-mono text-amber-300 font-bold">Bs 62.00 a cobrar</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 p-2 bg-white/5 rounded-xl border border-white/10 text-center">
                        <span className="text-[10px] text-stone-400 block">QR Simple</span>
                        <span className="font-bold text-white">BNB / BCP / Bisa</span>
                      </div>
                      <div className="flex-1 p-2 bg-white/5 rounded-xl border border-white/10 text-center">
                        <span className="text-[10px] text-stone-400 block">Efectivo BOB</span>
                        <span className="font-bold text-emerald-400">Bs 200, 100, 50...</span>
                      </div>
                      <div className="flex-1 p-2 bg-white/5 rounded-xl border border-white/10 text-center">
                        <span className="text-[10px] text-stone-400 block">Split de Cuenta</span>
                        <span className="font-bold text-amber-300">÷ 2 a 6 personas</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-800/40 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="font-bold text-amber-200">Cierre & Arqueo Ciego</span>
                      <p className="text-[11px] text-stone-300 mt-1 leading-relaxed">
                        Conteo de billetes y monedas con cálculo instantáneo de cuadre, ticket térmico e integración fiscal.
                      </p>
                    </div>
                    <Link
                      href="/caja"
                      className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-center font-bold text-white text-xs transition"
                    >
                      Ir a Caja POS →
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ── BENTO GRID: CARACTERÍSTICAS PREMIUM ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
            Ecosistema Dencker Pan
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900">
            Diseñado para la excelencia en cada mesa
          </h2>
          <p className="text-stone-600 text-sm sm:text-base">
            Cada detalle ha sido pulido con física de fluidos de Apple, garantizando tiempos de respuesta mínimos y máxima elegancia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Card 1: Panadería */}
          <div className="p-8 rounded-[32px] bg-white border border-stone-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group space-y-6">
            <div className="space-y-4">
              <span className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🥐
              </span>
              <h3 className="font-serif text-2xl font-bold text-stone-900">
                Masa Madre & Horno Diario
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Nuestros croissants, baguettes y panes rústicos salen recién horneados cada mañana a las 07:00 y en la tarde a las 16:30.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 text-xs font-medium text-stone-500 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>Harinas 100% orgánicas certificadas</span>
            </div>
          </div>

          {/* Bento Card 2: Café de Especialidad */}
          <div className="p-8 rounded-[32px] bg-white border border-stone-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group space-y-6">
            <div className="space-y-4">
              <span className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                ☕
              </span>
              <h3 className="font-serif text-2xl font-bold text-stone-900">
                Café de Origen Yungas
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Granos de altura cosechados a más de 1,600 msnm. Tostado medio para resaltar notas achocolatadas y florales únicas.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 text-xs font-medium text-stone-500 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>Extracción calibrada a 9 bares</span>
            </div>
          </div>

          {/* Bento Card 3: POS SaaS Moderno */}
          <div className="p-8 rounded-[32px] bg-white border border-stone-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group space-y-6">
            <div className="space-y-4">
              <span className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                ⚡
              </span>
              <h3 className="font-serif text-2xl font-bold text-stone-900">
                Sincronización en la Nube
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Supabase Realtime conecta cada mesa, cocina y caja al instante sin retrasos ni pérdidas de comandas.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 text-xs font-medium text-stone-500 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>Funciona online y en modo local reactivo</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SIMULADOR & COTIZADOR INTERACTIVO DE CATERING ── */}
      <section id="cotizador" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FAF4EC] to-[#F5ECE1] border-y border-stone-200">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-800 bg-amber-200/60 px-3 py-1 rounded-full">
              Cotizador en Tiempo Real
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900">
              Cotiza tu Evento & Catering en 10 Segundos
            </h2>
            <p className="text-stone-600 text-sm sm:text-base">
              Ajusta los comensales y el paquete para calcular el presupuesto en Bolivianos con seña automática.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Controles del Simulador */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-[32px] border border-stone-200 shadow-md space-y-6">
              {/* Selector de Tipo de Evento */}
              <div>
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-3">
                  1. Selecciona el Tipo de Evento
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {EVENTOS_PRESETS.map((ev) => (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => {
                        setEventoSeleccionado(ev);
                        soundManager.playSuccessTone();
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        eventoSeleccionado.id === ev.id
                          ? "bg-amber-50 border-amber-800 ring-2 ring-amber-800 shadow-xs"
                          : "bg-stone-50/60 border-stone-200 hover:bg-stone-100"
                      }`}
                    >
                      <span className="text-xl block mb-1">{ev.icon}</span>
                      <p className="font-bold text-xs text-stone-900">{ev.label}</p>
                      <span className="text-[10px] text-amber-800 font-semibold block">
                        Bs {ev.precioPersona} / persona
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider de Personas */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    2. Número de Comensales
                  </label>
                  <span className="font-serif text-2xl font-bold text-amber-950">
                    {invitados} personas
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="5"
                  value={invitados}
                  onChange={(e) => setInvitados(parseInt(e.target.value))}
                  className="w-full accent-amber-700 h-2 bg-stone-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-stone-400 font-mono">
                  <span>10 personas (íntimo)</span>
                  <span>100 personas</span>
                  <span>200 personas (magno)</span>
                </div>
              </div>

              {/* Extras Opcionales */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">
                  3. Extras Opcionales
                </label>
                <label className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 hover:bg-amber-50/50 border border-stone-200/60 cursor-pointer transition">
                  <div className="text-xs">
                    <span className="font-bold text-stone-800 block">Torta Artesanal de Autor (+Bs 220)</span>
                    <span className="text-stone-500 text-[11px]">Chocolate belga, zanahoria o cheesecake con frutos rojos</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={incluirTortaEspecial}
                    onChange={(e) => setIncluirTortaEspecial(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-700 focus:ring-amber-700"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 hover:bg-amber-50/50 border border-stone-200/60 cursor-pointer transition">
                  <div className="text-xs">
                    <span className="font-bold text-stone-800 block">Barista en Vivo en tu Evento (+Bs 150)</span>
                    <span className="text-stone-500 text-[11px]">Estación de espresso y arte latte en directo</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={incluirBarista}
                    onChange={(e) => setIncluirBarista(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-700 focus:ring-amber-700"
                  />
                </label>
              </div>
            </div>

            {/* Tarjeta de Resumen y Reserva Instantánea */}
            <div className="lg:col-span-5 bg-[#1C120B] text-white p-6 sm:p-8 rounded-[32px] border border-amber-900/40 shadow-2xl space-y-6">
              <div>
                <span className="text-xs text-amber-300 font-semibold uppercase tracking-wider block">
                  Presupuesto Estimado
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-serif text-4xl sm:text-5xl font-extrabold text-amber-400">
                    Bs {presupuestoEstimado.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  Seña para reservar fecha (30%):{" "}
                  <strong className="text-amber-200 font-mono">
                    Bs {Math.round(presupuestoEstimado * 0.3)}
                  </strong>
                </p>
              </div>

              {/* Detalle del Paquete */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-400">Evento:</span>
                  <span className="font-bold text-amber-200">{eventoSeleccionado.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Comensales:</span>
                  <span className="font-bold">{invitados} personas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Catering Base:</span>
                  <span>Bs {(invitados * eventoSeleccionado.precioPersona).toFixed(2)}</span>
                </div>
                {incluirTortaEspecial && (
                  <div className="flex justify-between text-amber-300">
                    <span>+ Torta Artesanal:</span>
                    <span>Bs 220.00</span>
                  </div>
                )}
                {incluirBarista && (
                  <div className="flex justify-between text-amber-300">
                    <span>+ Barista en Vivo:</span>
                    <span>Bs 150.00</span>
                  </div>
                )}
              </div>

              {/* Formulario Rápido de Reserva */}
              <form onSubmit={handleReserva} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Tu Nombre Completo"
                  value={reservaForm.nombre}
                  onChange={(e) => setReservaForm({ ...reservaForm, nombre: e.target.value })}
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="tel"
                    required
                    placeholder="Teléfono / WhatsApp"
                    value={reservaForm.telefono}
                    onChange={(e) => setReservaForm({ ...reservaForm, telefono: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                  <input
                    type="date"
                    required
                    value={reservaForm.fecha_evento}
                    onChange={(e) => setReservaForm({ ...reservaForm, fecha_evento: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/15 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>

                <input
                  type="email"
                  placeholder="Correo Electrónico (opcional)"
                  value={reservaForm.email}
                  onChange={(e) => setReservaForm({ ...reservaForm, email: e.target.value })}
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />

                <button
                  type="submit"
                  disabled={enviando || enviadoExitoso}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {enviadoExitoso ? (
                    <>
                      <CheckCircle2 size={16} className="text-emerald-300" />
                      <span>¡Solicitud Enviada a Cocina & Admin!</span>
                    </>
                  ) : enviando ? (
                    <span>Registrando Reserva...</span>
                  ) : (
                    <>
                      <span>Confirmar Fecha & Cotización</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER DE ALTA GAMA ── */}
      <footer className="bg-[#120B07] text-white py-16 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-stone-400">
          <div className="space-y-3">
            <span className="font-serif text-xl font-bold text-white flex items-center gap-2">
              🥐 Dencker Pan
            </span>
            <p className="leading-relaxed">
              Cafetería de especialidad, panadería de masa madre y pastelería fina en Cochabamba, Bolivia.
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-white uppercase tracking-wider text-[11px]">Acceso a Módulos</p>
            <ul className="space-y-1.5">
              <li><Link href="/mesa/1" className="hover:text-amber-400 transition">Menú QR Cliente</Link></li>
              <li><Link href="/mesero" className="hover:text-amber-400 transition">Panel de Meseros</Link></li>
              <li><Link href="/kds" className="hover:text-amber-400 transition">Cocina KDS</Link></li>
              <li><Link href="/caja" className="hover:text-amber-400 transition">Caja & POS Facturación</Link></li>
              <li><Link href="/admin" className="hover:text-amber-400 transition">Administración SaaS</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-white uppercase tracking-wider text-[11px]">Horarios de Atención</p>
            <p>Lunes a Sábado: 07:00 – 21:00</p>
            <p>Domingos y Feriados: 08:00 – 20:00</p>
            <p className="text-amber-300 pt-1">Horneadas calientes: 07:30 y 16:30</p>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-white uppercase tracking-wider text-[11px]">Ubicación & Contacto</p>
            <p>Cochabamba, Bolivia</p>
            <p>WhatsApp: +591 71234567</p>
            <p className="pt-2 text-[10px] text-stone-500">
              © 2026 Dencker Pan S.R.L. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
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
  Heart,
  MessageCircle,
  Search,
  ShoppingBag,
  Plus,
  Minus,
  Check,
  X,
  MapPin,
  Layers,
  ExternalLink,
  Calendar,
  GraduationCap,
  Cake,
  Briefcase,
  Sliders,
} from "lucide-react";
import { useSystemStore, useCartStore, useUIStore } from "@/store";
import { soundManager } from "@/lib/sound";
import { DENCKER_ASSETS, SEED_CATEGORIAS, SEED_PRODUCTOS } from "@/lib/seed-data";
import { Producto, Categoria } from "@/types";

const EVENTOS_PRESETS = [
  {
    id: "tesis",
    icon: GraduationCap,
    label: "Defensa de Tesis",
    precioPersona: 35,
    desc: "Café de especialidad + surtido de masitas y bocaditos salados",
    badge: "Más Solicitado",
  },
  {
    id: "cumple",
    icon: Cake,
    label: "Cumpleaños & Festejo",
    precioPersona: 45,
    desc: "Torta artesanal a elección + bebidas calientes y bocaditos dulces",
    badge: "Festejos",
  },
  {
    id: "corporativo",
    icon: Briefcase,
    label: "Reunión Corporativa",
    precioPersona: 40,
    desc: "Coffee break ejecutivo, croissants rellenos y sandwiches de autor",
    badge: "Empresas",
  },
  {
    id: "baby",
    icon: Heart,
    label: "Té de la Tarde & Té",
    precioPersona: 50,
    desc: "Mesa dulce completa, infusiones gourmet y mini repostería fina",
    badge: "Exclusivo",
  },
];

export default function HomePage() {
  const storeProductos = useSystemStore((state) => state.productos);
  const storeCategorias = useSystemStore((state) => state.categorias);

  const productos: Producto[] = storeProductos && storeProductos.length > 0 ? storeProductos : SEED_PRODUCTOS;
  const categorias: Categoria[] = storeCategorias && storeCategorias.length > 0 ? storeCategorias : SEED_CATEGORIAS;

  const { items, addItem, updateCantidad, total, count } = useCartStore();
  const { setCartOpen } = useUIStore();

  // Estados del Catálogo
  const [categoriaActiva, setCategoriaActiva] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState<string>("");
  const [limiteVisible, setLimiteVisible] = useState<number>(24);
  const [productoModal, setProductoModal] = useState<Producto | null>(null);
  const [chipsSeleccionados, setChipsSeleccionados] = useState<string[]>([]);
  const [notaPersonalizada, setNotaPersonalizada] = useState<string>("");

  // Estados del Cotizador
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
  const [enviandoReserva, setEnviandoReserva] = useState(false);
  const [reservaExitosa, setReservaExitosa] = useState(false);

  // Filtrado reactivo de productos
  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const matchCat =
        categoriaActiva === "todos"
          ? true
          : categoriaActiva === "favoritos"
          ? p.es_mas_vendido
          : p.categoria_id === categoriaActiva;

      const query = busqueda.toLowerCase().trim();
      const matchBusqueda =
        !query ||
        p.nombre.toLowerCase().includes(query) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(query));

      return matchCat && matchBusqueda;
    });
  }, [productos, categoriaActiva, busqueda]);

  const productosVisibles = useMemo(() => {
    return productosFiltrados.slice(0, limiteVisible);
  }, [productosFiltrados, limiteVisible]);

  useEffect(() => {
    setLimiteVisible(24);
  }, [categoriaActiva, busqueda]);

  // Cálculo Presupuesto Catering
  const presupuestoEstimado = useMemo(() => {
    let base = invitados * eventoSeleccionado.precioPersona;
    if (incluirTortaEspecial) base += 220;
    if (incluirBarista) base += 150;
    return base;
  }, [invitados, eventoSeleccionado, incluirTortaEspecial, incluirBarista]);

  const handleReserva = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviandoReserva(true);
    soundManager.playSuccessTone();

    try {
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

      // Preparar enlace de WhatsApp para enviar el desglose instantáneo
      const texto = `🥐 *COTIZACIÓN DE EVENTO — DENCKER PAN*\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 *Cliente:* ${reservaForm.nombre}\n` +
        `📞 *Teléfono:* ${reservaForm.telefono}\n` +
        `📅 *Fecha Estimada:* ${reservaForm.fecha_evento || "Por coordinar"}\n` +
        `🎉 *Tipo de Evento:* ${eventoSeleccionado.label}\n` +
        `👥 *Número de Personas:* ${invitados} comensales\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `📋 *SERVICIOS INCLUIDOS:*\n` +
        `• Menú Base: Bs ${(invitados * eventoSeleccionado.precioPersona).toFixed(2)}\n` +
        (incluirTortaEspecial ? `• Torta Artesanal de Autor (+Bs 220)\n` : '') +
        (incluirBarista ? `• Barista en Vivo & Café (+Bs 150)\n` : '') +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `💰 *PRESUPUESTO TOTAL:* Bs ${presupuestoEstimado.toFixed(2)}\n` +
        `💵 *Seña de Reserva (30%):* Bs ${Math.round(presupuestoEstimado * 0.3)}\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `✨ _Generado desde la plataforma digital de Dencker Pan_`;

      const urlWhatsApp = `https://wa.me/59176911000?text=${encodeURIComponent(texto)}`;
      
      setReservaExitosa(true);
      setTimeout(() => {
        window.open(urlWhatsApp, "_blank");
      }, 800);
    } catch (err) {
      console.error(err);
    } finally {
      setEnviandoReserva(false);
    }
  };

  const abrirModalProducto = (p: Producto) => {
    soundManager.playClick();
    setProductoModal(p);
    setChipsSeleccionados([]);
    setNotaPersonalizada("");
  };

  const agregarAlCarritoDesdeModal = () => {
    if (!productoModal) return;
    soundManager.playSuccessTone();
    addItem(productoModal, chipsSeleccionados, notaPersonalizada || undefined);
    setProductoModal(null);
  };

  const getItemCantidadEnCarrito = (id: string) => {
    const item = items.find((i) => i.producto.id === id);
    return item ? item.cantidad : 0;
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 selection:bg-amber-200 selection:text-amber-950 overflow-x-hidden font-sans">
      
      {/* ── 1. HERO SECTION EDITORIAL DE ALTO NIVEL ── */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#18100A] via-[#241710] to-[#18100A] text-white">
        {/* Glow ambient background orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-amber-600/20 via-orange-600/10 to-transparent blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-amber-500/10 blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-8">
          
          {/* Badge de Tradición y Origen */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 text-amber-300 text-xs font-semibold shadow-inner"
          >
            <Sparkles size={14} className="text-amber-400" />
            <span>Panadería de Masa Madre & Café de Especialidad • Cochabamba</span>
          </motion.div>

          {/* Headline Editorial */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4 max-w-4xl mx-auto"
          >
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
              El arte del buen pan,{" "}
              <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent italic">
                elevado a la excelencia.
              </span>
            </h1>

            <p className="text-amber-100/80 text-base sm:text-lg max-w-2xl mx-auto font-sans leading-relaxed">
              Masa madre con fermentación natural de 24 horas, harinas de trigo seleccionadas y café de altura cosechado en los Yungas a 1,600 msnm.
              Disfruta en nuestro salón o pide a domicilio en Cochabamba.
            </p>
          </motion.div>

          {/* Botones de Acción Inmediata Cohesivos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-3.5 pt-2"
          >
            <a
              href="#catalogo"
              onClick={() => soundManager.playOrderChime()}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-stone-950 font-black text-sm shadow-[0_10px_30px_rgba(217,119,6,0.4)] transition-all active:scale-95 flex items-center gap-2.5"
            >
              <ShoppingBag size={18} />
              <span>Explorar Menú Completo (240 Productos)</span>
              <ArrowRight size={16} />
            </a>

            <a
              href={DENCKER_ASSETS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-emerald-950/40"
            >
              <MessageCircle size={18} />
              <span>Pedir por WhatsApp (+591 76911000)</span>
            </a>

            <a
              href="#roles"
              className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 text-white font-semibold text-sm transition-all active:scale-95 flex items-center gap-2"
            >
              <Layers size={17} className="text-amber-400" />
              <span>Plataforma de Mesas</span>
            </a>
          </motion.div>

          {/* ── Vitrina Visual de Especialidades (3 Tarjetas Curatoriales) ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto text-left"
          >
            {/* Tarjeta 1: Panes de Masa Madre */}
            <div className="group rounded-3xl overflow-hidden bg-[#241710] border border-amber-900/40 shadow-2xl transition-all duration-300 hover:border-amber-500/40 hover:-translate-y-1">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://i.ibb.co/N6Wv7PjN/dencker-cat-3.jpg"
                  alt="Panadería Artesanal de Masa Madre"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#241710] via-transparent to-black/20" />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-500/90 text-stone-950 text-[11px] font-bold">
                  Fermentación 24h
                </span>
              </div>
              <div className="p-5 space-y-1.5">
                <h3 className="font-serif text-lg font-bold text-white group-hover:text-amber-200 transition">
                  Panes de Masa Madre
                </h3>
                <p className="text-stone-300 text-xs leading-relaxed">
                  Corteza crujiente caramelizada y miga suave y alveolada. Horneadas frescas diarias.
                </p>
              </div>
            </div>

            {/* Tarjeta 2: Repostería & Hojaldres */}
            <div className="group rounded-3xl overflow-hidden bg-[#241710] border border-amber-900/40 shadow-2xl transition-all duration-300 hover:border-amber-500/40 hover:-translate-y-1">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://i.ibb.co/bj5f2wcT/dencker-cat-6.jpg"
                  alt="Repostería Fina y Pastelería"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#241710] via-transparent to-black/20" />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-500/90 text-stone-950 text-[11px] font-bold">
                  Mantequilla Pura
                </span>
              </div>
              <div className="p-5 space-y-1.5">
                <h3 className="font-serif text-lg font-bold text-white group-hover:text-amber-200 transition">
                  Croissants & Repostería
                </h3>
                <p className="text-stone-300 text-xs leading-relaxed">
                  Laminado tradicional hojaldrado, alfajores de maicena y tortas artesanales de autor.
                </p>
              </div>
            </div>

            {/* Tarjeta 3: Café de Especialidad */}
            <div className="group rounded-3xl overflow-hidden bg-[#241710] border border-amber-900/40 shadow-2xl transition-all duration-300 hover:border-amber-500/40 hover:-translate-y-1">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://i.ibb.co/BV52cJkc/dencker-cat-7.jpg"
                  alt="Café de Especialidad y Barismo"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#241710] via-transparent to-black/20" />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-500/90 text-stone-950 text-[11px] font-bold">
                  Yungas 1,600 msnm
                </span>
              </div>
              <div className="p-5 space-y-1.5">
                <h3 className="font-serif text-lg font-bold text-white group-hover:text-amber-200 transition">
                  Barismo & Café de Altura
                </h3>
                <p className="text-stone-300 text-xs leading-relaxed">
                  Granos arábica cosechados en Caranavi, extraídos en máquinas italianas de espresso.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tira de Confianza & Valores Artesanales (Iconos SVG Refinados) */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-3.5 max-w-5xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <Flame size={20} />
              </div>
              <div>
                <p className="font-bold text-xs text-white">Horneadas Diarias</p>
                <p className="text-[11px] text-amber-200/70">07:30 y 16:30 calientes</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <Coffee size={20} />
              </div>
              <div>
                <p className="font-bold text-xs text-white">Café de Altura</p>
                <p className="text-[11px] text-amber-200/70">Yungas 1,600 msnm</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="font-bold text-xs text-white">Masa Madre 24h</p>
                <p className="text-[11px] text-amber-200/70">Fermentación natural</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="font-bold text-xs text-white">Ingredientes Puros</p>
                <p className="text-[11px] text-amber-200/70">Sin aditivos químicos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. EL CATÁLOGO DIGITAL Y VITRINA OFICIAL (240 PRODUCTOS REALES) ── */}
      <section id="catalogo" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        
        {/* Encabezado del Catálogo Centrado y Equilibrado */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-800 bg-amber-100/80 px-3.5 py-1 rounded-full">
            Nuestra Vitrina en Vivo
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight">
            Catálogo Completo de la Panadería
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Descubre nuestros 240 productos elaborados artesanalmente en Cochabamba con recetas europeas y materias primas selectas.
            Añade lo que gustes a tu canasta para coordinar por WhatsApp o pedir desde tu mesa física.
          </p>
        </div>

        {/* Barra de Búsqueda Rápida */}
        <div className="max-w-xl mx-auto relative">
          <Search size={18} className="absolute left-4 top-3.5 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar entre los 240 productos (marraqueta, cuñapé, alfajor, cappuccino)..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-amber-700 placeholder:text-stone-400 transition"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda("")}
              className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-700 text-xs"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Píldoras de Categorías con Scroll Suave */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
          <button
            onClick={() => {
              setCategoriaActiva("todos");
              soundManager.playClick();
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 shadow-2xs ${
              categoriaActiva === "todos"
                ? "bg-[#1E130C] text-amber-300 shadow-md shadow-stone-950/20"
                : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            <UtensilsCrossed size={14} />
            <span>Todos ({productos.length})</span>
          </button>

          <button
            onClick={() => {
              setCategoriaActiva("favoritos");
              soundManager.playClick();
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 shadow-2xs ${
              categoriaActiva === "favoritos"
                ? "bg-[#1E130C] text-amber-300 shadow-md shadow-stone-950/20"
                : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span>Más Vendidos</span>
          </button>

          {categorias.map((cat) => {
            const isSel = categoriaActiva === cat.id;
            const countInCat = productos.filter((p) => p.categoria_id === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setCategoriaActiva(cat.id);
                  soundManager.playClick();
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 shadow-2xs ${
                  isSel
                    ? "bg-[#1E130C] text-amber-300 shadow-md shadow-stone-950/20"
                    : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
                }`}
              >
                <span>{cat.nombre}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                  isSel ? "bg-amber-900/60 text-amber-200" : "bg-stone-100 text-stone-500"
                }`}>
                  {countInCat}
                </span>
              </button>
            );
          })}
        </div>

        {/* Contador de Resultados */}
        <div className="flex items-center justify-between text-xs text-stone-500 border-b border-stone-200 pb-3">
          <span>
            Mostrando <strong>{productosVisibles.length}</strong> de <strong>{productosFiltrados.length}</strong> productos
            {categoriaActiva !== "todos" && ` en ${categorias.find(c => c.id === categoriaActiva)?.nombre || "favoritos"}`}
          </span>
          <span className="font-mono text-[11px] text-amber-900 font-semibold">
            Moneda oficial: Bolivianos (BOB)
          </span>
        </div>

        {/* Grid de Productos (Cards Limpias con Fotos ImgBB) */}
        {productosVisibles.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
            <Search size={32} className="mx-auto text-stone-400" />
            <h4 className="font-serif font-bold text-lg text-stone-800">No encontramos coincidencias</h4>
            <p className="text-xs text-stone-500">Prueba con otra palabra clave o selecciona otra categoría.</p>
            <button
              onClick={() => {
                setBusqueda("");
                setCategoriaActiva("todos");
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-800 text-white text-xs font-bold"
            >
              Ver todos los productos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {productosVisibles.map((prod) => {
              const cantCarrito = getItemCantidadEnCarrito(prod.id);

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:border-amber-400/50"
                >
                  <div>
                    {/* Imagen del Producto */}
                    <div
                      onClick={() => abrirModalProducto(prod)}
                      className="relative h-44 sm:h-48 overflow-hidden bg-stone-100 cursor-pointer"
                    >
                      <img
                        src={prod.imagen_url}
                        alt={prod.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {prod.es_mas_vendido && (
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold shadow-sm flex items-center gap-1">
                          <Star size={10} className="fill-stone-950" />
                          <span>Destacado</span>
                        </span>
                      )}
                      {prod.estacion && (
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-stone-900/75 backdrop-blur-md text-white text-[9px] font-medium uppercase tracking-wider">
                          {prod.estacion}
                        </span>
                      )}
                    </div>

                    {/* Información */}
                    <div className="p-4 space-y-1.5">
                      <h4
                        onClick={() => abrirModalProducto(prod)}
                        className="font-serif font-bold text-sm sm:text-base text-stone-900 group-hover:text-amber-800 transition cursor-pointer line-clamp-1"
                      >
                        {prod.nombre}
                      </h4>
                      <p className="text-stone-500 text-xs line-clamp-2 leading-relaxed">
                        {prod.descripcion || "Elaborado con ingredientes selectos en nuestra panadería."}
                      </p>
                    </div>
                  </div>

                  {/* Precio & Botón de Añadir */}
                  <div className="p-4 pt-0 flex items-center justify-between border-t border-stone-100 mt-2">
                    <div>
                      <span className="text-[10px] text-stone-400 block font-sans">Precio</span>
                      <span className="font-serif font-extrabold text-base sm:text-lg text-amber-950">
                        Bs {prod.precio.toFixed(2)}
                      </span>
                    </div>

                    {cantCarrito > 0 ? (
                      <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 rounded-2xl p-1">
                        <button
                          onClick={() => {
                            soundManager.playClick();
                            updateCantidad(prod.id, cantCarrito - 1);
                          }}
                          className="w-6 h-6 rounded-xl bg-white text-stone-700 hover:bg-amber-100 flex items-center justify-center font-bold text-xs"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="font-mono text-xs font-bold text-amber-950 px-1">
                          {cantCarrito}
                        </span>
                        <button
                          onClick={() => {
                            soundManager.playClick();
                            updateCantidad(prod.id, cantCarrito + 1);
                          }}
                          className="w-6 h-6 rounded-xl bg-amber-800 text-white hover:bg-amber-700 flex items-center justify-center font-bold text-xs"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          soundManager.playSuccessTone();
                          addItem(prod);
                        }}
                        className="px-3.5 py-2 rounded-2xl bg-[#1E130C] hover:bg-amber-800 text-white font-semibold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                      >
                        <Plus size={14} />
                        <span>Añadir</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Botón Cargar Más */}
        {limiteVisible < productosFiltrados.length && (
          <div className="text-center pt-4">
            <button
              onClick={() => setLimiteVisible((prev) => prev + 24)}
              className="px-8 py-3.5 rounded-full bg-white border border-stone-300 hover:border-amber-800 text-stone-800 hover:text-amber-900 font-bold text-xs transition shadow-sm active:scale-95"
            >
              Cargar más productos ({productosFiltrados.length - limiteVisible} restantes)
            </button>
          </div>
        )}
      </section>

      {/* ── 3. ECOSISTEMA DIGITAL: 5 ROLES TOTALMENTE SIMÉTRICOS ── */}
      <section id="roles" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#18100A] via-[#241710] to-[#18100A] text-white">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400 bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20">
              Operación en Vivo
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Ecosistema Digital Dencker Pan
            </h2>
            <p className="text-amber-100/70 text-sm sm:text-base leading-relaxed">
              Sincronización en tiempo real entre comensales, meseros, cocina y caja POS mediante WebSockets.
            </p>
          </div>

          {/* Grid de 5 Roles Perfectamente Equilibrados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            
            {/* Rol 1: Mesa QR */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-amber-500/40 shadow-xl transition-all duration-300 flex flex-col justify-between group space-y-5">
              <div className="space-y-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
                  <QrCode size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">Mesa QR Cliente</h3>
                  <span className="text-[11px] text-amber-400 font-medium">Autoservicio en Mesa</span>
                </div>
                <p className="text-stone-300 text-xs leading-relaxed">
                  Menú digital en la mesa física con fotos, notas de preparación y llamada al mesero sin esperas.
                </p>
              </div>
              <Link
                href="/mesa/1"
                onClick={() => soundManager.playOrderChime()}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs text-center transition flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>Abrir Mesa 1</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Rol 2: Mesero */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-amber-500/40 shadow-xl transition-all duration-300 flex flex-col justify-between group space-y-5">
              <div className="space-y-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
                  <UtensilsCrossed size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">Sala & Mesero</h3>
                  <span className="text-[11px] text-amber-400 font-medium">Croquis Interactivo</span>
                </div>
                <p className="text-stone-300 text-xs leading-relaxed">
                  Mapa de mesas por zonas, toma de comandas móviles, campanilla de alertas y rondas de café.
                </p>
              </div>
              <Link
                href="/mesero"
                onClick={() => soundManager.playSuccessTone()}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs text-center transition flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>Panel Mesero</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Rol 3: Cocina KDS */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/40 shadow-xl transition-all duration-300 flex flex-col justify-between group space-y-5">
              <div className="space-y-3.5">
                <div className="w-11 h-11 rounded-2xl bg-blue-500/20 text-blue-300 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
                  <ChefHat size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">Cocina & KDS</h3>
                  <span className="text-[11px] text-blue-400 font-medium">Pantalla de Comandas</span>
                </div>
                <p className="text-stone-300 text-xs leading-relaxed">
                  Tickets táctiles en vivo por estaciones, semáforo de tiempos y despacho con chime sonoro.
                </p>
              </div>
              <Link
                href="/kds"
                onClick={() => soundManager.playSuccessTone()}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs text-center transition flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>Pantalla KDS</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Rol 4: Caja POS */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/40 shadow-xl transition-all duration-300 flex flex-col justify-between group space-y-5">
              <div className="space-y-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">Caja POS</h3>
                  <span className="text-[11px] text-emerald-400 font-medium">Facturación & QR</span>
                </div>
                <p className="text-stone-300 text-xs leading-relaxed">
                  Cobro con QR Simple boliviano, efectivo BOB, cálculo de cambio, división de cuentas y arqueo ciego.
                </p>
              </div>
              <Link
                href="/caja"
                onClick={() => soundManager.playSuccessTone()}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs text-center transition flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>Terminal POS</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Rol 5: Administración SaaS */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-stone-400/40 shadow-xl transition-all duration-300 flex flex-col justify-between group space-y-5">
              <div className="space-y-3.5">
                <div className="w-11 h-11 rounded-2xl bg-stone-500/20 text-stone-300 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
                  <Settings size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">Administración</h3>
                  <span className="text-[11px] text-stone-400 font-medium">Catálogo & Métricas</span>
                </div>
                <p className="text-stone-300 text-xs leading-relaxed">
                  Gestión completa de los 240 productos, imágenes ImgBB, stock y reportes financieros.
                </p>
              </div>
              <Link
                href="/admin"
                onClick={() => soundManager.playSuccessTone()}
                className="w-full py-2.5 rounded-xl bg-stone-700 hover:bg-stone-600 text-white font-bold text-xs text-center transition flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>Admin SaaS</span>
                <ArrowRight size={13} />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── 4. COTIZADOR DE CATERING & EVENTOS (REDISEÑO DE ALTA GAMA) ── */}
      <section id="cotizador" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
        
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-800 bg-amber-100/90 px-3.5 py-1 rounded-full">
            Servicios Exclusivos & Eventos
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight">
            Cotiza tu Evento en 10 Segundos
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Paquetes gastronómicos para defensas de tesis, cumpleaños, reuniones ejecutivas y té de la tarde con cálculo de seña del 30%.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controles del Cotizador (Lado Izquierdo) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-[32px] border border-stone-200/90 shadow-sm space-y-6">
            
            {/* Selector de Evento */}
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-3">
                1. Selecciona el Tipo de Evento
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EVENTOS_PRESETS.map((ev) => {
                  const Icon = ev.icon;
                  const isSel = eventoSeleccionado.id === ev.id;

                  return (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => {
                        setEventoSeleccionado(ev);
                        soundManager.playSuccessTone();
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all relative ${
                        isSel
                          ? "bg-amber-50/80 border-amber-700 ring-2 ring-amber-700/20 shadow-xs"
                          : "bg-stone-50/70 border-stone-200 hover:bg-stone-100/80"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isSel ? "bg-amber-800 text-white" : "bg-stone-200 text-stone-700"
                        }`}>
                          <Icon size={16} />
                        </div>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                          {ev.badge}
                        </span>
                      </div>
                      <p className="font-bold text-sm text-stone-900">{ev.label}</p>
                      <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">{ev.desc}</p>
                      <span className="text-xs text-amber-900 font-extrabold block mt-2">
                        Bs {ev.precioPersona} / persona
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slider de Personas */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  2. Número de Comensales
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInvitados((p) => Math.max(10, p - 5))}
                    className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="font-serif text-2xl font-bold text-amber-950 px-2">
                    {invitados} personas
                  </span>
                  <button
                    type="button"
                    onClick={() => setInvitados((p) => Math.min(200, p + 5))}
                    className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
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
                <span>10 (reunión íntima)</span>
                <span>100 personas</span>
                <span>200 (magno evento)</span>
              </div>
            </div>

            {/* Extras Opcionales */}
            <div className="space-y-2.5 pt-2 border-t border-stone-100">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">
                3. Extras Opcionales
              </label>

              <label className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                incluirTortaEspecial ? "bg-amber-50/60 border-amber-500/40" : "bg-stone-50 border-stone-200"
              }`}>
                <div className="text-xs">
                  <span className="font-bold text-stone-800 block">Torta Artesanal de Autor (+Bs 220)</span>
                  <span className="text-stone-500 text-[11px]">Chocolate belga, zanahoria o cheesecake con frutos rojos</span>
                </div>
                <input
                  type="checkbox"
                  checked={incluirTortaEspecial}
                  onChange={(e) => setIncluirTortaEspecial(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-700 focus:ring-amber-700 cursor-pointer"
                />
              </label>

              <label className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                incluirBarista ? "bg-amber-50/60 border-amber-500/40" : "bg-stone-50 border-stone-200"
              }`}>
                <div className="text-xs">
                  <span className="font-bold text-stone-800 block">Barista en Vivo en tu Evento (+Bs 150)</span>
                  <span className="text-stone-500 text-[11px]">Estación de espresso y arte latte en directo</span>
                </div>
                <input
                  type="checkbox"
                  checked={incluirBarista}
                  onChange={(e) => setIncluirBarista(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-700 focus:ring-amber-700 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Tarjeta de Resumen y Reserva Instantánea (Lado Derecho) */}
          <div className="lg:col-span-5 bg-[#18100A] text-white p-6 sm:p-8 rounded-[32px] border border-amber-900/40 shadow-2xl space-y-6">
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

            {/* Formulario Elegante de Reserva */}
            <form onSubmit={handleReserva} className="space-y-3">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Tu Nombre Completo"
                  value={reservaForm.nombre}
                  onChange={(e) => setReservaForm({ ...reservaForm, nombre: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="tel"
                  required
                  placeholder="Teléfono / WhatsApp"
                  value={reservaForm.telefono}
                  onChange={(e) => setReservaForm({ ...reservaForm, telefono: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <input
                  type="date"
                  required
                  value={reservaForm.fecha_evento}
                  onChange={(e) => setReservaForm({ ...reservaForm, fecha_evento: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={enviandoReserva || reservaExitosa}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-stone-950 font-black text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {enviandoReserva ? (
                  <span>Procesando...</span>
                ) : reservaExitosa ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>¡Cotización Enviada a WhatsApp!</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <MessageCircle size={16} />
                    <span>Confirmar Fecha & Cotización por WhatsApp</span>
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── 5. CONTACTO, HORARIOS & UBICACIÓN EN COCHABAMBA ── */}
      <section id="contacto" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-8 rounded-[32px] bg-white border border-stone-200/90 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <MapPin size={24} />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900">Ubicación Central</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Cochabamba, Bolivia. Salón climatizado con vista a la sala de horneado y terraza colonial al aire libre.
            </p>
            <a
              href="https://maps.google.com/?q=Cochabamba+Bolivia"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:underline pt-2"
            >
              <span>Ver en Google Maps</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <div className="p-8 rounded-[32px] bg-white border border-stone-200/90 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock size={24} />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900">Horarios de Atención</h3>
            <div className="space-y-1 text-xs text-stone-600">
              <p><strong>Lunes a Sábado:</strong> 07:00 – 21:00</p>
              <p><strong>Domingos y Feriados:</strong> 08:00 – 20:00</p>
              <p className="text-amber-800 font-semibold pt-1">
                🔥 Horneadas calientes: 07:30 y 16:30
              </p>
            </div>
          </div>

          <div className="p-8 rounded-[32px] bg-white border border-stone-200/90 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <MessageCircle size={24} />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900">Pedidos & WhatsApp</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Atención directa para catering, tortas de encargo y delivery en toda la ciudad de Cochabamba.
            </p>
            <a
              href={DENCKER_ASSETS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition"
            >
              <MessageCircle size={14} />
              <span>+591 76911000</span>
            </a>
          </div>

        </div>
      </section>

      {/* ── 6. FOOTER DE ALTA GAMA ── */}
      <footer className="bg-[#120B07] text-white py-16 px-4 border-t border-amber-900/30">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-stone-400">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <img src={DENCKER_ASSETS.logo} alt="" className="w-8 h-8 object-contain" />
              <span className="font-serif text-lg font-bold text-white">
                Dencker Pan
              </span>
            </div>
            <p className="leading-relaxed text-stone-400">
              Cafetería de especialidad, panadería tradicional de masa madre y repostería fina en Cochabamba, Bolivia.
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
            <p className="font-bold text-white uppercase tracking-wider text-[11px]">Categorías Destacadas</p>
            <ul className="space-y-1.5">
              <li><a href="#catalogo" onClick={() => setCategoriaActiva("c3")} className="hover:text-amber-400 transition">Panadería de Masa Madre</a></li>
              <li><a href="#catalogo" onClick={() => setCategoriaActiva("c4")} className="hover:text-amber-400 transition">Pastelería & Alfajores</a></li>
              <li><a href="#catalogo" onClick={() => setCategoriaActiva("c2")} className="hover:text-amber-400 transition">Masitas Saladas & Cuñapés</a></li>
              <li><a href="#catalogo" onClick={() => setCategoriaActiva("c7")} className="hover:text-amber-400 transition">Café de Altura Caranavi</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-white uppercase tracking-wider text-[11px]">Ubicación & Contacto</p>
            <p>Cochabamba, Bolivia</p>
            <p>WhatsApp: +591 76911000</p>
            <p className="text-[10px] text-stone-500 pt-2">© 2026 Dencker Pan S.R.L. Todos los derechos reservados.</p>
          </div>

        </div>
      </footer>

      {/* Modal para Personalizar Producto al Añadir */}
      <AnimatePresence>
        {productoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProductoModal(null)}
              className="fixed inset-0 bg-black/75 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl z-10 text-stone-900"
            >
              <div className="relative h-48 bg-stone-100">
                <img
                  src={productoModal.imagen_url}
                  alt={productoModal.nombre}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setProductoModal(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-serif font-bold text-xl text-stone-900">
                    {productoModal.nombre}
                  </h3>
                  <p className="text-stone-500 text-xs mt-1">
                    {productoModal.descripcion || "Elaborado fresco a diario."}
                  </p>
                  <span className="font-serif font-bold text-lg text-amber-950 block mt-2">
                    Bs {productoModal.precio.toFixed(2)}
                  </span>
                </div>

                {productoModal.chips_personalizacion && productoModal.chips_personalizacion.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                      Preferencias de Preparación
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {productoModal.chips_personalizacion.map((chip) => {
                        const isChipSel = chipsSeleccionados.includes(chip);
                        return (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => {
                              soundManager.playClick();
                              setChipsSeleccionados((prev) =>
                                isChipSel ? prev.filter((c) => c !== chip) : [...prev, chip]
                              );
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                              isChipSel
                                ? "bg-amber-800 text-white shadow-xs"
                                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                            }`}
                          >
                            {chip}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                    Nota Especial para Cocina / Barismo
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: bien caliente, sin azúcar, para llevar..."
                    value={notaPersonalizada}
                    onChange={(e) => setNotaPersonalizada(e.target.value)}
                    className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-700"
                  />
                </div>

                <button
                  onClick={agregarAlCarritoDesdeModal}
                  className="w-full py-3.5 rounded-2xl bg-amber-800 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  <span>Añadir a la Canasta • Bs {productoModal.precio.toFixed(2)}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

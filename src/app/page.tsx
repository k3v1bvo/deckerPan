"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Coffee,
  QrCode,
  Star,
  Users,
  UtensilsCrossed,
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
  X,
  MapPin,
  Layers,
  GraduationCap,
  Cake,
  Briefcase,
  Bell,
  Check,
} from "lucide-react";
import CoffeeLab from "@/components/CoffeeLab";
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
    label: "Té de la Tarde Gourmet",
    precioPersona: 50,
    desc: "Mesa dulce completa, infusiones gourmet y mini repostería fina",
    badge: "Exclusivo",
  },
];

export default function HomePage() {
  const storeProductos = useSystemStore((state) => state.productos);
  const storeCategorias = useSystemStore((state) => state.categorias);
  const addAlerta = useSystemStore((state) => state.addAlerta);

  const productos: Producto[] =
    storeProductos && storeProductos.length > 0 ? storeProductos : SEED_PRODUCTOS;
  const categorias: Categoria[] =
    storeCategorias && storeCategorias.length > 0 ? storeCategorias : SEED_CATEGORIAS;

  const { items, addItem, updateCantidad, total, count } = useCartStore();
  const { setCartOpen } = useUIStore();

  const cartCount = count();
  const cartTotal = total();

  // Estados del Catálogo
  const [categoriaActiva, setCategoriaActiva] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState<string>("");
  const [limiteVisible, setLimiteVisible] = useState<number>(24);
  const [productoModal, setProductoModal] = useState<Producto | null>(null);
  const [chipsSeleccionados, setChipsSeleccionados] = useState<string[]>([]);
  const [notaPersonalizada, setNotaPersonalizada] = useState<string>("");

  // Modal Llamar Mesero desde Home
  const [modalMeseroAbierto, setModalMeseroAbierto] = useState(false);
  const [mesaLlamada, setMesaLlamada] = useState<number>(1);
  const [alertaEnviada, setAlertaEnviada] = useState(false);

  // Estados del Cotizador
  const [invitados, setInvitados] = useState<number>(30);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(EVENTOS_PRESETS[0]);
  const [incluirTortaEspecial, setIncluirTortaEspecial] = useState(true);
  const [incluirBarista, setIncluirBarista] = useState(true);

  // Helper de Audio ASMR contextual según tipo de producto
  const reproducirSonidoProducto = (p: Producto) => {
    const lower = p.nombre.toLowerCase();
    const esHorneado =
      p.categoria_id === "c2" ||
      p.categoria_id === "c3" ||
      p.categoria_id === "c6" ||
      lower.includes("pan") ||
      lower.includes("cauka") ||
      lower.includes("cuñape") ||
      lower.includes("croissant");

    if (esHorneado) {
      soundManager.playBreadCrunch();
    } else {
      soundManager.playPorcelainTink();
    }
  };

  // Filtrado reactivo de productos
  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const matchBusqueda =
        !busqueda ||
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(busqueda.toLowerCase()));

      if (!matchBusqueda) return false;

      if (categoriaActiva === "todos") return true;
      if (categoriaActiva === "favoritos") return Boolean(p.es_mas_vendido);
      if (categoriaActiva === "horneados") {
        return (
          p.categoria_id === "c2" ||
          p.categoria_id === "c3" ||
          p.categoria_id === "c6" ||
          p.nombre.toLowerCase().includes("pan") ||
          p.nombre.toLowerCase().includes("cauka") ||
          p.nombre.toLowerCase().includes("croissant")
        );
      }
      if (categoriaActiva === "reposteria") {
        return (
          p.categoria_id === "c4" ||
          p.categoria_id === "c7" ||
          p.nombre.toLowerCase().includes("torta") ||
          p.nombre.toLowerCase().includes("alfajor") ||
          p.nombre.toLowerCase().includes("pie")
        );
      }
      if (categoriaActiva === "cafe") {
        return (
          p.categoria_id === "c7" ||
          p.nombre.toLowerCase().includes("café") ||
          p.nombre.toLowerCase().includes("espresso") ||
          p.nombre.toLowerCase().includes("cappuccino") ||
          p.nombre.toLowerCase().includes("latte")
        );
      }
      return p.categoria_id === categoriaActiva;
    });
  }, [productos, categoriaActiva, busqueda]);

  const productosVisibles = useMemo(() => {
    return productosFiltrados.slice(0, limiteVisible);
  }, [productosFiltrados, limiteVisible]);

  // Cotizador cálculo
  const presupuestoEstimado = useMemo(() => {
    let base = invitados * eventoSeleccionado.precioPersona;
    if (incluirTortaEspecial) base += 220;
    if (incluirBarista) base += 180;
    return base;
  }, [invitados, eventoSeleccionado, incluirTortaEspecial, incluirBarista]);

  const abrirModalProducto = (p: Producto) => {
    reproducirSonidoProducto(p);
    setProductoModal(p);
    setChipsSeleccionados([]);
    setNotaPersonalizada("");
  };

  const agregarAlCarritoRapido = (p: Producto, e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playTactileClick();
    reproducirSonidoProducto(p);
    addItem(p);
  };

  const getItemCantidadEnCarrito = (id: string) => {
    const item = items.find((i) => i.producto.id === id);
    return item ? item.cantidad : 0;
  };

  const handleLlamarMesero = () => {
    addAlerta({
      mesa_numero: mesaLlamada,
      tipo: "llamado",
      mensaje: "Atención / Consulta en Mesa",
      datos_extra: {},
    });
    soundManager.playWaiterBell();
    setAlertaEnviada(true);
    setTimeout(() => {
      setAlertaEnviada(false);
      setModalMeseroAbierto(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 selection:bg-amber-200 selection:text-amber-950 overflow-x-hidden font-sans">
      
      {/* ── 1. HERO SECTION EDITORIAL & WARM LUXURY ── */}
      <section className="relative pt-10 pb-20 sm:pt-16 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#0F0A07] via-[#1A110B] to-[#0F0A07] text-white">
        {/* Luces volumétricas cálidas y difusas */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-amber-600/25 via-orange-600/10 to-transparent blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[450px] h-[300px] bg-amber-500/10 blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-7">
          
          {/* Badge de Horno en Vivo */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 text-amber-300 text-xs font-semibold shadow-inner"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Hornos en Vivo • Masa Madre de 24h & Café de Especialidad</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 font-bold">
              Cochabamba
            </span>
          </motion.div>

          {/* Headline Editorial */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4 max-w-4xl mx-auto"
          >
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
              El arte del pan crujiente,{" "}
              <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent italic">
                elevado a la excelencia.
              </span>
            </h1>

            <p className="text-amber-100/80 text-sm sm:text-lg max-w-2xl mx-auto font-sans leading-relaxed">
              Masa madre con fermentación natural de 24 horas, harinas de trigo seleccionadas y café de altura cosechado en los Yungas a 1,600 msnm.
              Disfruta en nuestro salón o pide para tu mesa en Cochabamba.
            </p>
          </motion.div>

          {/* Botones de Acción Inmediata */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-3.5 pt-2"
          >
            <a
              href="#catalogo"
              onClick={() => soundManager.playOrderChime()}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black text-sm shadow-[0_10px_30px_rgba(245,158,11,0.35)] transition-all active:scale-95 flex items-center gap-2.5"
            >
              <ShoppingBag size={18} />
              <span>Explorar Menú & Precios</span>
              <ArrowRight size={16} />
            </a>

            <button
              onClick={() => {
                soundManager.playWaiterBell();
                setModalMeseroAbierto(true);
              }}
              className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 text-white font-bold text-sm transition-all active:scale-95 flex items-center gap-2"
            >
              <Bell size={17} className="text-amber-400" />
              <span>Llamar al Mesero</span>
            </button>

            <a
              href="#coffeelab"
              onClick={() => soundManager.playPorcelainTink()}
              className="px-6 py-3.5 rounded-full bg-amber-950/70 hover:bg-amber-900/70 border border-amber-800/60 text-amber-200 font-semibold text-sm transition-all active:scale-95 flex items-center gap-2"
            >
              <Coffee size={17} className="text-amber-400" />
              <span>CoffeeLab 3D</span>
            </a>
          </motion.div>

          {/* ── 2. BENTO GRID SHOWCASE (APPLE-STYLE MODULAR) ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto text-left"
          >
            {/* Bento Card 1: Horneados de Masa Madre (Grande) */}
            <div className="md:col-span-2 group rounded-3xl overflow-hidden bg-gradient-to-br from-[#1E130D] to-[#291A12] border border-amber-900/40 shadow-2xl p-6 sm:p-8 flex flex-col justify-between relative hover:border-amber-500/40 transition-all duration-300">
              <div className="absolute top-0 right-0 w-80 h-full opacity-35 pointer-events-none overflow-hidden">
                <img
                  src="https://i.ibb.co/N6Wv7PjN/dencker-cat-3.jpg"
                  alt="Masa Madre Dencker Pan"
                  className="w-full h-full object-cover scale-110 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1E130D] via-[#1E130D]/80 to-transparent" />
              </div>

              <div className="relative z-10 space-y-3 max-w-md">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                  <Flame size={13} className="text-amber-400" />
                  Horno de Piedra • Fermentación 24h
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight">
                  Panadería Tradicional & Masa Madre
                </h3>
                <p className="text-amber-100/70 text-xs sm:text-sm leading-relaxed">
                  Caukas tradicionales con queso criollo, orégano de los valles y cuñapés abizcochados horneados frescas diariamente a las 07:30 y 16:30.
                </p>
              </div>

              <div className="relative z-10 pt-6 flex items-center gap-4">
                <a
                  href="#catalogo"
                  onClick={() => {
                    setCategoriaActiva("horneados");
                    soundManager.playBreadCrunch();
                  }}
                  className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 hover:text-amber-200 group-hover:translate-x-1 transition-all"
                >
                  <span>Ver Especialidades Horneadas</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>

            {/* Bento Card 2: Barismo & Café de Altura */}
            <div className="group rounded-3xl overflow-hidden bg-gradient-to-br from-[#1A120D] to-[#241710] border border-amber-900/40 shadow-2xl p-6 flex flex-col justify-between relative hover:border-amber-500/40 transition-all duration-300">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                  <Coffee size={13} className="text-amber-400" />
                  1,600 msnm
                </span>
                <h3 className="font-serif text-xl font-bold text-white">
                  Café de Altura Caranavi
                </h3>
                <p className="text-amber-100/70 text-xs leading-relaxed">
                  Granos arábica seleccionados de los Yungas y Samaipata. Extracciones dobles y microfoam sedoso a 65°C.
                </p>
              </div>

              <div className="pt-6">
                <a
                  href="#coffeelab"
                  onClick={() => soundManager.playPorcelainTink()}
                  className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 hover:text-amber-200"
                >
                  <span>Abrir CoffeeLab</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Tira de Métricas y Valores Reales */}
          <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto text-left">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <Flame size={18} />
              </div>
              <div>
                <p className="font-bold text-xs text-white">07:30 y 16:30</p>
                <p className="text-[11px] text-amber-200/60">Tandas calientes</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <Coffee size={18} />
              </div>
              <div>
                <p className="font-bold text-xs text-white">Caranavi & Samaipata</p>
                <p className="text-[11px] text-amber-200/60">Granos 100% arábica</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="font-bold text-xs text-white">Masa Madre Viva</p>
                <p className="text-[11px] text-amber-200/60">Sin químicos ni aditivos</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="font-bold text-xs text-white">100% Mantequilla</p>
                <p className="text-[11px] text-amber-200/60">Hojaldre artesanal puro</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. COFFEELAB EXPERIMENTAL (TAZA 3D INTERACTIVA) ── */}
      <section id="coffeelab" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <CoffeeLab />
      </section>

      {/* ── 4. CATÁLOGO DIGITAL EN VIVO (CON PRECIOS BOB & FOTOS REALES) ── */}
      <section id="catalogo" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        
        {/* Encabezado del Catálogo */}
        <div className="text-center space-y-2.5 max-w-2xl mx-auto">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-800 bg-amber-100/90 px-3.5 py-1 rounded-full">
            Vitrina en Vivo
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight">
            Especialidades de Dencker Pan
          </h2>
          <p className="text-stone-600 text-sm leading-relaxed">
            Panes tradicionales de Cochabamba, repostería europea hojaldrada y café de altura. Precios en Bolivianos (Bs).
          </p>
        </div>

        {/* Buscador & Píldoras de Categoría */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar entre nuestras especialidades (cauka, cuñapé, croissant, cappuccino)..."
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

          {/* Categorías con ASMR reactivo */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
            <button
              onClick={() => {
                setCategoriaActiva("todos");
                soundManager.playTactileClick();
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 shadow-2xs ${
                categoriaActiva === "todos"
                  ? "bg-[#1E130C] text-amber-300 shadow-md"
                  : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
              }`}
            >
              <UtensilsCrossed size={14} />
              <span>Todos ({productos.length})</span>
            </button>

            <button
              onClick={() => {
                setCategoriaActiva("horneados");
                soundManager.playBreadCrunch();
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 shadow-2xs ${
                categoriaActiva === "horneados"
                  ? "bg-gradient-to-r from-amber-950 to-[#2A180E] text-amber-300 border border-amber-500/50 shadow-md"
                  : "bg-white text-stone-700 border border-stone-200 hover:bg-amber-50/50"
              }`}
            >
              <Flame size={14} className="text-amber-500" />
              <span>Horneados de la Casa</span>
            </button>

            <button
              onClick={() => {
                setCategoriaActiva("reposteria");
                soundManager.playPorcelainTink();
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 shadow-2xs ${
                categoriaActiva === "reposteria"
                  ? "bg-gradient-to-r from-amber-950 to-[#2A180E] text-amber-300 border border-amber-500/50 shadow-md"
                  : "bg-white text-stone-700 border border-stone-200 hover:bg-amber-50/50"
              }`}
            >
              <Cake size={14} className="text-amber-400" />
              <span>Repostería & Tortas</span>
            </button>

            <button
              onClick={() => {
                setCategoriaActiva("cafe");
                soundManager.playPorcelainTink();
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 shadow-2xs ${
                categoriaActiva === "cafe"
                  ? "bg-gradient-to-r from-amber-950 to-[#2A180E] text-amber-300 border border-amber-500/50 shadow-md"
                  : "bg-white text-stone-700 border border-stone-200 hover:bg-amber-50/50"
              }`}
            >
              <Coffee size={14} className="text-amber-400" />
              <span>Cafetería & Barismo</span>
            </button>

            <button
              onClick={() => {
                setCategoriaActiva("favoritos");
                soundManager.playTactileClick();
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 shadow-2xs ${
                categoriaActiva === "favoritos"
                  ? "bg-[#1E130C] text-amber-300 shadow-md"
                  : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
              }`}
            >
              <Star size={14} className="text-amber-400 fill-amber-400" />
              <span>Destacados</span>
            </button>
          </div>
        </div>

        {/* Grid de Productos Moderno */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {productosVisibles.map((prod) => {
            const cantidadEnCarrito = getItemCantidadEnCarrito(prod.id);
            const tieneFoto = Boolean(prod.imagen_url && prod.imagen_url.startsWith("http"));

            return (
              <motion.div
                key={prod.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className="group bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-xl hover:border-amber-300/80 transition-all overflow-hidden flex flex-col justify-between"
              >
                {/* Imagen del Producto */}
                <div
                  onClick={() => abrirModalProducto(prod)}
                  className="relative h-48 bg-stone-100 overflow-hidden cursor-pointer"
                >
                  <img
                    src={prod.imagen_url || "https://i.ibb.co/N6Wv7PjN/dencker-cat-3.jpg"}
                    alt={prod.nombre}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Badge de Categoría o Destacado */}
                  {prod.es_mas_vendido && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-500/95 text-stone-950 font-bold text-[10px] shadow-sm">
                      ★ Favorito
                    </span>
                  )}
                  {prod.disponible === false && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-stone-900/90 text-white font-bold text-[10px]">
                      Agotado
                    </span>
                  )}
                </div>

                {/* Contenido del Producto */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      onClick={() => abrirModalProducto(prod)}
                      className="font-serif font-bold text-base text-stone-900 hover:text-amber-800 transition cursor-pointer line-clamp-1"
                    >
                      {prod.nombre}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                      {prod.descripcion || "Elaborado fresco diariamente con receta artesanal."}
                    </p>
                  </div>

                  {/* Footer de Tarjeta: Precio y Botón Agregar */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 block font-medium">Precio</span>
                      <span className="font-serif text-lg font-extrabold text-amber-950">
                        Bs {prod.precio.toFixed(2)}
                      </span>
                    </div>

                    {cantidadEnCarrito > 0 ? (
                      <div className="flex items-center gap-1 bg-amber-50 border border-amber-300 rounded-2xl p-1 shadow-2xs">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            soundManager.playTactileClick();
                            updateCantidad(prod.id, cantidadEnCarrito - 1);
                          }}
                          className="w-7 h-7 rounded-xl bg-white hover:bg-stone-100 text-stone-700 flex items-center justify-center font-bold text-xs"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="font-mono text-xs font-bold text-amber-950 px-2">
                          {cantidadEnCarrito}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            soundManager.playTactileClick();
                            reproducirSonidoProducto(prod);
                            updateCantidad(prod.id, cantidadEnCarrito + 1);
                          }}
                          className="w-7 h-7 rounded-xl bg-amber-800 hover:bg-amber-700 text-white flex items-center justify-center font-bold text-xs shadow-xs"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    ) : (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={(e) => agregarAlCarritoRapido(prod, e)}
                        className="px-3.5 py-2 rounded-2xl bg-amber-800 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                      >
                        <Plus size={14} />
                        <span>Añadir</span>
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Botón Cargar Más */}
        {productosFiltrados.length > limiteVisible && (
          <div className="text-center pt-6">
            <button
              onClick={() => {
                soundManager.playTactileClick();
                setLimiteVisible((p) => p + 24);
              }}
              className="px-6 py-3 rounded-full bg-white border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50 shadow-xs transition"
            >
              Cargar más productos ({productosFiltrados.length - limiteVisible} restantes)
            </button>
          </div>
        )}
      </section>

      {/* ── 5. COTIZADOR DE EVENTOS & CATERING EXPRESS ── */}
      <section id="catering" className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
        <div className="bg-white p-6 sm:p-10 rounded-[32px] border border-stone-200 shadow-lg space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-800 bg-amber-100/90 px-3.5 py-1 rounded-full">
              Catering & Eventos
            </span>
            <h3 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900">
              Cotiza tu Evento en 10 Segundos
            </h3>
            <p className="text-stone-500 text-xs sm:text-sm">
              Paquetes para defensas de tesis, cumpleaños, reuniones corporativas y té de la tarde en Cochabamba.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {EVENTOS_PRESETS.map((ev) => {
              const Icon = ev.icon;
              const isSel = eventoSeleccionado.id === ev.id;
              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => {
                    setEventoSeleccionado(ev);
                    soundManager.playTactileClick();
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    isSel
                      ? "bg-amber-50 border-amber-800 ring-2 ring-amber-800/20 shadow-xs"
                      : "bg-stone-50 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-800/10 text-amber-800 flex items-center justify-center mb-2">
                    <Icon size={16} />
                  </div>
                  <p className="font-bold text-xs text-stone-900">{ev.label}</p>
                  <span className="text-xs font-mono font-bold text-amber-900 block mt-1">
                    Bs {ev.precioPersona} / pers.
                  </span>
                </button>
              );
            })}
          </div>

          {/* Ajuste de Personas y Total */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-stone-500">Invitados:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInvitados((p) => Math.max(10, p - 5))}
                  className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-stone-700 font-bold text-xs"
                >
                  -
                </button>
                <span className="font-serif text-lg font-bold text-amber-950 px-1">
                  {invitados} personas
                </span>
                <button
                  onClick={() => setInvitados((p) => Math.min(200, p + 5))}
                  className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-stone-700 font-bold text-xs"
                >
                  +
                </button>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-stone-400 block">Presupuesto Estimado:</span>
              <span className="font-serif text-2xl font-bold text-amber-950">
                Bs {presupuestoEstimado.toFixed(2)}
              </span>
            </div>

            <a
              href={`https://wa.me/59176911000?text=${encodeURIComponent(
                `Hola Dencker Pan, deseo cotizar evento de ${eventoSeleccionado.label} para ${invitados} personas (Estimado: Bs ${presupuestoEstimado}).`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundManager.playOrderChime()}
              className="px-6 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <MessageCircle size={15} />
              <span>Coordinar por WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── 6. BARRA FLOTANTE DE CANASTA (STICKY BOTTOM CART PILL) ── */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none"
          >
            <div className="pointer-events-auto bg-[#1A110B]/95 backdrop-blur-2xl border border-amber-500/40 shadow-2xl rounded-full px-5 py-3 flex items-center gap-4 text-white">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center">
                  {cartCount}
                </span>
                <div className="text-xs leading-tight">
                  <span className="text-amber-200/70 block">Tu Pedido</span>
                  <span className="font-serif font-bold text-amber-100 text-sm">
                    Bs {cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  soundManager.playCashRegister();
                  setCartOpen(true);
                }}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition"
              >
                <span>Ver Canasta & Pedir</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 7. MODAL DE LLAMAR MESERO RÁPIDO ── */}
      <AnimatePresence>
        {modalMeseroAbierto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                <Bell size={24} />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Llamar al Mesero
                </h3>
                <p className="text-xs text-stone-500">
                  Selecciona el número de tu mesa para que el personal se acerque de inmediato.
                </p>
              </div>

              {alertaEnviada ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1 text-emerald-800">
                  <CheckCircle2 size={28} className="mx-auto text-emerald-600" />
                  <p className="font-bold text-sm">¡Aviso Enviado!</p>
                  <p className="text-xs text-emerald-600">
                    El mesero de turno ya recibió la notificación de la Mesa {mesaLlamada}.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setMesaLlamada(m);
                          soundManager.playTactileClick();
                        }}
                        className={`py-2 rounded-xl text-xs font-bold transition ${
                          mesaLlamada === m
                            ? "bg-amber-800 text-white shadow-xs"
                            : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                        }`}
                      >
                        Mesa {m}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setModalMeseroAbierto(false)}
                      className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleLlamarMesero}
                      className="flex-1 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-700 text-white text-xs font-bold shadow-md"
                    >
                      Llamar Ahora
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 8. MODAL DE DETALLE DE PRODUCTO ── */}
      <AnimatePresence>
        {productoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4"
            >
              <div className="relative h-48 -mx-6 -mt-6 bg-stone-100 overflow-hidden">
                <img
                  src={productoModal.imagen_url || "https://i.ibb.co/N6Wv7PjN/dencker-cat-3.jpg"}
                  alt={productoModal.nombre}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setProductoModal(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  {productoModal.nombre}
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {productoModal.descripcion || "Elaborado fresco diariamente con receta artesanal."}
                </p>
                <p className="font-serif text-2xl font-extrabold text-amber-950 pt-1">
                  Bs {productoModal.precio.toFixed(2)}
                </p>
              </div>

              {/* Chips de personalización */}
              {productoModal.chips_personalizacion && productoModal.chips_personalizacion.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                    Opciones Disponibles:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {productoModal.chips_personalizacion.map((chip) => {
                      const sel = chipsSeleccionados.includes(chip);
                      return (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => {
                            soundManager.playTactileClick();
                            setChipsSeleccionados((prev) =>
                              sel ? prev.filter((c) => c !== chip) : [...prev, chip]
                            );
                          }}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                            sel
                              ? "bg-amber-800 text-white"
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

              {/* Nota especial */}
              <div>
                <input
                  type="text"
                  placeholder="Nota especial (ej. tibio, sin azúcar, para llevar)..."
                  value={notaPersonalizada}
                  onChange={(e) => setNotaPersonalizada(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-800"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  soundManager.playCashRegister();
                  addItem(productoModal, chipsSeleccionados, notaPersonalizada || undefined);
                  setProductoModal(null);
                }}
                className="w-full py-3.5 rounded-2xl bg-amber-800 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                <span>Agregar al Pedido • Bs {productoModal.precio.toFixed(2)}</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

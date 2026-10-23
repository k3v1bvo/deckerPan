"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Coffee,
  Star,
  Users,
  UtensilsCrossed,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Flame,
  Heart,
  MessageCircle,
  Search,
  ShoppingBag,
  Plus,
  Minus,
  X,
  MapPin,
  GraduationCap,
  Cake,
  Briefcase,
  Bell,
  Check,
  ChevronRight,
  Droplets,
} from "lucide-react";
import CoffeeLab from "@/components/CoffeeLab";
import { useSystemStore, useCartStore, useUIStore } from "@/store";
import { soundManager } from "@/lib/sound";
import { DENCKER_ASSETS, SEED_CATEGORIAS, SEED_PRODUCTOS } from "@/lib/seed-data";
import { Producto, Categoria } from "@/types";

const springPhysics = { type: "spring", stiffness: 400, damping: 15 } as const;
const springCard = { type: "spring", stiffness: 350, damping: 22 } as const;

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

  const [categoriaActiva, setCategoriaActiva] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState<string>("");
  const [limiteVisible, setLimiteVisible] = useState<number>(20);
  const [productoModal, setProductoModal] = useState<Producto | null>(null);
  const [chipsSeleccionados, setChipsSeleccionados] = useState<string[]>([]);
  const [notaPersonalizada, setNotaPersonalizada] = useState<string>("");

  const [invitados, setInvitados] = useState<number>(30);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(EVENTOS_PRESETS[0]);
  const [incluirTortaEspecial, setIncluirTortaEspecial] = useState(true);
  const [incluirBarista, setIncluirBarista] = useState(true);

  const presupuestoEstimado = useMemo(() => {
    let base = invitados * eventoSeleccionado.precioPersona;
    if (incluirTortaEspecial) base += 220;
    if (incluirBarista) base += 180;
    return base;
  }, [invitados, eventoSeleccionado, incluirTortaEspecial, incluirBarista]);

  // 1. Deduplicar productos por nombre normalizado (para evitar duplicados en catálogo)
  const productosUnicos = useMemo(() => {
    const vistos = new Set<string>();
    const lista: Producto[] = [];
    for (const p of productos) {
      const nombreNorm = p.nombre.toLowerCase().trim();
      if (!vistos.has(nombreNorm)) {
        vistos.add(nombreNorm);
        lista.push(p);
      }
    }
    return lista;
  }, [productos]);

  // Función para identificar bebidas comerciales / aguas embotelladas
  const esBebidaEnvasada = (p: Producto) => {
    const n = p.nombre.toLowerCase();
    return (
      n.includes("agua") ||
      n.includes("aquarius") ||
      n.includes("coca") ||
      n.includes("fanta") ||
      n.includes("sprite") ||
      n.includes("soda") ||
      n.includes("gaseosa") ||
      n.includes("jugo del valle") ||
      n.includes("powerade") ||
      n.includes("simba") ||
      n.includes("salvietti") ||
      n.includes("monster") ||
      n.includes("red bull")
    );
  };

  const productosFiltrados = useMemo(() => {
    const filtrados = productosUnicos.filter((p) => {
      const matchBusqueda =
        !busqueda ||
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(busqueda.toLowerCase()));

      if (!matchBusqueda) return false;

      if (categoriaActiva === "bebidas") {
        return esBebidaEnvasada(p);
      }

      if (categoriaActiva === "todos") return true;
      if (categoriaActiva === "favoritos") return Boolean(p.es_mas_vendido);
      if (categoriaActiva === "horneados") {
        return (
          p.categoria_id === "c2" ||
          p.categoria_id === "c3" ||
          p.categoria_id === "c6" ||
          p.nombre.toLowerCase().includes("pan") ||
          p.nombre.toLowerCase().includes("cauka") ||
          p.nombre.toLowerCase().includes("croissant") ||
          p.nombre.toLowerCase().includes("marraqueta")
        );
      }
      if (categoriaActiva === "reposteria") {
        return (
          p.categoria_id === "c4" ||
          p.categoria_id === "c7" ||
          p.nombre.toLowerCase().includes("torta") ||
          p.nombre.toLowerCase().includes("alfajor") ||
          p.nombre.toLowerCase().includes("pie") ||
          p.nombre.toLowerCase().includes("roll")
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

    // Ordenar con criterio artesanal: panes, hojaldres y cafés primero; bebidas envasadas al final
    return [...filtrados].sort((a, b) => {
      const aBebida = esBebidaEnvasada(a);
      const bBebida = esBebidaEnvasada(b);

      if (categoriaActiva === "todos") {
        if (aBebida && !bBebida) return 1;
        if (!aBebida && bBebida) return -1;
      }

      if (a.es_mas_vendido && !b.es_mas_vendido) return -1;
      if (!a.es_mas_vendido && b.es_mas_vendido) return 1;

      const aEsPan = a.nombre.toLowerCase().includes("pan") || a.nombre.toLowerCase().includes("cauka") || a.nombre.toLowerCase().includes("marraqueta");
      const bEsPan = b.nombre.toLowerCase().includes("pan") || b.nombre.toLowerCase().includes("cauka") || b.nombre.toLowerCase().includes("marraqueta");
      if (aEsPan && !bEsPan) return -1;
      if (!aEsPan && bEsPan) return 1;

      const aEsPastry = a.nombre.toLowerCase().includes("roll") || a.nombre.toLowerCase().includes("croissant") || a.nombre.toLowerCase().includes("alfajor") || a.nombre.toLowerCase().includes("torta");
      const bEsPastry = b.nombre.toLowerCase().includes("roll") || b.nombre.toLowerCase().includes("croissant") || b.nombre.toLowerCase().includes("alfajor") || b.nombre.toLowerCase().includes("torta");
      if (aEsPastry && !bEsPastry) return -1;
      if (!aEsPastry && bEsPastry) return 1;

      return 0;
    });
  }, [productosUnicos, categoriaActiva, busqueda]);

  const starProduct = useMemo(() => {
    return (
      productosUnicos.find((p) => p.id === "prod_ny_pistacho") ||
      productosUnicos.find((p) => p.nombre.toLowerCase().includes("pistacho")) ||
      productosUnicos.find((p) => p.es_mas_vendido) ||
      productosUnicos[0]
    );
  }, [productosUnicos]);

  const remainingProducts = useMemo(() => {
    const list = productosFiltrados.filter((p) => p.id !== starProduct?.id);
    return list.slice(0, limiteVisible);
  }, [productosFiltrados, starProduct, limiteVisible]);

  const abrirModalProducto = (p: Producto) => {
    soundManager.playPastryCrinkle();
    setProductoModal(p);
    setChipsSeleccionados([]);
    setNotaPersonalizada("");
  };

  const agregarAlCarritoRapido = (p: Producto, e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playPastryCrinkle();
    addItem(p);
  };

  const getItemCantidadEnCarrito = (id: string) => {
    const item = items.find((i) => i.producto.id === id);
    return item ? item.cantidad : 0;
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] text-[#1E130C] selection:bg-[#E2EBDC] selection:text-[#2D452E] overflow-x-hidden font-sans flex flex-col items-center">
      
      {/* ── 1. HERO EDITORIAL DESCONGESTIONADO (FULL BLEED w-full) ── */}
      <section className="w-full bg-gradient-to-b from-[#100A07] via-[#1A110B] to-[#100A07] text-white relative overflow-hidden flex flex-col items-center justify-center">
        {/* Glows ambientales sutiles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#87A987]/15 via-[#C49B71]/10 to-transparent blur-[160px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[350px] bg-[#527953]/15 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 min-h-[80vh] flex flex-col items-center justify-center py-20 lg:py-24 text-center relative z-10 space-y-10">
          
          {/* Badge Superior */}
          <div className="w-full flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springPhysics}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-[#CDE0C9] text-xs font-semibold shadow-2xl"
            >
              <span className="w-2 h-2 rounded-full bg-[#87A987] animate-pulse" />
              <span>Fermentación de 24h • Horno de Masa Madre • Granos de Altura</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#527953]/40 text-[#EBF3EA] font-bold">
                Cochabamba
              </span>
            </motion.div>
          </div>

          {/* Headline Editorial en Fraunces Serif */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springPhysics, delay: 0.1 }}
            className="space-y-4 max-w-4xl mx-auto text-center w-full flex flex-col items-center"
          >
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08] text-center">
              El aroma del pan crujiente,{" "}
              <span className="italic font-normal text-[#CDE0C9] bg-gradient-to-r from-[#D8E6D3] via-[#FAF7F2] to-[#87A987] bg-clip-text text-transparent block sm:inline">
                elevado a una experiencia sensorial.
              </span>
            </h1>

            <p className="text-[#D8C7B8] text-base sm:text-lg max-w-2xl mx-auto font-sans leading-relaxed pt-2 text-center">
              Masa madre viva de 24 horas, hojaldres con 100% pura mantequilla e infusiones de café de altura cosechado en Caranavi a 1,600 msnm.
            </p>
          </motion.div>

          {/* Exactamente 2 Botones Bien Espaciados */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springPhysics, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-5 pt-4 w-full"
          >
            <motion.a
              href="#menu-bento"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96, y: 1 }}
              transition={springPhysics}
              onClick={() => soundManager.playPastryCrinkle()}
              className="px-8 py-4 rounded-full bg-[#FAF7F2] hover:bg-white text-[#1E130C] font-extrabold text-sm shadow-[0_8px_30px_rgba(255,255,255,0.2)] flex items-center gap-2.5 select-none transition"
            >
              <ShoppingBag size={18} className="text-[#527953]" />
              <span>Explorar Menú Bento</span>
              <ArrowRight size={16} />
            </motion.a>

            <motion.a
              href="#coffeelab"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96, y: 1 }}
              transition={springPhysics}
              onClick={() => soundManager.playPorcelainTink()}
              className="px-8 py-4 rounded-full bg-[#241710]/90 hover:bg-[#2E1D14] border border-[#527953]/50 text-[#CDE0C9] font-bold text-sm flex items-center gap-2.5 select-none shadow-lg transition"
            >
              <Coffee size={18} className="text-[#87A987]" />
              <span>CoffeeLab 3D</span>
            </motion.a>
          </motion.div>

          {/* Franja Inferior Limpia de 4 Columnas (Descongestionada) */}
          <div className="pt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto text-left w-full">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#527953]/25 text-[#87A987] flex items-center justify-center shrink-0 border border-[#527953]/30">
                <Flame size={20} />
              </div>
              <div>
                <p className="font-bold text-sm text-white">07:30 y 16:30</p>
                <p className="text-xs text-[#A8988D]">Tandas calientes al día</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#527953]/25 text-[#87A987] flex items-center justify-center shrink-0 border border-[#527953]/30">
                <Coffee size={20} />
              </div>
              <div>
                <p className="font-bold text-sm text-white">Caranavi & Samaipata</p>
                <p className="text-xs text-[#A8988D]">100% arábica seleccionado</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#527953]/25 text-[#87A987] flex items-center justify-center shrink-0 border border-[#527953]/30">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="font-bold text-sm text-white">Masa Madre Viva</p>
                <p className="text-xs text-[#A8988D]">Fermentación lenta y pura</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#527953]/25 text-[#87A987] flex items-center justify-center shrink-0 border border-[#527953]/30">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="font-bold text-sm text-white">100% Mantequilla</p>
                <p className="text-xs text-[#A8988D]">Hojaldrado europeo noble</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 2. COFFEELAB 3D FULL BLEED (w-full bg-[#140D08]) ── */}
      <section id="coffeelab" className="w-full bg-[#140D08] py-24 border-t border-amber-900/30 overflow-hidden flex flex-col items-center">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
          <CoffeeLab />
        </div>
      </section>

      {/* ── 3. BENTO GRID CINEMÁTICO DEL MENÚ (w-full bg-[#FAF7F2]) ── */}
      <section id="menu-bento" className="w-full bg-[#FAF7F2] py-24 border-t border-[#EAE2D5] flex flex-col items-center">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 space-y-12">
          
          {/* Cabecera Editorial del Menú */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs uppercase font-bold tracking-widest text-[#527953] bg-[#EBF3EA] px-4 py-1.5 rounded-full inline-block border border-[#527953]/20">
              Vitrina & Especialidades
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1E130C] tracking-tight">
              Colección Dencker Pan
            </h2>
            <p className="text-[#785E4F] text-sm leading-relaxed">
              Estructurado en arquitectura Bento para descubrir las texturas de nuestra panadería tradicional y repostería de autor en Cochabamba.
            </p>
          </div>

          {/* Buscador y Filtros Sensoriales */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-3.5 text-[#785E4F]" />
              <input
                type="text"
                placeholder="Buscar por especialidad (New York Roll, cauka, croissant, espresso)..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-11 pr-10 py-3.5 rounded-[22px] bg-white border border-[#EAE2D5] shadow-xs text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#527953] placeholder:text-[#A8988D] text-[#1E130C] transition"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className="absolute right-3.5 top-3.5 text-[#785E4F] hover:text-[#1E130C] text-xs"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Categorías con feedback acústico ASMR */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
              {[
                { id: "todos", label: "Todos", icon: UtensilsCrossed, sound: "tactile" },
                { id: "horneados", label: "Horneados de Masa Madre", icon: Flame, sound: "bread" },
                { id: "reposteria", label: "Pastelería & Hojaldres", icon: Cake, sound: "pastry" },
                { id: "cafe", label: "Cafetería & Barismo", icon: Coffee, sound: "porcelain" },
                { id: "bebidas", label: "Bebidas & Refrescos", icon: Droplets, sound: "tactile" },
                { id: "favoritos", label: "Estrellas de la Casa", icon: Star, sound: "tactile" },
              ].map((cat) => {
                const Icon = cat.icon;
                const isSel = categoriaActiva === cat.id;
                return (
                  <motion.button
                    key={cat.id}
                    whileTap={{ scale: 0.95, y: 1 }}
                    transition={springPhysics}
                    onClick={() => {
                      if (cat.sound === "bread") soundManager.playBreadCrunch();
                      else if (cat.sound === "pastry") soundManager.playPastryCrinkle();
                      else if (cat.sound === "porcelain") soundManager.playPorcelainTink();
                      else soundManager.playTactileClick();
                      setCategoriaActiva(cat.id);
                    }}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all select-none ${
                      isSel
                        ? "bg-[#1E130C] text-[#FAF7F2] shadow-md border border-[#1E130C]"
                        : "bg-white text-[#785E4F] border border-[#EAE2D5] hover:bg-[#F5EFEB] hover:text-[#1E130C]"
                    }`}
                  >
                    <Icon size={14} className={isSel ? "text-[#87A987]" : "text-[#785E4F]"} />
                    <span>{cat.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* ── ARQUITECTURA BENTO ASIMÉTRICA CON ESTRUCTURA LIMPIA (SIN TEXTOS ENCIMADOS) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            
            {/* 🌟 CONTENEDOR ESTRELLA: NEW YORK ROLL DE PISTACHO 🌟 */}
            {starProduct && (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={springCard}
                className="col-span-1 md:col-span-2 lg:col-span-2 md:row-span-2 group rounded-2xl overflow-hidden bg-gradient-to-br from-[#1A110B] via-[#241810] to-[#120B07] text-white p-8 border border-[#527953]/40 shadow-xl flex flex-col justify-between relative hover:border-[#87A987]/60 transition-colors min-h-[460px]"
              >
                {/* Imagen de Fondo con Overlay Seguro */}
                <div className="absolute inset-0 w-full h-full opacity-40 group-hover:opacity-55 transition-opacity duration-700 pointer-events-none overflow-hidden">
                  <img
                    src={starProduct.imagen_url || "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1000&q=80"}
                    alt={starProduct.nombre}
                    className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A110B] via-[#1A110B]/80 to-transparent" />
                </div>

                {/* Contenido Superior en relative z-10 */}
                <div className="relative z-10 space-y-4 max-w-md">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#527953]/40 text-[#CDE0C9] text-xs font-bold border border-[#527953]/60 backdrop-blur-md">
                      <Sparkles size={13} className="text-[#87A987]" />
                      Creación Insignia • Pistacho Siciliano
                    </span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 font-medium">
                      100% Mantequilla
                    </span>
                  </div>

                  <h3
                    onClick={() => abrirModalProducto(starProduct)}
                    className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight cursor-pointer hover:text-[#CDE0C9] transition-colors"
                  >
                    {starProduct.nombre}
                  </h3>

                  <p className="text-[#D8C7B8] text-sm leading-relaxed">
                    Rueda de hojaldre francés laminada con 72 capas de mantequilla noble. Corazón untuoso de crema pastelera de pistacho de Bronte y topping de chocolate blanco belga con praliné tostado.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[#A3B899]">
                    <span className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/10">Textura Ultra Crujiente</span>
                    <span className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/10">Horneado Diario</span>
                  </div>
                </div>

                {/* Footer de Tarjeta Estrella */}
                <div className="relative z-10 pt-8 mt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] text-[#A8988D] uppercase tracking-wider block font-semibold">
                      Precio Bolivianos
                    </span>
                    <span className="font-sans text-3xl font-black text-white tracking-tight">
                      Bs {starProduct.precio.toFixed(2)}
                    </span>
                  </div>

                  {getItemCantidadEnCarrito(starProduct.id) > 0 ? (
                    <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-2xl p-1.5 border border-white/20">
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        transition={springPhysics}
                        onClick={() => {
                          soundManager.playTactileClick();
                          updateCantidad(starProduct.id, getItemCantidadEnCarrito(starProduct.id) - 1);
                        }}
                        className="w-8 h-8 rounded-xl bg-white text-[#1E130C] flex items-center justify-center font-bold text-xs"
                      >
                        <Minus size={14} />
                      </motion.button>
                      <span className="font-mono text-sm font-bold text-white px-2">
                        {getItemCantidadEnCarrito(starProduct.id)}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        transition={springPhysics}
                        onClick={() => {
                          soundManager.playPastryCrinkle();
                          updateCantidad(starProduct.id, getItemCantidadEnCarrito(starProduct.id) + 1);
                        }}
                        className="w-8 h-8 rounded-xl bg-[#527953] text-white flex items-center justify-center font-bold text-xs shadow-md"
                      >
                        <Plus size={14} />
                      </motion.button>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95, y: 2 }}
                      transition={springPhysics}
                      onClick={(e) => agregarAlCarritoRapido(starProduct, e)}
                      className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#527953] to-[#6A9368] hover:from-[#6A9368] hover:to-[#527953] text-white font-extrabold text-xs shadow-[0_6px_20px_rgba(82,121,83,0.4)] flex items-center gap-2 select-none cursor-pointer"
                    >
                      <Plus size={16} />
                      <span>Añadir al Pedido</span>
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}

            {/* ☕ FEATURE BENTO 2: BARISMO DE ALTURA YUNGAS CARANAVI ☕ */}
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={springCard}
              className="col-span-1 md:col-span-2 lg:col-span-2 rounded-2xl overflow-hidden bg-gradient-to-br from-[#241710] to-[#1A1009] text-white p-8 border border-[#3D271D] shadow-xl flex flex-col justify-between relative min-h-[340px]"
            >
              <div className="space-y-3 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#527953]/20 text-[#87A987] text-xs font-bold border border-[#527953]/30">
                  <Coffee size={13} />
                  Barismo de Autor • 1,600 msnm
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  Café de Especialidad Yungas & Samaipata
                </h3>
                <p className="text-[#D8C7B8] text-xs sm:text-sm leading-relaxed max-w-lg">
                  Extracciones dobles en máquinas La Marzocco. Notas pronunciadas a cacao boliviano, nuez tostada y leche vaporizada a 65°C para una crema sedosa.
                </p>
              </div>

              <div className="pt-6 border-t border-white/10 flex items-center justify-between relative z-10">
                <span className="font-sans text-xl font-bold text-[#EAE2D5]">
                  Desde Bs 15.00
                </span>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95, y: 1 }}
                  transition={springPhysics}
                  onClick={() => {
                    soundManager.playPorcelainTink();
                    setCategoriaActiva("cafe");
                  }}
                  className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-[#CDE0C9] text-xs font-bold border border-white/15 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Ver Variedades</span>
                  <ChevronRight size={14} />
                </motion.button>
              </div>
            </motion.div>

            {/* 🥖 TARJETAS BENTO DEL RESTO DE LA COLECCIÓN (Con z-10 y cero textos encimados) 🥖 */}
            {remainingProducts.map((prod) => {
              const cantidadEnCarrito = getItemCantidadEnCarrito(prod.id);
              const imagenFallback =
                prod.imagen_url ||
                "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80";

              return (
                <motion.div
                  key={prod.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={springCard}
                  className="relative overflow-hidden rounded-2xl min-h-[340px] flex flex-col justify-end p-6 sm:p-7 group shadow-sm hover:shadow-xl transition-all border border-[#EAE2D5]"
                >
                  {/* Imagen de fondo de alta resolución */}
                  <img
                    src={imagenFallback}
                    alt={prod.nombre}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Overlay gradiente para contraste y legibilidad perfecta */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none" />

                  {/* Badge de estado en esquina superior (ordenado, sin colisiones) */}
                  <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none z-10">
                    {prod.es_mas_vendido && (
                      <span className="px-2.5 py-1 rounded-full bg-[#1E130C]/90 text-[#87A987] font-bold text-[10px] backdrop-blur-md border border-white/10">
                        ★ Destacado
                      </span>
                    )}
                    {prod.nombre.toLowerCase().includes("cauka") && (
                      <span className="px-2.5 py-1 rounded-full bg-[#527953]/90 text-white font-bold text-[10px] backdrop-blur-md ml-auto">
                        Horno 24h
                      </span>
                    )}
                  </div>

                  {/* Contenido en relative z-10 para evitar superposiciones */}
                  <div className="relative z-10 space-y-2 text-white">
                    <h4
                      onClick={() => abrirModalProducto(prod)}
                      className="font-serif font-bold text-base sm:text-lg text-white hover:text-[#CDE0C9] transition cursor-pointer line-clamp-1"
                    >
                      {prod.nombre}
                    </h4>

                    {prod.descripcion && (
                      <p className="text-[11px] text-[#D8C7B8] line-clamp-2 leading-relaxed">
                        {prod.descripcion}
                      </p>
                    )}

                    {/* Precios y Botón de Añadir */}
                    <div className="pt-3 border-t border-white/15 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-[#A8988D] block font-medium uppercase tracking-wider">
                          Precio
                        </span>
                        <span className="font-sans text-base font-extrabold text-white">
                          Bs {prod.precio.toFixed(2)}
                        </span>
                      </div>

                      {cantidadEnCarrito > 0 ? (
                        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/20 rounded-xl p-1 shadow-sm">
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            transition={springPhysics}
                            onClick={(e) => {
                              e.stopPropagation();
                              soundManager.playTactileClick();
                              updateCantidad(prod.id, cantidadEnCarrito - 1);
                            }}
                            className="w-6 h-6 rounded-lg bg-white text-[#1E130C] flex items-center justify-center font-bold text-xs cursor-pointer"
                          >
                            <Minus size={12} />
                          </motion.button>
                          <span className="font-mono text-xs font-bold text-white px-1">
                            {cantidadEnCarrito}
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            transition={springPhysics}
                            onClick={(e) => {
                              e.stopPropagation();
                              soundManager.playPastryCrinkle();
                              updateCantidad(prod.id, cantidadEnCarrito + 1);
                            }}
                            className="w-6 h-6 rounded-lg bg-[#527953] text-white flex items-center justify-center font-bold text-xs cursor-pointer"
                          >
                            <Plus size={12} />
                          </motion.button>
                        </div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.06, y: -2 }}
                          whileTap={{ scale: 0.94, y: 1 }}
                          transition={springPhysics}
                          onClick={(e) => agregarAlCarritoRapido(prod, e)}
                          className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1.5 backdrop-blur-md border border-white/20 select-none cursor-pointer"
                        >
                          <Plus size={13} className="text-[#87A987]" />
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
            <div className="text-center pt-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={springPhysics}
                onClick={() => {
                  soundManager.playTactileClick();
                  setLimiteVisible((p) => p + 20);
                }}
                className="px-8 py-3.5 rounded-full bg-white border border-[#EAE2D5] text-[#1E130C] font-bold text-xs hover:bg-[#F5EFEB] shadow-xs cursor-pointer"
              >
                Cargar más delicias ({productosFiltrados.length - limiteVisible} restantes)
              </motion.button>
            </div>
          )}

        </div>
      </section>

      {/* ── 4. COTIZADOR DE EVENTOS & CATERING (w-full bg-[#F4EFEB]) ── */}
      <section id="catering" className="w-full bg-[#F4EFEB] py-24 border-t border-[#EAE2D5] flex flex-col items-center">
        <div className="w-full max-w-5xl mx-auto px-6 md:px-12 space-y-8">
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#EAE2D5] shadow-lg space-y-6">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="text-xs uppercase font-bold tracking-widest text-[#527953] bg-[#EBF3EA] px-3.5 py-1.5 rounded-full inline-block border border-[#527953]/20">
                Catering & Mesas Dulces
              </span>
              <h3 className="font-serif text-2xl sm:text-4xl font-bold text-[#1E130C]">
                Cotiza tu Evento en 10 Segundos
              </h3>
              <p className="text-[#785E4F] text-xs sm:text-sm">
                Paquetes artesanales para defensas de tesis, cumpleaños, reuniones corporativas y té de la tarde en Cochabamba.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {EVENTOS_PRESETS.map((ev) => {
                const Icon = ev.icon;
                const isSel = eventoSeleccionado.id === ev.id;
                return (
                  <motion.button
                    key={ev.id}
                    whileTap={{ scale: 0.96 }}
                    transition={springPhysics}
                    onClick={() => {
                      setEventoSeleccionado(ev);
                      soundManager.playTactileClick();
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      isSel
                        ? "bg-[#FAF7F2] border-[#527953] ring-2 ring-[#527953]/20 shadow-xs"
                        : "bg-[#FBF9F6] border-[#EAE2D5] hover:bg-[#F5EFEB]"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#527953]/15 text-[#527953] flex items-center justify-center mb-2">
                      <Icon size={16} />
                    </div>
                    <p className="font-bold text-xs text-[#1E130C]">{ev.label}</p>
                    <span className="text-xs font-mono font-bold text-[#527953] block mt-1">
                      Bs {ev.precioPersona} / pers.
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Ajuste de Personas y Total */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE2D5] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#785E4F]">Invitados:</span>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setInvitados((p) => Math.max(10, p - 5))}
                    className="w-7 h-7 rounded-lg bg-white border border-[#EAE2D5] text-[#1E130C] font-bold text-xs"
                  >
                    -
                  </motion.button>
                  <span className="font-serif text-lg font-bold text-[#1E130C] px-1">
                    {invitados} personas
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setInvitados((p) => Math.min(200, p + 5))}
                    className="w-7 h-7 rounded-lg bg-white border border-[#EAE2D5] text-[#1E130C] font-bold text-xs"
                  >
                    +
                  </motion.button>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-[#A8988D] block">Presupuesto Estimado:</span>
                <span className="font-sans text-2xl font-black text-[#1E130C]">
                  Bs {presupuestoEstimado.toFixed(2)}
                </span>
              </div>

              <motion.a
                href={`https://wa.me/59176911000?text=${encodeURIComponent(
                  `Hola Dencker Pan, deseo cotizar evento de ${eventoSeleccionado.label} para ${invitados} personas (Estimado: Bs ${presupuestoEstimado}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                transition={springPhysics}
                onClick={() => soundManager.playVintageRegisterDing()}
                className="px-6 py-2.5 rounded-2xl bg-[#527953] hover:bg-[#436444] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <MessageCircle size={15} />
                <span>Coordinar por WhatsApp</span>
              </motion.a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. BARRA FLOTANTE DE CANASTA ── */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={springPhysics}
            className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none"
          >
            <div className="pointer-events-auto bg-[#18100A]/95 backdrop-blur-2xl border border-[#527953]/40 shadow-2xl rounded-full px-5 py-3 flex items-center gap-4 text-white">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-[#527953] text-[#FAF7F2] font-bold text-xs flex items-center justify-center">
                  {cartCount}
                </span>
                <div className="text-xs leading-tight">
                  <span className="text-[#A8988D] block">Tu Pedido</span>
                  <span className="font-sans font-extrabold text-[#FAF7F2] text-sm">
                    Bs {cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95, y: 1 }}
                transition={springPhysics}
                onClick={() => {
                  soundManager.playVintageRegisterDing();
                  setCartOpen(true);
                }}
                className="px-5 py-2 rounded-full bg-[#FAF7F2] hover:bg-white text-[#1E130C] font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <span>Ver Canasta & Pedir</span>
                <ArrowRight size={14} className="text-[#527953]" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 6. MODAL DETALLE DE PRODUCTO ── */}
      <AnimatePresence>
        {productoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={springPhysics}
              className="w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden p-6 space-y-4 border border-[#EAE2D5]"
            >
              <div className="relative h-48 -mx-6 -mt-6 bg-[#F5EFEB] overflow-hidden">
                <img
                  src={productoModal.imagen_url || "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80"}
                  alt={productoModal.nombre}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setProductoModal(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-serif text-xl font-bold text-[#1E130C]">
                  {productoModal.nombre}
                </h3>
                <p className="text-xs text-[#785E4F] leading-relaxed">
                  {productoModal.descripcion || "Elaborado fresco diariamente con receta artesanal."}
                </p>
                <p className="font-sans text-2xl font-black text-[#1E130C] pt-1">
                  Bs {productoModal.precio.toFixed(2)}
                </p>
              </div>

              {productoModal.chips_personalizacion && productoModal.chips_personalizacion.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#A8988D] uppercase tracking-wider block">
                    Opciones Disponibles:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {productoModal.chips_personalizacion.map((chip) => {
                      const sel = chipsSeleccionados.includes(chip);
                      return (
                        <motion.button
                          key={chip}
                          whileTap={{ scale: 0.94 }}
                          onClick={() => {
                            soundManager.playTactileClick();
                            setChipsSeleccionados((prev) =>
                              sel ? prev.filter((c) => c !== chip) : [...prev, chip]
                            );
                          }}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                            sel
                              ? "bg-[#1E130C] text-[#FAF7F2]"
                              : "bg-[#F5EFEB] text-[#785E4F] hover:bg-[#EAE2D5]"
                          }`}
                        >
                          {chip}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <input
                  type="text"
                  placeholder="Nota especial (ej. tibio de horno, sin azúcar)..."
                  value={notaPersonalizada}
                  onChange={(e) => setNotaPersonalizada(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-[#EAE2D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#527953]"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96, y: 1 }}
                transition={springPhysics}
                onClick={() => {
                  soundManager.playPastryCrinkle();
                  addItem(productoModal, chipsSeleccionados, notaPersonalizada || undefined);
                  setProductoModal(null);
                }}
                className="w-full py-3.5 rounded-2xl bg-[#1E130C] hover:bg-[#2C1C12] text-[#FAF7F2] font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={16} className="text-[#87A987]" />
                <span>Agregar al Pedido • Bs {productoModal.precio.toFixed(2)}</span>
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

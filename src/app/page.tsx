"use client";
import { useState, useMemo, useEffect } from "react";
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
  DollarSign,
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
  Store,
  ExternalLink,
} from "lucide-react";
import { useSystemStore, useCartStore, useUIStore } from "@/store";
import { soundManager } from "@/lib/sound";
import { DENCKER_ASSETS, SEED_CATEGORIAS, SEED_PRODUCTOS } from "@/lib/seed-data";
import { Producto, Categoria } from "@/types";

const EVENTOS_PRESETS = [
  { id: "tesis", icon: "🎓", label: "Defensa de Tesis", precioPersona: 35, desc: "Café de especialidad + surtido de masitas y bocaditos salados" },
  { id: "cumple", icon: "🎂", label: "Cumpleaños & Festejo", precioPersona: 45, desc: "Torta artesanal a elección + bebidas calientes y bocaditos" },
  { id: "corporativo", icon: "💼", label: "Reunión Corporativa", precioPersona: 40, desc: "Coffee break premium, croissants rellenos y sandwiches" },
  { id: "baby", icon: "👶", label: "Baby Shower / Té", precioPersona: 50, desc: "Mesa dulce completa, infusiones gourmet y mini repostería" },
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
      // Filtro de categoría
      const matchCat =
        categoriaActiva === "todos"
          ? true
          : categoriaActiva === "favoritos"
          ? p.es_mas_vendido
          : p.categoria_id === categoriaActiva;

      // Filtro de búsqueda
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

  // Reset de límite al cambiar filtro
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

      setReservaExitosa(true);
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
      
      {/* ── 1. HERO SECTION DE ALTA GAMA CON LOGO OFICIAL ── */}
      <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#1C120B] via-[#2A1A10] to-[#1C120B] text-white">
        {/* Glow ambient background orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-amber-600/25 via-orange-600/10 to-transparent blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-amber-500/10 blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-7">
          {/* Logo Oficial Dencker Pan con Framing Dorado */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="flex flex-col items-center justify-center space-y-3"
          >
            <div className="relative p-3 rounded-3xl bg-white/5 border border-amber-500/30 backdrop-blur-xl shadow-[0_10px_35px_rgba(217,119,6,0.3)]">
              <img
                src={DENCKER_ASSETS.logo}
                alt="Dencker Pan Logo Oficial"
                className="w-24 sm:w-32 h-auto object-contain filter drop-shadow-[0_8px_20px_rgba(217,119,6,0.5)] hover:scale-105 transition-transform"
              />
            </div>

            {/* Badge de Tradición */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 text-amber-300 text-xs font-semibold shadow-inner">
              <Sparkles size={14} className="text-amber-400" />
              <span>Panadería de Masa Madre & Café de Especialidad • Cochabamba</span>
            </div>
          </motion.div>

          {/* Headline Editorial */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
            className="space-y-4 max-w-4xl mx-auto"
          >
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              El arte del buen pan,{" "}
              <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent italic">
                elevado a la perfección.
              </span>
            </h1>

            <p className="text-amber-100/80 text-base sm:text-lg max-w-2xl mx-auto font-sans leading-relaxed">
              Masa madre con fermentación natural de 24 horas, harinas seleccionadas y café de altura de los Yungas cosechado a 1,600 msnm.
              Disfruta en nuestro salón o pide directo a tu puerta en Cochabamba.
            </p>
          </motion.div>

          {/* Botones de Acción Inmediata */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
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
              className="px-7 py-3.5 rounded-full bg-emerald-600/95 hover:bg-emerald-500 text-white font-bold text-sm transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-emerald-950/40"
            >
              <MessageCircle size={18} />
              <span>WhatsApp Directo (+591 76911000)</span>
            </a>

            <a
              href="#roles"
              className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 text-white font-semibold text-sm transition-all active:scale-95 flex items-center gap-2"
            >
              <Layers size={18} className="text-amber-400" />
              <span>Portal de Roles (Equipo)</span>
            </a>
          </motion.div>

          {/* Banner Oficial Dencker Pan */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.22 }}
            className="pt-4 max-w-4xl mx-auto rounded-3xl overflow-hidden border border-amber-500/20 shadow-2xl shadow-black/80 group"
          >
            <img
              src={DENCKER_ASSETS.banners[0]}
              alt="Dencker Pan Especialidades y Promociones"
              className="w-full h-auto object-cover max-h-56 sm:max-h-72 group-hover:scale-102 transition-transform duration-700"
            />
          </motion.div>

          {/* Tira de Confianza & Valores Artesanales */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              <span className="text-2xl">🥐</span>
              <div>
                <p className="font-bold text-xs text-white">Horneadas Diarias</p>
                <p className="text-[11px] text-amber-200/70">07:30 y 16:30 calientes</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              <span className="text-2xl">☕</span>
              <div>
                <p className="font-bold text-xs text-white">Café de Altura</p>
                <p className="text-[11px] text-amber-200/70">Yungas 1,600 msnm</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              <span className="text-2xl">🌾</span>
              <div>
                <p className="font-bold text-xs text-white">Masa Madre 24h</p>
                <p className="text-[11px] text-amber-200/70">Fermentación natural</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              <span className="text-2xl">🛵</span>
              <div>
                <p className="font-bold text-xs text-white">Delivery Cochabamba</p>
                <p className="text-[11px] text-amber-200/70">A domicilio o en mesa</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. EL CATÁLOGO DIGITAL Y VITRINA OFICIAL (240 PRODUCTOS REALES) ── */}
      <section id="catalogo" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        
        {/* Encabezado del Catálogo */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
            Nuestra Vitrina en Vivo
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight">
            Catálogo Completo de la Panadería
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Descubre nuestros 240 productos elaborados artesanalmente en Cochabamba con ingredientes de primera calidad.
            Haz clic en cualquier producto para añadirlo a tu canasta y coordinar tu pedido directo por WhatsApp o pedir en mesa.
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
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-stone-200 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-amber-700 placeholder:text-stone-400 transition"
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

        {/* Píldoras de Categorías (Horizontal Scroll con Imágenes Oficiales) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
          <button
            onClick={() => {
              setCategoriaActiva("todos");
              soundManager.playClick();
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 shadow-2xs ${
              categoriaActiva === "todos"
                ? "bg-amber-900 text-white shadow-md shadow-amber-950/20"
                : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            <span>🍽️</span>
            <span>Todos ({productos.length})</span>
          </button>

          <button
            onClick={() => {
              setCategoriaActiva("favoritos");
              soundManager.playClick();
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 shadow-2xs ${
              categoriaActiva === "favoritos"
                ? "bg-amber-900 text-white shadow-md shadow-amber-950/20"
                : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            <span>⭐</span>
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
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 shadow-2xs ${
                  isSel
                    ? "bg-amber-900 text-white shadow-md shadow-amber-950/20"
                    : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.nombre}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSel ? "bg-amber-800 text-amber-200" : "bg-stone-100 text-stone-500"
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
          <span className="font-mono text-[11px] text-amber-800">
            Moneda oficial: Bolivianos (BOB)
          </span>
        </div>

        {/* Grid de Productos (Cards Ultra-Elegantes con Fotos ImgBB) */}
        {productosVisibles.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
            <p className="text-3xl">🔍</p>
            <h4 className="font-serif font-bold text-lg text-stone-800">No encontramos coincidencias</h4>
            <p className="text-xs text-stone-500">Prueba con otra palabra clave o selecciona otra categoría.</p>
            <button
              onClick={() => {
                setBusqueda("");
                setCategoriaActiva("todos");
              }}
              className="px-4 py-2 rounded-xl bg-amber-800 text-white text-xs font-bold"
            >
              Ver todos los productos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {productosVisibles.map((prod) => {
              const cantEnCarrito = getItemCantidadEnCarrito(prod.id);
              const cat = categorias.find((c) => c.id === prod.categoria_id);

              return (
                <motion.div
                  key={prod.id}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => abrirModalProducto(prod)}
                  className="rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all flex flex-col justify-between overflow-hidden cursor-pointer group"
                >
                  <div>
                    {/* Imagen del Producto (ImgBB) */}
                    <div className="h-36 sm:h-44 w-full bg-gradient-to-br from-amber-50 to-amber-100/40 relative overflow-hidden flex items-center justify-center">
                      {prod.imagen_url ? (
                        <img
                          src={prod.imagen_url}
                          alt={prod.nombre}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <span className="text-4xl">{cat?.emoji || "🥐"}</span>
                      )}

                      {/* Badges superiores */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {prod.es_mas_vendido && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-950/85 backdrop-blur-md text-amber-200 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
                            <Star size={9} className="fill-amber-400 text-amber-400" />
                            Top
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-stone-700 font-semibold text-[9px]">
                          {cat?.nombre || "Panadería"}
                        </span>
                      </div>

                      {/* Contador si ya está en canasta */}
                      {cantEnCarrito > 0 && (
                        <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-amber-600 text-white font-mono font-bold text-xs flex items-center justify-center shadow-lg">
                          {cantEnCarrito}
                        </div>
                      )}
                    </div>

                    {/* Información del Producto */}
                    <div className="p-3.5 sm:p-4 space-y-1.5">
                      <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 line-clamp-1 group-hover:text-amber-800 transition-colors">
                        {prod.nombre}
                      </h3>
                      <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                        {prod.descripcion || "Elaborado fresco a diario con ingredientes seleccionados de primera calidad."}
                      </p>
                    </div>
                  </div>

                  {/* Footer de Card: Precio & Botón de Añadir */}
                  <div className="p-3.5 sm:p-4 pt-0 flex items-center justify-between border-t border-stone-100 mt-2">
                    <div>
                      <span className="text-[10px] text-stone-400 block font-sans">Precio</span>
                      <span className="font-serif font-extrabold text-base sm:text-lg text-amber-950">
                        Bs {prod.precio.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundManager.playSuccessTone();
                        addItem(prod);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition active:scale-95"
                    >
                      <Plus size={14} />
                      <span>{cantEnCarrito > 0 ? "Añadir más" : "Añadir"}</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Botón Ver Más Productos */}
        {limiteVisible < productosFiltrados.length && (
          <div className="text-center pt-6">
            <button
              onClick={() => {
                setLimiteVisible((prev) => prev + 24);
                soundManager.playClick();
              }}
              className="px-8 py-3.5 rounded-full bg-white border border-stone-300 hover:border-amber-700 text-stone-800 font-bold text-xs shadow-sm hover:shadow-md transition active:scale-95 inline-flex items-center gap-2"
            >
              <span>Cargar Más Productos ({productosFiltrados.length - limiteVisible} restantes)</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </section>

      {/* ── 3. PORTAL OPERATIVO DE PERSONAL (5 ROLES PROFESIONALES) ── */}
      <section id="roles" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#1C120B] via-[#24160E] to-[#1C120B] text-white border-y border-amber-900/30">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400 bg-amber-500/15 border border-amber-500/30 px-3.5 py-1 rounded-full">
              Sistema de Gestión Integral
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Portal Operativo para el Equipo
            </h2>
            <p className="text-amber-200/80 text-sm sm:text-base leading-relaxed">
              Herramientas de alta velocidad diseñadas para cada área de servicio de Dencker Pan.
              Sincronizadas al instante mediante Supabase Realtime con cero comandas perdidas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Rol 1: Mesero & Sala */}
            <div className="p-7 rounded-[32px] bg-white/5 border border-white/10 hover:border-amber-500/40 shadow-xl transition-all duration-300 flex flex-col justify-between group space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  <UtensilsCrossed size={22} />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-white">
                    Atención de Sala & Meseros
                  </h3>
                  <span className="text-xs text-amber-400 font-semibold">
                    Salón Principal • Terraza • Balcón
                  </span>
                </div>
                <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                  Croquis interactivo de mesas, toma de comandas móviles en tablet o celular, campanilla sintetizada de llamadas y rondas rápidas de café en 1 toque.
                </p>
              </div>

              <Link
                href="/mesero"
                onClick={() => soundManager.playSuccessTone()}
                className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs text-center transition flex items-center justify-center gap-2 shadow-md"
              >
                <span>Acceder a Módulo Mesero</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Rol 2: Cocina KDS */}
            <div className="p-7 rounded-[32px] bg-white/5 border border-white/10 hover:border-blue-500/40 shadow-xl transition-all duration-300 flex flex-col justify-between group space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-300 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  <ChefHat size={22} />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-white">
                    Cocina & Barismo KDS
                  </h3>
                  <span className="text-xs text-blue-400 font-semibold">
                    Vitrina • Barismo • Cocina Caliente
                  </span>
                </div>
                <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                  Pantalla táctil de preparación por estaciones sin boletos de papel. Semáforo dinámico de tiempos (verde &lt;5m, ámbar 5-10m, rojo pulsante) y chime sonoro.
                </p>
              </div>

              <Link
                href="/kds"
                onClick={() => soundManager.playSuccessTone()}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs text-center transition flex items-center justify-center gap-2 shadow-md"
              >
                <span>Abrir Pantalla KDS</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Rol 3: Caja POS */}
            <div className="p-7 rounded-[32px] bg-white/5 border border-white/10 hover:border-emerald-500/40 shadow-xl transition-all duration-300 flex flex-col justify-between group space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  <Receipt size={22} />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-white">
                    Caja POS & Facturación
                  </h3>
                  <span className="text-xs text-emerald-400 font-semibold">
                    Bolivianos BOB • QR Simple
                  </span>
                </div>
                <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                  Cobro instantáneo con código QR Simple interoperable (BNB, BCP, Bisa, Ganadero), cobro en efectivo con cálculo de cambio, división de cuentas y arqueo ciego.
                </p>
              </div>

              <Link
                href="/caja"
                onClick={() => soundManager.playSuccessTone()}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs text-center transition flex items-center justify-center gap-2 shadow-md"
              >
                <span>Ir a Terminal Caja POS</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Rol 4: Administración SaaS */}
            <div className="p-7 rounded-[32px] bg-white/5 border border-white/10 hover:border-amber-500/40 shadow-xl transition-all duration-300 flex flex-col justify-between group space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-stone-500/20 text-stone-300 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  <Settings size={22} />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-white">
                    Administración General
                  </h3>
                  <span className="text-xs text-stone-400 font-semibold">
                    Catálogo 240 Items • ImgBB • Stock
                  </span>
                </div>
                <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                  Panel maestro para editar precios, subir fotos en vivo mediante API de ImgBB, gestionar la disposición de mesas del salón y auditar reportes financieros.
                </p>
              </div>

              <Link
                href="/admin"
                onClick={() => soundManager.playSuccessTone()}
                className="w-full py-3 rounded-2xl bg-stone-700 hover:bg-stone-600 text-white font-bold text-xs text-center transition flex items-center justify-center gap-2 shadow-md"
              >
                <span>Administrar Sistema</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Rol 5: Autoservicio Mesa QR */}
            <div className="p-7 rounded-[32px] bg-white/5 border border-white/10 hover:border-amber-500/40 shadow-xl transition-all duration-300 flex flex-col justify-between group space-y-6 md:col-span-2 lg:col-span-2">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  <QrCode size={22} />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-white">
                    Menú Digital en Mesa (Autoservicio QR)
                  </h3>
                  <span className="text-xs text-amber-400 font-semibold">
                    Experiencia Premium para el Comensal
                  </span>
                </div>
                <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                  El cliente escanea el código QR de su mesa física, visualiza el menú con fotos de alta resolución, añade notas específicas (&quot;sin azúcar&quot;, &quot;bien caliente&quot;) y llama al mesero directamente a su mesa sin filas.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Link
                  href="/mesa/1"
                  onClick={() => soundManager.playOrderChime()}
                  className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-md"
                >
                  <QrCode size={16} />
                  <span>Probar Menú Digital (Mesa 1)</span>
                </Link>
                <Link
                  href="/mesa/3"
                  className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-stone-200 font-semibold text-xs transition"
                >
                  Mesa 3
                </Link>
                <Link
                  href="/mesa/5"
                  className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-stone-200 font-semibold text-xs transition"
                >
                  Mesa 5
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 4. COTIZADOR Y CONCIERGE DE CATERING & EVENTOS ── */}
      <section id="cotizador" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FAF4EC] to-[#F5ECE1] border-y border-stone-200">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-800 bg-amber-200/60 px-3.5 py-1 rounded-full">
              Cotizador en Tiempo Real
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight">
              Cotiza tu Evento & Catering en 10 Segundos
            </h2>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Selecciona el tipo de festejo y el número de personas para calcular el presupuesto en Bolivianos con seña del 30% calculada al instante.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Controles del Simulador */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-[32px] border border-stone-200 shadow-md space-y-6">
              
              {/* Preset Selector */}
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
                  <span>10 personas (reunión íntima)</span>
                  <span>100 personas</span>
                  <span>200 personas (magno evento)</span>
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
                  disabled={enviandoReserva || reservaExitosa}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-stone-950 font-black text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {reservaExitosa ? (
                    <>
                      <CheckCircle2 size={16} className="text-emerald-300" />
                      <span>¡Solicitud Registrada con Éxito!</span>
                    </>
                  ) : enviandoReserva ? (
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

      {/* ── 5. CONTACTO, HORARIOS & UBICACIÓN EN COCHABAMBA ── */}
      <section id="contacto" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-8 rounded-[32px] bg-white border border-stone-200/80 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl">
              📍
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900">Ubicación Central</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Cochabamba, Bolivia. Vista panorámica a la sala de horneado y terraza colonial al aire libre.
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

          <div className="p-8 rounded-[32px] bg-white border border-stone-200/80 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl">
              ⏰
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

          <div className="p-8 rounded-[32px] bg-white border border-stone-200/80 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl">
              💬
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900">Pedidos & WhatsApp</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Atención directa para catering, tortas de encargo y delivery en toda el área urbana de Cochabamba.
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
            <p className="pt-2 text-[10px] text-stone-500">
              © 2026 Dencker Pan S.R.L. Todos los derechos reservados.
            </p>
          </div>

        </div>
      </footer>

      {/* ── 7. BOTÓN FLOTANTE DE CANASTA (MOBILE & DESKTOP) ── */}
      <AnimatePresence>
        {count() > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-md w-full px-4"
          >
            <button
              onClick={() => {
                soundManager.playClick();
                setCartOpen(true);
              }}
              className="w-full py-4 px-6 rounded-full bg-[#1C120B] border border-amber-500/40 text-white shadow-2xl shadow-black/80 flex items-center justify-between gap-3 active:scale-98 transition group"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-amber-600 text-stone-950 font-black text-xs flex items-center justify-center font-mono">
                  {count()}
                </span>
                <div className="text-left leading-tight">
                  <span className="font-bold text-xs text-amber-100 block">
                    Ver Canasta ({count()} {count() === 1 ? "ítem" : "ítems"})
                  </span>
                  <span className="font-serif font-extrabold text-base text-amber-400">
                    Bs {total().toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 group-hover:text-amber-200">
                <span>Enviar a WhatsApp</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 8. MODAL DE DETALLE Y PERSONALIZACIÓN DE PRODUCTO ── */}
      <AnimatePresence>
        {productoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProductoModal(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative bg-white rounded-[32px] overflow-hidden max-w-md w-full shadow-2xl border border-stone-200 z-10 flex flex-col max-h-[90vh]"
            >
              {/* Imagen en Modal */}
              <div className="h-52 w-full bg-amber-100 relative overflow-hidden flex items-center justify-center shrink-0">
                {productoModal.imagen_url ? (
                  <img
                    src={productoModal.imagen_url}
                    alt={productoModal.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl">🥐</span>
                )}
                
                <button
                  onClick={() => setProductoModal(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Contenido */}
              <div className="p-5 overflow-y-auto space-y-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    {categorias.find((c) => c.id === productoModal.categoria_id)?.nombre || "Panadería"}
                  </span>
                  <h3 className="font-serif font-bold text-xl text-stone-900 mt-1">
                    {productoModal.nombre}
                  </h3>
                  <p className="text-stone-500 mt-1 leading-relaxed">
                    {productoModal.descripcion || "Elaboración artesanal fresca de hoy en Dencker Pan."}
                  </p>
                </div>

                {/* Chips de Personalización */}
                {productoModal.chips_personalizacion && productoModal.chips_personalizacion.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                      Opciones y Preferencias:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {productoModal.chips_personalizacion.map((chip) => {
                        const isSelected = chipsSeleccionados.includes(chip);
                        return (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => {
                              soundManager.playClick();
                              setChipsSeleccionados((prev) =>
                                isSelected ? prev.filter((c) => c !== chip) : [...prev, chip]
                              );
                            }}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                              isSelected
                                ? "bg-amber-900 text-white border-amber-900"
                                : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                            }`}
                          >
                            {chip} {isSelected ? "✓" : "+"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Nota opcional */}
                <div className="space-y-1.5 pt-2 border-t border-stone-100">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                    Instrucción especial:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Calentar bien en el horno, canela extra..."
                    value={notaPersonalizada}
                    onChange={(e) => setNotaPersonalizada(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-700 placeholder:text-stone-400"
                  />
                </div>
              </div>

              {/* Footer con Precio y Botón */}
              <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0">
                <div>
                  <span className="text-[10px] text-stone-400 block">Precio Unitario</span>
                  <span className="font-serif font-extrabold text-2xl text-amber-950">
                    Bs {productoModal.precio.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={agregarAlCarritoDesdeModal}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-2"
                >
                  <Plus size={16} />
                  <span>Añadir a la Canasta</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

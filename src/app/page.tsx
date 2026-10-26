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
  Eye,
  LayoutGrid,
  ListFilter,
  Tag,
  Calendar,
  Store,
  Utensils,
  QrCode,
  Award,
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

interface SeccionMenu {
  id: string;
  categoriaId: string;
  titulo: string;
  subtitulo: string;
  badge: string;
  icon: typeof Cake;
  match: (p: Producto) => boolean;
}

const SECCIONES_MENU: SeccionMenu[] = [
  {
    id: "pasteleria",
    categoriaId: "reposteria",
    titulo: "Pastelería & Hojaldres de Autor",
    subtitulo: "72 capas de hojaldre francés, pistacho siciliano y manjar cocido a leña",
    badge: "100% Mantequilla",
    icon: Cake,
    match: (p) => {
      const n = p.nombre.toLowerCase();
      return (
        p.categoria_id === "c4" ||
        n.includes("roll") ||
        n.includes("croissant") ||
        n.includes("alfajor") ||
        n.includes("berlin") ||
        n.includes("milhojas") ||
        n.includes("pie")
      );
    },
  },
  {
    id: "panaderia",
    categoriaId: "horneados",
    titulo: "Horneados de Masa Madre & Panes Tradicionales",
    subtitulo: "Fermentación lenta de 24 horas, baguettes a la leña y panes clásicos vallunos",
    badge: "Masa Madre 24h",
    icon: Flame,
    match: (p) => {
      const n = p.nombre.toLowerCase();
      return (
        (p.categoria_id === "c3" || p.categoria_id === "c1") &&
        !n.includes("roll") &&
        !n.includes("croissant") &&
        !n.includes("alfajor")
      );
    },
  },
  {
    id: "salados",
    categoriaId: "horneados",
    titulo: "Masitas Saladas & Bocaditos Calientes",
    subtitulo: "Cuñapés calientes con queso criollo seleccionado, empanadas y pizzas",
    badge: "Queso Criollo",
    icon: UtensilsCrossed,
    match: (p) => {
      const n = p.nombre.toLowerCase();
      return (
        p.categoria_id === "c2" ||
        p.categoria_id === "c6" ||
        n.includes("cuñap") ||
        n.includes("cunap") ||
        n.includes("pizza") ||
        n.includes("esfiha")
      );
    },
  },
  {
    id: "cafeteria",
    categoriaId: "cafe",
    titulo: "Cafetería de Especialidad & Batidos Naturales",
    subtitulo: "Extracciones dobles Caranavi a 1,600 msnm y batidos cremosos",
    badge: "La Marzocco",
    icon: Coffee,
    match: (p) => {
      const n = p.nombre.toLowerCase();
      const esEnvasada =
        n.includes("agua") || n.includes("aquarius") || n.includes("coca") || n.includes("soda") || n.includes("aloe");
      return (
        (p.categoria_id === "c7" ||
          n.includes("café") ||
          n.includes("cappuccino") ||
          n.includes("espresso") ||
          n.includes("latte") ||
          n.includes("batido")) &&
        !esEnvasada
      );
    },
  },
  {
    id: "bebidas",
    categoriaId: "bebidas",
    titulo: "Bebidas Refrescantes & Aguas de Manantial",
    subtitulo: "Aguas naturales purificadas, aloe vera e hidratación para la mesa",
    badge: "Frías & Puras",
    icon: Droplets,
    match: (p) => {
      const n = p.nombre.toLowerCase();
      return (
        n.includes("agua") ||
        n.includes("aquarius") ||
        n.includes("coca") ||
        n.includes("fanta") ||
        n.includes("sprite") ||
        n.includes("soda") ||
        n.includes("aloe") ||
        n.includes("gaseosa")
      );
    },
  },
];

export default function HomePage() {
  const storeProductos = useSystemStore((state) => state.productos);
  const storeCategorias = useSystemStore((state) => state.categorias);
  const addAlerta = useSystemStore((state) => state.addAlerta);
  const addReserva = useSystemStore((state) => state.addReserva);

  const productos: Producto[] =
    storeProductos && storeProductos.length > 0 ? storeProductos : SEED_PRODUCTOS;
  const categorias: Categoria[] =
    storeCategorias && storeCategorias.length > 0 ? storeCategorias : SEED_CATEGORIAS;

  const { items, addItem, updateCantidad, total, count, setMesa } = useCartStore();
  const { setCartOpen } = useUIStore();

  const cartCount = count();
  const cartTotal = total();

  const [categoriaActiva, setCategoriaActiva] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState<string>("");
  const [limiteVisible, setLimiteVisible] = useState<number>(20);
  const [productoModal, setProductoModal] = useState<Producto | null>(null);
  const [chipsSeleccionados, setChipsSeleccionados] = useState<string[]>([]);
  const [notaPersonalizada, setNotaPersonalizada] = useState<string>("");

  // Estados de Organización del Menú & Doble Vista de Fotos
  const [modoPresentacion, setModoPresentacion] = useState<"general" | "categoria">("general");
  const [vistaGlobalFotos, setVistaGlobalFotos] = useState<"exterior" | "corte">("exterior");
  const [productoVistaOverrides, setProductoVistaOverrides] = useState<Record<string, "exterior" | "corte">>({});
  const [vistaModal, setVistaModal] = useState<"exterior" | "corte">("exterior");

  // Helper para obtener imagen de corte / textura interior de cada delicia
  const getImagenInterior = (prod: Producto): string => {
    if (prod.imagen_interior_url) return prod.imagen_interior_url;
    const n = prod.nombre.toLowerCase();
    if (n.includes("pistacho")) return "/images/products/ny_roll_pistacho_cut.jpg";
    if (n.includes("croissant")) return "/images/products/croissant_french_cut.jpg";
    if (n.includes("cuñap") || n.includes("cunap") || n.includes("abizcochado")) return "/images/products/cunape_abizcochado_cut.jpg";
    if (n.includes("alfajor")) return "/images/products/alfajor_boliviano_cut.jpg";
    if (n.includes("baguette") || n.includes("pan") || n.includes("marraqueta")) {
      return "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=1000&q=85";
    }
    if (n.includes("café") || n.includes("cappuccino") || n.includes("espresso") || n.includes("latte")) {
      return "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=85";
    }
    if (n.includes("pizza") || n.includes("esfiha") || n.includes("empanada")) {
      return "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1000&q=85";
    }
    if (n.includes("queque") || n.includes("bizcocho") || n.includes("torta") || n.includes("milhojas")) {
      return "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=1000&q=85";
    }
    return prod.imagen_url || "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80";
  };

  const getVistaActual = (prodId: string): "exterior" | "corte" => {
    return productoVistaOverrides[prodId] || vistaGlobalFotos;
  };

  const toggleVistaProducto = (prodId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundManager.playTactileClick();
    setProductoVistaOverrides((prev) => ({
      ...prev,
      [prodId]: (prev[prodId] || vistaGlobalFotos) === "exterior" ? "corte" : "exterior",
    }));
  };

  const [invitados, setInvitados] = useState<number>(30);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(EVENTOS_PRESETS[0]);
  const [incluirTortaEspecial, setIncluirTortaEspecial] = useState(true);
  const [incluirBarista, setIncluirBarista] = useState(true);

  // Estados Modal Llamar Mesero en Salón
  const [modalMeseroAbierto, setModalMeseroAbierto] = useState(false);
  const [mesaSeleccionadaAviso, setMesaSeleccionadaAviso] = useState(4);
  const [avisoMeseroEnviado, setAvisoMeseroEnviado] = useState(false);

  const handleLlamarMesero = (mesaNum: number) => {
    soundManager.playWaiterBell();
    addAlerta({
      mesa_numero: mesaNum,
      tipo: "llamado",
      mensaje: `Mesa ${mesaNum} solicita atención del personal en salón`,
      datos_extra: {},
    });
    setAvisoMeseroEnviado(true);
    setTimeout(() => {
      setAvisoMeseroEnviado(false);
      setModalMeseroAbierto(false);
    }, 2800);
  };

  // Estados Modal Reserva de Mesa
  const [reservaModalOpen, setReservaModalOpen] = useState(false);
  const [reservaData, setReservaData] = useState({
    nombre: "",
    telefono: "",
    fecha: "Hoy",
    hora: "16:30 (Tanda Pan Caliente)",
    personas: 2,
    zona: "Salón Principal",
    motivo: "Desayuno / Merienda Casual",
    notas: "",
  });
  const [reservaEnviada, setReservaEnviada] = useState(false);

  const handleEnviarReserva = () => {
    soundManager.playVintageRegisterDing();

    addReserva({
      nombre_cliente: reservaData.nombre.trim() || "Cliente Reserva Web",
      telefono: reservaData.telefono.trim(),
      tipo_evento: `Reserva ${reservaData.zona} — ${reservaData.motivo}`,
      fecha_evento: `${reservaData.fecha} a las ${reservaData.hora}`,
      numero_personas: reservaData.personas,
      descripcion: reservaData.notas.trim() || "Reserva solicitada desde la web principal",
      estado: "pendiente",
    });

    let texto = `📅 *SOLICITUD DE RESERVA DE MESA — DENCKER PAN*\n`;
    texto += `━━━━━━━━━━━━━━━━━━━━━\n`;
    texto += `👤 *Titular:* ${reservaData.nombre.trim() || "Cliente Reserva"}\n`;
    texto += `📞 *WhatsApp:* ${reservaData.telefono.trim() || "No especificado"}\n`;
    texto += `📆 *Fecha:* ${reservaData.fecha}\n`;
    texto += `⏰ *Horario:* ${reservaData.hora}\n`;
    texto += `👥 *Comensales:* ${reservaData.personas} personas\n`;
    texto += `🏛️ *Zona Preferida:* ${reservaData.zona}\n`;
    texto += `🎉 *Motivo / Ocasión:* ${reservaData.motivo}\n`;
    if (reservaData.notas.trim()) {
      texto += `📝 *Observaciones:* ${reservaData.notas.trim()}\n`;
    }
    texto += `━━━━━━━━━━━━━━━━━━━━━\n`;
    texto += `✨ _Enviado desde el sistema digital de Dencker Pan Cochabamba_`;

    const url = `https://wa.me/59176911000?text=${encodeURIComponent(texto)}`;
    setReservaEnviada(true);
    setTimeout(() => {
      window.open(url, "_blank");
      setReservaEnviada(false);
      setReservaModalOpen(false);
    }, 1100);
  };

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
    setVistaModal(productoVistaOverrides[p.id] || vistaGlobalFotos);
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

        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-16 lg:py-24 relative z-10 space-y-12">
          
          {/* Badge Superior Centrado */}
          <div className="w-full flex justify-center sm:justify-start">
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

          {/* Grilla Principal del Hero (8 Columnas Editorial + 4 Columnas Tarjeta Croissant) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center text-left">
            
            {/* Columna Izquierda: Copy Editorial y 3 CTAs */}
            <div className="lg:col-span-8 space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={springPhysics}
                className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.06]"
              >
                El aroma del pan crujiente,{" "}
                <span className="italic font-normal text-[#CDE0C9] bg-gradient-to-r from-[#D8E6D3] via-[#FAF7F2] to-[#87A987] bg-clip-text text-transparent block sm:inline">
                  elevado a una experiencia sensorial.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springPhysics, delay: 0.1 }}
                className="text-[#D8C7B8] text-base sm:text-lg max-w-2xl font-sans leading-relaxed"
              >
                Masa madre viva de 24 horas, hojaldres con 100% pura mantequilla e infusiones de café de altura cosechado en Caranavi a 1,600 msnm.
              </motion.p>

              {/* 3 Botones Claros y Espaciados */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springPhysics, delay: 0.2 }}
                className="flex flex-wrap items-center gap-4 pt-2"
              >
                <motion.a
                  href="#menu-bento"
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96, y: 1 }}
                  transition={springPhysics}
                  onClick={() => soundManager.playPastryCrinkle()}
                  className="px-7 py-3.5 rounded-full bg-[#FAF7F2] hover:bg-white text-[#1E130C] font-extrabold text-sm shadow-[0_8px_30px_rgba(255,255,255,0.2)] flex items-center gap-2.5 select-none transition cursor-pointer"
                >
                  <ShoppingBag size={17} className="text-[#527953]" />
                  <span>Explorar Menú Bento</span>
                  <ArrowRight size={15} />
                </motion.a>

                <motion.a
                  href="#coffeelab"
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96, y: 1 }}
                  transition={springPhysics}
                  onClick={() => soundManager.playCoffeeSteam()}
                  className="px-6 py-3.5 rounded-full bg-[#241710]/90 hover:bg-[#2E1D14] border border-[#527953]/50 text-[#CDE0C9] font-bold text-sm flex items-center gap-2 select-none shadow-lg transition cursor-pointer"
                >
                  <Coffee size={17} className="text-[#87A987]" />
                  <span>CoffeeLab 3D Interactivo</span>
                </motion.a>

                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96, y: 1 }}
                  transition={springPhysics}
                  onClick={() => setModalMeseroAbierto(true)}
                  className="px-5 py-3.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-stone-200 font-semibold text-xs flex items-center gap-2 select-none transition cursor-pointer"
                >
                  <Bell size={15} className="text-[#D49B54]" />
                  <span>Llamar al Mesero</span>
                </motion.button>
              </motion.div>
            </div>

            {/* Columna Derecha: Tarjeta Editorial Croissant 100% Mantequilla */}
            <div className="lg:col-span-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...springPhysics, delay: 0.25 }}
                className="relative rounded-3xl bg-gradient-to-b from-[#241710] to-[#160E0A] border border-[#527953]/40 p-6 shadow-2xl backdrop-blur-xl space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-widest text-[#CDE0C9] font-bold flex items-center gap-1.5">
                    <Flame size={14} className="text-[#87A987]" />
                    <span>Tanda Recién Salida</span>
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    Horno Activo
                  </span>
                </div>

                <div className="relative h-44 rounded-2xl overflow-hidden bg-stone-900 group">
                  <img
                    src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80"
                    alt="Croissant Francés 100% Mantequilla"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <p className="text-[11px] text-[#CDE0C9] font-semibold">Laminado Francés</p>
                      <h3 className="font-serif text-lg font-bold text-white">
                        Croissant 100% Mantequilla
                      </h3>
                    </div>
                    <span className="bg-[#FAF7F2] text-[#1E130C] font-extrabold text-xs px-3 py-1 rounded-full shadow-md font-sans">
                      Bs 18.00
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#D8C7B8] leading-relaxed">
                  72 capas de hojaldre crujiente horneadas cada mañana a las 07:30 y cada tarde a las 16:30 en nuestra casa de Cochabamba.
                </p>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    soundManager.playPastryCrinkle();
                    addItem({
                      id: "prod-croissant-hero",
                      nombre: "Croissant Francés 100% Mantequilla",
                      precio: 18.0,
                      costo: 6.0,
                      disponible: true,
                      es_mas_vendido: true,
                      stock: 50,
                      categoria_id: "c2",
                      estacion: "vitrina",
                      chips_personalizacion: ["Recién horneado"],
                      descripcion: "Hojaldrado tradicional con 100% mantequilla noble y 72 capas.",
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    });
                  }}
                  className="w-full py-3 rounded-2xl bg-[#527953]/25 hover:bg-[#527953] text-[#CDE0C9] hover:text-white border border-[#527953]/50 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Reservar de la Tanda Caliente</span>
                </motion.button>
              </motion.div>
            </div>

          </div>

          {/* Franja Inferior Limpia de 4 Columnas */}
          <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#527953]/25 text-[#87A987] flex items-center justify-center shrink-0 border border-[#527953]/30">
                <Clock size={18} />
              </div>
              <div>
                <p className="font-bold text-sm text-white">07:30 y 16:30</p>
                <p className="text-xs text-[#A8988D]">Tandas calientes al día</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#527953]/25 text-[#87A987] flex items-center justify-center shrink-0 border border-[#527953]/30">
                <Coffee size={18} />
              </div>
              <div>
                <p className="font-bold text-sm text-white">Caranavi & Samaipata</p>
                <p className="text-xs text-[#A8988D]">100% arábica seleccionado</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#527953]/25 text-[#87A987] flex items-center justify-center shrink-0 border border-[#527953]/30">
                <Flame size={18} />
              </div>
              <div>
                <p className="font-bold text-sm text-white">Masa Madre Viva</p>
                <p className="text-xs text-[#A8988D]">Fermentación lenta y pura</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#527953]/25 text-[#87A987] flex items-center justify-center shrink-0 border border-[#527953]/30">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="font-bold text-sm text-white">100% Mantequilla</p>
                <p className="text-xs text-[#A8988D]">Hojaldrado europeo noble</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 1.5. SELECTOR DE MODALIDADES DE ATENCIÓN (PARA LLEVAR / DELIVERY / MESA / RESERVA / CATERING) ── */}
      <section className="w-full bg-[#150E09] border-y border-[#3D271D]/50 py-12 text-white relative z-20">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 space-y-8">
          
          {/* Header de la Sección */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#87A987] flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#87A987]" />
                <span>Atención Flexible • Dencker Pan Cochabamba</span>
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Elige cómo disfrutar tu experiencia hoy
              </h2>
              <p className="text-xs sm:text-sm text-[#D8C7B8] max-w-xl leading-relaxed">
                ¿Estás en tu oficina, descansando en casa o ya tomaste asiento en el local? Selecciona la opción perfecta para ti:
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-[#A8988D] hidden sm:inline">¿Dudas con tu pedido?</span>
              <a
                href={DENCKER_ASSETS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-full bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <MessageCircle size={14} />
                <span>Asistencia en Vivo</span>
              </a>
            </div>
          </div>

          {/* Grilla Bento de 4 Modalidades */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Para Llevar (Takeaway Express) */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={springPhysics}
              className="p-5 rounded-3xl bg-gradient-to-b from-[#22160F] to-[#18100A] border border-[#527953]/30 shadow-lg flex flex-col justify-between space-y-4 group hover:border-[#87A987]/50 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-[#527953]/20 text-[#87A987] flex items-center justify-center border border-[#527953]/30">
                    <Store size={20} />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#527953]/30 text-[#CDE0C9]">
                    Sin Filas
                  </span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-white group-hover:text-[#CDE0C9] transition-colors">
                    Para Recoger (Takeaway)
                  </h3>
                  <p className="text-xs text-[#D8C7B8] mt-1 leading-relaxed">
                    Ordena antes de salir. Empacamos tus panes y café caliente para que retires directo por vitrina sin esperas.
                  </p>
                </div>
                <div className="text-[10px] text-[#A3B899] font-medium flex items-center gap-1.5 pt-1">
                  <Clock size={12} />
                  <span>Tandas calientes 07:30 y 16:30</span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  soundManager.playPastryCrinkle();
                  const el = document.getElementById("menu-bento");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full py-2.5 px-3 rounded-2xl bg-[#527953]/20 hover:bg-[#527953] text-[#CDE0C9] hover:text-white border border-[#527953]/40 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Pedir para Recoger</span>
                <ArrowRight size={13} />
              </motion.button>
            </motion.div>

            {/* 2. Delivery Cochabamba */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={springPhysics}
              className="p-5 rounded-3xl bg-gradient-to-b from-[#22160F] to-[#18100A] border border-[#D49B54]/30 shadow-lg flex flex-col justify-between space-y-4 group hover:border-[#D49B54]/50 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-[#D49B54]/20 text-[#D49B54] flex items-center justify-center border border-[#D49B54]/30">
                    <MapPin size={20} />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D49B54]/20 text-[#F5DEB3]">
                    A tu Puerta
                  </span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-white group-hover:text-[#F5DEB3] transition-colors">
                    Delivery Cochabamba
                  </h3>
                  <p className="text-xs text-[#D8C7B8] mt-1 leading-relaxed">
                    Hojaldres crujientes, New York Rolls y café filtrado en moto directo a tu domicilio o lugar de trabajo.
                  </p>
                </div>
                <div className="text-[10px] text-[#D8C7B8] font-medium flex items-center gap-1.5 pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Zona Norte, Cala Cala, Recoleta, Centro</span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  soundManager.playTactileClick();
                  const el = document.getElementById("menu-bento");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full py-2.5 px-3 rounded-2xl bg-[#D49B54]/20 hover:bg-[#D49B54] text-[#F5DEB3] hover:text-[#120D0A] border border-[#D49B54]/40 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Pedir Delivery</span>
                <ArrowRight size={13} />
              </motion.button>
            </motion.div>

            {/* 3. Autoservicio en Mesa (¿Ya estás en el local?) */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={springPhysics}
              className="p-5 rounded-3xl bg-gradient-to-b from-[#22160F] to-[#18100A] border border-amber-600/30 shadow-lg flex flex-col justify-between space-y-4 group hover:border-amber-500/50 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
                    <Utensils size={20} />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200">
                    En Salón
                  </span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-white group-hover:text-amber-200 transition-colors">
                    ¿Ya estás sentado?
                  </h3>
                  <p className="text-xs text-[#D8C7B8] mt-1 leading-relaxed">
                    Si entraste sin escanear el QR físico, pulsa tu mesa para pedir desde tu asiento:
                  </p>
                </div>
                
                {/* 12 Mesas Rápidas */}
                <div className="grid grid-cols-6 gap-1 pt-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                    <Link
                      key={num}
                      href={`/mesa/${num}`}
                      onClick={() => {
                        soundManager.playTactileClick();
                        setMesa(num);
                      }}
                      className="py-1 rounded-lg bg-white/5 hover:bg-amber-500 hover:text-stone-950 border border-white/10 text-stone-300 font-mono text-[11px] font-bold text-center transition"
                      title={`Ir a Mesa ${num}`}
                    >
                      M{num}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setModalMeseroAbierto(true)}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Bell size={13} />
                  <span>Llamar al Mesero</span>
                </motion.button>
              </div>
            </motion.div>

            {/* 4. Reservar Mesa en Salón */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={springPhysics}
              className="p-5 rounded-3xl bg-gradient-to-b from-[#22160F] to-[#18100A] border border-blue-500/30 shadow-lg flex flex-col justify-between space-y-4 group hover:border-blue-400/50 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-500/30">
                    <Calendar size={20} />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200">
                    Anticipado
                  </span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-white group-hover:text-blue-200 transition-colors">
                    Reservar Mesa
                  </h3>
                  <p className="text-xs text-[#D8C7B8] mt-1 leading-relaxed">
                    Asegura tu lugar en el Salón Principal o en la Terraza Jardín para brunch o tertulias de café.
                  </p>
                </div>
                <div className="text-[10px] text-[#C9B8A6] font-medium flex items-center gap-1.5 pt-1">
                  <Users size={12} />
                  <span>Mesas para 2, 4, 6 o grupos grandes</span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  soundManager.playTactileClick();
                  setReservaModalOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-2xl bg-blue-500/20 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-400/40 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Calendar size={13} />
                <span>Solicitar Reserva</span>
              </motion.button>
            </motion.div>

          </div>

          {/* Banner Especial de Catering & Cálculos */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Award size={18} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white">
                  ¿Defensas de Grado, Cumpleaños o Reuniones Corporativas?
                </p>
                <p className="text-[11px] text-[#A8988D]">
                  Usa nuestro calculador automático de catering y cotiza bocaditos, tortas y barismo por persona en segundos.
                </p>
              </div>
            </div>

            <motion.a
              href="#cotizador"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => soundManager.playTactileClick()}
              className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold flex items-center gap-2 shrink-0 transition"
            >
              <span>Calcular Presupuesto</span>
              <ArrowRight size={13} />
            </motion.a>
          </div>

        </div>
      </section>

      {/* ── 2. COFFEELAB 3D FULL BLEED (w-full bg-[#140D08]) ── */}
      <section id="coffeelab" className="w-full bg-[#140D08] py-24 border-t border-amber-900/30 overflow-hidden flex flex-col items-center">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
          <CoffeeLab />
        </div>
      </section>

      {/* ── 3. CATÁLOGO EDITORIAL & COLECCIÓN DENCKER PAN (w-full bg-[#FAF7F2]) ── */}
      <section id="menu-bento" className="w-full bg-[#FAF7F2] py-24 border-t border-[#EAE2D5] flex flex-col items-center">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 space-y-12">
          
          {/* Cabecera Editorial del Menú */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs uppercase font-bold tracking-widest text-[#527953] bg-[#EBF3EA] px-4 py-1.5 rounded-full inline-block border border-[#527953]/20 shadow-xs">
              Vitrina & Especialidades • Cochabamba
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1E130C] tracking-tight">
              Colección Dencker Pan
            </h2>
            <p className="text-[#785E4F] text-sm leading-relaxed">
              Masa madre viva de 24 horas, hojaldres con 100% mantequilla e infusiones de altura. Explora con fotos reales de presentación exterior y corte interior con IA.
            </p>
          </div>

          {/* Barra de Control de Navegación del Menú (Modo General vs Por Categoría + Filtro de Fotos) */}
          <div className="max-w-4xl mx-auto w-full space-y-4">
            
            {/* Fila 1: Selector de Modo (General / Categoría) y Switcher de Fotos (Exterior / Corte Interior) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2.5 rounded-2xl bg-white border border-[#EAE2D5] shadow-xs">
              
              {/* Selector Modo Presentación */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F5EFEB]">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playTactileClick();
                    setModoPresentacion("general");
                  }}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    modoPresentacion === "general"
                      ? "bg-[#1E130C] text-[#FAF7F2] shadow-sm"
                      : "text-[#785E4F] hover:text-[#1E130C]"
                  }`}
                >
                  <LayoutGrid size={14} />
                  <span>Vista General (Menú Completo)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playTactileClick();
                    setModoPresentacion("categoria");
                  }}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    modoPresentacion === "categoria"
                      ? "bg-[#1E130C] text-[#FAF7F2] shadow-sm"
                      : "text-[#785E4F] hover:text-[#1E130C]"
                  }`}
                >
                  <ListFilter size={14} />
                  <span>Por Categoría</span>
                </button>
              </div>

              {/* Selector Global de Fotos: Exterior vs Corte Interior (IA) */}
              <div className="flex items-center justify-between sm:justify-end gap-2 px-1">
                <span className="text-[11px] font-bold text-[#A8988D] uppercase tracking-wider hidden sm:inline">
                  Fotos:
                </span>
                <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F5EFEB]">
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playTactileClick();
                      setVistaGlobalFotos("exterior");
                      setProductoVistaOverrides({});
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      vistaGlobalFotos === "exterior"
                        ? "bg-[#1E130C] text-[#FAF7F2] shadow-sm"
                        : "text-[#785E4F] hover:text-[#1E130C]"
                    }`}
                  >
                    <span>🥐 Exterior</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playTactileClick();
                      setVistaGlobalFotos("corte");
                      setProductoVistaOverrides({});
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      vistaGlobalFotos === "corte"
                        ? "bg-[#527953] text-white shadow-sm"
                        : "text-[#785E4F] hover:text-[#1E130C]"
                    }`}
                  >
                    <Sparkles size={12} className="text-[#87A987]" />
                    <span>🔪 Corte Interior (IA)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Fila 2: Buscador */}
            <div className="relative">
              <Search size={18} className="absolute left-4 top-3.5 text-[#785E4F]" />
              <input
                type="text"
                placeholder="Buscar por especialidad (New York Roll, cauka, croissant, espresso, cuñapé)..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-11 pr-10 py-3.5 rounded-[22px] bg-white border border-[#EAE2D5] shadow-xs text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#527953] placeholder:text-[#A8988D] text-[#1E130C] transition"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className="absolute right-3.5 top-3.5 text-[#785E4F] hover:text-[#1E130C] text-xs cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Fila 3: Chips de Búsqueda Rápida */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <span className="text-[10px] uppercase font-bold text-[#A8988D] shrink-0 tracking-wider flex items-center gap-1 mr-1">
                <Tag size={12} />
                Populares:
              </span>
              {[
                { tag: "pistacho", label: "#PistachoSiciliano" },
                { tag: "croissant", label: "#72CapasMantequilla" },
                { tag: "cuñap", label: "#CuñapéCriollo" },
                { tag: "baguette", label: "#MasaMadre24h" },
                { tag: "alfajor", label: "#AlfajorManjar" },
                { tag: "cappuccino", label: "#CaféCaranavi" },
              ].map((chip) => (
                <button
                  key={chip.tag}
                  type="button"
                  onClick={() => {
                    soundManager.playTactileClick();
                    setBusqueda(busqueda === chip.tag ? "" : chip.tag);
                  }}
                  className={`px-3 py-1 rounded-full whitespace-nowrap text-[11px] font-semibold transition border cursor-pointer select-none ${
                    busqueda === chip.tag
                      ? "bg-[#527953] text-white border-[#527953] shadow-xs"
                      : "bg-white text-[#785E4F] border-[#EAE2D5] hover:border-[#527953] hover:text-[#1E130C]"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Fila 4: Pestañas de Categoría (Visible en Modo Categoría o al buscar) */}
            {(modoPresentacion === "categoria" || busqueda !== "") && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center pt-2">
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
                      className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all select-none cursor-pointer ${
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
            )}
          </div>

          {/* ── VISTA GENERAL (MENÚ COMPLETO ORGANIZADO POR SECCIONES) ── */}
          {modoPresentacion === "general" && !busqueda && (
            <div className="space-y-16">
              
              {/* Contenedores Insignia Bento Superiores */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                {/* 🌟 CONTENEDOR ESTRELLA: NEW YORK ROLL DE PISTACHO CON DOBLE VISTA 🌟 */}
                {starProduct && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={springCard}
                    className="col-span-1 md:col-span-2 lg:col-span-2 md:row-span-2 group rounded-2xl overflow-hidden bg-gradient-to-br from-[#1A110B] via-[#241810] to-[#120B07] text-white p-8 border border-[#527953]/40 shadow-xl flex flex-col justify-between relative hover:border-[#87A987]/60 transition-colors min-h-[460px]"
                  >
                    {/* Imagen Exterior */}
                    <img
                      src={starProduct.imagen_url || "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=85"}
                      alt={starProduct.nombre}
                      className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 pointer-events-none ${
                        getVistaActual(starProduct.id) === "corte" ? "opacity-0" : "opacity-45 group-hover:opacity-20 scale-105"
                      }`}
                    />

                    {/* Imagen Corte Interior (IA) */}
                    <img
                      src={getImagenInterior(starProduct)}
                      alt={`${starProduct.nombre} corte interior`}
                      className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 pointer-events-none ${
                        getVistaActual(starProduct.id) === "corte" ? "opacity-55 scale-100" : "opacity-0 group-hover:opacity-55 group-hover:scale-100"
                      }`}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A110B] via-[#1A110B]/80 to-transparent pointer-events-none" />

                    {/* Contenido Superior en relative z-10 */}
                    <div className="relative z-10 space-y-4 max-w-md">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#527953]/40 text-[#CDE0C9] text-xs font-bold border border-[#527953]/60 backdrop-blur-md">
                            <Sparkles size={13} className="text-[#87A987]" />
                            Insignia • Pistacho Siciliano
                          </span>
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 font-medium">
                            100% Mantequilla
                          </span>
                        </div>

                        {/* Pill Toggle para Alternar Vista */}
                        <button
                          type="button"
                          onClick={(e) => toggleVistaProducto(starProduct.id, e)}
                          className="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border flex items-center gap-1.5 transition-all cursor-pointer select-none bg-black/60 text-white hover:bg-black/80 border-white/20 shadow-md"
                        >
                          <Eye size={12} className={getVistaActual(starProduct.id) === "corte" ? "text-[#E6AE68]" : "text-[#87A987]"} />
                          <span>{getVistaActual(starProduct.id) === "corte" ? "Corte Interior" : "Exterior"}</span>
                        </button>
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
                        <span className="px-2.5 py-1 rounded-xl bg-[#527953]/30 text-[#CDE0C9] border border-[#527953]/50">
                          {getVistaActual(starProduct.id) === "corte" ? "🔪 Vista: Corte Interior (IA)" : "🥐 Vista: Exterior Dorado"}
                        </span>
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
                            className="w-8 h-8 rounded-xl bg-white text-[#1E130C] flex items-center justify-center font-bold text-xs cursor-pointer"
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
                            className="w-8 h-8 rounded-xl bg-[#527953] text-white flex items-center justify-center font-bold text-xs shadow-md cursor-pointer"
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
                        setModoPresentacion("categoria");
                        setCategoriaActiva("cafe");
                      }}
                      className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-[#CDE0C9] text-xs font-bold border border-white/15 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Ver Variedades</span>
                      <ChevronRight size={14} />
                    </motion.button>
                  </div>
                </motion.div>
              </div>

              {/* Secciones Temáticas Categorizadas */}
              {SECCIONES_MENU.map((sec) => {
                const SecIcon = sec.icon;
                const itemsSeccion = productosUnicos.filter(sec.match);
                if (itemsSeccion.length === 0) return null;

                const itemsAMostrar = itemsSeccion.slice(0, 8);

                return (
                  <div key={sec.id} className="space-y-6 pt-4">
                    {/* Encabezado de la Sección */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#EAE2D5] pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-xl bg-[#1E130C] text-[#CDE0C9]">
                            <SecIcon size={16} />
                          </span>
                          <span className="text-[11px] uppercase font-bold tracking-wider text-[#527953] bg-[#EBF3EA] px-2.5 py-0.5 rounded-md">
                            {sec.badge}
                          </span>
                          <span className="text-xs text-[#A8988D]">
                            ({itemsSeccion.length} delicias)
                          </span>
                        </div>
                        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E130C]">
                          {sec.titulo}
                        </h3>
                        <p className="text-xs text-[#785E4F] max-w-xl">
                          {sec.subtitulo}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          soundManager.playTactileClick();
                          setModoPresentacion("categoria");
                          setCategoriaActiva(sec.categoriaId);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#527953] hover:text-[#1E130C] transition py-1 cursor-pointer self-start sm:self-auto"
                      >
                        <span>Explorar todos ({itemsSeccion.length})</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>

                    {/* Grilla de 4 Columnas con Doble Vista */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {itemsAMostrar.map((prod) => {
                        const cantidadEnCarrito = getItemCantidadEnCarrito(prod.id);
                        const vistaActual = getVistaActual(prod.id);
                        const imgExterior =
                          prod.imagen_url ||
                          "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80";
                        const imgInterior = getImagenInterior(prod);

                        return (
                          <motion.div
                            key={prod.id}
                            layout
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={springCard}
                            className="relative overflow-hidden rounded-2xl min-h-[350px] flex flex-col justify-end p-6 sm:p-7 group shadow-sm hover:shadow-xl transition-all border border-[#EAE2D5] bg-[#1A110B]"
                          >
                            {/* Imagen Exterior */}
                            <img
                              src={imgExterior}
                              alt={prod.nombre}
                              loading="lazy"
                              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 pointer-events-none ${
                                vistaActual === "corte" ? "opacity-0 scale-105" : "opacity-100 group-hover:scale-105"
                              }`}
                            />

                            {/* Imagen Corte Interior (IA) */}
                            <img
                              src={imgInterior}
                              alt={`${prod.nombre} corte interior`}
                              loading="lazy"
                              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 pointer-events-none ${
                                vistaActual === "corte" ? "opacity-100 scale-100" : "opacity-0 group-hover:opacity-100 group-hover:scale-105"
                              }`}
                            />

                            {/* Overlay gradiente */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none" />

                            {/* Badges superiores con Pill Toggle de Doble Vista */}
                            <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20 pointer-events-auto">
                              <div>
                                {prod.es_mas_vendido ? (
                                  <span className="px-2.5 py-1 rounded-full bg-[#1E130C]/90 text-[#87A987] font-bold text-[10px] backdrop-blur-md border border-white/10 shadow-xs">
                                    ★ Destacado
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-md bg-black/50 text-white/80 font-medium text-[10px] backdrop-blur-sm">
                                    Artesanal
                                  </span>
                                )}
                              </div>

                              {/* Botón para alternar entre Vista Exterior y Corte Interior */}
                              <button
                                type="button"
                                onClick={(e) => toggleVistaProducto(prod.id, e)}
                                className="px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md border flex items-center gap-1.5 transition-all cursor-pointer select-none bg-black/65 text-white hover:bg-black/85 border-white/20 shadow-md"
                                title="Alternar entre Vista Exterior y Corte Interior"
                              >
                                <Eye size={11} className={vistaActual === "corte" ? "text-[#E6AE68]" : "text-[#87A987]"} />
                                <span>{vistaActual === "corte" ? "Corte Interior" : "Exterior"}</span>
                              </button>
                            </div>

                            {/* Contenido en relative z-10 */}
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
                  </div>
                );
              })}
            </div>
          )}

          {/* ── VISTA POR CATEGORÍA ESPECÍFICA O BÚSQUEDA ── */}
          {(modoPresentacion === "categoria" || busqueda !== "") && (
            <div className="space-y-8">
              {/* Resumen de Resultados */}
              <div className="flex items-center justify-between border-b border-[#EAE2D5] pb-3">
                <span className="text-xs font-bold text-[#785E4F]">
                  Mostrando {remainingProducts.length} de {productosFiltrados.length} delicias
                  {busqueda && ` para "${busqueda}"`}
                </span>
                <span className="text-xs text-[#527953] font-semibold">
                  Fotos interactivas: Hover para ver corte interior
                </span>
              </div>

              {/* Grilla Bento Asimétrica con Tarjeta Estrella */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                {/* Si no hay búsqueda y starProduct coincide, mostrarlo en formato destacado */}
                {!busqueda && starProduct && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={springCard}
                    className="col-span-1 md:col-span-2 lg:col-span-2 md:row-span-2 group rounded-2xl overflow-hidden bg-gradient-to-br from-[#1A110B] via-[#241810] to-[#120B07] text-white p-8 border border-[#527953]/40 shadow-xl flex flex-col justify-between relative hover:border-[#87A987]/60 transition-colors min-h-[460px]"
                  >
                    {/* Imagen Exterior */}
                    <img
                      src={starProduct.imagen_url || "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=85"}
                      alt={starProduct.nombre}
                      className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 pointer-events-none ${
                        getVistaActual(starProduct.id) === "corte" ? "opacity-0" : "opacity-45 group-hover:opacity-20 scale-105"
                      }`}
                    />

                    {/* Imagen Corte Interior (IA) */}
                    <img
                      src={getImagenInterior(starProduct)}
                      alt={`${starProduct.nombre} corte interior`}
                      className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 pointer-events-none ${
                        getVistaActual(starProduct.id) === "corte" ? "opacity-55 scale-100" : "opacity-0 group-hover:opacity-55 group-hover:scale-100"
                      }`}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A110B] via-[#1A110B]/80 to-transparent pointer-events-none" />

                    <div className="relative z-10 space-y-4 max-w-md">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#527953]/40 text-[#CDE0C9] text-xs font-bold border border-[#527953]/60 backdrop-blur-md">
                          <Sparkles size={13} className="text-[#87A987]" />
                          Insignia • Pistacho Siciliano
                        </span>

                        <button
                          type="button"
                          onClick={(e) => toggleVistaProducto(starProduct.id, e)}
                          className="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border flex items-center gap-1.5 transition-all cursor-pointer select-none bg-black/60 text-white hover:bg-black/80 border-white/20 shadow-md"
                        >
                          <Eye size={12} className={getVistaActual(starProduct.id) === "corte" ? "text-[#E6AE68]" : "text-[#87A987]"} />
                          <span>{getVistaActual(starProduct.id) === "corte" ? "Corte Interior" : "Exterior"}</span>
                        </button>
                      </div>

                      <h3
                        onClick={() => abrirModalProducto(starProduct)}
                        className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight cursor-pointer hover:text-[#CDE0C9] transition-colors"
                      >
                        {starProduct.nombre}
                      </h3>

                      <p className="text-[#D8C7B8] text-sm leading-relaxed">
                        Rueda de hojaldre francés laminada con 72 capas de mantequilla noble. Corazón untuoso de crema pastelera de pistacho de Bronte y praliné tostado.
                      </p>
                    </div>

                    <div className="relative z-10 pt-8 mt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] text-[#A8988D] uppercase tracking-wider block font-semibold">
                          Precio Bolivianos
                        </span>
                        <span className="font-sans text-3xl font-black text-white tracking-tight">
                          Bs {starProduct.precio.toFixed(2)}
                        </span>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95, y: 2 }}
                        transition={springPhysics}
                        onClick={(e) => agregarAlCarritoRapido(starProduct, e)}
                        className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#527953] to-[#6A9368] hover:from-[#6A9368] hover:to-[#527953] text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer"
                      >
                        <Plus size={16} />
                        <span>Añadir al Pedido</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Resto de productos en la categoría */}
                {remainingProducts.map((prod) => {
                  const cantidadEnCarrito = getItemCantidadEnCarrito(prod.id);
                  const vistaActual = getVistaActual(prod.id);
                  const imgExterior =
                    prod.imagen_url ||
                    "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80";
                  const imgInterior = getImagenInterior(prod);

                  return (
                    <motion.div
                      key={prod.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={springCard}
                      className="relative overflow-hidden rounded-2xl min-h-[350px] flex flex-col justify-end p-6 sm:p-7 group shadow-sm hover:shadow-xl transition-all border border-[#EAE2D5] bg-[#1A110B]"
                    >
                      {/* Imagen Exterior */}
                      <img
                        src={imgExterior}
                        alt={prod.nombre}
                        loading="lazy"
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 pointer-events-none ${
                          vistaActual === "corte" ? "opacity-0 scale-105" : "opacity-100 group-hover:scale-105"
                        }`}
                      />

                      {/* Imagen Corte Interior (IA) */}
                      <img
                        src={imgInterior}
                        alt={`${prod.nombre} corte interior`}
                        loading="lazy"
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 pointer-events-none ${
                          vistaActual === "corte" ? "opacity-100 scale-100" : "opacity-0 group-hover:opacity-100 group-hover:scale-105"
                        }`}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none" />

                      {/* Badges superiores con Pill Toggle de Doble Vista */}
                      <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20 pointer-events-auto">
                        <div>
                          {prod.es_mas_vendido && (
                            <span className="px-2.5 py-1 rounded-full bg-[#1E130C]/90 text-[#87A987] font-bold text-[10px] backdrop-blur-md border border-white/10 shadow-xs">
                              ★ Destacado
                            </span>
                          )}
                        </div>

                        {/* Botón para alternar entre Vista Exterior y Corte Interior */}
                        <button
                          type="button"
                          onClick={(e) => toggleVistaProducto(prod.id, e)}
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md border flex items-center gap-1.5 transition-all cursor-pointer select-none bg-black/65 text-white hover:bg-black/85 border-white/20 shadow-md"
                          title="Alternar entre Vista Exterior y Corte Interior"
                        >
                          <Eye size={11} className={vistaActual === "corte" ? "text-[#E6AE68]" : "text-[#87A987]"} />
                          <span>{vistaActual === "corte" ? "Corte Interior" : "Exterior"}</span>
                        </button>
                      </div>

                      {/* Contenido en relative z-10 */}
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

              {/* Botón Cargar Más en vista categoría */}
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
              <div className="relative h-56 -mx-6 -mt-6 bg-[#1A110B] overflow-hidden group">
                <img
                  src={
                    vistaModal === "corte"
                      ? getImagenInterior(productoModal)
                      : productoModal.imagen_url || "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"
                  }
                  alt={productoModal.nombre}
                  className="w-full h-full object-cover transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                {/* Selector de las 2 Vistas en el Modal */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/20">
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playTactileClick();
                        setVistaModal("exterior");
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        vistaModal === "exterior"
                          ? "bg-white text-[#1E130C] shadow-sm"
                          : "text-white/80 hover:text-white"
                      }`}
                    >
                      <span>🥐 Vista Exterior</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playPastryCrinkle();
                        setVistaModal("corte");
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        vistaModal === "corte"
                          ? "bg-[#527953] text-white shadow-sm"
                          : "text-white/80 hover:text-white"
                      }`}
                    >
                      <Sparkles size={12} className="text-[#87A987]" />
                      <span>🔪 Corte Interior (IA)</span>
                    </button>
                  </div>

                  <span className="text-[10px] font-semibold text-white/90 bg-black/50 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/10 hidden sm:inline-block">
                    {vistaModal === "corte" ? "Corte / Alveolado" : "Recién horneado"}
                  </span>
                </div>

                <button
                  onClick={() => setProductoModal(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer border border-white/20 transition"
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

        {/* Modal Llamar al Mesero en Salón */}
        {modalMeseroAbierto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={springPhysics}
              className="w-full max-w-md bg-[#1D140F] text-[#FAF6F0] rounded-[32px] p-6 sm:p-7 border border-[#D49B54]/40 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#D49B54]/20 border border-[#D49B54]/40 flex items-center justify-center text-[#E6AE68]">
                    <Bell size={18} />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-bold">Llamar al Mesero</h3>
                    <p className="text-[11px] text-[#C9B8A6]">Atención inmediata en salón Dencker Pan</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setModalMeseroAbierto(false);
                    setAvisoMeseroEnviado(false);
                  }}
                  className="p-1.5 rounded-full hover:bg-white/10 text-[#C9B8A6] transition"
                >
                  <X size={18} />
                </button>
              </div>

              {avisoMeseroEnviado ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                    <Check size={28} />
                  </div>
                  <h4 className="font-bold text-lg text-white">¡Aviso enviado al personal!</h4>
                  <p className="text-xs text-[#D8C7B8] max-w-xs mx-auto">
                    El mesero asignado se dirige a la <strong className="text-[#E6AE68]">Mesa {mesaSeleccionadaAviso}</strong> en este instante.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#E6AE68] mb-2.5">
                      Selecciona tu número de mesa:
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { num: 1, label: "Mesa 01 • Ventanal" },
                        { num: 4, label: "Mesa 04 • Terraza Jardín" },
                        { num: 7, label: "Mesa 07 • Barra Café" },
                        { num: 12, label: "Mesa 12 • Salón Interior" },
                      ].map((m) => (
                        <button
                          key={m.num}
                          type="button"
                          onClick={() => {
                            soundManager.playTactileClick();
                            setMesaSeleccionadaAviso(m.num);
                          }}
                          className={`p-3 rounded-2xl text-xs font-semibold border text-left transition-all cursor-pointer ${
                            mesaSeleccionadaAviso === m.num
                              ? "bg-[#D49B54]/25 border-[#D49B54] text-white shadow-md ring-1 ring-[#D49B54]/40"
                              : "bg-black/30 border-white/10 text-[#C9B8A6] hover:bg-black/50"
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    transition={springPhysics}
                    onClick={() => handleLlamarMesero(mesaSeleccionadaAviso)}
                    className="w-full py-4 rounded-2xl bg-[#D49B54] hover:bg-[#E6AE68] text-[#120D0A] font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl shadow-[#D49B54]/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Bell size={16} />
                    <span>Notificar al Mesero (Mesa {mesaSeleccionadaAviso})</span>
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Modal de Reserva de Mesa */}
        {reservaModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReservaModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={springPhysics}
              className="relative w-full max-w-lg bg-gradient-to-b from-[#1C130D] to-[#120B07] border border-[#527953]/40 rounded-3xl p-6 sm:p-7 shadow-[0_20px_70px_rgba(0,0,0,0.8)] z-10 text-white space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#527953]/25 border border-[#527953]/40 flex items-center justify-center text-[#87A987]">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                      Reservar Mesa en Salón
                    </h3>
                    <p className="text-[11px] text-[#D8C7B8]">
                      Salón Principal & Terraza Jardín • Dencker Pan Cochabamba
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    soundManager.playTactileClick();
                    setReservaModalOpen(false);
                    setReservaEnviada(false);
                  }}
                  className="p-1.5 rounded-full hover:bg-white/10 text-[#C9B8A6] transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {reservaEnviada ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                    <Check size={32} />
                  </div>
                  <h4 className="font-bold text-xl text-white">¡Solicitud de Reserva Registrada!</h4>
                  <p className="text-xs text-[#D8C7B8] max-w-sm mx-auto">
                    Abriendo WhatsApp para confirmación inmediata con el anfitrión de salón.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  {/* Selector de Zona */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#CDE0C9] mb-1.5">
                      Zona Preferida:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "Salón Principal", label: "Salón Principal" },
                        { id: "Terraza Jardín", label: "Terraza Jardín" },
                        { id: "Barra de Café", label: "Barra Café" },
                      ].map((z) => (
                        <button
                          key={z.id}
                          type="button"
                          onClick={() => {
                            soundManager.playTactileClick();
                            setReservaData({ ...reservaData, zona: z.id });
                          }}
                          className={`py-2 px-3 rounded-xl font-semibold border text-center transition cursor-pointer ${
                            reservaData.zona === z.id
                              ? "bg-[#527953] border-[#87A987] text-white shadow-md"
                              : "bg-white/5 border-white/10 text-stone-300 hover:bg-white/10"
                          }`}
                        >
                          {z.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fecha y Hora */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#CDE0C9] mb-1.5">
                        Día:
                      </label>
                      <select
                        value={reservaData.fecha}
                        onChange={(e) => setReservaData({ ...reservaData, fecha: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-white/10 border border-white/15 text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#87A987]"
                      >
                        <option value="Hoy" className="bg-[#1C130D]">Hoy</option>
                        <option value="Mañana" className="bg-[#1C130D]">Mañana</option>
                        <option value="Este Fin de Semana" className="bg-[#1C130D]">Este Fin de Semana</option>
                        <option value="Próxima Semana" className="bg-[#1C130D]">Próxima Semana</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#CDE0C9] mb-1.5">
                        Turno / Hora:
                      </label>
                      <select
                        value={reservaData.hora}
                        onChange={(e) => setReservaData({ ...reservaData, hora: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-white/10 border border-white/15 text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#87A987]"
                      >
                        <option value="08:30 (Desayuno)" className="bg-[#1C130D]">08:30 (Desayuno)</option>
                        <option value="10:00 (Brunch)" className="bg-[#1C130D]">10:00 (Brunch)</option>
                        <option value="12:30 (Almuerzo)" className="bg-[#1C130D]">12:30 (Almuerzo)</option>
                        <option value="16:30 (Tanda Pan Caliente)" className="bg-[#1C130D]">16:30 (Pan Caliente)</option>
                        <option value="18:30 (Merienda)" className="bg-[#1C130D]">18:30 (Merienda)</option>
                      </select>
                    </div>
                  </div>

                  {/* Cantidad de personas */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#CDE0C9] mb-1.5">
                      Número de Comensales:
                    </label>
                    <div className="grid grid-cols-6 gap-1.5">
                      {[1, 2, 4, 6, 8, 12].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            soundManager.playTactileClick();
                            setReservaData({ ...reservaData, personas: num });
                          }}
                          className={`py-2 rounded-xl font-bold font-mono transition text-center cursor-pointer ${
                            reservaData.personas === num
                              ? "bg-[#D49B54] text-[#120D0A] shadow-md"
                              : "bg-white/5 border border-white/10 text-stone-300 hover:bg-white/10"
                          }`}
                        >
                          {num}p
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Contacto */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      placeholder="Tu Nombre Completo"
                      value={reservaData.nombre}
                      onChange={(e) => setReservaData({ ...reservaData, nombre: e.target.value })}
                      className="w-full p-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#87A987]"
                    />
                    <input
                      type="tel"
                      placeholder="WhatsApp (ej. 76911000)"
                      value={reservaData.telefono}
                      onChange={(e) => setReservaData({ ...reservaData, telefono: e.target.value })}
                      className="w-full p-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#87A987]"
                    />
                  </div>

                  {/* Notas */}
                  <textarea
                    rows={2}
                    placeholder="Ocasión especial (cumpleaños, reunión) o requerimientos..."
                    value={reservaData.notas}
                    onChange={(e) => setReservaData({ ...reservaData, notas: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#87A987] resize-none"
                  />

                  {/* Botón Enviar */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    transition={springPhysics}
                    onClick={handleEnviarReserva}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#527953] to-[#3E5F3F] hover:from-[#5C865D] hover:to-[#456A46] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl shadow-[#527953]/25 flex items-center justify-center gap-2 cursor-pointer border border-[#87A987]/30"
                  >
                    <MessageCircle size={17} />
                    <span>Confirmar Reserva vía WhatsApp</span>
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

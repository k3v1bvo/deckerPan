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
  Lock,
  Phone,
  FileText,
  Receipt,
  Download,
  BookOpen,
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

const HERO_PASTRY_SHOWCASE = [
  {
    id: "prod_medialuna",
    nombre: "Media Luna Hojaldrada de Mantequilla",
    tag: "Laminado Francés • 100% Mantequilla",
    precio: 10.5,
    costo: 3.5,
    categoria_id: "c_dulces",
    desc: "Masa hojaldrada tierna en forma de medialuna tradicional, hojaldre crujiente con almíbar aromático de la casa.",
    imagen: "/img/products/medialuna_hojaldrada.jpg",
    badge: "Tanda Caliente 16:30",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  {
    id: "prod_new_york_roll",
    nombre: "New York Roll Artesanal",
    tag: "Hojaldre Rueda • Pistacho & Chocolate",
    precio: 21.0,
    costo: 7.5,
    categoria_id: "c_dulces",
    desc: "Masa hojaldrada en espiral circular rellena y bañada. Rellenos: Pistacho, dulce de leche, chocolate o leche condensada.",
    imagen: "/img/products/1711824502.jpg",
    badge: "Top Más Vendido ★",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  {
    id: "prod_cunape_abizcochado",
    nombre: "Cuñapé Abizcochado Crujiente",
    tag: "Herencia Criolla • Queso Chaqueño",
    precio: 6.0,
    costo: 2.5,
    categoria_id: "c_saladas",
    desc: "Receta tradicional con almidón de yuca seleccionado y queso criollo madurado, con ese crujiente abizcochado inconfundible.",
    imagen: "/images/products/cunape_abizcochado_cut.jpg",
    badge: "Clásico de Salón",
    badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  },
  {
    id: "prod_alfajor_marplatense",
    nombre: "Alfajor Marplatense",
    tag: "Dulce de Leche • Baño de Chocolate",
    precio: 12.5,
    costo: 4.5,
    categoria_id: "c_dulces",
    desc: "Galleta de alfajor artesanal rellena con abundante dulce de leche repostero y cubierta de chocolate semiamargo.",
    imagen: "/images/products/alfajor_boliviano_cut.jpg",
    badge: "Favorito de la Tarde",
    badgeColor: "bg-[#C86464]/20 text-[#C86464] border-[#C86464]/30",
  },
];

const PHOTO_RIBBON_ITEMS = [
  {
    id: "ribbon-1",
    nombre: "Media Luna de Mantequilla",
    desc: "Laminado artesanal con pura mantequilla noble",
    imagen: "/img/products/medialuna_hojaldrada.jpg",
    tag: "Viennoiserie",
  },
  {
    id: "ribbon-2",
    nombre: "Expresso 4 Llamas de Altura",
    desc: "Granos Catuaí Lavado de Caranavi a 1,700 msnm",
    imagen: "/img/products/espresso_4_llamas.jpg",
    tag: "Café de Especialidad",
  },
  {
    id: "ribbon-3",
    nombre: "Sándwich Especial Dencker",
    desc: "Armado a tu gusto con pan ciabatta rústico",
    imagen: "/img/products/sandwich_dencker_especial.jpg",
    tag: "Gourmet Salado",
  },
  {
    id: "ribbon-4",
    nombre: "New York Roll de Pistacho",
    desc: "Hojaldre circular con praliné tostado",
    imagen: "/images/products/ny_roll_pistacho_cut.jpg",
    tag: "Pastelería Fina",
  },
  {
    id: "ribbon-5",
    nombre: "Cuñapé Abizcochado",
    desc: "Herencia criolla con queso madurado",
    imagen: "/images/products/cunape_abizcochado_cut.jpg",
    tag: "Tradición",
  },
  {
    id: "ribbon-6",
    nombre: "Alfajor Marplatense",
    desc: "Dulce de leche y chocolate artesanal",
    imagen: "/images/products/alfajor_boliviano_cut.jpg",
    tag: "Repostería",
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
    id: "desayunos",
    categoriaId: "c_desayunos",
    titulo: "Desayunos Dencker & Huevos de Campo",
    subtitulo: "Rise & Shine, Omelettes, Benedictinos, Continental y Golosa y Caprichosa con café o té",
    badge: "Incluye Café o Té",
    icon: UtensilsCrossed,
    match: (p) => p.categoria_id === "c_desayunos" || p.nombre.toLowerCase().includes("desayuno") || p.nombre.toLowerCase().includes("huevos") || p.nombre.toLowerCase().includes("omelette"),
  },
  {
    id: "cafeteria",
    categoriaId: "c_cafes",
    titulo: "Cafetería de Especialidad 4 Llamas & Lattes",
    subtitulo: "Granos bolivianos 4 Llamas de Caranavi (1,700 msnm), expressos puros, cappuccinos y lattes",
    badge: "Café 4 Llamas",
    icon: Coffee,
    match: (p) => p.categoria_id === "c_cafes" || p.categoria_id === "c_lattes" || p.nombre.toLowerCase().includes("café") || p.nombre.toLowerCase().includes("espresso") || p.nombre.toLowerCase().includes("latte"),
  },
  {
    id: "dulces_postres",
    categoriaId: "c_dulces",
    titulo: "Pastelería Fina, Hojaldres & Postres",
    subtitulo: "Alfajores de maicena, New York rolls, medialunas, tortas vascas, cheesecakes y tartaletas",
    badge: "100% Mantequilla",
    icon: Cake,
    match: (p) => p.categoria_id === "c_dulces" || p.categoria_id === "c_postres" || p.nombre.toLowerCase().includes("roll") || p.nombre.toLowerCase().includes("torta") || p.nombre.toLowerCase().includes("alfajor"),
  },
  {
    id: "salados",
    categoriaId: "c_saladas",
    titulo: "Masitas Saladas Calientes & Cuñapés",
    subtitulo: "Cuñapés recién horneados, empanadas de queso, llauchas paceñas, sonsos y croissants de queso",
    badge: "Queso Criollo",
    icon: Flame,
    match: (p) => p.categoria_id === "c_saladas" || p.nombre.toLowerCase().includes("cuñap") || p.nombre.toLowerCase().includes("llaucha") || p.nombre.toLowerCase().includes("sonso"),
  },
  {
    id: "sandwiches",
    categoriaId: "c_sandwiches",
    titulo: "Sándwiches Gourmet & Ensaladas",
    subtitulo: "Sándwich especial Dencker (a tu gusto), lomito, pesto, St. Germain y ensaladas frescas",
    badge: "Pan a Elección",
    icon: UtensilsCrossed,
    match: (p) => p.categoria_id === "c_sandwiches" || p.categoria_id === "c_ensaladas" || p.categoria_id === "c_extras",
  },
  {
    id: "pizzas",
    categoriaId: "c_pizzas",
    titulo: "Pizzas al Horno de Piedra (4, 6 y 8 Porciones)",
    subtitulo: "Pizza especial Dencker (a tu gusto), Margarita, Hawaiana, Bacon, Criolla y Pollo Catupiri",
    badge: "Horno de Piedra",
    icon: Flame,
    match: (p) => p.categoria_id === "c_pizzas" || p.nombre.toLowerCase().includes("pizza"),
  },
  {
    id: "bebidas",
    categoriaId: "c_jugos",
    titulo: "Chocolates, Tés, Frappés & Bebidas",
    subtitulo: "Chocolate con marshmallow, tés de frutos rojos, frappés helados con oreo y jugos naturales",
    badge: "Frías & Calientes",
    icon: Droplets,
    match: (p) => p.categoria_id === "c_chocolates" || p.categoria_id === "c_tes" || p.categoria_id === "c_frappes" || p.categoria_id === "c_jugos" || p.categoria_id === "c_refrescos" || p.categoria_id === "c_helados",
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
    if (prod.id === "prod_tartaleta_chocolate") return "/img/products/tartaleta_chocolate_corte.jpg";
    if (prod.id === "prod_queque_japones") return "/img/products/queque_japones_corte.jpg";
    if (prod.id === "prod_expresso") return "/img/products/cafe_4llamas_pack_gourmet.jpg";
    if (prod.id === "prod_cunape") return "/img/products/cunape_tradicional_real.jpg";
    if (prod.id === "prod_galletas_chips") return "/img/products/galletas_chips_real.jpg";
    if (prod.id === "prod_mini_cake") return "/img/products/mini_cake_corona_real.jpg";
    if (prod.id === "prod_empanada_queso") return "/img/products/empanada_queso_real.jpg";
    return prod.imagen_url || "/img/products/1711660195.jpg";
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

  // Estados Modal Llamar Mesero en Salón & Traer Cuenta
  const [modalMeseroAbierto, setModalMeseroAbierto] = useState(false);
  const [modoModalMesero, setModoModalMesero] = useState<"llamado" | "cuenta">("llamado");
  const [mesaSeleccionadaAviso, setMesaSeleccionadaAviso] = useState(4);
  const [metodoPagoCuenta, setMetodoPagoCuenta] = useState<"efectivo" | "tarjeta" | "qr">("efectivo");
  const [avisoMeseroEnviado, setAvisoMeseroEnviado] = useState(false);
  const [heroPastryIndex, setHeroPastryIndex] = useState(0);

  const handleLlamarMesero = (mesaNum: number, modoOverride?: "llamado" | "cuenta") => {
    const modoActivo = modoOverride || modoModalMesero;
    soundManager.playWaiterBell();

    const esCuenta = modoActivo === "cuenta";
    const metodoLabel =
      metodoPagoCuenta === "tarjeta"
        ? "Datáfono / Tarjeta"
        : metodoPagoCuenta === "qr"
        ? "Cobro QR en mesa"
        : "Efectivo";

    addAlerta({
      mesa_numero: mesaNum,
      tipo: esCuenta ? "cuenta_pedida" : "llamado",
      mensaje: esCuenta
        ? `Mesa ${mesaNum} solicita la cuenta (${metodoLabel})`
        : `Mesa ${mesaNum} solicita atención del personal en salón`,
      datos_extra: { metodo: metodoPagoCuenta, modo: modoActivo },
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
      if (categoriaActiva === "c_desayunos") {
        return p.categoria_id === "c_desayunos" || p.nombre.toLowerCase().includes("desayuno") || p.nombre.toLowerCase().includes("huevos") || p.nombre.toLowerCase().includes("omelette");
      }
      if (categoriaActiva === "c_cafes") {
        return p.categoria_id === "c_cafes" || p.categoria_id === "c_lattes" || p.nombre.toLowerCase().includes("café") || p.nombre.toLowerCase().includes("espresso") || p.nombre.toLowerCase().includes("latte");
      }
      if (categoriaActiva === "c_dulces") {
        return p.categoria_id === "c_dulces" || p.categoria_id === "c_postres" || p.nombre.toLowerCase().includes("roll") || p.nombre.toLowerCase().includes("torta") || p.nombre.toLowerCase().includes("alfajor");
      }
      if (categoriaActiva === "c_saladas") {
        return p.categoria_id === "c_saladas" || p.nombre.toLowerCase().includes("cuñap") || p.nombre.toLowerCase().includes("llaucha") || p.nombre.toLowerCase().includes("sonso");
      }
      if (categoriaActiva === "c_sandwiches") {
        return p.categoria_id === "c_sandwiches" || p.categoria_id === "c_ensaladas" || p.categoria_id === "c_extras";
      }
      if (categoriaActiva === "c_pizzas") {
        return p.categoria_id === "c_pizzas" || p.nombre.toLowerCase().includes("pizza");
      }
      if (categoriaActiva === "c_jugos") {
        return p.categoria_id === "c_chocolates" || p.categoria_id === "c_tes" || p.categoria_id === "c_frappes" || p.categoria_id === "c_jugos" || p.categoria_id === "c_refrescos" || p.categoria_id === "c_helados";
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
    <div className="w-full min-h-screen bg-[#FAF7F2] text-[#1E130C] selection:bg-[#FEE2E2] selection:text-[#991B24] overflow-x-hidden font-sans flex flex-col items-center">
      
      {/* ── 1. HERO ARTESANAL DENCKER PAN (CÁLIDO, EDITORIAL, AUTÉNTICO) ── */}
      <section className="w-full bg-[#FAF7F2] border-b border-[#EAE2D5] relative overflow-hidden flex flex-col items-center">
        {/* Textura sutil y cálida de panadería */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#1E130C_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 pt-10 pb-14 lg:py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Columna Izquierda: Identidad, Título Editorial & Acciones */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Sello de la Casa */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#F3ECE1] border border-[#E0D5C5] text-[#63493C] text-xs font-semibold shadow-2xs">
                <img
                  src={DENCKER_ASSETS.mascotClean}
                  alt="Dencker Pan"
                  className="w-5 h-5 object-contain"
                />
                <span className="font-serif font-bold tracking-wide uppercase text-[#1E130C]">
                  Dencker Pan
                </span>
                <span className="text-[#A8988D]">•</span>
                <span className="text-[11px] text-[#785E4F]">
                  Masa Madre & Café de Especialidad
                </span>
              </div>

              {/* Titular Principal Fraunces */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1E130C] leading-[1.12]">
                La nobleza del pan artesanal,{" "}
                <span className="italic font-normal text-[#C4844D] block sm:inline">
                  en el corazón de Cochabamba.
                </span>
              </h1>

              {/* Párrafo Descriptivo */}
              <p className="text-[#6E5547] text-base sm:text-lg max-w-xl leading-relaxed">
                Masa madre viva con 24 horas de fermentación natural, hojaldres con 100% pura mantequilla e infusiones de altura de Caranavi a 1,600 msnm. Horneamos dos tandas frescas al día en nuestro obrador.
              </p>

              {/* Botones de Acción Directos */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <a
                  href="#catalogo"
                  onClick={() => soundManager.playPastryCrinkle()}
                  className="px-6 py-3.5 rounded-2xl bg-[#1E130C] hover:bg-[#322015] text-[#FAF7F2] font-bold text-sm shadow-md hover:shadow-lg flex items-center gap-2.5 transition active:scale-95 cursor-pointer"
                >
                  <ShoppingBag size={17} className="text-[#D49B54]" />
                  <span>Ver Carta & Pedir</span>
                  <ArrowRight size={15} />
                </a>

                {/* Botón Destacado: Carta Oficial PDF (6 Páginas Reales) */}
                <Link
                  href="/menu-pdf"
                  onClick={() => soundManager.playPastryCrinkle()}
                  className="px-5 py-3.5 rounded-2xl bg-[#991B24] hover:bg-[#7F1D1D] text-white font-bold text-xs flex items-center gap-2 transition shadow-md active:scale-95 border border-red-400/30"
                >
                  <FileText size={16} className="text-amber-300" />
                  <span>Carta Oficial PDF (6 Págs)</span>
                </Link>

                <a
                  href={DENCKER_ASSETS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3.5 rounded-2xl bg-white hover:bg-[#F5EFEB] border border-[#D9CDBF] text-[#1E130C] font-semibold text-xs flex items-center gap-2 transition shadow-xs active:scale-95"
                >
                  <MessageCircle size={16} className="text-emerald-600" />
                  <span>WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    soundManager.playTactileClick();
                    setModoModalMesero("llamado");
                    setModalMeseroAbierto(true);
                  }}
                  className="px-4 py-3.5 rounded-2xl bg-[#F3ECE1] hover:bg-[#EAE0D3] text-[#1E130C] font-bold text-xs flex items-center gap-2 transition border border-[#D9CDBF]/70 active:scale-95 cursor-pointer"
                >
                  <Bell size={14} className="text-[#C4844D]" />
                  <span>Llamar Mesero</span>
                </button>
              </div>

              {/* Tres Pilares Auténticos de Panadería */}
              <div className="pt-6 border-t border-[#EAE2D5] grid grid-cols-3 gap-4 text-xs text-[#785E4F]">
                <div className="flex items-center gap-2.5">
                  <Clock size={16} className="text-[#C4844D] shrink-0" />
                  <div>
                    <span className="font-bold text-[#1E130C] block leading-tight">07:30 y 16:30</span>
                    <span className="text-[11px] text-[#A8988D]">Tandas calientes</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={16} className="text-[#991B24] shrink-0" />
                  <div>
                    <span className="font-bold text-[#1E130C] block leading-tight">100% Mantequilla</span>
                    <span className="text-[11px] text-[#A8988D]">Hojaldre noble</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Coffee size={16} className="text-[#D97706] shrink-0" />
                  <div>
                    <span className="font-bold text-[#1E130C] block leading-tight">Café 4 Llamas</span>
                    <span className="text-[11px] text-[#A8988D]">Caranavi 1,700 msnm</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Columna Derecha: Foto Real de la Panadería & Vitrina + Mascota y Sello Café 4 Llamas */}
            <div className="lg:col-span-5 relative">
              
              {/* Mascota Croissant Oficial Flotante */}
              <div className="absolute -top-6 -right-4 w-20 h-20 sm:w-24 sm:h-24 z-20 drop-shadow-2xl transform rotate-6 hover:rotate-12 transition-transform select-none pointer-events-none">
                <img
                  src={DENCKER_ASSETS.mascotCroissant}
                  alt="Mascota Croissant Dencker"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="relative rounded-3xl overflow-hidden border-2 border-[#EAE0D3] shadow-2xl group bg-[#1E130C]">
                <img
                  src="/img/hero/pastries_coffee_table.jpg"
                  alt="Croissants, New York Roll y Café en Dencker Pan"
                  className="w-full h-[400px] sm:h-[460px] object-cover group-hover:scale-103 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                {/* Sello Flotante Superior */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#1E130C] shadow-sm border border-[#D9CDBF] flex items-center gap-1.5">
                    <span>🥖</span> Horneado Diario a Mano
                  </span>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#991B24]/90 backdrop-blur-md text-white border border-red-400/40">
                    Abierto 07:00 – 21:30
                  </span>
                </div>

                {/* Pie de Foto Editorial con Mini Badge Don Dencker */}
                <div className="absolute bottom-5 left-5 right-5 text-white space-y-2 z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 p-0.5 overflow-hidden shrink-0">
                      <img
                        src={DENCKER_ASSETS.badgeClean}
                        alt="Don Dencker"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold">
                        <Sparkles size={13} />
                        <span>Especialidades Dencker Pan & Café</span>
                      </div>
                      <h3 className="font-serif text-lg sm:text-xl font-bold leading-tight">
                        Pastelería Fina & Café 4 Llamas de Especialidad
                      </h3>
                    </div>
                  </div>
                  <p className="text-[11px] text-stone-300 line-clamp-1">
                    Av. Daniel Salamanca, Cochabamba • Tueste fresco y masa madre de 24 horas
                  </p>
                </div>
              </div>

              {/* Sello Flotante Inferior: Café 4 Llamas de Altura */}
              <div className="absolute -bottom-5 -left-4 bg-[#1E130C]/95 border-2 border-amber-500/50 p-2.5 sm:p-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md z-20">
                <div className="w-11 h-11 rounded-xl bg-amber-950/60 p-1 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <img
                    src={DENCKER_ASSETS.cafeCatuai}
                    alt="Café 4 Llamas"
                    className="w-full h-full object-contain drop-shadow"
                  />
                </div>
                <div>
                  <span className="text-[9px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
                    Café de Especialidad Boliviano
                  </span>
                  <h4 className="font-serif font-black text-xs text-white">
                    4 Llamas • Caranavi 1,700 msnm
                  </h4>
                  <span className="text-[10px] text-stone-300 block">Variedad Catuaí Lavado</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── 1.2. BANNER OFICIAL: LA CARTA FÍSICA AUTÉNTICA DE 6 PÁGINAS ── */}
      <section className="w-full bg-[#1E130C] text-white py-12 border-y border-amber-950/50 relative overflow-hidden flex flex-col items-center">
        {/* Patrón de fondo sutil */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D97706_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="bg-gradient-to-r from-[#991B24]/95 via-[#7F1D1D] to-[#1E130C] rounded-3xl p-6 sm:p-10 border-2 border-amber-500/30 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
            
            <div className="space-y-3.5 text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 border border-amber-400/30 text-amber-300 text-xs font-bold shadow-xs">
                <FileText size={14} />
                <span>Menú Oficial Impreso • Edición Fiel</span>
              </div>
              
              <h2 className="font-serif text-2xl sm:text-4xl font-black text-white leading-tight">
                La Carta Oficial de Dencker Coffee & Pan (6 Páginas)
              </h2>
              
              <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                Visualiza el menú físico auténtico tal como lo recibes impreso en nuestras mesas. Explora las 6 páginas completas en alta definición, o consulta el menú digital interactivo donde los precios se actualizan en vivo.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/menu-pdf"
                  onClick={() => soundManager.playPastryCrinkle()}
                  className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs sm:text-sm shadow-lg flex items-center gap-2 transition active:scale-95 cursor-pointer"
                >
                  <Eye size={16} />
                  <span>Ver las 6 Páginas Reales</span>
                </Link>

                <a
                  href="/menu-dencker.pdf"
                  download="MENU_DENCKER_OFICIAL.pdf"
                  onClick={() => soundManager.playPastryCrinkle()}
                  className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Download size={15} />
                  <span>Descargar Carta PDF</span>
                </a>

                <Link
                  href="/admin?tab=productos"
                  className="text-xs text-amber-200/80 hover:text-white underline underline-offset-4 ml-1 transition"
                >
                  Editar Precios en Admin ↗
                </Link>
              </div>
            </div>

            {/* Abanico Visual de las 6 Páginas del Menú Físico */}
            <div className="flex items-center -space-x-8 sm:-space-x-12 overflow-x-auto py-4 px-2 max-w-full">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <Link
                  key={num}
                  href="/menu-pdf"
                  onClick={() => soundManager.playPastryCrinkle()}
                  className="relative w-24 sm:w-28 h-36 sm:h-44 rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-300/40 transform hover:-translate-y-3 hover:scale-110 hover:z-20 transition-all duration-300 shrink-0 bg-white group cursor-pointer"
                  title={`Página ${num}: Ver en Menú Oficial`}
                >
                  <img
                    src={`/img/menu-pdf/page_${num}.png`}
                    alt={`Menú Oficial Página ${num}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-1 right-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/85 text-amber-300 border border-amber-500/30">
                    Pág {num}
                  </span>
                </Link>
              ))}
            </div>

          </div>

          {/* ── Banner de los 3 Emblemas Oficiales Dencker ── */}
          <div className="w-full mt-6 pt-6 border-t border-white/15 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Emblema 1 */}
            <div className="flex items-center gap-3.5 bg-black/35 p-3.5 rounded-2xl border border-white/10 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-white/10 p-1.5 flex items-center justify-center shrink-0 border border-white/10">
                <img
                  src="/img/brand/logo-1-chef-hat.svg"
                  alt="Sombrero Chef Dencker"
                  className="w-full h-full object-contain filter drop-shadow"
                />
              </div>
              <div className="text-left">
                <h4 className="font-serif font-bold text-xs text-amber-200 uppercase tracking-wider">Insignia Maestra</h4>
                <p className="text-[11px] text-stone-300">Sombrero Chef & Bigote Dencker</p>
              </div>
            </div>

            {/* Emblema 2 */}
            <div className="flex items-center gap-3.5 bg-black/35 p-3.5 rounded-2xl border border-white/10 shadow-sm">
              <div className="w-16 h-10 rounded-xl overflow-hidden shadow-sm shrink-0 border border-white/10">
                <img
                  src="/img/brand/logo-2-dencker-coffee-vintage.png"
                  alt="Boleto Vintage Dencker Coffee"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <h4 className="font-serif font-bold text-xs text-amber-200 uppercase tracking-wider">Boleto Clásico</h4>
                <p className="text-[11px] text-stone-300">Dencker Coffee & Panadería Vintage</p>
              </div>
            </div>

            {/* Emblema 3 */}
            <div className="flex items-center gap-3.5 bg-black/35 p-3.5 rounded-2xl border border-white/10 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-white/10 p-1 flex items-center justify-center shrink-0 border border-white/10">
                <img
                  src="/img/brand/logo-3-don-dencker-badge.png"
                  alt="Don Dencker Sello"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-left">
                <h4 className="font-serif font-bold text-xs text-amber-200 uppercase tracking-wider">Sello de Tradición</h4>
                <p className="text-[11px] text-stone-300">Don Dencker con Taza Humeante</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 1.5. ATENCIÓN FLEXIBLE: 4 MODALIDADES CLARAS (EN SALÓN / LLEVAR / DELIVERY / RESERVAS) ── */}
      <section className="w-full bg-[#F5EFEB] border-b border-[#EAE2D5] py-14 flex flex-col items-center">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 space-y-8">
          
          {/* Cabecera Limpia */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] uppercase font-bold tracking-widest text-[#991B24]">
                Atención Flexible • Dencker Pan
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E130C] tracking-tight">
                ¿Cómo deseas disfrutar hoy?
              </h2>
              <p className="text-xs sm:text-sm text-[#785E4F] max-w-xl">
                Tanto si estás sentado en nuestro salón, pasando de camino o descansando en casa:
              </p>
            </div>

            <a
              href="#catering"
              className="text-xs font-bold text-[#8C5332] hover:text-[#1E130C] transition flex items-center gap-1.5 shrink-0"
            >
              <Award size={14} className="text-[#C4844D]" />
              <span>¿Catering para eventos o defensas de grado? Cotiza aquí</span>
              <ArrowRight size={13} />
            </a>
          </div>

          {/* Grilla de 4 Tarjetas Cálidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Para Recoger (Takeaway) */}
            <div className="p-5 rounded-2xl bg-white border border-[#EAE2D5] shadow-xs hover:border-[#991B24]/60 transition flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#FDF6EE] text-[#991B24] flex items-center justify-center">
                    <Store size={20} />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FDF6EE] text-[#991B24]">
                    Sin Filas
                  </span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#1E130C]">
                    Para Recoger (Takeaway)
                  </h3>
                  <p className="text-xs text-[#785E4F] mt-1 leading-relaxed">
                    Pide antes de salir. Empacamos tus panes y café caliente para retirar directo por vitrina.
                  </p>
                </div>
                <div className="text-[10px] text-[#991B24] font-medium flex items-center gap-1.5 pt-1 border-t border-[#F5EFEB]">
                  <Clock size={12} />
                  <span>Tandas calientes 07:30 y 16:30</span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  soundManager.playPastryCrinkle();
                  const el = document.getElementById("catalogo");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-[#991B24] hover:bg-[#7F1D1D] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Pedir para Recoger</span>
                <ArrowRight size={13} />
              </motion.button>
            </div>

            {/* 2. Delivery Cochabamba */}
            <div className="p-5 rounded-2xl bg-white border border-[#EAE2D5] shadow-xs hover:border-[#D49B54]/60 transition flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#FDF8F3] text-[#D49B54] flex items-center justify-center border border-[#D49B54]/20">
                    <MapPin size={20} />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FDF8F3] text-[#8C5332]">
                    A tu Puerta
                  </span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#1E130C]">
                    Delivery Cochabamba
                  </h3>
                  <p className="text-xs text-[#785E4F] mt-1 leading-relaxed">
                    Hojaldres crujientes y café en moto directo a tu domicilio o lugar de trabajo.
                  </p>
                </div>
                <div className="text-[10px] text-[#785E4F] font-medium flex items-center gap-1.5 pt-1 border-t border-[#F5EFEB]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="truncate">Zona Norte, Cala Cala, Recoleta, Centro</span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  soundManager.playTactileClick();
                  const el = document.getElementById("catalogo");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-[#1E130C] hover:bg-[#322015] text-[#FAF7F2] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Pedir Delivery</span>
                <ArrowRight size={13} />
              </motion.button>
            </div>

            {/* 3. Autoservicio en Mesa (¿Ya estás sentado?) */}
            <div className="p-5 rounded-2xl bg-white border border-[#EAE2D5] shadow-xs hover:border-amber-500/60 transition flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#FDF8F3] text-amber-700 flex items-center justify-center">
                    <Utensils size={20} />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                    En Salón
                  </span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#1E130C]">
                    ¿Ya estás sentado?
                  </h3>
                  <p className="text-xs text-[#785E4F] mt-1 leading-relaxed">
                    Pide desde tu asiento sin esperar. Pulsa el número de tu mesa:
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
                      className="py-1 rounded-lg bg-[#FAF7F2] hover:bg-[#1E130C] hover:text-white border border-[#EAE2D5] text-[#1E130C] font-mono text-[11px] font-bold text-center transition"
                      title={`Ir a Mesa ${num}`}
                    >
                      M{num}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playTactileClick();
                    setModoModalMesero("llamado");
                    setModalMeseroAbierto(true);
                  }}
                  className="py-2 px-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F3ECE1] text-[#1E130C] border border-[#EAE2D5] text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Bell size={13} className="text-[#C4844D]" />
                  <span>Mesero</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundManager.playTactileClick();
                    setModoModalMesero("cuenta");
                    setModalMeseroAbierto(true);
                  }}
                  className="py-2 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Receipt size={13} className="text-amber-700" />
                  <span>Cuenta</span>
                </button>
              </div>
            </div>

            {/* 4. Reservar Mesa en Salón */}
            <div className="p-5 rounded-2xl bg-white border border-[#EAE2D5] shadow-xs hover:border-amber-400/60 transition flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center">
                    <Calendar size={20} />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900">
                    Anticipado
                  </span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#1E130C]">
                    Reservar Mesa
                  </h3>
                  <p className="text-xs text-[#785E4F] mt-1 leading-relaxed">
                    Asegura tu lugar en el Salón Principal o en la Terraza Jardín para brunches y tertulias.
                  </p>
                </div>
                <div className="text-[10px] text-[#785E4F] font-medium flex items-center gap-1.5 pt-1 border-t border-[#F5EFEB]">
                  <Users size={12} className="text-amber-800" />
                  <span>Mesas para 2, 4, 6 o grupos</span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  soundManager.playTactileClick();
                  setReservaModalOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-amber-50 text-amber-950 border border-amber-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Calendar size={13} />
                <span>Solicitar Reserva</span>
              </motion.button>
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

      {/* ── 3. CATÁLOGO EDITORIAL & COLECCIÓN DENCKER PAN (w-full bg-[#FAF7F2]) ── */}
      <section id="catalogo" className="w-full bg-[#FAF7F2] py-24 border-t border-[#EAE2D5] flex flex-col items-center">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 space-y-12">
          
          {/* Cabecera Editorial del Menú */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs uppercase font-bold tracking-widest text-[#991B24] bg-[#FDF6EE] px-4 py-1.5 rounded-full inline-block border border-[#991B24]/20 shadow-xs">
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
                        ? "bg-[#991B24] text-white shadow-sm"
                        : "text-[#785E4F] hover:text-[#1E130C]"
                    }`}
                  >
                    <Sparkles size={12} className="text-[#D97706]" />
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
                className="w-full pl-11 pr-10 py-3.5 rounded-[22px] bg-white border border-[#EAE2D5] shadow-xs text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#991B24] placeholder:text-[#A8988D] text-[#1E130C] transition"
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
                      ? "bg-[#991B24] text-white border-[#991B24] shadow-xs"
                      : "bg-white text-[#785E4F] border-[#EAE2D5] hover:border-[#991B24] hover:text-[#1E130C]"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Fila 4: Pestañas de Categoría con Mascotas Auténticas */}
            {(modoPresentacion === "categoria" || busqueda !== "") && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center pt-2">
                {[
                  { id: "todos", label: "Todos (114)", icon: UtensilsCrossed, sound: "tactile" },
                  { id: "c_desayunos", label: "Desayunos", mascot: DENCKER_ASSETS.mascotCroissant, sound: "pastry" },
                  { id: "c_cafes", label: "Cafés 4 Llamas", mascot: DENCKER_ASSETS.mascotCoffee, sound: "porcelain" },
                  { id: "c_dulces", label: "Pastelería & Tortas", mascot: DENCKER_ASSETS.mascotCroissant, sound: "pastry" },
                  { id: "c_saladas", label: "Masitas Saladas", icon: Flame, sound: "bread" },
                  { id: "c_sandwiches", label: "Sándwiches Gourmet", mascot: DENCKER_ASSETS.mascotBread, sound: "bread" },
                  { id: "c_pizzas", label: "Pizzas al Horno", mascot: DENCKER_ASSETS.mascotPizza, sound: "bread" },
                  { id: "c_jugos", label: "Bebidas & Frappés", icon: Droplets, sound: "tactile" },
                  { id: "favoritos", label: "Más Vendidos ★", icon: Star, sound: "tactile" },
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
                          ? "bg-[#991B24] text-white shadow-md border border-[#7F1D1D]"
                          : "bg-white text-[#785E4F] border border-[#EAE2D5] hover:bg-[#F5EFEB] hover:text-[#1E130C]"
                      }`}
                    >
                      {cat.mascot ? (
                        <img src={cat.mascot} alt={cat.label} className="w-5 h-5 object-contain" />
                      ) : (
                        Icon && <Icon size={14} className={isSel ? "text-amber-300" : "text-[#785E4F]"} />
                      )}
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
                    className="col-span-1 md:col-span-2 lg:col-span-2 md:row-span-2 group rounded-2xl overflow-hidden bg-gradient-to-br from-[#1A110B] via-[#241810] to-[#120B07] text-white p-8 border border-[#991B24]/40 shadow-xl flex flex-col justify-between relative hover:border-[#D97706]/60 transition-colors min-h-[460px]"
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
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#991B24]/40 text-[#FDF3E7] text-xs font-bold border border-[#991B24]/60 backdrop-blur-md">
                            <Sparkles size={13} className="text-[#D97706]" />
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
                          <Eye size={12} className={getVistaActual(starProduct.id) === "corte" ? "text-[#E6AE68]" : "text-[#D97706]"} />
                          <span>{getVistaActual(starProduct.id) === "corte" ? "Corte Interior" : "Exterior"}</span>
                        </button>
                      </div>

                      <h3
                        onClick={() => abrirModalProducto(starProduct)}
                        className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight cursor-pointer hover:text-[#FDF3E7] transition-colors"
                      >
                        {starProduct.nombre}
                      </h3>

                      <p className="text-[#D8C7B8] text-sm leading-relaxed">
                        Rueda de hojaldre francés laminada con 72 capas de mantequilla noble. Corazón untuoso de crema pastelera de pistacho de Bronte y topping de chocolate blanco belga con praliné tostado.
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[#D8C7B8]">
                        <span className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/10">Textura Ultra Crujiente</span>
                        <span className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/10">Horneado Diario</span>
                        <span className="px-2.5 py-1 rounded-xl bg-[#991B24]/30 text-[#FDF3E7] border border-[#991B24]/50">
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
                            className="w-8 h-8 rounded-xl bg-[#991B24] text-white flex items-center justify-center font-bold text-xs shadow-md cursor-pointer"
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
                          className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#991B24] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#991B24] text-white font-extrabold text-xs shadow-[0_6px_20px_rgba(82,121,83,0.4)] flex items-center gap-2 select-none cursor-pointer"
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
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#991B24]/20 text-[#D97706] text-xs font-bold border border-[#991B24]/30">
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
                      className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FDF3E7] text-xs font-bold border border-white/15 flex items-center gap-1.5 cursor-pointer"
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
                          <span className="p-1.5 rounded-xl bg-[#1E130C] text-[#FDF3E7]">
                            <SecIcon size={16} />
                          </span>
                          <span className="text-[11px] uppercase font-bold tracking-wider text-[#991B24] bg-[#FDF6EE] px-2.5 py-0.5 rounded-md">
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
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#991B24] hover:text-[#1E130C] transition py-1 cursor-pointer self-start sm:self-auto"
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
                                vistaActual === "corte" ? "opacity-100 scale-100" : "opacity-0 pointer-events-none"
                              }`}
                            />

                            {/* Overlay gradiente */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none" />

                            {/* Badges superiores con Pill Toggle de Doble Vista */}
                            <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20 pointer-events-auto">
                              <div>
                                {prod.es_mas_vendido ? (
                                  <span className="px-2.5 py-1 rounded-full bg-[#1E130C]/90 text-[#D97706] font-bold text-[10px] backdrop-blur-md border border-white/10 shadow-xs">
                                    ★ Destacado
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-md bg-black/50 text-white/80 font-medium text-[10px] backdrop-blur-sm">
                                    Artesanal
                                  </span>
                                )}
                              </div>

                              {/* Botón para alternar entre Vista Exterior y Corte Interior (Solo si existe vista interior auténtica) */}
                              {imgInterior !== imgExterior && (
                                <button
                                  type="button"
                                  onClick={(e) => toggleVistaProducto(prod.id, e)}
                                  className="px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md border flex items-center gap-1.5 transition-all cursor-pointer select-none bg-black/75 text-white hover:bg-black/90 border-amber-400/40 shadow-md"
                                  title="Alternar entre Vista Exterior y Corte Interior"
                                >
                                  <Eye size={11} className={vistaActual === "corte" ? "text-amber-300" : "text-amber-400"} />
                                  <span>{vistaActual === "corte" ? "Corte / Artesanal" : "Ver Corte"}</span>
                                </button>
                              )}
                            </div>

                            {/* Contenido en relative z-10 */}
                            <div className="relative z-10 space-y-2 text-white">
                              <h4
                                onClick={() => abrirModalProducto(prod)}
                                className="font-serif font-bold text-base sm:text-lg text-white hover:text-[#FDF3E7] transition cursor-pointer line-clamp-1"
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
                                      className="w-6 h-6 rounded-lg bg-[#991B24] text-white flex items-center justify-center font-bold text-xs cursor-pointer"
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
                                    <Plus size={13} className="text-[#D97706]" />
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
                <span className="text-xs text-[#991B24] font-semibold">
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
                    className="col-span-1 md:col-span-2 lg:col-span-2 md:row-span-2 group rounded-2xl overflow-hidden bg-gradient-to-br from-[#1A110B] via-[#241810] to-[#120B07] text-white p-8 border border-[#991B24]/40 shadow-xl flex flex-col justify-between relative hover:border-[#D97706]/60 transition-colors min-h-[460px]"
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
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#991B24]/40 text-[#FDF3E7] text-xs font-bold border border-[#991B24]/60 backdrop-blur-md">
                          <Sparkles size={13} className="text-[#D97706]" />
                          Insignia • Pistacho Siciliano
                        </span>

                        <button
                          type="button"
                          onClick={(e) => toggleVistaProducto(starProduct.id, e)}
                          className="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border flex items-center gap-1.5 transition-all cursor-pointer select-none bg-black/60 text-white hover:bg-black/80 border-white/20 shadow-md"
                        >
                          <Eye size={12} className={getVistaActual(starProduct.id) === "corte" ? "text-[#E6AE68]" : "text-[#D97706]"} />
                          <span>{getVistaActual(starProduct.id) === "corte" ? "Corte Interior" : "Exterior"}</span>
                        </button>
                      </div>

                      <h3
                        onClick={() => abrirModalProducto(starProduct)}
                        className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight cursor-pointer hover:text-[#FDF3E7] transition-colors"
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
                        className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#991B24] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#991B24] text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer"
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
                          vistaActual === "corte" ? "opacity-100 scale-100" : "opacity-0 pointer-events-none"
                        }`}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none" />

                      {/* Badges superiores con Pill Toggle de Doble Vista */}
                      <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20 pointer-events-auto">
                        <div>
                          {prod.es_mas_vendido && (
                            <span className="px-2.5 py-1 rounded-full bg-[#1E130C]/90 text-[#D97706] font-bold text-[10px] backdrop-blur-md border border-white/10 shadow-xs">
                              ★ Destacado
                            </span>
                          )}
                        </div>

                        {/* Botón para alternar entre Vista Exterior y Corte Interior (Solo si existe vista interior auténtica) */}
                        {imgInterior !== imgExterior && (
                          <button
                            type="button"
                            onClick={(e) => toggleVistaProducto(prod.id, e)}
                            className="px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md border flex items-center gap-1.5 transition-all cursor-pointer select-none bg-black/75 text-white hover:bg-black/90 border-amber-400/40 shadow-md"
                            title="Alternar entre Vista Exterior y Corte Interior"
                          >
                            <Eye size={11} className={vistaActual === "corte" ? "text-amber-300" : "text-amber-400"} />
                            <span>{vistaActual === "corte" ? "Corte / Artesanal" : "Ver Corte"}</span>
                          </button>
                        )}
                      </div>

                      {/* Contenido en relative z-10 */}
                      <div className="relative z-10 space-y-2 text-white">
                        <h4
                          onClick={() => abrirModalProducto(prod)}
                          className="font-serif font-bold text-base sm:text-lg text-white hover:text-[#FDF3E7] transition cursor-pointer line-clamp-1"
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
                                className="w-6 h-6 rounded-lg bg-[#991B24] text-white flex items-center justify-center font-bold text-xs cursor-pointer"
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
                              <Plus size={13} className="text-[#D97706]" />
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
              <span className="text-xs uppercase font-bold tracking-widest text-[#991B24] bg-[#FDF6EE] px-3.5 py-1.5 rounded-full inline-block border border-[#991B24]/20">
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
                        ? "bg-[#FAF7F2] border-[#991B24] ring-2 ring-[#991B24]/20 shadow-xs"
                        : "bg-[#FBF9F6] border-[#EAE2D5] hover:bg-[#F5EFEB]"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#991B24]/15 text-[#991B24] flex items-center justify-center mb-2">
                      <Icon size={16} />
                    </div>
                    <p className="font-bold text-xs text-[#1E130C]">{ev.label}</p>
                    <span className="text-xs font-mono font-bold text-[#991B24] block mt-1">
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
                className="px-6 py-2.5 rounded-2xl bg-[#991B24] hover:bg-[#7F1D1D] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
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
            <div className="pointer-events-auto bg-[#18100A]/95 backdrop-blur-2xl border border-[#991B24]/40 shadow-2xl rounded-full px-5 py-3 flex items-center gap-4 text-white">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-[#991B24] text-[#FAF7F2] font-bold text-xs flex items-center justify-center">
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
                <ArrowRight size={14} className="text-[#991B24]" />
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
                          ? "bg-[#991B24] text-white shadow-sm"
                          : "text-white/80 hover:text-white"
                      }`}
                    >
                      <Sparkles size={12} className="text-[#D97706]" />
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
                  className="w-full text-xs p-3 rounded-xl border border-[#EAE2D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#991B24]"
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
                <Plus size={16} className="text-[#D97706]" />
                <span>Agregar al Pedido • Bs {productoModal.precio.toFixed(2)}</span>
              </motion.button>
            </motion.div>
          </div>
        )}

        {/* Modal Llamar al Mesero / Traer Cuenta en Salón */}
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
                  <div className="w-10 h-10 rounded-2xl bg-[#D49B54]/20 border border-[#D49B54]/40 flex items-center justify-center text-[#E6AE68]">
                    {modoModalMesero === "cuenta" ? <Receipt size={20} /> : <Bell size={20} />}
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-bold">
                      {modoModalMesero === "cuenta" ? "Traer la Cuenta" : "Llamar al Mesero"}
                    </h3>
                    <p className="text-[11px] text-[#C9B8A6]">
                      {modoModalMesero === "cuenta"
                        ? "El mesero te llevará el ticket para pagar en tu mesa"
                        : "Atención inmediata en salón Dencker Pan"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setModalMeseroAbierto(false);
                    setAvisoMeseroEnviado(false);
                  }}
                  className="p-1.5 rounded-full hover:bg-white/10 text-[#C9B8A6] transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Selector de Modo: Asistencia vs Traer Cuenta */}
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/40 border border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playTactileClick();
                    setModoModalMesero("llamado");
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    modoModalMesero === "llamado"
                      ? "bg-[#D49B54] text-[#120D0A] shadow-md"
                      : "text-stone-300 hover:text-white"
                  }`}
                >
                  <Bell size={13} />
                  <span>Asistencia</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playTactileClick();
                    setModoModalMesero("cuenta");
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    modoModalMesero === "cuenta"
                      ? "bg-[#D49B54] text-[#120D0A] shadow-md"
                      : "text-stone-300 hover:text-white"
                  }`}
                >
                  <Receipt size={13} />
                  <span>Traer la Cuenta</span>
                </button>
              </div>

              {avisoMeseroEnviado ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                    <Check size={28} />
                  </div>
                  <h4 className="font-bold text-lg text-white">
                    {modoModalMesero === "cuenta"
                      ? "¡Aviso de cuenta enviado!"
                      : "¡Aviso enviado al personal!"}
                  </h4>
                  <p className="text-xs text-[#D8C7B8] max-w-xs mx-auto">
                    El mesero asignado se dirige a la{" "}
                    <strong className="text-[#E6AE68]">Mesa {mesaSeleccionadaAviso}</strong>{" "}
                    {modoModalMesero === "cuenta"
                      ? "con el ticket y tu forma de cobro."
                      : "en este instante."}
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

                  {modoModalMesero === "cuenta" && (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#E6AE68]">
                        ¿Cómo deseas pagar en la mesa?
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "efectivo", label: "Efectivo", icon: "💵" },
                          { id: "tarjeta", label: "Datáfono", icon: "💳" },
                          { id: "qr", label: "QR Simple", icon: "📱" },
                        ].map((met) => (
                          <button
                            key={met.id}
                            type="button"
                            onClick={() => {
                              soundManager.playTactileClick();
                              setMetodoPagoCuenta(met.id as any);
                            }}
                            className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                              metodoPagoCuenta === met.id
                                ? "bg-[#D49B54]/30 border-[#D49B54] text-white ring-1 ring-[#D49B54]"
                                : "bg-black/20 border-white/10 text-stone-300 hover:bg-black/40"
                            }`}
                          >
                            <div className="text-xl">{met.icon}</div>
                            <div className="text-[11px] font-bold mt-0.5">{met.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    transition={springPhysics}
                    onClick={() => handleLlamarMesero(mesaSeleccionadaAviso, modoModalMesero)}
                    className="w-full py-4 rounded-2xl bg-[#D49B54] hover:bg-[#E6AE68] text-[#120D0A] font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl shadow-[#D49B54]/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {modoModalMesero === "cuenta" ? <Receipt size={16} /> : <Bell size={16} />}
                    <span>
                      {modoModalMesero === "cuenta"
                        ? `Traer la Cuenta (Mesa ${mesaSeleccionadaAviso})`
                        : `Notificar al Mesero (Mesa ${mesaSeleccionadaAviso})`}
                    </span>
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
              className="relative w-full max-w-lg bg-gradient-to-b from-[#1C130D] to-[#120B07] border border-[#991B24]/40 rounded-3xl p-6 sm:p-7 shadow-[0_20px_70px_rgba(0,0,0,0.8)] z-10 text-white space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#991B24]/25 border border-[#991B24]/40 flex items-center justify-center text-[#D97706]">
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
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#FDF3E7] mb-1.5">
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
                              ? "bg-[#991B24] border-[#D97706] text-white shadow-md"
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
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#FDF3E7] mb-1.5">
                        Día:
                      </label>
                      <select
                        value={reservaData.fecha}
                        onChange={(e) => setReservaData({ ...reservaData, fecha: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-white/10 border border-white/15 text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#D97706]"
                      >
                        <option value="Hoy" className="bg-[#1C130D]">Hoy</option>
                        <option value="Mañana" className="bg-[#1C130D]">Mañana</option>
                        <option value="Este Fin de Semana" className="bg-[#1C130D]">Este Fin de Semana</option>
                        <option value="Próxima Semana" className="bg-[#1C130D]">Próxima Semana</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#FDF3E7] mb-1.5">
                        Turno / Hora:
                      </label>
                      <select
                        value={reservaData.hora}
                        onChange={(e) => setReservaData({ ...reservaData, hora: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-white/10 border border-white/15 text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#D97706]"
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
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#FDF3E7] mb-1.5">
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
                      className="w-full p-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#D97706]"
                    />
                    <input
                      type="tel"
                      placeholder="WhatsApp (ej. 76911000)"
                      value={reservaData.telefono}
                      onChange={(e) => setReservaData({ ...reservaData, telefono: e.target.value })}
                      className="w-full p-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#D97706]"
                    />
                  </div>

                  {/* Notas */}
                  <textarea
                    rows={2}
                    placeholder="Ocasión especial (cumpleaños, reunión) o requerimientos..."
                    value={reservaData.notas}
                    onChange={(e) => setReservaData({ ...reservaData, notas: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#D97706] resize-none"
                  />

                  {/* Botón Enviar */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    transition={springPhysics}
                    onClick={handleEnviarReserva}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#991B24] to-[#7F1D1D] hover:from-[#B91C1C] hover:to-[#7F1D1D] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl shadow-[#991B24]/25 flex items-center justify-center gap-2 cursor-pointer border border-[#D97706]/30"
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

      {/* ── 6.5. CASA MATRIZ & CAFÉ 4 LLAMAS DE ESPECIALIDAD ── */}
      <section id="ubicacion" className="w-full bg-[#FAF5EE] border-t border-[#EAE0D3] py-16 px-6 md:px-12 flex flex-col items-center">
        <div className="w-full max-w-7xl mx-auto space-y-12">
          
          {/* Encabezado con Don Dencker */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-[#E6D9C8] pb-8">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-20 h-24 sm:w-24 sm:h-28 shrink-0 flex items-center justify-center">
                <img
                  src="/img/brand/don-dencker-mascot-clean.png"
                  alt="Don Dencker - Mascota Oficial"
                  className="w-full h-full object-contain drop-shadow-md select-none transform hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest font-extrabold text-[#991B24] block">
                  Visítanos en Cochabamba
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-black text-[#1E130C] tracking-tight">
                  Nuestra Casa & Café de Especialidad
                </h2>
                <p className="text-xs sm:text-sm text-[#6E5547] mt-1">
                  Av. Daniel Salamanca, Cochabamba • Granos 4 Llamas de Caranavi (1,700 msnm)
                </p>
              </div>
            </div>

            <a
              href="https://maps.app.goo.gl/xn24aVhPQEC9dUf16"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-2xl bg-[#9E2A2B] hover:bg-[#832021] text-white font-bold text-xs shadow-md transition flex items-center gap-2 active:scale-95 shrink-0"
            >
              <MapPin size={16} />
              <span>Abrir en Google Maps</span>
              <ChevronRight size={14} />
            </a>
          </div>

          {/* Grid: Café 4 Llamas + Mapa Interactivo */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Columna Izquierda: Partner Oficial Café 4 Llamas (5 cols) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#2B1810] via-[#1E130C] to-[#140D08] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden border border-amber-900/40">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
                  <Coffee size={14} />
                  <span>Café de Especialidad Oficial</span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight">
                  4 Llamas <span className="text-amber-300 italic font-normal">— El Arte del Café</span>
                </h3>

                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  En Dencker Pan servimos exclusivamente café boliviano de origen único, cultivado en las alturas de Caranavi bajo sombra natural y tostado con precisión de autor.
                </p>

                {/* Ficha Técnica del Café (Alto Contraste y Tipografía Legible) */}
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/20 backdrop-blur-xs">
                      <span className="text-[11px] text-amber-300/80 block uppercase font-mono font-bold tracking-wider">Variedad</span>
                      <span className="text-base font-serif font-black text-white block mt-0.5">Catuaí Lavado</span>
                      <span className="text-[10.5px] text-stone-300 block">Grano 100% Arábica</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/20 backdrop-blur-xs">
                      <span className="text-[11px] text-amber-300/80 block uppercase font-mono font-bold tracking-wider">Altitud</span>
                      <span className="text-base font-serif font-black text-amber-300 block mt-0.5">1,700 msnm</span>
                      <span className="text-[10.5px] text-stone-300 block">Cosecha de altura</span>
                    </div>
                  </div>

                  {/* Notas de Cata Destacadas con Pills Sensoriales */}
                  <div className="p-4 rounded-2xl bg-black/50 border border-amber-500/30 backdrop-blur-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Sparkles size={13} className="text-amber-300" />
                        Notas de Cata Oficiales
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">Perfil Sensorial</span>
                    </div>
                    <p className="font-serif font-bold text-base text-white leading-snug">
                      Chocolate negro puro, naranja sutil y caramelo artesanal
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-200 text-xs font-semibold flex items-center gap-1">
                        🍫 Cacao 70%
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-200 text-xs font-semibold flex items-center gap-1">
                        🍊 Cítricos suaves
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-200 text-xs font-semibold flex items-center gap-1">
                        🍯 Caramelo tostado
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Imagen del empaque y sello de origen */}
              <div className="pt-6 mt-6 border-t border-amber-500/20 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden border-2 border-amber-400/50 shadow-md shrink-0 bg-stone-900 p-0.5">
                    <img
                      src="/img/brand/cafe-catuai-badge-hd.png"
                      alt="Sello Catuaí Lavado Caranavi"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="font-serif font-black text-base sm:text-lg text-white block leading-tight">
                      Zona Caranavi
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400 block mt-0.5">
                      Los Yungas &bull; La Paz, Bolivia
                    </span>
                    <span className="text-[11px] text-stone-300 block mt-0.5">
                      Tostado exclusivo para Dencker Pan
                    </span>
                  </div>
                </div>

                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-amber-400/50 shadow-2xl shrink-0 group relative">
                  <img
                    src="/img/products/cafe_4llamas_pack_gourmet.jpg"
                    alt="Café 4 Llamas Empaque Gourmet"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/75 backdrop-blur-xs text-[9px] font-mono text-amber-300 px-1.5 py-0.5 rounded font-bold">
                    250g / 1kg
                  </span>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Mapa Interactivo & Detalles de la Casa (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#E6D9C8] shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9E2A2B]">
                    <MapPin size={15} />
                    <span>Ubicación Exacta</span>
                  </div>
                  <span className="text-xs text-stone-400 font-mono">-17.38529, -66.15398</span>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl font-black text-stone-900">
                  Av. Daniel Salamanca, Cochabamba
                </h3>
                <p className="text-xs text-stone-600">
                  Estamos ubicados en una zona accesible y tranquila, con salón climatizado, terraza jardín y aroma a pan caliente recién horneado.
                </p>
              </div>

              {/* Contenedor del Mapa embebido */}
              <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-stone-200 shadow-inner relative group">
                <iframe
                  title="Ubicación Dencker Pan en Cochabamba"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.52554746146!2d-66.1565620248386!3d-17.385289483501247!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x93e375001993b041%3A0x99384f2150fd68a1!2sDencker%20Pan!5e0!3m2!1ses!2sbo!4v1714000000000!5m2!1ses!2sbo"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Servicios de la Casa */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                {[
                  { label: "Horario", val: "07:00 – 21:30" },
                  { label: "Salón", val: "Climatizado" },
                  { label: "Terraza", val: "Al aire libre" },
                  { label: "Wi-Fi", val: "Alta velocidad" },
                ].map((s, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-center">
                    <span className="text-[10px] text-stone-400 block font-bold uppercase">{s.label}</span>
                    <span className="text-xs font-bold text-stone-800">{s.val}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── 7. FOOTER EDITORIAL DE NUESTRA CASA & HORARIOS (w-full bg-[#120B07]) ── */}
      <footer id="contacto" className="w-full bg-[#120B07] border-t border-amber-900/30 text-stone-300 pt-16 pb-12">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Columna 1: Marca & Esencia */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center">
                  <img
                    src={DENCKER_ASSETS.logoLight}
                    alt="Don Dencker"
                    className="w-full h-full object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)] select-none"
                  />
                </div>
                <div>
                  <span className="font-serif font-black text-2xl sm:text-3xl text-white block tracking-wide">
                    Dencker Pan
                  </span>
                  <span className="text-xs text-amber-300 font-bold uppercase tracking-widest font-mono block mt-1">
                    Cochabamba • Bolivia
                  </span>
                  <span className="text-[11px] text-amber-200/80 font-sans block mt-0.5">
                    Masa Madre &bull; Café 4 Llamas de Especialidad
                  </span>
                </div>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                Panadería artesanal de fermentación lenta, pastelería francesa con mantequilla noble y café de especialidad de altura de los Yungas paceños.
              </p>
              <div className="flex items-center gap-2 text-xs text-amber-200">
                <Coffee size={14} className="text-amber-400" />
                <span>Horneado en vivo 3 tandas diarias</span>
              </div>
            </div>

            {/* Columna 2: Ubicación & Contacto */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider text-amber-100">
                Nuestra Casa
              </h4>
              <ul className="space-y-2.5 text-xs text-stone-400">
                <li className="flex items-start gap-2.5">
                  <MapPin size={15} className="text-amber-400 shrink-0 mt-0.5" />
                  <a
                    href="https://maps.app.goo.gl/xn24aVhPQEC9dUf16"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-300 transition underline underline-offset-2"
                  >
                    Av. Daniel Salamanca, Cochabamba, Bolivia (Ver en Google Maps ↗)
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Clock size={15} className="text-amber-400 shrink-0" />
                  <span>Lunes a Domingo: 07:00 – 21:30</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone size={15} className="text-amber-400 shrink-0" />
                  <span>+591 76911000</span>
                </li>
              </ul>
            </div>

            {/* Columna 3: Enlaces Rápidos */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider text-amber-100">
                Servicios & Menú
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#catalogo" className="hover:text-amber-300 transition">
                    • Catálogo de 240 Delicias
                  </a>
                </li>
                <li>
                  <a href="#catering" className="hover:text-amber-300 transition">
                    • Cotizador de Catering & Defensas
                  </a>
                </li>
                <li>
                  <Link href="/menu-pdf" target="_blank" className="hover:text-amber-300 transition">
                    • Menú Carta PDF Imprimible
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      soundManager.playTactileClick();
                      setReservaModalOpen(true);
                    }}
                    className="hover:text-amber-300 transition text-left cursor-pointer"
                  >
                    • Reservar Mesa en Salón
                  </button>
                </li>
              </ul>
            </div>

            {/* Columna 4: Pedidos Inmediatos */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider text-amber-100">
                Atención al Cliente
              </h4>
              <p className="text-xs text-stone-400">
                ¿Deseas encargar una torta entera, hojaldres o catering para eventos?
              </p>
              <a
                href={DENCKER_ASSETS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
              >
                <MessageCircle size={15} />
                <span>Escribir por WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Barra Inferior de Copyright & Acceso al Terminal */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
            <p>
              © 2026 Dencker Pan. Todos los derechos reservados. Cochabamba, Bolivia.
            </p>

            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-stone-500 hover:text-amber-300 transition-colors py-1 px-2.5 rounded-lg hover:bg-white/5"
              title="Terminal seguro de personal"
            >
              <Lock size={12} />
              <span>Acceso al Personal Operativo</span>
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

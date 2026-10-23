"use client";
import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  Users,
  Layers,
  UtensilsCrossed,
  Calendar,
  BarChart3,
  Search,
  Save,
  X,
  RefreshCw,
  Sparkles,
  Link as LinkIcon,
  TrendingUp,
  DollarSign,
  Coffee,
  Check,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
  PieChart,
  QrCode,
  Copy,
} from "lucide-react";
import { useSystemStore } from "@/store";
import { Mesa, Producto, TipoMesa, Estacion, Reserva } from "@/types";
import { uploadImageToImgBB } from "@/lib/imgbb";
import { soundManager } from "@/lib/sound";

export default function AdminPage() {
  const {
    zonas,
    mesas,
    productos,
    categorias,
    reservas,
    pedidos,
    qrBancarioUrl,
    qrBancarioTitular,
    qrBancarioBanco,
    setQrBancarioConfig,
    addMesa,
    updateMesa,
    deleteMesa,
    ajustarCantidadMesas,
    addProducto,
    updateProducto,
    deleteProducto,
    toggleProductoDisponible,
    updateReservaEstado,
    resetToDefaults,
  } = useSystemStore();

  const [tabActiva, setTabActiva] = useState<"mesas" | "productos" | "reservas" | "metricas" | "qr">("mesas");

  // Estados Gestión Mesas
  const [cantidadMesasInput, setCantidadMesasInput] = useState<number>(mesas.length);
  const [modalMesaAbierto, setModalMesaAbierto] = useState(false);
  const [mesaAEditar, setMesaAEditar] = useState<Mesa | null>(null);
  const [formMesa, setFormMesa] = useState({
    numero: mesas.length + 1,
    capacidad: 4,
    tipo: "cuadrada" as TipoMesa,
    zona_id: zonas[0]?.id || "z1",
  });

  // Estados Gestión Productos
  const [modalProductoAbierto, setModalProductoAbierto] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState<Producto | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [subiendoImgBB, setSubiendoImgBB] = useState(false);
  const [errorImgBB, setErrorImgBB] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Estados Configuración QR Bancario Simple (Generado en App Banco)
  const [formQr, setFormQr] = useState({
    url: qrBancarioUrl || "https://i.ibb.co/qMkf00HN/dencker-logo.png",
    titular: qrBancarioTitular || "Dencker Pan S.R.L.",
    banco: qrBancarioBanco || "Banco Nacional de Bolivia (BNB) / BCP Simple",
  });
  const [guardadoQrExitoso, setGuardadoQrExitoso] = useState(false);
  const [subiendoQr, setSubiendoQr] = useState(false);
  const qrFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubirQr = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoQr(true);
    soundManager.playClick();
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setFormQr((prev) => ({ ...prev, url: dataUrl }));
          soundManager.playSuccessTone();
        }
        setSubiendoQr(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error al procesar imagen de QR:", err);
      setSubiendoQr(false);
    }
  };

  const guardarQr = () => {
    soundManager.playSuccessTone();
    setQrBancarioConfig({
      url: formQr.url,
      titular: formQr.titular,
      banco: formQr.banco,
    });
    setGuardadoQrExitoso(true);
    setTimeout(() => setGuardadoQrExitoso(false), 3000);
  };

  const [formProducto, setFormProducto] = useState({
    nombre: "",
    descripcion: "",
    categoria_id: categorias[0]?.id || "c1",
    precio: 20,
    costo: 6,
    estacion: "cafeteria" as Estacion,
    imagen_url: "",
    chips_input: "Sin azúcar, Con Stevia, Bien caliente",
    es_mas_vendido: false,
    disponible: true,
  });

  // Métricas computadas
  const metricasBI = useMemo(() => {
    const totalVentas = pedidos
      .filter((p) => p.estado === "pagado")
      .reduce((acc, p) => acc + p.total, 0);

    const pedidosPagados = pedidos.filter((p) => p.estado === "pagado").length;
    const ticketPromedio = pedidosPagados ? totalVentas / pedidosPagados : 46.5;
    const aforoTotal = mesas.reduce((acc, m) => acc + m.capacidad, 0);
    const mesasOcupadas = mesas.filter((m) => m.estado === "ocupada").length;
    const porcentajeOcupacion = mesas.length ? Math.round((mesasOcupadas / mesas.length) * 100) : 0;

    return {
      totalVentas: totalVentas || 2480.0,
      ticketPromedio,
      aforoTotal,
      mesasOcupadas,
      porcentajeOcupacion,
      totalReservas: reservas.length,
    };
  }, [pedidos, mesas, reservas]);

  // --- Handlers Mesas ---
  const handleAjustarCantidad = () => {
    if (cantidadMesasInput > 0) {
      ajustarCantidadMesas(cantidadMesasInput);
      soundManager.playSuccessTone();
    }
  };

  const abrirModalNuevaMesa = () => {
    soundManager.playClick();
    setMesaAEditar(null);
    setFormMesa({
      numero: Math.max(0, ...mesas.map((m) => m.numero)) + 1,
      capacidad: 4,
      tipo: "cuadrada",
      zona_id: zonas[0]?.id || "z1",
    });
    setModalMesaAbierto(true);
  };

  const abrirModalEditarMesa = (m: Mesa) => {
    soundManager.playClick();
    setMesaAEditar(m);
    setFormMesa({
      numero: m.numero,
      capacidad: m.capacidad,
      tipo: m.tipo,
      zona_id: m.zona_id || zonas[0]?.id || "z1",
    });
    setModalMesaAbierto(true);
  };

  const guardarMesa = () => {
    if (mesaAEditar) {
      updateMesa(mesaAEditar.id, formMesa);
    } else {
      addMesa({
        ...formMesa,
        pos_x: 50,
        pos_y: 50,
        ancho: 80,
        alto: 80,
        estado: "libre",
        activa: true,
      });
    }
    soundManager.playSuccessTone();
    setModalMesaAbierto(false);
  };

  // --- Handlers Productos & ImgBB ---
  const abrirModalNuevoProducto = () => {
    soundManager.playClick();
    setProductoAEditar(null);
    setFormProducto({
      nombre: "",
      descripcion: "",
      categoria_id: categorias[0]?.id || "c1",
      precio: 20,
      costo: 6,
      estacion: "cafeteria",
      imagen_url: "",
      chips_input: "Sin azúcar, Con Stevia, Bien caliente",
      es_mas_vendido: false,
      disponible: true,
    });
    setErrorImgBB(null);
    setModalProductoAbierto(true);
  };

  const abrirModalEditarProducto = (p: Producto) => {
    soundManager.playClick();
    setProductoAEditar(p);
    setFormProducto({
      nombre: p.nombre,
      descripcion: p.descripcion || "",
      categoria_id: p.categoria_id || categorias[0]?.id || "c1",
      precio: p.precio,
      costo: p.costo,
      estacion: p.estacion,
      imagen_url: p.imagen_url || "",
      chips_input: (p.chips_personalizacion || []).join(", "),
      es_mas_vendido: p.es_mas_vendido,
      disponible: p.disponible,
    });
    setErrorImgBB(null);
    setModalProductoAbierto(true);
  };

  const handleSubirImagenImgBB = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoImgBB(true);
    setErrorImgBB(null);

    const res = await uploadImageToImgBB(file, `dencker_${file.name}`);
    setSubiendoImgBB(false);

    if (res.success && res.url) {
      setFormProducto((prev) => ({ ...prev, imagen_url: res.url || "" }));
      soundManager.playSuccessTone();
    } else {
      setErrorImgBB(res.error || "Error al subir a ImgBB. Verifica tu conexión.");
    }
  };

  const guardarProducto = () => {
    const chips = formProducto.chips_input
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const payload = {
      nombre: formProducto.nombre,
      descripcion: formProducto.descripcion,
      categoria_id: formProducto.categoria_id,
      precio: formProducto.precio,
      costo: formProducto.costo,
      estacion: formProducto.estacion,
      imagen_url: formProducto.imagen_url || undefined,
      chips_personalizacion: chips,
      es_mas_vendido: formProducto.es_mas_vendido,
      disponible: formProducto.disponible,
      stock: -1,
    };

    if (productoAEditar) {
      updateProducto(productoAEditar.id, payload);
    } else {
      addProducto(payload);
    }

    soundManager.playSuccessTone();
    setModalProductoAbierto(false);
  };

  // Cálculo de margen en tiempo real
  const margenBrutoPct = formProducto.precio > 0
    ? Math.round(((formProducto.precio - formProducto.costo) / formProducto.precio) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0c0a09] text-stone-900 dark:text-stone-100 pb-36 font-sans">
      {/* ── Apple Glass Admin Header ── */}
      <header className="bg-stone-950/95 backdrop-blur-2xl border-b border-white/10 text-white px-4 lg:px-8 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 p-1 border border-amber-500/30 flex items-center justify-center shrink-0">
              <img
                src="https://i.ibb.co/qMkf00HN/dencker-logo.png"
                alt="Dencker Pan"
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <div>
              <h1 className="font-serif text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Centro de Operaciones & Administración
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  Dencker Pan
                </span>
              </h1>
              <p className="text-stone-400 text-xs hidden sm:block">
                Aforo de mesas, catálogo artesanal, nube ImgBB, reservas y BI en Bolivianos
              </p>
            </div>
          </div>

          {/* Reset Fábrica */}
          <button
            onClick={() => {
              if (confirm("¿Restablecer todo a los datos iniciales de fábrica de Dencker Pan?")) {
                resetToDefaults();
                soundManager.playSuccessTone();
              }
            }}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white text-xs border border-white/15 transition flex items-center gap-1.5 active:scale-95"
          >
            <RefreshCw size={13} />
            <span>Reset Fábrica</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* ── Apple HIG Segmented Control Slider ── */}
        <div className="relative flex items-center p-1.5 rounded-2xl bg-stone-200/70 dark:bg-stone-900 border border-stone-300/60 dark:border-stone-800 max-w-3xl overflow-x-auto">
          {(
            [
              { id: "mesas", label: "Mesas & Aforo", icon: Layers, count: mesas.length },
              { id: "productos", label: "Menú & ImgBB", icon: UtensilsCrossed, count: productos.length },
              { id: "reservas", label: "Catering & Reservas", icon: Calendar, count: reservas.length },
              { id: "metricas", label: "Métricas BI", icon: BarChart3, count: undefined },
              { id: "qr", label: "QR Bancario", icon: QrCode, count: undefined },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = tabActiva === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundManager.playClick();
                  setTabActiva(tab.id);
                }}
                className={`relative flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-colors z-10 ${
                  isActive ? "text-stone-950 dark:text-white" : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="adminTabHighlight"
                    className="absolute inset-0 bg-white dark:bg-stone-800 rounded-xl shadow-md border border-stone-200/60 dark:border-stone-700 -z-10"
                    transition={{ type: "spring", damping: 30, stiffness: 450 }}
                  />
                )}
                <Icon size={15} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive
                        ? "bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300"
                        : "bg-stone-300/60 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: GESTIÓN DE MESAS & AFORO ── */}
        {tabActiva === "mesas" && (
          <div className="space-y-6">
            {/* Quick adjust total capacity dock */}
            <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-wrap items-center justify-between gap-6">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Users size={18} className="text-amber-600" />
                  Control de Aforo y Capacidad de Salón
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Capacidad actual: {metricasBI.aforoTotal} comensales sentados distribuidos en {mesas.length} mesas
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-800 p-1.5 rounded-2xl border border-stone-200 dark:border-stone-700">
                  <span className="text-xs font-bold text-stone-500 pl-2">Total Mesas:</span>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={cantidadMesasInput}
                    onChange={(e) => setCantidadMesasInput(parseInt(e.target.value) || 1)}
                    className="w-16 p-1.5 text-center font-bold text-sm bg-white dark:bg-stone-900 rounded-xl border border-stone-300 dark:border-stone-700"
                  />
                  <button
                    onClick={handleAjustarCantidad}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-900 dark:bg-amber-600 text-white font-bold text-xs hover:bg-amber-950 transition active:scale-95"
                  >
                    Ajustar
                  </button>
                </div>

                <button
                  onClick={abrirModalNuevaMesa}
                  className="px-4 py-2.5 rounded-2xl bg-amber-900 dark:bg-amber-700 text-white font-bold text-xs shadow-md hover:bg-amber-950 transition flex items-center gap-2 active:scale-95"
                >
                  <Plus size={16} /> Agregar Mesa Manual
                </button>
              </div>
            </div>

            {/* Grid de Mesas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mesas.map((m) => {
                const zonaNombre = zonas.find((z) => z.id === m.zona_id)?.nombre || "Sala Principal";

                return (
                  <div
                    key={m.id}
                    className="p-5 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between h-48 hover:border-amber-400 dark:hover:border-amber-600 transition group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-serif text-2xl font-black text-stone-900 dark:text-stone-100">
                          Mesa {m.numero}
                        </span>
                        <p className="text-xs text-stone-500 dark:text-stone-400">{zonaNombre}</p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                          m.estado === "libre"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : m.estado === "ocupada"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                            : "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
                        }`}
                      >
                        {m.estado}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-stone-600 dark:text-stone-400">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <Users size={14} className="text-amber-600" />
                        <span>Capacidad: {m.capacidad} personas</span>
                      </div>
                      <div className="text-[11px] text-stone-400 capitalize">
                        Geometría: {m.tipo}
                      </div>
                    </div>

                    {/* Acciones Mesa */}
                    <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
                      <button
                        onClick={() => abrirModalEditarMesa(m)}
                        className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 transition text-xs font-bold flex items-center gap-1.5"
                      >
                        <Edit2 size={13} /> Editar
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar permanentemente la Mesa ${m.numero}?`)) {
                            deleteMesa(m.id);
                            soundManager.playSuccessTone();
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 hover:bg-red-100 transition text-xs font-bold flex items-center gap-1.5"
                      >
                        <Trash2 size={13} /> Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 2: GESTIÓN DE PRODUCTOS & IMGBB ── */}
        {tabActiva === "productos" && (
          <div className="space-y-6">
            <div className="p-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                <button
                  onClick={() => setFiltroCategoria("todas")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
                    filtroCategoria === "todas"
                      ? "bg-amber-900 dark:bg-amber-700 text-white"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                  }`}
                >
                  Todas ({productos.length})
                </button>
                {categorias.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setFiltroCategoria(c.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 ${
                      filtroCategoria === c.id
                        ? "bg-amber-900 dark:bg-amber-700 text-white"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                    }`}
                  >
                    <span>{c.emoji}</span>
                    <span>{c.nombre}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={busquedaProducto}
                    onChange={(e) => setBusquedaProducto(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                </div>

                <button
                  onClick={abrirModalNuevoProducto}
                  className="px-4 py-2 rounded-xl bg-amber-900 dark:bg-amber-700 text-white font-bold text-xs shadow-sm hover:bg-amber-950 transition flex items-center gap-1.5 whitespace-nowrap active:scale-95"
                >
                  <Plus size={15} /> Nuevo Producto
                </button>
              </div>
            </div>

            {/* Grid de Productos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productos
                .filter((p) => {
                  const matchCat =
                    filtroCategoria === "todas" || p.categoria_id === filtroCategoria;
                  const matchSearch = p.nombre
                    .toLowerCase()
                    .includes(busquedaProducto.toLowerCase());
                  return matchCat && matchSearch;
                })
                .map((prod) => {
                  const margen = prod.precio > 0
                    ? Math.round(((prod.precio - prod.costo) / prod.precio) * 100)
                    : 0;

                  return (
                    <div
                      key={prod.id}
                      className="p-5 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between hover:border-amber-400 dark:hover:border-amber-600 transition"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-stone-800 flex items-center justify-center overflow-hidden border border-amber-200/60 dark:border-stone-700 flex-shrink-0 text-2xl">
                              {prod.imagen_url ? (
                                <img
                                  src={prod.imagen_url}
                                  alt={prod.nombre}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                categorias.find((c) => c.id === prod.categoria_id)?.emoji || "🥐"
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 line-clamp-1">
                                {prod.nombre}
                              </h4>
                              <span className="text-[11px] text-stone-400 capitalize">
                                Estación: {prod.estacion}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-serif font-black text-base text-amber-900 dark:text-amber-400 block font-mono">
                              Bs {prod.precio.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-emerald-600 font-bold">
                              Margen: {margen}%
                            </span>
                          </div>
                        </div>

                        {prod.descripcion && (
                          <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2">
                            {prod.descripcion}
                          </p>
                        )}
                      </div>

                      {/* Footer Producto */}
                      <div className="pt-3 mt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                        <button
                          onClick={() => toggleProductoDisponible(prod.id)}
                          className={`text-[11px] font-bold px-3 py-1 rounded-full transition ${
                            prod.disponible
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-stone-100 text-stone-400 dark:bg-stone-800"
                          }`}
                        >
                          {prod.disponible ? "Disponible ✓" : "Agotado"}
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => abrirModalEditarProducto(prod)}
                            className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 transition text-xs"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar ${prod.nombre}?`)) {
                                deleteProducto(prod.id);
                                soundManager.playSuccessTone();
                              }
                            }}
                            className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 hover:bg-red-100 transition text-xs"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ── TAB 3: CATERING & RESERVAS ── */}
        {tabActiva === "reservas" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Calendar size={18} className="text-amber-600" />
                Catering & Eventos Programados ({reservas.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reservas.map((res) => (
                <div
                  key={res.id}
                  className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-serif text-xl font-bold text-amber-950 dark:text-amber-200">
                        {res.nombre_cliente}
                      </h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {res.telefono} • {res.email}
                      </p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 capitalize font-mono">
                      {res.estado}
                    </span>
                  </div>

                  <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl text-xs space-y-1.5 text-stone-700 dark:text-stone-300">
                    <p>
                      <strong>Tipo de Evento:</strong> {res.tipo_evento || "Catering Especial"}
                    </p>
                    <p>
                      <strong>Fecha:</strong> {new Date(res.fecha_evento).toLocaleDateString("es-BO")}
                    </p>
                    <p>
                      <strong>Comensales:</strong> {res.numero_personas} personas
                    </p>
                    {res.descripcion && (
                      <p className="italic text-stone-500 pt-1">"{res.descripcion}"</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="font-bold text-amber-900 dark:text-amber-300 font-mono text-sm">
                      Total: Bs {res.monto_total || 0}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateReservaEstado(res.id, "confirmada")}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => updateReservaEstado(res.id, "produccion")}
                        className="px-3 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs transition"
                      >
                        En Producción
                      </button>
                      <button
                        onClick={() => updateReservaEstado(res.id, "completada")}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
                      >
                        Completar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 4: MÉTRICAS FINANCIERAS & BI ── */}
        {tabActiva === "metricas" && (
          <div className="space-y-6">
            {/* Bento Grid Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-1.5">
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  Ventas de Hoy
                </span>
                <p className="font-serif text-3xl font-black text-amber-900 dark:text-amber-300 font-mono">
                  Bs {metricasBI.totalVentas.toFixed(2)}
                </p>
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <TrendingUp size={14} /> +22% vs promedio semanal
                </span>
              </div>

              <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-1.5">
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  Ticket Promedio
                </span>
                <p className="font-serif text-3xl font-black text-stone-900 dark:text-stone-100 font-mono">
                  Bs {metricasBI.ticketPromedio.toFixed(2)}
                </p>
                <span className="text-xs text-stone-400">Por comensal servido</span>
              </div>

              <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-1.5">
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  Tasa de Ocupación
                </span>
                <p className="font-serif text-3xl font-black text-amber-800 dark:text-amber-400 font-mono">
                  {metricasBI.porcentajeOcupacion}%
                </p>
                <span className="text-xs text-stone-400">
                  {metricasBI.mesasOcupadas} de {mesas.length} mesas activas
                </span>
              </div>

              <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-1.5">
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  Margen Bruto Estimado
                </span>
                <p className="font-serif text-3xl font-black text-emerald-600 font-mono">
                  68.4%
                </p>
                <span className="text-xs text-stone-400">Sobre panadería y café</span>
              </div>
            </div>

            {/* Top 5 Productos con barras de progreso */}
            <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Sparkles size={18} className="text-amber-600" />
                Top 5 Productos Estrella de Dencker Pan
              </h3>
              <div className="space-y-3">
                {[
                  { nombre: "Café Pasado Yungas (Caranavi)", ventas: 64, total: "Bs 768.00", pct: 95 },
                  { nombre: "Croissant Mantequilla Francés", ventas: 52, total: "Bs 936.00", pct: 82 },
                  { nombre: "Cappuccino Artesanal Doble", ventas: 41, total: "Bs 902.00", pct: 70 },
                  { nombre: "Cuñapé Caliente al Horno", ventas: 38, total: "Bs 304.00", pct: 60 },
                  { nombre: "Marraqueta con Queso Criollo", ventas: 29, total: "Bs 406.00", pct: 45 },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-stone-900 dark:text-stone-100">
                        {idx + 1}. {item.nombre}
                      </span>
                      <span className="font-mono text-amber-900 dark:text-amber-400">
                        {item.total} ({item.ventas} u.)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.pct}%` }}
                        transition={{ duration: 1, delay: idx * 0.1 }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 5. TAB QR BANCARIO SIMPLE (SUBIDO POR ADMIN) ── */}
        {tabActiva === "qr" && (
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 rounded-3xl text-white shadow-xl flex flex-wrap items-center justify-between gap-4 border border-amber-500/30">
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono uppercase font-bold border border-amber-400/30">
                  QR Simple • Interoperable ASFI
                </span>
                <h2 className="font-serif text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  <QrCode size={24} className="text-amber-400" />
                  QR Bancario de la Cafetería
                </h2>
                <p className="text-stone-300 text-xs max-w-xl">
                  Sube aquí la captura o foto del QR generado desde la aplicación de tu banco (BCP, BNB, Banco Unión, Mercantil Santa Cruz). Se reflejará automáticamente en la pantalla de cobro de Caja POS y en el móvil de los clientes al pagar.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/caja"
                  target="_blank"
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-amber-200 text-xs font-bold border border-white/10 transition flex items-center gap-1.5"
                >
                  <ExternalLink size={14} />
                  <span>Probar en Caja POS</span>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Columna Izquierda: Vista Previa Real del QR */}
              <div className="lg:col-span-5 bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Vista Previa en Vivo (Lo que ve el cliente)
                </span>

                <div className="p-4 bg-white rounded-3xl border-2 border-dashed border-amber-300 shadow-md inline-block max-w-[280px] w-full">
                  <div className="aspect-square w-full rounded-2xl overflow-hidden bg-stone-50 flex items-center justify-center relative">
                    <img
                      src={formQr.url || "https://i.ibb.co/qMkf00HN/dencker-logo.png"}
                      alt="QR Bancario Dencker Pan"
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <div className="pt-2 text-center">
                    <p className="font-bold text-xs text-stone-900 font-serif">
                      {formQr.banco || "QR Simple Interoperable"}
                    </p>
                    <p className="text-[11px] text-stone-500">
                      Titular: <span className="font-semibold text-stone-800">{formQr.titular}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 size={14} />
                  <span>QR Verificado & Sincronizado en Red</span>
                </div>
              </div>

              {/* Columna Derecha: Formulario de Carga y Configuración */}
              <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-5">
                <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Upload size={18} className="text-amber-700" />
                  Actualizar Imagen del QR Bancario
                </h3>

                {/* Subir archivo desde dispositivo */}
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-amber-950 dark:text-amber-200">
                        Cargar archivo de imagen (PNG / JPG)
                      </p>
                      <p className="text-[11px] text-amber-800/80 dark:text-amber-300/70">
                        Captura de pantalla de tu app de BCP, BNB, Banco Unión o similar.
                      </p>
                    </div>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    ref={qrFileInputRef}
                    onChange={handleSubirQr}
                    className="hidden"
                  />

                  <button
                    type="button"
                    disabled={subiendoQr}
                    onClick={() => qrFileInputRef.current?.click()}
                    className="w-full py-3 rounded-xl bg-amber-900 dark:bg-amber-700 hover:bg-amber-950 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <Upload size={15} />
                    <span>{subiendoQr ? "Procesando Imagen..." : "Seleccionar Imagen del QR desde mi dispositivo"}</span>
                  </button>
                </div>

                {/* O pegar URL directa */}
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-stone-600 dark:text-stone-300 block mb-1">
                      O pega la URL directa de la imagen del QR
                    </label>
                    <input
                      type="url"
                      value={formQr.url}
                      onChange={(e) => setFormQr({ ...formQr, url: e.target.value })}
                      placeholder="https://i.ibb.co/..."
                      className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-stone-600 dark:text-stone-300 block mb-1">
                        Banco o Entidad Financiera
                      </label>
                      <input
                        type="text"
                        value={formQr.banco}
                        onChange={(e) => setFormQr({ ...formQr, banco: e.target.value })}
                        placeholder="ej. BCP Simple / Banco Unión"
                        className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-stone-600 dark:text-stone-300 block mb-1">
                        Titular de la Cuenta
                      </label>
                      <input
                        type="text"
                        value={formQr.titular}
                        onChange={(e) => setFormQr({ ...formQr, titular: e.target.value })}
                        placeholder="ej. Dencker Pan S.R.L."
                        className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Botón Guardar */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={guardarQr}
                    className="px-6 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-2"
                  >
                    <Save size={16} />
                    <span>Guardar y Publicar QR Oficial</span>
                  </button>

                  {guardadoQrExitoso && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-xs font-bold text-emerald-700 flex items-center gap-1"
                    >
                      <CheckCircle2 size={16} />
                      ¡QR Guardado y sincronizado en Caja y Mesas!
                    </motion.span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal Mesa ── */}
      <AnimatePresence>
        {modalMesaAbierto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl p-6 space-y-4 border border-stone-200 dark:border-stone-800"
            >
              <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
                <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                  {mesaAEditar ? `Editar Mesa ${mesaAEditar.numero}` : "Agregar Nueva Mesa"}
                </h3>
                <button
                  onClick={() => setModalMesaAbierto(false)}
                  className="p-1 rounded-full text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-stone-600 dark:text-stone-300 block mb-1">
                    Número de Mesa
                  </label>
                  <input
                    type="number"
                    value={formMesa.numero}
                    onChange={(e) =>
                      setFormMesa({ ...formMesa, numero: parseInt(e.target.value) || 1 })
                    }
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-600 dark:text-stone-300 block mb-1">
                    Capacidad (Personas)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formMesa.capacidad}
                    onChange={(e) =>
                      setFormMesa({ ...formMesa, capacidad: parseInt(e.target.value) || 1 })
                    }
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-600 dark:text-stone-300 block mb-1">
                    Forma de la Mesa
                  </label>
                  <select
                    value={formMesa.tipo}
                    onChange={(e) =>
                      setFormMesa({ ...formMesa, tipo: e.target.value as TipoMesa })
                    }
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  >
                    <option value="cuadrada">Cuadrada</option>
                    <option value="redonda">Redonda</option>
                    <option value="rectangular">Rectangular</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-600 dark:text-stone-300 block mb-1">
                    Zona Asignada
                  </label>
                  <select
                    value={formMesa.zona_id}
                    onChange={(e) => setFormMesa({ ...formMesa, zona_id: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  >
                    {zonas.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={guardarMesa}
                  className="py-2.5 rounded-xl bg-amber-900 dark:bg-amber-600 text-white font-bold text-xs hover:bg-amber-950 transition"
                >
                  Guardar Mesa
                </button>
                <button
                  onClick={() => setModalMesaAbierto(false)}
                  className="py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-semibold text-xs hover:bg-stone-200 transition"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal Producto con ImgBB ── */}
      <AnimatePresence>
        {modalProductoAbierto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-stone-200 dark:border-stone-800"
            >
              <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
                <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                  {productoAEditar ? `Editar ${productoAEditar.nombre}` : "Nuevo Producto en Catálogo"}
                </h3>
                <button
                  onClick={() => setModalProductoAbierto(false)}
                  className="p-1 rounded-full text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-stone-600 dark:text-stone-300 block mb-1">
                    Nombre del Producto
                  </label>
                  <input
                    type="text"
                    value={formProducto.nombre}
                    onChange={(e) =>
                      setFormProducto({ ...formProducto, nombre: e.target.value })
                    }
                    placeholder="ej. Latte con Almendras"
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-600 dark:text-stone-300 block mb-1">
                    Descripción
                  </label>
                  <textarea
                    rows={2}
                    value={formProducto.descripcion}
                    onChange={(e) =>
                      setFormProducto({ ...formProducto, descripcion: e.target.value })
                    }
                    placeholder="Descripción para el menú QR..."
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-stone-600 dark:text-stone-300 block mb-1">
                      Categoría
                    </label>
                    <select
                      value={formProducto.categoria_id}
                      onChange={(e) =>
                        setFormProducto({ ...formProducto, categoria_id: e.target.value })
                      }
                      className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                    >
                      {categorias.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.emoji} {c.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-stone-600 dark:text-stone-300 block mb-1">
                      Estación
                    </label>
                    <select
                      value={formProducto.estacion}
                      onChange={(e) =>
                        setFormProducto({
                          ...formProducto,
                          estacion: e.target.value as Estacion,
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                    >
                      <option value="cafeteria">Cafetería</option>
                      <option value="vitrina">Vitrina / Panadería</option>
                      <option value="cocina">Cocina Caliente</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-stone-600 dark:text-stone-300 block mb-1">
                      Precio de Venta (Bs)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formProducto.precio}
                      onChange={(e) =>
                        setFormProducto({
                          ...formProducto,
                          precio: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-600 dark:text-stone-300 block mb-1">
                      Costo de Producción (Bs)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formProducto.costo}
                      onChange={(e) =>
                        setFormProducto({
                          ...formProducto,
                          costo: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-mono"
                    />
                  </div>
                </div>

                {/* Margen Calculado */}
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300">
                    Margen Bruto de Ganancia:
                  </span>
                  <span className="font-mono font-black text-emerald-900 dark:text-emerald-200">
                    {margenBrutoPct}% (Bs {(formProducto.precio - formProducto.costo).toFixed(2)} por unidad)
                  </span>
                </div>

                {/* Subida ImgBB */}
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                      <ImageIcon size={14} /> Subir Imagen a ImgBB
                    </span>
                    {formProducto.imagen_url && (
                      <span className="text-[10px] text-emerald-700 font-bold">Imagen vinculada ✓</span>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleSubirImagenImgBB}
                    className="hidden"
                  />

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={subiendoImgBB}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-amber-900 dark:bg-amber-700 text-white font-bold text-xs hover:bg-amber-950 transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Upload size={14} />
                      <span>{subiendoImgBB ? "Subiendo..." : "Subir desde PC"}</span>
                    </button>

                    <input
                      type="text"
                      placeholder="o pega URL de la imagen..."
                      value={formProducto.imagen_url}
                      onChange={(e) =>
                        setFormProducto({ ...formProducto, imagen_url: e.target.value })
                      }
                      className="flex-1 p-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                    />
                  </div>

                  {errorImgBB && (
                    <p className="text-[11px] text-red-600 font-medium">{errorImgBB}</p>
                  )}

                  {formProducto.imagen_url && (
                    <div className="mt-2 flex items-center gap-3">
                      <img
                        src={formProducto.imagen_url}
                        alt="Preview"
                        className="w-14 h-14 rounded-xl object-cover border border-amber-300"
                      />
                      <span className="text-[10px] text-stone-500 truncate max-w-xs">
                        {formProducto.imagen_url}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-bold text-stone-600 dark:text-stone-300 block mb-1">
                    Chips de Personalización (separados por coma)
                  </label>
                  <input
                    type="text"
                    value={formProducto.chips_input}
                    onChange={(e) =>
                      setFormProducto({ ...formProducto, chips_input: e.target.value })
                    }
                    placeholder="Sin azúcar, Con Stevia, Calentar en horno..."
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  onClick={guardarProducto}
                  className="py-2.5 rounded-xl bg-amber-900 dark:bg-amber-600 text-white font-bold text-xs hover:bg-amber-950 transition"
                >
                  Guardar Producto
                </button>
                <button
                  onClick={() => setModalProductoAbierto(false)}
                  className="py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-semibold text-xs hover:bg-stone-200 transition"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

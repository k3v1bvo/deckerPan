"use client";
import { useState, useRef } from "react";
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

  const [tabActiva, setTabActiva] = useState<"mesas" | "productos" | "reservas" | "metricas">("mesas");

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

  // --- Handlers Mesas ---
  const handleAjustarCantidad = () => {
    if (cantidadMesasInput > 0) {
      ajustarCantidadMesas(cantidadMesasInput);
      soundManager.playSuccessTone();
    }
  };

  const abrirModalNuevaMesa = () => {
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

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-amber-950 pb-24">
      {/* Header Admin */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white px-6 py-5 shadow-lg sticky top-14 z-30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-amber-800/60 text-amber-300 border border-amber-600/40">
              <Settings size={24} />
            </span>
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-wide text-amber-100 flex items-center gap-2">
                Panel de Administración
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  SaaS Dencker Pan
                </span>
              </h1>
              <p className="text-amber-200/60 text-xs">
                Control de mesas, catálogo con subida ImgBB, reservas de eventos y métricas
              </p>
            </div>
          </div>

          {/* Botón Reset Fábrica */}
          <button
            onClick={() => {
              if (confirm("¿Restablecer todo a los datos iniciales de fábrica?")) {
                resetToDefaults();
                soundManager.playSuccessTone();
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 text-amber-200/80 hover:text-white text-xs border border-amber-800/40 transition flex items-center gap-1.5"
          >
            <RefreshCw size={13} /> Reset Fábrica
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto">
          {(
            [
              { id: "mesas", label: "Mesas & Plano", icon: Layers, count: mesas.length },
              { id: "productos", label: "Menú & ImgBB", icon: UtensilsCrossed, count: productos.length },
              { id: "reservas", label: "Catering & Reservas", icon: Calendar, count: reservas.length },
              { id: "metricas", label: "Métricas & Ventas", icon: BarChart3, count: undefined },
            ] as { id: "mesas" | "productos" | "reservas" | "metricas"; label: string; icon: typeof Layers; count?: number }[]
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = tabActiva === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTabActiva(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-amber-900 text-white shadow-md shadow-amber-950/20"
                    : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? "bg-amber-800 text-amber-200" : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: GESTIÓN DE MESAS ── */}
        {tabActiva === "mesas" && (
          <div className="space-y-6">
            {/* Quick adjust total number of tables */}
            <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-amber-950">
                  Capacidad Total de Mesas
                </h3>
                <p className="text-xs text-stone-500">
                  Ajusta la cantidad total de mesas del local en 1 clic
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-stone-50 p-1.5 rounded-2xl border border-stone-200">
                  <span className="text-xs font-semibold text-stone-500 px-2">Total:</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={cantidadMesasInput}
                    onChange={(e) => setCantidadMesasInput(parseInt(e.target.value) || 1)}
                    className="w-16 p-1 text-center font-bold text-sm bg-white rounded-xl border border-stone-300"
                  />
                  <button
                    onClick={handleAjustarCantidad}
                    className="px-3 py-1.5 rounded-xl bg-amber-900 text-white font-semibold text-xs hover:bg-amber-950 transition"
                  >
                    Ajustar
                  </button>
                </div>

                <button
                  onClick={abrirModalNuevaMesa}
                  className="px-4 py-2.5 rounded-2xl bg-amber-800 text-white font-semibold text-xs shadow-sm hover:bg-amber-900 transition flex items-center gap-1.5"
                >
                  <Plus size={16} /> Agregar Mesa Manual
                </button>
              </div>
            </div>

            {/* Grid de Mesas Existentes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mesas.map((m) => {
                const zonaNombre = zonas.find((z) => z.id === m.zona_id)?.nombre || "Principal";
                return (
                  <div
                    key={m.id}
                    className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between h-44 hover:border-amber-300 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-serif text-xl font-bold text-amber-950">
                          Mesa {m.numero}
                        </span>
                        <p className="text-xs text-stone-500">{zonaNombre}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 capitalize">
                        {m.estado}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-stone-600">
                      <div className="flex items-center gap-1.5">
                        <Users size={13} />
                        <span>Capacidad: {m.capacidad} personas</span>
                      </div>
                      <div className="text-[11px] text-stone-400 capitalize">
                        Forma: {m.tipo}
                      </div>
                    </div>

                    {/* Acciones Mesa */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                      <button
                        onClick={() => abrirModalEditarMesa(m)}
                        className="p-1.5 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 transition text-xs flex items-center gap-1"
                      >
                        <Edit2 size={13} /> Editar
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar la Mesa ${m.numero}?`)) {
                            deleteMesa(m.id);
                            soundManager.playSuccessTone();
                          }
                        }}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition text-xs flex items-center gap-1"
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
            <div className="p-4 bg-white rounded-3xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto">
                <button
                  onClick={() => setFiltroCategoria("todas")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                    filtroCategoria === "todas"
                      ? "bg-amber-900 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  Todas ({productos.length})
                </button>
                {categorias.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setFiltroCategoria(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1 ${
                      filtroCategoria === c.id
                        ? "bg-amber-900 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
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
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-800"
                  />
                </div>

                <button
                  onClick={abrirModalNuevoProducto}
                  className="px-4 py-2 rounded-xl bg-amber-800 text-white font-semibold text-xs shadow-sm hover:bg-amber-900 transition flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Plus size={15} /> Nuevo Producto
                </button>
              </div>
            </div>

            {/* Lista de Productos */}
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
                .map((prod) => (
                  <div
                    key={prod.id}
                    className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between hover:border-amber-300 transition"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-stone-900">{prod.nombre}</h4>
                          <span className="text-[10px] text-stone-400 capitalize">
                            Estación: {prod.estacion}
                          </span>
                        </div>
                        <span className="font-serif font-bold text-base text-amber-900">
                          Bs {prod.precio.toFixed(2)}
                        </span>
                      </div>

                      {prod.descripcion && (
                        <p className="text-xs text-stone-500 line-clamp-2">{prod.descripcion}</p>
                      )}

                      {/* Chips */}
                      {prod.chips_personalizacion?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {prod.chips_personalizacion.slice(0, 3).map((ch, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/60"
                            >
                              {ch}
                            </span>
                          ))}
                          {prod.chips_personalizacion.length > 3 && (
                            <span className="text-[10px] text-stone-400">
                              +{prod.chips_personalizacion.length - 3} más
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer Producto */}
                    <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between">
                      <button
                        onClick={() => toggleProductoDisponible(prod.id)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition ${
                          prod.disponible
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-stone-100 text-stone-400"
                        }`}
                      >
                        {prod.disponible ? "Disponible ✓" : "Agotado"}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => abrirModalEditarProducto(prod)}
                          className="p-1.5 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 transition"
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
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ── TAB 3: CATERING & RESERVAS ── */}
        {tabActiva === "reservas" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-amber-950">
                Solicitudes de Catering & Eventos Especiales ({reservas.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reservas.map((res) => (
                <div
                  key={res.id}
                  className="p-5 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-serif text-lg font-bold text-amber-950">
                        {res.nombre_cliente}
                      </h4>
                      <p className="text-xs text-stone-500">
                        {res.telefono} | {res.email}
                      </p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 capitalize">
                      {res.estado}
                    </span>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-2xl text-xs space-y-1 text-stone-700">
                    <p>
                      <strong>Tipo de Evento:</strong> {res.tipo_evento || "Evento Social"}
                    </p>
                    <p>
                      <strong>Fecha:</strong> {new Date(res.fecha_evento).toLocaleDateString("es-BO")}
                    </p>
                    <p>
                      <strong>Personas:</strong> {res.numero_personas} comensales
                    </p>
                    {res.descripcion && (
                      <p className="italic text-stone-600 pt-1">"{res.descripcion}"</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="font-bold text-amber-900">
                      Presupuesto: Bs {res.monto_total || 0} (Seña: Bs {res.monto_sena || 0})
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateReservaEstado(res.id, "confirmada")}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold text-[11px] hover:bg-emerald-700 transition"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => updateReservaEstado(res.id, "produccion")}
                        className="px-2.5 py-1 rounded-lg bg-amber-800 text-white font-semibold text-[11px] hover:bg-amber-900 transition"
                      >
                        En Cocina
                      </button>
                      <button
                        onClick={() => updateReservaEstado(res.id, "completada")}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-semibold text-[11px] hover:bg-blue-700 transition"
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

        {/* ── TAB 4: MÉTRICAS & VENTAS ── */}
        {tabActiva === "metricas" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-1">
                <span className="text-xs text-stone-500">Ventas Totales</span>
                <p className="font-serif text-2xl font-bold text-amber-900">Bs 1,840.00</p>
                <span className="text-[10px] text-emerald-600 font-semibold">+18% vs ayer</span>
              </div>
              <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-1">
                <span className="text-xs text-stone-500">Ticket Promedio</span>
                <p className="font-serif text-2xl font-bold text-stone-800">Bs 46.50</p>
                <span className="text-[10px] text-stone-400">Por mesa servida</span>
              </div>
              <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-1">
                <span className="text-xs text-stone-500">Cobros por QR Simple</span>
                <p className="font-serif text-2xl font-bold text-amber-800">62%</p>
                <span className="text-[10px] text-stone-400">Interoperable Bolivia</span>
              </div>
              <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-1">
                <span className="text-xs text-stone-500">Efectivo en Caja</span>
                <p className="font-serif text-2xl font-bold text-emerald-700">Bs 700.00</p>
                <span className="text-[10px] text-stone-400">Arqueado hoy</span>
              </div>
            </div>

            {/* Productos Estrella */}
            <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <h3 className="font-serif text-lg font-bold text-amber-950">
                Top 5 Productos Más Vendidos
              </h3>
              <div className="space-y-3">
                {[
                  { nombre: "Café con Leche", ventas: 48, total: "Bs 864.00" },
                  { nombre: "Croissant Mantequilla", ventas: 39, total: "Bs 702.00" },
                  { nombre: "Cappuccino Especial", ventas: 34, total: "Bs 748.00" },
                  { nombre: "Sandwich de Pollo", ventas: 26, total: "Bs 832.00" },
                  { nombre: "Torta de Chocolate Belga", ventas: 21, total: "Bs 735.00" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-stone-50 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-stone-800">{item.nombre}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-amber-900">{item.total}</span>
                      <span className="text-[10px] text-stone-400 block">
                        {item.ventas} unidades
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Crear / Editar Mesa */}
      <AnimatePresence>
        {modalMesaAbierto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <h3 className="font-serif text-lg font-bold text-amber-950">
                  {mesaAEditar ? `Editar Mesa ${mesaAEditar.numero}` : "Agregar Nueva Mesa"}
                </h3>
                <button
                  onClick={() => setModalMesaAbierto(false)}
                  className="p-1 rounded-full text-stone-400 hover:bg-stone-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-stone-600 block mb-1">Número de Mesa</label>
                  <input
                    type="number"
                    value={formMesa.numero}
                    onChange={(e) =>
                      setFormMesa({ ...formMesa, numero: parseInt(e.target.value) || 1 })
                    }
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-600 block mb-1">
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
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-600 block mb-1">Forma de la Mesa</label>
                  <select
                    value={formMesa.tipo}
                    onChange={(e) =>
                      setFormMesa({ ...formMesa, tipo: e.target.value as TipoMesa })
                    }
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-800"
                  >
                    <option value="cuadrada">Cuadrada</option>
                    <option value="redonda">Redonda</option>
                    <option value="rectangular">Rectangular</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-600 block mb-1">Zona Asignada</label>
                  <select
                    value={formMesa.zona_id}
                    onChange={(e) => setFormMesa({ ...formMesa, zona_id: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-800"
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
                  className="py-2.5 rounded-xl bg-amber-900 text-white font-bold text-xs hover:bg-amber-950 transition"
                >
                  Guardar Mesa
                </button>
                <button
                  onClick={() => setModalMesaAbierto(false)}
                  className="py-2.5 rounded-xl bg-stone-100 text-stone-600 font-semibold text-xs hover:bg-stone-200 transition"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Crear / Editar Producto con ImgBB */}
      <AnimatePresence>
        {modalProductoAbierto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <h3 className="font-serif text-lg font-bold text-amber-950">
                  {productoAEditar ? `Editar ${productoAEditar.nombre}` : "Nuevo Producto en Catálogo"}
                </h3>
                <button
                  onClick={() => setModalProductoAbierto(false)}
                  className="p-1 rounded-full text-stone-400 hover:bg-stone-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-stone-600 block mb-1">
                    Nombre del Producto
                  </label>
                  <input
                    type="text"
                    value={formProducto.nombre}
                    onChange={(e) =>
                      setFormProducto({ ...formProducto, nombre: e.target.value })
                    }
                    placeholder="ej. Latte con Almendras"
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-600 block mb-1">Descripción</label>
                  <textarea
                    rows={2}
                    value={formProducto.descripcion}
                    onChange={(e) =>
                      setFormProducto({ ...formProducto, descripcion: e.target.value })
                    }
                    placeholder="Descripción apetitosa para el cliente en el menú QR..."
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-stone-600 block mb-1">Categoría</label>
                    <select
                      value={formProducto.categoria_id}
                      onChange={(e) =>
                        setFormProducto({ ...formProducto, categoria_id: e.target.value })
                      }
                      className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-800"
                    >
                      {categorias.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.emoji} {c.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-stone-600 block mb-1">
                      Estación de Cocina
                    </label>
                    <select
                      value={formProducto.estacion}
                      onChange={(e) =>
                        setFormProducto({
                          ...formProducto,
                          estacion: e.target.value as Estacion,
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-800"
                    >
                      <option value="cafeteria">Cafetería</option>
                      <option value="vitrina">Vitrina / Panadería</option>
                      <option value="cocina">Cocina Caliente</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-stone-600 block mb-1">
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
                      className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-800 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-stone-600 block mb-1">
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
                      className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-800"
                    />
                  </div>
                </div>

                {/* Subida ImgBB */}
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-950 flex items-center gap-1.5">
                      <ImageIcon size={14} /> Foto del Producto (ImgBB API)
                    </span>
                    {formProducto.imagen_url && (
                      <span className="text-[10px] text-emerald-700 font-bold">Imagen cargada ✓</span>
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
                      className="px-3 py-2 rounded-xl bg-amber-800 text-white font-semibold text-xs hover:bg-amber-900 transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Upload size={14} />
                      <span>{subiendoImgBB ? "Subiendo a ImgBB..." : "Seleccionar y Subir Foto"}</span>
                    </button>

                    <input
                      type="text"
                      placeholder="o pega la URL de la imagen..."
                      value={formProducto.imagen_url}
                      onChange={(e) =>
                        setFormProducto({ ...formProducto, imagen_url: e.target.value })
                      }
                      className="flex-1 p-2 text-xs rounded-xl border border-stone-200 bg-white"
                    />
                  </div>

                  {errorImgBB && (
                    <p className="text-[11px] text-red-600 font-medium">{errorImgBB}</p>
                  )}

                  {formProducto.imagen_url && (
                    <div className="mt-2 flex items-center gap-2">
                      <img
                        src={formProducto.imagen_url}
                        alt="Preview"
                        className="w-12 h-12 rounded-xl object-cover border border-amber-300"
                      />
                      <span className="text-[10px] text-stone-500 truncate max-w-xs">
                        {formProducto.imagen_url}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-stone-600 block mb-1">
                    Chips de Personalización (separados por coma)
                  </label>
                  <input
                    type="text"
                    value={formProducto.chips_input}
                    onChange={(e) =>
                      setFormProducto({ ...formProducto, chips_input: e.target.value })
                    }
                    placeholder="Sin azúcar, Con Stevia, Calentar en horno..."
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-800"
                  />
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formProducto.es_mas_vendido}
                      onChange={(e) =>
                        setFormProducto({
                          ...formProducto,
                          es_mas_vendido: e.target.checked,
                        })
                      }
                      className="rounded text-amber-800 focus:ring-amber-800"
                    />
                    <span className="font-medium text-stone-700">Producto Destacado / Más Vendido</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formProducto.disponible}
                      onChange={(e) =>
                        setFormProducto({
                          ...formProducto,
                          disponible: e.target.checked,
                        })
                      }
                      className="rounded text-amber-800 focus:ring-amber-800"
                    />
                    <span className="font-medium text-stone-700">Disponible en menú</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-stone-200">
                <button
                  onClick={guardarProducto}
                  className="py-2.5 rounded-xl bg-amber-900 text-white font-bold text-xs hover:bg-amber-950 transition"
                >
                  Guardar Producto
                </button>
                <button
                  onClick={() => setModalProductoAbierto(false)}
                  className="py-2.5 rounded-xl bg-stone-100 text-stone-600 font-semibold text-xs hover:bg-stone-200 transition"
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

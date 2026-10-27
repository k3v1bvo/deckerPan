"use client";
import { useState, useRef, useMemo, useEffect } from "react";
import Link from "next/link";
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
  Printer,
  FileText,
  Wallet,
  Receipt,
  Clock,
  Sun,
  Sunset,
  Moon,
  CreditCard,
  Banknote,
  Filter,
  Eye,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  ChefHat,
  KeyRound,
  EyeOff,
  UserPlus,
  Lock,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useSystemStore } from "@/store";
import { uploadImageToImgBB } from "@/lib/imgbb";
import { Mesa, Producto, TipoMesa, Estacion, Reserva, Pago, SesionCaja, UsuarioStaff, StaffRole, FacturaEmitida } from "@/types";
import StaffAuthGuard from "@/components/StaffAuthGuard";
import { soundManager } from "@/lib/sound";
import { DENCKER_ASSETS, REAL_PRODUCT_PHOTOS, MENU_PDF_PAGES } from "@/lib/seed-data";

export default function AdminPage() {
  const {
    zonas,
    mesas,
    productos,
    categorias,
    reservas,
    pedidos,
    pagos,
    historialSesiones,
    sesionCaja,
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
    usuariosStaff,
    addUsuarioStaff,
    updateUsuarioStaff,
    deleteUsuarioStaff,
    facturacionSiatConfig,
    facturasEmitidas,
    setFacturacionSiatConfig,
  } = useSystemStore();

  const [tabActiva, setTabActiva] = useState<"mesas" | "productos" | "personal" | "qr_mesas" | "reservas" | "metricas" | "qr" | "siat">("mesas");
  const [baseUrlMesas, setBaseUrlMesas] = useState("https://decker-pan.vercel.app");

  // Estados Edición Rápida de Precios & Galería de Fotos Reales
  const [editandoPrecioId, setEditandoPrecioId] = useState<string | null>(null);
  const [nuevoPrecioInput, setNuevoPrecioInput] = useState<string>("");
  const [galeriaFotosAbierta, setGaleriaFotosAbierta] = useState(false);
  const [productoParaGaleria, setProductoParaGaleria] = useState<Producto | null>(null);
  const [busquedaFoto, setBusquedaFoto] = useState("");
  const [filtroTipoFoto, setFiltroTipoFoto] = useState<"todas" | "productos" | "marca">("todas");
  const [fotoSeleccionadaGaleria, setFotoSeleccionadaGaleria] = useState<string | null>(null);
  const [productoDestinoFotoId, setProductoDestinoFotoId] = useState<string>("");
  const [vistaProductosModo, setVistaProductosModo] = useState<"tarjetas" | "tabla">("tarjetas");
  const [modalPdfAbierto, setModalPdfAbierto] = useState(false);
  const [paginaPdfActiva, setPaginaPdfActiva] = useState(0);

  // Estados Facturación SIAT / Impuestos Bolivia
  const [formSiat, setFormSiat] = useState(facturacionSiatConfig);
  const [siatGuardadoExitoso, setSiatGuardadoExitoso] = useState(false);
  const [busquedaFactura, setBusquedaFactura] = useState("");

  // Estados Gestión de Personal & Accesos PIN
  const [modalStaffAbierto, setModalStaffAbierto] = useState(false);
  const [usuarioStaffAEditar, setUsuarioStaffAEditar] = useState<UsuarioStaff | null>(null);
  const [formStaff, setFormStaff] = useState({
    nombre: "",
    role: "mesero" as StaffRole,
    cargo: "",
    pin: "",
    telefono: "",
    activo: true,
  });
  const [pinsVisibles, setPinsVisibles] = useState<Record<string, boolean>>({});
  const [filtroRoleStaff, setFiltroRoleStaff] = useState<"todos" | StaffRole>("todos");
  const [busquedaStaff, setBusquedaStaff] = useState("");

  // Estados Dashboard Financiero & BI
  const [filtroPeriodo, setFiltroPeriodo] = useState<"hoy" | "semana" | "mes" | "todos">("hoy");
  const [filtroTurno, setFiltroTurno] = useState<"todos" | "manana" | "tarde" | "noche">("todos");
  const [filtroMetodoPago, setFiltroMetodoPago] = useState<"todos" | "efectivo" | "qr">("todos");
  const [busquedaTransaccion, setBusquedaTransaccion] = useState("");
  const [reciboModalPago, setReciboModalPago] = useState<Pago | null>(null);
  const [fechaHoyTimestamp, setFechaHoyTimestamp] = useState<number>(0);

  useEffect(() => {
    setFechaHoyTimestamp(Date.now());
    if (typeof window !== "undefined") {
      if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        setBaseUrlMesas("https://decker-pan.vercel.app");
      } else {
        setBaseUrlMesas(window.location.origin);
      }
    }
  }, []);

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
    url: qrBancarioUrl || "/img/logo/logo.png",
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

  // --- Handlers Personal & Accesos PIN ---
  const handleAbrirModalStaff = (usuario?: UsuarioStaff) => {
    soundManager.playClick();
    if (usuario) {
      setUsuarioStaffAEditar(usuario);
      setFormStaff({
        nombre: usuario.nombre,
        role: usuario.role,
        cargo: usuario.cargo,
        pin: usuario.pin,
        telefono: usuario.telefono || "",
        activo: usuario.activo,
      });
    } else {
      setUsuarioStaffAEditar(null);
      const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
      setFormStaff({
        nombre: "",
        role: "mesero",
        cargo: "Mesero de Salón & Terraza",
        pin: randomPin,
        telefono: "+591 ",
        activo: true,
      });
    }
    setModalStaffAbierto(true);
  };

  const handleGenerarPinAleatorio = () => {
    soundManager.playTactileClick();
    const pinNuevo = Math.floor(1000 + Math.random() * 9000).toString();
    setFormStaff((p) => ({ ...p, pin: pinNuevo }));
  };

  const handleGuardarStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStaff.nombre.trim()) {
      alert("Por favor ingresa el nombre del colaborador.");
      return;
    }
    if (!/^\d{4}$/.test(formStaff.pin.trim())) {
      alert("El código PIN debe ser exactamente de 4 dígitos numéricos.");
      return;
    }
    soundManager.playSuccessTone();
    if (usuarioStaffAEditar) {
      updateUsuarioStaff(usuarioStaffAEditar.id, {
        nombre: formStaff.nombre.trim(),
        role: formStaff.role,
        cargo: formStaff.cargo.trim(),
        pin: formStaff.pin.trim(),
        telefono: formStaff.telefono.trim(),
        activo: formStaff.activo,
      });
    } else {
      addUsuarioStaff({
        nombre: formStaff.nombre.trim(),
        role: formStaff.role,
        cargo: formStaff.cargo.trim(),
        pin: formStaff.pin.trim(),
        telefono: formStaff.telefono.trim(),
        activo: formStaff.activo,
      });
    }
    setModalStaffAbierto(false);
  };

  const handleTogglePinVisible = (id: string) => {
    soundManager.playTactileClick();
    setPinsVisibles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRegenerarPinRapido = (u: UsuarioStaff) => {
    const pinNuevo = Math.floor(1000 + Math.random() * 9000).toString();
    if (confirm(`¿Regenerar PIN para ${u.nombre}? Nuevo PIN asignado: ${pinNuevo}`)) {
      soundManager.playSuccessTone();
      updateUsuarioStaff(u.id, { pin: pinNuevo });
    }
  };

  const handleEliminarStaff = (u: UsuarioStaff) => {
    if (u.id === "usr-admin-1" || (u.role === "admin" && (usuariosStaff || []).filter((x) => x.role === "admin").length <= 1)) {
      alert("No puedes eliminar la cuenta del Administrador Principal.");
      return;
    }
    if (confirm(`¿Eliminar la cuenta de ${u.nombre} (${u.cargo})?`)) {
      soundManager.playSuccessTone();
      deleteUsuarioStaff(u.id);
    }
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

  // Métricas avanzadas de BI y Finanzas por Turno y Período
  const statsFinancieras = useMemo(() => {
    const listadoPagos = pagos && pagos.length > 0 ? pagos : [];

    const refTime = fechaHoyTimestamp || 1761500000000;
    const ahora = new Date(refTime);
    const hoyStr = fechaHoyTimestamp ? ahora.toISOString().split("T")[0] : "";
    const hace7Dias = new Date(refTime - 7 * 24 * 60 * 60 * 1000);
    const hace30Dias = new Date(refTime - 30 * 24 * 60 * 60 * 1000);

    // Filtrar por período de tiempo (Hoy, Semana, Mes, Todos)
    const pagosEnPeriodo = listadoPagos.filter((p) => {
      const fechaPago = new Date(p.created_at);
      if (filtroPeriodo === "hoy") {
        return hoyStr ? p.created_at.startsWith(hoyStr) : true;
      }
      if (filtroPeriodo === "semana") {
        return fechaPago >= hace7Dias;
      }
      if (filtroPeriodo === "mes") {
        return fechaPago >= hace30Dias;
      }
      return true; // "todos"
    });

    // Filtrar además por búsqueda, turno y método de pago para el registro
    const transaccionesFiltradas = pagosEnPeriodo.filter((p) => {
      const matchTurno = filtroTurno === "todos" || p.turno === filtroTurno;
      const matchMetodo = filtroMetodoPago === "todos" || p.metodo === filtroMetodoPago;
      const query = busquedaTransaccion.toLowerCase().trim();
      const matchBusqueda =
        !query ||
        (p.id && p.id.toLowerCase().includes(query)) ||
        (p.cliente_nombre && p.cliente_nombre.toLowerCase().includes(query)) ||
        (p.cajero && p.cajero.toLowerCase().includes(query)) ||
        (p.mesa_numero && `mesa ${p.mesa_numero}`.includes(query)) ||
        (p.modalidad && p.modalidad.toLowerCase().includes(query));

      return matchTurno && matchMetodo && matchBusqueda;
    });

    const totalVentas = pagosEnPeriodo.reduce((acc, p) => acc + p.monto, 0);
    const totalEfectivo = pagosEnPeriodo
      .filter((p) => p.metodo === "efectivo")
      .reduce((acc, p) => acc + p.monto, 0);
    const totalQr = pagosEnPeriodo
      .filter((p) => p.metodo === "qr")
      .reduce((acc, p) => acc + p.monto, 0);
    const totalTransacciones = pagosEnPeriodo.length;
    const ticketPromedio = totalTransacciones > 0 ? totalVentas / totalTransacciones : 0;

    // Estimación de costo de insumos (31.6%) y margen neto (68.4%)
    const costoInsumos = Math.round(totalVentas * 0.316 * 10) / 10;
    const gananciaNeta = totalVentas - costoInsumos;
    const margenBrutoPct = totalVentas > 0 ? Math.round((gananciaNeta / totalVentas) * 1000) / 10 : 68.4;

    // Proyección mensual (basada en el promedio diario de facturación)
    const factorDias = filtroPeriodo === "hoy" ? 1 : filtroPeriodo === "semana" ? 7 : 30;
    const promedioDiario = totalVentas / factorDias;
    const proyeccionMensual = Math.round(promedioDiario * 30);

    // Turnos de atención
    const manana = pagosEnPeriodo.filter((p) => p.turno === "manana");
    const tarde = pagosEnPeriodo.filter((p) => p.turno === "tarde");
    const noche = pagosEnPeriodo.filter((p) => p.turno === "noche");

    const totalManana = manana.reduce((acc, p) => acc + p.monto, 0);
    const totalTarde = tarde.reduce((acc, p) => acc + p.monto, 0);
    const totalNoche = noche.reduce((acc, p) => acc + p.monto, 0);

    const pctManana = totalVentas > 0 ? Math.round((totalManana / totalVentas) * 100) : 0;
    const pctTarde = totalVentas > 0 ? Math.round((totalTarde / totalVentas) * 100) : 0;
    const pctNoche = totalVentas > 0 ? Math.round((totalNoche / totalVentas) * 100) : 0;

    return {
      totalVentas,
      totalEfectivo,
      totalQr,
      totalTransacciones,
      ticketPromedio,
      costoInsumos,
      gananciaNeta,
      margenBrutoPct,
      proyeccionMensual,
      promedioDiario,
      transaccionesFiltradas,
      turnos: {
        manana: {
          total: totalManana,
          tickets: manana.length,
          ticketPromedio: manana.length ? totalManana / manana.length : 0,
          pct: pctManana,
          efectivo: manana.filter((p) => p.metodo === "efectivo").reduce((acc, p) => acc + p.monto, 0),
          qr: manana.filter((p) => p.metodo === "qr").reduce((acc, p) => acc + p.monto, 0),
        },
        tarde: {
          total: totalTarde,
          tickets: tarde.length,
          ticketPromedio: tarde.length ? totalTarde / tarde.length : 0,
          pct: pctTarde,
          efectivo: tarde.filter((p) => p.metodo === "efectivo").reduce((acc, p) => acc + p.monto, 0),
          qr: tarde.filter((p) => p.metodo === "qr").reduce((acc, p) => acc + p.monto, 0),
        },
        noche: {
          total: totalNoche,
          tickets: noche.length,
          ticketPromedio: noche.length ? totalNoche / noche.length : 0,
          pct: pctNoche,
          efectivo: noche.filter((p) => p.metodo === "efectivo").reduce((acc, p) => acc + p.monto, 0),
          qr: noche.filter((p) => p.metodo === "qr").reduce((acc, p) => acc + p.monto, 0),
        },
      },
    };
  }, [pagos, filtroPeriodo, filtroTurno, filtroMetodoPago, busquedaTransaccion, fechaHoyTimestamp]);

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
    <StaffAuthGuard requiredRole="admin" roleTitle="Administración General">
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0c0a09] text-stone-900 dark:text-stone-100 pb-36 font-sans">
      {/* ── Apple Glass Admin Header ── */}
      <header className="bg-stone-950/95 backdrop-blur-2xl border-b border-white/10 text-white px-4 lg:px-8 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/10 p-1.5 border border-amber-500/30 flex items-center justify-center shrink-0">
              <img
                src="/img/logo/logo.png"
                alt="Dencker Pan"
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <div>
              <h1 className="font-serif text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                Administración & Operaciones
                <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  Dencker Pan
                </span>
              </h1>
              <p className="text-stone-400 text-xs hidden sm:block">
                Panel central de mesas, catálogo, equipo, cobros y finanzas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/menu-pdf"
              target="_blank"
              className="px-4 py-2 rounded-xl bg-amber-900/60 hover:bg-amber-900 text-amber-100 text-xs border border-amber-500/30 transition flex items-center gap-2 active:scale-95 font-semibold"
            >
              <FileText size={16} className="text-[#87A987]" />
              <span>Menú en PDF</span>
            </Link>

            {/* Reset Fábrica */}
            <button
              onClick={() => {
                if (confirm("¿Restablecer todo a los datos iniciales de fábrica de Dencker Pan?")) {
                  resetToDefaults();
                  soundManager.playSuccessTone();
                }
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white text-xs border border-white/15 transition flex items-center gap-2 active:scale-95 font-semibold cursor-pointer"
            >
              <RefreshCw size={16} />
              <span>Reset Fábrica</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* ── Apple HIG Segmented Control Slider ── */}
        <div className="relative flex items-center p-1.5 rounded-2xl bg-stone-200/80 dark:bg-stone-900 border border-stone-300/60 dark:border-stone-800 max-w-5xl overflow-x-auto shadow-xs">
          {(
            [
              { id: "mesas", label: "Mesas", icon: Layers },
              { id: "productos", label: "Menú", icon: UtensilsCrossed },
              { id: "siat", label: "Facturas SIAT", icon: Receipt },
              { id: "personal", label: "Personal", icon: Users },
              { id: "qr_mesas", label: "QRs Mesas", icon: QrCode },
              { id: "reservas", label: "Reservas", icon: Calendar },
              { id: "metricas", label: "Finanzas", icon: BarChart3 },
              { id: "qr", label: "QR Cobro", icon: DollarSign },
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
                className={`relative flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all z-10 cursor-pointer ${
                  isActive ? "text-stone-950 dark:text-white font-extrabold" : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="adminTabHighlight"
                    className="absolute inset-0 bg-white dark:bg-stone-800 rounded-xl shadow-md border border-stone-200/70 dark:border-stone-700 -z-10"
                    transition={{ type: "spring", damping: 30, stiffness: 450 }}
                  />
                )}
                <Icon size={18} />
                <span>{tab.label}</span>
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

        {/* ── TAB 2: GESTIÓN DE PRODUCTOS & MENÚ OFICIAL ── */}
        {tabActiva === "productos" && (
          <div className="space-y-6">
            <div className="p-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                <button
                  onClick={() => setFiltroCategoria("todas")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition ${
                    filtroCategoria === "todas"
                      ? "bg-amber-900 dark:bg-amber-700 text-white shadow-xs"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200"
                  }`}
                >
                  Todas ({productos.length})
                </button>
                {categorias.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setFiltroCategoria(c.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 cursor-pointer transition ${
                      filtroCategoria === c.id
                        ? "bg-amber-900 dark:bg-amber-700 text-white shadow-xs"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200"
                    }`}
                  >
                    <span>{c.emoji}</span>
                    <span>{c.nombre}</span>
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Buscar producto o receta..."
                    value={busquedaProducto}
                    onChange={(e) => setBusquedaProducto(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 w-44 sm:w-56"
                  />
                </div>

                {/* Selector Vista Tarjetas vs Tabla */}
                <div className="flex items-center p-1 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playTactileClick();
                      setVistaProductosModo("tarjetas");
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      vistaProductosModo === "tarjetas"
                        ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs"
                        : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-300"
                    }`}
                    title="Vista Cuadrícula de Tarjetas"
                  >
                    <Layers size={13} />
                    <span className="hidden sm:inline">Tarjetas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playTactileClick();
                      setVistaProductosModo("tabla");
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      vistaProductosModo === "tabla"
                        ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs"
                        : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-300"
                    }`}
                    title="Vista Planilla / Tabla de Precios Rápida"
                  >
                    <BarChart3 size={13} />
                    <span className="hidden sm:inline">Planilla Precios</span>
                  </button>
                </div>

                {/* Botón Ver PDF Oficial */}
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setModalPdfAbierto(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 font-bold text-xs border border-amber-300/60 dark:border-amber-800 hover:bg-amber-200 transition flex items-center gap-1.5 whitespace-nowrap active:scale-95 cursor-pointer"
                  title="Ver las 6 páginas del Menú Dencker original"
                >
                  <FileText size={15} className="text-amber-700 dark:text-amber-400" />
                  <span className="hidden sm:inline">Menú Oficial PDF</span>
                  <span className="sm:hidden">PDF</span>
                </button>

                {/* Botón Galería de Fotos Reales */}
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setProductoParaGaleria(null);
                    setGaleriaFotosAbierta(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs border border-stone-200 dark:border-stone-700 hover:bg-stone-200 transition flex items-center gap-1.5 whitespace-nowrap active:scale-95 cursor-pointer"
                  title="Explorar el banco de 169 fotos reales para asignar"
                >
                  <ImageIcon size={15} className="text-amber-600" />
                  <span>Fotos Reales ({REAL_PRODUCT_PHOTOS.length})</span>
                </button>

                {/* Botón Nuevo Producto */}
                <button
                  onClick={abrirModalNuevoProducto}
                  className="px-4 py-2 rounded-xl bg-amber-900 dark:bg-amber-700 text-white font-bold text-xs shadow-sm hover:bg-amber-950 transition flex items-center gap-1.5 whitespace-nowrap active:scale-95 cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Nuevo Producto</span>
                </button>
              </div>
            </div>

            {/* Hint informativo para el admin */}
            <div className="flex items-center justify-between text-xs px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-600 shrink-0" />
                <span>
                  {vistaProductosModo === "tarjetas" ? (
                    <>
                      <strong>Tip de Edición Rápida:</strong> Haz click sobre la <strong>foto</strong> de cualquier producto para cambiarla por una foto real del menú, o haz click sobre su <strong>precio (Bs)</strong> para modificarlo al instante.
                    </>
                  ) : (
                    <>
                      <strong>Modo Planilla Rápida:</strong> Edita precios al instante haciendo click en el precio. Cambia fotos en 1 click desde la galería de fotos reales de Dencker Pan.
                    </>
                  )}
                </span>
              </div>
              <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400 font-semibold hidden md:inline">
                {productos.length} productos registrados
              </span>
            </div>

            {/* VISTA 1: GRID DE TARJETAS */}
            {vistaProductosModo === "tarjetas" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productos
                  .filter((p) => {
                    const matchCat =
                      filtroCategoria === "todas" || p.categoria_id === filtroCategoria;
                    const matchSearch = p.nombre
                      .toLowerCase()
                      .includes(busquedaProducto.toLowerCase()) ||
                      (p.descripcion || "").toLowerCase().includes(busquedaProducto.toLowerCase());
                    return matchCat && matchSearch;
                  })
                  .map((prod) => {
                    const margen = prod.precio > 0
                      ? Math.round(((prod.precio - prod.costo) / prod.precio) * 100)
                      : 0;

                    return (
                      <div
                        key={prod.id}
                        className="p-5 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between hover:border-amber-400 dark:hover:border-amber-600 transition group"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {/* Foto Interactiva con botón de cambio */}
                              <button
                                type="button"
                                onClick={() => {
                                  soundManager.playClick();
                                  setProductoParaGaleria(prod);
                                  setGaleriaFotosAbierta(true);
                                }}
                                title="Click para cambiar foto desde las fotos reales del menú"
                                className="relative group/img w-14 h-14 rounded-2xl bg-amber-100 dark:bg-stone-800 flex items-center justify-center overflow-hidden border border-amber-200/60 dark:border-stone-700 shrink-0 text-2xl cursor-pointer hover:ring-2 hover:ring-amber-500 transition"
                              >
                                {prod.imagen_url ? (
                                  <img
                                    src={prod.imagen_url}
                                    alt={prod.nombre}
                                    className="w-full h-full object-cover group-hover/img:scale-110 transition duration-300"
                                  />
                                ) : (
                                  categorias.find((c) => c.id === prod.categoria_id)?.emoji || "🥐"
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                                  <ImageIcon size={16} />
                                  <span className="text-[8px] font-bold mt-0.5">Cambiar</span>
                                </div>
                              </button>

                              <div>
                                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 line-clamp-1 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition">
                                  {prod.nombre}
                                </h4>
                                <span className="text-[11px] text-stone-400 capitalize flex items-center gap-1">
                                  Estación: {prod.estacion}
                                </span>
                              </div>
                            </div>

                            {/* Editor de Precio Rápido Inline */}
                            <div className="text-right">
                              {editandoPrecioId === prod.id ? (
                                <div className="flex items-center gap-1 justify-end">
                                  <span className="text-xs font-bold text-stone-500">Bs</span>
                                  <input
                                    type="number"
                                    step="0.5"
                                    autoFocus
                                    value={nuevoPrecioInput}
                                    onChange={(e) => setNuevoPrecioInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        const num = parseFloat(nuevoPrecioInput);
                                        if (!isNaN(num) && num >= 0) {
                                          updateProducto(prod.id, { precio: num });
                                          soundManager.playSuccessTone();
                                        }
                                        setEditandoPrecioId(null);
                                      } else if (e.key === "Escape") {
                                        setEditandoPrecioId(null);
                                      }
                                    }}
                                    className="w-16 px-1.5 py-0.5 text-xs font-mono font-bold rounded-lg border-2 border-amber-500 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-right focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const num = parseFloat(nuevoPrecioInput);
                                      if (!isNaN(num) && num >= 0) {
                                        updateProducto(prod.id, { precio: num });
                                        soundManager.playSuccessTone();
                                      }
                                      setEditandoPrecioId(null);
                                    }}
                                    className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                                    title="Guardar precio"
                                  >
                                    <Check size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditandoPrecioId(null)}
                                    className="p-1 rounded-md bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 cursor-pointer"
                                    title="Cancelar"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    soundManager.playTactileClick();
                                    setEditandoPrecioId(prod.id);
                                    setNuevoPrecioInput(prod.precio.toString());
                                  }}
                                  title="Click para editar precio rápido"
                                  className="group/price text-right hover:bg-amber-50 dark:hover:bg-amber-950/40 p-1.5 rounded-xl transition cursor-pointer"
                                >
                                  <span className="font-serif font-black text-base text-amber-900 dark:text-amber-400 block font-mono group-hover/price:text-amber-600 flex items-center justify-end gap-1">
                                    Bs {prod.precio.toFixed(2)}
                                    <Edit2 size={11} className="opacity-0 group-hover/price:opacity-100 transition text-amber-600" />
                                  </span>
                                  <span className="text-[10px] text-emerald-600 font-bold block">
                                    Margen: {margen}%
                                  </span>
                                </button>
                              )}
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
                            className={`text-[11px] font-bold px-3 py-1 rounded-full transition cursor-pointer ${
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
                              className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 transition text-xs cursor-pointer"
                              title="Editar detalles completos"
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
                              className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 hover:bg-red-100 transition text-xs cursor-pointer"
                              title="Eliminar producto"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              /* VISTA 2: PLANILLA / TABLA RÁPIDA DE PRECIOS */
              <div className="overflow-x-auto rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 dark:bg-stone-950/70 border-b border-stone-200 dark:border-stone-800 text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4 w-16">Foto</th>
                      <th className="py-3.5 px-4">Producto & Receta</th>
                      <th className="py-3.5 px-4">Categoría</th>
                      <th className="py-3.5 px-4">Estación</th>
                      <th className="py-3.5 px-4 text-right">Precio Venta</th>
                      <th className="py-3.5 px-4 text-right">Costo</th>
                      <th className="py-3.5 px-4 text-center">Margen</th>
                      <th className="py-3.5 px-4 text-center">Disponibilidad</th>
                      <th className="py-3.5 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                    {productos
                      .filter((p) => {
                        const matchCat =
                          filtroCategoria === "todas" || p.categoria_id === filtroCategoria;
                        const matchSearch = p.nombre
                          .toLowerCase()
                          .includes(busquedaProducto.toLowerCase()) ||
                          (p.descripcion || "").toLowerCase().includes(busquedaProducto.toLowerCase());
                        return matchCat && matchSearch;
                      })
                      .map((prod) => {
                        const margen = prod.precio > 0
                          ? Math.round(((prod.precio - prod.costo) / prod.precio) * 100)
                          : 0;
                        const cat = categorias.find((c) => c.id === prod.categoria_id);

                        return (
                          <tr key={prod.id} className="hover:bg-amber-500/5 transition">
                            {/* Foto interactiva */}
                            <td className="py-2.5 px-4">
                              <button
                                type="button"
                                onClick={() => {
                                  soundManager.playClick();
                                  setProductoParaGaleria(prod);
                                  setGaleriaFotosAbierta(true);
                                }}
                                title="Click para cambiar foto desde las 169 fotos reales"
                                className="relative group w-11 h-11 rounded-xl bg-amber-100 dark:bg-stone-800 flex items-center justify-center overflow-hidden border border-stone-200 dark:border-stone-700 cursor-pointer hover:ring-2 hover:ring-amber-500 transition shrink-0"
                              >
                                {prod.imagen_url ? (
                                  <img
                                    src={prod.imagen_url}
                                    alt={prod.nombre}
                                    className="w-full h-full object-cover group-hover:scale-110 transition"
                                  />
                                ) : (
                                  <span className="text-base">{cat?.emoji || "🥐"}</span>
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                                  <ImageIcon size={14} />
                                </div>
                              </button>
                            </td>

                            {/* Nombre y descripción */}
                            <td className="py-2.5 px-4 max-w-xs">
                              <div className="font-bold text-stone-900 dark:text-stone-100 truncate">
                                {prod.nombre}
                              </div>
                              {prod.descripcion && (
                                <div className="text-[11px] text-stone-400 truncate max-w-xs">
                                  {prod.descripcion}
                                </div>
                              )}
                            </td>

                            {/* Categoría */}
                            <td className="py-2.5 px-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-[11px]">
                                <span>{cat?.emoji}</span>
                                <span>{cat?.nombre}</span>
                              </span>
                            </td>

                            {/* Estación */}
                            <td className="py-2.5 px-4 whitespace-nowrap">
                              <span className="capitalize text-stone-500 text-[11px] font-medium">
                                {prod.estacion}
                              </span>
                            </td>

                            {/* Precio Venta Inline Editable */}
                            <td className="py-2.5 px-4 text-right whitespace-nowrap">
                              {editandoPrecioId === prod.id ? (
                                <div className="flex items-center justify-end gap-1">
                                  <span className="text-[11px] font-bold text-stone-500">Bs</span>
                                  <input
                                    type="number"
                                    step="0.5"
                                    autoFocus
                                    value={nuevoPrecioInput}
                                    onChange={(e) => setNuevoPrecioInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        const num = parseFloat(nuevoPrecioInput);
                                        if (!isNaN(num) && num >= 0) {
                                          updateProducto(prod.id, { precio: num });
                                          soundManager.playSuccessTone();
                                        }
                                        setEditandoPrecioId(null);
                                      } else if (e.key === "Escape") {
                                        setEditandoPrecioId(null);
                                      }
                                    }}
                                    className="w-16 px-1.5 py-0.5 text-xs font-mono font-bold rounded-lg border-2 border-amber-500 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-right focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const num = parseFloat(nuevoPrecioInput);
                                      if (!isNaN(num) && num >= 0) {
                                        updateProducto(prod.id, { precio: num });
                                        soundManager.playSuccessTone();
                                      }
                                      setEditandoPrecioId(null);
                                    }}
                                    className="p-1 rounded bg-emerald-600 text-white cursor-pointer"
                                  >
                                    <Check size={11} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditandoPrecioId(null)}
                                    className="p-1 rounded bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 cursor-pointer"
                                  >
                                    <X size={11} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    soundManager.playTactileClick();
                                    setEditandoPrecioId(prod.id);
                                    setNuevoPrecioInput(prod.precio.toString());
                                  }}
                                  className="group/p inline-flex items-center gap-1 font-mono font-black text-amber-900 dark:text-amber-400 hover:text-amber-600 px-2 py-1 rounded-lg hover:bg-amber-100/60 dark:hover:bg-amber-950/60 transition cursor-pointer"
                                  title="Click para editar precio de venta"
                                >
                                  <span>Bs {prod.precio.toFixed(2)}</span>
                                  <Edit2 size={10} className="opacity-0 group-hover/p:opacity-100 transition text-amber-600" />
                                </button>
                              )}
                            </td>

                            {/* Costo */}
                            <td className="py-2.5 px-4 text-right font-mono text-stone-500 whitespace-nowrap">
                              Bs {prod.costo.toFixed(2)}
                            </td>

                            {/* Margen */}
                            <td className="py-2.5 px-4 text-center whitespace-nowrap">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                margen >= 50
                                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-400/20"
                                  : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-400/20"
                              }`}>
                                {margen}%
                              </span>
                            </td>

                            {/* Disponibilidad */}
                            <td className="py-2.5 px-4 text-center whitespace-nowrap">
                              <button
                                onClick={() => toggleProductoDisponible(prod.id)}
                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full transition cursor-pointer ${
                                  prod.disponible
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                    : "bg-stone-100 text-stone-400 dark:bg-stone-800"
                                }`}
                              >
                                {prod.disponible ? "Disponible" : "Agotado"}
                              </button>
                            </td>

                            {/* Acciones */}
                            <td className="py-2.5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => abrirModalEditarProducto(prod)}
                                  className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 transition cursor-pointer"
                                  title="Editar producto completo"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`¿Eliminar ${prod.nombre}?`)) {
                                      deleteProducto(prod.id);
                                      soundManager.playSuccessTone();
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 hover:bg-red-100 transition cursor-pointer"
                                  title="Eliminar producto"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: FACTURACIÓN ELECTRÓNICA SIAT / IMPUESTOS BOLIVIA ── */}
        {tabActiva === "siat" && (
          <div className="space-y-6">
            {/* Header SIAT con diseño institucional */}
            <div className="p-6 bg-gradient-to-r from-blue-950 via-slate-900 to-stone-900 rounded-3xl text-white shadow-xl flex flex-wrap items-center justify-between gap-6 border border-blue-900/40">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-blue-300 tracking-wider uppercase">
                  <ShieldCheck size={16} className="text-blue-400" />
                  <span>Servicio de Impuestos Nacionales (SIN) • Bolivia</span>
                </div>
                <h2 className="font-serif text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                  Facturación Computarizada / Electrónica en Línea
                  <span className={`text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full ${
                    formSiat.activa
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                      : "bg-stone-700 text-stone-300"
                  }`}>
                    {formSiat.activa ? "SIAT Habilitado" : "Modo Pruebas / Desactivado"}
                  </span>
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
                  Pega aquí el enlace o token proporcionado por tu contador para vincular la emisión legal con CUFD, generación de CUF y QR de verificación tributaria oficial.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const actualizado = { ...formSiat, activa: !formSiat.activa };
                    setFormSiat(actualizado);
                    setFacturacionSiatConfig(actualizado);
                    soundManager.playSuccessTone();
                  }}
                  className={`px-4 py-2.5 rounded-2xl font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer ${
                    formSiat.activa
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                      : "bg-white/10 hover:bg-white/20 text-stone-200"
                  }`}
                >
                  <Receipt size={16} />
                  <span>{formSiat.activa ? "Facturación Activa ✓" : "Activar Emisión SIAT"}</span>
                </button>
              </div>
            </div>

            {/* Formulario de Configuración SIAT */}
            <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <KeyRound size={18} className="text-amber-600" />
                    Parámetros Tributarios de Casa Matriz
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Datos fiscales de Dencker Pan para los comprobantes electrónicos
                  </p>
                </div>

                {siatGuardadoExitoso && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800"
                  >
                    <CheckCircle2 size={15} />
                    <span>Configuración SIAT guardada ✓</span>
                  </motion.div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {/* NIT Emisor */}
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    NIT Emisor *
                  </label>
                  <input
                    type="text"
                    value={formSiat.nitEmisor}
                    onChange={(e) => setFormSiat({ ...formSiat, nitEmisor: e.target.value })}
                    placeholder="1028492023"
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono font-semibold"
                  />
                </div>

                {/* Razón Social */}
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Razón Social Registrada *
                  </label>
                  <input
                    type="text"
                    value={formSiat.razonSocialEmisor}
                    onChange={(e) => setFormSiat({ ...formSiat, razonSocialEmisor: e.target.value })}
                    placeholder="DENCKER PAN S.R.L."
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold"
                  />
                </div>

                {/* Modalidad de Facturación */}
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Modalidad SIAT *
                  </label>
                  <select
                    value={formSiat.modalidad}
                    onChange={(e) => setFormSiat({ ...formSiat, modalidad: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold"
                  >
                    <option value="computarizada_linea">Computarizada en Línea (Token/CUFD)</option>
                    <option value="electronica_linea">Electrónica en Línea (Firma Digital)</option>
                    <option value="recibo_oficial">Recibo Oficial Tributario</option>
                  </select>
                </div>

                {/* Punto de Venta */}
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Código Punto de Venta (0 = Casa Matriz)
                  </label>
                  <input
                    type="number"
                    value={formSiat.codigoPuntoVenta}
                    onChange={(e) => setFormSiat({ ...formSiat, codigoPuntoVenta: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono"
                  />
                </div>

                {/* Código CUFD */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-stone-700 dark:text-stone-300">
                      CUFD (Vigente Diario)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const nuevoCufd = "B" + Math.random().toString(36).substring(2, 10).toUpperCase() + Date.now().toString(36).toUpperCase();
                        setFormSiat({ ...formSiat, cufd: nuevoCufd });
                        soundManager.playTactileClick();
                      }}
                      className="text-[10px] text-amber-600 hover:underline cursor-pointer"
                    >
                      Renovar código
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formSiat.cufd}
                    onChange={(e) => setFormSiat({ ...formSiat, cufd: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono font-semibold"
                  />
                </div>

                {/* URL Consulta / Validación QR */}
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Enlace Oficial de Consulta QR Tributario
                  </label>
                  <input
                    type="url"
                    value={formSiat.linkImpuestos}
                    onChange={(e) => setFormSiat({ ...formSiat, linkImpuestos: e.target.value })}
                    placeholder="https://siat.impuestos.gob.bo/consulta/QR"
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono"
                  />
                </div>

                {/* Token SIAT o Enlace del Contador */}
                <div className="md:col-span-3">
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Token Delegado SIAT o Clave de Acceso (Provista por el Contador)
                  </label>
                  <textarea
                    rows={2}
                    value={formSiat.tokenSiat}
                    onChange={(e) => setFormSiat({ ...formSiat, tokenSiat: e.target.value })}
                    placeholder="Pega aquí el token SIAT o código provisto por tu contador..."
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    setFacturacionSiatConfig(formSiat);
                    soundManager.playSuccessTone();
                    setSiatGuardadoExitoso(true);
                    setTimeout(() => setSiatGuardadoExitoso(false), 3000);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-blue-900 dark:bg-blue-600 hover:bg-blue-950 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Save size={16} />
                  <span>Guardar Parámetros SIAT</span>
                </button>
              </div>
            </div>

            {/* Listado de Facturas Emitidas */}
            <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Receipt size={18} className="text-blue-600" />
                    Historial de Facturas Emitidas ({facturasEmitidas.length})
                  </h3>
                  <p className="text-xs text-stone-500">
                    Registro de comprobantes fiscales emitidos con validación CUF
                  </p>
                </div>

                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Buscar por Nº, Cliente o NIT..."
                    value={busquedaFactura}
                    onChange={(e) => setBusquedaFactura(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none w-60"
                  />
                </div>
              </div>

              {facturasEmitidas.length === 0 ? (
                <div className="py-12 text-center space-y-3 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-dashed border-stone-200 dark:border-stone-700">
                  <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                    <Receipt size={24} />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-stone-800 dark:text-stone-200">
                      No hay facturas emitidas todavía
                    </h4>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                      Cuando el cajero cobre un pedido en Caja POS con la opción "Factura SIAT", se generará automáticamente el CUF y el código QR de validación tributaria.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">Nº Factura</th>
                        <th className="py-2.5 px-3">Fecha & Hora</th>
                        <th className="py-2.5 px-3">Cliente / Razón Social</th>
                        <th className="py-2.5 px-3">NIT / CI</th>
                        <th className="py-2.5 px-3">Total (Bs)</th>
                        <th className="py-2.5 px-3">CUF</th>
                        <th className="py-2.5 px-3 text-right">Verificación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                      {facturasEmitidas
                        .filter((f) => {
                          const query = busquedaFactura.toLowerCase();
                          return (
                            f.numeroFactura.toString().includes(query) ||
                            f.clienteNombre.toLowerCase().includes(query) ||
                            f.clienteNitCi.toLowerCase().includes(query)
                          );
                        })
                        .map((f) => (
                          <tr key={f.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                            <td className="py-3 px-3 font-mono font-bold text-blue-900 dark:text-blue-400">
                              #{f.numeroFactura}
                            </td>
                            <td className="py-3 px-3 text-stone-500">
                              {new Date(f.fechaEmision).toLocaleString("es-BO")}
                            </td>
                            <td className="py-3 px-3 font-semibold text-stone-800 dark:text-stone-200">
                              {f.clienteNombre}
                            </td>
                            <td className="py-3 px-3 font-mono text-stone-600 dark:text-stone-400">
                              {f.clienteNitCi}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                              Bs {f.montoTotal.toFixed(2)}
                            </td>
                            <td className="py-3 px-3 font-mono text-[10px] text-stone-400 truncate max-w-xs">
                              {f.cuf}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <a
                                href={f.urlQrVerificacion}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 underline"
                              >
                                <span>SIAT QR</span>
                                <ExternalLink size={12} />
                              </a>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
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

        {/* ── TAB: GESTIÓN DE PERSONAL & CÓDIGOS DE ACCESO (PIN) ── */}
        {tabActiva === "personal" && (
          <div className="space-y-6">
            {/* Header limpio y profesional */}
            <div className="p-6 bg-stone-900 rounded-3xl text-white shadow-xl flex flex-wrap items-center justify-between gap-4 border border-stone-800">
              <div className="space-y-1">
                <h2 className="font-serif text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                  <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Users size={26} />
                  </div>
                  <span>Equipo & Colaboradores</span>
                </h2>
                <p className="text-stone-400 text-xs sm:text-sm">
                  Control de personal, asignación de estaciones y claves PIN de acceso táctil.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleAbrirModalStaff()}
                  className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-md transition flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Plus size={20} />
                  <span>Nuevo Colaborador</span>
                </button>
              </div>
            </div>

            {/* 4 Tarjetas de Estadísticas de Personal */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Personal",
                  count: (usuariosStaff || []).length,
                  icon: Users,
                  color: "text-stone-900 dark:text-stone-100",
                  bg: "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300",
                },
                {
                  label: "Meseros (Sala)",
                  count: (usuariosStaff || []).filter((u) => u.role === "mesero").length,
                  icon: UtensilsCrossed,
                  color: "text-amber-600 dark:text-amber-400",
                  bg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                },
                {
                  label: "Cocina & Baristas",
                  count: (usuariosStaff || []).filter((u) => u.role === "cocina").length,
                  icon: ChefHat,
                  color: "text-blue-600 dark:text-blue-400",
                  bg: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
                },
                {
                  label: "Caja POS & Admin",
                  count: (usuariosStaff || []).filter((u) => u.role === "caja" || u.role === "admin").length,
                  icon: Receipt,
                  color: "text-emerald-600 dark:text-emerald-400",
                  bg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                },
              ].map((st, idx) => {
                const Icon = st.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center gap-4"
                  >
                    <div className={`w-12 h-12 rounded-2xl ${st.bg} flex items-center justify-center shrink-0`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <span className="text-xs text-stone-500 dark:text-stone-400 block font-semibold">
                        {st.label}
                      </span>
                      <span className={`text-2xl font-black font-mono ${st.color}`}>
                        {st.count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Filtros por Rol y Buscador */}
            <div className="p-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                {[
                  { id: "todos", label: "Todo el Personal" },
                  { id: "mesero", label: "Meseros" },
                  { id: "cocina", label: "Cocina / KDS" },
                  { id: "caja", label: "Caja POS" },
                  { id: "admin", label: "Administradores" },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setFiltroRoleStaff(r.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
                      filtroRoleStaff === r.id
                        ? "bg-amber-900 dark:bg-amber-700 text-white shadow-xs"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search size={18} className="absolute left-3.5 top-3 text-stone-400" />
                <input
                  type="text"
                  placeholder="Buscar colaborador..."
                  value={busquedaStaff}
                  onChange={(e) => setBusquedaStaff(e.target.value)}
                  className="pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none w-64 sm:w-72"
                />
              </div>
            </div>

            {/* Grid de Cuentas de Personal */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(usuariosStaff || [])
                .filter((u) => {
                  const matchRole = filtroRoleStaff === "todos" || u.role === filtroRoleStaff;
                  const matchSearch =
                    u.nombre.toLowerCase().includes(busquedaStaff.toLowerCase()) ||
                    u.cargo.toLowerCase().includes(busquedaStaff.toLowerCase());
                  return matchRole && matchSearch;
                })
                .map((user) => {
                  const isVisible = !!pinsVisibles[user.id];
                  const roleConfig = {
                    admin: {
                      label: "Administración",
                      icon: ShieldCheck,
                      badge: "bg-stone-900 text-amber-300 border-amber-500/40",
                      station: "Acceso Total / Gerencia",
                    },
                    mesero: {
                      label: "Sala & Mesero",
                      icon: UtensilsCrossed,
                      badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
                      station: "Terminal de Sala & Mesas",
                    },
                    cocina: {
                      label: "Cocina & Barismo",
                      icon: ChefHat,
                      badge: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
                      station: "Pantalla KDS & Horno",
                    },
                    caja: {
                      label: "Caja POS",
                      icon: Receipt,
                      badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
                      station: "Cobros & Arqueo POS",
                    },
                  }[user.role];

                  const RoleIcon = roleConfig.icon;

                  return (
                    <div
                      key={user.id}
                      className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-amber-400 dark:hover:border-amber-600 transition"
                    >
                      {/* Cabecera Tarjeta: Avatar + Rol + Estado */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-center justify-center font-black text-base shrink-0">
                            {user.nombre.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 leading-tight">
                              {user.nombre}
                            </h4>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                              {user.cargo}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                            user.activo
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-400/30"
                              : "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-400/30"
                          }`}
                        >
                          {user.activo ? "Activo" : "Inactivo"}
                        </span>
                      </div>

                      {/* Estación y Permiso */}
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold border ${roleConfig.badge}`}>
                            <RoleIcon size={16} />
                            <span>{roleConfig.label}</span>
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          Estación: <span className="font-semibold text-stone-800 dark:text-stone-200">{roleConfig.station}</span>
                        </p>
                      </div>

                      {/* Bloque de Código PIN */}
                      <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                            PIN de Acceso Táctil:
                          </span>
                          <span className="font-mono text-base font-black text-amber-950 dark:text-amber-200 tracking-widest">
                            {isVisible ? user.pin : "••••"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleTogglePinVisible(user.id)}
                            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-stone-700 transition cursor-pointer"
                            title={isVisible ? "Ocultar PIN" : "Ver PIN"}
                          >
                            {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                          <button
                            onClick={() => handleRegenerarPinRapido(user)}
                            className="p-2 rounded-xl text-stone-500 hover:text-amber-600 hover:bg-amber-100/60 dark:hover:bg-stone-700 transition cursor-pointer"
                            title="Regenerar PIN aleatorio"
                          >
                            <KeyRound size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Botones de Acción */}
                      <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
                        <button
                          onClick={() => handleAbrirModalStaff(user)}
                          className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer active:scale-95"
                        >
                          <Edit2 size={16} />
                          <span>Editar</span>
                        </button>

                        <button
                          onClick={() => handleEliminarStaff(user)}
                          className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/60 transition text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer active:scale-95"
                        >
                          <Trash2 size={16} />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ── TAB 4: MÉTRICAS FINANCIERAS & CONTROL DE COBROS POR TURNO ── */}
        {tabActiva === "metricas" && (
          <div className="space-y-6">
            {/* Cabecera Financiera y Selector de Períodos */}
            <div className="p-6 bg-stone-900 rounded-3xl text-white shadow-xl flex flex-wrap items-center justify-between gap-4 border border-stone-800">
              <div className="space-y-1">
                <h2 className="font-serif text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                  <div className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <TrendingUp size={26} />
                  </div>
                  <span>Finanzas & Control de Ingresos</span>
                </h2>
                <p className="text-stone-400 text-xs sm:text-sm">
                  Ventas totales, métodos de cobro en Bolivianos (BOB) y recaudación por turno.
                </p>
              </div>

              {/* Selector de Períodos y Botón de Imprimir */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="p-1 rounded-2xl bg-black/50 border border-white/10 flex items-center gap-1.5">
                  {[
                    { id: "hoy", label: "Hoy" },
                    { id: "semana", label: "Esta Semana" },
                    { id: "mes", label: "Este Mes" },
                    { id: "todos", label: "Histórico" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        soundManager.playClick();
                        setFiltroPeriodo(p.id as any);
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        filtroPeriodo === p.id
                          ? "bg-amber-600 text-white shadow-sm"
                          : "text-stone-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    soundManager.playTactileClick();
                    window.print();
                  }}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white text-xs sm:text-sm font-bold border border-white/10 transition flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Printer size={16} />
                  <span>Imprimir Reporte</span>
                </button>
              </div>
            </div>

            {/* 4 Bento Cards Ejecutivas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Ventas Totales */}
              <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign size={16} className="text-amber-600" />
                    Ventas del Período
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono">
                    +{statsFinancieras.margenBrutoPct}% Margen
                  </span>
                </div>
                <div>
                  <p className="font-serif text-3xl font-black text-amber-950 dark:text-amber-200 font-mono">
                    Bs {statsFinancieras.totalVentas.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-stone-500 dark:text-stone-400">
                    <span className="flex items-center gap-1">
                      <Banknote size={12} className="text-emerald-600" />
                      Bs {statsFinancieras.totalEfectivo.toFixed(2)} Efec.
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <QrCode size={12} className="text-purple-600" />
                      Bs {statsFinancieras.totalQr.toFixed(2)} QR
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 flex items-center justify-between">
                  <span>Proyección Mensual:</span>
                  <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                    Bs {statsFinancieras.proyeccionMensual.toLocaleString("es-BO")}
                  </span>
                </div>
              </div>

              {/* Card 2: Margen & Utilidad Neta */}
              <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-emerald-600" />
                    Ganancia Neta Estimada
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                    Café & Pan
                  </span>
                </div>
                <div>
                  <p className="font-serif text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    Bs {statsFinancieras.gananciaNeta.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Costo estimado de insumos: <span className="font-mono font-semibold">Bs {statsFinancieras.costoInsumos.toFixed(2)}</span>
                  </p>
                </div>
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500">
                  Calculado sobre café Yungas y harinas artesanas
                </div>
              </div>

              {/* Card 3: Ticket Promedio y Volumen */}
              <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Receipt size={14} className="text-blue-600" />
                    Ticket Promedio
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                    {statsFinancieras.totalTransacciones} Tickets
                  </span>
                </div>
                <div>
                  <p className="font-serif text-3xl font-black text-stone-900 dark:text-stone-100 font-mono">
                    Bs {statsFinancieras.ticketPromedio.toFixed(2)}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Gasto promedio por comensal servido
                  </p>
                </div>
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 flex items-center justify-between">
                  <span>Ritmo diario estimado:</span>
                  <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                    Bs {statsFinancieras.promedioDiario.toFixed(2)}/día
                  </span>
                </div>
              </div>

              {/* Card 4: Caja Registradora & Turno Actual */}
              <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={14} className="text-amber-600" />
                    Caja en Turno
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 capitalize">
                    {sesionCaja?.estado || "Abierta"}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-2xl font-black text-stone-900 dark:text-stone-100 capitalize">
                      Turno {sesionCaja?.turno || "Tarde"}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Cajero: <span className="font-semibold text-stone-800 dark:text-stone-200">{sesionCaja?.cajero || "Cajero Principal"}</span>
                  </p>
                </div>
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 flex items-center justify-between">
                  <span>Efectivo en gaveta:</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    Bs {sesionCaja?.efectivo_esperado?.toFixed(2) || "448.00"}
                  </span>
                </div>
              </div>
            </div>

            {/* ── SECCIÓN CRÍTICA: INGRESOS POR TURNOS (SHIFT INTELLIGENCE) ── */}
            <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Clock size={20} className="text-amber-600" />
                    Ingresos Desglosados por Turno de Atención
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Comparativa de recaudación entre la horneada de la mañana (07:00 - 14:00), la merienda de la tarde (14:00 - 19:30) y el cierre nocturno (19:30 - Cierre).
                  </p>
                </div>

                {/* Barra de Distribución Porcentual */}
                <div className="flex items-center gap-4 text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-stone-600 dark:text-stone-300">Mañana ({statsFinancieras.turnos.manana.pct}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-600" />
                    <span className="text-stone-600 dark:text-stone-300">Tarde ({statsFinancieras.turnos.tarde.pct}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-indigo-600" />
                    <span className="text-stone-600 dark:text-stone-300">Noche ({statsFinancieras.turnos.noche.pct}%)</span>
                  </div>
                </div>
              </div>

              {/* Barra Visual de Contribución */}
              <div className="h-3 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${statsFinancieras.turnos.manana.pct}%` }}
                  className="bg-amber-500 transition-all duration-700"
                  title={`Mañana: ${statsFinancieras.turnos.manana.pct}%`}
                />
                <div
                  style={{ width: `${statsFinancieras.turnos.tarde.pct}%` }}
                  className="bg-emerald-600 transition-all duration-700"
                  title={`Tarde: ${statsFinancieras.turnos.tarde.pct}%`}
                />
                <div
                  style={{ width: `${statsFinancieras.turnos.noche.pct}%` }}
                  className="bg-indigo-600 transition-all duration-700"
                  title={`Noche: ${statsFinancieras.turnos.noche.pct}%`}
                />
              </div>

              {/* 3 Tarjetas de Turno */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Turno Mañana */}
                <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
                        <Sun size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                          Turno Mañana
                        </h4>
                        <span className="text-[11px] text-amber-900 dark:text-amber-300 font-mono">
                          07:00 – 14:00
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-400 font-mono bg-white dark:bg-stone-900 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-stone-800">
                      {statsFinancieras.turnos.manana.pct}% Ventas
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-600 dark:text-stone-400">
                    Desayunos, café pasado de Caranavi y primera tanda caliente de marraquetas (07:30).
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500">Recaudación:</span>
                      <span className="font-serif text-lg font-black text-stone-900 dark:text-stone-100 font-mono">
                        Bs {statsFinancieras.turnos.manana.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span>Comandas Cobradas:</span>
                      <span className="font-semibold text-stone-800 dark:text-stone-200 font-mono">
                        {statsFinancieras.turnos.manana.tickets} pedidos
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span>Ticket Promedio:</span>
                      <span className="font-semibold text-stone-800 dark:text-stone-200 font-mono">
                        Bs {statsFinancieras.turnos.manana.ticketPromedio.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                      <span>Efectivo: Bs {statsFinancieras.turnos.manana.efectivo.toFixed(2)}</span>
                      <span>QR: Bs {statsFinancieras.turnos.manana.qr.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Turno Tarde */}
                <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
                        <Sunset size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                          Turno Tarde
                        </h4>
                        <span className="text-[11px] text-emerald-900 dark:text-emerald-300 font-mono">
                          14:00 – 19:30
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-400 font-mono bg-white dark:bg-stone-900 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-stone-800">
                      {statsFinancieras.turnos.tarde.pct}% Ventas
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-600 dark:text-stone-400">
                    Té de la tarde, New York rolls, croissants, porciones de torta y tanda caliente de las 16:30.
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500">Recaudación:</span>
                      <span className="font-serif text-lg font-black text-stone-900 dark:text-stone-100 font-mono">
                        Bs {statsFinancieras.turnos.tarde.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span>Comandas Cobradas:</span>
                      <span className="font-semibold text-stone-800 dark:text-stone-200 font-mono">
                        {statsFinancieras.turnos.tarde.tickets} pedidos
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span>Ticket Promedio:</span>
                      <span className="font-semibold text-stone-800 dark:text-stone-200 font-mono">
                        Bs {statsFinancieras.turnos.tarde.ticketPromedio.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                      <span>Efectivo: Bs {statsFinancieras.turnos.tarde.efectivo.toFixed(2)}</span>
                      <span>QR: Bs {statsFinancieras.turnos.tarde.qr.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Turno Noche */}
                <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                        <Moon size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                          Turno Noche / Cierre
                        </h4>
                        <span className="text-[11px] text-indigo-900 dark:text-indigo-300 font-mono">
                          19:30 – Cierre
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-400 font-mono bg-white dark:bg-stone-900 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-stone-800">
                      {statsFinancieras.turnos.noche.pct}% Ventas
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-600 dark:text-stone-400">
                    Cenas ligeras, pizzas artesanales, infusiones calientes y arqueo final de caja registradora.
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-indigo-200/60 dark:border-indigo-900/40">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500">Recaudación:</span>
                      <span className="font-serif text-lg font-black text-stone-900 dark:text-stone-100 font-mono">
                        Bs {statsFinancieras.turnos.noche.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span>Comandas Cobradas:</span>
                      <span className="font-semibold text-stone-800 dark:text-stone-200 font-mono">
                        {statsFinancieras.turnos.noche.tickets} pedidos
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span>Ticket Promedio:</span>
                      <span className="font-semibold text-stone-800 dark:text-stone-200 font-mono">
                        Bs {statsFinancieras.turnos.noche.ticketPromedio.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                      <span>Efectivo: Bs {statsFinancieras.turnos.noche.efectivo.toFixed(2)}</span>
                      <span>QR: Bs {statsFinancieras.turnos.noche.qr.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── REGISTRO DETALLADO DE PAGOS: ¿QUIÉN PAGÓ? ¿CUÁNTO PAGÓ? ¿CUÁNDO PAGÓ? ── */}
            <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Receipt size={20} className="text-amber-600" />
                    Historial de Cobros y Transacciones Realizadas
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Mostrando {statsFinancieras.transaccionesFiltradas.length} transacciones verificadas con cliente, mesa, método y comprobante.
                  </p>
                </div>

                {/* Filtros rápidos de tabla */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Búsqueda por texto */}
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Buscar cliente, mesa o ID..."
                      value={busquedaTransaccion}
                      onChange={(e) => setBusquedaTransaccion(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs w-56 text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  {/* Filtro Turno */}
                  <select
                    value={filtroTurno}
                    onChange={(e) => setFiltroTurno(e.target.value as any)}
                    className="p-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200"
                  >
                    <option value="todos">Todos los Turnos</option>
                    <option value="manana">🌅 Mañana</option>
                    <option value="tarde">🥐 Tarde</option>
                    <option value="noche">🌙 Noche</option>
                  </select>

                  {/* Filtro Método */}
                  <select
                    value={filtroMetodoPago}
                    onChange={(e) => setFiltroMetodoPago(e.target.value as any)}
                    className="p-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200"
                  >
                    <option value="todos">Todos los Métodos</option>
                    <option value="efectivo">💵 Efectivo BOB</option>
                    <option value="qr">📱 QR Simple Interoperable</option>
                  </select>
                </div>
              </div>

              {/* Tabla de Transacciones */}
              <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-50 dark:bg-stone-800/80 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200 dark:border-stone-800 text-[11px]">
                      <th className="py-3 px-4">ID Transacción</th>
                      <th className="py-3 px-4">Fecha & Hora</th>
                      <th className="py-3 px-4">Cliente / Mesa</th>
                      <th className="py-3 px-4">Turno</th>
                      <th className="py-3 px-4">Modalidad</th>
                      <th className="py-3 px-4">Cajero</th>
                      <th className="py-3 px-4">Método</th>
                      <th className="py-3 px-4 text-right">Monto Cobrado</th>
                      <th className="py-3 px-4 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {statsFinancieras.transaccionesFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-stone-400">
                          No se encontraron transacciones con los filtros seleccionados.
                        </td>
                      </tr>
                    ) : (
                      statsFinancieras.transaccionesFiltradas.map((p) => {
                        const esQr = p.metodo === "qr";
                        const fecha = new Date(p.created_at);
                        const horaStr = fecha.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" });
                        const fechaStr = fecha.toLocaleDateString("es-BO", { day: "2-digit", month: "short" });

                        return (
                          <tr
                            key={p.id}
                            className="hover:bg-amber-50/40 dark:hover:bg-stone-800/50 transition-colors"
                          >
                            <td className="py-3 px-4 font-mono font-bold text-stone-800 dark:text-stone-200">
                              {p.id}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap text-stone-600 dark:text-stone-300">
                              <span className="font-semibold text-stone-900 dark:text-stone-100">{horaStr}</span>
                              <span className="text-[10px] text-stone-400 block">{fechaStr}</span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-stone-900 dark:text-stone-100">
                                {p.cliente_nombre || (p.mesa_numero ? `Mesa ${p.mesa_numero}` : "Cliente Mostrador")}
                              </div>
                              {p.mesa_numero && (
                                <span className="text-[10px] text-amber-800 dark:text-amber-400 font-semibold">
                                  Salón Principal
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                                  p.turno === "manana"
                                    ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300"
                                    : p.turno === "tarde"
                                    ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300"
                                    : "bg-indigo-100 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300"
                                }`}
                              >
                                {p.turno === "manana" && <Sun size={10} />}
                                {p.turno === "tarde" && <Sunset size={10} />}
                                {p.turno === "noche" && <Moon size={10} />}
                                {p.turno || "Tarde"}
                              </span>
                            </td>
                            <td className="py-3 px-4 capitalize text-stone-600 dark:text-stone-300">
                              <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-[11px] font-medium">
                                {p.modalidad || (p.mesa_numero ? "Mesa" : "Retiro")}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-stone-600 dark:text-stone-400 text-xs">
                              {p.cajero || "Cajero Principal"}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                  esQr
                                    ? "bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-300"
                                    : "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300"
                                }`}
                              >
                                {esQr ? <QrCode size={12} /> : <Banknote size={12} />}
                                {esQr ? "QR Simple" : "Efectivo"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="font-mono font-black text-sm text-amber-950 dark:text-amber-300">
                                Bs {p.monto.toFixed(2)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => {
                                  soundManager.playClick();
                                  setReciboModalPago(p);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 text-stone-700 dark:text-stone-300 hover:text-amber-900 text-xs font-bold transition flex items-center gap-1 mx-auto"
                                title="Ver comprobante"
                              >
                                <Eye size={12} />
                                <span>Recibo</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── HISTORIAL DE AUDITORÍA DE ARQUEOS DE CAJA POR TURNO ── */}
            <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <ShieldCheck size={20} className="text-emerald-600" />
                    Auditoría de Cierres de Caja & Cuadres de Gaveta
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Historial de apertura, efectivo esperado, arqueo ciego y diferencia registrada por cajero en cada turno.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-50 dark:bg-stone-800/80 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200 dark:border-stone-800 text-[11px]">
                      <th className="py-3 px-4">Sesión ID</th>
                      <th className="py-3 px-4">Turno</th>
                      <th className="py-3 px-4">Cajero</th>
                      <th className="py-3 px-4 text-right">Fondo Inicial</th>
                      <th className="py-3 px-4 text-right">Ventas Totales</th>
                      <th className="py-3 px-4 text-right">Efectivo Esperado</th>
                      <th className="py-3 px-4 text-right">Efectivo Contado</th>
                      <th className="py-3 px-4 text-center">Diferencia</th>
                      <th className="py-3 px-4">Notas de Auditoría</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {(historialSesiones && historialSesiones.length > 0 ? historialSesiones : []).map((s) => {
                      const diferencia = s.diferencia ?? 0;
                      const esCuadreExacto = Math.abs(diferencia) < 0.01;

                      return (
                        <tr key={s.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                          <td className="py-3 px-4 font-mono font-bold text-stone-700 dark:text-stone-300">
                            {s.id}
                          </td>
                          <td className="py-3 px-4 capitalize font-semibold">
                            {s.turno}
                          </td>
                          <td className="py-3 px-4 text-stone-600 dark:text-stone-400">
                            {s.cajero}
                          </td>
                          <td className="py-3 px-4 text-right font-mono">
                            Bs {s.efectivo_inicial.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-amber-950 dark:text-amber-300">
                            Bs {s.total_ventas.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono">
                            Bs {s.efectivo_esperado.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold">
                            Bs {s.efectivo_contado?.toFixed(2) || s.efectivo_esperado.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                                esCuadreExacto
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : diferencia > 0
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                              }`}
                            >
                              {esCuadreExacto ? "Cuadre Exacto (Bs 0.00)" : `Bs ${diferencia.toFixed(2)}`}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-stone-500 text-[11px] italic max-w-xs truncate">
                            {s.notas || "Sin incidencias reportadas"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top 5 Productos con barras de progreso */}
            <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Sparkles size={18} className="text-amber-600" />
                Top 5 Productos Estrella y Contribución de Ganancia
              </h3>
              <div className="space-y-3">
                {[
                  { nombre: "Café Pasado Yungas (Caranavi)", ventas: 64, total: "Bs 768.00", pct: 95, margen: "72%" },
                  { nombre: "Croissant Mantequilla Francés", ventas: 52, total: "Bs 936.00", pct: 82, margen: "68%" },
                  { nombre: "Cappuccino Artesanal Doble", ventas: 41, total: "Bs 902.00", pct: 70, margen: "70%" },
                  { nombre: "Cuñapé Caliente al Horno", ventas: 38, total: "Bs 304.00", pct: 60, margen: "64%" },
                  { nombre: "Marraqueta con Queso Criollo", ventas: 29, total: "Bs 406.00", pct: 45, margen: "65%" },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-stone-900 dark:text-stone-100">
                        {idx + 1}. {item.nombre}
                      </span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-emerald-600 text-[11px]">Margen: {item.margen}</span>
                        <span className="text-amber-900 dark:text-amber-400">
                          {item.total} ({item.ventas} u.)
                        </span>
                      </div>
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
                      src={formQr.url || "/img/logo/logo.png"}
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

        {/* ── TAB: QRS DINÁMICOS POR MESA (IMPRIMIBLES) ── */}
        {tabActiva === "qr_mesas" && (
          <div className="space-y-6">
            <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <QrCode size={20} className="text-amber-600" />
                  Tarjetas QR Autoservicio por Mesa
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Cada código QR enlaza al comensal con su número de mesa exacto para enviar la orden directo al mesero y cocina.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/menu-pdf"
                  target="_blank"
                  className="px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 text-xs font-bold transition flex items-center gap-2 border border-stone-200 dark:border-stone-700"
                >
                  <FileText size={15} className="text-[#527953]" />
                  <span>Ver Menú PDF</span>
                </Link>

                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-xl bg-amber-900 dark:bg-amber-600 hover:bg-amber-950 text-white text-xs font-bold shadow-md transition flex items-center gap-2 active:scale-95"
                >
                  <Printer size={15} />
                  <span>Imprimir Todos los QRs</span>
                </button>
              </div>
            </div>

            {/* Ajuste de Host / URL Base */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-stone-900/60 border border-amber-200/80 dark:border-amber-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <LinkIcon size={16} className="text-amber-700 dark:text-amber-400" />
                <span className="font-bold text-amber-950 dark:text-amber-200">
                  Dominio / IP Base para escanear en red local o celular:
                </span>
              </div>
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <input
                  type="text"
                  value={baseUrlMesas}
                  onChange={(e) => setBaseUrlMesas(e.target.value)}
                  placeholder="http://192.168.1.5:3000 o https://tu-dominio.com"
                  className="w-full p-2 rounded-xl bg-white dark:bg-stone-800 border border-amber-300 dark:border-stone-700 font-mono text-xs"
                />
              </div>
            </div>

            {/* Grilla de Tarjetas Imprimibles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 print:grid-cols-2 print:gap-8">
              {mesas.map((m) => {
                const zonaNombre = zonas.find((z) => z.id === m.zona_id)?.nombre || "Salón";
                const mesaUrl = `${baseUrlMesas || "https://tienda.denckerpan.com"}/mesa/${m.numero}`;

                return (
                  <div
                    key={m.id}
                    className="p-6 rounded-3xl bg-white dark:bg-stone-900 border-2 border-amber-200/80 dark:border-amber-900/40 shadow-sm flex flex-col items-center text-center justify-between space-y-4 break-inside-avoid print:border-black print:p-6"
                  >
                    <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100">
                      <img
                        src="/img/logo/logo.png"
                        alt="Logo"
                        className="w-7 h-7 object-contain"
                      />
                      <span className="font-serif font-black text-sm tracking-wider uppercase">
                        Dencker Pan
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="font-serif text-2xl font-black text-amber-950 dark:text-amber-300">
                        MESA {m.numero}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#527953] bg-[#EBF3EA] px-2.5 py-0.5 rounded-full inline-block">
                        {zonaNombre} • {m.capacidad} Pers.
                      </span>
                    </div>

                    {/* QR Code SVG Vectorial */}
                    <div className="p-3 bg-white rounded-2xl border border-stone-200 shadow-inner flex items-center justify-center">
                      <QRCodeSVG
                        value={mesaUrl}
                        size={130}
                        level="M"
                      />
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] font-medium text-stone-600 dark:text-stone-300 leading-tight">
                        Escanea para ver el menú y ordenar
                      </p>
                      <p className="text-[9px] font-mono text-stone-400 truncate max-w-[200px]">
                        {mesaUrl}
                      </p>
                    </div>

                    <div className="w-full pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-center gap-2 print:hidden">
                      <Link
                        href={`/mesa/${m.numero}`}
                        target="_blank"
                        className="flex-1 py-1.5 px-2 rounded-xl bg-amber-900 dark:bg-amber-700 hover:bg-amber-950 text-white text-[11px] font-bold text-center transition"
                      >
                        Abrir Mesa
                      </Link>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(mesaUrl);
                          soundManager.playSuccessTone();
                          alert(`¡Enlace copiado de Mesa ${m.numero}!`);
                        }}
                        className="p-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100"
                        title="Copiar enlace"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
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

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playClick();
                        setProductoParaGaleria(productoAEditar);
                        setGaleriaFotosAbierta(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-900 dark:text-amber-200 font-bold text-xs border border-amber-500/40 hover:bg-amber-500/30 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <ImageIcon size={14} className="text-amber-600" />
                      <span>Elegir Foto Real ({REAL_PRODUCT_PHOTOS.length})</span>
                    </button>

                    <button
                      type="button"
                      disabled={subiendoImgBB}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-amber-900 dark:bg-amber-700 text-white font-bold text-xs hover:bg-amber-950 transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
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
                      className="flex-1 min-w-[140px] p-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
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

      {/* ── Modal Comprobante / Recibo Digital Detallado ── */}
      <AnimatePresence>
        {reciboModalPago && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl shadow-2xl p-6 space-y-4 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100"
            >
              {/* Encabezado Ticket Térmico */}
              <div className="flex items-center justify-between pb-3 border-b border-dashed border-stone-300 dark:border-stone-700">
                <div className="flex items-center gap-2">
                  <img
                    src="/img/logo/logo.png"
                    alt="Logo Dencker Pan"
                    className="w-7 h-7 object-contain"
                  />
                  <div>
                    <h3 className="font-serif font-black text-sm tracking-wider uppercase">
                      Dencker Pan
                    </h3>
                    <p className="text-[10px] text-stone-500">Cafetería & Panadería Artesanal</p>
                  </div>
                </div>
                <button
                  onClick={() => setReciboModalPago(null)}
                  className="p-1 rounded-full text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Cuerpo del Recibo */}
              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between text-stone-500">
                  <span>Nº Comprobante:</span>
                  <span className="font-bold text-stone-900 dark:text-stone-100">{reciboModalPago.id}</span>
                </div>
                <div className="flex items-center justify-between text-stone-500">
                  <span>Fecha & Hora:</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {new Date(reciboModalPago.created_at).toLocaleString("es-BO")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-stone-500">
                  <span>Turno:</span>
                  <span className="font-bold uppercase text-amber-800 dark:text-amber-400">
                    {reciboModalPago.turno || "Tarde"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-stone-500">
                  <span>Cajero:</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {reciboModalPago.cajero || "Cajero Principal"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-stone-500">
                  <span>Cliente:</span>
                  <span className="font-bold text-stone-900 dark:text-stone-100">
                    {reciboModalPago.cliente_nombre || "Cliente Mostrador"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-stone-500">
                  <span>Destino / Mesa:</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {reciboModalPago.mesa_numero ? `Mesa ${reciboModalPago.mesa_numero}` : "Para Llevar / Retiro"}
                  </span>
                </div>

                <div className="pt-2 border-t border-dashed border-stone-300 dark:border-stone-700" />

                <div className="flex items-center justify-between text-sm py-1 font-bold">
                  <span>Total Pagado:</span>
                  <span className="font-serif text-lg text-emerald-700 dark:text-emerald-400 font-mono">
                    Bs {reciboModalPago.monto.toFixed(2)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-1">
                  <div className="flex items-center justify-between font-bold text-[11px]">
                    <span className="text-stone-600 dark:text-stone-300">Método de Cobro:</span>
                    <span className="text-stone-900 dark:text-stone-100 uppercase">
                      {reciboModalPago.metodo === "qr" ? "QR Simple BNB/BCP" : "Efectivo BOB"}
                    </span>
                  </div>
                  {reciboModalPago.metodo === "efectivo" && (
                    <div className="flex items-center justify-between text-[11px] text-stone-500">
                      <span>Recibido: Bs {(reciboModalPago.monto_recibido || reciboModalPago.monto).toFixed(2)}</span>
                      <span>Cambio: Bs {(reciboModalPago.cambio || 0).toFixed(2)}</span>
                    </div>
                  )}
                  {reciboModalPago.metodo === "qr" && (
                    <div className="text-[10px] text-purple-700 dark:text-purple-300">
                      Liquidación inmediata Interoperable ASFI ✓
                    </div>
                  )}
                </div>

                {/* Código QR de validación */}
                <div className="py-2 flex flex-col items-center justify-center space-y-1">
                  <div className="p-2 bg-white rounded-xl border border-stone-200 shadow-inner">
                    <QRCodeSVG
                      value={`https://decker-pan.vercel.app/comprobante/${reciboModalPago.id}`}
                      size={90}
                    />
                  </div>
                  <span className="text-[9px] text-stone-400">Escanea para verificar validez digital</span>
                </div>

                <p className="text-[10px] text-center text-stone-400 italic">
                  NIT: 1028492023 • Facturación Computarizada en Línea
                  <br />
                  ¡Gracias por su visita a Dencker Pan!
                </p>
              </div>

              {/* Botones de Acción */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <button
                  onClick={() => {
                    soundManager.playTactileClick();
                    window.print();
                  }}
                  className="py-2.5 rounded-xl bg-amber-900 dark:bg-amber-600 hover:bg-amber-950 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Printer size={14} />
                  <span>Imprimir</span>
                </button>
                <button
                  onClick={() => setReciboModalPago(null)}
                  className="py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs hover:bg-stone-200 transition text-center"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ── Modal Crear / Editar Colaborador ── */}
        {modalStaffAbierto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl p-6 space-y-4 border border-stone-200 dark:border-stone-800"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    <Users size={18} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                      {usuarioStaffAEditar ? "Editar Colaborador" : "Nuevo Colaborador"}
                    </h3>
                    <p className="text-[11px] text-stone-400">
                      Asigna estación y PIN de seguridad de 4 dígitos
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModalStaffAbierto(false)}
                  className="p-1.5 rounded-full text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleGuardarStaff} className="space-y-3.5 text-xs">
                {/* Nombre Completo */}
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Camila Rojas"
                    value={formStaff.nombre}
                    onChange={(e) => setFormStaff({ ...formStaff, nombre: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Rol / Estación */}
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Estación Operativa & Rol *
                  </label>
                  <select
                    value={formStaff.role}
                    onChange={(e) => {
                      const newRole = e.target.value as StaffRole;
                      const defaultCargos: Record<StaffRole, string> = {
                        mesero: "Mesero de Salón & Terraza",
                        cocina: "Jefe de Cocina & Barismo",
                        caja: "Cajero de Turno & POS",
                        admin: "Administrador General",
                      };
                      setFormStaff({
                        ...formStaff,
                        role: newRole,
                        cargo: formStaff.cargo === "" || Object.values(defaultCargos).includes(formStaff.cargo)
                          ? defaultCargos[newRole]
                          : formStaff.cargo,
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="mesero">🍽️ Sala & Mesero (Mesas, Croquis y Comandas)</option>
                    <option value="cocina">👨‍🍳 Cocina & Barismo KDS (Despacho de Tickets)</option>
                    <option value="caja">💳 Caja POS & Facturación (Cobros Efectivo/QR)</option>
                    <option value="admin">👑 Administración SaaS (Control Total y Métricas)</option>
                  </select>
                </div>

                {/* Cargo descriptivo */}
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Cargo / Puesto de Trabajo
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Mesero Salón Turno Mañana"
                    value={formStaff.cargo}
                    onChange={(e) => setFormStaff({ ...formStaff, cargo: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                </div>

                {/* PIN de 4 dígitos */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-stone-700 dark:text-stone-300">
                      Código PIN Táctil (4 Dígitos) *
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerarPinAleatorio}
                      className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1.5 font-semibold cursor-pointer"
                    >
                      <KeyRound size={15} />
                      <span>Generar al azar</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    pattern="\d{4}"
                    placeholder="4 dígitos, ej. 5832"
                    value={formStaff.pin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setFormStaff({ ...formStaff, pin: val });
                    }}
                    className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono text-lg font-bold tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    Este PIN lo digitará el colaborador en la pantalla táctil de su estación.
                  </span>
                </div>

                {/* Teléfono / WhatsApp */}
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Teléfono / WhatsApp (Opcional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+591 76911000"
                    value={formStaff.telefono}
                    onChange={(e) => setFormStaff({ ...formStaff, telefono: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                </div>

                {/* Estado Activo */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  <div>
                    <span className="font-bold text-stone-800 dark:text-stone-200 block text-xs sm:text-sm">
                      Estado de la Cuenta
                    </span>
                    <span className="text-xs text-stone-500">
                      {formStaff.activo ? "Permite iniciar sesión en estación" : "Acceso bloqueado"}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formStaff.activo}
                    onChange={(e) => setFormStaff({ ...formStaff, activo: e.target.checked })}
                    className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                </div>

                {/* Botón Guardar */}
                <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalStaffAbierto(false)}
                    className="px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs sm:text-sm hover:bg-stone-200 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-900 dark:bg-amber-600 hover:bg-amber-950 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Save size={16} />
                    <span>Guardar Colaborador</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal Visualizador del Menú Oficial PDF (6 Páginas) ── */}
      <AnimatePresence>
        {modalPdfAbierto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-5xl bg-stone-900 text-stone-100 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] border border-stone-800 overflow-hidden"
            >
              {/* Header Modal */}
              <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between gap-4 bg-stone-950/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                      Menú Original Dencker Pan
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                        Documento Oficial
                      </span>
                    </h3>
                    <p className="text-xs text-stone-400">
                      Página {paginaPdfActiva + 1} de {MENU_PDF_PAGES.length}: {MENU_PDF_PAGES[paginaPdfActiva]?.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/menu-pdf"
                    target="_blank"
                    className="px-3 py-1.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <ExternalLink size={14} />
                    <span className="hidden sm:inline">Página Completa</span>
                  </Link>
                  <button
                    onClick={() => setModalPdfAbierto(false)}
                    className="p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Selector de Páginas Tabs */}
              <div className="p-2 bg-stone-950/60 border-b border-stone-800 flex items-center gap-2 overflow-x-auto text-xs">
                {MENU_PDF_PAGES.map((pag, idx) => (
                  <button
                    key={pag.page}
                    onClick={() => {
                      soundManager.playTactileClick();
                      setPaginaPdfActiva(idx);
                    }}
                    className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                      paginaPdfActiva === idx
                        ? "bg-amber-500 text-stone-950 shadow-md font-extrabold"
                        : "bg-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800"
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-[10px]">
                      {pag.page}
                    </span>
                    <span>{pag.title}</span>
                  </button>
                ))}
              </div>

              {/* Visualizador de la Página con Zoom/Scroll */}
              <div className="flex-1 overflow-auto p-4 sm:p-6 bg-stone-950 flex items-center justify-center">
                <div className="max-w-3xl w-full rounded-2xl overflow-hidden shadow-2xl border border-stone-800 bg-black">
                  <img
                    src={MENU_PDF_PAGES[paginaPdfActiva]?.url}
                    alt={MENU_PDF_PAGES[paginaPdfActiva]?.title}
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>

              {/* Footer con Descripción y Navegación */}
              <div className="p-4 border-t border-stone-800 bg-stone-950/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-stone-400 italic">
                    Menú oficial de cafetería & panadería artesanal Dencker Pan — Página {MENU_PDF_PAGES[paginaPdfActiva]?.page}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      const pageToCategory: Record<number, string> = {
                        1: "todas",
                        2: "c_desayunos",
                        3: "c_chocolates_tes",
                        4: "c_pasteleria",
                        5: "c_sandwiches",
                        6: "c_pizzas",
                      };
                      const catTarget = pageToCategory[MENU_PDF_PAGES[paginaPdfActiva]?.page] || "todas";
                      setFiltroCategoria(catTarget);
                      setTabActiva("productos");
                      setModalPdfAbierto(false);
                    }}
                    className="ml-2 px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-bold border border-amber-500/30 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <UtensilsCrossed size={12} />
                    <span>Ver Productos de esta Página en Administrador</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={paginaPdfActiva === 0}
                    onClick={() => setPaginaPdfActiva((p) => Math.max(0, p - 1))}
                    className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-300 font-bold cursor-pointer"
                  >
                    ← Anterior
                  </button>
                  <button
                    disabled={paginaPdfActiva === MENU_PDF_PAGES.length - 1}
                    onClick={() => setPaginaPdfActiva((p) => Math.min(MENU_PDF_PAGES.length - 1, p + 1))}
                    className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-300 font-bold cursor-pointer"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal Galería de Fotos Reales de Panadería (169 Imágenes) ── */}
      <AnimatePresence>
        {galeriaFotosAbierta && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-6xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] border border-stone-200 dark:border-stone-800 overflow-hidden text-stone-900 dark:text-stone-100"
            >
              {/* Header Galería */}
              <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-4 bg-stone-50 dark:bg-stone-950/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <ImageIcon size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      Galería de Fotos Reales del Local
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/30">
                        {REAL_PRODUCT_PHOTOS.length} Fotos Reales
                      </span>
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {productoParaGaleria
                        ? `Asignando foto para: "${productoParaGaleria.nombre}" — Haz click en una foto para seleccionarla al instante.`
                        : "Explora o haz click en cualquier foto para asignarla a cualquier producto del menú o copiar su enlace."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-2.5 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Buscar por archivo..."
                      value={busquedaFoto}
                      onChange={(e) => setBusquedaFoto(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none w-44 sm:w-56"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setGaleriaFotosAbierta(false);
                      setProductoParaGaleria(null);
                      setFotoSeleccionadaGaleria(null);
                    }}
                    className="p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 transition cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Barra de Filtros de Fotos */}
              <div className="px-4 py-2 bg-stone-100/70 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex items-center gap-2 overflow-x-auto text-xs">
                <button
                  type="button"
                  onClick={() => setFiltroTipoFoto("todas")}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                    filtroTipoFoto === "todas"
                      ? "bg-amber-900 dark:bg-amber-700 text-white"
                      : "bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-300"
                  }`}
                >
                  Todas ({REAL_PRODUCT_PHOTOS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroTipoFoto("productos")}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                    filtroTipoFoto === "productos"
                      ? "bg-amber-900 dark:bg-amber-700 text-white"
                      : "bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-300"
                  }`}
                >
                  Platos & Masas Reales ({REAL_PRODUCT_PHOTOS.filter((u) => u.includes("/img/products/")).length})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroTipoFoto("marca")}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                    filtroTipoFoto === "marca"
                      ? "bg-amber-900 dark:bg-amber-700 text-white"
                      : "bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-300"
                  }`}
                >
                  Marca & Don Dencker ({REAL_PRODUCT_PHOTOS.filter((u) => u.includes("/img/brand/")).length})
                </button>
              </div>

              {/* Grid Scrollable de Fotos */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-100 dark:bg-stone-950">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {REAL_PRODUCT_PHOTOS
                    .filter((fotoUrl) => {
                      const matchBusqueda = fotoUrl.toLowerCase().includes(busquedaFoto.toLowerCase());
                      if (!matchBusqueda) return false;
                      if (filtroTipoFoto === "productos") return fotoUrl.includes("/img/products/");
                      if (filtroTipoFoto === "marca") return fotoUrl.includes("/img/brand/");
                      return true;
                    })
                    .map((fotoUrl, idx) => {
                      const fileName = fotoUrl.split("/").pop() || fotoUrl;
                      const prodUsando = productos.find((p) => p.imagen_url === fotoUrl);
                      const esSeleccionada = fotoSeleccionadaGaleria === fotoUrl;

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (productoParaGaleria) {
                              soundManager.playSuccessTone();
                              updateProducto(productoParaGaleria.id, { imagen_url: fotoUrl });
                              setFormProducto((prev) => ({ ...prev, imagen_url: fotoUrl }));
                              setGaleriaFotosAbierta(false);
                              setProductoParaGaleria(null);
                            } else {
                              soundManager.playTactileClick();
                              setFotoSeleccionadaGaleria(fotoUrl);
                              if (prodUsando) {
                                setProductoDestinoFotoId(prodUsando.id);
                              }
                            }
                          }}
                          className={`group relative flex flex-col bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border shadow-xs transition text-left cursor-pointer ${
                            esSeleccionada
                              ? "ring-3 ring-amber-500 border-amber-500"
                              : "border-stone-200 dark:border-stone-800 hover:border-amber-500 dark:hover:border-amber-500"
                          }`}
                        >
                          <div className="relative aspect-square w-full overflow-hidden bg-stone-200 dark:bg-stone-800">
                            <img
                              src={fotoUrl}
                              alt={fileName}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                            <div className="absolute inset-0 bg-amber-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2 text-center">
                              <CheckCircle2 size={24} className="text-amber-300 mb-1" />
                              <span className="text-[11px] font-bold">
                                {productoParaGaleria ? "Asignar Ahora" : "Seleccionar"}
                              </span>
                            </div>
                          </div>
                          <div className="p-2 space-y-0.5">
                            <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400 truncate block">
                              {fileName}
                            </span>
                            {prodUsando ? (
                              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 truncate block">
                                ✓ {prodUsando.nombre}
                              </span>
                            ) : (
                              <span className="text-[9px] text-stone-400 dark:text-stone-500 truncate block">
                                Disponible
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Panel de Asignación si se seleccionó una foto sin producto previo */}
              {fotoSeleccionadaGaleria && !productoParaGaleria && (
                <div className="p-3.5 bg-amber-500/10 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={fotoSeleccionadaGaleria}
                      alt="Seleccionada"
                      className="w-10 h-10 rounded-xl object-cover border border-amber-400"
                    />
                    <div>
                      <span className="font-bold text-amber-950 dark:text-amber-200 block">
                        Foto: {fotoSeleccionadaGaleria.split("/").pop()}
                      </span>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400">
                        {productos.find((p) => p.imagen_url === fotoSeleccionadaGaleria)
                          ? `Asignada a: ${productos.find((p) => p.imagen_url === fotoSeleccionadaGaleria)?.nombre}`
                          : "Foto sin asignar a ningún producto"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={productoDestinoFotoId}
                      onChange={(e) => setProductoDestinoFotoId(e.target.value)}
                      className="p-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 max-w-xs focus:outline-none"
                    >
                      <option value="">-- Asignar esta foto a un producto --</option>
                      {productos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} (Bs {p.precio.toFixed(2)})
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      disabled={!productoDestinoFotoId}
                      onClick={() => {
                        if (productoDestinoFotoId) {
                          updateProducto(productoDestinoFotoId, { imagen_url: fotoSeleccionadaGaleria });
                          soundManager.playSuccessTone();
                          setFotoSeleccionadaGaleria(null);
                          setProductoDestinoFotoId("");
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-amber-900 dark:bg-amber-700 text-white font-bold hover:bg-amber-950 disabled:opacity-40 transition cursor-pointer"
                    >
                      ✓ Asignar Foto
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(fotoSeleccionadaGaleria);
                        soundManager.playTactileClick();
                      }}
                      className="p-2 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 transition cursor-pointer"
                      title="Copiar ruta"
                    >
                      <Copy size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setFotoSeleccionadaGaleria(null)}
                      className="p-2 rounded-xl text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Footer con acción de cierre */}
              <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/80 flex items-center justify-between text-xs">
                <span className="text-stone-500">
                  Mostrando {REAL_PRODUCT_PHOTOS.length} imágenes auténticas de Dencker Pan
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setGaleriaFotosAbierta(false);
                    setProductoParaGaleria(null);
                    setFotoSeleccionadaGaleria(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold hover:bg-stone-300 cursor-pointer"
                >
                  Cerrar Galería
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </StaffAuthGuard>
  );
}

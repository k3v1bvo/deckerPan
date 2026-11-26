"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Receipt,
  QrCode,
  Banknote,
  Calculator,
  Printer,
  CheckCircle2,
  AlertCircle,
  Users,
  Clock,
  ArrowRight,
  Split,
  FileText,
  DollarSign,
  X,
  CreditCard,
  Star,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useSystemStore } from "@/store";
import { Pedido, MetodoPago, BILLETES_BOLIVIANOS, FacturaEmitida } from "@/types";
import { soundManager } from "@/lib/sound";
import StaffAuthGuard from "@/components/StaffAuthGuard";
import { DENCKER_ASSETS } from "@/lib/seed-data";
import { printElementById } from "@/lib/print";
import { convertirNumeroALiteral } from "@/lib/siat-utils";

export default function CajaPage() {
  const {
    pedidos,
    mesas,
    sesionCaja,
    qrBancarioUrl,
    qrBancarioTitular,
    qrBancarioBanco,
    registrarPago,
    abrirCaja,
    cerrarCaja,
    facturacionSiatConfig,
    emitirFacturaSiat,
  } = useSystemStore();

  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("efectivo");
  const [montoRecibido, setMontoRecibido] = useState<number>(0);
  const [modoEntradaEfectivo, setModoEntradaEfectivo] = useState<"directo" | "acumular">("directo");
  const [billetesRecibidosList, setBilletesRecibidosList] = useState<number[]>([]);
  const [splitPersonas, setSplitPersonas] = useState<number>(1);
  const [modalArqueoAbierto, setModalArqueoAbierto] = useState(false);
  const [modalReciboAbierto, setModalReciboAbierto] = useState(false);
  const [pagoCompletado, setPagoCompletado] = useState(false);
  const [facturaEmitidaActual, setFacturaEmitidaActual] = useState<FacturaEmitida | null>(null);
  const [nitCiCliente, setNitCiCliente] = useState("0");
  const [razonSocialCliente, setRazonSocialCliente] = useState("");
  const [tipoComprobante, setTipoComprobante] = useState<"recibo" | "factura">("recibo");
  const [fechaHoraImpresion, setFechaHoraImpresion] = useState<string>("");

  // Arqueo conteo de billetes
  const [conteoBilletes, setConteoBilletes] = useState<Record<number, number>>({
    200: 0,
    100: 0,
    50: 0,
    20: 0,
    10: 0,
    5: 0,
    2: 0,
    1: 0,
    0.5: 0,
  });
  const [notasCierre, setNotasCierre] = useState("");

  const [propinaPct, setPropinaPct] = useState<number>(0);
  const [propinaCustom, setPropinaCustom] = useState<number>(0);

  // Pedidos pendientes de pago
  const pedidosPendientes = useMemo(() => {
    return pedidos.filter((p) => p.estado !== "pagado" && p.estado !== "cancelado");
  }, [pedidos]);

  // Total de la orden actual con propina
  const subtotalPagar = pedidoSeleccionado ? pedidoSeleccionado.total : 0;
  const montoPropina = propinaPct > 0 
    ? Math.round(subtotalPagar * (propinaPct / 100) * 10) / 10 
    : propinaCustom;
  const totalPagar = subtotalPagar + montoPropina;
  const montoPorPersona = splitPersonas > 1 ? totalPagar / splitPersonas : totalPagar;
  const cambio = Math.max(0, montoRecibido - totalPagar);

  // Desglose sugerido de billetes y monedas bolivianas para el vuelto
  const desgloseCambio = useMemo(() => {
    if (cambio <= 0) return [];
    let rem = cambio;
    const resultado: { valor: number; label: string; cantidad: number }[] = [];
    const denominaciones = [200, 100, 50, 20, 10, 5, 2, 1, 0.5];

    for (const d of denominaciones) {
      if (rem >= d) {
        const cant = Math.floor(rem / d);
        resultado.push({
          valor: d,
          label: d >= 1 ? `Bs ${d}` : `${d * 100} ctv`,
          cantidad: cant,
        });
        rem = Math.round((rem - cant * d) * 10) / 10;
      }
    }
    return resultado;
  }, [cambio]);

  // Conteo total del arqueo
  const totalArqueoContado = useMemo(() => {
    return Object.entries(conteoBilletes).reduce((sum, [denom, cant]) => {
      return sum + parseFloat(denom) * (cant || 0);
    }, 0);
  }, [conteoBilletes]);

  const seleccionarPedido = (p: Pedido) => {
    soundManager.playTactileClick();
    setPedidoSeleccionado(p);
    setMontoRecibido(p.total);
    setBilletesRecibidosList([]);
    setSplitPersonas(1);
    setPropinaPct(0);
    setPropinaCustom(0);
    setPagoCompletado(false);
  };

  const agregarBillete = (valor: number) => {
    soundManager.playCoinRattle();
    if (modoEntradaEfectivo === "directo") {
      setMontoRecibido(valor);
      setBilletesRecibidosList([valor]);
    } else {
      setBilletesRecibidosList((prev) => [...prev, valor]);
      setMontoRecibido((prev) => {
        if (billetesRecibidosList.length === 0 && prev === totalPagar) {
          return valor;
        }
        return Number((prev + valor).toFixed(2));
      });
    }
  };

  const removerBilleteRecibido = (index: number) => {
    soundManager.playClick();
    const nuevaLista = billetesRecibidosList.filter((_, i) => i !== index);
    setBilletesRecibidosList(nuevaLista);
    const nuevoTotal = nuevaLista.reduce((acc, curr) => acc + curr, 0);
    setMontoRecibido(Number(nuevoTotal.toFixed(2)));
  };

  const deshacerUltimoBillete = () => {
    if (billetesRecibidosList.length === 0) {
      setMontoRecibido(0);
      return;
    }
    soundManager.playClick();
    const nuevaLista = billetesRecibidosList.slice(0, -1);
    setBilletesRecibidosList(nuevaLista);
    const nuevoTotal = nuevaLista.reduce((acc, curr) => acc + curr, 0);
    setMontoRecibido(Number(nuevoTotal.toFixed(2)));
  };

  const limpiarEfectivo = () => {
    soundManager.playClick();
    setMontoRecibido(0);
    setBilletesRecibidosList([]);
  };

  const pagarMontoJusto = () => {
    soundManager.playSuccessTone();
    setMontoRecibido(totalPagar);
    setBilletesRecibidosList([]);
  };

  const procesarCobro = () => {
    if (!pedidoSeleccionado) return;

    registrarPago(pedidoSeleccionado.id, {
      pedido_id: pedidoSeleccionado.id,
      monto: totalPagar,
      metodo: metodoPago,
      monto_recibido: montoRecibido,
      cambio,
      estado: "completado",
      items_pagados: (pedidoSeleccionado.items || []).map((i) => i.id),
      cliente_nombre:
        razonSocialCliente.trim() ||
        pedidoSeleccionado.cliente_nombre ||
        (pedidoSeleccionado.mesa_numero ? `Mesa ${pedidoSeleccionado.mesa_numero}` : "Cliente Mostrador"),
      mesa_numero: pedidoSeleccionado.mesa_numero,
      turno: sesionCaja?.turno || (new Date().getHours() < 14 ? "manana" : new Date().getHours() < 19 ? "tarde" : "noche"),
      cajero: sesionCaja?.cajero || "Caja Principal",
      modalidad: pedidoSeleccionado.mesa_numero ? "mesa" : "retiro",
    });

    if (tipoComprobante === "factura" && facturacionSiatConfig.activa) {
      const fac = emitirFacturaSiat({
        pedidoId: pedidoSeleccionado.id,
        clienteNombre: razonSocialCliente.trim() || pedidoSeleccionado.cliente_nombre || "Sin Nombre",
        clienteNitCi: nitCiCliente.trim() || "0",
        montoTotal: totalPagar,
      });
      setFacturaEmitidaActual(fac);
    } else {
      setFacturaEmitidaActual(null);
    }

    setFechaHoraImpresion(new Date().toLocaleString("es-BO"));
    // 💰 ¡Sonido icónico de Caja Registradora Antigua de Bronce Ka-Ching!
    soundManager.playCashRegister();
    setPagoCompletado(true);
    setModalReciboAbierto(true);
  };

  const imprimirRecibo = () => {
    soundManager.playTactileClick();
    printElementById("recibo-termico", {
      pageType: "thermal",
      title: `Ticket_Dencker_${pedidoSeleccionado?.id || "Recibo"}`,
    });
  };

  const ejecutarCierreCaja = () => {
    cerrarCaja(totalArqueoContado, notasCierre);
    soundManager.playCashRegister();
    setModalArqueoAbierto(false);
  };

  return (
    <StaffAuthGuard requiredRole="caja" roleTitle="Caja POS & Facturación">
      <div className="min-h-screen bg-[#F2ECE1] text-[#1E130C] pb-24 font-sans selection:bg-amber-200">
      {/* Header Caja */}
      <header className="sticky top-0 z-40 bg-[#1E130C] text-white px-4 lg:px-6 py-3.5 shadow-2xl border-b-2 border-amber-500/30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 p-1 border-2 border-amber-500/40 flex items-center justify-center shrink-0 shadow-inner">
              <img
                src={DENCKER_ASSETS.logoLight}
                alt="Don Dencker"
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-base lg:text-xl font-black tracking-tight text-white truncate max-w-[220px] sm:max-w-none">
                  Caja &amp; Facturación POS
                </h1>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#991B24] text-white border border-amber-400/50 shadow-xs">
                  Dencker Pan
                </span>
              </div>
              <p className="text-amber-200/90 text-xs font-medium">
                Cobro en Bolivianos (Bs), QR Simple ASFI, Split de cuenta y arqueo de turno &bull; Cochabamba
              </p>
            </div>
          </div>

          {/* Estado de Turno & Arqueo */}
          <div className="flex items-center gap-3">
            <div className="text-right text-xs">
              <span className="text-stone-300 block font-medium">Ventas del Turno:</span>
              <span className="font-bold text-amber-300 text-sm sm:text-base font-mono">
                Bs {sesionCaja?.total_ventas.toFixed(2) || "0.00"}
              </span>
            </div>

            <button
              onClick={() => setModalArqueoAbierto(true)}
              className="px-4 py-2.5 rounded-xl bg-[#991B24] hover:bg-[#7F1D1D] text-white text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer border-2 border-amber-400/60 active:scale-95"
            >
              <Calculator size={15} className="text-amber-300" /> Cierre &amp; Arqueo
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Columna Izquierda: Cola de Mesas y Pedidos Pendientes */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-black text-[#1E130C] flex items-center gap-2">
              <span>📋</span> Cuentas Pendientes ({pedidosPendientes.length})
            </h2>
          </div>

          {pedidosPendientes.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border-2 border-[#D5C7B5] shadow-md space-y-2">
              <CheckCircle2 size={40} className="mx-auto text-emerald-600" />
              <p className="text-sm font-bold text-stone-900">Sin cuentas pendientes de cobro</p>
              <p className="text-xs text-stone-600">
                Todas las mesas activas están al día con sus pagos.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pedidosPendientes.map((p) => {
                const isSelected = pedidoSeleccionado?.id === p.id;
                return (
                  <motion.div
                    key={p.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => seleccionarPedido(p)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all shadow-sm ${
                      isSelected
                        ? "bg-[#FFFBF5] border-[#991B24] ring-2 ring-[#991B24]/30 shadow-md"
                        : "bg-white border-[#D5C7B5] hover:border-amber-600 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-lg font-black text-[#1E130C]">
                          Mesa {p.mesa_numero}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 font-bold border border-amber-300">
                          {p.cliente_nombre || "Cliente"}
                        </span>
                      </div>
                      <span className="font-mono text-xl font-black text-[#991B24]">
                        Bs {p.total.toFixed(2)}
                      </span>
                    </div>

                    <div className="text-xs text-stone-600 flex items-center justify-between border-t border-stone-200 pt-2 font-medium">
                      <span>{p.items?.length || 0} ítems pedidos</span>
                      <span className="text-[#991B24] font-bold flex items-center gap-1">
                        Cobrar mesa <ArrowRight size={13} />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Columna Derecha: Terminal de Cobro */}
        <div className="lg:col-span-7">
          {pedidoSeleccionado ? (
            <div className="bg-white rounded-3xl border-2 border-[#D5C7B5] shadow-xl p-6 sm:p-7 space-y-6">
              {/* Header Comanda a Cobrar con Pantalla POS de Alto Contraste */}
              <div className="bg-[#1E130C] text-white p-5 rounded-2xl shadow-md border-2 border-amber-500/40 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-amber-400 font-mono text-xs uppercase tracking-wider font-bold block">
                    Orden #{pedidoSeleccionado.id.slice(-4)} &bull; Mesa {pedidoSeleccionado.mesa_numero}
                  </span>
                  <h3 className="font-serif text-2xl font-black text-white">
                    Total a Cobrar
                  </h3>
                  <span className="text-stone-300 text-xs">
                    Cliente: <strong>{pedidoSeleccionado.cliente_nombre || "Mesa " + pedidoSeleccionado.mesa_numero}</strong>
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-serif text-3xl sm:text-4xl font-black text-amber-300 font-mono tracking-tight block">
                    Bs {totalPagar.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-amber-200/90 font-sans font-medium">
                    {splitPersonas > 1 ? `(${splitPersonas} comensales: Bs ${montoPorPersona.toFixed(2)} c/u)` : "Pago completo de la cuenta"}
                  </span>
                </div>
              </div>

              {/* Detalle de Productos en Panel Inset Nítido */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-stone-700 uppercase tracking-wider block">
                  Consumo de la Mesa
                </label>
                <div className="max-h-44 overflow-y-auto divide-y divide-[#EADFCF] bg-[#FBF9F5] border-2 border-[#E0D3C1] rounded-2xl p-3.5 shadow-2xs">
                  {pedidoSeleccionado.items?.map((it) => (
                    <div key={it.id} className="py-2 flex justify-between items-center text-xs">
                      <div className="pr-2">
                        <span className="text-stone-950 font-bold">
                          {it.cantidad}x {it.producto_nombre}
                        </span>
                        {it.tamanio && (
                          <span className="ml-1.5 text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                            {it.tamanio}
                          </span>
                        )}
                        {it.asiento_numero && (
                          <span className="block text-[10px] text-stone-500 font-medium">
                            👤 Silla {it.asiento_numero} {it.comensal_nombre ? `(${it.comensal_nombre})` : ""}
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-black text-stone-950 text-sm shrink-0">
                        Bs {it.subtotal.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selector de Split / División de Cuenta con Alto Contraste */}
              <div className="bg-[#FAF6EF] p-4 rounded-2xl border-2 border-[#D8C7B2] shadow-2xs space-y-3">
                <div className="flex items-center justify-between text-xs font-black text-amber-950">
                  <span className="flex items-center gap-1.5">
                    <Split size={14} className="text-[#991B24]" /> Dividir Cuenta (Split Equitativo)
                  </span>
                  <span className="bg-amber-200/80 px-2 py-0.5 rounded-full text-amber-950 font-mono font-bold">
                    {splitPersonas} personas
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSplitPersonas(num)}
                      className={`flex-1 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                        splitPersonas === num
                          ? "bg-[#991B24] text-white shadow-md border-2 border-[#7F1D1D]"
                          : "bg-white hover:bg-stone-50 text-stone-800 border-2 border-stone-300 shadow-2xs"
                      }`}
                    >
                      {num === 1 ? "Total" : `${num} pers.`}
                    </button>
                  ))}
                </div>
                {splitPersonas > 1 && (
                  <div className="pt-2 border-t-2 border-[#D8C7B2] space-y-2">
                    <div className="text-xs text-amber-950 font-black flex justify-between items-center">
                      <span>Monto por comensal:</span>
                      <span className="font-mono text-sm bg-amber-300 text-stone-950 px-2.5 py-0.5 rounded-lg border border-amber-400 font-black">
                        Bs {montoPorPersona.toFixed(2)} c/u
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                      {Array.from({ length: splitPersonas }).map((_, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2 rounded-xl bg-white border-2 border-amber-300 text-[11px] shadow-2xs"
                        >
                          <span className="w-6 h-6 rounded-full bg-[#991B24] text-white font-black flex items-center justify-center text-[10px] shrink-0">
                            {idx + 1}
                          </span>
                          <div className="leading-tight">
                            <span className="text-[10px] text-stone-600 font-bold block">Comensal {idx + 1}</span>
                            <span className="font-mono font-black text-stone-950 text-xs">
                              Bs {montoPorPersona.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Selector de Propina Sugerida */}
              <div className="bg-[#FAF6EF] p-3.5 rounded-2xl border-2 border-[#D8C7B2] flex flex-wrap items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-black text-stone-900">
                  <Star size={15} className="text-amber-500 fill-amber-500" />
                  <span>Propina Voluntaria:</span>
                </div>
                <div className="flex items-center gap-2">
                  {[0, 5, 10, 15].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        setPropinaPct(pct);
                        soundManager.playTactileClick();
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                        propinaPct === pct
                          ? "bg-[#1E130C] text-amber-300 border-2 border-amber-500 shadow-sm"
                          : "bg-white hover:bg-stone-50 text-stone-800 border-2 border-stone-300 shadow-2xs"
                      }`}
                    >
                      {pct === 0 ? "Sin propina" : `+${pct}% (Bs ${(subtotalPagar * pct / 100).toFixed(1)})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Método de Pago Tabs de Alto Contraste */}
              <div>
                <label className="text-xs font-black text-stone-800 uppercase tracking-wider block mb-2">
                  Selecciona Método de Pago
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(
                    [
                      { id: "efectivo", label: "Efectivo (Bs)", icon: Banknote },
                      { id: "qr", label: "QR Simple ASFI", icon: QrCode },
                      { id: "mixto", label: "Pago Mixto", icon: CreditCard },
                    ] as const
                  ).map((m) => {
                    const Icon = m.icon;
                    const isSelected = metodoPago === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMetodoPago(m.id)}
                        className={`py-3.5 px-3 rounded-2xl text-xs font-black flex flex-col items-center gap-1.5 transition cursor-pointer ${
                          isSelected
                            ? "bg-[#991B24] text-white border-2 border-[#7F1D1D] shadow-md ring-2 ring-amber-400/40"
                            : "bg-white text-stone-900 border-2 border-stone-300 hover:border-amber-600 hover:bg-amber-50/50 shadow-xs"
                        }`}
                      >
                        <Icon size={20} className={isSelected ? "text-amber-300" : "text-stone-700"} />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detalle según Método de Pago */}
              {metodoPago === "efectivo" && (
                <div className="space-y-4">
                  {/* Encabezado con Selector de Modo de Efectivo */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                      <label className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Banknote size={16} className="text-emerald-700" />
                        Cobro en Efectivo (Bs Bolivianos)
                      </label>

                      {/* Selector de Modo: Billete Único vs Acumular */}
                      <div className="flex items-center gap-1 p-1 bg-stone-200/90 rounded-xl border-2 border-stone-300">
                        <button
                          type="button"
                          onClick={() => {
                            soundManager.playTactileClick();
                            setModoEntradaEfectivo("directo");
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-black transition flex items-center gap-1 cursor-pointer ${
                            modoEntradaEfectivo === "directo"
                              ? "bg-[#1E130C] text-white shadow-xs"
                              : "text-stone-700 hover:text-stone-950 font-bold"
                          }`}
                          title="Al tocar un billete (ej. Bs 100), se fija directamente ese monto"
                        >
                          <span>🎯 Billete Único</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            soundManager.playTactileClick();
                            setModoEntradaEfectivo("acumular");
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-black transition flex items-center gap-1 cursor-pointer ${
                            modoEntradaEfectivo === "acumular"
                              ? "bg-[#1E130C] text-white shadow-xs"
                              : "text-stone-700 hover:text-stone-950 font-bold"
                          }`}
                          title="Suma varios billetes y monedas consecutivamente"
                        >
                          <span>➕ Sumar Varios</span>
                        </button>
                      </div>
                    </div>

                    {/* Fila de Billetes Ingresados con opción de eliminar individual */}
                    {billetesRecibidosList.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-2.5 p-3 rounded-2xl bg-amber-100/90 border-2 border-amber-400 flex items-center justify-between gap-2 flex-wrap shadow-xs"
                      >
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-black text-amber-950 flex items-center gap-1">
                            <span>Billetes entregados:</span>
                          </span>
                          {billetesRecibidosList.map((val, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-xl bg-white border-2 border-amber-500 text-stone-950 font-mono font-black text-xs shadow-xs flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150"
                            >
                              <span>{val >= 1 ? `Bs ${val}` : `${val * 100} ctv`}</span>
                              <button
                                type="button"
                                onClick={() => removerBilleteRecibido(idx)}
                                className="text-stone-400 hover:text-rose-600 transition p-0.5 rounded-full hover:bg-rose-50 cursor-pointer"
                                title="Quitar este billete (me equivoqué)"
                              >
                                <X size={13} />
                              </button>
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-3 ml-auto">
                          <button
                            type="button"
                            onClick={deshacerUltimoBillete}
                            className="text-xs font-bold text-amber-950 hover:text-amber-800 underline flex items-center gap-1 cursor-pointer"
                            title="Deshacer último billete ingresado"
                          >
                            <RotateCcw size={13} />
                            <span>Deshacer</span>
                          </button>
                          <button
                            type="button"
                            onClick={limpiarEfectivo}
                            className="text-xs font-bold text-rose-700 hover:text-rose-900 underline flex items-center gap-1 cursor-pointer"
                            title="Borrar todos los billetes"
                          >
                            <Trash2 size={13} />
                            <span>Borrar todo</span>
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Tarjetas de Billetes Bolivianos Gráficos con Alto Contraste */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {[
                        { val: 200, label: "Bs 200", bg: "from-[#0A3336] to-[#041A1C] border-teal-400 text-teal-100", tag: "Túpac Katari" },
                        { val: 100, label: "Bs 100", bg: "from-[#681419] to-[#3B070A] border-rose-400 text-rose-100", tag: "Juana Azurduy" },
                        { val: 50,  label: "Bs 50",  bg: "from-[#4A1E53] to-[#260B2C] border-purple-400 text-purple-100", tag: "José M. Baca" },
                        { val: 20,  label: "Bs 20",  bg: "from-[#733008] to-[#3D1802] border-amber-400 text-amber-100", tag: "Genoveva Ríos" },
                        { val: 10,  label: "Bs 10",  bg: "from-[#143257] to-[#08182E] border-blue-400 text-blue-100", tag: "Apiaguaiki" },
                      ].map((b) => {
                        const esSeleccionadoDirecto = modoEntradaEfectivo === "directo" && montoRecibido === b.val;
                        const conteoEnLista = billetesRecibidosList.filter((v) => v === b.val).length;

                        return (
                          <motion.button
                            key={b.val}
                            type="button"
                            whileHover={{ y: -3, scale: 1.03 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => agregarBillete(b.val)}
                            className={`p-2.5 rounded-2xl bg-gradient-to-br ${b.bg} border-2 shadow-md flex flex-col justify-between h-20 text-left transition-all relative overflow-hidden group cursor-pointer ${
                              esSeleccionadoDirecto ? "ring-4 ring-amber-400 border-white scale-[1.02]" : ""
                            }`}
                          >
                            <div className="flex justify-between items-start w-full">
                              <span className="font-mono font-black text-sm tracking-tight text-white">{b.label}</span>
                              <div className="flex items-center gap-1">
                                {conteoEnLista > 0 && modoEntradaEfectivo === "acumular" && (
                                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-950 font-mono font-black text-[10px]">
                                    x{conteoEnLista}
                                  </span>
                                )}
                                <span className="text-[8px] text-amber-300 uppercase font-sans font-bold tracking-widest">BOB</span>
                              </div>
                            </div>
                            <div>
                              <span className="text-[9px] text-stone-300 font-sans block truncate">{b.tag}</span>
                              <span className="text-[10px] font-bold text-amber-300 group-hover:underline">
                                {modoEntradaEfectivo === "directo" ? "Fijar Billete" : "+ Sumar"}
                              </span>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Monedas Bolivianas & Barra de Acciones Rápidas con Alto Contraste */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 mt-2.5 pt-2.5 border-t-2 border-stone-200">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-stone-800 font-black shrink-0">Monedas:</span>
                        {[
                          { val: 5, label: "Bs 5" },
                          { val: 2, label: "Bs 2" },
                          { val: 1, label: "Bs 1" },
                          { val: 0.5, label: "50 ctv" },
                        ].map((m) => (
                          <motion.button
                            key={m.val}
                            type="button"
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => agregarBillete(m.val)}
                            className="px-3 py-1.5 rounded-full bg-gradient-to-b from-amber-200 via-amber-300 to-amber-400 border-2 border-amber-600 text-stone-950 font-black text-xs shadow-xs hover:shadow-md cursor-pointer"
                          >
                            +{m.label}
                          </motion.button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={pagarMontoJusto}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-emerald-700 text-xs font-black shadow-xs transition flex items-center gap-1 cursor-pointer active:scale-95"
                          title="Cobrar exactamente el monto de la orden"
                        >
                          <span>🎯 Pagar Justo (Bs {totalPagar.toFixed(2)})</span>
                        </button>

                        <button
                          type="button"
                          onClick={limpiarEfectivo}
                          className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 border-2 border-rose-300 text-xs font-black transition flex items-center gap-1 cursor-pointer active:scale-95"
                          title="Reiniciar monto recibido a cero"
                        >
                          <Trash2 size={13} />
                          <span>Borrar (0)</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Inputs de Monto y Cambio Calculado con Alto Contraste */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-black text-stone-900">
                          Monto Recibido en Mano (Bs)
                        </label>
                        {montoRecibido > 0 && (
                          <button
                            type="button"
                            onClick={limpiarEfectivo}
                            className="text-xs font-bold text-rose-700 hover:text-rose-900 underline cursor-pointer"
                          >
                            Limpiar
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3.5 text-amber-950 font-black text-xl">Bs</span>
                        <input
                          type="number"
                          step="0.5"
                          value={montoRecibido || ""}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setMontoRecibido(val);
                            setBilletesRecibidosList(val > 0 ? [val] : []);
                          }}
                          placeholder="0.00"
                          className="w-full text-2xl font-black font-mono pl-12 pr-10 py-3 rounded-2xl border-2 border-stone-400 bg-white text-stone-950 focus:border-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-900/30 transition shadow-xs placeholder:text-stone-300"
                        />
                        {montoRecibido > 0 && (
                          <button
                            type="button"
                            onClick={limpiarEfectivo}
                            className="absolute right-3 top-3.5 p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition cursor-pointer"
                            title="Borrar monto"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-black text-stone-900 block mb-1">
                        {montoRecibido >= totalPagar ? "Cambio / Vuelto a Devolver" : "Monto Restante por Cobrar"}
                      </label>
                      <div className={`p-3 rounded-2xl border-2 text-2xl font-black font-mono flex items-center justify-between shadow-xs ${
                        montoRecibido >= totalPagar
                          ? "bg-emerald-100/90 border-emerald-500 text-emerald-950"
                          : "bg-rose-100/90 border-rose-500 text-rose-950"
                      }`}>
                        <span>Bs {montoRecibido >= totalPagar ? cambio.toFixed(2) : (totalPagar - montoRecibido).toFixed(2)}</span>
                        {montoRecibido >= totalPagar ? (
                          cambio > 0 ? (
                            <span className="text-xs font-sans font-black bg-emerald-700 text-white px-2.5 py-1 rounded-full shadow-2xs">Entregar vuelto ✓</span>
                          ) : (
                            <span className="text-xs font-sans font-black bg-stone-700 text-white px-2.5 py-1 rounded-full shadow-2xs">Pago Justo ✓</span>
                          )
                        ) : (
                          <span className="text-xs font-sans font-black bg-rose-700 text-white px-2.5 py-1 rounded-full shadow-2xs">Falta cobrar ⚠</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 💰 Sugerencia Inteligente de Entrega de Billetes y Monedas */}
                  {cambio > 0 && desgloseCambio.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-emerald-50/80 border-2 border-emerald-400 rounded-2xl space-y-2.5 shadow-xs"
                    >
                      <div className="flex items-center justify-between text-xs font-black text-emerald-950">
                        <span className="flex items-center gap-1.5">
                          <Calculator size={14} className="text-emerald-700" />
                          Entrega de Vuelto Óptimo (Caja Automática):
                        </span>
                        <span className="text-xs text-emerald-900 font-mono font-black">Total: Bs {cambio.toFixed(2)}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {desgloseCambio.map((b, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border-2 border-emerald-600 shadow-2xs text-xs font-black text-stone-900"
                          >
                            <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-[10px] flex items-center justify-center font-mono">
                              {b.cantidad}x
                            </span>
                            <span className="font-mono text-emerald-950">{b.label}</span>
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {metodoPago === "qr" && (
                <div className="p-6 bg-[#FAF6EF] rounded-2xl border-2 border-[#D8C7B2] text-center space-y-3.5 shadow-xs">
                  <div className="space-y-0.5">
                    <p className="text-sm font-black text-amber-950">
                      {qrBancarioBanco || "QR Simple Interoperable ASFI"}
                    </p>
                    <p className="text-xs text-stone-700">
                      Titular: <span className="font-black text-stone-950">{qrBancarioTitular || "Dencker Pan S.R.L."}</span>
                    </p>
                  </div>

                  <div className="w-56 h-56 bg-white p-3.5 rounded-2xl border-2 border-amber-400 shadow-md mx-auto flex flex-col items-center justify-center relative overflow-hidden">
                    <img
                      src={qrBancarioUrl || "/img/brand/logo-3-don-dencker-badge.png"}
                      alt="QR Bancario Oficial"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="text-xs text-stone-700 flex items-center justify-center gap-1.5">
                    <span>Monto a transferir: </span>
                    <span className="font-black text-amber-950 text-base font-mono">Bs {totalPagar.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {metodoPago === "mixto" && (
                <div className="p-4 bg-[#FAF6EF] rounded-2xl border-2 border-[#D8C7B2] text-xs space-y-2 text-stone-800 shadow-xs">
                  <p className="font-black text-amber-950 text-sm">Pago Mixto (Efectivo + QR Simple):</p>
                  <p className="text-stone-700 font-medium">
                    Cobra la mitad en efectivo (<strong>Bs {(totalPagar / 2).toFixed(2)}</strong>) y la otra mitad
                    mediante QR bancario interoperable.
                  </p>
                </div>
              )}

              {/* Selector Dual: Recibo de Venta vs. Factura SIAT con Alto Contraste */}
              <div className="p-4 bg-[#FAF6EF] rounded-2xl border-2 border-[#D8C7B2] space-y-3 text-xs shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-black text-stone-900 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                    <Receipt size={15} className="text-[#991B24]" />
                    Tipo de Comprobante
                  </span>
                  {tipoComprobante === "factura" ? (
                    <span className="text-xs bg-blue-100 text-blue-950 font-mono px-2.5 py-0.5 rounded-full font-bold border-2 border-blue-300">
                      N° Factura: {facturacionSiatConfig.siguienteNumeroFactura || 1}
                    </span>
                  ) : (
                    <span className="text-xs bg-amber-100 text-amber-950 font-bold px-2.5 py-0.5 rounded-full border-2 border-amber-300">
                      Control Interno
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setTipoComprobante("recibo");
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      tipoComprobante === "recibo"
                        ? "bg-[#991B24] text-white shadow-md border-2 border-[#7F1D1D]"
                        : "bg-white text-stone-900 border-2 border-stone-300 hover:bg-stone-50"
                    }`}
                  >
                    <Receipt size={15} />
                    <span>🧾 Recibo de Venta</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setTipoComprobante("factura");
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      tipoComprobante === "factura"
                        ? "bg-blue-700 text-white shadow-md border-2 border-blue-900"
                        : "bg-white text-stone-900 border-2 border-stone-300 hover:bg-stone-50"
                    }`}
                  >
                    <FileText size={15} />
                    <span>🏛️ Factura con NIT</span>
                  </button>
                </div>

                {tipoComprobante === "factura" ? (
                  <div className="p-3.5 bg-blue-50 rounded-xl border-2 border-blue-300 space-y-2.5 mt-1 shadow-2xs">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-xs text-blue-950 font-black block mb-0.5">NIT / CI Cliente:</label>
                        <input
                          type="text"
                          value={nitCiCliente}
                          onChange={(e) => setNitCiCliente(e.target.value)}
                          placeholder="0 (Sin NIT)"
                          className="w-full px-3 py-2 text-xs rounded-xl border-2 border-blue-300 bg-white font-mono font-bold text-stone-950 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-blue-950 font-black block mb-0.5">Razón Social / Nombre:</label>
                        <input
                          type="text"
                          value={razonSocialCliente}
                          onChange={(e) => setRazonSocialCliente(e.target.value)}
                          placeholder={pedidoSeleccionado.cliente_nombre || "Cliente Mostrador"}
                          className="w-full px-3 py-2 text-xs rounded-xl border-2 border-blue-300 bg-white font-bold text-stone-950 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-blue-800 leading-tight font-medium">
                      ℹ️ Se generará la Factura SIAT N° <strong>{facturacionSiatConfig.siguienteNumeroFactura || 1}</strong> con CUF algorítmico y QR oficial de Impuestos Nacionales.
                    </p>
                  </div>
                ) : (
                  <div className="px-3 py-1.5 bg-stone-200 rounded-xl text-[11px] text-stone-700 flex items-center justify-between font-medium">
                    <span>Branding artesanal Dencker Pan con logo</span>
                    <span className="text-emerald-800 font-bold">✓ Venta rápida</span>
                  </div>
                )}
              </div>

              {/* Botón Finalizar Cobro */}
              <button
                disabled={metodoPago === "efectivo" && montoRecibido < totalPagar}
                onClick={procesarCobro}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-lg shadow-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border-2 border-emerald-500/50"
              >
                <CheckCircle2 size={22} />
                <span>Confirmar Pago de Bs {totalPagar.toFixed(2)}</span>
              </button>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-[#D5C7B5] space-y-3 shadow-md">
              <Receipt size={48} className="mx-auto text-amber-900/40" />
              <h3 className="font-serif text-xl font-bold text-stone-800">
                Selecciona una mesa para cobrar
              </h3>
              <p className="text-xs text-stone-600 max-w-sm mx-auto font-medium">
                Elige cualquiera de las cuentas pendientes a la izquierda para desplegar la terminal de cobro y opciones de facturación y cálculo de cambio.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Recibo Térmico (Print Preview) */}
      <AnimatePresence>
        {modalReciboAbierto && pedidoSeleccionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4"
            >
              {/* Ticket Térmico Styling */}
              <div id="recibo-termico" className="ticket-termico font-mono text-xs space-y-3 text-stone-900 border-b border-dashed border-stone-300 pb-4">
                {/* ── ENCABEZADO: FACTURA SIAT vs RECIBO DE CONSUMO ── */}
                {facturaEmitidaActual ? (
                  /* ── ENCABEZADO FACTURA OFICIAL SIAT ── */
                  <div className="text-center flex flex-col items-center justify-center pt-1 pb-1">
                    <img
                      src="/img/brand/logo-3-don-dencker-badge.png"
                      alt="Dencker Pan"
                      className="h-14 w-auto object-contain mx-auto mb-1.5"
                    />
                    <h4 className="font-bold text-sm font-serif text-stone-950 uppercase tracking-tight">
                      {facturacionSiatConfig.razonSocialEmisor || "DENCKER PAN CAFETERÍA & PANADERÍA S.R.L."}
                    </h4>
                    <p className="text-[10px] font-bold text-stone-700">CASA MATRIZ: 0</p>
                    <p className="text-[9px] text-stone-600">Av. Daniel Salamanca, Cochabamba - Bolivia</p>
                    <p className="text-[9px] text-stone-600">Teléfono: (591) 4-4251234 &bull; +591 76911000</p>
                    <p className="text-[10px] text-stone-900 font-bold mt-1">NIT: {facturacionSiatConfig.nitEmisor || "389201024"}</p>
                    <p className="text-[8px] text-stone-500 italic max-w-[240px] mx-auto leading-tight">
                      {facturacionSiatConfig.actividadEconomica || "SERVICIOS DE PREPARACIÓN DE BEBIDAS Y ALIMENTOS"}
                    </p>

                    <div className="pt-2 text-[10px] text-stone-800 space-y-0.5 border-t border-dashed border-stone-300 mt-2 w-full">
                      <p className="font-black text-sm text-stone-950 tracking-wide">
                        FACTURA N°: {facturaEmitidaActual.numeroFactura}
                      </p>
                      <p className="text-[9px] font-bold text-stone-700">
                        CÓD. AUTORIZACIÓN: {facturacionSiatConfig.autorizacionDosificacion || "48A9C102BF"}
                      </p>
                      <div className="pt-1">
                        <span className="text-[8px] font-bold text-stone-500 block">CUF (Código Único de Factura):</span>
                        <p className="break-all text-[8px] font-mono text-stone-600 leading-tight bg-stone-50 p-1 rounded border border-stone-200">
                          {facturaEmitidaActual.cuf}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ── ENCABEZADO RECIBO DE CONSUMO / COMPROBANTE ARTESANAL ── */
                  <div className="text-center flex flex-col items-center justify-center pt-1 pb-1">
                    <img
                      src="/img/brand/logo-3-don-dencker-badge.png"
                      alt="Dencker Pan"
                      className="h-14 w-auto object-contain mx-auto mb-1.5"
                    />
                    <h4 className="font-black text-base font-serif text-stone-950 tracking-wider">
                      DENCKER PAN
                    </h4>
                    <p className="text-[10px] font-bold text-amber-900 tracking-wide">
                      Masa Madre Viva &bull; Café 4 Llamas de Altura
                    </p>
                    <p className="text-[9px] text-stone-600">
                      Av. Daniel Salamanca, Cochabamba &bull; Bolivia
                    </p>
                    <p className="text-[9px] text-stone-500">
                      Tandas Calientes: 07:30 y 16:30 &bull; WhatsApp: +591 76911000
                    </p>

                    <div className="pt-2 border-t border-dashed border-stone-300 mt-2 w-full text-center">
                      <span className="font-black text-xs text-stone-900 uppercase tracking-widest px-2.5 py-0.5 bg-stone-100 rounded-full border border-stone-300">
                        COMPROBANTE DE VENTA
                      </span>
                      <p className="text-[9px] text-stone-500 font-mono mt-1">
                        N° Control: <strong>{pedidoSeleccionado.id}</strong>
                      </p>
                    </div>
                  </div>
                )}

                {/* ── DATOS DEL PEDIDO / CLIENTE ── */}
                <div className="border-t border-dashed border-stone-300 pt-2 text-[11px] space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Ubicación:</span>
                    <span className="font-bold">
                      {pedidoSeleccionado.mesa_numero ? `Mesa ${pedidoSeleccionado.mesa_numero}` : "Venta Mostrador"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Fecha y Hora:</span>
                    <span className="font-mono">{fechaHoraImpresion || new Date().toLocaleString("es-BO")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Atendido por:</span>
                    <span>{sesionCaja?.cajero || "Caja Principal"}</span>
                  </div>

                  {facturaEmitidaActual ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-stone-500">NIT / CI:</span>
                        <span className="font-bold font-mono">{facturaEmitidaActual.clienteNitCi}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Señor(es):</span>
                        <span className="font-bold uppercase text-right truncate max-w-[170px]">
                          {facturaEmitidaActual.clienteNombre}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-stone-500">Cliente:</span>
                      <span className="font-bold uppercase text-right truncate max-w-[170px]">
                        {razonSocialCliente || pedidoSeleccionado.cliente_nombre || "Cliente Mostrador"}
                      </span>
                    </div>
                  )}
                </div>

                {/* ── DETALLE DE PRODUCTOS CON TAMAÑOS Y SILLAS ── */}
                <div className="border-t border-dashed border-stone-300 pt-2 space-y-1">
                  <div className="grid grid-cols-12 text-[10px] font-bold text-stone-500 border-b border-stone-200 pb-0.5">
                    <span className="col-span-7">CANT / DETALLE</span>
                    <span className="col-span-2 text-right">P.U.</span>
                    <span className="col-span-3 text-right">TOTAL</span>
                  </div>
                  {pedidoSeleccionado.items?.map((it, idx) => {
                    const precioUnit = it.precio_unitario || (it.subtotal / (it.cantidad || 1));
                    return (
                      <div key={idx} className="grid grid-cols-12 text-[11px] leading-tight pt-1 items-start">
                        <div className="col-span-7 pr-1">
                          <span className="font-semibold">{it.cantidad}x {it.producto_nombre}</span>
                          {it.tamanio && (
                            <span className="block text-[9px] text-amber-900 font-bold">
                              • Tamaño: {it.tamanio}
                            </span>
                          )}
                          {it.asiento_numero && (
                            <span className="block text-[9px] text-stone-500">
                              👤 Silla {it.asiento_numero} {it.comensal_nombre ? `(${it.comensal_nombre})` : ""}
                            </span>
                          )}
                          {it.chips_seleccionados && it.chips_seleccionados.length > 0 && (
                            <span className="block text-[9px] text-amber-800">
                              • {it.chips_seleccionados.join(", ")}
                            </span>
                          )}
                        </div>
                        <div className="col-span-2 text-right font-mono text-[10px] text-stone-600">
                          {precioUnit.toFixed(1)}
                        </div>
                        <div className="col-span-3 text-right font-mono font-bold">
                          Bs {it.subtotal.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── TOTALES Y MONTO LITERAL EN ESPAÑOL ── */}
                <div className="border-t border-dashed border-stone-300 pt-2 space-y-1 font-bold">
                  <div className="flex justify-between text-sm text-stone-950">
                    <span>TOTAL A PAGAR:</span>
                    <span className="font-mono text-base font-black">Bs {totalPagar.toFixed(2)}</span>
                  </div>

                  {/* Expresión en palabras oficial */}
                  <div className="text-[10px] text-stone-700 bg-stone-100/90 p-1.5 rounded border border-stone-200 font-sans font-medium text-center">
                    {facturaEmitidaActual?.montoLiteral || convertirNumeroALiteral(totalPagar)}
                  </div>

                  <div className="flex justify-between text-[11px] font-normal pt-1">
                    <span>Método de Pago:</span>
                    <span className="capitalize font-semibold">
                      {metodoPago === "qr_simple" ? "QR Simple BNB/BCP (ASFI)" : metodoPago === "mixto" ? "Pago Mixto (Efectivo + QR)" : "Efectivo BOB"}
                    </span>
                  </div>
                  {metodoPago === "efectivo" && (
                    <>
                      <div className="flex justify-between text-[11px] font-normal">
                        <span>Efectivo Recibido:</span>
                        <span className="font-mono">Bs {montoRecibido.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-normal text-emerald-800">
                        <span>Cambio / Vuelto:</span>
                        <span className="font-mono font-bold">Bs {cambio.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* ── MARKETING RETENTION HOOK: CUPÓN DE CORTESÍA & WIFI ── */}
                <div className="coupon-box border border-dashed border-stone-800 p-2 my-1 text-center rounded bg-stone-50">
                  <p className="font-bold text-[10px] text-stone-900 tracking-wide uppercase">
                    ☕ ¡CAFÉ DE CORTESÍA EN TU PRÓXIMA VISITA!
                  </p>
                  <p className="text-[8px] text-stone-600 leading-tight mt-0.5 font-sans">
                    Sube una foto de tu pedido a Instagram o TikTok etiquetando a <strong>@denckerpan</strong> y muéstrala a tu barista.
                  </p>
                  <div className="mt-1 pt-1 border-t border-dashed border-stone-300 flex justify-between text-[8px] text-stone-500 font-mono">
                    <span>WiFi: Dencker-Clientes</span>
                    <span>Clave: masamadre2024</span>
                  </div>
                </div>

                {/* ── QR Y LEYENDAS LEGALES SIAT vs RECIBO ARTESANAL ── */}
                {facturaEmitidaActual ? (
                  <>
                    <div className="border-t border-dashed border-stone-300 pt-2 flex flex-col items-center justify-center space-y-1 text-center">
                      <div className="p-2 bg-white rounded-lg border border-stone-300 shadow-2xs">
                        <QRCodeSVG
                          value={facturaEmitidaActual.urlQrVerificacion || facturacionSiatConfig.linkImpuestos || "https://siat.impuestos.gob.bo"}
                          size={92}
                          level="M"
                        />
                      </div>
                      <p className="text-[8px] text-stone-500 font-mono">Código de Control Tributario / QR SIAT</p>
                    </div>

                    <div className="text-center pt-2 text-[9px] text-stone-600 space-y-1 leading-tight border-t border-dashed border-stone-300">
                      <p className="font-bold text-stone-900">
                        "ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAÍS, EL USO ILÍCITO SERÁ SANCIONADO PENALMENTE DE ACUERDO A LEY"
                      </p>
                      <p className="text-[8px] text-stone-500 italic">
                        {facturaEmitidaActual.leyendaLey453 || facturacionSiatConfig.leyendaLey453 || "Ley N° 453: Los servicios deben prestarse en condiciones de inocuidad y calidad."}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="border-t border-dashed border-stone-300 pt-2 text-center space-y-1">
                    <p className="text-[10px] text-amber-950 font-serif font-bold">
                      ¡Gracias por visitar Dencker Pan!
                    </p>
                    <p className="text-[8px] text-stone-500 italic">
                      Comprobante de consumo interno &bull; Masa madre viva y café de altura
                    </p>
                  </div>
                )}

                {/* Sello Don Dencker al pie de ambos comprobantes */}
                <div className="flex items-center justify-center gap-2 pt-2 border-t border-dashed border-stone-300">
                  <img
                    src="/img/brand/logo-3-don-dencker-badge.png"
                    alt="Sello Oficial Don Dencker"
                    className="w-8 h-8 object-contain shrink-0"
                  />
                  <div className="text-left leading-tight">
                    <p className="text-[9px] font-serif font-black text-stone-900 tracking-wider">SELLO DE AUTENTICIDAD</p>
                    <p className="text-[8px] text-stone-500 font-mono">Tradición &amp; Calidad Dencker</p>
                  </div>
                </div>
              </div>

              {/* Botones Acciones Ticket */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={imprimirRecibo}
                  className="py-2.5 rounded-xl bg-amber-900 text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-amber-950 transition"
                >
                  <Printer size={14} /> Imprimir Ticket
                </button>
                <button
                  onClick={() => {
                    setModalReciboAbierto(false);
                    setPedidoSeleccionado(null);
                  }}
                  className="py-2.5 rounded-xl bg-stone-100 text-stone-700 font-semibold text-xs hover:bg-stone-200 transition"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Cierre de Caja & Arqueo Ciego */}
      <AnimatePresence>
        {modalArqueoAbierto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5 border-2 border-stone-300"
            >
              <div className="flex items-center justify-between pb-3.5 border-b-2 border-stone-200">
                <div>
                  <h3 className="font-serif text-xl font-black text-stone-950">
                    Arqueo de Caja &amp; Cierre de Turno
                  </h3>
                  <p className="text-xs text-stone-600 font-medium">
                    Conteo ciego de billetes y monedas bolivianas en gaveta
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalArqueoAbierto(false)}
                  className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Denominaciones Bolivianas */}
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {BILLETES_BOLIVIANOS.map((b) => (
                  <div
                    key={b.valor}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF6EF] border-2 border-[#D8C7B2] text-xs shadow-2xs"
                  >
                    <span className="font-black text-stone-950 w-24 text-sm">{b.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-stone-600 font-bold">Cantidad:</span>
                      <input
                        type="number"
                        min="0"
                        value={conteoBilletes[b.valor] || ""}
                        onChange={(e) =>
                          setConteoBilletes({
                            ...conteoBilletes,
                            [b.valor]: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="0"
                        className="w-24 p-1.5 text-center font-black text-stone-950 text-sm rounded-lg border-2 border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-amber-800"
                      />
                    </div>
                    <span className="font-mono font-black text-amber-950 w-28 text-right text-sm">
                      Bs {((conteoBilletes[b.valor] || 0) * b.valor).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Comparación y Diferencia con Alto Contraste */}
              <div className="p-4 rounded-2xl bg-[#FAF6EF] border-2 border-[#D8C7B2] space-y-2.5 text-xs shadow-xs">
                <div className="flex justify-between font-black text-stone-950 text-sm">
                  <span>Total Efectivo Contado:</span>
                  <span className="font-mono font-black text-base text-amber-950">
                    Bs {totalArqueoContado.toFixed(2)}
                  </span>
                </div>
                {sesionCaja && (
                  <div className="flex justify-between text-stone-700 font-medium">
                    <span>Efectivo Esperado en Sistema:</span>
                    <span className="font-mono font-bold">Bs {sesionCaja.efectivo_esperado.toFixed(2)}</span>
                  </div>
                )}
                {sesionCaja && (() => {
                  const diff = totalArqueoContado - sesionCaja.efectivo_esperado;
                  return (
                    <div className="flex justify-between items-center font-black pt-2 border-t-2 border-[#D8C7B2]">
                      <span className="text-stone-900">Diferencia (Descuadre):</span>
                      <span
                        className={`font-mono text-sm px-2.5 py-0.5 rounded-lg border-2 ${
                          diff === 0
                            ? "bg-emerald-100 text-emerald-950 border-emerald-400 font-black"
                            : diff > 0
                            ? "bg-amber-100 text-amber-950 border-amber-400 font-black"
                            : "bg-rose-100 text-rose-950 border-rose-400 font-black"
                        }`}
                      >
                        {diff > 0 ? `+Bs ${diff.toFixed(2)} (Sobrante)` : diff < 0 ? `-Bs ${Math.abs(diff).toFixed(2)} (Faltante)` : "Bs 0.00 (Exacto)"}
                      </span>
                    </div>
                  );
                })()}
              </div>

              <textarea
                rows={2}
                placeholder="Notas u observaciones del cierre de turno..."
                value={notasCierre}
                onChange={(e) => setNotasCierre(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border-2 border-stone-300 bg-white text-stone-950 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800 font-medium"
              />

              {/* Comprobante imprimible de arqueo oculto en pantalla normal */}
              <div id="arqueo-caja-print" className="hidden">
                <div className="ticket-termico font-mono text-xs space-y-3 text-stone-900">
                  {/* Encabezado Arqueo Oficial */}
                  <div className="text-center pb-2 border-b border-dashed border-stone-400">
                    <img
                      src="/img/brand/logo-3-don-dencker-badge.png"
                      alt="Dencker Pan"
                      className="h-14 w-auto object-contain mx-auto mb-1.5"
                    />
                    <h3 className="font-serif font-black text-base tracking-wide text-stone-950">
                      DENCKER PAN
                    </h3>
                    <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                      Arqueo de Caja &amp; Auditoría de Turno
                    </p>
                    <p className="text-[9px] text-stone-600">Av. Daniel Salamanca, Cochabamba &bull; Bolivia</p>
                    <div className="mt-1.5 py-1 px-2 bg-stone-100 rounded border border-stone-300 text-[10px] space-y-0.5 text-left">
                      <div className="flex justify-between">
                        <span className="text-stone-500">Fecha Cierre:</span>
                        <span className="font-bold">{new Date().toLocaleString("es-BO")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Cajero(a):</span>
                        <span className="font-bold">{sesionCaja?.cajero || "Cajero Principal"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Turno:</span>
                        <span className="font-bold uppercase">{sesionCaja?.turno || "TARDE"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Resumen de Balance Financiero */}
                  <div className="py-2 text-[10px] space-y-1.5 border-b border-dashed border-stone-400">
                    <div className="flex justify-between font-bold text-xs text-stone-950">
                      <span>Efectivo Contado en Gaveta:</span>
                      <span className="font-mono text-sm font-black">Bs {totalArqueoContado.toFixed(2)}</span>
                    </div>
                    {sesionCaja && (
                      <div className="flex justify-between text-stone-600">
                        <span>Efectivo Teórico Esperado:</span>
                        <span className="font-mono">Bs {sesionCaja.efectivo_esperado.toFixed(2)}</span>
                      </div>
                    )}
                    {sesionCaja && (() => {
                      const diff = totalArqueoContado - sesionCaja.efectivo_esperado;
                      return (
                        <div className={`p-1.5 rounded border text-center font-bold text-[10px] ${
                          diff === 0
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : diff > 0
                            ? "bg-amber-50 text-amber-900 border-amber-300"
                            : "bg-rose-50 text-rose-900 border-rose-300"
                        }`}>
                          {diff === 0 && "✓ CUADRADO EXACTO (Diferencia: Bs 0.00)"}
                          {diff > 0 && `▲ SOBRANTE DE CAJA: +Bs ${diff.toFixed(2)}`}
                          {diff < 0 && `▼ FALTANTE DE CAJA: -Bs ${Math.abs(diff).toFixed(2)}`}
                        </div>
                      );
                    })()}
                    {sesionCaja && (
                      <div className="flex justify-between pt-1 border-t border-stone-200 text-stone-700">
                        <span>Ventas Totales Registradas:</span>
                        <span className="font-mono font-bold">Bs {sesionCaja.total_ventas.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Desglose Detallado de Billetes y Monedas */}
                  <div className="py-2 text-[9px] border-b border-dashed border-stone-400 space-y-1">
                    <p className="font-bold text-[10px] text-stone-950 mb-1">
                      CONTEO DE DENOMINACIONES:
                    </p>
                    <div className="grid grid-cols-12 font-bold text-stone-500 border-b border-stone-200 pb-0.5">
                      <span className="col-span-6">CORTE</span>
                      <span className="col-span-2 text-center">CANT</span>
                      <span className="col-span-4 text-right">TOTAL</span>
                    </div>
                    {BILLETES_BOLIVIANOS.filter((b) => (conteoBilletes[b.valor] || 0) > 0).map((b) => {
                      const count = conteoBilletes[b.valor] || 0;
                      return (
                        <div key={b.valor} className="grid grid-cols-12 py-0.5 items-center">
                          <span className="col-span-6">{b.label}</span>
                          <span className="col-span-2 text-center font-mono font-bold">{count}</span>
                          <span className="col-span-4 text-right font-mono font-bold">
                            Bs {(count * b.valor).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Observaciones de Cierre */}
                  {notasCierre && (
                    <div className="py-2 text-[9px] border-b border-dashed border-stone-400">
                      <p className="font-bold text-stone-900">Observaciones del Cajero:</p>
                      <p className="italic text-stone-700 mt-0.5 bg-stone-50 p-1 rounded border border-stone-200">
                        "{notasCierre}"
                      </p>
                    </div>
                  )}

                  {/* Firmas de Control de Auditoría */}
                  <div className="pt-8 pb-2 text-[9px] text-center space-y-6">
                    <div>
                      <div className="w-44 border-t border-stone-800 mx-auto mb-1"></div>
                      <p className="font-bold text-stone-900">Firma Cajero(a) Responsable</p>
                      <p className="text-[8px] text-stone-500">{sesionCaja?.cajero || "Caja Principal"}</p>
                    </div>
                    <div>
                      <div className="w-44 border-t border-stone-800 mx-auto mb-1"></div>
                      <p className="font-bold text-stone-900">Firma Supervisor / Administrador</p>
                      <p className="text-[8px] text-stone-500">Revisión y Conformidad de Arqueo</p>
                    </div>
                  </div>

                  {/* Pie de Sello */}
                  <div className="pt-2 text-center text-[8px] text-stone-500 border-t border-dashed border-stone-300">
                    Dencker Pan Sistema Operativo Gastronómico &bull; Cochabamba
                  </div>
                </div>
              </div>

              {/* Botones Modal */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playTactileClick();
                    printElementById("arqueo-caja-print", {
                      pageType: "thermal",
                      title: `Arqueo_Caja_${Date.now()}`,
                    });
                  }}
                  className="py-3 px-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer border border-stone-300"
                >
                  <Printer size={14} /> Imprimir Arqueo
                </button>
                <button
                  onClick={ejecutarCierreCaja}
                  className="py-3 px-2 rounded-xl bg-amber-900 text-white font-bold text-xs hover:bg-amber-950 transition cursor-pointer"
                >
                  Finalizar Cierre
                </button>
                <button
                  onClick={() => setModalArqueoAbierto(false)}
                  className="py-3 px-2 rounded-xl bg-stone-100 text-stone-600 font-semibold text-xs hover:bg-stone-200 transition cursor-pointer"
                >
                  Cancelar
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

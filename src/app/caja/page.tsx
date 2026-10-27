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
} from "lucide-react";
import { useSystemStore } from "@/store";
import { Pedido, MetodoPago, BILLETES_BOLIVIANOS } from "@/types";
import { soundManager } from "@/lib/sound";
import StaffAuthGuard from "@/components/StaffAuthGuard";

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
  } = useSystemStore();

  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("efectivo");
  const [montoRecibido, setMontoRecibido] = useState<number>(0);
  const [splitPersonas, setSplitPersonas] = useState<number>(1);
  const [modalArqueoAbierto, setModalArqueoAbierto] = useState(false);
  const [modalReciboAbierto, setModalReciboAbierto] = useState(false);
  const [pagoCompletado, setPagoCompletado] = useState(false);

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
    setSplitPersonas(1);
    setPropinaPct(0);
    setPropinaCustom(0);
    setPagoCompletado(false);
  };

  const agregarBillete = (valor: number) => {
    soundManager.playCoinRattle();
    setMontoRecibido((prev) => prev + valor);
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
        pedidoSeleccionado.cliente_nombre ||
        (pedidoSeleccionado.mesa_numero ? `Mesa ${pedidoSeleccionado.mesa_numero}` : "Cliente Mostrador"),
      mesa_numero: pedidoSeleccionado.mesa_numero,
      turno: sesionCaja?.turno || (new Date().getHours() < 14 ? "manana" : new Date().getHours() < 19 ? "tarde" : "noche"),
      cajero: sesionCaja?.cajero || "Caja Principal",
      modalidad: pedidoSeleccionado.mesa_numero ? "mesa" : "retiro",
    });

    // 💰 ¡Sonido icónico de Caja Registradora Antigua de Bronce Ka-Ching!
    soundManager.playCashRegister();
    setPagoCompletado(true);
    setModalReciboAbierto(true);
  };

  const imprimirRecibo = () => {
    soundManager.playTactileClick();
    window.print();
  };

  const ejecutarCierreCaja = () => {
    cerrarCaja(totalArqueoContado, notasCierre);
    soundManager.playCashRegister();
    setModalArqueoAbierto(false);
  };

  return (
    <StaffAuthGuard requiredRole="caja" roleTitle="Caja POS & Facturación">
      <div className="min-h-screen bg-[#FDFBF7] text-amber-950 pb-24">
      {/* Header Caja */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 p-1 border border-amber-500/30 flex items-center justify-center shrink-0">
              <img
                src="/img/logo/logo.png"
                alt="Dencker Pan"
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-wide text-amber-100 flex items-center gap-2">
                Caja & Facturación POS — Dencker Pan
              </h1>
              <p className="text-amber-200/60 text-xs">
                Cobro en Bolivianos (Bs), QR Simple, Split de cuenta y arqueo ciego
              </p>
            </div>
          </div>

          {/* Estado de Turno & Arqueo */}
          <div className="flex items-center gap-3">
            <div className="text-right text-xs">
              <span className="text-stone-400 block">Ventas Turno:</span>
              <span className="font-bold text-amber-300 text-sm">
                Bs {sesionCaja?.total_ventas.toFixed(2) || "0.00"}
              </span>
            </div>

            <button
              onClick={() => setModalArqueoAbierto(true)}
              className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Calculator size={14} /> Cierre & Arqueo
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Cola de Mesas y Pedidos Pendientes */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-amber-950 flex items-center gap-2">
              <span>📋</span> Cuentas Pendientes ({pedidosPendientes.length})
            </h2>
          </div>

          {pedidosPendientes.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-stone-200 space-y-2">
              <CheckCircle2 size={36} className="mx-auto text-emerald-600" />
              <p className="text-sm font-semibold text-stone-700">Sin cuentas pendientes de cobro</p>
              <p className="text-xs text-stone-500">
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
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-amber-50 border-amber-800 ring-2 ring-amber-800 shadow-md"
                        : "bg-white border-stone-200 hover:border-amber-400 hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-lg font-bold text-amber-950">
                          Mesa {p.mesa_numero}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
                          {p.cliente_nombre || "Cliente"}
                        </span>
                      </div>
                      <span className="font-serif text-lg font-bold text-amber-900">
                        Bs {p.total.toFixed(2)}
                      </span>
                    </div>

                    <div className="text-xs text-stone-500 flex items-center justify-between border-t border-stone-100 pt-2">
                      <span>{p.items?.length || 0} ítems pedidos</span>
                      <span className="text-amber-800 font-semibold flex items-center gap-1">
                        Cobrar mesa <ArrowRight size={12} />
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
            <div className="bg-white rounded-3xl border border-stone-200 shadow-md p-6 space-y-6">
              {/* Header Comanda a Cobrar */}
              <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-amber-950">
                    Cobro Mesa {pedidoSeleccionado.mesa_numero}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Orden #{pedidoSeleccionado.id.substring(pedidoSeleccionado.id.length - 4)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-stone-500 block">Total a Pagar</span>
                  <span className="font-serif text-3xl font-extrabold text-amber-900">
                    Bs {totalPagar.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Detalle de Productos */}
              <div className="max-h-40 overflow-y-auto divide-y divide-stone-100 bg-stone-50/70 rounded-2xl p-3">
                {pedidoSeleccionado.items?.map((it) => (
                  <div key={it.id} className="py-1.5 flex justify-between text-xs">
                    <span className="text-stone-700">
                      {it.cantidad}x {it.producto_nombre}
                    </span>
                    <span className="font-semibold text-stone-900">
                      Bs {it.subtotal.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Selector de Split / División de Cuenta */}
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-amber-950">
                  <span className="flex items-center gap-1.5">
                    <Split size={14} /> Dividir Cuenta (Split equitativo)
                  </span>
                  <span>{splitPersonas} personas</span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      onClick={() => setSplitPersonas(num)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
                        splitPersonas === num
                          ? "bg-amber-900 text-white shadow-xs"
                          : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-100"
                      }`}
                    >
                      {num === 1 ? "Total" : `${num} pers.`}
                    </button>
                  ))}
                </div>
                {splitPersonas > 1 && (
                  <div className="pt-2 border-t border-amber-200/50 space-y-2">
                    <div className="text-xs text-amber-900 font-bold flex justify-between items-center">
                      <span>Monto por comensal:</span>
                      <span className="font-mono text-sm bg-amber-200/70 px-2 py-0.5 rounded-lg">
                        Bs {montoPorPersona.toFixed(2)} c/u
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                      {Array.from({ length: splitPersonas }).map((_, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-amber-200 text-[11px] shadow-2xs"
                        >
                          <span className="w-5 h-5 rounded-full bg-amber-800 text-white font-bold flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <div className="leading-tight">
                            <span className="text-[10px] text-stone-400 block">Comensal {idx + 1}</span>
                            <span className="font-mono font-bold text-stone-900">
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
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/80 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">
                  <Star size={14} className="text-amber-500 fill-amber-500" />
                  <span>Propina Voluntaria:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[0, 5, 10, 15].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        setPropinaPct(pct);
                        soundManager.playTactileClick();
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                        propinaPct === pct
                          ? "bg-amber-900 text-white shadow-xs"
                          : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
                      }`}
                    >
                      {pct === 0 ? "Sin propina" : `+${pct}% (Bs ${(subtotalPagar * pct / 100).toFixed(1)})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Método de Pago Tabs */}
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">
                  Método de Pago
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: "efectivo", label: "Efectivo (Bs)", icon: Banknote },
                      { id: "qr", label: "QR Simple", icon: QrCode },
                      { id: "mixto", label: "Mixto", icon: CreditCard },
                    ] as const
                  ).map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setMetodoPago(m.id)}
                        className={`py-3 px-2 rounded-2xl text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                          metodoPago === m.id
                            ? "bg-amber-900 text-white shadow-sm"
                            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                        }`}
                      >
                        <Icon size={18} />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detalle según Método de Pago */}
              {metodoPago === "efectivo" && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Banknote size={15} className="text-emerald-700" />
                        Billetes & Monedas de Bolivia
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMontoRecibido(totalPagar);
                          soundManager.playSuccessTone();
                        }}
                        className="text-[11px] font-bold text-amber-900 hover:text-amber-700 underline flex items-center gap-1"
                      >
                        Pagar Justo (Bs {totalPagar.toFixed(2)})
                      </button>
                    </div>

                    {/* Tarjetas de Billetes Bolivianos Gráficos */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        { val: 200, label: "Bs 200", bg: "from-[#0F383B] to-[#0A2628] border-teal-500/50 text-teal-100", tag: "Túpac Katari" },
                        { val: 100, label: "Bs 100", bg: "from-[#63181E] to-[#450F14] border-red-500/50 text-red-100", tag: "Juana Azurduy" },
                        { val: 50,  label: "Bs 50",  bg: "from-[#4B2354] to-[#321639] border-purple-500/50 text-purple-100", tag: "José M. Baca" },
                        { val: 20,  label: "Bs 20",  bg: "from-[#78350F] to-[#542409] border-orange-500/50 text-orange-100", tag: "Genoveva Ríos" },
                        { val: 10,  label: "Bs 10",  bg: "from-[#1E3A5F] to-[#142640] border-blue-500/50 text-blue-100", tag: "Apiaguaiki" },
                      ].map((b) => (
                        <motion.button
                          key={b.val}
                          type="button"
                          whileHover={{ y: -3, scale: 1.03 }}
                          whileTap={{ scale: 0.94 }}
                          onClick={() => {
                            agregarBillete(b.val);
                            soundManager.playSuccessTone();
                          }}
                          className={`p-2.5 rounded-2xl bg-gradient-to-br ${b.bg} border shadow-md flex flex-col justify-between h-20 text-left transition-all relative overflow-hidden group`}
                        >
                          <div className="flex justify-between items-start w-full">
                            <span className="font-mono font-black text-sm tracking-tight">{b.label}</span>
                            <span className="text-[8px] opacity-60 uppercase font-sans tracking-widest">BOB</span>
                          </div>
                          <div>
                            <span className="text-[9px] opacity-75 font-sans block truncate">{b.tag}</span>
                            <span className="text-[10px] font-bold text-white group-hover:underline">+ Agregar</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    {/* Monedas Bolivianas */}
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-stone-100">
                      <span className="text-[11px] text-stone-500 font-semibold shrink-0">Monedas:</span>
                      {[
                        { val: 5, label: "Bs 5" },
                        { val: 2, label: "Bs 2" },
                        { val: 1, label: "Bs 1" },
                        { val: 0.5, label: "50 ctv" },
                      ].map((m) => (
                        <motion.button
                          key={m.val}
                          type="button"
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => {
                            agregarBillete(m.val);
                            soundManager.playSuccessTone();
                          }}
                          className="px-3 py-1.5 rounded-full bg-gradient-to-b from-amber-100 to-amber-200 border border-amber-300 text-amber-950 font-bold text-xs shadow-xs hover:shadow-sm"
                        >
                          +{m.label}
                        </motion.button>
                      ))}

                      <button
                        type="button"
                        onClick={() => setMontoRecibido(0)}
                        className="ml-auto text-[11px] text-stone-400 hover:text-red-600 transition"
                      >
                        Limpiar
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-stone-500 block mb-1">
                        Monto Recibido en Mano (Bs)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={montoRecibido || ""}
                        onChange={(e) => setMontoRecibido(parseFloat(e.target.value) || 0)}
                        className="w-full text-2xl font-bold font-mono p-3 rounded-2xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-800 transition"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-500 block mb-1">
                        Cambio / Vuelto a Devolver
                      </label>
                      <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-2xl font-bold font-mono text-emerald-800 flex items-center justify-between">
                        <span>Bs {cambio.toFixed(2)}</span>
                        {cambio > 0 && <span className="text-xs font-sans font-medium text-emerald-600">Entregar vuelto ✓</span>}
                      </div>
                    </div>
                  </div>

                  {/* 💰 Sugerencia Inteligente de Entrega de Billetes y Monedas */}
                  {cambio > 0 && desgloseCambio.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 bg-amber-50/80 border border-amber-200/90 rounded-2xl space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                        <span className="flex items-center gap-1.5">
                          <Calculator size={13} className="text-amber-700" />
                          Entrega de Vuelto Óptimo (Caja Automática):
                        </span>
                        <span className="text-[11px] text-amber-800 font-mono">Total: Bs {cambio.toFixed(2)}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {desgloseCambio.map((b, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-amber-300 shadow-2xs text-xs font-bold text-stone-800"
                          >
                            <span className="w-5 h-5 rounded-full bg-amber-900 text-amber-100 text-[10px] flex items-center justify-center font-mono">
                              {b.cantidad}x
                            </span>
                            <span className="font-mono text-amber-950">{b.label}</span>
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {metodoPago === "qr" && (
                <div className="p-6 bg-amber-50/50 rounded-2xl border border-amber-200 text-center space-y-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-amber-950">
                      {qrBancarioBanco || "QR Simple Interoperable ASFI"}
                    </p>
                    <p className="text-[11px] text-stone-600">
                      Titular: <span className="font-semibold text-stone-900">{qrBancarioTitular || "Dencker Pan S.R.L."}</span>
                    </p>
                  </div>

                  <div className="w-52 h-52 bg-white p-3 rounded-2xl border border-amber-300 shadow-md mx-auto flex flex-col items-center justify-center relative overflow-hidden">
                    <img
                      src={qrBancarioUrl || "/img/logo/logo.png"}
                      alt="QR Bancario Oficial"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="text-xs text-stone-600 flex items-center justify-center gap-1.5">
                    <span>Monto a transferir: </span>
                    <span className="font-bold text-amber-950 text-sm font-mono">Bs {totalPagar.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {metodoPago === "mixto" && (
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-2">
                  <p className="font-semibold text-stone-700">Pago Mixto (Efectivo + QR Simple):</p>
                  <p className="text-stone-500">
                    Cobra la mitad en efectivo (Bs {(totalPagar / 2).toFixed(2)}) y la otra mitad
                    mediante QR bancario interoperable.
                  </p>
                </div>
              )}

              {/* Botón Finalizar Cobro */}
              <button
                disabled={metodoPago === "efectivo" && montoRecibido < totalPagar}
                onClick={procesarCobro}
                className="w-full py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base shadow-lg transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={20} />
                <span>Confirmar Pago de Bs {totalPagar.toFixed(2)}</span>
              </button>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-stone-200 space-y-3">
              <Receipt size={48} className="mx-auto text-stone-300" />
              <h3 className="font-serif text-lg font-bold text-stone-700">
                Selecciona una mesa para cobrar
              </h3>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                Elige cualquiera de las cuentas pendientes a la izquierda para desplegar las
                opciones de facturación y cálculo de cambio.
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
                <div className="text-center space-y-0.5">
                  <h4 className="font-bold text-base font-serif">DENCKER PAN</h4>
                  <p className="text-[11px]">CAFETERÍA & PANADERÍA S.R.L.</p>
                  <p className="text-[10px] text-stone-500">NIT: 389201024</p>
                  <p className="text-[10px] text-stone-500">Cochabamba - Bolivia</p>
                </div>

                <div className="border-t border-dashed border-stone-300 pt-2 text-[11px] space-y-0.5">
                  <p>Mesa: {pedidoSeleccionado.mesa_numero}</p>
                  <p>Fecha: {new Date().toLocaleDateString("es-BO")} {new Date().toLocaleTimeString("es-BO")}</p>
                  <p>Cajero: {sesionCaja?.cajero || "Caja Principal"}</p>
                </div>

                <div className="border-t border-dashed border-stone-300 pt-2 space-y-1">
                  {pedidoSeleccionado.items?.map((it, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{it.cantidad}x {it.producto_nombre}</span>
                      <span>Bs {it.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-stone-300 pt-2 space-y-1 font-bold">
                  <div className="flex justify-between text-sm">
                    <span>TOTAL:</span>
                    <span>Bs {totalPagar.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-normal">
                    <span>Método:</span>
                    <span className="capitalize">{metodoPago}</span>
                  </div>
                  {metodoPago === "efectivo" && (
                    <div className="flex justify-between text-[11px] font-normal">
                      <span>Cambio devuelto:</span>
                      <span>Bs {cambio.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="text-center pt-2 text-[10px] text-stone-500">
                  <p>¡Gracias por su preferencia!</p>
                  <p>ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAÍS</p>
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
              className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div>
                  <h3 className="font-serif text-xl font-bold text-amber-950">
                    Arqueo de Caja & Cierre de Turno
                  </h3>
                  <p className="text-xs text-stone-500">
                    Conteo ciego de billetes y monedas bolivianas
                  </p>
                </div>
                <button
                  onClick={() => setModalArqueoAbierto(false)}
                  className="p-2 rounded-full hover:bg-stone-100 text-stone-400"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Denominaciones Bolivianas */}
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {BILLETES_BOLIVIANOS.map((b) => (
                  <div
                    key={b.valor}
                    className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-100 text-xs"
                  >
                    <span className="font-bold text-stone-700 w-20">{b.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-stone-400">Cantidad:</span>
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
                        className="w-20 p-1.5 text-center font-bold rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-800"
                      />
                    </div>
                    <span className="font-mono font-bold text-stone-800 w-24 text-right">
                      Bs {((conteoBilletes[b.valor] || 0) * b.valor).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Comparación y Diferencia */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs">
                <div className="flex justify-between font-bold text-amber-950 text-sm">
                  <span>Total Efectivo Contado:</span>
                  <span>Bs {totalArqueoContado.toFixed(2)}</span>
                </div>
                {sesionCaja && (
                  <div className="flex justify-between text-stone-600">
                    <span>Efectivo Esperado en Sistema:</span>
                    <span>Bs {sesionCaja.efectivo_esperado.toFixed(2)}</span>
                  </div>
                )}
                {sesionCaja && (
                  <div className="flex justify-between font-bold pt-1 border-t border-amber-200/60">
                    <span>Diferencia (Descuadre):</span>
                    <span
                      className={
                        totalArqueoContado >= sesionCaja.efectivo_esperado
                          ? "text-emerald-700"
                          : "text-red-700"
                      }
                    >
                      Bs {(totalArqueoContado - sesionCaja.efectivo_esperado).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <textarea
                rows={2}
                placeholder="Notas u observaciones del cierre de turno..."
                value={notasCierre}
                onChange={(e) => setNotasCierre(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-800"
              />

              {/* Botones Modal */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={ejecutarCierreCaja}
                  className="py-3 rounded-xl bg-amber-900 text-white font-bold text-xs hover:bg-amber-950 transition"
                >
                  Finalizar & Cerrar Turno
                </button>
                <button
                  onClick={() => setModalArqueoAbierto(false)}
                  className="py-3 rounded-xl bg-stone-100 text-stone-600 font-semibold text-xs hover:bg-stone-200 transition"
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

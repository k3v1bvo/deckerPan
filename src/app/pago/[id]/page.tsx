"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  QrCode,
  Banknote,
  Users,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Receipt,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { useSystemStore } from "@/store";
import { soundManager } from "@/lib/sound";
import { DENCKER_ASSETS } from "@/lib/seed-data";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ modo?: string }>;
}

export default function PagoClientePage({ params, searchParams }: PageProps) {
  const { pedidos, updatePedidoEstado, addAlerta, qrBancarioUrl, qrBancarioTitular, qrBancarioBanco } = useSystemStore();
  const [pedidoId, setPedidoId] = useState<string>("");
  const [metodo, setMetodo] = useState<"qr" | "efectivo" | "split">("qr");
  const [billeteSeleccionado, setBilleteSeleccionado] = useState<number>(100);
  const [splitPersonas, setSplitPersonas] = useState<number>(2);
  const [pagadoExito, setPagadoExito] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    params.then((p) => setPedidoId(p.id));
    if (searchParams) {
      searchParams.then((sp) => {
        if (sp.modo === "efectivo" || sp.modo === "qr" || sp.modo === "split") {
          setMetodo(sp.modo);
        }
      });
    }
  }, [params, searchParams]);

  // Buscar pedido en el store o comanda activa
  const pedido = pedidos.find((p) => p.id === pedidoId) || {
    id: pedidoId || "PED-1025",
    mesa_numero: 4,
    total: 68.0,
    cliente_nombre: "Mesa 4",
    items: [
      { id: "1", producto_nombre: "Café de Especialidad Yungas", cantidad: 2, subtotal: 24 },
      { id: "2", producto_nombre: "Croissant Mantequilla Artesanal", cantidad: 2, subtotal: 36 },
      { id: "3", producto_nombre: "Cuñapé Caliente al Horno", cantidad: 1, subtotal: 8 },
    ],
  };

  const total = pedido.total || 68.0;
  const cambio = Math.max(0, billeteSeleccionado - total);

  const handleConfirmarPago = () => {
    soundManager.playSuccessTone();
    updatePedidoEstado(pedido.id, "pagado");
    addAlerta({
      mesa_numero: pedido.mesa_numero,
      tipo: "pago_recibido",
      mensaje: `Mesa ${pedido.mesa_numero} completó el pago de Bs ${total.toFixed(2)} por ${
        metodo === "qr" ? "QR Simple" : metodo === "efectivo" ? `Efectivo (paga con Bs ${billeteSeleccionado})` : "Cuenta Dividida"
      }`,
      datos_extra: { pedidoId: pedido.id, metodo },
    });
    setPagadoExito(true);
  };

  return (
    <div className="w-full min-h-screen bg-[#F2ECE1] text-[#1E130C] pb-20 font-sans">
      {/* ── Header Dencker Pan ── */}
      <header className="sticky top-0 z-30 bg-[#1E130C] border-b-2 border-amber-500/30 text-white px-4 py-3 shadow-xl">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link
            href={`/mesa/${pedido.mesa_numero}`}
            className="flex items-center gap-1.5 text-xs text-amber-200 hover:text-white transition font-bold"
          >
            <ArrowLeft size={16} />
            <span>Volver a Mesa {pedido.mesa_numero}</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-serif font-black text-sm text-white">Pago de Comanda</span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#991B24] text-white border border-amber-400/30">
              Mesa {pedido.mesa_numero}
            </span>
          </div>
          <span className="text-xs font-mono text-amber-300 font-black">
            Bs {total.toFixed(2)}
          </span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {pagadoExito ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-8 rounded-3xl bg-white border-2 border-emerald-500 shadow-2xl text-center space-y-4"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner border border-emerald-300">
              <CheckCircle2 size={48} />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-black text-stone-950">
                ¡Pago Registrado con Éxito!
              </h2>
              <p className="text-xs text-stone-600 mt-1 font-medium">
                La caja central y el mesero han sido notificados. Tu comprobante digital está listo.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF6EF] border-2 border-[#D8C7B2] text-xs text-left space-y-1">
              <div className="flex justify-between font-black">
                <span className="text-stone-800">Total Abonado:</span>
                <span className="font-mono text-[#991B24]">Bs {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600 font-medium">
                <span>Método:</span>
                <span className="capitalize font-bold text-stone-900">{metodo}</span>
              </div>
              <div className="flex justify-between text-stone-600 font-medium">
                <span>Mesa:</span>
                <span className="font-bold text-stone-900">Mesa {pedido.mesa_numero}</span>
              </div>
            </div>

            <Link
              href={`/mesa/${pedido.mesa_numero}`}
              className="w-full py-3.5 rounded-2xl bg-[#991B24] hover:bg-[#7F1D1D] text-white font-black text-xs shadow-md block text-center border-2 border-[#7F1D1D]"
            >
              Volver al Menú Principal
            </Link>
          </motion.div>
        ) : (
          <>
            {/* ── Resumen de Consumo ── */}
            <div className="p-5 rounded-3xl bg-white border-2 border-[#D5C7B5] shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#EAE0D2]">
                <div>
                  <h3 className="font-serif font-black text-base text-stone-950">
                    Mesa {pedido.mesa_numero} — Dencker Pan
                  </h3>
                  <span className="text-[11px] text-stone-500 font-medium">Detalle de productos consumidos</span>
                </div>
                <span className="font-serif text-2xl font-black text-[#991B24] font-mono">
                  Bs {total.toFixed(2)}
                </span>
              </div>

              <div className="divide-y divide-[#EAE0D2] text-xs">
                {pedido.items?.map((it, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <span className="font-medium text-stone-900">
                      {it.cantidad}x {it.producto_nombre}
                    </span>
                    <span className="font-mono font-black text-[#991B24]">
                      Bs {it.subtotal.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Tab Selector de Métodos de Pago ── */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "qr", label: "QR Simple", icon: QrCode },
                { id: "efectivo", label: "Efectivo", icon: Banknote },
                { id: "split", label: "Dividir", icon: Users },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = metodo === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      soundManager.playClick();
                      setMetodo(tab.id as typeof metodo);
                    }}
                    className={`flex items-center justify-center gap-1.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#991B24] text-white border-2 border-[#7F1D1D] shadow-md font-black ring-2 ring-amber-400/30"
                        : "bg-white hover:bg-[#FAF6EF] text-stone-800 border-2 border-[#D5C7B5] font-bold"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ── METODO 1: QR SIMPLE ── */}
            {metodo === "qr" && (
              <div className="p-6 rounded-3xl bg-white border-2 border-[#D5C7B5] shadow-sm text-center space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-black">
                    Interoperable Bolivia • ASFI
                  </span>
                  <h4 className="font-serif text-lg font-black text-stone-950">
                    Escanea con tu App Bancaria
                  </h4>
                  <p className="text-xs text-stone-600 font-medium">
                    {qrBancarioBanco || "BCP, Banco Unión, BNB, Mercantil Santa Cruz, Banco Sol, Fie"}
                  </p>
                  <p className="text-[11px] text-stone-600 font-medium">
                    Titular: <span className="font-bold text-stone-950">{qrBancarioTitular || "Dencker Pan S.R.L."}</span>
                  </p>
                </div>

                {/* QR Visual */}
                <div className="p-4 bg-white rounded-3xl border-2 border-amber-400 inline-block shadow-lg">
                  <div className="w-56 h-56 bg-stone-50 rounded-2xl flex flex-col items-center justify-center relative p-2 overflow-hidden border border-stone-200">
                    <img
                      src={qrBancarioUrl || "/img/logo/logo.png"}
                      alt="QR Bancario Oficial"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="pt-2 text-center">
                    <span className="text-sm font-mono font-black text-[#991B24]">
                      Monto: Bs {total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-stone-600 font-medium">
                  <span>Glosa: Dencker Mesa {pedido.mesa_numero}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(`Dencker Mesa ${pedido.mesa_numero}`);
                      setCopiado(true);
                      setTimeout(() => setCopiado(false), 2000);
                    }}
                    className="p-1 rounded-lg hover:bg-stone-100 text-stone-700 cursor-pointer"
                  >
                    {copiado ? <Check size={14} className="text-emerald-600 font-bold" /> : <Copy size={14} />}
                  </button>
                </div>

                <button
                  onClick={handleConfirmarPago}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck size={16} /> Ya realicé la transferencia QR
                </button>
              </div>
            )}

            {/* ── METODO 2: EFECTIVO BOLIVIANOS ── */}
            {metodo === "efectivo" && (
              <div className="p-6 rounded-3xl bg-white border-2 border-[#D5C7B5] shadow-sm space-y-5">
                <div>
                  <h4 className="font-serif text-lg font-black text-stone-950">
                    ¿Con cuánto vas a abonar?
                  </h4>
                  <p className="text-xs text-stone-600 font-medium">
                    El mesero te traerá el cambio exacto directamente a la mesa
                  </p>
                </div>

                {/* Billetes Bolivianos */}
                <div className="grid grid-cols-3 gap-2.5">
                  {[200, 100, 50, 20, 10].map((den) => {
                    const isSelected = billeteSeleccionado === den;
                    return (
                      <motion.button
                        key={den}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => {
                          soundManager.playClick();
                          setBilleteSeleccionado(den);
                        }}
                        className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#991B24] text-white border-[#7F1D1D] shadow-md font-black ring-2 ring-amber-400/30 scale-102"
                            : "bg-white hover:bg-[#FAF6EF] border-[#D5C7B5] text-stone-900 font-bold"
                        }`}
                      >
                        <div className="text-[10px] uppercase font-bold opacity-80">Billete</div>
                        <div className="font-serif font-black text-xl font-mono">Bs {den}</div>
                      </motion.button>
                    );
                  })}
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={() => {
                      soundManager.playClick();
                      setBilleteSeleccionado(total);
                    }}
                    className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                      billeteSeleccionado === total
                        ? "bg-[#991B24] text-white border-[#7F1D1D] shadow-md font-black ring-2 ring-amber-400/30 scale-102"
                        : "bg-white hover:bg-[#FAF6EF] border-[#D5C7B5] text-stone-900 font-bold"
                    }`}
                  >
                    <div className="text-[10px] uppercase font-bold opacity-80">Pago Exacto</div>
                    <div className="font-serif font-black text-xl font-mono">
                      Bs {total.toFixed(0)}
                    </div>
                  </motion.button>
                </div>

                {/* Box de Cambio */}
                <div className="p-4 rounded-2xl bg-emerald-100/90 border-2 border-emerald-500 flex items-center justify-between text-xs text-emerald-950 font-bold shadow-xs">
                  <div>
                    <span className="font-black text-emerald-950 block">
                      Cambio para el cliente:
                    </span>
                    <span className="text-[11px] text-emerald-900 font-medium">
                      Entregas Bs {billeteSeleccionado.toFixed(2)}
                    </span>
                  </div>
                  <span className="font-serif text-2xl font-black text-emerald-950 font-mono">
                    Bs {cambio.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={handleConfirmarPago}
                  className="w-full py-3.5 rounded-2xl bg-[#991B24] hover:bg-[#7F1D1D] text-white font-black text-xs border-2 border-[#7F1D1D] shadow-lg transition active:scale-98 cursor-pointer"
                >
                  Solicitar Cobro en Efectivo
                </button>
              </div>
            )}

            {/* ── METODO 3: SPLIT BILL (DIVIDIR CUENTA) ── */}
            {metodo === "split" && (
              <div className="p-6 rounded-3xl bg-white border-2 border-[#D5C7B5] shadow-sm space-y-5">
                <div>
                  <h4 className="font-serif text-lg font-black text-stone-950">
                    Dividir en Partes Iguales
                  </h4>
                  <p className="text-xs text-stone-600 font-medium">
                    Divide el monto entre los amigos o colegas presentes en la mesa
                  </p>
                </div>

                {/* Selector de Personas */}
                <div className="flex items-center justify-center gap-2">
                  {[2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        soundManager.playClick();
                        setSplitPersonas(num);
                      }}
                      className={`w-12 h-12 rounded-2xl font-black text-sm transition-all flex flex-col items-center justify-center cursor-pointer border-2 ${
                        splitPersonas === num
                          ? "bg-[#991B24] text-white border-[#7F1D1D] shadow-md scale-105"
                          : "bg-white hover:bg-[#FAF6EF] text-stone-900 border-[#D5C7B5] font-bold"
                      }`}
                    >
                      <span>{num}</span>
                      <span className="text-[9px] opacity-80">pax</span>
                    </button>
                  ))}
                </div>

                {/* Tarjeta de Cuota por Persona */}
                <div className="p-5 rounded-2xl bg-[#FAF6EF] border-2 border-[#D8C7B2] text-center space-y-1 shadow-xs">
                  <span className="text-xs text-stone-600 uppercase tracking-wider font-bold">
                    Cuota Individual por Persona
                  </span>
                  <div className="font-serif text-3xl font-black text-[#991B24] font-mono">
                    Bs {(total / splitPersonas).toFixed(2)}
                  </div>
                  <span className="text-[11px] text-stone-500 block font-medium">
                    {splitPersonas} personas aportando equitativamente
                  </span>
                </div>

                <button
                  onClick={handleConfirmarPago}
                  className="w-full py-3.5 rounded-2xl bg-[#991B24] hover:bg-[#7F1D1D] text-white font-black text-xs border-2 border-[#7F1D1D] shadow-lg transition active:scale-98 cursor-pointer"
                >
                  Registrar Cobro Dividido
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

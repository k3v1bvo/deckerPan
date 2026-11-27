"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  MessageCircle,
  Phone,
  Mail,
  User,
  Coffee,
  Heart,
  ShieldCheck,
  UtensilsCrossed,
} from "lucide-react";
import { useSystemStore } from "@/store";
import { Reserva, EstadoReserva } from "@/types";
import { soundManager } from "@/lib/sound";
import { DENCKER_ASSETS, SEED_ZONAS } from "@/lib/seed-data";
import { DenckerLogo } from "@/components/brand/DenckerLogo";

const TURNOS_HORARIOS = [
  { id: "t1", label: "07:30 - 09:00", turno: "Desayuno & Primera Tanda", icono: "🥐" },
  { id: "t2", label: "09:00 - 10:30", turno: "Desayuno Ejecutivo", icono: "☕" },
  { id: "t3", label: "10:30 - 12:00", turno: "Brunch & Degustación", icono: "🥪" },
  { id: "t4", label: "12:30 - 14:00", turno: "Almuerzo & Sándwiches Gourmet", icono: "🥗" },
  { id: "t5", label: "16:00 - 17:30", turno: "Té de la Tarde & Tanda Caliente", icono: "🍰" },
  { id: "t6", label: "17:30 - 19:00", turno: "Café de Especialidad 4 Llamas", icono: "✨" },
  { id: "t7", label: "19:00 - 21:00", turno: "Pizzas al Horno & Cena", icono: "🍕" },
];

export default function ReservasPage() {
  const { addReserva, zonas } = useSystemStore();

  const zonasDisponibles = useMemo(() => {
    return zonas && zonas.length > 0 ? zonas : SEED_ZONAS;
  }, [zonas]);

  // Estados del Formulario
  const [zonaSeleccionada, setZonaSeleccionada] = useState<string>("z1");
  const [fecha, setFecha] = useState<string>("");
  const [minFecha, setMinFecha] = useState<string>("");

  // Inicializar fecha mañana en cliente para evitar bloqueo de prerender en Next.js 16
  useEffect(() => {
    const d = new Date();
    setMinFecha(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 1);
    setFecha(d.toISOString().split("T")[0]);
  }, []);
  const [horario, setHorario] = useState<string>("16:00 - 17:30");
  const [personas, setPersonas] = useState<number>(2);
  const [tipoEvento, setTipoEvento] = useState<string>("Mesa Regular");
  const [nombre, setNombre] = useState<string>("");
  const [telefono, setTelefono] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [notas, setNotas] = useState<string>("");

  // Estado de Confirmación
  const [reservaConfirmada, setReservaConfirmada] = useState<Reserva | null>(null);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorValidacion(null);

    if (!nombre.trim()) {
      setErrorValidacion("Por favor, ingresa tu nombre completo.");
      soundManager.playError();
      return;
    }

    if (!telefono.trim() || telefono.length < 7) {
      setErrorValidacion("Por favor, ingresa un número de teléfono o WhatsApp válido.");
      soundManager.playError();
      return;
    }

    const nuevaReserva: Omit<Reserva, "id" | "created_at" | "updated_at"> = {
      nombre_cliente: nombre.trim(),
      telefono: telefono.trim(),
      email: email.trim() || undefined,
      tipo_evento: tipoEvento,
      fecha_evento: `${fecha} ${horario}`,
      numero_personas: personas,
      descripcion: `Zona: ${zonasDisponibles.find((z) => z.id === zonaSeleccionada)?.nombre || "General"}. ${notas.trim()}`,
      estado: "pendiente" as EstadoReserva,
    };

    addReserva(nuevaReserva);
    soundManager.playSuccessTone();

    const reservaCreada: Reserva = {
      ...nuevaReserva,
      id: "res-" + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setReservaConfirmada(reservaCreada);
  };

  const getWhatsAppShareUrl = () => {
    if (!reservaConfirmada) return "#";
    const texto = `¡Hola Dencker Pan! He registrado una solicitud de reserva en la web:\n\n` +
      `👤 *Cliente:* ${reservaConfirmada.nombre_cliente}\n` +
      `📅 *Fecha & Turno:* ${reservaConfirmada.fecha_evento}\n` +
      `👥 *Personas:* ${reservaConfirmada.numero_personas} comensales\n` +
      `📍 *Detalle:* ${reservaConfirmada.descripcion || "Mesa Regular"}\n` +
      `📞 *Contacto:* ${reservaConfirmada.telefono}\n\n` +
      `¿Podrían confirmarme la disponibilidad en su sistema, por favor?`;
    return `https://wa.me/59176911000?text=${encodeURIComponent(texto)}`;
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFBF7] text-[#1E130C] font-sans selection:bg-amber-500 selection:text-stone-950 flex flex-col justify-between">
      {/* ── HEADER DE NAVEGACIÓN ── */}
      <header className="sticky top-0 z-30 bg-[#160D08] text-white border-b border-amber-500/20 px-4 py-3 shadow-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-stone-300 hover:text-white transition font-bold py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Volver a la Tienda</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 p-1 border border-amber-500/30 flex items-center justify-center">
              <img
                src={DENCKER_ASSETS.logoLight}
                alt="Don Dencker"
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <div className="leading-tight">
              <span className="font-serif font-black text-sm text-white block">
                Dencker Pan
              </span>
              <span className="text-[10px] text-amber-300/80 font-mono">
                Reservas de Mesas &bull; Cochabamba
              </span>
            </div>
          </div>

          <a
            href={DENCKER_ASSETS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-amber-200 hover:text-white transition flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#991B24] hover:bg-[#7F1D1D] border border-amber-400/40 shadow-sm"
          >
            <MessageCircle size={15} />
            <span className="hidden sm:inline">WhatsApp Directo</span>
          </a>
        </div>
      </header>

      {/* ── CUERPO PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto w-full px-4 py-8 space-y-8 flex-1">
        {reservaConfirmada ? (
          /* PANTALLA DE ÉXITO */
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-6 sm:p-10 rounded-3xl bg-white border-2 border-emerald-500/40 shadow-2xl text-center space-y-6 max-w-xl mx-auto"
          >
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 border border-emerald-300 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 size={44} />
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase font-extrabold text-emerald-700 tracking-wider">
                Solicitud Recibida en el Sistema
              </span>
              <h2 className="font-serif font-black text-2xl sm:text-3xl text-stone-900">
                ¡Gracias, {reservaConfirmada.nombre_cliente}!
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
                Tu solicitud de mesa para <strong>{reservaConfirmada.numero_personas} comensales</strong> ha sido registrada en nuestro panel de gerencia.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F9F5EC] border border-[#E8DEC8] text-xs text-left space-y-2.5">
              <div className="flex justify-between border-b border-[#E8DEC8] pb-2">
                <span className="text-stone-500">Fecha & Turno:</span>
                <strong className="text-stone-900 font-mono">{reservaConfirmada.fecha_evento}</strong>
              </div>
              <div className="flex justify-between border-b border-[#E8DEC8] pb-2">
                <span className="text-stone-500">Número de Personas:</span>
                <strong className="text-stone-900 font-bold">{reservaConfirmada.numero_personas} personas</strong>
              </div>
              <div className="flex justify-between border-b border-[#E8DEC8] pb-2">
                <span className="text-stone-500">Tipo de Reserva:</span>
                <strong className="text-stone-900 font-semibold">{reservaConfirmada.tipo_evento}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Detalles:</span>
                <span className="text-stone-800 text-right font-medium">{reservaConfirmada.descripcion}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={getWhatsAppShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 transition"
              >
                <MessageCircle size={18} />
                <span>Confirmar por WhatsApp con Don Dencker</span>
              </a>

              <button
                onClick={() => setReservaConfirmada(null)}
                className="w-full py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition cursor-pointer"
              >
                Hacer otra reserva
              </button>
            </div>
          </motion.div>
        ) : (
          /* FORMULARIO DE RESERVAS */
          <div className="space-y-8">
            {/* Titular Hero */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-600/30 text-amber-900 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={14} className="text-amber-700" />
                <span>Experiencia Gastronómica Dencker Pan</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl font-black text-stone-900 tracking-tight leading-tight">
                Reserva tu Mesa en Nuestro Obrador
              </h1>
              <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto">
                Disfruta de nuestra masa madre viva de 24 horas, bollería hojaldrada y café de altura en la calidez de nuestro salón o terraza en Av. Salamanca.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* 1. SELECCIÓN DE AMBIENTE / ZONA */}
              <div className="space-y-3">
                <label className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <MapPin size={17} className="text-[#991B24]" />
                  <span>1. Selecciona el Ambiente de tu Preferencia</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {zonasDisponibles.map((z) => {
                    const esActivo = zonaSeleccionada === z.id;
                    return (
                      <button
                        type="button"
                        key={z.id}
                        onClick={() => {
                          soundManager.playClick();
                          setZonaSeleccionada(z.id);
                        }}
                        className={`p-4 rounded-2xl border text-left transition-all active:scale-98 cursor-pointer ${
                          esActivo
                            ? "bg-[#1E130C] text-white border-amber-500 shadow-xl shadow-stone-950/20 ring-2 ring-amber-400/40"
                            : "bg-white text-stone-800 border-stone-200 hover:border-amber-400/60 hover:bg-stone-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-bold text-base block">
                            {z.nombre}
                          </span>
                          {esActivo && (
                            <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                          )}
                        </div>
                        <p
                          className={`text-xs mt-1 leading-relaxed ${
                            esActivo ? "text-stone-300" : "text-stone-500"
                          }`}
                        >
                          {z.descripcion || "Mesa confortable con servicio de sala"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. NÚMERO DE COMENSALES Y FECHA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Comensales */}
                <div className="space-y-2 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <label className="font-bold text-xs uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <Users size={15} className="text-amber-600" />
                    <span>2. Número de Comensales</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5, 6, "8+"].map((num) => {
                      const val = typeof num === "number" ? num : 8;
                      const esSel = personas === val;
                      return (
                        <button
                          type="button"
                          key={num}
                          onClick={() => {
                            soundManager.playClick();
                            setPersonas(val);
                          }}
                          className={`flex-1 py-2.5 rounded-xl font-bold text-sm border transition active:scale-95 cursor-pointer ${
                            esSel
                              ? "bg-[#991B24] text-white border-[#7F1D1D] shadow-sm"
                              : "bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200"
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-[11px] text-stone-400 block pt-1">
                    *Para grupos mayores a 8 personas recomendamos la Sala VIP o Patio.
                  </span>
                </div>

                {/* Fecha */}
                <div className="space-y-2 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <label className="font-bold text-xs uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <CalendarIcon size={15} className="text-amber-600" />
                    <span>3. Fecha de la Visita</span>
                  </label>
                  <input
                    type="date"
                    value={fecha}
                    min={minFecha || undefined}
                    onChange={(e) => setFecha(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 font-medium text-sm focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[11px] text-stone-400 block pt-1">
                    Atención de Lunes a Domingo: 07:00 a 21:30
                  </span>
                </div>
              </div>

              {/* 3. HORARIO / TANDA DE HORNO */}
              <div className="space-y-3">
                <label className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <Clock size={17} className="text-[#991B24]" />
                  <span>4. Elige tu Turno &amp; Horario Preferido</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {TURNOS_HORARIOS.map((t) => {
                    const sel = horario === t.label;
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => {
                          soundManager.playClick();
                          setHorario(t.label);
                        }}
                        className={`p-3 rounded-2xl border text-left transition active:scale-95 cursor-pointer ${
                          sel
                            ? "bg-[#991B24] text-white border-[#7F1D1D] shadow-md ring-2 ring-red-400/40"
                            : "bg-white text-stone-800 border-stone-200 hover:bg-stone-50"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{t.icono}</span>
                          <span className="font-mono font-bold text-xs">{t.label}</span>
                        </div>
                        <span
                          className={`text-[10px] block mt-1 truncate ${
                            sel ? "text-red-100" : "text-stone-500"
                          }`}
                        >
                          {t.turno}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. DATOS DE CONTACTO Y NOTAS */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <User size={16} className="text-amber-600" />
                  <span>5. Tus Datos de Contacto</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-stone-600 block mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej. Rodrigo Fernández"
                      required
                      className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-600 block mb-1">
                      WhatsApp o Teléfono Celular *
                    </label>
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="Ej. 76911000"
                      required
                      className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-stone-600 block mb-1">
                      Correo Electrónico (Opcional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-600 block mb-1">
                      Tipo de Ocasión
                    </label>
                    <select
                      value={tipoEvento}
                      onChange={(e) => setTipoEvento(e.target.value)}
                      className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-amber-500"
                    >
                      <option value="Mesa Regular">Desayuno / Merienda Regular</option>
                      <option value="Cumpleaños">Cumpleaños (deseo torta entera)</option>
                      <option value="Reunión de Negocios">Reunión de Negocios</option>
                      <option value="Aniversario">Aniversario / Pareja</option>
                      <option value="Cata de Café">Degustación de Café 4 Llamas</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-600 block mb-1">
                    Notas o Requerimientos Especiales (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Ej. Preferimos mesa cerca a la ventana, solicitamos opciones sin lactosa..."
                    className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>
              </div>

              {/* Mensaje de Error */}
              {errorValidacion && (
                <div className="p-3.5 rounded-2xl bg-rose-100 border border-rose-300 text-rose-800 text-xs font-semibold">
                  {errorValidacion}
                </div>
              )}

              {/* Botón de Envío */}
              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-[#1E130C] hover:bg-[#322015] text-[#FAF7F2] font-black text-sm uppercase tracking-wider shadow-xl shadow-stone-950/25 transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 size={18} className="text-amber-400" />
                <span>Confirmar y Enviar Solicitud de Reserva</span>
              </button>
            </form>
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-stone-200 py-6 px-4 text-center text-xs text-stone-500 bg-white">
        <p>
          Dencker Pan &bull; Casa Matriz Av. Daniel Salamanca, Cochabamba, Bolivia &bull; WhatsApp +591 76911000
        </p>
      </footer>
    </div>
  );
}

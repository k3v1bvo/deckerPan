"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coffee,
  Sparkles,
  Droplet,
  Cookie,
  Plus,
  Check,
  RotateCcw,
  ShoppingBag,
  MessageCircle,
  Flame,
  Wind,
} from "lucide-react";
import { soundManager } from "@/lib/sound";
import { useCartStore, useUIStore } from "@/store";

interface Grano {
  id: string;
  nombre: string;
  origen: string;
  altura: string;
  tostado: string;
  notas: string[];
  colorHex: string;
}

interface Leche {
  id: string;
  nombre: string;
  descripcion: string;
  temp: string;
  alturaLiquido: number;
  colorHex: string;
}

interface Acompanamiento {
  id: string;
  nombre: string;
  tipo: "horneado" | "reposteria";
  precio: number;
  imagen: string;
  desc: string;
}

const GRANOS: Grano[] = [
  {
    id: "caranavi",
    nombre: "Caranavi Altura",
    origen: "Yungas, La Paz",
    altura: "1,600 msnm",
    tostado: "Medio Intenso",
    notas: ["Cacao puro", "Avellana tostada", "Cítrico brillante"],
    colorHex: "#3E1E14",
  },
  {
    id: "bourbon",
    nombre: "Bourbon Miel",
    origen: "Samaipata, Santa Cruz",
    altura: "1,450 msnm",
    tostado: "Medio Claro",
    notas: ["Miel de caña", "Durazno", "Cuerpo sedoso"],
    colorHex: "#542D1C",
  },
  {
    id: "blend",
    nombre: "Blend Dencker Pan",
    origen: "Selección de la Casa",
    altura: "1,550 msnm",
    tostado: "Oscuro Artesanal",
    notas: ["Chocolate belga", "Caramelo", "Postgusto prolongado"],
    colorHex: "#2C140D",
  },
];

const LECHES: Leche[] = [
  {
    id: "microfoam",
    nombre: "Microfoam Terciopelo",
    descripcion: "Vaporizada a 65°C con textura sedosa para arte latte",
    temp: "Caliente (65°C)",
    alturaLiquido: 55,
    colorHex: "#FBF7EE",
  },
  {
    id: "avena",
    nombre: "Avena Barista Especial",
    descripcion: "Leche vegetal cremosa con sutil dulzor tostado",
    temp: "Caliente (60°C)",
    alturaLiquido: 50,
    colorHex: "#EFE6D4",
  },
  {
    id: "coldfoam",
    nombre: "Cold Foam Vainilla",
    descripcion: "Nube de espuma fría batida en frío sobre el espresso",
    temp: "Frío Artesanal",
    alturaLiquido: 40,
    colorHex: "#FFFBF2",
  },
  {
    id: "solo",
    nombre: "Espresso Puro (Sin Leche)",
    descripcion: "Doble shot ristretto con crema dorada espesa",
    temp: "Extracción Directa (92°C)",
    alturaLiquido: 0,
    colorHex: "transparent",
  },
];

// URLs auténticas de alta resolución de Unsplash (libre de links caídos de imgbb)
const ACOMPANAMIENTOS: Acompanamiento[] = [
  {
    id: "cunape",
    nombre: "Cuñapé Abizcochado",
    tipo: "horneado",
    precio: 9,
    imagen: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
    desc: "Recién salido del horno con queso chaqueño",
  },
  {
    id: "croissant",
    nombre: "Croissant Francés",
    tipo: "horneado",
    precio: 18,
    imagen: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80",
    desc: "Hojaldrado tradicional con 100% mantequilla",
  },
  {
    id: "alfajor",
    nombre: "Alfajor de Maicena",
    tipo: "reposteria",
    precio: 14,
    imagen: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80",
    desc: "Relleno abundante de dulce de leche y coco",
  },
  {
    id: "milhojas",
    nombre: "Torta Mil Hojas Mini",
    tipo: "reposteria",
    precio: 20,
    imagen: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80",
    desc: "Capas crujientes con manjar blanco de la casa",
  },
];

export default function CoffeeLab() {
  const [granoSel, setGranoSel] = useState<Grano>(GRANOS[0]);
  const [lecheSel, setLecheSel] = useState<Leche>(LECHES[0]);
  const [acompSel, setAcompSel] = useState<Acompanamiento>(ACOMPANAMIENTOS[0]);
  const [agregadoExito, setAgregadoExito] = useState(false);

  const { addItem } = useCartStore();
  const { setCartOpen } = useUIStore();

  const precioCafe = 20;
  const precioTotal = precioCafe + acompSel.precio;

  const handleSelectGrano = (g: Grano) => {
    soundManager.playCoffeeSteam();
    setGranoSel(g);
  };

  const handleSelectLeche = (l: Leche) => {
    soundManager.playPorcelainTink();
    setLecheSel(l);
  };

  const handleSelectAcomp = (a: Acompanamiento) => {
    if (a.tipo === "horneado") {
      soundManager.playBreadCrunch();
    } else {
      soundManager.playPorcelainTink();
    }
    setAcompSel(a);
  };

  const handleAgregarCanasta = () => {
    soundManager.playOrderChime();

    const productoLab = {
      id: `lab-${Date.now()}`,
      nombre: `Experiencia de Café: ${granoSel.nombre}`,
      descripcion: `${lecheSel.nombre} • Acompañado de ${acompSel.nombre} (${granoSel.origen})`,
      precio: precioTotal,
      costo: 8,
      imagen_url: acompSel.imagen,
      disponible: true,
      es_mas_vendido: true,
      stock: 99,
      chips_personalizacion: [
        granoSel.nombre,
        lecheSel.nombre,
        acompSel.nombre,
      ],
      categoria_id: "c7",
      estacion: "cafeteria" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addItem(
      productoLab,
      [granoSel.nombre, lecheSel.nombre, `Maridaje: ${acompSel.nombre}`],
      `Receta experimental personalizada: Grano ${granoSel.nombre}, ${lecheSel.temp}`
    );

    setAgregadoExito(true);
    setTimeout(() => {
      setAgregadoExito(false);
      setCartOpen(true);
    }, 600);
  };

  return (
    <div className="w-full relative text-white space-y-12">
      {/* Cabecera del Espacio Experimental */}
      <div className="text-center space-y-3 max-w-2xl mx-auto w-full flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Sparkles size={13} className="text-amber-400" />
          <span>Laboratorio Sensorial de Barismo • 1,600 msnm</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight text-center">
          Espacio Experimental de Café
        </h2>
        <p className="text-amber-100/70 text-xs sm:text-sm leading-relaxed text-center">
          Combina en vivo la procedencia de los granos, la emulsión de leche y tu maridaje de repostería favorito.
          Añade tu creación personalizada directo a tu orden.
        </p>
      </div>

      {/* Layout Asimétrico 2 Columnas (7 Columnas a la izquierda, 5 Columnas Sticky a la derecha) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Controles de Selección Interactiva (7 Columnas con gap-6 entre pasos) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* 1. Selección de Granos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Flame size={14} />
                <span>1. Elige el Grano & Tueste</span>
              </span>
              <span className="text-stone-400 text-[11px] font-mono">{granoSel.altura}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {GRANOS.map((g) => {
                const isSel = granoSel.id === g.id;
                return (
                  <motion.button
                    key={g.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSelectGrano(g)}
                    className={`p-4 rounded-2xl border text-left transition-all relative ${
                      isSel
                        ? "bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-950/40 text-white ring-1 ring-amber-400/50"
                        : "bg-white/5 border-white/10 hover:bg-white/10 text-stone-300"
                    }`}
                  >
                    {isSel && (
                      <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    )}
                    <p className="font-serif font-bold text-xs sm:text-sm text-white">{g.nombre}</p>
                    <p className="text-[10px] text-amber-200/70 mt-0.5">{g.origen}</p>
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {g.notas.slice(0, 2).map((nota, i) => (
                        <span key={i} className="text-[9px] px-2 py-0.5 rounded-md bg-white/10 text-stone-300">
                          {nota}
                        </span>
                      ))}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* 2. Textura de Leche */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Droplet size={14} />
                <span>2. Técnica de Emulsión & Temperatura</span>
              </span>
              <span className="text-stone-400 text-[11px] font-mono">{lecheSel.temp}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LECHES.map((l) => {
                const isSel = lecheSel.id === l.id;
                return (
                  <motion.button
                    key={l.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSelectLeche(l)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      isSel
                        ? "bg-amber-500/20 border-amber-400 shadow-md text-white ring-1 ring-amber-400/50"
                        : "bg-white/5 border-white/10 hover:bg-white/10 text-stone-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xs text-white">{l.nombre}</p>
                      {isSel && <Check size={14} className="text-amber-400" />}
                    </div>
                    <p className="text-[10px] text-stone-400 mt-1 line-clamp-1">{l.descripcion}</p>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* 3. Acompañamiento / Maridaje (Con fotos auténticas de Unsplash) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Cookie size={14} />
                <span>3. Complemento de Panadería o Repostería</span>
              </span>
              <span className="text-amber-300 font-mono text-[11px]">+Bs {acompSel.precio}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ACOMPANAMIENTOS.map((a) => {
                const isSel = acompSel.id === a.id;
                return (
                  <motion.button
                    key={a.id}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSelectAcomp(a)}
                    className={`p-2.5 rounded-2xl border text-left transition-all overflow-hidden ${
                      isSel
                        ? "bg-amber-500/20 border-amber-400 shadow-md text-white ring-1 ring-amber-400/50"
                        : "bg-white/5 border-white/10 hover:bg-white/10 text-stone-300"
                    }`}
                  >
                    <div className="h-20 rounded-xl overflow-hidden mb-2.5 bg-stone-900 relative">
                      <img
                        src={a.imagen}
                        alt={a.nombre}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <p className="font-bold text-xs text-white truncate">{a.nombre}</p>
                    <p className="text-[10px] text-amber-300 font-mono mt-0.5">Bs {a.precio}.00</p>
                  </motion.button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Tarjeta 3D Sensorial (5 Columnas Fija con STICKY TOP-8) */}
        <div className="lg:col-span-5 sticky top-8 flex justify-center">
          <motion.div
            style={{ perspective: 1000 }}
            className="w-full max-w-md rounded-[32px] bg-[#1E140E] border border-amber-600/30 p-6 sm:p-7 shadow-2xl space-y-6 relative group"
          >
            {/* Badge superior */}
            <div className="flex items-center justify-between text-xs border-b border-white/10 pb-3">
              <span className="text-amber-300 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={12} />
                <span>Receta Única Creada</span>
              </span>
              <span className="text-stone-400 font-mono text-[10px]">
                {granoSel.altura}
              </span>
            </div>

            {/* Taza Visual Dinámica con Animación de Vapor ASMR */}
            <div className="relative h-44 flex flex-col items-center justify-end">
              {/* Vapor de café flotante animado */}
              <div className="absolute top-2 w-20 h-16 flex justify-center gap-2 opacity-75">
                <motion.div
                  animate={{ y: [-4, -18, -4], opacity: [0.3, 0.8, 0.2] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-1.5 h-10 rounded-full bg-gradient-to-t from-white/30 to-transparent blur-[1px]"
                />
                <motion.div
                  animate={{ y: [-2, -22, -2], opacity: [0.4, 0.9, 0.2] }}
                  transition={{ duration: 3.1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                  className="w-2 h-12 rounded-full bg-gradient-to-t from-amber-200/40 to-transparent blur-[1.5px]"
                />
                <motion.div
                  animate={{ y: [-5, -16, -5], opacity: [0.3, 0.7, 0.1] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                  className="w-1.5 h-8 rounded-full bg-gradient-to-t from-white/30 to-transparent blur-[1px]"
                />
              </div>

              {/* Cuerpo de la Taza Cerámica */}
              <div className="w-36 h-28 rounded-b-[40px] rounded-t-[10px] bg-gradient-to-b from-[#2E1A11] to-[#180E09] border-2 border-amber-600/50 p-2 shadow-2xl relative overflow-hidden flex flex-col justify-end">
                {/* Capa de Leche Emulsionada */}
                {lecheSel.alturaLiquido > 0 && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${lecheSel.alturaLiquido}%` }}
                    transition={{ duration: 0.5 }}
                    style={{ backgroundColor: lecheSel.colorHex }}
                    className="w-full rounded-t-lg shadow-inner flex items-center justify-center opacity-90"
                  >
                    <span className="text-[8px] font-mono text-stone-700 tracking-tighter uppercase font-bold">
                      Microfoam
                    </span>
                  </motion.div>
                )}

                {/* Capa de Café Espresso Intenso */}
                <div
                  style={{ backgroundColor: granoSel.colorHex }}
                  className="w-full h-12 rounded-b-[32px] flex items-center justify-center shadow-lg"
                >
                  <span className="text-[8px] font-mono text-amber-200/80 tracking-tighter uppercase font-bold">
                    Espresso Double
                  </span>
                </div>

                {/* Asa de la taza */}
                <div className="absolute -right-5 top-4 w-7 h-14 rounded-r-2xl border-4 border-amber-700/60 pointer-events-none" />
              </div>
            </div>

            {/* Ficha Sensorial de la Creación */}
            <div className="bg-black/30 rounded-2xl p-4 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between items-baseline">
                <span className="font-serif font-bold text-white text-sm">
                  {granoSel.nombre} + {lecheSel.nombre.split(" ")[0]}
                </span>
                <span className="font-serif font-extrabold text-amber-300 text-base">
                  Bs {precioTotal.toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-stone-300 leading-snug">
                Acompañado de <strong className="text-amber-200">{acompSel.nombre}</strong>.
              </p>
              <div className="pt-1.5 flex items-center gap-1.5 text-[10px] text-amber-400 font-mono">
                <Wind size={12} />
                <span>Perfil: {granoSel.notas.join(" • ")}</span>
              </div>
            </div>

            {/* Botón de Acción */}
            <button
              onClick={handleAgregarCanasta}
              disabled={agregadoExito}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-stone-950 font-black text-xs shadow-lg shadow-amber-950/50 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              {agregadoExito ? (
                <span className="flex items-center gap-1.5">
                  <Check size={16} />
                  <span>¡Receta Añadida a tu Orden!</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <ShoppingBag size={15} />
                  <span>Pedir esta Creación • Bs {precioTotal.toFixed(2)}</span>
                </span>
              )}
            </button>
          </motion.div>
        </div>

      </div>
    </div>
  );
}

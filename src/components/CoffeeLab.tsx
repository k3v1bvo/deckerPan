"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coffee,
  Sparkles,
  Flame,
  Wind,
  Check,
  ShoppingBag,
  SlidersHorizontal,
  Layers,
  Thermometer,
  Percent,
  Plus,
  Cookie,
  ArrowRight,
} from "lucide-react";
import { soundManager } from "@/lib/sound";
import { useCartStore, useUIStore } from "@/store";

// ============================================================================
// DATOS DEL LABORATORIO EXPERIMENTAL (GRANOS, EMULSIÓN, MARIDAJE)
// ============================================================================
export const COFFEE_GRAINS = [
  {
    id: "caranavi",
    name: "Caranavi Altura",
    origin: "Yungas, La Paz",
    altitude: "1,600 msnm",
    roast: "Tueste Medio-Oscuro",
    notes: ["Cacao puro", "Avellana tostada", "Cítrico brillante"],
    price: 16,
    color: "#4A2C18",
    cremaColor: "#C88A4B",
  },
  {
    id: "bourbon",
    name: "Bourbon Miel",
    origin: "Samaipata, Santa Cruz",
    altitude: "1,750 msnm",
    roast: "Tueste Medio • Honey Process",
    notes: ["Miel de caña", "Durazno maduro", "Floral sutil"],
    price: 18,
    color: "#5C371E",
    cremaColor: "#D99B52",
  },
  {
    id: "blend",
    name: "Blend Dencker Pan",
    origin: "Selección de la Casa",
    altitude: "1,650 msnm",
    roast: "Tueste Espresso Italiano",
    notes: ["Chocolate belga", "Caramelo", "Nuez pecana"],
    price: 15,
    color: "#3B2110",
    cremaColor: "#B87838",
  },
];

export const EMULSION_TECHNIQUES = [
  {
    id: "microfoam",
    name: "Microfoam Terciopelo",
    temp: "Caliente (65°C)",
    isCold: false,
    desc: "Vaporizada a 65°C con textura sedosa para arte latte",
    price: 4,
    layerColor: "#F5E6D3",
    layerHeight: 45,
    badge: "Microfoam",
  },
  {
    id: "avena",
    name: "Avena Barista Especial",
    temp: "Caliente (65°C)",
    isCold: false,
    desc: "Leche vegetal cremosa con sutil dulzor tostado",
    price: 6,
    layerColor: "#EBD5B3",
    layerHeight: 45,
    badge: "Avena Barista",
  },
  {
    id: "coldfoam",
    name: "Cold Foam Vainilla",
    temp: "Frío (6°C)",
    isCold: true,
    desc: "Nube de espuma fría batida con vainilla de Madagascar sobre el espresso",
    price: 5,
    layerColor: "#FFFDF9",
    layerHeight: 40,
    badge: "Cold Foam",
  },
  {
    id: "espresso",
    name: "Espresso Puro (Sin Leche)",
    temp: "Caliente (88°C)",
    isCold: false,
    desc: "Doble shot ristretto en máquina La Marzocco con crema dorada espesa",
    price: 0,
    layerColor: "transparent",
    layerHeight: 0,
    badge: "Ristretto Puro",
  },
];

export const PASTRY_PAIRINGS = [
  {
    id: "cunape",
    name: "Cuñapé Abizcochado",
    price: 9,
    tag: "Tradición Cruceña-Valluna",
    image: "https://images.unsplash.com/photo-1598373182133-52452f7691ef?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "croissant",
    name: "Croissant Francés",
    price: 18,
    tag: "100% Mantequilla • 72 Capas",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "alfajor-maicena",
    name: "Alfajor de Maicena",
    price: 14,
    tag: "Manjar Blanco Casero",
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "milhojas",
    name: "Torta Mil Hojas Mini",
    price: 20,
    tag: "Hojaldre Caramelizado",
    image: "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=600&q=80",
  },
];

// ============================================================================
// ANATOMÍA DEL CAFÉ: PROPORCIONES EXACTAS Y CAPAS PORCENTUALES
// ============================================================================
export interface LayerInfo {
  name: string;
  pct: number;
  color: string;
  textColor: string;
  border?: string;
}

export interface CoffeeRecipe {
  id: string;
  name: string;
  subtitle: string;
  volume: string;
  temp: string;
  intensity: number;
  price: number;
  notes: string;
  layers: LayerInfo[];
}

export const COFFEE_RECIPES: CoffeeRecipe[] = [
  {
    id: "espresso",
    name: "Espresso Doble (Doppio)",
    subtitle: "Extracción Pura a 9 Bares • La Marzocco",
    volume: "60 ml",
    temp: "92°C",
    intensity: 5,
    price: 14.00,
    notes: "Cuerpo denso y aterciopelado con crema avellana persistente y notas a chocolate amargo.",
    layers: [
      { name: "Crema Dorada de Café", pct: 25, color: "#C88A4B", textColor: "#1A110B" },
      { name: "Espresso Doble Puro Caranavi", pct: 75, color: "#2C140D", textColor: "#FAF6F0" },
    ],
  },
  {
    id: "americano",
    name: "Café Americano",
    subtitle: "Espresso + Agua Caliente Filtrada a 92°C",
    volume: "200 ml",
    temp: "90°C",
    intensity: 3,
    price: 15.00,
    notes: "Taza ligera y muy aromática. Preserva la acidez cítrica y el dulzor natural de los granos de altura.",
    layers: [
      { name: "Crema Ligera Superficial", pct: 10, color: "#D99B52", textColor: "#1A110B" },
      { name: "Agua Caliente Purificada a 92°C", pct: 60, color: "#543828", textColor: "#E5D3BD" },
      { name: "Espresso Doble de Especialidad", pct: 30, color: "#2C140D", textColor: "#FAF6F0" },
    ],
  },
  {
    id: "cortado",
    name: "Cortado Tradicional",
    subtitle: "Equilibrio 1:1 • Corta la Acidez con Suavidad",
    volume: "120 ml",
    temp: "65°C",
    intensity: 4,
    price: 16.00,
    notes: "Proporción clásica donde la leche entera vaporizada dulcifica el tueste sin opacar la potencia del café.",
    layers: [
      { name: "Fina Capa de Microespuma", pct: 15, color: "#FAF6F0", textColor: "#1A110B" },
      { name: "Leche Entera Vaporizada a 65°C", pct: 35, color: "#ECDDC9", textColor: "#1A110B" },
      { name: "Espresso Doble Concentrado", pct: 50, color: "#2C140D", textColor: "#FAF6F0" },
    ],
  },
  {
    id: "flatwhite",
    name: "Flat White Australiano",
    subtitle: "Doble Ristretto + Microfoam Sedoso",
    volume: "160 ml",
    temp: "65°C",
    intensity: 4,
    price: 18.00,
    notes: "Microfoam ultrafino integrado por completo con doble ristretto para una textura sedosa sin burbujas de aire.",
    layers: [
      { name: "Microfoam Sedoso Continuo", pct: 20, color: "#FBF7EE", textColor: "#1A110B" },
      { name: "Leche Emulsionada 65°C", pct: 45, color: "#E8DAC6", textColor: "#1A110B" },
      { name: "Doble Ristretto Intenso", pct: 35, color: "#3A1C12", textColor: "#FAF6F0" },
    ],
  },
  {
    id: "cappuccino",
    name: "Cappuccino Italiano",
    subtitle: "La Regla de los Tres Tercios Perfectos",
    volume: "180 ml",
    temp: "65°C",
    intensity: 3,
    price: 18.00,
    notes: "1/3 espresso, 1/3 leche vaporizada y 1/3 nube de espuma aireada espolvoreada con cacao belga puro.",
    layers: [
      { name: "Nube de Espuma de Leche Aireada", pct: 34, color: "#FFFDF9", textColor: "#1A110B" },
      { name: "Leche Entera Vaporizada", pct: 33, color: "#EADBC8", textColor: "#1A110B" },
      { name: "Espresso Doble Caranavi", pct: 33, color: "#2C140D", textColor: "#FAF6F0" },
    ],
  },
  {
    id: "latte",
    name: "Café Latte Clásico",
    subtitle: "Predominancia de Leche Sedosa y Toque de Café",
    volume: "240 ml",
    temp: "65°C",
    intensity: 2,
    price: 19.00,
    notes: "Bebida suave y reconfortante. La leche vaporizada realza los azúcares naturales del grano boliviano.",
    layers: [
      { name: "Fina Capa de Microfoam (15%)", pct: 15, color: "#FFFDF9", textColor: "#1A110B" },
      { name: "Abundante Leche Caliente (60%)", pct: 60, color: "#F2E6D6", textColor: "#1A110B" },
      { name: "Espresso Suave de Altura (25%)", pct: 25, color: "#3E1E14", textColor: "#FAF6F0" },
    ],
  },
  {
    id: "mocaccino",
    name: "Mocaccino Artesanal",
    subtitle: "Espresso + Ganache de Chocolate Puro Boliviano",
    volume: "240 ml",
    temp: "65°C",
    intensity: 3,
    price: 22.00,
    notes: "Fusión dulce de café de altura con chocolate artesanal de cacao beniano y leche texturizada.",
    layers: [
      { name: "Espuma con Topping de Cacao", pct: 15, color: "#FFFDF9", textColor: "#1A110B" },
      { name: "Leche Vaporizada Sedosa", pct: 40, color: "#ECDDC9", textColor: "#1A110B" },
      { name: "Espresso Doble Intenso", pct: 20, color: "#2C140D", textColor: "#FAF6F0" },
      { name: "Chocolate Puro Boliviano", pct: 25, color: "#1B0C06", textColor: "#E6AE68" },
    ],
  },
];

export default function CoffeeLab() {
  const [activeTab, setActiveTab] = useState<"anatomia" | "custom">("anatomia");

  // Estado del Modo 1: Anatomía de la Taza
  const [selectedRecipe, setSelectedRecipe] = useState<CoffeeRecipe>(COFFEE_RECIPES[4]); // Cappuccino default

  // Estado del Modo 2: Laboratorio Experimental
  const [selectedGrain, setSelectedGrain] = useState(COFFEE_GRAINS[0]);
  const [selectedEmulsion, setSelectedEmulsion] = useState(EMULSION_TECHNIQUES[0]);
  const [selectedPairing, setSelectedPairing] = useState(PASTRY_PAIRINGS[0]);

  const [agregadoExito, setAgregadoExito] = useState(false);

  const { addItem } = useCartStore();
  const { setCartOpen } = useUIStore();

  const customTotal =
    selectedGrain.price + selectedEmulsion.price + (selectedPairing ? selectedPairing.price : 0);

  // Pedir la receta clásica de la anatomía
  const handlePedirReceta = (recipe: CoffeeRecipe) => {
    soundManager.playCoffeeSteam();
    addItem(
      {
        id: `recipe-${recipe.id}`,
        nombre: recipe.name,
        descripcion: `${recipe.subtitle} • ${recipe.volume} (${recipe.temp})`,
        precio: recipe.price,
        costo: 6,
        disponible: true,
        es_mas_vendido: true,
        stock: 99,
        categoria_id: "c1",
        estacion: "cafeteria",
        chips_personalizacion: [recipe.volume, recipe.temp],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      [recipe.volume, recipe.temp, `Intensidad: ${recipe.intensity}/5`]
    );

    setAgregadoExito(true);
    setTimeout(() => {
      setAgregadoExito(false);
      setCartOpen(true);
    }, 500);
  };

  // Pedir la creación personalizada del lab
  const handlePedirCustom = () => {
    soundManager.playOrderChime();
    addItem(
      {
        id: `custom-lab-${Date.now()}`,
        nombre: `${selectedGrain.name} + ${selectedEmulsion.badge}`,
        descripcion: `${selectedEmulsion.temp} • Acompañado de ${selectedPairing.name} (${selectedGrain.origin})`,
        precio: customTotal,
        costo: 8,
        imagen_url: selectedPairing.image,
        disponible: true,
        es_mas_vendido: true,
        stock: 99,
        categoria_id: "c1",
        estacion: "cafeteria",
        chips_personalizacion: [selectedEmulsion.badge, selectedPairing.name],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      [selectedGrain.name, selectedEmulsion.badge, `Maridaje: ${selectedPairing.name}`],
      `Receta experimental personalizada creada en CoffeeLab 3D`
    );

    setAgregadoExito(true);
    setTimeout(() => {
      setAgregadoExito(false);
      setCartOpen(true);
    }, 500);
  };

  return (
    <div className="w-full relative text-[#FAF6F0] space-y-10">
      
      {/* ── Encabezado de la Sección con Switcher de Modos ── */}
      <div className="text-center space-y-4 max-w-3xl mx-auto w-full flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D49B54]/15 border border-[#D49B54]/30 text-[#E6AE68] text-xs font-semibold">
          <Sparkles size={14} className="text-[#E6AE68] animate-pulse" />
          <span>Laboratorio Sensorial de Barismo • 1,600 msnm</span>
        </div>

        <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
          Espacio Experimental de Café
        </h2>

        <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
          Descubre la anatomía exacta y proporciones en porcentaje de cada café del menú, o combina en vivo los granos de altura, técnicas de emulsión y maridajes de panadería.
        </p>

        {/* ── Switcher Interactivo WAOO: Anatomía vs Personalizador ── */}
        <div className="pt-2 flex items-center p-1.5 rounded-2xl bg-[#241710] border border-[#D49B54]/40 shadow-xl max-w-md w-full">
          <button
            onClick={() => {
              soundManager.playTactileClick();
              setActiveTab("anatomia");
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "anatomia"
                ? "bg-[#D49B54] text-[#120D0A] shadow-lg shadow-[#D49B54]/30"
                : "text-stone-300 hover:text-white"
            }`}
          >
            <Percent size={14} />
            <span>Anatomía & Porcentajes (%)</span>
          </button>

          <button
            onClick={() => {
              soundManager.playTactileClick();
              setActiveTab("custom");
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "custom"
                ? "bg-[#D49B54] text-[#120D0A] shadow-lg shadow-[#D49B54]/30"
                : "text-stone-300 hover:text-white"
            }`}
          >
            <SlidersHorizontal size={14} />
            <span>Creador Personalizado</span>
          </button>
        </div>
      </div>

      {/* ====================================================================
          MODO 1: ANATOMÍA DE LA TAZA CON PORCENTAJES REALES (EL EFECTO WAOO)
      ==================================================================== */}
      {activeTab === "anatomia" && (
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Selector de los 7 Cafés Clásicos del Menú (7 Columnas) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between text-xs border-b border-white/10 pb-3">
              <span className="font-bold uppercase tracking-wider text-[#E6AE68] flex items-center gap-2">
                <Coffee size={15} />
                <span>Elige un Café para ver su Preparación y Capas</span>
              </span>
              <span className="text-stone-400 font-mono text-[11px]">7 Especialidades</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {COFFEE_RECIPES.map((recipe) => {
                const isSel = selectedRecipe.id === recipe.id;
                return (
                  <motion.button
                    key={recipe.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      soundManager.playCoffeeSteam();
                      setSelectedRecipe(recipe);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                      isSel
                        ? "bg-gradient-to-br from-[#2D1B11] to-[#1C110A] border-[#D49B54] shadow-xl shadow-[#D49B54]/20 ring-1 ring-[#D49B54]"
                        : "bg-[#1C130D]/80 border-white/10 hover:border-white/20 hover:bg-[#231710]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="font-serif font-bold text-base text-white">
                        {recipe.name}
                      </h4>
                      <span className="font-sans font-extrabold text-xs text-[#E6AE68] shrink-0">
                        Bs {recipe.price.toFixed(2)}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-300 line-clamp-1 mb-2.5">
                      {recipe.subtitle}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-stone-400 pt-2 border-t border-white/10 font-mono">
                      <span>{recipe.volume} • {recipe.temp}</span>
                      <div className="flex items-center gap-1 text-[#E6AE68]">
                        <span>Intensidad:</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <span
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${
                                i <= recipe.intensity ? "bg-[#D49B54]" : "bg-white/20"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Ficha Explicativa del Café Seleccionado */}
            <div className="p-5 rounded-2xl bg-[#1C130D] border border-white/10 space-y-3">
              <h4 className="font-serif font-bold text-lg text-white flex items-center justify-between">
                <span>Secretos del Barista: {selectedRecipe.name}</span>
                <span className="text-xs font-mono text-[#E6AE68]">
                  Extracción La Marzocco
                </span>
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                {selectedRecipe.notes}
              </p>

              {/* Barra de Distribución Porcentual Horizontal */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#E6AE68] block">
                  Composición en Taza (100%):
                </span>
                <div className="h-3 w-full rounded-full overflow-hidden flex bg-black/40 border border-white/10">
                  {selectedRecipe.layers.map((l, idx) => (
                    <div
                      key={idx}
                      style={{ width: `${l.pct}%`, backgroundColor: l.color }}
                      title={`${l.name}: ${l.pct}%`}
                      className="h-full border-r border-black/20 transition-all duration-500"
                    />
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 pt-1 text-[11px]">
                  {selectedRecipe.layers.map((l, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-stone-300">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/20"
                        style={{ backgroundColor: l.color }}
                      />
                      <span>
                        <strong className="text-white">{l.pct}%</strong> {l.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta Visual 3D de la Taza en Corte Transversal (5 Columnas Sticky) */}
          <div className="lg:col-span-5 sticky top-8 flex justify-center">
            <div className="w-full max-w-md rounded-3xl bg-gradient-to-b from-[#241710] to-[#140D08] border-2 border-[#D49B54]/50 p-6 sm:p-7 shadow-2xl space-y-6 relative overflow-hidden">
              
              {/* Badge Superior */}
              <div className="flex items-center justify-between text-xs border-b border-white/10 pb-3">
                <span className="text-[#E6AE68] font-mono font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={13} />
                  <span>Anatomía Visual de la Taza</span>
                </span>
                <span className="text-stone-300 font-mono text-xs font-bold">
                  {selectedRecipe.volume}
                </span>
              </div>

              {/* ── LA TAZA CON CAPAS DINÁMICAS Y VAPOR ASMR ── */}
              <div className="relative h-64 flex flex-col items-center justify-end py-2">
                
                {/* Vapor de café flotante animado */}
                <div className="absolute top-1 w-24 h-16 flex justify-center gap-2.5 opacity-80 pointer-events-none">
                  <motion.div
                    animate={{ y: [-4, -20, -4], opacity: [0.2, 0.9, 0.2] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1.5 h-10 rounded-full bg-gradient-to-t from-white/40 to-transparent blur-[1px]"
                  />
                  <motion.div
                    animate={{ y: [-2, -26, -2], opacity: [0.3, 1, 0.2] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                    className="w-2 h-14 rounded-full bg-gradient-to-t from-[#E6AE68]/50 to-transparent blur-[1.5px]"
                  />
                  <motion.div
                    animate={{ y: [-5, -18, -5], opacity: [0.2, 0.8, 0.1] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
                    className="w-1.5 h-8 rounded-full bg-gradient-to-t from-white/40 to-transparent blur-[1px]"
                  />
                </div>

                {/* Contenedor Taza + Asa */}
                <div className="relative flex items-center">
                  
                  {/* Cuerpo de la Taza en Corte Transversal */}
                  <div className="w-48 h-40 rounded-b-[44px] rounded-t-xl bg-[#1A110B] border-2 border-[#D49B54]/70 p-1.5 shadow-2xl relative overflow-hidden flex flex-col justify-end">
                    
                    {/* Render dinámico de las capas según el café seleccionado */}
                    {selectedRecipe.layers.map((layer, index) => (
                      <motion.div
                        key={`${selectedRecipe.id}-${index}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: `${layer.pct}%`, opacity: 1 }}
                        transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                        style={{ backgroundColor: layer.color }}
                        className="w-full flex items-center justify-between px-3 text-[9px] font-bold tracking-tight border-b border-black/20 shadow-inner relative group"
                      >
                        <span
                          style={{ color: layer.textColor }}
                          className="truncate max-w-[120px]"
                        >
                          {layer.name}
                        </span>
                        <span
                          style={{ color: layer.textColor }}
                          className="font-mono text-[10px] shrink-0 font-extrabold"
                        >
                          {layer.pct}%
                        </span>
                      </motion.div>
                    ))}

                  </div>

                  {/* Asa de la Taza */}
                  <div className="w-7 h-24 rounded-r-2xl border-4 border-l-0 border-[#D49B54]/60 -ml-1 pointer-events-none" />
                </div>

                <div className="pt-3 text-[10px] font-mono text-stone-400">
                  Temperatura óptima de servicio: <span className="text-[#E6AE68] font-bold">{selectedRecipe.temp}</span>
                </div>
              </div>

              {/* Ficha Resumen y Botón de Pedido */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <div className="flex items-baseline justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-2xl text-white">
                      {selectedRecipe.name}
                    </h3>
                    <p className="text-xs text-stone-300">{selectedRecipe.subtitle}</p>
                  </div>
                  <span className="font-serif font-extrabold text-2xl text-[#E6AE68]">
                    Bs {selectedRecipe.price.toFixed(2)}
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handlePedirReceta(selectedRecipe)}
                  disabled={agregadoExito}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D49B54] via-[#E6AE68] to-[#D49B54] hover:from-[#E6AE68] hover:to-[#D49B54] text-[#120D0A] font-black text-xs tracking-wider uppercase shadow-xl shadow-[#D49B54]/25 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {agregadoExito ? (
                    <>
                      <Check size={18} />
                      <span>¡Añadido a tu Canasta!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={16} />
                      <span>Pedir {selectedRecipe.name} • Bs {selectedRecipe.price.toFixed(2)}</span>
                    </>
                  )}
                </motion.button>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ====================================================================
          MODO 2: CREADOR EXPERIMENTAL DE AUTOR (GRANOS, EMULSIÓN, MARIDAJE)
      ==================================================================== */}
      {activeTab === "custom" && (
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Controles de Selección Interactiva (7 Columnas) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* 1. Selección de Granos */}
            <div className="bg-[#1C130D]/90 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-[#E6AE68] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#D49B54] text-[#120D0A] flex items-center justify-center text-xs font-black">
                    1
                  </span>
                  Elige el Grano & Tueste
                </span>
                <span className="text-xs font-mono text-stone-300 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  {selectedGrain.altitude}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {COFFEE_GRAINS.map((grain) => {
                  const isSel = selectedGrain.id === grain.id;
                  return (
                    <motion.button
                      key={grain.id}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        soundManager.playCoffeeSteam();
                        setSelectedGrain(grain);
                      }}
                      className={`text-left p-4 rounded-2xl border transition-all relative ${
                        isSel
                          ? "bg-gradient-to-b from-[#332217] to-[#261911] border-[#D49B54] shadow-lg shadow-[#D49B54]/20 ring-1 ring-[#D49B54]"
                          : "bg-[#18110C]/80 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <h4 className="font-bold text-sm text-white">{grain.name}</h4>
                        {isSel && <Check size={14} className="text-[#E6AE68]" />}
                      </div>
                      <p className="text-[11px] text-stone-400 mb-2">{grain.origin}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {grain.notes.slice(0, 2).map((note) => (
                          <span
                            key={note}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 text-[#E6AE68] border border-[#D49B54]/20"
                          >
                            {note}
                          </span>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                        <span className="text-stone-400 text-[10px]">Base Espresso</span>
                        <span className="font-bold text-white">Bs {grain.price}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* 2. Técnica de Emulsión & Temperatura */}
            <div className="bg-[#1C130D]/90 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-[#E6AE68] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#D49B54] text-[#120D0A] flex items-center justify-center text-xs font-black">
                    2
                  </span>
                  Técnica de Emulsión & Temperatura
                </span>
                <span className="text-xs text-[#E6AE68] bg-[#D49B54]/15 border border-[#D49B54]/30 px-3 py-1 rounded-full font-bold">
                  {selectedEmulsion.temp}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {EMULSION_TECHNIQUES.map((tech) => {
                  const isSel = selectedEmulsion.id === tech.id;
                  return (
                    <motion.button
                      key={tech.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        soundManager.playPorcelainTink();
                        setSelectedEmulsion(tech);
                      }}
                      className={`text-left p-4 rounded-2xl border transition-all ${
                        isSel
                          ? "bg-gradient-to-b from-[#332217] to-[#261911] border-[#D49B54] shadow-lg shadow-[#D49B54]/20 ring-1 ring-[#D49B54]"
                          : "bg-[#18110C]/80 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-white">{tech.name}</span>
                        <span className="text-xs font-bold text-[#E6AE68]">
                          {tech.price === 0 ? "Incluido" : `+Bs ${tech.price}`}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-300 leading-snug">{tech.desc}</p>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* 3. Complemento de Panadería o Repostería */}
            <div className="bg-[#1C130D]/90 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-[#E6AE68] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#D49B54] text-[#120D0A] flex items-center justify-center text-xs font-black">
                    3
                  </span>
                  Complemento de Panadería o Repostería
                </span>
                <span className="text-xs font-bold text-[#E6AE68]">
                  +Bs {selectedPairing.price}.00
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PASTRY_PAIRINGS.map((pastry) => {
                  const isSel = selectedPairing.id === pastry.id;
                  return (
                    <motion.button
                      key={pastry.id}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        soundManager.playPastryCrinkle();
                        setSelectedPairing(pastry);
                      }}
                      className={`group text-left rounded-2xl overflow-hidden border transition-all flex flex-col ${
                        isSel
                          ? "bg-[#332217] border-[#D49B54] ring-2 ring-[#D49B54]/40 shadow-lg"
                          : "bg-[#18110C] border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="relative h-24 w-full overflow-hidden bg-stone-900">
                        <img
                          src={pastry.image}
                          alt={pastry.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/80 text-[#E6AE68] text-[10px] font-bold border border-[#D49B54]/40">
                          Bs {pastry.price}
                        </span>
                      </div>
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <h5 className="font-bold text-xs text-white leading-snug mb-0.5">
                          {pastry.name}
                        </h5>
                        <span className="text-[10px] text-stone-400 line-clamp-1">
                          {pastry.tag}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Tarjeta en Vivo: Receta Creada (5 Columnas Sticky) */}
          <div className="lg:col-span-5 sticky top-8 flex justify-center">
            <div className="w-full max-w-md rounded-3xl bg-gradient-to-b from-[#251A12] to-[#160F0A] border-2 border-[#D49B54]/50 p-6 sm:p-7 shadow-2xl relative overflow-hidden space-y-6">
              
              {/* Cabecera de la Receta */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-[#E6AE68]" />
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#E6AE68]">
                    Receta Única Creada
                  </span>
                </div>
                <span className="text-xs font-mono text-stone-300 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                  {selectedGrain.altitude}
                </span>
              </div>

              {/* Taza Dinámica en Corte Transversal */}
              <div className="relative h-60 rounded-2xl bg-[#110B08] border border-white/10 flex flex-col items-center justify-center p-6">
                
                {/* Vapor si es caliente */}
                {!selectedEmulsion.isCold && (
                  <div className="flex items-center gap-3 mb-2 opacity-80 pointer-events-none">
                    <motion.div
                      animate={{ y: [-4, -20, -4], opacity: [0.2, 0.9, 0.2] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      className="w-1.5 h-10 rounded-full bg-gradient-to-t from-white/40 to-transparent blur-[1px]"
                    />
                    <motion.div
                      animate={{ y: [-2, -26, -2], opacity: [0.3, 1, 0.2] }}
                      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                      className="w-2 h-14 rounded-full bg-gradient-to-t from-[#E6AE68]/50 to-transparent blur-[1.5px]"
                    />
                    <motion.div
                      animate={{ y: [-5, -18, -5], opacity: [0.2, 0.8, 0.1] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
                      className="w-1.5 h-8 rounded-full bg-gradient-to-t from-white/40 to-transparent blur-[1px]"
                    />
                  </div>
                )}

                {/* Taza */}
                <div className="relative flex items-center">
                  <div className="w-44 h-36 rounded-b-[42px] rounded-t-lg border-2 border-[#D49B54]/60 bg-[#1B120D] overflow-hidden flex flex-col justify-end shadow-inner relative">
                    
                    {/* Capa de Emulsión */}
                    {selectedEmulsion.layerHeight > 0 && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${selectedEmulsion.layerHeight}%` }}
                        transition={{ duration: 0.5 }}
                        style={{ backgroundColor: selectedEmulsion.layerColor }}
                        className="w-full flex items-center justify-center text-[10px] font-extrabold uppercase tracking-wider text-[#2B1B10] transition-all duration-500 border-b border-[#C88A4B]/40"
                      >
                        {selectedEmulsion.badge}
                      </motion.div>
                    )}

                    {/* Crema Dorada */}
                    <div
                      style={{ backgroundColor: selectedGrain.cremaColor }}
                      className="w-full h-2.5 transition-all duration-500"
                    />

                    {/* Cuerpo del Espresso Doble */}
                    <div
                      style={{ backgroundColor: selectedGrain.color }}
                      className="w-full h-16 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-[#FAF6F0] transition-all duration-500"
                    >
                      Espresso Double
                    </div>
                  </div>

                  {/* Asa de la taza */}
                  <div className="w-6 h-20 rounded-r-2xl border-y-2 border-r-2 border-[#D49B54]/60 -ml-0.5" />
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-stone-300">
                  <span>Temp: {selectedEmulsion.temp}</span>
                  <span>•</span>
                  <span className="text-[#E6AE68] font-semibold">{selectedGrain.roast}</span>
                </div>
              </div>

              {/* Resumen */}
              <div className="space-y-3">
                <div className="flex items-baseline justify-between gap-4">
                  <h4 className="font-serif text-2xl font-bold text-white">
                    {selectedGrain.name} + {selectedEmulsion.badge}
                  </h4>
                  <span className="text-2xl font-extrabold text-[#E6AE68] shrink-0 font-serif">
                    Bs {customTotal.toFixed(2)}
                  </span>
                </div>

                <p className="text-sm text-stone-300">
                  Acompañado de{" "}
                  <strong className="text-white underline decoration-[#D49B54]">
                    {selectedPairing.name}
                  </strong>
                  .
                </p>

                <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-[#E6AE68]">
                  <span className="uppercase tracking-wider text-[10px] text-stone-400 block mb-0.5">
                    Perfil Sensorial en Taza:
                  </span>
                  {selectedGrain.notes.join(" • ")}
                </div>
              </div>

              {/* Botón Pedir Creación */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={handlePedirCustom}
                disabled={agregadoExito}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D49B54] via-[#E6AE68] to-[#D49B54] hover:from-[#E6AE68] hover:to-[#D49B54] text-[#120D0A] font-black text-xs uppercase tracking-wider shadow-xl shadow-[#D49B54]/25 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {agregadoExito ? (
                  <>
                    <Check size={18} />
                    <span>¡Añadido a tu Canasta!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    <span>Pedir esta Creación • Bs {customTotal.toFixed(2)}</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

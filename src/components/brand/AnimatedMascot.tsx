"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import { soundManager } from "@/lib/sound";
import { DenckerLogo } from "./DenckerLogo";
import {
  CroissantVector,
  TazaSolVector,
  SandwichVector,
  PizzaVector,
  DonDenckerVector,
} from "./vectors";

export type MascotType =
  | "croissant"
  | "taza-sol"
  | "coffee"
  | "sandwich"
  | "pizza"
  | "don-dencker"
  | "personaje"
  | "logo";

export const MASCOT_JOKES: Record<string, string[]> = {
  croissant: [
    "¡Tengo 72 capas de puro hojaldre y mantequilla!",
    "¡Cuidado que salgo volando con la brisa de la tarde!",
    "¡Soy más crujiente que chisme en la plaza 14 de Septiembre!",
    "¡Salgo calientito a las 16:30, no te quedes sin mí!",
    "¡Una mordida y se te reinicia la vida!",
    "¡La mantequilla francesa y yo somos uno solo!",
  ],
  "taza-sol": [
    "¡Granos de Caranavi a 1,700 metros... más alto que tus metas!",
    "¡Un espresso doble y despiertas hasta a la abuela!",
    "¡Sonríe, que el café de especialidad ya está servido!",
    "¡El sol de Cochabamba huele a café recién tostado!",
    "¡Sin buen café no hay paraíso, caserito!",
    "¡Catuaí lavado con notas a chocolate y avellana!",
  ],
  coffee: [
    "¡Granos de Caranavi a 1,700 metros... más alto que tus metas!",
    "¡Un espresso doble y despiertas hasta a la abuela!",
    "¡Sonríe, que el café de especialidad ya está servido!",
    "¡El sol de Cochabamba huele a café recién tostado!",
  ],
  sandwich: [
    "¡Con pancito ciabatta de 24h soy todo un galán!",
    "¡Un lomito bien armado alegra cualquier día nublado!",
    "¡Pulgar arriba porque la palta está en su punto perfecto!",
    "¡El secreto es el queso fundido con amor cochabambino!",
    "¡Pide tu pan a elección, aquí mandas tú!",
  ],
  pizza: [
    "¡Masa de 48h rodando por toda la Salamanca!",
    "¡Uso gafas oscuras porque este queso gratinado brilla mucho!",
    "¡4, 6 u 8 porciones... igual te la terminas toda!",
    "¡Horno de piedra con fuego vivo, nada de microondas!",
    "¡El tomate fresco es mi patineta favorita!",
  ],
  "don-dencker": [
    "¡Desde 1993 alimentando a las familias qhochalas con amor!",
    "¡La masa madre no tiene apuro, el buen pan toma su tiempo!",
    "¡El café se toma caliente y la vida con una medialuna!",
    "¡Pasa a la mesa, hoy horneamos doble tanda fresca!",
    "¡En Dencker Pan no hay clientes, hay amigos de la casa!",
  ],
  personaje: [
    "¡Desde 1993 alimentando a las familias qhochalas con amor!",
    "¡La masa madre no tiene apuro, el buen pan toma su tiempo!",
    "¡El café se toma caliente y la vida con una medialuna!",
  ],
  logo: [
    "¡Dencker Pan: Masa madre viva y tradición familiar!",
    "¡El auténtico sabor europeo en el corazón de Cochabamba!",
  ],
};

export type AnimationType =
  | "bounce"
  | "float"
  | "sway"
  | "wave"
  | "pulse"
  | "idle"
  | "none";

interface AnimatedMascotProps {
  mascot: MascotType;
  animation?: AnimationType;
  className?: string;
  speechBubble?: string;
  speechBubblePosition?: "top" | "bottom" | "left" | "right";
  interactive?: boolean;
  size?: number | string;
  onClick?: () => void;
  priority?: boolean;
  color?: string;
}

const mascotPaths: Record<string, { src: string; alt: string; defaultAnim: AnimationType }> = {
  croissant: {
    src: "/img/brand/vectors/mascot-croissant.svg",
    alt: "Croissant Saltarín - Dencker Pan",
    defaultAnim: "bounce",
  },
  "taza-sol": {
    src: "/img/brand/vectors/mascot-taza-sol.svg",
    alt: "Don Café Sonriente & Sol - Dencker Pan",
    defaultAnim: "float",
  },
  coffee: {
    src: "/img/brand/vectors/mascot-taza-sol.svg",
    alt: "Don Café Sonriente & Sol - Dencker Pan",
    defaultAnim: "float",
  },
  sandwich: {
    src: "/img/brand/vectors/mascot-sandwich.svg",
    alt: "Sándwich Feliz Pulgar Arriba - Dencker Pan",
    defaultAnim: "pulse",
  },
  pizza: {
    src: "/img/brand/vectors/mascot-pizza.svg",
    alt: "Pizza Skater con Gafas - Dencker Pan",
    defaultAnim: "sway",
  },
  "don-dencker": {
    src: "/img/brand/vectors/mascot-don-dencker.svg",
    alt: "Don Dencker Fundador con Taza de Café - Dencker Pan",
    defaultAnim: "idle",
  },
  personaje: {
    src: "/img/brand/vectors/mascot-don-dencker.svg",
    alt: "Don Dencker Fundador con Taza de Café - Dencker Pan",
    defaultAnim: "idle",
  },
};

const animationVariants: Record<string, Variants> = {
  bounce: {
    animate: {
      y: [0, -10, 0],
      rotate: [-3, 3, -3],
      transition: {
        duration: 2.8,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    hover: {
      scale: 1.1,
      rotate: 8,
      y: -14,
      transition: { type: "spring", stiffness: 350, damping: 15 },
    },
  },
  float: {
    animate: {
      y: [-6, 4, -6],
      rotate: [-1.5, 1.5, -1.5],
      scale: [1, 1.02, 1],
      transition: {
        duration: 3.6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    hover: {
      scale: 1.08,
      rotate: 4,
      y: -8,
      transition: { type: "spring", stiffness: 300, damping: 18 },
    },
  },
  sway: {
    animate: {
      rotate: [-5, 5, -5],
      x: [-3, 3, -3],
      y: [-3, 0, -3],
      transition: {
        duration: 3.2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    hover: {
      scale: 1.1,
      rotate: -8,
      transition: { type: "spring", stiffness: 320, damping: 16 },
    },
  },
  pulse: {
    animate: {
      scale: [1, 1.035, 1],
      y: [-4, 0, -4],
      rotate: [-2, 2, -2],
      transition: {
        duration: 2.6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    hover: {
      scale: 1.09,
      rotate: 5,
      transition: { type: "spring", stiffness: 340, damping: 15 },
    },
  },
  wave: {
    animate: {
      rotate: [0, 8, -6, 8, -4, 0],
      transition: {
        duration: 2.4,
        repeat: Infinity,
        repeatDelay: 2,
        ease: "easeInOut",
      },
    },
    hover: {
      scale: 1.1,
      rotate: 12,
      transition: { type: "spring", stiffness: 400, damping: 14 },
    },
  },
  idle: {
    animate: {
      y: [-3, 1, -3],
      scale: [1, 1.015, 1],
      transition: {
        duration: 4.2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    hover: {
      scale: 1.05,
      y: -6,
      transition: { type: "spring", stiffness: 280, damping: 20 },
    },
  },
  none: {
    animate: {},
    hover: { scale: 1.03 },
  },
};

export const AnimatedMascot: React.FC<AnimatedMascotProps> = ({
  mascot,
  animation,
  className = "w-32 h-32",
  speechBubble,
  speechBubblePosition = "top",
  interactive = true,
  onClick,
  color,
}) => {
  const isLogo = mascot === "logo";
  const mascotInfo = !isLogo ? mascotPaths[mascot] || mascotPaths.croissant : null;
  const activeAnim = animation || (mascotInfo ? mascotInfo.defaultAnim : "float");
  const selectedVariant = animationVariants[activeAnim] || animationVariants.float;

  const jokes = MASCOT_JOKES[mascot] || MASCOT_JOKES.croissant;
  const [jokeIndex, setJokeIndex] = useState<number>(-1);

  // El texto activo es el chiste interactivo si se ha clickeado, o el speechBubble original si fue suministrado
  const activeBubble = jokeIndex >= 0 ? jokes[jokeIndex % jokes.length] : speechBubble;

  const handleClick = () => {
    if (interactive) {
      if (mascot === "croissant") soundManager.playPastryCrinkle();
      else if (mascot === "taza-sol" || mascot === "coffee") soundManager.playCoffeeSteam();
      else if (mascot === "sandwich") soundManager.playBreadCrunch();
      else if (mascot === "pizza") soundManager.playPorcelainTink();
      else soundManager.playClick();

      // Avanzar al siguiente chiste divertido de panadería
      setJokeIndex((prev) => prev + 1);
    }
    if (onClick) onClick();
  };

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Globo de Diálogo de Cómic Opcional o Interactivo */}
      {activeBubble && (
        <motion.div
          key={activeBubble}
          initial={{ opacity: 0, y: 8, scale: 0.88 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`absolute z-30 pointer-events-none whitespace-nowrap shadow-xl px-3.5 py-1.5 rounded-2xl bg-[#FFFDF7] text-[#1E130C] border-2 border-[#D97706] text-xs font-black flex items-center gap-1.5 max-w-[280px] sm:max-w-xs text-wrap text-center leading-snug ${
            speechBubblePosition === "top"
              ? "-top-12 left-1/2 -translate-x-1/2 rotate-1"
              : speechBubblePosition === "bottom"
              ? "-bottom-12 left-1/2 -translate-x-1/2 -rotate-1"
              : speechBubblePosition === "left"
              ? "right-full mr-3 top-1/2 -translate-y-1/2 -rotate-2"
              : "left-full ml-3 top-1/2 -translate-y-1/2 rotate-2"
          }`}
        >
          <span>{activeBubble}</span>
          <div
            className={`absolute w-2.5 h-2.5 bg-[#FFFDF7] border-b-2 border-r-2 border-[#D97706] transform ${
              speechBubblePosition === "top"
                ? "top-full left-1/2 -translate-x-1/2 -translate-y-1.5 rotate-45"
                : speechBubblePosition === "bottom"
                ? "bottom-full left-1/2 -translate-x-1/2 translate-y-1.5 rotate-[225deg]"
                : speechBubblePosition === "left"
                ? "left-full top-1/2 -translate-y-1/2 -translate-x-1.5 -rotate-45"
                : "right-full top-1/2 -translate-y-1/2 translate-x-1.5 rotate-[135deg]"
            }`}
          />
        </motion.div>
      )}

      {/* Contenedor Animado de la Mascota */}
      <motion.div
        variants={selectedVariant}
        animate="animate"
        whileHover={interactive ? "hover" : undefined}
        whileTap={interactive ? { scale: 0.93 } : undefined}
        onClick={handleClick}
        className={`w-full h-full flex items-center justify-center ${
          interactive ? "cursor-pointer" : ""
        }`}
      >
        {isLogo && (
          <DenckerLogo
            className="w-full h-full drop-shadow-md"
            color={color || "#9C2B1D"}
            animated={activeAnim !== "none"}
            interactive={false}
          />
        )}
        {mascot === "croissant" && (
          <CroissantVector
            className="w-full h-full filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)] dark:drop-shadow-[0_8px_16px_rgba(255,255,255,0.15)] transition-colors duration-300"
            color={color}
          />
        )}
        {(mascot === "taza-sol" || mascot === "coffee") && (
          <TazaSolVector
            className="w-full h-full filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)] dark:drop-shadow-[0_8px_16px_rgba(255,255,255,0.15)] transition-colors duration-300"
            color={color}
          />
        )}
        {mascot === "sandwich" && (
          <SandwichVector
            className="w-full h-full filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)] dark:drop-shadow-[0_8px_16px_rgba(255,255,255,0.15)] transition-colors duration-300"
            color={color}
          />
        )}
        {mascot === "pizza" && (
          <PizzaVector
            className="w-full h-full filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)] dark:drop-shadow-[0_8px_16px_rgba(255,255,255,0.15)] transition-colors duration-300"
            color={color}
          />
        )}
        {(mascot === "don-dencker" || mascot === "personaje") && (
          <DonDenckerVector
            className="w-full h-full filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)] dark:drop-shadow-[0_8px_16px_rgba(255,255,255,0.15)] transition-colors duration-300"
            color={color}
          />
        )}
      </motion.div>
    </div>
  );
};

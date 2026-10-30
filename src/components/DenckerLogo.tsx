"use client";
import React from "react";

export type DenckerLogoVariant =
  | "chef-hat"
  | "chef-hat-light"
  | "logo-1-chef-hat"
  | "vintage-badge"
  | "logo-2-vintage-ticket"
  | "badge-clean"
  | "logo-3-badge"
  | "mascot"
  | "mascot-light"
  | "mascot-gold"
  | "logo-light"
  | "logo-gold"
  | "mascot-coffee"
  | "mascot-croissant"
  | "mascot-bread"
  | "mascot-pizza"
  | "cafe-4llamas"
  | "cafe-catuai";

interface DenckerLogoProps {
  className?: string;
  variant?: DenckerLogoVariant;
  monochrome?: boolean;
  alt?: string;
}

/**
 * Componente oficial de identidad visual Dencker Pan.
 * Renderiza todos los logos y mascotas auténticos del cliente:
 * - Logo 1: Chef Hat Logo (con bigote y tipografía retro DENCKER)
 * - Logo 2: Boleto Vintage Dencker Coffee (ticket vintage terracota)
 * - Logo 3: Don Dencker Badge circular (sello con taza humeante)
 * - Mascota Taza de Café sonriente
 * - Mascota Croissant con lentes oscuros
 * - Mascota Pan Tostada alegre
 * - Mascota Pizza skater
 * - Café 4 Llamas Caranavi
 */
export default function DenckerLogo({
  className = "w-12 h-12",
  variant = "logo-3-badge",
  monochrome = false,
  alt = "Dencker Pan Logo",
}: DenckerLogoProps) {
  const getAssetSrc = () => {
    switch (variant) {
      case "logo-3-badge":
      case "badge-clean":
        return "/img/brand/logo-3-don-dencker-badge.png";
      case "logo-2-vintage-ticket":
      case "vintage-badge":
        return "/img/brand/logo-2-dencker-coffee-vintage.png";
      case "logo-1-chef-hat":
      case "chef-hat":
        return "/img/brand/logo-1-chef-hat.svg";
      case "chef-hat-light":
        return "/img/brand/logo-1-chef-hat-light.svg";
      case "logo-light":
      case "mascot-light":
        return "/img/brand/don-dencker-mascot-light.png";
      case "logo-gold":
      case "mascot-gold":
        return "/img/brand/don-dencker-mascot-gold.png";
      case "mascot":
        return "/img/brand/don-dencker-mascot-clean.png";
      case "mascot-coffee":
        return "/img/brand/mascot-coffee.png";
      case "mascot-croissant":
        return "/img/brand/mascot-croissant.png";
      case "mascot-bread":
        return "/img/brand/mascot-bread.png";
      case "mascot-pizza":
        return "/img/brand/mascot-pizza.png";
      case "cafe-4llamas":
        return "/img/brand/cafe-4llamas-pack.png";
      case "cafe-catuai":
        return "/img/brand/cafe-catuai-badge.png";
      default:
        return "/img/brand/logo-3-don-dencker-badge.png";
    }
  };

  const src = getAssetSrc();

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-contain select-none transition-transform ${
          monochrome ? "grayscale contrast-200" : ""
        }`}
      />
    </div>
  );
}


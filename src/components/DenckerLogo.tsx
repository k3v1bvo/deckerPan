"use client";
import React from "react";
import Image from "next/image";

interface DenckerLogoProps {
  className?: string;
  variant?: "chef-hat" | "mascot" | "vintage-badge";
  size?: number | string;
  fill?: string;
  monochrome?: boolean;
}

/**
 * Componente oficial de identidad visual Dencker Pan.
 * Renderiza los logos oficiales auténticos en formato vectorial nítido o PNG de alta fidelidad.
 */
export default function DenckerLogo({
  className = "w-12 h-12",
  variant = "chef-hat",
  size,
  monochrome = false,
}: DenckerLogoProps) {
  if (variant === "mascot") {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
        <img
          src="/img/brand/don-dencker.png"
          alt="Don Dencker Mascota"
          className="w-full h-full object-contain select-none"
        />
      </div>
    );
  }

  if (variant === "vintage-badge") {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
        <img
          src="/img/brand/don-dencker-coffee-vintage.png"
          alt="Dencker Coffee"
          className="w-full h-full object-contain rounded-xl select-none"
        />
      </div>
    );
  }

  // Por defecto: Logo Sombrero de Chef + Letras DENCKER + Bigote Artesanal (Vector SVG de Alta Resolución)
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/img/brand/dencker-chef-hat-logo.svg"
        alt="Dencker Pan Logo"
        className={`w-full h-full object-contain select-none ${
          monochrome ? "grayscale contrast-200" : ""
        }`}
      />
    </div>
  );
}

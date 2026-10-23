"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Sparkles } from "lucide-react";
import { soundManager } from "@/lib/sound";

export default function SoundToggle() {
  const [isMuted, setIsMuted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    setIsMuted(soundManager.isMuted);
    const unsub = soundManager.subscribe((muted) => setIsMuted(muted));
    return unsub;
  }, []);

  const handleToggle = () => {
    const newState = soundManager.toggleMute();
    setIsMuted(newState);
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2400);
  };

  return (
    <div className="fixed top-20 right-4 z-40 sm:top-24 sm:right-6">
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95, y: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        onClick={handleToggle}
        aria-label={isMuted ? "Activar sonido artesanal" : "Silenciar sonido artesanal"}
        className={`relative px-3.5 py-2.5 rounded-full backdrop-blur-2xl border shadow-xl flex items-center gap-2.5 transition-colors duration-200 select-none ${
          isMuted
            ? "bg-[#18100A]/90 border-stone-800 text-stone-400 hover:text-stone-200 shadow-black/40"
            : "bg-[#18100A]/95 border-[#527953]/50 text-[#CDE0C9] shadow-[0_8px_24px_rgba(30,19,12,0.45)] hover:border-[#6B9E6C]"
        }`}
      >
        <div className="relative flex items-center justify-center">
          {isMuted ? (
            <VolumeX size={16} className="text-stone-400" />
          ) : (
            <>
              <Volume2 size={16} className="text-[#87A987]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#87A987] animate-pulse absolute -top-1 -right-1" />
            </>
          )}
        </div>

        <span className="text-[11px] font-semibold tracking-wide hidden sm:inline">
          {isMuted ? "Silencio" : "Audio ASMR"}
        </span>
      </motion.button>

      {/* Floating tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute right-0 top-14 whitespace-nowrap px-3 py-1.5 rounded-xl bg-stone-950/95 border border-amber-500/30 text-amber-200 text-[10px] font-semibold shadow-2xl backdrop-blur-md flex items-center gap-1.5"
          >
            <Sparkles size={11} className="text-amber-400" />
            <span>{isMuted ? "Sonido desactivado" : "Efectos ASMR activados (Crujido & Porcelana)"}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

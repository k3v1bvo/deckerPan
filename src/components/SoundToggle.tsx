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
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        onClick={handleToggle}
        aria-label={isMuted ? "Activar sonido ASMR" : "Silenciar sonido ASMR"}
        className={`relative p-3 rounded-2xl backdrop-blur-xl border shadow-xl flex items-center gap-2 transition-all duration-300 ${
          isMuted
            ? "bg-[#1C120B]/90 border-stone-700/60 text-stone-400 hover:text-white"
            : "bg-[#281810]/95 border-amber-500/40 text-amber-300 shadow-amber-950/40 hover:border-amber-400"
        }`}
      >
        <div className="relative">
          {isMuted ? (
            <VolumeX size={18} className="text-stone-400" />
          ) : (
            <div className="flex items-center gap-1">
              <Volume2 size={18} className="text-amber-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping absolute -top-0.5 -right-0.5" />
            </div>
          )}
        </div>

        <span className="text-[11px] font-bold font-mono tracking-wide hidden sm:inline">
          {isMuted ? "Audio Off" : "ASMR On"}
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

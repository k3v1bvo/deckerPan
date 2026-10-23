"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  ChefHat,
  ShoppingBag,
  Receipt,
  Sparkles,
  X,
  ExternalLink,
} from "lucide-react";
import { useUIStore, ToastNotification } from "@/store";
import Link from "next/link";

const TOAST_ICONS = {
  alerta: {
    icon: Bell,
    badgeBg: "bg-red-500/20 text-red-300 border border-red-500/40",
    badgePulse: "animate-pulse",
  },
  comanda: {
    icon: ShoppingBag,
    badgeBg: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
    badgePulse: "",
  },
  cocina: {
    icon: ChefHat,
    badgeBg: "bg-blue-500/20 text-blue-300 border border-blue-500/40",
    badgePulse: "",
  },
  pago: {
    icon: Receipt,
    badgeBg: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40",
    badgePulse: "",
  },
  info: {
    icon: Sparkles,
    badgeBg: "bg-purple-500/20 text-purple-300 border border-purple-500/40",
    badgePulse: "",
  },
};

export default function NotificationToast() {
  const toasts = useUIStore((state) => state.toasts);
  const removeToast = useUIStore((state) => state.removeToast);

  return (
    <aside aria-label="Notificaciones del sistema" className="fixed top-4 right-4 z-[9999] pointer-events-none flex flex-col gap-2.5 max-w-sm w-full px-3">
      <AnimatePresence>
        {toasts.map((toast) => {
          const cfg = TOAST_ICONS[toast.tipo] || TOAST_ICONS.info;
          const Icon = cfg.icon;

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.92 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="pointer-events-auto rounded-2xl bg-[#1C120B]/95 backdrop-blur-xl border border-amber-500/30 text-white shadow-2xl p-3.5 flex items-start gap-3 relative group"
            >
              {/* Badge Ícono */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.badgeBg} ${cfg.badgePulse}`}
              >
                <Icon size={18} />
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="font-serif font-bold text-xs text-amber-100 truncate">
                    {toast.titulo}
                  </h5>
                  <span className="text-[9px] font-mono text-stone-400 shrink-0">
                    Ahora
                  </span>
                </div>
                <p className="text-[11px] text-stone-300 mt-0.5 leading-snug">
                  {toast.mensaje}
                </p>

                {toast.mesa_numero && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <Link
                      href="/mesero"
                      onClick={() => removeToast(toast.id)}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 hover:text-amber-200 hover:underline"
                    >
                      <span>Ir a Mesa {toast.mesa_numero}</span>
                      <ExternalLink size={10} />
                    </Link>
                  </div>
                )}
              </div>

              {/* Botón Cerrar */}
              <button
                onClick={() => removeToast(toast.id)}
                className="w-5 h-5 rounded-full text-stone-400 hover:text-white flex items-center justify-center transition shrink-0"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </aside>
  );
}

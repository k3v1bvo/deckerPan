"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  UtensilsCrossed,
  ChefHat,
  Receipt,
  Settings,
  QrCode,
  Bell,
  Home,
  Database,
  Sparkles,
} from "lucide-react";
import { useSystemStore } from "@/store";
import { SUPABASE_CONFIGURED } from "@/lib/supabase";
import { soundManager } from "@/lib/sound";

export default function RoleNav() {
  const pathname = usePathname();
  const alertas = useSystemStore((state) => state.alertas);
  const alertasPendientes = alertas.filter((a) => !a.atendida);

  const navItems = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/mesa/1", label: "Mesa QR", icon: QrCode },
    { href: "/mesero", label: "Mesero", icon: UtensilsCrossed, badge: alertasPendientes.length },
    { href: "/kds", label: "Cocina KDS", icon: ChefHat },
    { href: "/caja", label: "Caja POS", icon: Receipt },
    { href: "/admin", label: "Admin", icon: Settings },
  ];

  return (
    <div className="sticky top-2 z-50 w-full px-3 pointer-events-none flex justify-center">
      <motion.header
        initial={{ y: -40, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 24, stiffness: 280 }}
        className="pointer-events-auto max-w-5xl w-full mx-auto rounded-full bg-[#180E08]/85 backdrop-blur-2xl border border-amber-500/20 shadow-[0_12px_40px_rgba(0,0,0,0.45)] px-3 py-1.5 flex items-center justify-between gap-2 text-amber-50 transition-all"
      >
        {/* Brand Pill */}
        <Link
          href="/"
          onClick={() => soundManager.playSuccessTone()}
          className="flex items-center gap-2 px-2.5 py-1 rounded-full hover:bg-white/5 transition-all group shrink-0"
        >
          <motion.span
            whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.15 }}
            transition={{ duration: 0.4 }}
            className="text-xl"
          >
            🥐
          </motion.span>
          <div className="leading-tight flex items-center gap-1.5">
            <span className="font-serif font-bold text-sm tracking-wide text-amber-100">
              Dencker Pan
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[9px] uppercase font-sans font-semibold tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              <Sparkles size={9} /> Pro
            </span>
          </div>
        </Link>

        {/* Sliding Apple-style Navigation Tabs */}
        <nav className="flex items-center gap-0.5 overflow-x-auto py-0.5 scrollbar-none relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => soundManager.playSuccessTone()}
                className="relative px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 group select-none"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeRoleIndicator"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 shadow-[0_2px_12px_rgba(217,119,6,0.5)] border border-amber-400/40"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}

                <span className={`relative z-10 flex items-center gap-1.5 ${
                  isActive ? "text-white font-bold" : "text-amber-200/70 group-hover:text-amber-100"
                }`}>
                  <Icon size={13} className={isActive ? "text-amber-100" : "text-amber-300/70"} />
                  <span>{item.label}</span>

                  {item.badge !== undefined && item.badge > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.25, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="ml-0.5 bg-red-500 text-white text-[9px] font-black rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center shadow-md shadow-red-950"
                    >
                      {item.badge}
                    </motion.span>
                  )}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Live Cloud Status */}
        <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-amber-200/80 bg-white/5 px-2.5 py-1 rounded-full border border-white/10 shrink-0">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                SUPABASE_CONFIGURED ? "bg-emerald-400" : "bg-amber-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                SUPABASE_CONFIGURED ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
          </span>
          <span className="font-mono text-[10px]">
            {SUPABASE_CONFIGURED ? "Supabase Live" : "Local State"}
          </span>
        </div>
      </motion.header>
    </div>
  );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  ChefHat,
  Receipt,
  Settings,
  QrCode,
  Bell,
  Home,
  Database,
} from "lucide-react";
import { useSystemStore } from "@/store";
import { SUPABASE_CONFIGURED } from "@/lib/supabase";

export default function RoleNav() {
  const pathname = usePathname();
  const alertas = useSystemStore((state) => state.alertas);
  const alertasPendientes = alertas.filter((a) => !a.atendida);

  const navItems = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/mesa/1", label: "Mesa QR", icon: QrCode },
    { href: "/mesero", label: "Mesero", icon: UtensilsCrossed, badge: alertasPendientes.length },
    { href: "/kds", label: "KDS Cocina", icon: ChefHat },
    { href: "/caja", label: "Caja POS", icon: Receipt },
    { href: "/admin", label: "Admin", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-amber-900/10 bg-amber-950/95 backdrop-blur-md text-amber-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="text-2xl transition-transform group-hover:scale-110">🥐</span>
          <div className="leading-tight">
            <span className="font-serif font-bold text-base tracking-wide text-amber-100 flex items-center gap-1.5">
              Dencker Pan
              <span className="text-[10px] uppercase font-sans font-semibold tracking-wider px-1.5 py-0.5 rounded bg-amber-800/80 text-amber-200 border border-amber-700/50">
                POS & SaaS
              </span>
            </span>
          </div>
        </Link>

        {/* Navigation pills */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
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
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-amber-600 text-white shadow-sm shadow-amber-950/50 font-semibold"
                    : "text-amber-200/80 hover:text-white hover:bg-amber-900/50"
                }`}
              >
                <Icon size={14} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Database indicator */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-amber-300/70 bg-amber-900/40 px-2.5 py-1 rounded-full border border-amber-800/40">
          <Database size={12} className={SUPABASE_CONFIGURED ? "text-emerald-400" : "text-amber-400"} />
          <span>{SUPABASE_CONFIGURED ? "Supabase Online" : "Modo Local Reactivo"}</span>
        </div>
      </div>
    </header>
  );
}

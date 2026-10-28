"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPosRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/caja");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#1E130C] text-amber-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center animate-spin mb-4">
        ⚡
      </div>
      <h2 className="text-xl font-bold font-serif mb-2">Redirigiendo a Caja & Punto de Venta POS...</h2>
      <p className="text-xs text-amber-200/70">Dencker Pan Cochabamba</p>
    </div>
  );
}

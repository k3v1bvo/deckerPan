import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import RoleNav from "@/components/RoleNav";
import SupabaseSync from "@/components/SupabaseSync";
import CartDrawer from "@/components/CartDrawer";
import NotificationToast from "@/components/NotificationToast";
import SoundToggle from "@/components/SoundToggle";

export const metadata: Metadata = {
  title: {
    default: "Dencker Pan — Cafetería & Panadería",
    template: "%s | Dencker Pan",
  },
  description: "Sistema integral de gestión para Dencker Pan: menú digital, pedidos en mesa, cocina en tiempo real y administración completa.",
  keywords: ["panadería", "cafetería", "Dencker Pan", "menú digital", "pedidos QR", "Cochabamba"],
  openGraph: {
    title: "Dencker Pan — Cafetería & Panadería",
    description: "El mejor café artesanal y panes recién horneados de Cochabamba",
    locale: "es_BO",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-BO">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#1E130C" />
      </head>
      <body>
        <SupabaseSync />
        <Suspense fallback={<div className="h-14 bg-amber-950" />}>
          <RoleNav />
        </Suspense>
        <main className="w-full flex flex-col items-center flex-1">{children}</main>
        <CartDrawer />
        <NotificationToast />
        <SoundToggle />
      </body>
    </html>
  );
}

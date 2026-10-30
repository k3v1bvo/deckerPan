import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import RoleNav from "@/components/RoleNav";
import CartDrawer from "@/components/CartDrawer";
import NotificationToast from "@/components/NotificationToast";
import SoundToggle from "@/components/SoundToggle";
import SupabaseSync from "@/components/SupabaseSync";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1E130C",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Dencker Pan | Masa Madre & Café de Especialidad",
  description:
    "Panadería artesanal con masa madre viva de 24 horas y café de altura 4 Llamas (1,700 msnm) en Cochabamba, Bolivia. Hojaldres finos 100% mantequilla noble y servicio editorial.",
  keywords: [
    "Dencker Pan",
    "Café de especialidad Cochabamba",
    "Panadería artesanal masa madre",
    "Café 4 Llamas Caranavi",
    "Croissants mantequilla Cochabamba",
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Dencker Pan",
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
      </head>
      <body className="antialiased selection:bg-amber-900 selection:text-white">
        <SupabaseSync />
        <Suspense fallback={<div className="h-16 bg-[#160D08]" />}>
          <RoleNav />
        </Suspense>
        <main className="w-full flex flex-col items-center flex-1">{children}</main>
        <Suspense fallback={null}>
          <CartDrawer />
        </Suspense>
        <NotificationToast />
        <Suspense fallback={null}>
          <SoundToggle />
        </Suspense>
      </body>
    </html>
  );
}

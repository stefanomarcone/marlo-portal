import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marlo Propiedades | Corretaje & Gestión Inmobiliaria en Chile",
  description: "Marlo Propiedades: expertos en corretaje y gestión inmobiliaria en Santiago, Chile. Venta y arriendo de casas, departamentos, oficinas y parcelas.",
  keywords: "corretaje inmobiliario, propiedades en venta, arriendo Santiago, inmobiliaria Chile, casas en venta, departamentos arriendo",
  openGraph: {
    title: "Marlo Propiedades | Corretaje & Gestión Inmobiliaria",
    description: "Encontrar dónde vivir, despacio. Curamos propiedades en barrios consolidados de Santiago.",
    url: "https://www.marlopropiedades.cl",
    siteName: "Marlo Propiedades",
    locale: "es_CL",
    type: "website",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://www.marlopropiedades.cl" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="geo.region" content="CL-RM" />
        <meta name="geo.placename" content="Santiago" />
      </head>
      <body>{children}</body>
    </html>
  );
}

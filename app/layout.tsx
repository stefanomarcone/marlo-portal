import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MARLO Propiedades | Corretaje & Gestión Inmobiliaria en Chile",
  description: "MARLO Propiedades: expertos en corretaje y gestión inmobiliaria en Santiago, Chile. Venta y arriendo de casas, departamentos, oficinas y parcelas. Servicio profesional y personalizado.",
  keywords: "corretaje inmobiliario, propiedades en venta, arriendo Santiago, inmobiliaria Chile, casas en venta, departamentos arriendo, gestión inmobiliaria, MARLO Propiedades",
  openGraph: {
    title: "MARLO Propiedades | Corretaje & Gestión Inmobiliaria",
    description: "Encontramos el hogar perfecto para usted. Más de una década conectando familias con su propiedad ideal en Chile.",
    url: "https://www.marlopropiedades.cl",
    siteName: "MARLO Propiedades",
    locale: "es_CL",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "https://www.marlopropiedades.cl",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="geo.region" content="CL-RM" />
        <meta name="geo.placename" content="Santiago" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

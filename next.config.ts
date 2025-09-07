// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // 👇 Evita que ESLint rompa el build en Vercel
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 👇 Si hubiera errores de TS, tampoco detienen el build
    ignoreBuildErrors: true,
  },
  images: {
    // Para que Next/Image permita imágenes de Cloudinary
    domains: ['res.cloudinary.com'],
  },
};

export default nextConfig;

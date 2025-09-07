"use client";
import dynamic from "next/dynamic";
const PortalInmobiliario = dynamic(() => import("../src/components/PortalInmobiliario"), { ssr: false });
export default function Page() { return <PortalInmobiliario />; }

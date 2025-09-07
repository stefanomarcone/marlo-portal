"use client";

import React, { useMemo, useState, useEffect } from "react";
import Papa from "papaparse";
import {
  Building2,
  BedDouble,
  Bath,
  MapPin,
  Home,
  Ruler,
  Phone,
  Mail,
  Heart,
  Filter,
  Search,
  Check,
  MessageSquare,
  ImageIcon,
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ————————————————————————————————————————
// CONFIG
// ————————————————————————————————————————
const SITE_NAME = "MARLO Propiedades";
const CLP = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });

// Contacto oficial
const PHONE_1_DISPLAY = "+56 9 7108 7515";
const PHONE_2_DISPLAY = "+56 9 7108 7513";
const PHONE_1_RAW = "56971087515"; // tel:/wa.me
const PHONE_2_RAW = "56971087513";
const EMAIL = "arriendo@marlopropiedades.cl";

// CSV público (usa env si está definida)
const SHEET_CSV =
  process.env.NEXT_PUBLIC_SHEET_CSV ||
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQtd7uOhNIGnCPVvyYPZZNsyiJombpwAm-ZzlYF7HXlpoXQ0jNUNhjCFGtWYADOdHiGY0MAT-cqMykq/pub?output=csv";

const capitalize = (s: string) => (s?.charAt(0).toUpperCase() || "") + (s?.slice(1) || "");

// ————————————————————————————————————————
// DATOS LOCAL (fallback si la hoja está vacía)
// ————————————————————————————————————————
const MOCK = [
  {
    id: "p-001",
    titulo: "Depto 2D/1B con bodega y estacionamiento",
    operacion: "arriendo",
    tipo: "departamento",
    comuna: "Providencia",
    ciudad: "Santiago",
    direccion: "Av. Los Leones 1234",
    precio: 750000,
    gastosComunes: 90000,
    dormitorios: 2,
    banos: 1,
    metrosUtiles: 58,
    metrosTotales: 65,
    estacionamientos: 1,
    bodega: 1,
    destacado: true,
    imagenes: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1616596872209-61c9f2be89fb?q=80&w=1600&auto=format&fit=crop",
    ],
    descripcion:
      "Luminoso, orientación oriente, a 3 cuadras del metro Los Leones. Cocina equipada, logia independiente y terraza.",
    etiquetas: ["Cerca del metro", "Con bodega", "Amoblado opcional"],
    contacto: { nombre: "MARLO", telefono: "9 7108 7515", email: EMAIL },
  },
  {
    id: "p-002",
    titulo: "Casa 3D/3B con patio y quincho",
    operacion: "venta",
    tipo: "casa",
    comuna: "Viña del Mar",
    ciudad: "Valparaíso",
    direccion: "Calle Las Magnolias 987",
    precio: 189000000,
    gastosComunes: 0,
    dormitorios: 3,
    banos: 3,
    metrosUtiles: 120,
    metrosTotales: 240,
    estacionamientos: 2,
    bodega: 0,
    destacado: false,
    imagenes: [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=1600&auto=format&fit=crop",
    ],
    descripcion:
      "Barrio residencial tranquilo. Ampliación regularizada, cocina americana y suite principal con walking closet.",
    etiquetas: ["Patio amplio", "Quincho", "Listo para mudarse"],
    contacto: { nombre: "MARLO", telefono: "9 7108 7515", email: EMAIL },
  },
  {
    id: "p-003",
    titulo: "Oficina 45 m² planta libre, vista despejada",
    operacion: "arriendo",
    tipo: "oficina",
    comuna: "Las Condes",
    ciudad: "Santiago",
    direccion: "Apoquindo 4500",
    precio: 620000,
    gastosComunes: 110000,
    dormitorios: 0,
    banos: 1,
    metrosUtiles: 45,
    metrosTotales: 50,
    estacionamientos: 1,
    bodega: 0,
    destacado: false,
    imagenes: [
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1600&auto=format&fit=crop",
    ],
    descripcion:
      "Edificio clase A, con conserjería 24/7. Incluye 1 estacionamiento y bodega opcional.",
    etiquetas: ["Clase A", "Alta conectividad"],
    contacto: { nombre: "MARLO", telefono: "9 7108 7515", email: EMAIL },
  },
];

// ————————————————————————————————————————
// MAPEADOR DE FILAS DEL CSV
// ————————————————————————————————————————
function mapRow(r: any, i: number) {
  return {
    id: r.id || `sheet-${i}`,
    titulo: r.titulo || "",
    operacion: String(r.operacion || "venta").toLowerCase() as "venta" | "arriendo",
    tipo: String(r.tipo || "departamento").toLowerCase(),
    comuna: r.comuna || "",
    ciudad: r.ciudad || "",
    direccion: r.direccion || "",
    precio: Number(r.precio || 0),
    gastosComunes: Number(r.gastosComunes || 0),
    dormitorios: Number(r.dormitorios || 0),
    banos: Number(r.banos || 0),
    metrosUtiles: Number(r.metros || r.metrosUtiles || 0),
    metrosTotales: Number(r.metrosTotales || r.metros || 0),
    estacionamientos: Number(r.estacionamientos || 0),
    bodega: Number(r.bodega || 0),
    destacado: String(r.destacado || "").toLowerCase() === "si",
    imagenes: String(r.fotos || r.imagenes || "")
      .split(";")
      .map((s: string) => s.trim())
      .filter(Boolean),
    descripcion: r.descripcion || "",
    etiquetas: String(r.etiquetas || "")
      .split(";")
      .map((s: string) => s.trim())
      .filter(Boolean),
    contacto: {
      nombre: r.contactoNombre || "MARLO",
      telefono: r.contactoTelefono || "9 7108 7515",
      email: r.contactoEmail || EMAIL,
    },
  };
}

// ————————————————————————————————————————
// COMPONENTE PRINCIPAL
// ————————————————————————————————————————
export default function PortalInmobiliario() {
  // 1) Carga remota desde Google Sheets (CSV)
  const [remoto, setRemoto] = useState<any[]>([]);
  useEffect(() => {
    fetch(SHEET_CSV)
      .then((r) => r.text())
      .then((csv) => {
        const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
        const filas = (parsed.data as any[]).map(mapRow);
        setRemoto(filas);
      })
      .catch(() => {});
  }, []);

  // 2) Carga local desde /admin (localStorage)
  const [extras, setExtras] = useState<any[]>([]);
  useEffect(() => {
    try {
      setExtras(JSON.parse(localStorage.getItem("marlo-props") || "[]"));
    } catch {}
  }, []);

  // 3) Mezclar todo y evitar duplicados por id (extras > remoto > mock)
  const LISTA = useMemo(() => {
    const map = new Map<string, any>();
    for (const it of [...extras, ...remoto, ...MOCK]) {
      if (!it) continue;
      const id = String(it.id || "");
      if (!map.has(id)) map.set(id || Math.random().toString(36).slice(2), it);
    }
    return Array.from(map.values());
  }, [extras, remoto]);

  const [query, setQuery] = useState("");
  const [operacion, setOperacion] = useState("todas"); // todas | venta | arriendo
  const [tipo, setTipo] = useState("todos"); // todos | casa | departamento | oficina | parcela | local
  const [minDorms, setMinDorms] = useState(0);
  const [rangoPrecio, setRangoPrecio] = useState<[number, number]>([0, 200000000]);
  const [orden, setOrden] = useState("recientes");
  const [soloDestacados, setSoloDestacados] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const preciosMax = useMemo(() => {
    const max = Math.max(...LISTA.map((p) => p.precio || 0));
    return Math.ceil((isFinite(max) ? max : 0) / 1_000_000) * 1_000_000 || 1_000_000;
  }, [LISTA]);

  const resultados = useMemo(() => {
    let list = [...LISTA];

    if (operacion !== "todas") list = list.filter((p) => p.operacion === operacion);
    if (tipo !== "todos") list = list.filter((p) => p.tipo === tipo);
    if (minDorms > 0) list = list.filter((p) => (p.dormitorios || 0) >= minDorms);

    list = list.filter(
      (p) =>
        p.titulo?.toLowerCase().includes(query.toLowerCase()) ||
        p.comuna?.toLowerCase().includes(query.toLowerCase()) ||
        p.ciudad?.toLowerCase().includes(query.toLowerCase()) ||
        p.direccion?.toLowerCase().includes(query.toLowerCase())
    );

    list = list.filter((p) => (p.precio || 0) >= rangoPrecio[0] && (p.precio || 0) <= rangoPrecio[1]);
    if (soloDestacados) list = list.filter((p) => p.destacado);

    switch (orden) {
      case "precio-asc":
        list.sort((a, b) => (a.precio || 0) - (b.precio || 0));
        break;
      case "precio-desc":
        list.sort((a, b) => (b.precio || 0) - (a.precio || 0));
        break;
      default:
        list.sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0));
    }

    return list;
  }, [operacion, tipo, minDorms, query, rangoPrecio, orden, soloDestacados, LISTA]);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-2">
            <Home className="h-6 w-6" />
            <span className="text-lg font-semibold">{SITE_NAME}</span>
            <Badge variant="secondary" className="ml-2">MVP</Badge>
          </div>

          <div className="flex w-full max-w-xl items-center gap-2">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busca por comuna, ciudad, dirección o título..."
                className="pl-8"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2"><Filter className="h-4 w-4" /> Filtros</Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-96">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Operación</label>
                      <Select value={operacion} onValueChange={setOperacion}>
                        <SelectTrigger><SelectValue placeholder="Operación" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todas">Todas</SelectItem>
                          <SelectItem value="venta">Venta</SelectItem>
                          <SelectItem value="arriendo">Arriendo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Tipo</label>
                      <Select value={tipo} onValueChange={setTipo}>
                        <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          <SelectItem value="casa">Casa</SelectItem>
                          <SelectItem value="departamento">Departamento</SelectItem>
                          <SelectItem value="oficina">Oficina</SelectItem>
                          <SelectItem value="parcela">Parcela</SelectItem>
                          <SelectItem value="local">Local</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Mín. Dormitorios</label>
                      <Select value={String(minDorms)} onValueChange={(v) => setMinDorms(Number(v))}>
                        <SelectTrigger><SelectValue placeholder="Dorms" /></SelectTrigger>
                        <SelectContent>
                          {[0, 1, 2, 3, 4, 5].map((n) => (
                            <SelectItem key={n} value={String(n)}>{n === 0 ? "Cualquiera" : n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Orden</label>
                      <Select value={orden} onValueChange={setOrden}>
                        <SelectTrigger><SelectValue placeholder="Orden" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recientes">Destacados primero</SelectItem>
                          <SelectItem value="precio-asc">Precio: menor a mayor</SelectItem>
                          <SelectItem value="precio-desc">Precio: mayor a menor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Rango de precio</label>
                    <div className="px-2">
                      <Slider
                        value={rangoPrecio}
                        onValueChange={setRangoPrecio}
                        min={0}
                        max={preciosMax}
                        step={50000}
                      />
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Desde {CLP.format(rangoPrecio[0])}</span>
                        <span>Hasta {CLP.format(rangoPrecio[1])}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox id="destacados" checked={soloDestacados} onCheckedChange={(v) => setSoloDestacados(!!v)} />
                    <label htmlFor="destacados" className="text-sm">Mostrar solo destacados</label>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" asChild>
              <a href="#contacto"><Phone className="mr-2 h-4 w-4" /> Contacto</a>
            </Button>
            <Button variant="default" asChild>
              <a href="#publicar">Publicar propiedad</a>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="border-b bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-4 md:grid-cols-3 md:gap-8 md:p-8">
          <div className="col-span-2 space-y-3">
            <h1 className="text-2xl font-bold md:text-3xl">Encuentra tu próximo hogar o publica el tuyo</h1>
            <p className="text-muted-foreground">
              Filtra por operación, tipo de propiedad, dormitorios y precio. Se cargan propiedades desde Google Sheets y desde tu panel /admin.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Casa", "Departamento", "Oficina", "Parcela", "Local"].map((chip) => (
                <Badge key={chip} variant="outline" className="cursor-pointer" onClick={() => setTipo(chip.toLowerCase())}>{chip}</Badge>
              ))}
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setTipo("todos")}>
                Todos
              </Badge>
            </div>
          </div>
          <div className="rounded-2xl border p-4">
            <div className="flex items-start gap-3">
              <ImageIcon className="mt-1 h-5 w-5" />
              <div className="space-y-1 text-sm">
                <p className="font-medium">¿Sin fotos profesionales?</p>
                <p className="text-muted-foreground">Sube imágenes nítidas en horizontal (1600px+). Mantén buena luz y orden. Elige una fachada/ambiente como portada.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LISTADO */}
      <main className="mx-auto max-w-7xl p-4 md:p-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {resultados.length} resultado{resultados.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <Select value={orden} onValueChange={setOrden}>
              <SelectTrigger className="w-[220px]"><SelectValue placeholder="Ordenar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="recientes">Destacados primero</SelectItem>
                <SelectItem value="precio-asc">Precio: menor a mayor</SelectItem>
                <SelectItem value="precio-desc">Precio: mayor a menor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resultados.map((p) => (
            <Card key={p.id} className="overflow-hidden rounded-2xl">
              <div className="relative h-48 w-full bg-neutral-100">
                {p.imagenes?.[0] ? (
                  <img src={p.imagenes[0]} alt={p.titulo} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-neutral-400">
                    <ImageIcon />
                  </div>
                )}
                <div className="absolute left-3 top-3 flex gap-2">
                  <Badge>{capitalize(p.operacion)}</Badge>
                  {p.destacado && <Badge variant="destructive">Destacado</Badge>}
                </div>
              </div>
              <CardHeader className="space-y-2">
                <CardTitle className="line-clamp-1">{p.titulo}</CardTitle>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {p.comuna}
                  {p.ciudad ? `, ${p.ciudad}` : ""}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1"><BedDouble className="h-4 w-4" /> {p.dormitorios}D</div>
                  <div className="flex items-center gap-1"><Bath className="h-4 w-4" /> {p.banos}B</div>
                  <div className="flex items-center gap-1"><Ruler className="h-4 w-4" /> {p.metrosUtiles} m² útiles</div>
                  {p.estacionamientos ? (
                    <div className="flex items-center gap-1"><Building2 className="h-4 w-4" /> {p.estacionamientos} Estac.</div>
                  ) : null}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-semibold">{CLP.format(p.precio || 0)}</span>
                  {p.operacion === "arriendo" && p.gastosComunes ? (
                    <span className="text-xs text-muted-foreground">+ GGCC {CLP.format(p.gastosComunes)}</span>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {p.etiquetas?.slice(0, 3).map((tag: string) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <Button variant="secondary" onClick={() => { setSelected(p); setOpen(true); }}>Ver detalles</Button>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <a
                      href={`https://wa.me/56${String(p.contacto?.telefono || "")
                        .replace(/\D/g, "")
                        .slice(-8)}?text=${encodeURIComponent(`Hola, vi la propiedad ${p.titulo} (${p.comuna}). ¿Sigue disponible?`)}`}
                      target="_blank" rel="noreferrer"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" /> WhatsApp
                    </a>
                  </Button>
                  <Button variant="ghost"><Heart className="h-5 w-5" /></Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      {/* MODAL DETALLE */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          {selected && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
              <div className="md:col-span-3">
                <div className="aspect-video w-full overflow-hidden rounded-xl bg-neutral-100">
                  {selected.imagenes?.[0] ? (
                    <img src={selected.imagenes[0]} alt={selected.titulo} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-neutral-400">
                      <ImageIcon />
                    </div>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {selected.imagenes?.slice(1, 5).map((src: string, i: number) => (
                    <img key={i} src={src} alt="thumb" className="h-20 w-full rounded-lg object-cover" />
                  ))}
                </div>
              </div>
              <div className="space-y-3 md:col-span-2">
                <DialogHeader>
                  <DialogTitle className="text-xl">{selected.titulo}</DialogTitle>
                </DialogHeader>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {selected.direccion}
                  {selected.comuna ? `, ${selected.comuna}` : ""}
                  {selected.ciudad ? `, ${selected.ciudad}` : ""}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{CLP.format(selected.precio || 0)}</span>
                  {selected.operacion === "arriendo" && selected.gastosComunes ? (
                    <span className="text-xs text-muted-foreground">+ GGCC {CLP.format(selected.gastosComunes)}</span>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1"><BedDouble className="h-4 w-4" /> {selected.dormitorios} dormitorios</div>
                  <div className="flex items-center gap-1"><Bath className="h-4 w-4" /> {selected.banos} baños</div>
                  <div className="flex items-center gap-1"><Ruler className="h-4 w-4" /> {selected.metrosUtiles} m² útiles</div>
                  <div className="flex items-center gap-1"><Ruler className="h-4 w-4" /> {selected.metrosTotales} m² totales</div>
                  {selected.estacionamientos ? (
                    <div className="flex items-center gap-1"><Building2 className="h-4 w-4" /> {selected.estacionamientos} estacionamientos</div>
                  ) : null}
                  {selected.bodega ? (
                    <div className="flex items-center gap-1"><Building2 className="h-4 w-4" /> {selected.bodega} bodega(s)</div>
                  ) : null}
                </div>

                <p className="text-sm text-muted-foreground">{selected.descripcion}</p>

                <div className="flex flex-wrap gap-2">
                  {selected.etiquetas?.map((tag: string) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>

                <div className="rounded-xl border p-3">
                  <p className="text-sm font-medium">Contacto</p>
                  <div className="mt-2 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                    <a className="flex items-center gap-2" href={`tel:${selected.contacto?.telefono || ""}`}>
                      <Phone className="h-4 w-4" /> {selected.contacto?.nombre || "Contacto"}
                    </a>
                    <a className="flex items-center gap-2" href={`mailto:${selected.contacto?.email || ""}`}>
                      <Mail className="h-4 w-4" /> {selected.contacto?.email || "—"}
                    </a>
                  </div>
                  <div className="mt-2">
                    <Button asChild className="w-full">
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href={`https://wa.me/56${String(selected.contacto?.telefono || "")
                          .replace(/\D/g, "")
                          .slice(-8)}?text=${encodeURIComponent(
                            `Hola, vi la propiedad ${selected.titulo} (${selected.comuna}). ¿Sigue disponible?`
                          )}`}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" /> Escribir por WhatsApp
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CTA PUBLICAR */}
      <section id="publicar" className="border-t bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-6 p-4 md:grid-cols-2 md:p-8">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">¿Quieres publicar una propiedad?</h2>
            <p className="text-muted-foreground">Puedes usar el panel <a className="underline" href="/admin">/admin</a> o el Google Form conectado al Sheet.</p>
            <ul className="text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Revisión y curaduría de fotos</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Redacción profesional del aviso</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Difusión en redes y portales</li>
            </ul>
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="grid gap-3 rounded-2xl border p-4">
            <div className="grid gap-1">
              <label className="text-sm">Tu nombre</label>
              <Input placeholder="Nombre y apellido" />
            </div>
            <div className="grid gap-1">
              <label className="text-sm">Correo</label>
              <Input type="email" placeholder="tu@email.cl" />
            </div>
            <div className="grid gap-1">
              <label className="text-sm">Teléfono</label>
              <Input placeholder="+56 9 ..." />
            </div>
            <div className="grid gap-1">
              <label className="text-sm">Tipo de propiedad</label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="casa">Casa</SelectItem>
                  <SelectItem value="departamento">Departamento</SelectItem>
                  <SelectItem value="oficina">Oficina</SelectItem>
                  <SelectItem value="parcela">Parcela</SelectItem>
                  <SelectItem value="local">Local</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <label className="text-sm">Mensaje</label>
              <Input placeholder="Dirección, m², dormitorios, precio..." />
            </div>
            <Button type="submit">Enviar</Button>
          </form>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="mt-16 rounded-2xl border bg-white/60 p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-3">Contáctanos</h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <span className="inline-block h-9 w-9 rounded-full bg-black/5 grid place-items-center">📞</span>
            <a href={`tel:+${PHONE_1_RAW}`} className="hover:underline">
              {PHONE_1_DISPLAY}
            </a>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-block h-9 w-9 rounded-full bg-black/5 grid place-items-center">📞</span>
            <a href={`tel:+${PHONE_2_RAW}`} className="hover:underline">
              {PHONE_2_DISPLAY}
            </a>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-block h-9 w-9 rounded-full bg-black/5 grid place-items-center">✉️</span>
            <a href={`mailto:${EMAIL}`} className="hover:underline">
              {EMAIL}
            </a>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-block h-9 w-9 rounded-full bg-black/5 grid place-items-center">💬</span>
            <a
              href={`https://wa.me/${PHONE_1_RAW}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-black/5"
            >
              WhatsApp (principal)
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

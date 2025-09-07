"use client";
import { useEffect, useMemo, useState } from "react";

// Variables públicas (ponlas en .env.local y reinicia el server)
const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!;

type Prop = {
  id: string;
  titulo: string;
  operacion: "venta" | "arriendo";
  tipo: string;
  comuna: string;
  ciudad?: string;
  direccion?: string;
  precio: number;
  gastosComunes?: number;
  dormitorios: number;
  banos: number;
  metrosUtiles: number;
  metrosTotales: number;
  estacionamientos?: number;
  bodega?: number;
  destacado?: boolean;
  imagenes: string[];
  descripcion?: string;
  etiquetas?: string[];
  contacto: { nombre: string; telefono: string; email: string };
};

export default function AdminPage() {
  // mini-auth simple (clave: marlo123)
  const [ok, setOk] = useState(false);
  const [clave, setClave] = useState("");
  useEffect(() => setOk(sessionStorage.getItem("marlo-ok") === "1"), []);
  if (!ok) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold">Admin MARLO</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Ingresa la clave temporal <code>marlo123</code>.
          </p>
          <input
            type="password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            className="mt-4 w-full rounded-lg border p-2"
            placeholder="Clave"
          />
          <button
            onClick={() => {
              if (clave === "marlo123") {
                sessionStorage.setItem("marlo-ok", "1");
                setOk(true);
              } else alert("Clave incorrecta");
            }}
            className="mt-3 w-full rounded-lg border bg-black px-4 py-2 text-white"
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  const [files, setFiles] = useState<File[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const [f, setF] = useState({
    titulo: "",
    operacion: "venta",
    tipo: "departamento",
    precio: "",
    dormitorios: "",
    banos: "",
    metros: "",
    comuna: "",
    ciudad: "",
    direccion: "",
    destacado: false,
    descripcion: "",
    telefono: "9 6105 0539",
    email: "contacto@marlo.cl",
  });

  const puedeGuardar = useMemo(
    () =>
      f.titulo.trim().length > 0 &&
      Number(f.precio) >= 0 &&
      Number(f.dormitorios) >= 0 &&
      Number(f.banos) >= 0 &&
      Number(f.metros) >= 0 &&
      f.comuna.trim().length > 0,
    [f]
  );

  async function uploadAll(): Promise<string[]> {
    const urls: string[] = [];
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (json.secure_url) urls.push(json.secure_url as string);
    }
    return urls;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensaje(null);

    if (!CLOUD || !PRESET) {
      alert("Faltan NEXT_PUBLIC_CLOUDINARY_* en .env.local");
      return;
    }
    try {
      setSubiendo(true);
      const imagenes = await uploadAll();
      const metros = Number(f.metros || 0);

      const nuevo: Prop = {
        id: "local-" + Date.now(),
        titulo: f.titulo,
        operacion: (f.operacion as any) || "venta",
        tipo: f.tipo || "departamento",
        comuna: f.comuna,
        ciudad: f.ciudad || "",
        direccion: f.direccion || "",
        precio: Number(f.precio || 0),
        gastosComunes: 0,
        dormitorios: Number(f.dormitorios || 0),
        banos: Number(f.banos || 0),
        metrosUtiles: metros,
        metrosTotales: metros,
        estacionamientos: 0,
        bodega: 0,
        destacado: !!f.destacado,
        imagenes,
        descripcion: f.descripcion || "",
        etiquetas: [],
        contacto: { nombre: "MARLO", telefono: f.telefono, email: f.email },
      };

      const key = "marlo-props";
      const prev = JSON.parse(localStorage.getItem(key) || "[]");
      prev.unshift(nuevo);
      localStorage.setItem(key, JSON.stringify(prev));

      setMensaje("Propiedad guardada ✔. Ya aparece en la Home.");
      setFiles([]);
      setF({
        titulo: "",
        operacion: "venta",
        tipo: "departamento",
        precio: "",
        dormitorios: "",
        banos: "",
        metros: "",
        comuna: "",
        ciudad: "",
        direccion: "",
        destacado: false,
        descripcion: "",
        telefono: "9 6105 0539",
        email: "contacto@marlo.cl",
      });
    } catch (err) {
      console.error(err);
      alert("Hubo un problema subiendo/guardando.");
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <h1 className="text-xl font-bold">Admin MARLO</h1>
          <a href="/" className="text-sm underline">
            Volver a la Home
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Formulario */}
          <form onSubmit={onSubmit} className="lg:col-span-2 rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold">Nueva propiedad</h2>
            <p className="mb-4 text-sm text-neutral-600">Las fotos se suben a Cloudinary automáticamente.</p>

            <div className="grid grid-cols-2 gap-3">
              <input
                className="col-span-2 rounded-lg border p-2"
                placeholder="Título"
                value={f.titulo}
                onChange={(e) => setF({ ...f, titulo: e.target.value })}
                required
              />
              <select
                className="rounded-lg border p-2"
                value={f.operacion}
                onChange={(e) => setF({ ...f, operacion: e.target.value })}
              >
                <option value="venta">Venta</option>
                <option value="arriendo">Arriendo</option>
              </select>
              <select className="rounded-lg border p-2" value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })}>
                <option value="departamento">Departamento</option>
                <option value="casa">Casa</option>
                <option value="oficina">Oficina</option>
                <option value="parcela">Parcela</option>
                <option value="local">Local</option>
              </select>
              <input
                className="rounded-lg border p-2"
                placeholder="Precio (CLP)"
                value={f.precio}
                onChange={(e) => setF({ ...f, precio: e.target.value })}
              />
              <input
                className="rounded-lg border p-2"
                placeholder="Dormitorios"
                value={f.dormitorios}
                onChange={(e) => setF({ ...f, dormitorios: e.target.value })}
              />
              <input
                className="rounded-lg border p-2"
                placeholder="Baños"
                value={f.banos}
                onChange={(e) => setF({ ...f, banos: e.target.value })}
              />
              <input
                className="rounded-lg border p-2"
                placeholder="Metros"
                value={f.metros}
                onChange={(e) => setF({ ...f, metros: e.target.value })}
              />
              <input
                className="rounded-lg border p-2"
                placeholder="Comuna"
                value={f.comuna}
                onChange={(e) => setF({ ...f, comuna: e.target.value })}
              />
              <input
                className="rounded-lg border p-2"
                placeholder="Ciudad"
                value={f.ciudad}
                onChange={(e) => setF({ ...f, ciudad: e.target.value })}
              />
              <input
                className="col-span-2 rounded-lg border p-2"
                placeholder="Dirección"
                value={f.direccion}
                onChange={(e) => setF({ ...f, direccion: e.target.value })}
              />
              <textarea
                className="col-span-2 rounded-lg border p-2"
                rows={3}
                placeholder="Descripción"
                value={f.descripcion}
                onChange={(e) => setF({ ...f, descripcion: e.target.value })}
              />

              <label className="col-span-2 mt-2 block text-sm font-medium">Fotos (puedes seleccionar varias)</label>
              <input
                className="col-span-2"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
              />
              {files.length > 0 && (
                <div className="col-span-2 grid grid-cols-4 gap-2">
                  {files.map((f, i) => (
                    <img key={i} src={URL.createObjectURL(f)} className="h-20 w-full rounded-lg object-cover" />
                  ))}
                </div>
              )}

              <label className="mt-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={f.destacado}
                  onChange={(e) => setF({ ...f, destacado: e.target.checked })}
                />
                Marcar como destacado
              </label>

              <div className="col-span-2 mt-2 grid grid-cols-2 gap-3">
                <input
                  className="rounded-lg border p-2"
                  placeholder="Teléfono contacto"
                  value={f.telefono}
                  onChange={(e) => setF({ ...f, telefono: e.target.value })}
                />
                <input
                  className="rounded-lg border p-2"
                  placeholder="Email contacto"
                  value={f.email}
                  onChange={(e) => setF({ ...f, email: e.target.value })}
                />
              </div>

              <button
                disabled={!puedeGuardar || subiendo}
                className="col-span-2 mt-2 rounded-lg bg.black px-4 py-2 text-white"
                style={{ background: "black" }}
              >
                {subiendo ? "Subiendo..." : "Guardar propiedad"}
              </button>
              {mensaje && <p className="col-span-2 text-sm text-green-600">{mensaje}</p>}
            </div>
          </form>

          {/* Lista local */}
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h3 className="text-base font-semibold">Propiedades locales</h3>
            <PropList />
          </div>
        </div>
      </main>
    </div>
  );
}

function PropList() {
  const [items, setItems] = useState<Prop[]>([]);
  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem("marlo-props") || "[]"));
    } catch {}
  }, []);

  function borrar(id: string) {
    const next = items.filter((x) => x.id !== id);
    setItems(next);
    localStorage.setItem("marlo-props", JSON.stringify(next));
  }

  if (!items.length) return <p className="mt-2 text-sm text-neutral-600">Aún no hay propiedades guardadas aquí.</p>;

  return (
    <ul className="mt-3 space-y-2">
      {items.map((p) => (
        <li key={p.id} className="flex items-center justify-between rounded-lg border p-3">
          <span className="truncate text-sm">
            {p.titulo} — {p.operacion} — ${p.precio.toLocaleString()}
          </span>
          <button onClick={() => borrar(p.id)} className="text-sm text-red-600">
            Eliminar
          </button>
        </li>
      ))}
    </ul>
  );
}

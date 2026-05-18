"use client";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../src/lib/supabase";

interface Property {
  id: number; titulo: string; operacion: string; precio: number; tipo: string;
  dormitorios: number; banos: number; metros: number; metros_terreno: number; comuna: string; ciudad: string;
  direccion: string; gastos_comunes: number; estacionamientos: number; bodega: boolean;
  destacado: boolean; activa: boolean; imagenes: string; descripcion: string; etiquetas: string;
}

const empty: Omit<Property, "id"> = {
  titulo: "", operacion: "venta", precio: 0, tipo: "departamento",
  dormitorios: 0, banos: 0, metros: 0, metros_terreno: 0, activa: true, comuna: "", ciudad: "Santiago",
  direccion: "", gastos_comunes: 0, estacionamientos: 0, bodega: false,
  destacado: false, imagenes: "", descripcion: "", etiquetas: "",
};

const fmtCLP = (n: number) => "$" + n.toLocaleString("es-CL").replace(/,/g, ".");

const TIPOS = ["departamento", "casa", "oficina", "parcela", "terreno", "local"];
const TIPO_LABEL: Record<string, string> = { departamento: "Departamento", casa: "Casa", oficina: "Oficina", parcela: "Parcela", terreno: "Terreno", local: "Local comercial" };

/* ---- Icons ---- */
const Ic = {
  home: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 11l9-8 9 8M5 10v10h14V10" /></svg>,
  list: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>,
  plus: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14" /></svg>,
  eye: () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>,
  edit: () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 20l4-1 11-11-3-3L5 16l-1 4z" /></svg>,
  trash: () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12" /></svg>,
  star: ({ filled }: { filled?: boolean }) => <svg width={14} height={14} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="M12 3l2.9 5.9 6.6 1-4.7 4.7 1.1 6.5L12 18l-5.9 3.1 1.1-6.5L2.5 9.9l6.6-1L12 3z" /></svg>,
  logout: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 4h4a1 1 0 011 1v14a1 1 0 01-1 1h-4M10 17l-5-5 5-5M5 12h12" /></svg>,
  pause: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  play: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  search: () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="6" /><path d="M16 16l4 4" /></svg>,
  arrow: () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M13 6l6 6-6 6" /></svg>,
  x: () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 6l12 12M18 6L6 18" /></svg>,
  upload: () => <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 4v12M7 9l5-5 5 5M4 19h16" /></svg>,
};

/* ---- Login ---- */
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const DEMO_EMAIL = "arriendos@marlopropiedades.cl";
  const DEMO_PASS = "marlo2026";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    // Demo bypass — also tries real Supabase auth if configured
    if (email.trim().toLowerCase() === DEMO_EMAIL && pass === DEMO_PASS) {
      setLoading(false);
      onLogin();
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    setLoading(false);
    if (error) { setErr("Credenciales incorrectas. Verifica tu email y contraseña."); return; }
    onLogin();
  };

  return (
    <div className="login-screen">
      <div className="login-pane">
        <div className="login-card">
          <div className="logo">
            <span className="logo-mark">Marlo<em>.</em></span>
            <span className="logo-sub">Propiedades</span>
          </div>
          <h1 className="login-title">Panel de <em>administración</em></h1>
          <p className="login-desc">Accede para gestionar publicaciones, fotos y propiedades destacadas.</p>
          <form className="login-form" onSubmit={submit}>
            {err && <div className="login-error">{err}</div>}
            <div className="login-field">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tucorreo@marlopropiedades.cl" autoComplete="email" />
            </div>
            <div className="login-field">
              <label>Contraseña</label>
              <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
            </div>
            <button type="submit" className="btn primary" style={{ padding: "14px 20px", justifyContent: "center", marginTop: 8 }} disabled={loading}>
              {loading ? "Verificando…" : <><span>Iniciar sesión</span><Ic.arrow /></>}
            </button>
            <a href="/" style={{ fontSize: 12, color: "var(--ink-3)", borderBottom: "1px solid var(--line)", paddingBottom: 1, alignSelf: "flex-start" }}>← Volver al portal</a>
          </form>
        </div>
      </div>
      <div className="login-side">
        <div className="login-side-img" />
        <div className="login-side-overlay">
          <div className="login-side-meta">Marlo · Admin · v2.0</div>
          <div>
            <div className="login-side-meta" style={{ marginBottom: 18 }}>· Panel privado ·</div>
            <div className="login-side-quote">Publica con calma.<br /><em>Cada propiedad merece tiempo.</em></div>
          </div>
          <div className="login-side-meta">arriendos@marlopropiedades.cl</div>
        </div>
      </div>
    </div>
  );
}

/* ---- Property Form ---- */
function PropertyForm({ initial, onSave, onCancel, saving, msg }: {
  initial: Omit<Property, "id"> & { id?: number };
  onSave: (data: Omit<Property, "id"> & { id?: number }) => void;
  onCancel: () => void;
  saving: boolean;
  msg: string;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const imgs = form.imagenes ? form.imagenes.split(";").filter(Boolean) : [];

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true); setUploadErr("");
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) newUrls.push(data.url);
      else { setUploadErr("Error subiendo " + file.name + ": " + (data.error || "desconocido")); }
    }
    if (newUrls.length > 0) {
      const current = form.imagenes ? form.imagenes.split(";").filter(Boolean) : [];
      set("imagenes", [...current, ...newUrls].join(";"));
    }
    setUploading(false);
  };

  return (
    <div className="admin-form">
      {/* General */}
      <div className="form-section">
        <div className="form-section-title">General</div>
        <div className="form-grid">
          <div className="form-field span-2">
            <label>Título *</label>
            <input value={form.titulo} onChange={(e) => set("titulo", e.target.value)} placeholder="Ej. Departamento moderno en Providencia" />
          </div>
          <div className="form-field">
            <label>Operación</label>
            <select value={form.operacion} onChange={(e) => set("operacion", e.target.value)}>
              <option value="venta">Venta</option>
              <option value="arriendo">Arriendo</option>
            </select>
          </div>
          <div className="form-field">
            <label>Tipo</label>
            <select value={form.tipo} onChange={(e) => set("tipo", e.target.value)}>
              {TIPOS.map((t) => <option key={t} value={t}>{TIPO_LABEL[t]}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label>Precio (CLP) *</label>
            <input type="number" value={form.precio || ""} onChange={(e) => set("precio", Number(e.target.value))} placeholder="85000000" />
          </div>
          <div className="form-field">
            <label>Gastos comunes (CLP)</label>
            <input type="number" value={form.gastos_comunes || ""} onChange={(e) => set("gastos_comunes", Number(e.target.value))} placeholder="0" />
          </div>
          <div className="form-field span-2">
            <label>Descripción</label>
            <textarea value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} placeholder="Describe la propiedad..." />
          </div>
        </div>
      </div>

      {/* Características */}
      <div className="form-section">
        <div className="form-section-title">Características</div>
        <div className="form-grid-4">
          <div className="form-field">
            <label>Dormitorios</label>
            <input type="number" min="0" value={form.dormitorios || ""} onChange={(e) => set("dormitorios", Number(e.target.value))} placeholder="0" />
          </div>
          <div className="form-field">
            <label>Baños</label>
            <input type="number" min="0" value={form.banos || ""} onChange={(e) => set("banos", Number(e.target.value))} placeholder="0" />
          </div>
          <div className="form-field">
            <label>m² construidos *</label>
            <input type="number" min="0" value={form.metros || ""} onChange={(e) => set("metros", Number(e.target.value))} placeholder="60" />
          </div>
          {form.tipo === "casa" && (
            <div className="form-field">
              <label>m² terreno</label>
              <input type="number" min="0" value={form.metros_terreno || ""} onChange={(e) => set("metros_terreno", Number(e.target.value))} placeholder="0" />
            </div>
          )}
          <div className="form-field">
            <label>Estacionamientos</label>
            <input type="number" min="0" value={form.estacionamientos || ""} onChange={(e) => set("estacionamientos", Number(e.target.value))} placeholder="0" />
          </div>
        </div>
        <div className="form-grid">
          <div className="form-field">
            <label>Etiquetas (separadas por ;)</label>
            <input value={form.etiquetas} onChange={(e) => set("etiquetas", e.target.value)} placeholder="Terraza;Vista al parque;Nuevo" />
          </div>
        </div>
        <div className="form-toggle">
          <div>
            <div className="form-toggle-label">Incluye bodega</div>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={!!form.bodega} onChange={(e) => set("bodega", e.target.checked)} />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>

      {/* Fotos */}
      <div className="form-section">
        <div className="form-section-title">Fotos</div>
        <label className="upload-drop" onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}>
          <input type="file" accept="image/*" multiple style={{ display: "none" }}
            onChange={(e) => handleFiles(e.target.files)} />
          <Ic.upload />
          <span>{uploading ? "Subiendo…" : "Arrastra fotos aquí o haz clic para seleccionar"}</span>
          <span style={{ fontSize: 11, color: "var(--ink-3)" }}>JPG, PNG, WEBP · máx 10MB por foto</span>
        </label>
        {uploadErr && <div className="login-error" style={{ marginTop: 8 }}>{uploadErr}</div>}
        {imgs.length > 0 && (
          <div className="images-grid">
            {imgs.map((url, i) => (
              <div
                className="image-thumb"
                key={url}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", String(i))}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const from = Number(e.dataTransfer.getData("text/plain"));
                  if (from === i) return;
                  const arr = [...imgs];
                  arr.splice(i, 0, arr.splice(from, 1)[0]);
                  set("imagenes", arr.join(";"));
                }}
                style={{ cursor: "grab" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Foto ${i + 1}`} />
                {i === 0 && <div className="image-thumb-cover">Portada</div>}
                <div className="image-thumb-num">{i + 1}</div>
                <div className="image-thumb-actions">
                  <button className="btn ghost" style={{ padding: "6px 10px", fontSize: 11 }}
                    onClick={() => { const a = imgs.filter((_, j) => j !== i); set("imagenes", a.join(";")); }}>
                    <Ic.x />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ubicación */}
      <div className="form-section">
        <div className="form-section-title">Ubicación</div>
        <div className="form-grid">
          <div className="form-field span-2">
            <label>Dirección *</label>
            <input value={form.direccion} onChange={(e) => set("direccion", e.target.value)} placeholder="Av. Providencia 1234, Depto 501" />
          </div>
          <div className="form-field">
            <label>Comuna *</label>
            <input value={form.comuna} onChange={(e) => set("comuna", e.target.value)} placeholder="Providencia" />
          </div>
          <div className="form-field">
            <label>Ciudad</label>
            <input value={form.ciudad} onChange={(e) => set("ciudad", e.target.value)} placeholder="Santiago" />
          </div>
        </div>
      </div>

      {/* Publicación */}
      <div className="form-section">
        <div className="form-section-title">Publicación</div>
        <div className="form-toggle">
          <div>
            <div className="form-toggle-label">Propiedad destacada</div>
            <div className="form-toggle-sub">Aparece primero en la grilla y en el hero del portal</div>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={!!form.destacado} onChange={(e) => set("destacado", e.target.checked)} />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>

      {msg && <div className={`login-error`} style={msg.startsWith("Error") ? {} : { background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a" }}>{msg}</div>}

      <div className="form-footer">
        <button className="btn ghost" onClick={onCancel} style={{ padding: "11px 20px" }}>Cancelar</button>
        <button className="btn primary" onClick={() => onSave(form)} disabled={saving} style={{ padding: "11px 24px" }}>
          {saving ? "Guardando…" : <>{form.id ? "Guardar cambios" : "Publicar propiedad"} <Ic.arrow /></>}
        </button>
      </div>
    </div>
  );
}

/* ---- Sidebar ---- */
function Sidebar({ view, setView, count, user, onLogout }: {
  view: string; setView: (v: string) => void; count: number;
  user: { email?: string }; onLogout: () => void;
}) {
  const items = [
    { id: "dashboard", label: "Dashboard", icon: <Ic.home /> },
    { id: "list", label: "Propiedades", icon: <Ic.list />, count },
    { id: "paused", label: "Pausadas", icon: <Ic.pause /> },
    { id: "new", label: "Crear nueva", icon: <Ic.plus /> },
  ];
  return (
    <aside className="admin-side">
      <div className="admin-side-logo">
        <div className="logo">
          <span className="logo-mark">Marlo<em>.</em></span>
          <span className="logo-sub">Admin</span>
        </div>
      </div>
      <div className="admin-side-section">
        <h4>Trabajo</h4>
        {items.map((item) => (
          <button key={item.id} className={`admin-nav-item${view === item.id ? " active" : ""}`} onClick={() => setView(item.id)}>
            {item.icon} {item.label}
            {item.count !== undefined && <span className="badge-count">{item.count}</span>}
          </button>
        ))}
      </div>
      <div className="admin-side-section">
        <h4>Otros</h4>
        <a className="admin-nav-item" href="/" target="_blank"><Ic.eye /> Ver portal</a>
      </div>
      <div className="admin-side-bottom">
        <div className="admin-user">
          <div className="admin-user-avatar">{user.email?.[0]?.toUpperCase() || "M"}</div>
          <div className="admin-user-info">
            <span className="admin-user-name">{user.email}</span>
            <span className="admin-user-role">Corredor</span>
          </div>
        </div>
        <button className="admin-nav-item" onClick={onLogout}><Ic.logout /> Cerrar sesión</button>
      </div>
    </aside>
  );
}

/* ---- Dashboard ---- */
function DashboardView({ properties, setView }: { properties: Property[]; setView: (v: string) => void }) {
  const venta = properties.filter((p) => p.operacion === "venta").length;
  const arriendo = properties.filter((p) => p.operacion === "arriendo").length;
  const destacadas = properties.filter((p) => p.destacado).length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 20 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="admin-main">
      <div className="admin-topbar">
        <div>
          <div className="admin-eyebrow">Resumen</div>
          <h1 className="admin-page-title">{greeting}, <em>Marlo</em></h1>
        </div>
        <button className="btn primary" onClick={() => setView("new")} style={{ padding: "11px 20px" }}>
          <Ic.plus /> Nueva propiedad
        </button>
      </div>
      <div className="admin-content">
        <div className="stat-cards">
          {[
            { label: "Propiedades activas", val: properties.length },
            { label: "En venta", val: venta },
            { label: "En arriendo", val: arriendo },
            { label: "Destacadas", val: destacadas },
          ].map(({ label, val }) => (
            <div className="stat-card" key={label}>
              <div className="stat-card-label">{label}</div>
              <div className="stat-card-val">{val}</div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 24 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 16 }}>Publicaciones recientes</div>
          {properties.slice(0, 5).map((p) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderBottom: "1px solid var(--line-2)" }}>
              {p.imagenes?.split(";")[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imagenes.split(";")[0]} alt="" className="admin-thumb" />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="admin-prop-title">{p.titulo}</div>
                <div className="admin-prop-meta">{p.comuna} · {TIPO_LABEL[p.tipo]}</div>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{fmtCLP(p.precio)}</div>
              {p.destacado && <span className="admin-badge destacada">★</span>}
            </div>
          ))}
          {properties.length === 0 && (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--ink-3)" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 8 }}>Sin propiedades</div>
              <p style={{ fontSize: 14 }}>Crea tu primera propiedad para empezar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- List View ---- */
function ListView({ properties, onEdit, onToggleStar, onToggleActive, onDelete, setView, pausedOnly = false }: {
  properties: Property[];
  onEdit: (p: Property) => void;
  onToggleStar: (p: Property) => void;
  onToggleActive: (p: Property) => void;
  onDelete: (p: Property) => void;
  setView: (v: string) => void;
  pausedOnly?: boolean;
}) {
  const [q, setQ] = useState("");
  const [op, setOp] = useState("todas");
  const [tipo, setTipo] = useState("todos");

  const filtered = useMemo(() => properties.filter((p) => {
    if (pausedOnly && p.activa !== false) return false;
    if (!pausedOnly && p.activa === false) return false;
    if (op !== "todas" && p.operacion !== op) return false;
    if (tipo !== "todos" && p.tipo !== tipo) return false;
    if (q && !p.titulo.toLowerCase().includes(q.toLowerCase()) && !p.comuna.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [properties, q, op, tipo]);

  return (
    <div className="admin-main">
      <div className="admin-topbar">
        <div>
          <div className="admin-eyebrow">Inventario</div>
          <h1 className="admin-page-title"><em>Propiedades</em></h1>
        </div>
        <button className="btn primary" onClick={() => setView("new")} style={{ padding: "11px 20px" }}>
          <Ic.plus /> Nueva propiedad
        </button>
      </div>
      <div className="admin-content">
        <div className="admin-toolbar">
          <div className="admin-search">
            <Ic.search />
            <input placeholder="Buscar por título o comuna…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="admin-select" value={op} onChange={(e) => setOp(e.target.value)}>
            <option value="todas">Todas</option>
            <option value="venta">Venta</option>
            <option value="arriendo">Arriendo</option>
          </select>
          <select className="admin-select" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="todos">Todos los tipos</option>
            {TIPOS.map((t) => <option key={t} value={t}>{TIPO_LABEL[t]}</option>)}
          </select>
          <span className="admin-count">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 72 }}>Foto</th>
              <th>Propiedad</th>
              <th>Precio</th>
              <th>Estado</th>
              <th style={{ width: 120 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} onClick={() => onEdit(p)}>
                <td>
                  {p.imagenes?.split(";")[0]
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={p.imagenes.split(";")[0]} alt="" className="admin-thumb" />
                    : <div className="admin-thumb" />}
                </td>
                <td>
                  <div className="admin-prop-title">{p.titulo}</div>
                  <div className="admin-prop-meta">{p.comuna} · {TIPO_LABEL[p.tipo]}</div>
                </td>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{fmtCLP(p.precio)}</td>
                <td>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span className="admin-badge">{p.operacion === "venta" ? "Venta" : "Arriendo"}</span>
                    {p.destacado && <span className="admin-badge destacada">★ Destacada</span>}
                  </div>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="admin-actions">
                    <button className="admin-icon-btn" onClick={() => onToggleStar(p)} title={p.destacado ? "Quitar destacada" : "Destacar"}>
                      <Ic.star filled={p.destacado} />
                    </button>
                    <button className="admin-icon-btn" onClick={() => onToggleActive(p)} title={p.activa !== false ? "Pausar" : "Activar"} style={{ color: p.activa === false ? "var(--ink-3)" : undefined }}>
                      {p.activa === false ? <Ic.play /> : <Ic.pause />}
                    </button>
                    <button className="admin-icon-btn" onClick={() => onEdit(p)} title="Editar"><Ic.edit /></button>
                    <button className="admin-icon-btn danger" onClick={() => onDelete(p)} title="Eliminar"><Ic.trash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: "48px 0", textAlign: "center", color: "var(--ink-3)" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24 }}>Sin resultados</div>
            <p style={{ fontSize: 14, marginTop: 8 }}>Ajusta los filtros o crea una nueva propiedad.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- Main Admin ---- */
export default function AdminPage() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [view, setView] = useState("dashboard");
  const [editing, setEditing] = useState<Property | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [confirmDel, setConfirmDel] = useState<Property | null>(null);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { setUser(session.user); loadProps(); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProps();
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProps = async () => {
    const res = await fetch("/api/propiedades");
    if (res.ok) { const data = await res.json(); setProperties(data); }
  };

  const showToast = (text: string, ok = true) => {
    setToast({ text, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async (form: Omit<Property, "id"> & { id?: number }) => {
    setSaving(true); setMsg("");
    const method = form.id ? "PUT" : "POST";
    const { id: _id, ...rest } = form as Property; void _id;
    const body = form.id ? form : rest;
    const res = await fetch("/api/propiedades", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json();
    if (!res.ok) { setMsg("Error: " + (json.error || "desconocido")); }
    else { showToast(form.id ? "Propiedad actualizada" : "Propiedad publicada"); setView("list"); loadProps(); }
    setSaving(false);
  };

  const handleDelete = async (p: Property) => {
    await fetch("/api/propiedades", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: p.id }) });
    showToast("Propiedad eliminada"); loadProps(); setConfirmDel(null);
  };

  const handleToggleStar = async (p: Property) => {
    await fetch("/api/propiedades", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: p.id, destacado: !p.destacado }) });
    loadProps();
    showToast(p.destacado ? "Propiedad desmarcada" : "Propiedad destacada");
  };

  const handleToggleActive = async (p: Property) => {
    const activa = p.activa === false ? true : false;
    await fetch("/api/propiedades", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: p.id, activa }) });
    loadProps();
    showToast(activa ? "Propiedad activada" : "Propiedad pausada — no se ve en el portal");
  };

  if (!user) return <LoginScreen onLogin={() => { setUser({ email: "arriendos@marlopropiedades.cl" }); loadProps(); }} />;

  const formInitial = editing ? { ...editing } : { ...empty };

  return (
    <div className="admin-shell">
      <Sidebar
        view={view}
        setView={(v) => { setView(v); if (v !== "edit") setEditing(null); setMsg(""); }}
        count={properties.length}
        user={user}
        onLogout={() => supabase.auth.signOut()}
      />

      {view === "dashboard" && <DashboardView properties={properties} setView={setView} />}

      {(view === "list" || view === "paused") && (
        <ListView
          properties={properties}
          onEdit={(p) => { setEditing(p); setView("edit"); }}
          onToggleStar={handleToggleStar}
          onToggleActive={handleToggleActive}
          onDelete={setConfirmDel}
          setView={setView}
          pausedOnly={view === "paused"}
        />
      )}

      {(view === "new" || view === "edit") && (
        <div className="admin-main">
          <div className="admin-topbar">
            <div>
              <div className="admin-eyebrow">{view === "new" ? "Nueva publicación" : "Editar"}</div>
              <h1 className="admin-page-title">{view === "new" ? <><em>Crear</em> propiedad</> : <><em>Editar</em> propiedad</>}</h1>
            </div>
          </div>
          <div className="admin-content">
            <PropertyForm
              initial={formInitial}
              onSave={handleSave}
              onCancel={() => { setView("list"); setEditing(null); setMsg(""); }}
              saving={saving}
              msg={msg}
            />
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDel && (
        <div className="confirm-overlay" onClick={() => setConfirmDel(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-title">Eliminar propiedad</div>
            <p className="confirm-desc">¿Eliminar <strong>{confirmDel.titulo}</strong>? Esta acción no se puede deshacer.</p>
            <div className="confirm-actions">
              <button className="btn ghost" onClick={() => setConfirmDel(null)} style={{ padding: "10px 18px" }}>Cancelar</button>
              <button className="btn primary" onClick={() => handleDelete(confirmDel)} style={{ padding: "10px 18px", background: "#dc2626" }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className={`toast${toast.ok ? "" : " error"}`}>{toast.text}</div>}
    </div>
  );
}

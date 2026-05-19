"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "../lib/supabase";

interface Property {
  id: number;
  titulo: string;
  operacion: string;
  precio: number;
  tipo: string;
  dormitorios: number;
  banos: number;
  metros: number;
  metros_terreno: number;
  activa: boolean;
  comuna: string;
  ciudad: string;
  direccion: string;
  gastos_comunes: number;
  estacionamientos: number;
  bodega: boolean | string;
  destacado: boolean;
  imagenes: string;
  descripcion: string;
  etiquetas: string;
}

const fmtCLP = (n: number) => {
  if (!n && n !== 0) return "—";
  return "$" + n.toLocaleString("es-CL").replace(/,/g, ".");
};
const fmtUF = (clp: number) => {
  const uf = clp / 38500;
  return uf.toLocaleString("es-CL", { maximumFractionDigits: 0 }) + " UF";
};
const fmtN = (n: number) => n.toLocaleString("es-CL").replace(/,/g, ".");

const TIPO_LABEL: Record<string, string> = {
  departamento: "Departamento",
  casa: "Casa",
  oficina: "Oficina",
  parcela: "Parcela",
  terreno: "Terreno",
  local: "Local comercial",
};

/* ---- SVG Icons ---- */
const IcBed = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 18v-7a3 3 0 013-3h12a3 3 0 013 3v7" /><path d="M3 14h18M3 18v3M21 18v3" />
    <rect x="7" y="10" width="4" height="3" rx="1" /><rect x="13" y="10" width="4" height="3" rx="1" />
  </svg>
);
const IcBath = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 12h16v3a4 4 0 01-4 4H8a4 4 0 01-4-4v-3z" /><path d="M6 12V6a2 2 0 012-2h2a2 2 0 012 2v1" /><path d="M6 19v2M18 19v2" />
  </svg>
);
const IcSqm = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="4" y="4" width="16" height="16" /><path d="M4 9h2M4 14h2M9 4v2M14 4v2" />
  </svg>
);
const IcCar = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M5 17V9l2-4h10l2 4v8" /><path d="M5 17h14M3 17h2M19 17h2" />
    <circle cx="8" cy="17" r="1.5" /><circle cx="16" cy="17" r="1.5" />
  </svg>
);
const IcArrow = ({ s = 16, left }: { s?: number; left?: boolean }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
    style={{ transform: left ? "rotate(180deg)" : undefined }}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
const IcHeart = ({ s = 16, filled }: { s?: number; filled?: boolean }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
    <path d="M12 20s-7-4.35-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.65-7 10-7 10z" />
  </svg>
);
const IcX = ({ s = 18 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
const IcCamera = ({ s = 12 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="7" width="18" height="13" rx="1" /><path d="M9 7l1.5-3h3L15 7" /><circle cx="12" cy="13" r="3.5" />
  </svg>
);
const IcSearch = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="11" cy="11" r="6" /><path d="M16 16l4 4" />
  </svg>
);
const IcGrid = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="4" y="4" width="7" height="7" /><rect x="13" y="4" width="7" height="7" />
    <rect x="4" y="13" width="7" height="7" /><rect x="13" y="13" width="7" height="7" />
  </svg>
);
const IcMap = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2-6-2z" /><path d="M9 4v14M15 6v14" />
  </svg>
);
const IcMenu = ({ s = 22 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
const IcPin = ({ s = 12 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 21s-7-7.5-7-12a7 7 0 0114 0c0 4.5-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" />
  </svg>
);
const IcWsp = ({ s = 28 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.6 6.32A7.85 7.85 0 0012.05 4a7.94 7.94 0 00-6.88 11.9L4 20l4.2-1.1a7.94 7.94 0 003.84.98h.01a7.94 7.94 0 005.55-13.56zm-5.55 12.21h-.01a6.6 6.6 0 01-3.36-.92l-.24-.14-2.5.65.67-2.43-.16-.25a6.6 6.6 0 1112.27-4.97 6.6 6.6 0 01-6.67 8.06zm3.62-4.94c-.2-.1-1.17-.58-1.35-.65s-.31-.1-.45.1c-.13.2-.51.65-.62.78-.12.13-.23.15-.42.05-.2-.1-.84-.31-1.6-1-.6-.53-1-1.18-1.11-1.38-.12-.2-.01-.31.09-.41.09-.09.2-.23.3-.35.1-.12.13-.2.2-.33.06-.13.03-.25-.02-.35-.05-.1-.45-1.08-.62-1.48-.16-.39-.33-.34-.45-.34h-.39c-.13 0-.35.05-.53.25s-.7.68-.7 1.66c0 .98.71 1.92.81 2.05.1.13 1.4 2.13 3.38 2.98.47.2.84.32 1.13.41.47.15.9.13 1.24.08.38-.06 1.17-.48 1.34-.94.17-.46.17-.86.12-.94-.05-.08-.18-.13-.38-.23z" />
  </svg>
);

/* ---- Carousel ---- */
function Carousel({ images, title }: { images: string[]; title: string }) {
  const [idx, setIdx] = useState(0);
  const go = (d: number) => setIdx((p) => (p + d + images.length) % images.length);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  return (
    <div className="carousel">
      <div className="carousel-track" style={{ transform: `translateX(-${idx * 100}%)` }}>
        {images.map((src, i) => (
          <div className="carousel-slide" key={i}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`${title} — ${i + 1}`} />
          </div>
        ))}
      </div>
      <div className="carousel-count">{idx + 1} / {images.length}</div>
      {images.length > 1 && (
        <>
          <button className="carousel-arrow prev" onClick={() => go(-1)} aria-label="Anterior">
            <IcArrow s={18} left />
          </button>
          <button className="carousel-arrow next" onClick={() => go(1)} aria-label="Siguiente">
            <IcArrow s={18} />
          </button>
          <div className="carousel-dots">
            {images.map((_, i) => (
              <button key={i} className={`carousel-dot${i === idx ? " active" : ""}`} onClick={() => setIdx(i)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ---- Property Card ---- */
function PropertyCard({ p, featured, onClick, fav, onFav }: {
  p: Property; featured?: boolean; onClick: () => void; fav: boolean; onFav: (id: number) => void;
}) {
  const imgs = (p.imagenes || "").split(";").filter(Boolean);
  return (
    <article className={`card${featured ? " featured" : ""}`} onClick={onClick}>
      <div className="card-photo">
        {imgs[0] && <img src={imgs[0]} alt={p.titulo} loading="lazy" />}
        <div className="card-badges">
          <div style={{ display: "flex", gap: 8 }}>
            <span className="badge">{p.operacion === "venta" ? "Venta" : "Arriendo"}</span>
            {p.destacado && <span className="badge featured-tag">★ Destacada</span>}
          </div>
          <button className={`card-fav${fav ? " active" : ""}`}
            onClick={(e) => { e.stopPropagation(); onFav(p.id); }} aria-label="Guardar">
            <IcHeart filled={fav} />
          </button>
        </div>
        {imgs.length > 0 && (
          <div className="card-photo-count"><IcCamera />{imgs.length}</div>
        )}
      </div>
      <div className="card-body">
        <div className="card-loc">{p.comuna} · {p.ciudad}</div>
        <h3 className="card-title">{p.titulo}</h3>
        <div className="card-price">
          {fmtCLP(p.precio)}
          {p.operacion === "arriendo" && <span className="uf">/ mes</span>}
        </div>
        <div className="card-specs">
          {p.dormitorios > 0 && <span className="card-spec"><IcBed />{p.dormitorios}</span>}
          {p.banos > 0 && <span className="card-spec"><IcBath />{p.banos}</span>}
          <span className="card-spec"><IcSqm />{fmtN(p.metros)} m²</span>
          {p.estacionamientos > 0 && <span className="card-spec"><IcCar />{p.estacionamientos}</span>}
        </div>
      </div>
    </article>
  );
}

/* ---- Property Detail Modal ---- */
function PropertyDetail({ p, onClose, fav, onFav }: {
  p: Property; onClose: () => void; fav: boolean; onFav: (id: number) => void;
}) {
  const imgs = (p.imagenes || "").split(";").filter(Boolean);
  const tags = p.etiquetas ? p.etiquetas.split(";").filter(Boolean) : [];
  const wspMsg = encodeURIComponent(`Hola, me interesa la propiedad ${p.id} — ${p.titulo} (${p.comuna}). ¿Podemos coordinar una visita?`);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar"><IcX /></button>
        <Carousel images={imgs.length ? imgs : ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800"]} title={p.titulo} />
        <div className="modal-body">
          <div className="detail-main">
            <div className="detail-loc">
              <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
                <IcPin />{p.direccion}
              </span>
              <span>·</span><span>{p.comuna}</span><span>·</span><span>{p.ciudad}</span>
            </div>
            <h1 className="detail-title">{p.titulo}</h1>
            <div className="detail-tags">
              <span className="detail-tag">{p.operacion === "venta" ? "Venta" : "Arriendo"}</span>
              <span className="detail-tag">{TIPO_LABEL[p.tipo] || p.tipo}</span>
              {tags.map((t) => <span className="detail-tag" key={t}>{t}</span>)}
            </div>
            <div className="detail-specs">
              {p.dormitorios > 0 && (
                <div className="detail-spec">
                  <div className="detail-spec-num">{p.dormitorios}</div>
                  <div className="detail-spec-label">Dormitorios</div>
                </div>
              )}
              {p.banos > 0 && (
                <div className="detail-spec">
                  <div className="detail-spec-num">{p.banos}</div>
                  <div className="detail-spec-label">Baños</div>
                </div>
              )}
              <div className="detail-spec">
                <div className="detail-spec-num">{fmtN(p.metros)}</div>
                <div className="detail-spec-label">m² construidos</div>
              </div>
              {p.metros_terreno > 0 && (
                <div className="detail-spec">
                  <div className="detail-spec-num">{fmtN(p.metros_terreno)}</div>
                  <div className="detail-spec-label">m² terreno</div>
                </div>
              )}
              {p.estacionamientos > 0 && (
                <div className="detail-spec">
                  <div className="detail-spec-num">{p.estacionamientos}</div>
                  <div className="detail-spec-label">Estac.</div>
                </div>
              )}
            </div>
            {p.descripcion && (
              <div className="detail-section">
                <h3>Sobre esta propiedad</h3>
                <p>{p.descripcion}</p>
              </div>
            )}
            <div className="detail-section">
              <h3>Ubicación</h3>
              <div style={{ position: "relative", aspectRatio: "16/9", background: "var(--bg-warm)", border: "1px solid var(--line)", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(90deg, var(--line-2) 1px, transparent 1px),linear-gradient(0deg, var(--line-2) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
                <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-100%)", fontFamily: "var(--font-mono)", fontSize: 12, padding: "6px 10px", background: "var(--ink)", color: "var(--bg)", display: "flex", alignItems: "center", gap: 4 }}>
                  <IcPin />{p.direccion}
                </div>
              </div>
            </div>
          </div>
          <aside className="detail-rail">
            <div className="detail-price-card">
              <div className="detail-price-label">{p.operacion === "venta" ? "Precio de venta" : "Arriendo mensual"}</div>
              <div className="detail-price">{fmtCLP(p.precio)}</div>
              <div className="detail-price-sub">
                <span>≈ {fmtUF(p.precio)}</span>
                {p.gastos_comunes > 0 && <span>Gastos comunes: {fmtCLP(p.gastos_comunes)}</span>}
              </div>
              <div className="detail-actions">
                <a className="btn whatsapp" href={`https://wa.me/56971087515?text=${wspMsg}`} target="_blank" rel="noopener noreferrer">
                  <IcWsp s={16} /> Consultar por WhatsApp
                </a>
                <a className="btn primary" href="tel:+56971087515">Llamar</a>
                <button className="btn ghost" onClick={() => onFav(p.id)}>
                  <IcHeart filled={fav} s={14} />{fav ? "Guardada" : "Guardar"}
                </button>
              </div>
            </div>
            <div className="detail-meta-list">
              <div className="detail-meta-row"><span className="k">Tipo</span><span className="v">{TIPO_LABEL[p.tipo] || p.tipo}</span></div>
              <div className="detail-meta-row"><span className="k">Operación</span><span className="v">{p.operacion === "venta" ? "Venta" : "Arriendo"}</span></div>
              <div className="detail-meta-row"><span className="k">m² construidos</span><span className="v">{fmtN(p.metros)} m²</span></div>
              {p.metros_terreno > 0 && <div className="detail-meta-row"><span className="k">m² terreno</span><span className="v">{fmtN(p.metros_terreno)} m²</span></div>}
              {p.gastos_comunes > 0 && <div className="detail-meta-row"><span className="k">GG.CC.</span><span className="v">{fmtCLP(p.gastos_comunes)}</span></div>}
              <div className="detail-meta-row"><span className="k">Bodega</span><span className="v">{p.bodega ? "Sí" : "No"}</span></div>
              {p.estacionamientos > 0 && <div className="detail-meta-row"><span className="k">Estacionamientos</span><span className="v">{p.estacionamientos}</span></div>}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ---- Calculator ---- */
function Calculator({ defaultPrice }: { defaultPrice: number }) {
  const [price, setPrice] = useState(defaultPrice);
  const [pie, setPie] = useState(20);
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(4.5);

  const loan = price * (1 - pie / 100);
  const monthlyRate = rate / 100 / 12;
  const n = years * 12;
  const dividendo = monthlyRate === 0 ? loan / n : (loan * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);

  return (
    <div className="calc-section">
      <div className="calc-inner">
        <div>
          <div className="eyebrow">Simulador hipotecario</div>
          <h2 className="section-title" style={{ color: "var(--bg)", marginTop: 12 }}>
            ¿Cuánto pagarías<br /><em>al mes?</em>
          </h2>
          <p style={{ marginTop: 20, fontSize: 16, color: "rgba(245,243,239,0.6)", maxWidth: 420, lineHeight: 1.55 }}>
            Estima tu dividendo mensual. Tasa referencial del mercado: 4.5% anual. Consulta con tu banco para una cotización exacta.
          </p>
          <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Tasa anual referencial", val: `${rate}%` },
              { label: "Plazo disponible", val: `hasta ${years} años` },
            ].map(({ label, val }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.08)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
                <span style={{ color: "rgba(245,243,239,0.55)", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 11 }}>{label}</span>
                <span style={{ color: "rgba(245,243,239,0.8)" }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="calc-card">
          <div className="calc-row">
            <div className="calc-label">Valor de la propiedad</div>
            <div className="calc-input">
              <span className="currency">$</span>
              <input
                type="text"
                inputMode="numeric"
                value={price.toLocaleString("es-CL")}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\./g, "").replace(/[^0-9]/g, "");
                  if (raw === "") { setPrice(0); return; }
                  const n = Number(raw);
                  if (!isNaN(n)) setPrice(n);
                }}
              />
            </div>
            <input type="range" className="calc-slider" min={50000000} max={800000000} step={5000000} value={price} onChange={(e) => setPrice(Number(e.target.value))} />
            <div className="calc-slider-meta"><span>$50M</span><span>$800M</span></div>
          </div>
          <div className="calc-row">
            <div className="calc-label">Pie ({pie}%)</div>
            <div className="calc-input">
              <input type="number" value={pie} onChange={(e) => setPie(Number(e.target.value))} style={{ fontSize: 28 }} />
              <span className="currency">%</span>
            </div>
            <input type="range" className="calc-slider" min={10} max={50} step={5} value={pie} onChange={(e) => setPie(Number(e.target.value))} />
            <div className="calc-slider-meta"><span>10%</span><span>50%</span></div>
          </div>
          <div className="calc-row" style={{ marginBottom: 0 }}>
            <div className="calc-label">Plazo ({years} años)</div>
            <input type="range" className="calc-slider" min={5} max={30} step={5} value={years} onChange={(e) => setYears(Number(e.target.value))} />
            <div className="calc-slider-meta"><span>5 años</span><span>30 años</span></div>
          </div>
          <div className="calc-result">
            <div>
              <div className="calc-result-val">{fmtCLP(Math.round(dividendo))}</div>
              <div className="calc-result-label">Dividendo mensual est.</div>
            </div>
            <div>
              <div className="calc-result-val small">{fmtCLP(Math.round(loan))}</div>
              <div className="calc-result-label">Monto a financiar</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Main Portal ---- */
export default function PortalInmobiliario() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filters, setFilters] = useState({ operacion: "todas", tipo: "todos", comuna: "todas", q: "" });
  const [sort, setSort] = useState("destacadas");
  const [selected, setSelected] = useState<Property | null>(null);
  const [favs, setFavs] = useState<number[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const propsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from("propiedades").select("*")
      .neq("activa", false)
      .order("destacado", { ascending: false })
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setProperties(data); });
    try { setFavs(JSON.parse(localStorage.getItem("marlo_favs") || "[]")); } catch { /* noop */ }
  }, []);

  useEffect(() => {
    localStorage.setItem("marlo_favs", JSON.stringify(favs));
  }, [favs]);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const comunas = useMemo(() => [...new Set(properties.map((p) => p.comuna))].sort(), [properties]);

  const filtered = useMemo(() => {
    let r = properties.filter((p) => {
      if (filters.operacion !== "todas" && p.operacion !== filters.operacion) return false;
      if (filters.tipo !== "todos" && p.tipo !== filters.tipo) return false;
      if (filters.comuna !== "todas" && p.comuna !== filters.comuna) return false;
      if (filters.q) {
        const q = filters.q.toLowerCase();
        if (!(p.titulo.toLowerCase().includes(q) || p.comuna.toLowerCase().includes(q) || p.descripcion?.toLowerCase().includes(q))) return false;
      }
      return true;
    });
    if (sort === "destacadas") r = [...r].sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0));
    else if (sort === "precio-asc") r = [...r].sort((a, b) => a.precio - b.precio);
    else if (sort === "precio-desc") r = [...r].sort((a, b) => b.precio - a.precio);
    else if (sort === "metros-desc") r = [...r].sort((a, b) => b.metros - a.metros);
    return r;
  }, [properties, filters, sort]);

  const featuredFirst = filtered.find((p) => p.destacado);
  const toggleFav = (id: number) => setFavs((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const scrollToProps = () => { setTimeout(() => propsRef.current?.scrollIntoView({ behavior: "smooth" }), 50); };
  const setFilter = (key: string, val: string) => setFilters((prev) => ({ ...prev, [key]: val }));

  const navLinks = [
    { label: "Propiedades", onClick: scrollToProps },
    { label: "Calculadora", onClick: () => document.getElementById("credito")?.scrollIntoView({ behavior: "smooth" }) },
    { label: "Quiénes somos", onClick: () => document.getElementById("quienes")?.scrollIntoView({ behavior: "smooth" }) },
    { label: "Contacto", onClick: () => document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" }) },
  ];

  return (
    <>
      {/* NAV */}
      <header className={`nav${scrolled ? " scrolled" : ""}`}>
        <div className="nav-inner">
          <div className="logo" style={{ cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <span className="logo-mark">Marlo<em>.</em></span>
            <span className="logo-sub">Propiedades</span>
          </div>
          <nav className="nav-links">
            {navLinks.map((l) => (
              <a key={l.label} onClick={l.onClick} style={{ cursor: "pointer" }}>{l.label}</a>
            ))}
          </nav>
          <a className="nav-cta" href="/admin">Acceso corredores <IcArrow s={14} /></a>
          <button className="nav-hamburger" onClick={() => setMobileOpen(true)} aria-label="Menú"><IcMenu /></button>
        </div>
      </header>

      {/* MOBILE MENU */}
      <div className={`mobile-menu${mobileOpen ? " open" : ""}`}>
        <button style={{ position: "absolute", top: 20, right: 24 }} onClick={() => setMobileOpen(false)}><IcX s={24} /></button>
        {navLinks.map((l) => (
          <a key={l.label} onClick={() => { l.onClick(); setMobileOpen(false); }} style={{ cursor: "pointer" }}>{l.label}</a>
        ))}
        <a className="btn primary" href="/admin" style={{ marginTop: 16 }}>Acceso corredores</a>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <div>
              <div className="hero-eyebrow">Marlo Propiedades · est. 2014</div>
              <h1 className="hero-title">Encuentra tu próxima<br />propiedad con <em>confianza.</em></h1>
              <p className="hero-desc">Te acompañamos en cada etapa del proceso: búsqueda, visitas, negociación, documentación y cierre. Propiedades seleccionadas con asesoría clara hasta la firma.</p>
            </div>
            <div className="hero-meta">
              <div className="hero-meta-item">
                <div className="hero-meta-num">{properties.length || "—"}</div>
                <div className="hero-meta-label">Propiedades activas</div>
              </div>
              <div className="hero-meta-item">
                <div className="hero-meta-num">{comunas.length || "—"}</div>
                <div className="hero-meta-label">Comunas</div>
              </div>
              <div className="hero-meta-item">
                <div className="hero-meta-num">12 <span style={{ fontSize: 18, color: "var(--ink-3)" }}>años</span></div>
                <div className="hero-meta-label">Operando</div>
              </div>
            </div>
          </div>
          <div className="hero-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80" alt="Propiedad destacada" />
            {featuredFirst && (
              <div className="hero-photo-tag">
                <span>DESTACADA · {featuredFirst.comuna.toUpperCase()}</span>
                <strong>{featuredFirst.titulo}</strong>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SEARCHBAR */}
      <div className="searchbar">
        <div className="searchbar-inner">
          <div className="search-field">
            <div className="search-field-label">Operación</div>
            <select className="search-field-value" value={filters.operacion} onChange={(e) => setFilter("operacion", e.target.value)}>
              <option value="todas">Venta o arriendo</option>
              <option value="venta">Venta</option>
              <option value="arriendo">Arriendo</option>
            </select>
          </div>
          <div className="search-field">
            <div className="search-field-label">Tipo</div>
            <select className="search-field-value" value={filters.tipo} onChange={(e) => setFilter("tipo", e.target.value)}>
              <option value="todos">Todos los tipos</option>
              {Object.entries(TIPO_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="search-field">
            <div className="search-field-label">Comuna</div>
            <select className="search-field-value" value={filters.comuna} onChange={(e) => setFilter("comuna", e.target.value)}>
              <option value="todas">Todas las comunas</option>
              {comunas.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="search-field">
            <div className="search-field-label">Buscar</div>
            <input className="search-field-value" placeholder="Ej. vista al parque, Las Condes…" value={filters.q} onChange={(e) => setFilter("q", e.target.value)} />
          </div>
          <button className="search-submit" onClick={scrollToProps}>
            <IcSearch />Buscar
          </button>
        </div>
      </div>

      {/* FILTERS BAR */}
      <div ref={propsRef} style={{ height: 88 }} />
      <div className="filters-bar">
        {[
          { val: "todas", label: "Todas", count: properties.length },
          { val: "venta", label: "Venta", count: properties.filter((p) => p.operacion === "venta").length },
          { val: "arriendo", label: "Arriendo", count: properties.filter((p) => p.operacion === "arriendo").length },
        ].map(({ val, label, count }) => (
          <button key={val} className={`chip${filters.operacion === val ? " active" : ""}`} onClick={() => setFilter("operacion", val)}>
            {label} <span className="chip-count">({count})</span>
          </button>
        ))}
        <div className="filters-divider" />
        {Object.entries(TIPO_LABEL).map(([v, l]) => {
          const count = properties.filter((p) => p.tipo === v).length;
          if (!count) return null;
          return (
            <button key={v} className={`chip${filters.tipo === v ? " active" : ""}`} onClick={() => setFilter("tipo", filters.tipo === v ? "todos" : v)}>
              {l} <span className="chip-count">{count}</span>
            </button>
          );
        })}
        <div className="filters-divider" />
        <button className={`chip${favs.length > 0 && filters.q === "__favs" ? " active" : ""}`}
          onClick={() => setFilter("q", filters.q === "__favs" ? "" : "__favs")}>
          <IcHeart s={12} /> Guardadas <span className="chip-count">({favs.length})</span>
        </button>
        <div className="view-toggle">
          <button className="active"><IcGrid />Grilla</button>
          <button onClick={scrollToProps}><IcMap />Mapa</button>
        </div>
      </div>

      {/* PROPERTY GRID */}
      <section className="section" style={{ paddingTop: 32 }}>
        <div className="results-meta">
          <div className="results-count">
            <span>{filtered.length}</span> <em>propiedades</em>
            {filters.comuna !== "todas" && <em> en {filters.comuna}</em>}
          </div>
          <div className="sort-by">
            <span>Ordenar por</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="destacadas">Destacadas primero</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
              <option value="metros-desc">Más metros²</option>
            </select>
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="serif">Sin resultados</div>
            <p>Prueba ajustar los filtros o busca por otra comuna.</p>
          </div>
        ) : (
          <div className={`props-grid${featuredFirst && sort === "destacadas" ? " featured-row" : ""}`}>
            {filtered.map((p, i) => (
              <PropertyCard
                key={p.id}
                p={p}
                featured={i === 0 && !!p.destacado && sort === "destacadas"}
                onClick={() => setSelected(p)}
                fav={favs.includes(p.id)}
                onFav={toggleFav}
              />
            ))}
          </div>
        )}
      </section>

      {/* CALCULATOR */}
      <div id="credito" />
      <Calculator defaultPrice={featuredFirst?.precio || 200000000} />

      {/* ABOUT */}
      <section id="quienes" className="section">
        <div className="about-grid">
          <div>
            <div className="eyebrow">Quiénes somos</div>
            <h2 className="section-title" style={{ marginTop: 16 }}>
              Doce años acompañando cada propiedad con <em>confianza.</em>
            </h2>
            <p style={{ marginTop: 24, fontSize: 16, color: "var(--ink-2)", lineHeight: 1.65, maxWidth: 520 }}>
              MARLO Propiedades nace como un proyecto familiar, con una forma de trabajo cercana, detallista y transparente. Desde 2014 acompañamos a personas y familias en la compra, venta y arriendo de propiedades, cuidando cada etapa del proceso.
            </p>
            <p style={{ marginTop: 16, fontSize: 16, color: "var(--ink-2)", lineHeight: 1.65, maxWidth: 520 }}>
              Trabajamos con un enfoque personalizado: tasación, difusión, visitas, negociación, revisión documental y acompañamiento hasta la firma. Nuestro compromiso es que cada cliente tome decisiones seguras, sin presión y con información clara.
            </p>
            <div className="about-stats">
              {[
                { num: "340+", label: "Operaciones cerradas" },
                { num: "11", label: "Comunas de cobertura" },
                { num: "98%", label: "Clientes que recomendarían" },
                { num: "2014", label: "Año de fundación" },
              ].map(({ num, label }) => (
                <div className="about-stat" key={label}>
                  <div className="about-stat-num">{num}</div>
                  <div className="about-stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="about-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80" alt="Equipo Marlo" />
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contacto" className="contact">
        <div className="section contact-inner">
          <div>
            <div className="eyebrow">Hablemos</div>
            <h2 className="section-title" style={{ marginTop: 16 }}>
              ¿Tienes una propiedad <em>o estás buscando una?</em>
            </h2>
            <p style={{ marginTop: 20, fontSize: 16, color: "var(--ink-2)", maxWidth: 480 }}>
              Cuéntanos qué necesitas y te respondemos en menos de 24 horas hábiles. Sin compromiso.
            </p>
            <div className="contact-info" style={{ marginTop: 36 }}>
              {[
                { k: "WhatsApp", v: "+56 9 7108 7515" },
                { k: "Email", v: "contacto@marlopropiedades.cl" },
                { k: "Oficina", v: "Santiago, Chile" },
              ].map(({ k, v }) => (
                <div className="contact-info-block" key={k}>
                  <div className="k">{k}</div>
                  <div className="v">{v}</div>
                </div>
              ))}
            </div>
          </div>
          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <label>
              <span className="eyebrow">Nombre</span>
              <input type="text" placeholder="Tu nombre completo" />
            </label>
            <label>
              <span className="eyebrow">Email</span>
              <input type="email" placeholder="tucorreo@ejemplo.cl" />
            </label>
            <label>
              <span className="eyebrow">Teléfono</span>
              <input type="tel" placeholder="+56 9 ..." />
            </label>
            <label>
              <span className="eyebrow">Te interesa</span>
              <select>
                <option>Comprar una propiedad</option>
                <option>Arrendar</option>
                <option>Vender o publicar mi propiedad</option>
                <option>Tasación gratuita</option>
              </select>
            </label>
            <label>
              <span className="eyebrow">Mensaje</span>
              <textarea placeholder="Cuéntanos en qué te podemos ayudar..." />
            </label>
            <button className="btn primary" type="submit" style={{ marginTop: 8, alignSelf: "flex-start", padding: "14px 32px" }}>
              Enviar consulta <IcArrow s={14} />
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div className="logo">
              <span className="logo-mark">Marlo<em>.</em></span>
              <span className="logo-sub">Propiedades</span>
            </div>
            <div className="footer-tagline" style={{ marginTop: 24 }}>
              Encontrar dónde vivir, <em>despacio.</em>
            </div>
          </div>
          <div className="footer-col">
            <h4>Propiedades</h4>
            <ul>
              <li><a onClick={scrollToProps} style={{ cursor: "pointer" }}>Venta</a></li>
              <li><a onClick={scrollToProps} style={{ cursor: "pointer" }}>Arriendo</a></li>
              <li><a onClick={scrollToProps} style={{ cursor: "pointer" }}>Destacadas</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Marlo</h4>
            <ul>
              <li><a onClick={() => document.getElementById("quienes")?.scrollIntoView({ behavior: "smooth" })} style={{ cursor: "pointer" }}>Quiénes somos</a></li>
              <li><a onClick={() => document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" })} style={{ cursor: "pointer" }}>Contacto</a></li>
              <li><a onClick={() => document.getElementById("credito")?.scrollIntoView({ behavior: "smooth" })} style={{ cursor: "pointer" }}>Simulador</a></li>
              <li><a href="/admin">Acceso corredores</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Términos</a></li>
              <li><a href="#">Privacidad</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Marlo Propiedades SpA · Santiago, Chile</span>
          <span>Hecho con cuidado</span>
        </div>
      </footer>

      {/* WHATSAPP FAB */}
      <a className="wsp-fab" href="https://wa.me/56971087515?text=Hola%20Marlo%2C%20tengo%20una%20consulta" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
        <span className="wsp-fab-tip">Escríbenos</span>
        <IcWsp s={26} />
      </a>

      {/* DETAIL MODAL */}
      {selected && (
        <PropertyDetail
          p={selected}
          onClose={() => setSelected(null)}
          fav={favs.includes(selected.id)}
          onFav={toggleFav}
        />
      )}
    </>
  );
}

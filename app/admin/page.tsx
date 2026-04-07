"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../src/lib/supabase";

interface Property {
  id: number; titulo: string; operacion: string; precio: number; tipo: string;
  dormitorios: number; banos: number; metros: number; comuna: string; ciudad: string;
  direccion: string; gastos_comunes: number; estacionamientos: number; bodega: string;
  destacado: boolean; imagenes: string; descripcion: string; etiquetas: string;
}

const emptyProp = { titulo:"", operacion:"venta", precio:0, tipo:"departamento", dormitorios:0, banos:0, metros:0, comuna:"", ciudad:"Santiago", direccion:"", gastos_comunes:0, estacionamientos:0, bodega:"No", destacado:false, imagenes:"", descripcion:"", etiquetas:"" };

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [form, setForm] = useState(emptyProp);
  const [editing, setEditing] = useState<number|null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) loadProperties();
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProperties = async () => {
    const { data } = await supabase.from("propiedades").select("*").order("created_at", { ascending: false });
    if (data) setProperties(data);
  };

  const handleLogin = async () => {
    setLoginError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setLoginError(error.message); return; }
    loadProperties();
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); };

  const handleSave = async () => {
    setLoading(true); setMsg("");
    if (editing) {
      const { error } = await supabase.from("propiedades").update(form).eq("id", editing);
      if (error) { setMsg("Error: " + error.message); } else { setMsg("Propiedad actualizada"); }
    } else {
      const { error } = await supabase.from("propiedades").insert([form]);
      if (error) { setMsg("Error: " + error.message); } else { setMsg("Propiedad agregada"); }
    }
    setForm(emptyProp); setEditing(null); setShowForm(false); setLoading(false);
    loadProperties();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta propiedad?")) return;
    await supabase.from("propiedades").delete().eq("id", id);
    loadProperties();
    setMsg("Propiedad eliminada");
  };

  const handleEdit = (p: Property) => {
    setForm({ titulo:p.titulo, operacion:p.operacion, precio:p.precio, tipo:p.tipo, dormitorios:p.dormitorios, banos:p.banos, metros:p.metros, comuna:p.comuna, ciudad:p.ciudad, direccion:p.direccion, gastos_comunes:p.gastos_comunes, estacionamientos:p.estacionamientos, bodega:p.bodega, destacado:p.destacado, imagenes:p.imagenes||"", descripcion:p.descripcion||"", etiquetas:p.etiquetas||"" });
    setEditing(p.id); setShowForm(true);
    window.scrollTo(0, 0);
  };

  const formatCLP = (n: number) => `$${n.toLocaleString("es-CL")}`;

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'DM Sans',sans-serif;background:#0f0f0f;color:#e0e0e0;min-height:100vh;}
    .admin-wrap{max-width:1200px;margin:0 auto;padding:24px;}
    .admin-header{display:flex;justify-content:space-between;align-items:center;padding:20px 0;border-bottom:1px solid rgba(200,164,90,0.2);margin-bottom:32px;}
    .admin-logo{font-size:24px;font-weight:700;color:#C8A45A;letter-spacing:3px;}
    .admin-logo span{font-size:12px;color:#666;letter-spacing:1px;display:block;font-weight:400;}
    .btn{padding:10px 24px;font-size:13px;font-weight:600;border:none;cursor:pointer;transition:all .3s;font-family:inherit;letter-spacing:1px;text-transform:uppercase;}
    .btn-gold{background:#C8A45A;color:#1A1A1A;}.btn-gold:hover{background:#E8D5A0;}
    .btn-red{background:#c15050;color:white;}.btn-red:hover{background:#d06060;}
    .btn-dark{background:#2D2D2D;color:#C8A45A;border:1px solid rgba(200,164,90,0.3);}.btn-dark:hover{background:#3D3D3D;}
    .btn-sm{padding:6px 14px;font-size:11px;}
    .login-box{max-width:400px;margin:120px auto;background:#1A1A1A;padding:48px;border:1px solid rgba(200,164,90,0.2);}
    .login-box h2{font-size:24px;color:#C8A45A;margin-bottom:8px;letter-spacing:2px;}
    .login-box p{color:#666;font-size:14px;margin-bottom:32px;}
    .login-box input{width:100%;padding:14px 18px;background:#0f0f0f;border:1px solid rgba(200,164,90,0.15);color:white;font-size:14px;font-family:inherit;margin-bottom:16px;outline:none;}
    .login-box input:focus{border-color:#C8A45A;}
    .error{color:#c15050;font-size:13px;margin-bottom:16px;}
    .msg{padding:12px 20px;margin-bottom:20px;font-size:14px;background:rgba(200,164,90,0.1);border:1px solid rgba(200,164,90,0.3);color:#C8A45A;}
    .toolbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:12px;}
    .toolbar h3{font-size:18px;color:#C8A45A;}
    .form-panel{background:#1A1A1A;padding:32px;border:1px solid rgba(200,164,90,0.2);margin-bottom:32px;}
    .form-panel h3{font-size:18px;color:#C8A45A;margin-bottom:24px;}
    .form-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;}
    @media(max-width:768px){.form-grid{grid-template-columns:1fr;}}
    .form-group{display:flex;flex-direction:column;gap:6px;}
    .form-group.full{grid-column:1/-1;}
    .form-group label{font-size:11px;color:#888;letter-spacing:1px;text-transform:uppercase;}
    .form-group input,.form-group select,.form-group textarea{padding:10px 14px;background:#0f0f0f;border:1px solid rgba(200,164,90,0.15);color:white;font-size:14px;font-family:inherit;outline:none;}
    .form-group input:focus,.form-group select:focus,.form-group textarea:focus{border-color:#C8A45A;}
    .form-group textarea{min-height:80px;resize:vertical;}
    .form-group select{appearance:auto;}
    .check-row{display:flex;align-items:center;gap:8px;padding-top:22px;}
    .check-row input[type="checkbox"]{width:18px;height:18px;accent-color:#C8A45A;}
    .form-actions{display:flex;gap:12px;margin-top:20px;}
    .prop-table{width:100%;border-collapse:collapse;}
    .prop-table th{text-align:left;padding:12px 16px;font-size:11px;color:#888;letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid rgba(200,164,90,0.2);}
    .prop-table td{padding:12px 16px;font-size:14px;border-bottom:1px solid rgba(255,255,255,0.05);}
    .prop-table tr:hover{background:rgba(200,164,90,0.05);}
    .prop-table .thumb{width:60px;height:40px;object-fit:cover;border:1px solid #333;}
    .badge{padding:3px 10px;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;}
    .badge.venta{background:#C8A45A;color:#1A1A1A;}
    .badge.arriendo{background:#3D6B5E;color:white;}
    .actions{display:flex;gap:8px;}
    .back-link{color:#666;font-size:13px;text-decoration:none;}.back-link:hover{color:#C8A45A;}
  `;

  if (!user) {
    return (
      <div>
        <style>{css}</style>
        <div className="login-box">
          <h2>MARLO ADMIN</h2>
          <p>Ingresa con tu cuenta para administrar propiedades</p>
          {loginError && <div className="error">{loginError}</div>}
          <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key==="Enter" && handleLogin()} />
          <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==="Enter" && handleLogin()} />
          <button className="btn btn-gold" style={{width:"100%"}} onClick={handleLogin}>Iniciar Sesión</button>
          <div style={{marginTop:24,textAlign:"center"}}><a href="/" className="back-link">← Volver al sitio</a></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>{css}</style>
      <div className="admin-wrap">
        <div className="admin-header">
          <div className="admin-logo">MARLO<span>Panel de Administración</span></div>
          <div style={{display:"flex",gap:16,alignItems:"center"}}>
            <a href="/" className="back-link">← Sitio web</a>
            <span style={{color:"#666",fontSize:13}}>{user.email}</span>
            <button className="btn btn-dark btn-sm" onClick={handleLogout}>Salir</button>
          </div>
        </div>

        {msg && <div className="msg">{msg}</div>}

        <div className="toolbar">
          <h3>{properties.length} Propiedades</h3>
          <button className="btn btn-gold" onClick={() => { setShowForm(!showForm); setForm(emptyProp); setEditing(null); }}>
            {showForm ? "Cancelar" : "+ Nueva Propiedad"}
          </button>
        </div>

        {showForm && (
          <div className="form-panel">
            <h3>{editing ? "Editar Propiedad" : "Nueva Propiedad"}</h3>
            <div className="form-grid">
              <div className="form-group full"><label>Título</label><input value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} placeholder="Ej: Departamento en Las Condes" /></div>
              <div className="form-group"><label>Operación</label><select value={form.operacion} onChange={e => setForm({...form, operacion: e.target.value})}><option value="venta">Venta</option><option value="arriendo">Arriendo</option></select></div>
              <div className="form-group"><label>Precio (CLP)</label><input type="number" value={form.precio} onChange={e => setForm({...form, precio: parseInt(e.target.value)||0})} /></div>
              <div className="form-group"><label>Tipo</label><select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}><option value="departamento">Departamento</option><option value="casa">Casa</option><option value="oficina">Oficina</option><option value="parcela">Parcela</option><option value="terreno">Terreno</option><option value="local">Local Comercial</option></select></div>
              <div className="form-group"><label>Dormitorios</label><input type="number" value={form.dormitorios} onChange={e => setForm({...form, dormitorios: parseInt(e.target.value)||0})} /></div>
              <div className="form-group"><label>Baños</label><input type="number" value={form.banos} onChange={e => setForm({...form, banos: parseInt(e.target.value)||0})} /></div>
              <div className="form-group"><label>Metros²</label><input type="number" value={form.metros} onChange={e => setForm({...form, metros: parseInt(e.target.value)||0})} /></div>
              <div className="form-group"><label>Comuna</label><input value={form.comuna} onChange={e => setForm({...form, comuna: e.target.value})} placeholder="Ej: Las Condes" /></div>
              <div className="form-group"><label>Ciudad</label><input value={form.ciudad} onChange={e => setForm({...form, ciudad: e.target.value})} /></div>
              <div className="form-group full"><label>Dirección</label><input value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} placeholder="Ej: Av. Apoquindo 4500" /></div>
              <div className="form-group"><label>Gastos Comunes</label><input type="number" value={form.gastos_comunes} onChange={e => setForm({...form, gastos_comunes: parseInt(e.target.value)||0})} /></div>
              <div className="form-group"><label>Estacionamientos</label><input type="number" value={form.estacionamientos} onChange={e => setForm({...form, estacionamientos: parseInt(e.target.value)||0})} /></div>
              <div className="form-group"><label>Bodega</label><select value={form.bodega} onChange={e => setForm({...form, bodega: e.target.value})}><option value="No">No</option><option value="Sí">Sí</option></select></div>
              <div className="form-group full"><label>URLs de Imágenes (separadas por ;)</label><input value={form.imagenes} onChange={e => setForm({...form, imagenes: e.target.value})} placeholder="https://imagen1.jpg;https://imagen2.jpg" /></div>
              <div className="form-group full"><label>Descripción</label><textarea value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="Descripción detallada de la propiedad..." /></div>
              <div className="form-group"><label>Etiquetas (separadas por ;)</label><input value={form.etiquetas} onChange={e => setForm({...form, etiquetas: e.target.value})} placeholder="piscina;gimnasio;vista" /></div>
              <div className="check-row"><input type="checkbox" checked={form.destacado} onChange={e => setForm({...form, destacado: e.target.checked})} /><label style={{color:"#C8A45A",fontSize:13}}>Propiedad Destacada</label></div>
            </div>
            <div className="form-actions">
              <button className="btn btn-gold" onClick={handleSave} disabled={loading || !form.titulo}>{loading ? "Guardando..." : editing ? "Actualizar" : "Agregar Propiedad"}</button>
              <button className="btn btn-dark" onClick={() => { setShowForm(false); setForm(emptyProp); setEditing(null); }}>Cancelar</button>
            </div>
          </div>
        )}

        <div style={{overflowX:"auto"}}>
          <table className="prop-table">
            <thead><tr><th>Foto</th><th>Título</th><th>Operación</th><th>Precio</th><th>Tipo</th><th>Comuna</th><th>Acciones</th></tr></thead>
            <tbody>
              {properties.map(p => {
                const img = (p.imagenes||"").split(";")[0];
                return (
                  <tr key={p.id}>
                    <td>{img ? <img className="thumb" src={img} alt="" /> : <div className="thumb" style={{background:"#222"}} />}</td>
                    <td style={{fontWeight:500}}>{p.titulo}{p.destacado && <span style={{color:"#C8A45A",marginLeft:8,fontSize:10}}>★</span>}</td>
                    <td><span className={`badge ${p.operacion}`}>{p.operacion}</span></td>
                    <td>{formatCLP(p.precio)}</td>
                    <td style={{textTransform:"capitalize"}}>{p.tipo}</td>
                    <td>{p.comuna}</td>
                    <td><div className="actions"><button className="btn btn-dark btn-sm" onClick={() => handleEdit(p)}>Editar</button><button className="btn btn-red btn-sm" onClick={() => handleDelete(p.id)}>Eliminar</button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {properties.length === 0 && <div style={{textAlign:"center",padding:60,color:"#666"}}>No hay propiedades. Agrega la primera.</div>}
      </div>
    </div>
  );
}

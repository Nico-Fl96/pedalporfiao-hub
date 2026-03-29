import React, { useState } from "react";
import ReactDOM from "react-dom/client";

const PILARES = [
  { id: "aventura", label: "Aventura", emoji: "🚵", color: "#1D9E75", bg: "#0a2e22" },
  { id: "tips", label: "Tips", emoji: "💡", color: "#EF9F27", bg: "#2e1f06" },
  { id: "humor", label: "Humor & Memes", emoji: "😂", color: "#D4537E", bg: "#2e0f1c" },
  { id: "actualidad", label: "Actualidad", emoji: "📰", color: "#378ADD", bg: "#0a1e35" },
  { id: "opinion", label: "Opinión", emoji: "💬", color: "#7F77DD", bg: "#1a1733" },
  { id: "motivacion", label: "Motivación", emoji: "🌄", color: "#F0997B", bg: "#2e1208" },
];
const FORMATOS = [
  { id: "video", label: "Video largo", emoji: "🎬" },
  { id: "reel", label: "Reel / TikTok", emoji: "🎵" },
  { id: "carrusel", label: "Carrusel", emoji: "🖼" },
  { id: "foto", label: "Foto estática", emoji: "📷" },
  { id: "story", label: "Story", emoji: "⚡" },
];
const PLATAFORMAS = ["TikTok", "Instagram", "Ambas"];
const ESTADOS = ["Idea", "Produciendo", "Listo", "Publicado"];
const ESTADO_COLORS = {
  "Idea":        { color: "#639922", bg: "#1a2a0a" },
  "Produciendo": { color: "#EF9F27", bg: "#2e1f06" },
  "Listo":       { color: "#378ADD", bg: "#0a1e35" },
  "Publicado":   { color: "#1D9E75", bg: "#0a2e22" },
};
const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const STORAGE_KEY = "pedalporfiao_v3";

const SYSTEM_GUION = `Eres el guionista oficial de @pedalporfiao, canal de ciclismo chileno.

IDENTIDAD DEL CANAL:
- Lema: "Sin cadencia perfecta ni piernas de acero. Solo porfiao."
- El creador va a puro músculo, nunca para aunque esté muerto, se mete a rutas difíciles sin experiencia
- Tono: irreverente, honesto, humor chileno natural. NUNCA corporativo ni forzado.
- Chilenismos bienvenidos (cabro, wena, chala, porfiao, etc). NUNCA argentinismos.
- Habla de igual a igual, nunca de experto a novato.
- El contenido debe sentirse real, no producido.

ESTRUCTURA GUIÓN VIDEO LARGO (60-90 seg):
🎬 GANCHO (0-3s): Texto en pantalla + voz en off. Frase que engancha de inmediato.
📍 CONTEXTO (4-12s): Voz en off o texto superpuesto. Prepara el escenario.
⚡ CONFLICTO (13-35s): Lo más crudo. El problema, el desafío, lo difícil.
🌄 CLÍMAX (36-50s): El momento donde todo valió la pena.
🏁 RESOLUCIÓN (51-65s): Llegada, aprendizaje, frase de identidad del canal.
📣 CTA (últimos 3-5s): Pregunta que invite a comentar.

ESTRUCTURA REEL / TIKTOK:
🎬 GANCHO (0-3s): Para el scroll. Frase + imagen impactante.
📺 DESARROLLO (4-45s): Contenido central. Storytelling.
📣 CTA (últimos 3-5s): Acción clara.

REGLAS:
- Empieza directo con el guion, sin saludos
- Cada sección: tiempo + voz en off + sugerencia de clip
- Caption con emojis y hashtags: #pedalporfiao #gravel #ciclismo #ciclistaschile
- Responde SOLO con JSON puro sin backticks:
  Video largo: {"tipo":"video","ficha":{"duracion":"...","objetivo":"..."},"secciones":[{"id":"gancho","emoji":"🎬","titulo":"Gancho","tiempo":"0-3s","voz":"...","imagen":"..."},{"id":"contexto","emoji":"📍","titulo":"Contexto","tiempo":"4-12s","voz":"...","imagen":"..."},{"id":"conflicto","emoji":"⚡","titulo":"Conflicto","tiempo":"13-35s","voz":"...","imagen":"..."},{"id":"climax","emoji":"🌄","titulo":"Clímax","tiempo":"36-50s","voz":"...","imagen":"..."},{"id":"resolucion","emoji":"🏁","titulo":"Resolución","tiempo":"51-65s","voz":"...","imagen":"..."},{"id":"cta","emoji":"📣","titulo":"CTA","tiempo":"últimos 3-5s","voz":"...","imagen":"..."}],"caption":"..."}
  Reel: {"tipo":"reel","ficha":{"duracion":"...","objetivo":"..."},"secciones":[{"id":"gancho","emoji":"🎬","titulo":"Gancho","tiempo":"0-3s","voz":"...","imagen":"..."},{"id":"desarrollo","emoji":"📺","titulo":"Desarrollo","tiempo":"4-45s","voz":"...","imagen":"..."},{"id":"cta","emoji":"📣","titulo":"CTA","tiempo":"últimos 3-5s","voz":"...","imagen":"..."}],"caption":"..."}`;

const ANTHROPIC_API_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY || "";

function getPilar(id) { return PILARES.find(p => p.id === id) || PILARES[0]; }
function getFormato(id) { return FORMATOS.find(f => f.id === id) || FORMATOS[0]; }
function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDow(y, m) { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; }

const darkInp = { width: "100%", boxSizing: "border-box", marginBottom: 12, padding: "8px 11px", border: "1px solid #2a2a2a", borderRadius: 8, fontSize: 13, background: "#0d0d0d", color: "#e0e0e0", outline: "none" };
const darkBtn = { cursor: "pointer", padding: "7px 14px", border: "1px solid #2a2a2a", borderRadius: 8, fontSize: 12, background: "transparent", color: "#aaa", display: "inline-flex", alignItems: "center", gap: 6, transition: "all .15s" };
const xBtn = { background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#555", lineHeight: 1, padding: 0 };
function L({ children }) { return <label style={{ display: "block", fontSize: 10, color: "#555", marginBottom: 5, letterSpacing: 1, textTransform: "uppercase" }}>{children}</label>; }

function PilarPicker({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
      {PILARES.map(p => (
        <button key={p.id} onClick={() => onChange(p.id)} style={{ padding: "4px 10px", borderRadius: 20, border: `1px solid ${value === p.id ? p.color : "#2a2a2a"}`, background: value === p.id ? p.bg : "transparent", color: value === p.id ? p.color : "#666", fontSize: 11, cursor: "pointer" }}>
          {p.emoji} {p.label}
        </button>
      ))}
    </div>
  );
}

function Modal({ onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
      <div style={{ background: "#141414", border: "1px solid #2a2a2a", borderRadius: 16, padding: "1.5rem", width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }}>
        {children}
      </div>
    </div>
  );
}

function GuionGenerator({ form, set }) {
  const esReel = form.formato === "reel";
  const [open, setOpen] = useState(false);
  const [ctx, setCtx] = useState({ tema: form.titulo || "", objetivo: "ganar seguidores + conexión emocional", duracion: esReel ? "30-60 segundos" : "60-90 segundos", cta: "Pregunta para comentar" });
  const [loading, setLoading] = useState(false);
  const [guion, setGuion] = useState(null);
  const [error, setError] = useState("");

  async function generar() {
    if (!ctx.tema.trim()) return;
    setLoading(true); setError(""); setGuion(null);
    try {
      const prompt = `Crea un guión ${esReel ? "de Reel/TikTok" : "de video largo"} para @pedalporfiao:\nTema: ${ctx.tema}\nObjetivo: ${ctx.objetivo}\nDuración: ${ctx.duracion}\nPilar: ${getPilar(form.pilar).label}\nCTA: ${ctx.cta}\nPlataforma: ${form.plataforma || "TikTok / Instagram"}`;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1500, system: SYSTEM_GUION, messages: [{ role: "user", content: prompt }] })
      });
      const data = await res.json();
      const txt = data.content.find(b => b.type === "text")?.text || "";
      const parsed = JSON.parse(txt.replace(/```json|```/g, "").trim());
      setGuion(parsed);
      if (parsed.caption) set("caption", parsed.caption);
    } catch { setError("Error al generar. Verifica tu API key en la configuración."); }
    setLoading(false);
  }

  function usarGuion() {
    if (!guion) return;
    const texto = guion.secciones.map(s => `${s.emoji} ${s.titulo.toUpperCase()} (${s.tiempo})\n${s.voz}\n↳ Imagen: ${s.imagen}`).join("\n\n");
    set("guion", texto);
    if (guion.caption) set("caption", guion.caption);
    setOpen(false);
  }

  const p = getPilar(form.pilar);

  return (
    <div style={{ marginBottom: 12 }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", padding: "10px 14px", background: open ? "#0d2a1d" : "#0d0d0d", border: `1px solid ${open ? "#1D9E75" : "#2a2a2a"}`, borderRadius: open ? "10px 10px 0 0" : 10, color: open ? "#1D9E75" : "#666", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span>✨</span><span style={{ fontWeight: 500 }}>Generador de guión IA</span></span>
        <span style={{ fontSize: 14, transform: open ? "rotate(-90deg)" : "rotate(90deg)", display: "inline-block" }}>›</span>
      </button>
      {open && (
        <div style={{ background: "#0a0a0a", border: "1px solid #1e1e1e", borderTop: "none", borderRadius: "0 0 10px 10px", padding: "16px 14px" }}>
          <div style={{ background: "#111", borderRadius: 8, padding: "10px 12px", marginBottom: 14, border: "1px solid #1e1e1e" }}>
            <p style={{ fontSize: 10, color: "#555", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 1 }}>Ficha técnica</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[["Tipo", esReel ? "Reel / TikTok" : "Video largo", "#aaa"], ["Plataforma", form.plataforma || "TikTok / IG", "#aaa"], ["Pilar", `${p.emoji} ${p.label}`, p.color], ["Tono", "Irreverente · Chileno", "#aaa"]].map(([k, v, c]) => (
                <div key={k}><p style={{ fontSize: 10, color: "#555", margin: "0 0 2px" }}>{k.toUpperCase()}</p><p style={{ fontSize: 12, color: c, margin: 0 }}>{v}</p></div>
              ))}
            </div>
          </div>
          <L>Tema del video</L>
          <input value={ctx.tema} onChange={e => setCtx(c => ({ ...c, tema: e.target.value }))} placeholder="Ej: mi primera subida a Farellones en gravel" style={darkInp} />
          <L>Objetivo</L>
          <select value={ctx.objetivo} onChange={e => setCtx(c => ({ ...c, objetivo: e.target.value }))} style={darkInp}>
            {["ganar seguidores + conexión emocional","educativo / informativo","entretenido / humor","inspiracional / motivación","generar comentarios"].map(o => <option key={o}>{o}</option>)}
          </select>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><L>Duración</L>
              <select value={ctx.duracion} onChange={e => setCtx(c => ({ ...c, duracion: e.target.value }))} style={darkInp}>
                {(esReel ? ["15-30 segundos","30-60 segundos","60 segundos"] : ["60-90 segundos","90-120 segundos","2-3 minutos"]).map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div><L>CTA deseado</L>
              <select value={ctx.cta} onChange={e => setCtx(c => ({ ...c, cta: e.target.value }))} style={darkInp}>
                {["Pregunta para comentar","Invitar a seguir","Pedir que guarden","Compartir experiencia","Visitar perfil"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <button onClick={generar} disabled={loading || !ctx.tema.trim()} style={{ ...darkBtn, width: "100%", justifyContent: "center", background: "#0d2a1d", borderColor: "#1D9E7566", color: "#1D9E75", padding: "9px 0", fontSize: 13, fontWeight: 500, opacity: !ctx.tema.trim() ? 0.4 : 1, marginBottom: guion ? 14 : 0 }}>
            {loading ? "Generando guión..." : "✨ Generar guión"}
          </button>
          {error && <p style={{ color: "#e24b4a", fontSize: 12, margin: "8px 0 0" }}>{error}</p>}
          {guion && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                <span style={{ background: "#0a1e35", color: "#378ADD", border: "1px solid #378ADD33", borderRadius: 20, padding: "3px 10px", fontSize: 11 }}>{guion.ficha?.duracion}</span>
                <span style={{ background: "#1a2a0a", color: "#639922", border: "1px solid #63992233", borderRadius: 20, padding: "3px 10px", fontSize: 11 }}>{guion.ficha?.objetivo}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {guion.secciones?.map(s => (
                  <div key={s.id} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 15 }}>{s.emoji}</span>
                      <span style={{ fontWeight: 500, fontSize: 13, color: "#fff" }}>{s.titulo}</span>
                      <span style={{ fontSize: 11, color: "#555", marginLeft: "auto" }}>{s.tiempo}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "#ccc", margin: "0 0 5px", lineHeight: 1.6 }}>{s.voz}</p>
                    <p style={{ fontSize: 11, color: "#555", margin: 0 }}>↳ {s.imagen}</p>
                  </div>
                ))}
              </div>
              {guion.caption && (
                <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 10, padding: "12px 14px", marginTop: 8 }}>
                  <p style={{ fontSize: 10, color: "#555", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 1 }}>Caption sugerido</p>
                  <p style={{ fontSize: 12, color: "#aaa", margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{guion.caption}</p>
                </div>
              )}
              <button onClick={usarGuion} style={{ ...darkBtn, width: "100%", justifyContent: "center", marginTop: 10, background: "#1a1a1a", borderColor: "#444", color: "#fff", padding: "9px 0", fontSize: 13 }}>
                Usar este guión →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ExtraFields({ formato, form, set }) {
  if (formato === "carrusel") return (
    <>
      <L>Número de slides</L>
      <input type="number" min="2" max="20" value={form.slides || ""} onChange={e => set("slides", e.target.value)} placeholder="Ej: 8" style={darkInp} />
      <L>Texto por slide (uno por línea)</L>
      <textarea value={form.slideTexts || ""} onChange={e => set("slideTexts", e.target.value)} placeholder={"Slide 1: título gancho\nSlide 2: punto 1\n..."} style={{ ...darkInp, minHeight: 90, resize: "vertical" }} />
      <L>Caption</L>
      <textarea value={form.caption || ""} onChange={e => set("caption", e.target.value)} style={{ ...darkInp, minHeight: 56, resize: "vertical" }} />
    </>
  );
  if (formato === "foto") return (
    <>
      <L>Descripción de la foto</L>
      <textarea value={form.descripcion || ""} onChange={e => set("descripcion", e.target.value)} style={{ ...darkInp, minHeight: 60, resize: "vertical" }} />
      <L>Caption</L>
      <textarea value={form.caption || ""} onChange={e => set("caption", e.target.value)} style={{ ...darkInp, minHeight: 56, resize: "vertical" }} />
    </>
  );
  if (formato === "story") return (
    <>
      <L>Tipo de story</L>
      <select value={form.storyTipo || "contenido"} onChange={e => set("storyTipo", e.target.value)} style={darkInp}>
        {["Contenido","Encuesta","Pregunta","Countdown","Link / swipe up","Repost"].map(t => <option key={t} value={t.toLowerCase()}>{t}</option>)}
      </select>
      <L>Duración (seg)</L>
      <input type="number" min="1" max="60" value={form.duracion || ""} onChange={e => set("duracion", e.target.value)} placeholder="15" style={darkInp} />
      <L>Texto / copy</L>
      <textarea value={form.caption || ""} onChange={e => set("caption", e.target.value)} style={{ ...darkInp, minHeight: 56, resize: "vertical" }} />
    </>
  );
  if (formato === "video" || formato === "reel") return (
    <>
      <GuionGenerator form={form} set={set} />
      <L>Guión / notas de producción</L>
      <textarea value={form.guion || ""} onChange={e => set("guion", e.target.value)} placeholder="El guión generado aparecerá aquí..." style={{ ...darkInp, minHeight: 72, resize: "vertical" }} />
      <L>Material grabado (clips)</L>
      <textarea value={form.clips || ""} onChange={e => set("clips", e.target.value)} placeholder="Clip 1: bajada Farellones..." style={{ ...darkInp, minHeight: 56, resize: "vertical" }} />
      {formato === "reel" && (<><L>Audio / canción</L><input value={form.audio || ""} onChange={e => set("audio", e.target.value)} placeholder="Nombre del audio o trend..." style={darkInp} /></>)}
    </>
  );
  return null;
}

function PostModal({ post, onClose, onSave, onDelete }) {
  const isNew = !post.id;
  const [form, setForm] = useState({ titulo: "", estado: "Idea", fecha: "", pilar: "aventura", formato: "reel", plataforma: "Instagram", referencias: "", notas: "", hashtags: "", ...post });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const fmt = getFormato(form.formato);
  return (
    <Modal onClose={onClose}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>{fmt.emoji}</span>
          <span style={{ fontWeight: 500, fontSize: 15, color: "#fff" }}>{isNew ? `Nuevo ${fmt.label}` : `Editar ${fmt.label}`}</span>
        </div>
        <button onClick={onClose} style={xBtn}>×</button>
      </div>
      <L>Formato</L>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {FORMATOS.map(f => (
          <button key={f.id} onClick={() => set("formato", f.id)} style={{ padding: "4px 10px", borderRadius: 20, border: `1px solid ${form.formato === f.id ? "#fff" : "#2a2a2a"}`, background: form.formato === f.id ? "#2a2a2a" : "transparent", color: form.formato === f.id ? "#fff" : "#555", fontSize: 11, cursor: "pointer" }}>
            {f.emoji} {f.label}
          </button>
        ))}
      </div>
      <L>Título</L>
      <input value={form.titulo} onChange={e => set("titulo", e.target.value)} placeholder="Título del contenido" style={darkInp} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div><L>Estado</L><select value={form.estado} onChange={e => set("estado", e.target.value)} style={darkInp}>{ESTADOS.map(e => <option key={e}>{e}</option>)}</select></div>
        <div><L>Fecha objetivo</L><input type="date" value={form.fecha} onChange={e => set("fecha", e.target.value)} style={darkInp} /></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div><L>Plataforma</L><select value={form.plataforma} onChange={e => set("plataforma", e.target.value)} style={darkInp}>{PLATAFORMAS.map(p => <option key={p}>{p}</option>)}</select></div>
        <div><L>Hashtags</L><input value={form.hashtags} onChange={e => set("hashtags", e.target.value)} placeholder="#pedalporfiao" style={darkInp} /></div>
      </div>
      <L>Pilar de contenido</L>
      <PilarPicker value={form.pilar} onChange={v => set("pilar", v)} />
      <ExtraFields formato={form.formato} form={form} set={set} />
      <L>Referencias</L>
      <textarea value={form.referencias} onChange={e => set("referencias", e.target.value)} style={{ ...darkInp, minHeight: 48, resize: "vertical" }} />
      <L>Notas sueltas</L>
      <textarea value={form.notas} onChange={e => set("notas", e.target.value)} style={{ ...darkInp, minHeight: 48, resize: "vertical" }} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, gap: 8 }}>
        {!isNew && <button onClick={() => onDelete(post.id)} style={{ ...darkBtn, color: "#e24b4a", borderColor: "#e24b4a33" }}>Eliminar</button>}
        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          <button onClick={onClose} style={darkBtn}>Cancelar</button>
          <button onClick={() => onSave({ ...form, id: form.id || Date.now() })} style={{ ...darkBtn, background: "#1a1a1a", borderColor: "#444", color: "#fff" }}>{isNew ? "Crear" : "Guardar"}</button>
        </div>
      </div>
    </Modal>
  );
}

function IdeasModal({ onClose }) {
  const [tema, setTema] = useState("");
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState([]);
  const [error, setError] = useState("");
  async function generar() {
    if (!tema.trim()) return;
    setLoading(true); setError(""); setIdeas([]);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: `Eres estratega de contenido para @pedalporfiao, canal ciclista chileno irreverente. Pilares: aventura, tips, humor, actualidad, opinion, motivacion. Formatos: video, reel, carrusel, foto, story. Responde SOLO con JSON puro sin backticks: [{"titulo":"...","pilar":"...","formato":"...","gancho":"...","estructura":"..."}]. Gancho máx 15 palabras. Estructura en 1 línea.`, messages: [{ role: "user", content: `5 ideas de contenido sobre: ${tema}` }] })
      });
      const data = await res.json();
      const txt = data.content.find(b => b.type === "text")?.text || "";
      setIdeas(JSON.parse(txt.replace(/```json|```/g, "").trim()));
    } catch { setError("Error al conectar."); }
    setLoading(false);
  }
  return (
    <Modal onClose={onClose}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ fontWeight: 500, fontSize: 15, color: "#fff" }}>Generador de ideas IA</span>
        <button onClick={onClose} style={xBtn}>×</button>
      </div>
      <L>¿Sobre qué quieres hacer contenido?</L>
      <input value={tema} onChange={e => setTema(e.target.value)} onKeyDown={e => e.key === "Enter" && generar()} placeholder="Ej: gravel largo, trucos para subir..." style={darkInp} />
      <button onClick={generar} disabled={loading || !tema.trim()} style={{ ...darkBtn, width: "100%", justifyContent: "center", background: "#1a1a1a", opacity: (!tema.trim() || loading) ? 0.4 : 1 }}>
        {loading ? "Generando..." : "Generar 5 ideas ↗"}
      </button>
      {error && <p style={{ color: "#e24b4a", fontSize: 12, marginTop: 8 }}>{error}</p>}
      {ideas.length > 0 && (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {ideas.map((idea, i) => {
            const p = getPilar(idea.pilar); const f = getFormato(idea.formato);
            return (
              <div key={i} style={{ background: "#0d0d0d", borderRadius: 10, padding: "12px 14px", border: `1px solid ${p.color}33` }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5 }}>
                  <span>{f.emoji}</span><span style={{ fontWeight: 500, fontSize: 13, color: "#fff" }}>{idea.titulo}</span>
                  <span style={{ fontSize: 10, color: "#555", marginLeft: "auto" }}>{f.label}</span>
                </div>
                <p style={{ fontSize: 12, color: p.color, margin: "0 0 3px" }}>"{idea.gancho}"</p>
                <p style={{ fontSize: 11, color: "#555", margin: 0 }}>{idea.estructura}</p>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

function ParrillaModal({ item, onClose, onSave, onDelete }) {
  const isNew = !item.id;
  const [form, setForm] = useState({ fecha: "", plataforma: "Instagram", formato: "reel", pilar: "aventura", titulo: "", hashtags: "", hora: "", notas: "", ...item });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <Modal onClose={onClose}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ fontWeight: 500, fontSize: 15, color: "#fff" }}>{isNew ? "Nueva publicación" : "Editar publicación"}</span>
        <button onClick={onClose} style={xBtn}>×</button>
      </div>
      <L>Título</L><input value={form.titulo} onChange={e => set("titulo", e.target.value)} placeholder="Ej: Meme lunes" style={darkInp} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div><L>Fecha</L><input type="date" value={form.fecha} onChange={e => set("fecha", e.target.value)} style={darkInp} /></div>
        <div><L>Hora</L><input type="time" value={form.hora} onChange={e => set("hora", e.target.value)} style={darkInp} /></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div><L>Plataforma</L><select value={form.plataforma} onChange={e => set("plataforma", e.target.value)} style={darkInp}>{PLATAFORMAS.map(p => <option key={p}>{p}</option>)}</select></div>
        <div><L>Formato</L><select value={form.formato} onChange={e => set("formato", e.target.value)} style={darkInp}>{FORMATOS.map(f => <option key={f.id} value={f.id}>{f.emoji} {f.label}</option>)}</select></div>
      </div>
      <L>Pilar</L><PilarPicker value={form.pilar} onChange={v => set("pilar", v)} />
      <L>Hashtags</L><input value={form.hashtags} onChange={e => set("hashtags", e.target.value)} placeholder="#pedalporfiao" style={darkInp} />
      <L>Notas</L><textarea value={form.notas} onChange={e => set("notas", e.target.value)} style={{ ...darkInp, minHeight: 48, resize: "vertical" }} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, gap: 8 }}>
        {!isNew && <button onClick={() => onDelete(item.id)} style={{ ...darkBtn, color: "#e24b4a", borderColor: "#e24b4a33" }}>Eliminar</button>}
        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          <button onClick={onClose} style={darkBtn}>Cancelar</button>
          <button onClick={() => onSave({ ...form, id: form.id || Date.now() })} style={{ ...darkBtn, background: "#1a1a1a", borderColor: "#444", color: "#fff" }}>{isNew ? "Agregar" : "Guardar"}</button>
        </div>
      </div>
    </Modal>
  );
}

function CalendarView({ parrilla, onDayClick, onItemClick }) {
  const now = new Date();
  const [year, setYear] = useState(Math.max(now.getFullYear(), 2026));
  const [month, setMonth] = useState(now.getFullYear() < 2026 ? 0 : now.getMonth());
  function prev() { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }
  function next() { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }
  const days = getDaysInMonth(year, month);
  const offset = getFirstDow(year, month);
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  function itemsForDay(d) { const k = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`; return parrilla.filter(p => p.fecha === k); }
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <button onClick={prev} style={{ ...darkBtn, padding: "6px 14px", fontSize: 16 }}>‹</button>
        <span style={{ fontWeight: 500, fontSize: 15, color: "#fff" }}>{MESES[month]} {year}</span>
        <button onClick={next} style={{ ...darkBtn, padding: "6px 14px", fontSize: 16 }}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0,1fr))", gap: 3, marginBottom: 3 }}>
        {["Lu","Ma","Mi","Ju","Vi","Sa","Do"].map(d => <div key={d} style={{ textAlign: "center", fontSize: 10, color: "#444", padding: "3px 0" }}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0,1fr))", gap: 3 }}>
        {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: days }).map((_, i) => {
          const d = i + 1; const k = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`; const items = itemsForDay(d); const isToday = k === todayStr;
          return (
            <div key={d} onClick={() => onDayClick(k)} style={{ background: isToday ? "#0d2a1d" : "#0d0d0d", border: `1px solid ${isToday ? "#1D9E75" : "#1e1e1e"}`, borderRadius: 7, minHeight: 68, padding: 5, cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#333"} onMouseLeave={e => e.currentTarget.style.borderColor = isToday ? "#1D9E75" : "#1e1e1e"}>
              <span style={{ fontSize: 10, color: isToday ? "#1D9E75" : "#444" }}>{d}</span>
              <div style={{ marginTop: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                {items.slice(0, 2).map(item => { const p = getPilar(item.pilar); const f = getFormato(item.formato); return (<div key={item.id} onClick={e => { e.stopPropagation(); onItemClick(item); }} style={{ background: p.bg, border: `1px solid ${p.color}44`, borderRadius: 3, padding: "2px 4px", fontSize: 9, color: p.color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer" }}>{f.emoji} {item.titulo || f.label}</div>); })}
                {items.length > 2 && <span style={{ fontSize: 9, color: "#444" }}>+{items.length - 2}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FormatoTab({ posts, onNew, onEdit, onCycle }) {
  const [filtro, setFiltro] = useState("todos");
  const vis = filtro === "todos" ? posts : posts.filter(p => p.formato === filtro);
  const counts = FORMATOS.reduce((a, f) => ({ ...a, [f.id]: posts.filter(p => p.formato === f.id).length }), {});
  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={() => setFiltro("todos")} style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${filtro === "todos" ? "#555" : "#222"}`, background: filtro === "todos" ? "#1e1e1e" : "transparent", color: filtro === "todos" ? "#fff" : "#555", fontSize: 12, cursor: "pointer" }}>Todos <span style={{ color: "#555", marginLeft: 4 }}>{posts.length}</span></button>
        {FORMATOS.map(f => (<button key={f.id} onClick={() => setFiltro(f.id)} style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${filtro === f.id ? "#555" : "#222"}`, background: filtro === f.id ? "#1e1e1e" : "transparent", color: filtro === f.id ? "#fff" : "#555", fontSize: 12, cursor: "pointer" }}>{f.emoji} {f.label} <span style={{ color: "#555", marginLeft: 4 }}>{counts[f.id] || 0}</span></button>))}
        <button onClick={() => onNew(filtro === "todos" ? "reel" : filtro)} style={{ marginLeft: "auto", ...darkBtn, background: "#1a1a1a", borderColor: "#444", color: "#fff", padding: "6px 16px" }}>+ Nuevo</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 8, marginBottom: 20 }}>
        {ESTADOS.map(e => { const c = ESTADO_COLORS[e]; return (<div key={e} style={{ background: c.bg, border: `1px solid ${c.color}33`, borderRadius: 10, padding: "10px 12px" }}><p style={{ fontSize: 9, color: c.color, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: 1 }}>{e}</p><p style={{ fontSize: 22, fontWeight: 500, margin: 0, color: "#fff" }}>{vis.filter(p => p.estado === e).length}</p></div>); })}
      </div>
      {vis.length === 0 ? <div style={{ textAlign: "center", padding: "3rem 0", color: "#333", fontSize: 14 }}>{posts.length === 0 ? "Sin contenido aún. Crea el primero." : "Sin contenido con ese filtro."}</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {vis.map(v => { const ec = ESTADO_COLORS[v.estado]; const p = getPilar(v.pilar); const f = getFormato(v.formato); return (
            <div key={v.id} style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 10, padding: "11px 14px", display: "flex", alignItems: "center", gap: 12 }} onMouseEnter={e => e.currentTarget.style.borderColor = "#2a2a2a"} onMouseLeave={e => e.currentTarget.style.borderColor = "#1e1e1e"}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{f.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 500, fontSize: 13, margin: "0 0 5px", color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.titulo || `(${f.label} sin título)`}</p>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ background: ec.bg, color: ec.color, border: `1px solid ${ec.color}33`, borderRadius: 20, padding: "1px 8px", fontSize: 10 }}>{v.estado}</span>
                  <span style={{ background: p.bg, color: p.color, border: `1px solid ${p.color}33`, borderRadius: 20, padding: "1px 8px", fontSize: 10 }}>{p.emoji} {p.label}</span>
                  <span style={{ fontSize: 10, color: "#444" }}>{v.plataforma}</span>
                  {v.fecha && <span style={{ fontSize: 10, color: "#444" }}>{v.fecha}</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                <button onClick={() => onCycle(v.id)} style={{ ...darkBtn, padding: "4px 10px", fontSize: 13 }}>→</button>
                <button onClick={() => onEdit(v)} style={{ ...darkBtn, padding: "4px 10px", fontSize: 12 }}>Editar</button>
              </div>
            </div>
          ); })}
        </div>
      )}
    </div>
  );
}

function PilaresView({ posts, parrilla }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 10 }}>
      {PILARES.map(p => {
        const ps = posts.filter(v => v.pilar === p.id); const pr = parrilla.filter(x => x.pilar === p.id);
        const fmtCount = FORMATOS.reduce((a, f) => ({ ...a, [f.id]: ps.filter(x => x.formato === f.id).length }), {});
        return (
          <div key={p.id} style={{ background: "#0d0d0d", border: `1px solid ${p.color}22`, borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><span style={{ fontSize: 18 }}>{p.emoji}</span><span style={{ fontWeight: 500, fontSize: 14, color: p.color }}>{p.label}</span></div>
            <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
              <div><p style={{ fontSize: 22, fontWeight: 500, color: "#fff", margin: 0 }}>{ps.length}</p><p style={{ fontSize: 10, color: "#444", margin: 0 }}>posts</p></div>
              <div><p style={{ fontSize: 22, fontWeight: 500, color: "#fff", margin: 0 }}>{pr.length}</p><p style={{ fontSize: 10, color: "#444", margin: 0 }}>parrilla</p></div>
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {FORMATOS.filter(f => fmtCount[f.id] > 0).map(f => (<span key={f.id} style={{ background: "#1a1a1a", color: "#666", borderRadius: 20, padding: "2px 8px", fontSize: 10 }}>{f.emoji} {fmtCount[f.id]}</span>))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const TABS = [{ id: "formato", label: "Formato de post" }, { id: "parrilla", label: "Parrilla" }, { id: "pilares", label: "Pilares" }];

function App() {
  const [tab, setTab] = useState("formato");
  const [data, setData] = useState(() => { try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : { posts: [], parrilla: [] }; } catch { return { posts: [], parrilla: [] }; } });
  const [postModal, setPostModal] = useState(null);
  const [parrillaModal, setParrillaModal] = useState(null);
  const [showIdeas, setShowIdeas] = useState(false);

  function save(d) { setData(d); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {} }
  function savePost(v) { const exists = data.posts.find(x => x.id === v.id); save({ ...data, posts: exists ? data.posts.map(x => x.id === v.id ? v : x) : [...data.posts, v] }); setPostModal(null); }
  function deletePost(id) { if (window.confirm("¿Eliminar?")) { save({ ...data, posts: data.posts.filter(x => x.id !== id) }); setPostModal(null); } }
  function cycleEstado(id) { save({ ...data, posts: data.posts.map(v => v.id === id ? { ...v, estado: ESTADOS[(ESTADOS.indexOf(v.estado) + 1) % ESTADOS.length] } : v) }); }
  function saveParrilla(item) { const exists = data.parrilla.find(x => x.id === item.id); save({ ...data, parrilla: exists ? data.parrilla.map(x => x.id === item.id ? item : x) : [...data.parrilla, item] }); setParrillaModal(null); }
  function deleteParrilla(id) { if (window.confirm("¿Eliminar?")) { save({ ...data, parrilla: data.parrilla.filter(x => x.id !== id) }); setParrillaModal(null); } }

  return (
    <div style={{ background: "#080808", minHeight: "100vh", padding: "1.5rem 1rem", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <p style={{ fontWeight: 500, fontSize: 22, margin: "0 0 3px", color: "#fff", letterSpacing: -0.5 }}>Pedal Porfiao 🚴</p>
            <p style={{ fontSize: 12, color: "#444", margin: 0 }}>Centro de mando de contenido</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <a href="https://new.express.adobe.com/home/tools/remove-background?_branch_match_id=1402255348264111243&_branch_referrer=H4sIAAAAAAAAA8soKSkottLXT0zJT0otLkgsyi7ILy7RSywo0MvJzMvWd8zL9ktxryjJ8E%2ByrytKTUstKsrMS49PKsovL04tsnXOKMrPTQUAeHiHJUUAAAA%3D" target="_blank" rel="noreferrer" style={{ ...darkBtn, borderColor: "#555", color: "#ccc", padding: "6px 12px", fontSize: 11, textDecoration: "none" }}>Quitar fondo ↗</a>
            <a href="https://podcast.adobe.com/en/enhance" target="_blank" rel="noreferrer" style={{ ...darkBtn, borderColor: "#555", color: "#ccc", padding: "6px 12px", fontSize: 11, textDecoration: "none" }}>Mejorar audio ↗</a>
            <button onClick={() => setShowIdeas(true)} style={{ ...darkBtn, borderColor: "#1D9E7566", color: "#1D9E75", padding: "7px 16px" }}>Ideas IA ↗</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 3, marginBottom: 28, background: "#0d0d0d", borderRadius: 10, padding: 4, border: "1px solid #1a1a1a" }}>
          {TABS.map(t => (<button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "8px 0", border: "none", borderRadius: 7, background: tab === t.id ? "#1e1e1e" : "transparent", color: tab === t.id ? "#fff" : "#444", fontSize: 12, cursor: "pointer", fontWeight: tab === t.id ? 500 : 400 }}>{t.label}</button>))}
        </div>
        {tab === "formato" && <FormatoTab posts={data.posts} onNew={fmt => setPostModal({ formato: fmt, titulo: "", estado: "Idea", fecha: "", pilar: "aventura", plataforma: "Instagram", referencias: "", notas: "", hashtags: "" })} onEdit={setPostModal} onCycle={cycleEstado} />}
        {tab === "parrilla" && (<div><div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}><button onClick={() => setParrillaModal({ fecha: "", plataforma: "Instagram", formato: "reel", pilar: "aventura", titulo: "", hashtags: "", hora: "", notas: "" })} style={{ ...darkBtn, background: "#1a1a1a", borderColor: "#444", color: "#fff" }}>+ Nueva publicación</button></div><CalendarView parrilla={data.parrilla} onDayClick={fecha => setParrillaModal({ fecha, plataforma: "Instagram", formato: "reel", pilar: "aventura", titulo: "", hashtags: "", hora: "", notas: "" })} onItemClick={setParrillaModal} /></div>)}
        {tab === "pilares" && <PilaresView posts={data.posts} parrilla={data.parrilla} />}
      </div>
      {postModal && <PostModal post={postModal} onClose={() => setPostModal(null)} onSave={savePost} onDelete={deletePost} />}
      {parrillaModal && <ParrillaModal item={parrillaModal} onClose={() => setParrillaModal(null)} onSave={saveParrilla} onDelete={deleteParrilla} />}
      {showIdeas && <IdeasModal onClose={() => setShowIdeas(false)} />}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

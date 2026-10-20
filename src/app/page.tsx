"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { Calendar, ChefHat, Coffee, QrCode, Star, Users } from "lucide-react";

const EVENTOS = [
  { icon: "🎓", label: "Defensa de Tesis" },
  { icon: "👶", label: "Baby Shower" },
  { icon: "🎂", label: "Cumpleaños" },
  { icon: "💼", label: "Reunión de Trabajo" },
  { icon: "💍", label: "Compromiso" },
  { icon: "🎊", label: "Evento Especial" },
];

const STATS = [
  { value: "56+", label: "Productos artesanales", icon: Coffee },
  { value: "3",   label: "Zonas del local",       icon: Users },
  { value: "20",  label: "Mesas disponibles",     icon: Star },
];

export default function HomePage() {
  const [reservaForm, setReservaForm] = useState({
    nombre: "", telefono: "", email: "",
    tipo_evento: "", fecha_evento: "", numero_personas: "",
    descripcion: ""
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReserva = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const { useSystemStore } = await import("@/store");
      useSystemStore.getState().addReserva({
        nombre_cliente: reservaForm.nombre,
        telefono: reservaForm.telefono,
        email: reservaForm.email,
        tipo_evento: reservaForm.tipo_evento,
        fecha_evento: reservaForm.fecha_evento || new Date().toISOString(),
        numero_personas: parseInt(reservaForm.numero_personas) || 1,
        descripcion: reservaForm.descripcion,
        estado: "pendiente",
      });

      const { supabase } = await import("@/lib/supabase");
      if (supabase) {
        await supabase.from("reservas").insert({
          ...reservaForm,
          numero_personas: parseInt(reservaForm.numero_personas) || 1,
          estado: "pendiente",
        });
      }
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const } } };

  return (
    <div style={{ minHeight: "100dvh", background: "var(--cream)" }}>

      {/* ── Navbar ── */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] as const }}
        className="glass"
        style={{
          position: "sticky", top: 0, zIndex: 30,
          padding: "0 24px",
          borderBottom: "1px solid var(--crumb-dark)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>🥐</span>
            <div>
              <div style={{ fontFamily: "Fraunces, serif", fontSize: "1.2rem", fontWeight: 700, color: "var(--espresso)", lineHeight: 1 }}>
                Dencker Pan
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--espresso-50)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Cafetería & Panadería
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <Link href="/mesero" className="btn btn-ghost btn-sm" style={{ color: "var(--espresso-50)" }}>
              🧑‍🍳 Mesero
            </Link>
            <Link href="/cocina" className="btn btn-ghost btn-sm" style={{ color: "var(--espresso-50)" }}>
              👨‍🍳 Cocina
            </Link>
            <Link href="/admin" className="btn btn-secondary btn-sm">
              ⚙️ Admin
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <section style={{
        background: "linear-gradient(135deg, var(--espresso) 0%, #3D2A1F 50%, #5C3D1E 100%)",
        padding: "80px 24px 100px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{ position:"absolute", top:-100, right:-100, width:400, height:400, borderRadius:"50%", background:"rgba(217,119,6,0.1)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-80, left:-80, width:300, height:300, borderRadius:"50%", background:"rgba(217,119,6,0.08)", pointerEvents:"none" }} />

        <motion.div
          variants={container} initial="hidden" animate="show"
          style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative" }}
        >
          <motion.div variants={item} style={{ fontSize: 72, marginBottom: 16 }}>🥐</motion.div>
          <motion.h1
            variants={item}
            style={{ fontFamily: "Fraunces, serif", fontSize: "clamp(2.5rem,6vw,4rem)", fontWeight: 700, color: "white", lineHeight: 1.15, marginBottom: 20 }}
          >
            El sabor artesanal que{" "}
            <span style={{ color: "var(--crust-light)", fontStyle: "italic" }}>enamora</span>
          </motion.h1>
          <motion.p
            variants={item}
            style={{ fontSize: "1.15rem", color: "rgba(255,255,255,0.7)", marginBottom: 40, maxWidth: 500, margin: "0 auto 40px" }}
          >
            Panes recién horneados, cafés de especialidad y pastelería artesanal. Escanea el QR de tu mesa para pedir.
          </motion.p>
          <motion.div variants={item} style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/mesa/1" className="btn btn-primary btn-lg">
              <QrCode size={20} /> Ver Menú Digital
            </Link>
            <a href="#reservas" className="btn btn-lg" style={{ background:"rgba(255,255,255,0.15)", color:"white", border:"1.5px solid rgba(255,255,255,0.3)" }}>
              <Calendar size={20} /> Reservar Evento
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <section style={{ padding: "48px 24px", background: "var(--crumb)", borderBottom: "1px solid var(--crumb-dark)" }}>
        <motion.div
          variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}
          style={{ maxWidth: 800, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 24 }}
        >
          {STATS.map((s) => (
            <motion.div key={s.label} variants={item} className="card" style={{ padding: 24, textAlign: "center" }}>
              <s.icon size={32} style={{ color: "var(--crust)", margin: "0 auto 12px" }} />
              <div style={{ fontFamily: "Fraunces, serif", fontSize: "2.5rem", fontWeight: 700, color: "var(--espresso)", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: "0.85rem", color: "var(--espresso-50)", marginTop: 6 }}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Admin Quick Access ── */}
      <section style={{ padding: "64px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5 }}>
            <h2 style={{ fontFamily:"Fraunces,serif", fontSize:"1.8rem", color:"var(--espresso)", marginBottom:8 }}>
              Panel de Operaciones
            </h2>
            <p style={{ color:"var(--espresso-50)", marginBottom:32 }}>Acceso rápido a todos los módulos del sistema</p>
          </motion.div>
          <motion.div
            variants={container} initial="hidden" whileInView="show" viewport={{ once:true }}
            style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:16 }}
          >
            {[
              { href:"/admin",          icon:"⚙️",  label:"Panel Admin",     desc:"Mesas, Menú ImgBB, Reportes", color:"var(--espresso)" },
              { href:"/mesero",         icon:"👔",  label:"Panel Mesero",    desc:"Mapa de sala y alertas",     color:"var(--crust-dark)" },
              { href:"/kds",            icon:"👨‍🍳", label:"KDS Cocina",      desc:"Estaciones y timers en vivo", color:"var(--red-alert)" },
              { href:"/caja",           icon:"💰",  label:"Caja & POS",      desc:"Cobros Bs, QR Simple y Arqueo", color:"var(--cocoa)" },
              { href:"/mesa/1",         icon:"📱",  label:"Menú QR Mesa 1",  desc:"Experiencia cliente móvil",  color:"var(--blue-info)" },
              { href:"/mesa/3",         icon:"☕",  label:"Menú QR Mesa 3",  desc:"Comanda activa en vivo",     color:"var(--green-ok)" },
              { href:"#reservas",       icon:"🎊",  label:"Reservas Catering",desc:"Eventos y paquetes dulces",  color:"var(--crust)" },
            ].map((m) => (
              <motion.div key={m.href} variants={item}>
                <Link href={m.href} style={{ textDecoration:"none" }}>
                  <motion.div
                    whileHover={{ y:-4, boxShadow:"var(--shadow-lg)" }}
                    whileTap={{ scale:0.97 }}
                    transition={{ type:"spring", stiffness:400, damping:20 }}
                    className="card"
                    style={{ padding:20, cursor:"pointer" }}
                  >
                    <div style={{ fontSize:32, marginBottom:10 }}>{m.icon}</div>
                    <div style={{ fontWeight:700, color:"var(--espresso)", marginBottom:4 }}>{m.label}</div>
                    <div style={{ fontSize:"0.8rem", color:"var(--espresso-50)" }}>{m.desc}</div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Reservas / Catering ── */}
      <section id="reservas" style={{ padding:"64px 24px", background:"var(--espresso)" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5 }} style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🎊</div>
            <h2 style={{ fontFamily:"Fraunces,serif", fontSize:"2rem", color:"white", marginBottom:12 }}>
              Pedidos Anticipados & Catering
            </h2>
            <p style={{ color:"rgba(255,255,255,0.6)", maxWidth:500, margin:"0 auto" }}>
              Reserva con 24-48h de anticipación para eventos especiales. Garantizamos stock fresco y producción programada.
            </p>
          </motion.div>

          {/* Tipo de eventos */}
          <motion.div
            variants={container} initial="hidden" whileInView="show" viewport={{ once:true }}
            style={{ display:"flex", flexWrap:"wrap", gap:10, justifyContent:"center", marginBottom:40 }}
          >
            {EVENTOS.map((e) => (
              <motion.div key={e.label} variants={item}
                style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 18px", borderRadius:"var(--r-full)", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", color:"white", fontSize:"0.9rem" }}
              >
                <span>{e.icon}</span> {e.label}
              </motion.div>
            ))}
          </motion.div>

          {/* Formulario */}
          {sent ? (
            <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ type:"spring" }}
              className="card" style={{ padding:40, textAlign:"center" }}
            >
              <div style={{ fontSize:56, marginBottom:16 }}>✅</div>
              <h3 style={{ fontFamily:"Fraunces,serif", fontSize:"1.5rem", color:"var(--espresso)", marginBottom:8 }}>¡Reserva enviada!</h3>
              <p style={{ color:"var(--espresso-50)" }}>Nos comunicaremos contigo en menos de 2 horas para confirmar.</p>
              <button className="btn btn-primary" style={{ marginTop:20 }} onClick={() => setSent(false)}>Hacer otra reserva</button>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
              className="card" style={{ padding:32 }}
              onSubmit={handleReserva}
            >
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:16 }}>
                <div>
                  <label style={{ display:"block", fontSize:"0.8rem", fontWeight:600, color:"var(--espresso-50)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>Nombre completo *</label>
                  <input className="input" placeholder="Tu nombre" required
                    value={reservaForm.nombre} onChange={e => setReservaForm(p=>({...p,nombre:e.target.value}))} />
                </div>
                <div>
                  <label style={{ display:"block", fontSize:"0.8rem", fontWeight:600, color:"var(--espresso-50)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>Teléfono / WhatsApp</label>
                  <input className="input" placeholder="+591 7xx xxxxx"
                    value={reservaForm.telefono} onChange={e => setReservaForm(p=>({...p,telefono:e.target.value}))} />
                </div>
                <div>
                  <label style={{ display:"block", fontSize:"0.8rem", fontWeight:600, color:"var(--espresso-50)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>Tipo de evento *</label>
                  <select className="input" required value={reservaForm.tipo_evento} onChange={e => setReservaForm(p=>({...p,tipo_evento:e.target.value}))}>
                    <option value="">Seleccionar...</option>
                    {EVENTOS.map(e => <option key={e.label} value={e.label}>{e.icon} {e.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:"block", fontSize:"0.8rem", fontWeight:600, color:"var(--espresso-50)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>Fecha del evento *</label>
                  <input className="input" type="datetime-local" required
                    value={reservaForm.fecha_evento} onChange={e => setReservaForm(p=>({...p,fecha_evento:e.target.value}))} />
                </div>
                <div>
                  <label style={{ display:"block", fontSize:"0.8rem", fontWeight:600, color:"var(--espresso-50)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>N° de personas</label>
                  <input className="input" type="number" min="1" placeholder="10"
                    value={reservaForm.numero_personas} onChange={e => setReservaForm(p=>({...p,numero_personas:e.target.value}))} />
                </div>
                <div>
                  <label style={{ display:"block", fontSize:"0.8rem", fontWeight:600, color:"var(--espresso-50)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>Email</label>
                  <input className="input" type="email" placeholder="email@ejemplo.com"
                    value={reservaForm.email} onChange={e => setReservaForm(p=>({...p,email:e.target.value}))} />
                </div>
              </div>
              <div style={{ marginTop:16 }}>
                <label style={{ display:"block", fontSize:"0.8rem", fontWeight:600, color:"var(--espresso-50)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>Descripción del pedido</label>
                <textarea className="input" rows={3} placeholder="Describe qué necesitas: panes, pasteles, cantidad, ocasión especial..."
                  value={reservaForm.descripcion} onChange={e => setReservaForm(p=>({...p,descripcion:e.target.value}))}
                  style={{ resize:"vertical" }} />
              </div>
              <div style={{ marginTop:24, display:"flex", justifyContent:"flex-end" }}>
                <motion.button whileTap={{ scale:0.96 }} type="submit" className="btn btn-primary btn-lg" disabled={sending}>
                  {sending ? <><div className="spinner" style={{ borderColor:"rgba(255,255,255,0.3)", borderTopColor:"white" }} /> Enviando...</> : <><Calendar size={18} /> Solicitar Reserva</>}
                </motion.button>
              </div>
            </motion.form>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background:"var(--espresso-80)", color:"rgba(255,255,255,0.5)", padding:"32px 24px", textAlign:"center" }}>
        <div style={{ fontSize:24, marginBottom:8 }}>🥐</div>
        <div style={{ fontFamily:"Fraunces,serif", color:"rgba(255,255,255,0.8)", marginBottom:4 }}>Dencker Pan</div>
        <div style={{ fontSize:"0.8rem" }}>Cafetería & Panadería · Cochabamba, Bolivia</div>
        <div className="divider" style={{ maxWidth:200, margin:"16px auto" }} />
        <div style={{ fontSize:"0.75rem", display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap" }}>
          <Link href="/admin" style={{ color:"inherit" }}>Admin</Link>
          <Link href="/mesero" style={{ color:"inherit" }}>Mesero</Link>
          <Link href="/cocina" style={{ color:"inherit" }}>Cocina</Link>
          <Link href="/admin/croquis" style={{ color:"inherit" }}>Croquis</Link>
        </div>
      </footer>
    </div>
  );
}

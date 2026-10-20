"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Bell, Search, ChevronDown, X, Plus, Minus, Check, ArrowLeft, Clock } from "lucide-react";
import { Producto, Categoria, CartItem, ItemPedido } from "@/types";
import { useCartStore, useUIStore } from "@/store";
import { SEED_CATEGORIAS, SEED_PRODUCTOS } from "@/lib/seed-data";
import { supabase } from "@/lib/supabase";

interface PageProps { params: Promise<{ numero: string }> }

type EstadoPedido = 'pendiente' | 'en_preparacion' | 'listo' | 'entregado' | 'pagado';

const ESTADO_LABELS: Record<EstadoPedido, { label: string; pct: number; color: string }> = {
  pendiente:      { label: "Pedido recibido",    pct: 20,  color: "var(--espresso-30)" },
  en_preparacion: { label: "En preparación 👨‍🍳",  pct: 60,  color: "var(--crust)" },
  listo:          { label: "¡Listo para servir! ✅", pct: 90, color: "var(--green-ok)" },
  entregado:      { label: "Entregado 🎉",        pct: 100, color: "var(--green-ok)" },
  pagado:         { label: "Pagado ✓",            pct: 100, color: "var(--espresso-50)" },
};

export default function MesaPage({ params }: PageProps) {
  const [numero, setNumero] = useState<string>("1");
  const [categorias, setCategorias] = useState<Categoria[]>(SEED_CATEGORIAS);
  const [productos, setProductos] = useState<Producto[]>(SEED_PRODUCTOS);
  const [categoriaActiva, setCategoriaActiva] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [mesaId, setMesaId] = useState<string | null>(null);
  const [pedidoEstado, setPedidoEstado] = useState<EstadoPedido | null>(null);
  const [pedidoItems, setPedidoItems] = useState<ItemPedido[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [llamandoMesero, setLlamandoMesero] = useState(false);
  const [productoModal, setProductoModal] = useState<Producto | null>(null);
  const [chipsSeleccionados, setChipsSeleccionados] = useState<string[]>([]);
  const [notaProducto, setNotaProducto] = useState("");
  const [showPayment, setShowPayment] = useState(false);

  const { items, addItem, removeItem, updateCantidad, clearCart, setMesa, setPedidoId, total, count, pedidoId } = useCartStore();
  const { cartOpen, setCartOpen } = useUIStore();

  useEffect(() => {
    params.then(p => {
      setNumero(p.numero);
      setMesa(parseInt(p.numero));
    });
  }, [params, setMesa]);

  useEffect(() => {
    async function load() {
      if (!supabase) return;
      const { data: cats } = await supabase.from("categorias").select("*").eq("activa", true).order("orden");
      if (cats?.length) setCategorias(cats);
      const { data: prods } = await supabase.from("productos").select("*, categoria:categorias(*)").eq("disponible", true).order("nombre");
      if (prods?.length) setProductos(prods);
      const { data: mesa } = await supabase.from("mesas").select("id").eq("numero", parseInt(numero)).single();
      if (mesa) setMesaId(mesa.id);
    }
    load();
  }, [numero]);

  // Realtime orden tracker
  useEffect(() => {
    const client = supabase;
    if (!pedidoId || !client) return;
    const channel = client.channel(`pedido-${pedidoId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "pedidos", filter: `id=eq.${pedidoId}` },
        (p) => setPedidoEstado(p.new.estado as EstadoPedido)
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "items_pedido", filter: `pedido_id=eq.${pedidoId}` },
        async () => {
          const { data } = await client.from("items_pedido").select("*").eq("pedido_id", pedidoId);
          if (data) setPedidoItems(data);
        }
      )
      .subscribe();
    return () => { client.removeChannel(channel); };
  }, [pedidoId]);

  const productosFiltrados = useCallback(() => {
    let lista = productos;
    if (categoriaActiva === "mas_vendidos") lista = lista.filter(p => p.es_mas_vendido);
    else if (categoriaActiva !== "todos") lista = lista.filter(p => p.categoria_id === categoriaActiva);
    if (busqueda) lista = lista.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()));
    return lista;
  }, [productos, categoriaActiva, busqueda]);

  // Upselling: si hay panes en el carrito, sugerir café
  const tieneProductosDePan = items.some(i => ["c3","c4","c5"].includes(i.producto.categoria_id || ""));
  const tieneCAfe = items.some(i => ["c1","c2"].includes(i.producto.categoria_id || ""));
  const mostrarUpsell = tieneProductosDePan && !tieneCAfe && items.length > 0;

  const llamarMesero = async () => {
    setLlamandoMesero(true);
    try {
      if (supabase && mesaId) {
        await supabase.from("alertas_mesero").insert({
          mesa_id: mesaId, mesa_numero: parseInt(numero),
          tipo: "llamado", mensaje: `Mesa ${numero} solicita atención`,
        });
      }
      setTimeout(() => setLlamandoMesero(false), 3000);
    } catch { setLlamandoMesero(false); }
  };

  const confirmarPedido = async () => {
    if (!items.length) return;
    setSubmitting(true);
    try {
      let newPedidoId = pedidoId;

      if (supabase) {
        const pedidoPayload = {
          mesa_id: mesaId, mesa_numero: parseInt(numero),
          estado: "pendiente", total: total(),
        };
        if (!newPedidoId) {
          const { data: pedido } = await supabase.from("pedidos").insert(pedidoPayload).select().single();
          newPedidoId = pedido?.id;
          if (newPedidoId) setPedidoId(newPedidoId);
        }
        if (newPedidoId) {
          const itemsPayload = items.map(i => ({
            pedido_id: newPedidoId, producto_id: i.producto.id,
            producto_nombre: i.producto.nombre, cantidad: i.cantidad,
            precio_unitario: i.producto.precio, subtotal: i.cantidad * i.producto.precio,
            chips_seleccionados: i.chips_seleccionados, notas: i.notas,
            estacion: i.producto.estacion, estado: "pendiente",
          }));
          await supabase.from("items_pedido").insert(itemsPayload);
          await supabase.from("mesas").update({ estado: "ocupada" }).eq("id", mesaId);
          setPedidoEstado("pendiente");
        }
      } else {
        // Demo mode
        newPedidoId = `demo-${Date.now()}`;
        setPedidoId(newPedidoId);
        setPedidoEstado("pendiente");
      }
      clearCart();
      setCartOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const abrirModal = (producto: Producto) => {
    setProductoModal(producto);
    setChipsSeleccionados([]);
    setNotaProducto("");
  };

  const agregarAlCarrito = () => {
    if (!productoModal) return;
    addItem(productoModal, chipsSeleccionados, notaProducto || undefined);
    setProductoModal(null);
  };

  const itemEnCarrito = (id: string) => items.find(i => i.producto.id === id);

  const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.06 } } };
  const fadeUp = { hidden:{ opacity:0, y:16 }, show:{ opacity:1, y:0, transition:{ duration:0.4, ease:[0.4, 0, 0.2, 1] as const } } };

  return (
    <div style={{ background:"var(--cream)", minHeight:"100dvh", paddingBottom: 120 }}>

      {/* ── Header ── */}
      <motion.header
        initial={{ y:-60, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ duration:0.4 }}
        style={{ background:"var(--espresso)", padding:"0 16px", position:"sticky", top:0, zIndex:20 }}
      >
        <div style={{ maxWidth:640, margin:"0 auto", height:58, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:24 }}>🥐</span>
            <div>
              <div style={{ fontFamily:"Fraunces,serif", color:"white", fontWeight:700, fontSize:"1rem", lineHeight:1 }}>Dencker Pan</div>
              <div style={{ color:"rgba(255,255,255,0.6)", fontSize:"0.72rem", letterSpacing:"0.05em" }}>Mesa {numero}</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <motion.button
              whileTap={{ scale:0.95 }}
              onClick={llamarMesero}
              className="btn btn-sm"
              style={{ background: llamandoMesero ? "var(--green-ok)" : "rgba(255,255,255,0.15)", color:"white", border:"1px solid rgba(255,255,255,0.25)" }}
            >
              <Bell size={16} /> {llamandoMesero ? "¡Llamando!" : "Mesero"}
            </motion.button>
            <motion.button
              whileTap={{ scale:0.95 }}
              onClick={() => setCartOpen(true)}
              className="btn btn-sm"
              style={{ background:"var(--crust)", color:"white", position:"relative" }}
            >
              <ShoppingCart size={16} />
              {count() > 0 && (
                <motion.span
                  initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:"spring", stiffness:500 }}
                  style={{ position:"absolute", top:-6, right:-6, background:"white", color:"var(--espresso)", width:18, height:18, borderRadius:"50%", fontSize:"0.65rem", fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }}
                >
                  {count()}
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div style={{ maxWidth:640, margin:"0 auto", padding:"16px 16px 0" }}>

        {/* ── Live Order Tracker ── */}
        <AnimatePresence>
          {pedidoEstado && (
            <motion.div
              initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }}
              transition={{ duration:0.3 }}
              className="card"
              style={{ padding:"16px 20px", marginBottom:16, overflow:"hidden" }}
            >
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div style={{ fontWeight:700, color:"var(--espresso)", fontSize:"0.9rem", display:"flex", alignItems:"center", gap:8 }}>
                  <Clock size={16} style={{ color:"var(--crust)" }} />
                  Estado de tu pedido
                </div>
                <span style={{ fontSize:"0.8rem", color:ESTADO_LABELS[pedidoEstado].color, fontWeight:700 }}>
                  {ESTADO_LABELS[pedidoEstado].label}
                </span>
              </div>
              <div style={{ height:6, background:"var(--crumb-dark)", borderRadius:99, overflow:"hidden" }}>
                <motion.div
                  animate={{ width:`${ESTADO_LABELS[pedidoEstado].pct}%` }}
                  transition={{ duration:0.8, ease:[0.4, 0, 0.2, 1] as const }}
                  style={{ height:"100%", background:`linear-gradient(90deg, var(--crust), var(--crust-light))`, borderRadius:99 }}
                />
              </div>
              {pedidoEstado !== "pagado" && (
                <div style={{ display:"flex", gap:8, marginTop:12 }}>
                  <motion.button whileTap={{ scale:0.96 }} className="btn btn-secondary btn-sm" onClick={() => setCartOpen(true)}>
                    ➕ Pedir otra ronda
                  </motion.button>
                  <motion.button whileTap={{ scale:0.96 }} className="btn btn-sm" style={{ background:"var(--crust-soft)", color:"var(--crust-dark)", fontWeight:700 }}
                    onClick={() => setShowPayment(true)}>
                    💳 Pagar cuenta
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Buscador ── */}
        <div style={{ position:"relative", marginBottom:12 }}>
          <Search size={16} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"var(--espresso-30)" }} />
          <input className="input" placeholder="Buscar en el menú..." style={{ paddingLeft:38 }}
            value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        </div>

        {/* ── Categorías ── */}
        <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:8, scrollbarWidth:"none", marginBottom:16 }}>
          {[
            { id:"todos", nombre:"Todos", emoji:"🍽️" },
            { id:"mas_vendidos", nombre:"Más vendidos", emoji:"⭐" },
            ...categorias,
          ].map(cat => (
            <motion.button
              key={cat.id}
              whileTap={{ scale:0.95 }}
              onClick={() => setCategoriaActiva(cat.id)}
              className={`chip ${categoriaActiva === cat.id ? "chip-active" : ""}`}
              style={{ flexShrink:0, fontSize:"0.78rem" }}
            >
              {cat.emoji} {cat.nombre}
            </motion.button>
          ))}
        </div>

        {/* ── Upsell Banner ── */}
        <AnimatePresence>
          {mostrarUpsell && (
            <motion.div
              initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
              className="card-warm"
              style={{ padding:"12px 16px", marginBottom:16, display:"flex", alignItems:"center", gap:12, borderLeft:"3px solid var(--crust)" }}
            >
              <span style={{ fontSize:24 }}>☕</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:"0.85rem", color:"var(--espresso)" }}>¿Un café con eso?</div>
                <div style={{ fontSize:"0.75rem", color:"var(--espresso-50)" }}>Los panes saben mejor acompañados</div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setCategoriaActiva("c1")}>Ver Cafés</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Grid de Productos ── */}
        <motion.div
          key={categoriaActiva + busqueda}
          variants={stagger} initial="hidden" animate="show"
          style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}
        >
          {productosFiltrados().map(prod => {
            const enCarrito = itemEnCarrito(prod.id);
            return (
              <motion.div
                key={prod.id} variants={fadeUp}
                className="card"
                style={{ overflow:"hidden", cursor:"pointer" }}
                onClick={() => abrirModal(prod)}
                whileHover={{ y:-2, boxShadow:"var(--shadow-lg)" }}
                whileTap={{ scale:0.98 }}
                transition={{ type:"spring", stiffness:400, damping:20 }}
              >
                {/* Imagen placeholder */}
                <div style={{ height:96, background:`linear-gradient(135deg, var(--crumb) 0%, var(--crumb-dark) 100%)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, position:"relative" }}>
                  {categorias.find(c => c.id === prod.categoria_id)?.emoji || "🍞"}
                  {prod.es_mas_vendido && (
                    <span style={{ position:"absolute", top:6, right:6, background:"var(--crust)", color:"white", borderRadius:"var(--r-full)", padding:"2px 7px", fontSize:"0.62rem", fontWeight:800, letterSpacing:"0.05em" }}>
                      ⭐ TOP
                    </span>
                  )}
                  {enCarrito && (
                    <div style={{ position:"absolute", bottom:6, right:6, background:"var(--espresso)", color:"white", borderRadius:"var(--r-full)", width:22, height:22, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.7rem", fontWeight:800 }}>
                      {enCarrito.cantidad}
                    </div>
                  )}
                </div>
                <div style={{ padding:"10px 12px 12px" }}>
                  <div style={{ fontWeight:700, fontSize:"0.82rem", color:"var(--espresso)", marginBottom:2, lineHeight:1.3 }}>{prod.nombre}</div>
                  {prod.descripcion && (
                    <div style={{ fontSize:"0.7rem", color:"var(--espresso-50)", marginBottom:6, lineHeight:1.4, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                      {prod.descripcion}
                    </div>
                  )}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span className="price" style={{ fontSize:"0.95rem" }}>Bs {prod.precio.toFixed(2)}</span>
                    <motion.button
                      whileTap={{ scale:0.9 }}
                      className="btn btn-primary btn-sm"
                      style={{ padding:"5px 10px", fontSize:"0.75rem" }}
                      onClick={e => { e.stopPropagation(); abrirModal(prod); }}
                    >
                      <Plus size={14} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {productosFiltrados().length === 0 && (
          <div style={{ textAlign:"center", padding:"48px 24px", color:"var(--espresso-50)" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
            <div style={{ fontWeight:600 }}>No encontramos resultados</div>
            <div style={{ fontSize:"0.85rem", marginTop:6 }}>Intenta con otra búsqueda</div>
          </div>
        )}
      </div>

      {/* ── FAB Carrito ── */}
      <AnimatePresence>
        {count() > 0 && !cartOpen && (
          <motion.button
            initial={{ y:80, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:80, opacity:0 }}
            transition={{ type:"spring", stiffness:400, damping:25 }}
            whileTap={{ scale:0.95 }}
            onClick={() => setCartOpen(true)}
            style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", zIndex:25,
              background:"var(--espresso)", color:"white", border:"none", cursor:"pointer",
              borderRadius:"var(--r-full)", padding:"14px 24px",
              display:"flex", alignItems:"center", gap:12,
              boxShadow:"0 8px 32px rgba(30,19,12,0.35)",
              fontFamily:"Plus Jakarta Sans, sans-serif", fontWeight:700, fontSize:"0.95rem"
            }}
          >
            <ShoppingCart size={18} />
            <span>{count()} {count() === 1 ? "producto" : "productos"}</span>
            <span style={{ fontFamily:"Courier New,monospace", background:"rgba(255,255,255,0.15)", borderRadius:"var(--r-full)", padding:"2px 10px" }}>
              Bs {total().toFixed(2)}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Modal Producto ── */}
      <AnimatePresence>
        {productoModal && (
          <>
            <motion.div className="overlay" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={() => setProductoModal(null)} />
            <motion.div
              initial={{ y:"100%", opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:"100%", opacity:0 }}
              transition={{ type:"spring", stiffness:400, damping:30 }}
              style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:50, background:"var(--surface)", borderRadius:"var(--r-xl) var(--r-xl) 0 0", padding:"24px 20px 32px", maxWidth:640, margin:"0 auto" }}
            >
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
                <div>
                  <div style={{ fontSize:40, marginBottom:8 }}>{categorias.find(c=>c.id===productoModal.categoria_id)?.emoji || "🍞"}</div>
                  <h3 style={{ fontFamily:"Fraunces,serif", fontSize:"1.3rem", color:"var(--espresso)", marginBottom:4 }}>{productoModal.nombre}</h3>
                  {productoModal.descripcion && <p style={{ color:"var(--espresso-50)", fontSize:"0.85rem", lineHeight:1.5 }}>{productoModal.descripcion}</p>}
                </div>
                <button className="btn btn-ghost btn-icon" onClick={() => setProductoModal(null)}><X size={20} /></button>
              </div>

              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <span className="price" style={{ fontSize:"1.4rem" }}>Bs {productoModal.precio.toFixed(2)}</span>
                {productoModal.es_mas_vendido && <span className="badge" style={{ background:"var(--crust-soft)", color:"var(--crust-dark)" }}>⭐ Más vendido</span>}
              </div>

              {productoModal.chips_personalizacion?.length > 0 && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:"0.8rem", fontWeight:700, color:"var(--espresso-50)", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:10 }}>Personalización rápida</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {productoModal.chips_personalizacion.map(chip => (
                      <motion.button
                        key={chip} whileTap={{ scale:0.94 }}
                        className={`chip ${chipsSeleccionados.includes(chip) ? "chip-active" : ""}`}
                        onClick={() => setChipsSeleccionados(prev =>
                          prev.includes(chip) ? prev.filter(c=>c!==chip) : [...prev, chip]
                        )}
                      >
                        {chipsSeleccionados.includes(chip) && <Check size={12} />}
                        {chip}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginBottom:20 }}>
                <textarea className="input" placeholder="Nota especial (opcional)..." rows={2}
                  value={notaProducto} onChange={e => setNotaProducto(e.target.value)}
                  style={{ resize:"none" }} />
              </div>

              <motion.button whileTap={{ scale:0.96 }} className="btn btn-primary btn-lg" style={{ width:"100%" }} onClick={agregarAlCarrito}>
                <Plus size={18} /> Agregar al pedido — <span className="font-mono-nums">Bs {productoModal.precio.toFixed(2)}</span>
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Drawer Carrito ── */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div className="overlay" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={() => setCartOpen(false)} />
            <motion.div
              initial={{ x:"100%" }} animate={{ x:0 }} exit={{ x:"100%" }}
              transition={{ type:"spring", stiffness:380, damping:30 }}
              style={{ position:"fixed", right:0, top:0, bottom:0, width:"min(100vw, 400px)", background:"var(--surface)", zIndex:50, display:"flex", flexDirection:"column", boxShadow:"var(--shadow-xl)" }}
            >
              {/* Header del carrito */}
              <div style={{ padding:"20px 20px 16px", borderBottom:"1px solid var(--crumb-dark)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <h2 style={{ fontFamily:"Fraunces,serif", fontSize:"1.3rem", color:"var(--espresso)" }}>
                  🛒 Tu pedido
                </h2>
                <button className="btn btn-ghost btn-icon" onClick={() => setCartOpen(false)}><X size={20} /></button>
              </div>

              {/* Items */}
              <div style={{ flex:1, overflowY:"auto", padding:"16px 20px" }}>
                {items.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"48px 0", color:"var(--espresso-50)" }}>
                    <div style={{ fontSize:48, marginBottom:12 }}>🛒</div>
                    <div style={{ fontWeight:600 }}>El carrito está vacío</div>
                    <div style={{ fontSize:"0.85rem", marginTop:6 }}>Agrega productos del menú</div>
                  </div>
                ) : (
                  <motion.div variants={stagger} initial="hidden" animate="show" style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    {items.map((item: CartItem, idx) => (
                      <motion.div key={`${item.producto.id}-${idx}`} variants={fadeUp} className="card-warm" style={{ padding:"12px 14px" }}>
                        <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                          <div style={{ flex:1 }}>
                            <div style={{ fontWeight:700, fontSize:"0.88rem", color:"var(--espresso)", marginBottom:2 }}>{item.producto.nombre}</div>
                            {item.chips_seleccionados.length > 0 && (
                              <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:4 }}>
                                {item.chips_seleccionados.map(c => (
                                  <span key={c} style={{ fontSize:"0.68rem", padding:"2px 8px", background:"var(--crust-soft)", color:"var(--crust-dark)", borderRadius:"var(--r-full)", fontWeight:600 }}>{c}</span>
                                ))}
                              </div>
                            )}
                            {item.notas && <div style={{ fontSize:"0.72rem", color:"var(--espresso-50)", fontStyle:"italic" }}>"{item.notas}"</div>}
                          </div>
                          <button onClick={() => removeItem(item.producto.id)} className="btn btn-ghost btn-icon" style={{ padding:"4px", color:"var(--espresso-30)" }}>
                            <X size={14} />
                          </button>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:8 }}>
                          <span className="price" style={{ fontSize:"0.9rem" }}>Bs {(item.producto.precio * item.cantidad).toFixed(2)}</span>
                          <div style={{ display:"flex", alignItems:"center", gap:8, background:"var(--crumb-dark)", borderRadius:"var(--r-full)", padding:"3px 8px" }}>
                            <motion.button whileTap={{ scale:0.85 }} onClick={() => updateCantidad(item.producto.id, item.cantidad - 1)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--espresso)", display:"flex" }}>
                              <Minus size={14} />
                            </motion.button>
                            <span style={{ fontFamily:"Courier New,monospace", fontWeight:700, fontSize:"0.9rem", minWidth:16, textAlign:"center" }}>{item.cantidad}</span>
                            <motion.button whileTap={{ scale:0.85 }} onClick={() => updateCantidad(item.producto.id, item.cantidad + 1)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--espresso)", display:"flex" }}>
                              <Plus size={14} />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Footer carrito */}
              {items.length > 0 && (
                <div style={{ padding:"16px 20px 24px", borderTop:"1px solid var(--crumb-dark)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
                    <span style={{ fontWeight:700, color:"var(--espresso)" }}>Total</span>
                    <span className="price" style={{ fontSize:"1.4rem" }}>Bs {total().toFixed(2)}</span>
                  </div>
                  <motion.button
                    whileTap={{ scale:0.96 }}
                    className="btn btn-primary btn-xl"
                    style={{ width:"100%" }}
                    onClick={confirmarPedido}
                    disabled={submitting}
                  >
                    {submitting
                      ? <><div className="spinner" style={{ borderColor:"rgba(255,255,255,0.3)", borderTopColor:"white", width:18, height:18 }} /> Enviando a cocina...</>
                      : "🍳 Confirmar Pedido"}
                  </motion.button>
                  <div style={{ textAlign:"center", marginTop:8, fontSize:"0.75rem", color:"var(--espresso-50)" }}>
                    El mesero traerá tu pedido pronto
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Panel de Pago (simplificado - redirige a /pago/[pedidoId]) ── */}
      <AnimatePresence>
        {showPayment && (
          <>
            <motion.div className="overlay" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={() => setShowPayment(false)} />
            <motion.div
              initial={{ y:"100%" }} animate={{ y:0 }} exit={{ y:"100%" }}
              transition={{ type:"spring", stiffness:380, damping:30 }}
              style={{ position:"fixed", bottom:0, left:0, right:0, background:"var(--surface)", borderRadius:"var(--r-xl) var(--r-xl) 0 0", padding:"28px 20px 40px", zIndex:50, maxWidth:640, margin:"0 auto" }}
            >
              <h2 style={{ fontFamily:"Fraunces,serif", fontSize:"1.4rem", color:"var(--espresso)", marginBottom:20 }}>💳 Pagar la cuenta</h2>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {[
                  { icon:"💵", label:"Pago en Efectivo", desc:"Calculadora de cambio incluida", href:`/pago/${pedidoId}?modo=efectivo` },
                  { icon:"📱", label:"Pago por QR", desc:"QR bancario + subir comprobante",   href:`/pago/${pedidoId}?modo=qr` },
                  { icon:"👥", label:"Dividir la Cuenta", desc:"Split bill entre amigos",      href:`/pago/${pedidoId}?modo=split` },
                ].map(opt => (
                  <motion.a key={opt.label} whileTap={{ scale:0.97 }} href={opt.href}
                    className="card-warm"
                    style={{ padding:"16px 20px", display:"flex", gap:16, alignItems:"center", textDecoration:"none", cursor:"pointer" }}
                  >
                    <span style={{ fontSize:32 }}>{opt.icon}</span>
                    <div>
                      <div style={{ fontWeight:700, color:"var(--espresso)" }}>{opt.label}</div>
                      <div style={{ fontSize:"0.78rem", color:"var(--espresso-50)" }}>{opt.desc}</div>
                    </div>
                  </motion.a>
                ))}
              </div>
              <button className="btn btn-ghost" style={{ width:"100%", marginTop:16 }} onClick={() => setShowPayment(false)}>Cancelar</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

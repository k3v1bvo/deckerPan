"use client";
import { useEffect } from "react";
import { supabase, SUPABASE_CONFIGURED } from "@/lib/supabase";
import { useSystemStore, useUIStore, useCartStore } from "@/store";
import { subscribeToSync, markEventHandled, SyncMessage } from "@/lib/broadcast";
import { soundManager } from "@/lib/sound";
import { Pedido, Mesa, AlertaMesero, Producto, Categoria, Zona } from "@/types";

export default function SupabaseSync() {
  const { setMesas, setProductos } = useSystemStore();

  useEffect(() => {
    let mounted = true;

    // 0. Desbloquear AudioContext en la primera interacción del usuario
    const unlockAudio = () => {
      soundManager.playClick();
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    };
    window.addEventListener("click", unlockAudio, { once: true });
    window.addEventListener("touchstart", unlockAudio, { once: true });

    // ─────────────────────────────────────────────────────────────
    // 1. CANAL LOCAL SUB-MILISEGUNDO (BroadcastChannel entre pestañas)
    // ─────────────────────────────────────────────────────────────
    const unsubscribeBroadcast = subscribeToSync((msg: SyncMessage) => {
      if (!mounted) return;

      const { type, payload } = msg;

      switch (type) {
        case "NEW_ORDER": {
          const ped = payload as Pedido;
          if (ped && ped.id) {
            const isFirst = markEventHandled("order-" + ped.id);
            // Sincronizar en store local si no existe
            useSystemStore.setState((state) => {
              const exists = state.pedidos.some((p) => p.id === ped.id);
              const pedidosUpdated = exists ? state.pedidos : [ped, ...state.pedidos];
              const mesasUpdated = state.mesas.map((m) =>
                m.numero === ped.mesa_numero ? { ...m, estado: "ocupada" as const } : m
              );
              return { pedidos: pedidosUpdated, mesas: mesasUpdated };
            });

            if (isFirst) {
              soundManager.playOrderChime();
              useUIStore.getState().addToast({
                tipo: "comanda",
                titulo: "Nueva Comanda en Mesa",
                mensaje: `Mesa ${ped.mesa_numero} — Total: Bs ${(ped.total || 0).toFixed(2)}`,
                mesa_numero: ped.mesa_numero,
              });
            }
          }
          break;
        }

        case "WAITER_CALL": {
          const alerta = payload as AlertaMesero;
          if (alerta && alerta.id) {
            const isFirst = markEventHandled("alerta-" + alerta.id);
            useSystemStore.setState((state) => {
              const exists = state.alertas.some((a) => a.id === alerta.id);
              return {
                alertas: exists ? state.alertas : [alerta, ...state.alertas],
              };
            });

            if (isFirst) {
              soundManager.playWaiterBell();
              useUIStore.getState().addToast({
                tipo: "alerta",
                titulo: alerta.tipo === "cuenta_pedida" ? "Solicitud de Cuenta" : "Llamada de Mesa",
                mensaje: alerta.mensaje || `Mesa ${alerta.mesa_numero} solicita atención del mesero`,
                mesa_numero: alerta.mesa_numero,
              });
            }
          }
          break;
        }

        case "ORDER_READY": {
          const { id, estado, mesa_numero } = payload;
          if (id) {
            const isFirst = markEventHandled(`order-state-${id}-${estado}`);
            useSystemStore.setState((state) => ({
              pedidos: state.pedidos.map((p) => (p.id === id ? { ...p, estado } : p)),
            }));

            if (estado === "listo" && isFirst) {
              soundManager.playSuccessTone();
              useUIStore.getState().addToast({
                tipo: "cocina",
                titulo: "Comanda Lista para Servir",
                mensaje: `Cocina despachó los platillos de Mesa ${mesa_numero || ""}`,
                mesa_numero,
              });
            }
          }
          break;
        }

        case "PAYMENT_COMPLETED": {
          const { pedidoId, mesa_numero, monto } = payload;
          if (pedidoId) {
            const isFirst = markEventHandled("pago-" + pedidoId);
            useSystemStore.setState((state) => ({
              pedidos: state.pedidos.map((p) =>
                p.id === pedidoId ? { ...p, estado: "pagado" as const } : p
              ),
              mesas: state.mesas.map((m) =>
                m.numero === mesa_numero ? { ...m, estado: "libre" as const } : m
              ),
            }));

            if (isFirst) {
              soundManager.playSuccessTone();
              useUIStore.getState().addToast({
                tipo: "pago",
                titulo: "Cobro Registrado — Cuenta Cerrada",
                mensaje: `Mesa ${mesa_numero} cobrada con éxito (Bs ${(monto || 0).toFixed(2)}). Mesa liberada.`,
                mesa_numero,
              });
            }
          }
          break;
        }

        case "TABLE_STATUS_CHANGED": {
          const { id, estado } = payload;
          if (id && estado) {
            useSystemStore.setState((state) => ({
              mesas: state.mesas.map((m) => (m.id === id ? { ...m, estado } : m)),
            }));
          }
          break;
        }

        case "PRODUCTOS_UPDATED": {
          const prodsActualizados = payload as Producto[];
          if (Array.isArray(prodsActualizados) && prodsActualizados.length > 0) {
            useSystemStore.setState({ productos: prodsActualizados });
            useCartStore.setState((cartState) => ({
              items: cartState.items.map((it) => {
                const live = prodsActualizados.find((p) => p.id === it.producto.id);
                return live ? { ...it, producto: live } : it;
              }),
            }));
          }
          break;
        }

        case "QR_CONFIG_UPDATED": {
          const { url, titular, banco } = payload;
          useSystemStore.setState((state) => ({
            qrBancarioUrl: url || state.qrBancarioUrl,
            qrBancarioTitular: titular || state.qrBancarioTitular,
            qrBancarioBanco: banco || state.qrBancarioBanco,
          }));
          break;
        }

        default:
          break;
      }
    });

    // ─────────────────────────────────────────────────────────────
    // 2. SUPABASE REMOTO (WebSockets vía Supabase Realtime)
    // ─────────────────────────────────────────────────────────────
    if (!SUPABASE_CONFIGURED || !supabase) {
      return () => {
        mounted = false;
        unsubscribeBroadcast();
      };
    }

    async function initialFetch() {
      try {
        // Cargar Zonas
        const { data: zData } = await supabase.from("zonas").select("*").order("orden");
        if (zData && zData.length > 0 && mounted) {
          useSystemStore.setState({ zonas: zData as Zona[] });
        }

        // Cargar Mesas
        const { data: mData } = await supabase.from("mesas").select("*").order("numero");
        if (mData && mData.length > 0 && mounted) {
          setMesas(mData as Mesa[]);
        }

        // Cargar Categorías (solo si son las categorías oficiales de Dencker Pan)
        const { data: cData } = await supabase.from("categorias").select("*").order("orden");
        if (cData && cData.length > 0 && mounted) {
          const esValida = cData.some((c: any) => c.id === "c_desayunos" || c.id === "c_cafes");
          if (esValida) {
            useSystemStore.setState({ categorias: cData as Categoria[] });
          }
        }

        // Cargar Productos (solo si coinciden con el menú oficial Dencker Pan)
        const { data: pData } = await supabase
          .from("productos")
          .select("*, categoria:categorias(*)")
          .order("nombre");
        if (pData && pData.length > 0 && mounted) {
          const esOficial = pData.some((p: any) => p.id === "prod_rise_shine" || (typeof p.id === "string" && p.id.startsWith("prod_")));
          if (esOficial) {
            setProductos(pData as Producto[]);
          }
        }

        // Cargar Pedidos Activos
        const { data: pedData } = await supabase
          .from("pedidos")
          .select("*, items:items_pedido(*)")
          .neq("estado", "pagado")
          .neq("estado", "cancelado")
          .order("created_at", { ascending: false });

        if (pedData && mounted && pedData.length > 0) {
          useSystemStore.setState((state) => ({
            pedidos: [
              ...pedData.map((p) => ({
                ...p,
                items: p.items || [],
              })),
              ...state.pedidos.filter((localP) => !pedData.some((dbP) => dbP.id === localP.id)),
            ],
          }));
        }

        // Cargar Alertas Pendientes
        const { data: alData } = await supabase
          .from("alertas_mesero")
          .select("*")
          .eq("atendida", false)
          .order("created_at", { ascending: false });

        if (alData && mounted && alData.length > 0) {
          useSystemStore.setState((state) => ({
            alertas: [
              ...(alData as AlertaMesero[]),
              ...state.alertas.filter((localA) => !alData.some((dbA) => dbA.id === localA.id)),
            ],
          }));
        }
      } catch (err) {
        console.warn("Supabase initial sync error, using local state:", err);
      }
    }

    initialFetch();

    // Suscribirse a cambios en tiempo real vía WebSockets
    const channel = supabase
      .channel("dencker-realtime-global")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pedidos" },
        async (payload) => {
          if (!mounted) return;

          if (payload.eventType === "INSERT") {
            const { data: fullPedido } = await supabase
              .from("pedidos")
              .select("*, items:items_pedido(*)")
              .eq("id", payload.new.id)
              .single();

            if (fullPedido) {
              const isFirst = markEventHandled("order-" + fullPedido.id);
              useSystemStore.setState((state) => {
                const exists = state.pedidos.some((p) => p.id === fullPedido.id);
                if (exists) return state;
                return {
                  pedidos: [fullPedido as Pedido, ...state.pedidos],
                };
              });

              if (isFirst) {
                soundManager.playOrderChime();
                useUIStore.getState().addToast({
                  tipo: "comanda",
                  titulo: "¡Nueva Comanda Registrada!",
                  mensaje: `Mesa ${fullPedido.mesa_numero} — Total: Bs ${(fullPedido.total || 0).toFixed(2)}`,
                  mesa_numero: fullPedido.mesa_numero,
                });
              }
            }
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as Pedido;
            useSystemStore.setState((state) => ({
              pedidos: state.pedidos.map((p) =>
                p.id === updated.id ? { ...p, ...updated } : p
              ),
            }));

            if (updated.estado === "listo") {
              const isFirst = markEventHandled(`order-state-${updated.id}-listo`);
              if (isFirst) {
                soundManager.playSuccessTone();
                useUIStore.getState().addToast({
                  tipo: "cocina",
                  titulo: "Comanda Lista para Servir",
                  mensaje: `Cocina despachó comanda de Mesa ${updated.mesa_numero}`,
                  mesa_numero: updated.mesa_numero,
                });
              }
            } else if (updated.estado === "pagado") {
              const isFirst = markEventHandled("pago-" + updated.id);
              if (isFirst) {
                soundManager.playSuccessTone();
                useUIStore.getState().addToast({
                  tipo: "pago",
                  titulo: "Cuenta Pagada — Mesa Liberada",
                  mensaje: `Mesa ${updated.mesa_numero} ha sido cancelada en caja`,
                  mesa_numero: updated.mesa_numero,
                });
              }
            }
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alertas_mesero" },
        (payload) => {
          if (!mounted) return;

          if (payload.eventType === "INSERT") {
            const alerta = payload.new as AlertaMesero;
            const isFirst = markEventHandled("alerta-" + alerta.id);
            useSystemStore.setState((state) => ({
              alertas: [alerta, ...state.alertas],
            }));

            if (isFirst) {
              soundManager.playWaiterBell();
              useUIStore.getState().addToast({
                tipo: "alerta",
                titulo: alerta.tipo === "cuenta_pedida" ? "Solicitud de Cuenta" : "Llamada de Servicio",
                mensaje: alerta.mensaje || `Mesa ${alerta.mesa_numero} requiere atención`,
                mesa_numero: alerta.mesa_numero,
              });
            }
          } else if (payload.eventType === "UPDATE") {
            useSystemStore.setState((state) => ({
              alertas: state.alertas.map((a) =>
                a.id === payload.new.id ? { ...a, ...payload.new } : a
              ),
            }));
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mesas" },
        (payload) => {
          if (!mounted) return;
          if (payload.eventType === "UPDATE") {
            useSystemStore.setState((state) => ({
              mesas: state.mesas.map((m) =>
                m.id === payload.new.id ? { ...m, ...payload.new } : m
              ),
            }));
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      unsubscribeBroadcast();
      supabase.removeChannel(channel);
    };
  }, [setMesas, setProductos]);

  return null;
}

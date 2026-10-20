"use client";
import { useEffect } from "react";
import { supabase, SUPABASE_CONFIGURED } from "@/lib/supabase";
import { useSystemStore } from "@/store";
import { Pedido, ItemPedido, Mesa, AlertaMesero, Producto, Categoria, Zona } from "@/types";

export default function SupabaseSync() {
  const {
    setMesas,
    setProductos,
    zonas,
    mesas,
  } = useSystemStore();

  useEffect(() => {
    if (!SUPABASE_CONFIGURED || !supabase) return;

    let mounted = true;

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

        // Cargar Categorías
        const { data: cData } = await supabase.from("categorias").select("*").order("orden");
        if (cData && cData.length > 0 && mounted) {
          useSystemStore.setState({ categorias: cData as Categoria[] });
        }

        // Cargar Productos
        const { data: pData } = await supabase
          .from("productos")
          .select("*, categoria:categorias(*)")
          .order("nombre");
        if (pData && pData.length > 0 && mounted) {
          setProductos(pData as Producto[]);
        }

        // Cargar Pedidos Activos con sus Items
        const { data: pedData } = await supabase
          .from("pedidos")
          .select("*, items:items_pedido(*)")
          .neq("estado", "pagado")
          .neq("estado", "cancelado")
          .order("created_at", { ascending: false });

        if (pedData && mounted) {
          // Si hay pedidos en Supabase, sincronizarlos
          if (pedData.length > 0) {
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
        }

        // Cargar Alertas Pendientes
        const { data: alData } = await supabase
          .from("alertas_mesero")
          .select("*")
          .eq("atendida", false)
          .order("created_at", { ascending: false });

        if (alData && mounted) {
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

    // Suscribirse a cambios en tiempo real
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
              useSystemStore.setState((state) => {
                const exists = state.pedidos.some((p) => p.id === fullPedido.id);
                if (exists) return state;
                return {
                  pedidos: [fullPedido as Pedido, ...state.pedidos],
                };
              });
            }
          } else if (payload.eventType === "UPDATE") {
            useSystemStore.setState((state) => ({
              pedidos: state.pedidos.map((p) =>
                p.id === payload.new.id ? { ...p, ...payload.new } : p
              ),
            }));
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alertas_mesero" },
        (payload) => {
          if (!mounted) return;
          if (payload.eventType === "INSERT") {
            useSystemStore.setState((state) => ({
              alertas: [payload.new as AlertaMesero, ...state.alertas],
            }));
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
      supabase.removeChannel(channel);
    };
  }, [setMesas, setProductos]);

  return null;
}

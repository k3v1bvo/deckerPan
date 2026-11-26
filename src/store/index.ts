import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CartItem,
  RegistroAsistencia,
  GeocercaConfig,
  Producto,
  Mesa,
  AlertaMesero,
  ItemPedido,
  Pedido,
  Pago,
  Reserva,
  SesionCaja,
  Zona,
  Categoria,
  EstadoMesa,
  EstadoPedido,
  EstadoItem,
  UsuarioStaff,
  FacturacionSiatConfig,
  FacturaEmitida,
} from '@/types';
import { convertirNumeroALiteral, generarCufSiat, generarUrlQrSiat } from '@/lib/siat-utils';
import {
  SEED_ZONAS,
  SEED_MESAS,
  SEED_CATEGORIAS,
  SEED_PRODUCTOS,
  SEED_PAGOS,
  SEED_HISTORIAL_SESIONES,
  SEED_USUARIOS_STAFF,
  SEED_ASISTENCIAS,
} from '@/lib/seed-data';
import { broadcastSync, markEventHandled } from '@/lib/broadcast';
import { DEFAULT_GEOCERCA_CONFIG } from '@/lib/geo';

// ============================
// SYSTEM STORE (Central Data: Mesas, Pedidos, Productos, Alertas)
// ============================
interface SystemStore {
  zonas: Zona[];
  mesas: Mesa[];
  categorias: Categoria[];
  productos: Producto[];
  pedidos: Pedido[];
  alertas: AlertaMesero[];
  reservas: Reserva[];
  sesionCaja: SesionCaja | null;
  pagos: Pago[];
  historialSesiones: SesionCaja[];
  usuariosStaff: UsuarioStaff[];

  // Acciones Personal & Cuentas Staff
  setUsuariosStaff: (usuarios: UsuarioStaff[]) => void;
  addUsuarioStaff: (usuario: Omit<UsuarioStaff, 'id' | 'created_at'>) => void;
  updateUsuarioStaff: (id: string, data: Partial<UsuarioStaff>) => void;
  deleteUsuarioStaff: (id: string) => void;

  // Acciones Mesas (Admin & Mesero)
  setMesas: (mesas: Mesa[]) => void;
  addMesa: (mesa: Omit<Mesa, 'id' | 'created_at'>) => void;
  updateMesa: (id: string, data: Partial<Mesa>) => void;
  deleteMesa: (id: string) => void;
  setEstadoMesa: (id: string, estado: EstadoMesa) => void;
  ajustarCantidadMesas: (cantidad: number, zonaId?: string) => void;

  // Acciones Zonas
  addZona: (nombre: string, descripcion?: string) => void;

  // Acciones Productos (Admin)
  setProductos: (productos: Producto[]) => void;
  addProducto: (prod: Omit<Producto, 'id' | 'created_at' | 'updated_at'>) => void;
  updateProducto: (id: string, data: Partial<Producto>) => void;
  deleteProducto: (id: string) => void;
  toggleProductoDisponible: (id: string) => void;

  // Acciones Pedidos
  pedidosActivos: () => Pedido[];
  addPedido: (pedido: Omit<Pedido, 'id' | 'created_at' | 'updated_at'>) => Pedido;
  updatePedidoEstado: (id: string, estado: EstadoPedido) => void;
  updateItemEstado: (itemId: string, estado: EstadoItem) => void;
  addItemToPedido: (pedidoId: string, item: Omit<ItemPedido, 'id' | 'pedido_id' | 'created_at' | 'updated_at'>) => void;

  // Acciones Alertas Mesero
  addAlerta: (alerta: Omit<AlertaMesero, 'id' | 'created_at' | 'atendida'>) => void;
  marcarAlertaAtendida: (id: string) => void;
  clearAlertas: () => void;

  // Acciones Caja & Arqueo
  abrirCaja: (montoInicial: number, cajero: string, turno: 'manana' | 'tarde' | 'noche') => void;
  cerrarCaja: (efectivoContado: number, notas?: string) => void;
  registrarPago: (pedidoId: string, pago: Omit<Pago, 'id' | 'created_at'>) => void;

  // Acciones Reservas
  addReserva: (reserva: Omit<Reserva, 'id' | 'created_at' | 'updated_at'>) => void;
  updateReservaEstado: (id: string, estado: Reserva['estado']) => void;

  // Configuración QR Bancario Simple (Subido por Admin desde App Banco)
  qrBancarioUrl: string;
  qrBancarioTitular: string;
  qrBancarioBanco: string;
  setQrBancarioConfig: (config: { url: string; titular?: string; banco?: string }) => void;

  // Facturación SIAT / Impuestos Bolivia (Token Contadora & CUFD)
  facturacionSiatConfig: FacturacionSiatConfig;
  facturasEmitidas: FacturaEmitida[];
  setFacturacionSiatConfig: (config: Partial<FacturacionSiatConfig>) => void;
  emitirFacturaSiat: (factura: {
    clienteNombre: string;
    clienteNitCi: string;
    clienteComplemento?: string;
    montoTotal: number;
    pedidoId: string;
  }) => FacturaEmitida;

  // Control de Asistencias & Geocerca GPS
  asistencias: RegistroAsistencia[];
  geocercaConfig: GeocercaConfig;
  addRegistroAsistencia: (reg: Omit<RegistroAsistencia, 'id' | 'created_at'>) => RegistroAsistencia;
  updateGeocercaConfig: (cfg: Partial<GeocercaConfig>) => void;
  clearHistorialAsistencias: () => void;

  // Reset a datos de fábrica
  resetToDefaults: () => void;
}

export const useSystemStore = create<SystemStore>()(
  persist(
    (set, get) => ({
      zonas: SEED_ZONAS,
      mesas: SEED_MESAS,
      categorias: SEED_CATEGORIAS,
      productos: SEED_PRODUCTOS,
      usuariosStaff: SEED_USUARIOS_STAFF,
      pedidos: [
        {
          id: 'PED-1020',
          mesa_numero: 4,
          estado: 'listo',
          total: 153,
          cliente_nombre: 'Carlos & Amigos',
          es_ronda: false,
          created_at: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
          updated_at: new Date().toISOString(),
          items: [
            {
              id: 'item-p4-1',
              pedido_id: 'PED-1020',
              producto_nombre: 'Cappuccino Artesanal',
              cantidad: 1,
              precio_unitario: 22,
              subtotal: 22,
              estacion: 'cafeteria',
              estado: 'entregado',
              asiento_numero: 1,
              comensal_nombre: 'Carlos',
              chips_seleccionados: ['Canela espolvoreada', 'Leche entera'],
              created_at: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 'item-p4-2',
              pedido_id: 'PED-1020',
              producto_nombre: 'Croissant Jamón & Queso',
              cantidad: 1,
              precio_unitario: 24,
              subtotal: 24,
              estacion: 'vitrina',
              estado: 'entregado',
              asiento_numero: 1,
              comensal_nombre: 'Carlos',
              chips_seleccionados: ['Calentar en horno'],
              created_at: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 'item-p4-3',
              pedido_id: 'PED-1020',
              producto_nombre: 'Flat White 4 Llamas',
              cantidad: 1,
              precio_unitario: 24,
              subtotal: 24,
              estacion: 'cafeteria',
              estado: 'entregado',
              asiento_numero: 2,
              comensal_nombre: 'Sofía',
              chips_seleccionados: ['Doble shot espresso'],
              created_at: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 'item-p4-4',
              pedido_id: 'PED-1020',
              producto_nombre: 'Tartaleta de Frutilla & Crema',
              cantidad: 1,
              precio_unitario: 25,
              subtotal: 25,
              estacion: 'vitrina',
              estado: 'entregado',
              asiento_numero: 2,
              comensal_nombre: 'Sofía',
              chips_seleccionados: ['Plato frío'],
              created_at: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 'item-p4-5',
              pedido_id: 'PED-1020',
              producto_nombre: 'Pizza Margarita Artesanal (4 porc)',
              cantidad: 1,
              precio_unitario: 40,
              subtotal: 40,
              estacion: 'cocina',
              estado: 'entregado',
              asiento_numero: 3,
              comensal_nombre: 'Mateo',
              chips_seleccionados: ['Albahaca fresca', 'Aceite de oliva'],
              created_at: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 'item-p4-6',
              pedido_id: 'PED-1020',
              producto_nombre: 'Limonada Menta & Jengibre',
              cantidad: 1,
              precio_unitario: 18,
              subtotal: 18,
              estacion: 'cafeteria',
              estado: 'entregado',
              asiento_numero: 4,
              comensal_nombre: 'Valentina',
              chips_seleccionados: ['Poco hielo'],
              created_at: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        },
        {
          id: 'PED-1023',
          mesa_numero: 7,
          estado: 'en_preparacion',
          total: 91,
          cliente_nombre: 'Andrés & Camila',
          es_ronda: false,
          created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
          updated_at: new Date().toISOString(),
          items: [
            {
              id: 'item-p7-1',
              pedido_id: 'PED-1023',
              producto_nombre: 'Sandwich de Lomito en Baguette',
              cantidad: 1,
              precio_unitario: 38,
              subtotal: 38,
              estacion: 'cocina',
              estado: 'en_preparacion',
              asiento_numero: 1,
              comensal_nombre: 'Andrés',
              chips_seleccionados: ['Carne término medio', 'Papas rústicas'],
              created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 'item-p7-2',
              pedido_id: 'PED-1023',
              producto_nombre: 'Croque Monsieur Gratinado',
              cantidad: 1,
              precio_unitario: 35,
              subtotal: 35,
              estacion: 'cocina',
              estado: 'en_preparacion',
              asiento_numero: 2,
              comensal_nombre: 'Camila',
              chips_seleccionados: ['Queso gruyere gratinado'],
              created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 'item-p7-3',
              pedido_id: 'PED-1023',
              producto_nombre: 'Café Americano Doble Caranavi',
              cantidad: 1,
              precio_unitario: 18,
              subtotal: 18,
              estacion: 'cafeteria',
              estado: 'listo',
              asiento_numero: 2,
              comensal_nombre: 'Camila',
              chips_seleccionados: ['Sin azúcar'],
              created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        },
        {
          id: 'PED-1024',
          mesa_numero: 10,
          estado: 'en_preparacion',
          total: 74,
          cliente_nombre: 'Mesa 10 (M1)',
          es_ronda: false,
          created_at: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
          updated_at: new Date().toISOString(),
          items: [
            {
              id: 'item-m1-1',
              pedido_id: 'PED-1024',
              producto_nombre: 'Espresso Doble Caranavi',
              cantidad: 1,
              precio_unitario: 16,
              subtotal: 16,
              estacion: 'cafeteria',
              estado: 'entregado',
              asiento_numero: 1,
              comensal_nombre: 'Roberto',
              chips_seleccionados: ['Grano Catuai'],
              created_at: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 'item-m1-2',
              pedido_id: 'PED-1024',
              producto_nombre: 'Empanada de Carne a Cuchillo',
              cantidad: 1,
              precio_unitario: 12,
              subtotal: 12,
              estacion: 'vitrina',
              estado: 'entregado',
              asiento_numero: 1,
              comensal_nombre: 'Roberto',
              chips_seleccionados: ['Caliente con llajwa'],
              created_at: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 'item-m1-3',
              pedido_id: 'PED-1024',
              producto_nombre: 'Latte Vainilla Francesa',
              cantidad: 1,
              precio_unitario: 24,
              subtotal: 24,
              estacion: 'cafeteria',
              estado: 'en_preparacion',
              asiento_numero: 2,
              comensal_nombre: 'Elena',
              chips_seleccionados: ['Jarabe de vainilla'],
              created_at: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 'item-m1-4',
              pedido_id: 'PED-1024',
              producto_nombre: 'Queque Japonés Esponjoso',
              cantidad: 1,
              precio_unitario: 22,
              subtotal: 22,
              estacion: 'vitrina',
              estado: 'listo',
              asiento_numero: 2,
              comensal_nombre: 'Elena',
              chips_seleccionados: ['Con azúcar impalpable'],
              created_at: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        },
        {
          id: 'PED-1025',
          mesa_numero: 17,
          estado: 'en_preparacion',
          total: 142,
          cliente_nombre: 'Terraza T17',
          es_ronda: false,
          created_at: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
          updated_at: new Date().toISOString(),
          items: [
            {
              id: 'item-t17-1',
              pedido_id: 'PED-1025',
              producto_nombre: 'Pizza Bacon & Cebolla (6 porc)',
              cantidad: 1,
              precio_unitario: 55,
              subtotal: 55,
              estacion: 'cocina',
              estado: 'entregado',
              asiento_numero: 1,
              comensal_nombre: 'Gabriel',
              chips_seleccionados: ['Cebolla caramelizada'],
              created_at: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 'item-t17-2',
              pedido_id: 'PED-1025',
              producto_nombre: 'Pizza Funghi Champiñón (6 porc)',
              cantidad: 1,
              precio_unitario: 50,
              subtotal: 50,
              estacion: 'cocina',
              estado: 'entregado',
              asiento_numero: 2,
              comensal_nombre: 'Daniela',
              chips_seleccionados: ['Champiñones frescos'],
              created_at: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 'item-t17-3',
              pedido_id: 'PED-1025',
              producto_nombre: 'Cerveza Artesanal Taquiña / Huari',
              cantidad: 2,
              precio_unitario: 18.5,
              subtotal: 37,
              estacion: 'cafeteria',
              estado: 'entregado',
              asiento_numero: 3,
              comensal_nombre: 'Lucas',
              chips_seleccionados: ['Bien fría con vaso'],
              created_at: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        },
      ],
      alertas: [
        {
          id: 'al-cuenta-p4',
          mesa_numero: 4,
          tipo: 'cuenta_pedida',
          mensaje: 'Mesa P4 solicita la cuenta (Total Bs 153.00 · QR Simple o Efectivo)',
          datos_extra: { total: 153, metodo_preferido: 'qr' },
          atendida: false,
          created_at: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
        },
        {
          id: 'al-mozo-p7',
          mesa_numero: 7,
          tipo: 'llamado',
          mensaje: 'Mesa P7 solicita asistencia de mozo (cubiertos y agua mineral)',
          datos_extra: {},
          atendida: false,
          created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        },
      ],
      reservas: [
        {
          id: 'res-1',
          nombre_cliente: 'Claudia Paz',
          telefono: '+591 71234567',
          email: 'claudia.paz@example.com',
          tipo_evento: 'Cumpleaños íntimo',
          fecha_evento: new Date(Date.now() + 86400000 * 2).toISOString(),
          numero_personas: 12,
          descripcion: 'Mesa dulce con tortas artesanales y café de especialidad',
          monto_total: 650,
          monto_sena: 200,
          estado: 'confirmada',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      sesionCaja: {
        id: 'caja-hoy',
        turno: 'tarde',
        cajero: 'Cajero Principal',
        efectivo_inicial: 300,
        efectivo_esperado: 300 + 62 + 86,
        total_ventas: 148,
        total_qr: 62,
        estado: 'abierta',
        abierta_at: new Date().toISOString(),
      },
      pagos: SEED_PAGOS,
      historialSesiones: SEED_HISTORIAL_SESIONES,

      // --- Mesas ---
      setMesas: (mesas) => set({ mesas }),

      addMesa: (data) =>
        set((state) => {
          const newId = 'm-' + Date.now();
          const nuevaMesa: Mesa = {
            ...data,
            id: newId,
            activa: true,
            created_at: new Date().toISOString(),
          };
          return { mesas: [...state.mesas, nuevaMesa] };
        }),

      updateMesa: (id, data) =>
        set((state) => ({
          mesas: state.mesas.map((m) => (m.id === id ? { ...m, ...data } : m)),
        })),

      deleteMesa: (id) =>
        set((state) => ({
          mesas: state.mesas.filter((m) => m.id !== id),
        })),

      setEstadoMesa: (id, estado) => {
        set((state) => ({
          mesas: state.mesas.map((m) => (m.id === id ? { ...m, estado } : m)),
        }));
        const m = get().mesas.find((mesa) => mesa.id === id);
        broadcastSync('TABLE_STATUS_CHANGED', { id, numero: m?.numero, estado });
      },

      ajustarCantidadMesas: (cantidad, zonaId) =>
        set((state) => {
          const zonaActual = zonaId || state.zonas[0]?.id || 'z1';
          const mesasActuales = [...state.mesas];

          if (cantidad > mesasActuales.length) {
            // Agregar mesas faltantes
            const agregarN = cantidad - mesasActuales.length;
            const maxNumero = mesasActuales.reduce((max, m) => Math.max(max, m.numero), 0);
            const nuevas: Mesa[] = [];
            for (let i = 1; i <= agregarN; i++) {
              const num = maxNumero + i;
              const col = (num - 1) % 4;
              const row = Math.floor((num - 1) / 4);
              nuevas.push({
                id: `m-${Date.now()}-${i}`,
                numero: num,
                zona_id: zonaActual,
                tipo: 'cuadrada',
                capacidad: 4,
                pos_x: 50 + col * 120,
                pos_y: 50 + row * 120,
                ancho: 80,
                alto: 80,
                estado: 'libre',
                activa: true,
                created_at: new Date().toISOString(),
              });
            }
            return { mesas: [...mesasActuales, ...nuevas] };
          } else if (cantidad < mesasActuales.length && cantidad > 0) {
            // Reducir mesas (quitar las últimas inactivas o libres)
            return { mesas: mesasActuales.slice(0, cantidad) };
          }
          return {};
        }),

      // --- Zonas ---
      addZona: (nombre, descripcion) =>
        set((state) => {
          const newZona: Zona = {
            id: 'z-' + Date.now(),
            nombre,
            descripcion,
            orden: state.zonas.length + 1,
            activa: true,
            created_at: new Date().toISOString(),
          };
          return { zonas: [...state.zonas, newZona] };
        }),

      // --- Productos ---
      setProductos: (productos) => set({ productos }),

      addProducto: (prod) =>
        set((state) => {
          const newProd: Producto = {
            ...prod,
            id: 'p-' + Date.now(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          return { productos: [newProd, ...state.productos] };
        }),

      updateProducto: (id, data) =>
        set((state) => {
          const updated = state.productos.map((p) =>
            p.id === id ? { ...p, ...data, updated_at: new Date().toISOString() } : p
          );
          broadcastSync('PRODUCTOS_UPDATED', updated);
          // Sincronizar inmediatamente los productos en el carrito para reflejar nuevo precio/foto/nombre
          try {
            useCartStore.setState((cartState) => ({
              items: cartState.items.map((it) =>
                it.producto.id === id ? { ...it, producto: { ...it.producto, ...data } } : it
              ),
            }));
          } catch {
            // Noop
          }
          return { productos: updated };
        }),

      deleteProducto: (id) =>
        set((state) => {
          const updated = state.productos.filter((p) => p.id !== id);
          broadcastSync('PRODUCTOS_UPDATED', updated);
          try {
            useCartStore.setState((cartState) => ({
              items: cartState.items.filter((it) => it.producto.id !== id),
            }));
          } catch {
            // Noop
          }
          return { productos: updated };
        }),

      toggleProductoDisponible: (id) =>
        set((state) => {
          const updated = state.productos.map((p) =>
            p.id === id ? { ...p, disponible: !p.disponible, updated_at: new Date().toISOString() } : p
          );
          broadcastSync('PRODUCTOS_UPDATED', updated);
          return { productos: updated };
        }),

      // --- Pedidos ---
      pedidosActivos: () => {
        return get().pedidos.filter((p) => p.estado !== 'pagado' && p.estado !== 'cancelado');
      },

      addPedido: (pedidoData) => {
        const id = 'ped-' + Date.now();
        const nuevo: Pedido = {
          ...pedidoData,
          id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        markEventHandled('order-' + id);
        set((state) => {
          // Marcar mesa como ocupada si corresponde
          const mesasActualizadas = state.mesas.map((m) =>
            m.numero === nuevo.mesa_numero ? { ...m, estado: 'ocupada' as EstadoMesa } : m
          );
          return {
            pedidos: [nuevo, ...state.pedidos],
            mesas: mesasActualizadas,
          };
        });
        broadcastSync('NEW_ORDER', nuevo);
        return nuevo;
      },

      updatePedidoEstado: (id, estado) => {
        markEventHandled(`order-state-${id}-${estado}`);
        set((state) => ({
          pedidos: state.pedidos.map((p) =>
            p.id === id ? { ...p, estado, updated_at: new Date().toISOString() } : p
          ),
        }));
        const ped = get().pedidos.find((p) => p.id === id);
        broadcastSync('ORDER_READY', { id, estado, mesa_numero: ped?.mesa_numero });
      },

      updateItemEstado: (itemId, estado) => {
        markEventHandled(`item-state-${itemId}-${estado}`);
        set((state) => ({
          pedidos: state.pedidos.map((p) => {
            const hasItem = p.items?.some((i) => i.id === itemId);
            if (!hasItem) return p;
            const updatedItems = p.items?.map((i) =>
              i.id === itemId ? { ...i, estado, updated_at: new Date().toISOString() } : i
            );
            // Verificar si todos los items están listos
            const todosListos = updatedItems?.every((i) => i.estado === 'listo' || i.estado === 'entregado');
            return {
              ...p,
              items: updatedItems,
              estado: todosListos ? 'listo' : p.estado,
              updated_at: new Date().toISOString(),
            };
          }),
        }));
        const ped = get().pedidos.find((p) => p.items?.some((i) => i.id === itemId));
        broadcastSync('ITEM_READY', { itemId, estado, pedidoId: ped?.id, mesa_numero: ped?.mesa_numero });
      },

      addItemToPedido: (pedidoId, itemData) =>
        set((state) => {
          const newItem: ItemPedido = {
            ...itemData,
            id: 'item-' + Date.now() + Math.random().toString(36).substring(2, 6),
            pedido_id: pedidoId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          return {
            pedidos: state.pedidos.map((p) => {
              if (p.id !== pedidoId) return p;
              const currentItems = p.items || [];
              const updatedItems = [...currentItems, newItem];
              const nuevoTotal = updatedItems.reduce((acc, it) => acc + it.subtotal, 0);
              return {
                ...p,
                items: updatedItems,
                total: nuevoTotal,
                updated_at: new Date().toISOString(),
              };
            }),
          };
        }),

      // --- Alertas ---
      addAlerta: (alertaData) => {
        const nuevaAlerta: AlertaMesero = {
          ...alertaData,
          id: 'al-' + Date.now(),
          atendida: false,
          created_at: new Date().toISOString(),
        };
        markEventHandled('alerta-' + nuevaAlerta.id);
        set((state) => {
          return { alertas: [nuevaAlerta, ...state.alertas] };
        });
        broadcastSync('WAITER_CALL', nuevaAlerta);
      },

      marcarAlertaAtendida: (id) =>
        set((state) => ({
          alertas: state.alertas.map((a) => (a.id === id ? { ...a, atendida: true } : a)),
        })),

      clearAlertas: () => set({ alertas: [] }),

      // --- Caja & POS ---
      abrirCaja: (efectivoInicial, cajero, turno) =>
        set({
          sesionCaja: {
            id: 'caja-' + Date.now(),
            turno,
            cajero,
            efectivo_inicial: efectivoInicial,
            efectivo_esperado: efectivoInicial,
            total_ventas: 0,
            total_qr: 0,
            estado: 'abierta',
            abierta_at: new Date().toISOString(),
          },
        }),

      cerrarCaja: (efectivoContado, notas) =>
        set((state) => {
          if (!state.sesionCaja) return {};
          const diferencia = efectivoContado - state.sesionCaja.efectivo_esperado;
          const sesionCerrada: SesionCaja = {
            ...state.sesionCaja,
            efectivo_contado: efectivoContado,
            diferencia,
            estado: 'cerrada',
            cerrada_at: new Date().toISOString(),
            notas,
          };
          return {
            sesionCaja: sesionCerrada,
            historialSesiones: [sesionCerrada, ...(state.historialSesiones || [])],
          };
        }),

      registrarPago: (pedidoId, pagoData) => {
        markEventHandled('pago-' + pedidoId);
        const pedidoPrev = get().pedidos.find((p) => p.id === pedidoId);
        set((state) => {
          const pedido = state.pedidos.find((p) => p.id === pedidoId);
          const monto = pagoData.monto;
          const esQr = pagoData.metodo === 'qr';

          const sesionActual = state.sesionCaja;
          let sesionUpdated = sesionActual;
          if (sesionActual && sesionActual.estado === 'abierta') {
            sesionUpdated = {
              ...sesionActual,
              total_ventas: sesionActual.total_ventas + monto,
              total_qr: sesionActual.total_qr + (esQr ? monto : 0),
              efectivo_esperado: sesionActual.efectivo_esperado + (esQr ? 0 : monto),
            };
          }

          // Registrar el pago en el historial de transacciones
          const horaActual = new Date().getHours();
          const turnoInferido = horaActual < 14 ? 'manana' : horaActual < 19 ? 'tarde' : 'noche';
          const nuevoPago: Pago = {
            ...pagoData,
            id: 'pago-' + Date.now(),
            pedido_id: pedidoId,
            cliente_nombre:
              pagoData.cliente_nombre ||
              pedido?.cliente_nombre ||
              (pedido?.mesa_numero ? `Mesa ${pedido.mesa_numero}` : 'Cliente Mostrador'),
            mesa_numero: pagoData.mesa_numero ?? pedido?.mesa_numero,
            turno: pagoData.turno || sesionActual?.turno || turnoInferido,
            cajero: pagoData.cajero || sesionActual?.cajero || 'Cajero Principal',
            modalidad: pagoData.modalidad || (pedido?.mesa_numero ? 'mesa' : 'retiro'),
            created_at: new Date().toISOString(),
          };

          // Marcar pedido como pagado y liberar mesa
          const pedidosUpdated = state.pedidos.map((p) =>
            p.id === pedidoId ? { ...p, estado: 'pagado' as EstadoPedido, updated_at: new Date().toISOString() } : p
          );

          const mesasUpdated = state.mesas.map((m) =>
            pedido && m.numero === pedido.mesa_numero ? { ...m, estado: 'libre' as EstadoMesa } : m
          );

          const alertasUpdated = state.alertas.map((a) =>
            pedido && a.mesa_numero === pedido.mesa_numero ? { ...a, atendida: true } : a
          );

          return {
            pedidos: pedidosUpdated,
            mesas: mesasUpdated,
            alertas: alertasUpdated,
            sesionCaja: sesionUpdated,
            pagos: [nuevoPago, ...(state.pagos || [])],
          };
        });
        broadcastSync('PAYMENT_COMPLETED', {
          pedidoId,
          mesa_numero: pedidoPrev?.mesa_numero,
          monto: pagoData.monto,
        });
      },

      // --- Reservas ---
      addReserva: (data) =>
        set((state) => ({
          reservas: [
            {
              ...data,
              id: 'res-' + Date.now(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            ...state.reservas,
          ],
        })),

      updateReservaEstado: (id, estado) =>
        set((state) => ({
          reservas: state.reservas.map((r) =>
            r.id === id ? { ...r, estado, updated_at: new Date().toISOString() } : r
          ),
        })),

      // --- Configuración QR Bancario Simple (Generado en App de Banco) ---
      qrBancarioUrl: "/img/logo/logo.png",
      qrBancarioTitular: "Dencker Pan S.R.L.",
      qrBancarioBanco: "Banco Nacional de Bolivia (BNB) / BCP Simple",

      setQrBancarioConfig: (config) => {
        set((state) => ({
          qrBancarioUrl: config.url || state.qrBancarioUrl,
          qrBancarioTitular: config.titular || state.qrBancarioTitular,
          qrBancarioBanco: config.banco || state.qrBancarioBanco,
        }));
        broadcastSync('QR_CONFIG_UPDATED', config);
      },

      // --- Personal & Cuentas Staff (Admin) ---
      setUsuariosStaff: (usuariosStaff) => set({ usuariosStaff }),

      addUsuarioStaff: (data) =>
        set((state) => {
          const nuevo: UsuarioStaff = {
            ...data,
            id: 'usr-' + Date.now(),
            created_at: new Date().toISOString(),
            ultimo_acceso: new Date().toISOString(),
          };
          const updated = [...state.usuariosStaff, nuevo];
          broadcastSync('STAFF_UPDATED', updated);
          return { usuariosStaff: updated };
        }),

      updateUsuarioStaff: (id, data) =>
        set((state) => {
          const updated = state.usuariosStaff.map((u) =>
            u.id === id ? { ...u, ...data } : u
          );
          broadcastSync('STAFF_UPDATED', updated);
          return { usuariosStaff: updated };
        }),

      deleteUsuarioStaff: (id) =>
        set((state) => {
          const updated = state.usuariosStaff.filter((u) => u.id !== id);
          broadcastSync('STAFF_UPDATED', updated);
          return { usuariosStaff: updated };
        }),

      // --- Facturación SIAT / Impuestos Bolivia (Token Contadora & CUFD) ---
      facturacionSiatConfig: {
        tokenSiat: '',
        linkImpuestos: 'https://siat.impuestos.gob.bo/consulta/QR',
        linkContadora: 'https://siat.impuestos.gob.bo/consulta/QR?nit=389201024',
        cufd: 'B98F7A1E2D4C3B890F',
        autorizacionDosificacion: '3892010240001',
        codigoPuntoVenta: 1,
        razonSocialEmisor: 'DENCKER PAN CAFETERÍA & PANADERÍA S.R.L.',
        nitEmisor: '389201024',
        activa: true,
        modalidad: 'computarizada_linea',
        leyendaLey453: 'Ley N° 453: Los servicios deben prestarse en condiciones de inocuidad y calidad.',
        siguienteNumeroFactura: 1,
        fechaLimiteEmision: '2027-04-30',
        actividadEconomica: '561000 - Servicios de restaurantes, cafeterías y panaderías',
      },
      asistencias: SEED_ASISTENCIAS,
      geocercaConfig: DEFAULT_GEOCERCA_CONFIG,

      addRegistroAsistencia: (regData) => {
        const nuevo: RegistroAsistencia = {
          ...regData,
          id: 'asist-' + Date.now(),
          created_at: new Date().toISOString(),
        };
        set((state) => ({
          asistencias: [nuevo, ...(state.asistencias || [])],
        }));
        broadcastSync('ATTENDANCE_RECORDED', nuevo);
        return nuevo;
      },

      updateGeocercaConfig: (cfg) => {
        set((state) => ({
          geocercaConfig: { ...state.geocercaConfig, ...cfg },
        }));
        broadcastSync('GEOCERCA_CONFIG_UPDATED', cfg);
      },

      clearHistorialAsistencias: () => {
        set({ asistencias: [] });
      },

      facturasEmitidas: [],

      setFacturacionSiatConfig: (cfg) => {
        set((state) => ({
          facturacionSiatConfig: { ...state.facturacionSiatConfig, ...cfg },
        }));
        broadcastSync('SIAT_CONFIG_UPDATED', cfg);
      },

      emitirFacturaSiat: ({ clienteNombre, clienteNitCi, clienteComplemento, montoTotal, pedidoId }) => {
        const state = get();
        const cfg = state.facturacionSiatConfig;
        const numFactura = cfg.siguienteNumeroFactura || (state.facturasEmitidas.length + 1);
        const now = new Date();

        // Generar CUF oficial algorítmico del SIN
        const cuf = generarCufSiat({
          nitEmisor: cfg.nitEmisor,
          fechaHora: now,
          sucursal: 0,
          numeroFactura: numFactura,
          puntoVenta: cfg.codigoPuntoVenta || 1,
        });

        // Convertir monto a literal oficial
        const montoLiteral = convertirNumeroALiteral(montoTotal);

        // Generar URL del QR tributario
        const urlQr = generarUrlQrSiat({
          config: cfg,
          factura: {
            numeroFactura: numFactura,
            cuf,
            fechaEmision: now.toISOString(),
            montoTotal,
            clienteNitCi: clienteNitCi || '0',
          },
        });

        const nueva: FacturaEmitida = {
          id: 'fac-' + Date.now(),
          numeroFactura: numFactura,
          cuf,
          cufd: cfg.cufd || 'B98F7A1E2D4C3B890F',
          fechaEmision: now.toISOString(),
          fechaLimiteEmision: cfg.fechaLimiteEmision || '2027-04-30',
          clienteNombre: clienteNombre || 'Sin Nombre',
          clienteNitCi: clienteNitCi || '0',
          clienteComplemento,
          montoTotal,
          montoLiteral,
          leyendaLey453: cfg.leyendaLey453,
          codigoControl: cuf.substring(Math.max(0, cuf.length - 8)),
          urlQrVerificacion: urlQr,
          pedidoId,
          estado: 'emitida',
        };

        // Incremento automático de número correlativo
        set((s) => ({
          facturasEmitidas: [nueva, ...s.facturasEmitidas],
          facturacionSiatConfig: {
            ...s.facturacionSiatConfig,
            siguienteNumeroFactura: numFactura + 1,
          },
        }));

        return nueva;
      },

      resetToDefaults: () =>
        set({
          zonas: SEED_ZONAS,
          mesas: SEED_MESAS,
          categorias: SEED_CATEGORIAS,
          productos: SEED_PRODUCTOS,
          usuariosStaff: SEED_USUARIOS_STAFF,
          pagos: SEED_PAGOS,
          historialSesiones: SEED_HISTORIAL_SESIONES,
          qrBancarioUrl: "/img/brand/logo-3-don-dencker-badge.png",
          qrBancarioTitular: "Dencker Pan S.R.L.",
          qrBancarioBanco: "Banco Nacional de Bolivia (BNB) / BCP Simple",
          facturacionSiatConfig: {
            tokenSiat: '',
            linkImpuestos: 'https://siat.impuestos.gob.bo/consulta/QR',
            linkContadora: 'https://siat.impuestos.gob.bo/consulta/QR?nit=389201024',
            cufd: 'B98F7A1E2D4C3B890F',
            autorizacionDosificacion: '3892010240001',
            codigoPuntoVenta: 1,
            razonSocialEmisor: 'DENCKER PAN CAFETERÍA & PANADERÍA S.R.L.',
            nitEmisor: '389201024',
            activa: true,
            modalidad: 'computarizada_linea',
            leyendaLey453: 'Ley N° 453: Los servicios deben prestarse en condiciones de inocuidad y calidad.',
            siguienteNumeroFactura: 1,
            fechaLimiteEmision: '2027-04-30',
            actividadEconomica: '561000 - Servicios de restaurantes, cafeterías y panaderías',
          },
          facturasEmitidas: [],
        }),
    }),
    {
      name: 'dencker-pan-system-v8-brand-navbar-update',
    }
  )
);

// ============================
// CART STORE (Mesa del cliente)
// ============================
interface CartStore {
  items: CartItem[];
  mesaNumero: number | null;
  pedidoId: string | null;
  addItem: (
    producto: Producto,
    chips?: string[],
    notas?: string,
    tamanio?: string,
    precioUnitario?: number
  ) => void;
  removeItem: (productoId: string, tamanio?: string) => void;
  updateCantidad: (productoId: string, cantidad: number, tamanio?: string) => void;
  clearCart: () => void;
  setMesa: (numero: number) => void;
  setPedidoId: (id: string) => void;
  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  mesaNumero: null,
  pedidoId: null,

  addItem: (producto, chips = [], notas, tamanio, precioUnitario) =>
    set((state) => {
      const effectivePrice = precioUnitario !== undefined ? precioUnitario : producto.precio;
      const existingIndex = state.items.findIndex(
        (i) =>
          i.producto.id === producto.id &&
          (i.tamanio || "") === (tamanio || "") &&
          JSON.stringify(i.chips_seleccionados || []) === JSON.stringify(chips || [])
      );

      if (existingIndex > -1) {
        const updated = [...state.items];
        updated[existingIndex] = {
          ...updated[existingIndex],
          cantidad: updated[existingIndex].cantidad + 1,
          precio_unitario: effectivePrice,
        };
        return { items: updated };
      }

      return {
        items: [
          ...state.items,
          {
            producto,
            cantidad: 1,
            chips_seleccionados: chips,
            notas,
            tamanio,
            precio_unitario: effectivePrice,
          },
        ],
      };
    }),

  removeItem: (productoId, tamanio) =>
    set((state) => ({
      items: state.items.filter((i) => {
        if (tamanio !== undefined) {
          return !(i.producto.id === productoId && (i.tamanio || "") === (tamanio || ""));
        }
        return i.producto.id !== productoId;
      }),
    })),

  updateCantidad: (productoId, cantidad, tamanio) =>
    set((state) => ({
      items:
        cantidad <= 0
          ? state.items.filter((i) => {
              if (tamanio !== undefined) {
                return !(i.producto.id === productoId && (i.tamanio || "") === (tamanio || ""));
              }
              return i.producto.id !== productoId;
            })
          : state.items.map((i) => {
              const matches =
                tamanio !== undefined
                  ? i.producto.id === productoId && (i.tamanio || "") === (tamanio || "")
                  : i.producto.id === productoId;
              return matches ? { ...i, cantidad } : i;
            }),
    })),

  clearCart: () => set({ items: [], pedidoId: null }),
  setMesa: (numero) => set({ mesaNumero: numero }),
  setPedidoId: (id) => set({ pedidoId: id }),
  total: () => {
    const liveProds = useSystemStore.getState().productos;
    return get().items.reduce((sum, i) => {
      const live = liveProds?.find((p) => p.id === i.producto.id);
      const unitPrice =
        i.precio_unitario !== undefined
          ? i.precio_unitario
          : live
          ? live.precio
          : i.producto.precio;
      return sum + unitPrice * i.cantidad;
    }, 0);
  },
  count: () => get().items.reduce((sum, i) => sum + i.cantidad, 0),
}));

// ============================
// UI STORE & NOTIFICATIONS
// ============================
export interface ToastNotification {
  id: string;
  tipo: 'alerta' | 'comanda' | 'cocina' | 'pago' | 'info';
  titulo: string;
  mensaje: string;
  mesa_numero?: number;
  created_at: string;
}

interface UIStore {
  currentRole: 'cliente' | 'mesero' | 'cocina' | 'caja' | 'admin';
  cartOpen: boolean;
  paymentOpen: boolean;
  paymentMode: 'todo' | 'partes' | 'items';
  toasts: ToastNotification[];
  setCurrentRole: (r: UIStore['currentRole']) => void;
  setCartOpen: (v: boolean) => void;
  setPaymentOpen: (v: boolean) => void;
  setPaymentMode: (m: UIStore['paymentMode']) => void;
  addToast: (toast: Omit<ToastNotification, 'id' | 'created_at'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  currentRole: 'cliente',
  cartOpen: false,
  paymentOpen: false,
  paymentMode: 'todo',
  toasts: [],
  setCurrentRole: (currentRole) => set({ currentRole }),
  setCartOpen: (cartOpen) => set({ cartOpen }),
  setPaymentOpen: (paymentOpen) => set({ paymentOpen }),
  setPaymentMode: (paymentMode) => set({ paymentMode }),
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastNotification = {
      ...toast,
      id,
      created_at: new Date().toISOString(),
    };
    set((state) => ({
      toasts: [newToast, ...state.toasts].slice(0, 5), // máximo 5 toasts simultáneos
    }));
    setTimeout(() => {
      get().removeToast(id);
    }, 5500);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export type Estacion = 'vitrina' | 'cafeteria' | 'cocina';
export type EstadoMesa = 'libre' | 'ocupada' | 'reservada' | 'limpieza';
export type TipoMesa = 'cuadrada' | 'redonda' | 'rectangular';
export type EstadoPedido = 'pendiente' | 'en_preparacion' | 'listo' | 'entregado' | 'pagado' | 'cancelado';
export type EstadoItem = 'pendiente' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado';
export type MetodoPago = 'efectivo' | 'qr' | 'mixto';
export type TipoAlerta = 'llamado' | 'cambio_solicitado' | 'pedido_listo' | 'cuenta_pedida' | 'pago_recibido';
export type EstadoReserva = 'pendiente' | 'confirmada' | 'produccion' | 'completada' | 'cancelada';

export interface Zona {
  id: string;
  nombre: string;
  descripcion?: string;
  orden: number;
  activa: boolean;
  created_at: string;
}

export interface Mesa {
  id: string;
  numero: number;
  zona_id?: string;
  zona?: Zona;
  tipo: TipoMesa;
  capacidad: number;
  pos_x: number;
  pos_y: number;
  ancho: number;
  alto: number;
  estado: EstadoMesa;
  activa: boolean;
  created_at: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  emoji: string;
  descripcion?: string;
  estacion: Estacion;
  orden: number;
  activa: boolean;
  imagen_url?: string;
}

export interface Producto {
  id: string;
  categoria_id?: string;
  categoria?: Categoria;
  nombre: string;
  descripcion?: string;
  precio: number;
  costo: number;
  imagen_url?: string;
  imagen_interior_url?: string;
  disponible: boolean;
  es_mas_vendido: boolean;
  stock: number;
  chips_personalizacion: string[];
  estacion: Estacion;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  producto: Producto;
  cantidad: number;
  chips_seleccionados: string[];
  notas?: string;
}

export interface ItemPedido {
  id: string;
  pedido_id: string;
  producto_id?: string;
  producto?: Producto;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  notas?: string;
  chips_seleccionados: string[];
  estacion: Estacion;
  estado: EstadoItem;
  tiempo_inicio?: string;
  tiempo_listo?: string;
  created_at: string;
  updated_at: string;
}

export interface Pedido {
  id: string;
  mesa_id?: string;
  mesa?: Mesa;
  mesa_numero?: number;
  estado: EstadoPedido;
  total: number;
  notas?: string;
  cliente_nombre?: string;
  es_ronda: boolean;
  pedido_padre_id?: string;
  items?: ItemPedido[];
  created_at: string;
  updated_at: string;
}

export interface Pago {
  id: string;
  pedido_id?: string;
  pedido?: Pedido;
  monto: number;
  metodo: MetodoPago;
  monto_recibido?: number;
  cambio: number;
  comprobante_url?: string;
  nit?: string;
  razon_social?: string;
  estado: 'pendiente' | 'completado' | 'fallido';
  items_pagados: string[];
  created_at: string;
}

export interface Reserva {
  id: string;
  nombre_cliente: string;
  telefono?: string;
  email?: string;
  tipo_evento?: string;
  fecha_evento: string;
  numero_personas: number;
  descripcion?: string;
  monto_total?: number;
  monto_sena?: number;
  estado: EstadoReserva;
  notas_admin?: string;
  comprobante_sena_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AlertaMesero {
  id: string;
  mesa_id?: string;
  mesa?: Mesa;
  mesa_numero?: number;
  tipo: TipoAlerta;
  mensaje?: string;
  datos_extra: Record<string, unknown>;
  atendida: boolean;
  created_at: string;
}

export interface SesionCaja {
  id: string;
  turno: 'manana' | 'tarde' | 'noche';
  cajero?: string;
  efectivo_inicial: number;
  efectivo_esperado: number;
  efectivo_contado?: number;
  diferencia?: number;
  total_ventas: number;
  total_qr: number;
  estado: 'abierta' | 'cerrada';
  abierta_at: string;
  cerrada_at?: string;
  notas?: string;
}

export interface BilleteBoliviano {
  valor: number;
  label: string;
  tipo: 'billete' | 'moneda';
}

export const BILLETES_BOLIVIANOS: BilleteBoliviano[] = [
  { valor: 200, label: 'Bs 200', tipo: 'billete' },
  { valor: 100, label: 'Bs 100', tipo: 'billete' },
  { valor: 50,  label: 'Bs 50',  tipo: 'billete' },
  { valor: 20,  label: 'Bs 20',  tipo: 'billete' },
  { valor: 10,  label: 'Bs 10',  tipo: 'billete' },
  { valor: 5,   label: 'Bs 5',   tipo: 'billete' },
  { valor: 2,   label: 'Bs 2',   tipo: 'moneda'  },
  { valor: 1,   label: 'Bs 1',   tipo: 'moneda'  },
  { valor: 0.5, label: '50 cts', tipo: 'moneda'  },
];

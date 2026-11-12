export type Estacion = 'vitrina' | 'cafeteria' | 'cocina';
export type EstadoMesa = 'libre' | 'ocupada' | 'reservada' | 'limpieza';
export type TipoMesa = 'cuadrada' | 'redonda' | 'rectangular';
export type PisoCafeteria = 'planta_baja' | 'terraza';
export type SubzonaMesa = 'patio_exterior' | 'salon_interior' | 'terraza_abierta' | 'terraza_balcon';
export type CloudStorageProvider = 'cloudinary' | 'supabase' | 'imgbb';
export type EstadoPedido = 'pendiente' | 'en_preparacion' | 'listo' | 'entregado' | 'pagado' | 'cancelado';
export type EstadoItem = 'pendiente' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado';
export type MetodoPago = 'efectivo' | 'qr' | 'qr_simple' | 'mixto';
export type TipoAlerta = 'llamado' | 'cambio_solicitado' | 'pedido_listo' | 'cuenta_pedida' | 'pago_recibido';
export type EstadoReserva = 'pendiente' | 'confirmada' | 'produccion' | 'completada' | 'cancelada';
export type StaffRole = 'admin' | 'mesero' | 'cocina' | 'caja';

export interface UsuarioStaff {
  id: string;
  nombre: string;
  role: StaffRole;
  cargo: string;
  pin: string;
  activo: boolean;
  telefono?: string;
  created_at: string;
  ultimo_acceso?: string;
}

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
  piso?: PisoCafeteria;
  subzona?: SubzonaMesa;
  zona_id?: string;
  zona?: Zona;
  tipo: TipoMesa;
  capacidad: number;
  sillas?: number;
  pos_x: number;
  pos_y: number;
  ancho: number;
  alto: number;
  rotacion?: number;
  asientos_nombres?: Record<number, string>;
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
  created_at?: string;
  updated_at?: string;
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
  asiento_numero?: number;
  comensal_nombre?: string;
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
  cliente_nombre?: string;
  mesa_numero?: number;
  turno?: 'manana' | 'tarde' | 'noche';
  modalidad?: 'mesa' | 'retiro' | 'delivery' | 'reserva';
  cajero?: string;
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

export interface FacturacionSiatConfig {
  tokenSiat: string;
  linkImpuestos: string;
  linkContadora: string;
  cufd: string;
  autorizacionDosificacion?: string;
  codigoPuntoVenta: number;
  razonSocialEmisor: string;
  nitEmisor: string;
  activa: boolean;
  modalidad: 'electronica_linea' | 'computarizada_linea' | 'recibo_oficial';
  leyendaLey453: string;
  siguienteNumeroFactura: number;
  fechaLimiteEmision: string;
  actividadEconomica: string;
}

export interface FacturaEmitida {
  id: string;
  numeroFactura: number;
  cuf: string;
  cufd: string;
  fechaEmision: string;
  fechaLimiteEmision?: string;
  clienteNombre: string;
  clienteNitCi: string;
  clienteComplemento?: string;
  montoTotal: number;
  montoLiteral?: string;
  leyendaLey453?: string;
  codigoControl?: string;
  urlQrVerificacion: string;
  pedidoId: string;
  estado: 'emitida' | 'anulada';
}


export interface UploadResult {
  url: string;
  provider: CloudStorageProvider;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}


// ── SISTEMA DE ASISTENCIAS CON GEOCERCA GPS ──
export type TipoMarcadoAsistencia = 'entrada' | 'salida' | 'almuerzo_inicio' | 'almuerzo_fin';
export type EstadoPuntualidad = 'a_tiempo' | 'tardanza' | 'salida_anticipada' | 'salida_puntual';

export interface RegistroAsistencia {
  id: string;
  personal_id: string;
  personal_nombre: string;
  cargo: string;
  tipo: TipoMarcadoAsistencia;
  fecha: string; // YYYY-MM-DD
  hora: string;  // HH:MM:SS
  latitud?: number;
  longitud?: number;
  distancia_metros: number;
  dentro_del_radio: boolean;
  precision_gps_metros?: number;
  estado_puntualidad: EstadoPuntualidad;
  observaciones?: string;
  created_at: string;
}

export interface GeocercaConfig {
  local_nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
  radio_metros: number; // Radio en metros (ej. 50m o 100m)
  hora_inicio_turno_manana: string; // "07:00"
  hora_inicio_turno_tarde: string;  // "14:00"
  tolerancia_minutos: number;       // Tolerancia de tardanza (minutos)
  bloquear_fuera_de_radio: boolean; // Si true, bloquea el marcado fuera del radio
}

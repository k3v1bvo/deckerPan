import fs from 'fs';

const rawData = JSON.parse(fs.readFileSync('scripts/denckerpan_completo.json', 'utf8'));
const lookup = fs.existsSync('scripts/img_lookup.json')
  ? JSON.parse(fs.readFileSync('scripts/img_lookup.json', 'utf8'))
  : {};

// 7 Categorías Oficiales Dencker Pan con imágenes de ImgBB
const CATEGORIAS_OFICIALES = [
  {
    id: "c1",
    nombre: "Galletas",
    emoji: "🍪",
    descripcion: "Galletas finas, caukas con queso y galletitas artesanales",
    estacion: "vitrina",
    orden: 1,
    activa: true,
    imagen_url: lookup.categorias?.['1'] || "https://tienda.denckerpan.com/img/categories/image_1.jpg"
  },
  {
    id: "c2",
    nombre: "Masitas Saladas",
    emoji: "🥟",
    descripcion: "Empanadas de queso, cuñapés calientes y palitos salados",
    estacion: "vitrina",
    orden: 2,
    activa: true,
    imagen_url: lookup.categorias?.['2'] || "https://tienda.denckerpan.com/img/categories/image_2.jpg"
  },
  {
    id: "c3",
    nombre: "Panadería",
    emoji: "🥖",
    descripcion: "Pan de masa madre, baguettes tradicionales y marraquetas",
    estacion: "vitrina",
    orden: 3,
    activa: true,
    imagen_url: lookup.categorias?.['3'] || "https://tienda.denckerpan.com/img/categories/image_3.jpg"
  },
  {
    id: "c4",
    nombre: "Pastelería",
    emoji: "🍰",
    descripcion: "Alfajores de maicena, croissants hojaldrados y pies artesanales",
    estacion: "vitrina",
    orden: 4,
    activa: true,
    imagen_url: lookup.categorias?.['4'] || "https://tienda.denckerpan.com/img/categories/image_4.jpg"
  },
  {
    id: "c5",
    nombre: "Queques",
    emoji: "🧁",
    descripcion: "Queques caseros, pasta frola y budines horneados diariamente",
    estacion: "vitrina",
    orden: 5,
    activa: true,
    imagen_url: lookup.categorias?.['5'] || "https://tienda.denckerpan.com/img/categories/image_5.jpg"
  },
  {
    id: "c6",
    nombre: "Pizzas & Calientes",
    emoji: "🍕",
    descripcion: "Pizzas artesanales, esfihas horneadas y especialidades de la casa",
    estacion: "cocina",
    orden: 6,
    activa: true,
    imagen_url: lookup.categorias?.['6'] || "https://tienda.denckerpan.com/img/categories/image_6.jpg"
  },
  {
    id: "c7",
    nombre: "Bebidas & Barismo",
    emoji: "☕",
    descripcion: "Café de especialidad de los Yungas, jugos naturales y refrescos",
    estacion: "cafeteria",
    orden: 7,
    activa: true,
    imagen_url: lookup.categorias?.['7'] || "https://tienda.denckerpan.com/img/categories/image_7.jpg"
  }
];

// Mapeo de categorías del scraper a nuestros IDs
const MAP_CAT = {
  'GALLETAS': 'c1',
  'MASITAS SALADAS': 'c2',
  'PANADERÍA': 'c3',
  'PASTELERIA': 'c4',
  'QUEQUES': 'c5',
  'PIZZAS': 'c6',
  'BEBIDAS': 'c7',
  'MÁS VENDIDOS': 'c2'
};

// Generar lista de productos tipados
const productosFinales = [];

for (let i = 0; i < rawData.productos.length; i++) {
  const p = rawData.productos[i];
  const catId = MAP_CAT[p.categoria] || 'c1';

  // Buscar si tiene URL de ImgBB en lookup o usar la imagen original
  let imagenUrl = lookup.productos?.[p.id] || p.imagen;
  if (!imagenUrl || imagenUrl.includes('product_blank.jpg')) {
    // Si no tiene foto, asignar foto de su categoría
    const catObj = CATEGORIAS_OFICIALES.find(c => c.id === catId);
    imagenUrl = catObj?.imagen_url || "https://tienda.denckerpan.com/img/product_blank.jpg";
  }

  // Estación por categoría
  let estacion = 'vitrina';
  if (catId === 'c6') estacion = 'cocina';
  if (catId === 'c7') estacion = 'cafeteria';

  // Chips sugeridos según tipo
  let chips = ['Sin azúcar', 'Para llevar'];
  if (catId === 'c7') {
    chips = ['Sin azúcar', 'Con Stevia', 'Bien caliente', 'Leche deslactosada'];
  } else if (catId === 'c6') {
    chips = ['Bien caliente', 'Con orégano extra', 'Para compartir'];
  } else if (['c1', 'c2', 'c3', 'c4'].includes(catId)) {
    chips = ['Calentar en horno', 'Empacar para regalo', 'Recién horneado'];
  }

  const esTop = [
    'Empanada de queso',
    'Cuñapé',
    'Esfihas',
    'Alfajores Maicena',
    'Croasan de Queso',
    'Palitos de queso',
    'Pie de limón (Pequeño)',
    'Caukas con queso',
    'Galleta Chip',
    'Pizza 4 Estaciones'
  ].includes(p.nombre) || Boolean(p.es_mas_vendido);

  const costoEstimado = Math.max(1, Math.round(p.precio * 0.35 * 10) / 10);

  productosFinales.push({
    id: `prod_${i + 1}`,
    categoria_id: catId,
    nombre: p.nombre,
    descripcion: `Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.`,
    precio: p.precio,
    costo: costoEstimado,
    imagen_url: imagenUrl,
    disponible: true,
    es_mas_vendido: esTop,
    stock: p.stock > 1000 ? -1 : p.stock,
    chips_personalizacion: chips,
    estacion: estacion,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
}

// 1. Escribir src/lib/seed-data.ts actualizado
const tsContent = `// ==========================================
// DENCKER PAN — SEED DATA REAL & AUTHENTIC
// Extracted from tienda.denckerpan.com & ImgBB
// ==========================================

import { Zona, Mesa, Categoria, Producto, Reserva } from '@/types';

export const DENCKER_ASSETS = {
  logo: "${lookup.logo || 'https://i.ibb.co/qMkf00HN/dencker-logo.png'}",
  banners: ${JSON.stringify(lookup.banners || ['https://i.ibb.co/bjzqQPhh/dencker-banner-1.jpg'], null, 2)},
  barcodeSound: "https://tienda.denckerpan.com/pedido/sounds/barcode.mp3",
  whatsapp: "https://wa.me/59176911000",
  whatsappNumber: "+591 76911000"
};

export const SEED_ZONAS: Zona[] = [
  { id: 'z1', nombre: 'Salón Principal', descripcion: 'Ambiente climatizado con vista a la vitrina de panadería', orden: 1, activa: true, created_at: new Date().toISOString() },
  { id: 'z2', nombre: 'Terraza Jardín', descripcion: 'Mesas al aire libre con sombrillas', orden: 2, activa: true, created_at: new Date().toISOString() },
  { id: 'z3', nombre: 'Barra Barismo', descripcion: 'Atención rápida frente a las máquinas de espresso La Marzocco', orden: 3, activa: true, created_at: new Date().toISOString() },
  { id: 'z4', nombre: 'Patio Colonial', descripcion: 'Área tranquila para lectura y reuniones ejecutivas', orden: 4, activa: true, created_at: new Date().toISOString() },
  { id: 'z5', nombre: 'Sala VIP / Eventos', descripcion: 'Espacio privado para catering y degustaciones reservadas', orden: 5, activa: true, created_at: new Date().toISOString() },
  { id: 'z6', nombre: 'Balcón Superior', descripcion: 'Vista panorámica y mesas para parejas', orden: 6, activa: true, created_at: new Date().toISOString() }
];

export const SEED_MESAS: Mesa[] = [
  { id: 'm01', numero: 1,  zona_id: 'z1', tipo: 'redonda',     capacidad: 2, pos_x: 15, pos_y: 20, ancho: 70,  alto: 70,  estado: 'libre',     activa: true, created_at: new Date().toISOString() },
  { id: 'm02', numero: 2,  zona_id: 'z1', tipo: 'cuadrada',    capacidad: 4, pos_x: 35, pos_y: 20, ancho: 80,  alto: 80,  estado: 'ocupada',   activa: true, created_at: new Date().toISOString() },
  { id: 'm03', numero: 3,  zona_id: 'z1', tipo: 'cuadrada',    capacidad: 4, pos_x: 55, pos_y: 20, ancho: 80,  alto: 80,  estado: 'libre',     activa: true, created_at: new Date().toISOString() },
  { id: 'm04', numero: 4,  zona_id: 'z1', tipo: 'rectangular', capacidad: 6, pos_x: 75, pos_y: 20, ancho: 110, alto: 70,  estado: 'ocupada',   activa: true, created_at: new Date().toISOString() },
  { id: 'm05', numero: 5,  zona_id: 'z1', tipo: 'redonda',     capacidad: 2, pos_x: 15, pos_y: 45, ancho: 70,  alto: 70,  estado: 'reservada', activa: true, created_at: new Date().toISOString() },
  { id: 'm06', numero: 6,  zona_id: 'z1', tipo: 'cuadrada',    capacidad: 4, pos_x: 35, pos_y: 45, ancho: 80,  alto: 80,  estado: 'libre',     activa: true, created_at: new Date().toISOString() },
  { id: 'm07', numero: 7,  zona_id: 'z1', tipo: 'cuadrada',    capacidad: 4, pos_x: 55, pos_y: 45, ancho: 80,  alto: 80,  estado: 'limpieza',  activa: true, created_at: new Date().toISOString() },
  { id: 'm08', numero: 8,  zona_id: 'z1', tipo: 'rectangular', capacidad: 8, pos_x: 75, pos_y: 45, ancho: 120, alto: 80,  estado: 'libre',     activa: true, created_at: new Date().toISOString() },
  { id: 'm09', numero: 9,  zona_id: 'z2', tipo: 'redonda',     capacidad: 3, pos_x: 20, pos_y: 25, ancho: 75,  alto: 75,  estado: 'libre',     activa: true, created_at: new Date().toISOString() },
  { id: 'm10', numero: 10, zona_id: 'z2', tipo: 'cuadrada',    capacidad: 4, pos_x: 45, pos_y: 25, ancho: 80,  alto: 80,  estado: 'ocupada',   activa: true, created_at: new Date().toISOString() },
  { id: 'm11', numero: 11, zona_id: 'z2', tipo: 'cuadrada',    capacidad: 4, pos_x: 70, pos_y: 25, ancho: 80,  alto: 80,  estado: 'libre',     activa: true, created_at: new Date().toISOString() },
  { id: 'm12', numero: 12, zona_id: 'z2', tipo: 'rectangular', capacidad: 6, pos_x: 20, pos_y: 60, ancho: 110, alto: 70,  estado: 'libre',     activa: true, created_at: new Date().toISOString() },
  { id: 'm13', numero: 13, zona_id: 'z3', tipo: 'redonda',     capacidad: 2, pos_x: 25, pos_y: 30, ancho: 60,  alto: 60,  estado: 'libre',     activa: true, created_at: new Date().toISOString() },
  { id: 'm14', numero: 14, zona_id: 'z3', tipo: 'redonda',     capacidad: 2, pos_x: 50, pos_y: 30, ancho: 60,  alto: 60,  estado: 'ocupada',   activa: true, created_at: new Date().toISOString() },
  { id: 'm15', numero: 15, zona_id: 'z3', tipo: 'redonda',     capacidad: 2, pos_x: 75, pos_y: 30, ancho: 60,  alto: 60,  estado: 'libre',     activa: true, created_at: new Date().toISOString() },
  { id: 'm16', numero: 16, zona_id: 'z4', tipo: 'cuadrada',    capacidad: 4, pos_x: 30, pos_y: 35, ancho: 80,  alto: 80,  estado: 'libre',     activa: true, created_at: new Date().toISOString() },
  { id: 'm17', numero: 17, zona_id: 'z4', tipo: 'cuadrada',    capacidad: 4, pos_x: 60, pos_y: 35, ancho: 80,  alto: 80,  estado: 'libre',     activa: true, created_at: new Date().toISOString() },
  { id: 'm18', numero: 18, zona_id: 'z5', tipo: 'rectangular', capacidad: 12, pos_x: 50, pos_y: 50, ancho: 160, alto: 90, estado: 'reservada', activa: true, created_at: new Date().toISOString() },
  { id: 'm19', numero: 19, zona_id: 'z6', tipo: 'redonda',     capacidad: 2, pos_x: 35, pos_y: 40, ancho: 70,  alto: 70,  estado: 'libre',     activa: true, created_at: new Date().toISOString() },
  { id: 'm20', numero: 20, zona_id: 'z6', tipo: 'redonda',     capacidad: 2, pos_x: 65, pos_y: 40, ancho: 70,  alto: 70,  estado: 'libre',     activa: true, created_at: new Date().toISOString() }
];

export const SEED_CATEGORIAS: Categoria[] = ${JSON.stringify(CATEGORIAS_OFICIALES, null, 2)};

export const SEED_PRODUCTOS: Producto[] = ${JSON.stringify(productosFinales, null, 2)};

export const SEED_RESERVAS: Reserva[] = [
  {
    id: 'res-1',
    nombre_cliente: 'Claudia Villena',
    telefono: '+591 76543210',
    email: 'claudia.v@gmail.com',
    tipo_evento: 'Brunch Corporativo',
    fecha_evento: new Date(Date.now() + 86400000 * 2).toISOString(),
    numero_personas: 35,
    descripcion: 'Mesa imperial con selección de panes de masa madre, cuñapés calientes y barra de café filtrado.',
    monto_total: 1575.00,
    monto_sena: 500.00,
    estado: 'confirmada',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'res-2',
    nombre_cliente: 'Mauricio Paz',
    telefono: '+591 71234567',
    email: 'mpaz@innovabolivia.com',
    tipo_evento: 'Cumpleaños Familiar',
    fecha_evento: new Date(Date.now() + 86400000 * 4).toISOString(),
    numero_personas: 50,
    descripcion: 'Torta de mil hojas grande, empanadas de queso, esfihas y mini-pizzas artesanales.',
    monto_total: 2250.00,
    monto_sena: 800.00,
    estado: 'produccion',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];
`;

fs.writeFileSync('src/lib/seed-data.ts', tsContent);
console.log(`✅ src/lib/seed-data.ts actualizado con ${CATEGORIAS_OFICIALES.length} categorías y ${productosFinales.length} productos reales.`);

// 2. Generar script para actualizar Supabase
const supabaseSeedScript = `
const { Client } = require('pg');
const DB_URL = 'postgresql://postgres:delunoalnueve_19@db.ixdpabvlcdogcsdxxcid.supabase.co:5432/postgres';

const categorias = ${JSON.stringify(CATEGORIAS_OFICIALES)};
const productos = ${JSON.stringify(productosFinales)};

async function syncSupabase() {
  const client = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 20000,
  });

  try {
    console.log('Conectando a Supabase PostgreSQL...');
    await client.connect();

    console.log('Actualizando Categorías...');
    for (const c of categorias) {
      await client.query(\`
        INSERT INTO categorias (nombre, emoji, descripcion, estacion, orden, activa)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING;
      \`, [c.nombre, c.emoji, c.descripcion, c.estacion, c.orden, c.activa]);
    }

    console.log('Insertando o actualizando \${productos.length} productos reales de Dencker Pan...');
    for (const p of productos) {
      // Buscar el UUID de la categoría
      const catRes = await client.query('SELECT id FROM categorias WHERE nombre ILIKE $1 LIMIT 1', [
        p.categoria_id === 'c1' ? '%galletas%' :
        p.categoria_id === 'c2' ? '%masitas%' :
        p.categoria_id === 'c3' ? '%panadería%' :
        p.categoria_id === 'c4' ? '%pastelería%' :
        p.categoria_id === 'c5' ? '%queques%' :
        p.categoria_id === 'c6' ? '%pizzas%' : '%bebidas%'
      ]);
      const catUuid = catRes.rows[0]?.id || null;

      await client.query(\`
        INSERT INTO productos (categoria_id, nombre, descripcion, precio, costo, imagen_url, disponible, es_mas_vendido, stock, estacion, chips_personalizacion)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT DO NOTHING;
      \`, [
        catUuid,
        p.nombre,
        p.descripcion,
        p.precio,
        p.costo,
        p.imagen_url,
        p.disponible,
        p.es_mas_vendido,
        p.stock,
        p.estacion,
        JSON.stringify(p.chips_personalizacion)
      ]);
    }

    const { rows: count } = await client.query('SELECT COUNT(*) as total FROM productos;');
    console.log('✅ Supabase actualizado con éxito! Total productos en BD: ' + count[0].total);
  } catch (err) {
    console.error('Error sincronizando Supabase:', err.message);
  } finally {
    await client.end();
  }
}

syncSupabase();
`;

fs.writeFileSync('scripts/sync-supabase-real.cjs', supabaseSeedScript);
console.log('✅ scripts/sync-supabase-real.cjs generado.');

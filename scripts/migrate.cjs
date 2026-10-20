
const { Client } = require('pg');

const DB_URL = 'postgresql://postgres:delunoalnueve_19@db.ixdpabvlcdogcsdxxcid.supabase.co:5432/postgres';

const SQL_SCHEMA = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS zonas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  orden INTEGER DEFAULT 0,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mesas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  numero INTEGER NOT NULL UNIQUE,
  zona_id UUID REFERENCES zonas(id) ON DELETE SET NULL,
  tipo TEXT CHECK (tipo IN ('cuadrada','redonda','rectangular')) DEFAULT 'cuadrada',
  capacidad INTEGER DEFAULT 4,
  pos_x FLOAT DEFAULT 50,
  pos_y FLOAT DEFAULT 50,
  ancho FLOAT DEFAULT 80,
  alto FLOAT DEFAULT 80,
  estado TEXT CHECK (estado IN ('libre','ocupada','reservada','limpieza')) DEFAULT 'libre',
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categorias (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre TEXT NOT NULL,
  emoji TEXT DEFAULT '🍞',
  descripcion TEXT,
  estacion TEXT CHECK (estacion IN ('vitrina','cafeteria','cocina')) DEFAULT 'vitrina',
  orden INTEGER DEFAULT 0,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS productos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  costo DECIMAL(10,2) DEFAULT 0,
  imagen_url TEXT,
  disponible BOOLEAN DEFAULT true,
  es_mas_vendido BOOLEAN DEFAULT false,
  stock INTEGER DEFAULT -1,
  chips_personalizacion JSONB DEFAULT '[]',
  estacion TEXT CHECK (estacion IN ('vitrina','cafeteria','cocina')) DEFAULT 'vitrina',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pedidos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mesa_id UUID REFERENCES mesas(id) ON DELETE SET NULL,
  mesa_numero INTEGER,
  estado TEXT CHECK (estado IN ('pendiente','en_preparacion','listo','entregado','pagado','cancelado')) DEFAULT 'pendiente',
  total DECIMAL(10,2) DEFAULT 0,
  notas TEXT,
  cliente_nombre TEXT,
  es_ronda BOOLEAN DEFAULT false,
  pedido_padre_id UUID REFERENCES pedidos(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS items_pedido (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id) ON DELETE SET NULL,
  producto_nombre TEXT NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  notas TEXT,
  chips_seleccionados JSONB DEFAULT '[]',
  estacion TEXT CHECK (estacion IN ('vitrina','cafeteria','cocina')) DEFAULT 'vitrina',
  estado TEXT CHECK (estado IN ('pendiente','en_preparacion','listo','entregado','cancelado')) DEFAULT 'pendiente',
  tiempo_inicio TIMESTAMPTZ,
  tiempo_listo TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pagos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE SET NULL,
  monto DECIMAL(10,2) NOT NULL,
  metodo TEXT CHECK (metodo IN ('efectivo','qr','mixto')) DEFAULT 'efectivo',
  monto_recibido DECIMAL(10,2),
  cambio DECIMAL(10,2) DEFAULT 0,
  comprobante_url TEXT,
  nit TEXT,
  razon_social TEXT,
  estado TEXT CHECK (estado IN ('pendiente','completado','fallido')) DEFAULT 'pendiente',
  items_pagados JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reservas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre_cliente TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  tipo_evento TEXT,
  fecha_evento TIMESTAMPTZ NOT NULL,
  numero_personas INTEGER DEFAULT 1,
  descripcion TEXT,
  monto_total DECIMAL(10,2),
  monto_sena DECIMAL(10,2),
  estado TEXT CHECK (estado IN ('pendiente','confirmada','produccion','completada','cancelada')) DEFAULT 'pendiente',
  notas_admin TEXT,
  comprobante_sena_url TEXT,
  stock_apartado JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alertas_mesero (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mesa_id UUID REFERENCES mesas(id) ON DELETE CASCADE,
  mesa_numero INTEGER,
  tipo TEXT CHECK (tipo IN ('llamado','cambio_solicitado','pedido_listo','cuenta_pedida')) DEFAULT 'llamado',
  mensaje TEXT,
  datos_extra JSONB DEFAULT '{}',
  atendida BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sesiones_caja (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  turno TEXT CHECK (turno IN ('manana','tarde','noche')) DEFAULT 'manana',
  cajero TEXT,
  efectivo_inicial DECIMAL(10,2) DEFAULT 0,
  efectivo_esperado DECIMAL(10,2) DEFAULT 0,
  efectivo_contado DECIMAL(10,2),
  diferencia DECIMAL(10,2),
  total_ventas DECIMAL(10,2) DEFAULT 0,
  total_qr DECIMAL(10,2) DEFAULT 0,
  estado TEXT CHECK (estado IN ('abierta','cerrada')) DEFAULT 'abierta',
  abierta_at TIMESTAMPTZ DEFAULT NOW(),
  cerrada_at TIMESTAMPTZ,
  notas TEXT
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ language plpgsql;

DROP TRIGGER IF EXISTS trg_pedidos_updated ON pedidos;
CREATE TRIGGER trg_pedidos_updated BEFORE UPDATE ON pedidos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trg_items_updated ON items_pedido;
CREATE TRIGGER trg_items_updated BEFORE UPDATE ON items_pedido FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trg_productos_updated ON productos;
CREATE TRIGGER trg_productos_updated BEFORE UPDATE ON productos FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION calc_subtotal()
RETURNS TRIGGER AS $$ BEGIN NEW.subtotal = NEW.cantidad * NEW.precio_unitario; RETURN NEW; END; $$ language plpgsql;
DROP TRIGGER IF EXISTS trg_items_subtotal ON items_pedido;
CREATE TRIGGER trg_items_subtotal BEFORE INSERT OR UPDATE ON items_pedido FOR EACH ROW EXECUTE FUNCTION calc_subtotal();

CREATE OR REPLACE FUNCTION recalc_pedido_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE pedidos SET total = (
    SELECT COALESCE(SUM(subtotal),0) FROM items_pedido
    WHERE pedido_id = COALESCE(NEW.pedido_id, OLD.pedido_id) AND estado != 'cancelado'
  ) WHERE id = COALESCE(NEW.pedido_id, OLD.pedido_id);
  RETURN NEW;
END; $$ language plpgsql;
DROP TRIGGER IF EXISTS trg_recalc_total ON items_pedido;
CREATE TRIGGER trg_recalc_total AFTER INSERT OR UPDATE OR DELETE ON items_pedido FOR EACH ROW EXECUTE FUNCTION recalc_pedido_total();

ALTER PUBLICATION supabase_realtime ADD TABLE pedidos;
ALTER PUBLICATION supabase_realtime ADD TABLE items_pedido;
ALTER PUBLICATION supabase_realtime ADD TABLE mesas;
ALTER PUBLICATION supabase_realtime ADD TABLE alertas_mesero;
`;

const SQL_SEED = `
INSERT INTO zonas (nombre, descripcion, orden) VALUES
  ('Salón Principal','Área interior principal',1),
  ('Patio','Terraza exterior',2),
  ('Piso 2','Salón superior para eventos',3)
ON CONFLICT DO NOTHING;

WITH zona_salon AS (SELECT id FROM zonas WHERE nombre='Salón Principal' LIMIT 1),
     zona_patio AS (SELECT id FROM zonas WHERE nombre='Patio' LIMIT 1),
     zona_piso2 AS (SELECT id FROM zonas WHERE nombre='Piso 2' LIMIT 1)
INSERT INTO mesas (numero, zona_id, tipo, capacidad, pos_x, pos_y, ancho, alto) VALUES
  (1,(SELECT id FROM zona_salon),'cuadrada',4,50,50,80,80),
  (2,(SELECT id FROM zona_salon),'cuadrada',4,200,50,80,80),
  (3,(SELECT id FROM zona_salon),'cuadrada',4,350,50,80,80),
  (4,(SELECT id FROM zona_salon),'redonda',6,50,200,90,90),
  (5,(SELECT id FROM zona_salon),'redonda',6,200,200,90,90),
  (6,(SELECT id FROM zona_salon),'rectangular',8,350,200,140,80),
  (7,(SELECT id FROM zona_salon),'cuadrada',2,50,370,70,70),
  (8,(SELECT id FROM zona_salon),'cuadrada',2,200,370,70,70),
  (9,(SELECT id FROM zona_patio),'redonda',4,60,60,80,80),
  (10,(SELECT id FROM zona_patio),'redonda',4,220,60,80,80),
  (11,(SELECT id FROM zona_patio),'redonda',4,380,60,80,80),
  (12,(SELECT id FROM zona_patio),'cuadrada',4,60,220,80,80),
  (13,(SELECT id FROM zona_patio),'cuadrada',4,220,220,80,80),
  (14,(SELECT id FROM zona_piso2),'rectangular',10,80,80,160,80),
  (15,(SELECT id FROM zona_piso2),'rectangular',12,80,220,200,90),
  (16,(SELECT id FROM zona_piso2),'cuadrada',4,360,80,80,80),
  (17,(SELECT id FROM zona_piso2),'cuadrada',4,360,220,80,80),
  (18,(SELECT id FROM zona_salon),'cuadrada',2,500,50,70,70),
  (19,(SELECT id FROM zona_patio),'redonda',6,380,220,90,90),
  (20,(SELECT id FROM zona_piso2),'redonda',8,80,380,100,100)
ON CONFLICT (numero) DO NOTHING;

INSERT INTO categorias (nombre, emoji, descripcion, estacion, orden) VALUES
  ('Cafés y Bebidas Calientes','☕','Espressos, lattes, capuccinos y más','cafeteria',1),
  ('Jugos y Bebidas Frías','🥤','Jugos naturales, limonadas y batidos','cafeteria',2),
  ('Panes Artesanales','🥐','Panes recién horneados cada mañana','vitrina',3),
  ('Pasteles y Tortas','🎂','Tortas por porción y pasteles finos','vitrina',4),
  ('Masitas y Galletas','🍪','Masitas bolivianas y galletas artesanales','vitrina',5),
  ('Sandwiches y Salados','🥗','Sandwiches gourmet y opciones saladas','cocina',6),
  ('Desayunos y Combos','🍱','Combos completos para empezar el día','cocina',7)
ON CONFLICT DO NOTHING;

WITH c AS (SELECT id FROM categorias WHERE nombre='Cafés y Bebidas Calientes' LIMIT 1)
INSERT INTO productos (categoria_id,nombre,descripcion,precio,costo,disponible,es_mas_vendido,estacion,chips_personalizacion) VALUES
  ((SELECT id FROM c),'Café Americano','Espresso diluido en agua caliente, intenso y limpio',15,4,true,false,'cafeteria','["Sin azúcar","Con azúcar","Con Stevia","Bien caliente","Tibio","Extra grande"]'),
  ((SELECT id FROM c),'Café con Leche','Café espresso con leche vaporizada cremosa',18,5.5,true,true,'cafeteria','["Sin azúcar","Con azúcar","Con Stevia","Bien caliente","Leche descremada","Extra leche"]'),
  ((SELECT id FROM c),'Cappuccino','Espresso con leche vaporizada y espuma densa',22,6,true,true,'cafeteria','["Sin azúcar","Con Stevia","Doble shot","Canela encima","Sin espuma"]'),
  ((SELECT id FROM c),'Latte','Espresso suave con mucha leche vaporizada sedosa',24,6.5,true,true,'cafeteria','["Sin azúcar","Con Stevia","Vainilla","Caramelo","Avellana","Doble shot"]'),
  ((SELECT id FROM c),'Macchiato','Espresso manchado con toque de leche',20,5,true,false,'cafeteria','["Sin azúcar","Con azúcar","Bien caliente"]'),
  ((SELECT id FROM c),'Mocha','Latte con chocolate premium derretido',26,7.5,true,false,'cafeteria','["Sin azúcar","Extra chocolate","Con Stevia","Crema chantilly"]'),
  ((SELECT id FROM c),'Espresso','Shot concentrado de café de especialidad',14,3.5,true,false,'cafeteria','["Solo","Doble shot","Con azúcar","Sin azúcar"]'),
  ((SELECT id FROM c),'Chocolate Caliente','Chocolate artesanal boliviano con leche caliente',20,6,true,true,'cafeteria','["Sin azúcar","Extra cremoso","Con marshmallows","Bien caliente"]'),
  ((SELECT id FROM c),'Té de Manzanilla','Infusión relajante de manzanilla orgánica',12,2,true,false,'cafeteria','["Sin azúcar","Con miel","Bien caliente","Con limón"]'),
  ((SELECT id FROM c),'Mate de Coca','Tradicional mate de hoja de coca boliviana',10,1.5,true,false,'cafeteria','["Sin azúcar","Con azúcar","Con miel"]')
ON CONFLICT DO NOTHING;

WITH c AS (SELECT id FROM categorias WHERE nombre='Jugos y Bebidas Frías' LIMIT 1)
INSERT INTO productos (categoria_id,nombre,descripcion,precio,costo,disponible,es_mas_vendido,estacion,chips_personalizacion) VALUES
  ((SELECT id FROM c),'Jugo de Naranja Natural','Naranjillas frescas exprimidas al momento',16,5,true,true,'cafeteria','["Sin azúcar","Con azúcar","Con hielo","Sin hielo"]'),
  ((SELECT id FROM c),'Limonada Clásica','Limones frescos, agua y toque de menta',14,3.5,true,true,'cafeteria','["Sin azúcar","Con azúcar","Sin hielo","Bien fría","Extra limón"]'),
  ((SELECT id FROM c),'Smoothie de Fresa','Fresas frescas con yogur y leche',22,7,true,false,'cafeteria','["Sin azúcar","Con Stevia","Sin lácteos"]'),
  ((SELECT id FROM c),'Batido de Mango','Mango tropical con leche y hielo cremoso',22,7,true,false,'cafeteria','["Sin azúcar","Con Stevia","Extra mango","Sin leche"]'),
  ((SELECT id FROM c),'Cold Brew','Café frío infusionado 12h, suave y refrescante',28,8,true,false,'cafeteria','["Solo","Con leche","Con hielo extra","Con azúcar"]'),
  ((SELECT id FROM c),'Té Helado de Limón','Té verde con limón y hielo, sin preservantes',16,3,true,false,'cafeteria','["Sin azúcar","Con azúcar","Extra limón"]'),
  ((SELECT id FROM c),'Agua Mineral','Agua mineral natural',8,2,true,false,'cafeteria','["Sin gas","Con gas","Con hielo"]')
ON CONFLICT DO NOTHING;

WITH c AS (SELECT id FROM categorias WHERE nombre='Panes Artesanales' LIMIT 1)
INSERT INTO productos (categoria_id,nombre,descripcion,precio,costo,disponible,es_mas_vendido,estacion,chips_personalizacion) VALUES
  ((SELECT id FROM c),'Croissant Mantequilla','Croissant hojaldrado con mantequilla francesa',18,5,true,true,'vitrina','["Calentar en horno","Solo","Con mantequilla","Con mermelada"]'),
  ((SELECT id FROM c),'Pan de Queso','Pan esponjoso con queso boliviano derretido',10,3,true,true,'vitrina','["Calentar en horno","Solo","Caliente"]'),
  ((SELECT id FROM c),'Baguette Artesanal','Baguette crujiente horneado en horno de leña',12,3.5,true,false,'vitrina','["Calentar en horno","Con mantequilla"]'),
  ((SELECT id FROM c),'Pan de Maíz Boliviano','Pan tradicional de maíz amarillo con semillas',6,1.5,true,false,'vitrina','["Calentar en horno","Caliente"]'),
  ((SELECT id FROM c),'Pan Integral de Semillas','Pan integral con linaza, chía y girasol',9,2.5,true,false,'vitrina','["Calentar en horno","Con mantequilla"]'),
  ((SELECT id FROM c),'Rosca de Pan','Rosca dulce con azúcar glas y coco',15,4,true,false,'vitrina','["Calentar en horno"]'),
  ((SELECT id FROM c),'Ciabatta Italiana','Pan italiano con aceite de oliva y romero',14,4,true,false,'vitrina','["Calentar en horno","Con aceite"]'),
  ((SELECT id FROM c),'Medialuna Dulce','Medialuna hojaldrada con azúcar y canela',12,3,true,true,'vitrina','["Calentar en horno","Solo"]')
ON CONFLICT DO NOTHING;

WITH c AS (SELECT id FROM categorias WHERE nombre='Pasteles y Tortas' LIMIT 1)
INSERT INTO productos (categoria_id,nombre,descripcion,precio,costo,disponible,es_mas_vendido,estacion,chips_personalizacion) VALUES
  ((SELECT id FROM c),'Torta de Chocolate','Bizcocho húmedo con ganache de chocolate belga',35,10,true,true,'vitrina','["Calentar en horno","Con helado","Sin gluten"]'),
  ((SELECT id FROM c),'Cheesecake New York','Cheesecake cremoso con base de galleta y frutos',40,12,true,true,'vitrina','["Solo","Con salsa de fresas","Con salsa de maracuyá"]'),
  ((SELECT id FROM c),'Torta de Zanahoria','Carrot cake húmedo con frosting de queso crema',35,10,true,false,'vitrina','["Calentar en horno","Con helado"]'),
  ((SELECT id FROM c),'Brownie de Nuez','Brownie fudgy con nueces y chocolate amargo',20,6,true,true,'vitrina','["Calentar en horno","Con helado","Solo"]'),
  ((SELECT id FROM c),'Muffin de Arándanos','Muffin esponjoso con arándanos frescos',18,5,true,false,'vitrina','["Solo","Calentar en horno"]'),
  ((SELECT id FROM c),'Muffin Chips de Chocolate','Muffin húmedo con chips de chocolate premium',18,5,true,false,'vitrina','["Solo","Calentar en horno","Tibio"]'),
  ((SELECT id FROM c),'Donut Glaseada','Donut esponjosa con glaseado de azúcar y sprinkles',15,4,true,false,'vitrina','["Solo"]'),
  ((SELECT id FROM c),'Éclair de Chocolate','Masa choux rellena de crema y cubierta de chocolate',22,7,true,false,'vitrina','["Solo","Frío"]'),
  ((SELECT id FROM c),'Milhojas de Crema','Hojaldre crujiente con crema pastelera artesanal',30,9,true,false,'vitrina','["Solo","Frío"]'),
  ((SELECT id FROM c),'Tarta de Fresas','Fresas frescas sobre crema pastelera en masa sablée',45,14,true,false,'vitrina','["Solo","Frío"]')
ON CONFLICT DO NOTHING;

WITH c AS (SELECT id FROM categorias WHERE nombre='Masitas y Galletas' LIMIT 1)
INSERT INTO productos (categoria_id,nombre,descripcion,precio,costo,disponible,es_mas_vendido,estacion,chips_personalizacion) VALUES
  ((SELECT id FROM c),'Masitas de Maní (x6)','Clásicas masitas bolivianas con maní tostado',12,3,true,true,'vitrina','["Calentar en horno","Sin cebolla","Con azúcar glass"]'),
  ((SELECT id FROM c),'Masitas de Coco (x6)','Masitas crujientes con coco rallado artesanal',12,3,true,true,'vitrina','["Calentar en horno","Solo"]'),
  ((SELECT id FROM c),'Galleta de Avena','Galleta crujiente de avena con pasas y miel',8,2,true,false,'vitrina','["Solo","Sin pasas"]'),
  ((SELECT id FROM c),'Alfajor Boliviano','Alfajor de maicena relleno con manjar blanco',10,3,true,true,'vitrina','["Solo","Con coco"]'),
  ((SELECT id FROM c),'Galleta de Mantequilla','Galleta clásica de mantequilla francesa',8,2,true,false,'vitrina','["Solo"]'),
  ((SELECT id FROM c),'Pastel de Queso (masita)','Masita salada rellena de queso cremoso derretido',14,4,true,false,'vitrina','["Calentar en horno","Caliente"]'),
  ((SELECT id FROM c),'Suspiro (x4)','Merengues aireados con sabor a vainilla',6,1.5,true,false,'vitrina','["Solo"]')
ON CONFLICT DO NOTHING;

WITH c AS (SELECT id FROM categorias WHERE nombre='Sandwiches y Salados' LIMIT 1)
INSERT INTO productos (categoria_id,nombre,descripcion,precio,costo,disponible,es_mas_vendido,estacion,chips_personalizacion) VALUES
  ((SELECT id FROM c),'Sandwich Jamón y Queso','Pan ciabatta con jamón serrano y queso gouda',28,9,true,true,'cocina','["Sin cebolla","Con mostaza","Con mayonesa","Bien caliente","Sin tomate","Extra queso"]'),
  ((SELECT id FROM c),'Sandwich de Pollo','Pechuga a la plancha con palta y vegetales frescos',32,10,true,true,'cocina','["Sin cebolla","Sin tomate","Con mayonesa","Con mostaza","Extra palta","Sin palta"]'),
  ((SELECT id FROM c),'Sandwich Vegetariano','Queso feta, espinaca, tomate seco y pesto',26,8,true,false,'cocina','["Sin cebolla","Sin queso","Con mayonesa","Extra vegetal"]'),
  ((SELECT id FROM c),'Club Sandwich','Triple piso con pollo, tocino, huevo y lechuga',38,12,true,false,'cocina','["Sin cebolla","Sin tocino","Con mostaza","Extra pollo"]'),
  ((SELECT id FROM c),'Tostada con Palta','Pan tostado artesanal con palta fresca y semillas',24,7,true,true,'cocina','["Con huevo","Sin semillas","Con limón","Extra palta"]'),
  ((SELECT id FROM c),'Empanada de Queso','Empanada horneada rellena de queso boliviano',15,4,true,true,'cocina','["Calentar en horno","Con ají","Sin sal extra"]'),
  ((SELECT id FROM c),'Empanada de Carne','Empanada jugosa con carne especiada y aceitunas',18,5.5,true,true,'cocina','["Calentar en horno","Picante","Sin cebolla"]'),
  ((SELECT id FROM c),'Quiche de Espinaca','Tarta salada de espinaca con queso y huevo',25,8,true,false,'cocina','["Calentar en horno","Con ensalada"]')
ON CONFLICT DO NOTHING;

WITH c AS (SELECT id FROM categorias WHERE nombre='Desayunos y Combos' LIMIT 1)
INSERT INTO productos (categoria_id,nombre,descripcion,precio,costo,disponible,es_mas_vendido,estacion,chips_personalizacion) VALUES
  ((SELECT id FROM c),'Desayuno Clásico','Café con leche + croissant + jugo de naranja',45,14.5,true,true,'cocina','["Sin azúcar","Con Stevia","Café americano","Capuccino"]'),
  ((SELECT id FROM c),'Desayuno Energético','Batido de fresa + tostada con palta + fruta de estación',38,12,true,false,'cocina','["Sin lácteos","Sin gluten","Extra fruta"]'),
  ((SELECT id FROM c),'Combo Pareja','2 cafés a elección + 2 panes artesanales',55,18,true,true,'cocina','["2 americanos","2 lattes","2 capuccinos","Panes a elección"]'),
  ((SELECT id FROM c),'Combo Estudiante','Café americano + sandwich + agua mineral',42,13.5,true,true,'cocina','["Sin azúcar","Sandwich a elección"]'),
  ((SELECT id FROM c),'Merienda Completa','Té a elección + porción de masitas + fruta fresca',35,11,true,false,'cocina','["Té verde","Manzanilla","Mate de coca"]'),
  ((SELECT id FROM c),'Combo Reunión (x4)','4 cafés + surtido de masitas bolivianas para 4 personas',90,30,true,false,'cocina','["Cafés a elección","Extra masitas"]')
ON CONFLICT DO NOTHING;
`;

async function run() {
  const client = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 20000,
  });
  try {
    console.log('🔌 Conectando a Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado!\n');

    console.log('📋 Creando tablas, triggers y realtime...');
    await client.query(SQL_SCHEMA);
    console.log('✅ Schema listo!\n');

    console.log('🌱 Sembrando zonas, mesas, categorías y 56 productos...');
    await client.query(SQL_SEED);
    console.log('✅ Datos insertados!\n');

    const { rows: counts } = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM zonas) as zonas,
        (SELECT COUNT(*) FROM mesas) as mesas,
        (SELECT COUNT(*) FROM categorias) as categorias,
        (SELECT COUNT(*) FROM productos) as productos;
    `);
    const c = counts[0];
    console.log('📊 Verificación final:');
    console.log(`   ✓ Zonas:      ${c.zonas}`);
    console.log(`   ✓ Mesas:      ${c.mesas}`);
    console.log(`   ✓ Categorías: ${c.categorias}`);
    console.log(`   ✓ Productos:  ${c.productos}`);
    console.log('\n🎉 ¡Base de datos Dencker Pan lista!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();

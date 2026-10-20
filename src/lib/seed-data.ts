import { Zona, Mesa, Categoria, Producto } from '@/types';

export const SEED_ZONAS: Zona[] = [
  { id: 'z1', nombre: 'Salón Principal', descripcion: 'Área interior principal', orden: 1, activa: true, created_at: new Date().toISOString() },
  { id: 'z2', nombre: 'Patio', descripcion: 'Terraza exterior', orden: 2, activa: true, created_at: new Date().toISOString() },
  { id: 'z3', nombre: 'Piso 2', descripcion: 'Salón superior para eventos', orden: 3, activa: true, created_at: new Date().toISOString() },
];

export const SEED_MESAS: Mesa[] = [
  { id: 'm1',  numero: 1,  zona_id: 'z1', tipo: 'cuadrada',    capacidad: 4,  pos_x: 50,  pos_y: 50,  ancho: 80,  alto: 80,  estado: 'libre', activa: true, created_at: new Date().toISOString() },
  { id: 'm2',  numero: 2,  zona_id: 'z1', tipo: 'cuadrada',    capacidad: 4,  pos_x: 200, pos_y: 50,  ancho: 80,  alto: 80,  estado: 'libre', activa: true, created_at: new Date().toISOString() },
  { id: 'm3',  numero: 3,  zona_id: 'z1', tipo: 'cuadrada',    capacidad: 4,  pos_x: 350, pos_y: 50,  ancho: 80,  alto: 80,  estado: 'ocupada', activa: true, created_at: new Date().toISOString() },
  { id: 'm4',  numero: 4,  zona_id: 'z1', tipo: 'redonda',     capacidad: 6,  pos_x: 50,  pos_y: 200, ancho: 90,  alto: 90,  estado: 'libre', activa: true, created_at: new Date().toISOString() },
  { id: 'm5',  numero: 5,  zona_id: 'z1', tipo: 'redonda',     capacidad: 6,  pos_x: 200, pos_y: 200, ancho: 90,  alto: 90,  estado: 'ocupada', activa: true, created_at: new Date().toISOString() },
  { id: 'm6',  numero: 6,  zona_id: 'z1', tipo: 'rectangular', capacidad: 8,  pos_x: 350, pos_y: 200, ancho: 140, alto: 80,  estado: 'reservada', activa: true, created_at: new Date().toISOString() },
  { id: 'm7',  numero: 7,  zona_id: 'z1', tipo: 'cuadrada',    capacidad: 2,  pos_x: 50,  pos_y: 370, ancho: 70,  alto: 70,  estado: 'libre', activa: true, created_at: new Date().toISOString() },
  { id: 'm8',  numero: 8,  zona_id: 'z1', tipo: 'cuadrada',    capacidad: 2,  pos_x: 200, pos_y: 370, ancho: 70,  alto: 70,  estado: 'libre', activa: true, created_at: new Date().toISOString() },
  { id: 'm9',  numero: 9,  zona_id: 'z2', tipo: 'redonda',     capacidad: 4,  pos_x: 60,  pos_y: 60,  ancho: 80,  alto: 80,  estado: 'libre', activa: true, created_at: new Date().toISOString() },
  { id: 'm10', numero: 10, zona_id: 'z2', tipo: 'redonda',     capacidad: 4,  pos_x: 220, pos_y: 60,  ancho: 80,  alto: 80,  estado: 'libre', activa: true, created_at: new Date().toISOString() },
  { id: 'm11', numero: 11, zona_id: 'z2', tipo: 'redonda',     capacidad: 4,  pos_x: 380, pos_y: 60,  ancho: 80,  alto: 80,  estado: 'ocupada', activa: true, created_at: new Date().toISOString() },
  { id: 'm12', numero: 12, zona_id: 'z2', tipo: 'cuadrada',    capacidad: 4,  pos_x: 60,  pos_y: 220, ancho: 80,  alto: 80,  estado: 'libre', activa: true, created_at: new Date().toISOString() },
  { id: 'm13', numero: 13, zona_id: 'z2', tipo: 'cuadrada',    capacidad: 4,  pos_x: 220, pos_y: 220, ancho: 80,  alto: 80,  estado: 'libre', activa: true, created_at: new Date().toISOString() },
  { id: 'm14', numero: 14, zona_id: 'z3', tipo: 'rectangular', capacidad: 10, pos_x: 80,  pos_y: 80,  ancho: 160, alto: 80,  estado: 'libre', activa: true, created_at: new Date().toISOString() },
  { id: 'm15', numero: 15, zona_id: 'z3', tipo: 'rectangular', capacidad: 12, pos_x: 80,  pos_y: 220, ancho: 200, alto: 90,  estado: 'libre', activa: true, created_at: new Date().toISOString() },
  { id: 'm16', numero: 16, zona_id: 'z3', tipo: 'cuadrada',    capacidad: 4,  pos_x: 360, pos_y: 80,  ancho: 80,  alto: 80,  estado: 'libre', activa: true, created_at: new Date().toISOString() },
  { id: 'm17', numero: 17, zona_id: 'z3', tipo: 'cuadrada',    capacidad: 4,  pos_x: 360, pos_y: 220, ancho: 80,  alto: 80,  estado: 'libre', activa: true, created_at: new Date().toISOString() },
  { id: 'm18', numero: 18, zona_id: 'z1', tipo: 'cuadrada',    capacidad: 2,  pos_x: 500, pos_y: 50,  ancho: 70,  alto: 70,  estado: 'libre', activa: true, created_at: new Date().toISOString() },
  { id: 'm19', numero: 19, zona_id: 'z2', tipo: 'redonda',     capacidad: 6,  pos_x: 380, pos_y: 220, ancho: 90,  alto: 90,  estado: 'libre', activa: true, created_at: new Date().toISOString() },
  { id: 'm20', numero: 20, zona_id: 'z3', tipo: 'redonda',     capacidad: 8,  pos_x: 80,  pos_y: 380, ancho: 100, alto: 100, estado: 'libre', activa: true, created_at: new Date().toISOString() },
];

export const SEED_CATEGORIAS: Categoria[] = [
  { id: 'c1', nombre: 'Cafés y Bebidas Calientes', emoji: '☕', descripcion: 'Espressos, lattes, capuccinos y más', estacion: 'cafeteria', orden: 1, activa: true },
  { id: 'c2', nombre: 'Jugos y Bebidas Frías',     emoji: '🥤', descripcion: 'Jugos naturales, limonadas y batidos', estacion: 'cafeteria', orden: 2, activa: true },
  { id: 'c3', nombre: 'Panes Artesanales',         emoji: '🥐', descripcion: 'Panes recién horneados cada mañana',  estacion: 'vitrina',   orden: 3, activa: true },
  { id: 'c4', nombre: 'Pasteles y Tortas',         emoji: '🎂', descripcion: 'Tortas por porción y pasteles finos', estacion: 'vitrina',   orden: 4, activa: true },
  { id: 'c5', nombre: 'Masitas y Galletas',        emoji: '🍪', descripcion: 'Masitas bolivianas y galletas artesanales', estacion: 'vitrina', orden: 5, activa: true },
  { id: 'c6', nombre: 'Sandwiches y Salados',      emoji: '🥗', descripcion: 'Sandwiches gourmet y opciones saladas', estacion: 'cocina',  orden: 6, activa: true },
  { id: 'c7', nombre: 'Desayunos y Combos',        emoji: '🍱', descripcion: 'Combos completos para empezar el día', estacion: 'cocina',   orden: 7, activa: true },
];

function p(id: string, cid: string, nombre: string, desc: string, precio: number, costo: number, estacion: 'vitrina'|'cafeteria'|'cocina', chips: string[], masVendido = false): Producto {
  return {
    id, categoria_id: cid, nombre, descripcion: desc, precio, costo,
    disponible: true, es_mas_vendido: masVendido, stock: -1,
    chips_personalizacion: chips, estacion,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
}

export const SEED_PRODUCTOS: Producto[] = [
  // Cafés
  p('p01','c1','Café Americano','Espresso diluido en agua caliente, intenso y limpio',15,4,'cafeteria',['Sin azúcar','Con azúcar','Con Stevia','Bien caliente','Tibio','Extra grande']),
  p('p02','c1','Café con Leche','Café espresso con leche vaporizada cremosa',18,5.5,'cafeteria',['Sin azúcar','Con azúcar','Con Stevia','Bien caliente','Leche descremada','Extra leche'],true),
  p('p03','c1','Cappuccino','Espresso con leche vaporizada y espuma densa',22,6,'cafeteria',['Sin azúcar','Con Stevia','Doble shot','Canela encima','Sin espuma'],true),
  p('p04','c1','Latte','Espresso suave con mucha leche vaporizada sedosa',24,6.5,'cafeteria',['Sin azúcar','Con Stevia','Vainilla','Caramelo','Avellana','Doble shot'],true),
  p('p05','c1','Macchiato','Espresso manchado con toque de leche',20,5,'cafeteria',['Sin azúcar','Con azúcar','Bien caliente']),
  p('p06','c1','Mocha','Latte con chocolate premium derretido',26,7.5,'cafeteria',['Sin azúcar','Extra chocolate','Con Stevia','Crema chantilly']),
  p('p07','c1','Espresso','Shot concentrado de café de especialidad',14,3.5,'cafeteria',['Solo','Doble shot','Con azúcar','Sin azúcar']),
  p('p08','c1','Chocolate Caliente','Chocolate artesanal boliviano con leche caliente',20,6,'cafeteria',['Sin azúcar','Extra cremoso','Con marshmallows','Bien caliente'],true),
  p('p09','c1','Té de Manzanilla','Infusión relajante de manzanilla orgánica',12,2,'cafeteria',['Sin azúcar','Con miel','Bien caliente','Con limón']),
  p('p10','c1','Mate de Coca','Tradicional mate de hoja de coca boliviana',10,1.5,'cafeteria',['Sin azúcar','Con azúcar','Con miel']),
  // Jugos
  p('p11','c2','Jugo de Naranja Natural','Naranjillas frescas exprimidas al momento',16,5,'cafeteria',['Sin azúcar','Con azúcar','Con hielo','Sin hielo'],true),
  p('p12','c2','Limonada Clásica','Limones frescos, agua y toque de menta',14,3.5,'cafeteria',['Sin azúcar','Con azúcar','Sin hielo','Bien fría','Extra limón'],true),
  p('p13','c2','Smoothie de Fresa','Fresas frescas con yogur y leche',22,7,'cafeteria',['Sin azúcar','Con Stevia','Sin lácteos']),
  p('p14','c2','Batido de Mango','Mango tropical con leche y hielo cremoso',22,7,'cafeteria',['Sin azúcar','Con Stevia','Extra mango','Sin leche']),
  p('p15','c2','Cold Brew','Café frío infusionado 12h, suave y refrescante',28,8,'cafeteria',['Solo','Con leche','Con hielo extra','Con azúcar']),
  p('p16','c2','Té Helado de Limón','Té verde con limón y hielo, sin preservantes',16,3,'cafeteria',['Sin azúcar','Con azúcar','Extra limón']),
  p('p17','c2','Agua Mineral','Agua mineral natural',8,2,'cafeteria',['Sin gas','Con gas','Con hielo']),
  // Panes
  p('p18','c3','Croissant Mantequilla','Croissant hojaldrado con mantequilla francesa',18,5,'vitrina',['Calentar en horno','Solo','Con mantequilla','Con mermelada'],true),
  p('p19','c3','Pan de Queso','Pan esponjoso con queso boliviano derretido',10,3,'vitrina',['Calentar en horno','Solo','Caliente'],true),
  p('p20','c3','Baguette Artesanal','Baguette crujiente horneado en horno de leña',12,3.5,'vitrina',['Calentar en horno','Con mantequilla']),
  p('p21','c3','Pan de Maíz Boliviano','Pan tradicional de maíz amarillo con semillas',6,1.5,'vitrina',['Calentar en horno','Caliente']),
  p('p22','c3','Pan Integral de Semillas','Pan integral con linaza, chía y girasol',9,2.5,'vitrina',['Calentar en horno','Con mantequilla']),
  p('p23','c3','Rosca de Pan','Rosca dulce con azúcar glas y coco',15,4,'vitrina',['Calentar en horno']),
  p('p24','c3','Ciabatta Italiana','Pan italiano con aceite de oliva y romero',14,4,'vitrina',['Calentar en horno','Con aceite']),
  p('p25','c3','Medialuna Dulce','Medialuna hojaldrada con azúcar y canela',12,3,'vitrina',['Calentar en horno','Solo'],true),
  // Pasteles
  p('p26','c4','Torta de Chocolate','Bizcocho húmedo con ganache de chocolate belga',35,10,'vitrina',['Calentar en horno','Con helado','Sin gluten'],true),
  p('p27','c4','Cheesecake New York','Cheesecake cremoso con base de galleta y frutos',40,12,'vitrina',['Solo','Con salsa de fresas','Con salsa de maracuyá'],true),
  p('p28','c4','Torta de Zanahoria','Carrot cake húmedo con frosting de queso crema',35,10,'vitrina',['Calentar en horno','Con helado']),
  p('p29','c4','Brownie de Nuez','Brownie fudgy con nueces y chocolate amargo',20,6,'vitrina',['Calentar en horno','Con helado','Solo'],true),
  p('p30','c4','Muffin de Arándanos','Muffin esponjoso con arándanos frescos',18,5,'vitrina',['Solo','Calentar en horno']),
  p('p31','c4','Muffin Chips de Chocolate','Muffin húmedo con chips de chocolate premium',18,5,'vitrina',['Solo','Calentar en horno','Tibio']),
  p('p32','c4','Donut Glaseada','Donut esponjosa con glaseado de azúcar y sprinkles',15,4,'vitrina',['Solo']),
  p('p33','c4','Éclair de Chocolate','Masa choux rellena de crema y cubierta de chocolate',22,7,'vitrina',['Solo','Frío']),
  p('p34','c4','Milhojas de Crema','Hojaldre crujiente con crema pastelera artesanal',30,9,'vitrina',['Solo','Frío']),
  p('p35','c4','Tarta de Fresas','Fresas frescas sobre crema pastelera en masa sablée',45,14,'vitrina',['Solo','Frío']),
  // Masitas
  p('p36','c5','Masitas de Maní (x6)','Clásicas masitas bolivianas con maní tostado',12,3,'vitrina',['Calentar en horno','Sin cebolla','Con azúcar glass'],true),
  p('p37','c5','Masitas de Coco (x6)','Masitas crujientes con coco rallado artesanal',12,3,'vitrina',['Calentar en horno','Solo'],true),
  p('p38','c5','Galleta de Avena','Galleta crujiente de avena con pasas y miel',8,2,'vitrina',['Solo','Sin pasas']),
  p('p39','c5','Alfajor Boliviano','Alfajor de maicena relleno con manjar blanco',10,3,'vitrina',['Solo','Con coco'],true),
  p('p40','c5','Galleta de Mantequilla','Galleta clásica de mantequilla francesa',8,2,'vitrina',['Solo']),
  p('p41','c5','Pastel de Queso (masita)','Masita salada rellena de queso cremoso derretido',14,4,'vitrina',['Calentar en horno','Caliente']),
  p('p42','c5','Suspiro (x4)','Merengues aireados con sabor a vainilla',6,1.5,'vitrina',['Solo']),
  // Sandwiches
  p('p43','c6','Sandwich Jamón y Queso','Pan ciabatta con jamón serrano y queso gouda',28,9,'cocina',['Sin cebolla','Con mostaza','Con mayonesa','Bien caliente','Sin tomate','Extra queso'],true),
  p('p44','c6','Sandwich de Pollo','Pechuga a la plancha con palta y vegetales frescos',32,10,'cocina',['Sin cebolla','Sin tomate','Con mayonesa','Con mostaza','Extra palta','Sin palta'],true),
  p('p45','c6','Sandwich Vegetariano','Queso feta, espinaca, tomate seco y pesto',26,8,'cocina',['Sin cebolla','Sin queso','Con mayonesa','Extra vegetal']),
  p('p46','c6','Club Sandwich','Triple piso con pollo, tocino, huevo y lechuga',38,12,'cocina',['Sin cebolla','Sin tocino','Con mostaza','Extra pollo']),
  p('p47','c6','Tostada con Palta','Pan tostado artesanal con palta fresca y semillas',24,7,'cocina',['Con huevo','Sin semillas','Con limón','Extra palta'],true),
  p('p48','c6','Empanada de Queso','Empanada horneada rellena de queso boliviano',15,4,'cocina',['Calentar en horno','Con ají','Sin sal extra'],true),
  p('p49','c6','Empanada de Carne','Empanada jugosa con carne especiada y aceitunas',18,5.5,'cocina',['Calentar en horno','Picante','Sin cebolla'],true),
  p('p50','c6','Quiche de Espinaca','Tarta salada de espinaca con queso y huevo',25,8,'cocina',['Calentar en horno','Con ensalada']),
  // Combos
  p('p51','c7','Desayuno Clásico','Café con leche + croissant + jugo de naranja',45,14.5,'cocina',['Sin azúcar','Con Stevia','Café americano','Capuccino'],true),
  p('p52','c7','Desayuno Energético','Batido de fresa + tostada con palta + fruta de estación',38,12,'cocina',['Sin lácteos','Sin gluten','Extra fruta']),
  p('p53','c7','Combo Pareja','2 cafés a elección + 2 panes artesanales',55,18,'cocina',['2 americanos','2 lattes','2 capuccinos','Panes a elección'],true),
  p('p54','c7','Combo Estudiante','Café americano + sandwich + agua mineral',42,13.5,'cocina',['Sin azúcar','Sandwich a elección'],true),
  p('p55','c7','Merienda Completa','Té a elección + porción de masitas + fruta fresca',35,11,'cocina',['Té verde','Manzanilla','Mate de coca']),
  p('p56','c7','Combo Reunión (x4)','4 cafés + surtido de masitas bolivianas para 4 personas',90,30,'cocina',['Cafés a elección','Extra masitas']),
];

// ==========================================
// DENCKER PAN — SEED DATA REAL & AUTHENTIC
// Extracted from tienda.denckerpan.com & ImgBB
// ==========================================

import { Zona, Mesa, Categoria, Producto, Reserva, Pago, SesionCaja, UsuarioStaff } from '@/types';

export const DENCKER_ASSETS = {
  // ── Los 3 Logos Oficiales Vectorizados & Alta Resolución ──
  logo1ChefHatSvg: "/img/brand/logo-1-chef-hat.svg",
  logo1ChefHatPng: "/img/brand/logo-1-chef-hat.png",
  logo2VintageTicketPng: "/img/brand/logo-2-dencker-coffee-vintage.png",
  logo2VintageTicketSvg: "/img/brand/logo-2-dencker-coffee-vintage.svg",
  logo3DonDenckerBadgePng: "/img/brand/logo-3-don-dencker-badge.png",
  logo3DonDenckerBadgeSvg: "/img/brand/logo-3-don-dencker-badge.svg",

  // Compatibilidad con código existente
  logo: "/img/brand/logo-1-chef-hat.svg",
  logoPng: "/img/brand/logo-1-chef-hat.png",
  logoSvg: "/img/brand/logo-1-chef-hat.svg",
  mascotClean: "/img/brand/don-dencker-mascot-clean.png",
  badgeClean: "/img/brand/logo-3-don-dencker-badge.png",
  coffeeVintage: "/img/brand/logo-2-dencker-coffee-vintage.png",
  mascotCoffee: "/img/brand/mascot-coffee.png",
  mascotCroissant: "/img/brand/mascot-croissant.png",
  mascotBread: "/img/brand/mascot-bread.png",
  mascotPizza: "/img/brand/mascot-pizza.png",
  cafe4Llamas: "/img/brand/cafe-4llamas-pack.png",
  cafeCatuai: "/img/brand/cafe-catuai-badge.png",
  menuPdfDownload: "/menu-dencker.pdf",
  banners: [
    "https://i.ibb.co/bjzqQPhh/dencker-banner-1.jpg",
    "https://i.ibb.co/bjzqQPhh/dencker-banner-1.jpg"
  ],
  barcodeSound: "https://tienda.denckerpan.com/pedido/sounds/barcode.mp3",
  whatsapp: "https://wa.me/59176911000",
  whatsappNumber: "+591 76911000",
  googleMaps: "https://maps.app.goo.gl/xn24aVhPQEC9dUf16",
  direccion: "Av. Daniel Salamanca, Cochabamba, Bolivia",
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

export const SEED_CATEGORIAS: Categoria[] = [
  {
    "id": "c_desayunos",
    "nombre": "Desayunos",
    "emoji": "🍳",
    "descripcion": "Huevos benedictinos, revueltos, omelettes y desayunos completos con café o té",
    "estacion": "cocina",
    "orden": 1,
    "activa": true,
    "imagen_url": "/img/brand/mascot-croissant.png"
  },
  {
    "id": "c_cafes",
    "nombre": "Cafés de Especialidad (4 Llamas)",
    "emoji": "☕",
    "descripcion": "Granos 4 Llamas de Caranavi (1700 msnm), espresso, cortado y flat white",
    "estacion": "cafeteria",
    "orden": 2,
    "activa": true,
    "imagen_url": "/img/brand/mascot-coffee.png"
  },
  {
    "id": "c_lattes",
    "nombre": "Lattes",
    "emoji": "🥛",
    "descripcion": "Latte clásico, caramel, vainilla caramelo, mocha y cinnamon con leche texturizada",
    "estacion": "cafeteria",
    "orden": 3,
    "activa": true,
    "imagen_url": "/img/brand/mascot-coffee.png"
  },
  {
    "id": "c_chocolates",
    "nombre": "Chocolates",
    "emoji": "🍫",
    "descripcion": "Chocolate con leche texturizada, marshmallow tostado, vainilla o al agua",
    "estacion": "cafeteria",
    "orden": 4,
    "activa": true,
    "imagen_url": "/img/brand/mascot-coffee.png"
  },
  {
    "id": "c_tes",
    "nombre": "Tés & Mates",
    "emoji": "🫖",
    "descripcion": "Té frutos rojos, verde jazmín, jengibre y miel, trimate y chai tea latte",
    "estacion": "cafeteria",
    "orden": 5,
    "activa": true,
    "imagen_url": "/img/brand/mascot-coffee.png"
  },
  {
    "id": "c_frappes",
    "nombre": "Frappés",
    "emoji": "🥤",
    "descripcion": "Frappés helados con crema batida, galletas Oreo, mocha y caramelo",
    "estacion": "cafeteria",
    "orden": 6,
    "activa": true,
    "imagen_url": "/img/brand/mascot-coffee.png"
  },
  {
    "id": "c_helados",
    "nombre": "Helados Artesanales",
    "emoji": "🍨",
    "descripcion": "Copas vienesas, melvas y porciones artesanales simples y dobles",
    "estacion": "cafeteria",
    "orden": 7,
    "activa": true,
    "imagen_url": "/img/brand/mascot-coffee.png"
  },
  {
    "id": "c_jugos",
    "nombre": "Jugos Naturales",
    "emoji": "🍹",
    "descripcion": "Frutas de temporada al agua o leche, mixtos tropicales y limonada con hierbabuena",
    "estacion": "cafeteria",
    "orden": 8,
    "activa": true,
    "imagen_url": "/img/brand/mascot-coffee.png"
  },
  {
    "id": "c_refrescos",
    "nombre": "Refrescos & Bebidas",
    "emoji": "🧊",
    "descripcion": "Iced tea de la casa, gaseosas 500cc y agua mineral con o sin gas",
    "estacion": "vitrina",
    "orden": 9,
    "activa": true,
    "imagen_url": "/img/brand/mascot-coffee.png"
  },
  {
    "id": "c_dulces",
    "nombre": "Pastelería & Dulces",
    "emoji": "🥐",
    "descripcion": "Alfajores de maicena, medialunas hojaldradas, New York rolls, cinnamon rolls y donas",
    "estacion": "vitrina",
    "orden": 10,
    "activa": true,
    "imagen_url": "/img/brand/mascot-croissant.png"
  },
  {
    "id": "c_postres",
    "nombre": "Postres & Tortas",
    "emoji": "🍰",
    "descripcion": "Cheesecake New York, torta vasca tostada, tartaleta de chocolate, pies y tres leches",
    "estacion": "vitrina",
    "orden": 11,
    "activa": true,
    "imagen_url": "/img/brand/mascot-croissant.png"
  },
  {
    "id": "c_saladas",
    "nombre": "Masitas Saladas",
    "emoji": "🥟",
    "descripcion": "Empanadas de queso, cuñapés calientes, llauchas paceñas, sonsos y croissant de queso",
    "estacion": "vitrina",
    "orden": 12,
    "activa": true,
    "imagen_url": "/img/brand/mascot-croissant.png"
  },
  {
    "id": "c_sandwiches",
    "nombre": "Sándwiches Gourmet",
    "emoji": "🥪",
    "descripcion": "Sándwich Especial Dencker (a tu gusto), lomito, pesto, St. Germain y Croque Monsieur",
    "estacion": "cocina",
    "orden": 13,
    "activa": true,
    "imagen_url": "/img/brand/mascot-bread.png"
  },
  {
    "id": "c_ensaladas",
    "nombre": "Ensaladas Frescas",
    "emoji": "🥗",
    "descripcion": "César con pollo, ensalada thai con naranja y pasta salad fresca",
    "estacion": "cocina",
    "orden": 14,
    "activa": true,
    "imagen_url": "/img/brand/mascot-bread.png"
  },
  {
    "id": "c_pizzas",
    "nombre": "Pizzas Artesanales",
    "emoji": "🍕",
    "descripcion": "Pizza Especial Dencker (a tu gusto) y tradicionales en 4, 6 y 8 porciones",
    "estacion": "cocina",
    "orden": 15,
    "activa": true,
    "imagen_url": "/img/brand/mascot-pizza.png"
  },
  {
    "id": "c_extras",
    "nombre": "Guarniciones & Extras",
    "emoji": "🍟",
    "descripcion": "Papas fritas crocantes, palta fresca, tocino, jamón y tostadas de la casa",
    "estacion": "cocina",
    "orden": 16,
    "activa": true,
    "imagen_url": "/img/brand/mascot-bread.png"
  }
];

export const SEED_PRODUCTOS: Producto[] = [
  {
    "id": "prod_rise_shine",
    "categoria_id": "c_desayunos",
    "nombre": "Rise & Shine",
    "descripcion": "Huevos revueltos, tostadas artesanales, tomate fresco, queso criollo boliviano, granola con yogurt. Viene con café o té a elección.",
    "precio": 45,
    "costo": 18,
    "imagen_url": "/img/products/1711660195.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 40,
    "chips_personalizacion": [
      "Café americano",
      "Té de frutos rojos",
      "Huevos bien cocidos",
      "Queso extra (+3 Bs)"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_jamon_palta",
    "categoria_id": "c_desayunos",
    "nombre": "Jamón y Palta",
    "descripcion": "Tostadas de pan artesanal con generosa porción de jamón seleccionado y palta fresca en láminas. Viene con café o té a elección.",
    "precio": 30,
    "costo": 12,
    "imagen_url": "/img/products/1711662981.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 35,
    "chips_personalizacion": [
      "Café americano",
      "Té negro",
      "Pan integral",
      "Palta extra (+10 Bs)"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_huevos_revueltos_fritos",
    "categoria_id": "c_desayunos",
    "nombre": "Huevos Revueltos o Fritos",
    "descripcion": "Huevos frescos revueltos o fritos acompañados de jamón o tomate, tostadas de la casa y mantequilla. Viene con café o té.",
    "precio": 35,
    "costo": 14,
    "imagen_url": "/img/products/1711663005.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 40,
    "chips_personalizacion": [
      "Huevos revueltos",
      "Huevos fritos",
      "Con jamón",
      "Con tomate",
      "Café americano",
      "Té"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_omelette",
    "categoria_id": "c_desayunos",
    "nombre": "Omelette Dencker",
    "descripcion": "Omelette jugoso servido con tostadas, café o té. Agrégale a tu gusto dos ingredientes: Tomate, jamón, champiñones, pimentón, cebolla, aceitunas o queso.",
    "precio": 40,
    "costo": 16,
    "imagen_url": "/img/products/1711663044.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 30,
    "chips_personalizacion": [
      "Jamón + Queso",
      "Champiñones + Queso",
      "Tomate + Albahaca",
      "Cebolla + Pimentón",
      "Café americano",
      "Té"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_huevos_benedictinos",
    "categoria_id": "c_desayunos",
    "nombre": "Huevos Escalfados (Benedictinos)",
    "descripcion": "Huevos escalfados al punto, hojas tiernas de espinaca fresca, jamón y suave salsa de queso artesanal sobre pan de molde tostado. Incluye café o té.",
    "precio": 40,
    "costo": 16,
    "imagen_url": "/img/products/1711663068.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 25,
    "chips_personalizacion": [
      "Yema tierna líquida",
      "Yema cocida",
      "Café americano",
      "Cappuccino (+6 Bs)"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_continental",
    "categoria_id": "c_desayunos",
    "nombre": "Desayuno Continental",
    "descripcion": "Tostadas o pan baguette crujiente, mermelada artesanal de la casa, mantequilla noble, ensalada de fruta fresca, café o té y jugo natural o mimosa.",
    "precio": 35,
    "costo": 14,
    "imagen_url": "/img/products/1711663289.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 40,
    "chips_personalizacion": [
      "Pan baguette",
      "Tostadas molde",
      "Con jugo de naranja",
      "Con mimosa",
      "Café con leche"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_golosa_caprichosa",
    "categoria_id": "c_desayunos",
    "nombre": "Golosa y Caprichosa",
    "descripcion": "Frutos rojos frescos, chocolate para untar sedoso y crema batida. Viene con café o té. Elige tu base favorita: Panqueques esponjosos, Waffles crujientes o Tostadas francesas.",
    "precio": 40,
    "costo": 15,
    "imagen_url": "/img/products/1711663360.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 35,
    "chips_personalizacion": [
      "Base: Waffles",
      "Base: Panqueques",
      "Base: Tostadas Francesas",
      "Café americano",
      "Chocolate caliente (+6 Bs)"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_expresso",
    "categoria_id": "c_cafes",
    "nombre": "Expresso 4 Llamas (30cc)",
    "descripcion": "Extracción corta de 30cc con granos Catuaí Lavado de Caranavi (1700 msnm). Crema dorada elástica, notas de chocolate, naranja y caramelo.",
    "precio": 15,
    "costo": 4.5,
    "imagen_url": "/img/brand/cafe-catuai-badge.png",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 100,
    "chips_personalizacion": [
      "Sin azúcar",
      "Azúcar rubia",
      "Doble shot (+6 Bs)"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_expresso_rocas",
    "categoria_id": "c_cafes",
    "nombre": "Expresso en las Rocas",
    "descripcion": "Doble shot de espresso vertido directamente sobre rocas de hielo cristalino.",
    "precio": 16,
    "costo": 5,
    "imagen_url": "/img/products/1711663451.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 80,
    "chips_personalizacion": [
      "Hielo extra",
      "Toque de cáscara de naranja",
      "Sin endulzante"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_expresso_cortado",
    "categoria_id": "c_cafes",
    "nombre": "Expresso Cortado",
    "descripcion": "Expresso concentrado cortado con una pizca de leche vaporizada aterciopelada.",
    "precio": 16,
    "costo": 5,
    "imagen_url": "/img/products/1711663551.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 90,
    "chips_personalizacion": [
      "Leche entera",
      "Leche deslactosada",
      "Leche de almendras (+3 Bs)"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_cafe_americano",
    "categoria_id": "c_cafes",
    "nombre": "Café Americano",
    "descripcion": "Expresso de especialidad 4 Llamas combinado con agua caliente filtrada. Cuerpo suave y aromático.",
    "precio": 16,
    "costo": 4.5,
    "imagen_url": "/img/products/1711663647.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 120,
    "chips_personalizacion": [
      "Bien caliente",
      "Tibio",
      "Jarra de leche caliente al lado (+3 Bs)"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_cappuccino",
    "categoria_id": "c_cafes",
    "nombre": "Cappuccino Tradicional",
    "descripcion": "Expresso equilibrado con leche texturizada sedosa y corona de espuma densa. Espolvoreado con canela o cacao puro.",
    "precio": 22,
    "costo": 7,
    "imagen_url": "/img/products/1711663751.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 90,
    "chips_personalizacion": [
      "Con Canela",
      "Con Cacao belga",
      "Leche entera",
      "Leche deslactosada",
      "Doble shot (+6 Bs)"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_cappuccino_vienes",
    "categoria_id": "c_cafes",
    "nombre": "Cappuccino Vienés",
    "descripcion": "Expresso, leche texturizada, copa coronada con crema de leche montada artesanal y salsa de chocolate o caramelo.",
    "precio": 23,
    "costo": 8,
    "imagen_url": "/img/products/1711663802.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 60,
    "chips_personalizacion": [
      "Salsa de chocolate",
      "Salsa de caramelo",
      "Crema montada extra (+3 Bs)"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_cappuccino_vainilla",
    "categoria_id": "c_cafes",
    "nombre": "Cappuccino Vainilla",
    "descripcion": "Expresso de especialidad, leche vaporizada texturizada y esencia pura dulce de vainilla.",
    "precio": 23,
    "costo": 7.5,
    "imagen_url": "/img/products/1711663889.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 70,
    "chips_personalizacion": [
      "Toque suave de vainilla",
      "Vainilla intensa",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_flat_white",
    "categoria_id": "c_cafes",
    "nombre": "Flat White Australiano",
    "descripcion": "Doble shot de expresso ristretto con microespuma fina de leche texturizada aterciopelada sin burbujas.",
    "precio": 25,
    "costo": 8.5,
    "imagen_url": "/img/products/1711663929.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 50,
    "chips_personalizacion": [
      "Leche entera",
      "Leche de almendras (+3 Bs)",
      "Shot extra (+6 Bs)"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_affogato",
    "categoria_id": "c_cafes",
    "nombre": "Affogato al Caffè",
    "descripcion": "Un shot de expresso caliente recién extraído vertido sobre una generosa porción de helado artesanal de vainilla.",
    "precio": 25,
    "costo": 9,
    "imagen_url": "/img/products/1711667839.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 45,
    "chips_personalizacion": [
      "Helado de vainilla",
      "Helado de crema americana",
      "Toque de cacao"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_iced_coffee",
    "categoria_id": "c_cafes",
    "nombre": "Iced Coffee Dencker",
    "descripcion": "Café americano servido helado sobre rocas con notas refrescantes de café de altura.",
    "precio": 22,
    "costo": 6,
    "imagen_url": "/img/products/1711667871.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 80,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con sirope simple",
      "Con toque de leche"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_latte_clasico",
    "categoria_id": "c_lattes",
    "nombre": "Latte Clásico",
    "descripcion": "Abundante leche texturizada cremosa con expresso suave 4 Llamas y delicado arte latte.",
    "precio": 22,
    "costo": 7,
    "imagen_url": "/img/products/1711667906.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 85,
    "chips_personalizacion": [
      "Leche entera",
      "Leche deslactosada",
      "Leche de almendras (+3 Bs)"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_latte_caramel",
    "categoria_id": "c_lattes",
    "nombre": "Latte Caramel",
    "descripcion": "Leche texturizada, expresso de especialidad y espiral de salsa de caramelo artesanal.",
    "precio": 24,
    "costo": 8,
    "imagen_url": "/img/products/1711667945.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 65,
    "chips_personalizacion": [
      "Caramelo suave",
      "Caramelo extra",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_latte_vainilla_caramelo",
    "categoria_id": "c_lattes",
    "nombre": "Latte Vainilla Caramelo",
    "descripcion": "Leche texturizada sedosa, expresso, toque de vainilla aromática y drizzle de caramelo.",
    "precio": 25,
    "costo": 8.5,
    "imagen_url": "/img/products/1711667993.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 55,
    "chips_personalizacion": [
      "Leche entera",
      "Leche deslactosada",
      "Tibio",
      "Bien caliente"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_latte_mocha",
    "categoria_id": "c_lattes",
    "nombre": "Latte Mocha",
    "descripcion": "Fusión perfecta de expresso 4 Llamas, chocolate oscuro fundido y leche vaporizada aterciopelada.",
    "precio": 25,
    "costo": 8.5,
    "imagen_url": "/img/products/1711668080.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 60,
    "chips_personalizacion": [
      "Chocolate negro",
      "Con crema chantilly (+3 Bs)",
      "Leche entera"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_latte_cinnamon",
    "categoria_id": "c_lattes",
    "nombre": "Latte Cinnamon (Canela)",
    "descripcion": "Leche texturizada con expresso infusionado con fina canela dulce de Ceilán.",
    "precio": 24,
    "costo": 8,
    "imagen_url": "/img/products/1711668133.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 50,
    "chips_personalizacion": [
      "Canela en rama",
      "Canela molida",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_chocolate_leche",
    "categoria_id": "c_chocolates",
    "nombre": "Chocolate con Leche",
    "descripcion": "Cacao seleccionado boliviano disuelto en leche fresca texturizada al vapor.",
    "precio": 22,
    "costo": 7,
    "imagen_url": "/img/products/1711668160.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 70,
    "chips_personalizacion": [
      "Bien caliente",
      "Tibio para niños",
      "Canela encima"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_chocolate_marshmallow",
    "categoria_id": "c_chocolates",
    "nombre": "Chocolate con Marshmallow",
    "descripcion": "Chocolate con leche cremoso coronado con mini nubes de marshmallow que se funden lentamente.",
    "precio": 25,
    "costo": 8,
    "imagen_url": "/img/products/1711668187.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 55,
    "chips_personalizacion": [
      "Marshmallows extra",
      "Toque de canela",
      "Crema chantilly (+3 Bs)"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_chocolate_vainilla",
    "categoria_id": "c_chocolates",
    "nombre": "Chocolate Vainilla",
    "descripcion": "Chocolate caliente preparado con leche texturizada y esencia dulce aromática de vainilla.",
    "precio": 25,
    "costo": 8,
    "imagen_url": "/img/products/1711668224.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 45,
    "chips_personalizacion": [
      "Leche entera",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_chocolate_agua",
    "categoria_id": "c_chocolates",
    "nombre": "Chocolate al Agua Tradicional",
    "descripcion": "Receta clásica boliviana de cacao puro batido con agua caliente y un toque de canela.",
    "precio": 20,
    "costo": 6,
    "imagen_url": "/img/products/1711668294.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 50,
    "chips_personalizacion": [
      "Con clavo y canela",
      "Poco dulce",
      "Amargo puro"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_te_negro_verde",
    "categoria_id": "c_tes",
    "nombre": "Té Negro o Verde",
    "descripcion": "Hojas selectas servidas en tetera individual con agua a temperatura perfecta.",
    "precio": 12,
    "costo": 3,
    "imagen_url": "/img/products/1711668321.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 90,
    "chips_personalizacion": [
      "Té Negro",
      "Té Verde",
      "Rodaja de limón",
      "Miel pura (+2 Bs)"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_te_frutos_rojos",
    "categoria_id": "c_tes",
    "nombre": "Té de Frutos Rojos",
    "descripcion": "Infusión frutal aromática de frambuesas, moras, frutillas y flor de jamaica.",
    "precio": 16,
    "costo": 4.5,
    "imagen_url": "/img/products/1711668348.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 80,
    "chips_personalizacion": [
      "Caliente",
      "Helado en las rocas",
      "Con miel"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_te_verde_jazmin",
    "categoria_id": "c_tes",
    "nombre": "Té Verde Jazmín",
    "descripcion": "Té verde floral aromatizado con brotes frescos naturales de jazmín.",
    "precio": 15,
    "costo": 4,
    "imagen_url": "/img/products/1711668397.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 60,
    "chips_personalizacion": [
      "En tetera caliente",
      "Suave",
      "Cargado"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_te_limon_jengibre_miel",
    "categoria_id": "c_tes",
    "nombre": "Té Limón, Jengibre y Miel",
    "descripcion": "Reconfortante infusión casera con jengibre fresco rallado, jugo de limón sutil y miel de abeja pura.",
    "precio": 20,
    "costo": 6,
    "imagen_url": "/img/products/1711668491.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 70,
    "chips_personalizacion": [
      "Bien caliente",
      "Jengibre suave",
      "Jengibre intenso"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_mate_tradicional",
    "categoria_id": "c_tes",
    "nombre": "Mates Tradicionales",
    "descripcion": "Hierbas naturales digestivas en taza o tetera: Manzanilla, Anís, Coca o Trimate.",
    "precio": 12,
    "costo": 3,
    "imagen_url": "/img/products/1711668521.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 100,
    "chips_personalizacion": [
      "Manzanilla",
      "Anís",
      "Coca",
      "Trimate",
      "Con azúcar",
      "Sin azúcar"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_chai_tea_latte",
    "categoria_id": "c_tes",
    "nombre": "Chai Tea Latte",
    "descripcion": "Té negro especiado con cardamomo, canela, clavo de olor, jengibre y leche vaporizada con espuma suave.",
    "precio": 22,
    "costo": 7,
    "imagen_url": "/img/products/1711668566.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 50,
    "chips_personalizacion": [
      "Leche entera",
      "Leche deslactosada",
      "Espolvoreado con canela"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_frappe_light",
    "categoria_id": "c_frappes",
    "nombre": "Frappé Light",
    "descripcion": "Expresso 4 Llamas batido con leche descremada, hielo frappé y edulcorante sin calorías.",
    "precio": 24,
    "costo": 7,
    "imagen_url": "/img/products/1711668603.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 40,
    "chips_personalizacion": [
      "Con edulcorante Stevia",
      "Sin endulzar",
      "Con shot extra (+6 Bs)"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_frappe_vainilla",
    "categoria_id": "c_frappes",
    "nombre": "Frappé Vainilla",
    "descripcion": "Expresso, leche, hielo frappé batido, corona de crema chantilly montada y salsa de caramelo dorado.",
    "precio": 25,
    "costo": 8,
    "imagen_url": "/img/products/1711812838.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 50,
    "chips_personalizacion": [
      "Con crema chantilly",
      "Sin crema",
      "Salsa de caramelo extra (+2 Bs)"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_frappe_mocha",
    "categoria_id": "c_frappes",
    "nombre": "Frappé Mocha",
    "descripcion": "Expresso, leche, hielo frappé, chocolate intenso, crema batida y salsa de chocolate belga.",
    "precio": 26,
    "costo": 8.5,
    "imagen_url": "/img/products/1711812877.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 55,
    "chips_personalizacion": [
      "Con crema chantilly",
      "Sin crema",
      "Chocolate extra (+2 Bs)"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_frappe_oreo",
    "categoria_id": "c_frappes",
    "nombre": "Frappé Oreo",
    "descripcion": "Expresso, leche, hielo, galletas Oreo trituradas en el batido, crema batida y galleta entera de adorno.",
    "precio": 26,
    "costo": 9,
    "imagen_url": "/img/products/1711813236.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 60,
    "chips_personalizacion": [
      "Con Oreo extra",
      "Con crema chantilly",
      "Drizzle de chocolate"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_frappe_dos_chocolates",
    "categoria_id": "c_frappes",
    "nombre": "Frappé Dos Chocolates",
    "descripcion": "Expresso, leche frappé, chispas crujientes de chocolate blanco y negro, crema batida y salsa de chocolate.",
    "precio": 26,
    "costo": 9,
    "imagen_url": "/img/products/1711813317.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 45,
    "chips_personalizacion": [
      "Chispas extra",
      "Con crema chantilly",
      "Salsa doble"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_copa_vienesa_melva",
    "categoria_id": "c_helados",
    "nombre": "Copa Vienesa o Copa Melva",
    "descripcion": "Generosa copa con 3 bolas de helado artesanal, frutas frescas de estación, crema chantilly, oblea y salsa.",
    "precio": 35,
    "costo": 13,
    "imagen_url": "/img/products/1711813593.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 35,
    "chips_personalizacion": [
      "Copa Vienesa",
      "Copa Melva con duraznos",
      "Salsa de chocolate",
      "Salsa de caramelo"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_helado_simple",
    "categoria_id": "c_helados",
    "nombre": "Porción de Helado Simple (1 bola)",
    "descripcion": "Una bola de helado artesanal en copa de vidrio o cono crocante.",
    "precio": 15,
    "costo": 5,
    "imagen_url": "/img/products/1711823193.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 80,
    "chips_personalizacion": [
      "Vainilla",
      "Chocolate",
      "Frutilla",
      "Dulce de leche"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_helado_doble",
    "categoria_id": "c_helados",
    "nombre": "Porción de Helado Doble (2 bolas)",
    "descripcion": "Dos bolas de helado artesanal a elección servidas con oblea crocante.",
    "precio": 20,
    "costo": 7,
    "imagen_url": "/img/products/1711823213.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 70,
    "chips_personalizacion": [
      "Vainilla + Chocolate",
      "Dulce de leche + Vainilla",
      "Frutilla + Crema"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_jugo_temporada_agua",
    "categoria_id": "c_jugos",
    "nombre": "Jugo de Fruta de Temporada (al agua)",
    "descripcion": "Fruta fresca licuada al momento con agua filtrada: Frutilla, piña, limón, durazno, papaya o maracuyá.",
    "precio": 15,
    "costo": 4.5,
    "imagen_url": "/img/products/1711823283.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 90,
    "chips_personalizacion": [
      "Frutilla",
      "Piña",
      "Maracuyá",
      "Papaya",
      "Durazno",
      "Limón",
      "Sin azúcar",
      "Poco azúcar"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_jugo_temporada_leche",
    "categoria_id": "c_jugos",
    "nombre": "Jugo de Fruta de Temporada (con leche)",
    "descripcion": "Batido cremoso de fruta fresca licuada con leche: Frutilla, durazno, papaya o maracuyá.",
    "precio": 20,
    "costo": 6.5,
    "imagen_url": "/img/products/1711823429.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 80,
    "chips_personalizacion": [
      "Frutilla con leche",
      "Papaya con leche",
      "Durazno con leche",
      "Maracuyá con leche"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_jugo_frutilla_naranja",
    "categoria_id": "c_jugos",
    "nombre": "Jugo Mixto Frutilla y Naranja",
    "descripcion": "Jugo natural exprimido de naranja dulce combinado con frutillas frescas de Cochabamba.",
    "precio": 22,
    "costo": 7,
    "imagen_url": "/img/products/1711823470.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 70,
    "chips_personalizacion": [
      "Con hielo",
      "Sin hielo",
      "Sin endulzante añadido"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_jugo_mango_naranja_maracuya",
    "categoria_id": "c_jugos",
    "nombre": "Jugo Mixto Mango, Naranja y Maracuyá",
    "descripcion": "Trío tropical refrescante con pulpa de mango maduro, jugo de naranja recién exprimido y maracuyá ácido.",
    "precio": 25,
    "costo": 8,
    "imagen_url": "/img/products/1711823698.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 65,
    "chips_personalizacion": [
      "Con hielo frappé",
      "Natural al clima",
      "Bien frío"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_limonada_hierbabuena",
    "categoria_id": "c_jugos",
    "nombre": "Limonada con Hierbabuena",
    "descripcion": "Limón sutil fresco licuado con hojas aromáticas de hierbabuena y hielo picado.",
    "precio": 20,
    "costo": 5,
    "imagen_url": "/img/products/1711823843.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 85,
    "chips_personalizacion": [
      "Dulzor regular",
      "Poco azúcar",
      "Con edulcorante Stevia"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_pina_hierbabuena",
    "categoria_id": "c_jugos",
    "nombre": "Jugo de Piña con Hierbabuena",
    "descripcion": "Piña dulce golden fresca licuada con hojas aromáticas de hierbabuena de huerto.",
    "precio": 20,
    "costo": 5.5,
    "imagen_url": "/img/products/1711823887.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 75,
    "chips_personalizacion": [
      "Bien helado",
      "Sin colar",
      "Colado"
    ],
    "estacion": "cafeteria"
  },
  {
    "id": "prod_iced_tea",
    "categoria_id": "c_refrescos",
    "nombre": "Iced Tea de la Casa",
    "descripcion": "Té negro infusionado en frío con toques de durazno y rodajas de limón fresco.",
    "precio": 16,
    "costo": 4,
    "imagen_url": "/img/products/1711823907.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 90,
    "chips_personalizacion": [
      "Con limón",
      "Sin endulzar",
      "Dulce"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_gaseosa_500",
    "categoria_id": "c_refrescos",
    "nombre": "Gaseosa 500cc",
    "descripcion": "Botella individual de 500cc helada: Coca Cola, Fanta o Sprite.",
    "precio": 10,
    "costo": 5,
    "imagen_url": "/img/products/1711823948.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 150,
    "chips_personalizacion": [
      "Coca Cola clásica",
      "Coca Cola Zero",
      "Fanta naranja",
      "Sprite"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_agua_500",
    "categoria_id": "c_refrescos",
    "nombre": "Agua Mineral 500cc",
    "descripcion": "Agua mineral purificada en botella 500cc con o sin gas.",
    "precio": 10,
    "costo": 3.5,
    "imagen_url": "/img/products/1711824121.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 120,
    "chips_personalizacion": [
      "Sin gas",
      "Con gas",
      "Al clima",
      "Helada"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_alfajor_maicena",
    "categoria_id": "c_dulces",
    "nombre": "Alfajor de Maicena",
    "descripcion": "Galletas suaves de maicena que se deshacen en boca, rellenas de dulce de leche artesanal y rebozadas en coco rallado.",
    "precio": 7.5,
    "costo": 2.5,
    "imagen_url": "/img/products/1711824161.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 60,
    "chips_personalizacion": [
      "Para comer aquí",
      "Para llevar en empaque"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_muffin_arandanos_choco",
    "categoria_id": "c_dulces",
    "nombre": "Muffin de Arándanos y Chocolate",
    "descripcion": "Muffin horneado esponjoso con arándanos frescos enteros y chispas de chocolate semiamargo.",
    "precio": 11.5,
    "costo": 4,
    "imagen_url": "/img/products/1711824228.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 45,
    "chips_personalizacion": [
      "Tibio de microondas",
      "Al clima"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_alfajor_marplatense",
    "categoria_id": "c_dulces",
    "nombre": "Alfajor Marplatense",
    "descripcion": "Galleta tierna de alfajor con cacao rellena de abundante dulce de leche y bañada en fina cobertura de chocolate negro.",
    "precio": 12.5,
    "costo": 4.5,
    "imagen_url": "/img/products/1711824313.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 50,
    "chips_personalizacion": [
      "Para llevar",
      "Servido en plato"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_cinnamon_roll",
    "categoria_id": "c_dulces",
    "nombre": "Cinnamon Roll Artesanal",
    "descripcion": "Rollo de canela horneado con masa brioche esponjosa, canela especiada y glaseado cremoso.",
    "precio": 13,
    "costo": 4.5,
    "imagen_url": "/img/products/1711824378.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 40,
    "chips_personalizacion": [
      "Tibio",
      "Glaseado extra (+2 Bs)"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_medialuna",
    "categoria_id": "c_dulces",
    "nombre": "Medialuna Hojaldrada",
    "descripcion": "Masa hojaldrada tierna en forma de croissant tradicional con almíbar aromático.",
    "precio": 10.5,
    "costo": 3.5,
    "imagen_url": "/img/brand/mascot-croissant.png",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 50,
    "chips_personalizacion": [
      "Tibia",
      "Con mermelada (+2 Bs)"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_new_york_roll",
    "categoria_id": "c_dulces",
    "nombre": "New York Roll",
    "descripcion": "Masa hojaldrada en espiral circular rellena y bañada. Opciones de relleno: Chocolate, dulce de leche, leche condensada o pistacho.",
    "precio": 21,
    "costo": 7.5,
    "imagen_url": "/img/products/1711824502.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 35,
    "chips_personalizacion": [
      "Relleno: Pistacho",
      "Relleno: Chocolate",
      "Relleno: Dulce de leche",
      "Relleno: Leche condensada"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_bombitas",
    "categoria_id": "c_dulces",
    "nombre": "Bombitas de Crema",
    "descripcion": "Masa choux horneada ligera rellena de crema batida fresca y espolvoreada con azúcar glas.",
    "precio": 10,
    "costo": 3.5,
    "imagen_url": "/img/products/1711824583.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 45,
    "chips_personalizacion": [
      "Azúcar impalpable",
      "Bañada con chocolate (+2 Bs)"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_eclair",
    "categoria_id": "c_dulces",
    "nombre": "Éclair de Chocolate",
    "descripcion": "Masa choux alargada francesa rellena de suave crema pastelera casera y decorada con glaseado de chocolate.",
    "precio": 9,
    "costo": 3,
    "imagen_url": "/img/products/1711824687.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 45,
    "chips_personalizacion": [
      "Crema pastelera tradicional"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_pencos",
    "categoria_id": "c_dulces",
    "nombre": "Pencos Tradicionales",
    "descripcion": "Galleta tradicional boliviana crocante y aromática de receta secreta.",
    "precio": 10,
    "costo": 3,
    "imagen_url": "/img/products/1711824741.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 60,
    "chips_personalizacion": [
      "Porción individual"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_hojarascas",
    "categoria_id": "c_dulces",
    "nombre": "Hojarascas con Pastelera",
    "descripcion": "Finas láminas crocantes de masa hojaldrada rellenas con crema pastelera suave de vainilla.",
    "precio": 7.5,
    "costo": 2.5,
    "imagen_url": "/img/products/1711824830.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 50,
    "chips_personalizacion": [
      "Con crema pastelera",
      "Con manjar dulce de leche"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_brownie",
    "categoria_id": "c_dulces",
    "nombre": "Brownie de Chocolate y Nueces",
    "descripcion": "Cuadro denso y húmedo de chocolate semiamargo con trozos de nueces tostadas.",
    "precio": 12.5,
    "costo": 4.5,
    "imagen_url": "/img/products/1711824998.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 40,
    "chips_personalizacion": [
      "Tibio",
      "Con bola de helado (+8 Bs)"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_galletas_chips",
    "categoria_id": "c_dulces",
    "nombre": "Galletas con Chips de Chocolate",
    "descripcion": "Galleta horneada estilo americano con chispas de chocolate derretidas y bordes crujientes.",
    "precio": 9.5,
    "costo": 3,
    "imagen_url": "/img/products/1712008791.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 50,
    "chips_personalizacion": [
      "Tibia",
      "Al clima"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_donas_rellenas",
    "categoria_id": "c_dulces",
    "nombre": "Donas Rellenas",
    "descripcion": "Dona tierna y esponjosa glaseada y rellena de dulce de leche o crema pastelera.",
    "precio": 12.5,
    "costo": 4,
    "imagen_url": "/img/products/1712009017.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 40,
    "chips_personalizacion": [
      "Rellena de dulce de leche",
      "Rellena de chocolate",
      "Rellena de pastelera"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_babka",
    "categoria_id": "c_dulces",
    "nombre": "Babka de Chocolate",
    "descripcion": "Porción de pan trenzado artesanal con vetas intensas de chocolate amargo y canela.",
    "precio": 10,
    "costo": 3.5,
    "imagen_url": "/img/products/1712010095.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 35,
    "chips_personalizacion": [
      "Tibio"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_tartaleta_chocolate",
    "categoria_id": "c_postres",
    "nombre": "Tartaleta de Chocolate",
    "descripcion": "Masa quebrada crocante rellena de ganache puro de chocolate oscuro belga con toque brillante.",
    "precio": 20,
    "costo": 7,
    "imagen_url": "/img/products/1712114164.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 30,
    "chips_personalizacion": [
      "Para comer en salón",
      "Para llevar en domo"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_cheesecake",
    "categoria_id": "c_postres",
    "nombre": "Cheesecake Clásico",
    "descripcion": "Porción de cheesecake cremoso horneado sobre base de galleta con cobertura de frutos rojos.",
    "precio": 27,
    "costo": 9.5,
    "imagen_url": "/img/products/1712114283.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 25,
    "chips_personalizacion": [
      "Coulis de frutos rojos",
      "Coulis de maracuyá"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_torta_vasca",
    "categoria_id": "c_postres",
    "nombre": "Torta Vasca Tostada",
    "descripcion": "Auténtica tarta de queso de San Sebastián caramelizada por fuera y con corazón cremoso y fundente.",
    "precio": 27,
    "costo": 9.5,
    "imagen_url": "/img/products/1712115596.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 25,
    "chips_personalizacion": [
      "A temperatura ambiente",
      "Fría"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_torta_cafe",
    "categoria_id": "c_postres",
    "nombre": "Torta de Café Dencker",
    "descripcion": "Bizcochuelo húmedo embebido en expresso 4 Llamas relleno con crema suave de moca.",
    "precio": 17,
    "costo": 6,
    "imagen_url": "/img/products/1712117921.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 30,
    "chips_personalizacion": [
      "Porción individual"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_torta_chocolate",
    "categoria_id": "c_postres",
    "nombre": "Torta de Chocolate Húmeda",
    "descripcion": "Capas de bizcocho esponjoso y húmedo de chocolate rellenas de fudge casero de chocolate.",
    "precio": 17,
    "costo": 6,
    "imagen_url": "/img/products/1712146728.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 35,
    "chips_personalizacion": [
      "Tibia",
      "Al clima"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_pie_limon",
    "categoria_id": "c_postres",
    "nombre": "Pie de Limón Merengado",
    "descripcion": "Base crocante de masa sablée con crema ácida de limón natural coronada de merengue tostado al soplete.",
    "precio": 18,
    "costo": 6,
    "imagen_url": "/img/products/1712146742.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 30,
    "chips_personalizacion": [
      "Merengue tostado"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_pie_manzana",
    "categoria_id": "c_postres",
    "nombre": "Pie de Manzana Especiado",
    "descripcion": "Manzanas cocidas con canela dulce y mantequilla bajo un enrejado dorado de masa quebrada.",
    "precio": 18,
    "costo": 6,
    "imagen_url": "/img/products/1712146999.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 25,
    "chips_personalizacion": [
      "Tibio",
      "Con bola de helado (+8 Bs)"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_tres_leches",
    "categoria_id": "c_postres",
    "nombre": "Torta Tres Leches",
    "descripcion": "Bizcocho esponjoso empapado en mezcla de tres leches y canela, cubierto de merengue suave.",
    "precio": 19,
    "costo": 6.5,
    "imagen_url": "/img/products/1712147370.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 30,
    "chips_personalizacion": [
      "Fría de vitrina"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_mini_cake",
    "categoria_id": "c_postres",
    "nombre": "Mini Cake Artesanal",
    "descripcion": "Torta individual en porción personal. Elige tu sabor favorito: Chocolate intenso, Red Velvet o Zanahoria con frosting de queso crema.",
    "precio": 17,
    "costo": 6,
    "imagen_url": "/img/products/1712147686.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 30,
    "chips_personalizacion": [
      "Sabor: Red Velvet",
      "Sabor: Chocolate",
      "Sabor: Zanahoria con nuez"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_crumble_manzana",
    "categoria_id": "c_postres",
    "nombre": "Crumble de Manzana",
    "descripcion": "Compota de manzanas especiadas cubierta con crujiente streusel mantecoso horneado.",
    "precio": 19,
    "costo": 6.5,
    "imagen_url": "/img/products/1712148926.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 25,
    "chips_personalizacion": [
      "Tibio",
      "Con bola de helado (+8 Bs)"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_mil_hojas",
    "categoria_id": "c_postres",
    "nombre": "Torta Mil Hojas",
    "descripcion": "Finas capas de hojaldre crujiente intercaladas con generosas capas de dulce de leche artesanal.",
    "precio": 19,
    "costo": 6.5,
    "imagen_url": "/img/products/1712588603.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 30,
    "chips_personalizacion": [
      "Con dulce de leche",
      "Con azúcar glas"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_empanada_queso",
    "categoria_id": "c_saladas",
    "nombre": "Empanada de Queso",
    "descripcion": "Masa suave horneada rellena de abundante queso criollo fundido.",
    "precio": 8.5,
    "costo": 3,
    "imagen_url": "/img/products/1712588932.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 60,
    "chips_personalizacion": [
      "Tibia de vitrina",
      "Calentada al horno"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_cunape",
    "categoria_id": "c_saladas",
    "nombre": "Cuñapé Caliente Tradicional",
    "descripcion": "Masa tradicional a base de almidón de yuca y queso maduro horneado, crocante por fuera y elástico por dentro.",
    "precio": 8.5,
    "costo": 3,
    "imagen_url": "/img/products/1712588982.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 80,
    "chips_personalizacion": [
      "Bien caliente",
      "Para llevar en bolsa"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_cunape_frito",
    "categoria_id": "c_saladas",
    "nombre": "Cuñapé Frito",
    "descripcion": "Versión frita al momento del cuñapé tradicional, ultra crocante y dorado.",
    "precio": 7.5,
    "costo": 2.5,
    "imagen_url": "/img/products/1712589020.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 50,
    "chips_personalizacion": [
      "Recién salido"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_croissant_queso",
    "categoria_id": "c_saladas",
    "nombre": "Croissant de Queso",
    "descripcion": "Croissant hojaldrado con pura mantequilla horneado con queso gratinado por fuera y relleno fundido.",
    "precio": 10,
    "costo": 3.5,
    "imagen_url": "/img/brand/mascot-croissant.png",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 45,
    "chips_personalizacion": [
      "Tibio"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_italiano_jamon_queso",
    "categoria_id": "c_saladas",
    "nombre": "Italianos de Jamón y Queso",
    "descripcion": "Pan esponjoso horneado relleno con jamón cocido y queso mozzarella fundido.",
    "precio": 12.5,
    "costo": 4.5,
    "imagen_url": "/img/products/1712589116.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 50,
    "chips_personalizacion": [
      "Calentito"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_palitos_queso",
    "categoria_id": "c_saladas",
    "nombre": "Palitos de Queso Hojaldrados",
    "descripcion": "Bastoncitos de masa hojaldrada crujiente con queso criollo horneado.",
    "precio": 7.5,
    "costo": 2.5,
    "imagen_url": "/img/products/1712589164.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 60,
    "chips_personalizacion": [
      "Porción de 3 unidades"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_empanada_ricota",
    "categoria_id": "c_saladas",
    "nombre": "Empanada de Ricota (Integral)",
    "descripcion": "Masa integral con salvado rellena de queso ricota fresco bajo en grasa.",
    "precio": 10.5,
    "costo": 3.5,
    "imagen_url": "/img/products/1712589264.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 40,
    "chips_personalizacion": [
      "Tibia"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_llaucha_pacena",
    "categoria_id": "c_saladas",
    "nombre": "Llaucha Paceña Tradicional",
    "descripcion": "Clásica empanada paceña con masa tierna y abundante jigote de queso caliente y ají amarillo.",
    "precio": 12.5,
    "costo": 4.5,
    "imagen_url": "/img/products/1712589298.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 50,
    "chips_personalizacion": [
      "Con ají tradicional",
      "Bien caliente"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_pan_arroz",
    "categoria_id": "c_saladas",
    "nombre": "Pan de Arroz Camba",
    "descripcion": "Receta tradicional de los llanos con harina de arroz, yuca y queso horneado sobre hoja de plátano.",
    "precio": 10.5,
    "costo": 3.5,
    "imagen_url": "/img/products/1712589327.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 40,
    "chips_personalizacion": [
      "Sobre hoja de plátano"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_sonso",
    "categoria_id": "c_saladas",
    "nombre": "Sonso de Yuca",
    "descripcion": "Yuca fresca machacada con abundante queso criollo fundido, dorada al horno.",
    "precio": 15.5,
    "costo": 5.5,
    "imagen_url": "/img/products/1712589406.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 35,
    "chips_personalizacion": [
      "Extra queso",
      "Recién horneado"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_esfihas",
    "categoria_id": "c_saladas",
    "nombre": "Esfihas Abiertas de Carne",
    "descripcion": "Masa horneada de estilo oriental cubierta con carne molida sazonada al limón, cebolla y especias.",
    "precio": 12,
    "costo": 4.5,
    "imagen_url": "/img/products/1712589443.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 40,
    "chips_personalizacion": [
      "Con gajo de limón"
    ],
    "estacion": "vitrina"
  },
  {
    "id": "prod_sandwich_especial_dencker",
    "categoria_id": "c_sandwiches",
    "nombre": "Sándwich Especial Dencker (Arma a tu gusto)",
    "descripcion": "Personalizado: Elige DOS Proteínas (Pollo, Tocino, Jamón, Salame) + TRES Complementos (Champiñones, Choclo, Cebolla, Lechuga, Tomate, Queso, Piña, Palta). Servido en el pan que prefieras.",
    "precio": 40,
    "costo": 16,
    "imagen_url": "/img/brand/mascot-bread.png",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 40,
    "chips_personalizacion": [
      "Pan molde blanco",
      "Pan molde integral",
      "Pan ciabatta",
      "Pan baguette",
      "Croissant (+5 Bs)",
      "Pollo + Tocino",
      "Jamón + Salame"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_sandwich_lomito",
    "categoria_id": "c_sandwiches",
    "nombre": "Sándwich de Lomito",
    "descripcion": "Lomito picado jugoso a la plancha, cebolla salteada, pimentón, queso mozzarella derretido, lechuga y tomate en pan a elección.",
    "precio": 35,
    "costo": 14,
    "imagen_url": "/img/products/1712589653.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 45,
    "chips_personalizacion": [
      "Pan ciabatta",
      "Pan baguette",
      "Pan molde blanco",
      "Pan molde integral",
      "Croissant (+5 Bs)",
      "Sin cebolla"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_sandwich_pesto",
    "categoria_id": "c_sandwiches",
    "nombre": "Sándwich Pesto Pollo",
    "descripcion": "Filete de pollo grillado, pesto casero de albahaca fresca, queso mozzarella, rodajas de tomate y aceite de oliva virgen extra en pan a elección.",
    "precio": 35,
    "costo": 14,
    "imagen_url": "/img/products/1712589718.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 40,
    "chips_personalizacion": [
      "Pan ciabatta",
      "Pan baguette",
      "Pan molde",
      "Croissant (+5 Bs)"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_sandwich_st_germain",
    "categoria_id": "c_sandwiches",
    "nombre": "Sándwich St. Germain",
    "descripcion": "Lomito vacuno picado, tiras de tocino crocante, queso mozzarella fundido, tomate fresco, champiñones y mayonesa casera en pan a elección.",
    "precio": 40,
    "costo": 16,
    "imagen_url": "/img/products/1712590391.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 35,
    "chips_personalizacion": [
      "Pan ciabatta",
      "Pan baguette",
      "Pan molde integral",
      "Croissant (+5 Bs)"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_sandwich_atun",
    "categoria_id": "c_sandwiches",
    "nombre": "Sándwich de Atún",
    "descripcion": "Lomitos de atún, hojas de lechuga fresca, tomate, pepinillos encurtidos y mayonesa casera en pan a elección.",
    "precio": 45,
    "costo": 18,
    "imagen_url": "/img/products/1712590820.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 30,
    "chips_personalizacion": [
      "Pan ciabatta",
      "Pan baguette",
      "Pan molde blanco",
      "Pan molde integral",
      "Croissant (+5 Bs)"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_sandwich_jamon_queso",
    "categoria_id": "c_sandwiches",
    "nombre": "Sándwich Jamón y Queso Caliente",
    "descripcion": "Generosas láminas de jamón seleccionado y queso mozzarella derretido servido en pan a elección.",
    "precio": 30,
    "costo": 11,
    "imagen_url": "/img/products/1712591056.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 50,
    "chips_personalizacion": [
      "Pan molde blanco",
      "Pan molde integral",
      "Pan baguette",
      "Pan ciabatta",
      "Croissant (+5 Bs)"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_croque_monsieur",
    "categoria_id": "c_sandwiches",
    "nombre": "Croque Monsieur Clásico",
    "descripcion": "Sándwich francés en pan de molde con jamón cocido, queso mozzarella y suave salsa bechamel gratinada al horno.",
    "precio": 30,
    "costo": 12,
    "imagen_url": "/img/products/1712680508.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 35,
    "chips_personalizacion": [
      "Bien gratinado",
      "Pimienta negra molida"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_sandwich_pavita",
    "categoria_id": "c_sandwiches",
    "nombre": "Sándwich Pavita",
    "descripcion": "Pollo deshebrado tierno con mayonesa de la casa y maíz dulce tierno en pan a elección.",
    "precio": 27,
    "costo": 10,
    "imagen_url": "/img/products/1712680592.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 40,
    "chips_personalizacion": [
      "Pan ciabatta",
      "Pan baguette",
      "Pan molde blanco",
      "Pan molde integral",
      "Croissant (+5 Bs)"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_ensalada_cesar",
    "categoria_id": "c_ensaladas",
    "nombre": "Ensalada César con Pollo",
    "descripcion": "Hojas de lechuga crujiente, crutons dorados al ajo, pechuga de pollo a la plancha en tiras y aderezo césar artesanal con queso parmesano.",
    "precio": 30,
    "costo": 11,
    "imagen_url": "/img/products/1712680987.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 35,
    "chips_personalizacion": [
      "Aderezo César al lado",
      "Aderezo mezclado",
      "Sin crutons"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_ensalada_thai",
    "categoria_id": "c_ensaladas",
    "nombre": "Ensalada Thai",
    "descripcion": "Mix de lechuga, col morada, zanahoria rallada, tomate cherry, gajos de naranja dulce, pimentón caramelizado, pollo a la plancha y tiras de tortilla tostada crujiente.",
    "precio": 30,
    "costo": 11,
    "imagen_url": "/img/products/1712681041.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 30,
    "chips_personalizacion": [
      "Aderezo agridulce",
      "Tortillas extra"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_pasta_salad",
    "categoria_id": "c_ensaladas",
    "nombre": "Pasta Salad Dencker",
    "descripcion": "Pasta fusilli al dente, hojas tiernas de lechuga, tomates cherry, pepino fresco, choclitos dulces, poroto negro, palta fresca y pechuga de pollo grillada.",
    "precio": 35,
    "costo": 13,
    "imagen_url": "/img/products/1712681433.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 30,
    "chips_personalizacion": [
      "Con vinagreta de limón y oliva",
      "Con salsa tártara casera"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_pizza_especial_dencker",
    "categoria_id": "c_pizzas",
    "nombre": "Pizza Especial Dencker (Arma a tu gusto)",
    "descripcion": "Pizza grande artesanal: Elige DOS Proteínas (Jamón, Salame, Tocino, Carne, Pollo, Anchoa) + TRES Complementos (Champiñón fresco, Cebolla, Tomate, Piña, Choclo, Pimentón, Albahaca, Tomate deshidratado, Locoto, Aceituna, Huevo, Palmito).",
    "precio": 95,
    "costo": 38,
    "imagen_url": "/img/brand/mascot-pizza.png",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 30,
    "chips_personalizacion": [
      "Jamón + Salame",
      "Tocino + Pollo",
      "Champiñones + Cebolla + Pimentón",
      "Aceitunas + Palmito + Tomate",
      "Con locoto boliviano"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_pizza_margarita",
    "categoria_id": "c_pizzas",
    "nombre": "Pizza Margarita",
    "descripcion": "Salsa de tomate casera al pomodoro, queso mozzarella fundido, rodajas de tomate fresco, albahaca de huerto y aceite de oliva virgen.",
    "precio": 40,
    "costo": 15,
    "imagen_url": "/img/products/1712700679.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 40,
    "chips_personalizacion": [
      "4 Porciones (Bs 40)",
      "6 Porciones (+15 Bs -> Bs 55)",
      "8 Porciones (+30 Bs -> Bs 70)"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_pizza_jamon_queso",
    "categoria_id": "c_pizzas",
    "nombre": "Pizza Jamón y Queso",
    "descripcion": "Salsa de tomate casera, queso mozzarella fundido en abundancia y jamón seleccionado.",
    "precio": 35,
    "costo": 13,
    "imagen_url": "/img/products/1712701120.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 45,
    "chips_personalizacion": [
      "4 Porciones (Bs 35)",
      "6 Porciones (+15 Bs -> Bs 50)",
      "8 Porciones (+30 Bs -> Bs 65)"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_pizza_hawaiana",
    "categoria_id": "c_pizzas",
    "nombre": "Pizza Hawaiana",
    "descripcion": "Salsa de tomate, queso mozzarella, jamón cocido y trozos dulces de piña fresca dorada al horno.",
    "precio": 40,
    "costo": 15,
    "imagen_url": "/img/products/1712701182.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 40,
    "chips_personalizacion": [
      "4 Porciones (Bs 40)",
      "6 Porciones (+15 Bs -> Bs 55)",
      "8 Porciones (+30 Bs -> Bs 70)"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_pizza_funghi",
    "categoria_id": "c_pizzas",
    "nombre": "Pizza Funghi",
    "descripcion": "Salsa de tomate, queso mozzarella, champiñones frescos laminados y jamón cocido.",
    "precio": 35,
    "costo": 13,
    "imagen_url": "/img/products/1712701753.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 35,
    "chips_personalizacion": [
      "4 Porciones (Bs 35)",
      "6 Porciones (+15 Bs -> Bs 50)",
      "8 Porciones (+30 Bs -> Bs 65)"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_pizza_choclo_amarillo",
    "categoria_id": "c_pizzas",
    "nombre": "Pizza Choclo Amarillo",
    "descripcion": "Salsa de tomate, queso mozzarella fundido, granos de choclo amarillo tierno y tocino crujiente.",
    "precio": 35,
    "costo": 13,
    "imagen_url": "/img/products/1712701771.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 35,
    "chips_personalizacion": [
      "4 Porciones (Bs 35)",
      "6 Porciones (+15 Bs -> Bs 50)",
      "8 Porciones (+35 Bs -> Bs 70)"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_pizza_bacon",
    "categoria_id": "c_pizzas",
    "nombre": "Pizza Bacon & Cebolla",
    "descripcion": "Salsa de tomate, mozzarella, abundante tocino ahumado crocante y cebolla salteada.",
    "precio": 40,
    "costo": 15,
    "imagen_url": "/img/products/1712702060.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 35,
    "chips_personalizacion": [
      "4 Porciones (Bs 40)",
      "6 Porciones (+15 Bs -> Bs 55)",
      "8 Porciones (+30 Bs -> Bs 70)"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_pizza_palmito",
    "categoria_id": "c_pizzas",
    "nombre": "Pizza de Palmito Suprema",
    "descripcion": "Salsa de tomate, mozzarella, palmitos tiernos en rodajas, jamón, aceitunas negras y huevo cocido.",
    "precio": 40,
    "costo": 15,
    "imagen_url": "/img/products/1712758762.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 30,
    "chips_personalizacion": [
      "4 Porciones (Bs 40)",
      "6 Porciones (+15 Bs -> Bs 55)",
      "8 Porciones (+30 Bs -> Bs 70)"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_pizza_portuguesa",
    "categoria_id": "c_pizzas",
    "nombre": "Pizza Portuguesa",
    "descripcion": "Salsa de tomate, mozzarella, jamón, rodajas de tomate, huevo duro picado, choclo amarillo, cebolla y aceitunas.",
    "precio": 45,
    "costo": 17,
    "imagen_url": "/img/products/1712759120.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 30,
    "chips_personalizacion": [
      "4 Porciones (Bs 45)",
      "6 Porciones (+10 Bs -> Bs 55)",
      "8 Porciones (+35 Bs -> Bs 80)"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_pizza_criolla",
    "categoria_id": "c_pizzas",
    "nombre": "Pizza Criolla",
    "descripcion": "Salsa de tomate, mozzarella, carne molida sazonada con especias criollas, cebolla y tomate.",
    "precio": 45,
    "costo": 17,
    "imagen_url": "/img/products/1712759428.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 30,
    "chips_personalizacion": [
      "4 Porciones (Bs 45)",
      "6 Porciones (+20 Bs -> Bs 65)",
      "8 Porciones (+35 Bs -> Bs 80)"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_pizza_salame",
    "categoria_id": "c_pizzas",
    "nombre": "Pizza Salame & Champiñones",
    "descripcion": "Salsa de tomate, queso mozzarella, finas rodajas de salame italiano, champiñones frescos y cebolla.",
    "precio": 45,
    "costo": 17,
    "imagen_url": "/img/products/1712759741.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 35,
    "chips_personalizacion": [
      "4 Porciones (Bs 45)",
      "6 Porciones (+20 Bs -> Bs 65)",
      "8 Porciones (+35 Bs -> Bs 80)"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_pizza_pollo_catupiri",
    "categoria_id": "c_pizzas",
    "nombre": "Pizza Pollo con Queso Catupiri",
    "descripcion": "Salsa de tomate, mozzarella, pollo desmenuzado tierno y generosas espirales de queso catupiri cremoso.",
    "precio": 45,
    "costo": 17,
    "imagen_url": "/img/products/1712759895.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 35,
    "chips_personalizacion": [
      "4 Porciones (Bs 45)",
      "6 Porciones (+20 Bs -> Bs 65)",
      "8 Porciones (+35 Bs -> Bs 80)"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_extra_papas_fritas",
    "categoria_id": "c_extras",
    "nombre": "Porción de Papas Fritas",
    "descripcion": "Papas fritas bastón doradas y crocantes servidas con toque de sal marina y aderezos.",
    "precio": 15,
    "costo": 5,
    "imagen_url": "/img/products/1712760039.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 60,
    "chips_personalizacion": [
      "Con kétchup y mayonesa",
      "Con salsa golf",
      "Bien doradas"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_extra_palta",
    "categoria_id": "c_extras",
    "nombre": "Porción de Palta Fresca",
    "descripcion": "Media palta hass cremosa en láminas con toque de limón y sal marina.",
    "precio": 10,
    "costo": 4,
    "imagen_url": "/img/products/1712760191.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 40,
    "chips_personalizacion": [
      "En láminas",
      "Molida tipo guacamole"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_extra_tocino",
    "categoria_id": "c_extras",
    "nombre": "Porción de Tocino Crocante",
    "descripcion": "Tiras de tocino ahumado dorado y extra crocante.",
    "precio": 10,
    "costo": 4,
    "imagen_url": "/img/products/1712760813.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 50,
    "chips_personalizacion": [
      "Extra crocante",
      "Dorado suave"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_extra_jamon",
    "categoria_id": "c_extras",
    "nombre": "Porción de Jamón Extra",
    "descripcion": "Porción de jamón cocido seleccionado en finas fetas.",
    "precio": 5,
    "costo": 2,
    "imagen_url": "/img/products/1712763609.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 50,
    "chips_personalizacion": [
      "Frío",
      "Pasado por la plancha"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_extra_tostada",
    "categoria_id": "c_extras",
    "nombre": "Porción de Tostadas",
    "descripcion": "Rebanadas de pan tostado artesanal de la casa.",
    "precio": 6,
    "costo": 1.5,
    "imagen_url": "/img/products/1712764781.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 70,
    "chips_personalizacion": [
      "Pan blanco",
      "Pan integral",
      "Con mantequilla (+2 Bs)"
    ],
    "estacion": "cocina"
  },
  {
    "id": "prod_extra_queso",
    "categoria_id": "c_extras",
    "nombre": "Porción de Queso Extra",
    "descripcion": "Porción de queso mozzarella fundido o queso criollo boliviano fresco.",
    "precio": 3,
    "costo": 1.2,
    "imagen_url": "/img/products/1713646373.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 80,
    "chips_personalizacion": [
      "Queso mozzarella fundido",
      "Queso criollo fresco"
    ],
    "estacion": "cocina"
  }
];

export const SEED_PAGOS: Pago[] = [
  // --- PAGOS DE HOY: TURNO TARDE ---
  {
    id: 'pago-101',
    pedido_id: 'PED-1021',
    monto: 88.0,
    metodo: 'qr',
    monto_recibido: 88.0,
    cambio: 0,
    nit: '4829102011',
    razon_social: 'Morales & Asoc.',
    estado: 'completado',
    items_pagados: ['i-1', 'i-2'],
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    cliente_nombre: 'Carlos Morales',
    mesa_numero: 4,
    turno: 'tarde',
    modalidad: 'mesa',
    cajero: 'Carlos Rocha',
  },
  {
    id: 'pago-102',
    pedido_id: 'PED-1020',
    monto: 142.0,
    metodo: 'efectivo',
    monto_recibido: 150.0,
    cambio: 8.0,
    estado: 'completado',
    items_pagados: ['i-3', 'i-4', 'i-5'],
    created_at: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    cliente_nombre: 'Familia Camacho',
    mesa_numero: 2,
    turno: 'tarde',
    modalidad: 'mesa',
    cajero: 'Carlos Rocha',
  },
  {
    id: 'pago-103',
    pedido_id: 'PED-1019',
    monto: 54.0,
    metodo: 'qr',
    monto_recibido: 54.0,
    cambio: 0,
    estado: 'completado',
    items_pagados: ['i-6'],
    created_at: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    cliente_nombre: 'Lucía Arnez',
    turno: 'tarde',
    modalidad: 'retiro',
    cajero: 'Carlos Rocha',
  },
  {
    id: 'pago-104',
    pedido_id: 'PED-1018',
    monto: 76.0,
    metodo: 'efectivo',
    monto_recibido: 100.0,
    cambio: 24.0,
    nit: '3049182',
    razon_social: 'Dr. Gonzalo Ríos',
    estado: 'completado',
    items_pagados: ['i-7', 'i-8'],
    created_at: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    cliente_nombre: 'Dr. Gonzalo Ríos (Cala Cala)',
    turno: 'tarde',
    modalidad: 'delivery',
    cajero: 'Carlos Rocha',
  },
  {
    id: 'pago-105',
    pedido_id: 'PED-1017',
    monto: 195.0,
    metodo: 'qr',
    monto_recibido: 195.0,
    cambio: 0,
    estado: 'completado',
    items_pagados: ['i-9', 'i-10', 'i-11'],
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    cliente_nombre: 'Reunión Creativa',
    mesa_numero: 7,
    turno: 'tarde',
    modalidad: 'mesa',
    cajero: 'Carlos Rocha',
  },

  // --- PAGOS DE HOY: TURNO MAÑANA ---
  {
    id: 'pago-201',
    pedido_id: 'PED-1016',
    monto: 68.0,
    metodo: 'efectivo',
    monto_recibido: 70.0,
    cambio: 2.0,
    estado: 'completado',
    items_pagados: ['i-12', 'i-13'],
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    cliente_nombre: 'Sergio Torrico',
    mesa_numero: 1,
    turno: 'manana',
    modalidad: 'mesa',
    cajero: 'Valeria Mendoza',
  },
  {
    id: 'pago-202',
    pedido_id: 'PED-1015',
    monto: 110.0,
    metodo: 'qr',
    monto_recibido: 110.0,
    cambio: 0,
    nit: '1029384756',
    razon_social: 'Bernardo Rojas',
    estado: 'completado',
    items_pagados: ['i-14', 'i-15'],
    created_at: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
    cliente_nombre: 'Ing. Bernardo Rojas',
    mesa_numero: 5,
    turno: 'manana',
    modalidad: 'mesa',
    cajero: 'Valeria Mendoza',
  },
  {
    id: 'pago-203',
    pedido_id: 'PED-1014',
    monto: 46.0,
    metodo: 'efectivo',
    monto_recibido: 50.0,
    cambio: 4.0,
    estado: 'completado',
    items_pagados: ['i-16'],
    created_at: new Date(Date.now() - 1000 * 60 * 510).toISOString(),
    cliente_nombre: 'Carolina V. (Tanda 07:30)',
    turno: 'manana',
    modalidad: 'retiro',
    cajero: 'Valeria Mendoza',
  },
  {
    id: 'pago-204',
    pedido_id: 'PED-1013',
    monto: 82.0,
    metodo: 'efectivo',
    monto_recibido: 100.0,
    cambio: 18.0,
    estado: 'completado',
    items_pagados: ['i-17', 'i-18'],
    created_at: new Date(Date.now() - 1000 * 60 * 560).toISOString(),
    cliente_nombre: 'Desayuno Pareja',
    mesa_numero: 3,
    turno: 'manana',
    modalidad: 'mesa',
    cajero: 'Valeria Mendoza',
  },
  {
    id: 'pago-205',
    pedido_id: 'PED-1012',
    monto: 130.0,
    metodo: 'qr',
    monto_recibido: 130.0,
    cambio: 0,
    estado: 'completado',
    items_pagados: ['i-19', 'i-20'],
    created_at: new Date(Date.now() - 1000 * 60 * 620).toISOString(),
    cliente_nombre: 'Mesa Terraza Jardín',
    mesa_numero: 8,
    turno: 'manana',
    modalidad: 'mesa',
    cajero: 'Valeria Mendoza',
  },

  // --- PAGOS DE AYER (HISTÓRICO RECIENTE) ---
  {
    id: 'pago-301',
    pedido_id: 'PED-1009',
    monto: 240.0,
    metodo: 'qr',
    monto_recibido: 240.0,
    cambio: 0,
    nit: '78291039',
    razon_social: 'Gourmet Club Cbba',
    estado: 'completado',
    items_pagados: ['i-21', 'i-22', 'i-23'],
    created_at: new Date(Date.now() - 86400000 * 1 - 1000 * 60 * 60 * 3).toISOString(),
    cliente_nombre: 'Degustación Hojaldres',
    mesa_numero: 6,
    turno: 'tarde',
    modalidad: 'mesa',
    cajero: 'Carlos Rocha',
  },
  {
    id: 'pago-302',
    pedido_id: 'PED-1008',
    monto: 95.0,
    metodo: 'efectivo',
    monto_recibido: 100.0,
    cambio: 5.0,
    estado: 'completado',
    items_pagados: ['i-24', 'i-25'],
    created_at: new Date(Date.now() - 86400000 * 1 - 1000 * 60 * 60 * 6).toISOString(),
    cliente_nombre: 'Mariana Zalles',
    turno: 'manana',
    modalidad: 'retiro',
    cajero: 'Valeria Mendoza',
  },
  {
    id: 'pago-303',
    pedido_id: 'PED-1007',
    monto: 165.0,
    metodo: 'qr',
    monto_recibido: 165.0,
    cambio: 0,
    estado: 'completado',
    items_pagados: ['i-26', 'i-27'],
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    cliente_nombre: 'Mesa 10 • Familia Suárez',
    mesa_numero: 10,
    turno: 'tarde',
    modalidad: 'mesa',
    cajero: 'Carlos Rocha',
  },
];

export const SEED_HISTORIAL_SESIONES: SesionCaja[] = [
  {
    id: 'sesion-hoy-manana',
    turno: 'manana',
    cajero: 'Valeria Mendoza',
    efectivo_inicial: 300.0,
    efectivo_esperado: 1160.0,
    efectivo_contado: 1160.0,
    diferencia: 0.0,
    total_ventas: 1480.0,
    total_qr: 620.0,
    estado: 'cerrada',
    abierta_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    cerrada_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    notas: 'Turno mañana cerrado sin discrepancias. Alta demanda de tandem pan caliente 07:30.',
  },
  {
    id: 'sesion-ayer-tarde',
    turno: 'tarde',
    cajero: 'Carlos Rocha',
    efectivo_inicial: 300.0,
    efectivo_esperado: 1370.0,
    efectivo_contado: 1370.0,
    diferencia: 0.0,
    total_ventas: 2190.0,
    total_qr: 1120.0,
    estado: 'cerrada',
    abierta_at: new Date(Date.now() - 86400000 * 1 - 1000 * 60 * 60 * 7).toISOString(),
    cerrada_at: new Date(Date.now() - 86400000 * 1 - 1000 * 60 * 60 * 1).toISOString(),
    notas: 'Turno tarde con alta venta de New York Rolls y café de especialidad Caranavi.',
  },
  {
    id: 'sesion-ayer-manana',
    turno: 'manana',
    cajero: 'Valeria Mendoza',
    efectivo_inicial: 300.0,
    efectivo_esperado: 1080.0,
    efectivo_contado: 1080.0,
    diferencia: 0.0,
    total_ventas: 1320.0,
    total_qr: 540.0,
    estado: 'cerrada',
    abierta_at: new Date(Date.now() - 86400000 * 1 - 1000 * 60 * 60 * 14).toISOString(),
    cerrada_at: new Date(Date.now() - 86400000 * 1 - 1000 * 60 * 60 * 8).toISOString(),
    notas: 'Cierre de mañana cuadrado en su totalidad.',
  },
];

export const SEED_USUARIOS_STAFF: UsuarioStaff[] = [
  {
    id: 'usr-admin-1',
    nombre: 'Gerencia Dencker Pan',
    role: 'admin',
    cargo: 'Administrador General & Finanzas',
    pin: '2024',
    activo: true,
    telefono: '+591 76911000',
    created_at: new Date().toISOString(),
    ultimo_acceso: new Date().toISOString(),
  },
  {
    id: 'usr-mesero-1',
    nombre: 'Mateo Arce',
    role: 'mesero',
    cargo: 'Mesero de Salón & Terraza',
    pin: '1111',
    activo: true,
    telefono: '+591 70712345',
    created_at: new Date().toISOString(),
    ultimo_acceso: new Date().toISOString(),
  },
  {
    id: 'usr-cocina-1',
    nombre: 'Rodrigo Morales',
    role: 'cocina',
    cargo: 'Jefe de Horno, Bollería & Barismo',
    pin: '2222',
    activo: true,
    telefono: '+591 71498765',
    created_at: new Date().toISOString(),
    ultimo_acceso: new Date().toISOString(),
  },
  {
    id: 'usr-caja-1',
    nombre: 'Valeria Quiroga',
    role: 'caja',
    cargo: 'Cajera Principal & Facturación POS',
    pin: '3333',
    activo: true,
    telefono: '+591 72233445',
    created_at: new Date().toISOString(),
    ultimo_acceso: new Date().toISOString(),
  },
  {
    id: 'usr-mesero-2',
    nombre: 'Camila Rojas',
    role: 'mesero',
    cargo: 'Mesera de Turno Tarde',
    pin: '1122',
    activo: true,
    telefono: '+591 73788990',
    created_at: new Date().toISOString(),
    ultimo_acceso: new Date().toISOString(),
  },
];



export const REAL_PRODUCT_PHOTOS: string[] = [
  "/img/brand/don-dencker.png",
  "/img/brand/mascot-croissant.png",
  "/img/brand/mascot-bread.png",
  "/img/brand/mascot-pizza.png",
  "/img/brand/cafe-catuai-badge.png",
  "/img/brand/cafe-4llamas-pack.png",
  "/img/brand/dencker-logo.png",
  "/img/products/1711660195.jpg",
  "/img/products/1711662981.jpg",
  "/img/products/1711663005.jpg",
  "/img/products/1711663044.jpg",
  "/img/products/1711663068.jpg",
  "/img/products/1711663289.jpg",
  "/img/products/1711663360.jpg",
  "/img/products/1711663393.jpg",
  "/img/products/1711663451.jpg",
  "/img/products/1711663551.jpg",
  "/img/products/1711663647.jpg",
  "/img/products/1711663751.jpg",
  "/img/products/1711663802.jpg",
  "/img/products/1711663889.jpg",
  "/img/products/1711663929.jpg",
  "/img/products/1711667839.jpg",
  "/img/products/1711667871.jpg",
  "/img/products/1711667906.jpg",
  "/img/products/1711667945.jpg",
  "/img/products/1711667993.jpg",
  "/img/products/1711668080.jpg",
  "/img/products/1711668133.jpg",
  "/img/products/1711668160.jpg",
  "/img/products/1711668187.jpg",
  "/img/products/1711668224.jpg",
  "/img/products/1711668294.jpg",
  "/img/products/1711668321.jpg",
  "/img/products/1711668348.jpg",
  "/img/products/1711668397.jpg",
  "/img/products/1711668491.jpg",
  "/img/products/1711668521.jpg",
  "/img/products/1711668566.jpg",
  "/img/products/1711668603.jpg",
  "/img/products/1711812838.jpg",
  "/img/products/1711812877.jpg",
  "/img/products/1711813236.jpg",
  "/img/products/1711813317.jpg",
  "/img/products/1711813593.jpg",
  "/img/products/1711823193.jpg",
  "/img/products/1711823213.jpg",
  "/img/products/1711823283.jpg",
  "/img/products/1711823429.jpg",
  "/img/products/1711823470.jpg",
  "/img/products/1711823698.jpg",
  "/img/products/1711823843.jpg",
  "/img/products/1711823887.jpg",
  "/img/products/1711823907.jpg",
  "/img/products/1711823948.jpg",
  "/img/products/1711824121.jpg",
  "/img/products/1711824161.jpg",
  "/img/products/1711824228.jpg",
  "/img/products/1711824313.jpg",
  "/img/products/1711824378.jpg",
  "/img/products/1711824440.jpg",
  "/img/products/1711824502.jpg",
  "/img/products/1711824583.jpg",
  "/img/products/1711824687.jpg",
  "/img/products/1711824741.jpg",
  "/img/products/1711824830.jpg",
  "/img/products/1711824998.jpg",
  "/img/products/1712008791.jpg",
  "/img/products/1712009017.jpg",
  "/img/products/1712010095.jpg",
  "/img/products/1712114164.jpg",
  "/img/products/1712114283.jpg",
  "/img/products/1712115596.jpg",
  "/img/products/1712117921.jpg",
  "/img/products/1712146728.jpg",
  "/img/products/1712146742.jpg",
  "/img/products/1712146999.jpg",
  "/img/products/1712147370.jpg",
  "/img/products/1712147686.jpg",
  "/img/products/1712148926.jpg",
  "/img/products/1712588603.jpg",
  "/img/products/1712588932.jpg",
  "/img/products/1712588982.jpg",
  "/img/products/1712589020.jpg",
  "/img/products/1712589070.jpg",
  "/img/products/1712589116.jpg",
  "/img/products/1712589164.jpg",
  "/img/products/1712589264.jpg",
  "/img/products/1712589298.jpg",
  "/img/products/1712589327.jpg",
  "/img/products/1712589406.jpg",
  "/img/products/1712589443.jpg",
  "/img/products/1712589596.jpg",
  "/img/products/1712589653.jpg",
  "/img/products/1712589718.jpg",
  "/img/products/1712590391.jpg",
  "/img/products/1712590820.jpg",
  "/img/products/1712591056.jpg",
  "/img/products/1712680508.jpg",
  "/img/products/1712680592.jpg",
  "/img/products/1712680987.jpg",
  "/img/products/1712681041.jpg",
  "/img/products/1712681433.jpg",
  "/img/products/1712697870.jpg",
  "/img/products/1712700679.jpg",
  "/img/products/1712701120.jpg",
  "/img/products/1712701182.jpg",
  "/img/products/1712701753.jpg",
  "/img/products/1712701771.jpg",
  "/img/products/1712702060.jpg",
  "/img/products/1712758762.jpg",
  "/img/products/1712759120.jpg",
  "/img/products/1712759428.jpg",
  "/img/products/1712759741.jpg",
  "/img/products/1712759895.jpg",
  "/img/products/1712760039.jpg",
  "/img/products/1712760191.jpg",
  "/img/products/1712760813.jpg",
  "/img/products/1712763609.jpg",
  "/img/products/1712764781.jpg",
  "/img/products/1713646373.jpg",
  "/img/products/1713646392.jpg",
  "/img/products/1713647143.jpg",
  "/img/products/1713647256.jpg",
  "/img/products/1713647447.jpg",
  "/img/products/1713647538.jpg",
  "/img/products/1713647575.jpg",
  "/img/products/1713647749.jpg",
  "/img/products/1713647827.jpg",
  "/img/products/1713648019.jpg",
  "/img/products/1713648044.jpg",
  "/img/products/1713648071.jpg",
  "/img/products/1713648100.jpg",
  "/img/products/1713648153.jpg",
  "/img/products/1713648199.jpg",
  "/img/products/1713648228.jpg",
  "/img/products/1713648254.jpg",
  "/img/products/1713648292.jpg",
  "/img/products/1713648325.jpg",
  "/img/products/1713648349.jpg",
  "/img/products/1713648372.jpg",
  "/img/products/1713648446.jpg",
  "/img/products/1713648468.jpg",
  "/img/products/1713648500.jpg",
  "/img/products/1713648522.jpg",
  "/img/products/1713648554.jpg",
  "/img/products/1713648577.jpg",
  "/img/products/1713648658.jpg",
  "/img/products/1713648675.jpg",
  "/img/products/1713648695.jpg",
  "/img/products/1713648815.jpg",
  "/img/products/1713648841.jpg",
  "/img/products/1713648864.jpg",
  "/img/products/1713648894.jpg",
  "/img/products/1713648935.jpg",
  "/img/products/1713648970.jpg",
  "/img/products/1713649050.jpg",
  "/img/products/1713649080.jpg",
  "/img/products/1713649100.jpg",
  "/img/products/1713649140.jpg",
  "/img/products/1713649175.jpg",
  "/img/products/1713649205.jpg",
  "/img/products/1713649278.jpg",
  "/img/products/1713649326.jpg",
  "/img/products/1713649407.jpg",
  "/img/products/1713649564.jpg",
  "/img/products/1713649649.jpg",
  "/img/products/1713649673.jpg",
  "/img/products/1713649704.jpg"
];


export const MENU_PDF_PAGES = [
  { page: 1, title: 'Portada ME NU & Don Dencker', url: '/img/menu-pdf/page_1.png', desc: 'Toldo vintage rojo, Don Dencker con taza de café humeante y Dencker Coffee' },
  { page: 2, title: 'Desayunos, Cafés & Lattes', url: '/img/menu-pdf/page_2.png', desc: 'Desayunos completos, Café 4 Llamas de especialidad, Lattes y mascota taza sonriente' },
  { page: 3, title: 'Chocolates, Tés, Jugos & Frappés', url: '/img/menu-pdf/page_3.png', desc: 'Chocolates marshmallow, tés naturales, frappés oreo, helados artesanales y jugos' },
  { page: 4, title: 'Dulces, Postres & Masitas Saladas', url: '/img/menu-pdf/page_4.png', desc: 'Alfajores, New York roll, cheesecake, cuñapés calientes y croissant con lentes de sol' },
  { page: 5, title: 'Sándwiches, Extras & Ensaladas', url: '/img/menu-pdf/page_5.png', desc: 'Arma tu sándwich (2 proteínas + 3 complementos), pan a elección y mascota tostada feliz' },
  { page: 6, title: 'Pizzas Artesanales Dencker', url: '/img/menu-pdf/page_6.png', desc: 'Arma tu pizza, porciones 4/6/8 porciones y mascota pizza skater con lentes' },
];

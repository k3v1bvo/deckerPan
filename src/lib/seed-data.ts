// ==========================================
// DENCKER PAN — SEED DATA REAL & AUTHENTIC
// Extracted from tienda.denckerpan.com & ImgBB
// ==========================================

import { Zona, Mesa, Categoria, Producto, Reserva } from '@/types';

export const DENCKER_ASSETS = {
  logo: "https://i.ibb.co/qMkf00HN/dencker-logo.png",
  banners: [
  "https://i.ibb.co/bjzqQPhh/dencker-banner-1.jpg",
  "https://i.ibb.co/bjzqQPhh/dencker-banner-1.jpg"
],
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

export const SEED_CATEGORIAS: Categoria[] = [
  {
    "id": "c1",
    "nombre": "Galletas",
    "emoji": "🍪",
    "descripcion": "Galletas finas, caukas con queso y galletitas artesanales",
    "estacion": "vitrina",
    "orden": 1,
    "activa": true,
    "imagen_url": "https://i.ibb.co/BH4rgH4f/dencker-cat-1.jpg"
  },
  {
    "id": "c2",
    "nombre": "Masitas Saladas",
    "emoji": "🥟",
    "descripcion": "Empanadas de queso, cuñapés calientes y palitos salados",
    "estacion": "vitrina",
    "orden": 2,
    "activa": true,
    "imagen_url": "https://i.ibb.co/TQ2z3r4/dencker-cat-2.jpg"
  },
  {
    "id": "c3",
    "nombre": "Panadería",
    "emoji": "🥖",
    "descripcion": "Pan de masa madre, baguettes tradicionales y marraquetas",
    "estacion": "vitrina",
    "orden": 3,
    "activa": true,
    "imagen_url": "https://i.ibb.co/S75YZFD4/dencker-cat-3.jpg"
  },
  {
    "id": "c4",
    "nombre": "Pastelería",
    "emoji": "🍰",
    "descripcion": "Alfajores de maicena, croissants hojaldrados y pies artesanales",
    "estacion": "vitrina",
    "orden": 4,
    "activa": true,
    "imagen_url": "https://i.ibb.co/8LbH4mwr/dencker-cat-4.jpg"
  },
  {
    "id": "c5",
    "nombre": "Queques",
    "emoji": "🧁",
    "descripcion": "Queques caseros, pasta frola y budines horneados diariamente",
    "estacion": "vitrina",
    "orden": 5,
    "activa": true,
    "imagen_url": "https://i.ibb.co/JL4MnXC/dencker-cat-5.jpg"
  },
  {
    "id": "c6",
    "nombre": "Pizzas & Calientes",
    "emoji": "🍕",
    "descripcion": "Pizzas artesanales, esfihas horneadas y especialidades de la casa",
    "estacion": "cocina",
    "orden": 6,
    "activa": true,
    "imagen_url": "https://i.ibb.co/bj5f2wcT/dencker-cat-6.jpg"
  },
  {
    "id": "c7",
    "nombre": "Bebidas & Barismo",
    "emoji": "☕",
    "descripcion": "Café de especialidad de los Yungas, jugos naturales y refrescos",
    "estacion": "cafeteria",
    "orden": 7,
    "activa": true,
    "imagen_url": "https://i.ibb.co/BV52cJkc/dencker-cat-7.jpg"
  }
];

export const SEED_PRODUCTOS: Producto[] = [
  {
    "id": "prod_ny_pistacho",
    "categoria_id": "c4",
    "nombre": "New York Roll de Pistacho",
    "descripcion": "Rueda de hojaldre francés 100% mantequilla noble, corazón untuoso de crema pastelera de pistacho siciliano de Bronte y cobertura con praliné tostado.",
    "precio": 26,
    "costo": 9.5,
    "imagen_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=85",
    "imagen_interior_url": "/images/products/ny_roll_pistacho_cut.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 38,
    "chips_personalizacion": [
      "Tibio de horno",
      "Pistacho extra crocante",
      "Empaque boutique"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.509Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_croissant_frances",
    "categoria_id": "c4",
    "nombre": "Croissant Francés 100% Mantequilla",
    "descripcion": "Hojaldrado europeo noble con 72 capas de pura mantequilla. Corteza dorada crujiente y alveolado de panal interior abierto y esponjoso.",
    "precio": 18,
    "costo": 6.0,
    "imagen_url": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1000&q=85",
    "imagen_interior_url": "/images/products/croissant_french_cut.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 50,
    "chips_personalizacion": [
      "Tibio de horno",
      "Mermelada artesanal",
      "Mantequilla extra"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.509Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_cunape_abizcochado",
    "categoria_id": "c2",
    "nombre": "Cuñapé Abizcochado Caliente",
    "descripcion": "Especialidad tradicional cochabambina-cruceña con abundante queso criollo seleccionado y almidón de yuca horneado al punto exacto.",
    "precio": 9,
    "costo": 3.0,
    "imagen_url": "https://images.unsplash.com/photo-1598373182133-52452f7691ef?auto=format&fit=crop&w=1000&q=85",
    "imagen_interior_url": "/images/products/cunape_abizcochado_cut.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 120,
    "chips_personalizacion": [
      "Recién salido del horno",
      "Queso criollo extra",
      "Porción x6"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.509Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_alfajor_boliviano",
    "categoria_id": "c4",
    "nombre": "Alfajor Boliviano de Autor",
    "descripcion": "Masa quebrada y hojaldrada que se deshace al morder, rellena con generoso manjar blanco casero cocido lentamente a fuego de leña.",
    "precio": 10,
    "costo": 3.5,
    "imagen_url": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=1000&q=85",
    "imagen_interior_url": "/images/products/alfajor_boliviano_cut.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 80,
    "chips_personalizacion": [
      "Lluvia de coco rallado",
      "Manjar extra",
      "Caja para llevar"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.509Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_baguette_lena",
    "categoria_id": "c3",
    "nombre": "Baguette Artesanal en Horno de Leña",
    "descripcion": "Fermentación natural de 24 horas con masa madre viva. Corteza crujiente caramelizada y miga suave y alveolada.",
    "precio": 12,
    "costo": 4.0,
    "imagen_url": "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=1000&q=85",
    "imagen_interior_url": "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=1000&q=85",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 60,
    "chips_personalizacion": [
      "Entera",
      "En rebanadas para mesa",
      "Con mantequilla noble"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.509Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_cappuccino_yungas",
    "categoria_id": "c7",
    "nombre": "Cappuccino de Altura Yungas (La Marzocco)",
    "descripcion": "Extracción doble de granos Caranavi cosechados a 1,600 msnm con microfoam aterciopelado a 65°C y notas a cacao boliviano.",
    "precio": 18,
    "costo": 5.0,
    "imagen_url": "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=1000&q=85",
    "imagen_interior_url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=85",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 99,
    "chips_personalizacion": [
      "Leche entera 65°C",
      "Leche de avena barista",
      "Sin azúcar",
      "Doble shot ristretto"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.509Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_alfajor_marplatense",
    "categoria_id": "c4",
    "nombre": "Alfajor Marplatense Bañado en Chocolate",
    "descripcion": "Doble galleta húmeda de cacao fino rellena con abundante dulce de leche repostero y cobertura de chocolate semiamargo 60%.",
    "precio": 12.5,
    "costo": 4.5,
    "imagen_url": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1000&q=85",
    "imagen_interior_url": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=1000&q=85",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 75,
    "chips_personalizacion": [
      "Chocolate semiamargo",
      "Empaque individual"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.509Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_1",
    "categoria_id": "c1",
    "nombre": "Caballito de jengibre",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 30,
    "costo": 10.5,
    "imagen_url": "https://i.ibb.co/BH4rgH4f/dencker-cat-1.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.509Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_2",
    "categoria_id": "c1",
    "nombre": "Caukas con queso",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 17,
    "costo": 5.9,
    "imagen_url": "https://i.ibb.co/d0zB2kgM/dk-caukas-con-queso.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": 547,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_3",
    "categoria_id": "c1",
    "nombre": "Caukas con queso (con orégano)",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 17,
    "costo": 5.9,
    "imagen_url": "https://i.ibb.co/GQTSt8LS/dk-caukas-con-queso-con-or.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_4",
    "categoria_id": "c1",
    "nombre": "Caukas con Queso integrales",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 17,
    "costo": 5.9,
    "imagen_url": "https://i.ibb.co/d0rkYyLr/dk-caukas-con-queso-integral.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_5",
    "categoria_id": "c1",
    "nombre": "Chupete Grande",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 5,
    "costo": 1.8,
    "imagen_url": "https://i.ibb.co/WWfvkwRy/dk-chupete-grande.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_6",
    "categoria_id": "c1",
    "nombre": "Chupete Pequeño",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 1,
    "costo": 1,
    "imagen_url": "https://i.ibb.co/N6x6Yt2W/dk-chupete-peque-o.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_7",
    "categoria_id": "c1",
    "nombre": "Cuñapé Abizcochado 100gr",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 14,
    "costo": 4.9,
    "imagen_url": "https://i.ibb.co/rf6Lb0gR/dk-cu-ap-abizcochado-100gr.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_8",
    "categoria_id": "c1",
    "nombre": "Cuñapé Abizcochado 200gr",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 24,
    "costo": 8.4,
    "imagen_url": "https://i.ibb.co/YBJQpmqM/dk-cu-ap-abizcochado-200gr.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_9",
    "categoria_id": "c1",
    "nombre": "Cuñapé Abizcochado con ajo 200gr",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 24,
    "costo": 8.4,
    "imagen_url": "https://i.ibb.co/d8x8RyR/dk-cu-ap-abizcochado-con-aj.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_10",
    "categoria_id": "c1",
    "nombre": "Cuñapé Abizcochado con orégano 200gr",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 24,
    "costo": 8.4,
    "imagen_url": "https://i.ibb.co/d8x8RyR/dk-cu-ap-abizcochado-con-aj.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_11",
    "categoria_id": "c1",
    "nombre": "Galleta Chip",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 9.5,
    "costo": 3.3,
    "imagen_url": "https://i.ibb.co/Myyvs9GS/dk-galleta-chip.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_12",
    "categoria_id": "c1",
    "nombre": "Galletas Cebritas",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 17,
    "costo": 5.9,
    "imagen_url": "https://i.ibb.co/S7dyJ4Js/dk-galletas-cebritas.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_13",
    "categoria_id": "c1",
    "nombre": "Galletas con Almendra",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 17,
    "costo": 5.9,
    "imagen_url": "https://i.ibb.co/GQND9DK7/dk-galletas-con-almendra.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_14",
    "categoria_id": "c1",
    "nombre": "Galletas con Coco",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 17,
    "costo": 5.9,
    "imagen_url": "https://i.ibb.co/dwTtMgGf/dk-galletas-con-coco.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_15",
    "categoria_id": "c1",
    "nombre": "Galletas con Limón",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 17,
    "costo": 5.9,
    "imagen_url": "https://i.ibb.co/7xD4knqZ/dk-galletas-con-lim-n.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_16",
    "categoria_id": "c1",
    "nombre": "Galletas con Salvado",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 17,
    "costo": 5.9,
    "imagen_url": "https://i.ibb.co/xSxs4Fzx/dk-galletas-con-salvado.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_17",
    "categoria_id": "c1",
    "nombre": "Galletas de Ajonjolí",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 17,
    "costo": 5.9,
    "imagen_url": "https://i.ibb.co/wTK48zZ/dk-galletas-de-ajonjol.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_18",
    "categoria_id": "c1",
    "nombre": "Galletas de champagne",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 5,
    "costo": 1.8,
    "imagen_url": "https://i.ibb.co/5xxgh4SP/dk-galletas-de-champagne.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_19",
    "categoria_id": "c1",
    "nombre": "Galletas de harina de maiz",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 17,
    "costo": 5.9,
    "imagen_url": "https://i.ibb.co/whVdnYkK/dk-galletas-de-harina-de-mai.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_20",
    "categoria_id": "c1",
    "nombre": "Galletas de mantequilla",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 17,
    "costo": 5.9,
    "imagen_url": "https://i.ibb.co/ymyF55Fj/dk-galletas-de-mantequilla.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_21",
    "categoria_id": "c1",
    "nombre": "Galletas de naranja",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 17,
    "costo": 5.9,
    "imagen_url": "https://i.ibb.co/whZVTZKR/dk-galletas-de-naranja.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_22",
    "categoria_id": "c1",
    "nombre": "Galletas decoradoras",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 18,
    "costo": 6.3,
    "imagen_url": "https://i.ibb.co/BH4rgH4f/dencker-cat-1.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 4,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_23",
    "categoria_id": "c1",
    "nombre": "Galletas navideñas",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 10,
    "costo": 3.5,
    "imagen_url": "https://i.ibb.co/BH4rgH4f/dencker-cat-1.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_24",
    "categoria_id": "c1",
    "nombre": "Galletas navideñas bandeja",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 20,
    "costo": 7,
    "imagen_url": "https://i.ibb.co/BH4rgH4f/dencker-cat-1.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_25",
    "categoria_id": "c1",
    "nombre": "Galletas Palitos Con Aji",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 17,
    "costo": 5.9,
    "imagen_url": "https://i.ibb.co/BH4rgH4f/dencker-cat-1.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_26",
    "categoria_id": "c1",
    "nombre": "Galletas Rosquitas De Maiz",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 17,
    "costo": 5.9,
    "imagen_url": "https://i.ibb.co/BH4rgH4f/dencker-cat-1.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 950,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_27",
    "categoria_id": "c1",
    "nombre": "Nachos",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 8,
    "costo": 2.8,
    "imagen_url": "https://i.ibb.co/BH4rgH4f/dencker-cat-1.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_28",
    "categoria_id": "c1",
    "nombre": "Palitos con Ají",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 17,
    "costo": 5.9,
    "imagen_url": "https://i.ibb.co/Nnr7Sq8J/dk-palitos-con-aj.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_29",
    "categoria_id": "c1",
    "nombre": "Torta mil hojas",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 19,
    "costo": 6.7,
    "imagen_url": "https://i.ibb.co/Zz99WPrb/dk-torta-mil-hojas.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_30",
    "categoria_id": "c2",
    "nombre": "Empanada de queso",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 8.5,
    "costo": 3,
    "imagen_url": "https://i.ibb.co/fdX7gB9K/dk-empanada-de-queso.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_31",
    "categoria_id": "c2",
    "nombre": "Cuñapé",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 8.5,
    "costo": 3,
    "imagen_url": "https://i.ibb.co/Pv82FKYN/dk-cu-ap.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_32",
    "categoria_id": "c6",
    "nombre": "Esfihas",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 11.5,
    "costo": 4,
    "imagen_url": "https://i.ibb.co/4Rrqv2ZC/dk-esfihas.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": -1,
    "chips_personalizacion": [
      "Bien caliente",
      "Con orégano extra",
      "Para compartir"
    ],
    "estacion": "cocina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_33",
    "categoria_id": "c4",
    "nombre": "Alfajores Maicena",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 7.5,
    "costo": 2.6,
    "imagen_url": "https://i.ibb.co/ZRsSMWDQ/dk-alfajores-maicena.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_34",
    "categoria_id": "c4",
    "nombre": "Croasan de Queso",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 10,
    "costo": 3.5,
    "imagen_url": "https://i.ibb.co/ym3LGdBL/dk-croasan-de-queso.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_35",
    "categoria_id": "c2",
    "nombre": "Palitos de queso",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 7.5,
    "costo": 2.6,
    "imagen_url": "https://i.ibb.co/RTDThwr6/dk-palitos-de-queso.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_36",
    "categoria_id": "c4",
    "nombre": "Pie de limón (Pequeño)",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 18,
    "costo": 6.3,
    "imagen_url": "https://i.ibb.co/MymM6SZV/dk-pie-de-lim-n-peque-o.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_37",
    "categoria_id": "c2",
    "nombre": "Ccapuchino+mini torta",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 28,
    "costo": 9.8,
    "imagen_url": "https://i.ibb.co/TQ2z3r4/dencker-cat-2.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_38",
    "categoria_id": "c2",
    "nombre": "CROASANT ESPECIAL",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 9,
    "costo": 3.2,
    "imagen_url": "https://i.ibb.co/TQ2z3r4/dencker-cat-2.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 708,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_39",
    "categoria_id": "c2",
    "nombre": "CROISSANT DE QUESO  PEQUEÑO",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 6,
    "costo": 2.1,
    "imagen_url": "https://i.ibb.co/TQ2z3r4/dencker-cat-2.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_40",
    "categoria_id": "c2",
    "nombre": "Croissant Sandwich pavita",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 29,
    "costo": 10.1,
    "imagen_url": "https://i.ibb.co/DgvnZZNb/dk-croissant-sandwich-pavita.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_41",
    "categoria_id": "c2",
    "nombre": "CROSANT ESPECIAL",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 9,
    "costo": 3.2,
    "imagen_url": "https://i.ibb.co/TQ2z3r4/dencker-cat-2.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_42",
    "categoria_id": "c2",
    "nombre": "Cuñape frito",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 7.5,
    "costo": 2.6,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712701120.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_43",
    "categoria_id": "c2",
    "nombre": "Desayuno 1",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 350,
    "costo": 122.5,
    "imagen_url": "https://i.ibb.co/TQ2z3r4/dencker-cat-2.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 998,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_44",
    "categoria_id": "c2",
    "nombre": "Desayuno 2",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 125,
    "costo": 43.8,
    "imagen_url": "https://i.ibb.co/TQ2z3r4/dencker-cat-2.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 998,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_45",
    "categoria_id": "c2",
    "nombre": "Desayuno 3",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 150,
    "costo": 52.5,
    "imagen_url": "https://i.ibb.co/TQ2z3r4/dencker-cat-2.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 997,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_46",
    "categoria_id": "c2",
    "nombre": "Desayuno 4",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 250,
    "costo": 87.5,
    "imagen_url": "https://i.ibb.co/TQ2z3r4/dencker-cat-2.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 994,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_47",
    "categoria_id": "c2",
    "nombre": "Empanada De Hoja",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 9.5,
    "costo": 3.3,
    "imagen_url": "https://i.ibb.co/TQ2z3r4/dencker-cat-2.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_48",
    "categoria_id": "c2",
    "nombre": "Empanadas Requeson",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 10.5,
    "costo": 3.7,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713649407.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_49",
    "categoria_id": "c2",
    "nombre": "Pan de arroz",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 10.5,
    "costo": 3.7,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713649564.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_50",
    "categoria_id": "c2",
    "nombre": "Pastel",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 7,
    "costo": 2.4,
    "imagen_url": "https://i.ibb.co/TQ2z3r4/dencker-cat-2.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_51",
    "categoria_id": "c2",
    "nombre": "pastel jamon con queso",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 8,
    "costo": 2.8,
    "imagen_url": "https://i.ibb.co/TQ2z3r4/dencker-cat-2.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 77,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_52",
    "categoria_id": "c2",
    "nombre": "PROMO JUGO + CROASANT",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 20,
    "costo": 7,
    "imagen_url": "https://i.ibb.co/TQ2z3r4/dencker-cat-2.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 1000,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_53",
    "categoria_id": "c2",
    "nombre": "PUCA CAPA",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 11,
    "costo": 3.9,
    "imagen_url": "https://i.ibb.co/TQ2z3r4/dencker-cat-2.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_54",
    "categoria_id": "c2",
    "nombre": "Sandwich Croissant  jamón y queso",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 26,
    "costo": 9.1,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712702060.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_55",
    "categoria_id": "c2",
    "nombre": "sandwich croissant tocino",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 35,
    "costo": 12.3,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712590820.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_56",
    "categoria_id": "c2",
    "nombre": "Sandwich de pavita pequeño",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 11,
    "costo": 3.9,
    "imagen_url": "https://i.ibb.co/TQ2z3r4/dencker-cat-2.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_57",
    "categoria_id": "c2",
    "nombre": "Sandwich especial Dencker",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 35,
    "costo": 12.3,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712591056.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_58",
    "categoria_id": "c2",
    "nombre": "Sandwich jamon y queso",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 26,
    "costo": 9.1,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713649649.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_59",
    "categoria_id": "c2",
    "nombre": "Sandwich pavita",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 29,
    "costo": 10.1,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713649673.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.511Z",
    "updated_at": "2026-10-23T00:25:05.511Z"
  },
  {
    "id": "prod_60",
    "categoria_id": "c2",
    "nombre": "Sandwich pavita pequeño",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 11,
    "costo": 3.9,
    "imagen_url": "https://i.ibb.co/TQ2z3r4/dencker-cat-2.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_61",
    "categoria_id": "c2",
    "nombre": "sonso",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 15.5,
    "costo": 5.4,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713649704.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_62",
    "categoria_id": "c3",
    "nombre": "Abizcochado en bolsa 200gr",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 18,
    "costo": 6.3,
    "imagen_url": "https://i.ibb.co/S75YZFD4/dencker-cat-3.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_63",
    "categoria_id": "c3",
    "nombre": "Baguette pequeño",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 4,
    "costo": 1.4,
    "imagen_url": "https://i.ibb.co/S75YZFD4/dencker-cat-3.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_64",
    "categoria_id": "c3",
    "nombre": "Bizcocho",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 4,
    "costo": 1.4,
    "imagen_url": "https://i.ibb.co/S75YZFD4/dencker-cat-3.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_65",
    "categoria_id": "c3",
    "nombre": "Croissant sin relleno",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 9,
    "costo": 3.2,
    "imagen_url": "https://i.ibb.co/S75YZFD4/dencker-cat-3.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 979,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_66",
    "categoria_id": "c3",
    "nombre": "Hamburguesa 14cm",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 23,
    "costo": 8,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713647143.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_67",
    "categoria_id": "c3",
    "nombre": "Media luna pequeña",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 5,
    "costo": 1.8,
    "imagen_url": "https://i.ibb.co/S75YZFD4/dencker-cat-3.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_68",
    "categoria_id": "c3",
    "nombre": "Pan Baguette",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 8,
    "costo": 2.8,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712760813.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_69",
    "categoria_id": "c3",
    "nombre": "Pan con Cereales",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 14,
    "costo": 4.9,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711663068.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_70",
    "categoria_id": "c3",
    "nombre": "Pan con Salvado",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 13,
    "costo": 4.6,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711663393.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_71",
    "categoria_id": "c3",
    "nombre": "Pan concha",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 5,
    "costo": 1.8,
    "imagen_url": "https://i.ibb.co/S75YZFD4/dencker-cat-3.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_72",
    "categoria_id": "c3",
    "nombre": "Pan de masa madre",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 12,
    "costo": 4.2,
    "imagen_url": "https://i.ibb.co/S75YZFD4/dencker-cat-3.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_73",
    "categoria_id": "c3",
    "nombre": "PAN MATILDA",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 17,
    "costo": 5.9,
    "imagen_url": "https://i.ibb.co/S75YZFD4/dencker-cat-3.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_74",
    "categoria_id": "c3",
    "nombre": "Pan Miga",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 21,
    "costo": 7.4,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711662981.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_75",
    "categoria_id": "c3",
    "nombre": "Pan Molde Blanco",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 15,
    "costo": 5.3,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711660195.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_76",
    "categoria_id": "c3",
    "nombre": "Pan Molde Salvado",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 15,
    "costo": 5.3,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711663005.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_77",
    "categoria_id": "c3",
    "nombre": "Pan Molde Salvado con Estevia",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 15,
    "costo": 5.3,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711663044.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_78",
    "categoria_id": "c3",
    "nombre": "Pan Molido 1000 gr",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 19,
    "costo": 6.7,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711663802.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_79",
    "categoria_id": "c3",
    "nombre": "Pan Molido 500 gr",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 14,
    "costo": 4.9,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711663751.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_80",
    "categoria_id": "c3",
    "nombre": "Pan Panini",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 5,
    "costo": 1.8,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712763609.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_81",
    "categoria_id": "c3",
    "nombre": "Pan para Hamburguesa",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 13,
    "costo": 4.6,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711663360.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_82",
    "categoria_id": "c3",
    "nombre": "Pan para Hot Dog (grande)",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 20,
    "costo": 7,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711663551.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_83",
    "categoria_id": "c3",
    "nombre": "Pan para Hot Dog (pequeño)",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 13,
    "costo": 4.6,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711663451.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 149,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_84",
    "categoria_id": "c3",
    "nombre": "Pan Tortillas",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 14,
    "costo": 4.9,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711663289.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_85",
    "categoria_id": "c3",
    "nombre": "PIE DE MARACUYA",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 20,
    "costo": 7,
    "imagen_url": "https://i.ibb.co/S75YZFD4/dencker-cat-3.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_86",
    "categoria_id": "c3",
    "nombre": "Pre Pizza",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 13,
    "costo": 4.6,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711663647.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_87",
    "categoria_id": "c3",
    "nombre": "Pre Pizza (pequeño)",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 3,
    "costo": 1,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713647256.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_88",
    "categoria_id": "c3",
    "nombre": "Queque de arandanos",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 37,
    "costo": 13,
    "imagen_url": "https://i.ibb.co/S75YZFD4/dencker-cat-3.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_89",
    "categoria_id": "c3",
    "nombre": "Sandwich especial baguette",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 40,
    "costo": 14,
    "imagen_url": "https://i.ibb.co/S75YZFD4/dencker-cat-3.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_90",
    "categoria_id": "c3",
    "nombre": "Tostadas con Salvado",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 15,
    "costo": 5.3,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711663889.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_91",
    "categoria_id": "c3",
    "nombre": "Tostadas con Vainilla",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 15,
    "costo": 5.3,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711663929.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_92",
    "categoria_id": "c4",
    "nombre": "Alfajor Marplatense",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 12.5,
    "costo": 4.4,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712680508.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_93",
    "categoria_id": "c4",
    "nombre": "Almoaditas",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 8.5,
    "costo": 3,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712680592.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_94",
    "categoria_id": "c4",
    "nombre": "Arroz con leche",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 12,
    "costo": 4.2,
    "imagen_url": "https://i.ibb.co/8LbH4mwr/dencker-cat-4.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_95",
    "categoria_id": "c4",
    "nombre": "Berlines",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 12.5,
    "costo": 4.4,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711823470.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_96",
    "categoria_id": "c4",
    "nombre": "Bombitas (Croofins)",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 10,
    "costo": 3.5,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712680987.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_97",
    "categoria_id": "c4",
    "nombre": "Brazo gitano",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 110,
    "costo": 38.5,
    "imagen_url": "https://i.ibb.co/8LbH4mwr/dencker-cat-4.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_98",
    "categoria_id": "c4",
    "nombre": "Brownie / Blondy",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 12.5,
    "costo": 4.4,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711824121.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_99",
    "categoria_id": "c4",
    "nombre": "Budin",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 7,
    "costo": 2.4,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713647447.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_100",
    "categoria_id": "c4",
    "nombre": "Cajas de desayunos",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 4,
    "costo": 1.4,
    "imagen_url": "https://i.ibb.co/8LbH4mwr/dencker-cat-4.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_101",
    "categoria_id": "c4",
    "nombre": "cake pop",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 9,
    "costo": 3.2,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712681041.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_102",
    "categoria_id": "c4",
    "nombre": "Cheescake",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 15,
    "costo": 5.3,
    "imagen_url": "https://i.ibb.co/8LbH4mwr/dencker-cat-4.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_103",
    "categoria_id": "c4",
    "nombre": "Chocorona",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 20,
    "costo": 7,
    "imagen_url": "https://i.ibb.co/8LbH4mwr/dencker-cat-4.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_104",
    "categoria_id": "c4",
    "nombre": "Cinnamon",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 13,
    "costo": 4.6,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712701182.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_105",
    "categoria_id": "c4",
    "nombre": "Cono con crema",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 13,
    "costo": 4.6,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713647538.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_106",
    "categoria_id": "c4",
    "nombre": "Coxinhas",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 11.5,
    "costo": 4,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712700679.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_107",
    "categoria_id": "c4",
    "nombre": "crema extra",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 7,
    "costo": 2.4,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712759741.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_108",
    "categoria_id": "c4",
    "nombre": "Croasan de jamón",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 11,
    "costo": 3.9,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712759428.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_109",
    "categoria_id": "c4",
    "nombre": "Crumble de Manzana",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 19,
    "costo": 6.7,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712697870.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_110",
    "categoria_id": "c4",
    "nombre": "CupCakes",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 13,
    "costo": 4.6,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711823907.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_111",
    "categoria_id": "c4",
    "nombre": "Donas",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 11,
    "costo": 3.9,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712010095.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_112",
    "categoria_id": "c4",
    "nombre": "DONAS PEQUEÑAS",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 6,
    "costo": 2.1,
    "imagen_url": "https://i.ibb.co/8LbH4mwr/dencker-cat-4.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_113",
    "categoria_id": "c4",
    "nombre": "Donas rellenas",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 12.5,
    "costo": 4.4,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711824228.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_114",
    "categoria_id": "c4",
    "nombre": "Eclers",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 9,
    "costo": 3.2,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712759120.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_115",
    "categoria_id": "c4",
    "nombre": "Flan",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 7,
    "costo": 2.4,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712758762.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_116",
    "categoria_id": "c4",
    "nombre": "Galletas de champagne grande",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 7,
    "costo": 2.4,
    "imagen_url": "https://i.ibb.co/8LbH4mwr/dencker-cat-4.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_117",
    "categoria_id": "c4",
    "nombre": "gelatina",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 5,
    "costo": 1.8,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712759895.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_118",
    "categoria_id": "c4",
    "nombre": "Hojaraska",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 7.5,
    "costo": 2.6,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711823887.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_119",
    "categoria_id": "c4",
    "nombre": "Italianos",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 12.5,
    "costo": 4.4,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712760039.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_120",
    "categoria_id": "c4",
    "nombre": "Llaucchas",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 12.5,
    "costo": 4.4,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713647575.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_121",
    "categoria_id": "c4",
    "nombre": "Media luna",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 10.5,
    "costo": 3.7,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711824161.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_122",
    "categoria_id": "c4",
    "nombre": "Mini Cakes",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 17,
    "costo": 5.9,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711824502.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_123",
    "categoria_id": "c4",
    "nombre": "Mousse",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 14,
    "costo": 4.9,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713647749.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_124",
    "categoria_id": "c4",
    "nombre": "Muffin de arándanos/Chocolate",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 11.5,
    "costo": 4,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711823948.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_125",
    "categoria_id": "c4",
    "nombre": "NAPOLEON",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 19,
    "costo": 6.7,
    "imagen_url": "https://i.ibb.co/8LbH4mwr/dencker-cat-4.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_126",
    "categoria_id": "c4",
    "nombre": "NAPOLEON PORCION",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 19,
    "costo": 6.7,
    "imagen_url": "https://i.ibb.co/8LbH4mwr/dencker-cat-4.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_127",
    "categoria_id": "c4",
    "nombre": "New York Rolls",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 21,
    "costo": 7.4,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711824583.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_128",
    "categoria_id": "c4",
    "nombre": "Niditos (pequeño y grande)",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 25,
    "costo": 8.8,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711824998.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_129",
    "categoria_id": "c4",
    "nombre": "Osiquitos con mermelada de membrillo",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 9,
    "costo": 3.2,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711823843.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_130",
    "categoria_id": "c4",
    "nombre": "Palmeritas",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 10.5,
    "costo": 3.7,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712760191.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_131",
    "categoria_id": "c4",
    "nombre": "Paraguayos",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 13,
    "costo": 4.6,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711824830.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_132",
    "categoria_id": "c4",
    "nombre": "Pencos",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 10,
    "costo": 3.5,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711823698.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_133",
    "categoria_id": "c4",
    "nombre": "PIE DE CHOCOLATE",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 20,
    "costo": 7,
    "imagen_url": "https://i.ibb.co/8LbH4mwr/dencker-cat-4.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_134",
    "categoria_id": "c4",
    "nombre": "Pie de limón (Grande)",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 70,
    "costo": 24.5,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712009017.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_135",
    "categoria_id": "c4",
    "nombre": "Pie de Manzana (Grande)",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 55,
    "costo": 19.3,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712008791.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_136",
    "categoria_id": "c4",
    "nombre": "Pie de manzana (Pequeño)",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 18,
    "costo": 6.3,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711824378.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_137",
    "categoria_id": "c4",
    "nombre": "Placa Grande Suspiro",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 45,
    "costo": 15.7,
    "imagen_url": "https://i.ibb.co/8LbH4mwr/dencker-cat-4.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_138",
    "categoria_id": "c4",
    "nombre": "Placas de Suspiros",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 45,
    "costo": 15.7,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712764781.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_139",
    "categoria_id": "c4",
    "nombre": "PORCION TORTA DURAZNO",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 8,
    "costo": 2.8,
    "imagen_url": "https://i.ibb.co/8LbH4mwr/dencker-cat-4.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_140",
    "categoria_id": "c4",
    "nombre": "PROMO CAPUCHINO + MINICAKE",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 30,
    "costo": 10.5,
    "imagen_url": "https://i.ibb.co/8LbH4mwr/dencker-cat-4.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_141",
    "categoria_id": "c4",
    "nombre": "PROMO HELADO + BROWNIE",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 15,
    "costo": 5.3,
    "imagen_url": "https://i.ibb.co/8LbH4mwr/dencker-cat-4.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_142",
    "categoria_id": "c4",
    "nombre": "promo latte + empanada",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 22,
    "costo": 7.7,
    "imagen_url": "https://i.ibb.co/8LbH4mwr/dencker-cat-4.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_143",
    "categoria_id": "c4",
    "nombre": "PROMO ROLLS",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 35,
    "costo": 12.3,
    "imagen_url": "https://i.ibb.co/8LbH4mwr/dencker-cat-4.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_144",
    "categoria_id": "c4",
    "nombre": "Rollo de Queso(Grande)",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 30,
    "costo": 10.5,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712115596.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_145",
    "categoria_id": "c4",
    "nombre": "Rosquetes",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 19,
    "costo": 6.7,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711824741.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_146",
    "categoria_id": "c4",
    "nombre": "Suspiros",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 28,
    "costo": 9.8,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713647827.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_147",
    "categoria_id": "c4",
    "nombre": "Tiramisu",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 19,
    "costo": 6.7,
    "imagen_url": "https://i.ibb.co/8LbH4mwr/dencker-cat-4.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_148",
    "categoria_id": "c4",
    "nombre": "TORTA",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 475,
    "costo": 166.3,
    "imagen_url": "https://i.ibb.co/8LbH4mwr/dencker-cat-4.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_149",
    "categoria_id": "c4",
    "nombre": "Torta de capas",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 17,
    "costo": 5.9,
    "imagen_url": "https://i.ibb.co/8LbH4mwr/dencker-cat-4.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_150",
    "categoria_id": "c4",
    "nombre": "Torta tres leches",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 19,
    "costo": 6.7,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711824440.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_151",
    "categoria_id": "c4",
    "nombre": "Torta vasca",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 27,
    "costo": 9.5,
    "imagen_url": "https://i.ibb.co/8LbH4mwr/dencker-cat-4.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Calentar en horno",
      "Empacar para regalo",
      "Recién horneado"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_152",
    "categoria_id": "c5",
    "nombre": "Pasta Frola",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 26.5,
    "costo": 9.3,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711813593.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Para llevar"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_153",
    "categoria_id": "c5",
    "nombre": "Porcion de queque",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 12,
    "costo": 4.2,
    "imagen_url": "https://i.ibb.co/JL4MnXC/dencker-cat-5.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Para llevar"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_154",
    "categoria_id": "c5",
    "nombre": "Queque Coco",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 24.5,
    "costo": 8.6,
    "imagen_url": "https://i.ibb.co/JL4MnXC/dencker-cat-5.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Para llevar"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_155",
    "categoria_id": "c5",
    "nombre": "Queque de Naranja",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 24.5,
    "costo": 8.6,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711812838.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Para llevar"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_156",
    "categoria_id": "c5",
    "nombre": "Queque De Platano",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 24.5,
    "costo": 8.6,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711813317.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Para llevar"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_157",
    "categoria_id": "c5",
    "nombre": "Queque Japonés",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 42,
    "costo": 14.7,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711813236.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Para llevar"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_158",
    "categoria_id": "c5",
    "nombre": "Queque limon",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 24.5,
    "costo": 8.6,
    "imagen_url": "https://i.ibb.co/JL4MnXC/dencker-cat-5.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Para llevar"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_159",
    "categoria_id": "c5",
    "nombre": "Queque Marmolado",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 24.5,
    "costo": 8.6,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1711812877.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Para llevar"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_160",
    "categoria_id": "c5",
    "nombre": "Queque Premium",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 50,
    "costo": 17.5,
    "imagen_url": "https://i.ibb.co/JL4MnXC/dencker-cat-5.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Para llevar"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_161",
    "categoria_id": "c5",
    "nombre": "Queque Zanahoria",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 37,
    "costo": 13,
    "imagen_url": "https://i.ibb.co/JL4MnXC/dencker-cat-5.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Para llevar"
    ],
    "estacion": "vitrina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_162",
    "categoria_id": "c6",
    "nombre": "Pizza 4 Estaciones",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 85,
    "costo": 29.7,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712588603.jpg",
    "disponible": true,
    "es_mas_vendido": true,
    "stock": -1,
    "chips_personalizacion": [
      "Bien caliente",
      "Con orégano extra",
      "Para compartir"
    ],
    "estacion": "cocina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_163",
    "categoria_id": "c6",
    "nombre": "Pizza Catupiry con Pollo",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 90,
    "costo": 31.5,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712589116.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Bien caliente",
      "Con orégano extra",
      "Para compartir"
    ],
    "estacion": "cocina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_164",
    "categoria_id": "c6",
    "nombre": "Pizza Champiñon",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 85,
    "costo": 29.7,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712589020.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Bien caliente",
      "Con orégano extra",
      "Para compartir"
    ],
    "estacion": "cocina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_165",
    "categoria_id": "c6",
    "nombre": "Pizza Criolla",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 90,
    "costo": 31.5,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712589164.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Bien caliente",
      "Con orégano extra",
      "Para compartir"
    ],
    "estacion": "cocina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_166",
    "categoria_id": "c6",
    "nombre": "Pizza de Choclo Amarillo",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 85,
    "costo": 29.7,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712589264.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Bien caliente",
      "Con orégano extra",
      "Para compartir"
    ],
    "estacion": "cocina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_167",
    "categoria_id": "c6",
    "nombre": "Pizza de Palmito",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 90,
    "costo": 31.5,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712589298.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Bien caliente",
      "Con orégano extra",
      "Para compartir"
    ],
    "estacion": "cocina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_168",
    "categoria_id": "c6",
    "nombre": "Pizza de Salame",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 90,
    "costo": 31.5,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712589327.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Bien caliente",
      "Con orégano extra",
      "Para compartir"
    ],
    "estacion": "cocina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_169",
    "categoria_id": "c6",
    "nombre": "Pizza de Tocino",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 90,
    "costo": 31.5,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712589406.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Bien caliente",
      "Con orégano extra",
      "Para compartir"
    ],
    "estacion": "cocina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_170",
    "categoria_id": "c6",
    "nombre": "Pizza especial Dencker",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 110,
    "costo": 38.5,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712588982.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Bien caliente",
      "Con orégano extra",
      "Para compartir"
    ],
    "estacion": "cocina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_171",
    "categoria_id": "c6",
    "nombre": "Pizza Hawaiana",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 85,
    "costo": 29.7,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712114164.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Bien caliente",
      "Con orégano extra",
      "Para compartir"
    ],
    "estacion": "cocina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_172",
    "categoria_id": "c6",
    "nombre": "Pizza Margarita",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 75,
    "costo": 26.3,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712589070.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Bien caliente",
      "Con orégano extra",
      "Para compartir"
    ],
    "estacion": "cocina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_173",
    "categoria_id": "c6",
    "nombre": "Pizza Pequeña",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 55,
    "costo": 19.3,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712589653.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Bien caliente",
      "Con orégano extra",
      "Para compartir"
    ],
    "estacion": "cocina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_174",
    "categoria_id": "c6",
    "nombre": "Pizza Pequeña Margarita",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 50,
    "costo": 17.5,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712589596.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Bien caliente",
      "Con orégano extra",
      "Para compartir"
    ],
    "estacion": "cocina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_175",
    "categoria_id": "c6",
    "nombre": "Pizza Portuguesa",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 90,
    "costo": 31.5,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712589443.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Bien caliente",
      "Con orégano extra",
      "Para compartir"
    ],
    "estacion": "cocina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_176",
    "categoria_id": "c6",
    "nombre": "Pizza Queso y Jamón",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 85,
    "costo": 29.7,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712114283.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Bien caliente",
      "Con orégano extra",
      "Para compartir"
    ],
    "estacion": "cocina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_177",
    "categoria_id": "c6",
    "nombre": "Porción extra Pizza",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 6,
    "costo": 2.1,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712589718.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Bien caliente",
      "Con orégano extra",
      "Para compartir"
    ],
    "estacion": "cocina",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_178",
    "categoria_id": "c7",
    "nombre": "Agua 600ml",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 8,
    "costo": 2.8,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713648019.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_179",
    "categoria_id": "c7",
    "nombre": "Agua De 2 Litros",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 12,
    "costo": 4.2,
    "imagen_url": "https://i.ibb.co/BV52cJkc/dencker-cat-7.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_180",
    "categoria_id": "c7",
    "nombre": "ALOE VERA",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 11,
    "costo": 3.9,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713646373.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_181",
    "categoria_id": "c7",
    "nombre": "Aquarius 300ml",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 5,
    "costo": 1.8,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713646392.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_182",
    "categoria_id": "c7",
    "nombre": "Arroz con leche vaso",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 7,
    "costo": 2.4,
    "imagen_url": "https://i.ibb.co/BV52cJkc/dencker-cat-7.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_183",
    "categoria_id": "c7",
    "nombre": "Cafe Americano clasico",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 16,
    "costo": 5.6,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713648044.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_184",
    "categoria_id": "c7",
    "nombre": "Cafe Americano Grande",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 22,
    "costo": 7.7,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713648071.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_185",
    "categoria_id": "c7",
    "nombre": "Café Capuchino (Grande)",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 24,
    "costo": 8.4,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712146999.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_186",
    "categoria_id": "c7",
    "nombre": "Café Capuchino SCrem",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 20,
    "costo": 7,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712147370.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_187",
    "categoria_id": "c7",
    "nombre": "Cafe Con Leche Frio",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 15,
    "costo": 5.3,
    "imagen_url": "https://i.ibb.co/BV52cJkc/dencker-cat-7.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_188",
    "categoria_id": "c7",
    "nombre": "Cafe Cortado Clasico",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 19,
    "costo": 6.7,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713648100.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_189",
    "categoria_id": "c7",
    "nombre": "Cafe Cortado Grande",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 21,
    "costo": 7.4,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713648153.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_190",
    "categoria_id": "c7",
    "nombre": "Cafe Expresso Clasico",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 16,
    "costo": 5.6,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713648199.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_191",
    "categoria_id": "c7",
    "nombre": "Cafe Expresso Doble",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 22,
    "costo": 7.7,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713648228.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_192",
    "categoria_id": "c7",
    "nombre": "Cafe Frio",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 15,
    "costo": 5.3,
    "imagen_url": "https://i.ibb.co/BV52cJkc/dencker-cat-7.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_193",
    "categoria_id": "c7",
    "nombre": "Cafe Latte Clasico",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 18,
    "costo": 6.3,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713648254.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_194",
    "categoria_id": "c7",
    "nombre": "Cafe Latte Grande",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 20,
    "costo": 7,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713648292.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_195",
    "categoria_id": "c7",
    "nombre": "Cafe Mocka Clasico",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 20,
    "costo": 7,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713648325.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_196",
    "categoria_id": "c7",
    "nombre": "Cafe Mocka Grande",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 24,
    "costo": 8.4,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713648349.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_197",
    "categoria_id": "c7",
    "nombre": "Chocolatada Clasica",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 18,
    "costo": 6.3,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713648372.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_198",
    "categoria_id": "c7",
    "nombre": "Chocolatada Grande",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 22,
    "costo": 7.7,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713648446.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_199",
    "categoria_id": "c7",
    "nombre": "Coca cola de 2 litros",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 17,
    "costo": 5.9,
    "imagen_url": "https://i.ibb.co/BV52cJkc/dencker-cat-7.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_200",
    "categoria_id": "c7",
    "nombre": "cocacola 1000 ml",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 15,
    "costo": 5.3,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713648468.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_201",
    "categoria_id": "c7",
    "nombre": "cocacola 190 ml",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 3,
    "costo": 1,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713648500.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_202",
    "categoria_id": "c7",
    "nombre": "cocacola 3 lt",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 22,
    "costo": 7.7,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713648522.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_203",
    "categoria_id": "c7",
    "nombre": "cocacola 300ml",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 5,
    "costo": 1.8,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713648658.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_204",
    "categoria_id": "c7",
    "nombre": "cocacola 500ml",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 8,
    "costo": 2.8,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713648675.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_205",
    "categoria_id": "c7",
    "nombre": "cocacola 600 ml",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 10,
    "costo": 3.5,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713648695.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_206",
    "categoria_id": "c7",
    "nombre": "Del Valle 1Lt",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 15,
    "costo": 5.3,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713648815.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_207",
    "categoria_id": "c7",
    "nombre": "Del Valle 300ml desechable",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 5,
    "costo": 1.8,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713648841.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_208",
    "categoria_id": "c7",
    "nombre": "Del Valle 300ml vidrio",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 8,
    "costo": 2.8,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713648864.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_209",
    "categoria_id": "c7",
    "nombre": "Extra fruta para jugos",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 6,
    "costo": 2.1,
    "imagen_url": "https://i.ibb.co/BV52cJkc/dencker-cat-7.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_210",
    "categoria_id": "c7",
    "nombre": "Fanta 1000ml",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 13,
    "costo": 4.6,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713648894.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_211",
    "categoria_id": "c7",
    "nombre": "Fanta 190 ml",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 3,
    "costo": 1,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713648935.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_212",
    "categoria_id": "c7",
    "nombre": "Fanta 500ml",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 8,
    "costo": 2.8,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713648970.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_213",
    "categoria_id": "c7",
    "nombre": "Fanta 600ml",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 10,
    "costo": 3.5,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713649050.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_214",
    "categoria_id": "c7",
    "nombre": "frapuchinos",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 25,
    "costo": 8.8,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713649080.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_215",
    "categoria_id": "c7",
    "nombre": "Gelatina o juguito",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 2,
    "costo": 1,
    "imagen_url": "https://i.ibb.co/BV52cJkc/dencker-cat-7.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_216",
    "categoria_id": "c7",
    "nombre": "Helado",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 7,
    "costo": 2.4,
    "imagen_url": "https://i.ibb.co/BV52cJkc/dencker-cat-7.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_217",
    "categoria_id": "c7",
    "nombre": "jugo 2lt",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 15,
    "costo": 5.3,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713649100.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_218",
    "categoria_id": "c7",
    "nombre": "Jugo 3lt",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 19,
    "costo": 6.7,
    "imagen_url": "https://i.ibb.co/BV52cJkc/dencker-cat-7.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_219",
    "categoria_id": "c7",
    "nombre": "Jugo de fruta con agua",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 14,
    "costo": 4.9,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713649140.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_220",
    "categoria_id": "c7",
    "nombre": "Jugo de fruta con leche",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 16,
    "costo": 5.6,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713649175.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_221",
    "categoria_id": "c7",
    "nombre": "Jugo mixto",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 20,
    "costo": 7,
    "imagen_url": "https://i.ibb.co/BV52cJkc/dencker-cat-7.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_222",
    "categoria_id": "c7",
    "nombre": "Jugo Pura Vida",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 8,
    "costo": 2.8,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713649205.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_223",
    "categoria_id": "c7",
    "nombre": "Jugos Frapeados con agua",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 16,
    "costo": 5.6,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712146728.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_224",
    "categoria_id": "c7",
    "nombre": "Jugos Frapeados con Leche",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 18,
    "costo": 6.3,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712146742.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_225",
    "categoria_id": "c7",
    "nombre": "Latte Frio",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 17,
    "costo": 5.9,
    "imagen_url": "https://i.ibb.co/BV52cJkc/dencker-cat-7.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_226",
    "categoria_id": "c7",
    "nombre": "Mate,Trimate grande",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 12,
    "costo": 4.2,
    "imagen_url": "https://i.ibb.co/BV52cJkc/dencker-cat-7.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_227",
    "categoria_id": "c7",
    "nombre": "Mocka",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 18,
    "costo": 6.3,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712147686.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_228",
    "categoria_id": "c7",
    "nombre": "Pan panini paquete",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 30,
    "costo": 10.5,
    "imagen_url": "https://i.ibb.co/BV52cJkc/dencker-cat-7.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_229",
    "categoria_id": "c7",
    "nombre": "Porcion extra fruta",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 7,
    "costo": 2.4,
    "imagen_url": "https://i.ibb.co/BV52cJkc/dencker-cat-7.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": 50,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_230",
    "categoria_id": "c7",
    "nombre": "Power",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 7,
    "costo": 2.4,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713648554.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_231",
    "categoria_id": "c7",
    "nombre": "Promo desayunos",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 104,
    "costo": 36.4,
    "imagen_url": "https://i.ibb.co/BV52cJkc/dencker-cat-7.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_232",
    "categoria_id": "c7",
    "nombre": "Promo frapes + croasant",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 30,
    "costo": 10.5,
    "imagen_url": "https://i.ibb.co/BV52cJkc/dencker-cat-7.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_233",
    "categoria_id": "c7",
    "nombre": "Sobre Extra de cafe o te",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 2,
    "costo": 1,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713648577.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.512Z"
  },
  {
    "id": "prod_234",
    "categoria_id": "c7",
    "nombre": "SOBRE EXTRA TE,MATE,CAFE",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 3,
    "costo": 1,
    "imagen_url": "https://i.ibb.co/BV52cJkc/dencker-cat-7.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.512Z",
    "updated_at": "2026-10-23T00:25:05.513Z"
  },
  {
    "id": "prod_235",
    "categoria_id": "c7",
    "nombre": "Solo Leche",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 8,
    "costo": 2.8,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1712148926.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.513Z",
    "updated_at": "2026-10-23T00:25:05.513Z"
  },
  {
    "id": "prod_236",
    "categoria_id": "c7",
    "nombre": "Te con leche",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 10,
    "costo": 3.5,
    "imagen_url": "https://i.ibb.co/BV52cJkc/dencker-cat-7.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.513Z",
    "updated_at": "2026-10-23T00:25:05.513Z"
  },
  {
    "id": "prod_237",
    "categoria_id": "c7",
    "nombre": "Té/Café/Maté",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 10,
    "costo": 3.5,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713649278.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.513Z",
    "updated_at": "2026-10-23T00:25:05.513Z"
  },
  {
    "id": "prod_238",
    "categoria_id": "c7",
    "nombre": "VIENESA",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 30,
    "costo": 10.5,
    "imagen_url": "https://i.ibb.co/BV52cJkc/dencker-cat-7.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.513Z",
    "updated_at": "2026-10-23T00:25:05.513Z"
  },
  {
    "id": "prod_239",
    "categoria_id": "c7",
    "nombre": "Viscachani",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 7,
    "costo": 2.4,
    "imagen_url": "https://tienda.denckerpan.com/img/products/1713649326.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.513Z",
    "updated_at": "2026-10-23T00:25:05.513Z"
  },
  {
    "id": "prod_240",
    "categoria_id": "c7",
    "nombre": "VOLT",
    "descripcion": "Especialidad artesanal Dencker Pan. Preparado con ingredientes de primera calidad.",
    "precio": 7,
    "costo": 2.4,
    "imagen_url": "https://i.ibb.co/BV52cJkc/dencker-cat-7.jpg",
    "disponible": true,
    "es_mas_vendido": false,
    "stock": -1,
    "chips_personalizacion": [
      "Sin azúcar",
      "Con Stevia",
      "Bien caliente",
      "Leche deslactosada"
    ],
    "estacion": "cafeteria",
    "created_at": "2026-10-23T00:25:05.513Z",
    "updated_at": "2026-10-23T00:25:05.513Z"
  }
];

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

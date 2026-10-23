import fs from 'fs';

function extraerProductosDeHtml(html, catNombreDefault = 'GENERAL') {
  const productos = [];

  // Categoría título en el HTML: <h5 class="mb-3">Productos en GALLETAS</h5>
  const h5Match = html.match(/<h5[^>]*>[\s\S]*?Productos en\s*([^<]+)<\/h5>/i);
  const categoriaNombre = h5Match ? h5Match[1].trim() : catNombreDefault;

  // Regex para tarjetas normales: <div class="card h-100"> ...
  const cardRegex = /<div class="card h-100">([\s\S]*?)<\/div>\s*<\/div>/gi;
  let m;

  while ((m = cardRegex.exec(html)) !== null) {
    const card = m[1];

    // Nombre
    const titleMatch = card.match(/<h6 class="card-title">([\s\S]*?)<\/h6>/i);
    const nombre = titleMatch ? titleMatch[1].trim() : '';
    if (!nombre) continue;

    // Imagen
    const imgMatch = card.match(/<img[^>]+src=["']([^"']+)["']/i);
    let rawImg = imgMatch ? imgMatch[1].trim() : '';
    let imagen = '';
    if (rawImg) {
      if (rawImg.startsWith('http')) {
        imagen = rawImg;
      } else if (rawImg.startsWith('../')) {
        imagen = `https://tienda.denckerpan.com/${rawImg.replace('../', '')}`;
      } else {
        imagen = `https://tienda.denckerpan.com/${rawImg}`;
      }
    }

    // Precio
    const precioMatch = card.match(/Bs\s*([0-9]+(?:\.[0-9]+)?)/i);
    const precio = precioMatch ? parseFloat(precioMatch[1]) : 15.0;

    // Stock
    const stockMatch = card.match(/<strong>([0-9]+)<\/strong>/i);
    const stock = stockMatch ? parseInt(stockMatch[1], 10) : 50;

    // ID del onclick="addOrModal(22)"
    const idMatch = card.match(/addOrModal\((\d+)\)/i);
    const id = idMatch ? idMatch[1] : `p_${Date.now()}`;

    productos.push({
      id: `dk-${id}`,
      nombre,
      categoria: categoriaNombre,
      precio,
      stock,
      imagen,
      tiene_foto: !imagen.includes('product_blank.jpg')
    });
  }

  // También extraer más vendidos si existen:
  const bestSellersRegex = /<div class="best-seller-item text-center"[^>]*onclick="addOrModal\((\d+)\)"[\s\S]*?<img src=["']([^"']+)["'][^>]*alt=["']([^"']+)["'][\s\S]*?Stock:\s*(\d+)[\s\S]*?<\/div>/gi;
  let bs;
  while ((bs = bestSellersRegex.exec(html)) !== null) {
    const id = bs[1];
    let rawImg = bs[2];
    const nombre = bs[3];
    const stock = parseInt(bs[4], 10);

    let imagen = rawImg;
    if (imagen.startsWith('../')) {
      imagen = `https://tienda.denckerpan.com/${rawImg.replace('../', '')}`;
    }

    productos.push({
      id: `dk-${id}`,
      nombre,
      categoria: 'MÁS VENDIDOS',
      precio: 18.0, // fallback si no viene precio en más vendidos
      stock,
      imagen,
      es_mas_vendido: true,
      tiene_foto: !imagen.includes('product_blank.jpg')
    });
  }

  return { categoriaNombre, productos };
}

async function run() {
  console.log('🚀 Iniciando descarga completa de categorías de Dencker Pan...');

  const categoriasUrls = [
    { id: 1, nombre: 'GALLETAS', url: 'https://tienda.denckerpan.com/pedido/index.php?cat=1', img: 'https://tienda.denckerpan.com/img/categories/image_1.jpg' },
    { id: 2, nombre: 'MASITAS SALADAS', url: 'https://tienda.denckerpan.com/pedido/index.php?cat=2', img: 'https://tienda.denckerpan.com/img/categories/image_2.jpg' },
    { id: 3, nombre: 'PANADERÍA', url: 'https://tienda.denckerpan.com/pedido/index.php?cat=3', img: 'https://tienda.denckerpan.com/img/categories/image_3.jpg' },
    { id: 4, nombre: 'PASTELERIA', url: 'https://tienda.denckerpan.com/pedido/index.php?cat=4', img: 'https://tienda.denckerpan.com/img/categories/image_4.jpg' },
    { id: 5, nombre: 'QUEQUES', url: 'https://tienda.denckerpan.com/pedido/index.php?cat=5', img: 'https://tienda.denckerpan.com/img/categories/image_5.jpg' },
    { id: 6, nombre: 'PIZZAS', url: 'https://tienda.denckerpan.com/pedido/index.php?cat=6', img: 'https://tienda.denckerpan.com/img/categories/image_6.jpg' },
    { id: 7, nombre: 'BEBIDAS', url: 'https://tienda.denckerpan.com/pedido/index.php?cat=7', img: 'https://tienda.denckerpan.com/img/categories/image_7.jpg' }
  ];

  const mapaUnico = new Map();

  for (const cat of categoriasUrls) {
    try {
      console.log(`Conectando a categoría ${cat.id}: ${cat.nombre}...`);
      const res = await fetch(cat.url);
      const html = await res.text();
      const { categoriaNombre, productos } = extraerProductosDeHtml(html, cat.nombre);
      console.log(`  -> Extraídos ${productos.length} ítems de ${categoriaNombre}`);

      for (const p of productos) {
        const key = p.nombre.toLowerCase().trim();
        if (mapaUnico.has(key)) {
          // Si ya existe pero el nuevo tiene precio válido > 0 y el anterior era fallback, actualizar
          const existing = mapaUnico.get(key);
          if (p.precio > 0 && existing.precio === 18.0) {
            existing.precio = p.precio;
          }
          if (p.categoria !== 'MÁS VENDIDOS') {
            existing.categoria = p.categoria;
          }
        } else {
          mapaUnico.set(key, p);
        }
      }
    } catch (e) {
      console.error(`Error en cat ${cat.id}:`, e.message);
    }
  }

  const todos = [...mapaUnico.values()];
  console.log(`\n========================================`);
  console.log(`TOTAL PRODUCTOS REALES ÚNICOS EXTRAÍDOS: ${todos.length}`);
  console.log(`PRODUCTOS CON FOTO REAL: ${todos.filter(p => p.tiene_foto).length}`);
  console.log(`========================================\n`);

  const resultado = {
    empresa: "Dencker Pan",
    logo: "https://tienda.denckerpan.com/views/logo.png",
    banners: [
      "https://tienda.denckerpan.com/img/banners/banner_1.jpg",
      "https://tienda.denckerpan.com/img/banners/banner_2.jpg"
    ],
    categorias: categoriasUrls,
    total_productos: todos.length,
    productos: todos
  };

  fs.writeFileSync('scripts/denckerpan_completo.json', JSON.stringify(resultado, null, 2));
  console.log('✅ Archivo guardado: scripts/denckerpan_completo.json');
}

run();

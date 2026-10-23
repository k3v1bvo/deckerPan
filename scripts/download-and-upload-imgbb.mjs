import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

const IMGBB_KEYS = [
  'b049b0990069aec5dfec445cff31a63a',
  '471638ad84d836135f96a835dc638435'
];

// Carpetas de destino en public/img
const DIRS = [
  'public/img/logo',
  'public/img/banners',
  'public/img/categories',
  'public/img/products'
];

DIRS.forEach(d => fs.mkdirSync(d, { recursive: true }));

async function descargarArchivo(url, destino) {
  if (!url) return false;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const fileStream = fs.createWriteStream(destino);
    await pipeline(res.body, fileStream);
    return true;
  } catch (err) {
    console.warn(`  [Descarga Fallida] ${url}: ${err.message}`);
    return false;
  }
}

async function subirAImgBB(urlOrPath, nombre) {
  for (const apiKey of IMGBB_KEYS) {
    try {
      const formData = new FormData();
      if (typeof urlOrPath === 'string' && urlOrPath.startsWith('http')) {
        formData.append('image', urlOrPath);
      } else {
        const fileBuffer = fs.readFileSync(urlOrPath);
        const blob = new Blob([fileBuffer]);
        formData.append('image', blob);
      }
      formData.append('name', nombre);

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data && data.success && data.data) {
        return data.data.url;
      }
    } catch (e) {
      // Intentar siguiente key
    }
  }
  return null;
}

async function main() {
  console.log('========================================================');
  console.log('DESCARGA Y SUBIDA IMGBB DE FOTOS REALES DENCKER PAN');
  console.log('========================================================\n');

  const raw = JSON.parse(fs.readFileSync('scripts/denckerpan_completo.json', 'utf8'));
  const lookup = {};

  // 1. Logo
  console.log('1. Descargando y subiendo Logo oficial...');
  const logoDest = 'public/img/logo/logo.png';
  await descargarArchivo(raw.logo, logoDest);
  const logoImgBB = await subirAImgBB(raw.logo, 'dencker_logo');
  lookup['logo'] = logoImgBB || '/img/logo/logo.png';
  console.log(`   Logo URL: ${lookup['logo']}`);

  // 2. Banners
  console.log('\n2. Descargando y subiendo Banners...');
  lookup['banners'] = [];
  for (let i = 0; i < raw.banners.length; i++) {
    const bUrl = raw.banners[i];
    const bDest = `public/img/banners/banner_${i + 1}.jpg`;
    await descargarArchivo(bUrl, bDest);
    const bImgBB = await subirAImgBB(bUrl, `dencker_banner_${i + 1}`);
    lookup['banners'].push(bImgBB || `/img/banners/banner_${i + 1}.jpg`);
    console.log(`   Banner ${i + 1}: ${lookup['banners'][i]}`);
  }

  // 3. Categorías (7 imágenes)
  console.log('\n3. Descargando y subiendo Categorías (7)...');
  lookup['categorias'] = {};
  for (const cat of raw.categorias) {
    const cDest = `public/img/categories/category_${cat.id}.jpg`;
    await descargarArchivo(cat.img, cDest);
    const cImgBB = await subirAImgBB(cat.img, `dencker_cat_${cat.id}`);
    lookup['categorias'][cat.id] = cImgBB || `/img/categories/category_${cat.id}.jpg`;
    console.log(`   Categoría ${cat.nombre}: ${lookup['categorias'][cat.id]}`);
  }

  // 4. Descargar fotos de productos con foto real
  console.log('\n4. Descargando productos con foto real...');
  const productosConFoto = raw.productos.filter(p => p.tiene_foto);
  console.log(`   Descargando ${productosConFoto.length} fotos a public/img/products/...`);

  let countDescargas = 0;
  for (const p of productosConFoto) {
    const filename = path.basename(new URL(p.imagen).pathname);
    const pDest = `public/img/products/${filename}`;
    if (!fs.existsSync(pDest)) {
      const ok = await descargarArchivo(p.imagen, pDest);
      if (ok) countDescargas++;
    }
  }
  console.log(`   ✅ ${countDescargas} fotos nuevas descargadas localmente en public/img/products/`);

  // Subir los top 30 productos a ImgBB para tener links en la nube
  console.log('\n5. Subiendo Top 30 productos a ImgBB para CDN de alta velocidad...');
  lookup['productos'] = {};
  const topProds = productosConFoto.slice(0, 30);

  for (const p of topProds) {
    const slug = p.nombre.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 25);
    const imgbbUrl = await subirAImgBB(p.imagen, `dk_${slug}`);
    if (imgbbUrl) {
      lookup['productos'][p.id] = imgbbUrl;
      console.log(`   ✓ ${p.nombre} -> ${imgbbUrl}`);
    }
  }

  fs.writeFileSync('scripts/img_lookup.json', JSON.stringify(lookup, null, 2));
  console.log('\n✅ ¡Proceso completado! Lookup guardado en scripts/img_lookup.json');
}

main().catch(console.error);

import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('scripts/denckerpan_completo.json', 'utf8'));

console.log('Empresa:', raw.empresa);
console.log('Total productos:', raw.total_productos);

const catCounts = {};
for (const p of raw.productos) {
  catCounts[p.categoria] = (catCounts[p.categoria] || 0) + 1;
}

console.log('Productos por categoría:', catCounts);

// Mostrar 3 ejemplos por categoría
for (const cat of Object.keys(catCounts)) {
  const prods = raw.productos.filter(p => p.categoria === cat).slice(0, 3);
  console.log(`\n--- ${cat} ---`);
  prods.forEach(p => console.log(`  * ${p.nombre} (Bs ${p.precio}) - Foto: ${p.tiene_foto ? p.imagen : 'SIN FOTO'}`));
}

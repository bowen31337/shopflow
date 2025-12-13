// Script to update existing product images to use Lorem Picsum
// Run with: node update-images-to-lorem.js

import db from './src/database.js';

const imageUpdates = [
  { product_id: 1, position: 0, url: 'https://picsum.photos/seed/laptop1/400/400' },
  { product_id: 1, position: 1, url: 'https://picsum.photos/seed/laptop2/400/400' },
  { product_id: 2, position: 0, url: 'https://picsum.photos/seed/phone1/400/400' },
  { product_id: 2, position: 1, url: 'https://picsum.photos/seed/phone2/400/400' },
  { product_id: 3, position: 0, url: 'https://picsum.photos/seed/tshirt/400/400' },
  { product_id: 4, position: 0, url: 'https://picsum.photos/seed/jeans/400/400' },
  { product_id: 5, position: 0, url: 'https://picsum.photos/seed/dress/400/400' },
  { product_id: 6, position: 0, url: 'https://picsum.photos/seed/pillow/400/400' },
  { product_id: 7, position: 0, url: 'https://picsum.photos/seed/yogamat/400/400' },
  { product_id: 8, position: 0, url: 'https://picsum.photos/seed/shoes/400/400' },
  { product_id: 9, position: 0, url: 'https://picsum.photos/seed/mouse/400/400' },
  { product_id: 10, position: 0, url: 'https://picsum.photos/seed/headphones/400/400' },
  { product_id: 11, position: 0, url: 'https://picsum.photos/seed/kitchen/400/400' },
  { product_id: 12, position: 0, url: 'https://picsum.photos/seed/bottle/400/400' },
];

console.log('Updating product images to use Lorem Picsum...\n');

const updateStmt = db.prepare(`
  UPDATE product_images 
  SET url = ? 
  WHERE product_id = ? AND position = ?
`);

let updated = 0;
let notFound = 0;

imageUpdates.forEach(({ product_id, position, url }) => {
  const result = updateStmt.run(url, product_id, position);
  if (result.changes > 0) {
    console.log(`✓ Updated product ${product_id} (position ${position})`);
    updated++;
  } else {
    // Try inserting if doesn't exist
    try {
      const insertStmt = db.prepare(`
        INSERT INTO product_images (product_id, url, is_primary, position) 
        VALUES (?, ?, ?, ?)
      `);
      insertStmt.run(product_id, url, position === 0 ? 1 : 0, position);
      console.log(`+ Inserted new image for product ${product_id} (position ${position})`);
      updated++;
    } catch (e) {
      console.log(`⚠ Product ${product_id} (position ${position}) not found`);
      notFound++;
    }
  }
});

console.log(`\n✅ Done! Updated ${updated} images, ${notFound} not found.`);

// Show current images
console.log('\nCurrent product images:');
const images = db.prepare('SELECT product_id, url, is_primary FROM product_images ORDER BY product_id, position').all();
images.forEach(img => {
  console.log(`  Product ${img.product_id}: ${img.url} ${img.is_primary ? '(primary)' : ''}`);
});


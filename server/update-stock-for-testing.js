#!/usr/bin/env node

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database/shopflow.db');
const db = new Database(dbPath);

console.log('Updating product stock levels for testing...');

// Update product 1 to be out of stock
const updateOutOfStock = db.prepare(`
  UPDATE products
  SET stock_quantity = 0
  WHERE id = 1
`);
const result1 = updateOutOfStock.run();
console.log(`Updated product 1 to out of stock: ${result1.changes} rows changed`);

// Update product 2 to have low stock (5 units, threshold is 10)
const updateLowStock = db.prepare(`
  UPDATE products
  SET stock_quantity = 5
  WHERE id = 2
`);
const result2 = updateLowStock.run();
console.log(`Updated product 2 to low stock: ${result2.changes} rows changed`);

// Keep product 3 with high stock (100 units)
const updateHighStock = db.prepare(`
  UPDATE products
  SET stock_quantity = 100
  WHERE id = 3
`);
const result3 = updateHighStock.run();
console.log(`Updated product 3 to high stock: ${result3.changes} rows changed`);

// Verify the changes
const verifyStock = db.prepare(`
  SELECT id, name, stock_quantity, low_stock_threshold
  FROM products
  WHERE id IN (1, 2, 3)
`);
const products = verifyStock.all();

console.log('\nStock levels after update:');
products.forEach(product => {
  const status = product.stock_quantity === 0 ? 'OUT OF STOCK' :
                 product.stock_quantity < product.low_stock_threshold ? 'LOW STOCK' :
                 'IN STOCK';
  console.log(`  ${product.name}: ${product.stock_quantity} units (${status})`);
});

db.close();
console.log('\nStock update completed successfully!');
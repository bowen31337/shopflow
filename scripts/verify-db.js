const sqlite3 = require('./server/node_modules/better-sqlite3');

try {
  const db = sqlite3('./server/database/shopflow.db');
  console.log('✅ Database connection successful');

  const productsCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  const categoriesCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
  const brandsCount = db.prepare('SELECT COUNT(*) as count FROM brands').get().count;
  const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;

  console.log('📊 Database Contents:');
  console.log(`   Products: ${productsCount}`);
  console.log(`   Categories: ${categoriesCount}`);
  console.log(`   Brands: ${brandsCount}`);
  console.log(`   Users: ${usersCount}`);

  if (productsCount > 0) {
    const sampleProducts = db.prepare('SELECT id, name, price FROM products LIMIT 3').all();
    console.log('\n📦 Sample Products:');
    sampleProducts.forEach(p => {
      console.log(`   - ${p.name} ($${p.price})`);
    });
  }

  db.close();
} catch (error) {
  console.error('❌ Database error:', error.message);
}
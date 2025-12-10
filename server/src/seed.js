import db from './database.js';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  try {
    // Check if already seeded
    const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
    if (categoryCount.count > 0) {
      console.log('✓ Database already seeded, skipping...');
      return;
    }

    console.log('Seeding database...');

    // Seed Categories
    const categories = [
      { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and accessories', parent_id: null },
      { name: 'Laptops', slug: 'laptops', description: 'Laptop computers', parent_id: 1 },
      { name: 'Smartphones', slug: 'smartphones', description: 'Mobile phones', parent_id: 1 },
      { name: 'Clothing', slug: 'clothing', description: 'Fashion and apparel', parent_id: null },
      { name: "Men's Clothing", slug: 'mens-clothing', description: 'Clothing for men', parent_id: 4 },
      { name: "Women's Clothing", slug: 'womens-clothing', description: 'Clothing for women', parent_id: 4 },
      { name: 'Home & Garden', slug: 'home-garden', description: 'Home and garden products', parent_id: null },
      { name: 'Sports & Outdoors', slug: 'sports-outdoors', description: 'Sports equipment and outdoor gear', parent_id: null },
    ];

    const insertCategory = db.prepare('INSERT INTO categories (name, slug, description, parent_id, position) VALUES (?, ?, ?, ?, ?)');
    categories.forEach((cat, idx) => {
      insertCategory.run(cat.name, cat.slug, cat.description, cat.parent_id, idx);
    });
    console.log('✓ Categories seeded');

    // Seed Brands
    const brands = [
      { name: 'TechPro', slug: 'techpro', description: 'Premium electronics brand' },
      { name: 'StyleMax', slug: 'stylemax', description: 'Fashion and style' },
      { name: 'HomeComfort', slug: 'homecomfort', description: 'Home essentials' },
      { name: 'SportFlex', slug: 'sportflex', description: 'Sports equipment' },
      { name: 'EcoLife', slug: 'ecolife', description: 'Sustainable products' },
    ];

    const insertBrand = db.prepare('INSERT INTO brands (name, slug, description) VALUES (?, ?, ?)');
    brands.forEach(brand => {
      insertBrand.run(brand.name, brand.slug, brand.description);
    });
    console.log('✓ Brands seeded');

    // Seed Products
    const products = [
      {
        category_id: 2,
        brand_id: 1,
        name: 'TechPro Laptop Pro 15',
        slug: 'techpro-laptop-pro-15',
        description: 'High-performance laptop with 15-inch display, perfect for work and entertainment',
        price: 1299.99,
        compare_at_price: 1499.99,
        sku: 'TECH-LAP-001',
        stock_quantity: 25,
        is_featured: 1
      },
      {
        category_id: 3,
        brand_id: 1,
        name: 'TechPro Smartphone X1',
        slug: 'techpro-smartphone-x1',
        description: 'Latest smartphone with advanced camera and long battery life',
        price: 899.99,
        compare_at_price: 999.99,
        sku: 'TECH-PHN-001',
        stock_quantity: 50,
        is_featured: 1
      },
      {
        category_id: 5,
        brand_id: 2,
        name: 'StyleMax Cotton T-Shirt',
        slug: 'stylemax-cotton-tshirt',
        description: 'Comfortable cotton t-shirt in various colors',
        price: 29.99,
        compare_at_price: null,
        sku: 'STY-TSH-001',
        stock_quantity: 100
      },
      {
        category_id: 5,
        brand_id: 2,
        name: 'StyleMax Denim Jeans',
        slug: 'stylemax-denim-jeans',
        description: 'Classic denim jeans with modern fit',
        price: 79.99,
        compare_at_price: 99.99,
        sku: 'STY-JEN-001',
        stock_quantity: 60
      },
      {
        category_id: 6,
        brand_id: 2,
        name: 'StyleMax Summer Dress',
        slug: 'stylemax-summer-dress',
        description: 'Light and breezy summer dress',
        price: 59.99,
        compare_at_price: null,
        sku: 'STY-DRS-001',
        stock_quantity: 40
      },
      {
        category_id: 7,
        brand_id: 3,
        name: 'HomeComfort Throw Pillow Set',
        slug: 'homecomfort-throw-pillow-set',
        description: 'Set of 2 decorative throw pillows',
        price: 39.99,
        compare_at_price: 49.99,
        sku: 'HOM-PIL-001',
        stock_quantity: 75
      },
      {
        category_id: 8,
        brand_id: 4,
        name: 'SportFlex Yoga Mat',
        slug: 'sportflex-yoga-mat',
        description: 'Non-slip yoga mat with carrying strap',
        price: 34.99,
        compare_at_price: null,
        sku: 'SPT-YOG-001',
        stock_quantity: 80,
        is_featured: 1
      },
      {
        category_id: 8,
        brand_id: 4,
        name: 'SportFlex Running Shoes',
        slug: 'sportflex-running-shoes',
        description: 'Lightweight running shoes with excellent cushioning',
        price: 119.99,
        compare_at_price: 149.99,
        sku: 'SPT-SHO-001',
        stock_quantity: 45
      },
      {
        category_id: 2,
        brand_id: 1,
        name: 'TechPro Wireless Mouse',
        slug: 'techpro-wireless-mouse',
        description: 'Ergonomic wireless mouse with precision tracking',
        price: 24.99,
        compare_at_price: null,
        sku: 'TECH-MOU-001',
        stock_quantity: 150
      },
      {
        category_id: 2,
        brand_id: 1,
        name: 'TechPro Bluetooth Headphones',
        slug: 'techpro-bluetooth-headphones',
        description: 'Noise-cancelling wireless headphones',
        price: 179.99,
        compare_at_price: 219.99,
        sku: 'TECH-HDP-001',
        stock_quantity: 35,
        is_featured: 1
      },
      {
        category_id: 7,
        brand_id: 5,
        name: 'EcoLife Bamboo Cutting Board',
        slug: 'ecolife-bamboo-cutting-board',
        description: 'Sustainable bamboo cutting board',
        price: 29.99,
        compare_at_price: null,
        sku: 'ECO-CUT-001',
        stock_quantity: 90
      },
      {
        category_id: 7,
        brand_id: 5,
        name: 'EcoLife Reusable Water Bottle',
        slug: 'ecolife-reusable-water-bottle',
        description: 'Stainless steel insulated water bottle',
        price: 24.99,
        compare_at_price: 29.99,
        sku: 'ECO-BTL-001',
        stock_quantity: 120
      }
    ];

    const insertProduct = db.prepare(`
      INSERT INTO products (category_id, brand_id, name, slug, description, price, compare_at_price, sku, stock_quantity, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    products.forEach(product => {
      insertProduct.run(
        product.category_id,
        product.brand_id,
        product.name,
        product.slug,
        product.description,
        product.price,
        product.compare_at_price,
        product.sku,
        product.stock_quantity,
        product.is_featured || 0
      );
    });
    console.log('✓ Products seeded');

    // Seed Product Images (placeholder URLs)
    const productImages = [
      { product_id: 1, url: '/images/laptop-1.jpg', is_primary: 1, position: 0 },
      { product_id: 1, url: '/images/laptop-2.jpg', is_primary: 0, position: 1 },
      { product_id: 2, url: '/images/smartphone-1.jpg', is_primary: 1, position: 0 },
      { product_id: 2, url: '/images/smartphone-2.jpg', is_primary: 0, position: 1 },
      { product_id: 3, url: '/images/tshirt-1.jpg', is_primary: 1, position: 0 },
      { product_id: 4, url: '/images/jeans-1.jpg', is_primary: 1, position: 0 },
      { product_id: 5, url: '/images/dress-1.jpg', is_primary: 1, position: 0 },
      { product_id: 6, url: '/images/pillow-1.jpg', is_primary: 1, position: 0 },
      { product_id: 7, url: '/images/yogamat-1.jpg', is_primary: 1, position: 0 },
      { product_id: 8, url: '/images/shoes-1.jpg', is_primary: 1, position: 0 },
      { product_id: 9, url: '/images/mouse-1.jpg', is_primary: 1, position: 0 },
      { product_id: 10, url: '/images/headphones-1.jpg', is_primary: 1, position: 0 },
      { product_id: 11, url: '/images/cuttingboard-1.jpg', is_primary: 1, position: 0 },
      { product_id: 12, url: '/images/bottle-1.jpg', is_primary: 1, position: 0 },
    ];

    const insertImage = db.prepare('INSERT INTO product_images (product_id, url, is_primary, position) VALUES (?, ?, ?, ?)');
    productImages.forEach(img => {
      insertImage.run(img.product_id, img.url, img.is_primary, img.position);
    });
    console.log('✓ Product images seeded');

    // Seed Product Variants
    const variants = [
      // T-shirt sizes
      { product_id: 3, name: 'Size', value: 'S', stock_quantity: 30 },
      { product_id: 3, name: 'Size', value: 'M', stock_quantity: 40 },
      { product_id: 3, name: 'Size', value: 'L', stock_quantity: 30 },
      // Jeans sizes
      { product_id: 4, name: 'Size', value: '30', stock_quantity: 15 },
      { product_id: 4, name: 'Size', value: '32', stock_quantity: 20 },
      { product_id: 4, name: 'Size', value: '34', stock_quantity: 15 },
      { product_id: 4, name: 'Size', value: '36', stock_quantity: 10 },
      // Running shoes sizes
      { product_id: 8, name: 'Size', value: '8', stock_quantity: 10 },
      { product_id: 8, name: 'Size', value: '9', stock_quantity: 15 },
      { product_id: 8, name: 'Size', value: '10', stock_quantity: 12 },
      { product_id: 8, name: 'Size', value: '11', stock_quantity: 8 },
    ];

    const insertVariant = db.prepare('INSERT INTO product_variants (product_id, name, value, stock_quantity) VALUES (?, ?, ?, ?)');
    variants.forEach(variant => {
      insertVariant.run(variant.product_id, variant.name, variant.value, variant.stock_quantity);
    });
    console.log('✓ Product variants seeded');

    // Seed Admin User
    const adminPassword = await bcrypt.hash('admin123', 10);
    const insertUser = db.prepare(`
      INSERT INTO users (email, password_hash, name, role, email_verified)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertUser.run('admin@shopflow.com', adminPassword, 'Admin User', 'admin', 1);
    console.log('✓ Admin user seeded (email: admin@shopflow.com, password: admin123)');

    // Seed Test Customer
    const customerPassword = await bcrypt.hash('customer123', 10);
    insertUser.run('customer@example.com', customerPassword, 'Test Customer', 'customer', 1);
    console.log('✓ Test customer seeded (email: customer@example.com, password: customer123)');

    // Seed Promo Codes
    const promoCodes = [
      { code: 'WELCOME10', type: 'percentage', value: 10, min_order_amount: 50, max_uses: 100 },
      { code: 'SAVE20', type: 'percentage', value: 20, min_order_amount: 100, max_uses: 50 },
      { code: 'FREESHIP', type: 'fixed', value: 10, min_order_amount: 75, max_uses: 200 },
    ];

    const insertPromo = db.prepare(`
      INSERT INTO promo_codes (code, type, value, min_order_amount, max_uses)
      VALUES (?, ?, ?, ?, ?)
    `);
    promoCodes.forEach(promo => {
      insertPromo.run(promo.code, promo.type, promo.value, promo.min_order_amount, promo.max_uses);
    });
    console.log('✓ Promo codes seeded');

    console.log('✓ Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

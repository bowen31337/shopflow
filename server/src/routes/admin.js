import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import db from '../database.js';

const router = express.Router();

// Middleware to ensure only admins can access these routes
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/metrics - Get dashboard metrics
router.get('/metrics', async (req, res) => {
  try {
    const totalRevenueResult = await db.get(`
      SELECT COALESCE(SUM(total), 0) as total
      FROM orders
      WHERE status != 'cancelled'
    `);
    const totalRevenue = totalRevenueResult?.total || 0;

    const totalOrdersResult = await db.get(`
      SELECT COUNT(*) as count FROM orders WHERE status != 'cancelled'
    `);
    const totalOrders = totalOrdersResult?.count || 0;

    const totalCustomersResult = await db.get(`
      SELECT COUNT(DISTINCT user_id) as count FROM orders WHERE status != 'cancelled'
    `);
    const totalCustomers = totalCustomersResult?.count || 0;

    const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

    const recentOrders = await db.all(`
      SELECT id, order_number, total, status, created_at
      FROM orders
      WHERE status != 'cancelled' AND created_at >= datetime('now', '-7 days')
      ORDER BY created_at DESC
      LIMIT 5
    `);

    res.json({ totalRevenue, totalOrders, totalCustomers, avgOrderValue, recentOrders });
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
});

// GET /api/admin/products - Get all products with pagination
router.get('/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';

    let whereClause = '';
    let params = [];

    if (search) {
      whereClause += 'WHERE p.name LIKE ? OR p.description LIKE ? ';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      whereClause += (whereClause ? 'AND ' : 'WHERE ') + 'p.category_id = ? ';
      params.push(category);
    }

    const products = await db.all(`
      SELECT p.id, p.name, p.description, p.price, p.compare_at_price, p.sku,
        p.stock_quantity, p.is_active, p.is_featured, c.name as category_name, b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, ...params, limit, offset);

    const totalCountResult = await db.get(`
      SELECT COUNT(*) as count FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      ${whereClause}
    `, ...params);

    res.json({
      products,
      pagination: {
        page,
        limit,
        totalCount: totalCountResult?.count || 0,
        totalPages: Math.ceil((totalCountResult?.count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/admin/products/:id
router.get('/products/:id', async (req, res) => {
  try {
    const product = await db.get(`
      SELECT p.*, c.name as category_name, b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.id = ?
    `, req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST /api/admin/products
router.post('/products', async (req, res) => {
  try {
    const { name, description, price, compare_at_price, sku, barcode, stock_quantity, category_id, brand_id, is_active, is_featured } = req.body;

    if (!name || !price || !sku) {
      return res.status(400).json({ error: 'Name, price, and SKU are required' });
    }

    const existingProduct = await db.get('SELECT id FROM products WHERE sku = ?', sku);
    if (existingProduct) {
      return res.status(400).json({ error: 'SKU already exists' });
    }

    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let counter = 1;
    while (await db.get('SELECT id FROM products WHERE slug = ?', slug)) {
      slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${counter}`;
      counter++;
    }

    const result = await db.run(`
      INSERT INTO products (name, slug, description, price, compare_at_price, sku, barcode, stock_quantity, category_id, brand_id, is_active, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, name, slug, description, price, compare_at_price, sku, barcode, stock_quantity, category_id, brand_id, is_active, is_featured);

    res.status(201).json({ message: 'Product created successfully', productId: result.lastInsertRowid });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/admin/products/:id
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, compare_at_price, sku, barcode, stock_quantity, category_id, brand_id, is_active, is_featured } = req.body;

    const existingProduct = await db.get('SELECT id FROM products WHERE id = ?', id);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (sku) {
      const skuExists = await db.get('SELECT id FROM products WHERE sku = ? AND id != ?', sku, id);
      if (skuExists) {
        return res.status(400).json({ error: 'SKU already exists' });
      }
    }

    await db.run(`
      UPDATE products SET
        name = COALESCE(?, name), description = COALESCE(?, description), price = COALESCE(?, price),
        compare_at_price = COALESCE(?, compare_at_price), sku = COALESCE(?, sku), barcode = COALESCE(?, barcode),
        stock_quantity = COALESCE(?, stock_quantity), category_id = COALESCE(?, category_id), brand_id = COALESCE(?, brand_id),
        is_active = COALESCE(?, is_active), is_featured = COALESCE(?, is_featured), updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, name, description, price, compare_at_price, sku, barcode, stock_quantity, category_id, brand_id, is_active, is_featured, id);

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existingProduct = await db.get('SELECT id FROM products WHERE id = ?', id);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await db.run('DELETE FROM product_images WHERE product_id = ?', id);
    await db.run('DELETE FROM order_items WHERE product_id = ?', id);
    await db.run('DELETE FROM cart_items WHERE product_id = ?', id);
    await db.run('DELETE FROM wishlist WHERE product_id = ?', id);
    await db.run('DELETE FROM products WHERE id = ?', id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// GET /api/admin/orders
router.get('/orders', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status || '';

    let whereClause = '';
    let params = [];

    if (status) {
      whereClause = 'WHERE status = ? ';
      params.push(status);
    }

    const orders = await db.all(`
      SELECT id, order_number, user_id, status, subtotal, shipping_cost, tax, discount, total,
        payment_method, payment_status, shipping_method, tracking_number, created_at, updated_at
      FROM orders ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, ...params, limit, offset);

    const totalCountResult = await db.get(`SELECT COUNT(*) as count FROM orders ${whereClause}`, ...params);

    res.json({
      orders,
      pagination: {
        page,
        limit,
        totalCount: totalCountResult?.count || 0,
        totalPages: Math.ceil((totalCountResult?.count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// PUT /api/admin/orders/:id
router.put('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, tracking_number } = req.body;

    const existingOrder = await db.get('SELECT id, status FROM orders WHERE id = ?', id);
    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    await db.run(`
      UPDATE orders SET status = COALESCE(?, status), tracking_number = COALESCE(?, tracking_number), updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, status, tracking_number, id);

    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// GET /api/admin/customers
router.get('/customers', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let whereClause = 'WHERE role = ? ';
    let params = ['customer'];

    if (search) {
      whereClause += 'AND (name LIKE ? OR email LIKE ?) ';
      params.push(`%${search}%`, `%${search}%`);
    }

    const customers = await db.all(`
      SELECT id, name, email, phone, avatar_url, email_verified, created_at
      FROM users ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, ...params, limit, offset);

    const totalCountResult = await db.get(`SELECT COUNT(*) as count FROM users ${whereClause}`, ...params);

    // Get order count for each customer
    for (const customer of customers) {
      const orderCountResult = await db.get(`
        SELECT COUNT(*) as count FROM orders WHERE user_id = ? AND status != 'cancelled'
      `, customer.id);
      customer.orderCount = orderCountResult?.count || 0;
    }

    res.json({
      customers,
      pagination: {
        page,
        limit,
        totalCount: totalCountResult?.count || 0,
        totalPages: Math.ceil((totalCountResult?.count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// GET /api/admin/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await db.all(`
      SELECT id, parent_id, name, slug, description, image_url, position, is_active
      FROM categories
      ORDER BY parent_id, position, name
    `);
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/admin/categories
router.post('/categories', async (req, res) => {
  try {
    const { name, parent_id, description, position } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const result = await db.run(`
      INSERT INTO categories (name, slug, parent_id, description, position)
      VALUES (?, ?, ?, ?, ?)
    `, name, slug, parent_id || null, description || null, position || 0);

    res.status(201).json({ message: 'Category created successfully', categoryId: result.lastInsertRowid });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// GET /api/admin/inventory
router.get('/inventory', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const inventory = await db.all(`
      SELECT p.id, p.name, p.sku, p.stock_quantity, p.low_stock_threshold, p.is_active,
        c.name as category_name, b.name as brand_name, p.price,
        CASE
          WHEN p.stock_quantity = 0 THEN 'out_of_stock'
          WHEN p.stock_quantity <= p.low_stock_threshold THEN 'low_stock'
          ELSE 'in_stock'
        END as stock_status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      ORDER BY p.stock_quantity ASC
      LIMIT ? OFFSET ?
    `, limit, offset);

    const totalCountResult = await db.get('SELECT COUNT(*) as count FROM products');

    const summary = await db.get(`
      SELECT
        COUNT(*) as total_products,
        SUM(CASE WHEN stock_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock_count,
        SUM(CASE WHEN stock_quantity <= low_stock_threshold AND stock_quantity > 0 THEN 1 ELSE 0 END) as low_stock_count,
        SUM(CASE WHEN stock_quantity > low_stock_threshold THEN 1 ELSE 0 END) as in_stock_count
      FROM products
    `);

    res.json({
      inventory,
      pagination: {
        page,
        limit,
        totalCount: totalCountResult?.count || 0,
        totalPages: Math.ceil((totalCountResult?.count || 0) / limit)
      },
      summary
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory data' });
  }
});

// PUT /api/admin/inventory/:id
router.put('/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { stock_quantity, low_stock_threshold } = req.body;

    const existingProduct = await db.get('SELECT id FROM products WHERE id = ?', id);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await db.run(`
      UPDATE products
      SET stock_quantity = COALESCE(?, stock_quantity),
          low_stock_threshold = COALESCE(?, low_stock_threshold),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, stock_quantity, low_stock_threshold, id);

    res.json({ message: 'Stock updated successfully' });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// GET /api/admin/promo-codes
router.get('/promo-codes', async (req, res) => {
  try {
    const promoCodes = await db.all(`
      SELECT id, code, type, value, min_order_amount, max_uses, current_uses, start_date, end_date, is_active
      FROM promo_codes
    `);
    res.json({ promoCodes });
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    res.status(500).json({ error: 'Failed to fetch promo codes' });
  }
});

// POST /api/admin/promo-codes
router.post('/promo-codes', async (req, res) => {
  try {
    const { code, type, value, min_order_amount, max_uses, start_date, end_date } = req.body;

    if (!code || !type || !value) {
      return res.status(400).json({ error: 'Code, type, and value are required' });
    }

    const existingCode = await db.get('SELECT id FROM promo_codes WHERE code = ?', code);
    if (existingCode) {
      return res.status(400).json({ error: 'Promo code already exists' });
    }

    const result = await db.run(`
      INSERT INTO promo_codes (code, type, value, min_order_amount, max_uses, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, code, type, value, min_order_amount, max_uses, start_date, end_date);

    res.status(201).json({ message: 'Promo code created successfully', promoCodeId: result.lastInsertRowid });
  } catch (error) {
    console.error('Error creating promo code:', error);
    res.status(500).json({ error: 'Failed to create promo code' });
  }
});

// GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
  try {
    const { period } = req.query;
    const days = period === 'day' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : 365;
    const whereClause = `WHERE status != 'cancelled' AND created_at >= datetime('now', '-${days} days')`;

    const revenueByDay = await db.all(`
      SELECT DATE(created_at) as date, SUM(total) as revenue, COUNT(*) as orders
      FROM orders ${whereClause}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    const salesByCategory = await db.all(`
      SELECT c.name as category, SUM(oi.quantity) as units_sold, SUM(oi.total_price) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN orders o ON oi.order_id = o.id
      ${whereClause}
      GROUP BY c.name
      ORDER BY revenue DESC
      LIMIT 10
    `);

    const topProducts = await db.all(`
      SELECT p.name as product, SUM(oi.quantity) as units_sold, SUM(oi.total_price) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      ${whereClause}
      GROUP BY p.id
      ORDER BY units_sold DESC
      LIMIT 10
    `);

    const totalsResult = await db.get(`
      SELECT COALESCE(SUM(total), 0) as revenue, COUNT(*) as count
      FROM orders ${whereClause}
    `);

    res.json({
      period: period || 'week',
      revenueByDay,
      salesByCategory,
      topProducts,
      totals: {
        totalRevenue: totalsResult?.revenue || 0,
        totalOrders: totalsResult?.count || 0,
        avgOrderValue: totalsResult?.count > 0 ? (totalsResult.revenue / totalsResult.count) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

export default router;

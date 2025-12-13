import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import db from '../database.js';

const router = express.Router();

// Middleware to ensure only admins can access these routes
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/metrics - Get dashboard metrics
router.get('/metrics', (req, res) => {
  try {
    // Get total revenue
    const totalRevenue = db.prepare(`
      SELECT COALESCE(SUM(total), 0) as total
      FROM orders
      WHERE status != 'cancelled'
    `).get().total;

    // Get total orders
    const totalOrders = db.prepare(`
      SELECT COUNT(*) as count
      FROM orders
      WHERE status != 'cancelled'
    `).get().count;

    // Get total customers
    const totalCustomers = db.prepare(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM orders
      WHERE status != 'cancelled'
    `).get().count;

    // Get average order value
    const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

    // Get recent orders (last 7 days)
    const recentOrders = db.prepare(`
      SELECT
        id,
        order_number,
        total,
        status,
        created_at
      FROM orders
      WHERE status != 'cancelled'
      AND created_at >= datetime('now', '-7 days')
      ORDER BY created_at DESC
      LIMIT 5
    `).all();

    res.json({
      totalRevenue,
      totalOrders,
      totalCustomers,
      avgOrderValue,
      recentOrders
    });
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch dashboard metrics'
    });
  }
});

// GET /api/admin/products - Get all products with pagination
router.get('/products', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';

    // Build search query
    let whereClause = '';
    let params = [];

    if (search) {
      whereClause += 'WHERE p.name LIKE ? OR p.description LIKE ? ';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      if (whereClause) {
        whereClause += 'AND ';
      } else {
        whereClause = 'WHERE ';
      }
      whereClause += 'p.category_id = ? ';
      params.push(category);
    }

    // Get products with pagination
    const products = db.prepare(`
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.compare_at_price,
        p.sku,
        p.stock_quantity,
        p.is_active,
        p.is_featured,
        c.name as category_name,
        b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    // Get total count
    const totalCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      ${whereClause}
    `).get(...params).count;

    res.json({
      products,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch products'
    });
  }
});

// POST /api/admin/products - Create new product
router.post('/products', (req, res) => {
  try {
    const { name, description, price, compare_at_price, sku, barcode, stock_quantity, category_id, brand_id, is_active, is_featured } = req.body;

    // Validate required fields
    if (!name || !price || !sku) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Name, price, and SKU are required'
      });
    }

    // Check if SKU already exists
    const existingProduct = db.prepare('SELECT id FROM products WHERE sku = ?').get(sku);
    if (existingProduct) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'SKU already exists'
      });
    }

    // Insert product
    const result = db.prepare(`
      INSERT INTO products (
        name, description, price, compare_at_price, sku, barcode, stock_quantity,
        category_id, brand_id, is_active, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, description, price, compare_at_price, sku, barcode, stock_quantity, category_id, brand_id, is_active, is_featured);

    res.status(201).json({
      message: 'Product created successfully',
      productId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create product'
    });
  }
});

// PUT /api/admin/products/:id - Update product
router.put('/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, compare_at_price, sku, barcode, stock_quantity, category_id, brand_id, is_active, is_featured } = req.body;

    // Check if product exists
    const existingProduct = db.prepare('SELECT id FROM products WHERE id = ?').get(id);
    if (!existingProduct) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Product not found'
      });
    }

    // Check if SKU already exists (excluding current product)
    if (sku) {
      const skuExists = db.prepare('SELECT id FROM products WHERE sku = ? AND id != ?').get(sku, id);
      if (skuExists) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'SKU already exists'
        });
      }
    }

    // Update product
    db.prepare(`
      UPDATE products SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        compare_at_price = COALESCE(?, compare_at_price),
        sku = COALESCE(?, sku),
        barcode = COALESCE(?, barcode),
        stock_quantity = COALESCE(?, stock_quantity),
        category_id = COALESCE(?, category_id),
        brand_id = COALESCE(?, brand_id),
        is_active = COALESCE(?, is_active),
        is_featured = COALESCE(?, is_featured),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, description, price, compare_at_price, sku, barcode, stock_quantity, category_id, brand_id, is_active, is_featured, id);

    res.json({
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update product'
    });
  }
});

// DELETE /api/admin/products/:id - Delete product
router.delete('/products/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existingProduct = db.prepare('SELECT id FROM products WHERE id = ?').get(id);
    if (!existingProduct) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Product not found'
      });
    }

    // Delete related data first
    db.prepare('DELETE FROM product_images WHERE product_id = ?').run(id);
    db.prepare('DELETE FROM order_items WHERE product_id = ?').run(id);
    db.prepare('DELETE FROM cart_items WHERE product_id = ?').run(id);
    db.prepare('DELETE FROM wishlist WHERE product_id = ?').run(id);

    // Delete product
    db.prepare('DELETE FROM products WHERE id = ?').run(id);

    res.json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete product'
    });
  }
});

// GET /api/admin/orders - Get all orders with pagination
router.get('/orders', (req, res) => {
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

    // Get orders with pagination
    const orders = db.prepare(`
      SELECT
        id,
        order_number,
        user_id,
        status,
        subtotal,
        shipping_cost,
        tax,
        discount,
        total,
        payment_method,
        payment_status,
        shipping_method,
        tracking_number,
        created_at,
        updated_at
      FROM orders
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    // Get total count
    const totalCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM orders
      ${whereClause}
    `).get(...params).count;

    res.json({
      orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch orders'
    });
  }
});

// PUT /api/admin/orders/:id - Update order status
router.put('/orders/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status, tracking_number } = req.body;

    // Check if order exists
    const existingOrder = db.prepare('SELECT id, status FROM orders WHERE id = ?').get(id);
    if (!existingOrder) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Order not found'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid order status'
      });
    }

    // Update order
    db.prepare(`
      UPDATE orders SET
        status = COALESCE(?, status),
        tracking_number = COALESCE(?, tracking_number),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, tracking_number, id);

    res.json({
      message: 'Order updated successfully'
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update order'
    });
  }
});

// GET /api/admin/customers - Get all customers with pagination
router.get('/customers', (req, res) => {
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

    // Get customers with pagination
    const customers = db.prepare(`
      SELECT
        id,
        name,
        email,
        phone,
        avatar_url,
        email_verified,
        created_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    // Get total count
    const totalCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM users
      ${whereClause}
    `).get(...params).count;

    // Get order count for each customer
    customers.forEach(customer => {
      const orderCount = db.prepare(`
        SELECT COUNT(*) as count
        FROM orders
        WHERE user_id = ? AND status != 'cancelled'
      `).get(customer.id).count;
      customer.orderCount = orderCount;
    });

    res.json({
      customers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch customers'
    });
  }
});

// GET /api/admin/categories - Get all categories
router.get('/categories', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT
        id,
        parent_id,
        name,
        slug,
        description,
        image_url,
        position,
        is_active
      FROM categories
      ORDER BY parent_id, position, name
    `).all();

    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch categories'
    });
  }
});

// POST /api/admin/categories - Create new category
router.post('/categories', (req, res) => {
  try {
    const { name, parent_id, description, position } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Name is required'
      });
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Insert category
    const result = db.prepare(`
      INSERT INTO categories (name, slug, parent_id, description, position)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, slug, parent_id || null, description || null, position || 0);

    res.status(201).json({
      message: 'Category created successfully',
      categoryId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create category'
    });
  }
});

// PUT /api/admin/categories/:id - Update category
router.put('/categories/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, parent_id, description, position, is_active } = req.body;

    // Check if category exists
    const existingCategory = db.prepare('SELECT id FROM categories WHERE id = ?').get(id);
    if (!existingCategory) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Category not found'
      });
    }

    // Generate slug from name if provided
    let slug = null;
    if (name) {
      slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    // Update category
    db.prepare(`
      UPDATE categories SET
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        parent_id = COALESCE(?, parent_id),
        description = COALESCE(?, description),
        position = COALESCE(?, position),
        is_active = COALESCE(?, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, slug, parent_id, description, position, is_active, id);

    res.json({
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update category'
    });
  }
});

// DELETE /api/admin/categories/:id - Delete category
router.delete('/categories/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const existingCategory = db.prepare('SELECT id FROM categories WHERE id = ?').get(id);
    if (!existingCategory) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Category not found'
      });
    }

    // Check if category has children or products
    const childCount = db.prepare('SELECT COUNT(*) as count FROM categories WHERE parent_id = ?').get(id).count;
    const productCount = db.prepare('SELECT COUNT(*) as count FROM products WHERE category_id = ?').get(id).count;

    if (childCount > 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Cannot delete category with subcategories'
      });
    }

    if (productCount > 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Cannot delete category with products'
      });
    }

    // Delete category
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);

    res.json({
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete category'
    });
  }
});

// INVENTORY TRACKING ROUTES

// GET /api/admin/inventory - Get inventory tracking data
router.get('/inventory', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const lowStockOnly = req.query.lowStockOnly === 'true';
    const outOfStockOnly = req.query.outOfStockOnly === 'true';

    // Build filters
    let whereClause = '';
    let params = [];
    let filterConditions = [];

    if (search) {
      filterConditions.push('(p.name LIKE ? OR p.sku LIKE ? OR b.name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (lowStockOnly) {
      filterConditions.push('p.stock_quantity <= p.low_stock_threshold AND p.stock_quantity > 0');
    }

    if (outOfStockOnly) {
      filterConditions.push('p.stock_quantity = 0');
    }

    if (filterConditions.length > 0) {
      whereClause = 'WHERE ' + filterConditions.join(' AND ');
    }

    // Get inventory data with pagination
    const inventory = db.prepare(`
      SELECT
        p.id,
        p.name,
        p.sku,
        p.stock_quantity,
        p.low_stock_threshold,
        p.is_active,
        c.name as category_name,
        b.name as brand_name,
        p.price,
        CASE
          WHEN p.stock_quantity = 0 THEN 'out_of_stock'
          WHEN p.stock_quantity <= p.low_stock_threshold THEN 'low_stock'
          ELSE 'in_stock'
        END as stock_status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      ${whereClause}
      ORDER BY
        CASE
          WHEN p.stock_quantity = 0 THEN 1
          WHEN p.stock_quantity <= p.low_stock_threshold THEN 2
          ELSE 3
        END,
        p.stock_quantity ASC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    // Get total count
    const totalCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      ${whereClause}
    `).get(...params).count;

    // Get summary stats
    const summary = db.prepare(`
      SELECT
        COUNT(*) as total_products,
        SUM(CASE WHEN stock_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock_count,
        SUM(CASE WHEN stock_quantity <= low_stock_threshold AND stock_quantity > 0 THEN 1 ELSE 0 END) as low_stock_count,
        SUM(CASE WHEN stock_quantity > low_stock_threshold THEN 1 ELSE 0 END) as in_stock_count
      FROM products
    `).get();

    res.json({
      inventory,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      summary
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch inventory data'
    });
  }
});

// GET /api/admin/inventory/:id - Get specific product inventory details
router.get('/inventory/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Get product details
    const product = db.prepare(`
      SELECT
        p.id,
        p.name,
        p.description,
        p.sku,
        p.stock_quantity,
        p.low_stock_threshold,
        p.is_active,
        p.created_at,
        p.updated_at,
        c.name as category_name,
        b.name as brand_name,
        p.price
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.id = ?
    `).get(id);

    if (!product) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Product not found'
      });
    }

    // Get recent orders for this product
    const recentOrders = db.prepare(`
      SELECT
        o.order_number,
        o.total,
        oi.quantity,
        o.status,
        o.created_at
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.product_id = ? AND o.status != 'cancelled'
      ORDER BY o.created_at DESC
      LIMIT 10
    `).all(id);

    // Get stock movement history (simplified - would need additional table for full tracking)
    const stockHistory = db.prepare(`
      SELECT
        'Order' as type,
        oi.quantity as change,
        oi.unit_price as price,
        o.order_number as reference,
        o.created_at as date
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.product_id = ? AND o.status != 'cancelled'
      UNION ALL
      SELECT
        'Stock Update' as type,
        p.stock_quantity as change,
        p.price as price,
        'Manual Update' as reference,
        p.updated_at as date
      FROM products p
      WHERE p.id = ?
      ORDER BY date DESC
      LIMIT 20
    `).all(id, id);

    res.json({
      product,
      recentOrders,
      stockHistory
    });
  } catch (error) {
    console.error('Error fetching product inventory:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch product inventory details'
    });
  }
});

// PUT /api/admin/inventory/:id - Update product stock
router.put('/inventory/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { stock_quantity, low_stock_threshold } = req.body;

    // Check if product exists
    const existingProduct = db.prepare('SELECT id FROM products WHERE id = ?').get(id);
    if (!existingProduct) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Product not found'
      });
    }

    // Update stock
    db.prepare(`
      UPDATE products
      SET stock_quantity = COALESCE(?, stock_quantity),
          low_stock_threshold = COALESCE(?, low_stock_threshold),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(stock_quantity, low_stock_threshold, id);

    res.json({
      message: 'Stock updated successfully'
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update stock'
    });
  }
});

// GET /api/admin/promo-codes - Get all promo codes
router.get('/promo-codes', (req, res) => {
  try {
    const promoCodes = db.prepare(`
      SELECT
        id,
        code,
        type,
        value,
        min_order_amount,
        max_uses,
        current_uses,
        start_date,
        end_date,
        is_active
      FROM promo_codes
    `).all();

    res.json({ promoCodes });
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch promo codes'
    });
  }
});

// POST /api/admin/promo-codes - Create new promo code
router.post('/promo-codes', (req, res) => {
  try {
    const { code, type, value, min_order_amount, max_uses, start_date, end_date } = req.body;

    // Validate required fields
    if (!code || !type || !value) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Code, type, and value are required'
      });
    }

    // Check if code already exists
    const existingCode = db.prepare('SELECT id FROM promo_codes WHERE code = ?').get(code);
    if (existingCode) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Promo code already exists'
      });
    }

    // Insert promo code
    const result = db.prepare(`
      INSERT INTO promo_codes (
        code, type, value, min_order_amount, max_uses, start_date, end_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(code, type, value, min_order_amount, max_uses, start_date, end_date);

    res.status(201).json({
      message: 'Promo code created successfully',
      promoCodeId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Error creating promo code:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create promo code'
    });
  }
});

// PUT /api/admin/promo-codes/:id - Update promo code
router.put('/promo-codes/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { code, type, value, min_order_amount, max_uses, start_date, end_date, is_active } = req.body;

    // Check if promo code exists
    const existingCode = db.prepare('SELECT id FROM promo_codes WHERE id = ?').get(id);
    if (!existingCode) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Promo code not found'
      });
    }

    // Update promo code
    db.prepare(`
      UPDATE promo_codes SET
        code = COALESCE(?, code),
        type = COALESCE(?, type),
        value = COALESCE(?, value),
        min_order_amount = COALESCE(?, min_order_amount),
        max_uses = COALESCE(?, max_uses),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        is_active = COALESCE(?, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(code, type, value, min_order_amount, max_uses, start_date, end_date, is_active, id);

    res.json({
      message: 'Promo code updated successfully'
    });
  } catch (error) {
    console.error('Error updating promo code:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update promo code'
    });
  }
});

// DELETE /api/admin/promo-codes/:id - Delete promo code
router.delete('/promo-codes/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Check if promo code exists
    const existingCode = db.prepare('SELECT id FROM promo_codes WHERE id = ?').get(id);
    if (!existingCode) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Promo code not found'
      });
    }

    // Delete promo code
    db.prepare('DELETE FROM promo_codes WHERE id = ?').run(id);

    res.json({
      message: 'Promo code deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting promo code:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete promo code'
    });
  }
});

// GET /api/admin/analytics - Get sales analytics data
router.get('/analytics', (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;

    let whereClause = 'WHERE status != \'cancelled\'';
    let startDateParam = null;
    let endDateParam = null;

    // Handle custom date range
    if (startDate && endDate) {
      startDateParam = new Date(startDate);
      endDateParam = new Date(endDate);

      // Validate dates
      if (isNaN(startDateParam) || isNaN(endDateParam)) {
        return res.status(400).json({
          error: 'Invalid date format',
          message: 'Start and end dates must be valid ISO date strings'
        });
      }

      if (startDateParam > endDateParam) {
        return res.status(400).json({
          error: 'Invalid date range',
          message: 'Start date must be before end date'
        });
      }

      whereClause += ` AND created_at >= datetime('${startDateParam.toISOString()}') AND created_at <= datetime('${endDateParam.toISOString()}')`;
    } else {
      // Handle preset periods
      const periodValue = period || 'week';
      const days = periodValue === 'day' ? 1 : periodValue === 'week' ? 7 : periodValue === 'month' ? 30 : 365;
      whereClause += ` AND created_at >= datetime('now', '-${days} days')`;
    }

    // Get revenue by day
    const revenueByDay = db.prepare(`
      SELECT
        DATE(created_at) as date,
        SUM(total) as revenue,
        COUNT(*) as orders
      FROM orders
      ${whereClause}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).all();

    // Get sales by category
    const salesByCategory = db.prepare(`
      SELECT
        c.name as category,
        SUM(oi.quantity) as units_sold,
        SUM(oi.total_price) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN orders o ON oi.order_id = o.id
      ${whereClause}
      GROUP BY c.name
      ORDER BY revenue DESC
      LIMIT 10
    `).all();

    // Get top selling products
    const topProducts = db.prepare(`
      SELECT
        p.name as product,
        pi.url as image,
        SUM(oi.quantity) as units_sold,
        SUM(oi.total_price) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
      JOIN orders o ON oi.order_id = o.id
      ${whereClause}
      GROUP BY p.id
      ORDER BY units_sold DESC
      LIMIT 10
    `).all();

    // Get total revenue for period
    const totalRevenue = db.prepare(`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM orders
      ${whereClause}
    `).get().revenue;

    // Get total orders for period
    const totalOrders = db.prepare(`
      SELECT COUNT(*) as count
      FROM orders
      ${whereClause}
    `).get().count;

    // Get average order value
    const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

    // Build response data
    const responseData = {
      period: startDate && endDate ? 'custom' : (period || 'week'),
      startDate: startDateParam ? startDateParam.toISOString().split('T')[0] : null,
      endDate: endDateParam ? endDateParam.toISOString().split('T')[0] : null,
      revenueByDay,
      salesByCategory,
      topProducts,
      totals: {
        totalRevenue,
        totalOrders,
        avgOrderValue
      }
    };

    res.json(responseData);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch analytics data'
    });
  }
});

export default router;
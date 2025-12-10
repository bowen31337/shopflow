import express from 'express';
import { query } from 'express-validator';
import db from '../database.js';

const router = express.Router();

// Get all products with filtering, sorting, and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional(),
  query('brand').optional(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('sort').optional().isIn(['price_asc', 'price_desc', 'name_asc', 'name_desc', 'newest', 'popular', 'rating']),
  query('search').optional()
], (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    let whereConditions = ['p.is_active = 1'];
    let params = [];

    // Category filter
    if (req.query.category) {
      whereConditions.push('c.slug = ?');
      params.push(req.query.category);
    }

    // Brand filter
    if (req.query.brand) {
      whereConditions.push('b.slug = ?');
      params.push(req.query.brand);
    }

    // Price range filter
    if (req.query.minPrice) {
      whereConditions.push('p.price >= ?');
      params.push(parseFloat(req.query.minPrice));
    }
    if (req.query.maxPrice) {
      whereConditions.push('p.price <= ?');
      params.push(parseFloat(req.query.maxPrice));
    }

    // Search filter
    if (req.query.search) {
      whereConditions.push('(p.name LIKE ? OR p.description LIKE ?)');
      const searchTerm = `%${req.query.search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Build ORDER BY clause
    let orderBy = 'p.created_at DESC';
    switch (req.query.sort) {
      case 'price_asc':
        orderBy = 'p.price ASC';
        break;
      case 'price_desc':
        orderBy = 'p.price DESC';
        break;
      case 'name_asc':
        orderBy = 'p.name ASC';
        break;
      case 'name_desc':
        orderBy = 'p.name DESC';
        break;
      case 'newest':
      case 'created_desc':
        orderBy = 'p.created_at DESC';
        break;
      case 'popular':
        orderBy = 'p.is_featured DESC, p.created_at DESC';
        break;
      case 'rating':
      case 'rating_desc':
        orderBy = 'avg_rating DESC NULLS LAST, p.created_at DESC';
        break;
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE ${whereClause}
    `;
    const { total } = db.prepare(countQuery).get(...params);

    // Get products
    const productsQuery = `
      SELECT
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        b.name as brand_name,
        b.slug as brand_slug,
        (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
        (SELECT AVG(rating) FROM reviews WHERE product_id = p.id) as avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const products = db.prepare(productsQuery).all(...params, limit, offset);

    res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get featured products
router.get('/featured', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const products = db.prepare(`
      SELECT
        p.*,
        c.name as category_name,
        b.name as brand_name,
        (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
        (SELECT AVG(rating) FROM reviews WHERE product_id = p.id) as avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.is_active = 1 AND p.is_featured = 1
      ORDER BY p.created_at DESC
      LIMIT ?
    `).all(limit);

    res.json({ products });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ error: 'Failed to fetch featured products' });
  }
});

// Search products
router.get('/search', (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({ products: [] });
    }

    const searchTerm = `%${q}%`;

    const products = db.prepare(`
      SELECT
        p.id,
        p.name,
        p.slug,
        p.price,
        (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
      FROM products p
      WHERE p.is_active = 1
        AND (p.name LIKE ? OR p.description LIKE ?)
      LIMIT ?
    `).all(searchTerm, searchTerm, parseInt(limit));

    res.json({ products });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get single product by slug
router.get('/:slug', (req, res) => {
  try {
    const { slug } = req.params;

    const product = db.prepare(`
      SELECT
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        b.name as brand_name,
        b.slug as brand_slug,
        (SELECT AVG(rating) FROM reviews WHERE product_id = p.id) as avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.slug = ? AND p.is_active = 1
    `).get(slug);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get product images
    const images = db.prepare(`
      SELECT id, url, alt_text, position, is_primary
      FROM product_images
      WHERE product_id = ?
      ORDER BY position
    `).all(product.id);

    // Get product variants
    const variants = db.prepare(`
      SELECT id, name, value, price_adjustment, stock_quantity, sku
      FROM product_variants
      WHERE product_id = ?
    `).all(product.id);

    // Get related products (same category)
    const relatedProducts = db.prepare(`
      SELECT
        p.*,
        (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
      FROM products p
      WHERE p.category_id = ?
        AND p.id != ?
        AND p.is_active = 1
      ORDER BY RANDOM()
      LIMIT 4
    `).all(product.category_id, product.id);

    res.json({
      product: {
        ...product,
        images,
        variants,
        related_products: relatedProducts
      }
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

export default router;

import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get all categories
router.get('/', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT
        c.*,
        (SELECT COUNT(*) FROM products WHERE category_id = c.id AND is_active = 1) as product_count
      FROM categories c
      WHERE c.is_active = 1
      ORDER BY c.position, c.name
    `).all();

    // Build hierarchical structure
    const categoryMap = {};
    const rootCategories = [];

    categories.forEach(cat => {
      categoryMap[cat.id] = { ...cat, subcategories: [] };
    });

    categories.forEach(cat => {
      if (cat.parent_id) {
        if (categoryMap[cat.parent_id]) {
          categoryMap[cat.parent_id].subcategories.push(categoryMap[cat.id]);
        }
      } else {
        rootCategories.push(categoryMap[cat.id]);
      }
    });

    res.json({ categories: rootCategories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get category by slug
router.get('/:slug', (req, res) => {
  try {
    const { slug } = req.params;

    const category = db.prepare(`
      SELECT * FROM categories WHERE slug = ? AND is_active = 1
    `).get(slug);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Get subcategories
    const subcategories = db.prepare(`
      SELECT * FROM categories WHERE parent_id = ? AND is_active = 1
      ORDER BY position, name
    `).all(category.id);

    res.json({
      category: {
        ...category,
        subcategories
      }
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Get products by category slug
router.get('/:slug/products', (req, res) => {
  try {
    const { slug } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    const category = db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Get total count
    const { total } = db.prepare(`
      SELECT COUNT(*) as total FROM products
      WHERE category_id = ? AND is_active = 1
    `).get(category.id);

    // Get products
    const products = db.prepare(`
      SELECT
        p.*,
        b.name as brand_name,
        (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
        (SELECT AVG(rating) FROM reviews WHERE product_id = p.id) as avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as review_count
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.category_id = ? AND p.is_active = 1
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `).all(category.id, limit, offset);

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
    console.error('Error fetching category products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

export default router;

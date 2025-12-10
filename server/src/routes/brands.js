import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get all brands
router.get('/', (req, res) => {
  try {
    const brands = db.prepare(`
      SELECT
        b.*,
        (SELECT COUNT(*) FROM products WHERE brand_id = b.id AND is_active = 1) as product_count
      FROM brands b
      WHERE b.is_active = 1
      ORDER BY b.name
    `).all();

    res.json({ brands });
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

// Get brand by slug
router.get('/:slug', (req, res) => {
  try {
    const { slug } = req.params;

    const brand = db.prepare(`
      SELECT
        b.*,
        (SELECT COUNT(*) FROM products WHERE brand_id = b.id AND is_active = 1) as product_count
      FROM brands b
      WHERE b.slug = ? AND b.is_active = 1
    `).get(slug);

    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    res.json({ brand });
  } catch (error) {
    console.error('Error fetching brand:', error);
    res.status(500).json({ error: 'Failed to fetch brand' });
  }
});

export default router;

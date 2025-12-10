import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../database.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Helper function to handle validation errors
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  return null;
};

// GET /api/wishlist - Get user's wishlist
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get wishlist items with product details
    const wishlistItems = db.prepare(`
      SELECT
        w.id,
        w.user_id,
        w.product_id,
        w.created_at,
        p.name,
        p.price,
        p.compare_at_price,
        p.stock_quantity,
        p.is_active,
        pi.url as image_url,
        pi.alt_text,
        c.name as category_name,
        b.name as brand_name
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE w.user_id = ? AND p.is_active = 1
      ORDER BY w.created_at DESC
    `).all(userId);

    // Format the response
    const formattedItems = wishlistItems.map(item => ({
      id: item.id,
      product: {
        id: item.product_id,
        name: item.name,
        price: item.price,
        compare_at_price: item.compare_at_price,
        stock_quantity: item.stock_quantity,
        is_active: item.is_active,
        image_url: item.image_url,
        alt_text: item.alt_text,
        category_name: item.category_name,
        brand_name: item.brand_name
      },
      created_at: item.created_at
    }));

    res.json({
      success: true,
      wishlist: formattedItems,
      count: formattedItems.length
    });

  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve wishlist'
    });
  }
});

// POST /api/wishlist - Add product to wishlist
router.post('/', authenticateToken, [
  body('product_id').isInt({ min: 1 }).withMessage('Product ID must be a positive integer')
], async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const userId = req.user.id;
    const { product_id } = req.body;

    // Check if product exists and is active
    const product = db.prepare('SELECT id, is_active FROM products WHERE id = ?').get(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.is_active) {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }

    // Check if already in wishlist
    const existing = db.prepare('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?').get(userId, product_id);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    // Add to wishlist
    const result = db.prepare('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)').run(userId, product_id);

    res.status(201).json({
      success: true,
      message: 'Product added to wishlist',
      wishlist_item: {
        id: result.lastInsertRowid,
        user_id: userId,
        product_id: product_id,
        created_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product to wishlist'
    });
  }
});

// DELETE /api/wishlist/:productId - Remove product from wishlist
router.delete('/:productId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    // Validate product ID
    if (!productId || isNaN(parseInt(productId))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // Check if wishlist item exists
    const wishlistItem = db.prepare('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?').get(userId, parseInt(productId));
    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in wishlist'
      });
    }

    // Remove from wishlist
    db.prepare('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?').run(userId, parseInt(productId));

    res.json({
      success: true,
      message: 'Product removed from wishlist'
    });

  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove product from wishlist'
    });
  }
});

// POST /api/wishlist/:productId/move-to-cart - Move product from wishlist to cart
router.post('/:productId/move-to-cart', authenticateToken, [
  body('quantity').optional().isInt({ min: 1, max: 99 }).withMessage('Quantity must be between 1 and 99')
], async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity = 1 } = req.body;

    // Validate product ID
    if (!productId || isNaN(parseInt(productId))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // Check if product exists and is active
    const product = db.prepare('SELECT id, is_active, stock_quantity FROM products WHERE id = ?').get(parseInt(productId));
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.is_active) {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }

    if (product.stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    // Check if already in cart
    const existingCart = db.prepare('SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?').get(userId, parseInt(productId));

    if (existingCart) {
      // Update existing cart item
      const newQuantity = Math.min(existingCart.quantity + quantity, product.stock_quantity);
      db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(newQuantity, existingCart.id);
    } else {
      // Add new cart item
      db.prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)').run(userId, parseInt(productId), quantity);
    }

    // Remove from wishlist
    db.prepare('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?').run(userId, parseInt(productId));

    res.json({
      success: true,
      message: 'Product moved to cart and removed from wishlist'
    });

  } catch (error) {
    console.error('Move to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to move product to cart'
    });
  }
});

// GET /api/wishlist/shared/:userId - Get shared wishlist (public view)
router.get('/shared/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get wishlist items for the specified user (no authentication required)
    const wishlistItems = db.prepare(`
      SELECT
        w.id,
        w.product_id,
        w.created_at,
        p.name,
        p.price,
        p.compare_at_price,
        p.stock_quantity,
        p.is_active,
        pi.url as image_url,
        pi.alt_text,
        c.name as category_name,
        b.name as brand_name
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE w.user_id = ? AND p.is_active = 1
      ORDER BY w.created_at DESC
    `).all(parseInt(userId));

    // Format the response
    const formattedItems = wishlistItems.map(item => ({
      id: item.id,
      product: {
        id: item.product_id,
        name: item.name,
        price: item.price,
        compare_at_price: item.compare_at_price,
        stock_quantity: item.stock_quantity,
        is_active: item.is_active,
        image_url: item.image_url,
        alt_text: item.alt_text,
        category_name: item.category_name,
        brand_name: item.brand_name
      },
      created_at: item.created_at
    }));

    res.json({
      success: true,
      wishlist: formattedItems,
      count: formattedItems.length
    });

  } catch (error) {
    console.error('Get shared wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve shared wishlist'
    });
  }
});

export default router;
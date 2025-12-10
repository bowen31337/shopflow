import express from 'express';
import { body, param } from 'express-validator';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's cart
router.get('/', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;

    const cartItems = db.prepare(`
      SELECT
        ci.*,
        p.id as product_id,
        p.name as product_name,
        p.slug as product_slug,
        p.price as product_price,
        p.stock_quantity as product_stock,
        p.is_active as product_is_active,
        (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as product_image,
        pv.id as variant_id,
        pv.name as variant_name,
        pv.value as variant_value,
        pv.price_adjustment,
        pv.stock_quantity as variant_stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN product_variants pv ON ci.variant_id = pv.id
      WHERE ci.user_id = ? AND p.is_active = 1
      ORDER BY ci.created_at DESC
    `).all(userId);

    // Calculate totals
    const items = cartItems.map(item => {
      const adjustedPrice = item.price_adjustment
        ? item.product_price + item.price_adjustment
        : item.product_price;

      return {
        id: item.id,
        productId: item.product_id,
        variantId: item.variant_id,
        quantity: item.quantity,
        unitPrice: adjustedPrice,
        totalPrice: adjustedPrice * item.quantity,
        product: {
          id: item.product_id,
          name: item.product_name,
          slug: item.product_slug,
          price: item.product_price,
          stockQuantity: item.product_stock,
          isActive: item.product_is_active,
          image: item.product_image
        },
        variant: item.variant_id ? {
          id: item.variant_id,
          name: item.variant_name,
          value: item.variant_value,
          adjustedPrice,
          stockQuantity: item.variant_stock
        } : null
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

    res.json({
      items,
      subtotal
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add item to cart
router.post('/items', [
  body('productId').isInt({ min: 1 }),
  body('quantity').isInt({ min: 1, max: 99 }),
  body('variantId').optional().isInt({ min: 1 })
], authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity, variantId } = req.body;

    // Check if product exists and is active
    const product = db.prepare(`
      SELECT id, name, price, stock_quantity, is_active
      FROM products
      WHERE id = ? AND is_active = 1
    `).get(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found or unavailable' });
    }

    // Check if variant exists and belongs to product
    if (variantId) {
      const variant = db.prepare(`
        SELECT id, name, value, price_adjustment, stock_quantity
        FROM product_variants
        WHERE id = ? AND product_id = ?
      `).get(variantId, productId);

      if (!variant) {
        return res.status(404).json({ error: 'Variant not found' });
      }

      if (variant.stock_quantity < quantity) {
        return res.status(400).json({
          error: `Insufficient stock. Only ${variant.stock_quantity} available.`
        });
      }
    } else if (product.stock_quantity < quantity) {
      return res.status(400).json({
        error: `Insufficient stock. Only ${product.stock_quantity} available.`
      });
    }

    // Check if item already exists in cart
    const existingItem = db.prepare(`
      SELECT id, quantity
      FROM cart_items
      WHERE user_id = ? AND product_id = ? AND (variant_id = ? OR (variant_id IS NULL AND ? IS NULL))
    `).get(userId, productId, variantId || null, variantId || null);

    if (existingItem) {
      // Update existing item
      const newQuantity = Math.min(existingItem.quantity + quantity, 99);
      db.prepare(`
        UPDATE cart_items
        SET quantity = ?
        WHERE id = ?
      `).run(newQuantity, existingItem.id);

      // Fetch updated cart
      const updatedCart = db.prepare(`
        SELECT
          ci.*,
          p.id as product_id,
          p.name as product_name,
          p.slug as product_slug,
          p.price as product_price,
          p.stock_quantity as product_stock,
          p.is_active as product_is_active,
          (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as product_image,
          pv.id as variant_id,
          pv.name as variant_name,
          pv.value as variant_value,
          pv.price_adjustment,
          pv.stock_quantity as variant_stock
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        LEFT JOIN product_variants pv ON ci.variant_id = pv.id
        WHERE ci.user_id = ?
        ORDER BY ci.created_at DESC
      `).all(userId);

      const items = updatedCart.map(item => {
        const adjustedPrice = item.price_adjustment
          ? item.product_price + item.price_adjustment
          : item.product_price;

        return {
          id: item.id,
          productId: item.product_id,
          variantId: item.variant_id,
          quantity: item.quantity,
          unitPrice: adjustedPrice,
          totalPrice: adjustedPrice * item.quantity,
          product: {
            id: item.product_id,
            name: item.product_name,
            slug: item.product_slug,
            price: item.product_price,
            stockQuantity: item.product_stock,
            isActive: item.product_is_active,
            image: item.product_image
          },
          variant: item.variant_id ? {
            id: item.variant_id,
            name: item.variant_name,
            value: item.variant_value,
            adjustedPrice,
            stockQuantity: item.variant_stock
          } : null
        };
      });

      const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

      res.json({
        message: 'Cart updated successfully',
        items,
        subtotal
      });
    } else {
      // Add new item to cart
      const result = db.prepare(`
        INSERT INTO cart_items (user_id, product_id, variant_id, quantity)
        VALUES (?, ?, ?, ?)
      `).run(userId, productId, variantId || null, quantity);

      // Fetch updated cart
      const updatedCart = db.prepare(`
        SELECT
          ci.*,
          p.id as product_id,
          p.name as product_name,
          p.slug as product_slug,
          p.price as product_price,
          p.stock_quantity as product_stock,
          p.is_active as product_is_active,
          (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as product_image,
          pv.id as variant_id,
          pv.name as variant_name,
          pv.value as variant_value,
          pv.price_adjustment,
          pv.stock_quantity as variant_stock
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        LEFT JOIN product_variants pv ON ci.variant_id = pv.id
        WHERE ci.user_id = ?
        ORDER BY ci.created_at DESC
      `).all(userId);

      const items = updatedCart.map(item => {
        const adjustedPrice = item.price_adjustment
          ? item.product_price + item.price_adjustment
          : item.product_price;

        return {
          id: item.id,
          productId: item.product_id,
          variantId: item.variant_id,
          quantity: item.quantity,
          unitPrice: adjustedPrice,
          totalPrice: adjustedPrice * item.quantity,
          product: {
            id: item.product_id,
            name: item.product_name,
            slug: item.product_slug,
            price: item.product_price,
            stockQuantity: item.product_stock,
            isActive: item.product_is_active,
            image: item.product_image
          },
          variant: item.variant_id ? {
            id: item.variant_id,
            name: item.variant_name,
            value: item.variant_value,
            adjustedPrice,
            stockQuantity: item.variant_stock
          } : null
        };
      });

      const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

      res.status(201).json({
        message: 'Item added to cart',
        items,
        subtotal
      });
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update item quantity in cart
router.put('/items/:id', [
  body('quantity').isInt({ min: 1, max: 99 }),
  param('id').isInt({ min: 1 })
], authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body;

    // Check if cart item exists and belongs to user
    const cartItem = db.prepare(`
      SELECT ci.*, p.stock_quantity as product_stock, p.is_active
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.id = ? AND ci.user_id = ?
    `).get(id, userId);

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (!cartItem.is_active) {
      return res.status(400).json({ error: 'Product is no longer available' });
    }

    // Check stock availability
    if (cartItem.product_stock < quantity) {
      return res.status(400).json({
        error: `Insufficient stock. Only ${cartItem.product_stock} available.`
      });
    }

    // Update quantity
    db.prepare(`
      UPDATE cart_items
      SET quantity = ?
      WHERE id = ?
    `).run(quantity, id);

    // Fetch updated cart
    const updatedCart = db.prepare(`
      SELECT
        ci.*,
        p.id as product_id,
        p.name as product_name,
        p.slug as product_slug,
        p.price as product_price,
        p.stock_quantity as product_stock,
        p.is_active as product_is_active,
        (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as product_image,
        pv.id as variant_id,
        pv.name as variant_name,
        pv.value as variant_value,
        pv.price_adjustment,
        pv.stock_quantity as variant_stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN product_variants pv ON ci.variant_id = pv.id
      WHERE ci.user_id = ?
      ORDER BY ci.created_at DESC
    `).all(userId);

    const items = updatedCart.map(item => {
      const adjustedPrice = item.price_adjustment
        ? item.product_price + item.price_adjustment
        : item.product_price;

      return {
        id: item.id,
        productId: item.product_id,
        variantId: item.variant_id,
        quantity: item.quantity,
        unitPrice: adjustedPrice,
        totalPrice: adjustedPrice * item.quantity,
        product: {
          id: item.product_id,
          name: item.product_name,
          slug: item.product_slug,
          price: item.product_price,
          stockQuantity: item.product_stock,
          isActive: item.product_is_active,
          image: item.product_image
        },
        variant: item.variant_id ? {
          id: item.variant_id,
          name: item.variant_name,
          value: item.variant_value,
          adjustedPrice,
          stockQuantity: item.variant_stock
        } : null
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

    res.json({
      message: 'Cart updated successfully',
      items,
      subtotal
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Remove item from cart
router.delete('/items/:id', [
  param('id').isInt({ min: 1 })
], authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if cart item exists and belongs to user
    const cartItem = db.prepare(`
      SELECT id
      FROM cart_items
      WHERE id = ? AND user_id = ?
    `).get(id, userId);

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Remove item
    db.prepare(`
      DELETE FROM cart_items
      WHERE id = ?
    `).run(id);

    // Fetch updated cart
    const updatedCart = db.prepare(`
      SELECT
        ci.*,
        p.id as product_id,
        p.name as product_name,
        p.slug as product_slug,
        p.price as product_price,
        p.stock_quantity as product_stock,
        p.is_active as product_is_active,
        (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as product_image,
        pv.id as variant_id,
        pv.name as variant_name,
        pv.value as variant_value,
        pv.price_adjustment,
        pv.stock_quantity as variant_stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN product_variants pv ON ci.variant_id = pv.id
      WHERE ci.user_id = ?
      ORDER BY ci.created_at DESC
    `).all(userId);

    const items = updatedCart.map(item => {
      const adjustedPrice = item.price_adjustment
        ? item.product_price + item.price_adjustment
        : item.product_price;

      return {
        id: item.id,
        productId: item.product_id,
        variantId: item.variant_id,
        quantity: item.quantity,
        unitPrice: adjustedPrice,
        totalPrice: adjustedPrice * item.quantity,
        product: {
          id: item.product_id,
          name: item.product_name,
          slug: item.product_slug,
          price: item.product_price,
          stockQuantity: item.product_stock,
          isActive: item.product_is_active,
          image: item.product_image
        },
        variant: item.variant_id ? {
          id: item.variant_id,
          name: item.variant_name,
          value: item.variant_value,
          adjustedPrice,
          stockQuantity: item.variant_stock
        } : null
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

    res.json({
      message: 'Item removed from cart',
      items,
      subtotal
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

export default router;
import express from 'express';
import { body, param } from 'express-validator';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const cartItems = await db.all(`
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
    `, userId);

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
], authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity, variantId } = req.body;

    // Check if product exists and is active
    const product = await db.get(`
      SELECT id, name, price, stock_quantity, is_active
      FROM products
      WHERE id = ? AND is_active = 1
    `, productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found or unavailable' });
    }

    // Check if variant exists and belongs to product
    if (variantId) {
      const variant = await db.get(`
        SELECT id, name, value, price_adjustment, stock_quantity
        FROM product_variants
        WHERE id = ? AND product_id = ?
      `, variantId, productId);

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
    const existingItem = await db.get(`
      SELECT id, quantity
      FROM cart_items
      WHERE user_id = ? AND product_id = ? AND (variant_id = ? OR (variant_id IS NULL AND ? IS NULL))
    `, userId, productId, variantId || null, variantId || null);

    if (existingItem) {
      // Update existing item
      const newQuantity = Math.min(existingItem.quantity + quantity, 99);
      await db.run(`
        UPDATE cart_items
        SET quantity = ?
        WHERE id = ?
      `, newQuantity, existingItem.id);
    } else {
      // Add new item to cart
      await db.run(`
        INSERT INTO cart_items (user_id, product_id, variant_id, quantity)
        VALUES (?, ?, ?, ?)
      `, userId, productId, variantId || null, quantity);
    }

    // Fetch updated cart
    const updatedCart = await db.all(`
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
    `, userId);

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

    res.status(existingItem ? 200 : 201).json({
      message: existingItem ? 'Cart updated successfully' : 'Item added to cart',
      items,
      subtotal
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update item quantity in cart
router.put('/items/:id', [
  body('quantity').isInt({ min: 1, max: 99 }),
  param('id').isInt({ min: 1 })
], authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body;

    // Check if cart item exists and belongs to user
    const cartItem = await db.get(`
      SELECT ci.*, p.stock_quantity as product_stock, p.is_active
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.id = ? AND ci.user_id = ?
    `, id, userId);

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
    await db.run(`
      UPDATE cart_items
      SET quantity = ?
      WHERE id = ?
    `, quantity, id);

    // Fetch updated cart
    const updatedCart = await db.all(`
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
    `, userId);

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

// Apply promo code to cart
router.post('/promo-code', [
  body('code').trim().notEmpty().isLength({ min: 3, max: 20 })
], authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { code } = req.body;

    // Get promo code details
    const promoCode = await db.get(`
      SELECT id, code, type, value, min_order_amount, max_uses, current_uses, start_date, end_date, is_active
      FROM promo_codes
      WHERE code = ? COLLATE NOCASE
    `, code);

    if (!promoCode) {
      return res.status(404).json({ error: 'Invalid promo code' });
    }

    if (!promoCode.is_active) {
      return res.status(400).json({ error: 'Promo code is not active' });
    }

    if (promoCode.max_uses && promoCode.current_uses >= promoCode.max_uses) {
      return res.status(400).json({ error: 'Promo code has reached maximum usage limit' });
    }

    if (promoCode.start_date) {
      const now = new Date();
      const startDate = new Date(promoCode.start_date);
      if (now < startDate) {
        return res.status(400).json({ error: 'Promo code is not yet active' });
      }
    }

    if (promoCode.end_date) {
      const now = new Date();
      const endDate = new Date(promoCode.end_date);
      if (now > endDate) {
        return res.status(400).json({ error: 'Promo code has expired' });
      }
    }

    // Get current cart subtotal
    const cartItems = await db.all(`
      SELECT
        ci.quantity,
        p.price,
        pv.price_adjustment
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN product_variants pv ON ci.variant_id = pv.id
      WHERE ci.user_id = ? AND p.is_active = 1
    `, userId);

    const subtotal = cartItems.reduce((sum, item) => {
      const adjustedPrice = item.price_adjustment ? item.price + item.price_adjustment : item.price;
      return sum + adjustedPrice * item.quantity;
    }, 0);

    if (subtotal < promoCode.min_order_amount) {
      return res.status(400).json({
        error: `Minimum order amount of $${promoCode.min_order_amount.toFixed(2)} required`
      });
    }

    // Calculate discount
    let discount = 0;
    if (promoCode.type === 'percentage') {
      discount = (subtotal * promoCode.value) / 100;
    } else if (promoCode.type === 'fixed') {
      discount = Math.min(promoCode.value, subtotal);
    }

    // Update promo code usage
    await db.run(`
      UPDATE promo_codes
      SET current_uses = current_uses + 1
      WHERE id = ?
    `, promoCode.id);

    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal >= 50 ? 0 : 9.99; // Free shipping over $50
    const total = subtotal + tax + shipping - discount;

    res.json({
      message: 'Promo code applied successfully',
      promoCode: {
        code: promoCode.code,
        type: promoCode.type,
        value: promoCode.value,
        discount: discount,
        minOrderAmount: promoCode.min_order_amount
      },
      amounts: {
        subtotal,
        tax,
        shipping,
        discount,
        total
      }
    });
  } catch (error) {
    console.error('Error applying promo code:', error);
    res.status(500).json({ error: 'Failed to apply promo code' });
  }
});

// Remove promo code from cart
router.delete('/promo-code', authenticateToken, (req, res) => {
  try {
    res.json({
      message: 'Promo code removed',
      promoCode: null
    });
  } catch (error) {
    console.error('Error removing promo code:', error);
    res.status(500).json({ error: 'Failed to remove promo code' });
  }
});

// Get cart with totals including any applied promo codes
router.get('/totals', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const cartItems = await db.all(`
      SELECT
        ci.quantity,
        p.price,
        pv.price_adjustment
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN product_variants pv ON ci.variant_id = pv.id
      WHERE ci.user_id = ? AND p.is_active = 1
    `, userId);

    const subtotal = cartItems.reduce((sum, item) => {
      const adjustedPrice = item.price_adjustment ? item.price + item.price_adjustment : item.price;
      return sum + adjustedPrice * item.quantity;
    }, 0);

    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal >= 50 ? 0 : 9.99; // Free shipping over $50
    const total = subtotal + tax + shipping;

    res.json({
      amounts: {
        subtotal,
        tax,
        shipping,
        total
      }
    });
  } catch (error) {
    console.error('Error calculating cart totals:', error);
    res.status(500).json({ error: 'Failed to calculate cart totals' });
  }
});

// Remove item from cart
router.delete('/items/:id', [
  param('id').isInt({ min: 1 })
], authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if cart item exists and belongs to user
    const cartItem = await db.get(`
      SELECT id
      FROM cart_items
      WHERE id = ? AND user_id = ?
    `, id, userId);

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Remove item
    await db.run(`
      DELETE FROM cart_items
      WHERE id = ?
    `, id);

    // Fetch updated cart
    const updatedCart = await db.all(`
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
    `, userId);

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

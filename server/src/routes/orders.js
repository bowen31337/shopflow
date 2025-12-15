import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../database.js';
import { generateTrackingNumber, getShippingCarrier } from '../utils/tracking.js';

const router = express.Router();

// GET /api/orders - Get user's orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get user's orders with pagination
    const orders = await db.all(`
      SELECT
        id,
        order_number,
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
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, userId, limit, offset);

    // Get total count for pagination
    const totalCountResult = await db.get(`
      SELECT COUNT(*) as count
      FROM orders
      WHERE user_id = ?
    `, userId);
    const totalCount = totalCountResult?.count || 0;

    // Get order items for each order
    const ordersWithItems = await Promise.all(orders.map(async order => {
      const items = await db.all(`
        SELECT
          oi.id,
          oi.quantity,
          oi.unit_price,
          oi.total_price,
          oi.product_snapshot,
          p.name as current_product_name,
          pi.url as product_image
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        LEFT JOIN product_images pi ON oi.product_id = pi.product_id AND pi.is_primary = 1
        WHERE oi.order_id = ?
        ORDER BY oi.id
      `, order.id);

      // Parse product snapshot
      const itemsWithSnapshot = items.map(item => ({
        ...item,
        product_snapshot: JSON.parse(item.product_snapshot),
        image: item.product_image || JSON.parse(item.product_snapshot).image || '/images/placeholder.jpg'
      }));

      return {
        ...order,
        items: itemsWithSnapshot,
        formatted_date: new Date(order.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        formatted_total: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(order.total)
      };
    }));

    res.json({
      success: true,
      orders: ordersWithItems,
      pagination: {
        page,
        limit,
        total: totalCount,
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

// GET /api/orders/:id - Get specific order details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = parseInt(req.params.id);

    if (isNaN(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID',
        message: 'Order ID must be a valid number'
      });
    }

    // Get order details
    const order = await db.get(`
      SELECT
        id,
        order_number,
        status,
        shipping_address,
        billing_address,
        subtotal,
        shipping_cost,
        tax,
        discount,
        total,
        payment_method,
        payment_status,
        shipping_method,
        tracking_number,
        notes,
        created_at,
        updated_at
      FROM orders
      WHERE id = ? AND user_id = ?
    `, orderId, userId);

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Order not found or you do not have permission to view it'
      });
    }

    // Get order items
    const items = await db.all(`
      SELECT
        oi.id,
        oi.quantity,
        oi.unit_price,
        oi.total_price,
        oi.product_snapshot,
        p.name as current_product_name,
        p.slug as current_product_slug,
        pi.url as product_image
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_images pi ON oi.product_id = pi.product_id AND pi.is_primary = 1
      WHERE oi.order_id = ?
      ORDER BY oi.id
    `, order.id);

    // Parse addresses and product snapshots
    const orderWithDetails = {
      ...order,
      shipping_address: JSON.parse(order.shipping_address),
      billing_address: JSON.parse(order.billing_address),
      items: items.map(item => ({
        ...item,
        product_snapshot: JSON.parse(item.product_snapshot),
        image: item.product_image || JSON.parse(item.product_snapshot).image || '/images/placeholder.jpg',
        name: JSON.parse(item.product_snapshot).name || item.current_product_name,
        slug: item.current_product_slug
      })),
      formatted_date: new Date(order.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      formatted_total: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(order.total)
    };

    res.json({
      success: true,
      order: orderWithDetails
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch order details'
    });
  }
});

// POST /api/orders/:id/cancel - Cancel an order
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = parseInt(req.params.id);

    if (isNaN(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID',
        message: 'Order ID must be a valid number'
      });
    }

    // Get order to check if it can be cancelled
    const order = await db.get(`
      SELECT id, status, user_id
      FROM orders
      WHERE id = ? AND user_id = ?
    `, orderId, userId);

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Order not found or you do not have permission to cancel it'
      });
    }

    // Check if order can be cancelled
    if (order.status === 'shipped' || order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({
        error: 'Order cannot be cancelled',
        message: `Order cannot be cancelled because it is ${order.status}`
      });
    }

    // Update order status
    const result = await db.run(`
      UPDATE orders
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `, orderId, userId);

    if (result.changes === 0) {
      return res.status(500).json({
        error: 'Failed to cancel order',
        message: 'Unable to cancel order at this time'
      });
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      orderId: orderId
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to cancel order'
    });
  }
});

// POST /api/orders/:id/reorder - Reorder items from a previous order
router.post('/:id/reorder', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = parseInt(req.params.id);

    if (isNaN(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID',
        message: 'Order ID must be a valid number'
      });
    }

    // Get order to check if user has permission
    const order = await db.get(`
      SELECT id, status, user_id
      FROM orders
      WHERE id = ? AND user_id = ?
    `, orderId, userId);

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Order not found or you do not have permission to reorder it'
      });
    }

    // Get order items
    const items = await db.all(`
      SELECT
        oi.product_id,
        oi.quantity,
        oi.product_snapshot
      FROM order_items oi
      WHERE oi.order_id = ?
      ORDER BY oi.id
    `, orderId);

    if (items.length === 0) {
      return res.status(400).json({
        error: 'No items to reorder',
        message: 'This order has no items to reorder'
      });
    }

    // Check if products are still available
    const reorderItems = [];
    let allProductsAvailable = true;

    for (const item of items) {
      const product = await db.get(`
        SELECT id, name, price, stock_quantity, is_active
        FROM products
        WHERE id = ? AND is_active = 1
      `, item.product_id);

      if (!product || product.stock_quantity < item.quantity) {
        allProductsAvailable = false;
        break;
      }

      reorderItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: product.price * item.quantity,
        name: product.name
      });
    }

    if (!allProductsAvailable) {
      return res.status(400).json({
        error: 'Products unavailable',
        message: 'Some products from this order are no longer available or have insufficient stock'
      });
    }

    // Clear existing cart items for this user
    await db.run('DELETE FROM cart_items WHERE user_id = ?', userId);

    // Add items to cart
    for (const item of reorderItems) {
      await db.run(`
        INSERT INTO cart_items (user_id, product_id, quantity, unit_price)
        VALUES (?, ?, ?, ?)
      `, userId, item.productId, item.quantity, item.unitPrice);
    }

    // Get updated cart
    const cartItems = await db.all(`
      SELECT
        ci.id,
        ci.product_id,
        ci.quantity,
        ci.unit_price,
        p.name,
        p.slug,
        p.stock_quantity,
        pi.url as image
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
      WHERE ci.user_id = ?
      ORDER BY ci.id
    `, userId);

    const cart = {
      items: cartItems.map(item => ({
        id: item.id,
        productId: item.product_id,
        name: item.name,
        slug: item.slug,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.unit_price * item.quantity,
        stockQuantity: item.stock_quantity,
        image: item.image || '/images/placeholder.jpg'
      })),
      totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: cartItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
    };

    res.json({
      success: true,
      message: 'Items added to cart successfully',
      cart: cart
    });
  } catch (error) {
    console.error('Error reordering:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to reorder items'
    });
  }
});

// GET /api/orders/:id/invoice - Generate PDF invoice (simplified - returns JSON for now)
router.get('/:id/invoice', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = parseInt(req.params.id);

    if (isNaN(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID',
        message: 'Order ID must be a valid number'
      });
    }

    // Get order details
    const order = await db.get(`
      SELECT *
      FROM orders
      WHERE id = ? AND user_id = ?
    `, orderId, userId);

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Order not found or you do not have permission to view it'
      });
    }

    // Get order items
    const items = await db.all(`
      SELECT
        oi.*,
        p.name as current_product_name
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
      ORDER BY oi.id
    `, order.id);

    // Return invoice data as JSON (PDF generation would require pdfkit which may not be available)
    res.json({
      success: true,
      invoice: {
        orderNumber: order.order_number,
        orderDate: order.created_at,
        status: order.status,
        shippingAddress: JSON.parse(order.shipping_address),
        billingAddress: JSON.parse(order.billing_address),
        items: items.map(item => ({
          name: JSON.parse(item.product_snapshot).name || item.current_product_name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price
        })),
        subtotal: order.subtotal,
        shippingCost: order.shipping_cost,
        tax: order.tax,
        discount: order.discount,
        total: order.total,
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status
      }
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate invoice'
    });
  }
});

export default router;

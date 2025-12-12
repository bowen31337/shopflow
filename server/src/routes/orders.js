import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../database.js';
import { generateTrackingNumber, getShippingCarrier } from '../utils/tracking.js';

const router = express.Router();

// GET /api/orders - Get user's orders
router.get('/', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get user's orders with pagination
    const orders = db.prepare(`
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
    `).all(userId, limit, offset);

    // Get total count for pagination
    const totalCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM orders
      WHERE user_id = ?
    `).get(userId).count;

    // Get order items for each order
    const ordersWithItems = orders.map(order => {
      const items = db.prepare(`
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
      `).all(order.id);

      // Parse product snapshot
      const itemsWithSnapshot = items.map(item => ({
        ...item,
        product_snapshot: JSON.parse(item.product_snapshot),
        // Fallback to current product image if snapshot doesn't have one
        image: item.product_image || JSON.parse(item.product_snapshot).image || '/images/placeholder.jpg'
      }));

      return {
        ...order,
        items: itemsWithSnapshot,
        // Add formatted date
        formatted_date: new Date(order.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        // Add formatted currency
        formatted_total: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(order.total)
      };
    });

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
router.get('/:id', authenticateToken, (req, res) => {
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
    const order = db.prepare(`
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
    `).get(orderId, userId);

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Order not found or you do not have permission to view it'
      });
    }

    // Get order items
    const items = db.prepare(`
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
    `).all(order.id);

    // Parse addresses and product snapshots
    const orderWithDetails = {
      ...order,
      shipping_address: JSON.parse(order.shipping_address),
      billing_address: JSON.parse(order.billing_address),
      items: items.map(item => ({
        ...item,
        product_snapshot: JSON.parse(item.product_snapshot),
        // Fallback to current product image if snapshot doesn't have one
        image: item.product_image || JSON.parse(item.product_snapshot).image || '/images/placeholder.jpg',
        // Use snapshot name first, fallback to current product name
        name: JSON.parse(item.product_snapshot).name || item.current_product_name,
        slug: item.current_product_slug
      })),
      // Add formatted dates
      formatted_date: new Date(order.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      formatted_updated_date: new Date(order.updated_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      // Add formatted currency
      formatted_subtotal: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(order.subtotal),
      formatted_shipping_cost: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(order.shipping_cost),
      formatted_tax: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(order.tax),
      formatted_discount: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(order.discount),
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
router.post('/:id/cancel', authenticateToken, (req, res) => {
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
    const order = db.prepare(`
      SELECT id, status, user_id
      FROM orders
      WHERE id = ? AND user_id = ?
    `).get(orderId, userId);

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Order not found or you do not have permission to cancel it'
      });
    }

    // Check if order can be cancelled (only pending or processing orders)
    if (order.status === 'shipped' || order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({
        error: 'Order cannot be cancelled',
        message: `Order cannot be cancelled because it is ${order.status}`
      });
    }

    // Update order status
    const result = db.prepare(`
      UPDATE orders
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).run(orderId, userId);

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

// POST /api/orders/:id/update-status - Update order status and generate tracking number
router.post('/:id/update-status', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID',
        message: 'Order ID must be a valid number'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Get order to check if user has permission
    const order = db.prepare(`
      SELECT id, status, user_id, shipping_method
      FROM orders
      WHERE id = ? AND user_id = ?
    `).get(orderId, userId);

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Order not found or you do not have permission to update it'
      });
    }

    // Check if status change is valid
    const currentStatus = order.status;
    let trackingNumber = null;

    if (status === 'shipped' && currentStatus !== 'shipped') {
      // Generate tracking number when order is shipped
      trackingNumber = generateTrackingNumber(orderId);
    }

    // Update order status and tracking number if applicable
    const result = db.prepare(`
      UPDATE orders
      SET status = ?, tracking_number = COALESCE(?, tracking_number), updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).run(trackingNumber || status, trackingNumber, orderId, userId);

    if (result.changes === 0) {
      return res.status(500).json({
        error: 'Failed to update order',
        message: 'Unable to update order status at this time'
      });
    }

    // Get updated order
    const updatedOrder = db.prepare(`
      SELECT
        id,
        order_number,
        status,
        tracking_number,
        updated_at
      FROM orders
      WHERE id = ? AND user_id = ?
    `).get(orderId, userId);

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.order_number,
        status: updatedOrder.status,
        trackingNumber: updatedOrder.tracking_number,
        updatedAt: updatedOrder.updated_at
      }
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update order status'
    });
  }
});

export default router;
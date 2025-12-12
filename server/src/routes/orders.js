import express from 'express';
import PDFDocument from 'pdfkit';
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

// POST /api/orders/:id/reorder - Reorder items from a previous order
router.post('/:id/reorder', authenticateToken, (req, res) => {
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
    const order = db.prepare(`
      SELECT id, status, user_id
      FROM orders
      WHERE id = ? AND user_id = ?
    `).get(orderId, userId);

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Order not found or you do not have permission to reorder it'
      });
    }

    // Get order items
    const items = db.prepare(`
      SELECT
        oi.product_id,
        oi.quantity,
        oi.product_snapshot
      FROM order_items oi
      WHERE oi.order_id = ?
      ORDER BY oi.id
    `).all(orderId);

    if (items.length === 0) {
      return res.status(400).json({
        error: 'No items to reorder',
        message: 'This order has no items to reorder'
      });
    }

    // Check if products are still available and get current prices
    const reorderItems = [];
    let allProductsAvailable = true;

    for (const item of items) {
      const product = db.prepare(`
        SELECT id, name, price, stock_quantity, is_active
        FROM products
        WHERE id = ? AND is_active = 1
      `).get(item.product_id);

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
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);

    // Add items to cart
    const insertCartItem = db.prepare(`
      INSERT INTO cart_items (user_id, product_id, quantity, unit_price)
      VALUES (?, ?, ?, ?)
    `);

    for (const item of reorderItems) {
      insertCartItem.run(userId, item.productId, item.quantity, item.unitPrice);
    }

    // Get updated cart
    const cartItems = db.prepare(`
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
    `).all(userId);

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

// GET /api/orders/:id/invoice - Generate PDF invoice for order
router.get('/:id/invoice', authenticateToken, (req, res) => {
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

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${order.order_number}.pdf"`);

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // Pipe PDF to response
    doc.pipe(res);

    // Add header
    doc.font('Helvetica-Bold').fontSize(24).text('INVOICE', 0, 30, { align: 'center' });
    doc.moveDown(0.5);

    // Add company info
    doc.font('Helvetica').fontSize(12).text('ShopFlow', 0, 70, { align: 'center' });
    doc.text('123 E-Commerce Street', 0, 85, { align: 'center' });
    doc.text('New York, NY 10001', 0, 100, { align: 'center' });
    doc.text('Phone: (555) 123-4567', 0, 115, { align: 'center' });
    doc.text('Email: support@shopflow.com', 0, 130, { align: 'center' });

    // Add line separator
    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // Add order information
    doc.font('Helvetica-Bold').fontSize(14).text('Order Information', { underline: true });
    doc.moveDown(0.5);

    doc.font('Helvetica').fontSize(12);
    doc.text(`Order Number: ${order.order_number}`);
    doc.text(`Order Date: ${new Date(order.created_at).toLocaleDateString('en-US')}`);
    doc.text(`Payment Method: ${order.payment_method}`);
    doc.text(`Payment Status: ${order.payment_status}`);
    doc.text(`Order Status: ${order.status}`);
    if (order.tracking_number) {
      doc.text(`Tracking Number: ${order.tracking_number}`);
    }

    doc.moveDown(1);

    // Add addresses
    const shippingAddress = JSON.parse(order.shipping_address);
    const billingAddress = JSON.parse(order.billing_address);

    doc.font('Helvetica-Bold').fontSize(14).text('Billing Address', { underline: true });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(12);
    doc.text(`${billingAddress.first_name} ${billingAddress.last_name}`);
    doc.text(billingAddress.street_address);
    if (billingAddress.apartment) {
      doc.text(billingAddress.apartment);
    }
    doc.text(`${billingAddress.city}, ${billingAddress.state} ${billingAddress.postal_code}`);
    doc.text(billingAddress.country);
    doc.text(billingAddress.phone);

    doc.moveDown(1);

    doc.font('Helvetica-Bold').fontSize(14).text('Shipping Address', { underline: true });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(12);
    doc.text(`${shippingAddress.first_name} ${shippingAddress.last_name}`);
    doc.text(shippingAddress.street_address);
    if (shippingAddress.apartment) {
      doc.text(shippingAddress.apartment);
    }
    doc.text(`${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postal_code}`);
    doc.text(shippingAddress.country);
    doc.text(shippingAddress.phone);

    doc.moveDown(1);

    // Add items table header
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('ITEMS', 50, doc.y, { width: 450 });
    doc.moveDown(1);

    // Draw table header row
    const tableY = doc.y;
    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('Description', 50, tableY);
    doc.text('Qty', 350, tableY);
    doc.text('Unit Price', 400, tableY);
    doc.text('Total', 480, tableY);
    doc.moveTo(50, tableY + 15).lineTo(550, tableY + 15).stroke();

    // Add items
    doc.font('Helvetica').fontSize(10);
    let currentY = tableY + 20;

    items.forEach(item => {
      const productSnapshot = JSON.parse(item.product_snapshot);
      const name = productSnapshot.name || item.current_product_name;

      // Add product name (may span multiple lines)
      doc.text(name, 50, currentY, { width: 280 });

      // Add quantity, unit price, and total on the same line
      doc.text(item.quantity.toString(), 350, currentY);
      doc.text(`$${item.unit_price.toFixed(2)}`, 400, currentY);
      doc.text(`$${item.total_price.toFixed(2)}`, 480, currentY);

      currentY += 20;

      // Check if we need a new page
      if (currentY > 750) {
        doc.addPage();
        currentY = 50;
      }
    });

    // Add totals section
    currentY += 20;
    doc.moveTo(300, currentY).lineTo(550, currentY).stroke();
    currentY += 10;

    doc.font('Helvetica').fontSize(12);
    doc.text(`Subtotal:`, 350, currentY);
    doc.text(`$${order.subtotal.toFixed(2)}`, 480, currentY);

    currentY += 20;
    doc.text(`Shipping:`, 350, currentY);
    doc.text(`$${order.shipping_cost.toFixed(2)}`, 480, currentY);

    currentY += 20;
    if (order.discount > 0) {
      doc.text(`Discount:`, 350, currentY);
      doc.text(`-$${order.discount.toFixed(2)}`, 480, currentY);
      currentY += 20;
    }

    doc.text(`Tax:`, 350, currentY);
    doc.text(`$${order.tax.toFixed(2)}`, 480, currentY);

    currentY += 20;
    doc.moveTo(300, currentY).lineTo(550, currentY).stroke();
    currentY += 10;

    doc.font('Helvetica-Bold').fontSize(14);
    doc.text(`Total:`, 350, currentY);
    doc.text(`$${order.total.toFixed(2)}`, 480, currentY);

    // Add thank you message
    currentY += 40;
    if (currentY > 750) {
      doc.addPage();
      currentY = 50;
    }

    doc.font('Helvetica-Oblique').fontSize(12);
    doc.text('Thank you for your purchase!', 0, currentY, { align: 'center' });
    doc.text('If you have any questions about this invoice, please contact our support team.', 0, currentY + 15, { align: 'center' });

    // Finalize PDF and end the stream
    doc.end();

  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate invoice'
    });
  }
});

export default router;
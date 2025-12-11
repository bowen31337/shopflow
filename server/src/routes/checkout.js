import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../database.js';

const router = express.Router();

// POST /api/checkout/validate-address
router.post('/validate-address', authenticateToken, (req, res) => {
  try {
    const { address } = req.body;

    // Basic validation
    if (!address) {
      return res.status(400).json({
        error: 'Address is required',
        message: 'Please provide a valid shipping address'
      });
    }

    const requiredFields = ['first_name', 'last_name', 'street_address', 'city', 'state', 'postal_code', 'country'];
    const missingFields = requiredFields.filter(field => !address[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: `Please provide: ${missingFields.join(', ')}`,
        missingFields
      });
    }

    // Validate postal code format (basic check)
    const postalCodeRegex = /^[0-9]{5}(-[0-9]{4})?$/;
    if (!postalCodeRegex.test(address.postal_code)) {
      return res.status(400).json({
        error: 'Invalid postal code',
        message: 'Please provide a valid US postal code'
      });
    }

    // Validate email format if provided
    if (address.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
      return res.status(400).json({
        error: 'Invalid email',
        message: 'Please provide a valid email address'
      });
    }

    res.json({
      success: true,
      message: 'Address is valid',
      validated: true,
      address: {
        ...address,
        validated: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error validating address:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to validate address'
    });
  }
});

// GET /api/checkout/address-autocomplete
router.get('/address-autocomplete', (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 3) {
      return res.json({
        success: true,
        suggestions: [],
        count: 0
      });
    }

    // Mock address suggestions for demo purposes
    // In a real application, this would integrate with a geocoding service like Google Places
    const mockAddresses = [
      {
        id: 'addr_1',
        street_address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        postal_code: '10001',
        country: 'United States',
        formatted_address: '123 Main Street, New York, NY 10001, United States'
      },
      {
        id: 'addr_2',
        street_address: '456 Oak Avenue',
        city: 'Los Angeles',
        state: 'CA',
        postal_code: '90001',
        country: 'United States',
        formatted_address: '456 Oak Avenue, Los Angeles, CA 90001, United States'
      },
      {
        id: 'addr_3',
        street_address: '789 Pine Road',
        city: 'Chicago',
        state: 'IL',
        postal_code: '60601',
        country: 'United States',
        formatted_address: '789 Pine Road, Chicago, IL 60601, United States'
      },
      {
        id: 'addr_4',
        street_address: '101 Maple Drive',
        city: 'Houston',
        state: 'TX',
        postal_code: '77001',
        country: 'United States',
        formatted_address: '101 Maple Drive, Houston, TX 77001, United States'
      },
      {
        id: 'addr_5',
        street_address: '202 Elm Street',
        city: 'Phoenix',
        state: 'AZ',
        postal_code: '85001',
        country: 'United States',
        formatted_address: '202 Elm Street, Phoenix, AZ 85001, United States'
      },
      {
        id: 'addr_6',
        street_address: '303 Cedar Lane',
        city: 'Philadelphia',
        state: 'PA',
        postal_code: '19101',
        country: 'United States',
        formatted_address: '303 Cedar Lane, Philadelphia, PA 19101, United States'
      },
      {
        id: 'addr_7',
        street_address: '404 Birch Boulevard',
        city: 'San Antonio',
        state: 'TX',
        postal_code: '78201',
        country: 'United States',
        formatted_address: '404 Birch Boulevard, San Antonio, TX 78201, United States'
      },
      {
        id: 'addr_8',
        street_address: '505 Walnut Way',
        city: 'San Diego',
        state: 'CA',
        postal_code: '92101',
        country: 'United States',
        formatted_address: '505 Walnut Way, San Diego, CA 92101, United States'
      },
      {
        id: 'addr_9',
        street_address: '606 Spruce Street',
        city: 'Dallas',
        state: 'TX',
        postal_code: '75201',
        country: 'United States',
        formatted_address: '606 Spruce Street, Dallas, TX 75201, United States'
      },
      {
        id: 'addr_10',
        street_address: '707 Ash Avenue',
        city: 'San Jose',
        state: 'CA',
        postal_code: '95101',
        country: 'United States',
        formatted_address: '707 Ash Avenue, San Jose, CA 95101, United States'
      }
    ];

    // Filter addresses based on query (case-insensitive)
    const searchQuery = query.toLowerCase().trim();
    const suggestions = mockAddresses.filter(addr =>
      addr.street_address.toLowerCase().includes(searchQuery) ||
      addr.city.toLowerCase().includes(searchQuery) ||
      addr.formatted_address.toLowerCase().includes(searchQuery)
    ).slice(0, 5); // Limit to 5 suggestions

    res.json({
      success: true,
      suggestions,
      count: suggestions.length,
      query: searchQuery
    });
  } catch (error) {
    console.error('Error in address autocomplete:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch address suggestions'
    });
  }
});

// GET /api/checkout/shipping-methods
router.get('/shipping-methods', (req, res) => {
  try {
    const shippingMethods = [
      {
        id: 'standard',
        name: 'Standard Shipping',
        description: '5-7 business days',
        cost: 5.99,
        estimatedDelivery: '5-7 business days',
        carrier: 'USPS'
      },
      {
        id: 'express',
        name: 'Express Shipping',
        description: '2-3 business days',
        cost: 12.99,
        estimatedDelivery: '2-3 business days',
        carrier: 'FedEx'
      },
      {
        id: 'overnight',
        name: 'Overnight Shipping',
        description: '1 business day',
        cost: 24.99,
        estimatedDelivery: 'Next business day',
        carrier: 'FedEx'
      },
      {
        id: 'economy',
        name: 'Economy Shipping',
        description: '7-10 business days',
        cost: 0,
        estimatedDelivery: '7-10 business days',
        carrier: 'USPS'
      }
    ];

    res.json({
      success: true,
      shippingMethods,
      count: shippingMethods.length
    });
  } catch (error) {
    console.error('Error fetching shipping methods:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch shipping methods'
    });
  }
});

// POST /api/checkout/create-payment-intent
router.post('/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const { items, shippingAddress, shippingMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Invalid items',
        message: 'Please provide valid cart items'
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        error: 'Missing shipping address',
        message: 'Please provide a shipping address'
      });
    }

    if (!shippingMethod) {
      return res.status(400).json({
        error: 'Missing shipping method',
        message: 'Please select a shipping method'
      });
    }

    // Calculate order total
    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shippingCost = shippingMethod.cost || 0;
    const tax = subtotal * 0.08; // 8% tax rate
    const total = subtotal + shippingCost + tax;

    // Create a mock payment intent (in production, this would use Stripe)
    const paymentIntent = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.round(total * 100), // Convert to cents
      currency: 'usd',
      status: 'requires_payment_method',
      client_secret: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_secret_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        userId: req.user.id,
        subtotal: subtotal.toFixed(2),
        shipping: shippingCost.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2)
      }
    };

    res.json({
      success: true,
      paymentIntent,
      orderSummary: {
        subtotal: subtotal.toFixed(2),
        shipping: shippingCost.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        itemCount: items.reduce((total, item) => total + item.quantity, 0)
      }
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create payment intent'
    });
  }
});

// POST /api/checkout/complete
router.post('/complete', authenticateToken, async (req, res) => {
  try {
    const {
      paymentIntentId,
      shippingAddress,
      shippingMethod,
      paymentMethod,
      items,
      total
    } = req.body;

    // Validate required fields
    if (!paymentIntentId || !shippingAddress || !shippingMethod || !paymentMethod || !items) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Please provide all required checkout information'
      });
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create order in database
    const orderData = {
      user_id: req.user.id,
      order_number: orderNumber,
      status: 'pending',
      shipping_address: JSON.stringify(shippingAddress),
      billing_address: JSON.stringify(shippingAddress), // Same as shipping for now
      subtotal: items.reduce((total, item) => total + (item.price * item.quantity), 0),
      shipping_cost: shippingMethod.cost || 0,
      tax: items.reduce((total, item) => total + (item.price * item.quantity), 0) * 0.08,
      discount: 0,
      total: total,
      payment_method: paymentMethod,
      payment_status: 'paid',
      shipping_method: shippingMethod.name,
      tracking_number: null,
      notes: req.body.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const result = db.prepare(`
      INSERT INTO orders (
        user_id, order_number, status, shipping_address, billing_address,
        subtotal, shipping_cost, tax, discount, total, payment_method,
        payment_status, shipping_method, tracking_number, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderData.user_id,
      orderData.order_number,
      orderData.status,
      orderData.shipping_address,
      orderData.billing_address,
      orderData.subtotal,
      orderData.shipping_cost,
      orderData.tax,
      orderData.discount,
      orderData.total,
      orderData.payment_method,
      orderData.payment_status,
      orderData.shipping_method,
      orderData.tracking_number,
      orderData.notes,
      orderData.created_at,
      orderData.updated_at
    );

    const orderId = result.lastInsertRowid;

    // Add order items
    for (const item of items) {
      const orderItemData = {
        order_id: orderId,
        product_id: item.id,
        variant_id: item.variantId || null,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        product_snapshot: JSON.stringify({
          name: item.name,
          image: item.image,
          sku: item.sku || 'N/A'
        })
      };

      db.prepare(`
        INSERT INTO order_items (
          order_id, product_id, variant_id, quantity, unit_price, total_price, product_snapshot
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        orderItemData.order_id,
        orderItemData.product_id,
        orderItemData.variant_id,
        orderItemData.quantity,
        orderItemData.unit_price,
        orderItemData.total_price,
        orderItemData.product_snapshot
      );
    }

    // Clear user's cart
    try {
      db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
    } catch (error) {
      console.error('Error clearing cart:', error);
      // Don't fail the order if cart clearing fails
    }

    // Return successful response
    res.status(201).json({
      success: true,
      message: 'Order completed successfully',
      order: {
        id: orderId,
        orderNumber: orderData.order_number,
        status: orderData.status,
        total: orderData.total,
        createdAt: orderData.created_at,
        itemCount: items.length,
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      }
    });
  } catch (error) {
    console.error('Error completing order:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to complete order'
    });
  }
});

export default router;
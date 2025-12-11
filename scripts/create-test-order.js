/**
 * Create a test order for testing order detail functionality
 */

// Using global fetch available in Node.js 18+

const API_BASE = 'http://localhost:3001';

async function createTestOrder() {
  console.log('🛒 Creating test order...\n');

  try {
    // Step 1: Login as customer
    console.log('1. Logging in as customer...');
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'customer@example.com',
        password: 'customer123'
      })
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.json();
      throw new Error(`Login failed: ${error.message}`);
    }

    const { accessToken: token, user } = await loginResponse.json();
    console.log(`✅ Logged in as: ${user.name} (${user.email})`);

    // Step 2: Get a product to order
    console.log('\n2. Getting a product...');
    const productsResponse = await fetch(`${API_BASE}/api/products?limit=1`);
    if (!productsResponse.ok) {
      throw new Error('Failed to fetch products');
    }

    const productsData = await productsResponse.json();
    const product = productsData.products[0];

    if (!product) {
      throw new Error('No products found in database');
    }

    console.log(`✅ Selected product: ${product.name} ($${product.price})`);

    // Step 3: Create test order
    console.log('\n3. Creating test order...');
    const orderData = {
      paymentIntentId: 'test_pi_' + Date.now(),
      shippingAddress: {
        first_name: 'Test',
        last_name: 'Customer',
        street_address: '123 Test St',
        apartment: 'Apt 4B',
        city: 'Testville',
        state: 'CA',
        postal_code: '94105',
        country: 'USA',
        phone: '555-123-4567',
        email: 'customer@example.com'
      },
      shippingMethod: {
        id: 'standard',
        name: 'Standard Shipping',
        description: '5-7 business days',
        cost: 5.99,
        estimatedDelivery: '5-7 business days',
        carrier: 'USPS'
      },
      paymentMethod: 'Credit Card',
      items: [{
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 2,
        image: product.primary_image || '/images/placeholder.jpg',
        sku: product.sku || 'TEST-SKU'
      }],
      total: (product.price * 2) + 5.99 + ((product.price * 2) * 0.08), // subtotal + shipping + tax
      notes: 'Test order created for order detail testing'
    };

    const orderResponse = await fetch(`${API_BASE}/api/checkout/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    if (!orderResponse.ok) {
      const error = await orderResponse.json();
      throw new Error(`Order creation failed: ${error.message}`);
    }

    const orderResult = await orderResponse.json();
    console.log('✅ Test order created successfully!');
    console.log(`   Order ID: ${orderResult.order.id}`);
    console.log(`   Order Number: ${orderResult.order.orderNumber}`);
    console.log(`   Status: ${orderResult.order.status}`);
    console.log(`   Total: $${orderResult.order.total.toFixed(2)}`);
    console.log(`   Items: ${orderResult.order.itemCount}`);

    // Step 4: Verify order can be retrieved
    console.log('\n4. Verifying order retrieval...');
    const ordersResponse = await fetch(`${API_BASE}/api/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!ordersResponse.ok) {
      throw new Error('Failed to fetch orders');
    }

    const ordersData = await ordersResponse.json();
    console.log(`✅ Orders retrieved: ${ordersData.orders.length} order(s)`);

    if (ordersData.orders.length > 0) {
      const latestOrder = ordersData.orders[0];
      console.log(`   Latest order: #${latestOrder.order_number} - ${latestOrder.status} - ${latestOrder.formatted_total}`);

      // Test order detail endpoint
      const orderDetailResponse = await fetch(`${API_BASE}/api/orders/${latestOrder.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (orderDetailResponse.ok) {
        const orderDetail = await orderDetailResponse.json();
        console.log('✅ Order detail endpoint working');
        console.log(`   Items in order: ${orderDetail.order.items.length}`);
        console.log(`   Shipping address: ${orderDetail.order.shipping_address.first_name} ${orderDetail.order.shipping_address.last_name}`);
      } else {
        console.log('⚠️  Order detail endpoint failed');
      }
    }

    console.log('\n🎉 Test order creation completed!');
    console.log('\n📝 Manual Testing Instructions:');
    console.log('1. Open http://localhost:5173 in your browser');
    console.log('2. Login with: customer@example.com / customer123');
    console.log('3. Go to Profile page');
    console.log('4. Click "Order History" in Quick Links section');
    console.log('5. Click "View Details" on the test order');
    console.log('6. Verify order detail page shows all information correctly');

  } catch (error) {
    console.error('\n❌ Error creating test order:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure backend server is running on http://localhost:3001');
    console.log('2. Check that database is properly seeded');
    console.log('3. Verify the checkout endpoint is working');
  }
}

// Run the script
createTestOrder();
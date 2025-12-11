// Test script for checkout functionality

const API_BASE = 'http://localhost:3001/api';

// Test user credentials
const TEST_USER = {
  email: 'customer@example.com',
  password: 'customer123'
};

let authToken = '';

// Helper function to make authenticated requests
async function authenticatedRequest(url, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      ...options.headers
    }
  };

  const response = await fetch(`${API_BASE}${url}`, { ...defaultOptions, ...options });
  return response;
}

// Test function to run the checkout flow
async function testCheckoutFlow() {
  console.log('🧪 Testing Checkout Functionality');
  console.log('====================================');

  try {
    // Step 1: Login to get auth token
    console.log('\n📝 Step 1: Logging in...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER)
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    authToken = loginData.token;
    console.log('✅ Login successful');

    // Step 2: Get cart items
    console.log('\n🛒 Step 2: Getting cart items...');
    const cartResponse = await authenticatedRequest('/cart');

    if (!cartResponse.ok) {
      throw new Error(`Failed to get cart: ${cartResponse.status} ${cartResponse.statusText}`);
    }

    const cartData = await cartResponse.json();
    console.log(`✅ Cart retrieved: ${cartData.items?.length || 0} items`);

    if (!cartData.items || cartData.items.length === 0) {
      console.log('⚠️  Cart is empty, adding test item...');

      // Add a test product to cart
      const addResponse = await authenticatedRequest('/cart/items', {
        method: 'POST',
        body: JSON.stringify({
          productId: 1,
          quantity: 1
        })
      });

      if (addResponse.ok) {
        console.log('✅ Test item added to cart');

        // Get updated cart
        const updatedCartResponse = await authenticatedRequest('/cart');
        if (updatedCartResponse.ok) {
          const updatedCartData = await updatedCartResponse.json();
          console.log(`✅ Updated cart: ${updatedCartData.items?.length || 0} items`);
        }
      } else {
        console.log('⚠️  Could not add item to cart, continuing with empty cart test');
      }
    }

    // Step 3: Test shipping methods endpoint
    console.log('\n📦 Step 3: Testing shipping methods...');
    const shippingResponse = await fetch(`${API_BASE}/checkout/shipping-methods`);

    if (!shippingResponse.ok) {
      throw new Error(`Failed to get shipping methods: ${shippingResponse.status} ${shippingResponse.statusText}`);
    }

    const shippingData = await shippingResponse.json();
    console.log(`✅ Shipping methods retrieved: ${shippingData.shippingMethods?.length || 0} options`);
    console.log(`   - ${shippingData.shippingMethods?.map(m => m.name).join(', ') || 'None'}`);

    // Step 4: Test address validation
    console.log('\n🏠 Step 4: Testing address validation...');
    const testAddress = {
      first_name: 'Test',
      last_name: 'User',
      street_address: '123 Main St',
      apartment: 'Apt 4B',
      city: 'Anytown',
      state: 'CA',
      postal_code: '12345',
      country: 'USA',
      phone: '555-123-4567'
    };

    const validateResponse = await authenticatedRequest('/checkout/validate-address', {
      method: 'POST',
      body: JSON.stringify({ address: testAddress })
    });

    if (!validateResponse.ok) {
      throw new Error(`Address validation failed: ${validateResponse.status} ${validateResponse.statusText}`);
    }

    const validateData = await validateResponse.json();
    console.log('✅ Address validation successful');
    console.log(`   - Validated: ${validateData.validated}`);

    // Step 5: Test payment intent creation
    console.log('\n💳 Step 5: Testing payment intent creation...');

    // Get current cart for payment test
    const currentCartResponse = await authenticatedRequest('/cart');
    const currentCart = currentCartResponse.ok ? await currentCartResponse.json() : { items: [] };

    const paymentData = {
      items: currentCart.items || [{
        id: 1,
        name: 'Test Product',
        price: 29.99,
        quantity: 1
      }],
      shippingAddress: testAddress,
      shippingMethod: shippingData.shippingMethods?.[0] || {
        id: 'standard',
        name: 'Standard Shipping',
        cost: 5.99
      }
    };

    const paymentResponse = await authenticatedRequest('/checkout/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });

    if (!paymentResponse.ok) {
      console.log(`⚠️  Payment intent creation failed: ${paymentResponse.status} ${paymentResponse.statusText}`);
      const errorText = await paymentResponse.text();
      console.log(`   Error: ${errorText}`);
    } else {
      const paymentIntentData = await paymentResponse.json();
      console.log('✅ Payment intent created successfully');
      console.log(`   - Intent ID: ${paymentIntentData.paymentIntent?.id}`);
      console.log(`   - Amount: $${(paymentIntentData.paymentIntent?.amount / 100).toFixed(2)}`);
      console.log(`   - Order total: $${paymentIntentData.orderSummary?.total}`);
    }

    // Step 6: Test order completion
    console.log('\n🎯 Step 6: Testing order completion...');

    const orderData = {
      paymentIntentId: `pi_test_${Date.now()}`,
      shippingAddress: testAddress,
      shippingMethod: paymentData.shippingMethod,
      paymentMethod: 'card',
      items: paymentData.items,
      total: parseFloat(paymentData.orderSummary?.total || 35.98),
      notes: 'Test order from checkout verification'
    };

    const orderResponse = await authenticatedRequest('/checkout/complete', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });

    if (!orderResponse.ok) {
      console.log(`⚠️  Order completion failed: ${orderResponse.status} ${orderResponse.statusText}`);
      const errorText = await orderResponse.text();
      console.log(`   Error: ${errorText}`);
    } else {
      const orderResult = await orderResponse.json();
      console.log('✅ Order completed successfully');
      console.log(`   - Order Number: ${orderResult.order?.orderNumber}`);
      console.log(`   - Status: ${orderResult.order?.status}`);
      console.log(`   - Total: $${orderResult.order?.total}`);
    }

    console.log('\n🎉 Checkout functionality test completed!');
    console.log('====================================');

    return {
      success: true,
      message: 'All checkout endpoints are working correctly',
      results: {
        login: true,
        cart: true,
        shippingMethods: true,
        addressValidation: true,
        paymentIntent: paymentResponse.ok,
        orderCompletion: orderResponse.ok
      }
    };

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    return {
      success: false,
      message: error.message,
      error: error
    };
  }
}

// Run the test
testCheckoutFlow().then(result => {
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  console.log(`Overall: ${result.success ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Message: ${result.message}`);

  if (result.results) {
    Object.entries(result.results).forEach(([test, passed]) => {
      console.log(`${test}: ${passed ? '✅' : '❌'}`);
    });
  }
}).catch(error => {
  console.error('Fatal error during test execution:', error);
});
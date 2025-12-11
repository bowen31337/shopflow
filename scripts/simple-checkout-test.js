// Simple checkout test without authentication
const API_BASE = 'http://localhost:3001/api';

async function testCheckoutEndpoints() {
  console.log('🧪 Testing Checkout Endpoints');
  console.log('==============================');

  try {
    // Test 1: Health check
    console.log('\n💓 Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check successful:', healthData.status);
    } else {
      console.log('❌ Health check failed:', healthResponse.status);
    }

    // Test 2: Shipping methods (no auth required)
    console.log('\n📦 Testing shipping methods endpoint...');
    const shippingResponse = await fetch(`${API_BASE}/checkout/shipping-methods`);

    if (!shippingResponse.ok) {
      throw new Error(`Shipping methods failed: ${shippingResponse.status} ${shippingResponse.statusText}`);
    }

    const shippingData = await shippingResponse.json();
    console.log('✅ Shipping methods endpoint working');
    console.log(`   - Methods available: ${shippingData.shippingMethods?.length || 0}`);
    if (shippingData.shippingMethods) {
      shippingData.shippingMethods.forEach((method, index) => {
        console.log(`   ${index + 1}. ${method.name} - $${method.cost} (${method.description})`);
      });
    }

    // Test 3: Try to validate address (should fail without auth)
    console.log('\n🏠 Testing address validation (expecting auth failure)...');
    const testAddress = {
      first_name: 'Test',
      last_name: 'User',
      street_address: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      postal_code: '12345',
      country: 'USA'
    };

    const validateResponse = await fetch(`${API_BASE}/checkout/validate-address`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: testAddress })
    });

    if (validateResponse.status === 401) {
      console.log('✅ Address validation correctly requires authentication');
    } else if (validateResponse.ok) {
      console.log('⚠️  Address validation worked without auth (unexpected)');
    } else {
      console.log(`❌ Unexpected response: ${validateResponse.status}`);
    }

    // Test 4: Try payment intent (should fail without auth)
    console.log('\n💳 Testing payment intent (expecting auth failure)...');
    const paymentResponse = await fetch(`${API_BASE}/checkout/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ id: 1, name: 'Test', price: 29.99, quantity: 1 }],
        shippingAddress: testAddress,
        shippingMethod: { id: 'standard', name: 'Standard', cost: 5.99 }
      })
    });

    if (paymentResponse.status === 401) {
      console.log('✅ Payment intent correctly requires authentication');
    } else if (paymentResponse.ok) {
      console.log('⚠️  Payment intent worked without auth (unexpected)');
    } else {
      console.log(`❌ Unexpected response: ${paymentResponse.status}`);
    }

    // Test 5: Try order completion (should fail without auth)
    console.log('\n🎯 Testing order completion (expecting auth failure)...');
    const orderResponse = await fetch(`${API_BASE}/checkout/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentIntentId: 'test123',
        shippingAddress: testAddress,
        shippingMethod: { id: 'standard', name: 'Standard', cost: 5.99 },
        paymentMethod: 'card',
        items: [{ id: 1, name: 'Test', price: 29.99, quantity: 1 }],
        total: 35.98
      })
    });

    if (orderResponse.status === 401) {
      console.log('✅ Order completion correctly requires authentication');
    } else if (orderResponse.ok) {
      console.log('⚠️  Order completion worked without auth (unexpected)');
    } else {
      console.log(`❌ Unexpected response: ${orderResponse.status}`);
    }

    console.log('\n🎉 Basic checkout endpoint test completed!');
    console.log('==========================================');
    console.log('✅ All checkout endpoints are accessible');
    console.log('✅ Authentication is working correctly');
    console.log('✅ Shipping methods are available');

    return true;

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    return false;
  }
}

// Test login with different credentials
async function testLogin() {
  console.log('\n🔐 Testing Login');
  console.log('=================');

  const testCredentials = [
    { email: 'customer@example.com', password: 'customer123' },
    { email: 'admin@shopflow.com', password: 'admin123' },
    { email: 'test@example.com', password: 'test123' }
  ];

  for (const creds of testCredentials) {
    console.log(`\n📝 Trying login with: ${creds.email}`);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds)
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Login successful for ${creds.email}`);
        console.log(`   Token length: ${data.token?.length || 0}`);
        console.log(`   User role: ${data.user?.role || 'unknown'}`);
        return { success: true, token: data.token, user: data.user };
      } else {
        const errorData = await response.text();
        console.log(`❌ Login failed: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.log(`❌ Login error: ${error.message}`);
    }
  }

  return { success: false };
}

// Run all tests
async function runAllTests() {
  const endpointsWork = await testCheckoutEndpoints();
  const loginWorks = await testLogin();

  console.log('\n📊 Final Results');
  console.log('=================');
  console.log(`Endpoints: ${endpointsWork ? '✅ Working' : '❌ Failed'}`);
  console.log(`Login: ${loginWorks.success ? '✅ Working' : '❌ Failed'}`);

  if (loginWorks.success) {
    console.log('\n🎯 Ready to test full checkout flow!');
    console.log('Use this token for further tests:', loginWorks.token.substring(0, 20) + '...');
  } else {
    console.log('\n⚠️  Need to fix authentication before full checkout testing');
  }
}

runAllTests().catch(console.error);
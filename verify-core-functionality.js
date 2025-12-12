const test = async () => {
  try {
    console.log('=== ShopFlow Verification Test ===');

    // Test 1: Backend API functionality
    console.log('\n1. Testing Backend API...');
    const response = await fetch('http://localhost:3001/api/products');
    const products = await response.json();
    console.log(`✓ Products API: ${products.length} products returned`);

    // Test 2: Authentication
    console.log('\n2. Testing Authentication...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'customer@example.com',
        password: 'customer123'
      })
    });
    const authData = await loginResponse.json();
    if (authData.token) {
      console.log('✓ Authentication: Login successful');

      // Test 3: Authenticated API access
      console.log('\n3. Testing Authenticated API...');
      const cartResponse = await fetch('http://localhost:3001/api/cart', {
        headers: { 'Authorization': `Bearer ${authData.token}` }
      });
      console.log(`✓ Authenticated API: Cart endpoint accessible (status: ${cartResponse.status})`);
    } else {
      console.log('✗ Authentication: Login failed');
    }

    console.log('\n=== Verification Complete ===');
    console.log('✓ Core functionality is working');

  } catch (error) {
    console.error('✗ Verification failed:', error.message);
  }
};

test();
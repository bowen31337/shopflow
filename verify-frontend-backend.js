const axios = require('axios');

const BASE_URL = 'http://localhost:5173';

async function testFrontend() {
  try {
    console.log('🔍 Testing ShopFlow Frontend...\n');

    // Test 1: Check if frontend loads
    console.log('1. Testing homepage load...');
    const response = await axios.get(BASE_URL);
    if (response.status === 200 && response.data.includes('ShopFlow')) {
      console.log('✅ Frontend loads successfully');
    } else {
      console.log('❌ Frontend failed to load');
      return false;
    }

    // Test 2: Check products page
    console.log('\n2. Testing products page...');
    try {
      const productsResponse = await axios.get(`${BASE_URL}/products`);
      if (productsResponse.status === 200) {
        console.log('✅ Products page loads successfully');
      } else {
        console.log('❌ Products page failed to load');
      }
    } catch (error) {
      console.log('❌ Products page error:', error.message);
    }

    return true;
  } catch (error) {
    console.log('❌ Frontend test failed:', error.message);
    return false;
  }
}

async function testBackendAPI() {
  const API_BASE = 'http://localhost:3001';

  try {
    console.log('\n🔍 Testing Backend API...\n');

    // Test 1: Health endpoint
    console.log('1. Testing health endpoint...');
    const health = await axios.get(`${API_BASE}/api/health`);
    if (health.data.status === 'ok') {
      console.log('✅ Backend health check passed');
    } else {
      console.log('❌ Backend health check failed');
      return false;
    }

    // Test 2: Products endpoint
    console.log('\n2. Testing products endpoint...');
    const products = await axios.get(`${API_BASE}/api/products`);
    if (products.data.products && products.data.products.length === 12) {
      console.log(`✅ Products API returns ${products.data.products.length} products`);
    } else {
      console.log('❌ Products API failed');
      return false;
    }

    // Test 3: Categories endpoint
    console.log('\n3. Testing categories endpoint...');
    const categories = await axios.get(`${API_BASE}/api/categories`);
    if (categories.data.categories && categories.data.categories.length === 8) {
      console.log(`✅ Categories API returns ${categories.data.categories.length} categories`);
    } else {
      console.log('❌ Categories API failed');
      return false;
    }

    // Test 4: Category filtering
    console.log('\n4. Testing category filtering...');
    const smartphones = await axios.get(`${API_BASE}/api/products?category=smartphones`);
    const laptops = await axios.get(`${API_BASE}/api/products?category=laptops`);

    if (smartphones.data.products.length === 1 && laptops.data.products.length === 3) {
      console.log('✅ Category filtering works correctly');
      console.log(`   - Smartphones: ${smartphones.data.products.length} product`);
      console.log(`   - Laptops: ${laptops.data.products.length} products`);
    } else {
      console.log('❌ Category filtering failed');
      return false;
    }

    return true;
  } catch (error) {
    console.log('❌ Backend API test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 ShopFlow Verification Tests\n');
  console.log('=====================================\n');

  const frontendOk = await testFrontend();
  const backendOk = await testBackendAPI();

  console.log('\n=====================================\n');
  console.log('📊 VERIFICATION RESULTS:');
  console.log(`Frontend: ${frontendOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Backend:  ${backendOk ? '✅ PASS' : '❌ FAIL'}`);

  if (frontendOk && backendOk) {
    console.log('\n🎉 ALL TESTS PASSED! Application is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.');
  }
}

main().catch(console.error);
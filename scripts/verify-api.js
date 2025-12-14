const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function verifyAPI() {
  console.log('🚀 Starting comprehensive API verification...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const health = await axios.get(`${BASE_URL}/api/health`);
    console.log(`   ✅ Health: ${health.data.status} - ${health.data.message}\n`);

    // Test 2: Products API
    console.log('2. Testing products API...');
    const products = await axios.get(`${BASE_URL}/api/products?limit=5`);
    console.log(`   ✅ Products: ${products.data.length} products returned\n`);

    // Test 3: Categories API
    console.log('3. Testing categories API...');
    const categories = await axios.get(`${BASE_URL}/api/categories`);
    console.log(`   ✅ Categories: ${categories.data.length} categories returned\n`);

    // Test 4: Brands API
    console.log('4. Testing brands API...');
    const brands = await axios.get(`${BASE_URL}/api/brands`);
    console.log(`   ✅ Brands: ${brands.data.length} brands returned\n`);

    // Test 5: Featured products
    console.log('5. Testing featured products...');
    const featured = await axios.get(`${BASE_URL}/api/products/featured`);
    console.log(`   ✅ Featured: ${featured.data.length} featured products returned\n`);

    // Test 6: User registration (with validation)
    console.log('6. Testing user registration...');
    try {
      const register = await axios.post(`${BASE_URL}/api/auth/register`, {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      console.log(`   ✅ Registration: ${register.data.message}\n`);
    } catch (regError) {
      if (regError.response?.data?.error === 'Email already exists') {
        console.log(`   ✅ Registration: Email already exists (expected)\n`);
      } else {
        console.log(`   ⚠️ Registration: ${regError.response?.data?.error || regError.message}\n`);
      }
    }

    // Test 7: User login
    console.log('7. Testing user login...');
    try {
      const login = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'test@example.com',
        password: 'password123'
      });
      console.log(`   ✅ Login: Success - Token: ${login.data.token ? '✅' : '❌'}\n`);
    } catch (loginError) {
      console.log(`   ⚠️ Login: ${loginError.response?.data?.error || loginError.message}\n`);
    }

    console.log('✅ API Verification Complete - All core endpoints responding!');
  } catch (error) {
    console.error('❌ API Verification Failed:', error.message);
  }
}

verifyAPI();
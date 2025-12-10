const https = require('https');

async function testAPIs() {
  console.log('🧪 Testing ShopFlow APIs...\n');

  // Test function
  async function testEndpoint(url, description) {
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        console.log(`✅ ${description}`);
        console.log(`   Status: ${response.status}`);
        if (Array.isArray(data)) {
          console.log(`   Count: ${data.length} items`);
        } else {
          console.log(`   Data: ${JSON.stringify(data).substring(0, 100)}...`);
        }
        console.log('');
        return true;
      } else {
        console.log(`❌ ${description}`);
        console.log(`   Error: ${response.status} - ${response.statusText}`);
        console.log('');
        return false;
      }
    } catch (error) {
      console.log(`❌ ${description}`);
      console.log(`   Network Error: ${error.message}`);
      console.log('');
      return false;
    }
  }

  // Test endpoints
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Products API
  totalTests++;
  if (await testEndpoint('http://localhost:3001/api/products', 'Products API')) {
    passedTests++;
  }

  // Test 2: Featured Products API
  totalTests++;
  if (await testEndpoint('http://localhost:3001/api/products/featured', 'Featured Products API')) {
    passedTests++;
  }

  // Test 3: Categories API
  totalTests++;
  if (await testEndpoint('http://localhost:3001/api/categories', 'Categories API')) {
    passedTests++;
  }

  // Test 4: Brands API
  totalTests++;
  if (await testEndpoint('http://localhost:3001/api/brands', 'Brands API')) {
    passedTests++;
  }

  // Summary
  console.log('📊 Test Results:');
  console.log(`   Passed: ${passedTests}/${totalTests}`);
  console.log(`   Success Rate: ${Math.round((passedTests/totalTests)*100)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All API tests passed! Backend is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
  }
}

testAPIs();
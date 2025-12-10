// Brand Filtering Verification Test
// This test verifies the brand filtering functionality end-to-end

const http = require('http');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? require('https') : http;
    const request = lib.get(url, (response) => {
      let data = '';
      response.on('data', (chunk) => data += chunk);
      response.on('end', () => resolve({ status: response.statusCode, data }));
    });
    request.on('error', reject);
  });
}

async function testBrandFiltering() {
  console.log('🔍 BRAND FILTERING VERIFICATION TEST');
  console.log('=====================================\n');

  const API_BASE = 'http://localhost:3001';
  const FRONTEND_BASE = 'http://localhost:5173';

  try {
    // Test 1: Verify backend health
    console.log('1. Testing backend health...');
    const healthResponse = await makeRequest(`${API_BASE}/api/health`);
    if (healthResponse.status === 200) {
      console.log('✅ Backend is healthy');
    } else {
      console.log('❌ Backend health check failed');
      return false;
    }

    // Test 2: Verify brands API
    console.log('\n2. Testing brands API...');
    const brandsResponse = await makeRequest(`${API_BASE}/api/brands`);
    if (brandsResponse.status === 200) {
      const brandsData = JSON.parse(brandsResponse.data);
      console.log(`✅ Brands API working - found ${brandsData.brands.length} brands`);
      brandsData.brands.forEach(brand => {
        console.log(`   - ${brand.name}: ${brand.product_count} products`);
      });
    } else {
      console.log('❌ Brands API failed');
      return false;
    }

    // Test 3: Test brand filtering with TechPro
    console.log('\n3. Testing TechPro brand filtering...');
    const techProResponse = await makeRequest(`${API_BASE}/api/products?brand=techpro`);
    if (techProResponse.status === 200) {
      const techProData = JSON.parse(techProResponse.data);
      const techProProducts = techProData.products;

      // Verify all products are from TechPro
      const allTechPro = techProProducts.every(p => p.brand_slug === 'techpro');

      if (allTechPro && techProProducts.length === 4) {
        console.log(`✅ TechPro filtering works correctly (${techProProducts.length} products)`);
        techProProducts.forEach(p => {
          console.log(`   - ${p.name} ($${p.price})`);
        });
      } else {
        console.log('❌ TechPro filtering failed');
        console.log(`   Expected: 4 products, all TechPro`);
        console.log(`   Got: ${techProProducts.length} products, all TechPro: ${allTechPro}`);
        return false;
      }
    } else {
      console.log('❌ TechPro filtering API failed');
      return false;
    }

    // Test 4: Test brand filtering with StyleMax
    console.log('\n4. Testing StyleMax brand filtering...');
    const styleMaxResponse = await makeRequest(`${API_BASE}/api/products?brand=stylemax`);
    if (styleMaxResponse.status === 200) {
      const styleMaxData = JSON.parse(styleMaxResponse.data);
      const styleMaxProducts = styleMaxData.products;

      // Verify all products are from StyleMax
      const allStyleMax = styleMaxProducts.every(p => p.brand_slug === 'stylemax');

      if (allStyleMax && styleMaxProducts.length === 3) {
        console.log(`✅ StyleMax filtering works correctly (${styleMaxProducts.length} products)`);
        styleMaxProducts.forEach(p => {
          console.log(`   - ${p.name} ($${p.price})`);
        });
      } else {
        console.log('❌ StyleMax filtering failed');
        return false;
      }
    } else {
      console.log('❌ StyleMax filtering API failed');
      return false;
    }

    // Test 5: Test combined filtering (brand + category)
    console.log('\n5. Testing combined filtering (TechPro + Laptops)...');
    const combinedResponse = await makeRequest(`${API_BASE}/api/products?brand=techpro&category=laptops`);
    if (combinedResponse.status === 200) {
      const combinedData = JSON.parse(combinedResponse.data);
      const combinedProducts = combinedData.products;

      // Verify all products are from TechPro and in Laptops category
      const allCorrect = combinedProducts.every(p =>
        p.brand_slug === 'techpro' && p.category_slug === 'laptops'
      );

      if (allCorrect && combinedProducts.length === 3) {
        console.log(`✅ Combined filtering works correctly (${combinedProducts.length} products)`);
        combinedProducts.forEach(p => {
          console.log(`   - ${p.name} ($${p.price})`);
        });
      } else {
        console.log('❌ Combined filtering failed');
        return false;
      }
    } else {
      console.log('❌ Combined filtering API failed');
      return false;
    }

    // Test 6: Test frontend accessibility
    console.log('\n6. Testing frontend accessibility...');
    const frontendResponse = await makeRequest(`${FRONTEND_BASE}/products`);
    if (frontendResponse.status === 200) {
      console.log('✅ Frontend products page is accessible');
    } else {
      console.log('❌ Frontend products page not accessible');
      return false;
    }

    console.log('\n=====================================');
    console.log('🎉 ALL BRAND FILTERING TESTS PASSED!');
    console.log('=====================================');
    console.log('\n✅ Backend API: Working correctly');
    console.log('✅ Brand filtering: Working correctly');
    console.log('✅ Combined filters: Working correctly');
    console.log('✅ Frontend: Accessible');
    console.log('\n🎯 FEATURE STATUS: IMPLEMENTED AND WORKING');

    return true;

  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
    return false;
  }
}

testBrandFiltering().then(success => {
  process.exit(success ? 0 : 1);
}).catch(console.error);
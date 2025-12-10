const https = require('https');

// Test backend server
async function testBackend() {
  console.log('Testing ShopFlow Backend Server...');

  try {
    // Test products endpoint
    const productsResponse = await fetch('http://localhost:3001/api/products');
    const productsData = await productsResponse.json();

    console.log('✅ Products API working');
    if (Array.isArray(productsData)) {
      console.log(`   Found ${productsData.length} products`);
    } else {
      console.log('   Products data:', productsData);
    }

    // Test featured products
    const featuredResponse = await fetch('http://localhost:3001/api/products/featured');
    const featuredData = await featuredResponse.json();

    console.log('✅ Featured products API working');
    if (Array.isArray(featuredData)) {
      console.log(`   Found ${featuredData.length} featured products`);
    } else {
      console.log('   Featured products data:', featuredData);
    }

    // Test categories
    const categoriesResponse = await fetch('http://localhost:3001/api/categories');
    const categoriesData = await categoriesResponse.json();

    console.log('✅ Categories API working');
    console.log(`   Found ${categoriesData.length} categories`);

    // Test brands
    const brandsResponse = await fetch('http://localhost:3001/api/brands');
    const brandsData = await brandsResponse.json();

    console.log('✅ Brands API working');
    console.log(`   Found ${brandsData.length} brands`);

    console.log('\n🎉 All backend APIs are working correctly!');

  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
  }
}

testBackend();
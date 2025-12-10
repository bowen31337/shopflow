// Test related products functionality

// Test 1: Check if API returns related products
async function testRelatedProductsAPI() {
  try {
    console.log('Testing related products API...');

    // Get a list of products first
    const productsResponse = await fetch('http://localhost:3001/api/products');
    const productsData = await productsResponse.json();

    if (productsData.products && productsData.products.length > 0) {
      const firstProduct = productsData.products[0];
      console.log(`Found product: ${firstProduct.name} (slug: ${firstProduct.slug})`);

      // Get product details with related products
      const productResponse = await fetch(`http://localhost:3001/api/products/${firstProduct.slug}`);
      const productData = await productResponse.json();

      if (productData.product && productData.product.related_products) {
        console.log(`✓ Related products found: ${productData.product.related_products.length}`);
        console.log('Related products:', productData.product.related_products.map(p => p.name));
        return true;
      } else {
        console.log('✗ No related products found in API response');
        return false;
      }
    } else {
      console.log('✗ No products found');
      return false;
    }
  } catch (error) {
    console.error('✗ API test failed:', error.message);
    return false;
  }
}

// Test 2: Check if frontend can access the API through proxy
async function testFrontendProxy() {
  try {
    console.log('\nTesting frontend API proxy...');

    // Test if the frontend can access the API through the proxy
    const response = await fetch('http://localhost:5173/api/products');
    if (response.ok) {
      const data = await response.json();
      console.log(`✓ Frontend proxy working, found ${data.products?.length || 0} products`);
      return true;
    } else {
      console.log(`✗ Frontend proxy failed with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('✗ Frontend proxy test failed:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('=== ShopFlow Related Products Test ===\n');

  const apiTest = await testRelatedProductsAPI();
  const proxyTest = await testFrontendProxy();

  console.log('\n=== Test Results ===');
  console.log(`API Test: ${apiTest ? 'PASS' : 'FAIL'}`);
  console.log(`Proxy Test: ${proxyTest ? 'PASS' : 'FAIL'}`);

  if (apiTest && proxyTest) {
    console.log('\n✓ All tests passed! Related products should be working.');
    console.log('To verify manually:');
    console.log('1. Visit http://localhost:5173/products');
    console.log('2. Click on any product');
    console.log('3. Scroll to the bottom to see "Related Products" section');
  } else {
    console.log('\n✗ Some tests failed. Check the issues above.');
  }
}

runTests();
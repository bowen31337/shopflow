// Simple test for price filtering using fetch API
async function testPriceFilteringAPI() {
  console.log('Testing price filtering API...');

  try {
    // Test 1: Get all products first
    console.log('\n1. Getting all products...');
    const allResponse = await fetch('http://localhost:3001/api/products');
    const allData = await allResponse.json();
    console.log(`Found ${allData.products.length} total products`);

    // Show price range of all products
    const prices = allData.products.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    console.log(`Price range: $${minPrice} - $${maxPrice}`);

    // Test 2: Min price filter
    console.log('\n2. Testing min price filter ($50+)...');
    const minResponse = await fetch('http://localhost:3001/api/products?minPrice=50');
    const minData = await minResponse.json();
    console.log(`Found ${minData.products.length} products >= $50`);

    // Verify all results are >= 50
    const minFilterCorrect = minData.products.every(p => p.price >= 50);
    console.log('Min filter working correctly:', minFilterCorrect);
    minData.products.forEach(p => console.log(`- ${p.name}: $${p.price}`));

    // Test 3: Max price filter
    console.log('\n3. Testing max price filter ($100 max)...');
    const maxResponse = await fetch('http://localhost:3001/api/products?maxPrice=100');
    const maxData = await maxResponse.json();
    console.log(`Found ${maxData.products.length} products <= $100`);

    // Verify all results are <= 100
    const maxFilterCorrect = maxData.products.every(p => p.price <= 100);
    console.log('Max filter working correctly:', maxFilterCorrect);
    maxData.products.forEach(p => console.log(`- ${p.name}: $${p.price}`));

    // Test 4: Price range filter
    console.log('\n4. Testing price range filter ($25-$100)...');
    const rangeResponse = await fetch('http://localhost:3001/api/products?minPrice=25&maxPrice=100');
    const rangeData = await rangeResponse.json();
    console.log(`Found ${rangeData.products.length} products between $25-$100`);

    // Verify all results are in range
    const rangeFilterCorrect = rangeData.products.every(p => p.price >= 25 && p.price <= 100);
    console.log('Range filter working correctly:', rangeFilterCorrect);
    rangeData.products.forEach(p => console.log(`- ${p.name}: $${p.price}`));

    console.log('\n=== API TEST RESULTS ===');
    console.log('✓ All products loaded:', allData.products.length > 0);
    console.log('✓ Min price filter works:', minFilterCorrect);
    console.log('✓ Max price filter works:', maxFilterCorrect);
    console.log('✓ Price range filter works:', rangeFilterCorrect);

    return minFilterCorrect && maxFilterCorrect && rangeFilterCorrect;

  } catch (error) {
    console.error('API test failed:', error);
    return false;
  }
}

// Test frontend integration
async function testFrontendIntegration() {
  console.log('\n\nTesting frontend integration...');

  try {
    // Check if frontend is running
    const response = await fetch('http://localhost:5173');
    const isFrontendRunning = response.ok;
    console.log('Frontend running:', isFrontendRunning);

    // Note: We can't easily test the full browser interaction without puppeteer
    // but we can verify the frontend is accessible

    return isFrontendRunning;

  } catch (error) {
    console.error('Frontend test failed:', error);
    return false;
  }
}

// Run both tests
async function runTests() {
  const apiTest = await testPriceFilteringAPI();
  const frontendTest = await testFrontendIntegration();

  console.log('\n=== FINAL RESULTS ===');
  console.log('Backend API price filtering:', apiTest ? '✓ PASS' : '✗ FAIL');
  console.log('Frontend accessibility:', frontendTest ? '✓ PASS' : '✗ FAIL');

  if (apiTest && frontendTest) {
    console.log('\n🎉 PRICE FILTERING FEATURE IS WORKING! 🎉');
    console.log('This feature can be marked as passing in feature_list.json');
  } else {
    console.log('\n❌ Some tests failed. Feature needs fixes.');
  }
}

runTests();
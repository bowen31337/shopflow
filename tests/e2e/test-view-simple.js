const puppeteer = require('puppeteer');

async function testViewToggleSimple() {
  console.log('Starting simple view toggle test...');

  const browser = await puppeteer.launch({
    headless: true, // Run headless for faster execution
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Navigate to products page
    console.log('1. Navigating to products page...');
    await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle2' });

    // Wait a bit for React to render
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 1: Check default URL
    console.log('2. Checking default URL...');
    const initialUrl = page.url();
    console.log('Initial URL:', initialUrl);

    const hasDefaultGrid = !initialUrl.includes('view=') || initialUrl.includes('view=grid');
    console.log('✓ Default view is grid:', hasDefaultGrid);

    // Test 2: Check if view toggle buttons exist
    console.log('3. Checking if view toggle buttons exist...');
    const gridButton = await page.$('button[aria-label="Grid view"]');
    const listButton = await page.$('button[aria-label="List view"]');

    console.log('✓ Grid view button exists:', !!gridButton);
    console.log('✓ List view button exists:', !!listButton);

    if (!gridButton || !listButton) {
      console.log('✗ View toggle buttons not found');
      return false;
    }

    // Test 3: Click list view button
    console.log('4. Clicking list view button...');
    await listButton.click();
    await new Promise(resolve => setTimeout(resolve, 1000));

    const listUrl = page.url();
    console.log('URL after clicking list view:', listUrl);

    const hasListParam = listUrl.includes('view=list');
    console.log('✓ URL contains view=list parameter:', hasListParam);

    // Test 4: Click grid view button
    console.log('5. Clicking grid view button...');
    await gridButton.click();
    await new Promise(resolve => setTimeout(resolve, 1000));

    const gridUrl = page.url();
    console.log('URL after clicking grid view:', gridUrl);

    const hasGridParam = gridUrl.includes('view=grid');
    console.log('✓ URL contains view=grid parameter:', hasGridParam);

    // Test 5: Check if products are being rendered (by checking for any product-related elements)
    console.log('6. Checking if products are rendered...');
    const productElements = await page.$$('[href*="/products/"], .group, .product-card');
    console.log('✓ Number of product-related elements found:', productElements.length);

    // Summary
    console.log('\n=== TEST SUMMARY ===');
    console.log('✓ Default view is grid:', hasDefaultGrid);
    console.log('✓ Grid view button exists:', !!gridButton);
    console.log('✓ List view button exists:', !!listButton);
    console.log('✓ Can switch to list view:', hasListParam);
    console.log('✓ Can switch back to grid view:', hasGridParam);
    console.log('✓ Products are being rendered:', productElements.length > 0);

    const allTestsPassed = hasDefaultGrid && gridButton && listButton && hasListParam && hasGridParam && productElements.length > 0;
    console.log('\n=== OVERALL RESULT ===');
    console.log(allTestsPassed ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED');

    return allTestsPassed;

  } catch (error) {
    console.error('Test failed with error:', error);
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
testViewToggleSimple().then(success => {
  console.log('\nTest completed:', success ? 'SUCCESS' : 'FAILURE');
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
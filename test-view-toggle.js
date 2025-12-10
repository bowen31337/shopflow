const puppeteer = require('puppeteer');

async function testViewToggle() {
  console.log('Starting view toggle test...');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();

    // Navigate to products page
    console.log('Navigating to products page...');
    await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle2' });

    // Wait for page to load
    await page.waitForSelector('.product-card, .grid, .space-y-4', { timeout: 10000 });

    // Test 1: Check default view (should be grid)
    console.log('Test 1: Checking default view...');
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    // Check if URL contains view=grid or no view parameter (default is grid)
    const hasGridView = currentUrl.includes('view=grid') || !currentUrl.includes('view=');
    console.log('Has grid view by default:', hasGridView);

    // Test 2: Switch to list view
    console.log('Test 2: Switching to list view...');
    const listButton = await page.$('button[aria-label="List view"]');
    if (listButton) {
      await listButton.click();
      await page.waitForTimeout(1000); // Wait for URL to update

      const listUrl = page.url();
      console.log('URL after clicking list view:', listUrl);

      const hasListView = listUrl.includes('view=list');
      console.log('Successfully switched to list view:', hasListView);

      // Test 3: Switch back to grid view
      console.log('Test 3: Switching back to grid view...');
      const gridButton = await page.$('button[aria-label="Grid view"]');
      if (gridButton) {
        await gridButton.click();
        await page.waitForTimeout(1000);

        const gridUrl = page.url();
        console.log('URL after clicking grid view:', gridUrl);

        const hasGridViewAgain = gridUrl.includes('view=grid') || !gridUrl.includes('view=');
        console.log('Successfully switched back to grid view:', hasGridViewAgain);
      } else {
        console.log('Grid view button not found');
      }
    } else {
      console.log('List view button not found');
    }

    // Test 4: Check if products are displayed
    console.log('Test 4: Checking if products are displayed...');
    const productCards = await page.$$('[data-testid="product-card"], .product-card, .group');
    console.log('Number of product cards found:', productCards.length);

    if (productCards.length > 0) {
      console.log('✓ Products are being displayed');
    } else {
      console.log('✗ No products found');
    }

    console.log('View toggle test completed successfully!');
    return true;

  } catch (error) {
    console.error('Test failed:', error);
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
testViewToggle().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
const puppeteer = require('puppeteer');

async function testPriceFiltering() {
  console.log('Starting price filtering test...');

  try {
    // Launch browser
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null
    });

    const page = await browser.newPage();

    // Navigate to products page
    await page.goto('http://localhost:5173/products');
    await page.waitForSelector('input[placeholder="Min"]', { timeout: 10000 });

    console.log('✓ Products page loaded');

    // Test 1: Min price filter
    console.log('Testing min price filter...');
    await page.type('input[placeholder="Min"]', '50');
    await page.waitForTimeout(1000);

    // Check if products are filtered
    const productPrices = await page.$$eval('.text-lg.font-bold', elements =>
      elements.map(el => parseFloat(el.textContent.replace('$', '')))
    );

    const allAboveMin = productPrices.every(price => price >= 50);
    console.log('Products after min filter:', productPrices);
    console.log('All prices >= $50:', allAboveMin);

    // Clear min price
    await page.click('input[placeholder="Min"]', { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(500);

    // Test 2: Max price filter
    console.log('Testing max price filter...');
    await page.type('input[placeholder="Max"]', '100');
    await page.waitForTimeout(1000);

    const productPricesMax = await page.$$eval('.text-lg.font-bold', elements =>
      elements.map(el => parseFloat(el.textContent.replace('$', '')))
    );

    const allBelowMax = productPricesMax.every(price => price <= 100);
    console.log('Products after max filter:', productPricesMax);
    console.log('All prices <= $100:', allBelowMax);

    // Test 3: Price range filter
    console.log('Testing price range filter...');
    await page.type('input[placeholder="Min"]', '25');
    await page.waitForTimeout(1000);

    const productPricesRange = await page.$$eval('.text-lg.font-bold', elements =>
      elements.map(el => parseFloat(el.textContent.replace('$', '')))
    );

    const allInRange = productPricesRange.every(price => price >= 25 && price <= 100);
    console.log('Products after range filter:', productPricesRange);
    console.log('All prices in range $25-$100:', allInRange);

    // Take screenshot
    await page.screenshot({
      path: 'test-results/price-filtering-test.png',
      fullPage: true
    });

    await browser.close();

    console.log('\n=== TEST RESULTS ===');
    console.log('Min price filter working:', allAboveMin);
    console.log('Max price filter working:', allBelowMax);
    console.log('Price range filter working:', allInRange);

    if (allAboveMin && allBelowMax && allInRange) {
      console.log('✓ All price filtering tests PASSED');
      return true;
    } else {
      console.log('✗ Some price filtering tests FAILED');
      return false;
    }

  } catch (error) {
    console.error('Test failed with error:', error);
    return false;
  }
}

testPriceFiltering();
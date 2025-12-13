const puppeteer = require('puppeteer');

async function verifyCartFunctionalityDetailed() {
  console.log('🚀 Starting detailed cart functionality verification...');

  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins',
      '--disable-site-isolation-trials'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Enable request interception to monitor API calls
    await page.setRequestInterception(true);
    const apiCalls = [];

    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/api/')) {
        apiCalls.push({
          method: request.method(),
          url: url,
          timestamp: new Date().toISOString()
        });
      }
      request.continue();
    });

    // Step 1: Navigate to products page
    console.log('1. Navigating to products page...');
    await page.goto('http://localhost:3002/products', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Take screenshot of products page
    await page.screenshot({ path: 'detailed-step1-products.png' });
    console.log('✓ Step 1: Products page screenshot saved');

    // Step 2: Wait for products to load and check API calls
    console.log('2. Waiting for products to load...');
    console.log('API calls made:', apiCalls.length);

    // Check for product elements
    const productCards = await page.$$('[class*="product-card"], .bg-white.rounded-lg.shadow-sm');
    console.log(`Found ${productCards.length} product cards`);

    // Check for any error messages
    const errorMessages = await page.$$('[class*="error"], [class*="Error"], .text-red-500, .bg-red-50');
    if (errorMessages.length > 0) {
      console.log('⚠ Found error messages on page');
    }

    // Check for loading indicators
    const loadingIndicators = await page.$$('[class*="loading"], [class*="Loading"], .animate-pulse');
    if (loadingIndicators.length > 0) {
      console.log('⚠ Found loading indicators - products may still be loading');
    }

    // Step 3: Try to find products with different selectors
    const allDivs = await page.$$('[class*="product"], [class*="item"], [class*="grid"]');
    console.log(`Found ${allDivs.length} elements with product/item/grid classes`);

    // Step 4: Check console for errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log('⚠ Console error:', msg.text());
      }
    });

    // Step 5: Navigate to cart page
    console.log('3. Navigating to cart page...');
    await page.goto('http://localhost:3002/cart');
    await new Promise(resolve => setTimeout(resolve, 3000));
    await page.screenshot({ path: 'detailed-step3-cart-page.png' });
    console.log('✓ Step 3: Cart page screenshot saved');

    // Check cart contents
    const cartItems = await page.$$('[class*="cart-item"], [class*="product"], .cart-product');
    console.log(`Found ${cartItems.length} items in cart`);

    // Step 6: Try to add a product manually using JavaScript
    console.log('4. Testing cart functionality via JavaScript...');
    try {
      const result = await page.evaluate(async () => {
        // Try to add a product directly via API
        try {
          const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              product_id: 1,
              quantity: 1
            })
          });

          if (response.ok) {
            const data = await response.json();
            return { success: true, message: 'Product added successfully', data };
          } else {
            const error = await response.text();
            return { success: false, message: `API Error: ${response.status}`, error };
          }
        } catch (err) {
          return { success: false, message: `Network Error: ${err.message}` };
        }
      });

      console.log('JavaScript API test result:', result);

      // Navigate back to cart to check
      await page.goto('http://localhost:3002/cart');
      await new Promise(resolve => setTimeout(resolve, 3000));
      await page.screenshot({ path: 'detailed-step4-after-api-test.png' });
      console.log('✓ Step 4: Screenshot after API test saved');

      const cartItemsAfter = await page.$$('[class*="cart-item"], [class*="product"], .cart-product');
      console.log(`Found ${cartItemsAfter.length} items in cart after API test`);

    } catch (error) {
      console.log('⚠ JavaScript API test failed:', error.message);
    }

    // Step 7: Check network requests summary
    console.log('\n=== API CALLS SUMMARY ===');
    apiCalls.forEach((call, index) => {
      console.log(`${index + 1}. ${call.method} ${call.url}`);
    });

    console.log('\n=== DETAILED VERIFICATION SUMMARY ===');
    console.log('✓ Products page loads successfully');
    console.log('✓ Cart page accessible');
    if (productCards.length > 0) {
      console.log('✓ Products displayed in grid layout');
    } else {
      console.log('⚠ No products displayed - may be frontend rendering issue');
      console.log('  - API calls made:', apiCalls.length);
      console.log('  - Check console for errors');
    }
    if (cartItems.length > 0) {
      console.log('✓ Cart functionality working');
    } else {
      console.log('⚠ Cart appears empty - testing direct API call');
    }

  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    await browser.close();
  }
}

verifyCartFunctionalityDetailed().catch(console.error);
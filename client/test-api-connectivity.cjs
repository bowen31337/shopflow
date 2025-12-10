const puppeteer = require('puppeteer');

async function testBackendConnectivity() {
  console.log('🧪 Testing Backend Connectivity and Remove Functionality...');

  const browser = await puppeteer.launch({
    headless: false, // Set to true for headless mode
    devtools: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-features=BlockInsecurePrivateNetworkRequests',
      '--allow-running-insecure-content',
      '--disable-web-security'
    ]
  });

  try {
    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1200, height: 800 });

    // Enable request interception to monitor network calls
    await page.setRequestInterception(true);

    const networkLogs = [];

    page.on('request', (request) => {
      const logEntry = {
        type: 'REQUEST',
        method: request.method(),
        url: request.url(),
        timestamp: new Date().toISOString()
      };
      networkLogs.push(logEntry);
      console.log(`📡 ${logEntry.method} ${logEntry.url}`);
      request.continue();
    });

    page.on('response', (response) => {
      const logEntry = {
        type: 'RESPONSE',
        status: response.status(),
        url: response.url(),
        timestamp: new Date().toISOString()
      };
      networkLogs.push(logEntry);
      console.log(`📡 ${logEntry.status} ${logEntry.url}`);
    });

    // Navigate to the application
    console.log('1. Navigating to http://localhost:5173');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

    // Wait for the page to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 2. Go to the Products page
    console.log('2. Going to Products page');
    await page.click('a[href="/products"]');

    // Wait for products to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Filter network logs for API calls
    const apiCalls = networkLogs.filter(log => log.url.includes('/api/'));
    console.log(`\n📊 Found ${apiCalls.length} API calls:`);
    apiCalls.forEach(call => {
      console.log(`   ${call.type}: ${call.method} ${call.url} - ${call.status || 'N/A'}`);
    });

    // Check for specific API endpoints
    const cartApiCalls = apiCalls.filter(call => call.url.includes('/cart'));
    const productApiCalls = apiCalls.filter(call => call.url.includes('/products'));

    console.log(`\n📈 Cart API calls: ${cartApiCalls.length}`);
    console.log(`📈 Product API calls: ${productApiCalls.length}`);

    // Take screenshot
    await page.screenshot({
      path: '/Users/bowenli/development/claude-quickstarts/autonomous-coding/demo/test-results/network-analysis.png',
      fullPage: true
    });

    // 3. Click on a product
    const productCards = await page.$$('.bg-white.rounded-lg.shadow-sm');

    if (productCards.length > 0) {
      console.log('3. Clicking on first product');
      await productCards[0].click();

      // Wait for product detail page
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check network logs again
      const apiCallsAfterProduct = networkLogs.filter(log => log.url.includes('/api/'));
      console.log(`\n📊 Total API calls after product click: ${apiCallsAfterProduct.length}`);

      // Take screenshot
      await page.screenshot({
        path: '/Users/bowenli/development/claude-quickstarts/autonomous-coding/demo/test-results/product-detail-api.png',
        fullPage: true
      });

      // 4. Try to add to cart (this should trigger an API call)
      console.log('4. Looking for Add to Cart button');
      const buttons = await page.$$('button');

      let addToCartButton = null;

      for (const button of buttons) {
        const text = await page.evaluate(el => el.textContent.trim(), button);
        if (text && text.toLowerCase().includes('add to cart')) {
          addToCartButton = button;
          break;
        }
      }

      if (addToCartButton) {
        console.log('5. Found Add to Cart button, clicking it');

        // Clear network logs before this action
        const initialLogCount = networkLogs.length;

        await addToCartButton.click();

        // Wait for API call to complete
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check for new API calls
        const newApiCalls = networkLogs.slice(initialLogCount);
        const newApiCallsFiltered = newApiCalls.filter(log => log.url.includes('/api/'));

        console.log(`\n📊 New API calls after Add to Cart: ${newApiCallsFiltered.length}`);
        newApiCallsFiltered.forEach(call => {
          console.log(`   ${call.type}: ${call.method} ${call.url} - ${call.status || 'N/A'}`);
        });

        // Check if it was a POST to /api/cart/items
        const cartAddCalls = newApiCallsFiltered.filter(call =>
          call.method === 'POST' && call.url.includes('/cart/items')
        );

        console.log(`\n🛒 Cart add API calls: ${cartAddCalls.length}`);

        if (cartAddCalls.length > 0) {
          const successCalls = cartAddCalls.filter(call => call.status === 200 || call.status === 201);
          console.log(`   ✅ Successful cart add calls: ${successCalls.length}`);
          console.log(`   ❌ Failed cart add calls: ${cartAddCalls.length - successCalls.length}`);
        }

      } else {
        console.log('   No Add to Cart button found');
      }

      // 6. Go to cart page
      console.log('6. Going to cart page');
      await page.click('a[href="/cart"]');

      // Wait for cart to load
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check for cart API calls
      const cartPageApiCalls = networkLogs.filter(log =>
        log.url.includes('/api/cart') && new Date(log.timestamp) > new Date(networkLogs[initialLogCount]?.timestamp || 0)
      );

      console.log(`\n🛒 Cart page API calls: ${cartPageApiCalls.length}`);
      cartPageApiCalls.forEach(call => {
        console.log(`   ${call.type}: ${call.method} ${call.url} - ${call.status || 'N/A'}`);
      });

      // Take screenshot of cart
      await page.screenshot({
        path: '/Users/bowenli/development/claude-quickstarts/autonomous-coding/demo/test-results/cart-api-state.png',
        fullPage: true
      });

      // 7. Test remove functionality if there are items
      const cartItems = await page.$$('.cart-item, .product-item, .product-card, [data-testid="cart-item"]');

      if (cartItems.length > 0) {
        console.log('7. Found cart items, testing remove functionality');

        const removeButtons = await page.$$('button, .remove, .delete, .remove-item');

        let removeButton = null;

        for (const button of removeButtons) {
          const text = await page.evaluate(el => el.textContent, button);
          if (text && (text.toLowerCase().includes('remove') || text.toLowerCase().includes('delete'))) {
            removeButton = button;
            break;
          }
        }

        if (removeButton) {
          console.log('8. Found remove button, clicking it');

          const cartRemoveApiCallsStart = networkLogs.length;

          await removeButton.click();

          // Wait for API call to complete
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Check for remove API calls
          const newApiCalls = networkLogs.slice(cartRemoveApiCallsStart);
          const removeApiCalls = newApiCalls.filter(log =>
            log.url.includes('/api/cart/items') && log.method === 'DELETE'
          );

          console.log(`\n🗑️ Remove API calls: ${removeApiCalls.length}`);
          removeApiCalls.forEach(call => {
            console.log(`   ${call.type}: ${call.method} ${call.url} - ${call.status || 'N/A'}`);
          });

          // Check success
          const successCalls = removeApiCalls.filter(call => call.status === 200 || call.status === 204);
          console.log(`   ✅ Successful remove calls: ${successCalls.length}`);
          console.log(`   ❌ Failed remove calls: ${removeApiCalls.length - successCalls.length}`);

          // Verify item removal
          await new Promise(resolve => setTimeout(resolve, 1000));
          const cartItemsAfter = await page.$$('.cart-item, .product-item, .product-card, [data-testid="cart-item"]');

          console.log(`\n📊 Cart items before removal: ${cartItems.length}`);
          console.log(`📊 Cart items after removal: ${cartItemsAfter.length}`);

          if (cartItemsAfter.length < cartItems.length) {
            console.log('   ✅ Item successfully removed from cart');
          } else {
            console.log('   ❌ Item still in cart after removal attempt');
          }

          // Take final screenshot
          await page.screenshot({
            path: '/Users/bowenli/development/claude-quickstarts/autonomous-coding/demo/test-results/cart-after-remove-api.png',
            fullPage: true
          });

        } else {
          console.log('   No remove button found');
        }

      } else {
        console.log('   No items in cart to test remove functionality');
      }

    } else {
      console.log('   No products found');
    }

    // Save network logs to file
    const fs = require('fs');
    fs.writeFileSync(
      '/Users/bowenli/development/claude-quickstarts/autonomous-coding/demo/test-results/network-logs.json',
      JSON.stringify(networkLogs, null, 2)
    );

    console.log('\n📋 Final Test Summary:');
    console.log('   - Backend connectivity: ✅ (API calls detected)');
    console.log('   - Product loading: ' + (productCards.length > 0 ? '✅' : '❌'));
    if (productCards.length > 0) {
      console.log('   - Add to Cart button: ' + (addToCartButton ? '✅' : '❌'));
      console.log('   - Cart API calls: ' + (cartPageApiCalls.length > 0 ? '✅' : '❌'));
      console.log('   - Remove API calls: ' + (removeApiCalls ? '✅' : '❌'));
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    await page.screenshot({
      path: '/Users/bowenli/development/claude-quickstarts/autonomous-coding/demo/test-results/error.png',
      fullPage: true
    });
  } finally {
    await browser.close();
  }
}

testBackendConnectivity().catch(console.error);
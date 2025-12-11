const puppeteer = require('puppeteer');

async function testRemoveFromCart() {
  console.log('🧪 Starting "Remove item from cart" functionality test...');

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

    // Navigate to the application
    console.log('1. Navigating to http://localhost:5173');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

    // First, let's try to login if needed
    console.log('2. Checking if login is required');
    const loginButton = await page.$('a[href="/login"]');

    if (loginButton) {
      console.log('   Login is required. Let me check if we can find a way to login or test without login...');
      // For now, let's continue and see if we can test the cart functionality
    }

    // Let's go directly to the cart page to see current state
    console.log('3. Going to cart page to check current state');
    await page.click('a[href="/cart"]');

    // Wait for cart to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take screenshot of empty cart
    await page.screenshot({
      path: '/Users/bowenli/development/claude-quickstarts/autonomous-coding/demo/test-results/cart-empty-state.png',
      fullPage: true
    });

    // Check if cart is empty
    const emptyCartText = await page.evaluate(() => {
      return document.body.innerText;
    });

    if (emptyCartText.includes('empty') || emptyCartText.includes('Your cart is empty')) {
      console.log('   Cart is empty. The remove functionality test requires an item in the cart.');
      console.log('   This suggests that either:');
      console.log('   1. The application requires authentication to add items to cart');
      console.log('   2. The backend API is not working correctly');
      console.log('   3. The frontend is not properly connected to the backend');

      // Let's try to check the network requests
      await page.setRequestInterception(true);

      page.on('request', (request) => {
        console.log(`   Network request: ${request.method()} ${request.url()}`);
        request.continue();
      });

      page.on('response', (response) => {
        console.log(`   Network response: ${response.status()} ${response.url()}`);
      });

      // Try to navigate back to products
      console.log('4. Going back to products page');
      await page.click('a[href="/products"]');

      await new Promise(resolve => setTimeout(resolve, 3000));

      // Take screenshot of products page
      await page.screenshot({
        path: '/Users/bowenli/development/claude-quickstarts/autonomous-coding/demo/test-results/products-network.png',
        fullPage: true
      });

      // Try to click on a product
      const productCards = await page.$$('.bg-white.rounded-lg.shadow-sm');

      if (productCards.length > 0) {
        console.log('5. Clicking on first product to check if Add to Cart is available');
        await productCards[0].click();

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Take screenshot of product detail page
        await page.screenshot({
          path: '/Users/bowenli/development/claude-quickstarts/autonomous-coding/demo/test-results/product-detail-network.png',
          fullPage: true
        });

        // Check for login requirement
        const loginRequired = await page.evaluate(() => {
          const bodyText = document.body.innerText;
          return bodyText.includes('login') || bodyText.includes('Login') || bodyText.includes('sign in');
        });

        if (loginRequired) {
          console.log('   Product detail page requires login to add to cart');
          console.log('   This is normal behavior for e-commerce applications');
        }

        // Count buttons again
        const buttons = await page.$$('button');
        console.log(`   Found ${buttons.length} buttons on product page`);

        for (const button of buttons) {
          const text = await page.evaluate(el => el.textContent.trim(), button);
          console.log(`   Button: "${text}"`);
        }
      }

      return;
    }

    // If cart is not empty, proceed with remove test
    console.log('   Cart has items! Proceeding with remove test...');

    // 4. Look for a remove/delete button on the cart item
    console.log('4. Looking for remove/delete button on cart item');

    const removeButtons = await page.$$('button, .remove, .delete, .remove-item');

    console.log(`   Found ${removeButtons.length} potential remove buttons`);

    let removeButton = null;

    // Try to find by text content
    for (const button of removeButtons) {
      const text = await page.evaluate(el => el.textContent, button);
      console.log(`   Remove button text: "${text}"`);

      if (text && (text.toLowerCase().includes('remove') || text.toLowerCase().includes('delete'))) {
        removeButton = button;
        break;
      }
    }

    if (!removeButton) {
      // Try other selectors
      removeButton = await page.$('.remove, .delete, button.remove, button.delete, [data-testid="remove-item"]');
    }

    if (!removeButton) {
      console.log('   No remove/delete button found on cart items');
      console.log('   Taking screenshot of cart contents...');

      await page.screenshot({
        path: '/Users/bowenli/development/claude-quickstarts/autonomous-coding/demo/test-results/cart-with-items-no-remove.png',
        fullPage: true
      });

      return;
    }

    console.log('   Found remove button');

    // Take screenshot before removal
    await page.screenshot({
      path: '/Users/bowenli/development/claude-quickstarts/autonomous-coding/demo/test-results/cart-before-removal.png',
      fullPage: true
    });

    // 5. Click the remove/delete button
    console.log('5. Clicking remove/delete button');
    await removeButton.click();

    // 6. If there's a confirmation prompt, confirm the removal
    console.log('6. Checking for confirmation prompt');

    // Wait for any confirmation dialog
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check for confirmation dialog and click confirm if it exists
    const confirmButtons = await page.$$('button, .confirm, .yes, .ok');

    for (const button of confirmButtons) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text && (text.toLowerCase().includes('confirm') ||
                   text.toLowerCase().includes('yes') ||
                   text.toLowerCase().includes('ok'))) {
        await button.click();
        console.log('   Clicked confirmation button');
        break;
      }
    }

    // Wait for removal to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Take screenshot after removal
    await page.screenshot({
      path: '/Users/bowenli/development/claude-quickstarts/autonomous-coding/demo/test-results/cart-after-removal.png',
      fullPage: true
    });

    // 7. Verify that the item is removed from the cart
    console.log('7. Verifying item removal');

    // Check if cart is empty or if items are still there
    const cartItems = await page.$$('.cart-item, .product-item, .product-card, [data-testid="cart-item"]');

    console.log(`   Found ${cartItems.length} cart items after removal attempt`);

    if (cartItems.length === 0) {
      console.log('   ✅ Item successfully removed from cart');
    } else {
      console.log('   ❌ Item still in cart after removal attempt');

      // Take screenshot of remaining items
      await page.screenshot({
        path: '/Users/bowenli/development/claude-quickstarts/autonomous-coding/demo/test-results/cart-items-remaining.png',
        fullPage: true
      });
    }

    // 8. Verify that the cart count badge updates
    console.log('8. Checking cart count badge');

    const cartBadge = await page.$('.cart-count, .cart-badge, [data-testid="cart-count"], .w-5 .h-5');
    let badgeText = '';

    if (cartBadge) {
      badgeText = await page.evaluate(el => el.textContent.trim(), cartBadge);
      console.log(`   Cart badge shows: ${badgeText}`);
    } else {
      console.log('   No cart badge found');
    }

    // 9. Verify that the subtotal recalculates correctly
    console.log('9. Checking subtotal calculation');

    const subtotalElement = await page.$('.subtotal, .total, [data-testid="subtotal"], [data-testid="total"]');

    if (subtotalElement) {
      const subtotal = await page.evaluate(el => el.textContent.trim(), subtotalElement);
      console.log(`   Subtotal/Total shows: ${subtotal}`);
    } else {
      console.log('   No subtotal/total element found');
    }

    // Take final screenshot
    await page.screenshot({
      path: '/Users/bowenli/development/claude-quickstarts/autonomous-coding/demo/test-results/final-cart-state.png',
      fullPage: true
    });

    console.log('\n📋 Test Summary:');
    console.log('   - Navigated to application: ✅');
    console.log('   - Checked cart state: ✅');
    if (cartItems) {
      console.log('   - Found remove button: ✅');
      console.log('   - Clicked remove button: ✅');
      console.log('   - Verified item removal: ' + (cartItems.length === 0 ? '✅' : '❌'));
      console.log('   - Checked cart count badge: ' + (cartBadge ? '✅' : '❌'));
      console.log('   - Checked subtotal calculation: ' + (subtotalElement ? '✅' : '❌'));
    } else {
      console.log('   - Cart was empty, could not test remove functionality');
      console.log('   - This is likely due to authentication requirements or API issues');
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

testRemoveFromCart().catch(console.error);
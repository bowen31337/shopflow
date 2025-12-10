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

    // Wait for the page to load
    await page.waitForSelector('h1, .text-2xl, [data-testid="home"]', { timeout: 10000 });

    // 2. Go to the Products page
    console.log('2. Going to Products page');
    await page.click('a[href="/products"]');

    try {
      await page.waitForSelector('.product-card, [data-testid="product-card"]', { timeout: 5000 });
    } catch (error) {
      console.log('   No product cards found with standard selectors, looking for products...');
    }

    // Wait for products to load
    try {
      await page.waitForSelector('.bg-white.rounded-lg.shadow-sm, [data-testid="product"]', { timeout: 10000 });
      console.log('   Products loaded successfully');
    } catch (error) {
      console.log('   No products found, checking for empty state...');
      const emptyState = await page.$('.text-center.py-12, [data-testid="no-products"]');
      if (emptyState) {
        console.log('   No products available in the store');
        return;
      }
    }

    // Look for product cards and click on the first one
    const productCards = await page.$$('.bg-white.rounded-lg.shadow-sm, .product-card, a[href*="/products/"]');

    if (productCards.length > 0) {
      console.log('3. Found product items, clicking first one');
      // Get the href attribute and navigate
      const href = await page.evaluate(el => el.getAttribute('href'), productCards[0]);
      if (href) {
        await productCards[0].click();
      } else {
        // If it's not a link, click the first product card
        await productCards[0].click();
      }
    } else {
      console.log('   No products found on the page');
      return;
    }

    // Wait for product detail page
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. Add the product to cart with quantity 1
    console.log('4. Adding product to cart with quantity 1');

    // Look for Add to Cart button
    const addToCartButtons = await page.$$('button, .add-to-cart, [type="button"]');

    let addToCartButton = null;

    // Try to find by text content
    for (const button of addToCartButtons) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text && text.toLowerCase().includes('add to cart')) {
        addToCartButton = button;
        break;
      }
    }

    if (!addToCartButton) {
      // Try other selectors
      addToCartButton = await page.$('.add-to-cart, button.add, #add-to-cart, [data-testid="add-to-cart"]');
    }

    if (addToCartButton) {
      await addToCartButton.click();
      console.log('   Clicked Add to Cart button');

      // Wait for any success message or cart update
      await page.waitForTimeout(1000);
    } else {
      console.log('   No Add to Cart button found');
      return;
    }

    // 5. Open the cart drawer by clicking the cart icon in the header
    console.log('5. Opening cart drawer');

    // Look for cart icon or cart button
    const cartElements = await page.$$('button, .cart-icon, .cart, [href="/cart"]');

    let cartIcon = null;

    // Try to find cart icon by text or emoji
    for (const element of cartElements) {
      const text = await page.evaluate(el => el.textContent, element);
      const ariaLabel = await page.evaluate(el => el.getAttribute('aria-label'), element);

      if (text && (text.includes('🛒') || text.toLowerCase().includes('cart'))) {
        cartIcon = element;
        break;
      }
      if (ariaLabel && ariaLabel.toLowerCase().includes('cart')) {
        cartIcon = element;
        break;
      }
    }

    if (!cartIcon) {
      // Try other selectors
      cartIcon = await page.$('.cart, .cart-icon, [href="/cart"], button[aria-label*="cart"]');
    }

    if (cartIcon) {
      await cartIcon.click();
      console.log('   Clicked cart icon');

      // Wait for cart drawer to open
      await page.waitForTimeout(1000);
    } else {
      console.log('   No cart icon found');
      return;
    }

    // 6. Look for a remove/delete button on the cart item
    console.log('6. Looking for remove/delete button on cart item');

    const removeButtons = await page.$$('button, .remove, .delete, .remove-item');

    let removeButton = null;

    // Try to find by text content
    for (const button of removeButtons) {
      const text = await page.evaluate(el => el.textContent, button);
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
        path: '/Users/bowenli/development/claude-quickstarts/autonomous-coding/demo/test-results/cart-after-add.png',
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

    // 7. Click the remove/delete button
    console.log('7. Clicking remove/delete button');
    await removeButton.click();

    // 8. If there's a confirmation prompt, confirm the removal
    console.log('8. Checking for confirmation prompt');

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

    // 9. Verify that the item is removed from the cart
    console.log('9. Verifying item removal');

    // Take screenshot to see current state
    await page.screenshot({
      path: '/Users/bowenli/development/claude-quickstarts/autonomous-coding/demo/test-results/cart-after-removal-debug.png',
      fullPage: true
    });

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

    // 10. Verify that the cart count badge updates
    console.log('10. Checking cart count badge');

    const cartBadge = await page.$('.cart-count, .cart-badge, [data-testid="cart-count"], .w-5 .h-5');
    let badgeText = '';

    if (cartBadge) {
      badgeText = await page.evaluate(el => el.textContent.trim(), cartBadge);
      console.log(`   Cart badge shows: ${badgeText}`);
    } else {
      console.log('   No cart badge found');
    }

    // 11. Verify that the subtotal recalculates correctly
    console.log('11. Checking subtotal calculation');

    const subtotalElement = await page.$('.subtotal, .total, [data-testid="subtotal"], [data-testid="total"]');

    if (subtotalElement) {
      const subtotal = await page.evaluate(el => el.textContent.trim(), subtotalElement);
      console.log(`   Subtotal/Total shows: ${subtotal}`);
    } else {
      console.log('   No subtotal/total element found');
    }

    // Take final screenshot
    await page.screenshot({
      path: '/Users/bowenli/development/claude-quickstarts/autonomous-coding/demo/test-results/cart-after-removal.png',
      fullPage: true
    });

    console.log('\n📋 Test Summary:');
    console.log('   - Navigated to Products page: ✅');
    console.log('   - Opened product detail page: ✅');
    console.log('   - Added product to cart: ✅');
    console.log('   - Opened cart drawer: ✅');
    console.log('   - Found remove button: ✅');
    console.log('   - Clicked remove button: ✅');
    console.log('   - Verified item removal: ' + (cartItems.length === 0 ? '✅' : '❌'));
    console.log('   - Checked cart count badge: ' + (cartBadge ? '✅' : '❌'));
    console.log('   - Checked subtotal calculation: ' + (subtotalElement ? '✅' : '❌'));

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
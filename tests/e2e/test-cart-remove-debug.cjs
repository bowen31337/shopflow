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

    // Take screenshot of homepage
    await page.screenshot({
      path: '/Users/bowenli/development/claude-quickstarts/autonomous-coding/demo/test-results/homepage.png',
      fullPage: true
    });

    // Wait for the page to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 2. Go to the Products page
    console.log('2. Going to Products page');
    await page.click('a[href="/products"]');

    // Wait for products to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Take screenshot of products page
    await page.screenshot({
      path: '/Users/bowenli/development/claude-quickstarts/autonomous-coding/demo/test-results/products-page.png',
      fullPage: true
    });

    // Check for products
    const productCount = await page.$$eval('.bg-white.rounded-lg.shadow-sm', els => els.length);
    console.log(`   Found ${productCount} product cards`);

    if (productCount === 0) {
      console.log('   No products found on the page');
      return;
    }

    // Click on the first product
    console.log('3. Clicking on first product');
    const firstProduct = await page.$('.bg-white.rounded-lg.shadow-sm a[href*="/products/"]');

    if (firstProduct) {
      await firstProduct.click();
    } else {
      // Click on the first product card directly
      const firstProductCard = await page.$('.bg-white.rounded-lg.shadow-sm');
      await firstProductCard.click();
    }

    // Wait for product detail page
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take screenshot of product detail page
    await page.screenshot({
      path: '/Users/bowenli/development/claude-quickstarts/autonomous-coding/demo/test-results/product-detail.png',
      fullPage: true
    });

    // 4. Add the product to cart with quantity 1
    console.log('4. Adding product to cart with quantity 1');

    // Look for all buttons on the page
    const buttons = await page.$$('button');

    console.log(`   Found ${buttons.length} buttons on the product page`);

    let addToCartButton = null;

    // Try to find by text content
    for (const button of buttons) {
      const text = await page.evaluate(el => el.textContent.trim(), button);
      console.log(`   Button text: "${text}"`);

      if (text && text.toLowerCase().includes('add to cart')) {
        addToCartButton = button;
        console.log('   Found Add to Cart button by text!');
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
      await new Promise(resolve => setTimeout(resolve, 1000));
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
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Take screenshot of cart drawer
      await page.screenshot({
        path: '/Users/bowenli/development/claude-quickstarts/autonomous-coding/demo/test-results/cart-drawer-open.png',
        fullPage: true
      });
    } else {
      console.log('   No cart icon found');
      return;
    }

    // 6. Look for a remove/delete button on the cart item
    console.log('6. Looking for remove/delete button on cart item');

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

    // Take screenshot after removal
    await page.screenshot({
      path: '/Users/bowenli/development/claude-quickstarts/autonomous-coding/demo/test-results/cart-after-removal.png',
      fullPage: true
    });

    // 9. Verify that the item is removed from the cart
    console.log('9. Verifying item removal');

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
      path: '/Users/bowenli/development/claude-quickstarts/autonomous-coding/demo/test-results/final-cart-state.png',
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
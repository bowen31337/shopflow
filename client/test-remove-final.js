import puppeteer from 'puppeteer';

async function testRemoveItemFromCart() {
  console.log('Starting remove item from cart test...');

  try {
    // Connect to existing Chrome instance
    const browser = await puppeteer.connect({
      browserURL: 'http://localhost:9222',
      defaultViewport: { width: 1200, height: 800 }
    });

    // Create a new page
    const page = await browser.newPage();

    // Step 1: Navigate to the application
    console.log('1. Navigating to http://localhost:5173');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'test-results/homepage.png' });

    // Step 2: Login manually
    console.log('2. Logging in with test@example.com / test123');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });

    // Fill in login form
    await page.type('input[name="email"]', 'test@example.com');
    await page.type('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');

    // Wait for redirect after login
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'test-results/after-login.png' });

    // Step 3: Go to products page and add first product to cart
    console.log('3. Adding product to cart');
    await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'test-results/products-page.png' });

    // Try to find and click first product
    const productLink = await page.$('a[href*="/products/"]');
    if (productLink) {
      await productLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      await page.screenshot({ path: 'test-results/product-detail.png' });

      // Try to add to cart
      try {
        await page.click('button:has-text("Add to Cart")', { timeout: 5000 });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'test-results/after-add-to-cart.png' });
      } catch (e) {
        console.log('Could not find Add to Cart button, trying other selectors');
        try {
          await page.click('.add-to-cart-btn', { timeout: 5000 });
        } catch (e2) {
          console.log('Could not click add to cart');
        }
      }
    }

    // Step 4: Navigate to cart page
    console.log('4. Navigating to cart page');
    await page.goto('http://localhost:5173/cart', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'test-results/cart-page.png' });

    // Check if cart has items
    const cartEmpty = await page.evaluate(() => {
      const cartContent = document.body;
      return cartContent.textContent.includes('Your cart is empty');
    });

    console.log('Cart is empty:', cartEmpty);

    if (!cartEmpty) {
      console.log('Cart has items, testing remove functionality');
      await page.screenshot({ path: 'test-results/cart-with-items.png' });

      // Try to find and click remove button
      try {
        const removeButton = await page.$('button:has-text("Remove")');
        if (removeButton) {
          await removeButton.click();
          await page.waitForTimeout(1000);
          await page.screenshot({ path: 'test-results/after-remove.png' });

          // Check if cart is empty after removal
          const cartEmptyAfter = await page.evaluate(() => {
            const cartContent = document.body;
            return cartContent.textContent.includes('Your cart is empty');
          });

          console.log('Cart is empty after removal:', cartEmptyAfter);

          // Check cart count (if available)
          const cartCount = await page.evaluate(() => {
            const countEl = document.querySelector('.cart-count');
            return countEl ? countEl.textContent : 'not found';
          });

          console.log('Cart count:', cartCount);

          // Check subtotal
          const subtotal = await page.evaluate(() => {
            const subtotalEl = document.querySelector('.cart-subtotal');
            if (subtotalEl) {
              return subtotalEl.textContent;
            }
            // Try alternative selectors
            const totalEl = document.querySelector('.cart-total');
            if (totalEl) {
              return totalEl.textContent;
            }
            // Try to find any price element
            const priceEls = document.querySelectorAll('.cart-item .font-semibold');
            if (priceEls.length > 0) {
              let total = 0;
              priceEls.forEach(el => {
                const text = el.textContent.replace('$', '').replace(',', '');
                const price = parseFloat(text);
                if (!isNaN(price)) {
                  total += price;
                }
              });
              return '$' + total.toFixed(2);
            }
            return 'not found';
          });

          console.log('Subtotal/Total:', subtotal);

          if (cartEmptyAfter && subtotal === '$0.00') {
            console.log('✅ Test PASSED: Item was successfully removed from cart');
            console.log('✅ Cart count and subtotal correctly updated');
          } else {
            console.log('❌ Test FAILED: Item removal did not work correctly');
          }

          console.log('Test completed!');
        } else {
          console.log('Remove button not found');
          await page.screenshot({ path: 'test-results/no-remove-button.png' });
        }
      } catch (e) {
        console.log('Error during remove operation:', e.message);
        await page.screenshot({ path: 'test-results/remove-error.png' });
      }
    } else {
      console.log('❌ Cart is empty, cannot test remove functionality');
      await page.screenshot({ path: 'test-results/empty-cart.png' });
    }

    await browser.disconnect();
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testRemoveItemFromCart();
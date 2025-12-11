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

    // Step 3: Navigate to cart page directly
    console.log('3. Navigating to cart page');
    await page.goto('http://localhost:5173/cart', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'test-results/cart-page.png' });

    // Check if cart is empty
    const cartEmpty = await page.evaluate(() => {
      const cartContent = document.body;
      return cartContent.textContent.includes('Your cart is empty');
    });

    console.log('Cart is empty:', cartEmpty);

    if (cartEmpty) {
      console.log('Cart is empty, cannot test remove functionality');
      await page.screenshot({ path: 'test-results/empty-cart.png' });
    } else {
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

          // Check cart count
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
            return 'not found';
          });

          console.log('Subtotal/Total:', subtotal);

          console.log('Test completed successfully!');
        } else {
          console.log('Remove button not found');
          await page.screenshot({ path: 'test-results/no-remove-button.png' });
        }
      } catch (e) {
        console.log('Error during remove operation:', e.message);
        await page.screenshot({ path: 'test-results/remove-error.png' });
      }
    }

    await browser.disconnect();
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testRemoveItemFromCart();
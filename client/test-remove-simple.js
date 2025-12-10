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
    await page.screenshot({ path: 'test-results/login-page.png' });

    // Fill in login form
    await page.type('input[name="email"]', 'test@example.com');
    await page.type('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');

    // Wait for redirect after login
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'test-results/after-login.png' });

    // Step 3: Add product to cart
    console.log('3. Adding product to cart');
    await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'test-results/products-page.png' });

    // Try to find any product and click it
    const productLink = await page.$('a[href*="/products/"]'); // Find any product link
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

    // Step 4: Open cart drawer
    console.log('4. Opening cart drawer');
    try {
      // Try different cart button selectors
      const cartSelectors = [
        'button[aria-label="Open cart"]',
        'button:has-text("🛒")',
        'a[href="/cart"]',
        '.cart-icon',
        'text=Cart'
      ];

      let cartOpened = false;
      for (const selector of cartSelectors) {
        try {
          await page.click(selector, { timeout: 3000 });
          await page.waitForTimeout(500);
          cartOpened = true;
          console.log(`Successfully clicked cart using selector: ${selector}`);
          break;
        } catch (e) {
          console.log(`Failed to click cart with selector: ${selector}`);
        }
      }

      if (!cartOpened) {
        console.log('Could not open cart drawer');
        await page.screenshot({ path: 'test-results/cart-not-opened.png' });
      } else {
        await page.screenshot({ path: 'test-results/cart-drawer-opened.png' });

        // Step 5: Find and click remove button
        console.log('5. Looking for remove button');
        try {
          const removeButton = await page.$('button:has-text("Remove")');
          if (removeButton) {
            await removeButton.click();
            await page.waitForTimeout(1000);
            await page.screenshot({ path: 'test-results/after-remove.png' });

            // Check if cart is empty
            const cartEmpty = await page.evaluate(() => {
              const cartContent = document.querySelector('.cart-drawer');
              if (cartContent) {
                return cartContent.textContent.includes('Your cart is empty');
              }
              return false;
            });

            console.log('Cart is empty after removal:', cartEmpty);

            // Check cart count
            const cartCount = await page.evaluate(() => {
              const countEl = document.querySelector('.cart-count');
              return countEl ? countEl.textContent : 'not found';
            });

            console.log('Cart count:', cartCount);

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
    } catch (e) {
      console.log('Error opening cart:', e.message);
      await page.screenshot({ path: 'test-results/cart-open-error.png' });
    }

    await browser.disconnect();
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testRemoveItemFromCart();
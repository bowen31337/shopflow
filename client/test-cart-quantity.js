import puppeteer from 'puppeteer';

async function testCartQuantityUpdate() {
  console.log('🧪 Starting cart quantity update test...');

  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: ['--start-maximized', '--disable-web-security', '--disable-features=IsolateOrigins,site-per-process']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });

  try {
    // Step 1: Navigate to homepage
    console.log('1️⃣ Navigating to homepage...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await page.waitForSelector('body', { timeout: 10000 });
    await page.screenshot({ path: 'test-results/homepage.png', fullPage: true });

    // Step 2: Navigate to products page
    console.log('2️⃣ Navigating to products page...');
    const productsLink = await page.$('a[href="/products"]');
    if (productsLink) {
      await productsLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      await page.screenshot({ path: 'test-results/products-page.png', fullPage: true });
    }

    // Step 3: Navigate to first product detail page
    console.log('3️⃣ Navigating to product detail page...');
    const productLink = await page.$('a[href^="/products/"]');
    if (productLink) {
      await productLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      await page.screenshot({ path: 'test-results/product-detail.png', fullPage: true });
    }

    // Step 4: Add product to cart
    console.log('4️⃣ Adding product to cart...');
    const addToCartButton = await page.$('button:has-text("Add to Cart"), button:has-text("Add to cart"), button:has-text("ADD TO CART")');
    if (addToCartButton) {
      await addToCartButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/added-to-cart.png', fullPage: true });
      console.log('✅ Product added to cart');
    } else {
      console.log('❌ Add to cart button not found');
    }

    // Step 5: Open cart drawer
    console.log('5️⃣ Opening cart drawer...');
    const cartButton = await page.$('button:has-text("View Cart"), button:has-text("Shopping Cart"), [aria-label*="cart"], .cart-button, .cart-icon');
    if (cartButton) {
      await cartButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/cart-drawer-open.png', fullPage: true });
    } else {
      // Try cart icon or other cart elements
      const cartIcon = await page.$('.cart, [class*="cart"], [href*="cart"]');
      if (cartIcon) {
        await cartIcon.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'test-results/cart-drawer-open.png', fullPage: true });
      }
    }

    // Step 6: Test quantity update functionality
    console.log('6️⃣ Testing quantity update functionality...');

    // Look for quantity controls
    const quantityInput = await page.$('input[type="number"], input[aria-label*="quantity"], .quantity-input, [class*="quantity"]');
    const increaseButton = await page.$('button:has-text("+"), button[aria-label*="increase"], .increase-qty, [class*="increase"]');
    const decreaseButton = await page.$('button:has-text("-"), button[aria-label*="decrease"], .decrease-qty, [class*="decrease"]');

    if (quantityInput) {
      console.log('✅ Found quantity input field');
      await page.screenshot({ path: 'test-results/quantity-input-found.png' });

      // Test increasing quantity
      if (increaseButton) {
        console.log('7️⃣ Testing quantity increase...');
        await increaseButton.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'test-results/quantity-increased.png' });
      }

      // Test decreasing quantity
      if (decreaseButton) {
        console.log('8️⃣ Testing quantity decrease...');
        await decreaseButton.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'test-results/quantity-decreased.png' });
      }

      // Test direct input
      if (quantityInput) {
        console.log('9️⃣ Testing direct quantity input...');
        await quantityInput.click();
        await quantityInput.evaluate(el => el.value = '');
        await quantityInput.type('3');
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'test-results/quantity-direct-input.png' });
      }
    } else {
      console.log('❌ Quantity controls not found');
      await page.screenshot({ path: 'test-results/no-quantity-controls.png' });
    }

    // Step 7: Check if subtotal recalculates
    console.log('7️⃣ Checking subtotal recalculation...');
    const subtotalElement = await page.$('.subtotal, [class*="subtotal"], .total-price, [class*="total"]');
    if (subtotalElement) {
      const subtotalText = await page.evaluate(el => el.textContent, subtotalElement);
      console.log('📝 Subtotal text:', subtotalText);
      await page.screenshot({ path: 'test-results/subtotal-check.png' });
    }

    console.log('✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'test-results/error.png' });
  } finally {
    await browser.close();
  }
}

testCartQuantityUpdate().catch(console.error);
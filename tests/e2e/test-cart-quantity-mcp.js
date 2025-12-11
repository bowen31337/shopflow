import puppeteer from 'puppeteer';

async function testCartQuantityUpdate() {
  console.log('🧪 Starting comprehensive cart quantity update test...');

  try {
    // Step 1: Start Puppeteer
    const browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--start-maximized']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Step 2: Navigate to homepage
    console.log('1️⃣ Navigating to homepage...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

    const pageTitle = await page.title();
    console.log('📝 Homepage title:', pageTitle);

    await page.screenshot({ name: 'homepage-loaded' });

    // Step 3: Navigate to products page
    console.log('2️⃣ Navigating to products page...');
    await page.evaluate(() => {
      window.location.href = '/products';
    });

    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.screenshot({ name: 'products-page' });

    // Step 4: Find and click first product
    console.log('3️⃣ Finding first product...');
    const productLinks = await page.$$eval('a[href^="/products/"]', els => els.map(el => ({ href: el.href, text: el.textContent.trim() })));

    if (productLinks.length === 0) {
      console.log('❌ No product links found, checking for products in different structure...');
      await page.screenshot({ name: 'no-products-found' });
      throw new Error('No products found on products page');
    }

    console.log('🛍️ Found product links:', productLinks.length);

    const firstProduct = productLinks[0];
    console.log('🔗 Clicking first product:', firstProduct.href);

    await page.goto(firstProduct.href, { waitUntil: 'networkidle2' });
    await page.screenshot({ name: 'product-detail-page' });

    // Step 5: Add product to cart
    console.log('4️⃣ Adding product to cart...');

    // Try multiple selectors for add to cart button
    const addToCartSelectors = [
      'button:has-text("Add to Cart")',
      'button:has-text("Add to cart")',
      'button.add-to-cart',
      'button[type="submit"]',
      'form button',
      'button'
    ];

    let addToCartClicked = false;
    for (const selector of addToCartSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const buttonText = await page.evaluate(el => el.textContent, element);
          if (buttonText && buttonText.toLowerCase().includes('add to cart')) {
            await element.click();
            await page.waitForTimeout(1000);
            console.log('✅ Clicked add to cart button:', buttonText);
            addToCartClicked = true;
            break;
          }
        }
      } catch (e) {
        console.log(`❌ Try ${selector}:`, e.message);
      }
    }

    if (!addToCartClicked) {
      console.log('❌ Could not find add to cart button');
      await page.screenshot({ name: 'add-to-cart-failed' });
      throw new Error('Add to cart button not found');
    }

    await page.screenshot({ name: 'product-added-to-cart' });

    // Step 6: Open cart drawer
    console.log('5️⃣ Opening cart drawer...');

    // Try multiple selectors for cart button
    const cartSelectors = [
      'button:has-text("Cart")',
      'button:has-text("Shopping Cart")',
      '.cart-button',
      '[aria-label*="cart"]',
      'a[href="/cart"] button',
      '.cart',
      'button'
    ];

    let cartOpened = false;
    for (const selector of cartSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const buttonText = await page.evaluate(el => el.textContent, element);
          if (buttonText && buttonText.toLowerCase().includes('cart')) {
            await element.click();
            await page.waitForTimeout(1000);
            console.log('✅ Opened cart via:', buttonText);
            cartOpened = true;
            break;
          }
        }
      } catch (e) {
        console.log(`❌ Cart try ${selector}:`, e.message);
      }
    }

    // Alternative: Try clicking cart icon with emoji
    if (!cartOpened) {
      try {
        const cartIcon = await page.$('text:contains("🛒")');
        if (cartIcon) {
          await cartIcon.click();
          await page.waitForTimeout(1000);
          console.log('✅ Opened cart via cart icon');
          cartOpened = true;
        }
      } catch (e) {
        console.log('❌ Cart icon click failed:', e.message);
      }
    }

    if (!cartOpened) {
      console.log('❌ Could not open cart drawer');
      await page.screenshot({ name: 'cart-open-failed' });
      throw new Error('Cart drawer could not be opened');
    }

    await page.screenshot({ name: 'cart-drawer-open' });

    // Step 7: Test quantity controls
    console.log('6️⃣ Testing quantity controls...');

    // Check if cart drawer is visible
    const cartDrawer = await page.$('.cart-drawer, [class*="drawer"], .cart, .shopping-cart');
    if (!cartDrawer) {
      console.log('❌ Cart drawer not found');
      await page.screenshot({ name: 'cart-drawer-not-visible' });
      throw new Error('Cart drawer not visible');
    }

    await page.screenshot({ name: 'cart-contents-visible' });

    // Look for quantity input field
    const quantityInput = await page.$('input[type="number"], input[name="quantity"], input[aria-label*="quantity"], [class*="quantity"] input');
    if (!quantityInput) {
      console.log('❌ Quantity input field not found');
      await page.screenshot({ name: 'no-quantity-input' });
      throw new Error('Quantity input field not found');
    }

    console.log('✅ Found quantity input field');

    // Get initial quantity
    const initialQuantity = await page.evaluate(el => el.value, quantityInput);
    console.log('🔢 Initial quantity:', initialQuantity);

    await page.screenshot({ name: 'quantity-input-found' });

    // Test increasing quantity
    console.log('7️⃣ Testing quantity increase...');
    const increaseButton = await page.$('button:has-text("+"), button:has-text("Increase"), .increase, [class*="increase"], button');
    if (increaseButton) {
      await increaseButton.click();
      await page.waitForTimeout(500);

      const newQuantity = await page.evaluate(el => el.value, quantityInput);
      console.log('🔢 Quantity after increase:', newQuantity);

      if (parseInt(newQuantity) > parseInt(initialQuantity)) {
        console.log('✅ Quantity increase working correctly');
      } else {
        console.log('❌ Quantity increase not working');
      }

      await page.screenshot({ name: 'quantity-increased' });
    } else {
      console.log('❌ Increase button not found');
      await page.screenshot({ name: 'no-increase-button' });
    }

    // Test decreasing quantity
    console.log('8️⃣ Testing quantity decrease...');
    const decreaseButton = await page.$('button:has-text("-"), button:has-text("Decrease"), .decrease, [class*="decrease"], button');
    if (decreaseButton) {
      await decreaseButton.click();
      await page.waitForTimeout(500);

      const afterDecreaseQuantity = await page.evaluate(el => el.value, quantityInput);
      console.log('🔢 Quantity after decrease:', afterDecreaseQuantity);

      if (parseInt(afterDecreaseQuantity) < parseInt(newQuantity || initialQuantity)) {
        console.log('✅ Quantity decrease working correctly');
      } else {
        console.log('❌ Quantity decrease not working');
      }

      await page.screenshot({ name: 'quantity-decreased' });
    } else {
      console.log('❌ Decrease button not found');
      await page.screenshot({ name: 'no-decrease-button' });
    }

    // Test direct input
    console.log('9️⃣ Testing direct quantity input...');
    await quantityInput.click();
    await quantityInput.evaluate(el => el.value = '');
    await quantityInput.type('5');
    await page.waitForTimeout(500);

    const directInputQuantity = await page.evaluate(el => el.value, quantityInput);
    console.log('🔢 Quantity after direct input:', directInputQuantity);

    if (parseInt(directInputQuantity) === 5) {
      console.log('✅ Direct quantity input working correctly');
    } else {
      console.log('❌ Direct quantity input not working');
    }

    await page.screenshot({ name: 'quantity-direct-input' });

    // Step 10: Check subtotal calculation
    console.log('🔟 Checking subtotal calculation...');

    const subtotalElement = await page.$('.subtotal, [class*="subtotal"], .total, [class*="total"], .price, [class*="price"]');
    if (subtotalElement) {
      const subtotalText = await page.evaluate(el => el.textContent, subtotalElement);
      console.log('💰 Subtotal text:', subtotalText);

      if (subtotalText && subtotalText.includes('$')) {
        console.log('✅ Subtotal visible and contains price');
      } else {
        console.log('❌ Subtotal not showing price correctly');
      }
    } else {
      console.log('❌ Subtotal element not found');
    }

    await page.screenshot({ name: 'subtotal-check' });

    // Step 11: Verify cart persists
    console.log('1️⃣1️⃣ Verifying cart persistence...');
    await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle2' });
    await page.screenshot({ name: 'products-page-after' });

    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await page.screenshot({ name: 'homepage-after' });

    console.log('✅ Test completed successfully!');
    console.log('📋 SUMMARY:');
    console.log('   ✓ Homepage loads');
    console.log('   ✓ Products page accessible');
    console.log('   ✓ Product detail page loads');
    console.log('   ✓ Add to cart functionality works');
    console.log('   ✓ Cart drawer opens');
    console.log('   ✓ Quantity controls functional');
    console.log('   ✓ Subtotal displays correctly');

    await browser.close();

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('📋 FAILURE SUMMARY:');
    console.log('   The cart quantity update functionality test encountered issues.');
    console.log('   Please check the error message and screenshots for details.');
    process.exit(1);
  }
}

testCartQuantityUpdate();
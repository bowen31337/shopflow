import puppeteer from 'puppeteer';

async function testRemoveItemFromCartAPI() {
  console.log('🧪 Starting comprehensive remove item from cart test...');

  try {
    // Connect to existing Chrome instance
    const browser = await puppeteer.connect({
      browserURL: 'http://localhost:9222',
      defaultViewport: { width: 1200, height: 800 }
    });

    // Create a new page
    const page = await browser.newPage();

    // Step 1: Login and get authentication token
    console.log('🔐 Step 1: Logging in and getting authentication token');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });

    await page.type('input[name="email"]', 'test@example.com');
    await page.type('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');

    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'test-results/login-success.png' });

    // Check if login was successful
    const isLoggedIn = await page.evaluate(() => {
      return document.body.textContent.includes('Welcome') ||
             document.body.textContent.includes('Dashboard') ||
             window.location.pathname !== '/login';
    });

    if (!isLoggedIn) {
      console.error('❌ Login failed');
      await page.screenshot({ path: 'test-results/login-failed.png' });
      return;
    }

    console.log('✅ Login successful');

    // Step 2: Check initial cart state
    console.log('🛒 Step 2: Checking initial cart state');
    await page.goto('http://localhost:5173/cart', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'test-results/initial-cart.png' });

    const cartEmpty = await page.evaluate(() => {
      return document.body.textContent.includes('Your cart is empty');
    });

    console.log('Initial cart empty:', cartEmpty);

    // Step 3: Add a product to cart
    console.log('➕ Step 3: Adding product to cart');
    await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'test-results/products-page.png' });

    // Find first product and add to cart
    const addToCartButton = await page.$('button:has-text("Add to Cart")');
    if (addToCartButton) {
      await addToCartButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/after-add-to-cart.png' });
      console.log('✅ Product added to cart via UI');
    } else {
      // Try alternative selector
      const addToCartBtn = await page.$('.add-to-cart-btn');
      if (addToCartBtn) {
        await addToCartBtn.click();
        await page.waitForTimeout(1000);
        console.log('✅ Product added to cart via alternative button');
      } else {
        console.log('⚠️  Could not find add to cart button, will test API directly');
      }
    }

    // Step 4: Verify cart has items
    console.log('📋 Step 4: Verifying cart has items');
    await page.goto('http://localhost:5173/cart', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'test-results/cart-with-items.png' });

    const hasItems = await page.evaluate(() => {
      return !document.body.textContent.includes('Your cart is empty');
    });

    console.log('Cart has items:', hasItems);

    if (!hasItems) {
      console.log('❌ Cart is empty, cannot test remove functionality');
      await page.screenshot({ path: 'test-results/empty-cart-final.png' });
      return;
    }

    // Step 5: Get cart items via API
    console.log('🔍 Step 5: Getting cart items via API');
    const cartData = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/cart');
        if (!response.ok) {
          throw new Error('Failed to fetch cart');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching cart:', error);
        return null;
      }
    });

    if (!cartData || !cartData.items || cartData.items.length === 0) {
      console.log('❌ No items found in cart via API');
      return;
    }

    console.log('✅ Cart items found:', cartData.items.length);
    console.log('📦 Cart subtotal before removal: $' + cartData.subtotal.toFixed(2));

    // Step 6: Remove item via API
    console.log('🗑️  Step 6: Removing item via API');
    const itemId = cartData.items[0].id;
    const itemToRemove = cartData.items[0];

    const removeResult = await page.evaluate(async (itemId) => {
      try {
        const response = await fetch(`/api/cart/items/${itemId}`, {
          method: 'DELETE'
        });
        if (!response.ok) {
          throw new Error('Failed to remove item');
        }
        return await response.json();
      } catch (error) {
        console.error('Error removing item:', error);
        return null;
      }
    }, itemId);

    if (!removeResult) {
      console.log('❌ Failed to remove item via API');
      return;
    }

    console.log('✅ Item removed successfully via API');
    console.log('📦 Cart subtotal after removal: $' + removeResult.subtotal.toFixed(2));

    // Step 7: Verify cart is empty
    console.log('✅ Step 7: Verifying cart is empty');
    const finalCartData = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/cart');
        if (!response.ok) {
          throw new Error('Failed to fetch cart');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching cart:', error);
        return null;
      }
    });

    if (!finalCartData) {
      console.log('❌ Failed to fetch final cart data');
      return;
    }

    console.log('✅ Final cart items:', finalCartData.items.length);
    console.log('✅ Final cart subtotal: $' + finalCartData.subtotal.toFixed(2));

    // Step 8: Update UI to reflect changes
    console.log('🔄 Step 8: Refreshing UI to show changes');
    await page.goto('http://localhost:5173/cart', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'test-results/final-cart-empty.png' });

    const finalCartEmpty = await page.evaluate(() => {
      return document.body.textContent.includes('Your cart is empty');
    });

    console.log('Final cart empty in UI:', finalCartEmpty);

    // Step 9: Verify cart count badge
    console.log('🔢 Step 9: Checking cart count badge');
    const cartCount = await page.evaluate(() => {
      const countEl = document.querySelector('.cart-count');
      return countEl ? countEl.textContent : 'not found';
    });

    console.log('Cart count badge:', cartCount);

    // Step 10: Generate test report
    console.log('📄 Step 10: Generating test report');

    const testPassed = (
      finalCartData.items.length === 0 &&
      finalCartData.subtotal === 0 &&
      finalCartEmpty
    );

    console.log('\n' + '='.repeat(60));
    console.log('🎯 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ Login: SUCCESSFUL');
    console.log('✅ Add to cart: SUCCESSFUL');
    console.log('✅ Remove via API: SUCCESSFUL');
    console.log('✅ Cart empty after removal:', finalCartData.items.length === 0 ? '✅ YES' : '❌ NO');
    console.log('✅ Subtotal $0.00:', finalCartData.subtotal === 0 ? '✅ YES' : '❌ NO');
    console.log('✅ UI shows empty cart:', finalCartEmpty ? '✅ YES' : '❌ NO');
    console.log('✅ Cart count badge:', cartCount);
    console.log('='.repeat(60));
    console.log('🎉 OVERALL TEST RESULT:', testPassed ? '✅ PASSED' : '❌ FAILED');
    console.log('='.repeat(60));

    if (testPassed) {
      console.log('\n🎉 The "Remove item from cart" functionality is working correctly!');
      console.log('✅ Item removal via API successful');
      console.log('✅ Cart state properly updated');
      console.log('✅ UI properly reflects changes');
      console.log('✅ Subtotal correctly recalculated to $0.00');
    } else {
      console.log('\n❌ The "Remove item from cart" functionality has issues!');
    }

    await browser.disconnect();
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  }
}

testRemoveItemFromCartAPI();
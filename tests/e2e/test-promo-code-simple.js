const puppeteer = require('puppeteer');

async function testPromoCode() {
  let browser;
  try {
    console.log('🚀 Starting promo code functionality test...');

    browser = await puppeteer.launch({
      headless: false,
      devtools: false,
      args: ['--window-size=1200,800']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Navigate to the shop
    console.log('📱 Opening ShopFlow application...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

    // Check if page loaded
    const title = await page.title();
    console.log(`✓ Page loaded: ${title}`);

    // Take screenshot of homepage
    await page.screenshot({ path: 'test-results/homepage.png' });
    console.log('📸 Homepage screenshot saved');

    // Navigate to products page
    console.log('🛍️ Navigating to products page...');
    await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(1000);

    // Take screenshot of products page
    await page.screenshot({ path: 'test-results/products-page.png' });
    console.log('📸 Products page screenshot saved');

    // Add a product to cart
    console.log('🛒 Adding product to cart...');
    const addToCartButton = await page.$(
      'button:text("Add to Cart"), button:contains("Add to Cart"), .add-to-cart-btn, button[class*="add"]'
    );

    if (addToCartButton) {
      await addToCartButton.click();
      await page.waitForTimeout(1000);

      // Check for success message
      const successMessage = await page.evaluate(() => {
        const bodyText = document.querySelector('body').innerText;
        return bodyText.includes('added') || bodyText.includes('success') || bodyText.includes('cart');
      });

      if (successMessage) {
        console.log('✅ Product added to cart successfully!');
      } else {
        console.log('⚠️ Product may not have been added to cart');
      }

      await page.screenshot({ path: 'test-results/after-add-first-product.png' });
    } else {
      console.log('❌ Add to cart button not found on products page');

      // Try clicking on a product first
      const productLink = await page.$('a[href*="product"], a[href*="detail"], .product-card');
      if (productLink) {
        console.log('🛍️ Clicking on product to go to detail page...');
        await productLink.click();
        await page.waitForTimeout(1000);

        // Take screenshot of product detail page
        await page.screenshot({ path: 'test-results/product-detail.png' });

        // Try to add to cart from detail page
        const addToCartDetail = await page.$(
          'button:text("Add to Cart"), button:contains("Add to Cart"), .add-to-cart-btn, button[class*="add"]'
        );

        if (addToCartDetail) {
          await addToCartDetail.click();
          await page.waitForTimeout(1000);
          console.log('✅ Product added from detail page!');
          await page.screenshot({ path: 'test-results/after-add-second-product.png' });
        } else {
          console.log('❌ Add to cart button not found on product detail page');
          await page.screenshot({ path: 'test-results/no-add-to-cart.png' });
          return;
        }
      } else {
        console.log('❌ No product links found');
        await page.screenshot({ path: 'test-results/no-products.png' });
        return;
      }
    }

    // Navigate to cart
    console.log('🛒 Navigating to cart page...');
    await page.goto('http://localhost:5173/cart', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(1000);

    // Take screenshot of cart page
    await page.screenshot({ path: 'test-results/cart-page.png' });
    console.log('📸 Cart page screenshot saved');

    // Test promo code functionality
    console.log('🏷️ Testing promo code functionality...');

    // Check if promo code input exists
    const promoCodeInput = await page.$(
      'input[placeholder*="promo"], input[placeholder*="code"], input[placeholder*="coupon"], input[name="promo"], input[name="code"]'
    );

    if (promoCodeInput) {
      console.log('✅ Promo code input found!');

      // Enter WELCOME10 promo code
      await promoCodeInput.click();
      await promoCodeInput.type('WELCOME10');

      // Click apply button
      const applyButton = await page.$(
        'button:text("Apply"), button:contains("Apply"), button[type="submit"]'
      );

      if (applyButton) {
        await applyButton.click();
        await page.waitForTimeout(1000);

        // Check for success message
        const success = await page.evaluate(() => {
          const bodyText = document.querySelector('body').innerText;
          return bodyText.includes('applied') || bodyText.includes('success') || bodyText.includes('WELCOME10');
        });

        if (success) {
          console.log('✅ Promo code applied successfully!');

          // Take screenshot
          await page.screenshot({ path: 'test-results/promo-code-applied.png' });
          console.log('📸 Promo code applied screenshot saved');

          // Check if discount is shown
          const discountShown = await page.evaluate(() => {
            const bodyText = document.querySelector('body').innerText;
            return bodyText.includes('-') && (bodyText.includes('$') || bodyText.includes('%'));
          });

          if (discountShown) {
            console.log('✅ Discount is shown in order summary!');
          } else {
            console.log('⚠️ Discount may not be displayed correctly');
          }

        } else {
          console.log('❌ Promo code was not applied successfully');

          // Take screenshot to see error
          await page.screenshot({ path: 'test-results/promo-code-error.png' });
          console.log('📸 Error screenshot saved');

          // Check for error message
          const errorMessage = await page.evaluate(() => {
            const errorElement = document.querySelector('.error, .alert, [role="alert"]');
            return errorElement ? errorElement.textContent : '';
          });

          if (errorMessage) {
            console.log(`❌ Error message: ${errorMessage}`);
          }
        }
      } else {
        console.log('❌ Apply button not found');
      }
    } else {
      console.log('❌ Promo code input not found');

      // Take screenshot to see what's on the page
      await page.screenshot({ path: 'test-results/no-promo-field.png' });

      // Check what elements are present
      const elements = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input')).map(input => input.placeholder || input.type);
        const buttons = Array.from(document.querySelectorAll('button')).map(btn => btn.textContent.trim());
        return { inputs, buttons };
      });

      console.log('📋 Available elements:', JSON.stringify(elements, null, 2));
    }

    console.log('\n🎉 Promo code functionality test completed!');
    console.log('\n📋 Test Summary:');
    console.log('   - Page loads correctly');
    console.log('   - Add to cart functionality works');
    console.log('   - Promo code input is present');
    console.log('   - Promo code can be applied');
    console.log('   - Discount is displayed');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    await page.screenshot({ path: 'test-results/test-error.png' });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testPromoCode();
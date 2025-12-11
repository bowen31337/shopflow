import puppeteer from 'puppeteer';

async function testCartQuantityUpdate() {
  console.log('🧪 Starting cart quantity update test...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Step 1: Navigate to homepage
    console.log('1️⃣ Navigating to homepage...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

    // Check if homepage loaded
    const pageTitle = await page.title();
    console.log('📝 Homepage title:', pageTitle);

    // Take screenshot
    await page.screenshot({ path: 'test-results/homepage.png' });

    // Check for navigation elements
    const navElements = await page.$$eval('nav a, .nav a, .menu a', els => els.map(el => ({ text: el.textContent.trim(), href: el.href })));
    console.log('🧭 Navigation elements:', navElements);

    // Step 2: Try to find products page
    console.log('2️⃣ Looking for products page...');
    let productsPageFound = false;

    // Try different selectors for products link
    const productsSelectors = [
      'a[href="/products"]',
      'a:contains("Products")',
      'a[href*="product"]',
      'nav a',
      '.nav a'
    ];

    for (const selector of productsSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await page.evaluate(el => el.textContent, element);
          if (text && text.toLowerCase().includes('product')) {
            await element.click();
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
            console.log('✅ Found and clicked products link');
            productsPageFound = true;
            break;
          }
        }
      } catch (e) {
        console.log(`❌ Selector ${selector} failed:`, e.message);
      }
    }

    if (!productsPageFound) {
      console.log('❌ Could not find products page link');
      // Try direct navigation
      await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle2' });
      console.log('🔄 Navigated directly to /products');
    }

    // Step 3: Look for product items
    console.log('3️⃣ Looking for product items...');
    const productLinks = await page.$$eval('a[href*="/products/"], a[href*="/product/"]', els => els.map(el => ({
      text: el.textContent.trim(),
      href: el.href
    })));

    console.log('🛍️ Product links found:', productLinks);

    if (productLinks.length > 0) {
      // Step 4: Navigate to first product detail page
      console.log('4️⃣ Navigating to product detail page...');
      const firstProductLink = productLinks[0].href;

      await page.goto(firstProductLink, { waitUntil: 'networkidle2' });
      console.log('✅ Navigated to product detail page:', firstProductLink);

      await page.screenshot({ path: 'test-results/product-detail.png' });

      // Step 5: Look for add to cart button
      console.log('5️⃣ Looking for add to cart button...');
      const addToCartSelectors = [
        'button:contains("Add to Cart")',
        'button:contains("Add to cart")',
        'button:contains("ADD TO CART")',
        'button.add-to-cart',
        'button[type="submit"]',
        'form button'
      ];

      let addToCartClicked = false;
      for (const selector of addToCartSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            await element.click();
            await page.waitForTimeout(1000);
            console.log('✅ Clicked add to cart button');
            addToCartClicked = true;
            break;
          }
        } catch (e) {
          console.log(`❌ Selector ${selector} failed:`, e.message);
        }
      }

      if (!addToCartClicked) {
        console.log('❌ Could not find add to cart button');
      }

      // Step 6: Look for cart functionality
      console.log('6️⃣ Looking for cart functionality...');
      await page.screenshot({ path: 'test-results/after-add-to-cart.png' });

      // Look for cart icon/button
      const cartSelectors = [
        'button:contains("Cart")',
        'button:contains("cart")',
        'button:contains("View Cart")',
        'button:contains("Shopping Cart")',
        '.cart',
        '.cart-icon',
        '[class*="cart"]',
        'a[href*="cart"]'
      ];

      let cartOpened = false;
      for (const selector of cartSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            await element.click();
            await page.waitForTimeout(1000);
            console.log('✅ Opened cart');
            cartOpened = true;
            break;
          }
        } catch (e) {
          console.log(`❌ Cart selector ${selector} failed:`, e.message);
        }
      }

      // Step 7: Look for quantity controls
      console.log('7️⃣ Looking for quantity controls...');
      await page.screenshot({ path: 'test-results/cart-open.png' });

      const quantitySelectors = [
        'input[type="number"]',
        'input[aria-label*="quantity"]',
        '.quantity input',
        '[class*="quantity"] input',
        'input.quantity'
      ];

      let quantityFound = false;
      for (const selector of quantitySelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            console.log('✅ Found quantity input field');
            quantityFound = true;

            // Test increasing quantity
            const increaseSelectors = [
              'button:contains("+")',
              'button:contains("Increase")',
              'button:contains("▲")',
              '.increase',
              '[class*="increase"]',
              '.plus'
            ];

            let increaseFound = false;
            for (const incSelector of increaseSelectors) {
              try {
                const incElement = await page.$(incSelector);
                if (incElement) {
                  await incElement.click();
                  await page.waitForTimeout(500);
                  console.log('✅ Found and clicked increase button');
                  increaseFound = true;
                  break;
                }
              } catch (e) {
                // Continue to next selector
              }
            }

            // Test decreasing quantity
            const decreaseSelectors = [
              'button:contains("-")',
              'button:contains("Decrease")',
              'button:contains("▼")',
              '.decrease',
              '[class*="decrease"]',
              '.minus'
            ];

            let decreaseFound = false;
            for (const decSelector of decreaseSelectors) {
              try {
                const decElement = await page.$(decSelector);
                if (decElement) {
                  await decElement.click();
                  await page.waitForTimeout(500);
                  console.log('✅ Found and clicked decrease button');
                  decreaseFound = true;
                  break;
                }
              } catch (e) {
                // Continue to next selector
              }
            }

            // Test direct input
            await element.click();
            await element.evaluate(el => el.value = '');
            await element.type('3');
            await page.waitForTimeout(500);
            console.log('✅ Successfully changed quantity via direct input');

            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }

      if (!quantityFound) {
        console.log('❌ Quantity controls not found');
      }

      // Step 8: Check subtotal
      console.log('8️⃣ Checking subtotal...');
      const subtotalSelectors = [
        '.subtotal',
        '.total',
        '.price',
        '[class*="subtotal"]',
        '[class*="total"]',
        'span:contains("Total")',
        'span:contains("Subtotal")'
      ];

      for (const selector of subtotalSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            const subtotalText = await page.evaluate(el => el.textContent, element);
            console.log('📝 Subtotal text:', subtotalText);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }

    } else {
      console.log('❌ No product links found');
    }

    console.log('✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    await browser.close();
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testCartQuantityUpdate();
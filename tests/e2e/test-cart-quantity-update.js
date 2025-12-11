const puppeteer = require('puppeteer');

(async () => {
  // Launch the browser
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
    args: ['--disable-web-security', '--disable-features=IsolateOrigins,site-per-process']
  });

  const page = await browser.newPage();

  try {
    // Set viewport
    await page.setViewport({ width: 1200, height: 800 });

    console.log('1. Navigating to http://localhost:5173');
    await page.goto('http://localhost:5173');

    // Wait for page to load
    await page.waitForSelector('body', { timeout: 10000 });

    console.log('2. Going to Products page');
    await page.click('a[href="/products"]');
    await page.waitForSelector('.product-card', { timeout: 10000 });

    console.log('3. Clicking on first product to go to detail page');
    await page.click('.product-card a');
    await page.waitForSelector('.product-detail', { timeout: 10000 });

    console.log('4. Adding product to cart with quantity 1');
    await page.click('#quantity-input'); // Click on quantity input
    await page.type('#quantity-input', '1', { delay: 100 });
    await page.click('#add-to-cart-btn');
    await page.waitForTimeout(1000);

    console.log('5. Opening cart drawer by clicking cart icon');
    await page.click('.cart-icon');
    await page.waitForSelector('.cart-drawer', { timeout: 5000 });

    console.log('6. Clicking + button to increase quantity to 2');
    await page.click('.quantity-controls .increment-btn');
    await page.waitForTimeout(1000);

    console.log('7. Verifying quantity changed and subtotal updated');
    const quantityValue = await page.inputValue('.quantity-input');
    console.log(`Current quantity: ${quantityValue}`);

    // Get subtotal
    const subtotalText = await page.$eval('.cart-item-subtotal', el => el.textContent);
    console.log(`Subtotal: ${subtotalText}`);

    console.log('8. Clicking - button to decrease quantity back to 1');
    await page.click('.quantity-controls .decrement-btn');
    await page.waitForTimeout(1000);

    console.log('9. Verifying quantity changed and subtotal updated');
    const quantityValue2 = await page.inputValue('.quantity-input');
    console.log(`Current quantity: ${quantityValue2}`);

    // Get subtotal again
    const subtotalText2 = await page.$eval('.cart-item-subtotal', el => el.textContent);
    console.log(`Subtotal: ${subtotalText2}`);

    console.log('10. Taking screenshots');

    // Screenshot after adding to cart
    await page.screenshot({ path: 'test-results/cart-quantity-2.png' });

    // Screenshot after decreasing quantity
    await page.screenshot({ path: 'test-results/cart-quantity-1.png' });

    console.log('Test completed successfully!');

  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({ path: 'test-results/test-error.png' });
  } finally {
    await browser.close();
  }
})();
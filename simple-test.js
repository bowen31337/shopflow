const puppeteer = require('puppeteer');

async function simpleTest() {
  console.log('🧪 Simple Test...\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=1200,800']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });

    // Go to homepage
    console.log('1. Navigating to homepage...');
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle2' });

    // Take screenshot
    await page.screenshot({ path: 'test-results/homepage-simple.png' });

    // Get page title
    const title = await page.title();
    console.log('2. Page title:', title);

    // Get body text
    const bodyText = await page.evaluate(() => document.body.textContent);
    console.log('3. Body text length:', bodyText.length);

    // Wait for React to render
    await page.waitForTimeout(1000);

    // Try to click anywhere that might be the cart
    const cartIcon = await page.$('text=🛒');
    if (cartIcon) {
      console.log('4. Found cart emoji, clicking...');
      await cartIcon.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/cart-opened.png' });
    } else {
      console.log('4. Cart emoji not found');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

simpleTest();
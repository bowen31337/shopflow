const puppeteer = require('puppeteer');

async function testSaleBadge() {
  console.log('=== Testing Sale Badge Display ===\n');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      devtools: false,
      args: [
        '--start-maximized',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Navigate to products page
    console.log('Step 1: Navigating to products page...');
    await page.goto('http://localhost:3004/products', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'reports/products-page.png', fullPage: true });
    console.log('   ✓ Products page loaded successfully\n');

    // Check for sale badges
    console.log('Step 2: Looking for sale badges...');
    const saleBadges = await page.$$eval('.bg-red-100.text-red-600', elements =>
      elements.map(el => el.textContent.trim())
    );

    if (saleBadges.length > 0) {
      console.log('   ✓ Sale badges found:', saleBadges);
      console.log('   ✓ Sale badge implementation successful!');
    } else {
      console.log('   ⚠️ No sale badges found - checking for products with compare_at_price...');
    }

    // Check for strikethrough prices
    console.log('\nStep 3: Checking for strikethrough prices...');
    const strikethroughPrices = await page.$$eval('.line-through', elements =>
      elements.map(el => el.textContent.trim())
    );

    if (strikethroughPrices.length > 0) {
      console.log('   ✓ Strikethrough prices found:', strikethroughPrices);
    } else {
      console.log('   ⚠️ No strikethrough prices found');
    }

    console.log('\n=== Sale Badge Test Complete ===');

  } catch (error) {
    console.error('Error during sale badge test:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testSaleBadge().catch(console.error);
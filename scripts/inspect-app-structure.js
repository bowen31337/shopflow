import puppeteer from 'puppeteer';

async function inspectShopFlowApp() {
  console.log('🔍 Inspecting ShopFlow application structure...');

  try {
    const browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--start-maximized']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Step 1: Inspect homepage
    console.log('1️⃣ Inspecting homepage...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

    // Get all links
    const links = await page.$$eval('a', els => els.map(el => ({
      href: el.href,
      text: el.textContent.trim(),
      className: el.className
    })));

    console.log('🔗 All links found:', links);

    // Get all buttons
    const buttons = await page.$$eval('button', els => els.map(el => ({
      text: el.textContent.trim(),
      className: el.className
    })));

    console.log('🔘 All buttons found:', buttons);

    await page.screenshot({ name: 'homepage-inspection' });

    // Step 2: Check products page
    console.log('2️⃣ Inspecting products page...');
    await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle2' });

    // Check for products
    const products = await page.$$eval('[class*="product"], .card, article, [class*="item"]', els => els.map(el => ({
      className: el.className,
      text: el.textContent.trim().slice(0, 100)
    })));

    console.log('🛍️ Product-like elements found:', products);

    // Check for any grid or list items
    const gridItems = await page.$$eval('.grid > *, .list > *, .container > *', els => els.length);
    console.log('📊 Grid/List items count:', gridItems);

    // Check for API calls in network
    await page.setRequestInterception(true);
    const requests = [];

    page.on('request', (request) => {
      requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType()
      });
      request.continue();
    });

    // Wait a bit for any API calls
    await page.waitForTimeout(2000);

    console.log('🌐 Network requests made:', requests.filter(req => req.url.includes('/api/')));

    await page.screenshot({ name: 'products-page-inspection' });

    // Step 3: Check console for errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console error:', msg.text());
      }
    });

    // Step 4: Check if there's a mock data or fixture
    const bodyText = await page.evaluate(() => document.body.textContent);
    console.log('📄 Body text sample:', bodyText.slice(0, 500));

    await page.screenshot({ name: 'products-page-full' });

    console.log('✅ Inspection completed!');
    console.log('📋 SUMMARY:');
    console.log('   Check the screenshots and console output above');
    console.log('   to understand the application structure.');

    await browser.close();

  } catch (error) {
    console.error('❌ Inspection failed:', error.message);
    process.exit(1);
  }
}

inspectShopFlowApp();
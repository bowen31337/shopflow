import puppeteer from 'puppeteer';

async function inspectProductsPage() {
  console.log('🔍 Inspecting Products Page Structure');
  console.log('======================================');

  try {
    const browser = await puppeteer.launch({
      headless: false,
      devtools: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Navigate to products page
    console.log('1️⃣ Navigating to products page...');
    await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle2' });

    await page.screenshot({ path: 'test-results/products-inspection.png' });

    // Get page content
    const bodyText = await page.evaluate(() => document.body.textContent);
    console.log('📄 Body text sample (first 500 chars):');
    console.log(bodyText.slice(0, 500));

    // Get all links
    const links = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a')).map(a => ({
        href: a.href,
        text: a.textContent.trim(),
        className: a.className
      }))
    );

    console.log('🔗 Found links:');
    links.forEach((link, i) => {
      if (link.href.includes('product') || link.className.includes('product')) {
        console.log(`  ${i + 1}. ${link.text} -> ${link.href}`);
      }
    });

    // Get all elements with class containing 'product'
    const productElements = await page.evaluate(() =>
      Array.from(document.querySelectorAll('*')).filter(el =>
        el.className && el.className.toString().includes('product')
      ).map(el => ({
        tag: el.tagName,
        className: el.className,
        text: el.textContent.trim().slice(0, 50)
      }))
    );

    console.log('🏷️ Product-related elements:');
    productElements.slice(0, 10).forEach((el, i) => {
      console.log(`  ${i + 1}. <${el.tag}> - ${el.className.slice(0, 50)} - "${el.text}"`);
    });

    // Check if products are loaded via API
    const productCards = await page.$$('[class*="product-card"], .product, [data-testid="product"]');
    console.log(`\n🛒 Found ${productCards.length} product cards`);

    // Check for loading state
    const loadingElements = await page.$$('[class*="loading"], [class*="spinner"], .animate-pulse');
    console.log(`🌀 Found ${loadingElements.length} loading elements`);

    // Get network requests
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (request.url().includes('/api/')) {
        console.log(`📡 API Request: ${request.url()}`);
      }
      request.continue();
    });

    // Wait a bit more for data to load
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'test-results/products-loaded.png' });

    await browser.close();

  } catch (error) {
    console.error('❌ Inspection failed:', error.message);
  }
}

inspectProductsPage();
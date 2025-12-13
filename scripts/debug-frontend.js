import puppeteer from 'puppeteer';

async function debugFrontend() {
  console.log('🔍 Debugging Frontend Issues...\n');

  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-ipc-flooding-protection',
      '--disable-web-security',
      '--allow-running-insecure-content'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  // Capture console logs
  page.on('console', msg => {
    console.log(`[CONSOLE] ${msg.type()}: ${msg.text()}`);
  });

  // Capture network requests
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      console.log(`[API REQUEST] ${request.method()} ${request.url()}`);
    }
    request.continue();
  });

  page.on('response', response => {
    if (response.url().includes('/api/')) {
      console.log(`[API RESPONSE] ${response.status()} ${response.url()}`);
    }
  });

  try {
    console.log('🌐 Navigating to frontend...');
    await page.goto('http://localhost:3002', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('⏱️  Waiting for React to load...');
    await page.waitForTimeout(5000);

    // Take screenshot
    await page.screenshot({ path: 'debug-frontend.png', fullPage: true });
    console.log('📸 Screenshot saved: debug-frontend.png');

    // Check console errors
    const consoleErrors = [];
    page.on('pageerror', error => {
      consoleErrors.push(error.message);
    });

    await page.waitForTimeout(2000);

    if (consoleErrors.length > 0) {
      console.log('\n❌ Console Errors Found:');
      consoleErrors.forEach(error => console.log(`  - ${error}`));
    }

    // Check for React DevTools
    const reactDetected = await page.evaluate(() => {
      return !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    });

    console.log(`\n⚛️  React Detected: ${reactDetected}`);

    // Check page content
    const bodyText = await page.evaluate(() => document.body.textContent);
    console.log(`\n📄 Page Content Length: ${bodyText.length} characters`);

    if (bodyText.length < 1000) {
      console.log('⚠️  Page content appears minimal');
    } else {
      console.log('✅ Page contains substantial content');
    }

    // Check for specific elements
    const productElements = await page.$$('[data-testid*="product"], .product, .featured');
    console.log(`📦 Product Elements Found: ${productElements.length}`);

    const navElements = await page.$$('[data-testid*="nav"], nav, header');
    console.log(`🧭 Navigation Elements Found: ${navElements.length}`);

  } catch (error) {
    console.error('❌ Error during debugging:', error.message);
  } finally {
    await browser.close();
  }
}

debugFrontend().catch(console.error);
const puppeteer = require('puppeteer');

async function simplePageTest() {
  console.log('🧪 Simple Page Test...\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=1200,800']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Go to temp-client server
    console.log('1. Navigating to temp-client server...');
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle2' });

    // Take screenshot
    await page.screenshot({ path: 'test-results/page-loaded.png' });
    console.log('   ✅ Page loaded and screenshot taken');

    // Get page title
    const title = await page.title();
    console.log('2. Page title:', title);

    // Get body text
    const bodyText = await page.evaluate(() => document.body.textContent);
    console.log('3. Body text length:', bodyText.length);
    console.log('4. First 200 chars:', bodyText.substring(0, 200));

    // Check if React is loaded
    const reactVersion = await page.evaluate(() => window.React?.version || 'Not loaded');
    console.log('5. React version:', reactVersion);

    // Check console for errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });

    // Wait a bit more for React to render
    await page.waitForTimeout(2000);

    // Take another screenshot
    await page.screenshot({ path: 'test-results/page-rendered.png' });
    console.log('   ✅ Additional screenshot taken');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

simplePageTest();
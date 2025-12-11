import puppeteer from 'puppeteer';

async function testBasicNavigation() {
  console.log('🧪 Testing Basic Navigation');

  try {
    const browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--start-maximized']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    console.log('1️⃣ Navigating to homepage...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

    const pageTitle = await page.title();
    console.log('📝 Homepage title:', pageTitle);

    // Just take a screenshot to verify basic functionality
    await page.screenshot({ path: 'test-screenshot.png' });

    console.log('✅ Basic navigation test successful');

    await browser.close();

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testBasicNavigation();
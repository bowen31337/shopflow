import puppeteer from 'puppeteer';

async function testApiConnectivity() {
  console.log('🌐 Testing API connectivity...');

  const browser = await puppeteer.launch({
    headless: false,
    devtools: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-ipc-flooding-protection'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });

  try {
    // Navigate to the app
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

    // Open browser console and test API call
    const apiTestResult = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'customer@example.com',
            password: 'customer123'
          })
        });

        const data = await response.json();
        return {
          status: response.status,
          ok: response.ok,
          data: data
        };
      } catch (error) {
        return {
          error: error.message
        };
      }
    });

    console.log('API Test Result:', JSON.stringify(apiTestResult, null, 2));

    // Check network requests
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });

    // Enable network monitoring
    await page.setRequestInterception(true);
    const requests = [];

    page.on('request', (request) => {
      requests.push({
        method: request.method(),
        url: request.url(),
        headers: request.headers()
      });
      request.continue();
    });

    // Try to login via form
    await page.type('#email', 'customer@example.com');
    await page.type('#password', 'customer123');
    await page.click('button[type="submit"]');

    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('Network requests made:');
    requests.forEach((req, index) => {
      console.log(`${index + 1}. ${req.method} ${req.url}`);
    });

    // Take screenshot
    await page.screenshot({ path: 'test-results/api-connectivity-test.png', fullPage: true });

  } catch (error) {
    console.error('❌ API connectivity test failed:', error);
    await page.screenshot({ path: 'test-results/api-connectivity-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testApiConnectivity().catch(console.error);
import puppeteer from 'puppeteer';

async function testWithNetworkMonitoring() {
  console.log('🌐 Testing with network monitoring...');

  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
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
    // Enable network monitoring
    await page.setCacheEnabled(false);
    await page.setRequestInterception(true);

    const requests = [];
    const responses = [];

    page.on('request', (request) => {
      console.log('Request:', request.method(), request.url());
      requests.push({
        method: request.method(),
        url: request.url(),
        headers: request.headers(),
        postData: request.postData()
      });
      request.continue();
    });

    page.on('response', (response) => {
      console.log('Response:', response.status(), response.url());
      responses.push({
        status: response.status(),
        url: response.url(),
        headers: response.headers()
      });
    });

    // Navigate to login page
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });

    // Fill and submit form
    await page.type('#email', 'customer@example.com');
    await page.type('#password', 'customer123');
    await page.click('button[type="submit"]');

    // Wait for network activity to settle
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\n=== REQUESTS ===');
    requests.forEach((req, index) => {
      console.log(`${index + 1}. ${req.method} ${req.url}`);
      if (req.postData) {
        console.log(`   Data: ${req.postData}`);
      }
    });

    console.log('\n=== RESPONSES ===');
    responses.forEach((res, index) => {
      console.log(`${index + 1}. ${res.status} ${res.url}`);
    });

    // Take screenshot
    await page.screenshot({ path: 'test-results/network-monitoring.png', fullPage: true });

  } catch (error) {
    console.error('❌ Network monitoring test failed:', error);
    await page.screenshot({ path: 'test-results/network-monitoring-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testWithNetworkMonitoring().catch(console.error);
import puppeteer from 'puppeteer';

async function testSimpleProxy() {
  console.log('🌐 Testing simple proxy call...');

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
    // Enable network monitoring
    await page.setCacheEnabled(false);
    await page.setRequestInterception(true);

    const requests = [];
    const responses = [];

    page.on('request', (request) => {
      requests.push({
        method: request.method(),
        url: request.url()
      });
      request.continue();
    });

    page.on('response', (response) => {
      responses.push({
        status: response.status(),
        url: response.url()
      });
    });

    // Test 1: Direct backend call
    console.log('1. Testing direct backend call...');
    const directResult = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3001/api/health', {
          method: 'GET'
        });
        const data = await response.json().catch(() => null);
        return {
          status: response.status,
          data: data
        };
      } catch (error) {
        return {
          error: error.message
        };
      }
    });

    console.log('Direct result:', JSON.stringify(directResult, null, 2));

    // Test 2: Proxied call
    console.log('2. Testing proxied call...');
    const proxyResult = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/health', {
          method: 'GET'
        });
        const data = await response.json().catch(() => null);
        return {
          status: response.status,
          data: data
        };
      } catch (error) {
        return {
          error: error.message
        };
      }
    });

    console.log('Proxy result:', JSON.stringify(proxyResult, null, 2));

    console.log('\n=== REQUESTS ===');
    requests.forEach((req, index) => {
      console.log(`${index + 1}. ${req.method} ${req.url}`);
    });

    console.log('\n=== RESPONSES ===');
    responses.forEach((res, index) => {
      console.log(`${index + 1}. ${res.status} ${res.url}`);
    });

    await page.screenshot({ path: 'test-results/simple-proxy-test.png', fullPage: true });

  } catch (error) {
    console.error('❌ Simple proxy test failed:', error);
    await page.screenshot({ path: 'test-results/simple-proxy-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testSimpleProxy().catch(console.error);
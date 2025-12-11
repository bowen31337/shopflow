import puppeteer from 'puppeteer';

async function testDirectApi() {
  console.log('🌐 Testing direct API call...');

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
    // Make a direct API call without going through the app
    const apiTestResult = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'customer@example.com',
            password: 'customer123'
          })
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        const data = await response.json().catch(err => {
          console.log('JSON parse error:', err);
          return null;
        });

        return {
          status: response.status,
          ok: response.ok,
          data: data,
          headers: Object.fromEntries(response.headers.entries())
        };
      } catch (error) {
        console.log('Fetch error:', error);
        return {
          error: error.message
        };
      }
    });

    console.log('Direct API Test Result:', JSON.stringify(apiTestResult, null, 2));

    // Also test the proxied call
    const proxiedResult = await page.evaluate(async () => {
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

        const data = await response.json().catch(err => {
          console.log('JSON parse error:', err);
          return null;
        });

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

    console.log('Proxied API Test Result:', JSON.stringify(proxiedResult, null, 2));

    await page.screenshot({ path: 'test-results/direct-api-test.png', fullPage: true });

  } catch (error) {
    console.error('❌ Direct API test failed:', error);
    await page.screenshot({ path: 'test-results/direct-api-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testDirectApi().catch(console.error);
import puppeteer from 'puppeteer';

async function testProxy() {
  console.log('🌐 Testing proxy configuration...');

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
    // First test: direct connection to backend
    console.log('1. Testing direct connection to backend...');
    const directResult = await page.evaluate(async () => {
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

        const data = await response.json().catch(() => null);
        return {
          status: response.status,
          ok: response.ok,
          data: data,
          url: response.url
        };
      } catch (error) {
        return {
          error: error.message
        };
      }
    });

    console.log('Direct result:', JSON.stringify(directResult, null, 2));

    // Second test: proxied connection
    console.log('2. Testing proxied connection...');
    const proxyResult = await page.evaluate(async () => {
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

        const data = await response.json().catch(() => null);
        return {
          status: response.status,
          ok: response.ok,
          data: data,
          url: response.url
        };
      } catch (error) {
        return {
          error: error.message
        };
      }
    });

    console.log('Proxy result:', JSON.stringify(proxyResult, null, 2));

    await page.screenshot({ path: 'test-results/proxy-test.png', fullPage: true });

  } catch (error) {
    console.error('❌ Proxy test failed:', error);
    await page.screenshot({ path: 'test-results/proxy-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testProxy().catch(console.error);
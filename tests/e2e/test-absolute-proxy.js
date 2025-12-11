import puppeteer from 'puppeteer';

async function testAbsoluteProxy() {
  console.log('🌐 Testing absolute proxy call...');

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
    // Test proxied call with absolute URL
    console.log('Testing proxied call with absolute URL...');
    const proxyResult = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:5173/api/health', {
          method: 'GET'
        });
        const data = await response.json().catch(() => null);
        return {
          status: response.status,
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

    await page.screenshot({ path: 'test-results/absolute-proxy-test.png', fullPage: true });

  } catch (error) {
    console.error('❌ Absolute proxy test failed:', error);
    await page.screenshot({ path: 'test-results/absolute-proxy-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testAbsoluteProxy().catch(console.error);
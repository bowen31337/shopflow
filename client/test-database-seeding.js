import puppeteer from 'puppeteer';

async function testDatabaseSeeding() {
  console.log('🔍 Testing database seeding...');

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
    // Test health endpoint
    console.log('🏥 Testing health endpoint...');
    const healthResult = await page.evaluate(async () => {
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

    console.log('Health check result:', JSON.stringify(healthResult, null, 2));

    // Test products endpoint to see if data is seeded
    console.log('🛍️  Testing products endpoint...');
    const productsResult = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3001/api/products', {
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

    console.log('Products result:', JSON.stringify(productsResult, null, 2));

    // Test categories endpoint
    console.log('📁 Testing categories endpoint...');
    const categoriesResult = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3001/api/categories', {
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

    console.log('Categories result:', JSON.stringify(categoriesResult, null, 2));

    await page.screenshot({ path: 'test-results/database-seeding-test.png', fullPage: true });

  } catch (error) {
    console.error('❌ Database seeding test failed:', error);
    await page.screenshot({ path: 'test-results/database-seeding-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testDatabaseSeeding().catch(console.error);
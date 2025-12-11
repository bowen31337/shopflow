import puppeteer from 'puppeteer';

async function testCompleteLoginFlow() {
  console.log('🧪 Testing complete login flow with actual frontend...');

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
    // Navigate to login page
    console.log('🔐 Navigating to login page...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });

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

    // Clear localStorage first
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Check initial localStorage
    let localStorageItems = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        items[key] = localStorage.getItem(key);
      }
      return items;
    });

    console.log('Initial localStorage:', localStorageItems);

    // Fill login form
    console.log('📝 Filling login form...');
    await page.type('#email', 'test@example.com');
    await page.type('#password', 'test123');

    // Submit form
    console.log('📤 Submitting form...');
    await page.click('button[type="submit"]');

    // Wait for response
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check localStorage after login
    localStorageItems = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        items[key] = localStorage.getItem(key);
      }
      return items;
    });

    console.log('LocalStorage after login:', localStorageItems);

    // Check current URL
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    // Check for error messages
    const errorMessages = await page.$$eval('.error-message, .alert', els => els.map(el => el.textContent));
    console.log('Error messages:', errorMessages);

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

    await page.screenshot({ path: 'test-results/complete-login-flow.png', fullPage: true });

  } catch (error) {
    console.error('❌ Complete login flow test failed:', error);
    await page.screenshot({ path: 'test-results/complete-login-flow-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testCompleteLoginFlow().catch(console.error);
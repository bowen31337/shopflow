import puppeteer from 'puppeteer';

async function testFrontendAPI() {
  console.log('🌐 Testing frontend API calls...');

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
    // Navigate to the app
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

    // Test API call from the frontend
    console.log('🔍 Testing API call from frontend...');
    const apiResult = await page.evaluate(async () => {
      try {
        // Simulate the frontend API call
        const response = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'test123'
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
          data: data
        };
      } catch (error) {
        console.log('Fetch error:', error);
        return {
          error: error.message
        };
      }
    });

    console.log('Frontend API Test Result:', JSON.stringify(apiResult, null, 2));

    // Test the actual login function from the frontend
    console.log('🔐 Testing actual login function...');
    const actualLoginResult = await page.evaluate(async () => {
      try {
        // Import the auth store and login function
        const loginFunction = async (email, password) => {
          const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
            error.response = {
              status: response.status,
              data: errorData
            };
            throw error;
          }

          const result = await response.json();
          const { accessToken: token, user } = result;

          // Store in localStorage like the frontend does
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));

          return { user, token };
        };

        return await loginFunction('test@example.com', 'test123');
      } catch (error) {
        return {
          error: error.message,
          stack: error.stack
        };
      }
    });

    console.log('Actual login result:', JSON.stringify(actualLoginResult, null, 2));

    // Check localStorage after login attempt
    const localStorageItems = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        items[key] = localStorage.getItem(key);
      }
      return items;
    });

    console.log('LocalStorage items:', localStorageItems);

    await page.screenshot({ path: 'test-results/frontend-api-test.png', fullPage: true });

  } catch (error) {
    console.error('❌ Frontend API test failed:', error);
    await page.screenshot({ path: 'test-results/frontend-api-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testFrontendAPI().catch(console.error);
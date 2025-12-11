import puppeteer from 'puppeteer';

async function testDirectLogin() {
  console.log('🧪 Testing direct login to backend...');

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
    // Test direct login to backend
    console.log('🔐 Testing direct login to backend...');
    const loginResult = await page.evaluate(async () => {
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
          data: data
        };
      } catch (error) {
        return {
          error: error.message
        };
      }
    });

    console.log('Direct login result:', JSON.stringify(loginResult, null, 2));

    if (loginResult.status === 200 && loginResult.data && loginResult.data.accessToken) {
      console.log('✅ Direct login successful!');

      // Test protected route with the token
      console.log('🔐 Testing protected route with token...');
      const protectedResult = await page.evaluate(async (token) => {
        try {
          const response = await fetch('http://localhost:3001/api/auth/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
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
      }, loginResult.data.accessToken);

      console.log('Protected route result:', JSON.stringify(protectedResult, null, 2));

      if (protectedResult.status === 200) {
        console.log('✅ Protected route access successful!');
      } else {
        console.log('❌ Protected route access failed');
      }

    } else {
      console.log('❌ Direct login failed');
    }

    await page.screenshot({ path: 'test-results/direct-login-test.png', fullPage: true });

  } catch (error) {
    console.error('❌ Direct login test failed:', error);
    await page.screenshot({ path: 'test-results/direct-login-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testDirectLogin().catch(console.error);
import puppeteer from 'puppeteer';

async function testRegistration() {
  console.log('📝 Testing user registration...');

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
    // Test registration
    console.log('📝 Testing user registration...');
    const registrationResult = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3001/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'test123',
            name: 'Test User'
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

    console.log('Registration result:', JSON.stringify(registrationResult, null, 2));

    if (registrationResult.status === 201) {
      console.log('✅ Registration successful!');

      // Now try to login with the new user
      console.log('🔐 Testing login with new user...');
      const loginResult = await page.evaluate(async () => {
        try {
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

      console.log('Login result:', JSON.stringify(loginResult, null, 2));

      if (loginResult.status === 200 && loginResult.data && loginResult.data.accessToken) {
        console.log('✅ Login successful with new user!');
      } else {
        console.log('❌ Login failed with new user');
      }

    } else {
      console.log('❌ Registration failed');
    }

    await page.screenshot({ path: 'test-results/registration-test.png', fullPage: true });

  } catch (error) {
    console.error('❌ Registration test failed:', error);
    await page.screenshot({ path: 'test-results/registration-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testRegistration().catch(console.error);
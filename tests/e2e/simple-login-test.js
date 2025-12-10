// Simple ShopFlow Login Test using Puppeteer Tools
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  headless: false,
  devtools: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 800 });

// Navigate to ShopFlow homepage
await page.goto('http://localhost:5175');
await page.waitForTimeout(2000);

// Take screenshot of homepage
await page.screenshot({ path: 'homepage.png' });

// Navigate to login page
await page.click('a[href="/login"]');
await page.waitForSelector('form');

// Take screenshot of login page
await page.screenshot({ path: 'login-page.png' });

// Try to login with test credentials
await page.type('input[name="email"]', 'customer@example.com');
await page.type('input[name="password"]', 'customer123');

// Submit login form
await page.click('button[type="submit"]');

// Wait for navigation and check results
try {
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 });

  // Check for JWT token in localStorage
  const token = await page.evaluate(() => localStorage.getItem('auth-storage'));
  console.log('JWT Token exists:', !!token);

  // Check for logout button (indicates successful login)
  const hasLogout = await page.locator('button:has-text("Logout")').count() > 0;
  console.log('User logged in:', hasLogout);

  // Take screenshot after login
  await page.screenshot({ path: 'after-login.png' });

} catch (error) {
  console.log('Login failed:', error.message);
  await page.screenshot({ path: 'login-failed.png' });
}

await browser.close();
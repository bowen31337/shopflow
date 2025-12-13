const puppeteer = require('puppeteer');

async function checkPageHTML() {
  console.log('Checking Page HTML...\n');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security'
      ]
    });

    const page = await browser.newPage();
    await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle2' });

    // Get the full HTML content
    const html = await page.content();
    console.log('Page HTML content:');
    console.log('=================');
    console.log(html);
    console.log('=================\n');

    // Check if the page contains React elements
    if (html.includes('Welcome back')) {
      console.log('✓ Page contains "Welcome back" text');
    }

    if (html.includes('Sign in to your ShopFlow account')) {
      console.log('✓ Page contains "Sign in to your ShopFlow account" text');
    }

    if (html.includes('Continue with Google')) {
      console.log('✓ Page contains "Continue with Google" text');
    }

    if (html.includes('<button')) {
      console.log('✓ Page contains button elements');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

checkPageHTML().catch(console.error);
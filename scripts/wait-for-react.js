const puppeteer = require('puppeteer');

async function waitForReactContent() {
  console.log('Waiting for React Content to Load...\n');

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

    // Wait for React to render content
    console.log('Waiting for React content to load...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check if the "Welcome back" text is visible
    const welcomeText = await page.$('text=Welcome back');
    if (welcomeText) {
      console.log('✓ "Welcome back" text is visible');
    } else {
      console.log('✗ "Welcome back" text not found');
    }

    // Try to wait for the specific text
    try {
      await page.waitForSelector('text=Welcome back', { timeout: 10000 });
      console.log('✓ "Welcome back" text loaded successfully');
    } catch (error) {
      console.log('✗ "Welcome back" text did not load within 10 seconds');
    }

    // Get all text content
    const textContent = await page.evaluate(() => document.body.innerText);
    console.log('\nPage text content:');
    console.log('==================');
    console.log(textContent);
    console.log('==================\n');

    // Try to find the Google button by waiting for it
    try {
      await page.waitForSelector('button', { timeout: 5000 });
      console.log('✓ Buttons found on page');

      // Get button text
      const buttonText = await page.$$eval('button', buttons =>
        buttons.map(btn => btn.textContent.trim())
      );
      console.log('Button texts:', buttonText);

    } catch (error) {
      console.log('✗ No buttons found on page');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

waitForReactContent().catch(console.error);
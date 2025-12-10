const puppeteer = require('puppeteer');

async function testConsoleErrors() {
  console.log('Testing for console errors...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Capture console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to products page
    console.log('1. Navigating to products page...');
    await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle2' });

    // Wait for React to render
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check for console errors
    console.log('2. Console errors found:');
    if (consoleErrors.length === 0) {
      console.log('   No console errors detected');
    } else {
      consoleErrors.forEach((error, index) => {
        console.log(`   Error ${index + 1}:`, error);
      });
    }

    // Check page title and URL
    const title = await page.title();
    const url = page.url();
    console.log('3. Page info:');
    console.log('   Title:', title);
    console.log('   URL:', url);

    // Check if root element has content
    const rootContent = await page.$eval('#root', el => el.innerHTML);
    console.log('4. Root element content length:', rootContent.length);
    console.log('   Root content (first 500 chars):');
    console.log(rootContent.substring(0, 500));

    return consoleErrors.length === 0;

  } catch (error) {
    console.error('Test failed:', error);
    return false;
  } finally {
    await browser.close();
  }
}

testConsoleErrors().then(success => {
  console.log('\nTest completed:', success ? 'SUCCESS' : 'FAILURE');
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
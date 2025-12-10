const puppeteer = require('puppeteer');

async function testPageContent() {
  console.log('Testing page content...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Navigate to products page
    console.log('1. Navigating to products page...');
    await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle2' });

    // Wait for React to render
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Get the full page content
    const content = await page.content();
    console.log('2. Page content length:', content.length);

    // Check for specific elements
    const hasHeader = content.includes('Products');
    const hasGridButtons = content.includes('Grid view') || content.includes('grid') || content.includes('M4 6a2');
    const hasListButtons = content.includes('List view') || content.includes('list') || content.includes('M4 6h16');

    console.log('3. Content analysis:');
    console.log('   Has "Products" header:', hasHeader);
    console.log('   Has grid-related content:', hasGridButtons);
    console.log('   Has list-related content:', hasListButtons);

    // Check for React components
    const hasReactComponents = content.includes('<div') || content.includes('class=') || content.includes('data-testid');
    console.log('   Has React components:', hasReactComponents);

    // Save content to file for inspection
    const fs = require('fs');
    fs.writeFileSync('/Users/bowenli/development/claude-quickstarts/autonomous-coding/demo/page-content.html', content);

    // Try to get visible text
    const visibleText = await page.evaluate(() => document.body.innerText);
    console.log('4. Visible text (first 500 chars):');
    console.log(visibleText.substring(0, 500));

    return true;

  } catch (error) {
    console.error('Test failed:', error);
    return false;
  } finally {
    await browser.close();
  }
}

testPageContent().then(() => process.exit(0)).catch(() => process.exit(1));
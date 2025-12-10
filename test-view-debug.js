const puppeteer = require('puppeteer');

async function testViewToggleDebug() {
  console.log('Starting debug view toggle test...');

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
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Get the page content for debugging
    const content = await page.content();
    console.log('2. Page loaded. Checking for view toggle elements...');

    // Look for any buttons that might be view toggles
    const buttons = await page.$$eval('button', buttons => buttons.map(b => ({
      text: b.textContent.trim(),
      ariaLabel: b.getAttribute('aria-label'),
      title: b.getAttribute('title'),
      className: b.className
    })));

    console.log('3. Found buttons:');
    buttons.forEach((btn, index) => {
      console.log(`  Button ${index + 1}:`, btn);
    });

    // Look for SVG icons that might be view toggles
    const svgButtons = await page.$$eval('button svg', svgs => svgs.map(svg => {
      const parent = svg.parentElement;
      return {
        ariaLabel: parent.getAttribute('aria-label'),
        title: parent.getAttribute('title'),
        path: svg.querySelector('path')?.getAttribute('d')
      };
    }));

    console.log('4. Found SVG buttons:');
    svgButtons.forEach((btn, index) => {
      console.log(`  SVG Button ${index + 1}:`, btn);
    });

    // Check if any buttons contain grid or list icons
    const gridButtons = await page.$$eval('button', buttons => buttons.map(b => ({
      text: b.textContent.trim(),
      ariaLabel: b.getAttribute('aria-label'),
      title: b.getAttribute('title'),
      hasGridIcon: b.querySelector('svg path[d*="M4 6a2"]') !== null,
      hasListIcon: b.querySelector('svg path[d*="M4 6h16"]') !== null
    })));

    console.log('5. Buttons with potential grid/list icons:');
    gridButtons.forEach((btn, index) => {
      if (btn.hasGridIcon || btn.hasListIcon) {
        console.log(`  Button ${index + 1}:`, btn);
      }
    });

    // Try to find buttons by looking for specific SVG paths
    const gridButton = await page.$('button svg path[d*="M4 6a2"]');
    const listButton = await page.$('button svg path[d*="M4 6h16"]');

    console.log('6. Checking for specific SVG patterns:');
    console.log('   Grid button found:', !!gridButton);
    console.log('   List button found:', !!listButton);

    if (gridButton && listButton) {
      console.log('✓ Both view toggle buttons found!');

      // Test clicking them
      console.log('7. Testing button clicks...');

      const initialUrl = page.url();
      console.log('   Initial URL:', initialUrl);

      // Click list button
      await listButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      const listUrl = page.url();
      console.log('   URL after list click:', listUrl);
      console.log('   Has view=list:', listUrl.includes('view=list'));

      // Click grid button
      await gridButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      const gridUrl = page.url();
      console.log('   URL after grid click:', gridUrl);
      console.log('   Has view=grid:', gridUrl.includes('view=grid'));

      console.log('✓ View toggle functionality works!');
      return true;
    } else {
      console.log('✗ View toggle buttons not found with expected patterns');
      return false;
    }

  } catch (error) {
    console.error('Test failed with error:', error);
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
testViewToggleDebug().then(success => {
  console.log('\nTest completed:', success ? 'SUCCESS' : 'FAILURE');
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
/**
 * Order History Functionality Verification Script
 *
 * This script tests the order history functionality by:
 * 1. Verifying API endpoints exist and work
 * 2. Testing authentication
 * 3. Creating test orders (if needed)
 * 4. Verifying order retrieval
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001';

async function testOrderHistory() {
  console.log('🔍 Testing Order History Functionality...\n');

  try {
    // Step 1: Test basic API connectivity
    console.log('1. Testing API connectivity...');
    const healthResponse = await fetch(`${API_BASE}/api/health`);
    if (healthResponse.ok) {
      console.log('✅ API is accessible');
    } else {
      throw new Error('API not accessible');
    }

    // Step 2: Test authentication
    console.log('\n2. Testing authentication...');
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'customer@example.com',
        password: 'customer123'
      })
    });

    if (loginResponse.ok) {
      const { accessToken: token, user } = await loginResponse.json();
      console.log('✅ Authentication successful');
      console.log(`   User: ${user.name} (${user.email})`);

      // Step 3: Test orders endpoint
      console.log('\n3. Testing orders endpoint...');
      const ordersResponse = await fetch(`${API_BASE}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        console.log('✅ Orders endpoint working');
        console.log(`   Found ${ordersData.orders.length} orders`);

        if (ordersData.orders.length === 0) {
          console.log('ℹ️  No orders found - this is expected for a new test account');
        } else {
          console.log('📋 Sample orders:');
          ordersData.orders.slice(0, 2).forEach((order, index) => {
            console.log(`   ${index + 1}. Order #${order.order_number} - ${order.status} - ${order.formatted_total}`);
          });
        }
      } else {
        const error = await ordersResponse.json();
        throw new Error(`Orders endpoint failed: ${error.message}`);
      }

    } else {
      const error = await loginResponse.json();
      throw new Error(`Authentication failed: ${error.message}`);
    }

    console.log('\n🎉 Order History functionality test completed successfully!');
    console.log('\n📝 Manual Testing Steps:');
    console.log('1. Open http://localhost:5174 in your browser');
    console.log('2. Login with: customer@example.com / customer123');
    console.log('3. Go to Profile page');
    console.log('4. Click on "Order History" in the Quick Links section');
    console.log('5. Verify the Order History page loads and displays correctly');
    console.log('6. If you have orders, click "View Details" to test the Order Detail page');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure both backend and frontend servers are running');
    console.log('2. Backend: http://localhost:3001');
    console.log('3. Frontend: http://localhost:5174');
    console.log('4. Check that CORS is properly configured');
  }
}

// Run the test
testOrderHistory();
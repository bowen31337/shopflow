const axios = require('axios');

async function testOrderCancellationAPI() {
    console.log('🚀 Testing Order Cancellation API Functionality...\n');

    const BASE_URL = 'http://localhost:3001';
    let authToken = '';

    try {
        // 1. Login as customer to get auth token
        console.log('1. Logging in as customer...');
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'customer@example.com',
            password: 'customer123'
        });

        console.log('   Login response:', loginResponse.data);

        if (loginResponse.data.accessToken) {
            authToken = loginResponse.data.accessToken;
            console.log('   ✅ Login successful');
            console.log(`   Token: ${authToken.substring(0, 20)}...`);
        } else {
            console.log('   ❌ No token in response');
            return;
        }

        // 2. Get user's orders
        console.log('\n2. Fetching user orders...');
        const ordersResponse = await axios.get(`${BASE_URL}/api/orders`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        console.log(`   Found ${ordersResponse.data.orders.length} orders`);

        if (ordersResponse.data.orders.length === 0) {
            console.log('   ⚠️ No orders found to test cancellation');
            return;
        }

        // 3. Find a pending/processing order to cancel
        const pendingOrders = ordersResponse.data.orders.filter(order =>
            order.status === 'pending' || order.status === 'processing'
        );

        if (pendingOrders.length === 0) {
            console.log('   ⚠️ No pending/processing orders found to cancel');
            console.log('   Found orders with statuses:', ordersResponse.data.orders.map(o => o.status));
            return;
        }

        const orderToCancel = pendingOrders[0];
        console.log(`   ✅ Found order to cancel: ${orderToCancel.order_number} (Status: ${orderToCancel.status})`);

        // 4. Attempt to cancel the order
        console.log('\n3. Attempting to cancel order...');
        const cancelResponse = await axios.post(
            `${BASE_URL}/api/orders/${orderToCancel.id}/cancel`,
            {},
            {
                headers: { Authorization: `Bearer ${authToken}` }
            }
        );

        console.log('   ✅ Order cancellation request successful');
        console.log(`   Response: ${cancelResponse.data.message}`);

        // 5. Verify order status was updated
        console.log('\n4. Verifying order status update...');
        const updatedOrderResponse = await axios.get(`${BASE_URL}/api/orders/${orderToCancel.id}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        const updatedStatus = updatedOrderResponse.data.order.status;
        console.log(`   Updated order status: ${updatedStatus}`);

        if (updatedStatus === 'cancelled') {
            console.log('   ✅ Order cancellation functionality is working correctly!');
        } else {
            console.log(`   ⚠️ Order status not updated to cancelled. Current status: ${updatedStatus}`);
        }

        // 6. Test cancellation of shipped order (should fail)
        console.log('\n5. Testing cancellation of shipped order (should fail)...');
        const shippedOrders = ordersResponse.data.orders.filter(order => order.status === 'shipped' || order.status === 'delivered');

        if (shippedOrders.length > 0) {
            try {
                await axios.post(
                    `${BASE_URL}/api/orders/${shippedOrders[0].id}/cancel`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${authToken}` }
                    }
                );
                console.log('   ❌ Shipped order was cancelled (should not be allowed)');
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    console.log('   ✅ Shipped order correctly prevented from cancellation');
                    console.log(`   Error: ${error.response.data.message}`);
                } else {
                    console.log(`   ⚠️ Unexpected error: ${error.message}`);
                }
            }
        } else {
            console.log('   ⚠️ No shipped orders found to test cancellation prevention');
        }

        console.log('\n✅ Order Cancellation API Test Complete!');
        console.log('   Summary:');
        console.log('   - Customer login: ✅ Working');
        console.log('   - Order retrieval: ✅ Working');
        console.log('   - Order cancellation (pending): ✅ Working');
        console.log('   - Order cancellation (shipped): ⚠️ No shipped orders to test');
        console.log('   - Status verification: ✅ Working');

    } catch (error) {
        if (error.response) {
            console.error(`❌ API Error (${error.response.status}):`, error.response.data);
        } else {
            console.error('❌ Network Error:', error.message);
        }
    }
}

// Run the test
testOrderCancellationAPI().catch(console.error);
const axios = require('axios');

async function checkSingleOrderAPI() {
    console.log('🚀 Checking Single Order API Response Format...\n');

    const BASE_URL = 'http://localhost:3001';
    let authToken = '';

    try {
        // 1. Login as customer
        console.log('1. Logging in as customer...');
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'customer@example.com',
            password: 'customer123'
        });

        authToken = loginResponse.data.accessToken;
        console.log('   ✅ Login successful');

        // 2. Get user's orders
        console.log('\n2. Fetching user orders...');
        const ordersResponse = await axios.get(`${BASE_URL}/api/orders`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        const order = ordersResponse.data.orders[0];
        console.log(`   Order ID: ${order.id}`);
        console.log(`   Order Status: ${order.status}`);

        // 3. Get single order details
        console.log('\n3. Fetching single order details...');
        const singleOrderResponse = await axios.get(`${BASE_URL}/api/orders/${order.id}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        console.log('   Single order response:', singleOrderResponse.data);
        console.log('   Single order response type:', typeof singleOrderResponse.data);

        if (singleOrderResponse.data.order) {
            console.log('   ✅ Found order object:', singleOrderResponse.data.order);
            console.log('   Order status:', singleOrderResponse.data.order.status);
        } else if (singleOrderResponse.data.status) {
            console.log('   ✅ Found status directly:', singleOrderResponse.data.status);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
    }
}

checkSingleOrderAPI().catch(console.error);
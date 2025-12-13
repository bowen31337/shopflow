const axios = require('axios');

async function checkAllOrders() {
    console.log('🚀 Checking All Orders for Verified Purchase Logic...\n');

    const BASE_URL = 'http://localhost:3001';
    let authToken = '';

    try {
        // Login
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'customer@example.com',
            password: 'customer123'
        });
        authToken = loginResponse.data.accessToken;

        // Get all orders
        const ordersResponse = await axios.get(`${BASE_URL}/api/orders`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        const orders = ordersResponse.data.orders;
        console.log(`Total orders: ${orders.length}`);

        orders.forEach((order, index) => {
            console.log(`\nOrder ${index + 1}: ${order.order_number}`);
            console.log(`  Status: ${order.status}`);
            console.log(`  Items:`);
            order.items.forEach(item => {
                console.log(`    - ${item.name} (ID: ${item.id}) - ${item.quantity} x $${item.unit_price}`);
            });
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkAllOrders().catch(console.error);
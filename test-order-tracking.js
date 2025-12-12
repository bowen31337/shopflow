#!/usr/bin/env node

/**
 * Test script to verify order tracking functionality
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

// Test credentials
const testUser = {
  email: 'customer@example.com',
  password: 'customer123'
};

async function login() {
  console.log('🔐 Logging in...');
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(testUser)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Login failed: ${data.message}`);
  }

  return data.token;
}

async function getOrders(token) {
  console.log('📋 Fetching orders...');
  const response = await fetch(`${BASE_URL}/api/orders`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to fetch orders: ${data.message}`);
  }

  return data.orders;
}

async function getOrderDetail(token, orderId) {
  console.log(`📋 Fetching order details for order ${orderId}...`);
  const response = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to fetch order details: ${data.message}`);
  }

  return data.order;
}

async function updateOrderStatus(token, orderId, status) {
  console.log(`🔄 Updating order ${orderId} status to ${status}...`);
  const response = await fetch(`${BASE_URL}/api/orders/${orderId}/update-status`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to update order status: ${data.message}`);
  }

  return data.order;
}

function formatOrderInfo(order) {
  return `
Order #${order.order_number}
Status: ${order.status}
Tracking: ${order.tracking_number || 'No tracking number'}
Total: $${order.total.toFixed(2)}
Created: ${order.created_at}
Updated: ${order.updated_at}`;
}

async function main() {
  try {
    console.log('🚀 Testing Order Tracking Functionality\n');

    // Login
    const token = await login();
    console.log('✅ Login successful\n');

    // Get orders
    const orders = await getOrders(token);

    if (orders.length === 0) {
      console.log('❌ No orders found. Please create an order first.');
      process.exit(1);
    }

    console.log(`✅ Found ${orders.length} order(s)\n`);

    // Test with the first order
    const testOrder = orders[0];

    console.log('=== BEFORE TRACKING NUMBER GENERATION ===');
    console.log(formatOrderInfo(testOrder));

    // If order is not shipped, ship it to generate tracking number
    let orderToTest = testOrder;

    if (testOrder.status !== 'shipped') {
      console.log('\n📦 Shipping order to generate tracking number...');
      const shippedOrder = await updateOrderStatus(token, testOrder.id, 'shipped');
      orderToTest = shippedOrder;
    } else {
      console.log('\n📋 Order is already shipped, fetching details...');
      orderToTest = await getOrderDetail(token, testOrder.id);
    }

    console.log('\n=== AFTER TRACKING NUMBER GENERATION ===');
    console.log(formatOrderInfo(orderToTest));

    // Verify tracking number
    if (!orderToTest.tracking_number) {
      console.log('\n❌ FAILED: No tracking number generated');
      process.exit(1);
    }

    if (!orderToTest.tracking_number.startsWith('TRK-')) {
      console.log('\n❌ FAILED: Tracking number format is incorrect');
      console.log(`Expected: TRK-YYYYMMDD-HHMMSS-XXXXXX`);
      console.log(`Actual: ${orderToTest.tracking_number}`);
      process.exit(1);
    }

    console.log('\n✅ SUCCESS: Tracking number generated correctly');
    console.log(`Tracking Number: ${orderToTest.tracking_number}`);

    // Test updating to delivered status
    console.log('\n📦 Updating order status to delivered...');
    const deliveredOrder = await updateOrderStatus(token, orderToTest.id, 'delivered');

    console.log('\n=== AFTER DELIVERY ===');
    console.log(formatOrderInfo(deliveredOrder));

    console.log('\n🎉 All tests passed! Order tracking functionality is working correctly.');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
main();
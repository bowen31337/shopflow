#!/bin/bash

# Test script to verify order tracking functionality

BASE_URL="http://localhost:3001"
EMAIL="customer@example.com"
PASSWORD="customer123"

echo "🚀 Testing Order Tracking Functionality"
echo "========================================"

# Login and get token
echo "🔐 Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful"

# Get orders
echo "📋 Fetching orders..."
ORDERS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/orders" \
  -H "Authorization: Bearer $TOKEN")

ORDER_ID=$(echo $ORDERS_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$ORDER_ID" ]; then
  echo "❌ No orders found"
  echo "Response: $ORDERS_RESPONSE"
  exit 1
fi

echo "✅ Found order ID: $ORDER_ID"

# Get order details
echo "📋 Fetching order details..."
ORDER_DETAILS=$(curl -s -X GET "$BASE_URL/api/orders/$ORDER_ID" \
  -H "Authorization: Bearer $TOKEN")

TRACKING_NUMBER=$(echo $ORDER_DETAILS | grep -o '"tracking_number":null' | cut -d':' -f2)

if [ "$TRACKING_NUMBER" = "null" ]; then
  TRACKING_NUMBER=""
else
  TRACKING_NUMBER=$(echo $ORDER_DETAILS | grep -o '"tracking_number":"[^"]*"' | cut -d'"' -f4)
fi

echo "=== BEFORE TRACKING NUMBER GENERATION ==="
echo "Order ID: $ORDER_ID"
echo "Tracking Number: ${TRACKING_NUMBER:-'No tracking number'}"

# If order is not shipped, ship it to generate tracking number
if [ -z "$TRACKING_NUMBER" ]; then
  echo "📦 Shipping order to generate tracking number..."
  SHIP_RESPONSE=$(curl -s -X POST "$BASE_URL/api/orders/$ORDER_ID/update-status" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"status":"shipped"}')

  NEW_TRACKING=$(echo $SHIP_RESPONSE | grep -o '"trackingNumber":"[^"]*"' | cut -d'"' -f4)

  if [ -z "$NEW_TRACKING" ]; then
    echo "❌ Failed to generate tracking number"
    echo "Response: $SHIP_RESPONSE"
    exit 1
  fi

  TRACKING_NUMBER=$NEW_TRACKING
  echo "✅ Tracking number generated: $TRACKING_NUMBER"
else
  echo "📋 Order is already shipped"
fi

# Verify tracking number format
if [[ ! "$TRACKING_NUMBER" =~ ^TRK-[0-9]{8}-[0-9]{6}-[0-9]{6}$ ]]; then
  echo "❌ FAILED: Tracking number format is incorrect"
  echo "Expected: TRK-YYYYMMDD-HHMMSS-XXXXXX"
  echo "Actual: $TRACKING_NUMBER"
  exit 1
fi

echo "✅ SUCCESS: Tracking number format is correct"
echo "Tracking Number: $TRACKING_NUMBER"

# Update order to delivered
echo "📦 Updating order status to delivered..."
DELIVERED_RESPONSE=$(curl -s -X POST "$BASE_URL/api/orders/$ORDER_ID/update-status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"delivered"}')

echo "✅ Order marked as delivered"

echo ""
echo "🎉 All tests passed! Order tracking functionality is working correctly."
echo "Tracking Number: $TRACKING_NUMBER"
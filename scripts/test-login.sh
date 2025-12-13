#!/bin/bash

echo "Testing user login..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","password":"customer123"}')

echo "Response: $RESPONSE"

# Extract token
TOKEN=$(echo "$RESPONSE" | jq -r '.accessToken')
if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    echo "✓ Login successful, token received"

    # Test protected endpoint with token
    echo "Testing protected endpoint..."
    PROTECTED_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/user/profile)
    echo "Protected endpoint response: $PROTECTED_RESPONSE"
else
    echo "✗ Login failed"
    exit 1
fi
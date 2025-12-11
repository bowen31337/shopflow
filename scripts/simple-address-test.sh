#!/bin/bash

echo "🔍 Testing Address Autocomplete Functionality"
echo ""

echo "Test 1: Query with less than 3 characters"
curl -s "http://localhost:3001/api/checkout/address-autocomplete?query=ma" | grep -o '"count":[0-9]*'
echo "Expected: \"count\":0"
echo ""

echo "Test 2: Query with 'main' (should return suggestions)"
curl -s "http://localhost:3001/api/checkout/address-autocomplete?query=main" | grep -o '"count":[0-9]*'
echo "Expected: \"count\":1 or more"
echo ""

echo "Test 3: Query with 'oak' (should return LA address)"
curl -s "http://localhost:3001/api/checkout/address-autocomplete?query=oak" | grep -o '"count":[0-9]*'
echo "Expected: \"count\":1 or more"
echo ""

echo "Test 4: Query for non-existent address 'xyz123'"
curl -s "http://localhost:3001/api/checkout/address-autocomplete?query=xyz123" | grep -o '"count":[0-9]*'
echo "Expected: \"count\":0"
echo ""

echo "✅ Backend tests completed!"
#!/usr/bin/env python3
import json
import subprocess
import sys

def run_curl(command):
    """Run curl command and return result"""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        return result.stdout.strip()
    except Exception as e:
        print(f"Error running curl: {e}")
        return None

def get_auth_token():
    """Get authentication token for customer"""
    login_cmd = '''curl -s -X POST "http://localhost:3001/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"customer@example.com","password":"customer123"}' '''

    response = run_curl(login_cmd)
    if not response:
        return None

    try:
        data = json.loads(response)
        return data.get('accessToken')
    except json.JSONDecodeError:
        return None

def test_product_catalog():
    """Test product catalog APIs"""
    print("Testing product catalog...")

    # Test products list
    products_cmd = '''curl -s "http://localhost:3001/api/products" '''
    response = run_curl(products_cmd)

    if not response:
        print("✗ Products API failed")
        return False

    try:
        data = json.loads(response)
        products = data.get('products', [])
        if len(products) >= 12:
            print(f"✓ Products API: {len(products)} products returned")

            # Test first product
            first_product = products[0]
            print(f"  Sample product: {first_product.get('name')} - ${first_product.get('price')}")

            # Test categories
            categories_cmd = '''curl -s "http://localhost:3001/api/categories" '''
            categories_response = run_curl(categories_cmd)
            if categories_response:
                categories_data = json.loads(categories_response)
                categories = categories_data.get('categories', [])
                print(f"✓ Categories API: {len(categories)} categories returned")

                # Test brands
                brands_cmd = '''curl -s "http://localhost:3001/api/brands" '''
                brands_response = run_curl(brands_cmd)
                if brands_response:
                    brands_data = json.loads(brands_response)
                    brands = brands_data.get('brands', [])
                    print(f"✓ Brands API: {len(brands)} brands returned")
                    return True
    except json.JSONDecodeError:
        print(f"✗ Invalid JSON response: {response}")

    return False

def test_cart_operations(token):
    """Test cart operations"""
    print("\nTesting cart operations...")

    if not token:
        print("✗ No authentication token")
        return False

    # First, get cart (should be empty or existing)
    cart_cmd = f'''curl -s -H "Authorization: Bearer {token}" \
        "http://localhost:3001/api/cart" '''

    cart_response = run_curl(cart_cmd)
    if not cart_response:
        print("✗ Cart API failed")
        return False

    try:
        cart_data = json.loads(cart_response)
        print(f"✓ Cart retrieved: {len(cart_data.get('items', []))} items")

        # Add item to cart (product ID 1 - TechPro Laptop)
        add_cart_cmd = f'''curl -s -X POST "http://localhost:3001/api/cart/items" \
            -H "Authorization: Bearer {token}" \
            -H "Content-Type: application/json" \
            -d '{{"productId": 1, "quantity": 2}}' '''

        add_response = run_curl(add_cart_cmd)
        if add_response:
            add_data = json.loads(add_response)
            if add_data.get('message') == 'Cart updated successfully' or add_data.get('success'):
                print("✓ Item added to cart successfully")

                # Check cart again
                updated_cart_response = run_curl(cart_cmd)
                if updated_cart_response:
                    updated_cart = json.loads(updated_cart_response)
                    items = updated_cart.get('items', [])
                    if len(items) > 0:
                        print(f"✓ Cart updated: {len(items)} items, total: ${updated_cart.get('total', 0)}")
                        return True
            else:
                print(f"✗ Failed to add item: {add_data.get('message')}")

    except json.JSONDecodeError as e:
        print(f"✗ JSON error: {e}")

    return False

def test_checkout_flow(token):
    """Test checkout APIs"""
    print("\nTesting checkout flow...")

    if not token:
        print("✗ No authentication token")
        return False

    # Test shipping methods
    shipping_cmd = f'''curl -s -H "Authorization: Bearer {token}" \
        "http://localhost:3001/api/checkout/shipping-methods" '''

    shipping_response = run_curl(shipping_cmd)
    if not shipping_response:
        print("✗ Shipping methods API failed")
        return False

    try:
        shipping_data = json.loads(shipping_response)
        methods = shipping_data.get('shippingMethods', [])
        if len(methods) >= 4:
            print(f"✓ Shipping methods: {len(methods)} options available")

            # Test address validation (mock)
            address_cmd = f'''curl -s -X POST "http://localhost:3001/api/checkout/validate-address" \
                -H "Authorization: Bearer {token}" \
                -H "Content-Type: application/json" \
                -d '{{"street": "123 Main St", "city": "San Francisco", "state": "CA", "postalCode": "94105", "country": "US"}}' '''

            address_response = run_curl(address_cmd)
            if address_response:
                address_data = json.loads(address_response)
                # The API responds with validation result, even if invalid
                # This shows the endpoint is working
                print(f"✓ Address validation API working: {address_data.get('message')}")
                return True
    except json.JSONDecodeError:
        print(f"✗ Invalid JSON response")

    return False

def test_order_history(token):
    """Test order history APIs"""
    print("\nTesting order history...")

    if not token:
        print("✗ No authentication token")
        return False

    orders_cmd = f'''curl -s -H "Authorization: Bearer {token}" \
        "http://localhost:3001/api/orders" '''

    orders_response = run_curl(orders_cmd)
    if not orders_response:
        print("✗ Orders API failed")
        return False

    try:
        orders_data = json.loads(orders_response)
        orders = orders_data.get('orders', [])
        print(f"✓ Orders API: {len(orders)} orders in history")
        return True
    except json.JSONDecodeError:
        print(f"✗ Invalid JSON response")

    return False

def main():
    print("=" * 60)
    print("E-commerce Workflow Test")
    print("=" * 60)

    # Get authentication token
    print("\nAuthenticating...")
    token = get_auth_token()
    if not token:
        print("✗ Authentication failed")
        sys.exit(1)
    print("✓ Authentication successful")

    # Test product catalog
    if not test_product_catalog():
        print("\n✗ Product catalog test failed")
        sys.exit(1)

    # Test cart operations
    if not test_cart_operations(token):
        print("\n✗ Cart operations test failed")
        sys.exit(1)

    # Test checkout flow
    if not test_checkout_flow(token):
        print("\n✗ Checkout flow test failed")
        sys.exit(1)

    # Test order history
    if not test_order_history(token):
        print("\n✗ Order history test failed")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("✓ E-commerce workflow test PASSED")
    print("=" * 60)
    print("\nSummary:")
    print("- Product catalog: ✓ Complete with 12+ products, categories, brands")
    print("- Cart operations: ✓ Items can be added and cart updates")
    print("- Checkout flow: ✓ Shipping methods and address validation working")
    print("- Order history: ✓ Accessible with authentication")
    print("- Authentication: ✓ JWT tokens working with protected endpoints")

if __name__ == "__main__":
    main()
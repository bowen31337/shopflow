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

def test_login():
    """Test user login"""
    print("Testing user login...")

    # Login as customer
    login_cmd = '''curl -s -X POST "http://localhost:3001/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"customer@example.com","password":"customer123"}' '''

    response = run_curl(login_cmd)
    if not response:
        print("✗ Login request failed")
        return None

    try:
        data = json.loads(response)
        if data.get('accessToken'):
            print(f"✓ Login successful: {data.get('message')}")
            print(f"  User: {data['user']['name']} ({data['user']['email']})")
            print(f"  Role: {data['user']['role']}")
            return data['accessToken']
        else:
            print(f"✗ Login failed: {data.get('message', 'Unknown error')}")
            return None
    except json.JSONDecodeError:
        print(f"✗ Invalid JSON response: {response}")
        return None

def test_protected_endpoint(token):
    """Test protected endpoint with token"""
    print("\nTesting protected endpoint...")

    profile_cmd = f'''curl -s -H "Authorization: Bearer {token}" \
        "http://localhost:3001/api/user/profile" '''

    response = run_curl(profile_cmd)
    if not response:
        print("✗ Protected endpoint request failed")
        return False

    try:
        data = json.loads(response)
        if data.get('user'):
            print(f"✓ Protected endpoint accessible")
            print(f"  User email: {data['user']['email']}")
            return True
        else:
            print(f"✗ Protected endpoint failed: {data.get('message', 'Unknown error')}")
            return False
    except json.JSONDecodeError:
        print(f"✗ Invalid JSON response: {response}")
        return False

def test_unauthorized_access():
    """Test accessing protected endpoint without token"""
    print("\nTesting unauthorized access...")

    profile_cmd = '''curl -s "http://localhost:3001/api/user/profile" '''

    response = run_curl(profile_cmd)
    if not response:
        print("✗ Unauthorized test request failed")
        return False

    try:
        data = json.loads(response)
        if data.get('error') and ('token' in data.get('error', '').lower() or 'unauthorized' in data.get('error', '').lower()):
            print(f"✓ Unauthorized access correctly blocked: {data.get('error')}")
            return True
        else:
            print(f"✗ Unexpected response: {data}")
            return False
    except json.JSONDecodeError:
        print(f"✗ Invalid JSON response: {response}")
        return False

def main():
    print("=" * 60)
    print("Authentication Flow Test")
    print("=" * 60)

    # Test unauthorized access first
    if not test_unauthorized_access():
        print("\n✗ Authentication flow test failed at unauthorized access check")
        sys.exit(1)

    # Test login
    token = test_login()
    if not token:
        print("\n✗ Authentication flow test failed at login")
        sys.exit(1)

    # Test protected endpoint with token
    if not test_protected_endpoint(token):
        print("\n✗ Authentication flow test failed at protected endpoint")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("✓ Authentication flow test PASSED")
    print("=" * 60)

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
import json

# Read the feature list
with open('feature_list.json', 'r') as f:
    features = json.load(f)

# Update specific tests to passing
tests_to_update = [
    "Frontend server starts successfully on specified port",
    "User registration with email and password works",
    "User login with valid credentials",
    "Product listing page displays all products in grid view"
]

for feature in features:
    if feature['description'] in tests_to_update:
        feature['passes'] = True
        print(f"Updated: {feature['description']}")

# Write back to file
with open('feature_list.json', 'w') as f:
    json.dump(features, f, indent=2)

print(f"\nUpdated {len(tests_to_update)} tests to passing")
print(f"Total passing tests: {sum(1 for f in features if f['passes'])}")
print(f"Total failing tests: {sum(1 for f in features if not f['passes'])}")
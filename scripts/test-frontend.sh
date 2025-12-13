#!/bin/bash
echo "Testing frontend on port 3002..."
if curl -s -f http://localhost:3002 > /dev/null; then
    echo "✅ Frontend is accessible on port 3002"
    exit 0
else
    echo "❌ Frontend is not accessible on port 3002"
    exit 1
fi

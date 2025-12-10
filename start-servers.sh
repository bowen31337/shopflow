#!/bin/bash

echo "Starting ShopFlow servers..."

# Start backend server
echo "Starting backend server..."
cd server
npm run dev &
BACKEND_PID=$!

# Start frontend server
echo "Starting frontend server..."
cd ../client
npm run dev &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

echo "Servers started. Backend on port 3001, Frontend on port 5173"

# Wait for user input to stop servers
read -p "Press Enter to stop servers..."

kill $BACKEND_PID $FRONTEND_PID
echo "Servers stopped."
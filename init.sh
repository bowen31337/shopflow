#!/bin/bash

# ShopFlow E-Commerce Platform - Initialization Script
# This script sets up and runs the development environment

set -e  # Exit on error

echo "================================================"
echo "ShopFlow E-Commerce Platform - Setup"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "${YELLOW}Node.js is not installed. Please install Node.js 16+ from https://nodejs.org${NC}"
    exit 1
fi

echo "${GREEN}✓ Node.js found: $(node --version)${NC}"

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "${YELLOW}npm is not installed. Please install npm${NC}"
    exit 1
fi

echo "${GREEN}✓ npm found: $(npm --version)${NC}"
echo ""

# Create project structure if it doesn't exist
echo "${BLUE}Creating project structure...${NC}"
mkdir -p server/src
mkdir -p server/database
mkdir -p client/src
mkdir -p client/public

# Initialize backend
echo ""
echo "${BLUE}Setting up backend (Express + SQLite)...${NC}"
cd server

if [ ! -f "package.json" ]; then
    echo "Initializing backend package.json..."
    npm init -y

    # Install backend dependencies
    echo "Installing backend dependencies..."
    npm install express cors dotenv bcryptjs jsonwebtoken better-sqlite3 multer express-validator
    npm install --save-dev nodemon

    echo "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo "Backend package.json exists, installing dependencies..."
    npm install
    echo "${GREEN}✓ Backend dependencies installed${NC}"
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
PORT=3001
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=$(openssl rand -base64 32)
REFRESH_TOKEN_EXPIRES_IN=7d
STRIPE_TEST_KEY=sk_test_your_stripe_test_key_here
NODE_ENV=development
EOF
    echo "${GREEN}✓ .env file created${NC}"
fi

cd ..

# Initialize frontend
echo ""
echo "${BLUE}Setting up frontend (React + Vite)...${NC}"

if [ ! -d "client" ] || [ ! -f "client/package.json" ]; then
    echo "Creating React + Vite frontend..."
    npm create vite@latest client -- --template react
    cd client

    # Install frontend dependencies
    echo "Installing frontend dependencies..."
    npm install
    npm install react-router-dom zustand react-hook-form

    echo "${GREEN}✓ Frontend dependencies installed${NC}"
else
    cd client
    if [ ! -d "node_modules" ]; then
        echo "Installing frontend dependencies..."
        npm install
        echo "${GREEN}✓ Frontend dependencies installed${NC}"
    else
        echo "${GREEN}✓ Frontend dependencies already installed${NC}"
    fi
fi

cd ..

# Create database directory
mkdir -p server/database

echo ""
echo "${GREEN}================================================${NC}"
echo "${GREEN}Setup complete!${NC}"
echo "${GREEN}================================================${NC}"
echo ""
echo "To start the development servers:"
echo ""
echo "  ${BLUE}1. Start the backend:${NC}"
echo "     cd server && npm run dev"
echo ""
echo "  ${BLUE}2. Start the frontend (in a new terminal):${NC}"
echo "     cd client && npm run dev"
echo ""
echo "  ${BLUE}Backend API:${NC} http://localhost:3001"
echo "  ${BLUE}Frontend:${NC} http://localhost:5173"
echo ""
echo "${YELLOW}Note: Make sure to update STRIPE_TEST_KEY in server/.env with your actual Stripe test key${NC}"
echo ""

#!/bin/bash
# Quick Start Script for Rota Management System - Mac/Linux

echo ""
echo "========================================"
echo "Rota Management System - Quick Start"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if MySQL is running
echo "Checking MySQL connection..."
mysql -u root -e "SELECT 1" &> /dev/null
if [ $? -ne 0 ]; then
    echo "Warning: MySQL might not be running"
    echo "Please ensure MySQL Server is running"
    echo ""
fi

# Setup database
echo ""
echo "Step 1: Setting up database..."
cd server
mysql -u root < setup.sql &> /dev/null
if [ $? -eq 0 ]; then
    echo "Database setup complete!"
else
    echo "Warning: Database setup may have failed. Make sure MySQL is running."
fi

# Install backend dependencies
echo ""
echo "Step 2: Installing backend dependencies..."
npm install > /dev/null 2>&1
cd ..

# Install frontend dependencies
echo ""
echo "Step 3: Installing frontend dependencies..."
npm install > /dev/null 2>&1

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "To start the application:"
echo ""
echo "Terminal 1 - Start the backend server:"
echo "  cd server"
echo "  npm run dev"
echo ""
echo "Terminal 2 - Start the frontend (in a new terminal):"
echo "  npm start"
echo ""
echo "The frontend will open at http://localhost:3000"
echo "The backend runs at http://localhost:5000"
echo ""
echo "Test Credentials:"
echo "  Admin: admin / admin123"
echo "  User: user / user123"
echo ""

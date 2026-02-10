#!/bin/bash
# Database Test Script for Mac/Linux
# This script tests the MySQL database connection and verifies setup

echo ""
echo "========================================"
echo "MySQL Database Test Script"
echo "========================================"
echo ""

# Test MySQL connection
echo "Testing MySQL connection..."
mysql -u root -e "SELECT 1" &> /dev/null
if [ $? -ne 0 ]; then
    echo "ERROR: Cannot connect to MySQL"
    echo "Please ensure:"
    echo "  1. MySQL Server is installed and running"
    echo "  2. Username is 'root' (default)"
    echo "  3. No password is set (or update the script)"
    echo ""
    echo "To start MySQL:"
    echo "  - Mac: brew services start mysql"
    echo "  - Linux: sudo systemctl start mysql"
    echo ""
    exit 1
fi
echo "[OK] MySQL connection successful"

# Test database exists
echo ""
echo "Testing if 'rota_management' database exists..."
mysql -u root -e "USE rota_management; SELECT 1;" &> /dev/null
if [ $? -ne 0 ]; then
    echo "[WARN] Database does not exist. Running setup..."
    mysql -u root < setup.sql
    if [ $? -eq 0 ]; then
        echo "[OK] Database setup completed"
    else
        echo "[ERROR] Database setup failed"
        exit 1
    fi
else
    echo "[OK] Database exists"
fi

# Check tables
echo ""
echo "Testing tables..."
mysql -u root rota_management -e "SHOW TABLES;" &> /dev/null
if [ $? -ne 0 ]; then
    echo "[ERROR] Cannot access tables"
    exit 1
fi
echo "[OK] Tables exist"

# Count records
echo ""
echo "Database Statistics:"
echo "====================="

users=$(mysql -u root rota_management -N -e "SELECT COUNT(*) FROM users;" 2>/dev/null)
echo "Users: $users"

schedules=$(mysql -u root rota_management -N -e "SELECT COUNT(*) FROM schedules;" 2>/dev/null)
echo "Schedules: $schedules"

timeoff=$(mysql -u root rota_management -N -e "SELECT COUNT(*) FROM time_off_requests;" 2>/dev/null)
echo "Time Off Requests: $timeoff"

echo ""
echo "========================================"
echo "Database Test Complete!"
echo "========================================"
echo ""
echo "All systems operational. You can now:"
echo "  1. Start the backend: npm run dev (in server folder)"
echo "  2. Start the frontend: npm start (in root folder)"
echo ""

@echo off
REM Quick Start Script for Rota Management System - Windows

echo.
echo ========================================
echo Rota Management System - Quick Start
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if MySQL is running
echo Checking MySQL connection...
mysql -u root -e "SELECT 1" >nul 2>&1
if %errorlevel% neq 0 (
    echo Warning: MySQL might not be running or connection failed
    echo Please ensure MySQL Server is running
    echo.
)

REM Setup database
echo.
echo Step 1: Setting up database...
cd server
mysql -u root < setup.sql >nul 2>&1
if %errorlevel% equ 0 (
    echo Database setup complete!
) else (
    echo Warning: Database setup may have failed. Make sure MySQL is running.
)

REM Install backend dependencies
echo.
echo Step 2: Installing backend dependencies...
call npm install >nul 2>&1
cd ..

REM Install frontend dependencies
echo.
echo Step 3: Installing frontend dependencies...
call npm install >nul 2>&1

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the application:
echo.
echo Terminal 1 - Start the backend server:
echo   cd server
echo   npm run dev
echo.
echo Terminal 2 - Start the frontend (in a new terminal):
echo   npm start
echo.
echo The frontend will open at http://localhost:3000
echo The backend runs at http://localhost:5000
echo.
echo Test Credentials:
echo   Admin: admin / admin123
echo   User: user / user123
echo.
echo Press any key to exit...
pause

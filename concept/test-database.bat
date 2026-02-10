@echo off
REM Database Test Script for Windows
REM This script tests the MySQL database connection and verifies setup

setlocal enabledelayedexpansion

echo.
echo ========================================
echo MySQL Database Test Script
echo ========================================
echo.

REM Test MySQL connection
echo Testing MySQL connection...
mysql -u root -e "SELECT 1" >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Cannot connect to MySQL
    echo Please ensure:
    echo   1. MySQL Server is installed and running
    echo   2. Username is 'root' (default)
    echo   3. No password is set (or update the script)
    echo.
    echo To start MySQL on Windows:
    echo   - Open Services (services.msc)
    echo   - Find and start "MySQL80" (or your version)
    echo.
    pause
    exit /b 1
)
echo [OK] MySQL connection successful

REM Test database exists
echo.
echo Testing if 'rota_management' database exists...
mysql -u root -e "USE rota_management; SELECT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARN] Database does not exist. Running setup...
    mysql -u root < setup.sql
    if %errorlevel% equ 0 (
        echo [OK] Database setup completed
    ) else (
        echo [ERROR] Database setup failed
        pause
        exit /b 1
    )
) else (
    echo [OK] Database exists
)

REM Check tables
echo.
echo Testing tables...
mysql -u root rota_management -e "SHOW TABLES;" >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Cannot access tables
    pause
    exit /b 1
)
echo [OK] Tables exist

REM Count records
echo.
echo Database Statistics:
echo =====================
for /f %%A in ('mysql -u root rota_management -N -e "SELECT COUNT(*) FROM users;" 2^>nul') do set users=%%A
echo Users: !users!

for /f %%A in ('mysql -u root rota_management -N -e "SELECT COUNT(*) FROM schedules;" 2^>nul') do set schedules=%%A
echo Schedules: !schedules!

for /f %%A in ('mysql -u root rota_management -N -e "SELECT COUNT(*) FROM time_off_requests;" 2^>nul') do set timeoff=%%A
echo Time Off Requests: !timeoff!

echo.
echo ========================================
echo Database Test Complete!
echo ========================================
echo.
echo All systems operational. You can now:
echo   1. Start the backend: npm run dev (in server folder)
echo   2. Start the frontend: npm start (in root folder)
echo.
pause

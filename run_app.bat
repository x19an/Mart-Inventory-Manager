
@echo off
TITLE Mart Inventory Management System Launcher

echo ---------------------------------------------------
echo  MART INVENTORY MANAGEMENT SYSTEM
echo ---------------------------------------------------
echo.
echo [1/3] Starting SQL Backend Server...
start cmd /k "node server.js"

echo [2/3] Starting Frontend Dashboard...
start cmd /k "npm run dev"

echo [3/3] Waiting for systems to initialize...
timeout /t 5 /nobreak > nul

echo.
echo Launching application at http://localhost:3000 ...
:: Updated to match user's actual port
start http://localhost:3000

echo.
echo ---------------------------------------------------
echo  SYSTEM LAUNCHED SUCCESSFULLY
echo.
echo  - Close the two command windows to stop the app.
echo ---------------------------------------------------
echo.
pause

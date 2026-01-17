@echo off
TITLE Mart Inventory Management System Launcher

echo ---------------------------------------------------
echo  MART INVENTORY MANAGEMENT SYSTEM
echo ---------------------------------------------------
echo.
echo [1/2] Starting development server in a new window...
:: Starts npm run dev in a new command window so you can see the logs
start cmd /k "npm run dev"

echo [2/2] Waiting for server to initialize (5 seconds)...
:: Gives the dev server (Vite/Parcel/etc) time to spin up
timeout /t 5 /nobreak > nul

echo.
echo Launching application at http://localhost:3000 ...
:: Opens the URL in the default system browser (Google Chrome, Edge, etc.)
start http://localhost:3000

echo.
echo ---------------------------------------------------
echo  SYSTEM LAUNCHED SUCCESSFULLY
echo.
echo  - Keep the other command window open while working.
echo  - You can close THIS window now.
echo ---------------------------------------------------
echo.
pause
@echo off
echo 🚀 Starting TheLineCricket Frontend Server...
echo ================================================

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

echo 🌐 Starting development server...
echo 📡 Frontend will be available at: http://localhost:3000
echo 🔗 Backend API: http://localhost:5000
echo.
echo ================================================
echo ✅ Frontend server starting...
echo    Press Ctrl+C to stop the server
echo ================================================

REM Start the development server
npm run dev

pause






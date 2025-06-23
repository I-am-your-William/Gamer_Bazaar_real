@echo off
echo ==========================================
echo  First Time Setup - Gaming E-Commerce
echo ==========================================
echo.

echo Step 1: Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    echo Make sure Node.js is installed from nodejs.org
    pause
    exit /b 1
)

echo.
echo Step 2: Creating environment file...
if not exist .env (
    copy .env.example .env
    echo ✅ Created .env file
    echo ⚠️  IMPORTANT: Edit .env file with your PostgreSQL password
    echo    DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/gamer_bazaar
) else (
    echo ✅ .env file already exists
)

echo.
echo Step 3: Creating uploads folder...
if not exist uploads (
    mkdir uploads
    echo ✅ Created uploads folder
) else (
    echo ✅ uploads folder already exists
)

echo.
echo ==========================================
echo  Setup Complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Edit .env file with your PostgreSQL password
echo 2. Create database: CREATE DATABASE gamer_bazaar;
echo 3. Run: npm run db:push
echo 4. Start server: start-local.bat
echo.
echo Press any key to close...
pause > nul
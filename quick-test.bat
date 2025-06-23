@echo off
echo Testing your local setup...
echo.

echo 1. Checking Node.js...
node --version || echo "❌ Node.js not installed"

echo 2. Checking npm...
npm --version || echo "❌ npm not installed"

echo 3. Checking if .env exists...
if exist .env (
    echo "✅ .env file found"
) else (
    echo "❌ .env file missing - copy from .env.example"
)

echo 4. Checking if uploads folder exists...
if exist uploads (
    echo "✅ uploads folder found"
) else (
    echo "❌ uploads folder missing - run: mkdir uploads"
)

echo 5. Checking if node_modules exists...
if exist node_modules (
    echo "✅ Dependencies installed"
) else (
    echo "❌ Dependencies missing - run: npm install"
)

echo.
echo Setup complete? Run: start-local.bat
pause
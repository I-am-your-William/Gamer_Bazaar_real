@echo off
echo ==========================================
echo  Gaming Equipment E-Commerce Application
echo ==========================================
echo.
echo Starting local PostgreSQL server...
echo Make sure your .env file has the correct database password
echo.
echo Server will start at: http://localhost:5000
echo If port 5000 is busy, edit .env file to change PORT=3000
echo Admin login: username=admin, password=1234
echo.
npx tsx server/index.ts
pause
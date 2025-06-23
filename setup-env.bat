@echo off
echo Creating .env file...
copy .env.example .env
echo.
echo Please edit the .env file and update:
echo 1. Replace YOUR_PASSWORD with your PostgreSQL password
echo 2. Save the file
echo 3. Run: npx tsx server/index.ts
echo.
pause
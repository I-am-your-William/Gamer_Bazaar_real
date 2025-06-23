@echo off
echo Fixing database configuration for local PostgreSQL...
node fix-database.js
echo.
echo Starting server with local PostgreSQL support...
npx tsx server/index.ts
pause
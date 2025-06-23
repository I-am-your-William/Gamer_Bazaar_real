@echo off
echo Testing environment variables...
node test-env.js
echo.
echo Starting server...
npx tsx server/index.ts
pause
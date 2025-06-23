@echo off
echo Testing database connection...
echo DATABASE_URL should contain: postgresql://postgres:123Abclol@localhost:5432/gamer_bazaar
echo.
echo Starting server...
npx tsx server/index.ts
pause
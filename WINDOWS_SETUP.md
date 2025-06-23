# Windows Setup - Quick Fix

## The Error You're Seeing
```
'NODE_ENV' is not recognized as an internal or external command
```

This happens because Windows Command Prompt doesn't recognize Unix-style environment variable syntax.

## Solution

### Option 1: Use Windows-specific script
```bash
npm run dev:win
```

### Option 2: Install cross-env (already done)
```bash
npm run dev
```

## If You Still Get Errors

### Alternative: Manual Environment Setup
Create a `.env` file in your project root with:
```env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/gamer_bazaar
SESSION_SECRET=your-secret-key-here
PORT=5000
```

Then run:
```bash
tsx server/index.ts
```

## Complete Windows Setup Steps

1. **Install Node.js** (https://nodejs.org/)
2. **Install PostgreSQL** (https://postgresql.org/download/windows/)
3. **Install dependencies**: `npm install`
4. **Create .env file** (copy from .env.example and update password)
5. **Create database**: `createdb gamer_bazaar`
6. **Run migrations**: `npm run db:push`
7. **Create uploads folder**: `mkdir uploads`
8. **Start server**: `npm run dev:win`

## Login Credentials
- Admin: username `admin`, password `1234`
- Visit: http://localhost:5000/auth

The system includes:
- Local authentication (no external dependencies)
- File uploads to local directory
- Complete inventory management with serial numbers
- PostgreSQL database integration
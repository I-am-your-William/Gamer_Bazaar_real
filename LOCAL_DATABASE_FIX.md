# Local Database Connection Fix

## The WebSocket Error Issue
Your error shows the system is trying to connect to Neon's WebSocket service (`wss://localhost/v2`) instead of your local PostgreSQL database.

## Quick Fix

### Option 1: Use the fixed database file
Replace your database import in any files that import from `./db` with:
```typescript
// Change from:
import { db, pool } from "./db";

// To:
import { db, pool } from "./db-local";
```

### Option 2: Update your DATABASE_URL format
Make sure your `.env` file uses the correct local PostgreSQL format:
```env
DATABASE_URL=postgresql://postgres:123Abclol@localhost:5432/gamer_bazaar
```

### Option 3: Test database connection
Run this to test your database connection:
```cmd
npx tsx -e "import('./server/db-local.js').then(({pool}) => pool.query('SELECT NOW()').then(r => console.log('✅ Database connected:', r.rows[0])))"
```

## What Was Wrong
The original database configuration was set up for Neon's serverless PostgreSQL which uses WebSockets. Your local PostgreSQL doesn't need WebSockets - it uses direct TCP connections.

## After Fixing
Your registration should work without the WebSocket connection errors. The system will use the standard PostgreSQL node driver instead of the Neon serverless driver.
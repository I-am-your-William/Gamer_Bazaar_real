# Windows Run Instructions

## Error: Missing script "dev:win"
The package.json in your local copy doesn't have the Windows script. Here are your options:

## Option 1: Use the batch file (Easiest)
I've created `start-windows.bat`. Just double-click it or run:
```cmd
start-windows.bat
```

## Option 2: Run directly with environment variable
```cmd
set NODE_ENV=development && tsx server/index.ts
```

## Option 3: Use PowerShell
```powershell
$env:NODE_ENV="development"; tsx server/index.ts
```

## Option 4: Create .env file and run without NODE_ENV
1. Create `.env` file:
```env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/gamer_bazaar
SESSION_SECRET=your-secret-key-here
PORT=5000
```

2. Run:
```cmd
tsx server/index.ts
```

## Complete Setup Checklist
- [ ] Node.js installed
- [ ] PostgreSQL installed and running
- [ ] Database `gamer_bazaar` created
- [ ] `.env` file created with your PostgreSQL password
- [ ] `npm install` completed
- [ ] `npm run db:push` completed (creates tables)
- [ ] `uploads` folder created
- [ ] Server started with one of the options above

## Login Information
- Admin: username `admin`, password `1234`
- URL: http://localhost:5000/auth
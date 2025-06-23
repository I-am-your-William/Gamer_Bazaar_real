# Complete Windows Setup Guide - Gaming Equipment E-Commerce

## Prerequisites Installation

### 1. Install Node.js
1. Go to https://nodejs.org/
2. Download **LTS version** (recommended for most users)
3. Run the installer with default settings
4. Verify installation:
   ```cmd
   node --version
   npm --version
   ```

### 2. Install PostgreSQL
1. Go to https://www.postgresql.org/download/windows/
2. Download PostgreSQL installer
3. During installation:
   - Set password for `postgres` user (remember this!)
   - Keep default port 5432
   - Install pgAdmin if offered
4. Verify installation by opening pgAdmin or command line

### 3. Install Visual Studio Code (Optional but Recommended)
1. Download from https://code.visualstudio.com/
2. Install with default settings

## Project Setup

### Step 1: Copy Project Files
1. Copy the entire project folder to your computer
2. Open the folder in VS Code or Windows Explorer

### Step 2: Install Dependencies
1. Open Command Prompt or PowerShell in the project folder
2. Run:
   ```cmd
   npm install
   ```
   This will create `node_modules` folder and install all dependencies.

### Step 3: Create Environment File
1. Copy `.env.example` to `.env`:
   ```cmd
   copy .env.example .env
   ```
2. Open `.env` in any text editor (Notepad, VS Code)
3. Update with your PostgreSQL password:
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/gamer_bazaar
   SESSION_SECRET=your-secret-key-here
   NODE_ENV=development
   PORT=5000
   ```

### Step 4: Create Database
1. Open PostgreSQL command line (SQL Shell) or pgAdmin
2. Create the database:
   ```sql
   CREATE DATABASE gamer_bazaar;
   ```

### Step 5: Setup Database Tables
Run the migration to create all tables:
```cmd
npm run db:push
```

### Step 6: Create Upload Directory
```cmd
mkdir uploads
```

### Step 7: Start the Application
```cmd
start-local.bat
```

Or manually:
```cmd
npx tsx server/index.ts
```

## Access Your Application

### URLs
- **Main Site**: http://localhost:5000
- **Admin Login**: http://localhost:5000/auth (username: `admin`, password: `1234`)
- **User Registration**: http://localhost:5000/auth

### Login Credentials
- **Admin**: username `admin`, password `1234`
- **Users**: Register new accounts at the auth page

## Key Features

### Inventory Management
- Admin can add inventory units with serial numbers
- Each unit requires a security code image upload
- Stock increases only by adding documented units

### File Uploads
- Security code images stored in `uploads/` folder
- Accessible via http://localhost:5000/uploads/filename

### Authentication
- Local username/password system
- Session-based authentication
- No external dependencies

## Troubleshooting

### Database Connection Issues
1. Check PostgreSQL is running
2. Verify password in `.env` file
3. Ensure database `gamer_bazaar` exists

### Port 5000 Already in Use
Edit `.env` file:
```env
PORT=3000
```

### Module Not Found Errors
```cmd
npm install
```

### Database Schema Issues
```cmd
npm run db:push
```

## File Structure
```
project/
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types
├── uploads/         # File uploads
├── .env            # Your config
├── package.json    # Dependencies
└── start-local.bat # Startup script
```

## Development Workflow
1. Make changes to code
2. Server automatically restarts
3. Frontend hot-reloads in browser
4. View logs in terminal

Your gaming equipment e-commerce application is now ready for local development!
# Setup Guide - From ZIP Download

## Step 1: Download Prerequisites

### Install Node.js
1. Go to https://nodejs.org/
2. Download **LTS version** (18+)
3. Run installer, keep all default settings
4. Restart your computer after installation

### Install PostgreSQL
1. Go to https://postgresql.org/download/windows/
2. Download PostgreSQL installer
3. During installation:
   - Set password for `postgres` user (write it down!)
   - Keep default port 5432
   - Install Stack Builder components if asked
4. Note: pgAdmin will be installed automatically

## Step 2: Download and Extract Project

### Download ZIP
1. Download the project as ZIP file
2. Extract to a folder like `C:\GameEcommerce\GamerBazaar`
3. Make sure the extracted folder contains:
   - `client` folder
   - `server` folder
   - `shared` folder
   - `package.json` file
   - `.env.example` file

## Step 3: Setup Project

### Open Command Prompt in Project Folder
**Method 1:**
1. Open the extracted folder in Windows Explorer
2. Click in the address bar and type `cmd`
3. Press Enter

**Method 2:**
1. Press Windows + R
2. Type `cmd` and press Enter
3. Navigate to your folder:
   ```cmd
   cd C:\GameEcommerce\GamerBazaar
   ```

### Install Dependencies
```cmd
npm install
```
*This will take 2-3 minutes and create a `node_modules` folder*

## Step 4: Configure Environment

### Create .env File
```cmd
copy .env.example .env
```

### Edit .env File
1. Open `.env` with Notepad (right-click → Open with → Notepad)
2. Replace `YOUR_PASSWORD` with your PostgreSQL password:
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD@localhost:5432/gamer_bazaar
   SESSION_SECRET=your-secret-key-here
   NODE_ENV=development
   PORT=5000
   ```
3. Save and close

## Step 5: Setup Database

### Create Database
1. Open pgAdmin (search in Start menu)
2. Connect with your postgres password
3. Right-click "Databases" → Create → Database
4. Name: `gamer_bazaar`
5. Click Save

**Or use command line:**
1. Open Command Prompt as Administrator
2. Run:
   ```cmd
   createdb -U postgres gamer_bazaar
   ```

### Create Database Tables
Back in your project folder:
```cmd
npm run db:push
```

## Step 6: Create Upload Folder
```cmd
mkdir uploads
```

## Step 7: Test Setup
Run the test script:
```cmd
quick-test.bat
```

You should see all green checkmarks (✅).

## Step 8: Start Application
```cmd
start-local.bat
```

## Step 9: Access Your Application

### Open Browser
Go to: http://localhost:5000

### Login Credentials
- **Admin Access**: username `admin`, password `1234`
- **New Users**: Click register to create accounts

## Features You'll Have

### Admin Panel
- Inventory management requiring serial numbers
- Product uploads with security code images
- Order management and tracking
- QR code generation for verification

### E-commerce Features
- Product catalog and search
- Shopping cart and checkout
- User registration and authentication
- Product verification system

### File Storage
- Security code images saved to `uploads` folder
- Local file storage (no cloud dependencies)

## Troubleshooting

### "Node not recognized"
Restart Command Prompt after installing Node.js

### Database connection failed
1. Check PostgreSQL is running (look for elephant icon in system tray)
2. Verify password in `.env` file
3. Ensure database `gamer_bazaar` exists

### Port 5000 in use
Change PORT in `.env` file to 3000 or 8000

### Module errors
Delete `node_modules` folder and run `npm install` again

## Success Indicators
- Terminal shows "serving on port 5000"
- Browser opens to gaming equipment website
- Admin login works with admin/1234
- No error messages in terminal

Your gaming equipment e-commerce application is now running locally with full inventory management, user authentication, and file upload capabilities!
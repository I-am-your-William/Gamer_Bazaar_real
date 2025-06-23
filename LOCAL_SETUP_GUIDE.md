# Local Windows Development Setup Guide

## Prerequisites

### 1. Install Node.js
- Download Node.js (version 18 or higher) from https://nodejs.org/
- Choose the LTS version
- Install with default settings

### 2. Install PostgreSQL
- Download PostgreSQL from https://www.postgresql.org/download/windows/
- Install with default settings
- Remember your password for the `postgres` user
- Default port is 5432

### 3. Install Git (Optional but recommended)
- Download from https://git-scm.com/download/win
- Install with default settings

### 4. Install Visual Studio Code
- Download from https://code.visualstudio.com/
- Install recommended extensions:
  - TypeScript and JavaScript Language Features
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense

## Project Setup

### Step 1: Copy Project Files
1. Download/copy the entire project folder to your local machine
2. Open the folder in Visual Studio Code

### Step 2: Install Dependencies
Open terminal in VS Code (Ctrl + ` or Terminal → New Terminal) and run:
```bash
npm install
```

### Step 3: Database Setup

#### Create Database
1. Open PostgreSQL command line (psql) or pgAdmin
2. Create a new database:
```sql
CREATE DATABASE gamer_bazaar;
```

#### Create Environment File
1. Copy `.env.example` to `.env`
2. Update the database connection:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/gamer_bazaar
SESSION_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

Replace `YOUR_PASSWORD` with your PostgreSQL password.

### Step 4: Initialize Database
Run the database migration:
```bash
npm run db:push
```

This will create all the necessary tables.

### Step 5: Create Upload Directory
Create a folder for file uploads:
```bash
mkdir uploads
```
Or create it manually in your project folder.

### Step 6: Start Development Server
```bash
npm run dev
```

The application will start on http://localhost:5000

## Authentication System

### Admin Access
- Username: `admin`
- Password: `1234`
- Access admin panel at: http://localhost:5000/admin-login

### User Registration
- Users can register at: http://localhost:5000/auth
- Registration creates regular user accounts

## Key Features

### Inventory Management
- Stock can only be increased by adding individual units
- Each unit requires:
  - Serial number
  - Security code image upload
  - Product association

### File Uploads
- Security code images are stored in `/uploads` folder
- Supported formats: JPG, PNG, GIF
- Files are accessible via `/uploads/filename` URL

### Database Structure
- `users` - User accounts with roles
- `products` - Product catalog
- `inventory_units` - Individual product units with serial numbers
- `orders` - Customer orders
- `qr_codes` - Product verification codes
- `categories` - Product categories

## Development Workflow

### Making Changes
1. Edit files in VS Code
2. The server automatically restarts on changes
3. Frontend hot-reloads in the browser

### Adding Products (Admin)
1. Login as admin
2. Go to Admin → Add Inventory
3. Upload security code image
4. Enter serial number
5. Select product and quantity

### Database Management
- Use pgAdmin or psql to view/modify data
- Run `npm run db:push` after schema changes
- Database URL is in your `.env` file

## Troubleshooting

### Port Already in Use
If port 5000 is busy, modify `server/index.ts`:
```typescript
const PORT = process.env.PORT || 3000; // Change to 3000 or another port
```

### Database Connection Issues
1. Check PostgreSQL is running
2. Verify credentials in `.env`
3. Ensure database exists
4. Check firewall settings

### File Upload Issues
1. Ensure `uploads` folder exists
2. Check folder permissions
3. Verify disk space

### Node.js Issues
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear npm cache: `npm cache clean --force`

## Production Deployment

### Environment Variables
Set these for production:
- `NODE_ENV=production`
- `DATABASE_URL=your-production-db-url`
- `SESSION_SECRET=secure-random-string`

### Security
- Change default admin password
- Use HTTPS in production
- Secure your database
- Regular backups

## File Structure
```
project/
├── client/          # Frontend React code
├── server/          # Backend Express code
├── shared/          # Shared types and schemas
├── uploads/         # File upload storage
├── package.json     # Dependencies
├── .env            # Environment variables
└── README.md       # Project documentation
```

## Support
- Check the console for error messages
- Verify all prerequisites are installed
- Ensure database is running and accessible
- Check file permissions for uploads folder
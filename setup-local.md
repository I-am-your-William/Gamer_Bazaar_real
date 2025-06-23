# Local Development Setup Guide

This guide will help you set up the gaming e-commerce project on your local Windows machine.

## Prerequisites

1. **Node.js** (v18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version` and `npm --version`

2. **PostgreSQL** (v13 or higher)
   - Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - Remember your postgres password during installation

3. **Git**
   - Download from [git-scm.com](https://git-scm.com/download/win)

4. **Visual Studio Code**
   - Download from [code.visualstudio.com](https://code.visualstudio.com/)

## Installation Steps

### 1. Create Project Directory
```cmd
mkdir gaming-ecommerce
cd gaming-ecommerce
```

### 2. Copy Project Files
Copy all files from the Replit project to your local directory, maintaining the folder structure:
- `client/` folder
- `server/` folder
- `shared/` folder
- All configuration files (package.json, tsconfig.json, etc.)

### 3. Install Dependencies
```cmd
npm install
```

### 4. Database Setup
```cmd
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE gaming_ecommerce;

# Exit PostgreSQL
\q
```

### 5. Environment Configuration
1. Copy `.env.example` to `.env`
2. Update the DATABASE_URL with your PostgreSQL credentials:
   ```
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/gaming_ecommerce
   ```
3. Generate a secure session secret and update SESSION_SECRET

### 6. Database Migration
```cmd
npm run db:push
```

### 7. Start Development Server
```cmd
npm run dev
```

## Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## Default Admin Access

- **Username**: admin
- **Password**: 1234

## Key Features Modified for Local Development

### Authentication
- Replaced Replit Auth with local username/password authentication
- Admin login: username `admin`, password `1234`
- User registration system available

### File Uploads
- Security code images are now stored locally in `uploads/security-codes/`
- Supports JPEG, PNG, GIF, WebP formats
- 5MB file size limit
- Files accessible at `/uploads/security-codes/filename`

### Database Schema Updates
- Added `username`, `password`, and `role` fields to users table
- Supports both admin and regular user accounts

## VS Code Extensions (Recommended)

1. **TypeScript and JavaScript Language Features** (built-in)
2. **Tailwind CSS IntelliSense**
3. **PostgreSQL** - for database management
4. **Thunder Client** - for API testing
5. **ES7+ React/Redux/React-Native snippets**

## Development Workflow

### Adding Inventory Units
1. Login as admin (admin/1234)
2. Navigate to Admin → Add Inventory
3. Select product, enter serial number
4. Optionally upload security code image
5. Stock count increases automatically

### Testing the System
1. Create regular user accounts through registration
2. Browse products and add to cart
3. Admin can manage inventory through individual units
4. Each unit requires serial number documentation

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL service is running
- Check DATABASE_URL in .env file
- Verify database exists: `psql -U postgres -l`

### File Upload Issues
- Check if `uploads/security-codes/` directory exists
- Verify file permissions
- Ensure file size is under 5MB

### Authentication Issues
- Clear browser cookies/localStorage
- Check session secret in .env
- Restart the development server

## Production Deployment Notes

When deploying to production:
1. Set `NODE_ENV=production` in .env
2. Use a secure session secret
3. Configure proper file storage (AWS S3, Cloudinary)
4. Set up HTTPS for secure cookies
5. Use environment variables for sensitive data

This setup provides a fully functional local development environment that mirrors the Replit project functionality while being optimized for local development on Windows.
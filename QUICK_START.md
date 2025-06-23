# Quick Start Guide

## 5-Minute Setup

### 1. Install Prerequisites
- **Node.js**: Download from https://nodejs.org/ (version 18+)
- **PostgreSQL**: Download from https://postgresql.org/download/windows/

### 2. Setup Project
```bash
# Install dependencies
npm install

# Create environment file
copy .env.example .env
```

### 3. Configure Database
Edit `.env` file:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/gamer_bazaar
SESSION_SECRET=your-secret-key-here
```

### 4. Initialize Database
```bash
# Create database in PostgreSQL
createdb gamer_bazaar

# Run migrations
npm run db:push
```

### 5. Start Application
**For Windows:**
```bash
npm run dev:win
```

**For Mac/Linux:**
```bash
npm run dev
```

Visit: http://localhost:5000

## Default Login
- **Admin**: username `admin`, password `1234`
- **Registration**: Available at `/auth` page

## Key Features
- ✅ Local authentication (no external dependencies)
- ✅ File uploads to local directory
- ✅ Admin panel with inventory management
- ✅ Unit-based inventory system with serial numbers
- ✅ PostgreSQL database with full schema
- ✅ Complete e-commerce functionality

The system is ready for local Windows development!
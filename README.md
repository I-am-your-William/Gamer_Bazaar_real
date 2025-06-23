# Gaming Equipment E-Commerce Application

A complete e-commerce platform for gaming equipment with advanced inventory management and product verification.

## Quick Start (Windows)

1. **Install Prerequisites**
   - Node.js 18+ from https://nodejs.org/
   - PostgreSQL from https://postgresql.org/download/windows/

2. **Setup Project**
   ```cmd
   npm install
   copy .env.example .env
   ```

3. **Configure Database**
   Edit `.env` file with your PostgreSQL password:
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/gamer_bazaar
   ```

4. **Initialize Database**
   ```cmd
   createdb gamer_bazaar
   npm run db:push
   mkdir uploads
   ```

5. **Start Application**
   ```cmd
   start-local.bat
   ```

Visit http://localhost:5000

## Login Credentials
- **Admin**: username `admin`, password `1234`
- **Users**: Register at `/auth` page

## Key Features
- Local username/password authentication
- Inventory management with serial numbers and security codes
- File uploads for product verification
- Complete e-commerce functionality
- PostgreSQL database integration

## Documentation
- See `LOCAL_SETUP_GUIDE.md` for detailed setup
- See `ESSENTIAL_FILES.md` for file organization
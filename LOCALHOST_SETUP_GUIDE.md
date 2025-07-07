# Gamer Bazaar - Localhost Setup Guide

This guide will help you run the gaming e-commerce platform on your local machine with all your existing products and data.

## Prerequisites

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **PostgreSQL 14+** - [Download here](https://www.postgresql.org/download/)
3. **Git** - [Download here](https://git-scm.com/)

## Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd gamer-bazaar

# Install dependencies
npm install
```

## Step 2: Database Setup

### Create Local Database
```bash
# Connect to PostgreSQL (adjust for your setup)
psql -U postgres

# Create database
CREATE DATABASE gamer_bazaar;

# Create user (optional)
CREATE USER gamer_admin WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE gamer_bazaar TO gamer_admin;

# Exit psql
\q
```

### Configure Environment
```bash
# Copy environment template
cp .env.example .env
```

Edit `.env` file:
```env
# Database Connection
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/gamer_bazaar

# Session Security
SESSION_SECRET=your-super-secret-key-here

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Stripe (optional for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_key
```

## Step 3: Database Schema Setup

```bash
# Push database schema
npm run db:push
```

This creates all necessary tables: users, products, categories, orders, cart_items, qr_codes, inventory_units, sessions.

## Step 4: Transfer Your Product Data

### Option A: Export from Current Database
If you have access to your current database:

```sql
-- Export products
COPY (SELECT * FROM products) TO '/path/to/products.csv' WITH CSV HEADER;

-- Export categories  
COPY (SELECT * FROM categories) TO '/path/to/categories.csv' WITH CSV HEADER;

-- Export inventory units
COPY (SELECT * FROM inventory_units) TO '/path/to/inventory.csv' WITH CSV HEADER;
```

### Option B: Manual Data Entry via Admin Panel
1. Start the application (see Step 5)
2. Go to `/auth` and create admin account
3. Access admin panel at `/admin`
4. Use "Manage Inventory" to add products

### Option C: Seed Script (Recommended)
Create `scripts/seed-products.js`:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const sampleProducts = [
  {
    name: 'ASUS ROG Strix Gaming Laptop',
    description: 'High-performance gaming laptop with RTX 4070',
    price: 1299.99,
    image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5',
    category_id: 1,
    slug: 'asus-rog-strix-laptop'
  },
  // Add your products here...
];

async function seedProducts() {
  try {
    // Insert categories first
    await pool.query(`
      INSERT INTO categories (name, slug) VALUES 
      ('Gaming Laptops', 'gaming-laptops'),
      ('Gaming PCs', 'gaming-pcs'),
      ('Accessories', 'accessories')
      ON CONFLICT (slug) DO NOTHING
    `);

    // Insert products
    for (const product of sampleProducts) {
      await pool.query(`
        INSERT INTO products (name, description, price, image, category_id, slug)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (slug) DO NOTHING
      `, [product.name, product.description, product.price, product.image, product.category_id, product.slug]);
    }

    console.log('Products seeded successfully!');
  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    pool.end();
  }
}

seedProducts();
```

Run the seed script:
```bash
node scripts/seed-products.js
```

## Step 5: Start the Application

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

The application will be available at: `http://localhost:5000`

## Step 6: Initial Setup

1. **Create Admin Account**:
   - Go to `http://localhost:5000/auth`
   - Register with username: `admin`, password: `Admin123!`
   - Or use existing admin credentials: admin/1234

2. **Access Admin Panel**:
   - Go to `http://localhost:5000/admin`
   - Manage products, inventory, and orders

3. **Test Customer Features**:
   - Register as customer
   - Browse products, add to cart
   - Complete mock checkout process

## File Structure

```
gamer-bazaar/
├── client/              # React frontend
├── server/              # Express backend
├── shared/              # Shared schemas and types
├── uploads/             # Product images (local)
├── .env                 # Environment variables
├── package.json         # Dependencies
└── drizzle.config.ts    # Database configuration
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run db:push      # Push schema changes to database
npm run db:studio    # Open database management UI
```

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -U postgres -d gamer_bazaar -c "SELECT 1;"
```

### Port Conflicts
If port 5000 is busy, change in `server/index.ts`:
```javascript
const PORT = process.env.PORT || 3000;
```

### Missing Dependencies
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Database Management

### View Data
```bash
# Connect to database
psql -U postgres -d gamer_bazaar

# View products
SELECT id, name, price FROM products;

# View orders
SELECT id, order_number, total_amount, status FROM orders;
```

### Backup Database
```bash
pg_dump -U postgres gamer_bazaar > backup.sql
```

### Restore Database
```bash
psql -U postgres gamer_bazaar < backup.sql
```

## Production Considerations

1. **Environment Variables**: Use strong SESSION_SECRET
2. **Database**: Consider connection pooling for high traffic
3. **File Uploads**: Use cloud storage (AWS S3) instead of local filesystem
4. **SSL**: Enable HTTPS with proper certificates
5. **Process Manager**: Use PM2 for process management

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start npm --name "gamer-bazaar" -- start
```

## Support

For issues:
1. Check application logs in console
2. Verify database connection
3. Ensure all environment variables are set
4. Check PostgreSQL service status

Your gaming e-commerce platform should now be running locally with all features working!
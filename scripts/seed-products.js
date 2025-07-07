require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Sample gaming products with realistic data
const categories = [
  { name: 'Gaming Laptops', slug: 'gaming-laptops' },
  { name: 'Gaming PCs', slug: 'gaming-pcs' },
  { name: 'Gaming Chairs', slug: 'gaming-chairs' },
  { name: 'Keyboards & Mice', slug: 'keyboards-mice' },
  { name: 'Headsets', slug: 'headsets' },
  { name: 'Monitors', slug: 'monitors' },
  { name: 'Components', slug: 'components' }
];

const products = [
  {
    name: 'ASUS ROG Strix G15 Gaming Laptop',
    description: 'High-performance gaming laptop with AMD Ryzen 7, RTX 4060, 16GB RAM, 1TB SSD. Perfect for AAA gaming and streaming.',
    price: 1299.99,
    image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3',
    category_slug: 'gaming-laptops',
    slug: 'asus-rog-strix-g15'
  },
  {
    name: 'Alienware Aurora R15 Gaming Desktop',
    description: 'Ultimate gaming desktop with Intel i9-13900F, RTX 4080, 32GB DDR5, 2TB NVMe SSD. Built for extreme performance.',
    price: 2899.99,
    image: 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?ixlib=rb-4.0.3',
    category_slug: 'gaming-pcs',
    slug: 'alienware-aurora-r15'
  },
  {
    name: 'Secretlab TITAN Evo Gaming Chair',
    description: 'Premium ergonomic gaming chair with 4-way lumbar support, cold-cure foam, and premium PU leather.',
    price: 519.99,
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3',
    category_slug: 'gaming-chairs',
    slug: 'secretlab-titan-evo'
  },
  {
    name: 'Corsair K95 RGB Platinum Mechanical Keyboard',
    description: 'Premium mechanical gaming keyboard with Cherry MX switches, RGB lighting, and dedicated macro keys.',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?ixlib=rb-4.0.3',
    category_slug: 'keyboards-mice',
    slug: 'corsair-k95-rgb-platinum'
  },
  {
    name: 'Logitech G Pro X Wireless Gaming Headset',
    description: 'Professional wireless gaming headset with Blue VO!CE technology and PRO-G 50mm drivers.',
    price: 249.99,
    image: 'https://images.unsplash.com/photo-1599669454699-248893623440?ixlib=rb-4.0.3',
    category_slug: 'headsets',
    slug: 'logitech-g-pro-x-wireless'
  },
  {
    name: 'ASUS ROG Swift PG279QM 27" Gaming Monitor',
    description: '27" 1440p 240Hz IPS gaming monitor with G-SYNC, HDR400, and ultra-low latency for competitive gaming.',
    price: 899.99,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?ixlib=rb-4.0.3',
    category_slug: 'monitors',
    slug: 'asus-rog-swift-pg279qm'
  },
  {
    name: 'NVIDIA GeForce RTX 4070 Ti Graphics Card',
    description: 'High-performance graphics card with 12GB GDDR6X, ray tracing, and DLSS 3 for ultimate gaming experience.',
    price: 799.99,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?ixlib=rb-4.0.3',
    category_slug: 'components',
    slug: 'nvidia-rtx-4070-ti'
  },
  {
    name: 'Razer DeathAdder V3 Pro Wireless Mouse',
    description: 'Ultra-lightweight wireless gaming mouse with Focus Pro 30K sensor and 90-hour battery life.',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3',
    category_slug: 'keyboards-mice',
    slug: 'razer-deathadder-v3-pro'
  },
  {
    name: 'MSI Gaming GeForce RTX 4060 Ti',
    description: 'Mid-range powerhouse graphics card with 16GB GDDR6, perfect for 1440p gaming and content creation.',
    price: 599.99,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?ixlib=rb-4.0.3',
    category_slug: 'components',
    slug: 'msi-rtx-4060-ti'
  },
  {
    name: 'SteelSeries Arctis Pro Wireless Headset',
    description: 'Premium wireless gaming headset with Hi-Res audio, dual battery system, and premium steel construction.',
    price: 329.99,
    image: 'https://images.unsplash.com/photo-1599669454699-248893623440?ixlib=rb-4.0.3',
    category_slug: 'headsets',
    slug: 'steelseries-arctis-pro-wireless'
  }
];

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🌱 Starting database seeding...');
    
    // Insert categories
    console.log('📁 Inserting categories...');
    for (const category of categories) {
      await client.query(`
        INSERT INTO categories (name, slug) 
        VALUES ($1, $2) 
        ON CONFLICT (slug) DO NOTHING
      `, [category.name, category.slug]);
    }
    
    // Get category IDs
    const categoryMap = {};
    const categoryResult = await client.query('SELECT id, slug FROM categories');
    categoryResult.rows.forEach(row => {
      categoryMap[row.slug] = row.id;
    });
    
    // Insert products
    console.log('🎮 Inserting products...');
    for (const product of products) {
      const categoryId = categoryMap[product.category_slug];
      if (!categoryId) {
        console.warn(`⚠️  Category not found: ${product.category_slug}`);
        continue;
      }
      
      const result = await client.query(`
        INSERT INTO products (name, description, price, image, category_id, slug) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          image = EXCLUDED.image,
          category_id = EXCLUDED.category_id
        RETURNING id
      `, [product.name, product.description, product.price, product.image, categoryId, product.slug]);
      
      const productId = result.rows[0].id;
      
      // Create inventory units for each product (5-15 units per product)
      const unitCount = Math.floor(Math.random() * 11) + 5; // 5-15 units
      for (let i = 0; i < unitCount; i++) {
        const serialNumber = `${product.slug.toUpperCase().replace(/-/g, '')}-${String(i + 1).padStart(3, '0')}`;
        await client.query(`
          INSERT INTO inventory_units (product_id, serial_number, status) 
          VALUES ($1, $2, 'available')
          ON CONFLICT (serial_number) DO NOTHING
        `, [productId, serialNumber]);
      }
      
      console.log(`✅ Added ${product.name} with ${unitCount} inventory units`);
    }
    
    // Create admin user if doesn't exist
    console.log('👤 Creating admin user...');
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    await client.query(`
      INSERT INTO users (id, username, email, password, first_name, last_name, role, created_at, updated_at)
      VALUES (gen_random_uuid(), 'admin', 'admin@gamerbazaar.com', $1, 'Admin', 'User', 'admin', NOW(), NOW())
      ON CONFLICT (username) DO NOTHING
    `, [hashedPassword]);
    
    await client.query('COMMIT');
    
    // Display summary
    const productCount = await client.query('SELECT COUNT(*) FROM products');
    const categoryCount = await client.query('SELECT COUNT(*) FROM categories');
    const inventoryCount = await client.query('SELECT COUNT(*) FROM inventory_units');
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   Categories: ${categoryCount.rows[0].count}`);
    console.log(`   Products: ${productCount.rows[0].count}`);
    console.log(`   Inventory Units: ${inventoryCount.rows[0].count}`);
    console.log(`   Users: ${userCount.rows[0].count}`);
    console.log('\n🚀 Your gaming store is ready to go!');
    console.log('   Admin login: admin / Admin123!');
    console.log('   Access admin panel at: http://localhost:5000/admin');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await seedDatabase();
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { seedDatabase };
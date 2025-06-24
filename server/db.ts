import "dotenv/config";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon for serverless environment
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineConnect = false;

console.log("DATABASE_URL loaded:", !!process.env.DATABASE_URL);
console.log("DATABASE_URL value:", process.env.DATABASE_URL?.substring(0, 30) + "...");

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL not found!");
  console.error("Make sure your .env file exists and contains:");
  console.error("DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/gamer_bazaar");
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create pool with aggressive settings for performance
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 1,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 2000,
});

// Add error handling for the pool
pool.on('error', (err) => {
  console.error('Database pool error:', err);
});

export const db = drizzle({ client: pool, schema });
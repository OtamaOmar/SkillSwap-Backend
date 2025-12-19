import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prefer DATABASE_PUBLIC_URL (Railway) over DATABASE_URL
let connectionString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;

if (!connectionString) {
  connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME || 'skillswap_db'}`;
}

const pool = new Pool({ connectionString });

async function runMigrations() {
  const client = await pool.connect();
  try {
    console.log('Starting database migrations...');

    const migrationsDir = path.join(__dirname, 'migrations');
    const allFiles = fs.readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort(); // lexical sort keeps 001_.. < 002_.. etc

    for (const file of allFiles) {
      const migrationPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(migrationPath, 'utf8');
      await client.query(sql);
      console.log(`✓ Executed ${file}`);
    }

    console.log('✓ Database migrations completed successfully');
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migrations
runMigrations()
  .then(() => {
    console.log('Migration process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal migration error:', error);
    process.exit(1);
  });

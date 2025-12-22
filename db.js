import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// Prefer DATABASE_URL if provided; fallback to discrete env vars with safe defaults
const connectionString = process.env.DATABASE_URL;

export const pool = connectionString
  ? new Pool({ connectionString })
  : new Pool({
      user: process.env.DB_USER || 'mora',
      password: process.env.DB_PASSWORD || 'Omar.team1234',
      host: process.env.DB_HOST || '51.107.11.67',
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'skillswap-db',
    });

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;

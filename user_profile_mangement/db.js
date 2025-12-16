import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({
  user: process.env.DB_USER || 'mora',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'skillswap_db',
  password: process.env.DB_PASSWORD || 'Omar.2005',
  port: Number(process.env.DB_PORT) || 5432,
});

export default pool;
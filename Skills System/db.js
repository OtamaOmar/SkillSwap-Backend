import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",  
  host: "localhost",
  database: "Skillswap",  
  password: "Mohamed@4368",
  port: 5432,
});

export default pool;

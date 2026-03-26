require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    // Add username column
    await pool.query(`ALTER TABLE employees ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE`);

    // Set default username for existing employees (email prefix)
    await pool.query(`
    UPDATE employees 
    SET username = LOWER(SPLIT_PART(email, '@', 1))
    WHERE username IS NULL
  `);

    // Create index for fast lookup
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_employees_username ON employees(username)`);

    console.log('Done! Username column added.');
    pool.end();
}

run().catch(e => { console.log('Error:', e.message); pool.end(); });
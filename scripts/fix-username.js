require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    await pool.query(`
    UPDATE employees 
    SET username = LOWER(SPLIT_PART(email, '@', 1)) 
    WHERE username IS NULL
  `);
    console.log('Done!');
    pool.end();
}

run().catch(e => { console.log('Error:', e.message); pool.end(); });
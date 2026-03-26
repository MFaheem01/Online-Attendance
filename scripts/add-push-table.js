require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id SERIAL PRIMARY KEY,
      employee_id INT UNIQUE NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      subscription TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
    console.log('Done! push_subscriptions table created.');
    pool.end();
}

run().catch(e => { console.log('Error:', e.message); pool.end(); });
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    await pool.query(`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS check_out_time TIMESTAMP`);
    await pool.query(`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS task TEXT`);
    await pool.query(`
    CREATE TABLE IF NOT EXISTS group_messages (
      id SERIAL PRIMARY KEY,
      sender_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      sender_name VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      mentions INT[] DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
    console.log('Done!');
    pool.end();
}

run().catch(e => { console.log('Error:', e.message); pool.end(); });
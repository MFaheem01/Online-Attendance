// scripts/fix-admin.js
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    await pool.query(
        "UPDATE employees SET role = 'admin', is_verified = true WHERE email = 'my7227164@gmail.com'"
    );
    console.log('Admin fixed!');
    pool.end();
}
run().catch(e => { console.log('Error:', e.message); pool.end(); });
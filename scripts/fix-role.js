require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_role_check")
    .then(() => { console.log('Done!'); pool.end(); })
    .catch(e => { console.log('Error:', e.message); pool.end(); });
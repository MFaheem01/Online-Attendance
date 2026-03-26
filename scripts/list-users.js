require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function listUsers() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const result = await pool.query('SELECT email, name, role FROM employees');
    console.log('--- Users ---');
    console.table(result.rows);
    console.log('-------------');
  } catch (error) {
    console.error('Error listing users:', error.message);
  } finally {
    await pool.end();
  }
}

listUsers();

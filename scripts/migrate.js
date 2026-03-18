#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function migrate() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
  });

  try {
    console.log('🔄 Running database migrations...');

    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '01-create-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split by semicolons and filter empty statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    // Execute each statement
    for (const statement of statements) {
      await pool.query(statement);
      console.log('✓ Executed statement');
    }

    console.log('✅ Database migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();

-- Add missing password_hash column to employees
ALTER TABLE employees ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Fix sessions table - drop and recreate with correct structure
DROP TABLE IF EXISTS sessions CASCADE;
CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fix verification_codes - add unique constraint on email
ALTER TABLE verification_codes DROP CONSTRAINT IF EXISTS verification_codes_email_key;
ALTER TABLE verification_codes ADD CONSTRAINT verification_codes_email_key UNIQUE (email);

CREATE INDEX IF NOT EXISTS idx_sessions_employee_id ON sessions(employee_id);
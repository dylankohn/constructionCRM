-- Add email column to users table for password reset functionality
-- Run this on your RDS database

ALTER TABLE users 
ADD COLUMN email VARCHAR(255) UNIQUE AFTER username;

-- Optional: Add index for faster email lookups
CREATE INDEX idx_email ON users(email);

-- Update existing users with placeholder emails (you'll need to update these)
-- UPDATE users SET email = CONCAT(username, '@placeholder.com') WHERE email IS NULL;


const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

async function hashExistingPasswords() {
  console.log('🔒 Starting password hashing migration...\n');
  
  db.connect((err) => {
    if (err) {
      console.error('❌ Database connection failed:', err.message);
      process.exit(1);
    }
    console.log('✅ Connected to database\n');
  });

  db.query('SELECT id, username, password FROM users', async (err, users) => {
    if (err) {
      console.error('❌ Error fetching users:', err.message);
      db.end();
      process.exit(1);
    }

    if (users.length === 0) {
      console.log('⚠️  No users found in database');
      db.end();
      return;
    }

    console.log(`📋 Found ${users.length} user(s)\n`);
    
    let hashedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes start with $2a$ or $2b$)
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        console.log(`⏭️  User "${user.username}" (ID: ${user.id}) - Password already hashed, skipping`);
        skippedCount++;
        continue;
      }

      try {
        // Hash the plain text password
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        // Update the database
        await new Promise((resolve, reject) => {
          db.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, user.id],
            (err, result) => {
              if (err) {
                reject(err);
              } else {
                resolve(result);
              }
            }
          );
        });

        console.log(`✅ User "${user.username}" (ID: ${user.id}) - Password hashed successfully`);
        hashedCount++;
      } catch (error) {
        console.error(`❌ Error hashing password for user "${user.username}" (ID: ${user.id}):`, error.message);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Summary:');
    console.log(`   Total users: ${users.length}`);
    console.log(`   Passwords hashed: ${hashedCount}`);
    console.log(`   Already hashed (skipped): ${skippedCount}`);
    console.log('='.repeat(50));
    console.log('\n✨ Migration complete!\n');

    db.end();
  });
}

hashExistingPasswords();


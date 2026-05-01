const { Client } = require('pg');

console.log('Testing PostgreSQL passwords...');

const passwords = ['postgres', 'admin', 'password', '123456', 'postgres123'];

async function testPassword(password) {
  try {
    const client = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: password,
      database: 'postgres',
      connectTimeoutMS: 3000
    });
    
    await client.connect();
    console.log('SUCCESS! Password found:', password);
    await client.end();
    
    // Update .env file
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '.env');
    
    let content = fs.readFileSync(envPath, 'utf8');
    content = content.replace('PG_PASSWORD=your_postgres_password', 'PG_PASSWORD=' + password);
    fs.writeFileSync(envPath, content);
    
    console.log('Updated .env file with correct password');
    return true;
    
  } catch (error) {
    console.log('Failed with password:', password, '-', error.message.split('\n')[0]);
    return false;
  }
}

async function testAllPasswords() {
  for (const password of passwords) {
    const success = await testPassword(password);
    if (success) {
      console.log('\nPostgreSQL is now configured!');
      console.log('Next steps:');
      console.log('1. Create database: CREATE DATABASE lms_database;');
      console.log('2. Run migration: node quick-migrate.js');
      console.log('3. Verify: node check-migration-status.js');
      return;
    }
  }
  
  console.log('\nNone of the common passwords worked.');
  console.log('Please install PostgreSQL or use your actual password.');
}

testAllPasswords();

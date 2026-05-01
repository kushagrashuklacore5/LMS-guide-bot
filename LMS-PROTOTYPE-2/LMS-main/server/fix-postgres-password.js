#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('==========================================');
console.log('    POSTGRESQL PASSWORD FIX HELPER');
console.log('==========================================');
console.log('');

console.log('This script will help you fix the PostgreSQL password issue.');
console.log('');

// Check current .env file
const envPath = path.join(__dirname, '.env');
const envBackupPath = path.join(__dirname, '.env.backup');

if (fs.existsSync(envPath)) {
  console.log('Current .env file found');
  
  // Create backup
  if (!fs.existsSync(envBackupPath)) {
    fs.copyFileSync(envPath, envBackupPath);
    console.log('Created backup: .env.backup');
  }
  
  // Read current content
  const currentContent = fs.readFileSync(envPath, 'utf8');
  console.log('\nCurrent PostgreSQL configuration in .env:');
  
  const lines = currentContent.split('\n');
  const pgLines = lines.filter(line => line.includes('PG_'));
  
  if (pgLines.length > 0) {
    pgLines.forEach(line => console.log('  ' + line));
  } else {
    console.log('  No PostgreSQL configuration found');
  }
  
} else {
  console.log('No .env file found. Will create one with PostgreSQL settings.');
}

console.log('');
console.log('COMMON SOLUTIONS:');
console.log('==================');
console.log('');
console.log('1. If you just installed PostgreSQL:');
console.log('   - Try password: postgres');
console.log('   - Try password: admin');
console.log('   - Try password: password');
console.log('   - Or use whatever password you set during installation');
console.log('');
console.log('2. If PostgreSQL is not installed:');
console.log('   - Download from: https://www.postgresql.org/download/windows/');
console.log('   - Run installer as Administrator');
console.log('   - Set a memorable password during installation');
console.log('');
console.log('3. If you forgot your PostgreSQL password:');
console.log('   - Open pgAdmin (installed with PostgreSQL)');
console.log('   - Right-click on postgres server');
console.log('   - Select "Disconnect"');
console.log('   - Right-click again and select "Connect Server"');
console.log('   - Update the password field');
console.log('');
console.log('4. Test common passwords:');
console.log('   The script will test these common passwords:');
console.log('   - postgres');
console.log('   - admin');
console.log('   - password');
console.log('   - 123456');
console.log('');

// Test common passwords
async function testPasswords() {
  const { Client } = require('pg');
  const commonPasswords = ['postgres', 'admin', 'password', '123456', 'postgres123'];
  
  console.log('Testing common passwords...');
  
  for (const password of commonPasswords) {
    try {
      const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: password,
        database: 'postgres', // Try default database first
        connectTimeoutMS: 3000
      });
      
      await client.connect();
      console.log('SUCCESS! Password found: ' + password);
      await client.end();
      
      // Update .env with correct password
      updateEnvPassword(password);
      return password;
      
    } catch (error) {
      console.log('Failed with password: ' + password + ' - ' + error.message);
    }
  }
  
  console.log('None of the common passwords worked.');
  console.log('You need to:');
  console.log('1. Install PostgreSQL if not installed');
  console.log('2. Remember the password you set during installation');
  console.log('3. Or reset the PostgreSQL password');
  return null;
}

function updateEnvPassword(correctPassword) {
  let content = '';
  
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf8');
  } else {
    content = 'PORT=5002\n';
  }
  
  // Update or add PostgreSQL configuration
  const pgConfig = `
# PostgreSQL Database Configuration
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=${correctPassword}
PG_DATABASE=lms_database

# Database Switch
USE_POSTGRES=true
`;
  
  // Remove existing PG_ lines
  const lines = content.split('\n');
  const filteredLines = lines.filter(line => !line.startsWith('PG_') && !line.startsWith('USE_POSTGRES'));
  
  // Add new configuration
  const newContent = filteredLines.join('\n') + pgConfig;
  
  fs.writeFileSync(envPath, newContent);
  console.log('\nUpdated .env file with correct password: ' + correctPassword);
  console.log('You can now run your migration!');
}

// Instructions for manual password reset
console.log('MANUAL PASSWORD RESET INSTRUCTIONS:');
console.log('====================================');
console.log('');
console.log('If the automatic test fails, you can manually reset:');
console.log('');
console.log('1. Stop PostgreSQL service:');
console.log('   - Open Services (services.msc)');
console.log('   - Find "postgresql-x64-15" (or similar)');
console.log('   - Right-click and select "Stop"');
console.log('');
console.log('2. Reset password using command line:');
console.log('   - Open Command Prompt as Administrator');
console.log('   - Navigate to PostgreSQL bin directory');
console.log('   - Usually: C:\\Program Files\\PostgreSQL\\15\\bin');
console.log('   - Run: psql -U postgres');
console.log('   - Then: \\password postgres');
console.log('   - Enter new password twice');
console.log('');
console.log('3. Restart PostgreSQL service');
console.log('');
console.log('4. Update .env file with your new password');
console.log('');

// Ask user if they want to test passwords
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Do you want to test common passwords automatically? (y/N): ', function(answer) {
  rl.close();
  
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    testPasswords().then(function(password) {
      if (password) {
        console.log('\nSUCCESS! Your PostgreSQL is now configured.');
        console.log('Next steps:');
        console.log('1. Create database: CREATE DATABASE lms_database;');
        console.log('2. Run migration: node quick-migrate.js');
        console.log('3. Verify: node check-migration-status.js');
      } else {
        console.log('\nPlease install PostgreSQL or reset your password manually.');
      }
    }).catch(function(error) {
      console.error('Error testing passwords:', error.message);
    });
  } else {
    console.log('\nPlease update your .env file manually with the correct PostgreSQL password.');
    console.log('Then run: node check-migration-status.js to verify.');
  }
});

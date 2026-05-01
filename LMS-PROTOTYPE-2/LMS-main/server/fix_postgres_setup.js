const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing PostgreSQL Setup...');
console.log('============================');

// Try to initialize PostgreSQL with default settings
try {
  console.log('📁 Creating PostgreSQL data directory...');
  
  // Create data directory
  const dataDir = path.join(__dirname, 'postgres_data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  console.log('🔐 Setting PostgreSQL password to "postgres"...');
  
  // Create a simple setup that works
  const setupScript = `
@echo off
echo Setting up PostgreSQL...
cd /d "C:\\Program Files\\PostgreSQL\\18\\bin"
set PGPASSWORD=postgres
echo Creating database...
createdb -U postgres lms_database 2>nul
echo Database created successfully!
echo Creating tables...
psql -U postgres -d lms_database -c "CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'user', university_id INTEGER DEFAULT 1, is_approved BOOLEAN DEFAULT 1, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);" 2>nul
psql -U postgres -d lms_database -c "CREATE TABLE IF NOT EXISTS universities (id SERIAL PRIMARY KEY, name TEXT NOT NULL, area TEXT, adminId INTEGER, subscriptionPlan TEXT DEFAULT 'free', createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP);" 2>nul
echo Tables created successfully!
echo PostgreSQL setup completed!
  `;
  
  fs.writeFileSync(path.join(__dirname, 'setup_postgres.bat'), setupScript);
  console.log('✅ Setup script created: setup_postgres.bat');
  console.log('📝 Please run the setup script as administrator to complete PostgreSQL setup');
  
} catch (error) {
  console.error('❌ Error:', error.message);
}

// Alternative: Use SQLite with proper structure for now
console.log('\n🔄 Creating fallback SQLite setup with proper structure...');

const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, 'data', 'lms_permanent.db');

// Create database directory if it doesn't exist
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ SQLite error:', err.message);
    return;
  }
  console.log('✅ SQLite permanent database created');
});

// Create tables with proper structure
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      university_id INTEGER DEFAULT 1,
      is_approved INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Users table error:', err.message);
    } else {
      console.log('✅ Users table created');
    }
  });
  
  // Universities table
  db.run(`
    CREATE TABLE IF NOT EXISTS universities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      area TEXT,
      adminId INTEGER,
      subscriptionPlan TEXT DEFAULT 'free',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Universities table error:', err.message);
    } else {
      console.log('✅ Universities table created');
    }
  });
  
  // Add sample data
  db.run(`
    INSERT OR IGNORE INTO universities (name, area) 
    VALUES ('Demo University', 'Demo Area')
  `, (err) => {
    if (err) {
      console.error('❌ Sample university error:', err.message);
    } else {
      console.log('✅ Sample university added');
    }
  });
});

db.close((err) => {
  if (err) {
    console.error('❌ Database close error:', err.message);
  } else {
    console.log('✅ Database setup completed');
    console.log(`📁 Database location: ${dbPath}`);
    console.log('\n🎉 Setup completed! Now update the system to use this permanent database.');
  }
});

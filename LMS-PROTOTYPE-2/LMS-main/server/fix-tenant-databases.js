const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const MAIN_DB_PATH = path.join(__dirname, 'data', 'lms-main.sqlite');
const TENANT_DB_DIR = path.join(__dirname, 'data', 'tenants');

console.log('🔧 Fixing Tenant Database Tables');
console.log('================================\n');

function fixTenantDatabases() {
  return new Promise((resolve, reject) => {
    const mainDb = new sqlite3.Database(MAIN_DB_PATH);
    
    console.log('📋 Getting superadmins and fixing tenant databases...');
    
    mainDb.all('SELECT * FROM users WHERE role = "superadmin"', [], (err, superadmins) => {
      if (err) {
        console.error('Error getting superadmins:', err);
        reject(err);
        return;
      }
      
      console.log(`Found ${superadmins.length} superadmins`);
      
      let completed = 0;
      let errors = [];
      
      superadmins.forEach(superadmin => {
        const tenantDbPath = path.join(TENANT_DB_DIR, `tenant_${superadmin.id}.sqlite`);
        
        if (!fs.existsSync(tenantDbPath)) {
          console.log(`❌ Tenant database not found for superadmin ${superadmin.id}`);
          completed++;
          if (completed === superadmins.length) {
            if (errors.length === 0) resolve();
            else reject(errors);
          }
          return;
        }
        
        const tenantDb = new sqlite3.Database(tenantDbPath);
        
        console.log(`\n🏗️ Fixing database for SuperAdmin: ${superadmin.name} (${superadmin.email})`);
        
        tenantDb.serialize(() => {
          // Drop all existing tables to ensure clean state
          const tables = ['users', 'universities', 'students', 'teachers', 'classrooms', 'courses', 'feeStructures', 'vendors', 'inventory'];
          
          let dropped = 0;
          tables.forEach(table => {
            tenantDb.run(`DROP TABLE IF EXISTS ${table}`, (err) => {
              if (err) {
                console.error(`Error dropping ${table}:`, err);
              } else {
                console.log(`  Dropped table: ${table}`);
              }
              
              dropped++;
              if (dropped === tables.length) {
                // Now recreate all tables properly
                createTables(tenantDb, superadmin, () => {
                  completed++;
                  if (completed === superadmins.length) {
                    if (errors.length === 0) {
                      console.log('\n✅ All tenant databases fixed!');
                      mainDb.close();
                      resolve();
                    } else {
                      mainDb.close();
                      reject(errors);
                    }
                  }
                });
              }
            });
          });
        });
      });
    });
  });
}

function createTables(db, superadmin, callback) {
  console.log(`  Creating tables for tenant ${superadmin.id}...`);
  
  let created = 0;
  const totalTables = 8;
  
  // Universities table
  db.run(`
    CREATE TABLE universities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      established_year INTEGER,
      type TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating universities:', err);
    else console.log('  ✅ Universities table created');
    checkComplete();
  });
  
  // Users table (with superadmin_id)
  db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      university_id INTEGER DEFAULT 1,
      superadmin_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'active',
      FOREIGN KEY (university_id) REFERENCES universities(id)
    )
  `, (err) => {
    if (err) console.error('Error creating users:', err);
    else console.log('  ✅ Users table created with superadmin_id');
    checkComplete();
  });
  
  // Students table
  db.run(`
    CREATE TABLE students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      roll_number TEXT UNIQUE,
      enrollment_date DATE,
      semester INTEGER DEFAULT 1,
      section TEXT,
      batch TEXT,
      academic_year TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) console.error('Error creating students:', err);
    else console.log('  ✅ Students table created');
    checkComplete();
  });
  
  // Teachers table
  db.run(`
    CREATE TABLE teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      employee_id TEXT UNIQUE,
      department TEXT,
      designation TEXT,
      specialization TEXT,
      experience_years INTEGER DEFAULT 0,
      joining_date DATE,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) console.error('Error creating teachers:', err);
    else console.log('  ✅ Teachers table created');
    checkComplete();
  });
  
  // Classrooms table
  db.run(`
    CREATE TABLE classrooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      capacity INTEGER DEFAULT 30,
      building TEXT,
      floor TEXT,
      room_number TEXT,
      university_id INTEGER DEFAULT 1,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (university_id) REFERENCES universities(id)
    )
  `, (err) => {
    if (err) console.error('Error creating classrooms:', err);
    else console.log('  ✅ Classrooms table created');
    checkComplete();
  });
  
  // Courses table
  db.run(`
    CREATE TABLE courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      description TEXT,
      credits INTEGER DEFAULT 3,
      duration_weeks INTEGER DEFAULT 16,
      university_id INTEGER DEFAULT 1,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (university_id) REFERENCES universities(id)
    )
  `, (err) => {
    if (err) console.error('Error creating courses:', err);
    else console.log('  ✅ Courses table created');
    checkComplete();
  });
  
  // Fee structures table
  db.run(`
    CREATE TABLE feeStructures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      amount DECIMAL(10,2) NOT NULL,
      type TEXT NOT NULL,
      frequency TEXT DEFAULT 'monthly',
      university_id INTEGER DEFAULT 1,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (university_id) REFERENCES universities(id)
    )
  `, (err) => {
    if (err) console.error('Error creating feeStructures:', err);
    else console.log('  ✅ FeeStructures table created');
    checkComplete();
  });
  
  // Vendors table
  db.run(`
    CREATE TABLE vendors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      category TEXT,
      rating REAL DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating vendors:', err);
    else console.log('  ✅ Vendors table created');
    checkComplete();
  });
  
  // Inventory table
  db.run(`
    CREATE TABLE inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      quantity INTEGER DEFAULT 0,
      unit TEXT,
      vendorId INTEGER,
      price DECIMAL(10,2),
      status TEXT DEFAULT 'active',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vendorId) REFERENCES vendors(id)
    )
  `, (err) => {
    if (err) console.error('Error creating inventory:', err);
    else console.log('  ✅ Inventory table created');
    checkComplete();
  });
  
  function checkComplete() {
    created++;
    if (created === totalTables) {
      // Insert default university
      db.run(`
        INSERT INTO universities (name, email, status)
        VALUES (?, ?, 'active')
      `, [`${superadmin.name}'s University`, superadmin.email], (err) => {
        if (err) {
          console.error('Error inserting default university:', err);
        } else {
          console.log(`  ✅ Default university created for ${superadmin.name}`);
        }
        callback();
      });
    }
  }
}

fixTenantDatabases().then(() => {
  console.log('\n🎉 Tenant databases fixed successfully!');
  console.log('Now run: node test-database-isolation.js');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Error fixing tenant databases:', error);
  process.exit(1);
});

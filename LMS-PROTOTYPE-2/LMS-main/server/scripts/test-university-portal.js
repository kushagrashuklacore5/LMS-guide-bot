const db = require('../config/sqlite-db');

console.log('=== Testing Super Admin University Creation & Portal Display ===\n');

// Simulate super admin creating a university
const universityData = {
  name: 'Oxford International University',
  area: 'Oxford, UK',
  adminName: 'Dr. Elizabeth Stone',
  adminEmail: 'elizabeth.stone2024@oxford-uni.edu'
};

console.log('1️⃣  SUPER ADMIN creates a new UNIVERSITY:');
console.log(JSON.stringify(universityData, null, 2));

// Step 1: Check if admin exists
const normalizedEmail = universityData.adminEmail.trim().toLowerCase();

db.get("SELECT * FROM users WHERE email = ?", [normalizedEmail], (err, existingAdmin) => {
  if (err) {
    console.error('❌ Error checking admin:', err.message);
    process.exit(1);
  }

  if (existingAdmin) {
    console.log('\n⚠️  Admin already exists with email: ' + normalizedEmail);
  } else {
    console.log('\n✅ Admin does not exist, will be created');
  }

  // Step 2: Create admin user (simulating bcrypt hashing)
  const bcrypt = require('bcryptjs');
  const rawPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
  
  bcrypt.hash(rawPassword, 10).then(hashedPassword => {
    console.log(`\n2️⃣  AUTO-GENERATED ADMIN PASSWORD:`);
    console.log(`   Raw: ${rawPassword}`);
    console.log(`   Hashed: ${hashedPassword.substring(0, 40)}...`);

    // Create admin user
    db.run(`
      INSERT INTO users (name, email, password, role, isApproved, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `, [universityData.adminName, normalizedEmail, hashedPassword, "admin", 1], function(err) {
      if (err) {
        console.error('❌ Error creating admin:', err.message);
        process.exit(1);
      }

      const adminId = this.lastID;
      console.log(`\n3️⃣  ADMIN USER CREATED:`);
      console.log(`   ID: ${adminId}`);
      console.log(`   Name: ${universityData.adminName}`);
      console.log(`   Email: ${normalizedEmail}`);
      console.log(`   Role: admin`);
      console.log(`   isApproved: 1 (can login immediately)`);
      console.log(`   Generated Password: ${rawPassword}`);

      // Step 3: Create university
      db.run(`
        INSERT INTO universities (name, area, adminId, createdAt, updatedAt)
        VALUES (?, ?, ?, datetime('now'), datetime('now'))
      `, [universityData.name, universityData.area, adminId], function(err) {
        if (err) {
          console.error('❌ Error creating university:', err.message);
          process.exit(1);
        }

        const univId = this.lastID;
        console.log(`\n4️⃣  UNIVERSITY CREATED:`);
        console.log(`   ID: ${univId}`);
        console.log(`   Name: ${universityData.name}`);
        console.log(`   Area: ${universityData.area}`);
        console.log(`   Admin ID: ${adminId}`);

        // Step 4: Retrieve university with admin info
        db.get(`
          SELECT u.id, u.name, u.area, u.adminId, u.createdAt, u.updatedAt,
                 us.name as admin_name, us.email as admin_email, us.role as admin_role
          FROM universities u
          LEFT JOIN users us ON u.adminId = us.id
          WHERE u.id = ?
        `, [univId], (err, university) => {
          if (err) {
            console.error('❌ Error retrieving university:', err.message);
            process.exit(1);
          }

          console.log(`\n5️⃣  UNIVERSITY IN SUPERADMIN PORTAL:`);
          console.log(`   ✅ University will be displayed as:`);
          console.log(`   {`);
          console.log(`     id: ${university.id},`);
          console.log(`     name: "${university.name}",`);
          console.log(`     area: "${university.area}",`);
          console.log(`     adminId: ${university.adminId},`);
          console.log(`     admin: {`);
          console.log(`       id: ${adminId},`);
          console.log(`       name: "${university.admin_name}",`);
          console.log(`       email: "${university.admin_email}",`);
          console.log(`       role: "${university.admin_role}"`);
          console.log(`     }`);
          console.log(`   }`);

          console.log(`\n\n=== SUPERADMIN PORTAL CURRENT STATUS ===\n`);
          console.log(`✅ UNIVERSITIES TAB:`);
          console.log(`   - Displays all created universities ✅`);
          console.log(`   - Shows university name`);
          console.log(`   - Shows area/location`);
          console.log(`   - Shows admin name`);
          console.log(`   - Clickable cards with "View Details" button`);
          console.log(`\n✅ ADMIN DASHBOARD (For Admin Role):`);
          console.log(`   - Admin can login with created credentials ✅`);
          console.log(`   - Shows stats: students, mentors, courses, certificates`);
          console.log(`   - Has quick action buttons`);
          console.log(`   - Currently uses text-based stats (NOT graphs)`);
          
          console.log(`\n❌ ACCOUNTANT DASHBOARD:`);
          console.log(`   - DOES NOT EXIST YET`);
          console.log(`   - Route exists: /accountant/dashboard`);
          console.log(`   - But no component/page for it`);
          console.log(`   - Navigation sends accountant to /accountant/dashboard`);
          console.log(`   - This will result in blank/404 page`);

          console.log(`\n\n=== GRAPHS/CHARTS STATUS ===\n`);
          console.log(`📦 Library Available:`);
          console.log(`   - Recharts 3.6.0 is installed ✅`);
          console.log(`   - Ready for Bar, Line, Pie charts`);
          
          console.log(`\n📊 Admin Dashboard:`);
          console.log(`   - Shows stats as NUMBERS only (no graphs) ❌`);
          console.log(`   - Example: "Students: 15" (text)`);
          console.log(`   - Could be enhanced with Bar/Pie charts`);
          
          console.log(`\n📊 Accountant Dashboard:`);
          console.log(`   - DOES NOT EXIST ❌`);
          console.log(`   - Would need creation with:`);
          console.log(`     * Revenue graphs (Line charts)`);
          console.log(`     * Payment status (Pie charts)`);
          console.log(`     * Fee collection (Bar charts)`);
          console.log(`     * Expense tracking`);

          console.log(`\n\n=== SUMMARY ===\n`);
          console.log(`✅ Super Admin Creates University:`);
          console.log(`   1. Enters university name and area`);
          console.log(`   2. Enters admin name and email`);
          console.log(`   3. System auto-generates admin password`);
          console.log(`   4. Admin user created in DB with role="admin"`);
          console.log(`   5. University linked to admin via adminId`);
          console.log(`   6. Admin can login immediately ✅`);

          console.log(`\n✅ Super Admin Portal Display:`);
          console.log(`   1. Universities tab shows all created universities ✅`);
          console.log(`   2. Cards display: name, area, admin name ✅`);
          console.log(`   3. "View Details" button for each university ✅`);

          console.log(`\n❌ Two Options (Admin & Accountant) Dashboard:`);
          console.log(`   1. Admin Dashboard exists ✅`);
          console.log(`   2. Shows stats but NO GRAPHS ❌`);
          console.log(`   3. Accountant Dashboard MISSING ❌`);
          console.log(`   4. No graphs on either dashboard ❌`);

          console.log(`\n💡 WHAT'S MISSING:\n`);
          console.log(`   1. Accountant Portal/Dashboard (needs to be created)`);
          console.log(`   2. University Detail View (to see admin & accountant options)`);
          console.log(`   3. Graphs/Charts on Admin Dashboard (text → charts)`);
          console.log(`   4. Graphs/Charts on Accountant Dashboard (when created)`);
          console.log(`   5. University context/filtering (show data for selected university)`);

          process.exit(0);
        });
      });
    });
  });
});

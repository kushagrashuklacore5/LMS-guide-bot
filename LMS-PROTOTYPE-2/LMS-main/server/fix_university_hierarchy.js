const db = require('./config/database-switch');

async function fixUniversityHierarchy() {
  console.log('🔧 Fixing University Hierarchy...\n');
  
  try {
    // Get Abhishek's university ID
    db.get("SELECT id, name, university_id FROM users WHERE email = ?", ['abhishek@core5.co.in'], (err, abhishek) => {
      if (err) {
        console.error('❌ Error finding Abhishek:', err);
        return;
      }
      
      if (!abhishek) {
        console.log('❌ Abhishek not found');
        return;
      }
      
      console.log('👨‍💻 Abhishek found:');
      console.log(`   - ID: ${abhishek.id}`);
      console.log(`   - Name: ${abhishek.name}`);
      console.log(`   - University: ${abhishek.university_id}`);
      
      // Move Rishi and Rashmi to Abhishek's university
      console.log('\n🔧 Moving Rishi to Abhishek\'s university...');
      db.run("UPDATE users SET university_id = ? WHERE email = ?", [abhishek.university_id, 'rishi@core5.co.in'], (err) => {
        if (err) {
          console.error('❌ Error updating Rishi:', err);
        } else {
          console.log('✅ Rishi moved to university', abhishek.university_id);
        }
      });
      
      console.log('\n🔧 Moving Rashmi to Abhishek\'s university...');
      db.run("UPDATE users SET university_id = ? WHERE email = ?", [abhishek.university_id, 'rashmi.shetty@core5.co.in'], (err) => {
        if (err) {
          console.error('❌ Error updating Rashmi:', err);
        } else {
          console.log('✅ Rashmi moved to university', abhishek.university_id);
        }
      });
      
      // Verify the fix
      setTimeout(() => {
        console.log('\n🔍 Verifying the fix...');
        
        db.all(`
          SELECT u.id, u.name, u.email, u.role, u.university_id, u.created_by,
                 creator.name as createdByName,
                 uni.name as universityName
          FROM users u
          LEFT JOIN users creator ON u.created_by = creator.id
          LEFT JOIN universities uni ON u.university_id = uni.id
          WHERE u.email IN ('rishi@core5.co.in', 'rashmi.shetty@core5.co.in', 'abhishek@core5.co.in')
          ORDER BY u.created_at ASC
        `, (err, users) => {
          if (err) {
            console.error('❌ Error verifying:', err);
            return;
          }
          
          console.log('📋 Updated Users:');
          users.forEach(user => {
            console.log(`📄 ${user.name} (${user.role})`);
            console.log(`   📧 Email: ${user.email}`);
            console.log(`   🏛️  University: ${user.universityName} (ID: ${user.university_id})`);
            console.log(`   👤 Created By: ${user.createdByName || 'Self'}`);
            console.log('');
          });
          
          console.log('\n🎯 HIERARCHY STATUS:');
          const abhishek = users.find(u => u.email === 'abhishek@core5.co.in');
          const rishi = users.find(u => u.email === 'rishi@core5.co.in');
          const rashmi = users.find(u => u.email === 'rashmi.shetty@core5.co.in');
          
          console.log('👨‍💻 Abhishek: University', abhishek?.universityName || 'Unknown');
          console.log('👨‍🏫 Rishi: University', rishi?.universityName || 'Unknown');
          console.log('   ✅ Under Abhishek: ', rishi?.created_by === abhishek?.id ? 'YES' : 'NO');
          console.log('👩‍🎓 Rashmi: University', rashmi?.universityName || 'Unknown');
          console.log('   ✅ Under Abhishek: ', rashmi?.created_by === abhishek?.id ? 'YES' : 'NO');
          console.log('   ✅ Same University: ', rishi?.university_id === abhishek?.university_id && rashmi?.university_id === abhishek?.university_id ? 'YES' : 'NO');
          
          console.log('\n🌐 FRONTEND TEST:');
          console.log('👨‍💻 Admin Portal: http://localhost:5174/admin/dashboard');
          console.log('🔐 Login: abhishek@core5.co.in / O#P$0A@7THQW');
          console.log('📝 Action: Check dashboard and user hierarchy');
          console.log('🎯 Expected: Rishi and Rashmi shown under Abhishek in same university');
        });
      }, 1000);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixUniversityHierarchy();

const path = require('path');

// Debug classroom database schema and data
const debugClassroomDatabase = () => {
  console.log('🔍 Debugging Classroom Database...\n');
  
  const db = require(path.join(__dirname, 'server', 'config', 'sqlite-db'));
  
  // Check classrooms table structure
  console.log('1️⃣ Checking classrooms table structure:');
  db.all("PRAGMA table_info(classrooms)", (err, columns) => {
    if (err) {
      console.error('Error getting table info:', err);
      return;
    }
    
    columns.forEach(col => {
      console.log(`   - ${col.name}: ${col.type} (nullable: ${col.notnull === 0})`);
    });
    
    // Check actual classroom data
    console.log('\n2️⃣ Checking classroom data:');
    db.all("SELECT * FROM classrooms LIMIT 5", (err, classrooms) => {
      if (err) {
        console.error('Error getting classrooms:', err);
        return;
      }
      
      if (classrooms.length === 0) {
        console.log('   No classrooms found in database');
      } else {
        classrooms.forEach(classroom => {
          console.log(`   - ID: ${classroom.id}, Name: ${classroom.name}, University: ${classroom.university_id}, Teacher: ${classroom.classTeacher}`);
        });
      }
      
      // Test the exact query from getAllClassrooms
      console.log('\n3️⃣ Testing getAllClassrooms query:');
      const universityId = 1;
      const testQuery = `
        SELECT 
          c.id,
          c.university_id,
          COALESCE(c.name_en, c.name) as name_en,
          COALESCE(c.name_ar, c.name) as name_ar,
          c.name,
          c.grade,
          c.section,
          c.classTeacher,
          c.studentCount,
          c.createdAt,
          u.name as classTeacherName
        FROM classrooms c
        LEFT JOIN users u ON c.classTeacher = u.id
        WHERE c.university_id = ?
        ORDER BY c.createdAt DESC
      `;
      
      console.log('   Query:', testQuery);
      console.log('   Params:', [universityId]);
      
      db.all(testQuery, [universityId], (err, result) => {
        if (err) {
          console.error('   ❌ Query error:', err);
          console.error('   Error message:', err.message);
        } else {
          console.log(`   ✅ Query successful: ${result.length} classrooms found`);
          result.forEach((c, i) => {
            console.log(`   - Classroom ${i + 1}: ID=${c.id}, Name=${c.name}, Teacher=${c.classTeacherName}`);
          });
        }
      });
    });
  });
};

debugClassroomDatabase();

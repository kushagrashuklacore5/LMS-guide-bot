const db = require('config/database-switch');
const jwt = require('jsonwebtoken');

// Wait for DB to initialize
setTimeout(() => {
  console.log('\n📋 Testing Progress API...\n');

  // Test data
  const studentId = 3; // Student user ID
  const courseId = 1;  // Course ID
  const materialId = 1; // Material ID

  // Create test JWT token  
  const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret_key';
  const token = jwt.sign({
    userId: studentId,
    role: 'student',
    name: 'Student User'
  }, jwtSecret);

  console.log('✅ JWT Token created:', token);
  console.log('📊 Test Data:', { studentId, courseId, materialId });

  // Step 1: Check if course exists
  db.get('SELECT * FROM courses WHERE id = ?', [courseId], (err, course) => {
    console.log('\n📖 Step 1 - Check Course:', err ? '❌ Error' : course ? '✅ Found' : '❌ Not Found');
    if (course) console.log('   Course:', course.title);

    // Step 2: Check if student exists
    db.get('SELECT * FROM users WHERE id = ?', [studentId], (err, student) => {
      console.log('👤 Step 2 - Check Student:', err ? '❌ Error' : student ? '✅ Found' : '❌ Not Found');
      if (student) console.log('   Student:', student.name, `(${student.role})`);

      // Step 3: Check enrollment in course_students
      db.get('SELECT * FROM course_students WHERE courseId = ? AND studentId = ?', [courseId, studentId], (err, enrollment) => {
        console.log('📍 Step 3 - Check Enrollment:', err ? '❌ Error' : enrollment ? '✅ Found' : '⚠️ Not Enrolled');
        if (err) console.log('   Error:', err.message);

        // Step 4: Check if materials exist
        db.all('SELECT * FROM course_materials WHERE courseId = ?', [courseId], (err, materials) => {
          console.log('📚 Step 4 - Check Materials:', err ? '❌ Error' : materials ? `✅ Found ${materials.length}` : '❌ None Found');
          if (materials && materials.length > 0) {
            console.log('   First Material:', materials[0].title, `(ID: ${materials[0].id})`);
          }

          // Step 5: Try to mark material as complete
          console.log('\n🔷 Step 5 - Marking Material as Complete...');
          const now = new Date().toISOString();
          
          db.run(
            'INSERT INTO progress (studentId, courseId, contentType, contentId, completed, completedAt) VALUES (?, ?, ?, ?, 1, ?)',
            [studentId, courseId, 'material', materialId, now],
            function(err) {
              if (err) {
                if (err.message.includes('UNIQUE')) {
                  console.log('⚠️  Already marked as complete');
                } else {
                  console.log('❌ Error:', err.message);
                }
              } else {
                console.log('✅ Marked as complete! (ID:', this.lastID + ')');
              }

              // Step 6: Verify the progress was saved
              db.get('SELECT * FROM progress WHERE studentId = ? AND courseId = ? AND contentType = ? AND contentId = ?', 
                [studentId, courseId, 'material', materialId], (err, progress) => {
                console.log('\n✔️  Step 6 - Verify Progress:', err ? '❌ Error' : progress ? '✅ Saved' : '❌ Not Found');
                if (progress) {
                  console.log('   Progress:', { 
                    id: progress.id,
                    completed: progress.completed,
                    completedAt: progress.completedAt 
                  });
                }

                console.log('\n✅ Test Complete!\n');
                process.exit(0);
              });
            }
          );
        });
      });
    });
  });
}, 2000);

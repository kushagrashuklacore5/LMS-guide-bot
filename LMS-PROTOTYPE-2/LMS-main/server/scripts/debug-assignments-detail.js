const db = require('../config/database-switch');

// Wait for DB connection
setTimeout(() => {
  console.log('\n=== Detailed Classroom Analysis ===\n');

  // Get all classrooms that EXIST
  db.all('SELECT id, name, grade FROM classrooms', (err, allClassrooms) => {
    if (err) {
      console.error('Error fetching classrooms:', err);
      process.exit(1);
    }
    
    console.log('All Classrooms that EXIST:');
    allClassrooms.forEach(c => console.log(`  ID ${c.id}: ${c.name} (Grade ${c.grade})`));
    
    // Get all assignments
    db.all('SELECT * FROM student_classroom_assignment', (err, assignments) => {
      if (err) {
        console.error('Error fetching assignments:', err);
        process.exit(1);
      }
      
      console.log(`\nAll Assignments (${assignments.length} total):`);
      assignments.forEach(a => console.log(`  Student ${a.studentId} → Classroom ${a.classroomId}`));
      
      // Find orphaned classroom IDs
      const classroomIds = new Set(allClassrooms.map(c => c.id));
      const assignedClassroomIds = new Set(assignments.map(a => a.classroomId));
      const orphaned = Array.from(assignedClassroomIds).filter(id => !classroomIds.has(id));
      
      if (orphaned.length > 0) {
        console.log(`\n⚠️  ORPHANED classrooms (assigned to students but don't exist):`);
        orphaned.forEach(id => console.log(`  - Classroom ID: ${id}`));
      }
      
      // Check each student's actual classrooms
      db.all('SELECT DISTINCT studentId FROM student_classroom_assignment', (err, studentIds) => {
        console.log('\n--- Per-Student Breakdown ---');
        
        let processed = 0;
        studentIds.forEach(({ studentId }) => {
          db.all('SELECT u.id, u.name, sca.classroomId, c.name as classroomName FROM users u LEFT JOIN student_classroom_assignment sca ON u.id = sca.studentId LEFT JOIN classrooms c ON sca.classroomId = c.id WHERE u.id = ?', [studentId], (err, data) => {
            const uniqueData = data.filter((d, i, arr) => i === 0 || arr[i-1].classroomId !== d.classroomId);
            const student = uniqueData[0];
            console.log(`\nStudent ID ${studentId} (${student.name}):`);
            
            const validAssignments = uniqueData.filter(d => d.classroomName !== null);
            const invalidAssignments = uniqueData.filter(d => d.classroomName === null);
            
            if (validAssignments.length > 0) {
              console.log('  Valid classrooms:');
              validAssignments.forEach(d => console.log(`    - Classroom ${d.classroomId}: ${d.classroomName}`));
            }
            if (invalidAssignments.length > 0) {
              console.log('  ❌ Invalid classrooms (no classroom found):');
              invalidAssignments.forEach(d => console.log(`    - Classroom ${d.classroomId}`));
            }
            
            processed++;
            if (processed === studentIds.length) {
              process.exit(0);
            }
          });
        });
      });
    });
  });
}, 1000);

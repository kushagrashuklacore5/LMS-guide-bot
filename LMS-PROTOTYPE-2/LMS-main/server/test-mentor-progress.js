const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Open database
const dbPath = path.join(__dirname, 'data', 'lms-database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  }
  console.log('✅ Database connected');
  testMentorProgress();
});

function testMentorProgress() {
  const mentorId = 2; // "Mentor User"
  
  console.log('\n📊 Testing Mentor Progress API for Mentor ID 2 ("Mentor User")...\n');
  
  // Get all courses by mentor
  db.all("SELECT * FROM courses WHERE mentorId = ?", [mentorId], (err, courses) => {
    if (err) {
      console.error('❌ Error fetching courses:', err);
      return;
    }

    console.log(`📚 Found ${courses?.length || 0} courses for mentor ${mentorId}`);
    
    if (!courses || courses.length === 0) {
      console.log('⚠️  No courses found');
      db.close();
      return;
    }

    const progressData = [];
    let coursesProcessed = 0;

    courses.forEach(course => {
      console.log(`\n🔍 Processing course: "${course.title}" (ID: ${course.id})`);
      
      // Get students assigned to this course
      db.all(
        "SELECT u.id, u.name, u.email FROM users u JOIN course_students cs ON u.id = cs.studentId WHERE cs.courseId = ? AND u.role = 'student'",
        [course.id],
        (err, students) => {
          if (err) {
            console.error('❌ Error fetching students:', err);
            coursesProcessed++;
            return;
          }

          console.log(`👥 Found ${students?.length || 0} students in course`);

          if (!students || students.length === 0) {
            coursesProcessed++;
            if (coursesProcessed === courses.length) {
              console.log('\n✅ Final Progress Data:');
              console.log(JSON.stringify(progressData, null, 2));
              db.close();
            }
            return;
          }

          let studentsProcessed = 0;

          students.forEach(student => {
            // Get progress for this student in this course
            db.all(
              "SELECT * FROM progress WHERE studentId = ? AND courseId = ?",
              [student.id, course.id],
              (err, progress) => {
                if (err) {
                  console.error(`❌ Error fetching progress for student ${student.name}:`, err);
                  studentsProcessed++;
                } else {
                  // Get total chapters, materials, and assessments
                  db.get("SELECT COUNT(*) as total FROM chapters WHERE courseId = ?", [course.id], (err, chaptersCount) => {
                    const totalChapters = chaptersCount?.total || 0;

                    db.get("SELECT COUNT(*) as total FROM course_materials WHERE courseId = ?", [course.id], (err, materialsCount) => {
                      const totalMaterials = materialsCount?.total || 0;

                      db.get("SELECT COUNT(*) as total FROM assessments WHERE courseId = ?", [course.id], (err, assessmentsCount) => {
                        const totalAssessments = assessmentsCount?.total || 0;

                        // Calculate completion for each content type
                        const completedChapters = (progress || []).filter(p => p.completed && p.contentType === 'chapter').length;
                        const completedMaterials = (progress || []).filter(p => p.completed && p.contentType === 'material').length;
                        const completedAssessments = (progress || []).filter(p => p.completed && p.contentType === 'assessment').length;
                        
                        // Calculate overall completion percentage
                        const totalItems = totalChapters + totalMaterials + totalAssessments;
                        const totalCompleted = completedChapters + completedMaterials + completedAssessments;
                        const completionPercentage = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

                        const studentData = {
                          student: {
                            id: student.id,
                            name: student.name,
                            email: student.email
                          },
                          course: {
                            id: course.id,
                            title: course.title
                          },
                          progress: {
                            completedChapters,
                            totalChapters,
                            completedMaterials,
                            totalMaterials,
                            completedAssessments,
                            totalAssessments,
                            totalItems,
                            totalCompleted,
                            completionPercentage,
                            details: progress || [],
                            progressBreakdown: {
                              chapters: {
                                completed: completedChapters,
                                total: totalChapters,
                                percentage: totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0
                              },
                              materials: {
                                completed: completedMaterials,
                                total: totalMaterials,
                                percentage: totalMaterials > 0 ? Math.round((completedMaterials / totalMaterials) * 100) : 0
                              },
                              assessments: {
                                completed: completedAssessments,
                                total: totalAssessments,
                                percentage: totalAssessments > 0 ? Math.round((completedAssessments / totalAssessments) * 100) : 0
                              }
                            }
                          }
                        };

                        console.log(`📈 Student: ${student.name} | Progress: ${completionPercentage}%`);
                        progressData.push(studentData);

                        studentsProcessed++;
                        if (studentsProcessed === students.length) {
                          coursesProcessed++;
                          if (coursesProcessed === courses.length) {
                            console.log('\n✅ Final Progress Data:');
                            console.log(JSON.stringify(progressData, null, 2));
                            db.close();
                          }
                        }
                      });
                    });
                  });
                }
              }
            );
          });
        }
      );
    });
  });
}

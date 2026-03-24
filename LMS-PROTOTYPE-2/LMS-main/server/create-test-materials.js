const db = require('./config/sqlite-db');

// Wait for DB to initialize
setTimeout(() => {
  console.log('\n📚 Creating Test Materials...\n');

  const courseId = 1;
  const uploadedBy = 2; // Mentor user ID

  // Sample materials to create
  const materials = [
    {
      title: 'Introduction to Programming',
      type: 'video',
      linkUrl: 'https://www.youtube.com/watch?v=...',
      description: 'Learn the basics of programming'
    },
    {
      title: 'Python Fundamentals PDF',
      type: 'pdf',
      linkUrl: 'https://example.com/python-basics.pdf',
      description: 'Complete guide to Python fundamentals'
    },
    {
      title: 'JavaScript Tutorial',
      type: 'video_link',
      linkUrl: 'https://example.com/js-tutorial',
      description: 'Introduction to JavaScript'
    },
    {
      title: 'Data Structures Study Material',
      type: 'pdf_link',
      linkUrl: 'https://example.com/data-structures.pdf',
      description: 'Learn about arrays, lists, trees, and more'
    }
  ];

  console.log(`📝 Inserting ${materials.length} test materials for course ${courseId}...\n`);

  let count = 0;
  materials.forEach((material, index) => {
    const now = new Date().toISOString();
    
    db.run(
      `INSERT INTO course_materials (courseId, title, type, linkUrl, uploadedBy, description, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [courseId, material.title, material.type, material.linkUrl, uploadedBy, material.description, now, now],
      function(err) {
        if (err) {
          console.log(`❌ ${index + 1}. Failed to create "${material.title}":`, err.message);
        } else {
          console.log(`✅ ${index + 1}. Created "${material.title}" (ID: ${this.lastID})`);
          count++;
        }

        if (count + (materials.length - count) === materials.length && index === materials.length - 1) {
          // All done
          setTimeout(() => {
            console.log(`\n📊 Summary: Created ${count}/${materials.length} materials`);
            console.log('💡 Students can now mark these materials as complete!\n');
            process.exit(0);
          }, 100);
        }
      }
    );
  });
}, 2000);

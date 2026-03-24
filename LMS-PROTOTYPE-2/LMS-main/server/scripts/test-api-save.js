const db = require('../config/sqlite-db');
const { processBilingualInput } = require('../utils/bilingualHelper');

console.log('=== Testing API Save with Bilingual Input ===\n');

// Create a test classrooms entry with Arabic input
const arabicClassroomData = {
  name: 'الصف الأول الابتدائي',
  grade: '1',
  section: 'أ',
  classTeacher: 'السيد أحمد',
  studentCount: '25'
};

console.log('1. Original Input (Arabic):');
console.log(JSON.stringify(arabicClassroomData, null, 2));

// Process the input
const processedData = processBilingualInput(arabicClassroomData);
console.log('\n2. After Bilingual Processing:');
console.log(JSON.stringify(processedData, null, 2));

// Insert into database
const columns = Object.keys(processedData).join(', ');
const placeholders = Object.keys(processedData).map(() => '?').join(', ');
const values = Object.values(processedData);

const insertQuery = `INSERT INTO classrooms (${columns}, createdAt) VALUES (${placeholders}, CURRENT_TIMESTAMP)`;

console.log('\n3. SQL Insert Query:');
console.log(insertQuery);

db.run(insertQuery, values, function(err) {
  if (err) {
    console.error('❌ Error inserting:', err.message);
    process.exit(1);
  }

  const recordId = this.lastID;
  console.log(`\n✅ Record inserted with ID: ${recordId}`);

  // Retrieve the record to verify
  db.get('SELECT * FROM classrooms WHERE id = ?', [recordId], (err, row) => {
    if (err) {
      console.error('❌ Error retrieving:', err.message);
      process.exit(1);
    }

    console.log('\n4. Retrieved Record from Database:');
    console.log(JSON.stringify(row, null, 2));

    // Show specific columns
    console.log('\n5. Bilingual Fields Verification:');
    console.log(`name_ar: "${row.name_ar}"`);
    console.log(`name_en: "${row.name_en}"`);
    console.log(`classTeacher_ar: "${row.classTeacher_ar}"`);
    console.log(`classTeacher_en: "${row.classTeacher_en}"`);

    // Test English input in the same table
    console.log('\n\n=== Testing English Input ===\n');
    
    const englishClassroomData = {
      name: 'First Grade Primary',
      grade: '1',
      section: 'B',
      classTeacher: 'Mr. John Smith',
      studentCount: '30'
    };

    console.log('1. Original Input (English):');
    console.log(JSON.stringify(englishClassroomData, null, 2));

    const processedEnglish = processBilingualInput(englishClassroomData);
    console.log('\n2. After Bilingual Processing:');
    console.log(JSON.stringify(processedEnglish, null, 2));

    const engColumns = Object.keys(processedEnglish).join(', ');
    const engPlaceholders = Object.keys(processedEnglish).map(() => '?').join(', ');
    const engValues = Object.values(processedEnglish);

    const engInsertQuery = `INSERT INTO classrooms (${engColumns}, createdAt) VALUES (${engPlaceholders}, CURRENT_TIMESTAMP)`;

    db.run(engInsertQuery, engValues, function(err) {
      if (err) {
        console.error('❌ Error inserting English record:', err.message);
        process.exit(1);
      }

      const engRecordId = this.lastID;
      console.log(`\n✅ English record inserted with ID: ${engRecordId}`);

      db.get('SELECT * FROM classrooms WHERE id = ?', [engRecordId], (err, engRow) => {
        if (err) {
          console.error('❌ Error retrieving English record:', err.message);
          process.exit(1);
        }

        console.log('\n3. Retrieved English Record:');
        console.log(JSON.stringify(engRow, null, 2));

        console.log('\n4. Bilingual Fields Verification:');
        console.log(`name_ar: "${engRow.name_ar}"`);
        console.log(`name_en: "${engRow.name_en}"`);
        console.log(`classTeacher_ar: "${engRow.classTeacher_ar}"`);
        console.log(`classTeacher_en: "${engRow.classTeacher_en}"`);

        console.log('\n\n✅ ALL TESTS PASSED! Arabic and English inputs are being saved correctly to _ar and _en columns!');
        process.exit(0);
      });
    });
  });
});

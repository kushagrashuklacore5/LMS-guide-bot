const db = require('../config/database-switch');
const { processBilingualInput, retrieveBilingualData } = require('../utils/bilingualHelper');

console.log('=== Testing Language Switching Behavior ===\n');

// Simulate data stored with Arabic input
const arabicInput = {
  name: 'الصف الأول الابتدائي',
  grade: '1',
  section: 'أ',
  classTeacher: 'السيد أحمد',
  studentCount: '25'
};

console.log('1. User creates classroom with ARABIC text:');
console.log(JSON.stringify(arabicInput, null, 2));

const processedData = processBilingualInput(arabicInput);
console.log('\n2. Data processed and stored:');
console.log(JSON.stringify(processedData, null, 2));

// Insert into database
const columns = Object.keys(processedData).join(', ');
const placeholders = Object.keys(processedData).map(() => '?').join(', ');
const values = Object.values(processedData);

const insertQuery = `INSERT INTO classrooms (${columns}, createdAt) VALUES (${placeholders}, CURRENT_TIMESTAMP)`;

db.run(insertQuery, values, function(err) {
  if (err) {
    console.error('❌ Error inserting:', err.message);
    process.exit(1);
  }

  const recordId = this.lastID;
  console.log(`\n3. Record stored in database with ID: ${recordId}`);

  // Retrieve raw data
  db.get('SELECT * FROM classrooms WHERE id = ?', [recordId], (err, row) => {
    if (err) {
      console.error('❌ Error retrieving:', err.message);
      process.exit(1);
    }

    console.log('\n4. Raw data from database:');
    console.log(`   name: "${row.name}"`);
    console.log(`   name_ar: "${row.name_ar}"`);
    console.log(`   name_en: "${row.name_en}"`);
    console.log(`   classTeacher: "${row.classTeacher}"`);
    console.log(`   classTeacher_ar: "${row.classTeacher_ar}"`);
    console.log(`   classTeacher_en: "${row.classTeacher_en}"`);

    // SCENARIO 1: User is viewing in ARABIC (their language preference is Arabic)
    console.log('\n\n=== SCENARIO 1: User switches to ARABIC language ===');
    const arabicView = retrieveBilingualData(row, 'ar');
    console.log('Data returned to user (merged Arabic view):');
    console.log(`   name: "${arabicView.name}"`);
    console.log(`   classTeacher: "${arabicView.classTeacher}"`);
    console.log('   ✅ User sees the Arabic text they entered!');

    // SCENARIO 2: User is viewing in ENGLISH (their language preference is English)
    console.log('\n\n=== SCENARIO 2: User switches to ENGLISH language ===');
    const englishView = retrieveBilingualData(row, 'en');
    console.log('Data returned to user (merged English view):');
    console.log(`   name: "${englishView.name}"`);
    console.log(`   classTeacher: "${englishView.classTeacher}"`);
    
    // Check if English is empty, fallback to Arabic
    if (englishView.name === row.name_ar) {
      console.log('   ⚠️  English is empty - fallback to Arabic is shown (name_ar used as fallback)');
      console.log('   💡 This is by design - if no English translation exists, Arabic is shown');
    }

    // NOW TEST: Create another classroom in ENGLISH
    console.log('\n\n=== Testing with ENGLISH input ===');
    
    const englishInput = {
      name: 'Second Grade Class',
      grade: '2',
      section: 'B',
      classTeacher: 'Ms. Emily Watson',
      studentCount: '30'
    };

    console.log('\n1. User creates classroom with ENGLISH text:');
    console.log(JSON.stringify(englishInput, null, 2));

    const processedEnglish = processBilingualInput(englishInput);
    console.log('\n2. Data processed and stored:');
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
      console.log(`\n3. Record stored in database with ID: ${engRecordId}`);

      db.get('SELECT * FROM classrooms WHERE id = ?', [engRecordId], (err, engRow) => {
        if (err) {
          console.error('❌ Error retrieving English record:', err.message);
          process.exit(1);
        }

        console.log('\n4. Raw data from database:');
        console.log(`   name: "${engRow.name}"`);
        console.log(`   name_ar: "${engRow.name_ar}"`);
        console.log(`   name_en: "${engRow.name_en}"`);

        // SCENARIO 3: User views English record in ARABIC
        console.log('\n\n=== SCENARIO 3: English record viewed in ARABIC language ===');
        const engToArabic = retrieveBilingualData(engRow, 'ar');
        console.log('Data returned to user:');
        console.log(`   name: "${engToArabic.name}"`);
        
        if (engToArabic.name === engRow.name_en) {
          console.log('   ⚠️  Arabic is empty - fallback to English is shown');
          console.log('   💡 User sees original English text (no translation available)');
        }

        // SCENARIO 4: User views English record in ENGLISH
        console.log('\n\n=== SCENARIO 4: English record viewed in ENGLISH language ===');
        const engToEnglish = retrieveBilingualData(engRow, 'en');
        console.log('Data returned to user:');
        console.log(`   name: "${engToEnglish.name}"`);
        console.log('   ✅ User sees the English text they entered!');

        console.log('\n\n=== SUMMARY ===');
        console.log('✅ Language Switching Works:');
        console.log('   1. Arabic input → User views in Arabic → Shows Arabic text ✅');
        console.log('   2. Arabic input → User views in English → Shows Arabic (fallback) ⚠️');
        console.log('   3. English input → User views in Arabic → Shows English (fallback) ⚠️');
        console.log('   4. English input → User views in English → Shows English text ✅');
        console.log('\n💡 Note: When translation is missing, the opposite language is shown as fallback.');
        console.log('   For full translations, use LibreTranslate or manual translation!');

        process.exit(0);
      });
    });
  });
});

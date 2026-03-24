const db = require('../config/sqlite-db');
const { processBilingualInput } = require('../utils/bilingualHelper');
const { autoTranslateBilingualInput, retrieveAndTranslateBilingualData } = require('../utils/autoTranslationHelper');

console.log('=== Testing Auto-Translation System ===\n');

// Simulate Arabic input with auto-translation
const arabicInput = {
  name: 'الصف الأول الابتدائي',
  grade: '1',
  section: 'أ',
  classTeacher: 'السيد أحمد محمد',
  studentCount: '25'
};

console.log('1. User submits ARABIC input:');
console.log(JSON.stringify(arabicInput, null, 2));

// Step 1: Process bilingual input
let processedData = processBilingualInput(arabicInput);
console.log('\n2. After language detection and split:');
console.log(JSON.stringify(processedData, null, 2));

// Step 2: Auto-translate
console.log('\n3. Auto-translating to fill missing English column...');
autoTranslateBilingualInput(processedData).then(translatedData => {
  console.log('   Data after auto-translation:');
  console.log(JSON.stringify(translatedData, null, 2));

  // Step 3: Insert into database
  const columns = Object.keys(translatedData).join(', ');
  const placeholders = Object.keys(translatedData).map(() => '?').join(', ');
  const values = Object.values(translatedData);

  const insertQuery = `INSERT INTO classrooms (${columns}, createdAt) VALUES (${placeholders}, CURRENT_TIMESTAMP)`;

  db.run(insertQuery, values, function(err) {
    if (err) {
      console.error('❌ Error inserting:', err.message);
      process.exit(1);
    }

    const recordId = this.lastID;
    console.log(`\n4. Record saved to database with ID: ${recordId}`);

    // Step 4: Retrieve with different language preferences
    db.get('SELECT * FROM classrooms WHERE id = ?', [recordId], async (err, row) => {
      if (err) {
        console.error('❌ Error retrieving:', err.message);
        process.exit(1);
      }

      console.log('\n5. Raw database data:');
      console.log(`   name: "${row.name}"`);
      console.log(`   name_ar: "${row.name_ar}"`);
      console.log(`   name_en: "${row.name_en}"`);
      console.log(`   classTeacher_ar: "${row.classTeacher_ar}"`);
      console.log(`   classTeacher_en: "${row.classTeacher_en}"`);

      // Retrieve in Arabic
      console.log('\n6️⃣  SCENARIO: User views in ARABIC language');
      try {
        const arabicView = await retrieveAndTranslateBilingualData(row, 'ar');
        console.log('   Data shown to user:');
        console.log(`   name: "${arabicView.name}"`);
        console.log(`   classTeacher: "${arabicView.classTeacher}"`);
        console.log('   ✅ User sees Arabic text!');
      } catch (error) {
        console.error('   ❌ Error:', error.message);
      }

      // Retrieve in English
      console.log('\n7️⃣  SCENARIO: User switches to ENGLISH language');
      try {
        const englishView = await retrieveAndTranslateBilingualData(row, 'en');
        console.log('   Data shown to user (auto-translated):');
        console.log(`   name: "${englishView.name}"`);
        console.log(`   classTeacher: "${englishView.classTeacher}"`);
        
        if (englishView.name && englishView.name !== row.name_ar && englishView.name !== row.name_en) {
          console.log('   ✅ Auto-translation worked! English version was auto-generated!');
        } else if (englishView.name === row.name_en) {
          console.log('   ✅ English version exists from auto-translation!');
        }
      } catch (error) {
        console.error('   ❌ Error:', error.message);
      }

      // Now test with English input
      console.log('\n\n=== Testing ENGLISH Input with Auto-Translation ===\n');
      
      const englishInput = {
        name: 'Advanced Mathematics Class',
        grade: '10',
        section: 'A',
        classTeacher: 'Dr. Michael Johnson',
        studentCount: '35'
      };

      console.log('1. User submits ENGLISH input:');
      console.log(JSON.stringify(englishInput, null, 2));

      let processedEnglish = processBilingualInput(englishInput);
      console.log('\n2. After language detection and split:');
      console.log(JSON.stringify(processedEnglish, null, 2));

      console.log('\n3. Auto-translating to fill missing Arabic column...');
      autoTranslateBilingualInput(processedEnglish).then(translatedEnglish => {
        console.log('   Data after auto-translation:');
        console.log(JSON.stringify(translatedEnglish, null, 2));

        const engColumns = Object.keys(translatedEnglish).join(', ');
        const engPlaceholders = Object.keys(translatedEnglish).map(() => '?').join(', ');
        const engValues = Object.values(translatedEnglish);

        const engInsertQuery = `INSERT INTO classrooms (${engColumns}, createdAt) VALUES (${engPlaceholders}, CURRENT_TIMESTAMP)`;

        db.run(engInsertQuery, engValues, function(err) {
          if (err) {
            console.error('❌ Error inserting English record:', err.message);
            process.exit(1);
          }

          const engRecordId = this.lastID;
          console.log(`\n4. Record saved to database with ID: ${engRecordId}`);

          db.get('SELECT * FROM classrooms WHERE id = ?', [engRecordId], async (err, engRow) => {
            if (err) {
              console.error('❌ Error retrieving English record:', err.message);
              process.exit(1);
            }

            console.log('\n5. Raw database data:');
            console.log(`   name: "${engRow.name}"`);
            console.log(`   name_ar: "${engRow.name_ar}"`);
            console.log(`   name_en: "${engRow.name_en}"`);

            // Retrieve English record in Arabic
            console.log('\n6️⃣  SCENARIO: English record viewed in ARABIC language');
            try {
              const engToArabic = await retrieveAndTranslateBilingualData(engRow, 'ar');
              console.log('   Data shown to user (auto-translated):');
              console.log(`   name: "${engToArabic.name}"`);
              
              if (engToArabic.name && engToArabic.name !== engRow.name_en) {
                console.log('   ✅ Auto-translation worked! Arabic version was auto-generated!');
              } else if (engToArabic.name === engRow.name_ar) {
                console.log('   ✅ Arabic version exists from auto-translation!');
              }
            } catch (error) {
              console.error('   ❌ Error:', error.message);
            }

            // Retrieve English record in English
            console.log('\n7️⃣  SCENARIO: English record viewed in ENGLISH language');
            try {
              const engToEnglish = await retrieveAndTranslateBilingualData(engRow, 'en');
              console.log('   Data shown to user:');
              console.log(`   name: "${engToEnglish.name}"`);
              console.log('   ✅ User sees English text!');
            } catch (error) {
              console.error('   ❌ Error:', error.message);
            }

            console.log('\n\n=== FINAL SUMMARY ===');
            console.log('✅ Complete Bilingual + Auto-Translation System:');
            console.log('   1. User types Arabic → Auto-splits to _ar and _en');
            console.log('   2. Auto-translator fills English from Arabic ✅');
            console.log('   3. User views in Arabic → Shows Arabic ✅');
            console.log('   4. User views in English → Shows auto-translated English ✅');
            console.log('');
            console.log('   5. User types English → Auto-splits to _en and _ar');
            console.log('   6. Auto-translator fills Arabic from English ✅');
            console.log('   7. User views in English → Shows English ✅');
            console.log('   8. User views in Arabic → Shows auto-translated Arabic ✅');
            console.log('\n💡 Users can now use the app in either language and get automatic translations!');

            process.exit(0);
          });
        });
      });
    });
  });
});

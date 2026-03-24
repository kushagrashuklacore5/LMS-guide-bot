const { processBilingualInput, detectLanguage, isArabic, isEnglish } = require('../utils/bilingualHelper');

console.log('=== Testing Language Detection ===\n');

// Test 1: Detect Arabic
const arabicText = 'مرحبا بك في نظام إدارة التعليم';
console.log(`Text: "${arabicText}"`);
console.log(`isArabic: ${isArabic(arabicText)}`);
console.log(`isEnglish: ${isEnglish(arabicText)}`);
console.log(`detectLanguage: ${detectLanguage(arabicText)}\n`);

// Test 2: Detect English
const englishText = 'Welcome to the Learning Management System';
console.log(`Text: "${englishText}"`);
console.log(`isArabic: ${isArabic(englishText)}`);
console.log(`isEnglish: ${isEnglish(englishText)}`);
console.log(`detectLanguage: ${detectLanguage(englishText)}\n`);

// Test 3: Detect Mixed
const mixedText = 'مرحبا Welcome in the System';
console.log(`Text: "${mixedText}"`);
console.log(`isArabic: ${isArabic(mixedText)}`);
console.log(`isEnglish: ${isEnglish(mixedText)}`);
console.log(`detectLanguage: ${detectLanguage(mixedText)}\n`);

console.log('=== Testing Bilingual Input Processing ===\n');

// Test 4: Process Arabic student creation
const arabicStudentInput = {
  name: 'أحمد محمد علي',
  email: 'ahmed@example.com',
  phone: '03334445555',
  description: 'طالب متفوق جداً'
};

console.log('Input (Arabic):');
console.log(JSON.stringify(arabicStudentInput, null, 2));
const processedArabic = processBilingualInput(arabicStudentInput);
console.log('\nProcessed Output:');
console.log(JSON.stringify(processedArabic, null, 2));

// Test 5: Process English student creation
const englishStudentInput = {
  name: 'John Smith',
  email: 'john@example.com',
  phone: '1234567890',
  description: 'Excellent student with good grades'
};

console.log('\n\nInput (English):');
console.log(JSON.stringify(englishStudentInput, null, 2));
const processedEnglish = processBilingualInput(englishStudentInput);
console.log('\nProcessed Output:');
console.log(JSON.stringify(processedEnglish, null, 2));

// Test 6: Process Classroom creation with Arabic
const classroomInput = {
  className: 'صف الأول الابتدائي',
  description: 'فصل الصف الأول',
  grade: '1',
  section: 'A'
};

console.log('\n\nInput (Classroom - Arabic):');
console.log(JSON.stringify(classroomInput, null, 2));
const processedClassroom = processBilingualInput(classroomInput);
console.log('\nProcessed Output:');
console.log(JSON.stringify(processedClassroom, null, 2));

console.log('\n✅ All tests completed!');

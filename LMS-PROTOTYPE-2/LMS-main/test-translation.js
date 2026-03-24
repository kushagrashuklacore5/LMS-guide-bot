// Test the translation API directly
const testTranslation = async () => {
  try {
    console.log('🔥 Testing translation API...');
    
    const response = await fetch('http://localhost:5002/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Sign In',
        sourceLanguage: 'en',
        targetLanguage: 'es'
      }),
    });

    const data = await response.json();
    console.log('✅ Translation result:', data);
    
    if (data.success) {
      console.log(`🎉 Translation successful: "Sign In" -> "${data.translatedText}"`);
    } else {
      console.error('❌ Translation failed:', data);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error);
  }
};

// Auto-run the test
testTranslation();

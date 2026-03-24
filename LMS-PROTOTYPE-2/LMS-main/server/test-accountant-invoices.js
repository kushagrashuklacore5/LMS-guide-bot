const fetch = require('node-fetch');

async function testAccountantInvoices() {
  console.log('🔍 Testing Accountant Vendor Invoices API...');
  
  // Test API endpoint (replace with actual API URL and token)
  const API = 'http://localhost:5000/api';
  const token = 'test-token'; // Replace with actual token
  
  try {
    console.log('📡 Fetching vendor invoices...');
    
    const response = await fetch(`${API}/accountant/vendor-invoices`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📡 Response Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response:', data);
      
      if (data.success && data.data) {
        console.log(`📋 Found ${data.data.length} invoices`);
        data.data.forEach((invoice, index) => {
          console.log(`  ${index + 1}. ${invoice.invoiceNumber} - ${invoice.vendorName} - ₹${invoice.amount} - ${invoice.status}`);
        });
      }
    } else {
      const errorText = await response.text();
      console.log('❌ API Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

testAccountantInvoices();

// Test the ErrorBoundary fix
console.log('Testing ErrorBoundary with VendorStock...');

try {
  // Test if the ErrorBoundary component can be imported
  const VendorStockFile = require('./vendor/VendorStock.jsx');
  console.log('VendorStock file loaded successfully');
  
  // Check if ErrorBoundary is exported
  if (typeof VendorStockFile.ErrorBoundary === 'function') {
    console.log('ErrorBoundary function found:', typeof VendorStockFile.ErrorBoundary);
  } else {
    console.log('ErrorBoundary function not found in VendorStock.jsx');
  }
  
  // Test if React can be imported
  const React = require('react');
  console.log('React imported successfully:', typeof React);
  
  console.log('ErrorBoundary fix test completed');
  
} catch (error) {
  console.error('Test failed:', error.message);
}

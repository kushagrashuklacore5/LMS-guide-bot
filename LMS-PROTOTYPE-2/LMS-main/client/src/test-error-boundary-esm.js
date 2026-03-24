// Test the ErrorBoundary fix using ES module import
console.log('Testing ErrorBoundary with VendorStock...');

try {
  // Test if the ErrorBoundary component can be imported
  import VendorStockFile from './vendor/VendorStock.jsx';
  console.log('VendorStock file loaded successfully');
  
  // Check if ErrorBoundary is exported
  if (typeof VendorStockFile.ErrorBoundary === 'function') {
    console.log('ErrorBoundary function found:', typeof VendorStockFile.ErrorBoundary);
  } else {
    console.log('ErrorBoundary function not found in VendorStock.jsx');
  }
  
  console.log('ErrorBoundary fix test completed');
  
} catch (error) {
  console.error('Test failed:', error.message);
}

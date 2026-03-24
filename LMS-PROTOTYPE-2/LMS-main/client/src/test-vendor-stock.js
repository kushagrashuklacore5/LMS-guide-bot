// Simple test to check VendorStock component
import React from 'react';

console.log('Testing VendorStock component import...');

// Test 1: Basic component render
const TestComponent = () => {
  return React.createElement('div', null, 'Test Component Working');
};

// Test 2: Try to render the actual VendorStock component
try {
  const VendorStockComponent = require('./vendor/VendorStock.jsx').default;
  console.log('VendorStock component loaded successfully');
  
  // Test rendering
  const element = React.createElement(VendorStockComponent, null, null);
  console.log('Component element created:', element);
  
} catch (error) {
  console.error('Error loading VendorStock component:', error.message);
}

console.log('Test completed');

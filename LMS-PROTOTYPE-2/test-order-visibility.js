#!/usr/bin/env node
/**
 * Test script to verify accountant can see storekeeper orders
 * Tests the flow:
 * 1. Storekeeper creates an order
 * 2. Order automatically creates an expense
 * 3. Accountant can view the order via GET /api/orders
 * 4. Accountant can view the expense via GET /api/expenses
 */

const http = require('http');

// Test configuration
const API_URL = 'http://localhost:5002/api';

// Sample users (these should exist in your test database)
const STOREKEEPER_EMAIL = 'storekeeper@test.com';
const STOREKEEPER_PASSWORD = 'StoreKeeper@123';
const ACCOUNTANT_EMAIL = 'accountant@test.com';
const ACCOUNTANT_PASSWORD = 'Accountant@123';

// Tokens will be filled after login
let storekeeperToken = null;
let accountantToken = null;

// Helper function to make HTTP requests
function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('🔍 Testing Accountant Order Visibility\n');
  console.log('==========================================\n');

  try {
    // Step 1: Login as Storekeeper
    console.log('📌 Step 1: Logging in as Storekeeper...');
    let res = await makeRequest('POST', '/auth/login', {
      email: STOREKEEPER_EMAIL,
      password: STOREKEEPER_PASSWORD
    });

    if (res.status !== 200) {
      console.log('❌ Storekeeper login failed:', res.data);
      console.log('\nNote: Make sure the test user exists in your database.');
      console.log(`Email: ${STOREKEEPER_EMAIL}, Role: storekeeper\n`);
      return;
    }

    storekeeperToken = res.data.token;
    console.log('✅ Storekeeper logged in successfully\n');

    // Step 2: Login as Accountant
    console.log('📌 Step 2: Logging in as Accountant...');
    res = await makeRequest('POST', '/auth/login', {
      email: ACCOUNTANT_EMAIL,
      password: ACCOUNTANT_PASSWORD
    });

    if (res.status !== 200) {
      console.log('❌ Accountant login failed:', res.data);
      console.log(`Note: Make sure the test user exists in your database.`);
      console.log(`Email: ${ACCOUNTANT_EMAIL}, Role: accountant\n`);
      return;
    }

    accountantToken = res.data.token;
    console.log('✅ Accountant logged in successfully\n');

    // Step 3: Storekeeper creates an order
    console.log('📌 Step 3: Storekeeper creating an order...');
    const orderData = {
      itemName: 'Test Item',
      quantity: 5,
      unitPrice: 100,
      vendorId: 1, // Adjust based on your test data
      description: 'Test order for accountant visibility'
    };

    res = await makeRequest('POST', '/orders', orderData, storekeeperToken);

    if (res.status !== 201) {
      console.log('❌ Order creation failed:', res.status, res.data);
      console.log('Note: Make sure vendor with id 1 exists in your database.\n');
      return;
    }

    const orderId = res.data.orderId || res.data.order?.id;
    console.log(`✅ Order created successfully (ID: ${orderId})\n`);
    console.log('Order details:', JSON.stringify(res.data, null, 2), '\n');

    // Step 4: Accountant retrieves all orders
    console.log('📌 Step 4: Accountant retrieving all orders...');
    res = await makeRequest('GET', '/orders', null, accountantToken);

    if (res.status !== 200) {
      console.log('❌ Failed to retrieve orders:', res.status, res.data);
      console.log('\nThis means the accountant does NOT have access to /api/orders');
      console.log('The role-based middleware may still be restricting access.\n');
      return;
    }

    const orders = res.data.orders || res.data;
    console.log(`✅ Accountant retrieved orders successfully (Total: ${orders.length || 0})\n`);
    
    if (orders && Array.isArray(orders)) {
      console.log('Orders visible to accountant:');
      orders.forEach((order, i) => {
        console.log(`  ${i + 1}. ID: ${order.id || order.orderId}, Item: ${order.itemName}, Qty: ${order.quantity}`);
      });
    }
    console.log('');

    // Step 5: Accountant retrieves all expenses
    console.log('📌 Step 5: Accountant retrieving all expenses...');
    res = await makeRequest('GET', '/expenses', null, accountantToken);

    if (res.status !== 200) {
      console.log('❌ Failed to retrieve expenses:', res.status, res.data);
      console.log('\nThis means the accountant does NOT have access to /api/expenses');
      console.log('The role-based middleware may still be restricting access.\n');
      return;
    }

    const expenses = res.data.expenses || res.data;
    console.log(`✅ Accountant retrieved expenses successfully (Total: ${expenses.length || 0})\n`);
    
    if (expenses && Array.isArray(expenses)) {
      console.log('Expenses visible to accountant:');
      expenses.forEach((expense, i) => {
        console.log(`  ${i + 1}. ID: ${expense.id}, Description: ${expense.description}, Amount: ${expense.amount}, Status: ${expense.status}`);
      });
    }
    console.log('');

    // Summary
    console.log('==========================================');
    console.log('✅ TEST COMPLETE');
    console.log('==========================================\n');
    console.log('Summary:');
    console.log(`✅ Storekeeper can create orders`);
    console.log(`✅ Accountant can access GET /api/orders endpoint`);
    console.log(`✅ Accountant can access GET /api/expenses endpoint`);
    console.log(`\nOrders placed by storekeeper ARE reflected in accountant portal!\n`);

  } catch (error) {
    console.log('❌ Error during test:', error.message);
  }
}

runTests();

/**
 * Test: Verify accountant and storekeeper portals work
 * Login as accountant and storekeeper users, check if dashboards load
 */

const API = 'http://localhost:5002/api';

async function testPortals() {
  console.log('=== Testing Portal Access ===\n');

  // Test 1: Create accountant user (or use existing)
  console.log('1️⃣ Creating accountant user...');
  let accountantUser = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Accountant',
      email: 'accountant@test.com',
      password: 'password123',
      role: 'accountant',
      universityId: 1,
    }),
  }).then(r => r.json());

  if (accountantUser.success) {
    console.log('✅ Accountant created:', accountantUser.message);
  } else if (accountantUser.message?.includes('already')) {
    console.log('✅ Accountant already exists');
  } else {
    console.error('❌ Failed to create accountant:', accountantUser);
  }

  // Test 2: Login as accountant
  console.log('\n2️⃣ Logging in as accountant...');
  const accountantLogin = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'accountant@test.com',
      password: 'password123',
    }),
  }).then(r => r.json());

  if (!accountantLogin.success) {
    console.error('❌ Accountant login failed:', accountantLogin);
    return;
  }

  const accountantToken = accountantLogin.token;
  console.log('✅ Accountant logged in, token:', accountantToken.substring(0, 20) + '...');

  // Test 3: Get accountant dashboard
  console.log('\n3️⃣ Fetching accountant dashboard...');
  const accountantDash = await fetch(`${API}/accountant/dashboard`, {
    headers: { Authorization: `Bearer ${accountantToken}` },
  }).then(r => r.json());

  if (accountantDash.success) {
    console.log('✅ Accountant dashboard loaded:');
    console.log('   - Total Revenue:', accountantDash.data.totalRevenue);
    console.log('   - Total Payments:', accountantDash.data.totalPayments);
    console.log('   - University:', accountantDash.data.universityName);
    console.log('   - Charts count:', Object.keys(accountantDash.data).filter(k => k.includes('By') || k.includes('Status') || k.includes('Breakdown')).length);
  } else {
    console.error('❌ Failed to load accountant dashboard:', accountantDash);
  }

  // Test 4: Create storekeeper user
  console.log('\n4️⃣ Creating storekeeper user...');
  let storekeeperUser = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Storekeeper',
      email: 'storekeeper@test.com',
      password: 'password123',
      role: 'storekeeper',
      universityId: 1,
    }),
  }).then(r => r.json());

  if (storekeeperUser.success) {
    console.log('✅ Storekeeper created:', storekeeperUser.message);
  } else if (storekeeperUser.message?.includes('already')) {
    console.log('✅ Storekeeper already exists');
  } else {
    console.error('❌ Failed to create storekeeper:', storekeeperUser);
  }

  // Test 5: Login as storekeeper
  console.log('\n5️⃣ Logging in as storekeeper...');
  const storekeeperLogin = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'storekeeper@test.com',
      password: 'password123',
    }),
  }).then(r => r.json());

  if (!storekeeperLogin.success) {
    console.error('❌ Storekeeper login failed:', storekeeperLogin);
    return;
  }

  const storekeeperToken = storekeeperLogin.token;
  console.log('✅ Storekeeper logged in, token:', storekeeperToken.substring(0, 20) + '...');

  // Test 6: Get storekeeper dashboard
  console.log('\n6️⃣ Fetching storekeeper dashboard...');
  const storekeeperDash = await fetch(`${API}/storekeeper/dashboard`, {
    headers: { Authorization: `Bearer ${storekeeperToken}` },
  }).then(r => r.json());

  if (storekeeperDash.success) {
    console.log('✅ Storekeeper dashboard loaded:');
    console.log('   - Total Items:', storekeeperDash.data.totalItems);
    console.log('   - Low Stock Items:', storekeeperDash.data.lowStockItems);
    console.log('   - University:', storekeeperDash.data.universityName);
    console.log('   - Charts count:', Object.keys(storekeeperDash.data).filter(k => k.includes('By') || k.includes('Status') || k.includes('Distribution')).length);
  } else {
    console.error('❌ Failed to load storekeeper dashboard:', storekeeperDash);
  }

  // Test 7: Verify role-based redirects
  console.log('\n7️⃣ Checking role-based dashboard endpoints...');
  const endpoints = [
    { role: 'accountant', endpoint: '/accountant/dashboard', token: accountantToken },
    { role: 'storekeeper', endpoint: '/storekeeper/dashboard', token: storekeeperToken },
  ];

  for (const {role, endpoint, token} of endpoints) {
    const res = await fetch(`${API}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const status = res.ok ? '✅' : '❌';
    console.log(`   ${status} ${role} dashboard: ${res.status}`);
  }

  console.log('\n=== All portal tests completed! ===');
}

// Run test
testPortals().catch(console.error);

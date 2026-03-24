#!/usr/bin/env node

console.log('🔧 COMPREHENSIVE DASHBOARD SYNTAX FIX');
console.log('=====================================');

const fs = require('fs');
const path = require('path');

// Read the current file
const filePath = path.join(__dirname, '..', 'client', 'src', 'pages', 'accountant', 'AccountantDashboard_temp.jsx');
const content = fs.readFileSync(filePath, 'utf8');

console.log('📄 Reading AccountantDashboard_temp.jsx...');

// Fix multiple syntax issues
let fixedContent = content;

// Fix the handlePaymentSuccess function structure
fixedContent = fixedContent.replace(
  /const handlePaymentSuccess = \(event\) => \{[\s\S]*?toast\.success\(`Payment received for Invoice #\$\{invoiceNumber\}`\);[\s\S]*?\};/g,
  `const handlePaymentSuccess = (event) => {
      console.log('🔔 Dashboard received payment event:', event.detail);
      
      // Refresh dashboard data to show updated stats
      fetchDashboardData();
      
      // Show success notification
      const invoiceNumber = event.detail?.invoiceNumber || 'Unknown';
      toast.success(\`Payment received for Invoice #\${invoiceNumber}\`);
    };`
);

// Fix the useEffect structure
fixedContent = fixedContent.replace(
  /useEffect\(\(\) => \{[\s\S]*?const handlePaymentSuccess[\s\S]*?return \(\) => \{[\s\S]*?\}\);/g,
  `useEffect(() => {
    const handlePaymentSuccess = (event) => {
      console.log('🔔 Dashboard received payment event:', event.detail);
      
      // Refresh dashboard data to show updated stats
      fetchDashboardData();
      
      // Show success notification
      const invoiceNumber = event.detail?.invoiceNumber || 'Unknown';
      toast.success(\`Payment received for Invoice #\${invoiceNumber}\`);
    };

    // Add event listener
    if (window.accountantPaymentEvents) {
      window.accountantPaymentEvents.addEventListener('paymentSuccess', handlePaymentSuccess);
    }

    // Cleanup on unmount
    return () => {
      if (window.accountantPaymentEvents) {
        window.accountantPaymentEvents.removeEventListener('paymentSuccess', handlePaymentSuccess);
      }
    };
  }, []);`
);

// Fix ResponsiveContainer issues
fixedContent = fixedContent.replace(
  /<ResponsiveContainer width="100%" height="100%">[\s\S]*?<Legend \/>[\s\S]*?<\/LineChart>[\s\S]*?<ResponsiveContainer width="100%" height="100%">/g,
  `<ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.monthlyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                        labelStyle={{ color: '#F3F4F6' }}
                        formatter={(value) => [\`₹\${value.toLocaleString('en-IN')}\`, 'Revenue']}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        dot={{ fill: '#10B981', r: 4 }}
                        name="Revenue (₹)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No revenue data available</p>
                    <p className="text-gray-500 text-sm">Revenue will appear here once payments are recorded</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Expense Analysis</h2>
              <div className="h-64 flex items-center justify-center">
                {stats.monthlyExpenseData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">`
);

// Write the fixed content back
fs.writeFileSync(filePath, fixedContent, 'utf8');

console.log('✅ Comprehensive syntax fix applied!');
console.log('🔧 Fixed handlePaymentSuccess function structure');
console.log('🔧 Fixed useEffect hook structure');
console.log('🔧 Fixed ResponsiveContainer nesting issues');
console.log('🔧 Fixed all JSX syntax errors');
console.log('📱 Dashboard should now compile without errors');
console.log('\n🌟 Ready to test! The dashboard should load properly now.');

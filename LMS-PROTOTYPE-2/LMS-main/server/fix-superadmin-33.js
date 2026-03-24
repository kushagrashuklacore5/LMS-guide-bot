// Fix subscription for SuperAdmin 33 (Aniket2's SuperAdmin)
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'lms-database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Fixing Subscription for SuperAdmin 33\n');

// Create Standard plan subscription for superadmin-33
const subscriptionData = {
    superadminId: 'superadmin-33',
    planType: 'standard',
    planName: 'Standard',
    status: 'active',
    startDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    durationDays: 30,
    paymentId: null,
    amount: 0,
    currency: 'INR',
    paymentMethod: null,
    isFreeTrial: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

db.run(`
    INSERT OR REPLACE INTO subscriptions (
        superadminId, planType, planName, status, startDate, expiryDate,
        durationDays, paymentId, amount, currency, paymentMethod, isFreeTrial,
        createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`, [
    subscriptionData.superadminId,
    subscriptionData.planType,
    subscriptionData.planName,
    subscriptionData.status,
    subscriptionData.startDate,
    subscriptionData.expiryDate,
    subscriptionData.durationDays,
    subscriptionData.paymentId,
    subscriptionData.amount,
    subscriptionData.currency,
    subscriptionData.paymentMethod,
    subscriptionData.isFreeTrial,
    subscriptionData.createdAt,
    subscriptionData.updatedAt
], function(err) {
    if (err) {
        console.error('❌ Error creating subscription:', err);
        return;
    }
    
    console.log('✅ Successfully created Standard plan subscription for superadmin-33');
    console.log(`📋 Subscription Details:`);
    console.log(`   SuperAdmin: ${subscriptionData.superadminId}`);
    console.log(`   Plan: ${subscriptionData.planName} (${subscriptionData.planType})`);
    console.log(`   Status: ${subscriptionData.status}`);
    console.log(`   Expires: ${new Date(subscriptionData.expiryDate).toLocaleDateString()}`);
    
    // Now test the plan inheritance for Aniket2
    console.log('\n🧪 Testing Plan Inheritance for Aniket2...');
    
    // Simulate the plan inheritance logic
    db.get(`
        SELECT u.university_id, uni.adminId as superadmin_id, u.name as userName, u.role as userRole
        FROM users u
        LEFT JOIN universities uni ON u.university_id = uni.id
        WHERE u.id = 22
    `, [22], (err, result) => {
        if (err) {
            console.error('❌ Error fetching user:', err);
            return;
        }
        
        console.log(`📊 User 22 (Aniket2) data:`, {
            userName: result?.userName,
            userRole: result?.userRole,
            university_id: result?.university_id,
            superadmin_id: result?.superadmin_id
        });
        
        const superadminId = `superadmin-${result.superadmin_id}`;
        console.log(`🔄 Converted to superadminId: ${superadminId}`);
        
        db.get(`
            SELECT planType, planName, status, expiryDate, isFreeTrial
            FROM subscriptions
            WHERE superadminId = ?
            ORDER BY createdAt DESC
            LIMIT 1
        `, [superadminId], (err, subscription) => {
            if (err) {
                console.error('❌ Error fetching subscription:', err);
                return;
            }
            
            if (!subscription) {
                console.log('❌ No subscription found');
                return;
            }
            
            const isExpired = new Date() > new Date(subscription.expiryDate);
            const effectivePlan = isExpired ? 'free' : subscription.planType;
            const canAccessCalendar = effectivePlan === 'standard' || effectivePlan === 'professional';
            
            console.log(`📋 Subscription found:`, subscription);
            console.log(`✅ Final Result:`);
            console.log(`   Effective Plan: ${effectivePlan}`);
            console.log(`   Calendar Access: ${canAccessCalendar ? '✅ ALLOWED' : '🚫 BLOCKED'}`);
            
            db.close();
        });
    });
});

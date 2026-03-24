const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../config/sqlite-db');
const planInheritance = require('./plan-inheritance-controller');

/**
 * REAL-TIME IMMEDIATE PLAN PROPAGATION
 * Updates all users under a SuperAdmin instantly without delay
 */
const triggerImmediatePropagation = async (superadminId, planType, planName, expiryDate) => {
  const startTime = Date.now();
  
  try {
    console.log(`🚀 [DEBUG] IMMEDIATE PROPAGATION TRIGGERED:`);
    console.log(`   SuperAdmin: ${superadminId}`);
    console.log(`   Plan: ${planName} (${planType})`);
    console.log(`   Expiry: ${expiryDate}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    
    // Extract numeric adminId from superadminId format (e.g., 'superadmin-1' -> 1)
    // Handle both string and number inputs
    const superadminIdStr = String(superadminId);
    const adminId = superadminIdStr.includes('-') ? superadminIdStr.split('-')[1] : superadminIdStr;
    console.log(`🔄 [DEBUG] Extracted adminId: ${adminId} from superadminId: ${superadminIdStr}`);
    
    // Step 1: Update university immediately
    const universityResult = await new Promise((resolve, reject) => {
      db.run(`
        UPDATE universities 
        SET subscriptionPlan = ?, updatedAt = ?
        WHERE adminId = ?
      `, [planType, new Date().toISOString(), adminId], function(err) {
        if (err) {
          console.error(`❌ [DEBUG] Error updating universities for SuperAdmin ${superadminId}:`, err);
          reject(err);
        } else {
          console.log(`✅ [DEBUG] Universities updated: ${this.changes} rows affected`);
          resolve({ changes: this.changes });
        }
      });
    });
    
    console.log(`🏢 [DEBUG] University update result:`, universityResult);
    
    // Step 2: Update all users immediately
    const userResult = await new Promise((resolve, reject) => {
      db.run(`
        UPDATE users 
        SET subscriptionPlan = ?, updatedAt = ?
        WHERE university_id IN (
          SELECT id FROM universities WHERE adminId = ?
        )
      `, [planType, new Date().toISOString(), adminId], function(err) {
        if (err) {
          console.error(`❌ [DEBUG] Error updating users for SuperAdmin ${superadminId}:`, err);
          reject(err);
        } else {
          console.log(`✅ [DEBUG] Users updated: ${this.changes} rows affected`);
          resolve({ changes: this.changes });
        }
      });
    });
    
    console.log(`👥 [DEBUG] User update result:`, userResult);
    
    // Step 3: Emit real-time Socket.IO update
    const planChangeData = {
      superadminId,
      planType,
      planName,
      expiryDate,
      universitiesUpdated: universityResult.changes,
      usersUpdated: userResult.changes,
      timestamp: new Date().toISOString()
    };
    
    console.log(`📡 [DEBUG] Preparing Socket.IO emission:`, planChangeData);
    
    if (global.emitPlanChange) {
      console.log(`📡 [DEBUG] Calling global.emitPlanChange...`);
      global.emitPlanChange(planChangeData);
      console.log(`✅ [DEBUG] Socket.IO emission completed`);
    } else {
      console.log(`❌ [DEBUG] global.emitPlanChange is not defined!`);
    }
    
    const duration = Date.now() - startTime;
    console.log(`⏱️ [DEBUG] Total propagation time: ${duration}ms`);
    
    return {
      universitiesUpdated: universityResult.changes,
      usersUpdated: userResult.changes,
      planType,
      planName,
      expiryDate,
      duration
    };
    
  } catch (error) {
    console.error(`❌ [DEBUG] CRITICAL ERROR in triggerImmediatePropagation:`, error);
    throw error;
  }
};

/**
 * PLAN INHERITANCE SYSTEM
 * Uses enhanced real-time propagation
 */
const propagatePlanToUniversities = async (superadminId, planType) => {
  try {
    console.log(`🔄 Triggering IMMEDIATE plan propagation for SuperAdmin ${superadminId}...`);
    
    // Get subscription details for propagation
    const subscription = await new Promise((resolve, reject) => {
      db.get(
        'SELECT planName, expiryDate FROM subscriptions WHERE superadminId = ? ORDER BY createdAt DESC LIMIT 1',
        [superadminId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    // Use immediate propagation system
    const result = await triggerImmediatePropagation(
      superadminId, 
      planType, 
      subscription?.planName || 'Free', 
      subscription?.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    );
    
    console.log(`✅ Immediate propagation completed: ${result.usersUpdated} users updated`);
    return result;
  } catch (error) {
    console.error('Error in plan propagation:', error);
    throw error;
  }
};

/**
 * Find subscription by userId or superadminId from SQLite
 */
const findSubscriptionById = (userId) => {
  return new Promise((resolve, reject) => {
    // Convert userId to superadminId format for SuperAdmin users
    // For regular users, use their userId directly
    // For SuperAdmin users, convert to superadmin-{userId} format
    let superadminId = userId;
    
    // Check if this is already a superadminId string (e.g., 'superadmin-33')
    const userIdStr = String(userId);
    if (userIdStr.startsWith('superadmin-')) {
      // Already in superadminId format, use as-is
      superadminId = userIdStr;
      console.log(`🔄 [DEBUG] Using existing superadminId: ${superadminId}`);
    } else if (userId && parseInt(userId) > 10) {
      // Convert numeric userId to superadminId format
      superadminId = `superadmin-${userId}`;
      console.log(`🔄 [DEBUG] Converting SuperAdmin userId ${userId} to superadminId ${superadminId}`);
    } else {
      // Regular user, use as-is
      console.log(`🔄 [DEBUG] Using regular userId: ${userId}`);
    }
    
    console.log(`🔍 [DEBUG] Looking for subscription with superadminId: ${superadminId}`);
    
    // Query by superadminId since that's the identifier column in the table
    db.get(
      'SELECT * FROM subscriptions WHERE superadminId = ?',
      [superadminId],
      (err, row) => {
        if (err) {
          console.error('Error finding subscription:', err);
          reject(err);
        } else {
          // Convert SQLite boolean (0/1) to JavaScript boolean
          if (row) {
            row.isFreeTrial = Boolean(row.isFreeTrial);
          }
          console.log(`📋 [DEBUG] Found subscription:`, row ? {
            superadminId: row.superadminId,
            planType: row.planType,
            planName: row.planName,
            status: row.status
          } : 'None');
          resolve(row);
        }
      }
    );
  });
};

/**
 * Save subscription to SQLite (INSERT or UPDATE)
 */
const saveSubscriptionObject = (subObj) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT OR REPLACE INTO subscriptions (
        superadminId, planType, planName, status, startDate, expiryDate,
        durationDays, paymentId, amount, currency, paymentMethod, isFreeTrial,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      subObj.superadminId || subObj.userId, // Use the provided superadminId directly
      subObj.planType || 'free',
      subObj.planName || 'Free',
      subObj.status || 'active',
      subObj.startDate ? new Date(subObj.startDate).toISOString() : new Date().toISOString(),
      subObj.expiryDate ? new Date(subObj.expiryDate).toISOString() : new Date().toISOString(),
      subObj.durationDays || 30,
      subObj.paymentId || null,
      subObj.amount || 0,
      subObj.currency || 'INR',
      subObj.paymentMethod || null,
      subObj.isFreeTrial ? 1 : 0,
      subObj.createdAt ? new Date(subObj.createdAt).toISOString() : new Date().toISOString(),
      new Date().toISOString()
    ];

    db.run(query, params, function(err) {
      if (err) {
        console.error('Error saving subscription:', err);
        reject(err);
      } else {
        // Return the saved object with SQLite ID
        resolve({
          id: this.lastID,
          ...subObj,
          isFreeTrial: Boolean(subObj.isFreeTrial)
        });
      }
    });
  });
};

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_S7aUmYSaQyE0h6',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'DFei1Nk0mzEHm3ehq6Va5QhW'
});

// Get current subscription
exports.getCurrentSubscription = async (req, res) => {
  try {
    // Handle both superadmin and regular users
    let userId;
    if (req.user?.role === 'superadmin') {
      userId = req.user.userId; // Use the actual SuperAdmin user ID
      console.log(`🔍 [DEBUG] SuperAdmin ${req.user.userId} getting current subscription`);
    } else if (req.user?.userId) {
      userId = req.user.userId; // Regular user uses their actual userId
    } else {
      // No authenticated user, return free trial
      return res.json({
        success: true,
        subscription: {
          planType: 'free',
          planName: 'Free',
          status: 'active',
          expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
          startDate: new Date(),
          durationDays: 10,
          isFreeTrial: true,
          remainingSeconds: 10 * 24 * 60 * 60 // 10 days in seconds
        }
      });
    }
    
    let subscription = await findSubscriptionById(userId);

    // If no subscription exists, create a free trial
    if (!subscription) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 10); // 10 days free trial

      subscription = {
        userId, // Use userId for both regular users and superadmin
        planType: 'free',
        planName: 'Free',
        status: 'active',
        startDate: new Date(),
        expiryDate,
        durationDays: 10,
        isFreeTrial: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      subscription = await saveSubscriptionObject(subscription);
    }

    // Normalize expiry as Date
    const now = new Date();
    const expiry = new Date(subscription.expiryDate);
    if (expiry < now && subscription.status === 'active') {
      subscription.status = 'expired';
      subscription.updatedAt = new Date();
      await saveSubscriptionObject(subscription);
    }

    res.json({
      success: true,
      subscription: {
        planType: subscription.planType,
        planName: subscription.planName,
        status: subscription.status,
        expiryDate: subscription.expiryDate,
        startDate: subscription.startDate,
        durationDays: subscription.durationDays,
        isFreeTrial: subscription.isFreeTrial,
        remainingSeconds: Math.max(0, Math.floor((new Date(subscription.expiryDate) - now) / 1000))
      }
    });
  } catch (error) {
    console.error('Error getting subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription',
      error: error.message
    });
  }
};

// Create subscription order
exports.createSubscriptionOrder = async (req, res) => {
  try {
    const { planId, planName, amount } = req.body;
    
    if (!planId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'planId and amount are required'
      });
    }
    
    const options = {
      amount: parseInt(amount) * 100, // Convert to paise
      currency: 'INR',
      receipt: `sub_${Date.now()}`,
      payment_capture: 1
    };
    
    const order = await razorpay.orders.create(options);
    
    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        createdAt: order.created_at
      },
      planData: {
        planId,
        planName,
        amount
      }
    });
  } catch (error) {
    console.error('Error creating subscription order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription order',
      error: error.message
    });
  }
};

// Verify subscription payment and activate
exports.verifySubscriptionPayment = async (req, res) => {
  try {
    // Handle both superadmin and regular users
    let userId;
    if (req.user?.role === 'superadmin') {
      userId = `superadmin-${req.user.userId}`; // Convert to superadminId format
      console.log(`🔍 [DEBUG] SuperAdmin ${req.user.userId} verifying payment`);
    } else if (req.user?.userId) {
      userId = req.user.userId; // Regular user uses their actual userId
    } else {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const { 
      orderId, 
      paymentId, 
      signature, 
      planId, 
      planName, 
      amount,
      durationDays = 30 
    } = req.body;
    
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment parameters'
      });
    }
    
    // Verify signature
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'DFei1Nk0mzEHm3ehq6Va5QhW')
      .update(body.toString())
      .digest('hex');
    
    if (expectedSignature !== signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed - Invalid signature'
      });
    }
    
    // Payment verified - Update or create subscription
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + durationDays);

    let subscription = await findSubscriptionById(userId);

    if (subscription) {
      // Update existing subscription object
      subscription.planType = planId;
      subscription.planName = planName;
      subscription.status = 'active';
      subscription.startDate = new Date();
      subscription.expiryDate = expiryDate;
      subscription.durationDays = durationDays;
      subscription.paymentId = paymentId;
      subscription.amount = amount;
      subscription.isFreeTrial = false;
      subscription.updatedAt = new Date();
    } else {
      // Create new subscription object
      subscription = {
        userId, // Use userId for both regular users and superadmin
        superadminId: req.user?.role === 'superadmin' ? 'superadmin-1' : null, // Only set superadminId for actual superadmin
        planType: planId,
        planName: planName,
        status: 'active',
        startDate: new Date(),
        expiryDate,
        durationDays,
        paymentId,
        amount,
        currency: 'INR',
        paymentMethod: 'razorpay',
        isFreeTrial: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    subscription = await saveSubscriptionObject(subscription);

    // 🚀 IMMEDIATE PROPAGATION FOR ALL PLAN CHANGES
    // Use the new immediate propagation system for real-time updates
    console.log(`🔄 Triggering IMMEDIATE plan propagation for SuperAdmin ${userId}...`);
    await triggerImmediatePropagation(userId, planId, planName, expiryDate);

    res.json({
      success: true,
      message: 'Payment verified and subscription activated',
      subscription: {
        planType: subscription.planType,
        planName: subscription.planName,
        status: subscription.status,
        expiryDate: subscription.expiryDate,
        remainingSeconds: Math.floor((new Date(subscription.expiryDate) - new Date()) / 1000)
      }
    });
  } catch (error) {
    console.error('Error verifying subscription payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify subscription payment',
      error: error.message
    });
  }
};

// Test endpoint for demonstration - bypass payment verification
exports.testUpgradeSubscription = async (req, res) => {
  try {
    // Handle both superadmin and regular users
    let userId;
    if (req.user?.role === 'superadmin') {
      userId = `superadmin-${req.user.userId}`; // Convert to superadminId format
      console.log(`🔍 [DEBUG] SuperAdmin ${req.user.userId} testing upgrade`);
    } else if (req.user?.userId) {
      userId = req.user.userId; // Regular user uses their actual userId
    } else {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const { planId, planName, durationDays = 30 } = req.body;
    
    // Create upgraded subscription
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + durationDays);

    let subscription = await findSubscriptionById(userId);

    if (subscription) {
      // Update existing subscription
      subscription.planType = planId;
      subscription.planName = planName;
      subscription.status = 'active';
      subscription.startDate = new Date();
      subscription.expiryDate = expiryDate;
      subscription.durationDays = durationDays;
      subscription.isFreeTrial = false;
      subscription.updatedAt = new Date();
    } else {
      // Create new subscription
      subscription = {
        userId,
        planType: planId,
        planName: planName,
        status: 'active',
        startDate: new Date(),
        expiryDate,
        durationDays,
        isFreeTrial: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    subscription = await saveSubscriptionObject(subscription);
    
    // 🚀 IMMEDIATE PROPAGATION FOR ALL PLAN CHANGES
    // Use the new immediate propagation system for real-time updates
    console.log(`🔄 Triggering IMMEDIATE plan propagation for SuperAdmin ${userId}...`);
    await triggerImmediatePropagation(userId, planId, planName, expiryDate);

    res.json({
      success: true,
      message: 'Test subscription upgraded successfully',
      subscription: {
        planType: subscription.planType,
        planName: subscription.planName,
        status: subscription.status,
        expiryDate: subscription.expiryDate,
        startDate: subscription.startDate,
        durationDays: subscription.durationDays,
        isFreeTrial: subscription.isFreeTrial,
        remainingSeconds: Math.floor((subscription.expiryDate - new Date()) / 1000)
      }
    });
  } catch (error) {
    console.error('Error upgrading test subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upgrade test subscription',
      error: error.message
    });
  }
};

// Activate free trial
exports.activateFreeTrial = async (req, res) => {
  try {
    // Handle both superadmin and regular users
    let userId;
    if (req.user?.role === 'superadmin') {
      userId = `superadmin-${req.user.userId}`; // Convert to superadminId format
      console.log(`🔍 [DEBUG] SuperAdmin ${req.user.userId} activating free trial`);
    } else if (req.user?.userId) {
      userId = req.user.userId; // Regular user uses their actual userId
    } else {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Check if subscription already exists
    let subscription = await findSubscriptionById(userId);

    if (subscription && subscription.status === 'active' && subscription.isFreeTrial === false) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active subscription'
      });
    }
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 10); // 10 days free trial
    
    if (subscription) {
      subscription.planType = 'free';
      subscription.planName = 'Free';
      subscription.status = 'active';
      subscription.startDate = new Date();
      subscription.expiryDate = expiryDate;
      subscription.durationDays = 10;
      subscription.isFreeTrial = true;
      subscription.paymentId = null;
      subscription.amount = 0;
      subscription.updatedAt = new Date();
    } else {
      subscription = {
        userId,
        planType: 'free',
        planName: 'Free',
        status: 'active',
        startDate: new Date(),
        expiryDate,
        durationDays: 10,
        isFreeTrial: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    subscription = await saveSubscriptionObject(subscription);
    
    // 🚀 IMMEDIATE PROPAGATION FOR FREE TRIAL
    // Use the new immediate propagation system for real-time updates
    console.log(`🔄 Triggering IMMEDIATE plan propagation for SuperAdmin ${userId}...`);
    
    // Convert to superadminId format for propagation
    const superadminIdForPropagation = req.user?.role === 'superadmin' ? `superadmin-${userId}` : userId;
    await triggerImmediatePropagation(superadminIdForPropagation, 'free', 'Free', expiryDate);
    
    res.json({
      success: true,
      message: 'Free trial activated',
      subscription: {
        planType: subscription.planType,
        planName: subscription.planName,
        status: subscription.status,
        expiryDate: subscription.expiryDate,
        isFreeTrial: subscription.isFreeTrial,
        remainingSeconds: Math.floor((subscription.expiryDate - new Date()) / 1000)
      }
    });
  } catch (error) {
    console.error('Error activating free trial:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate free trial',
      error: error.message
    });
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    // Handle both superadmin and regular users
    let userId;
    if (req.user?.role === 'superadmin') {
      // Use the actual SuperAdmin ID from the authenticated user
      userId = req.user.userId; // Use the actual SuperAdmin user ID
      console.log(`🔄 [DEBUG] SuperAdmin ${req.user.userId} cancelling subscription`);
    } else if (req.user?.userId) {
      userId = req.user.userId; // Regular user uses their actual userId
    } else {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    let subscription = await findSubscriptionById(userId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Downgrade to free tier immediately
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 10); // give 10 days on free tier

    subscription.planType = 'free';
    subscription.planName = 'Free';
    subscription.status = 'active';
    subscription.startDate = new Date();
    subscription.expiryDate = expiryDate;
    subscription.durationDays = 10;
    subscription.isFreeTrial = false;
    subscription.paymentId = null;
    subscription.amount = 0;
    subscription.updatedAt = new Date();

    await saveSubscriptionObject(subscription);
    
    // 🚀 IMMEDIATE PROPAGATION FOR CANCELLATION
    // Use the new immediate propagation system for real-time updates
    console.log(`🔄 Triggering IMMEDIATE plan propagation for SuperAdmin ${userId}...`);
    
    // Convert to superadminId format for propagation
    const superadminIdForPropagation = req.user?.role === 'superadmin' ? `superadmin-${userId}` : userId;
    await triggerImmediatePropagation(superadminIdForPropagation, 'free', 'Free', expiryDate);
    
    res.json({
      success: true,
      message: 'Subscription cancelled',
      subscription: {
        planType: subscription.planType,
        planName: subscription.planName,
        status: subscription.status,
        expiryDate: subscription.expiryDate,
        durationDays: subscription.durationDays,
        isFreeTrial: subscription.isFreeTrial,
        remainingSeconds: Math.max(0, Math.floor((new Date(subscription.expiryDate) - new Date()) / 1000))
      }
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
      error: error.message
    });
  }
};

/**
 * Check feature access for current user
 * Returns which features are available based on inherited subscription tier
 */
exports.checkFeatureAccess = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    console.log(`🔍 [DEBUG] checkFeatureAccess called for user: ${req.user.userId}, role: ${req.user.role}`);

    // Use inheritance system to get effective user plan
    const userPlan = await planInheritance.getEffectiveUserPlan(req.user.userId);
    
    console.log(`📊 [DEBUG] Final response for user ${req.user.userId}:`, {
      success: true,
      currentPlan: userPlan.planType,
      canAccessCalendar: userPlan.canAccessCalendar,
      isExpired: userPlan.isExpired,
      message: userPlan.planType === 'free' ? 'Limited features on free tier' : `Full features on ${userPlan.planType} tier`
    });
    
    res.status(200).json({
      success: true,
      currentPlan: userPlan.planType,
      features: userPlan.features,
      canAccessCalendar: userPlan.canAccessCalendar,
      canExportData: userPlan.canExportData,
      isExpired: userPlan.isExpired,
      expiryDate: userPlan.expiryDate,
      message: userPlan.planType === 'free' ? 'Limited features on free tier' : `Full features on ${userPlan.planType} tier`
    });
  } catch (error) {
    console.error('❌ [DEBUG] Error in checkFeatureAccess:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check feature access'
    });
  }
};

// Export the propagatePlanToUniversities function for testing
module.exports.propagatePlanToUniversities = propagatePlanToUniversities;

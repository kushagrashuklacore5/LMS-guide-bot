const express = require('express');
const router = express.Router();
const {
  getCurrentSubscription,
  createSubscriptionOrder,
  verifySubscriptionPayment,
  activateFreeTrial,
  cancelSubscription,
  checkFeatureAccess,
  testUpgradeSubscription
} = require('../controllers/subscription-controller');
const authMiddleware = require('../middleware/authMiddleware');

// Get current subscription
router.get('/current', authMiddleware, getCurrentSubscription);

// Check feature access (Calendar, Export, etc.)
router.get('/check-feature-access', authMiddleware, checkFeatureAccess);

// Create subscription order
router.post('/create-order', authMiddleware, createSubscriptionOrder);

// Verify subscription payment and activate
router.post('/verify-payment', authMiddleware, verifySubscriptionPayment);

// Activate free trial
router.post('/activate-free-trial', authMiddleware, activateFreeTrial);

// Cancel subscription
router.post('/cancel', authMiddleware, cancelSubscription);

// Test upgrade subscription (for demonstration)
router.post('/test-upgrade', authMiddleware, testUpgradeSubscription);

module.exports = router;

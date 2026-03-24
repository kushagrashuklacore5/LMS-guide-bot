const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getTransactionHistory, generateInvoice, getAllTransactions } = require('../controllers/payment-controller');

// Create Razorpay order
router.post('/create-order', createOrder);

// Verify Razorpay payment
router.post('/verify-payment', verifyPayment);

// Generate professional invoice
router.post('/generate-invoice', generateInvoice);

// Get transaction history for a student
router.get('/transactions/:studentId', getTransactionHistory);

// Get all transactions for accountant portal
router.get('/all-transactions', getAllTransactions);

module.exports = router;

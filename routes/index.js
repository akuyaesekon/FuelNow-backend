const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const customerRoutes = require('./customers');
const transactionRoutes = require('./transactions');
const paymentRoutes = require('./payments');
const adminRoutes = require('./admin');

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication endpoints
 *   - name: Customers
 *     description: Customer management endpoints
 *   - name: Transactions
 *     description: Transaction processing endpoints
 *   - name: Payments
 *     description: Payment processing and repayment endpoints
 *   - name: Admin
 *     description: Administrative endpoints for reports and reconciliation
 */

// Mount routes
router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/transactions', transactionRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
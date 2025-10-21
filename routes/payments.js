const express = require('express');
const router = express.Router();
const { 
  processRepayment, 
  initiateMpesaPayment, 
  handleMpesaCallback 
} = require('../controllers/paymentController');
const { validate, repaymentSchema } = require('../middleware/validation');

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing and repayment endpoints
 */

/**
 * @swagger
 * /api/v1/payments/repay:
 *   post:
 *     summary: Process loan repayment
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - amount
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Customer phone number
 *                 example: "+254712345678"
 *               amount:
 *                 type: number
 *                 format: float
 *                 description: Repayment amount
 *                 example: 330
 *     responses:
 *       200:
 *         description: Repayment processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 wallet:
 *                   $ref: '#/components/schemas/Wallet'
 *                 transaction:
 *                   $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Invalid repayment request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.post('/repay', validate(repaymentSchema), processRepayment);

/**
 * @swagger
 * /api/v1/payments/mpesa/stk-push:
 *   post:
 *     summary: Initiate M-Pesa STK Push payment
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - amount
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Customer phone number
 *                 example: "254712345678"
 *               amount:
 *                 type: number
 *                 format: float
 *                 description: Payment amount
 *                 example: 330
 *     responses:
 *       200:
 *         description: M-Pesa payment initiated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid payment request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.post('/mpesa/stk-push', initiateMpesaPayment);

/**
 * @swagger
 * /api/v1/payments/mpesa/callback:
 *   post:
 *     summary: M-Pesa payment callback endpoint (for Safaricom)
 *     tags: [Payments]
 *     description: This endpoint receives payment callbacks from Safaricom M-Pesa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Body:
 *                 type: object
 *                 properties:
 *                   stkCallback:
 *                     type: object
 *     responses:
 *       200:
 *         description: Callback processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *       500:
 *         description: Error processing callback
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/mpesa/callback', handleMpesaCallback);

module.exports = router;
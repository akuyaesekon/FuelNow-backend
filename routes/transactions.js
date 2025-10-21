const express = require('express');
const router = express.Router();
const { 
  validateRider, 
  validateCard, 
  captureTransaction, 
  getTransactionStatus 
} = require('../controllers/transactionController');
const { 
  validate, 
  transactionValidationSchema, 
  cardValidationSchema, 
  captureTransactionSchema 
} = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Transaction processing endpoints
 */

/**
 * @swagger
 * /api/v1/transactions/validate_rider:
 *   post:
 *     summary: Validate rider and reserve amount for fuel purchase
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rider_phone
 *               - station_id
 *               - attendant_id
 *               - amount
 *             properties:
 *               rider_phone:
 *                 type: string
 *                 description: Rider's registered phone number
 *                 example: "+254712345678"
 *               station_id:
 *                 type: string
 *                 description: Fuel station ID
 *                 example: "STN-001"
 *               attendant_id:
 *                 type: string
 *                 description: Attendant ID processing the transaction
 *                 example: "ATT-001"
 *               amount:
 *                 type: number
 *                 format: float
 *                 description: Fuel amount in KES
 *                 example: 500
 *     responses:
 *       200:
 *         description: Rider validated and amount reserved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 approved:
 *                   type: boolean
 *                   example: true
 *                 reservation_id:
 *                   type: string
 *                   description: Unique reservation token
 *                 amount:
 *                   type: number
 *                 interest:
 *                   type: number
 *                 total_amount:
 *                   type: number
 *                 customer_name:
 *                   type: string
 *       400:
 *         description: Validation failed or insufficient funds
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.post('/validate_rider', validate(transactionValidationSchema), validateRider);

/**
 * @swagger
 * /api/v1/transactions/validate_card:
 *   post:
 *     summary: Validate smartcard and reserve amount for fuel purchase
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - card_token
 *               - station_id
 *               - attendant_id
 *               - amount
 *             properties:
 *               card_token:
 *                 type: string
 *                 description: Smartcard token
 *                 example: "TKN123456789"
 *               station_id:
 *                 type: string
 *                 description: Fuel station ID
 *                 example: "STN-001"
 *               attendant_id:
 *                 type: string
 *                 description: Attendant ID processing the transaction
 *                 example: "ATT-001"
 *               amount:
 *                 type: number
 *                 format: float
 *                 description: Fuel amount in KES
 *                 example: 500
 *     responses:
 *       200:
 *         description: Card validated and amount reserved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 approved:
 *                   type: boolean
 *                   example: true
 *                 reservation_id:
 *                   type: string
 *                   description: Unique reservation token
 *                 amount:
 *                   type: number
 *                 interest:
 *                   type: number
 *                 total_amount:
 *                   type: number
 *                 customer_name:
 *                   type: string
 *       400:
 *         description: Validation failed or insufficient funds
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.post('/validate_card', validate(cardValidationSchema), validateCard);

/**
 * @swagger
 * /api/v1/transactions/capture_txn:
 *   post:
 *     summary: Capture transaction after fuel dispensing
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reservation_id
 *               - final_amount
 *             properties:
 *               reservation_id:
 *                 type: string
 *                 description: Reservation token from validation
 *                 example: "reservation_token_123"
 *               final_amount:
 *                 type: number
 *                 format: float
 *                 description: Actual fuel amount dispensed
 *                 example: 480
 *               litres:
 *                 type: number
 *                 format: float
 *                 description: Litres dispensed
 *                 example: 6.2
 *               meter_reading:
 *                 type: string
 *                 description: Pump meter reading
 *                 example: "12345.67"
 *     responses:
 *       200:
 *         description: Transaction captured successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 transaction:
 *                   $ref: '#/components/schemas/Transaction'
 *                 final_amount:
 *                   type: number
 *                 interest:
 *                   type: number
 *                 total_amount:
 *                   type: number
 *       400:
 *         description: Invalid reservation or transaction already processed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.post('/capture_txn', validate(captureTransactionSchema), captureTransaction);

/**
 * @swagger
 * /api/v1/transactions/status/{reservation_id}:
 *   get:
 *     summary: Get transaction status by reservation ID
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: reservation_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reservation token
 *     responses:
 *       200:
 *         description: Transaction status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.get('/status/:reservation_id', getTransactionStatus);

module.exports = router;
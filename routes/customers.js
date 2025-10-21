const express = require('express');
const router = express.Router();
const { onboardCustomer, getCustomerByPhone, getAllCustomers } = require('../controllers/customerController');
const { validate, customerOnboardingSchema } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Customer management endpoints
 */

/**
 * @swagger
 * /api/v1/customers/onboard:
 *   post:
 *     summary: Onboard a new customer
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       201:
 *         description: Customer onboarded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request - customer already exists or validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *     examples:
 *       onboardingExample:
 *         summary: Example of customer onboarding
 *         value:
 *           name: "John Doe"
 *           phone: "+254712345678"
 *           idNumber: "12345678"
 *           nextOfKin: "Jane Doe"
 *           cardType: "credit"
 */
router.post('/onboard', validate(customerOnboardingSchema), onboardCustomer);

/**
 * @swagger
 * /api/v1/customers/{phone}:
 *   get:
 *     summary: Get customer details by phone number
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer phone number
 *     responses:
 *       200:
 *         description: Customer details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal server error
 */
router.get('/:phone', authenticateToken, getCustomerByPhone);

/**
 * @swagger
 * /api/v1/customers:
 *   get:
 *     summary: Get all customers
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all customers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticateToken, getAllCustomers);

module.exports = router;
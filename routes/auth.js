const express = require('express');
const router = express.Router();
const { registerAttendant, loginAttendant } = require('../controllers/authController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Attendant:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - stationId
 *       properties:
 *         name:
 *           type: string
 *           description: Attendant's full name
 *         email:
 *           type: string
 *           format: email
 *           description: Attendant's email address
 *         password:
 *           type: string
 *           format: password
 *           description: Attendant's password (min 6 characters)
 *         stationId:
 *           type: string
 *           description: Station ID where attendant works
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             attendant:
 *               $ref: '#/components/schemas/Attendant'
 *             token:
 *               type: string
 *               description: JWT token for authentication
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new fuel attendant
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Attendant'
 *     responses:
 *       201:
 *         description: Attendant registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Bad request - attendant already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.post('/register', registerAttendant);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login attendant and get JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.post('/login', loginAttendant);

module.exports = router;
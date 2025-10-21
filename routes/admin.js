const express = require('express');
const router = express.Router();
const { 
  generateDailyReport, 
  generateSettlementFile, 
  getDashboardStats 
} = require('../controllers/reconciliationController');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative endpoints for reports and reconciliation
 */

/**
 * @swagger
 * /api/v1/admin/reports/daily:
 *   get:
 *     summary: Generate daily transaction report
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date for report (YYYY-MM-DD), defaults to today
 *         example: "2024-01-15"
 *     responses:
 *       200:
 *         description: Daily report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get('/reports/daily', authenticateToken, requireRole('admin'), generateDailyReport);

/**
 * @swagger
 * /api/v1/admin/reports/settlement:
 *   get:
 *     summary: Generate settlement file for fuel stations
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date for settlement (YYYY-MM-DD), defaults to today
 *         example: "2024-01-15"
 *     responses:
 *       200:
 *         description: Settlement file generated
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get('/reports/settlement', authenticateToken, requireRole('admin'), generateSettlementFile);

/**
 * @swagger
 * /api/v1/admin/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get('/dashboard/stats', authenticateToken, requireRole('admin'), getDashboardStats);

module.exports = router;
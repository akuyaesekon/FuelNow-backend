const express = require('express');
const router = express.Router();
const { 
  generateDailyReport, 
  generateSettlementFile, 
  getDashboardStats 
} = require('../controllers/reconciliationController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Public test endpoint (no auth required)
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Admin API is working!',
    timestamp: new Date().toISOString()
  });
});

// Public health check for admin routes
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'FuelNow Admin API',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

// Demo data endpoint (no auth required for testing)
router.get('/demo-report', async (req, res) => {
  try {
    const { date } = req.query;
    
    // Return sample data for demo
    const sampleData = {
      success: true,
      message: 'Demo report data',
      data: {
        date: date || new Date().toISOString().split('T')[0],
        report: {
          total_transactions: 15,
          total_amount: 7500,
          total_interest: 750,
          total_litres: 93.75,
          stations: [
            {
              station_id: 'STN-001',
              transaction_count: '8',
              total_amount: '4000',
              total_interest: '400',
              total_litres: '50'
            },
            {
              station_id: 'STN-002',
              transaction_count: '7',
              total_amount: '3500',
              total_interest: '350',
              total_litres: '43.75'
            }
          ]
        }
      }
    };
    
    res.json(sampleData);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Protected routes (require authentication)
router.get('/reports/daily', authenticateToken, requireRole('admin'), generateDailyReport);
router.get('/reports/settlement', authenticateToken, requireRole('admin'), generateSettlementFile);
router.get('/dashboard/stats', authenticateToken, requireRole('admin'), getDashboardStats);

module.exports = router;
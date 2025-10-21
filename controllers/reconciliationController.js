const ReconciliationService = require('../services/reconciliationService');

async function generateDailyReport(req, res) {
  try {
    const { date } = req.query;
    const reportDate = date ? new Date(date) : new Date();

    const report = await ReconciliationService.generateDailyReport(reportDate);

    if (!report.success) {
      return res.status(400).json(report);
    }

    res.json(report);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

async function generateSettlementFile(req, res) {
  try {
    const { date } = req.query;
    const settlementDate = date ? new Date(date) : new Date();

    const settlement = await ReconciliationService.generateSettlementFile(settlementDate);

    if (!settlement.success) {
      return res.status(400).json(settlement);
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=settlement-${settlement.date}.csv`);
    
    res.send(settlement.settlement_file);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

async function getDashboardStats(req, res) {
  try {
    const db = require('../config/database');
    
    // Get total customers
    const customersResult = await db.query('SELECT COUNT(*) as total FROM customers WHERE status = "active"');
    
    // Get total transactions today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const transactionsResult = await db.query(
      'SELECT COUNT(*) as total FROM transactions WHERE created_at >= $1 AND created_at < $2',
      [today, tomorrow]
    );
    
    // Get total revenue (interest)
    const revenueResult = await db.query(
      'SELECT COALESCE(SUM(interest_amount), 0) as total FROM transactions WHERE status = "completed" AND created_at >= $1 AND created_at < $2',
      [today, tomorrow]
    );
    
    // Get pending settlements
    const pendingResult = await db.query(
      'SELECT COUNT(*) as total FROM transactions WHERE status = "reserved"'
    );

    res.json({
      success: true,
      data: {
        total_customers: parseInt(customersResult.rows[0].total),
        today_transactions: parseInt(transactionsResult.rows[0].total),
        today_revenue: parseFloat(revenueResult.rows[0].total),
        pending_settlements: parseInt(pendingResult.rows[0].total)
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  generateDailyReport,
  generateSettlementFile,
  getDashboardStats
};
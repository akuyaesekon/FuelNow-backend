const db = require('../config/database');

class ReconciliationService {
  static async generateDailyReport(date = new Date()) {
    try {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      // Get daily transactions summary
      const query = `
        SELECT 
          station_id,
          COUNT(*) as transaction_count,
          SUM(final_amount) as total_amount,
          SUM(interest_amount) as total_interest,
          SUM(litres) as total_litres
        FROM transactions 
        WHERE status = 'completed' 
          AND completed_at BETWEEN $1 AND $2
        GROUP BY station_id
        ORDER BY station_id
      `;

      const result = await db.query(query, [startDate, endDate]);
      
      // Calculate totals
      const totals = {
        total_transactions: 0,
        total_amount: 0,
        total_interest: 0,
        total_litres: 0,
        stations: result.rows
      };

      result.rows.forEach(station => {
        totals.total_transactions += parseInt(station.transaction_count);
        totals.total_amount += parseFloat(station.total_amount) || 0;
        totals.total_interest += parseFloat(station.total_interest) || 0;
        totals.total_litres += parseFloat(station.total_litres) || 0;
      });

      return {
        success: true,
        date: date.toISOString().split('T')[0],
        report: totals
      };

    } catch (error) {
      console.error('Reconciliation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async generateSettlementFile(date = new Date()) {
    try {
      const report = await this.generateDailyReport(date);
      
      if (!report.success) {
        throw new Error(report.error);
      }

      // Generate settlement file content (CSV format)
      let csvContent = 'Station ID,Transactions,Amount,Interest,Litres,Settlement Amount\n';
      
      report.report.stations.forEach(station => {
        const settlementAmount = (parseFloat(station.total_amount) || 0) - (parseFloat(station.total_interest) || 0);
        csvContent += `${station.station_id},${station.transaction_count},${station.total_amount},${station.total_interest},${station.total_litres},${settlementAmount}\n`;
      });

      // Add totals row
      const totalSettlement = report.report.total_amount - report.report.total_interest;
      csvContent += `TOTAL,${report.report.total_transactions},${report.report.total_amount},${report.report.total_interest},${report.report.total_litres},${totalSettlement}\n`;

      return {
        success: true,
        date: report.date,
        settlement_file: csvContent,
        summary: {
          total_transactions: report.report.total_transactions,
          total_amount: report.report.total_amount,
          total_interest: report.report.total_interest,
          total_settlement: totalSettlement
        }
      };

    } catch (error) {
      console.error('Settlement file generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = ReconciliationService;
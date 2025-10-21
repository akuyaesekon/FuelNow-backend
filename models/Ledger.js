const db = require('../config/database');

class Ledger {
  static async create(ledgerData) {
    const { transactionId, walletId, debit = 0, credit = 0, balance, description } = ledgerData;
    
    const query = `
      INSERT INTO ledger (transaction_id, wallet_id, debit, credit, balance, description)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [transactionId, walletId, debit, credit, balance, description];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByWalletId(walletId) {
    const query = 'SELECT * FROM ledger WHERE wallet_id = $1 ORDER BY created_at DESC';
    const result = await db.query(query, [walletId]);
    return result.rows;
  }

  static async getCurrentBalance(walletId) {
    const query = `
      SELECT balance 
      FROM ledger 
      WHERE wallet_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    const result = await db.query(query, [walletId]);
    return result.rows[0] ? result.rows[0].balance : 0;
  }
}

module.exports = Ledger;
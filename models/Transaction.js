const db = require('../config/database');

class Transaction {
  static async create(transactionData) {
    const { 
      walletId, 
      type, 
      amount, 
      interest = 0, 
      stationId, 
      attendantId, 
      status = 'pending' 
    } = transactionData;
    
    const query = `
      INSERT INTO transactions 
      (wallet_id, type, amount, interest_amount, total_amount, station_id, attendant_id, status, reservation_token)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const totalAmount = parseFloat(amount) + parseFloat(interest);
    const reservationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const values = [
      walletId, type, amount, interest, totalAmount, 
      stationId, attendantId, status, reservationToken
    ];
    
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByReservationToken(token) {
    const query = `
      SELECT t.*, c.name, c.phone, w.card_type
      FROM transactions t
      JOIN wallets w ON t.wallet_id = w.id
      JOIN customers c ON w.customer_id = c.id
      WHERE t.reservation_token = $1
    `;
    const result = await db.query(query, [token]);
    return result.rows[0];
  }

  static async updateStatus(transactionId, status, finalAmount = null) {
    let query, values;
    
    if (finalAmount) {
      query = `
        UPDATE transactions 
        SET status = $1, final_amount = $2, completed_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `;
      values = [status, finalAmount, transactionId];
    } else {
      query = `
        UPDATE transactions 
        SET status = $1
        WHERE id = $2
        RETURNING *
      `;
      values = [status, transactionId];
    }
    
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByWalletId(walletId) {
    const query = 'SELECT * FROM transactions WHERE wallet_id = $1 ORDER BY created_at DESC';
    const result = await db.query(query, [walletId]);
    return result.rows;
  }

  static async findAllByStatus(status) {
    const query = `
      SELECT t.*, c.name, c.phone, w.card_type
      FROM transactions t
      JOIN wallets w ON t.wallet_id = w.id
      JOIN customers c ON w.customer_id = c.id
      WHERE t.status = $1
      ORDER BY t.created_at DESC
    `;
    const result = await db.query(query, [status]);
    return result.rows;
  }
}

module.exports = Transaction;
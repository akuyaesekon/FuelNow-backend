const db = require('../config/database');

class Wallet {
  static async create(walletData) {
    const { customerId, cardType, creditLimit = 0, balance = 0 } = walletData;
    const query = `
      INSERT INTO wallets (customer_id, card_type, credit_limit, available_balance, status)
      VALUES ($1, $2, $3, $4, 'active')
      RETURNING *
    `;
    const values = [customerId, cardType, creditLimit, balance];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByCustomerId(customerId) {
    const query = `
      SELECT w.*, c.name, c.phone 
      FROM wallets w 
      JOIN customers c ON w.customer_id = c.id 
      WHERE w.customer_id = $1
    `;
    const result = await db.query(query, [customerId]);
    return result.rows[0];
  }

  static async findByPhone(phone) {
    const query = `
      SELECT w.*, c.name, c.phone 
      FROM wallets w 
      JOIN customers c ON w.customer_id = c.id 
      WHERE c.phone = $1
    `;
    const result = await db.query(query, [phone]);
    return result.rows[0];
  }

  static async updateBalance(walletId, amount) {
    const query = `
      UPDATE wallets 
      SET available_balance = available_balance + $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(query, [amount, walletId]);
    return result.rows[0];
  }

  static async reserveAmount(walletId, amount) {
    const query = `
      UPDATE wallets 
      SET available_balance = available_balance - $1,
          reserved_balance = reserved_balance + $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND available_balance >= $1
      RETURNING *
    `;
    const result = await db.query(query, [amount, walletId]);
    return result.rows[0];
  }

  static async releaseReservation(walletId, amount) {
    const query = `
      UPDATE wallets 
      SET reserved_balance = reserved_balance - $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(query, [amount, walletId]);
    return result.rows[0];
  }

  static async updateUsedCredit(walletId, amount) {
    const query = `
      UPDATE wallets 
      SET used_credit = used_credit + $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(query, [amount, walletId]);
    return result.rows[0];
  }
}

module.exports = Wallet;
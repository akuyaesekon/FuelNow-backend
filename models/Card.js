const db = require('../config/database');

class Card {
  static async create(cardData) {
    const { walletId, cardNumber, cardToken, cardType } = cardData;
    
    const query = `
      INSERT INTO cards (wallet_id, card_number, card_token, card_type, status)
      VALUES ($1, $2, $3, $4, 'active')
      RETURNING *
    `;
    
    // Generate encrypted card token (in production, use proper encryption)
    const encryptedToken = Buffer.from(cardToken).toString('base64');
    
    const values = [walletId, cardNumber, encryptedToken, cardType];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByCardToken(token) {
    const encryptedToken = Buffer.from(token).toString('base64');
    const query = `
      SELECT c.*, w.*, cust.name, cust.phone
      FROM cards c
      JOIN wallets w ON c.wallet_id = w.id
      JOIN customers cust ON w.customer_id = cust.id
      WHERE c.card_token = $1 AND c.status = 'active'
    `;
    const result = await db.query(query, [encryptedToken]);
    return result.rows[0];
  }

  static async findByWalletId(walletId) {
    const query = 'SELECT * FROM cards WHERE wallet_id = $1 AND status = "active"';
    const result = await db.query(query, [walletId]);
    return result.rows[0];
  }
}

module.exports = Card;
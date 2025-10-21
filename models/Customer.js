const db = require('../config/database');

class Customer {
  static async create(customerData) {
    const { name, phone, idNumber, nextOfKin, cardType } = customerData;
    const query = `
      INSERT INTO customers (name, phone, id_number, next_of_kin, card_type, status)
      VALUES ($1, $2, $3, $4, $5, 'active')
      RETURNING *
    `;
    const values = [name, phone, idNumber, nextOfKin, cardType];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByPhone(phone) {
    const query = 'SELECT * FROM customers WHERE phone = $1';
    const result = await db.query(query, [phone]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM customers WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const query = 'UPDATE customers SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *';
    const result = await db.query(query, [status, id]);
    return result.rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM customers ORDER BY created_at DESC';
    const result = await db.query(query);
    return result.rows;
  }
}

module.exports = Customer;
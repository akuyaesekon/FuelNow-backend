const { Pool } = require('pg');
const { database } = require('./environment');

const pool = new Pool({
  host: database.host,
  port: database.port,
  database: database.database,
  user: database.user,
  password: database.password,
  ssl: database.ssl ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
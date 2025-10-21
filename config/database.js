const { Pool } = require('pg');
const { database } = require('./environment');

// Ensure all values are properly formatted
const poolConfig = {
  host: database.host || 'localhost',
  port: database.port || 5432,
  database: database.database || 'fuelnow_db',
  user: database.user || 'postgres',
  password: String(database.password || ''), // Force to string
  ssl: database.ssl ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

console.log('Database Configuration:', {
  host: poolConfig.host,
  port: poolConfig.port,
  database: poolConfig.database,
  user: poolConfig.user,
  passwordLength: poolConfig.password.length,
  hasPassword: !!poolConfig.password
});

// Check if we have minimum required config
if (!poolConfig.host || !poolConfig.user || !poolConfig.database) {
  console.error('❌ Missing required database configuration');
}

const pool = new Pool(poolConfig);

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err.message);
});

// Test connection on startup
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connection test successful:', result.rows[0].now);
    client.release();
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
  }
};

testConnection();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
require('dotenv').config();

console.log('Environment check:', {
  DB_HOST: process.env.DB_HOST ? 'Set' : 'Missing',
  DB_USER: process.env.DB_USER ? 'Set' : 'Missing',
  DB_PASSWORD: process.env.DB_PASSWORD ? `Set (length: ${process.env.DB_PASSWORD.length})` : 'Missing',
  DB_NAME: process.env.DB_NAME ? 'Set' : 'Missing'
});

module.exports = {
  port: process.env.PORT || 3000,
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '', // Ensure it's always a string
    ssl: process.env.DB_SSL === 'true' || true
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fuelnow-secret-key',
    expiresIn: '24h'
  },
  mpesa: {
    consumerKey: process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
    shortcode: process.env.MPESA_SHORTCODE,
    passkey: process.env.MPESA_PASSKEY
  },
  sms: {
    apiKey: process.env.SMS_API_KEY,
    senderId: process.env.SMS_SENDER_ID || 'FuelNow'
  },
  interestRate: 0.10,
  activationFee: 500,
  baseUrl: process.env.BASE_URL || 'https://fuelnow-api.onrender.com'
};
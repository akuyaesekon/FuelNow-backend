const { interestRate } = require('../config/environment');

function calculateInterest(amount) {
  return parseFloat(amount) * interestRate;
}

function calculateTotalAmount(amount) {
  const interest = calculateInterest(amount);
  return parseFloat(amount) + interest;
}

module.exports = {
  calculateInterest,
  calculateTotalAmount
};
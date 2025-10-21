function generateReservationToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES'
  }).format(amount);
}

function validatePhoneNumber(phone) {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

function generateCardNumber(prefix = 'FN') {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

function calculateRemainingLimit(wallet) {
  if (wallet.card_type === 'prepaid') {
    return wallet.available_balance;
  } else {
    return wallet.credit_limit - wallet.used_credit;
  }
}

module.exports = {
  generateReservationToken,
  formatCurrency,
  validatePhoneNumber,
  generateCardNumber,
  calculateRemainingLimit
};
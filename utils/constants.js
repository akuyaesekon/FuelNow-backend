module.exports = {
  TRANSACTION_STATUS: {
    PENDING: 'pending',
    RESERVED: 'reserved',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
  },
  
  CARD_TYPES: {
    CREDIT: 'credit',
    PREPAID: 'prepaid'
  },
  
  TRANSACTION_TYPES: {
    FUEL_PURCHASE: 'fuel_purchase',
    REPAYMENT: 'repayment',
    TOP_UP: 'top_up',
    ACTIVATION_FEE: 'activation_fee'
  },
  
  WALLET_STATUS: {
    ACTIVE: 'active',
    SUSPENDED: 'suspended',
    BLOCKED: 'blocked'
  }
};
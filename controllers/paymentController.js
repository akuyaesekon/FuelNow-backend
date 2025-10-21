const CreditEngine = require('../services/creditEngine');
const MpesaService = require('../services/mpesaService');
const SMSService = require('../services/smsService');
const Wallet = require('../models/Wallet');

async function processRepayment(req, res) {
  try {
    const { phone, amount } = req.body;

    const repaymentResult = await CreditEngine.processRepayment(phone, amount);

    if (repaymentResult.success) {
      const wallet = repaymentResult.wallet;
      
      let newLimit = 0;
      if (wallet.card_type === 'prepaid') {
        newLimit = wallet.available_balance;
      } else {
        newLimit = wallet.credit_limit - wallet.used_credit;
      }

      // Send repayment confirmation SMS
      await SMSService.sendRepaymentMessage(phone, amount, newLimit);
    }

    res.json(repaymentResult);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

async function initiateMpesaPayment(req, res) {
  try {
    const { phone, amount } = req.body;

    // Validate wallet exists
    const wallet = await Wallet.findByPhone(phone);
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    // Initiate M-Pesa payment
    const mpesaResult = await MpesaService.initiateSTKPush(
      phone, 
      amount, 
      `FUELNOW-${wallet.id}`
    );

    res.json({
      success: true,
      message: 'M-Pesa payment initiated',
      data: mpesaResult
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

async function handleMpesaCallback(req, res) {
  try {
    const callbackData = req.body;
    
    const callbackResult = await MpesaService.handleCallback(callbackData);

    if (callbackResult.success) {
      // Process the successful payment
      const repaymentResult = await CreditEngine.processRepayment(
        callbackResult.phone,
        callbackResult.amount
      );

      if (repaymentResult.success) {
        const wallet = repaymentResult.wallet;
        let newLimit = wallet.card_type === 'prepaid' ? 
          wallet.available_balance : 
          wallet.credit_limit - wallet.used_credit;

        // Send confirmation SMS
        await SMSService.sendRepaymentMessage(
          callbackResult.phone,
          callbackResult.amount,
          newLimit
        );
      }

      return res.json({
        success: true,
        message: 'Payment processed successfully'
      });
    } else {
      // Handle failed payment
      console.error('M-Pesa payment failed:', callbackResult.error);
      
      return res.json({
        success: false,
        message: 'Payment failed',
        error: callbackResult.error
      });
    }

  } catch (error) {
    console.error('M-Pesa callback error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  processRepayment,
  initiateMpesaPayment,
  handleMpesaCallback
};
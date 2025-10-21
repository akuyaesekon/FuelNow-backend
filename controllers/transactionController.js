const CreditEngine = require('../services/creditEngine');
const SMSService = require('../services/smsService');
const Wallet = require('../models/Wallet');

async function validateRider(req, res) {
  try {
    const { rider_phone, station_id, attendant_id, amount } = req.body;

    const validationResult = await CreditEngine.validateRider(
      rider_phone, 
      amount, 
      station_id, 
      attendant_id,
      false // isCard
    );

    if (validationResult.approved) {
      // Send reservation SMS
      await SMSService.sendReservationMessage(
        rider_phone,
        amount,
        `Station-${station_id}`,
        validationResult.interest
      );
    }

    res.json(validationResult);

  } catch (error) {
    res.status(500).json({
      approved: false,
      error: error.message
    });
  }
}

async function validateCard(req, res) {
  try {
    const { card_token, station_id, attendant_id, amount } = req.body;

    const validationResult = await CreditEngine.validateRider(
      card_token, 
      amount, 
      station_id, 
      attendant_id,
      true // isCard
    );

    if (validationResult.approved) {
      // Send reservation SMS
      await SMSService.sendReservationMessage(
        validationResult.customer_phone,
        amount,
        `Station-${station_id}`,
        validationResult.interest
      );
    }

    res.json(validationResult);

  } catch (error) {
    res.status(500).json({
      approved: false,
      error: error.message
    });
  }
}

async function captureTransaction(req, res) {
  try {
    const { reservation_id, final_amount, litres, meter_reading } = req.body;

    const captureResult = await CreditEngine.captureTransaction(
      reservation_id,
      final_amount,
      litres,
      meter_reading
    );

    if (captureResult.success) {
      const transaction = captureResult.transaction;
      
      // Get updated wallet info
      const wallet = await Wallet.findByCustomerId(transaction.wallet_id);
      let remainingLimit = 0;
      
      if (wallet.card_type === 'prepaid') {
        remainingLimit = wallet.available_balance;
      } else {
        remainingLimit = wallet.credit_limit - wallet.used_credit;
      }

      // Send completion SMS
      await SMSService.sendCompletionMessage(
        transaction.phone,
        final_amount,
        `Station-${transaction.station_id}`,
        remainingLimit
      );
    }

    res.json(captureResult);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

async function getTransactionStatus(req, res) {
  try {
    const { reservation_id } = req.params;

    const transaction = await require('../models/Transaction').findByReservationToken(reservation_id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  validateRider,
  validateCard,
  captureTransaction,
  getTransactionStatus
};
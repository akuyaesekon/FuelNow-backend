const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Ledger = require('../models/Ledger');
const { interestRate } = require('../config/environment');
const { calculateInterest } = require('./interestCalculator');

class CreditEngine {
  static async validateRider(identifier, amount, stationId, attendantId, isCard = false) {
    try {
      let wallet;
      
      if (isCard) {
        // Validate by card token
        const Card = require('../models/Card');
        const card = await Card.findByCardToken(identifier);
        if (!card) {
          throw new Error('Invalid card token');
        }
        wallet = card;
      } else {
        // Validate by phone
        wallet = await Wallet.findByPhone(identifier);
      }
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      if (wallet.status !== 'active') {
        throw new Error('Wallet is not active');
      }

      // Calculate interest
      const interest = calculateInterest(amount);
      const totalAmount = parseFloat(amount) + interest;

      // Check balance/credit limit based on card type
      if (wallet.card_type === 'prepaid') {
        if (wallet.available_balance < totalAmount) {
          throw new Error('Insufficient balance');
        }
      } else if (wallet.card_type === 'credit') {
        const availableCredit = wallet.credit_limit - wallet.used_credit;
        if (availableCredit < totalAmount) {
          throw new Error('Credit limit exceeded');
        }
      }

      // Reserve amount
      const reservedWallet = await Wallet.reserveAmount(wallet.id, totalAmount);
      
      if (!reservedWallet) {
        throw new Error('Failed to reserve amount');
      }

      // Create transaction
      const transaction = await Transaction.create({
        walletId: wallet.id,
        type: 'fuel_purchase',
        amount: parseFloat(amount),
        interest: interest,
        stationId: stationId,
        attendantId: attendantId,
        status: 'reserved'
      });

      // Create ledger entry
      await Ledger.create({
        transactionId: transaction.id,
        walletId: wallet.id,
        debit: totalAmount,
        balance: reservedWallet.available_balance,
        description: `Fuel reservation - Station ${stationId}`
      });

      return {
        approved: true,
        reservation_id: transaction.reservation_token,
        amount: amount,
        interest: interest,
        total_amount: totalAmount,
        customer_name: wallet.name,
        customer_phone: wallet.phone,
        card_type: wallet.card_type
      };

    } catch (error) {
      console.error('Credit engine validation error:', error);
      return {
        approved: false,
        error: error.message
      };
    }
  }

  static async captureTransaction(reservationId, finalAmount, litres, meterReading) {
    try {
      const transaction = await Transaction.findByReservationToken(reservationId);
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.status !== 'reserved') {
        throw new Error('Transaction already processed');
      }

      // Calculate actual interest and total
      const actualInterest = calculateInterest(finalAmount);
      const actualTotal = parseFloat(finalAmount) + actualInterest;

      // Update transaction
      const updatedTransaction = await Transaction.updateStatus(
        transaction.id, 
        'completed', 
        finalAmount
      );

      // Update wallet balances
      const wallet = await Wallet.findByCustomerId(transaction.wallet_id);
      
      // Release reserved amount and deduct actual amount
      await Wallet.releaseReservation(wallet.id, transaction.total_amount);
      
      if (wallet.card_type === 'prepaid') {
        await Wallet.updateBalance(wallet.id, -actualTotal);
      } else {
        await Wallet.updateUsedCredit(wallet.id, actualTotal);
      }

      // Update ledger
      const currentBalance = await Ledger.getCurrentBalance(wallet.id);
      await Ledger.create({
        transactionId: transaction.id,
        walletId: wallet.id,
        debit: actualTotal,
        balance: currentBalance - actualTotal,
        description: `Fuel purchase completed - ${litres}L at Station ${transaction.station_id}`
      });

      return {
        success: true,
        transaction: updatedTransaction,
        final_amount: finalAmount,
        interest: actualInterest,
        total_amount: actualTotal
      };

    } catch (error) {
      console.error('Transaction capture error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async processRepayment(phone, amount) {
    try {
      const wallet = await Wallet.findByPhone(phone);
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      if (wallet.card_type === 'prepaid') {
        // For prepaid, add to balance
        await Wallet.updateBalance(wallet.id, parseFloat(amount));
      } else {
        // For credit, reduce used credit
        await Wallet.updateUsedCredit(wallet.id, -parseFloat(amount));
      }

      // Create transaction record
      const transaction = await Transaction.create({
        walletId: wallet.id,
        type: 'repayment',
        amount: amount,
        interest: 0,
        stationId: 'mpesa',
        attendantId: 'system',
        status: 'completed'
      });

      // Update ledger
      const currentBalance = await Ledger.getCurrentBalance(wallet.id);
      await Ledger.create({
        transactionId: transaction.id,
        walletId: wallet.id,
        credit: parseFloat(amount),
        balance: currentBalance + parseFloat(amount),
        description: 'M-Pesa repayment'
      });

      return {
        success: true,
        wallet: await Wallet.findByCustomerId(wallet.customer_id),
        transaction: transaction
      };

    } catch (error) {
      console.error('Repayment processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = CreditEngine;
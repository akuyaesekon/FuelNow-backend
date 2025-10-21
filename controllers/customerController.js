const Customer = require('../models/Customer');
const Wallet = require('../models/Wallet');
const Card = require('../models/Card');
const SMSService = require('../services/smsService');
const { activationFee } = require('../config/environment');

async function onboardCustomer(req, res) {
  try {
    const { name, phone, idNumber, nextOfKin, cardType } = req.body;

    // Check if customer exists
    const existingCustomer = await Customer.findByPhone(phone);
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Customer already exists'
      });
    }

    // Create customer
    const customer = await Customer.create({
      name,
      phone,
      idNumber,
      nextOfKin,
      cardType
    });

    // Set credit limit based on card type
    const creditLimit = cardType === 'credit' ? 1000 : 0;
    
    // Create wallet
    const wallet = await Wallet.create({
      customerId: customer.id,
      cardType: cardType,
      creditLimit: creditLimit,
      balance: cardType === 'prepaid' ? 0 : creditLimit
    });

    // Generate card (in production, use proper card generation)
    const cardNumber = `FN${Date.now()}${Math.random().toString(36).substr(2, 6)}`.toUpperCase();
    const cardToken = `TKN${Date.now()}${Math.random().toString(36).substr(2, 8)}`.toUpperCase();
    
    const card = await Card.create({
      walletId: wallet.id,
      cardNumber: cardNumber,
      cardToken: cardToken,
      cardType: cardType
    });

    // Send welcome SMS
    await SMSService.sendWelcomeMessage(phone, cardType, creditLimit);

    res.status(201).json({
      success: true,
      message: 'Customer onboarded successfully',
      data: {
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          cardType: customer.card_type
        },
        wallet: {
          creditLimit: wallet.credit_limit,
          availableBalance: wallet.available_balance
        },
        card: {
          cardNumber: card.card_number,
          cardToken: card.card_token
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

async function getCustomerByPhone(req, res) {
  try {
    const { phone } = req.params;

    const customer = await Customer.findByPhone(phone);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const wallet = await Wallet.findByCustomerId(customer.id);

    res.json({
      success: true,
      data: {
        customer,
        wallet
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

async function getAllCustomers(req, res) {
  try {
    const customers = await Customer.findAll();
    
    res.json({
      success: true,
      data: customers
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  onboardCustomer,
  getCustomerByPhone,
  getAllCustomers
};
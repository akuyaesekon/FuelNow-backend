const axios = require('axios');

class SMSService {
  static async sendSMS(phone, message) {
    try {
      // In production, integrate with actual SMS gateway like Africa's Talking
      console.log(`[SMS] To: ${phone}, Message: ${message}`);
      
      // Example implementation for Africa's Talking
      /*
      const response = await axios.post(
        'https://api.africastalking.com/version1/messaging',
        new URLSearchParams({
          username: process.env.AT_USERNAME,
          to: phone,
          message: message,
          from: process.env.SMS_SENDER_ID
        }),
        {
          headers: {
            'ApiKey': process.env.AT_API_KEY,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      */
      
      return { success: true, message: 'SMS sent successfully' };
    } catch (error) {
      console.error('SMS sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendWelcomeMessage(phone, cardType, creditLimit) {
    const message = `Welcome to FuelNow. Your ${cardType} Card is activated. Activation fee Ksh 500 received. ${cardType === 'credit' ? `Credit limit: Ksh ${creditLimit}.` : ''}`;
    return await this.sendSMS(phone, message);
  }

  static async sendReservationMessage(phone, amount, station, interest) {
    const total = parseFloat(amount) + parseFloat(interest);
    const message = `Ksh ${amount} reserved (+10% interest) at ${station}. Total: Ksh ${total}. Present your phone number or card to the attendant.`;
    return await this.sendSMS(phone, message);
  }

  static async sendCompletionMessage(phone, amount, station, remainingLimit) {
    const message = `Fuel purchase Ksh ${amount} (+10% interest) at ${station}. Remaining limit: Ksh ${remainingLimit}.`;
    return await this.sendSMS(phone, message);
  }

  static async sendRepaymentMessage(phone, amount, newLimit) {
    const message = `Payment of Ksh ${amount} received. New limit: Ksh ${newLimit}.`;
    return await this.sendSMS(phone, message);
  }
}

module.exports = SMSService;
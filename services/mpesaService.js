const axios = require('axios');
const { mpesa } = require('../config/environment');

class MpesaService {
  static async getAuthToken() {
    try {
      const auth = Buffer.from(`${mpesa.consumerKey}:${mpesa.consumerSecret}`).toString('base64');
      
      const response = await axios.get(
        'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        }
      );
      
      return response.data.access_token;
    } catch (error) {
      console.error('M-Pesa auth token error:', error);
      throw error;
    }
  }

  static async initiateSTKPush(phone, amount, accountReference) {
    try {
      const token = await this.getAuthToken();
      const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, -4);
      const password = Buffer.from(`${mpesa.shortcode}${mpesa.passkey}${timestamp}`).toString('base64');
      
      const response = await axios.post(
        'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        {
          BusinessShortCode: mpesa.shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: amount,
          PartyA: phone,
          PartyB: mpesa.shortcode,
          PhoneNumber: phone,
          CallBackURL: `${process.env.BASE_URL}/api/v1/mpesa/callback`,
          AccountReference: accountReference,
          TransactionDesc: 'FuelNow Payment'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('M-Pesa STK push error:', error);
      throw error;
    }
  }

  static async handleCallback(callbackData) {
    try {
      const result = callbackData.Body.stkCallback;
      const resultCode = result.ResultCode;
      
      if (resultCode === 0) {
        // Payment successful
        const metadata = result.CallbackMetadata.Item;
        const amount = metadata.find(item => item.Name === 'Amount').Value;
        const phone = metadata.find(item => item.Name === 'PhoneNumber').Value;
        const mpesaReceipt = metadata.find(item => item.Name === 'MpesaReceiptNumber').Value;
        
        return {
          success: true,
          amount: amount,
          phone: phone,
          mpesaReceipt: mpesaReceipt,
          result: result
        };
      } else {
        return {
          success: false,
          error: result.ResultDesc,
          result: result
        };
      }
    } catch (error) {
      console.error('M-Pesa callback handling error:', error);
      throw error;
    }
  }
}

module.exports = MpesaService;
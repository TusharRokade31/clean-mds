// api/services/phonePeService.js
import crypto from 'crypto';
import axios from 'axios';

class PhonePeService {
  constructor() {
    this.env = process.env.PHONEPE_ENV || 'UAT';
    
    // Local API URL for internal use
    this.apiUrl = process.env.API_URL || 'http://localhost:5000/api';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // Webhook URL - Use ngrok URL for PhonePe callbacks
    this.webhookUrl = process.env.PHONEPE_WEBHOOK_URL || this.apiUrl;
    
    if (this.env === 'UAT') {
      this.merchantId = 'PGTESTPAYUAT';
      this.saltKey = '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
      this.saltIndex = 1;
      this.baseUrl = 'https://api-preprod.phonepe.com/apis/pg-sandbox';
    } else {
      this.merchantId = 'M23MVE617LNAK_2602111741';
      this.saltKey = 'ZTYyYjQxNWMtNWE5MS00ODM4LWIzZmMtNjBkNDVlNTNmOGUz';
      this.saltIndex = 1;
      this.baseUrl = 'https://api.phonepe.com/apis/hermes';
    }
    
    console.log('PhonePe Service initialized');
    console.log('Environment:', this.env);
    console.log('Merchant ID:', this.merchantId);
    console.log('API URL:', this.apiUrl);
    console.log('Webhook URL:', this.webhookUrl);
    console.log('Frontend URL:', this.frontendUrl);
    console.log('Base URL:', this.baseUrl);
  }

  generateChecksum(payload, endpoint) {
    const bufferObj = Buffer.from(JSON.stringify(payload), 'utf8');
    const base64EncodedPayload = bufferObj.toString('base64');
    const stringToHash = base64EncodedPayload + endpoint + this.saltKey;
    const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const xVerify = sha256Hash + '###' + this.saltIndex;
    
    return {
      base64Payload: base64EncodedPayload,
      xVerify: xVerify
    };
  }

  verifyWebhookChecksum(xVerify, base64Response) {
    try {
      const stringToHash = base64Response + this.saltKey;
      const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
      const expectedChecksum = sha256Hash + '###' + this.saltIndex;
      
      console.log('Webhook Verification:');
      console.log('Received X-VERIFY:', xVerify);
      console.log('Expected X-VERIFY:', expectedChecksum);
      console.log('Match:', xVerify === expectedChecksum);
      
      return xVerify === expectedChecksum;
    } catch (error) {
      console.error('Webhook checksum verification error:', error);
      return false;
    }
  }

  async initiatePayment(bookingData) {
    try {
      const merchantTransactionId = `MT${Date.now()}`;
      const merchantUserId = bookingData.userId || `MUID${Date.now()}`;

      const payload = {
        merchantId: this.merchantId,
        merchantTransactionId: merchantTransactionId,
        merchantUserId: merchantUserId,
        amount: Math.round(bookingData.amount * 100),
        redirectUrl: `${this.frontendUrl}/payment/verify?merchantTransactionId=${merchantTransactionId}`,
        redirectMode: 'REDIRECT',
        callbackUrl: `${this.webhookUrl}/payments/phonepe/webhook`,
        mobileNumber: bookingData.phone.replace(/\D/g, ''),
        paymentInstrument: {
          type: 'PAY_PAGE'
        }
      };

      console.log('Initiating payment with payload:', JSON.stringify(payload, null, 2));

      const endpoint = '/pg/v1/pay';
      const { base64Payload, xVerify } = this.generateChecksum(payload, endpoint);

      const response = await axios.post(
        `${this.baseUrl}${endpoint}`,
        {
          request: base64Payload
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': xVerify,
            'accept': 'application/json'
          }
        }
      );

      console.log('PhonePe API Response:', JSON.stringify(response.data, null, 2));

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          merchantTransactionId: merchantTransactionId,
          paymentUrl: response.data.data.instrumentResponse.redirectInfo.url
        };
      } else {
        throw new Error(response.data.message || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('PhonePe initiate payment error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || 'Payment initiation failed');
    }
  }

  async checkPaymentStatus(merchantTransactionId) {
    try {
      console.log('Checking payment status for:', merchantTransactionId);

      const endpoint = `/pg/v1/status/${this.merchantId}/${merchantTransactionId}`;
      const stringToHash = endpoint + this.saltKey;
      const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
      const xVerify = sha256Hash + '###' + this.saltIndex;

      const response = await axios.get(
        `${this.baseUrl}${endpoint}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': xVerify,
            'X-MERCHANT-ID': this.merchantId,
            'accept': 'application/json'
          }
        }
      );

      console.log('Payment status response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('PhonePe status check error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || 'Status check failed');
    }
  }

  async processRefund(refundData) {
    try {
      const merchantTransactionId = `MR${Date.now()}`;

      const payload = {
        merchantId: this.merchantId,
        merchantTransactionId: merchantTransactionId,
        originalTransactionId: refundData.originalTransactionId,
        amount: Math.round(refundData.amount * 100),
        callbackUrl: `${this.webhookUrl}/payments/phonepe/webhook/refund`
      };

      console.log('Processing refund with payload:', JSON.stringify(payload, null, 2));

      const endpoint = '/pg/v1/refund';
      const { base64Payload, xVerify } = this.generateChecksum(payload, endpoint);

      const response = await axios.post(
        `${this.baseUrl}${endpoint}`,
        {
          request: base64Payload
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': xVerify,
            'accept': 'application/json'
          }
        }
      );

      console.log('Refund response:', JSON.stringify(response.data, null, 2));

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          merchantTransactionId: merchantTransactionId
        };
      } else {
        throw new Error(response.data.message || 'Refund failed');
      }
    } catch (error) {
      console.error('PhonePe refund error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || 'Refund failed');
    }
  }
}

export default new PhonePeService();

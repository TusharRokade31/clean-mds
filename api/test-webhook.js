// test-webhook.js
import axios from 'axios';
import crypto from 'crypto';

const testWebhook = async () => {
  const saltKey = '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
  const saltIndex = 1;

  // Sample webhook payload
  const webhookData = {
    success: true,
    code: 'PAYMENT_SUCCESS',
    message: 'Payment completed successfully',
    data: {
      merchantId: 'PGTESTPAYUAT',
      merchantTransactionId: 'MT1234567890',
      transactionId: 'T1234567890',
      amount: 10000, // 100 INR in paise
      state: 'COMPLETED',
      responseCode: 'SUCCESS'
    }
  };

  // Encode payload
  const base64Payload = Buffer.from(JSON.stringify(webhookData)).toString('base64');

  // Generate checksum
  const stringToHash = base64Payload + saltKey;
  const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
  const xVerify = sha256Hash + '###' + saltIndex;

  console.log('Testing webhook...');
  console.log('Base64 Payload:', base64Payload);
  console.log('X-VERIFY:', xVerify);

  try {
    const response = await axios.post(
      'http://localhost:5000/api/payments/phonepe/webhook',
      {
        response: base64Payload
      },
      {
        headers: {
          'X-VERIFY': xVerify,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Webhook response:', response.data);
  } catch (error) {
    console.error('Webhook test error:', error.response?.data || error.message);
  }
};

testWebhook();
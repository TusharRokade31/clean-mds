// test-phonepe.js (temporary hardcoded version for testing)
import phonePeService from './services/phonePeService.js';

// Manually set environment variables for testing
process.env.API_URL = 'http://localhost:5000/api';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.PHONEPE_ENV = 'UAT';

async function testPhonePe() {
  try {
    console.log('Testing PhonePe Service...');
    console.log('='.repeat(50));
    
    const testPayment = {
      bookingId: 'BK001',
      amount: 1,
      phone: '9999999999',
      userId: 'USER001'
    };

    console.log('Test payment data:', JSON.stringify(testPayment, null, 2));
    console.log('='.repeat(50));
    
    const result = await phonePeService.initiatePayment(testPayment);
    
    console.log('='.repeat(50));
    console.log('✅ Payment initiated successfully!');
    console.log('Payment URL:', result.paymentUrl);
    console.log('Transaction ID:', result.merchantTransactionId);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.log('='.repeat(50));
    console.error('❌ Test failed:', error.message);
    console.log('='.repeat(50));
  }
}

testPhonePe();
// test-complete-flow.js
import 'dotenv/config';
import phonePeService from './services/phonePeService.js';

async function testCompleteFlow() {
  try {
    console.log('='.repeat(80));
    console.log('Testing Complete PhonePe Payment Flow');
    console.log('='.repeat(80));
    
    // Step 1: Initiate payment
    console.log('\n📝 Step 1: Initiating payment...');
    
    const testPayment = {
      bookingId: 'BK001',
      amount: 1, // ₹1 for testing
      phone: '9999999999',
      userId: 'USER001'
    };

    const result = await phonePeService.initiatePayment(testPayment);
    
    console.log('\n✅ Payment initiated successfully!');
    console.log('Transaction ID:', result.merchantTransactionId);
    console.log('Payment URL:', result.paymentUrl);
    
    console.log('\n🔗 Next steps:');
    console.log('1. Open this URL in browser:', result.paymentUrl);
    console.log('2. Complete the payment');
    console.log('3. PhonePe will send webhook to:', process.env.PHONEPE_WEBHOOK_URL);
    console.log('4. Check your server logs for webhook data');
    
    // Step 2: Check initial status
    console.log('\n📊 Step 2: Checking payment status...');
    
    const status = await phonePeService.checkPaymentStatus(result.merchantTransactionId);
    console.log('Current Status:', status.code);
    console.log('State:', status.data?.state);
    
    console.log('\n' + '='.repeat(80));
    console.log('Test completed! Now complete payment in browser to trigger webhook.');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

testCompleteFlow();
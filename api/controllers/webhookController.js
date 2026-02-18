// api/controllers/webhookController.js
import phonePeService from '../services/phonePeService.js';
import Booking from '../models/BookingSchema.js';
import Payment from '../models/Payment.js';

export const webhookController = {
  // PhonePe Payment Webhook
  handlePhonePeWebhook: async (req, res) => {
    try {
      console.log('='.repeat(80));
      console.log('PhonePe Webhook Received');
      console.log('Time:', new Date().toISOString());
      console.log('Headers:', JSON.stringify(req.headers, null, 2));
      console.log('Body:', JSON.stringify(req.body, null, 2));
      console.log('='.repeat(80));

      // PhonePe sends data in base64 encoded format
      const base64Response = req.body.response;
      const xVerify = req.headers['x-verify'];

      if (!base64Response) {
        console.error('No response data in webhook');
        return res.status(400).json({
          success: false,
          message: 'No response data provided'
        });
      }

      // Verify checksum
      const isValidChecksum = phonePeService.verifyWebhookChecksum(xVerify, base64Response);
      
      if (!isValidChecksum) {
        console.error('Invalid webhook checksum');
        return res.status(400).json({
          success: false,
          message: 'Invalid checksum'
        });
      }

      console.log('✅ Checksum verified successfully');

      // Decode the response
      const decodedResponse = JSON.parse(
        Buffer.from(base64Response, 'base64').toString('utf8')
      );

      console.log('Decoded webhook data:', JSON.stringify(decodedResponse, null, 2));

      const { code, message, data } = decodedResponse;
      const merchantTransactionId = data?.merchantTransactionId;
      const transactionId = data?.transactionId;
      const amount = data?.amount; // Amount in paise
      const state = data?.state;

      if (!merchantTransactionId) {
        console.error('No merchantTransactionId in webhook data');
        return res.status(400).json({
          success: false,
          message: 'Invalid webhook data'
        });
      }

      // Find payment record
      const payment = await Payment.findOne({ merchantTransactionId })
        .populate('booking');

      if (!payment) {
        console.error('Payment record not found:', merchantTransactionId);
        return res.status(404).json({
          success: false,
          message: 'Payment record not found'
        });
      }

      console.log('Payment record found:', payment._id);

      // Process based on payment state
      if (code === 'PAYMENT_SUCCESS' && state === 'COMPLETED') {
        console.log('Processing successful payment...');

        // Update payment record
        payment.status = 'completed';
        payment.transactionId = transactionId;
        payment.paymentDate = new Date();
        await payment.save();

        console.log('Payment record updated to completed');

        // Update booking
        const booking = await Booking.findById(payment.booking._id);
        if (booking) {
          booking.payment.paidAmount += payment.amount;
          booking.payment.pendingAmount = 
            booking.pricing.totalAmount - booking.payment.paidAmount;
          booking.payment.status = 
            booking.payment.paidAmount >= booking.pricing.totalAmount 
              ? 'completed' 
              : 'partial';
          booking.payment.transactionId = transactionId;
          booking.payment.paymentDate = new Date();
          booking.payment.method = 'upi';
          
          // Auto-confirm booking if payment is complete
          if (booking.payment.status === 'completed' && booking.status === 'pending') {
            booking.status = 'confirmed';
          }
          
          await booking.save();

          console.log('Booking updated:', booking.bookingId);
          console.log('Booking status:', booking.status);
          console.log('Payment status:', booking.payment.status);
        }

        // Send confirmation email (optional)
        // await sendPaymentSuccessEmail(booking, payment);

        return res.status(200).json({
          success: true,
          message: 'Payment webhook processed successfully'
        });

      } else if (code === 'PAYMENT_ERROR' || code === 'PAYMENT_DECLINED' || state === 'FAILED') {
        console.log('Processing failed payment...');

        // Update payment as failed
        payment.status = 'failed';
        payment.failureReason = message || 'Payment failed';
        await payment.save();

        console.log('Payment marked as failed:', payment.failureReason);

        return res.status(200).json({
          success: true,
          message: 'Payment failure webhook processed'
        });

      } else if (state === 'PENDING') {
        console.log('Payment is still pending');

        return res.status(200).json({
          success: true,
          message: 'Payment pending webhook received'
        });

      } else {
        console.log('Unknown payment state:', state);

        return res.status(200).json({
          success: true,
          message: 'Webhook received with unknown state'
        });
      }

    } catch (error) {
      console.error('Webhook processing error:', error);
      
      // Always return 200 to PhonePe to avoid retries
      return res.status(200).json({
        success: false,
        message: 'Webhook processing error',
        error: error.message
      });
    }
  },

  // PhonePe Refund Webhook
  handlePhonePeRefundWebhook: async (req, res) => {
    try {
      console.log('='.repeat(80));
      console.log('PhonePe Refund Webhook Received');
      console.log('Time:', new Date().toISOString());
      console.log('Body:', JSON.stringify(req.body, null, 2));
      console.log('='.repeat(80));

      const base64Response = req.body.response;
      const xVerify = req.headers['x-verify'];

      if (!base64Response) {
        return res.status(400).json({
          success: false,
          message: 'No response data provided'
        });
      }

      // Verify checksum
      const isValidChecksum = phonePeService.verifyWebhookChecksum(xVerify, base64Response);
      
      if (!isValidChecksum) {
        console.error('Invalid refund webhook checksum');
        return res.status(400).json({
          success: false,
          message: 'Invalid checksum'
        });
      }

      console.log('✅ Refund webhook checksum verified');

      // Decode response
      const decodedResponse = JSON.parse(
        Buffer.from(base64Response, 'base64').toString('utf8')
      );

      console.log('Decoded refund webhook:', JSON.stringify(decodedResponse, null, 2));

      const { code, data } = decodedResponse;
      const merchantTransactionId = data?.merchantTransactionId;
      const state = data?.state;

      if (code === 'PAYMENT_SUCCESS' && state === 'COMPLETED') {
        console.log('Refund completed successfully');

        // Find the original payment and update it
        const refundTransactionId = merchantTransactionId;
        
        // You can add additional refund tracking logic here
        
        return res.status(200).json({
          success: true,
          message: 'Refund webhook processed successfully'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Refund webhook received'
      });

    } catch (error) {
      console.error('Refund webhook error:', error);
      
      return res.status(200).json({
        success: false,
        message: 'Refund webhook processing error',
        error: error.message
      });
    }
  },

  // Test webhook endpoint
  testWebhook: async (req, res) => {
    try {
      console.log('Test webhook called');
      console.log('Headers:', req.headers);
      console.log('Body:', req.body);

      res.json({
        success: true,
        message: 'Test webhook received',
        timestamp: new Date().toISOString(),
        data: req.body
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Test webhook error',
        error: error.message
      });
    }
  }
};
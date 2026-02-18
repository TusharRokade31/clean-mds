// api/controllers/paymentController.js
import phonePeService from '../services/phonePeService.js';
import Booking from '../models/BookingSchema.js';
import Payment from '../models/Payment.js';

export const paymentController = {
  // Initiate PhonePe payment
  initiatePhonePePayment: async (req, res) => {
    try {
      const { bookingId, amount, phone } = req.body;

      console.log('Payment initiation request:', { bookingId, amount, phone });

      if (!bookingId || !amount || !phone) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: bookingId, amount, phone'
        });
      }

      // Validate booking
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      // Check if payment already exists and is pending
      const existingPayment = await Payment.findOne({
        booking: bookingId,
        status: 'pending'
      });

      if (existingPayment) {
        return res.status(400).json({
          success: false,
          message: 'A pending payment already exists for this booking'
        });
      }

      // Prepare payment data
      const paymentData = {
        bookingId: booking.bookingId,
        amount: amount,
        phone: phone,
        userId: req.user?._id?.toString()
      };

      // Initiate payment with PhonePe SDK
      const result = await phonePeService.initiatePayment(paymentData);

      // Save payment record
      const payment = new Payment({
        booking: bookingId,
        merchantTransactionId: result.merchantTransactionId,
        amount: amount,
        status: 'pending',
        gateway: 'phonepe',
        createdBy: req.user?._id
      });

      await payment.save();

      console.log('Payment record created:', payment);

      res.json({
        success: true,
        message: 'Payment initiated successfully',
        data: {
          paymentUrl: result.paymentUrl,
          merchantTransactionId: result.merchantTransactionId
        }
      });

    } catch (error) {
      console.error('Initiate payment error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to initiate payment',
        error: error.message
      });
    }
  },

  // PhonePe callback handler
  phonePeCallback: async (req, res) => {
    try {
      const response = req.body.response;
      const xVerify = req.headers['x-verify'];

      console.log('PhonePe Callback received:', { 
        hasResponse: !!response, 
        hasXVerify: !!xVerify 
      });

      if (!response) {
        console.error('No response in callback');
        return res.status(400).json({
          success: false,
          message: 'No response provided'
        });
      }

      // Verify checksum
      const isValid = phonePeService.verifyCallback(xVerify, response);
      console.log('Checksum verification:', isValid);

      if (!isValid) {
        console.error('Invalid checksum verification');
        return res.status(400).json({
          success: false,
          message: 'Invalid checksum'
        });
      }

      // Decode response
      const decodedResponse = JSON.parse(
        Buffer.from(response, 'base64').toString('utf8')
      );

      console.log('Decoded PhonePe Response:', JSON.stringify(decodedResponse, null, 2));

      const merchantTransactionId = decodedResponse.data?.merchantTransactionId;

      if (!merchantTransactionId) {
        console.error('No merchantTransactionId in response');
        return res.status(400).json({
          success: false,
          message: 'Invalid response format'
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

      // Update payment status based on response
      if (decodedResponse.code === 'PAYMENT_SUCCESS') {
        payment.status = 'completed';
        payment.transactionId = decodedResponse.data.transactionId;
        payment.paymentDate = new Date();
        await payment.save();

        console.log('Payment marked as completed');

        // Update booking payment status
        const booking = await Booking.findById(payment.booking);
        if (booking) {
          booking.payment.paidAmount += payment.amount;
          booking.payment.pendingAmount = 
            booking.pricing.totalAmount - booking.payment.paidAmount;
          booking.payment.status = 
            booking.payment.paidAmount >= booking.pricing.totalAmount 
              ? 'completed' 
              : 'partial';
          booking.payment.transactionId = decodedResponse.data.transactionId;
          booking.payment.paymentDate = new Date();
          booking.payment.method = 'upi'; // PhonePe uses UPI
          await booking.save();

          console.log('Booking updated with payment info:', booking.bookingId);
        }

        // Redirect to success page
        return res.redirect(
          `${process.env.FRONTEND_URL}/bookings/${booking._id}/payment-success?transactionId=${decodedResponse.data.transactionId}`
        );
      } else {
        payment.status = 'failed';
        payment.failureReason = decodedResponse.message || 'Payment failed';
        await payment.save();

        console.log('Payment marked as failed:', decodedResponse.message);

        // Redirect to failure page
        return res.redirect(
          `${process.env.FRONTEND_URL}/bookings/${payment.booking._id}/payment-failed?reason=${encodeURIComponent(decodedResponse.message || 'Payment failed')}`
        );
      }

    } catch (error) {
      console.error('PhonePe callback error:', error);
      
      // Try to redirect to error page even on exception
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(
        `${frontendUrl}/payment-error?message=${encodeURIComponent(error.message)}`
      );
    }
  },

  // Check payment status
  checkPaymentStatus: async (req, res) => {
    try {
      const { merchantTransactionId } = req.params;

      console.log('Checking payment status for:', merchantTransactionId);

      // Check status using SDK
      const status = await phonePeService.checkPaymentStatus(merchantTransactionId);

      // Update local payment record
      const payment = await Payment.findOne({ merchantTransactionId })
        .populate('booking');

      if (payment) {
        if (status.code === 'PAYMENT_SUCCESS' && payment.status !== 'completed') {
          payment.status = 'completed';
          payment.transactionId = status.data.transactionId;
          payment.paymentDate = new Date();
          await payment.save();

          // Update booking
          const booking = await Booking.findById(payment.booking);
          if (booking && booking.payment.status !== 'completed') {
            booking.payment.paidAmount += payment.amount;
            booking.payment.pendingAmount = 
              booking.pricing.totalAmount - booking.payment.paidAmount;
            booking.payment.status = 
              booking.payment.paidAmount >= booking.pricing.totalAmount 
                ? 'completed' 
                : 'partial';
            booking.payment.transactionId = status.data.transactionId;
            booking.payment.paymentDate = new Date();
            await booking.save();
          }

          console.log('Payment and booking updated after status check');
        } else if (status.code === 'PAYMENT_ERROR' || status.code === 'PAYMENT_DECLINED') {
          payment.status = 'failed';
          payment.failureReason = status.message;
          await payment.save();
        }
      }

      res.json({
        success: true,
        data: status
      });

    } catch (error) {
      console.error('Check status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check payment status',
        error: error.message
      });
    }
  },

  // Process refund
  processRefund: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const { amount, originalTransactionId } = req.body;

      console.log('Processing refund:', { bookingId, amount, originalTransactionId });

      if (!amount || !originalTransactionId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: amount, originalTransactionId'
        });
      }

      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      // Find the original payment
      const originalPayment = await Payment.findOne({
        booking: bookingId,
        transactionId: originalTransactionId,
        status: 'completed'
      });

      if (!originalPayment) {
        return res.status(404).json({
          success: false,
          message: 'Original payment not found or not completed'
        });
      }

      // Check if refund amount is valid
      if (amount > originalPayment.amount) {
        return res.status(400).json({
          success: false,
          message: 'Refund amount cannot exceed original payment amount'
        });
      }

      const refundData = {
        bookingId: booking.bookingId,
        originalTransactionId,
        amount
      };

      // Process refund using SDK
      const result = await phonePeService.processRefund(refundData);

      // Update payment status
      originalPayment.status = 'refunded';
      await originalPayment.save();

      // Update booking
      booking.payment.paidAmount -= amount;
      booking.payment.pendingAmount = booking.pricing.totalAmount - booking.payment.paidAmount;
      booking.payment.status = booking.payment.paidAmount > 0 ? 'partial' : 'pending';
      await booking.save();

      console.log('Refund processed successfully');

      res.json({
        success: true,
        message: 'Refund initiated successfully',
        data: result
      });

    } catch (error) {
      console.error('Refund error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process refund',
        error: error.message
      });
    }
  },

  // Get all payments (admin)
  getAllPayments: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        bookingId,
        gateway = 'phonepe',
      } = req.query;

      const filter = { gateway };
      
      if (status) filter.status = status;
      if (bookingId) filter.booking = bookingId;

      const skip = (page - 1) * limit;

      const payments = await Payment.find(filter)
        .populate('booking', 'bookingId primaryGuest pricing')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Payment.countDocuments(filter);

      res.json({
        success: true,
        data: {
          payments,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalPayments: total,
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1,
          },
        },
      });

    } catch (error) {
      console.error('Get payments error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching payments',
        error: error.message,
      });
    }
  },

  // Get user's own payments
  getSelfPayments: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        bookingId,
      } = req.query;

      const filter = {
        createdBy: req.user._id,
      };
      
      if (status) filter.status = status;
      if (bookingId) filter.booking = bookingId;

      const skip = (page - 1) * limit;

      const payments = await Payment.find(filter)
        .populate('booking', 'bookingId primaryGuest pricing property')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Payment.countDocuments(filter);

      res.json({
        success: true,
        data: {
          payments,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalPayments: total,
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1,
          },
        },
      });

    } catch (error) {
      console.error('Get self payments error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching your payments',
        error: error.message,
      });
    }
  },
};
// api/controllers/paymentController.js
import phonePeService from '../services/phonePeService.js';
import Booking from '../models/BookingSchema.js';
import Payment from '../models/Payment.js';

export const paymentController = {

initiatePhonePePayment: async (req, res) => {
  try {
    const { bookingId, phone } = req.body; // ❌ Remove amount from here

    if (!bookingId || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: bookingId, phone'
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // ✅ Only allow payment initiation for draft/pending bookings
    if (!['draft', 'pending'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Booking is already ${booking.status}. Cannot initiate payment.`
      });
    }

    // ✅ Use amount from DB, never from frontend
    const amount = booking.pricing.totalAmount;

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

    const paymentData = {
      bookingId: booking.bookingId,
      amount,   // ✅ Server-calculated
      phone,
      userId: req.user?._id?.toString()
    };

    const result = await phonePeService.initiatePayment(paymentData);

    const payment = new Payment({
      booking: bookingId,
      merchantTransactionId: result.merchantTransactionId,
      amount, // ✅ Server-calculated
      status: 'pending',
      gateway: 'phonepe',
      createdBy: req.user?._id
    });
    await payment.save();

    return res.json({
      success: true,
      message: 'Payment initiated successfully',
      data: {
        paymentUrl: result.paymentUrl,
        merchantTransactionId: result.merchantTransactionId
      }
    });

  } catch (error) {
    console.error('Initiate payment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to initiate payment'
    });
  }
},

  /**
   * PhonePe redirects user back here via GET after payment
   * URL: /api/payments/phonepe/callback?merchantTransactionId=xxx
   * We verify status via API call (not base64 body) in the new SDK flow
   */
phonePeCallback: async (req, res) => {
  try {
    const { merchantTransactionId } = req.query;

    if (!merchantTransactionId) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment-error?message=Missing+transaction+ID`);
    }

    const status = await phonePeService.checkPaymentStatus(merchantTransactionId);
    const payment = await Payment.findOne({ merchantTransactionId }).populate('booking');

    if (!payment) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment-error?message=Payment+record+not+found`);
    }

    const bookingId = payment.booking._id || payment.booking;

    if (status.code === 'PAYMENT_SUCCESS') {
      // Update payment
      payment.status = 'completed';
      payment.transactionId = status.data.transactionId;
      payment.paymentDate = new Date();
      await payment.save();

      // Activate booking — move from draft to pending
      const booking = await Booking.findById(bookingId);
      if (booking) {
        booking.status = 'pending'; // now blocks the room
        booking.payment.paidAmount += payment.amount;
        booking.payment.pendingAmount = booking.pricing.totalAmount - booking.payment.paidAmount;
        booking.payment.status =
          booking.payment.paidAmount >= booking.pricing.totalAmount ? 'completed' : 'partial';
        booking.payment.transactionId = status.data.transactionId;
        booking.payment.paymentDate = new Date();
        booking.payment.method = 'upi';
        await booking.save();
      }

      return res.redirect(
        `${process.env.FRONTEND_URL}/booking-confirmation/${bookingId}/payment-success?transactionId=${status.data.transactionId}`
      );

    } else if (status.code === 'PAYMENT_PENDING') {
      return res.redirect(
        `${process.env.FRONTEND_URL}/booking-confirmation/${bookingId}/payment-pending?merchantTransactionId=${merchantTransactionId}`
      );

    } else {
      // Payment failed — mark payment failed and DELETE the draft booking
      payment.status = 'failed';
      payment.failureReason = status.message || 'Payment failed';
      await payment.save();

      // Delete draft booking so room is freed for retry
      await Booking.findByIdAndDelete(bookingId);

      return res.redirect(
        `${process.env.FRONTEND_URL}/booking-confirmation/${bookingId}/payment-failed?reason=${encodeURIComponent(status.message || 'Payment failed')}`
      );
    }

  } catch (error) {
    console.error('PhonePe callback error:', error);
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment-error?message=${encodeURIComponent(error.message)}`
    );
  }
},

  // Manual status check (polling from frontend)
  checkPaymentStatus: async (req, res) => {
    try {
      const { merchantTransactionId } = req.params;

      const status = await phonePeService.checkPaymentStatus(merchantTransactionId);

      const payment = await Payment.findOne({ merchantTransactionId }).populate('booking');

      if (payment && status.code === 'PAYMENT_SUCCESS' && payment.status !== 'completed') {
        payment.status = 'completed';
        payment.transactionId = status.data.transactionId;
        payment.paymentDate = new Date();
        await payment.save();

        const booking = await Booking.findById(payment.booking._id || payment.booking);
        if (booking && booking.payment.status !== 'completed') {
          booking.status = 'pending';
          booking.payment.paidAmount += payment.amount;
          booking.payment.pendingAmount = booking.pricing.totalAmount - booking.payment.paidAmount;
          booking.payment.status =
            booking.payment.paidAmount >= booking.pricing.totalAmount ? 'completed' : 'partial';
          booking.payment.transactionId = status.data.transactionId;
          booking.payment.paymentDate = new Date();
          await booking.save();
        }
      } else if (
        payment &&
        (status.code === 'PAYMENT_ERROR' || status.code === 'PAYMENT_DECLINED') &&
        payment.status === 'pending'
      ) {
        payment.status = 'failed';
        payment.failureReason = status.message;
        await payment.save();
        await Booking.findByIdAndDelete(payment.booking._id || payment.booking);
      }

      return res.json({ success: true, data: status });

    } catch (error) {
      console.error('Check status error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to check payment status',
        error: error.message
      });
    }
  },

  // Refund
  processRefund: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const { amount, originalTransactionId } = req.body;

      if (!amount || !originalTransactionId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: amount, originalTransactionId'
        });
      }

      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

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

      if (amount > originalPayment.amount) {
        return res.status(400).json({
          success: false,
          message: 'Refund amount cannot exceed original payment amount'
        });
      }

      const result = await phonePeService.processRefund({
        bookingId: booking.bookingId,
        originalTransactionId,
        amount
      });

      originalPayment.status = 'refunded';
      await originalPayment.save();

      booking.payment.paidAmount -= amount;
      booking.payment.pendingAmount = booking.pricing.totalAmount - booking.payment.paidAmount;
      booking.payment.status = booking.payment.paidAmount > 0 ? 'partial' : 'pending';
      await booking.save();

      return res.json({
        success: true,
        message: 'Refund initiated successfully',
        data: result
      });

    } catch (error) {
      console.error('Refund error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to process refund',
        error: error.message
      });
    }
  },

  // Admin: all payments
  getAllPayments: async (req, res) => {
    try {
      const { page = 1, limit = 10, status, bookingId, gateway = 'phonepe' } = req.query;

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

      return res.json({
        success: true,
        data: {
          payments,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalPayments: total,
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1
          }
        }
      });
    } catch (error) {
      console.error('Get payments error:', error);
      return res.status(500).json({ success: false, message: 'Error fetching payments', error: error.message });
    }
  },

  // User: own payments
  getSelfPayments: async (req, res) => {
    try {
      const { page = 1, limit = 10, status, bookingId } = req.query;

      const filter = { createdBy: req.user._id };
      if (status) filter.status = status;
      if (bookingId) filter.booking = bookingId;

      const skip = (page - 1) * limit;
      const payments = await Payment.find(filter)
        .populate('booking', 'bookingId primaryGuest pricing property')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Payment.countDocuments(filter);

      return res.json({
        success: true,
        data: {
          payments,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalPayments: total,
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1
          }
        }
      });
    } catch (error) {
      console.error('Get self payments error:', error);
      return res.status(500).json({ success: false, message: 'Error fetching your payments', error: error.message });
    }
  }
};
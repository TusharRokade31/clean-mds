// bookingController.js

import mongoose from 'mongoose';
import Booking from '../models/BookingSchema.js';
import Property from '../models/Property.js';

// Utility function to calculate pricing
const calculatePricing = (room, adults, children, totalDays, checkIn, checkOut) => {
  const roomPricing = room.pricing;
  const baseAdults = room.occupancy.baseAdults;
  
  // Base charge (for base adults)
  let baseCharge = roomPricing.baseAdultsCharge;
  
  // Extra adults charge
  const extraAdults = Math.max(0, adults - baseAdults);
  const extraAdultCharge = extraAdults * roomPricing.extraAdultsCharge;
  
  // Child charge
  const childCharge = children * roomPricing.childCharge;
  
  // Calculate subtotal
  const dailyRate = baseCharge + extraAdultCharge + childCharge;
  const subtotal = dailyRate * totalDays;
  
  // Calculate taxes (assuming 12% GST)
  const taxes = subtotal * 0.12;
  
  const totalAmount = subtotal + taxes;
    
  return {
    baseCharge: baseCharge * totalDays,
    extraAdultCharge: extraAdultCharge * totalDays,
    childCharge: childCharge * totalDays,
    totalDays,
    subtotal,
    taxes,
    discount: 0,
    totalAmount,
  };
};

// Check room availability
const checkRoomAvailability = async (roomId, checkIn, checkOut, excludeBookingId = null) => {
  const query = {
    room: roomId,
    status: { $nin: ['cancelled', 'no-show'] },
    $or: [
      {
        checkIn: { $lt: checkOut },
        checkOut: { $gt: checkIn },
      },
    ],
  };
  
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  
  const conflictingBookings = await Booking.find(query);
  return conflictingBookings.length === 0;
};

export const bookingController = {
  // Create new booking
  createBooking: async (req, res) => {
    try {
      const {
        propertyId,
        roomId,
        primaryGuest,
        additionalGuests = [],
        checkIn,
        checkOut,
        guestCount,
        paymentMethod,
        paidAmount = 0,
        specialRequests,
        source = 'walk-in',
      } = req.body;

      // Validate dates
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const today = new Date();
      
      if (checkInDate < today) {
        return res.status(400).json({
          success: false,
          message: 'Check-in date cannot be in the past',
        });
      }
      
      if (checkOutDate <= checkInDate) {
        return res.status(400).json({
          success: false,
          message: 'Check-out date must be after check-in date',
        });
      }

      // Get property and room details
      const property = await Property.findById(propertyId);
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found',
        });
      }

      const room = property.rooms.id(roomId);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found',
        });
      }

      // Check room availability
      const isAvailable = await checkRoomAvailability(roomId, checkInDate, checkOutDate);
      if (!isAvailable) {
        return res.status(400).json({
          success: false,
          message: 'Room is not available for the selected dates',
        });
      }

      // Validate guest count against room capacity
      const totalGuests = guestCount.adults + guestCount.children;
      if (totalGuests > room.occupancy.maximumOccupancy) {
        return res.status(400).json({
          success: false,
          message: `Room can accommodate maximum ${room.occupancy.maximumOccupancy} guests`,
        });
      }

      if (guestCount.adults > room.occupancy.maximumAdults) {
        return res.status(400).json({
          success: false,
          message: `Room can accommodate maximum ${room.occupancy.maximumAdults} adults`,
        });
      }

      if (guestCount.children > room.occupancy.maximumChildren) {
        return res.status(400).json({
          success: false,
          message: `Room can accommodate maximum ${room.occupancy.maximumChildren} children`,
        });
      }

      // Calculate pricing
      const totalDays = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      const pricing = calculatePricing(room, guestCount.adults, guestCount.children, totalDays, checkInDate, checkOutDate);

      // Create booking
      const booking = new Booking({
        property: propertyId,
        room: roomId,
        primaryGuest,
        additionalGuests,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guestCount,
        pricing,
        payment: {
          method: paymentMethod,
          paidAmount: paidAmount || 0,
          status: paidAmount >= pricing.totalAmount ? 'completed' : paidAmount > 0 ? 'partial' : 'pending',
        },
        specialRequests,
        source,
        createdBy: req.user?._id,
      });

      await booking.save();

      // Populate the booking with property and room details
      await booking.populate('property', 'placeName location');

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: booking,
      });

    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating booking',
        error: error.message,
      });
    }
  },

  // Get all bookings with filters
  getAllBookings: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        propertyId,
        checkIn,
        checkOut,
        guestName,
        bookingId,
        paymentStatus,
      } = req.query;

      // Build filter query
      const filter = {};
      
      if (status) filter.status = status;
      if (propertyId) filter.property = propertyId;
      if (paymentStatus) filter['payment.status'] = paymentStatus;
      if (bookingId) filter.bookingId = new RegExp(bookingId, 'i');
      
      // Date range filter
      if (checkIn || checkOut) {
        filter.$or = [];
        if (checkIn) {
          filter.$or.push({ checkIn: { $gte: new Date(checkIn) } });
        }
        if (checkOut) {
          filter.$or.push({ checkOut: { $lte: new Date(checkOut) } });
        }
      }

      // Guest name filter
      if (guestName) {
        filter.$or = [
          { 'primaryGuest.firstName': new RegExp(guestName, 'i') },
          { 'primaryGuest.lastName': new RegExp(guestName, 'i') },
          { 'primaryGuest.email': new RegExp(guestName, 'i') },
        ];
      }

      const skip = (page - 1) * limit;

      const bookings = await Booking.find(filter)
        .populate('property', 'placeName location propertyType')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Booking.countDocuments(filter);

      res.json({
        success: true,
        data: {
          bookings,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalBookings: total,
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1,
          },
        },
      });

    } catch (error) {
      console.error('Get bookings error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching bookings',
        error: error.message,
      });
    }
  },

  // Get booking by ID
  getBookingById: async (req, res) => {
    try {
      const { id } = req.params;

      const booking = await Booking.findById(id)
        .populate('property', 'placeName location propertyType email mobileNumber')
        .populate('createdBy', 'name email');

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found',
        });
      }

      // Get room details from property
      const property = await Property.findById(booking.property._id);
      const room = property.rooms.id(booking.room);

      res.json({
        success: true,
        data: {
          ...booking.toObject(),
          roomDetails: room,
        },
      });

    } catch (error) {
      console.error('Get booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching booking',
        error: error.message,
      });
    }
  },

  // Update booking
  updateBooking: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const booking = await Booking.findById(id);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found',
        });
      }

      // Prevent updates if booking is checked out or cancelled
      if (['checked-out', 'cancelled'].includes(booking.status)) {
        return res.status(400).json({
          success: false,
          message: 'Cannot update completed or cancelled booking',
        });
      }

      // If updating dates, check availability
      if (updates.checkIn || updates.checkOut) {
        const newCheckIn = updates.checkIn ? new Date(updates.checkIn) : booking.checkIn;
        const newCheckOut = updates.checkOut ? new Date(updates.checkOut) : booking.checkOut;

        const isAvailable = await checkRoomAvailability(booking.room, newCheckIn, newCheckOut, booking._id);
        if (!isAvailable) {
          return res.status(400).json({
            success: false,
            message: 'Room is not available for the selected dates',
          });
        }

        // Recalculate pricing if dates or guest count changed
        if (updates.checkIn || updates.checkOut || updates.guestCount) {
          const property = await Property.findById(booking.property);
          const room = property.rooms.id(booking.room);
          
          const guestCount = updates.guestCount || booking.guestCount;
          const totalDays = Math.ceil((newCheckOut - newCheckIn) / (1000 * 60 * 60 * 24));
          
          updates.pricing = calculatePricing(room, guestCount.adults, guestCount.children, totalDays);
          
          // Update payment pending amount
          if (updates.pricing) {
            updates['payment.pendingAmount'] = updates.pricing.totalAmount - booking.payment.paidAmount;
          }
        }
      }

      const updatedBooking = await Booking.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true },
      ).populate('property', 'placeName location');

      res.json({
        success: true,
        message: 'Booking updated successfully',
        data: updatedBooking,
      });

    } catch (error) {
      console.error('Update booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating booking',
        error: error.message,
      });
    }
  },

  // Update payment
  updatePayment: async (req, res) => {
    try {
      const { id } = req.params;
      let { amount, method, transactionId } = req.body;

      // convert amount to number and validate
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment amount',
        });
      }

      const booking = await Booking.findById(id);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found',
        });
      }

      // use the parsed number
      const newPaidAmount = booking.payment.paidAmount + amountNum;
      const totalAmount   = booking.pricing.totalAmount;

      if (newPaidAmount > totalAmount) {
        return res.status(400).json({
          success: false,
          message: 'Payment amount exceeds total booking amount',
        });
      }

      // Update payment details
      booking.payment.paidAmount    = newPaidAmount;
      booking.payment.pendingAmount = totalAmount - newPaidAmount;
      booking.payment.method        = method || booking.payment.method;
      booking.payment.transactionId = transactionId || booking.payment.transactionId;
      booking.payment.paymentDate   = new Date();

      // Update payment status
      if (newPaidAmount >= totalAmount) {
        booking.payment.status = 'completed';
      } else {
        booking.payment.status = 'partial';
      }

      await booking.save();

      res.json({
        success: true,
        message: 'Payment updated successfully',
        data: booking,
      });

    } catch (error) {
      console.error('Update payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating payment',
        error: error.message,
      });
    }
  },

  // Check-in guest
  checkIn: async (req, res) => {
    try {
      const { id } = req.params;

      const booking = await Booking.findById(id);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found',
        });
      }

      if (booking.status !== 'confirmed') {
        return res.status(400).json({
          success: false,
          message: 'Only confirmed bookings can be checked in',
        });
      }

      booking.status = 'checked-in';
      await booking.save();

      res.json({
        success: true,
        message: 'Guest checked in successfully',
        data: booking,
      });

    } catch (error) {
      console.error('Check-in error:', error);
      res.status(500).json({
        success: false,
        message: 'Error during check-in',
        error: error.message,
      });
    }
  },

  // Check-out guest
  checkOut: async (req, res) => {
    try {
      const { id } = req.params;

      const booking = await Booking.findById(id);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found',
        });
      }

      if (booking.status !== 'checked-in') {
        return res.status(400).json({
          success: false,
          message: 'Only checked-in guests can be checked out',
        });
      }

      booking.status = 'checked-out';
      await booking.save();

      res.json({
        success: true,
        message: 'Guest checked out successfully',
        data: booking,
      });

    } catch (error) {
      console.error('Check-out error:', error);
      res.status(500).json({
        success: false,
        message: 'Error during check-out',
        error: error.message,
      });
    }
  },

  // Cancel booking
  cancelBooking: async (req, res) => {
    try {
      const { id } = req.params;
      const { reason, refundAmount = 0 } = req.body;

      const booking = await Booking.findById(id);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found',
        });
      }

      if (['checked-out', 'cancelled'].includes(booking.status)) {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel completed or already cancelled booking',
        });
      }

      booking.status = 'cancelled';
      booking.cancellation = {
        cancelledAt: new Date(),
        cancelledBy: req.user?._id,
        reason,
        refundAmount,
      };

      // Update payment status if refund is given
      if (refundAmount > 0) {
        booking.payment.status = 'refunded';
      }

      await booking.save();

      res.json({
        success: true,
        message: 'Booking cancelled successfully',
        data: booking,
      });

    } catch (error) {
      console.error('Cancel booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Error cancelling booking',
        error: error.message,
      });
    }
  },

  // Get booking statistics
  getBookingStats: async (req, res) => {
    try {
      const { propertyId, startDate, endDate } = req.query;

      const matchFilter = {};
      if (propertyId) matchFilter.property = new mongoose.Types.ObjectId(propertyId);
      if (startDate || endDate) {
        matchFilter.createdAt = {};
        if (startDate) matchFilter.createdAt.$gte = new Date(startDate);
        if (endDate) matchFilter.createdAt.$lte = new Date(endDate);
      }

      const stats = await Booking.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            totalRevenue: { $sum: '$pricing.totalAmount' },
            totalPaid: { $sum: '$payment.paidAmount' },
            pendingAmount: { $sum: '$payment.pendingAmount' },
            confirmedBookings: {
              $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] },
            },
            checkedInBookings: {
              $sum: { $cond: [{ $eq: ['$status', 'checked-in'] }, 1, 0] },
            },
            checkedOutBookings: {
              $sum: { $cond: [{ $eq: ['$status', 'checked-out'] }, 1, 0] },
            },
            cancelledBookings: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
            },
          },
        },
      ]);

      const result = stats[0] || {
        totalBookings: 0,
        totalRevenue: 0,
        totalPaid: 0,
        pendingAmount: 0,
        confirmedBookings: 0,
        checkedInBookings: 0,
        checkedOutBookings: 0,
        cancelledBookings: 0,
      };

      res.json({
        success: true,
        data: result,
      });

    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching booking statistics',
        error: error.message,
      });
    }
  },
};
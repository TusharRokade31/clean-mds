// bookingController.js

import mongoose from 'mongoose';
import Booking from '../models/BookingSchema.js';
import Property from '../models/Property.js';
import { sendBookingConfirmationEmail } from '../services/emailService.js';
import PrivacyPolicy from '../models/PrivacyPolicy.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Calculate pricing for a single room for the given stay.
 */
const calculateRoomPricing = (room, adults, children, totalDays) => {
  const { baseAdultsCharge, extraAdultsCharge, childCharge: childRate } = room.pricing;
  const baseAdults = room.occupancy.baseAdults;

  const baseCharge       = baseAdultsCharge;
  const extraAdults      = Math.max(0, adults - baseAdults);
  const extraAdultCharge = extraAdults * extraAdultsCharge;
  const childCharge      = children * childRate;

  const dailyRate = baseCharge + extraAdultCharge + childCharge;
  const subtotal  = dailyRate * totalDays;
  const taxes     = subtotal * 0.12; // 12 % GST
  const totalAmount = subtotal + taxes;

  return {
    baseCharge:       baseCharge * totalDays,
    extraAdultCharge: extraAdultCharge * totalDays,
    childCharge:      childCharge * totalDays,
    subtotal,
    taxes,
    discount:     0,
    totalAmount,
  };
};

/**
 * Sum per-room pricing objects into one aggregate object.
 */
const aggregatePricing = (roomPricings, totalDays) => {
  const agg = roomPricings.reduce(
    (acc, p) => ({
      baseCharge:       acc.baseCharge       + p.baseCharge,
      extraAdultCharge: acc.extraAdultCharge + p.extraAdultCharge,
      childCharge:      acc.childCharge      + p.childCharge,
      subtotal:         acc.subtotal         + p.subtotal,
      taxes:            acc.taxes            + p.taxes,
      discount:         acc.discount         + p.discount,
      totalAmount:      acc.totalAmount      + p.totalAmount,
    }),
    { baseCharge: 0, extraAdultCharge: 0, childCharge: 0, subtotal: 0, taxes: 0, discount: 0, totalAmount: 0 },
  );
  return { ...agg, totalDays };
};

/**
 * Returns true when the number of active bookings for this room on the
 * requested dates is LESS than the room's physical unit count (numberRoom).
 * e.g. if numberRoom = 3 and 2 bookings already exist, a 3rd is still allowed.
 * Optionally excludes one booking (for update checks).
 */
const checkRoomAvailability = async (roomId, checkIn, checkOut, numberRoom = 1, excludeBookingId = null) => {
  const query = {
    'rooms.room': roomId,
    status: { $nin: ['cancelled', 'no-show', 'draft'] },
    // Overlap condition: existing booking overlaps if it starts before our checkOut
    // AND ends after our checkIn
    checkIn:  { $lt: checkOut },
    checkOut: { $gt: checkIn },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const bookedCount = await Booking.countDocuments(query);

  // Available if currently booked units are fewer than total physical rooms
  return bookedCount < numberRoom;
};

// ─────────────────────────────────────────────────────────────────────────────

export const bookingController = {

  // ── GET ALL BOOKINGS ────────────────────────────────────────────────────────
  getAllBookings: async (req, res) => {
    try {
      const {
        page = 1, limit = 10,
        status, propertyId, checkIn, checkOut,
        guestName, bookingId, paymentStatus,
      } = req.query;

      const filter = {};
      if (status)        filter.status              = status;
      if (propertyId)    filter.property            = propertyId;
      if (paymentStatus) filter['payment.status']   = paymentStatus;
      if (bookingId)     filter.bookingId           = new RegExp(bookingId, 'i');

      if (checkIn || checkOut) {
        filter.$or = [];
        if (checkIn)  filter.$or.push({ checkIn:  { $gte: new Date(checkIn) } });
        if (checkOut) filter.$or.push({ checkOut: { $lte: new Date(checkOut) } });
      }

      if (guestName) {
        filter.$or = [
          { 'primaryGuest.firstName': new RegExp(guestName, 'i') },
          { 'primaryGuest.lastName':  new RegExp(guestName, 'i') },
          { 'primaryGuest.email':     new RegExp(guestName, 'i') },
        ];
      }

      const skip     = (page - 1) * limit;
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
            currentPage:    parseInt(page),
            totalPages:     Math.ceil(total / limit),
            totalBookings:  total,
            hasNextPage:    page < Math.ceil(total / limit),
            hasPrevPage:    page > 1,
          },
        },
      });
    } catch (error) {
      console.error('Get bookings error:', error);
      res.status(500).json({ success: false, message: 'Error fetching bookings', error: error.message });
    }
  },

  // ── GET SELF BOOKINGS ───────────────────────────────────────────────────────
  getSelfBookings: async (req, res) => {
    try {
      const {
        page = 1, limit = 10,
        status, propertyId, checkIn, checkOut,
        guestName, bookingId, paymentStatus,
      } = req.query;

      const filter = { createdBy: req.user._id };
      if (status)        filter.status            = status;
      if (propertyId)    filter.property          = propertyId;
      if (paymentStatus) filter['payment.status'] = paymentStatus;
      if (bookingId)     filter.bookingId         = new RegExp(bookingId, 'i');

      if (checkIn || checkOut) {
        const dateFilter = {};
        if (checkIn)  dateFilter.checkIn  = { $gte: new Date(checkIn) };
        if (checkOut) dateFilter.checkOut = { $lte: new Date(checkOut) };
        Object.assign(filter, dateFilter);
      }

      if (guestName) {
        filter.$or = [
          { 'primaryGuest.firstName': new RegExp(guestName, 'i') },
          { 'primaryGuest.lastName':  new RegExp(guestName, 'i') },
          { 'primaryGuest.email':     new RegExp(guestName, 'i') },
        ];
      }

      const skip     = (page - 1) * limit;
      const bookings = await Booking.find(filter)
        .populate('property', 'placeName location propertyType media')
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
            currentPage:   parseInt(page),
            totalPages:    Math.ceil(total / limit),
            totalBookings: total,
            hasNextPage:   page < Math.ceil(total / limit),
            hasPrevPage:   page > 1,
          },
        },
        message: `Found ${total} booking(s) created by you`,
      });
    } catch (error) {
      console.error('Get self bookings error:', error);
      res.status(500).json({ success: false, message: 'Error fetching your bookings', error: error.message });
    }
  },

  // ── CREATE BOOKING (multi-room) ─────────────────────────────────────────────
  /**
   * Expected request body:
   * {
   *   propertyId,
   *   rooms: [
   *     { roomId, guestCount: { adults, children } },
   *     { roomId, guestCount: { adults, children } },
   *   ],
   *   primaryGuest,
   *   additionalGuests,
   *   checkIn,
   *   checkOut,
   *   paymentMethod,
   *   paidAmount,
   *   specialRequests,
   *   source,
   * }
   */
  createBooking: async (req, res) => {
    try {
      const {
        propertyId,
        rooms: roomRequests = [],   // [{ roomId, guestCount: { adults, children } }]
        primaryGuest,
        additionalGuests = [],
        checkIn,
        checkOut,
        paymentMethod,
        paidAmount = 0,
        specialRequests,
        source = 'walk-in',
      } = req.body;

      // ── Validate dates ──────────────────────────────────────────────────────
      const checkInDate  = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const today        = new Date();

      if (checkInDate < today) {
        return res.status(400).json({ success: false, message: 'Check-in date cannot be in the past' });
      }
      if (checkOutDate <= checkInDate) {
        return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date' });
      }

      // ── Validate rooms array ────────────────────────────────────────────────
      if (!Array.isArray(roomRequests) || roomRequests.length === 0) {
        return res.status(400).json({ success: false, message: 'At least one room must be selected' });
      }

      // ── Fetch property ──────────────────────────────────────────────────────
      const property = await Property.findById(propertyId);
      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      const totalDays = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

      // ── Validate each requested room ────────────────────────────────────────
      const bookedRooms     = [];
      const roomPricings    = [];
      let   totalAdults     = 0;
      let   totalChildren   = 0;

      // Detect duplicate roomIds in the request
      // const uniqueRoomIds = new Set(roomRequests.map((r) => r.roomId));
      // if (uniqueRoomIds.size !== roomRequests.length) {
      //   return res.status(400).json({ success: false, message: 'Duplicate room selections are not allowed' });
      // }

      for (const req_room of roomRequests) {
        const { roomId, guestCount } = req_room;
        const adults   = guestCount?.adults   ?? 1;
        const children = guestCount?.children ?? 0;

        // Find room in property
        const room = property.rooms.id(roomId);
        if (!room) {
          return res.status(404).json({ success: false, message: `Room ${roomId} not found in this property` });
        }

        // Check occupancy limits per room
        const totalRoomGuests = adults + children;
        if (totalRoomGuests > room.occupancy.maximumOccupancy) {
          return res.status(400).json({
            success: false,
            message: `Room "${room.roomName}" can accommodate maximum ${room.occupancy.maximumOccupancy} guests`,
          });
        }
        // if (adults > room.occupancy.maximumAdults) {
        //   return res.status(400).json({
        //     success: false,
        //     message: `Room "${room.roomName}" can accommodate maximum ${room.occupancy.maximumAdults} adults`,
        //   });
        // }
        if (children > room.occupancy.maximumChildren) {
          return res.status(400).json({
            success: false,
            message: `Room "${room.roomName}" can accommodate maximum ${room.occupancy.maximumChildren} children`,
          });
        }

        // Check availability — compares active bookings against numberRoom physical units
        const isAvailable = await checkRoomAvailability(
          roomId,
          checkInDate,
          checkOutDate,
          room.numberRoom ?? 1,   // how many physical rooms of this type exist
        );
        if (!isAvailable) {
          return res.status(400).json({
            success: false,
            message: `Room "${room.roomName}" is not available for the selected dates (all ${room.numberRoom ?? 1} unit(s) are booked)`,
          });
        }

        // Per-room pricing
        const roomPricing = calculateRoomPricing(room, adults, children, totalDays);
        roomPricings.push(roomPricing);

        bookedRooms.push({
          room:     roomId,
          roomName: room.roomName,
          guestCount: { adults, children },
          pricing:  roomPricing,
        });

        totalAdults   += adults;
        totalChildren += children;
      }

      // ── Aggregate totals ────────────────────────────────────────────────────
      const aggregatedPricing = aggregatePricing(roomPricings, totalDays);

      // ── Create booking ──────────────────────────────────────────────────────
      const booking = new Booking({
        property:       propertyId,
        rooms:          bookedRooms,
        primaryGuest,
        additionalGuests,
        checkIn:        checkInDate,
        checkOut:       checkOutDate,
        totalDays,
        guestCount:     { adults: totalAdults, children: totalChildren },
        pricing:        aggregatedPricing,
        payment: {
          method:      paymentMethod,
          paidAmount:  0,
          status:      'pending',
        },
        specialRequests,
        source,
        status:         'draft',
        createdBy:      req.user?._id,
      });

      await booking.save();
      await booking.populate('property', 'placeName location');

      res.status(201).json({
        success: true,
        message: `Booking created successfully for ${bookedRooms.length} room(s)`,
        data:    booking,
      });

    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({ success: false, message: 'Error creating booking', error: error.message });
    }
  },

  // ── GET BOOKING BY ID ───────────────────────────────────────────────────────
  getBookingById: async (req, res) => {
    try {
      const { id } = req.params;

      const booking = await Booking.findById(id)
        .populate('property', 'placeName location propertyType email mobileNumber')
        .populate('createdBy', 'name email');

      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      // Attach full room details from the property snapshot
      const property   = await Property.findById(booking.property._id);
      const roomDetails = booking.rooms.map((br) => ({
        ...br,
        roomDetails: property?.rooms.id(br.room) || null,
      }));

      res.json({
        success: true,
        data: {
          ...booking.toObject(),
          roomDetails,
        },
      });

    } catch (error) {
      console.error('Get booking error:', error);
      res.status(500).json({ success: false, message: 'Error fetching booking', error: error.message });
    }
  },

  // ── UPDATE BOOKING ──────────────────────────────────────────────────────────
  updateBooking: async (req, res) => {
    try {
      const { id }    = req.params;
      const updates   = req.body;

      const booking = await Booking.findById(id);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      if (['checked-out', 'cancelled'].includes(booking.status)) {
        return res.status(400).json({ success: false, message: 'Cannot update completed or cancelled booking' });
      }

      // If dates changed, re-check availability for every booked room
      if (updates.checkIn || updates.checkOut) {
        const newCheckIn  = updates.checkIn  ? new Date(updates.checkIn)  : booking.checkIn;
        const newCheckOut = updates.checkOut ? new Date(updates.checkOut) : booking.checkOut;

        // Fetch property first so we have numberRoom for each room
        const property  = await Property.findById(booking.property);
        const totalDays = Math.ceil((newCheckOut - newCheckIn) / (1000 * 60 * 60 * 24));

        for (const br of booking.rooms) {
          const roomDoc    = property?.rooms.id(br.room);
          const numberRoom = roomDoc?.numberRoom ?? 1;
          const isAvail    = await checkRoomAvailability(br.room, newCheckIn, newCheckOut, numberRoom, booking._id);
          if (!isAvail) {
            return res.status(400).json({
              success: false,
              message: `Room "${br.roomName}" is not available for the updated dates (all ${numberRoom} unit(s) are booked)`,
            });
          }
        }

        // Recalculate pricing for all rooms

        const newRooms = booking.rooms.map((br) => {
          const room        = property.rooms.id(br.room);
          const gc          = br.guestCount;
          const roomPricing = calculateRoomPricing(room, gc.adults, gc.children, totalDays);
          return { ...br.toObject(), pricing: roomPricing };
        });

        const roomPricings      = newRooms.map((r) => r.pricing);
        updates.rooms           = newRooms;
        updates.totalDays       = totalDays;
        updates.pricing         = aggregatePricing(roomPricings, totalDays);
        updates['payment.pendingAmount'] = updates.pricing.totalAmount - booking.payment.paidAmount;
      }

      const updatedBooking = await Booking.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true },
      ).populate('property', 'placeName location');

      res.json({ success: true, message: 'Booking updated successfully', data: updatedBooking });

    } catch (error) {
      console.error('Update booking error:', error);
      res.status(500).json({ success: false, message: 'Error updating booking', error: error.message });
    }
  },

  // ── UPDATE PAYMENT ──────────────────────────────────────────────────────────
  updatePayment: async (req, res) => {
    try {
      const { id } = req.params;
      const { amount, method, transactionId } = req.body;

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid payment amount' });
      }

      const booking = await Booking.findById(id);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      const newPaidAmount = booking.payment.paidAmount + amountNum;
      const totalAmount   = booking.pricing.totalAmount;

      if (newPaidAmount > totalAmount) {
        return res.status(400).json({ success: false, message: 'Payment amount exceeds total booking amount' });
      }

      booking.payment.paidAmount    = newPaidAmount;
      booking.payment.pendingAmount = totalAmount - newPaidAmount;
      booking.payment.method        = method        || booking.payment.method;
      booking.payment.transactionId = transactionId || booking.payment.transactionId;
      booking.payment.paymentDate   = new Date();
      booking.payment.status        = newPaidAmount >= totalAmount ? 'completed' : 'partial';

      await booking.save();

      res.json({ success: true, message: 'Payment updated successfully', data: booking });

    } catch (error) {
      console.error('Update payment error:', error);
      res.status(500).json({ success: false, message: 'Error updating payment', error: error.message });
    }
  },

  // ── UPDATE STATUS ───────────────────────────────────────────────────────────
  updateStatus: async (req, res) => {
    try {
      const { id }     = req.params;
      const { status } = req.body;

      const booking = await Booking.findById(id).populate('property');
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      const policy    = await PrivacyPolicy.findOne({ property: booking.property._id, isActive: true });
      const oldStatus = booking.status;
      const newStatus = status || (oldStatus === 'pending' ? 'confirmed' : oldStatus);

      booking.status = newStatus;
      await booking.save();

      if (newStatus === 'confirmed' && oldStatus !== 'confirmed') {
        sendBookingConfirmationEmail(booking, policy).catch((err) =>
          console.error('Email Service Error:', err),
        );
      }

      res.json({
        success: true,
        message: `Booking status updated to ${booking.status} successfully`,
        data:    booking,
      });

    } catch (error) {
      console.error('Status update error:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value',
          error:   error.message,
        });
      }
      res.status(500).json({ success: false, message: 'Error updating booking status', error: error.message });
    }
  },

  // ── CHECK-IN ────────────────────────────────────────────────────────────────
  checkIn: async (req, res) => {
    try {
      const { id } = req.params;
      const booking = await Booking.findById(id);
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

      if (booking.status !== 'confirmed') {
        return res.status(400).json({ success: false, message: 'Only confirmed bookings can be checked in' });
      }

      booking.status = 'checked-in';
      await booking.save();
      res.json({ success: true, message: 'Guest checked in successfully', data: booking });

    } catch (error) {
      console.error('Check-in error:', error);
      res.status(500).json({ success: false, message: 'Error during check-in', error: error.message });
    }
  },

  // ── CHECK-OUT ───────────────────────────────────────────────────────────────
  checkOut: async (req, res) => {
    try {
      const { id } = req.params;
      const booking = await Booking.findById(id);
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

      if (booking.status !== 'checked-in') {
        return res.status(400).json({ success: false, message: 'Only checked-in guests can be checked out' });
      }

      booking.status = 'checked-out';
      await booking.save();
      res.json({ success: true, message: 'Guest checked out successfully', data: booking });

    } catch (error) {
      console.error('Check-out error:', error);
      res.status(500).json({ success: false, message: 'Error during check-out', error: error.message });
    }
  },

  // ── CANCEL BOOKING ──────────────────────────────────────────────────────────
  cancelBooking: async (req, res) => {
    try {
      const { id } = req.params;
      const { reason, refundAmount = 0 } = req.body;

      const booking = await Booking.findById(id);
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

      if (['checked-out', 'cancelled'].includes(booking.status)) {
        return res.status(400).json({ success: false, message: 'Cannot cancel completed or already cancelled booking' });
      }

      booking.status       = 'cancelled';
      booking.cancellation = {
        cancelledAt:  new Date(),
        cancelledBy:  req.user?._id,
        reason,
        refundAmount,
      };

      if (refundAmount > 0) booking.payment.status = 'refunded';

      await booking.save();
      res.json({ success: true, message: 'Booking cancelled successfully', data: booking });

    } catch (error) {
      console.error('Cancel booking error:', error);
      res.status(500).json({ success: false, message: 'Error cancelling booking', error: error.message });
    }
  },

  // ── BOOKING STATISTICS ──────────────────────────────────────────────────────
  getBookingStats: async (req, res) => {
    try {
      const { propertyId, startDate, endDate } = req.query;

      const matchFilter = {};
      if (propertyId) matchFilter.property = new mongoose.Types.ObjectId(propertyId);
      if (startDate || endDate) {
        matchFilter.createdAt = {};
        if (startDate) matchFilter.createdAt.$gte = new Date(startDate);
        if (endDate)   matchFilter.createdAt.$lte = new Date(endDate);
      }

      const stats = await Booking.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id:              null,
            totalBookings:    { $sum: 1 },
            totalRevenue:     { $sum: '$pricing.totalAmount' },
            totalPaid:        { $sum: '$payment.paidAmount' },
            pendingAmount:    { $sum: '$payment.pendingAmount' },
            // Count of rooms booked across all bookings
            totalRoomsBooked: { $sum: { $size: '$rooms' } },
            confirmedBookings:  { $sum: { $cond: [{ $eq: ['$status', 'confirmed'] },   1, 0] } },
            checkedInBookings:  { $sum: { $cond: [{ $eq: ['$status', 'checked-in'] },  1, 0] } },
            checkedOutBookings: { $sum: { $cond: [{ $eq: ['$status', 'checked-out'] }, 1, 0] } },
            cancelledBookings:  { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] },   1, 0] } },
          },
        },
      ]);

      const result = stats[0] || {
        totalBookings: 0, totalRevenue: 0, totalPaid: 0, pendingAmount: 0,
        totalRoomsBooked: 0,
        confirmedBookings: 0, checkedInBookings: 0, checkedOutBookings: 0, cancelledBookings: 0,
      };

      res.json({ success: true, data: result });

    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ success: false, message: 'Error fetching booking statistics', error: error.message });
    }
  },
};
// controllers/roomController.js
import Property from '../models/Property.js';
import Booking from '../models/BookingSchema.js';
import { validationResult } from 'express-validator';

export const roomController = {
  // Get all rooms for a property
  getAllRooms: async (req, res) => {
    try {
      const { propertyId } = req.params;
      const { status, roomType, bedSize, page = 1, limit = 10 } = req.query;

      // Find property with populated rooms
      const property = await Property.findById(propertyId).select('rooms');
      
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      let rooms = property.rooms || [];

      // Apply filters
      if (status && status !== 'All') {
        rooms = rooms.filter(room => room.status === status.toLowerCase());
      }

      if (roomType && roomType !== 'All') {
        rooms = rooms.filter(room => room.roomName === roomType);
      }

      if (bedSize && bedSize !== 'All') {
        rooms = rooms.filter(room => 
          room.beds.some(bed => bed.bedType === bedSize)
        );
      }

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedRooms = rooms.slice(startIndex, endIndex);

      // Get current bookings for each room
      const roomsWithBookings = await Promise.all(
        paginatedRooms.map(async (room) => {
          const currentBooking = await Booking.findOne({
            room: room._id,
            status: 'checked-in'
          }).populate('primaryGuest');

          return {
            ...room.toObject(),
            currentBooking: currentBooking || null,
            status: currentBooking ? 'booked' : 'available'
          };
        })
      );

      res.status(200).json({
        success: true,
        data: {
          rooms: roomsWithBookings,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(rooms.length / limit),
            totalRooms: rooms.length,
            hasNext: endIndex < rooms.length,
            hasPrev: startIndex > 0
          }
        }
      });

    } catch (error) {
      console.error('Error fetching rooms:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // Get single room by ID
  getRoomById: async (req, res) => {
    try {
      const { roomId } = req.params;

      // Find property that contains this room
      const property = await Property.findOne({
        'rooms._id': roomId
      }).select('rooms');

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      const room = property.rooms.id(roomId);
      
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      // Get current booking for this room
      const currentBooking = await Booking.findOne({
        room: roomId,
        status: { $in: ['confirmed', 'checked-in'] }
      }).populate('primaryGuest');

      const roomWithBooking = {
        ...room.toObject(),
        currentBooking: currentBooking || null,
        status: currentBooking ? 'booked' : 'available'
      };

      res.status(200).json({
        success: true,
        data: roomWithBooking
      });

    } catch (error) {
      console.error('Error fetching room:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // Update room status
  updateRoomStatus: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { roomId } = req.params;
      const { status } = req.body;

      // Find property that contains this room
      const property = await Property.findOne({
        'rooms._id': roomId
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      const room = property.rooms.id(roomId);
      
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      // Update room status (you might want to add a status field to your room schema)
      // For now, we'll handle this through booking status
      
      // If marking as maintenance, check if there's an active booking
      if (status === 'maintenance') {
        const activeBooking = await Booking.findOne({
          room: roomId,
          status: { $in: ['confirmed', 'checked-in'] }
        });

        if (activeBooking) {
          return res.status(400).json({
            success: false,
            message: 'Cannot mark room as maintenance while guest is checked in'
          });
        }
      }

      await property.save();

      // Get updated room with current booking
      const currentBooking = await Booking.findOne({
        room: roomId,
        status: { $in: ['confirmed', 'checked-in'] }
      }).populate('primaryGuest');

      const updatedRoom = {
        ...room.toObject(),
        currentBooking: currentBooking || null,
        status: currentBooking ? 'booked' : status
      };

      res.status(200).json({
        success: true,
        data: updatedRoom,
        message: 'Room status updated successfully'
      });

    } catch (error) {
      console.error('Error updating room status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // Get room availability for specific dates
  getRoomAvailability: async (req, res) => {
    try {
      const { roomId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const checkIn = new Date(startDate);
      const checkOut = new Date(endDate);

      // Find overlapping bookings
      const conflictingBookings = await Booking.find({
        room: roomId,
        status: { $in: ['confirmed', 'checked-in'] },
        $or: [
          {
            checkIn: { $lt: checkOut },
            checkOut: { $gt: checkIn }
          }
        ]
      });

      const isAvailable = conflictingBookings.length === 0;

      res.status(200).json({
        success: true,
        data: {
          available: isAvailable,
          conflictingBookings: conflictingBookings.length,
          requestedDates: {
            checkIn: checkIn.toISOString(),
            checkOut: checkOut.toISOString()
          }
        }
      });

    } catch (error) {
      console.error('Error checking room availability:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};
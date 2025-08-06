// dashboardController.js
import mongoose from 'mongoose';
import Property from '../../models/Property.js';
import Booking from '../../models/BookingSchema.js';


export const dashboardController = {
  // Get comprehensive dashboard statistics
  getDashboardStats: async (req, res) => {
    try {
      const { propertyId, startDate, endDate } = req.query;

      // Validate propertyId
      if (!propertyId || !mongoose.Types.ObjectId.isValid(propertyId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid property ID is required',
        });
      }

      // Set date range (default to last 30 days if not provided)
      const endDateObj = endDate ? new Date(endDate) : new Date();
      const startDateObj = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Base match filter
      const matchFilter = {
        property: new mongoose.Types.ObjectId(propertyId),
        createdAt: {
          $gte: startDateObj,
          $lte: endDateObj,
        },
      };

      // Get property details for room information
      const property = await Property.findById(propertyId);
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found',
        });
      }

      // 1. Basic Statistics
      const basicStats = await Booking.aggregate([
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

      // 2. Get previous period for comparison
      const prevStartDate = new Date(startDateObj.getTime() - (endDateObj - startDateObj));
      const prevEndDate = new Date(startDateObj);

      const prevStats = await Booking.aggregate([
        { 
          $match: {
            property: new mongoose.Types.ObjectId(propertyId),
            createdAt: {
              $gte: prevStartDate,
              $lte: prevEndDate,
            },
          }
        },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            totalRevenue: { $sum: '$pricing.totalAmount' },
            checkedOutBookings: {
              $sum: { $cond: [{ $eq: ['$status', 'checked-out'] }, 1, 0] },
            },
          },
        },
      ]);

      // Calculate percentage changes
      const currentStats = basicStats[0] || { totalBookings: 0, totalRevenue: 0, checkedOutBookings: 0 };
      const previousStats = prevStats[0] || { totalBookings: 0, totalRevenue: 0, checkedOutBookings: 0 };

      const calculateChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      // 3. Room Availability Status
      const currentBookings = await Booking.find({
        property: propertyId,
        status: { $in: ['confirmed', 'checked-in'] },
        checkIn: { $lte: new Date() },
        checkOut: { $gte: new Date() },
      });

      const occupiedRooms = currentBookings.length;
      const totalRooms = property.rooms.length;
      
      // Get reserved rooms (future bookings)
      const reservedBookings = await Booking.find({
        property: propertyId,
        status: 'confirmed',
        checkIn: { $gt: new Date() },
      });

      const roomAvailability = {
        occupied: occupiedRooms,
        reserved: reservedBookings.length,
        available: totalRooms - occupiedRooms,
        notReady: 0, // You can implement logic for maintenance/cleaning
        total: totalRooms,
      };

      // 4. Daily bookings trend (last 8 days)
      const bookingTrend = await Booking.aggregate([
        {
          $match: {
            property: new mongoose.Types.ObjectId(propertyId),
            createdAt: {
              $gte: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%d %b", date: "$createdAt" }
            },
            booked: { $sum: 1 },
            cancelled: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
            },
          },
        },
        { $sort: { "_id": 1 } },
        {
          $project: {
            date: "$_id",
            booked: 1,
            cancelled: 1,
            _id: 0,
          },
        },
      ]);

      // 5. Revenue trend (last 7 days)
      const revenueTrend = await Booking.aggregate([
        {
          $match: {
            property: new mongoose.Types.ObjectId(propertyId),
            createdAt: {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: null,
            dailyRevenue: {
              $push: {
                value: "$pricing.totalAmount",
              },
            },
          },
        },
      ]);

      // 6. Checkout status breakdown
      const checkoutStats = await Booking.aggregate([
        {
          $match: {
            property: new mongoose.Types.ObjectId(propertyId),
            status: { $in: ['checked-out', 'checked-in', 'cancelled'] },
            ...matchFilter,
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);

      // Format the response data for frontend consumption
      const response = {
        success: true,
        data: {
          // Metric cards data
          metricCards: [
            {
              title: "New Bookings",
              value: currentStats.totalBookings.toString(),
              change: calculateChange(currentStats.totalBookings, previousStats.totalBookings),
              chartType: "bar",
              chartData: bookingTrend.map(item => ({ value: item.booked })),
            },
            {
              title: "Available Rooms",
              value: roomAvailability.available.toString(),
              change: 0, // You can implement logic to compare with previous period
              chartType: "donut",
              chartData: [
                { name: "Available", value: roomAvailability.available, color: "#4CAF50" },
                { name: "Occupied", value: roomAvailability.occupied, color: "#FF9800" },
              ],
            },
            {
              title: "Revenue",
              value: `₹${currentStats.totalRevenue.toLocaleString()}`,
              change: calculateChange(currentStats.totalRevenue, previousStats.totalRevenue),
              chartType: "line",
              chartData: revenueTrend[0]?.dailyRevenue || [],
            },
            {
              title: "Checkout",
              value: currentStats.checkedOutBookings.toString(),
              change: calculateChange(currentStats.checkedOutBookings, previousStats.checkedOutBookings),
              chartType: "pie",
              chartData: [
                { 
                  name: "Completed", 
                  value: checkoutStats.find(s => s._id === 'checked-out')?.count || 0, 
                  color: "#4CAF50" 
                },
                { 
                  name: "Active", 
                  value: checkoutStats.find(s => s._id === 'checked-in')?.count || 0, 
                  color: "#2196F3" 
                },
                { 
                  name: "Cancelled", 
                  value: checkoutStats.find(s => s._id === 'cancelled')?.count || 0, 
                  color: "#F44336" 
                },
              ],
            },
          ],
          
          // Room availability
          roomAvailability,
          
          // Reservation trend
          reservationTrend: bookingTrend,
          
          // Overall stats
          overallStats: {
            ...currentStats,
            occupancyRate: totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0,
          },
        },
      };

      res.json(response);

    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching dashboard statistics',
        error: error.message,
      });
    }
  },

  // Get recent bookings for dashboard
  getRecentBookings: async (req, res) => {
    try {
      const { propertyId, limit = 5 } = req.query;

      if (!propertyId || !mongoose.Types.ObjectId.isValid(propertyId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid property ID is required',
        });
      }

      const recentBookings = await Booking.find({
        property: propertyId,
      })
        .populate('property', 'placeName')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select('bookingId primaryGuest status checkIn checkOut pricing.totalAmount createdAt');

      res.json({
        success: true,
        data: recentBookings,
      });

    } catch (error) {
      console.error('Recent bookings error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching recent bookings',
        error: error.message,
      });
    }
  },

  // Get monthly revenue chart data
  getMonthlyRevenue: async (req, res) => {
    try {
      const { propertyId, months = 6 } = req.query;

      if (!propertyId || !mongoose.Types.ObjectId.isValid(propertyId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid property ID is required',
        });
      }

      const monthlyRevenue = await Booking.aggregate([
        {
          $match: {
            property: new mongoose.Types.ObjectId(propertyId),
            status: { $ne: 'cancelled' },
            createdAt: {
              $gte: new Date(Date.now() - parseInt(months) * 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            revenue: { $sum: '$pricing.totalAmount' },
            bookings: { $sum: 1 },
          },
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 },
        },
        {
          $project: {
            month: {
              $let: {
                vars: {
                  monthsInString: [
                    '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                  ]
                },
                in: { $arrayElemAt: ['$$monthsInString', '$_id.month'] }
              }
            },
            year: '$_id.year',
            revenue: 1,
            bookings: 1,
            _id: 0,
          },
        },
      ]);

      res.json({
        success: true,
        data: monthlyRevenue,
      });

    } catch (error) {
      console.error('Monthly revenue error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching monthly revenue',
        error: error.message,
      });
    }
  },
};
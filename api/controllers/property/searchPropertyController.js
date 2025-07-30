import Property from '../../models/Property';

// Get featured properties
export const getFeaturedProperties = async (req, res) => {
  try {
    // Get properties with highest ratings or most booked
    const properties = await Property.find({ status: 'published' })
      .sort({ 'ratings.average': -1 })
      .limit(10);
    
    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get Indian states with property counts
export const getStateWisePropertyStats = async (req, res) => {
  try {
    const stateStats = await Property.aggregate([
      { $match: { status: 'published' } },
      { $group: {
          _id: '$location.state',
          count: { $sum: 1 },
          avgPrice: { $avg: '$pricing.weekdayPrice' },
        },
      },
      { $sort: { count: -1 } },
    ]);
    
    res.status(200).json({
      success: true,
      count: stateStats.length,
      data: stateStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get properties by state
export const getPropertiesByState = async (req, res) => {
  try {
    const { state } = req.params;
    
    const properties = await Property.find({
      'location.state': state,
      'status': 'published',
    });
    
    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get properties by city
export const getPropertiesByCity = async (req, res) => {
  try {
    const { city } = req.params;
    
    const properties = await Property.find({
      'location.city': city,
      'status': 'published',
    });
    
    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Check property availability for specific dates
export const checkPropertyAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut } = req.query;
    
    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        error: 'Please provide check-in and check-out dates',
      });
    }
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    const property = await Property.findById(id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found',
      });
    }
    
    // Check if any of the requested dates are in blocked dates
    const isBlocked = property.availability.blockedDates.some(date => {
      const blockedDate = new Date(date);
      return blockedDate >= checkInDate && blockedDate <= checkOutDate;
    });
    
    // Add logic to check booking table for existing bookings
    
    res.status(200).json({
      success: true,
      data: {
        available: !isBlocked,
        property: {
          id: property._id,
          name: property.placeName,
          pricing: property.pricing,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
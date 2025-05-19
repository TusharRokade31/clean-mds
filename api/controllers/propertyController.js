import Property from '../models/Property.js';
import fs from 'fs';
import path from 'path';
import City from '../models/City.js';
import State from '../models/State.js';

// Create new property (initial step)
export const initializeProperty = async (req, res) => {
  try {
    const newProperty = new Property({
      host: req.user.id,
      status: 'draft',
      currentStep: 1,
      // Add placeholders for required fields
      propertyType: 'Hotel', // default value
      placeName: 'Draft Property',
      rentalForm: 'Entire place',
      location: {
        country: 'Draft',
        street: 'Draft',
        city: 'Draft',
        state: 'Draft',
        postalCode: 'Draft'
      },
      size: {
        acreage: 1
      },
      description: 'Draft description',
      pricing: {
        weekdayPrice: 0,
        weekendPrice: 0
      }
    });
    
    const property = await newProperty.save();
    
    res.status(201).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all properties (for admin or host)
export const getAllProperties = async (req, res) => {
  try {
    let query = {};
    
    // If not admin, only show user's properties
    if (req.user.role !== 'admin') {
      query.host = req.user.id;
    }
    
    const properties = await Property.find(query);
    
    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


export const getDraftProperties = async (req, res) => {
  try {
    let query = { status: 'draft' }; 

  
    if (req.user.role !== 'admin') {
      query.host = req.user.id;  
    }
    
    const draftProperties = await Property.find(query);

    res.status(200).json({
      success: true,
      count: draftProperties.length,
      data: draftProperties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get single property
export const getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    // Check if user owns the property or is admin
    if (property.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this property'
      });
    }
    
    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update property - step 1
export const updatePropertyStep1 = async (req, res) => {
  try {
    const { propertyType, placeName, rentalForm } = req.body;
    
    let property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    // Check ownership
    if (property.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this property'
      });
    }
    
    property.propertyType = propertyType;
    property.placeName = placeName;
    property.rentalForm = rentalForm;
    property.currentStep = property.currentStep < 2 ? 2 : property.currentStep;
    property.updatedAt = Date.now();
    
    await property.save();
    
    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


// export const updatePropertyStep1 = async (req, res) => {
//   try {
//     const { propertyType, placeName, rentalForm } = req.body;
    
//     let property = await Property.findById(req.params.id);
    
//     if (!property) {
//       return res.status(404).json({
//         success: false,
//         error: 'Property not found'
//       });
//     }
    
//     // Check ownership (host or admin)
//     if (property.host.toString() !== req.user.id && req.user.role !== 'admin') {
//       return res.status(403).json({
//         success: false,
//         error: 'Not authorized to update this property'
//       });
//     }
    
//     // Validate propertyType enum if needed (optional, Mongoose will do this on save)
//     const allowedPropertyTypes = ['Hotel', 'Cottage', 'Villa', 'Cabin', 'Farm stay', 'Houseboat', 'Lighthouse'];
//     if (propertyType && !allowedPropertyTypes.includes(propertyType)) {
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid property type'
//       });
//     }

//     // Validate rentalForm enum
//     const allowedRentalForms = ['Entire place', 'Private room', 'Share room'];
//     if (rentalForm && !allowedRentalForms.includes(rentalForm)) {
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid rental form'
//       });
//     }

//     // Update fields
//     if (propertyType) property.propertyType = propertyType;
//     if (placeName) property.placeName = placeName;
//     if (rentalForm) property.rentalForm = rentalForm;

//     // Move to step 2 if currentStep is less than 2
//     property.currentStep = property.currentStep < 2 ? 2 : property.currentStep;
//     property.updatedAt = Date.now();
    
//     await property.save();
    
//     res.status(200).json({
//       success: true,
//       data: property
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// Update property - step 2 (Location)
export const updatePropertyStep2 = async (req, res) => {
  try {
    const { country, street, roomNumber, city, state, postalCode, coordinates } = req.body;
    
    let property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    // Check ownership
    if (property.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this property'
      });
    }
    
    // Find state by name
    let stateRef = null;
    if (state) {
      const stateDoc = await State.findOne({ name: { $regex: new RegExp(state, 'i') } });
      if (stateDoc) {
        stateRef = stateDoc._id;
      }
    }
    
    // Find city by name and state
    let cityRef = null;
    if (city && stateRef) {
      const cityDoc = await City.findOne({ 
        name: { $regex: new RegExp(city, 'i') },
        state: stateRef 
      });
      if (cityDoc) {
        cityRef = cityDoc._id;
      }
    }
    
    property.location = {
      country,
      street,
      roomNumber,
      city,
      state,
      stateRef,
      cityRef,
      postalCode,
      coordinates
    };
    property.currentStep = property.currentStep < 3 ? 3 : property.currentStep;
    property.updatedAt = Date.now();
    
    await property.save();
    
    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update property - step 3 (Size)
export const updatePropertyStep3 = async (req, res) => {
  try {
    const { acreage, guests, bedrooms, beds, bathrooms, kitchens } = req.body;
    
    let property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    // Check ownership
    if (property.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this property'
      });
    }
    
    property.size = {
      acreage,
      guests,
      bedrooms,
      beds,
      bathrooms,
      kitchens
    };
    property.currentStep = property.currentStep < 4 ? 4 : property.currentStep;
    property.updatedAt = Date.now();
    
    await property.save();
    
    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update property - step 4 (Amenities)
export const updatePropertyStep4 = async (req, res) => {
  try {
    const { general, other, safety } = req.body;
    
    let property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    // Check ownership
    if (property.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this property'
      });
    }
    
    property.amenities = {
      general,
      other,
      safety
    };
    property.currentStep = property.currentStep < 5 ? 5 : property.currentStep;
    property.updatedAt = Date.now();
    
    await property.save();
    
    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update property - step 5 (Rules)
export const updatePropertyStep5 = async (req, res) => {
  try {
    const { smoking, pets, partyOrganizing, cooking, additionalRules } = req.body;
    
    let property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    // Check ownership
    if (property.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this property'
      });
    }
    
    // Update property rules with the correct enum values
    property.rules = {
      smoking: smoking === true ? 'Allow' : 'Do not allow',
      pets: pets === true ? 'Allow' : 'Do not allow',
      partyOrganizing: partyOrganizing === true ? 'Allow' : 'Do not allow',
      cooking: cooking === true ? 'Allow' : 'Do not allow',
      additionalRules: Array.isArray(additionalRules) 
        ? additionalRules 
        : additionalRules ? [additionalRules] : []
    };
    
    property.currentStep = property.currentStep < 6 ? 6 : property.currentStep;
    property.updatedAt = Date.now();
    
    await property.save();
    
    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update property - step 6 (Description)
export const updatePropertyStep6 = async (req, res) => {
  try {
    const { description } = req.body;
    
    let property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    // Check ownership
    if (property.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this property'
      });
    }
    
    property.description = description;
    property.currentStep = property.currentStep < 7 ? 7 : property.currentStep;
    property.updatedAt = Date.now();
    
    await property.save();
    
    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update property - step 7 (Images)
export const updatePropertyStep7 = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    // Check ownership
    if (property.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this property'
      });
    }
    
    // Handle file uploads
    if (req.files) {
      // Cover image
      if (req.files.cover) {
        property.images.cover = req.files.cover[0].path;
      }
      
      // Additional images
      if (req.files.additional) {
        const additionalPaths = req.files.additional.map(file => file.path);
        property.images.additional = additionalPaths;
      }
    }
    
    property.currentStep = property.currentStep < 8 ? 8 : property.currentStep;
    property.updatedAt = Date.now();
    
    await property.save();
    
    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update property - step 8 (Pricing)
export const updatePropertyStep8 = async (req, res) => {
  try {
    const { currency, weekdayPrice, weekendPrice, monthlyDiscount } = req.body;
    
    let property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    // Check ownership
    if (property.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this property'
      });
    }
    
    property.pricing = {
      currency,
      weekdayPrice,
      weekendPrice,
      monthlyDiscount
    };
    property.currentStep = property.currentStep < 9 ? 9 : property.currentStep;
    property.updatedAt = Date.now();
    
    await property.save();
    
    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update property - step 9 (Availability)
export const updatePropertyStep9 = async (req, res) => {
  try {
    const { minNights, maxNights, blockedDates } = req.body;
    
    let property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    // Check ownership
    if (property.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this property'
      });
    }
    
    property.availability = {
      minNights,
      maxNights,
      blockedDates: blockedDates.map(date => new Date(date))
    };
    property.currentStep = property.currentStep < 10 ? 10 : property.currentStep;
    property.updatedAt = Date.now();
    
    await property.save();
    
    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Final submission - step 10
export const finalizeProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    // Check ownership
    if (property.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this property'
      });
    }
    
    // Update status to pending for review
    property.status = 'pending';
    property.currentStep = 10;
    property.updatedAt = Date.now();
    
    await property.save();
    
    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Admin: Approve or reject property
export const reviewProperty = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['published', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value'
      });
    }
    
    let property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    // Only admin can approve/reject properties
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to review properties'
      });
    }
    
    property.status = status;
    property.updatedAt = Date.now();
    
    await property.save();
    
    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete property
export const deleteProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    // Check ownership
    if (property.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this property'
      });
    }
    
    // Delete associated images
    if (property.images.cover) {
      fs.unlinkSync(property.images.cover);
    }
    
    if (property.images.additional && property.images.additional.length > 0) {
      property.images.additional.forEach(imagePath => {
        fs.unlinkSync(imagePath);
      });
    }
    
    await property.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};



// Get properties by state
export const getPropertiesByState = async (req, res) => {
  try {
    const { state } = req.params;
    
    const properties = await Property.find({
      'location.state': state,
      'status': 'published'
    });
    
    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get properties by city
export const getPropertiesByCity = async (req, res) => {
  try {
    const { city } = req.params;
    
    const properties = await Property.find({
      'location.city': city,
      'status': 'published'
    });
    
    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Search properties with filters
export const searchProperties = async (req, res) => {
  try {
    const {
      propertyType,
      state,
      city,
      minPrice,
      maxPrice,
      guests,
      amenities
    } = req.query;
    
    let query = { status: 'published' };
    
    // Add filters to query
    if (propertyType) query.propertyType = propertyType;
    if (state) query['location.state'] = state;
    if (city) query['location.city'] = city;
    if (guests) query['size.guests'] = { $gte: Number(guests) };
    
    if (minPrice || maxPrice) {
      query.pricing = {};
      if (minPrice) query.pricing.weekdayPrice = { $gte: Number(minPrice) };
      if (maxPrice) query.pricing.weekdayPrice = { ...query.pricing.weekdayPrice, $lte: Number(maxPrice) };
    }
    
    if (amenities) {
      const amenitiesList = amenities.split(',');
      query['amenities.general'] = { $in: amenitiesList };
    }
    
    const properties = await Property.find(query);
    
    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

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
      data: properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
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
          avgPrice: { $avg: '$pricing.weekdayPrice' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      count: stateStats.length,
      data: stateStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
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
        error: 'Please provide check-in and check-out dates'
      });
    }
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    const property = await Property.findById(id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
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
          pricing: property.pricing
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


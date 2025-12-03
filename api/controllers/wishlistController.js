// wishlistController.js
import Wishlist from '../models/Wishlist.js';
import Property from '../models/Property.js';

// Helper function for error responses
const errorResponse = (res, statusCode, message, details = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }),
  });
};

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate({
        path: 'properties.property',
        select: 'placeName location media propertyType placeRating',
      });

    // Create wishlist if doesn't exist
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        properties: [],
      });
    }

    // Filter out null properties (in case property was deleted)
    wishlist.properties = wishlist.properties.filter(
      (item) => item.property !== null
    );

    return res.status(200).json({
      success: true,
      data: {
        wishlist,
        count: wishlist.properties.length,
      },
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// @desc    Add property to wishlist
// @route   POST /api/wishlist/:propertyId
// @access  Private
export const addToWishlist = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return errorResponse(res, 404, 'Property not found');
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        properties: [],
      });
    }

    // Check if property already in wishlist
    const alreadyExists = wishlist.properties.some(
      (item) => item.property.toString() === propertyId
    );

    if (alreadyExists) {
      return errorResponse(res, 400, 'Property already in wishlist');
    }

    // Add property to wishlist
    wishlist.properties.push({
      property: propertyId,
      addedAt: new Date(),
    });

    await wishlist.save();
    await wishlist.populate({
      path: 'properties.property',
      select: 'placeName location media propertyType placeRating',
    });

    return res.status(200).json({
      success: true,
      message: 'Property added to wishlist',
      data: wishlist,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// @desc    Remove property from wishlist
// @route   DELETE /api/wishlist/:propertyId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return errorResponse(res, 404, 'Wishlist not found');
    }

    // Check if property exists in wishlist
    const propertyIndex = wishlist.properties.findIndex(
      (item) => item.property.toString() === propertyId
    );

    if (propertyIndex === -1) {
      return errorResponse(res, 404, 'Property not found in wishlist');
    }

    // Remove property
    wishlist.properties.splice(propertyIndex, 1);
    await wishlist.save();

    return res.status(200).json({
      success: true,
      message: 'Property removed from wishlist',
      data: wishlist,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// @desc    Toggle property in wishlist
// @route   POST /api/wishlist/:propertyId/toggle
// @access  Private
export const toggleWishlist = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return errorResponse(res, 404, 'Property not found');
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        properties: [],
      });
    }

    // Check if property in wishlist
    const propertyIndex = wishlist.properties.findIndex(
      (item) => item.property.toString() === propertyId
    );

    let action = '';

    if (propertyIndex === -1) {
      // Add to wishlist
      wishlist.properties.push({
        property: propertyId,
        addedAt: new Date(),
      });
      action = 'added';
    } else {
      // Remove from wishlist
      wishlist.properties.splice(propertyIndex, 1);
      action = 'removed';
    }

    await wishlist.save();
    await wishlist.populate({
      path: 'properties.property',
      select: 'placeName location media propertyType placeRating',
    });

    return res.status(200).json({
      success: true,
      message: `Property ${action} ${action === 'added' ? 'to' : 'from'} wishlist`,
      data: {
        wishlist,
        action,
        isInWishlist: action === 'added',
      },
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// @desc    Check if property is in wishlist
// @route   GET /api/wishlist/check/:propertyId
// @access  Private
export const checkWishlist = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        data: {
          isInWishlist: false,
        },
      });
    }

    const isInWishlist = wishlist.properties.some(
      (item) => item.property.toString() === propertyId
    );

    return res.status(200).json({
      success: true,
      data: {
        isInWishlist,
      },
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist
// @access  Private
export const clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return errorResponse(res, 404, 'Wishlist not found');
    }

    wishlist.properties = [];
    await wishlist.save();

    return res.status(200).json({
      success: true,
      message: 'Wishlist cleared successfully',
      data: wishlist,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// @desc    Get wishlist count
// @route   GET /api/wishlist/count
// @access  Private
export const getWishlistCount = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    const count = wishlist ? wishlist.properties.length : 0;

    return res.status(200).json({
      success: true,
      data: {
        count,
      },
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};
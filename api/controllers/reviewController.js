// reviewController.js
import Review from '../models/Review.js';
import Property from '../models/Property.js';

// Helper function for error responses
const errorResponse = (res, statusCode, message, details = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }),
  });
};

// @desc    Create a new review
// @route   POST /api/properties/:propertyId/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { rating, title, comment, stayDate, photos } = req.body;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return errorResponse(res, 404, 'Property not found');
    }

    // Check if user already reviewed this property
    const existingReview = await Review.findOne({
      property: propertyId,
      user: req.user._id,
    });

    if (existingReview) {
      return errorResponse(res, 400, 'You have already reviewed this property');
    }

    // Create review
    const review = await Review.create({
      property: propertyId,
      user: req.user._id,
      rating,
      title,
      comment,
      stayDate,
      photos: photos || [],
    });

    // Populate user details
    await review.populate('user', 'name avatar');

    return res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// @desc    Get all reviews for a property
// @route   GET /api/properties/:propertyId/reviews
// @access  Public
export const getPropertyReviews = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { page = 1, limit = 10, sort = '-createdAt', rating } = req.query;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return errorResponse(res, 404, 'Property not found');
    }

    // Build query
    const query = { 
      property: propertyId,
      status: 'approved', // Only show approved reviews
    };

    // Filter by rating if provided
    if (rating) {
      query.rating = Number(rating);
    }

    // Execute query with pagination
    const reviews = await Review.find(query)
      .populate('user', 'name avatar')
      .populate('reply.repliedBy', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count
    const count = await Review.countDocuments(query);

    // Calculate average rating
    const stats = await Review.aggregate([
      { $match: { property: property._id, status: 'approved' } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratings: {
            $push: '$rating',
          },
        },
      },
    ]);

    // Count ratings by star
    const ratingDistribution = await Review.aggregate([
      { $match: { property: property._id, status: 'approved' } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(count / limit),
          totalReviews: count,
          limit: Number(limit),
        },
        statistics: {
          averageRating: stats[0]?.averageRating?.toFixed(1) || 0,
          totalReviews: stats[0]?.totalReviews || 0,
          ratingDistribution: ratingDistribution.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
          }, {}),
        },
      },
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// @desc    Get single review
// @route   GET /api/reviews/:reviewId
// @access  Public
export const getReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId)
      .populate('user', 'name avatar')
      .populate('property', 'placeName location')
      .populate('reply.repliedBy', 'name');

    if (!review) {
      return errorResponse(res, 404, 'Review not found');
    }

    return res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:reviewId
// @access  Private
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment, photos } = req.body;

    let review = await Review.findById(reviewId);

    if (!review) {
      return errorResponse(res, 404, 'Review not found');
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized to update this review');
    }

    // Update fields
    review.rating = rating || review.rating;
    review.title = title || review.title;
    review.comment = comment || review.comment;
    review.photos = photos || review.photos;
    review.status = 'pending'; // Reset to pending after edit

    await review.save();
    await review.populate('user', 'name avatar');

    return res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:reviewId
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return errorResponse(res, 404, 'Review not found');
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized to delete this review');
    }

    await review.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// @desc    Get user's reviews
// @route   GET /api/users/me/reviews
// @access  Private
export const getMyReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ user: req.user._id })
      .populate('property', 'placeName location media')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Review.countDocuments({ user: req.user._id });

    return res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(count / limit),
          totalReviews: count,
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:reviewId/helpful
// @access  Private
export const markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return errorResponse(res, 404, 'Review not found');
    }

    // Check if user already marked as helpful
    if (review.likes.includes(req.user._id)) {
      // Remove like
      review.likes = review.likes.filter(
        (userId) => userId.toString() !== req.user._id.toString()
      );
      review.helpful = Math.max(0, review.helpful - 1);
    } else {
      // Add like
      review.likes.push(req.user._id);
      review.helpful += 1;
    }

    await review.save();

    return res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: {
        helpful: review.helpful,
        isLiked: review.likes.includes(req.user._id),
      },
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// @desc    Reply to review (Property owner only)
// @route   POST /api/reviews/:reviewId/reply
// @access  Private
export const replyToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { comment } = req.body;

    const review = await Review.findById(reviewId).populate('property');

    if (!review) {
      return errorResponse(res, 404, 'Review not found');
    }

    // Check if user is the property owner
    if (review.property.owner.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Only property owner can reply to reviews');
    }

    if (!comment) {
      return errorResponse(res, 400, 'Reply comment is required');
    }

    review.reply = {
      comment,
      repliedBy: req.user._id,
      repliedAt: new Date(),
    };

    await review.save();
    await review.populate('reply.repliedBy', 'name');

    return res.status(200).json({
      success: true,
      message: 'Reply added successfully',
      data: review,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};
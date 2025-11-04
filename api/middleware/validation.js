import { query, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })),
    });
  }
  next();
};

// middleware/validation.js

export const validateFilterQuery = [
  query('location').notEmpty().withMessage('Location is required'),
  query('checkin').optional().isISO8601().withMessage('Invalid check-in date'),
  query('checkout').optional().isISO8601().withMessage('Invalid check-out date'),
  query('persons').optional().isInt({ min: 1 }).withMessage('Persons must be at least 1'),
  query('skip').optional().isInt({ min: 0 }).withMessage('Skip must be non-negative'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
  query('priceRange').optional().isString(),
  query('starRating').optional().isString(),
  query('distance').optional().isString(),
  query('amenities').optional().isString(),
  query('propertyType').optional().isString(),
  query('sortBy').optional().isIn(['relevance', 'price_low', 'price_high', 'rating', 'newest', 'popular'])
];
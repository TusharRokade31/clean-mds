// controllers/propertyController.js
import { query } from 'express-validator';

export const validatePropertyQuery = [
  query('location')
    .optional()
    .isString()
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Location must be non-empty string'),

    query('checkin')
      .optional()
      .isISO8601()
      .withMessage('Check-in must be a valid date'),
    
    query('checkout')
      .optional()
      .isISO8601()
      .withMessage('Check-out must be a valid date'),
    
    query('persons')
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage('Persons must be a number between 1 and 20'),

    query('skip')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Skip must be a non-negative integer'),

     query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ];
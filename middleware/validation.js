const { body } = require('express-validator');
const config = require('../config/config');

// Validation rules for user registration
exports.registerValidation = [
  body('name')
    .trim()
    .isLength({ min: config.nameMinLength, max: config.nameMaxLength })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('mobile')
    .trim()
    .isLength({ min: config.mobileLength, max: config.mobileLength })
    .withMessage('Mobile number must be exactly 10 digits')
    .matches(/^[0-9]+$/)
    .withMessage('Mobile number can only contain digits'),
  
  body('password')
    .isLength({ min: config.passwordMinLength })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Validation rules for user login
exports.loginValidation = [
  body('mobile')
    .trim()
    .isLength({ min: config.mobileLength, max: config.mobileLength })
    .withMessage('Mobile number must be exactly 10 digits')
    .matches(/^[0-9]+$/)
    .withMessage('Mobile number can only contain digits'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation rules for updating user status
exports.updateStatusValidation = [
  body('status')
    .isIn(['online', 'offline', 'away'])
    .withMessage('Status must be online, offline, or away')
];

// Validation rules for updating profile
exports.updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: config.nameMinLength, max: config.nameMaxLength })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('profilePic')
    .optional()
    .isURL()
    .withMessage('Profile picture must be a valid URL'),
  
  body('socketId')
    .optional()
    .isString()
    .withMessage('Socket ID must be a string')
]; 
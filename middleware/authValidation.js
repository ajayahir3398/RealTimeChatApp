const { body } = require('express-validator');

exports.registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('mobile')
    .matches(/^[0-9]{10}$/)
    .withMessage('Mobile number must be exactly 10 digits'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

exports.loginValidation = [
  body('mobile')
    .matches(/^[0-9]{10}$/)
    .withMessage('Mobile number must be exactly 10 digits'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

exports.updateStatusValidation = [
  body('status')
    .isIn(['online', 'offline', 'away'])
    .withMessage('Status must be online, offline, or away')
]; 
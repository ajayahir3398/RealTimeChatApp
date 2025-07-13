const { body, param } = require('express-validator');

exports.addContactValidation = [
  body('mobile')
    .matches(/^[0-9]{10}$/)
    .withMessage('Mobile number must be exactly 10 digits'),
  
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Contact name must be between 1 and 50 characters')
];

exports.updateContactNameValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Contact name must be between 1 and 50 characters')
];

exports.contactIdValidation = [
  param('contactId')
    .isMongoId()
    .withMessage('Contact ID must be a valid MongoDB ObjectId')
]; 
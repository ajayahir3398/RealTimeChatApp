const { body, param, query } = require('express-validator');

exports.sendMessageValidation = [
  body('chatId')
    .isMongoId()
    .withMessage('Chat ID must be a valid MongoDB ObjectId'),
  
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  
  body('type')
    .isIn(['text', 'image', 'file'])
    .withMessage('Message type must be text, image, or file'),
  
  body('fileUrl')
    .optional()
    .isURL()
    .withMessage('File URL must be a valid URL'),
  
  body('replyTo')
    .optional()
    .isMongoId()
    .withMessage('Reply message ID must be a valid MongoDB ObjectId')
];

exports.editMessageValidation = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters')
];

exports.messageIdValidation = [
  param('messageId')
    .isMongoId()
    .withMessage('Message ID must be a valid MongoDB ObjectId')
];

exports.chatIdValidation = [
  param('chatId')
    .isMongoId()
    .withMessage('Chat ID must be a valid MongoDB ObjectId')
];

exports.messageQueryValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('skip')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Skip must be a non-negative integer'),
  
  query('query')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters long')
];

exports.validateFileMessage = [
  body('type')
    .custom((value, { req }) => {
      if (value === 'image' || value === 'file') {
        if (!req.body.fileUrl) {
          throw new Error('File URL is required for image and file messages');
        }
      }
      return true;
    }),
  
  body('fileUrl')
    .custom((value, { req }) => {
      if (req.body.type === 'image' || req.body.type === 'file') {
        if (!value) {
          throw new Error('File URL is required for image and file messages');
        }
        if (!value.match(/^https?:\/\/.+/)) {
          throw new Error('File URL must be a valid HTTP/HTTPS URL');
        }
      }
      return true;
    })
]; 
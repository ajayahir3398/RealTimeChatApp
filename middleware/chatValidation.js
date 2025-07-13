const { body, param } = require('express-validator');

exports.createIndividualChatValidation = [
  body('mobile')
    .matches(/^[0-9]{10}$/)
    .withMessage('Mobile number must be exactly 10 digits')
];

exports.createGroupChatValidation = [
  body('groupName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Group name must be between 2 and 50 characters'),
  
  body('memberMobiles')
    .isArray({ min: 1, max: 50 })
    .withMessage('Must provide at least 1 and maximum 50 member mobile numbers'),
  
  body('memberMobiles.*')
    .matches(/^[0-9]{10}$/)
    .withMessage('Each mobile number must be exactly 10 digits'),
  
  body('profilePic')
    .optional()
    .isURL()
    .withMessage('Profile picture must be a valid URL')
];

exports.addMemberValidation = [
  body('mobile')
    .matches(/^[0-9]{10}$/)
    .withMessage('Mobile number must be exactly 10 digits')
];

exports.updateGroupInfoValidation = [
  body('groupName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Group name must be between 2 and 50 characters'),
  
  body('profilePic')
    .optional()
    .isURL()
    .withMessage('Profile picture must be a valid URL')
];

exports.chatIdValidation = [
  param('chatId')
    .isMongoId()
    .withMessage('Chat ID must be a valid MongoDB ObjectId')
];

exports.memberIdValidation = [
  param('memberId')
    .isMongoId()
    .withMessage('Member ID must be a valid MongoDB ObjectId')
]; 
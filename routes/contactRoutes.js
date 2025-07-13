const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticateToken } = require('../middleware/auth');
const { 
  addContactValidation, 
  updateContactNameValidation,
  contactIdValidation 
} = require('../middleware/contactValidation');

/**
 * @swagger
 * /api/contacts:
 *   get:
 *     summary: Get all contacts for the current user
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contacts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     contacts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           contactId:
 *                             $ref: '#/components/schemas/User'
 *                           name:
 *                             type: string
 *                             description: Custom name for the contact
 *                           addedAt:
 *                             type: string
 *                             format: date-time
 *                     totalContacts:
 *                       type: number
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', authenticateToken, contactController.getContacts);

/**
 * @swagger
 * /api/contacts:
 *   post:
 *     summary: Add a new contact by mobile number
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddContactRequest'
 *     responses:
 *       201:
 *         description: Contact added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Contact added successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     contacts:
 *                       type: array
 *                       items:
 *                         type: object
 *                     totalContacts:
 *                       type: number
 *       400:
 *         description: Validation error, contact already exists, or cannot add self
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User with this mobile number not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', authenticateToken, addContactValidation, contactController.addContact);

/**
 * @swagger
 * /api/contacts/{contactId}:
 *   delete:
 *     summary: Remove a contact
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact ID to remove
 *     responses:
 *       200:
 *         description: Contact removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Contact removed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     contacts:
 *                       type: array
 *                       items:
 *                         type: object
 *                     totalContacts:
 *                       type: number
 *       400:
 *         description: Invalid contact ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Contact not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:contactId', authenticateToken, contactIdValidation, contactController.removeContact);

/**
 * @swagger
 * /api/contacts/{contactId}/name:
 *   patch:
 *     summary: Update contact custom name
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New custom name for the contact
 *                 example: "Work Friend"
 *             required:
 *               - name
 *     responses:
 *       200:
 *         description: Contact name updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Contact name updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     contacts:
 *                       type: array
 *                       items:
 *                         type: object
 *                     totalContacts:
 *                       type: number
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Contact not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/:contactId/name', authenticateToken, updateContactNameValidation, contactController.updateContactName);

/**
 * @swagger
 * /api/contacts/search:
 *   get:
 *     summary: Search users to add as contacts
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query (name or mobile)
 *     responses:
 *       200:
 *         description: Users found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       400:
 *         description: Search query too short
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/search', authenticateToken, contactController.searchUsers);

module.exports = router; 
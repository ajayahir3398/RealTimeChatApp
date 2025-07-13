const { validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const User = require('../models/User');

// Get all contacts for a user
exports.getContacts = async (req, res) => {
  try {
    const contactList = await Contact.getOrCreateContactList(req.userId);
    const contactsWithDetails = await contactList.getContactsWithDetails();

    res.status(200).json({
      status: 'success',
      data: {
        contacts: contactsWithDetails,
        totalContacts: contactList.contactCount
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while fetching contacts'
    });
  }
};

// Add a contact
exports.addContact = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { mobile, name } = req.body;

    const contactUser = await User.findOne({ mobile });
    if (!contactUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User with this mobile number not found'
      });
    }

    if (contactUser._id.toString() === req.userId) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot add yourself as a contact'
      });
    }

    const contactList = await Contact.getOrCreateContactList(req.userId);

    const existingContact = contactList.contacts.find(
      contact => contact.contactId.toString() === contactUser._id.toString()
    );

    if (existingContact) {
      return res.status(400).json({
        status: 'error',
        message: 'Contact already exists in your list'
      });
    }

    contactList.contacts.push({
      contactId: contactUser._id,
      name: name,
      addedAt: new Date()
    });

    await contactList.save();
    const updatedContacts = await contactList.getContactsWithDetails();

    res.status(201).json({
      status: 'success',
      message: 'Contact added successfully',
      data: {
        contacts: updatedContacts,
        totalContacts: contactList.contactCount
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while adding contact'
    });
  }
};

// Remove a contact
exports.removeContact = async (req, res) => {
  try {
    const { contactId } = req.params;

    const contactList = await Contact.findOne({ userId: req.userId });
    if (!contactList) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact list not found'
      });
    }

    try {
      await contactList.removeContact(contactId);
      const updatedContacts = await contactList.getContactsWithDetails();

      res.status(200).json({
        status: 'success',
        message: 'Contact removed successfully',
        data: {
          contacts: updatedContacts,
          totalContacts: contactList.contactCount
        }
      });

    } catch (error) {
      if (error.message === 'Contact not found') {
        return res.status(404).json({
          status: 'error',
          message: 'Contact not found in your list'
        });
      }
      throw error;
    }

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while removing contact'
    });
  }
};

// Update contact name
exports.updateContactName = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { contactId } = req.params;
    const { name } = req.body;

    const contactList = await Contact.findOne({ userId: req.userId });
    if (!contactList) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact list not found'
      });
    }

    try {
      await contactList.updateContactName(contactId, name);
      const updatedContacts = await contactList.getContactsWithDetails();

      res.status(200).json({
        status: 'success',
        message: 'Contact name updated successfully',
        data: {
          contacts: updatedContacts,
          totalContacts: contactList.contactCount
        }
      });

    } catch (error) {
      if (error.message === 'Contact not found') {
        return res.status(404).json({
          status: 'error',
          message: 'Contact not found in your list'
        });
      }
      throw error;
    }

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while updating contact name'
    });
  }
};

// Search users to add as contacts
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query must be at least 2 characters long'
      });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { mobile: { $regex: query, $options: 'i' } }
      ],
      _id: { $ne: req.userId }
    }).select('name mobile profilePic status').limit(10);

    res.status(200).json({
      status: 'success',
      data: {
        users
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while searching users'
    });
  }
}; 
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  contacts: [{
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Contact name cannot exceed 50 characters']
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

contactSchema.index({ userId: 1 });
contactSchema.index({ 'contacts.contactId': 1 });

contactSchema.virtual('contactCount').get(function() {
  return this.contacts.length;
});

contactSchema.methods.addContact = function(contactId, name) {
  const existingContact = this.contacts.find(
    contact => contact.contactId.toString() === contactId.toString()
  );

  if (existingContact) {
    throw new Error('Contact already exists');
  }

  this.contacts.push({
    contactId,
    name,
    addedAt: new Date()
  });

  return this.save();
};

contactSchema.methods.removeContact = function(contactId) {
  const initialLength = this.contacts.length;
  this.contacts = this.contacts.filter(
    contact => contact.contactId.toString() !== contactId.toString()
  );

  if (this.contacts.length === initialLength) {
    throw new Error('Contact not found');
  }

  return this.save();
};

contactSchema.methods.updateContactName = function(contactId, name) {
  const contact = this.contacts.find(
    contact => contact.contactId.toString() === contactId.toString()
  );

  if (!contact) {
    throw new Error('Contact not found');
  }

  contact.name = name;
  return this.save();
};

contactSchema.methods.getContactsWithDetails = async function() {
  const populatedContacts = await this.populate('contacts.contactId', 'name mobile profilePic status');
  return populatedContacts.contacts.map(contact => ({
    _id: contact.contactId._id,
    name: contact.name,
    mobile: contact.contactId.mobile,
    profilePic: contact.contactId.profilePic,
    status: contact.contactId.status,
    addedAt: contact.addedAt
  }));
};

contactSchema.statics.getOrCreateContactList = async function(userId) {
  let contactList = await this.findOne({ userId });
  
  if (!contactList) {
    contactList = new this({ userId, contacts: [] });
    await contactList.save();
  }
  
  return contactList;
};

module.exports = mongoose.model('Contact', contactSchema); 
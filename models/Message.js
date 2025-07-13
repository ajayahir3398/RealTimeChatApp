const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: [true, 'Chat ID is required'],
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender ID is required'],
    index: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Receiver ID is required'],
    index: true
  },
  message: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text',
    required: true
  },
  fileUrl: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        if (this.type === 'image' || this.type === 'file') {
          return v && v.length > 0;
        }
        return true;
      },
      message: 'File URL is required for image and file messages'
    }
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  seenBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  editedAt: {
    type: Date,
    default: null
  },
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ receiverId: 1 });
messageSchema.index({ replyTo: 1 });
messageSchema.index({ deleted: 1 });

messageSchema.virtual('isEdited').get(function() {
  return this.editedAt !== null;
});

messageSchema.virtual('isDeleted').get(function() {
  return this.deleted === true;
});

messageSchema.methods.markAsSeen = function(userId) {
  if (!this.seenBy.includes(userId)) {
    this.seenBy.push(userId);
    return this.save();
  }
  return this;
};

messageSchema.methods.editMessage = function(newContent) {
  if (this.deleted) {
    throw new Error('Cannot edit deleted message');
  }
  
  this.message = newContent;
  this.editedAt = new Date();
  return this.save();
};

messageSchema.methods.deleteMessage = function(userId) {
  if (this.senderId.toString() !== userId.toString()) {
    throw new Error('Only sender can delete the message');
  }
  
  this.deleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  return this.save();
};

messageSchema.methods.getMessageWithDetails = async function() {
  await this.populate('senderId', 'name mobile profilePic status');
  await this.populate('receiverId', 'name mobile profilePic status');
  await this.populate('replyTo', 'message senderId createdAt');
  await this.populate('deletedBy', 'name mobile profilePic');
  await this.populate('seenBy', 'name mobile profilePic');
  return this;
};

messageSchema.statics.getChatMessages = async function(chatId, limit = 50, skip = 0) {
  return await this.find({ 
    chatId, 
    deleted: false 
  })
    .populate('senderId', 'name mobile profilePic status')
    .populate('receiverId', 'name mobile profilePic status')
    .populate('replyTo', 'message senderId createdAt')
    .populate('seenBy', 'name mobile profilePic')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

messageSchema.statics.getUnreadCount = async function(chatId, userId) {
  const messages = await this.find({
    chatId,
    senderId: { $ne: userId },
    deleted: false,
    seenBy: { $ne: userId }
  });
  
  return messages.length;
};

messageSchema.statics.markChatAsSeen = async function(chatId, userId) {
  return await this.updateMany(
    {
      chatId,
      senderId: { $ne: userId },
      deleted: false,
      seenBy: { $ne: userId }
    },
    {
      $addToSet: { seenBy: userId }
    }
  );
};

messageSchema.pre('save', function(next) {
  if ((this.type === 'image' || this.type === 'file') && !this.fileUrl) {
    return next(new Error('File URL is required for image and file messages'));
  }
  next();
});

module.exports = mongoose.model('Message', messageSchema); 
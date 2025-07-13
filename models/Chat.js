const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  isGroup: {
    type: Boolean,
    default: false
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  groupName: {
    type: String,
    trim: true,
    maxlength: [50, 'Group name cannot exceed 50 characters'],
    default: null
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  profilePic: {
    type: String,
    default: null
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  }
}, {
  timestamps: true
});

chatSchema.index({ members: 1 });
chatSchema.index({ isGroup: 1 });
chatSchema.index({ groupAdmin: 1 });
chatSchema.index({ lastMessage: 1 });

chatSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

chatSchema.methods.isMember = function(userId) {
  return this.members.some(member => {
    const memberId = member._id ? member._id.toString() : member.toString();
    return memberId === userId.toString();
  });
};

chatSchema.methods.isAdmin = function(userId) {
  if (!this.groupAdmin) return false;
  const adminId = this.groupAdmin._id ? this.groupAdmin._id.toString() : this.groupAdmin.toString();
  return adminId === userId.toString();
};

chatSchema.methods.addMember = function(userId) {
  if (!this.isMember(userId)) {
    this.members.push(userId);
    return this.save();
  }
  throw new Error('User is already a member of this chat');
};

chatSchema.methods.removeMember = function(userId) {
  const initialLength = this.members.length;
  this.members = this.members.filter(
    member => member.toString() !== userId.toString()
  );
  
  if (this.members.length === initialLength) {
    throw new Error('User is not a member of this chat');
  }
  
  return this.save();
};

chatSchema.methods.updateLastMessage = function(messageId) {
  this.lastMessage = messageId;
  this.updatedAt = new Date();
  return this.save();
};

chatSchema.methods.getChatWithDetails = async function() {
  await this.populate('members', 'name mobile profilePic status');
  await this.populate('groupAdmin', 'name mobile profilePic');
  await this.populate('lastMessage', 'message senderId createdAt');
  return this;
};

chatSchema.statics.findOrCreateIndividualChat = async function(user1Id, user2Id) {
  let chat = await this.findOne({
    isGroup: false,
    members: { $all: [user1Id, user2Id], $size: 2 }
  });

  if (!chat) {
    chat = new this({
      isGroup: false,
      members: [user1Id, user2Id]
    });
    await chat.save();
  }

  return chat;
};

chatSchema.statics.createGroupChat = async function(adminId, groupName, memberIds, profilePic = null) {
  const allMembers = [adminId, ...memberIds];
  
  const chat = new this({
    isGroup: true,
    members: allMembers,
    groupName,
    groupAdmin: adminId,
    profilePic
  });

  return await chat.save();
};

chatSchema.statics.getUserChats = async function(userId) {
  return await this.find({ members: userId })
    .populate('members', 'name mobile profilePic status')
    .populate('groupAdmin', 'name mobile profilePic')
    .populate('lastMessage', 'message senderId createdAt')
    .sort({ updatedAt: -1 });
};

module.exports = mongoose.model('Chat', chatSchema); 
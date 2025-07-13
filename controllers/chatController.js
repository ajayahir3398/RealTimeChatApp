const { validationResult } = require('express-validator');
const Chat = require('../models/Chat');
const User = require('../models/User');

// Get all chats for the current user
exports.getUserChats = async (req, res) => {
  try {
    const chats = await Chat.getUserChats(req.userId);

    res.status(200).json({
      status: 'success',
      data: {
        chats,
        totalChats: chats.length
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while fetching chats'
    });
  }
};

// Get a specific chat by ID
exports.getChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    const chat = await Chat.findById(chatId)
      .populate('members', 'name mobile profilePic status')
      .populate('groupAdmin', 'name mobile profilePic')
      .populate('lastMessage', 'message senderId createdAt');

    if (!chat) {
      return res.status(404).json({
        status: 'error',
        message: 'Chat not found'
      });
    }

    if (!chat.isMember(req.userId)) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not a member of this chat'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        chat
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while fetching chat'
    });
  }
};

// Create or find individual chat
exports.createIndividualChat = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { mobile } = req.body;

    const otherUser = await User.findOne({ mobile });
    if (!otherUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User with this mobile number not found'
      });
    }

    if (otherUser._id.toString() === req.userId) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot create chat with yourself'
      });
    }

    const chat = await Chat.findOrCreateIndividualChat(req.userId, otherUser._id);
    const chatWithDetails = await chat.getChatWithDetails();

    res.status(200).json({
      status: 'success',
      message: chat.isNew ? 'Individual chat created successfully' : 'Individual chat found',
      data: {
        chat: chatWithDetails
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while creating chat'
    });
  }
};

// Create group chat
exports.createGroupChat = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { groupName, memberMobiles, profilePic } = req.body;

    if (!groupName || groupName.trim().length < 2) {
      return res.status(400).json({
        status: 'error',
        message: 'Group name must be at least 2 characters long'
      });
    }

    const memberUsers = await User.find({ mobile: { $in: memberMobiles } });
    
    if (memberUsers.length !== memberMobiles.length) {
      return res.status(400).json({
        status: 'error',
        message: 'Some users with provided mobile numbers not found'
      });
    }

    const currentUserInMembers = memberUsers.find(
      user => user._id.toString() === req.userId
    );

    if (!currentUserInMembers) {
      return res.status(400).json({
        status: 'error',
        message: 'You must include yourself in the group members'
      });
    }

    const memberIds = memberUsers.map(user => user._id);

    const chat = await Chat.createGroupChat(req.userId, groupName, memberIds, profilePic);
    const chatWithDetails = await chat.getChatWithDetails();

    res.status(201).json({
      status: 'success',
      message: 'Group chat created successfully',
      data: {
        chat: chatWithDetails
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while creating group chat'
    });
  }
};

// Add member to group chat (admin only)
exports.addMemberToGroup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { chatId } = req.params;
    const { mobile } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        status: 'error',
        message: 'Chat not found'
      });
    }

    if (!chat.isGroup) {
      return res.status(400).json({
        status: 'error',
        message: 'Can only add members to group chats'
      });
    }

    if (!chat.isAdmin(req.userId)) {
      return res.status(403).json({
        status: 'error',
        message: 'Only group admin can add members'
      });
    }

    const newMember = await User.findOne({ mobile });
    if (!newMember) {
      return res.status(404).json({
        status: 'error',
        message: 'User with this mobile number not found'
      });
    }

    await chat.addMember(newMember._id);
    const updatedChat = await chat.getChatWithDetails();

    res.status(200).json({
      status: 'success',
      message: 'Member added to group successfully',
      data: {
        chat: updatedChat
      }
    });

  } catch (error) {
    if (error.message === 'User is already a member of this chat') {
      return res.status(400).json({
        status: 'error',
        message: 'User is already a member of this group'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while adding member'
    });
  }
};

// Remove member from group chat (admin only)
exports.removeMemberFromGroup = async (req, res) => {
  try {
    const { chatId, memberId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        status: 'error',
        message: 'Chat not found'
      });
    }

    if (!chat.isGroup) {
      return res.status(400).json({
        status: 'error',
        message: 'Can only remove members from group chats'
      });
    }

    if (!chat.isAdmin(req.userId)) {
      return res.status(403).json({
        status: 'error',
        message: 'Only group admin can remove members'
      });
    }

    if (chat.groupAdmin.toString() === memberId) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot remove group admin'
      });
    }

    await chat.removeMember(memberId);
    const updatedChat = await chat.getChatWithDetails();

    res.status(200).json({
      status: 'success',
      message: 'Member removed from group successfully',
      data: {
        chat: updatedChat
      }
    });

  } catch (error) {
    if (error.message === 'User is not a member of this chat') {
      return res.status(400).json({
        status: 'error',
        message: 'User is not a member of this group'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while removing member'
    });
  }
};

// Leave group chat
exports.leaveGroup = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        status: 'error',
        message: 'Chat not found'
      });
    }

    if (!chat.isGroup) {
      return res.status(400).json({
        status: 'error',
        message: 'Can only leave group chats'
      });
    }

    if (chat.isAdmin(req.userId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Group admin cannot leave. Transfer admin role first.'
      });
    }

    await chat.removeMember(req.userId);

    res.status(200).json({
      status: 'success',
      message: 'Left group successfully'
    });

  } catch (error) {
    if (error.message === 'User is not a member of this chat') {
      return res.status(400).json({
        status: 'error',
        message: 'You are not a member of this group'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while leaving group'
    });
  }
};

// Update group info (admin only)
exports.updateGroupInfo = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { chatId } = req.params;
    const { groupName, profilePic } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        status: 'error',
        message: 'Chat not found'
      });
    }

    if (!chat.isGroup) {
      return res.status(400).json({
        status: 'error',
        message: 'Can only update group chats'
      });
    }

    if (!chat.isAdmin(req.userId)) {
      return res.status(403).json({
        status: 'error',
        message: 'Only group admin can update group info'
      });
    }

    if (groupName) chat.groupName = groupName;
    if (profilePic) chat.profilePic = profilePic;

    await chat.save();
    const updatedChat = await chat.getChatWithDetails();

    res.status(200).json({
      status: 'success',
      message: 'Group info updated successfully',
      data: {
        chat: updatedChat
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while updating group info'
    });
  }
}; 
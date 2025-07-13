const { validationResult } = require('express-validator');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { chatId, message, type, fileUrl, replyTo } = req.body;

    const chat = await Chat.findById(chatId);
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

    if (replyTo) {
      const replyMessage = await Message.findById(replyTo);
      if (!replyMessage || replyMessage.chatId.toString() !== chatId) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid reply message'
        });
      }
    }

    let receiverId = null;
    if (!chat.isGroup) {
      receiverId = chat.members.find(member => 
        member.toString() !== req.userId
      );
    }

    const newMessage = new Message({
      chatId,
      senderId: req.userId,
      receiverId,
      message,
      type,
      fileUrl,
      replyTo
    });

    await newMessage.save();
    await chat.updateLastMessage(newMessage._id);

    const messageWithDetails = await newMessage.getMessageWithDetails();

    res.status(201).json({
      status: 'success',
      message: 'Message sent successfully',
      data: {
        message: messageWithDetails
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while sending message'
    });
  }
};

// Get messages for a chat
exports.getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const chat = await Chat.findById(chatId);
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

    const messages = await Message.getChatMessages(chatId, parseInt(limit), parseInt(skip));
    await Message.markChatAsSeen(chatId, req.userId);

    res.status(200).json({
      status: 'success',
      data: {
        messages,
        totalMessages: messages.length,
        hasMore: messages.length === parseInt(limit)
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while fetching messages'
    });
  }
};

// Get a specific message
exports.getMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId)
      .populate('senderId', 'name mobile profilePic status')
      .populate('receiverId', 'name mobile profilePic status')
      .populate('replyTo', 'message senderId createdAt')
      .populate('seenBy', 'name mobile profilePic')
      .populate('deletedBy', 'name mobile profilePic');

    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: 'Message not found'
      });
    }

    const chat = await Chat.findById(message.chatId);
    if (!chat || !chat.isMember(req.userId)) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not a member of this chat'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        message
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while fetching message'
    });
  }
};

// Edit a message
exports.editMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { messageId } = req.params;
    const { message } = req.body;

    const messageDoc = await Message.findById(messageId);
    if (!messageDoc) {
      return res.status(404).json({
        status: 'error',
        message: 'Message not found'
      });
    }

    if (messageDoc.senderId.toString() !== req.userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Only sender can edit the message'
      });
    }

    if (messageDoc.deleted) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot edit deleted message'
      });
    }

    await messageDoc.editMessage(message);
    const updatedMessage = await messageDoc.getMessageWithDetails();

    res.status(200).json({
      status: 'success',
      message: 'Message edited successfully',
      data: {
        message: updatedMessage
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while editing message'
    });
  }
};

// Delete a message (soft delete)
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: 'Message not found'
      });
    }

    if (message.senderId.toString() !== req.userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Only sender can delete the message'
      });
    }

    if (message.deleted) {
      return res.status(400).json({
        status: 'error',
        message: 'Message is already deleted'
      });
    }

    await message.deleteMessage(req.userId);

    res.status(200).json({
      status: 'success',
      message: 'Message deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while deleting message'
    });
  }
};

// Mark message as seen
exports.markMessageAsSeen = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: 'Message not found'
      });
    }

    const chat = await Chat.findById(message.chatId);
    if (!chat || !chat.isMember(req.userId)) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not a member of this chat'
      });
    }

    await message.markAsSeen(req.userId);

    res.status(200).json({
      status: 'success',
      message: 'Message marked as seen'
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while marking message as seen'
    });
  }
};

// Get unread message count for a chat
exports.getUnreadCount = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
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

    const unreadCount = await Message.getUnreadCount(chatId, req.userId);

    res.status(200).json({
      status: 'success',
      data: {
        unreadCount
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while getting unread count'
    });
  }
};

// Search messages in a chat
exports.searchMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { query, limit = 20 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query must be at least 2 characters long'
      });
    }

    const chat = await Chat.findById(chatId);
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

    const messages = await Message.find({
      chatId,
      message: { $regex: query, $options: 'i' },
      deleted: false
    })
      .populate('senderId', 'name mobile profilePic status')
      .populate('receiverId', 'name mobile profilePic status')
      .populate('replyTo', 'message senderId createdAt')
      .populate('seenBy', 'name mobile profilePic')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      status: 'success',
      data: {
        messages,
        totalResults: messages.length
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while searching messages'
    });
  }
}; 
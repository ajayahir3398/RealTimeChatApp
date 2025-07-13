const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Chat App API',
      version: '1.0.0',
      description: 'A comprehensive REST API for a chat application with user authentication and real-time features.',
      contact: {
        name: 'API Support',
        email: 'support@chatapp.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for authentication'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Unique user ID'
            },
            name: {
              type: 'string',
              description: 'User\'s full name',
              minLength: 2,
              maxLength: 50
            },
            mobile: {
              type: 'string',
              description: '10-digit mobile number',
              pattern: '^[0-9]{10}$'
            },
            profilePic: {
              type: 'string',
              description: 'Profile picture URL',
              default: 'https://via.placeholder.com/150x150?text=User'
            },
            status: {
              type: 'string',
              enum: ['online', 'offline', 'away'],
              description: 'User\'s current status',
              default: 'offline'
            },
            socketId: {
              type: 'string',
              description: 'Socket.IO connection ID',
              nullable: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          },
          required: ['name', 'mobile']
        },
        RegisterRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'User\'s full name (2-50 characters, letters and spaces only)',
              example: 'Ajay Bandhiya'
            },
            mobile: {
              type: 'string',
              description: '10-digit mobile number',
              example: '9876543210'
            },
            password: {
              type: 'string',
              description: 'Password (min 6 chars, must contain uppercase, lowercase, and number)',
              example: 'Password123'
            }
          },
          required: ['name', 'mobile', 'password']
        },
        LoginRequest: {
          type: 'object',
          properties: {
            mobile: {
              type: 'string',
              description: '10-digit mobile number',
              example: '9876543210'
            },
            password: {
              type: 'string',
              description: 'User password',
              example: 'Password123'
            }
          },
          required: ['mobile', 'password']
        },
        StatusUpdateRequest: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['online', 'offline', 'away'],
              description: 'New user status',
              example: 'away'
            }
          },
          required: ['status']
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success'
            },
            message: {
              type: 'string',
              description: 'Success message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error'
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string'
                  },
                  message: {
                    type: 'string'
                  }
                }
              },
              description: 'Validation errors (if any)'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success'
            },
            message: {
              type: 'string',
              example: 'User registered successfully'
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User'
                },
                token: {
                  type: 'string',
                  description: 'JWT token for authentication',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                }
              }
            }
          }
        },
        Contact: {
          type: 'object',
          properties: {
            contactId: {
              $ref: '#/components/schemas/User'
            },
            name: {
              type: 'string',
              description: 'Custom name for the contact',
              example: 'Best Friend'
            },
            addedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the contact was added'
            }
          }
        },
        ContactList: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'User ID who owns this contact list'
            },
            contacts: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Contact'
              }
            },
            totalContacts: {
              type: 'number',
              description: 'Total number of contacts'
            }
          }
        },
        AddContactRequest: {
          type: 'object',
          properties: {
            mobile: {
              type: 'string',
              description: '10-digit mobile number of the user to add as contact',
              example: '9876543211',
              pattern: '^[0-9]{10}$'
            },
            name: {
              type: 'string',
              description: 'Optional custom name for the contact',
              example: 'Best Friend',
              maxLength: 50
            }
          },
          required: ['mobile']
        },
        Chat: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Chat ID'
            },
            isGroup: {
              type: 'boolean',
              description: 'Whether this is a group chat',
              example: false
            },
            members: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/User'
              },
              description: 'Chat members'
            },
            groupName: {
              type: 'string',
              description: 'Group name (only for group chats)',
              example: 'Work Team',
              nullable: true
            },
            groupAdmin: {
              $ref: '#/components/schemas/User',
              description: 'Group admin (only for group chats)',
              nullable: true
            },
            profilePic: {
              type: 'string',
              description: 'Group profile picture URL (only for group chats)',
              example: 'https://example.com/group-pic.jpg',
              nullable: true
            },
            lastMessage: {
              type: 'object',
              description: 'Last message in the chat',
              nullable: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Chat creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        CreateGroupChatRequest: {
          type: 'object',
          properties: {
            groupName: {
              type: 'string',
              description: 'Name of the group',
              example: 'Work Team',
              minLength: 2,
              maxLength: 50
            },
            memberMobiles: {
              type: 'array',
              items: {
                type: 'string',
                pattern: '^[0-9]{10}$'
              },
              description: 'Array of 10-digit mobile numbers of group members',
              example: ['9876543211', '9876543212'],
              minItems: 1,
              maxItems: 50
            },
            profilePic: {
              type: 'string',
              description: 'Optional group profile picture URL',
              example: 'https://example.com/group-pic.jpg'
            }
          },
          required: ['groupName', 'memberMobiles']
        },
        Message: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Message ID'
            },
            chatId: {
              type: 'string',
              description: 'Chat ID'
            },
            senderId: {
              $ref: '#/components/schemas/User',
              description: 'Message sender'
            },
            receiverId: {
              $ref: '#/components/schemas/User',
              description: 'Message receiver (for individual chats)',
              nullable: true
            },
            message: {
              type: 'string',
              description: 'Message content',
              example: 'Hello! How are you?',
              maxLength: 1000
            },
            type: {
              type: 'string',
              enum: ['text', 'image', 'file'],
              description: 'Message type',
              example: 'text'
            },
            fileUrl: {
              type: 'string',
              description: 'File URL (for image/file messages)',
              example: 'https://example.com/file.jpg',
              nullable: true
            },
            replyTo: {
              $ref: '#/components/schemas/Message',
              description: 'Replied message',
              nullable: true
            },
            seenBy: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/User'
              },
              description: 'Users who have seen this message'
            },
            editedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When message was last edited',
              nullable: true
            },
            deleted: {
              type: 'boolean',
              description: 'Whether message is deleted',
              example: false
            },
            deletedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When message was deleted',
              nullable: true
            },
            deletedBy: {
              $ref: '#/components/schemas/User',
              description: 'User who deleted the message',
              nullable: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Message creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        SendMessageRequest: {
          type: 'object',
          properties: {
            chatId: {
              type: 'string',
              description: 'Chat ID to send message to',
              example: '64f8a1b2c3d4e5f6a7b8c9d2'
            },
            message: {
              type: 'string',
              description: 'Message content',
              example: 'Hello! How are you?',
              minLength: 1,
              maxLength: 1000
            },
            type: {
              type: 'string',
              enum: ['text', 'image', 'file'],
              description: 'Message type',
              example: 'text'
            },
            fileUrl: {
              type: 'string',
              description: 'File URL (required for image/file messages)',
              example: 'https://example.com/file.jpg'
            },
            replyTo: {
              type: 'string',
              description: 'Message ID to reply to',
              example: '64f8a1b2c3d4e5f6a7b8c9d3'
            }
          },
          required: ['chatId', 'message', 'type']
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User registration and login endpoints'
      },
      {
        name: 'User',
        description: 'User profile and status management'
      },
      {
        name: 'Contacts',
        description: 'Contact management endpoints'
      },
      {
        name: 'Chats',
        description: 'Chat and conversation management endpoints'
      },
      {
        name: 'Messages',
        description: 'Message management endpoints'
      },
      {
        name: 'Health',
        description: 'API health check endpoint'
      }
    ]
  },
  apis: ['./routes/*.js', './server.js', './controllers/*.js'] // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = specs; 
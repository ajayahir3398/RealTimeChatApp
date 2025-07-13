# Chat App API

A Node.js REST API for a chat application with user authentication using MongoDB and JWT.

## Features

- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Input validation
- User status management (online/offline/away)
- Socket.IO ready for real-time features

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **Swagger/OpenAPI** - API documentation

## Project Structure

```
chatAppAPI/
├── config/
│   ├── database.js          # Database connection
│   ├── config.js            # App configuration
│   └── swagger.js           # Swagger documentation
├── models/
│   └── User.js              # User model with schema
├── controllers/
│   └── authController.js     # Authentication logic
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   └── validation.js        # Input validation rules
├── routes/
│   └── authRoutes.js        # Authentication routes
├── server.js                # Main server file
├── config.env               # Environment variables
├── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chatAppAPI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Edit `config.env` file:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/chatapp
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system or use MongoDB Atlas.

5. **Run the application**
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:3000`

## API Documentation

Once the server is running, you can access the interactive API documentation at:

**📚 Swagger UI**: http://localhost:3000/api-docs

The Swagger documentation includes:
- Interactive API testing
- Request/response schemas
- Authentication examples
- Error response documentation
- Try-it-out functionality

## API Endpoints

### Authentication

#### Register User
```
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "Ajay Bandhiya",
  "mobile": "9876543210",
  "password": "Password123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Ajay Bandhiya",
      "mobile": "9876543210",
      "profilePic": "https://via.placeholder.com/150x150?text=User",
      "status": "offline",
      "socketId": null,
      "createdAt": "2023-09-06T10:30:00.000Z",
      "updatedAt": "2023-09-06T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login User
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "mobile": "9876543210",
  "password": "Password123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Ajay Bandhiya",
      "mobile": "9876543210",
      "profilePic": "https://via.placeholder.com/150x150?text=User",
      "status": "online",
      "socketId": null,
      "createdAt": "2023-09-06T10:30:00.000Z",
      "updatedAt": "2023-09-06T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Protected Routes (Require Authentication)

#### Get User Profile
```
GET /api/auth/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Ajay Bandhiya",
      "mobile": "9876543210",
      "profilePic": "https://via.placeholder.com/150x150?text=User",
      "status": "online",
      "socketId": null,
      "createdAt": "2023-09-06T10:30:00.000Z",
      "updatedAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

#### Update User Status
```
PATCH /api/auth/status
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "away"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Status updated successfully",
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Ajay Bandhiya",
      "mobile": "9876543210",
      "profilePic": "https://via.placeholder.com/150x150?text=User",
      "status": "away",
      "socketId": null,
      "createdAt": "2023-09-06T10:30:00.000Z",
      "updatedAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

### Contact Management

#### Get All Contacts
```
GET /api/contacts
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "contacts": [
      {
        "contactId": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
          "name": "John Doe",
          "mobile": "9876543211",
          "profilePic": "https://via.placeholder.com/150x150?text=User",
          "status": "online"
        },
        "name": "Best Friend",
        "addedAt": "2023-09-06T10:30:00.000Z"
      }
    ],
    "totalContacts": 1
  }
}
```

#### Add Contact
```
POST /api/contacts
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "mobile": "9876543211",
  "name": "Work Friend"
}
```

#### Remove Contact
```
DELETE /api/contacts/{contactId}
```

**Headers:**
```
Authorization: Bearer <token>
```

#### Update Contact Name
```
PATCH /api/contacts/{contactId}/name
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "New Custom Name"
}
```

#### Search Users
```
GET /api/contacts/search?query=john
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "name": "John Doe",
        "mobile": "9876543211",
        "profilePic": "https://via.placeholder.com/150x150?text=User",
        "status": "online"
      }
    ]
  }
}
```

### Chat Management

#### Get All Chats
```
GET /api/chats
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "chats": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "isGroup": false,
        "members": [
          {
            "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
            "name": "Ajay Bandhiya",
            "mobile": "9876543210",
            "profilePic": "https://via.placeholder.com/150x150?text=User",
            "status": "online"
          },
          {
            "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
            "name": "John Doe",
            "mobile": "9876543211",
            "profilePic": "https://via.placeholder.com/150x150?text=User",
            "status": "online"
          }
        ],
        "groupName": null,
        "groupAdmin": null,
        "profilePic": null,
        "lastMessage": null,
        "createdAt": "2023-09-06T10:30:00.000Z",
        "updatedAt": "2023-09-06T10:30:00.000Z"
      }
    ],
    "totalChats": 1
  }
}
```

#### Get Specific Chat
```
GET /api/chats/{chatId}
```

**Headers:**
```
Authorization: Bearer <token>
```

#### Create Individual Chat
```
POST /api/chats/individual
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "mobile": "9876543211"
}
```

#### Create Group Chat
```
POST /api/chats/group
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "groupName": "Work Team",
  "memberMobiles": ["9876543211", "9876543212"],
  "profilePic": "https://example.com/group-pic.jpg"
}
```

#### Add Member to Group
```
POST /api/chats/{chatId}/members
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "mobile": "9876543213"
}
```

#### Remove Member from Group
```
DELETE /api/chats/{chatId}/members/{memberId}
```

**Headers:**
```
Authorization: Bearer <token>
```

#### Leave Group
```
POST /api/chats/{chatId}/leave
```

**Headers:**
```
Authorization: Bearer <token>
```

#### Update Group Info
```
PATCH /api/chats/{chatId}/info
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "groupName": "Updated Group Name",
  "profilePic": "https://example.com/new-group-pic.jpg"
}
```

### Message Management

#### Send Message
```
POST /api/messages
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "chatId": "64f8a1b2c3d4e5f6a7b8c9d2",
  "message": "Hello! How are you?",
  "type": "text"
}
```

**For Image/File Messages:**
```json
{
  "chatId": "64f8a1b2c3d4e5f6a7b8c9d2",
  "message": "Check this image",
  "type": "image",
  "fileUrl": "https://example.com/image.jpg"
}
```

**For Reply Messages:**
```json
{
  "chatId": "64f8a1b2c3d4e5f6a7b8c9d2",
  "message": "This is a reply",
  "type": "text",
  "replyTo": "64f8a1b2c3d4e5f6a7b8c9d3"
}
```

#### Get Chat Messages
```
GET /api/messages/chat/{chatId}?limit=50&skip=0
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "messages": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
        "chatId": "64f8a1b2c3d4e5f6a7b8c9d2",
        "senderId": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
          "name": "Ajay Bandhiya",
          "mobile": "9876543210",
          "profilePic": "https://via.placeholder.com/150x150?text=User",
          "status": "online"
        },
        "receiverId": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
          "name": "John Doe",
          "mobile": "9876543211",
          "profilePic": "https://via.placeholder.com/150x150?text=User",
          "status": "online"
        },
        "message": "Hello! How are you?",
        "type": "text",
        "fileUrl": null,
        "replyTo": null,
        "seenBy": [],
        "editedAt": null,
        "deleted": false,
        "deletedAt": null,
        "deletedBy": null,
        "createdAt": "2023-09-06T10:30:00.000Z",
        "updatedAt": "2023-09-06T10:30:00.000Z"
      }
    ],
    "totalMessages": 1,
    "hasMore": false
  }
}
```

#### Get Specific Message
```
GET /api/messages/{messageId}
```

**Headers:**
```
Authorization: Bearer <token>
```

#### Edit Message
```
PATCH /api/messages/{messageId}
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "message": "Updated message content"
}
```

#### Delete Message
```
DELETE /api/messages/{messageId}
```

**Headers:**
```
Authorization: Bearer <token>
```

#### Mark Message as Seen
```
POST /api/messages/{messageId}/seen
```

**Headers:**
```
Authorization: Bearer <token>
```

#### Get Unread Count
```
GET /api/messages/chat/{chatId}/unread
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "unreadCount": 5
  }
}
```

#### Search Messages
```
GET /api/messages/chat/{chatId}/search?query=hello&limit=20
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "messages": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
        "message": "Hello! How are you?",
        "senderId": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
          "name": "Ajay Bandhiya"
        },
        "createdAt": "2023-09-06T10:30:00.000Z"
      }
    ],
    "totalResults": 1
  }
}
```

### Health Check
```
GET /health
```

**Response:**
```json
{
  "status": "success",
  "message": "Chat App API is running",
  "timestamp": "2023-09-06T10:30:00.000Z"
}
```

## User Model Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | User's full name (2-50 characters) |
| `mobile` | String | Yes | 10-digit mobile number (unique) |
| `passwordHash` | String | Yes | Hashed password |
| `profilePic` | String | No | Profile picture URL (default placeholder) |
| `status` | String | No | User status: "online", "offline", "away" |
| `socketId` | String | No | Socket.IO connection ID |
| `createdAt` | Date | Auto | Account creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

## Validation Rules

### Registration
- **Name**: 2-50 characters, letters and spaces only
- **Mobile**: Exactly 10 digits
- **Password**: Minimum 6 characters, must contain uppercase, lowercase, and number

### Login
- **Mobile**: Exactly 10 digits
- **Password**: Required

### Status Update
- **Status**: Must be "online", "offline", or "away"

## Error Responses

All endpoints return consistent error responses:

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [] // For validation errors
}
```

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token authentication
- Input validation and sanitization
- CORS enabled
- Helmet.js for security headers
- Request logging with Morgan

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (to be implemented)

### Environment Variables
- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)

## Next Steps

This API is ready for:
- Socket.IO integration for real-time chat
- Message models and endpoints
- User search functionality
- File upload for profile pictures
- Password reset functionality
- Email verification

## License

ISC 
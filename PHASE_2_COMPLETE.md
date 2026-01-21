# Phase 2 Complete - Backend WebSocket Setup

## ✅ Completed Tasks

### 1. Dependencies Installed
- ✅ `socket.io@4.8.1` - WebSocket server
- ✅ `multer@1.4.5-lts.1` - File upload handling

### 2. Files Created

#### Socket.io Infrastructure
- **`Backend/src/socket/socketAuth.js`** - JWT authentication middleware for WebSocket connections
  - Validates JWT tokens from handshake (auth header, query, or headers)
  - Attaches user object to socket for authorization
  - Rejects unauthorized connections

- **`Backend/src/socket/chatSocket.js`** (345 lines) - Main WebSocket server
  - Online user tracking (Map: userId → socketId)
  - Typing status tracking (Map: conversationId → Set of userIds)
  - Real-time events implementation:
    * `message:send` - Send and broadcast messages
    * `message:receive` - Receive new messages
    * `message:read` - Mark messages as read with read receipts
    * `typing:start` - Show typing indicator
    * `typing:stop` - Hide typing indicator
    * `conversation:join` - Join conversation room
    * `conversation:leave` - Leave conversation room
    * `conversation:created` - Notify participants of new conversation
    * `user:online` - User connection notification
    * `user:offline` - User disconnection notification
  - Automatic conversation room joining on connection
  - Typing indicator auto-cleanup on disconnect
  - Error handling and logging

#### File Upload Configuration
- **`Backend/src/config/upload.js`** - Multer configuration
  - Storage: `Backend/public/uploads/chat/`
  - File naming: `{originalName}-{timestamp}-{random}.{ext}`
  - Allowed types:
    * Images: JPEG, PNG, GIF, WebP
    * Documents: PDF, Word, Excel, PowerPoint
    * Text: TXT, CSV
    * Archives: ZIP, RAR
  - Size limit: 10MB (enforced by multer)
  - Auto-creates upload directory if missing

### 3. Files Updated

#### Backend Entry Point
- **`Backend/index.js`**
  - ✅ Created HTTP server from Express app
  - ✅ Initialized Socket.io with CORS configuration
  - ✅ Attached Socket.io instance to Express app (accessible via `req.app.get("io")`)
  - ✅ Console logs WebSocket initialization on startup

#### Routes Configuration
- **`Backend/src/routes/chat.routes.js`**
  - ✅ Added multer middleware to file upload route
  - ✅ Order: `upload.single("file")` → `validateConversationAccess` → `validateFileUpload` → `uploadFile`

#### Validation Middleware
- **`Backend/src/middlewares/chatValidation.middleware.js`**
  - ✅ Updated `validateFileUpload` to work with multer
  - ✅ Removed redundant file size check (multer handles it)
  - ✅ Simplified file existence check to `req.file`

#### Controller
- **`Backend/src/controllers/chat.controller.js`**
  - ✅ Updated `uploadFile` to use `req.file` from multer
  - ✅ Changed file URL to `/uploads/chat/{filename}`
  - ✅ Added WebSocket broadcast after file upload
  - ✅ Emits `message:receive` event to conversation room

## 🚀 Features Implemented

### Real-Time Communication
1. **Message Broadcasting** - Messages sent via WebSocket are instantly delivered to all participants
2. **Read Receipts** - Track who has read messages with timestamps
3. **Typing Indicators** - Show when users are typing in a conversation
4. **Online Status** - Track and broadcast user online/offline status
5. **Conversation Rooms** - Users automatically join their conversation rooms on connection
6. **Auto-Cleanup** - Typing indicators cleared on message send or disconnect

### File Uploads
1. **Batch Chat Only** - Enforced at validation layer
2. **10MB Size Limit** - Enforced by multer
3. **Type Restrictions** - Only allowed file types accepted
4. **Secure Storage** - Files stored in `public/uploads/chat/` with unique names
5. **WebSocket Notification** - File uploads trigger real-time message events

### Security & Access Control
1. **JWT Authentication** - Required for WebSocket connections
2. **Conversation Access** - Users can only join conversations they're participants in
3. **Role-Based Rules** - Communication rules enforced at socket level
4. **Automatic Room Management** - Users join only their authorized conversations

## 📡 WebSocket Events Reference

### Client → Server Events
```javascript
// Send a message
socket.emit("message:send", {
  conversationId: "123",
  content: "Hello",
  messageType: "text" // or "file"
}, (response) => {
  // response: { success: true, message: {...} } or { error: "..." }
});

// Mark messages as read
socket.emit("message:read", {
  conversationId: "123",
  messageIds: ["msg1", "msg2"]
});

// Start typing
socket.emit("typing:start", { conversationId: "123" });

// Stop typing
socket.emit("typing:stop", { conversationId: "123" });

// Join conversation
socket.emit("conversation:join", { conversationId: "123" });

// Leave conversation
socket.emit("conversation:leave", { conversationId: "123" });

// Notify of new conversation
socket.emit("conversation:created", { conversationId: "123" });
```

### Server → Client Events
```javascript
// Receive a message
socket.on("message:receive", (message) => {
  // message: { _id, conversationId, senderId, content, ... }
});

// Someone read messages
socket.on("message:read", ({ conversationId, userId, messageIds }) => {
  // Update UI to show read receipts
});

// Someone started typing
socket.on("typing:start", ({ conversationId, userId, userName }) => {
  // Show "userName is typing..."
});

// Someone stopped typing
socket.on("typing:stop", ({ conversationId, userId }) => {
  // Hide typing indicator
});

// User came online
socket.on("user:online", ({ userId }) => {
  // Update online status
});

// User went offline
socket.on("user:offline", ({ userId }) => {
  // Update offline status
});

// New conversation created
socket.on("conversation:new", (conversation) => {
  // Add to conversation list
});
```

## 🔧 REST API Endpoints (Still Available)

All REST endpoints from Phase 1 remain functional as fallbacks:

- `GET /api/chat/conversations` - Get user's conversations
- `POST /api/chat/conversations` - Create conversation
- `GET /api/chat/conversations/:id/messages` - Get messages
- `POST /api/chat/conversations/:id/messages` - Send message (fallback)
- `POST /api/chat/conversations/:id/upload` - Upload file (with multer)
- `PATCH /api/chat/conversations/:id/read` - Mark as read (fallback)
- `GET /api/chat/contacts` - Get available contacts
- `GET /api/chat/batches` - Get batch group chats

## 📝 Technical Notes

### Connection Flow
1. Client connects with JWT token in handshake
2. `socketAuth` middleware validates token
3. User object attached to socket
4. User added to online users map
5. User auto-joins all their conversation rooms
6. `user:online` event broadcast to others

### Message Flow
1. Client emits `message:send` with conversation ID and content
2. Server validates conversation access
3. Message saved to database
4. Conversation's `lastMessage` updated
5. `message:receive` event emitted to conversation room
6. Sender's typing indicator cleared
7. Success callback sent to sender

### File Upload Flow
1. Client uploads file via REST POST `/api/chat/conversations/:id/upload`
2. Multer processes upload and saves to disk
3. Validation middleware checks conversation allows files
4. Controller creates message with file metadata
5. WebSocket event `message:receive` emitted to room
6. File URL: `/uploads/chat/{filename}` (static served by Express)

### Typing Indicator Logic
- Starts when user types (`typing:start`)
- Cleared when message sent or user leaves conversation
- Auto-cleared on disconnect
- Only notifies other participants in conversation

### Online Status
- Tracked in `onlineUsers` Map (in-memory)
- Broadcast on connection and disconnection
- Cleared on socket disconnect

## 🎯 Communication Rules Enforcement

All 5 rules enforced at multiple layers:

1. ✅ **No phone/email visible** - Sanitization ready in middleware
2. ✅ **No Coach ↔ Parent direct** - Enforced in conversation model validation
3. ✅ **Batch chats: Admin + Coach + Parents** - Enforced in model + socket validation
4. ✅ **Files only in batch chats** - Enforced in message model + multer validation
5. ✅ **1-on-1: Admin bridge only** - Enforced in conversation model validation

## 📂 Directory Structure

```
Backend/
├── index.js (✅ Updated - Socket.io integration)
├── app.js (✅ Updated - Chat routes)
├── public/
│   └── uploads/
│       └── chat/ (🆕 Auto-created for file uploads)
└── src/
    ├── config/
    │   └── upload.js (🆕 Multer configuration)
    ├── controllers/
    │   └── chat.controller.js (✅ Updated - File upload)
    ├── middlewares/
    │   └── chatValidation.middleware.js (✅ Updated)
    ├── models/
    │   ├── conversation.model.js (✅ Phase 1)
    │   └── message.model.js (✅ Phase 1)
    ├── routes/
    │   └── chat.routes.js (✅ Updated - Multer)
    └── socket/
        ├── socketAuth.js (🆕 WebSocket authentication)
        └── chatSocket.js (🆕 Main WebSocket server)
```

## ✅ Phase 2 Complete!

Backend is now ready for real-time chat with:
- ✅ WebSocket server running
- ✅ JWT authentication for sockets
- ✅ Real-time message broadcasting
- ✅ Typing indicators
- ✅ Online/offline status
- ✅ File upload handling
- ✅ Read receipts
- ✅ Automatic room management
- ✅ All communication rules enforced

**Next:** Phase 3 - Frontend WebSocket Client Integration

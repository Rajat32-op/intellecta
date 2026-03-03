# DevBuddy

A social media platform built for developers — share code snippets, connect with other devs, chat in real time, and stay updated with a personalized feed.

---

## Live Demo

| Service  | URL |
|----------|-----|
| Frontend |   https://the-intellecta.netlify.app/  |
| Backend  |   https://devbuddyserver.onrender.com  |

---

## Features

- **Authentication** — Email/password signup & login, Google OAuth
- **Developer Feed** — Algorithm-driven feed with cursor-based infinite scrolling
- **Posts** — Create posts with captions, images, code snippets (multi-language), and tags
- **Code Highlighting** — Syntax-highlighted code blocks in posts and chat
- **Likes & Comments** — Like and comment on posts
- **Save Posts** — Bookmark posts to revisit later
- **Friend System** — Send/accept/decline friend requests, remove friends
- **Friend Suggestions** — Discover new developers to connect with
- **Trending Tags** — See what topics are hot right now
- **Real-time Chat** — One-on-one messaging powered by Socket.io
- **Group Chat** — Create groups and chat with multiple friends
- **Chat Features** — Image sharing, code snippets, typing indicators, online status
- **Notifications** — Real-time in-app notifications
- **User Profiles** — View and edit profile, profile picture upload via Cloudinary
- **Search** — Search for users by name or username

---

## Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| React 19 | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Radix UI | Accessible UI primitives |
| React Router DOM | Client-side routing |
| Socket.io Client | Real-time communication |
| React Syntax Highlighter | Code block rendering |
| Lucide React | Icons |

### Backend
| Tech | Purpose |
|------|---------|
| Node.js + Express | Server framework |
| MongoDB + Mongoose | Database |
| Socket.io | Real-time WebSocket server |
| JWT | Authentication tokens |
| bcrypt | Password hashing |
| Cloudinary | Image storage |
| Multer | File upload handling |
| Google Auth Library | Google OAuth |

---

## Project Structure

```
devbuddy/
├── backend/
│   ├── server.js              # Express app, Socket.io, all routes
│   ├── controllers/
│   │   └── authenticate.js    # JWT & Google auth middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Comment.js
│   │   ├── Like.js
│   │   ├── Message.js
│   │   ├── Notification.js
│   │   ├── Group.js
│   │   └── TagStats.js
│   └── services/
│       ├── register.js
│       ├── addPost.js
│       ├── addlike.js
│       ├── handleComment.js
│       ├── handleFeed.js
│       ├── handleMessage.js
│       ├── addFriend.js
│       ├── addNotification.js
│       ├── editDatabase.js
│       └── cloudinary.js
└── frontend/
    └── src/
        ├── App.jsx
        ├── pages/
        │   ├── home.jsx
        │   ├── login.jsx
        │   ├── signup.jsx
        │   ├── AskForUsername.jsx
        │   ├── Profile.jsx
        │   ├── UpdateProfile.jsx
        │   ├── User.jsx
        │   ├── Chat.jsx
        │   ├── Notifications.jsx
        │   └── SavedPosts.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Sidebar.jsx
        │   ├── PostCard.jsx
        │   ├── CodeBlock.jsx
        │   ├── NotificationCard.jsx
        │   └── ui/
        └── providers/
            └── getUser.jsx
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB instance (local or Atlas)
- Cloudinary account
- Google OAuth credentials

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
MONG_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GOOGLE_CLIENT_ID=your_google_client_id
```

Start the server:

```bash
node server.js
```

The backend runs on `http://localhost:3000`.

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_BACKEND_URL=http://localhost:3000
```

Start the dev server:

```bash
npm run dev
```

The frontend runs on `http://localhost:5173`.

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login with email/password |
| POST | `/google-login` | Login with Google |
| POST | `/logout` | Logout |
| GET | `/me` | Get current user |
| GET | `/` | Get personalized feed |
| POST | `/add-post` | Create a post |
| POST | `/delete-post` | Delete a post |
| GET | `/get-posts` | Get posts |
| POST | `/like-post` | Like a post |
| POST | `/unlike-post` | Unlike a post |
| POST | `/add-comment` | Add a comment |
| GET | `/get-comments` | Get comments |
| POST | `/save-post` | Save a post |
| GET | `/get-saved-posts` | Get saved posts |
| POST | `/send-friend-request` | Send friend request |
| POST | `/add-friend` | Accept friend request |
| POST | `/decline-friend` | Decline friend request |
| POST | `/remove-friend` | Remove a friend |
| GET | `/get-suggestion` | Get friend suggestions |
| GET | `/search` | Search users |
| GET | `/get-user` | Get user by username |
| PATCH | `/edit-profile` | Update profile |
| GET | `/notifications` | Get notifications |
| GET | `/get-chats` | Get chat list |
| GET | `/get-messages` | Get messages in a room |
| POST | `/create-group` | Create a group chat |
| GET | `/get-group-members` | Get group members |
| GET | `/get-online-friends` | Get online friends |
| GET | `/get-trending-tags` | Get trending tags |

---

## Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `connection` | Server | User connects, marked online |
| `joinRoom` | Client → Server | Join a chat room |
| `sendMessage` | Client → Server | Send a message |
| `receiveMessage` | Server → Client | Receive a message |
| `typing` | Client → Server | User is typing |
| `userTyping` | Server → Client | Notify others of typing |
| `stopTyping` | Client → Server | User stopped typing |
| `userStoppedTyping` | Server → Client | Notify others stopped typing |
| `disconnect` | Server | User goes offline |

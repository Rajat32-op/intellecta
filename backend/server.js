const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
var cors = require('cors')
const { checkLoggedinUser, generateToken, checkPassword, checkAlreadyExists, verifyGoogleToken } = require('./controllers/authenticate')
const { registerUser } = require('./services/register')
const { createNewPost, getPosts, uploadImage, savePost, getSavedPosts, unsavePost, getTrendingTags, deletePost } = require('./services/addPost')
const { addUsername, editProfile, searchUser, getUser, uploadProfilePicture } = require('./services/editDatabase')
const { addNewFriend, sendFriendRequest, removeFriend, declineFriendRequest, getSuggestion } = require('./services/addFriend')
const { likePost, unlikePost } = require('./services/addlike')
const { addComment, getComments, deleteComment } = require('./services/handleComment')
const cookie_parser = require('cookie-parser')
const { addFriend } = require('./services/addFriend')
const { getNotifications } = require('./services/addNotification')
const Message = require('./models/Message')
const User = require('./models/User')
require('dotenv').config();

const app = express()
const port = 3000
const mongoose = require('mongoose');
const { deleteChat, getchats, uploadChatImage, createGroup, getGroupMembers } = require('./services/handleMessage')
const feedAlgo = require('./services/handleFeed')
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173","https://the-intellecta.netlify.app"],
    credentials: true
  }
})

const allowedOrigins = [
  "http://localhost:5173",
  "https://the-intellecta.netlify.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(cookie_parser())
app.use(express.json())


mongoose.connect(process.env.MONG_URL)
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.error('MongoDB connection error:', err));

let onlineUsers = new Map()
io.on('connection', socket => {
  const userId = socket.handshake.query.userId;
  onlineUsers.set(userId.toString(), true);
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
  })

  socket.on('typing', ({ roomId, userId }) => {
    socket.to(roomId).emit('userTyping', { userId });
  });

  socket.on('stopTyping', ({ roomId, userId }) => {
    socket.to(roomId).emit('userStoppedTyping', { userId });
  });

  socket.on('sendMessage', async ({ roomId, senderId, receiverId = null, message, isGroup, imageUrls,
    imageIds,
    codes,
    codeLang }) => {
    const newMsg = new Message({
      roomId,
      senderId,
      receiverId: isGroup ? null : receiverId,
      message,
      isGroup,
      imageUrls,
      imageIds,
      codeSnippet: codes,
      languages: codeLang,
      seenBy: [senderId] // sender always sees their message
    });
    await newMsg.save();

    // Broadcast to room
    io.to(roomId).emit('receiveMessage', newMsg);
  });

  socket.on("markSeen", async ({ roomId, messageIds }) => {
    try {
      await Message.updateMany(
        { _id: { $in: messageIds }, seenBy: { $ne: userId } },
        { $addToSet: { seenBy: userId } }
      );

      // Notify all users in this room
      io.to(roomId).emit("messagesSeen", {
        roomId,
        userId,
        messageIds
      });
    } catch (err) {
      console.error("Error marking seen:", err);
    }
  });

  socket.on('disconnext', () => {
    onlineUsers.delete(userId);
  })
})

app.post('/signup', checkAlreadyExists, async (req, res) => {
  await registerUser(req);
  await generateToken(req, res);
})

app.post('/google-signup', async (req, res) => {
  await verifyGoogleToken(req, res);
})

app.post('/login', checkPassword, async (req, res) => {
  await generateToken(req, res);
})

app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.clearCookie('email');
  res.status(200).json({ message: "Logged out successfully" });
})

app.patch('/addUserName-google', async (req, res) => {
  await addUsername(req, res);
  await generateToken(req, res);
})

app.patch('/edit-profile', checkLoggedinUser, uploadProfilePicture, async (req, res) => {
  await editProfile(req, res);
})


app.post('/send-friend-request', checkLoggedinUser, async (req, res) => {
  await sendFriendRequest(req, res);
})

app.post('/decline-friend', checkLoggedinUser, async (req, res) => {
  await declineFriendRequest(req, res);
})

app.post('/add-friend', checkLoggedinUser, async (req, res) => {
  await addNewFriend(req, res);
})

app.post('/remove-friend', checkLoggedinUser, async (req, res) => {
  await removeFriend(req, res);
})

app.post('/add-post', checkLoggedinUser, uploadImage, async (req, res) => {
  await createNewPost(req, res);
})

app.post('/delete-post', checkLoggedinUser, async (req, res) => {
  await deletePost(req, res);
})

app.post('/like-post', checkLoggedinUser, async (req, res) => {
  await likePost(req, res);
})

app.post('/unlike-post', checkLoggedinUser, async (req, res) => {
  await unlikePost(req, res);
})

app.get('/get-posts', checkLoggedinUser, async (req, res) => {
  await getPosts(req, res);
});

app.get('/get-saved-posts', checkLoggedinUser, async (req, res) => {
  await getSavedPosts(req, res);
})

app.post('/save-post', checkLoggedinUser, async (req, res) => {
  await savePost(req, res);
})

app.post('/unsave-post', checkLoggedinUser, async (req, res) => {
  await unsavePost(req, res);
})

app.post('/add-comment', checkLoggedinUser, async (req, res) => {
  await addComment(req, res);
})

app.get('/get-comments', checkLoggedinUser, async (req, res) => {
  await getComments(req, res);
})

app.post('/delete-comment', checkLoggedinUser, async (req, res) => {
  await deleteComment(req, res);
})

app.get('/me', checkLoggedinUser, (req, res) => {
  const user = req.user;
  res.status(200).json(user);
})

app.get('/search', checkLoggedinUser, async (req, res) => {
  await searchUser(req, res);
})

app.get('/get-user', async (req, res) => {
  await getUser(req, res);
})

app.get('/notifications', checkLoggedinUser, async (req, res) => {
  await getNotifications(req, res);
})

app.get('/get-chats', checkLoggedinUser, async (req, res) => {
  await getchats(req, res);
})

app.get('/get-messages', checkLoggedinUser, async (req, res) => {
  const messages = await Message.find({ roomId: req.query.roomId, deletedBy: { $ne: req.user._id } }).sort({ createdAt: 1 });
  res.json(messages);
})

app.post('/upload-chat-image', checkLoggedinUser, uploadChatImage, (req, res) => {
  let imageUrls = []
  let imageIds = []
  if (req.files) {
    imageUrls = req.files.map(file => file.path);
    imageIds = req.files.map(file => file.filename);
  }
  res.status(200).json({ urls: imageUrls, ids: imageIds });
})

app.post('/delete-chat', checkLoggedinUser, async (req, res) => {
  await deleteChat(req, res);
})

app.post('/create-group', checkLoggedinUser, async (req, res) => {
  await createGroup(req, res);
})

app.get('/get-group-members', checkLoggedinUser, async (req, res) => {
  await getGroupMembers(req, res);
})

app.get('/get-online-friends', checkLoggedinUser, async (req, res) => {
  const onlineFriendsId = req.user.friends.filter(f => { return onlineUsers.has(f.toString()) });
  const onlineFriends = await User.find({ _id: { $in: onlineFriendsId } })
  res.status(200).json(onlineFriends)
})

app.get('/get-suggestion', checkLoggedinUser, async (req, res) => {
  await getSuggestion(req, res);
})

app.get('/get-trending-tags', checkLoggedinUser, async (req, res) => {
  await getTrendingTags(req, res);
})

app.get('/', checkLoggedinUser, async (req, res) => {
  feedAlgo(req,res);
})

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


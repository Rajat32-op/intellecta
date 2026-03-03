const mongoose = require('mongoose')
const messageSchema = new mongoose.Schema({
  roomId: String, // either groupId or private roomId
  senderId: mongoose.Schema.Types.ObjectId,
  receiverId: mongoose.Schema.Types.ObjectId, // for private chat
  message: String,
  isGroup: {
    type: Boolean,
    default: false
  },
  imageUrls: {
    type: Array,
    default: []
  },
  imageIds: {
    type: Array,
    default: []
  },
  codeSnippet: {
    type: Array,
    default: []
  },
  languages: {
    type: Array,
    default: []
  },
  seenBy: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  }, // userIds who have seen it
  deletedBy: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  createdAt: { type: Date, default: Date.now }
});

messageSchema.index({ roomId: 1, createdAt: 1 })
messageSchema.index({ deletedBy: 1 });

module.exports = mongoose.model('Message', messageSchema);

const Post= require('../models/Post');
const Like = require('../models/Like');
const {addNotification}=require('./addNotification')
const Notification=require('../models/Notification')

async function likePost(req, res) {
  const postId = req.body.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }
    post.likes+=1;
    await post.save();

    const like = new Like({
      userId: req.user._id,
      postId: postId
    });
    await like.save();

    res.status(200).json({ message: 'Post liked successfully' });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Error liking post' });
  }
}

async function unlikePost(req, res) {
  const postId = req.body.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }
    post.likes -= 1;
    if(post.likes<0)post.likes=0;
    await post.save();

    await Like.findOneAndDelete({
      userId: req.user._id,
      postId: postId
    });
    res.status(200).json({ message: 'Post unliked successfully' });
  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).json({ message: 'Error unliking post' });
  }
}

module.exports = { likePost, unlikePost };
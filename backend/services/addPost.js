const Post = require('../models/Post');
const TagStats = require('../models/TagStats');
const User=require('../models/User')
const Like = require('../models/Like');
const { storage, cloudinary } = require('./cloudinary');
const upload = require('multer')({ storage });

async function uploadImage(req,res,next){
  upload.array('images',10)(req,res,(err)=>{
    if(err){
      return res.status(400).json(err)
    }
    next();
  });
}

async function createNewPost(req, res) {
  let imageUrls=[]
  let imageIds=[]
  if(req.files){
    imageUrls=req.files.map(file=>file.path);
    imageIds=req.files.map(file=>file.filename);
  }
  const post = {
    userId: req.user._id,
    username: req.user.username,
    profilePicture: req.user.profilePicture ? req.user.profilePicture : '',
    name: req.user.name,
    caption: req.body.caption ? req.body.caption : '',
    language: req.body.language ? req.body.language : [],
    codeSnippet: req.body.codeSnippet ? req.body.codeSnippet : [],
    tags: req.body.tags ? req.body.tags : [],
    likes: 0,
    comments: 0,
    imageUrl: imageUrls,
    imageId: imageIds,
    createdAt: new Date()
  };
  try {
    if(!Array.isArray(post.tags))post.tags=[post.tags]
    const newPost=await Post.create(post);
    await User.findByIdAndUpdate(req.user._id, {
      $push: { posts: newPost._id }
    });
    post.tags.forEach(async(tag)=>{
      await TagStats.updateOne(
        {tag:tag},
        {$inc:{count:1}},
        {upsert:true}
      )
    })
    
    res.status(200).json({ message: 'Post created successfully' });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post' });
  }
}

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.query.userId }).sort({ createdAt: -1 });
    const likedPosts=await Like.find({userId:req.user._id,postId:{$in:posts.map(post=>post._id)}}).select('postId');
    const likedPostIds = likedPosts.map(like => like.postId.toString());
    
    posts.forEach(post => {
      post.isLiked = likedPostIds.includes(post._id.toString());
    });
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
};

async function getSavedPosts(req,res){
  try{
    const posts=await Post.find({_id:{$in:req.user.savedPosts}});
    return res.status(200).json(posts);
  }
  catch(error){
    console.error('Error fetching posts:', error);
    return res.status(500).json({ message: 'Error fetching posts' });
  }
}

async function savePost(req,res){
  const postId=req.body.postId;
  if(!postId){
    return res.status(400).json({message:"Post Id needed"});
  }
  req.user.savedPosts.push(postId);
  await req.user.save();
  return res.status(200)
}

async function unsavePost(req,res){
  const postId=req.body.postId;
  try{

    if(!postId){
      return res.status(400).json({message:"Post id needed"})
    }
    req.user.savedPosts=req.user.savedPosts.filter(id=>id.toString()!==postId.toString());
    await req.user.save();
    return res.status(200);
  }
  catch(err){
    console.log(err);
  }
} 

async function deletePost(req,res){
  const {postId}=req.body;
  try{
    const post=await Post.findById(postId);
    post.tags.forEach(async(tag)=>{
      const stat=await TagStats.findOneAndUpdate(
        {tag:tag},
        {$inc:{count:-1}},
        {new:true}
      )
      if(stat && stat.count<=0){
        await TagStats.deleteOne({tag})
      }
    })
    await Post.findByIdAndDelete(postId);
    return res.status(200).json({message:'Dne'});
  }
  catch(err){
    console.log(err);
    return res.status(500).json({message:"Error occured"})
  }
}

async function getTrendingTags(req,res){
  try{
    const trendingTags=await TagStats.find().sort({count:-1}).limit(5)
    return res.status(200).json(trendingTags)
  }
  catch(err){
    console.log(err);
    return res.status(500)
  }
}

module.exports = {
  createNewPost, getPosts,uploadImage,savePost,getSavedPosts,unsavePost,getTrendingTags,deletePost
};
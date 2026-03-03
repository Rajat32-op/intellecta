const Comment=require('../models/Comment')

async function addComment(req, res) {
  const { postId, content ,username,name,profilePicture} = req.body;
  if (!postId || !content || !username || !name) {
    return res.status(400).json({ message: 'Post ID and content are required' });
  }
  try {
    const comment = new Comment({
      userId: req.user._id,
      username:username,
      name:name,
      profilePicture:profilePicture,
      content:content,
      postId:postId
    });
    await comment.save();
    res.status(200).json({ message: 'Comment added successfully' });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
}

async function getComments(req,res){
    const {postId}=req.query;
    if(!postId){
        return res.status(401);
    }
    try{
        const comments=await Comment.find({postId:postId}).sort({createdAt:-1});
        res.status(200).json(comments);
    }
    catch(err){
        console.log(err);
        return res.status(500);
    }

}

async function deleteComment(req,res){
  const {id}=req.body;
  try{
    await Comment.findByIdAndDelete(id);
    res.status(200).json({message:"deleted successfuly"})
  }
  catch(err){
    console.log(err);
    res.status(500).json({message:"error occured"})
  }
}

module.exports={
    addComment,getComments,deleteComment
}
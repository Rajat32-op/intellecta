const mongoose=require('mongoose');

const likeSchema=new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'User'
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'Post'
    }
})

likeSchema.index({ userId: 1, postId: 1 });

module.exports=mongoose.model('Like',likeSchema);
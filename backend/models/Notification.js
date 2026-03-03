const mongoose=require('mongoose');
const notificationSchema=new mongoose.Schema({
    type:{
        type:String,
        required:true
    },
    from:{
        type:String,
        required:true
    },
    fromId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    to:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    sentByAvatar:{
        type:String,
        default:''
    },
    isRead:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    deleteAt:{
        type:Date,
        default:null
    }
});

notificationSchema.index({ deleteAt: 1 }, { expireAfterSeconds: 0 });

module.exports=mongoose.model('Notification',notificationSchema);
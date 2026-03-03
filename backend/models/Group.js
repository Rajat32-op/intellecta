const mongoose=require('mongoose')

const groupSchema=new mongoose.Schema({
    name:String,
    members:{
        type:[mongoose.Schema.Types.ObjectId]
    }
})
//members 0 is admin always
module.exports=mongoose.model('Group',groupSchema)
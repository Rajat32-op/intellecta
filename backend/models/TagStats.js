const mongoose=require('mongoose')

const tagStatSchema=new mongoose.Schema({
    tag:String,
    count:{
        type:Number,
        default:0
    }
})

module.exports=mongoose.model('TagStats',tagStatSchema)
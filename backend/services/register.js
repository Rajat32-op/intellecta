const User=require('../models/User');

async function registerUser(req){
    const {name, email, username, password} = req.body;
    await User.create({name:name,username:username,email:email,password:password});
    req.user= await User.findOne({  email:email}).select("-password -__v")  ;
}

module.exports={
    registerUser
}
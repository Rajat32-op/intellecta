const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const User = require('../models/User')
const { registerUser } = require('../services/register')
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client();

async function verifyGoogleToken(req, res) {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    if (!ticket) {
        res.status(401).json({ message: "Not Authorized" })
        return;
    }

    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;

    let user = await User.findOne({ email });

    if (!user) {
        req.body={name,email,username:"",password:""};
        registerUser(req)
        user = {
            name: name,
            email: email
        }
        res.cookie("email", email, {
            httpOnly: true,
            secure: true,//set true when deploying
            sameSite: "None",
            maxAge: 24 * 60 * 60 * 1000
        })
        res.status(201).json({ message: "ask username" })
    }
    else{
        req.body.username = user.username;
        req.user=user;
        generateToken(req, res);
    }
}

async function checkAlreadyExists(req, res, next) {
    const userByMail = await User.findOne({ email: req.body.email });
    const userByUsername = await User.findOne({ username: req.body.username });
    if (userByMail) {
        res.status(401).json({ message: "Already registered email" });
    }
    else if (userByUsername) {
        res.status(401).json({ message: "Username already exists" });
    }
    else {
        next();
    }
}

async function checkPassword(req, res, next) {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
        res.status(401).json({ message: "Not a registered user" });
        return;
    }
    const passwordMatching = await bcrypt.compare(req.body.password, user.password);
    if (passwordMatching) {
        req.user = user;
        next();
    }
    else {
        res.status(400).json({ message: "Wrong password" });
    }
}

function generateToken(req, res) {
    const user = {
        email: req.user.email
    }
    const token = jwt.sign(user, process.env.AUTH_SECRET_KEY)
    res.cookie("token", token, {
        httpOnly: true,
        secure: true, //set true when deploying
        sameSite: "None",
        maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ message: "Login successful" });
}

async function checkLoggedinUser(req, res, next) {
    const cookieToken = req.cookies.token;
    if (!cookieToken) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const email = jwt.verify(cookieToken, process.env.AUTH_SECRET_KEY).email;
        req.user = await User.findOne( { email: email }).select('-password -__v');
        if (!req.user) {
            res.status(401).json({ message: "Not a user" });
            return;
        }
        
        next();
    }
    catch (err) {
        res.status(401).json({ message: "Not a user" });
        return;
    }
}
module.exports = {
    checkLoggedinUser, generateToken, checkPassword, checkAlreadyExists, verifyGoogleToken
}
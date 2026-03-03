const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { storage, cloudinary } = require('./cloudinary');
const multer = require('multer');

const upload = multer({ storage });

async function addUsername(req, res) {
    let email = req.cookies.email;
    try {
        const user = await User.findOne({ email: email });
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.username) return res.status(200).json({ message: "Username already exists" });
        if (!req.body.username || req.body.username.trim() === "") return res.status(400).json({ message: "Username is required" });
        const existingUser = await User.findOne({ username: req.body.username });
        if (existingUser) return res.status(400).json({ message: "Username already exists" });
        user.username = req.body.username;
        await user.save();
        req.user = user;

    }
    catch (err) {
        return res.status(400).json({ message: "error" })
    }
}

const uploadProfilePicture = async (req, res, next) => {
    if (req.user.profilePictureId) {
        try {
            await cloudinary.uploader.destroy(req.user.profilePictureId);
        } catch (error) {
            return res.status(500).json({ message: "Error deleting old profile picture" });
        }
    }
    upload.single('profilePicture')(req, res, (error) => {
        if (error) {
            return res.status(400).json({ message: "File upload error" });
        }
        next();
    });
}

async function editProfile(req, res) {
    const id = req.user._id;
    const updatedData = {};
    if (req.body.name) updatedData.name = req.body.name;
    if (req.body.bio) updatedData.bio = req.body.bio;
    if (req.body.username) updatedData.username = req.body.username;
    if (req.file && req.file.path) {
        updatedData.profilePicture = req.file.path;
        updatedData.profilePictureId = req.file.filename
    }
    await User.updateOne({ _id: id }, { $set: updatedData });
    res.status(200).json({ message: "Profile updated successfully" });//may have to send updated user.

}

async function searchUser(req, res) {
    const query = req.query.q;
    if (!query || query.trim() === "") return res.status(400).json({ message: "Query parameter is required" });

    try {
        const reg = new RegExp(query, 'i'); // Case-insensitive search
        const friendIds=req.user.friends;
        const users = await User.aggregate([
            {
                $match: {
                    $or: [
                        { username: reg },
                        { name: reg }
                    ]
                }
            },
            {
                $addFields: {
                    isFriend: { $cond: [{ $in: ["$_id", friendIds] }, 1, 0] }
                }
            },
            {
                $sort: { isFriend: -1 } // friends first
            },
            {
                $project: {
                    name: 1,
                    username: 1,
                    profilePicture: 1,
                    _id: 1
                }
            }
        ]);
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
}

async function getUser(req, res) {
    const userId = req.query.id;
    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }

    try {
        const user = await User.findById(userId).select('-password -v -notifications');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (err) {
        console.error("internal server error");
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    addUsername,
    editProfile,
    searchUser,
    getUser,
    uploadProfilePicture
}
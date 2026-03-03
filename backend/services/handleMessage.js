const Message = require('../models/Message');
const User = require('../models/User')
const Group = require('../models/Group')
const { storage, cloudinary } = require('./cloudinary')
const upload = require('multer')({ storage });

const uploadChatImage = async (req, res, next) => {
    upload.array('images', 10)(req, res, (err) => {
        if (err) {
            return res.status(400).json(err)
        }
        next();
    });
}

async function getchats(req, res) {
    try {
        // --- 1. PRIVATE CHATS ---
        const recentPrivateChats = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: req.user._id },
                        { receiverId: req.user._id }
                    ],
                    deletedBy: { $ne: req.user._id },
                    isGroup: { $ne: true } // exclude group messages
                }
            },
            {
                $project: {
                    senderId: 1,
                    receiverId: 1,
                    createdAt: 1
                }
            },
            {
                $addFields: {
                    otherUser: {
                        $cond: [
                            { $eq: ["$senderId", req.user._id] },
                            "$receiverId",
                            "$senderId"
                        ]
                    }
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$otherUser",
                    lastMessageTime: { $first: "$createdAt" }
                }
            }
        ]);

        const users = await User.find({
            _id: { $in: recentPrivateChats.map(c => c._id) }
        }).select("_id name username profilePicture");

        const privateChats = recentPrivateChats.map(c => {
            const user = users.find(u => u._id.toString() === c._id.toString());
            return {
                type: "private",
                _id: [c._id.toString(),req.user._id.toString()].sort().join("-"),
                name: user?.name,
                username: user?.username,
                receiverId:user?._id,
                profilePicture: user?.profilePicture,
                lastMessageTime: c.lastMessageTime,
                isGroup:false
            };
        });

        // --- 2. GROUP CHATS ---
        const myGroups = await Group.find({ members: req.user._id })
            .select("_id name members");

        const groupIds = myGroups.map(g => g._id.toString());

        const recentGroupMessages = await Message.aggregate([
            {
                $match: {
                    roomId: { $in: groupIds },
                    deletedBy: { $ne: req.user._id }
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$roomId",
                    lastMessageTime: { $first: "$createdAt" }
                }
            }
        ]);

        const groupChats = recentGroupMessages.map(gm => {
            const group = myGroups.find(gr => gr._id.toString() === gm._id);
            return {
                type: "group",
                _id: group._id,
                name: group?.name,
                members: group?.members,
                lastMessageTime: gm.lastMessageTime,
                isGroup:true
            };
        });

        // --- 3. MERGE & SORT ---
        const allChats = [...privateChats, ...groupChats].sort(
            (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
        );
        return res.status(200).json(allChats);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch chats" });
    }
}


async function deleteChat(req, res) {
    const { roomId ,isGroup} = req.body;

    try {
        // Step 1: Mark messages as deleted by current user
        await Message.updateMany(
            { roomId: roomId },
            { $addToSet: { deletedBy: req.user._id } }
        );

        // Step 2: Find messages to permanently delete (deletedBy size = 2)
        let grpSize=2;
        if(isGroup){
            const group=await Group.findById(roomId);
            grpSize=group.members.length;
        }
        const toDelete = await Message.find({
            roomId: roomId,
            $expr: { $eq: [{ $size: "$deletedBy" }, grpSize] }
        });

        if (toDelete.length > 0) {
            // Step 3: Collect all Cloudinary IDs
            const allImageIds = toDelete
                .flatMap(msg => msg.imageIds || []);

            // Step 4: Delete images from Cloudinary
            for (const id of allImageIds) {
                try {
                    await cloudinary.uploader.destroy(id);
                } catch (err) {
                    console.error(`Failed to delete Cloudinary image: ${id}`, err);
                }
            }

            // Step 5: Delete messages from DB
            await Message.deleteMany({ _id: { $in: toDelete.map(m => m._id) } });
            if(isGroup){
                await Group.deleteOne({_id:roomId})
            }
        }

        return res.status(200).json({ message: "successful" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "error" });
    }
}

async function createGroup(req, res) {
    let{ members, name } = req.body;
    members.push(req.user._id.toString());
    try {

        const newGroup = new Group({
            name: name,
            members: members
        })
        await newGroup.save();
        return res.status(200).json({ group: newGroup });
    }
    catch (err) {
        return res.status(500).json({ message: "Error" })
    }
}

async function getGroupMembers(req, res) {
    try {
        const roomId=req.query.id;
        const group=await Group.findById(roomId).select('members');
        if(!group){
            return res.status(404).json({message:"Group not found"})
        }
        const members=await User.find({_id:{$in:group.members}})
        return res.status(200).json(members)
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "error occured" });
    }
}

module.exports = {
    deleteChat, getchats, uploadChatImage, getGroupMembers, createGroup
}
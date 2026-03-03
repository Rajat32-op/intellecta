const User = require('../models/User');
const Notification = require('../models/Notification');
const { rawListeners } = require('../models/Comment');

async function sendFriendRequest(req, res) {
    const friendId = req.body.id;
    try {
        const user = req.user;
        const friend = await User.findById(friendId);

        if (!friend) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.friends.includes(friend._id)) {
            return res.status(400).json({ message: 'You are already friends with this user' });
        }

        const newRequest = { type: 'friend_request', from: user.username, fromId: user._id, to: friendId, createdAt: new Date() }
        friend.friend_request_received.push(user._id);
        user.friend_request_sent.push(friend._id);

        await Notification.create(newRequest);
        await user.save();
        await friend.save();

        res.status(200).json({ message: 'Friend request sent successfully' });
    } catch (error) {
        console.error('Error sending friend request:', error);
        res.status(500).json({ message: 'Error sending friend request' });
    }
}

async function addNewFriend(req, res) {
    const friendId = req.body.friendId;

    try {
        const user = req.user;
        const friend = await User.findById(friendId);

        if (!friend) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.friends.push(friend._id);
        user.friend_request_received = user.friend_request_received.filter(id => id.toString() !== friend._id.toString());
        friend.friend_request_sent = user.friend_request_sent.filter(id => id.toString() !== friend._id.toString());
        friend.friends.push(user._id);

        await Notification.findOneAndUpdate(
            { type: 'friend_request', fromId: friend._id, to: user._id },
            { $set: { isRead: true, deleteAt: new Date(Date.now()) } },
            { new: true }
        );
        await user.save();
        await friend.save();

        res.status(200).json({ message: 'Friend added successfully' });
    } catch (error) {
        console.error('Error adding friend:', error);
        res.status(500).json({ message: 'Error adding friend' });
    }
}

async function removeFriend(req, res) {
    const friendId = req.body.friendId;
    try {
        const user = req.user;
        const friend = await User.findById(friendId);

        if (!friend) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.friends = user.friends.filter(id => id.toString() !== friend._id.toString());
        friend.friends = friend.friends.filter(id => id.toString() !== user._id.toString());

        await user.save();
        await friend.save();

        res.status(200).json({ message: 'Friend removed successfully' });
    } catch (error) {
        console.error('Error removing friend:', error);
        res.status(500).json({ message: 'Error removing friend' });
    }
}

async function declineFriendRequest(req, res) {
    const friendId = req.body.friendId;
    try {
        const user = req.user;
        const friend = await User.findById(friendId);

        if (!friend) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.friend_request_received = user.friend_request_received.filter(id => id.toString() !== friend._id.toString());
        friend.friend_request_sent = friend.friend_request_sent.filter(id => id.toString() !== user._id.toString());

        await Notification.findOneAndUpdate(
            { type: 'friend_request', fromId: friend._id, to: user._id },
            { $set: { isRead: true, deleteAt: new Date(Date.now()) } },
            { new: true }
        );
        await user.save();
        await friend.save();

        res.status(200).json({ message: 'Friend request declined successfully' });
    } catch (error) {
        console.error('Error declining friend request:', error);
        res.status(500).json({ message: 'Error declining friend request' });
    }
}

async function getSuggestion(req,res){
    const alreadyDone=req.user.friends;
    alreadyDone.push(req.user._id);
    try{

        const suggestedUsers=await User.aggregate([
            {$match:{_id:{$nin:alreadyDone}}},
            {$sample:{size:5}},
            {$project:{username:1,name:1,_id:1,profilePicture:1}}
        ])
        res.status(200).json(suggestedUsers);
    }
    catch(err){
        console.log(err);
        res.status(500)
    }

}

module.exports = {
    addNewFriend, sendFriendRequest, removeFriend, declineFriendRequest,getSuggestion
};
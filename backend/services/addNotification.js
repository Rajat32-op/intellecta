const Notification=require('../models/Notification');

async function getNotifications(req, res) {
    try {
        const user = req.user;
        const notifications = await Notification.find({ to: user._id }).sort({ createdAt: -1 });
        
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
}

module.exports = {
    getNotifications
};
import { Heart, UserPlus, Clock, Trash } from "lucide-react";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function NotificationCard({
  notification,
  onMarkAsRead,
  acceptFriend,
  declineFriend
}) {

  const handleCardClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification._id);
    }
  };

  function timeAgo(date) {
    const now = Date.now();
    const postTime = new Date(date).getTime(); // supports both Date and ISO string
    const diff = now - postTime;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (seconds < 60) return `${seconds} seconds ago`;
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;

    return new Date(date).toLocaleDateString(); // fallback: show actual date
  }

  const renderNotificationContent = () => {
    switch (notification.type) {
      case "like":
        return (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-900/20 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-400" fill="currentColor" />
            </div>
            <div className="flex space-x-4 min-w-0">
              <p className="text-sm">
                <span className="font-semibold text-white">
                  {notification.sentBy}
                </span>
                <span className="text-gray-400"> liked your post</span>

              </p>
              <button>
                <Trash className="w-4 h-4 text-gray-400 hover:text-red-500" />
              </button>
            </div>
          </div>
        );

      case "friend_request":
        return (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-900/20 rounded-full flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-semibold text-white">
                  {notification.from}
                </span>
                <span className="text-gray-400"> sent you a friend request</span>
              </p>
              <div className="flex space-x-2 mt-3">
                <button
                  className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    acceptFriend(notification.fromId,notification._id);
                  }}
                >
                  Accept
                </button>
                <button
                  className="text-sm px-3 py-1 border border-gray-500 text-gray-300 rounded hover:bg-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    declineFriend(notification.fromId,notification._id);
                  }}
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card
      className={`p-4 cursor-pointer dark:bg-none transition-all duration-200 border rounded-md ${!notification.isRead
          ? 'dark:bg-gray-800 border-l-4 border-blue-500'
          : 'dark:bg-gray-900 border-gray-700'
        } hover:dark:bg-gray-800`}
      onClick={handleCardClick}
    >
      <div className="flex items-center space-x-3">
        <Avatar className="w-12 h-12 flex-shrink-0">
          <AvatarImage
            src={notification.sentByAvatar || ""}
            alt={notification.from}
          />
          <AvatarFallback>
            {notification.from.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {renderNotificationContent()}

          <div className="flex items-center mt-2 text-xs text-gray-300">
            <Clock className="w-3 h-3 mr-1" />
            {timeAgo(notification.createdAt)}
          </div>
        </div>

        {!notification.isRead && (
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
        )}
      </div>
    </Card>
  );
}

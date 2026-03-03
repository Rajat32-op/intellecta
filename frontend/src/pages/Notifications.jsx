import { useEffect, useState } from "react";
import { Bell, Check, Settings } from "lucide-react";
import { NotificationCard } from "../components/NotificationCard";
import Navbar from "../components/Navbar";
import { useUser } from "../providers/getUser";

const avatar1 = "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face";
const avatar2 = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face";
const avatar3 = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face";
const avatar4 = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face";

export default function Notifications() {
  const { user, loading } = useUser();
  if (loading) {
    return (
      <div className="flex justify-center h-full gap-2 min-h-[200px ]">
        <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></span>
        <span className="text-lg text-black">Loading  ...</span>
      </div>
    );
  }
  const [notifications, setNotifications] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;


  useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await fetch(`${backendUrl}/notifications`, {
          method: "GET",
          credentials: "include"
        });
        if (response.status === 200) {
          const data = await response.json();
          setNotifications(data);
        } else {
          console.error("Failed to fetch notifications");
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    }
    fetchNotifications();
  }, [])

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification._id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const acceptFriend = async (friendId, notifId) => {
    const response = await fetch(`${backendUrl}/add-friend`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendId: friendId })
    });
    if (response.status === 200) {
      setNotifications(notifications.filter(n => n._id !== notifId));
    }
  }

  const declineFriend = async (friendId, notifId) => {
    const response = await fetch(`${backendUrl}/decline-friend`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendId: friendId })
    });
    if (response.status === 200) {
      setNotifications(notifications.filter(n => n._id !== notifId));
    }
  }

  return (

    <div className="min-h-screen w-full overflow-x-hidden bg-black text-white">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6 ">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-400">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm px-3 py-1.5 border border-white rounded-md flex items-center space-x-1 hover:bg-white hover:text-black transition"
              >
                <Check className="w-4 h-4" />
                <span>Mark all read</span>
              </button>
            )}

          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No notifications yet</h3>
              <p className="text-gray-500">
                When you get notifications, they'll show up here.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationCard
                key={notification._id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                acceptFriend={acceptFriend}
                declineFriend={declineFriend}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              You're all caught up! 🎉
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

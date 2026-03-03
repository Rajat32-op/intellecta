import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar'
import { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { User } from 'lucide-react';
import { useUser } from '../providers/getUser.jsx';
import PostCard from '../components/PostCard';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const UserPage = () => {
    const query = useQuery();
    const userId = query.get('id');
    const navigate = useNavigate();
    if (userId === null || userId === undefined) {
        navigate('/')
    }
    const [profile, setProfile] = useState({});
    const [loading, setLoading] = useState(true);

    const [userPosts, setUserPosts] = useState([]);

    const [friendStatus, setFriendStatus] = useState("dont know");
    const { user, setUser } = useUser();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true)
            const response = await fetch(`${backendUrl}/get-user?id=${userId}`, {
                credentials: 'include'
            });
            if (response.status === 200) {
                const data = await response.json();
                setProfile(data);
                if (data.friends.includes(user._id)) {
                    setFriendStatus("friends");
                } else if (data.friend_request_sent.includes(user._id)) {
                    setFriendStatus("request-received");
                }
                else if (data.friend_request_received.includes(user._id)) {
                    setFriendStatus("request-sent");
                }
                else {
                    setFriendStatus("not-friend");
                }
                if (user._id === data._id) {
                    navigate('/profile');
                }
                setLoading(false);
            } else {
                console.error("Failed to fetch user data");
            }
        };
        fetchUser();
    }, [userId]);

    useEffect(() => {

        if (friendStatus == "friends") {

            const fetchPosts = async () => {
                const response = await fetch(`${backendUrl}/get-posts?userId=${profile._id}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (response.status === 200) {
                    const data = await response.json();
                    setUserPosts(data);
                }
            }
            fetchPosts();
        }
    }, [profile]);

    /*
    These functions take id of friend you searched and in his request recieved they add your id
    in your request sent they add his id
    */

    const sendFriendRequest = async () => {
        const response = await fetch(`${backendUrl}/send-friend-request`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: profile._id })
        });
        if (response.status === 200) {
            setFriendStatus("request-sent");
            setProfile(prev => ({ ...prev, friend_request_received: [...prev.friend_request_sent, user._id] }));
            setUser(prev => ({ ...prev, friend_request_sent: [...prev.friend_request_sent, profile._id] }));
        } else {
            console.error("Failed to send friend request");
        }
    }


    const acceptFriend = async (friendId) => {
        const response = await fetch(`${backendUrl}/add-friend`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ friendId: friendId })
        });
        if (response.status === 200) {
            setFriendStatus("friends");
            setProfile(prev => ({
                ...prev,
                friends: [...prev.friends, friendId],
                friend_request_received: prev.friend_request_received.filter(id => id !== friendId)
            }));
            setUser(prev => ({
                ...prev,
                friends: [...prev.friends, friendId],
                friend_request_sent: prev.friend_request_sent.filter(id => id !== friendId)
            }));
        } else {
            console.error("Failed to accept friend request");
        }
    }

    const removeFriend = async (friendId) => {
        const response = await fetch(`${backendUrl}/remove-friend`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ friendId: friendId })
        });
        if (response.status === 200) {
            setFriendStatus("not-friend");
            setProfile(prev => ({
                ...prev,
                friends: prev.friends.filter(id => id !== friendId)
            }));
            setUser(prev => ({
                ...prev,
                friends: prev.friends.filter(id => id !== friendId)
            }));
        } else {
            console.error("Failed to remove friend");
        }
    }

    const declineFriend = async (friendId) => {
        const response = await fetch(`${backendUrl}/decline-friend`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ friendId: friendId })
        });
        if (response.status === 200) {
            setFriendStatus("not-friend");
            setProfile(prev => ({
                ...prev,
                friend_request_sent: prev.friend_request_sent.filter(id => id !== friendId)
            }));
            setUser(prev => ({
                ...prev,
                friend_request_received: prev.friend_request_received.filter(id => id !== friendId)
            }));
        } else {
            console.error("Failed to decline friend request");
        }
    }

    if (loading) {
        return <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500">
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    }
    return (
        <div className='min-h-screen bg-background text-foreground dark:bg-black dark:text-white'>
            <Navbar />
            <div className="container mx-auto px-4 py-6">
                <div className="max-w-4xl mx-auto">
                    {/* Profile Header */}
                    <Card className="mb-6 dark:bg-gradient-to-br from-[#1a3760] via-[#4b5f7e] to-[#c9d1db]">
                        <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                                {/* Profile Picture */}
                                <Avatar className="h-32 w-32 md:h-40 md:w-40">
                                    {/* <AvatarImage src={'/placeholder.svg'} /> */}
                                    <AvatarFallback className="text-2xl">
                                        {profile.profilePicture !== "" ? (
                                            <img src={profile.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                                        ) : (
                                            <User className="h-16 w-16 md:h-20 md:w-20" />
                                        )}
                                    </AvatarFallback>
                                </Avatar>

                                {/* Profile Info */}
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                                        <h1 className="text-2xl font-bold">{profile.name}</h1>
                                    </div>

                                    <p className="text-muted-foreground mb-2">@{profile.username}</p>
                                    <p className="mb-4 max-w-md">{profile.bio}</p>

                                    {/* Stats */}
                                    <div className="flex justify-center md:justify-start gap-6 mb-4">
                                        <div className="text-center">
                                            <p className="font-bold text-lg">{profile.posts.length}</p>
                                            <p className="text-sm text-muted-foreground">Posts</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-lg">{profile.friends.length}</p>
                                            <p className="text-sm text-muted-foreground">Friends</p>
                                        </div>

                                    </div>

                                    <p className="text-sm text-muted-foreground">{new Date(profile.createdAt).toLocaleDateString()}</p>
                                    {friendStatus === "friends" ? (
                                        <button onClick={() => { removeFriend(profile._id) }} className="px-3 py-1 border rounded text-sm mt-4 bg-red-500 hover:bg-red-400 text-white">
                                            Remove Friend
                                        </button>
                                    ) : friendStatus === "request-sent" ? (
                                        <button className="px-3 py-1 border rounded text-sm mt-4 bg-gray-500 cursor-not-allowed text-white">
                                            Request Sent
                                        </button>
                                    ) : friendStatus === "request-received" ? (
                                        <div className='flex gap-2'>
                                            <button onClick={() => acceptFriend(profile._id)} className="px-3 py-1 border rounded text-sm mt-4 bg-green-500 hover:bg-green-400 text-white">
                                                Accept Request
                                            </button>
                                            <button onClick={() => declineFriend(profile._id)} className="px-3 py-1 border rounded text-sm mt-4 bg-red-700 hover:bg-red-600 text-white">
                                                Decline Request
                                            </button>
                                        </div>
                                    ) : friendStatus === "not-friend" ? (
                                        <button onClick={sendFriendRequest} className="px-3 py-1 border rounded text-sm mt-4 bg-blue-500 hover:bg-blue-400 text-white">
                                            Add Friend
                                        </button>
                                    ) : null}

                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        {userPosts.map((post) => (
                            <PostCard key={post._id} post={post} />
                        ))}
                    </div>

                </div>
            </div>
        </div>
    )
}

export default UserPage
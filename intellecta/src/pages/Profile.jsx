import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";
import { useNavigate } from "react-router-dom";
import { useUser } from "../providers/getUser.jsx";

const Profile = () => {
  const navigate = useNavigate();

  const { user, setUser, loading } = useUser();
  const [userPosts, setUserPosts] = useState([]);
  const [wait, setWait] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await fetch(`${backendUrl}/get-posts?userId=${user._id}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setUserPosts(data);
    }
    if (!loading && user) fetchPosts();
  }, [user, loading])

  useEffect(() => {
    if (!loading && user === null) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      const response = await fetch(`${backendUrl}/logout`, {
        method: "POST",
        credentials: "include"
      });
      if (response.status === 200) {
        setUser(null);
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleDeletePost = async (postId) => {
    setWait(true)
    setUserPosts(prev => prev.filter(post => post._id !== postId))
    const response = await fetch(`${backendUrl}/delete-post`, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: postId })
    });
    setWait(false);
  }

  if (loading) {
    // Still loading
    return (
      <div className="min-h-screen bg-background text-foreground dark:bg-black dark:text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto text-center text-lg">Loading...</div>
        </div>
      </div>
    );
  }
  return (

    <div className="min-h-screen bg-background text-foreground dark:bg-black dark:text-white">

      <Navbar />
      {wait && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-6 dark:bg-gradient-to-br from-[#1a3760] via-[#4b5f7e] to-[#c9d1db]">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Profile Picture */}
                <Avatar className="h-32 w-32 md:h-40 md:w-40">
                  <AvatarImage src={'/placeholder.svg'} />
                  <AvatarFallback className="text-2xl">
                    {user.profilePicture !== "" ? (
                      <img src={user.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-16 w-16" />
                    )}
                  </AvatarFallback>
                </Avatar>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => { navigate('/update-profile') }} className="px-3 py-1 border rounded text-sm">
                        Edit Profile
                      </button>
                      <button className="px-3 py-1 border rounded text-sm">
                        Settings
                      </button>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-2">@{user.username}</p>
                  <p className="mb-4 max-w-md">{user.bio}</p>

                  {/* Stats */}
                  <div className="flex justify-center md:justify-start gap-6 mb-4">
                    <div className="text-center">
                      <p className="font-bold text-lg">{userPosts.length}</p>
                      <p className="text-sm text-muted-foreground">Posts</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg">{user.friends.length}</p>
                      <p className="text-sm text-muted-foreground">Friends</p>
                    </div>

                  </div>

                  <p className="text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</p>
                  <button onClick={handleLogout} className="px-3 my-1 py-1 border rounded text-sm bg-red-600 hover:bg-red-500 font-bold">Logout</button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Posts</h2>
            </div>

            {/* User Posts */}
            <div className="space-y-6">
              {userPosts.map((post) => (
                <PostCard key={post._id} post={post} canDelete={true} onDelete={(id) => { handleDeletePost(id) }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

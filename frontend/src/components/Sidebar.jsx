import { Bookmark, Heart, MessageCircle, User, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent, CardHeader } from "./ui/card";
import { useNavigate } from "react-router-dom";
import { div } from "framer-motion/client";
import { useUser } from "../providers/getUser.jsx"; // Assuming this is the correct path to your user provider
import { useEffect, useState } from "react";

const Sidebar = () => {
  const navigate = useNavigate();
  const {user,loading} = useUser(); 
  const backendUrl=import.meta.env.VITE_BACKEND_URL;

  const [activeFriends,setActivefriends]=useState([]);
  useEffect(()=>{
    const fetchOnlineFriends=async()=>{
      const response=await fetch(`${backendUrl}/get-online-friends`,{
        credentials:'include'
      })
      if(response.ok){
        const data=await response.json();
        setActivefriends(data);
      }
    }
    fetchOnlineFriends();
  },[])

  if(loading){
    return(
      <div className="flex justify-center h-full gap-2 min-h-[200px]">
        <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></span>
        <span className="text-lg text-black">Loading...</span>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* User Profile */}
      <Card>
        <CardContent className="pt-6">
          
            
            <div className="flex items-center w-full justify-center">
              {user===null?(
                <button onClick={()=>{navigate('/login')}} className="bg-blue-600 text-xl w-[75%] text-white">Log In</button>
              ):(
                <button onClick={()=>{navigate('/profile')}} className="flex w-full items-center justify-start   space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
                <div  className="flex flex-col items-center justify-center">
                <h3 className="text-2xl">{user.name}</h3>
                <p>{"@"+user.username}</p>
                </div>
              </button>
              )}
              </div>
        </CardContent>
      </Card>

      {/* Navigation Menu */}
      <Card className="">
        <CardHeader>
          <h3 className="font-semibold">Menu</h3>
        </CardHeader>
        <CardContent>
          <nav className="space-y-2 text-md">
            <button onClick={()=>{navigate('/profile')}}  className="w-full flex items-center gap-2">
              <User className="mr-2 h-5 w-5" />
              Profile
            </button>
            <button onClick={()=>{navigate('/chat')}} className="w-full flex items-center gap-2">
              <MessageCircle className="mr-2 h-5 w-5" />
              Messages
            </button>
            <button onClick={()=>{navigate('/notifications')}} className="w-full flex items-center gap-2">
              <Heart className="mr-2 h-5 w-5" />
              Notifications
            </button>
            <button onClick={()=>{navigate('/savedPosts')}} className="w-full flex items-center gap-2">
              <Bookmark className="mr-2 h-5 w-5" />
              Saved Posts
            </button>
          </nav>
        </CardContent>
      </Card>

      {/* Active Friends */}
      {activeFriends.length===0?(
        <div className="bg-gradient-to-t from-cyan-500 to-black border bg-white text-black shadow-sm dark:text-white dark:border-zinc-700 py-5 flex justify-center">
          <h3>No Active Friends Found</h3>
        </div>
        
      ):(
        <Card>
        <CardHeader>
        <h3 className="font-semibold">Active Friends</h3>
        </CardHeader>
        <CardContent>
        <div className="space-y-3">
        {activeFriends.map((friend) => (
              <div key={friend.name} className="flex items-center space-x-2">
              <div className="relative">
              <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
              {friend.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
              </Avatar>
              <div
              className={`
                absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background bg-green-500`}
                />
                </div>
                <div>
                <p className="text-sm font-medium">{friend.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                {friend.status}
                </p>
                </div>
                </div>
              ))}
              </div>
              </CardContent>
              </Card>
            )}
    </div>
  );
};

export default Sidebar;

import { Heart, MessageCircle, User, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { debounce, filter, set } from "lodash";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Command, CommandInput, CommandList, CommandItem, CommandGroup, CommandEmpty } from "./ui/command";



const Navbar = () => {
  const navigate = useNavigate()
  const backendUrl=import.meta.env.VITE_BACKEND_URL;

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  const handleSearch = useCallback(debounce(async (searchName) => {
    setSearchOpen(true);
    const response = await fetch(`${backendUrl}/search?q=${searchName}`, {
      credentials: 'include'
    });
    if (response.status === 200) {
      const data = await response.json();
      setFilteredUsers(data);
    }
  }, 1000), []);

  const navigateToUser = async (user) => {
    setSearchOpen(false);
    setSearchQuery("");
    setFilteredUsers([]);

    navigate(`/user?id=${user._id}`);


  }

  useEffect(() => {
    if (searchQuery) {
      handleSearch(searchQuery);
    }
    else {
      setSearchOpen(false);
    }
  }, [searchQuery]);

  return (
    <>
      <nav className="border-b bg-zinc-900 text-white sticky z-20 backdrop-blur">
        <div className="mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Sidebar Button & Logo */}
            <div className="flex items-center space-x-4">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="lg:hidden p-2 rounded hover:bg-zinc-800">
                    <Users className="h-5 w-5 text-white" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-zinc-900 text-white w-72">
                  <Sidebar />
                </SheetContent>
              </Sheet>

              <button onClick={() => { navigate('/') }} className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Intellecta
              </button>
            </div>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <input
                type="text"
                placeholder="Search developers"
                className="w-full px-4 py-2 border border-zinc-700 rounded-full bg-zinc-800 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
              />
            </div>

            {/* Icons */}
            <div className="flex items-center space-x-4">
              <button onClick={() => { navigate('/notifications') }} className="relative p-2 rounded hover:bg-zinc-800">
                <Heart className="h-6 w-6 text-white" />
              </button>

              <button onClick={() => { navigate('/chat') }} className="relative p-2 rounded hover:bg-zinc-800">
                <MessageCircle className="h-6 w-6 text-white" />
              </button>

              <Avatar onClick={() => { navigate('/profile') }} className="h-8 w-8 cursor-pointer">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>
                  <button >
                    <User className="h-4 w-4 text-white" />
                  </button>
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </nav>
      <Dialog open={searchOpen} onOpenChange={(open) => {
        setSearchOpen(open);
        if (!open) {
          setSearchQuery("");
          setFilteredUsers([]);
        }
      }}>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Search Results</DialogTitle>
            <DialogDescription>
              Showing results for &quot;{searchQuery}&quot;.
            </DialogDescription>
          </DialogHeader>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <button onClick={()=>{navigateToUser(user)}} className="flex items-center space-x-4 p-2 bg-zinc-900 hover:bg-zinc-800 cursor-pointer" key={user._id}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profilePicture || ""} />
                  <AvatarFallback>
                    <User className="h-4 w-4 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div>{user.name}</div>
                <div className="text-zinc-400">{user.username}</div>
              </button>
            ))
          ) : (
            <div className="bg-gray-500 text-white">No results found.</div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;

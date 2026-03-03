import { useState, useEffect, useCallback, useRef } from "react";
import {
  MessageCircle,
  Trash2,
  Plus,
  ArrowLeft,
  Send,
  MoreVertical,
  Image,
  Code,
  X,
  Loader2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../components/ui/command";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '../components/ui/dropdown.jsx'
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useUser } from "../providers/getUser.jsx";
import Particles from "../components/particle-bg.jsx";
import { debounce, method } from "lodash";
import CodeBlock from '../components/CodeBlock.jsx'

const Chat = () => {

  const { user, loading, socket } = useUser();

  const backendUrl=import.meta.env.VITE_BACKEND_URL;

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

  if (loading) {
    return (
      <div className="flex justify-center h-full gap-2 min-h-[200px]">
        <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></span>
        <span className="text-lg text-black">Loading...</span>
      </div>
    );
  }
  const navigate = useNavigate();
  const languages = [
    "JavaScript", "Python", "Cpp", "Java", "C", "Go", "TypeScript", "Ruby", "PHP",
    "React", "swift", "Kotlin", "Rust", "Dart", "Scala", "Perl", "Haskell",
    "Lua", "Shell", "HTML", "CSS", "SQL", "R"
  ];
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [groupSearchOepn, setGroupSearchOpen] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [showChatList, setShowChatList] = useState(true);
  const [chats, setChats] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageLoading, setMessageLoading] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([])
  const [filteredUsersForGroup, setFilteredUsersForGroup] = useState([])
  const [images, setImages] = useState([])
  const [codes, setCodes] = useState([]);
  const [codeLang, setCodeLang] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [enterCode, setEnterCode] = useState(false);
  const [groupMembers, setGroupMembers] = useState([])
  const [groupName, setGroupName] = useState("");
  const [sending, setSending] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchChats = async () => {
      setChatsLoading(true);
      const response = await fetch(`${backendUrl}/get-chats`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setChats(data);
        setChatsLoading(false);
      }
    }
    fetchChats();
  }, [])

  const handleSearch = useCallback(debounce(async (searchName, mode) => {
    const response = await fetch(`${backendUrl}/search?q=${searchName}`, {
      credentials: 'include'
    });
    if (response.status === 200) {
      const data = await response.json();
      if (mode === "private") {
        const finalData = data.filter(usr => user._id !== usr._id)
        setFilteredUsers(finalData);
      }
      else {
        const nonAddedusers = data.filter(usr => (!groupMembers.some(m => m._id.toString() === usr._id.toString()) && user._id !== usr._id));

        setFilteredUsersForGroup(nonAddedusers);
      }
    }
  }, 1000), [groupMembers]);

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch(searchQuery, "private");
      setSearchOpen(true);
    } else {
      setFilteredUsers([])
    }
  }, [searchQuery]);

  useEffect(() => {
    if (groupSearchQuery.trim()) {
      handleSearch(groupSearchQuery, "group");
      setGroupSearchOpen(true);
    } else {
      setFilteredUsersForGroup([])
    }
  }, [groupSearchQuery]);

  const handleDeleteChat = async (chatId, isGroup) => {

    const response = await fetch(`${backendUrl}/delete-chat`, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: chatId, isGroup: isGroup })
    })
    setChats(prev => prev.filter(chat => chat._id !== chatId));
    if (selectedChat?._id === chatId) {
      setSelectedChat(null);
      setShowChatList(true);
    }
  };

  const handleStartNewChat = (usr) => {
    const newChat = {
      _id: [usr._id.toString(), user._id.toString()].sort().join("-"),
      receiverId: usr._id,
      name: usr.name,
      profilePicture: usr.profilePicture,
      lastMessage: "Start a conversation...",
      isGroup: false,
      unreadCount: 0,
      isOnline: false
    };
    if (!chats.find(chat => chat._id === newChat._id)) setChats(prev => [newChat, ...prev]);
    setSearchOpen(false);
    setSearchQuery("");
    setSelectedChat(newChat);
  };

  const handleStartNewGroup = async () => {
    if (groupName.trim() === "") {
      setError("Please Enter group name");
      setTimeout(() => {
        setError(null)
      }, 2000);
      return;
    }
    if (groupMembers.length === 0) {
      setError("Select at least one member");
      setTimeout(() => {
        setError(null)
      }, 2000);
      return;
    }
    const response = await fetch(`${backendUrl}/create-group`, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ members: groupMembers, name: groupName })
    });
    if (response.ok) {
      setGroupSearchOpen(false);
      const { group } = await response.json();
      const newGroup = {
        _id: group._id,
        name: groupName,
        lastMessage: "Start a conversation...",
        isGroup: true,
        unreadCount: 0,
        isOnline: false,
        members: groupMembers
      }
      setChats([...chats, newGroup]);
      setGroupMembers([]);
      setGroupSearchQuery("")
      setGroupName("");
    }
    else {
      setError("Something went wrong");
      setTimeout(() => {
        setError(null)
      }, 2000);
    }
  }

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setShowChatList(false);
    setChats(prev => prev.map(c => c._id === chat._id ? { ...c, unreadCount: 0 } : c));
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;
    let imageUrls = []
    let imageIds = []
    if (images.length > 0) {
      const formData = new FormData();
      images.forEach(img => {
        formData.append('images', img);
      })
      setSending(true);
      const response = await fetch(`${backendUrl}/upload-chat-image`, {
        credentials: 'include',
        method: 'POST',
        body: formData
      })
      if (response.ok) {
        const data = await response.json();
        imageUrls = data.urls;
        imageIds = data.ids;
      }
      setSending(false);
    }
    const isGroup = selectedChat.isGroup || false;
    const currentUserId = user._id;
    const receiverId = isGroup ? null : selectedChat.receiverId;
    selectedChat.isOnline = true;
    const roomId = selectedChat._id;
    socket.emit("sendMessage", {
      roomId,
      senderId: currentUserId,
      receiverId,
      message: newMessage.trim(),
      isGroup,
      imageUrls,
      imageIds,
      codes,
      codeLang
    });
    setImages([]);
    setCodeLang([]);
    setCodes([])
    setNewMessage("");
  };


  const handleBackToList = () => {
    setShowChatList(true);
    setSelectedChat(null);
  };

  const handleImageChange = (e) => {
    const file = Array.from(e.target.files);
    if (file.length + images.length > 7) {
      setError('You can only upload up to 7 images');
      setTimeout(() => { setError(null) }, 2000);
      return;
    }
    setImages([...images, ...file]);
  }

  useEffect(() => {
    if (!selectedChat) return;

    const isGroup = selectedChat.isGroup || false;
    const currentUserId = user?._id;

    const roomId = selectedChat._id;

    socket.emit("joinRoom", roomId);

    // Fetch old messages (REST)
    setMessageLoading(true);
    fetch(`${backendUrl}/get-messages?roomId=${roomId}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        const unreadMessages = data
          .filter(msg => !msg.seenBy.includes(user._id))
          .map(msg => msg._id);
        if (unreadMessages.length > 0) {
          socket.emit("markSeen", {
            roomId: selectedChat._id,
            messageIds: unreadMessages
          });
        }
      })
      .finally(() => { setMessageLoading(false) });

    // Listen for new messages
    socket.on("receiveMessage", (msg) => {
      setMessages(prev => [...prev, msg]);
      socket.emit('markSeen', {
        roomId: selectedChat._id,
        messageIds: [msg._id]
      })
    });

    // Typing indicators
    socket.on("userTyping", ({ userId }) => {
      console.log(`${userId} is typing...`);
    });

    socket.on("userStoppedTyping", ({ userId }) => {
      console.log(`${userId} stopped typing`);
    });

    // Seen update
    socket.on("messagesSeen", ({ roomId, userId, messageIds }) => {
      if (selectedChat && selectedChat._id === roomId) {
        setMessages(prev =>
          prev.map(msg =>
            messageIds.includes(msg._id.toString())
              ? { ...msg, seenBy: Array.from(new Set([...msg.seenBy,userId])) }
              : msg
          )
        );
      }
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("userTyping");
      socket.off("userStoppedTyping");
      socket.off("messagesSeen");
    };
  }, [selectedChat]);

  const chatRef = useRef(null);

  const fetchMembers = async (id) => {
    const response = await fetch(`${backendUrl}/get-group-members?id=${id}`, {
      credentials: 'include'
    })
    if (response.ok) {
      const data = await response.json();
      setGroupMembers(data);
      setShowMembers(true);
    }
  }

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white dark overflow-x-hidden">
        <Navbar />
        {error && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[60] bg-red-500 text-white px-4 py-2 rounded shadow-md transition-all duration-300">
            {error}
          </div>
        )}
        <div className="h-[calc(100vh-64px)] flex">
          {/* Left */}
          <div className={`${showChatList ? 'block' : 'hidden'} lg:block w-full lg:w-80 border-r border-gray-800`}>
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold">Messages</h1>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-sm border px-2 py-1 rounded flex items-center gap-1 hover:bg-neutral-800">
                      <Plus className="h-4 w-4" /> New
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent sideOffset={5} align="end">
                    <DropdownMenuItem onClick={() => setSearchOpen(true)}>
                      New Private Chat
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setGroupSearchOpen(true)}>
                      Create Group Chat
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="overflow-y-auto h-[calc(100%-80px)] p-2 space-y-1">
              {chatsLoading ? (
                <div className="flex justify-center h-full gap-2 min-h-[200px]">
                  <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-white font-bold"></span>
                  <span className="text-lg text-black">Loading...</span>
                </div>
              ) : (
                chats.map(chat => (
                  <div
                    key={chat._id}
                    onClick={() => handleChatSelect(chat)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${selectedChat?._id === chat._id ? 'bg-zinc-800' : 'hover:bg-zinc-900'
                      }`}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={chat.profilePicture} />
                        <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {!chat.isGroup && chat.isOnline && (
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-black rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold truncate">{chat.name}</h3>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm text-zinc-400 truncate">{chat.lastMessage}</p>
                        {chat.unreadCount > 0 && (
                          <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-2">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="text-zinc-500 hover:text-red-500"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-zinc-900 text-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete conversation with {chat.name}?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="text-white hover:bg-zinc-800">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteChat(chat._id, chat.isGroup)}
                            className="bg-red-600 text-white hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* Right */}
          <div className={`${!showChatList ? 'block' : 'hidden'} lg:block flex-1 flex flex-col bg-gradient-to-br from-[#0d0f1c] via-[#111222] to-[#090b17] w-full`}>
            {selectedChat ? (
              <div className="flex flex-col w-full h-full relative">
                <div className="absolute inset-0 z-0 top-1/2 -translate-y-1/2">
                  <Particles
                    particleColors={['#042d65', '#042d65']}
                    particleCount={200}
                    particleSpread={10}
                    speed={0.1}
                    particleBaseSize={100}
                    moveParticlesOnHover={true}
                    alphaParticles={false}
                    disableRotation={false}
                  />
                </div>
                <div className="p-4 border-b border-zinc-800 z-10 flex items-center gap-3">
                  <button onClick={handleBackToList} className="lg:hidden text-white">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedChat.avatar} />
                    <AvatarFallback>{selectedChat.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{selectedChat.name}</h3>
                    <p className="text-sm text-zinc-400">
                      {selectedChat.isOnline ? "Active now" : "Offline"}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-white">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent sideOffset={5} align="start" side="left">
                      <DropdownMenuItem onClick={() => { handleDeleteChat(selectedChat._id, selectedChat.isGroup) }} >
                        Delete Chat
                      </DropdownMenuItem>
                      {selectedChat.isGroup && <DropdownMenuItem onClick={() => { fetchMembers(selectedChat._id) }}>
                        View Members
                      </DropdownMenuItem>}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div ref={chatRef} className="flex-1 overflow-y-auto w-full z-10 p-4 space-y-4">
                  {messageLoading ? (
                    <div className="flex justify-center h-full gap-2 min-h-[200px]">
                      <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></span>
                      <span className="text-lg text-black">Loading...</span>
                    </div>
                  ) : (
                    messages.map((message) => {
                      let status = ""
                      if (message.senderId === user._id) {
                        let totalUsers = 0;
                        if (selectedChat.isGroup) {
                          totalUsers = selectedChat.members.length;
                        }
                        else {
                          totalUsers = 2;
                        }
                        if (message.seenBy.length >= totalUsers) {
                          status = "seen"
                        }
                        else {
                          status = "sent"
                        }
                      }
                      return (

                        <div
                          key={message._id}
                          className={`flex ${message.senderId === user._id ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] break-words px-4 py-2 rounded-2xl ${message.senderId === user._id ? "bg-blue-500 text-white" : "bg-zinc-700 text-white"
                              }`}
                          >
                            <p className="text-sm break-words">{message.message}</p>
                            {message.senderId === user._id && (

                              <div className="flex justify-end items-center gap-1 mt-1 text-xs text-zinc-300">
                                <span>{timeAgo(message.createdAt)}</span>

                                {/* WhatsApp-style ticks */}
                                {status === "sent" && <span className="text-gray-400">✓</span>}
                                {status === "seen" && <span className="text-blue-300">✓✓</span>}
                              </div>
                            )}

                            {/* For received messages → just show timestamp without ticks */}
                            {message.senderId !== user._id && (
                              <div className="flex justify-start mt-1 text-xs text-zinc-300">
                                <span>{message.timestamp}</span>
                              </div>
                            )}
                            <div className="flex flex-col justify-center">
                              {message.imageUrls.map((url, index) => (
                                <img key={index} src={url} className="w-auto h-auto max-w-full"></img>
                              ))}
                            </div>
                            <div className="flex flex-col gap-2 max-w overflow-x-auto">
                              {message.codeSnippet.map((code, index) => {
                                return (
                                  <CodeBlock
                                    key={index}
                                    code={code}
                                    language={message.languages[index]}></CodeBlock>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                <div className="p-4 border-t border-zinc-800">
                  {images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 ">
                      {images.map((image, index) => (
                        <div key={index} className="relative mb-3">
                          <img src={URL.createObjectURL(image)} alt={`Preview ${index}`} className="w-1/4 h-auto rounded" />
                          <button
                            type="button"
                            onClick={() => setImages(images.filter((_, i) => i !== index))}
                            className="absolute top-0 right-2/3 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {codes.length > 0 && (
                    <div className="mt-2">
                      {codes.map((code, index) => (
                        <div key={index}
                          title={code}
                          className="flex items-center my-1"
                        >

                          <div
                            className="cursor-pointer px-2 py-1 bg-zinc-800 rounded text-xs truncate max-w-full flex-1"

                            onClick={() => {
                              setEnterCode(true);
                              setCodeSnippet(code);
                              setSelectedLanguage(codeLang[index]);
                              setCodeLang(codeLang.filter((_, i) => i !== index))
                              setCodes(codes.filter((_, i) => i !== index));
                            }}
                          >

                            <pre className="inline">{code.replace(/\s+/g, ' ').slice(0, 80)}{code.length > 80 ? '...' : ''}</pre>
                          </div>
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setCodes(codes.filter((_, i) => i !== index));
                              setCodeLang(codeLang.filter((_, i) => i !== index));
                            }}
                            className="ml-2 h-5 w-5 text-red-500 hover:text-red-700 flex-shrink-0"
                          >
                            <X className="w-full h-full"></X>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <form onSubmit={handleSendMessage} encType="multipart/form-data" className="flex items-center gap-2">
                    <input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1 bg-zinc-800 text-white px-4 py-2 rounded-full outline-none"
                    />
                    <input onChange={handleImageChange} type='file' id="image" name="image" accept="image/png, image/jpeg" className="hidden" />
                    <label htmlFor="image" className="px-3 py-1 text-sm border border-zinc-500 rounded bg-zinc-800 cursor-pointer relative group">
                      <Image></Image>
                      <p className="absolute bottom-full mb-2 px-2 py-1 text-sm text-white bg-black rounded opacity-0 z-20 group-hover:opacity-100 transition-opacity">Image</p>
                    </label>
                    <input onClick={() => { setEnterCode(true) }} id="codeSnippet" name="codeSnippet" className="hidden" />
                    <label htmlFor="codeSnippet" className="group px-3 py-1 text-sm border border-zinc-500 rounded bg-zinc-800 cursor-pointer relative">
                      <Code></Code>
                      <p className="absolute bottom-full mb-2 px-2 py-1 text-sm text-white bg-black rounded opacity-0 z-20 group-hover:opacity-100 transition-opacity">Code Snippet</p>
                    </label>
                    <button
                      disabled={sending}
                      type="submit"
                      className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <Loader2 className="animate-spin w-5 h-5" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="flex-1 h-full flex items-center justify-center  bg-gradient-to-br from-[#0d0f1c] via-[#111222] to-[#090b17] relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[600px] h-[600px] bg-[#3b82f680] opacity-20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="text-center relative z-10">
                  <MessageCircle className="h-16 w-16 text-zinc-500 mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
                  <p className="text-zinc-400">Choose or start a conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/*Search new chat */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>

        <DialogContent >

          <DialogHeader>
            <DialogTitle>Start New Chat</DialogTitle>
            <DialogDescription className="text-sm text-zinc-400 pb-3">
              Type to search for users and start a new conversation.
            </DialogDescription>
          </DialogHeader>
          <Command className="bg-zinc-800 text-white border border-zinc-700 rounded">
            <CommandInput
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value) }}
              className="bg-zinc-700 text-white"
            />
            <CommandList>
              {filteredUsers.length === 0 ? (<CommandEmpty>No users found.</CommandEmpty>) : (

                <CommandGroup>
                  {filteredUsers.map((user) => (
                    <CommandItem
                      key={user._id}
                      onClick={() => handleStartNewChat(user)}
                      className="cursor-pointer"
                    >
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarImage src={user.profilePicture} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-zinc-400">@{user.username}</p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>

      <Dialog open={groupSearchOepn} onOpenChange={setGroupSearchOpen}>

        <DialogContent >

          <DialogHeader>
            <DialogTitle>Start New Group</DialogTitle>
            <DialogDescription className="text-sm text-zinc-400 pb-3">
              Type to search for users and start a new Group.
            </DialogDescription>
          </DialogHeader>
          <Command className="bg-zinc-800 text-white border border-zinc-700 rounded">
            <input
              placeholder="Enter Group Name"
              value={groupName}
              onChange={(e) => { setGroupName(e.target.value) }}
              className="bg-zinc-600 text-white my-1 py-2 px-1 outline-none"
              required
            />
            <CommandInput
              placeholder="Search users..."
              value={groupSearchQuery}
              onChange={(e) => { setGroupSearchQuery(e.target.value) }}
              className="bg-zinc-700 text-white"
            />
            {groupMembers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {groupMembers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-2 bg-zinc-700 px-2 py-1 rounded-full"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.profilePicture} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{user.name}</span>
                    <button
                      onClick={() =>
                        setGroupMembers(groupMembers.filter((m) => m._id !== user._id))
                      }
                      className="text-xs text-red-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <CommandList>
              {filteredUsersForGroup.length === 0 ? (<CommandEmpty>No users found.</CommandEmpty>) : (

                <CommandGroup>
                  {filteredUsersForGroup.map((user) => (
                    <CommandItem
                      key={user._id}
                      onClick={() => {
                        setGroupMembers([...groupMembers, user]);
                        setFilteredUsersForGroup(filteredUsersForGroup.filter(m => m._id !== user._id));
                      }}
                      className="cursor-pointer"
                    >
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarImage src={user.profilePicture} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-zinc-400">@{user.username}</p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
            <button onClick={handleStartNewGroup} className="bg-green-500 text-white font-bol rounded-full mt-1">Create</button>
          </Command>
        </DialogContent>
      </Dialog>

      <Dialog open={showMembers} onOpenChange={() => { setShowMembers(false); setGroupMembers([]); }}>
        <DialogContent >
          <DialogHeader>
            <DialogTitle>Members</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-2">

            {groupMembers.map((member, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-zinc-800 p-2 rounded-md"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.profilePicture} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-white">{member.name}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {enterCode && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg space-y-4">
            <h2 className="text-xl font-semibold">Add Your Code Snippet</h2>

            <textarea
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              placeholder="Write your code here..."
              rows={6}
              className="w-full border rounded p-2 font-mono resize-none"
            />

            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">Select Language</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => { setEnterCode(false); setCodeSnippet(""); setSelectedLanguage("") }}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Discard
              </button>
              <button
                onClick={() => {
                  setEnterCode(false); setCodes([...codes, codeSnippet]); setCodeLang([...codeLang, selectedLanguage]);
                  setCodeSnippet(""); setSelectedLanguage("");
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;

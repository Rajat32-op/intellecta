import { useEffect, useState } from "react";
import { Heart, MessageCircle, User, BookmarkPlus, Trash } from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import CodeBlock from "./CodeBlock";
import { useUser } from "../providers/getUser";
import { useNavigate } from "react-router-dom";

const PostCard = ({ post, onDelete, canDelete = false }) => {
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

  const navigate = useNavigate();
  const { user, loading } = useUser();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;


  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [likes, setLikes] = useState(post.likes);
  const [likeDisabled, setLikeDisabled] = useState(false);
  const [isSaved, setIsSaved] = useState(user ? user.savedPosts.includes(post._id) : false);
  const [saveDisabled, setSavedisbled] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentLoaded, setCommentLoaded] = useState(false);
  const [wait, setWait] = useState(false)
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetchComments = async () => {
      const response = await fetch(`${backendUrl}/get-comments?postId=${post._id}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json();
        setComments(data);
        setCommentLoaded(true);
      }
    }
    if (showComments && !commentLoaded) {
      fetchComments();
    }
  }, [showComments])

  const handleLike = async () => {
    if (isLiked) {
      setLikeDisabled(true)
      setIsLiked(false);
      setLikes(likes - 1);
      const response = await fetch(`${backendUrl}/unlike-post`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ postId: post._id }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setLikeDisabled(false);
      if (response.status != 200) {
        navigate('/login');
      }
    }
    else {
      setLikeDisabled(true)
      setIsLiked(true);
      setLikes(likes + 1);

      const response = await fetch(`${backendUrl}/like-post`, {
        method: 'POST',
        body: JSON.stringify({ postId: post._id }),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setLikeDisabled(false);
      if (response.status != 200) {
        navigate('/login');
      }
    }
  };

  const handleComment = async () => {
    if (newComment.trim() === "") return;
    const data = {
      postId: post._id, content: newComment, username: user.username, name: user.name,
      userId: user._id,
      profilePicture: user.profilePicture, createdAt: Date.now()
    }
    setComments([...comments, data]);
    setNewComment("");
    const response = await fetch(`${backendUrl}/add-comment`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    })
  };

  const deleteComment = async (id) => {
    setWait(true)
    setComments(prev => prev.filter(com => com._id !== id));
    const response = await fetch(`${backendUrl}/delete-comment`, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id })
    })
    if (response.ok) {
      setWait(false);
    }
  }

  const handleSave = async (id) => {
    setSavedisbled(true)
    let path = ""
    if (isSaved) {
      path = `${backendUrl}/unsave-post`
    }
    else {
      path = `${backendUrl}/save-post`
    }
    setIsSaved(!isSaved);

    const response = await fetch(path, {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postId: id })
    });
    if (response.status != 200) {
      navigate('/login');
    }
    setSavedisbled(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center h-full gap-2 min-h-[200px]">
        <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></span>
        <span className="text-lg text-black">Loading...</span>
      </div>
    )
  }
  return (
    <Card className="w-full bg-white dark:bg-gradient-to-br from-[#1a3760] via-[#4b5f7e] to-[#c9d1db] text-black dark:text-white border border-zinc-300 dark:border-zinc-700">
      <CardHeader>
        {wait && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div onClick={() => { navigate(`/user?id=${post.userId}`) }} className="flex items-center space-x-3">
            <Avatar className="cursor-pointer">
              <AvatarImage src={post.profilePicture || ''} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="cursor-pointer">
              <p className="font-semibold">{post.username}</p>
              <p className="text-sm text-muted-foreground dark:text-zinc-400">
                @{post.username} • {timeAgo(post.createdAt)}
              </p>
            </div>
          </div>
          {canDelete && (

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="text-white hover:text-red-500"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash className="h-4 w-4" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-zinc-900 text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Post</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this post?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="text-white hover:bg-zinc-800">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(post._id)}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Post Content */}
        <div className="relative">
          <p className="mb-4 text-zinc-800 dark:text-zinc-200">{post.caption}</p>

          {post.codeSnippet.length !== 0 && (
            <div className="space-y-4">
              {post.codeSnippet.map((code, index) => {
                return (
                  <CodeBlock
                    key={index}
                    code={code}
                    language={post.language[index]}
                  />
                );
              })}
            </div>
          )}

          {post.imageUrl.length !== 0 && (
            <div className="rounded-lg overflow-hidden my-2">
              {post.imageUrl.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Image ${index + 1}`}
                  className={`w-full h-auto max-h-96 object-cover ${index === current ? "block" : "hidden"}`}
                />
              ))}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {/*Dots*/}
                {post.imageUrl.length > 1 && post.imageUrl.map((_, idx) => (
                  <button
                    key={idx}
                    className={`h-2 w-2 rounded-full ${current === idx ? "bg-white" : "bg-gray-400"} transition`}
                    onClick={() => setCurrent(idx)}
                  ></button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <div key={tag} className="text-sm dark:bg-zinc-800 dark:text-blue-300 p-1">
              #{tag}
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center space-x-4">
            <button
              disabled={likeDisabled}
              onClick={handleLike}
              className={`${isLiked ? "text-red-500" : ""}`}
            >
              <Heart className={`mr-1 h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              {likes}
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="mr-1 h-4 w-4" />
              comments
            </button>
          </div>
          <div className="">
            <button disabled={saveDisabled} onClick={() => { handleSave(post._id) }}>
              <BookmarkPlus className={`${isSaved ? "fill-current" : ""} mr-1 h-7 w-7`}></BookmarkPlus>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
            {/* Sample Comments */}
            {showComments && (
              comments.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {comments.map(comment => (
                    <div key={comment._id} className="bg-gray-800 rounded-xl p-4 flex items-start gap-3 shadow-md">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.profilePicture}></AvatarImage>
                        <AvatarFallback>{comment.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex justify-between w-full">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{comment.name}</span>
                            <span className="text-gray-400 text-sm">{timeAgo(comment.createdAt)}</span>
                          </div>
                          <p className="text-gray-200">
                            {comment.content}
                          </p>
                        </div>
                        {comment.userId === user._id && (

                          <button
                            className="text-white hover:text-red-500"
                            onClick={() => deleteComment(comment._id)}
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                  ))}
                </div>
              ) : (
                <div className="bg-transparent text-black text-xl font-serif">No Comments Yet</div>
              )
            )}
            {/* Add Comment */}
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={user.profilePicture} className="h-full w-full"></AvatarImage>
                <AvatarFallback className="text-xs">
                  <User className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex space-x-2">
                <input
                  placeholder="Leave a comment ..."
                  value={newComment}
                  onChange={(e) => { setNewComment(e.target.value) }}
                  onKeyPress={(e) => e.key === "Enter" && handleComment()}
                  required
                  className="flex-1 bg-zinc-900 text-white px-4 py-2 rounded-full outline-none"
                />
                <button className="bg-purple-500 rounded-full px-2" onClick={handleComment}>
                  Post
                </button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostCard;

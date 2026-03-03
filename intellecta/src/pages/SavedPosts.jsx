import { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import { useUser } from "../providers/getUser"
import { Bookmark } from "lucide-react";
import Navbar from "../components/Navbar";

const SavedPosts = () => {
    const { user } = useUser();
    const [savedPosts, setSavedPosts] = useState([])
    const [loading, setLoading] = useState(false)
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true)
            const response = await fetch(`${backendUrl}/get-saved-posts`, {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setSavedPosts(data);
            }
            setLoading(false)
        }
        fetchPosts();
    }, [])
    if (loading) {
        return (
            <div className="flex justify-center h-full gap-2 min-h-[200px ]">
                <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></span>
                <span className="text-lg text-black">Loading  ...</span>
            </div>
        )
    }
    return (
        <div>

            <Navbar></Navbar>
            <div className="bg-black flex flex-col items-center w-full min-h-screen px-2 lg:px-16 gap-2 py-2">
                <h1 className="text-white text-2xl">Saved Posts</h1>
                {
                    savedPosts.length === 0 ? (
                        <div className="text-white flex justify-center gap-3 w-full">
                            <Bookmark className="h-6 w-6"></Bookmark>
                            <p className="text-white">No Saved Posts</p>
                        </div>
                    ) : (
                        <div className="flex flex-col w-full space-y-8 text-white">
                            {savedPosts.map((post) => {
                                return (

                                    <PostCard
                                        key={post._id}
                                        post={post}
                                    />
                                )
                            })}
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default SavedPosts
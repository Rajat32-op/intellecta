import { useRef, useEffect, useState } from "react";
import { User, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ScrollToTopButton from "../components/ScrollToTop";
import PostCard from '../components/PostCard.jsx'
import { useUser } from "../providers/getUser.jsx";

const Home = () => {

  const languages = [
    "JavaScript", "Python", "C++", "Java", "C", "Go", "TypeScript", "Ruby", "PHP",
    "React", "swift", "Kotlin", "Rust", "Dart", "Scala", "Perl", "Haskell",
    "Lua", "Shell", "HTML", "CSS", "SQL", "R"
  ];

  const messageRef = useRef(null);

  const navigate = useNavigate();

  const [enterCode, setEnterCode] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("JavaScript");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("")
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [images, setImages] = useState([]);
  const [posting, setPosting] = useState(false);
  const [codes, setCodes] = useState([]);
  const [codeLang, setCodeLang] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([])
  const [trendingTags, setTrendingTags] = useState([]);
  const [feedPosts, setFeedPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(null);
  const [feedLoading, setFeedLoading] = useState(false);

  const { user, loading, fetchUser } = useUser();

  const backendUrl=import.meta.env.VITE_BACKEND_URL;

  const fetchFeed = async (initial = false) => {
    if (feedLoading || (!hasMore && !initial)) return;
    setFeedLoading(true);
    const response = await fetch(`${backendUrl}/?lastScore=${cursor?.lastScore}lastCreatedAt=${cursor?.lastCreatedAt}`, {
      credentials: 'include'
    })
    if (response.status === 401) {
      navigate('/login');
    }
    else if (response.status === 200) {
      const data = await response.json();
      setFeedPosts(data.posts);
      setCursor(data.nextCursor);
      if (data.posts.length === 0 || !data.nextCursor) {
        setHasMore(false);
      }
      setFeedLoading(false);
    }
  }

  useEffect(() => {
    fetchFeed(true);
  }, []);

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
    const fetchSuggestions = async () => {
      const response = await fetch(`${backendUrl}/get-suggestion`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json();
        setSuggestedUsers(data);
      }
    }

    const fetchTrendingTags = async () => {
      const response = await fetch(`${backendUrl}/get-trending-tags`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json();
        setTrendingTags(data);
      }
    }
    fetchSuggestions();
    fetchTrendingTags();
  }, [])

  const handleNewPost = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('caption', e.target.elements.caption.value);
    formData.append('codeSnippet', codes);
    formData.append('language', codeLang);
    tags.forEach(tag => {
      formData.append('tags', tag);
    })
    images.forEach(file => {
      formData.append('images', file);
    });

    try {
      setPosting(true);
      const response = await fetch(`${backendUrl}/add-post`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      setPosting(false);
      if (response.status != 200) {
        setError('could not create post');
        setTimeout(() => { setError(null) }, 2000);
      }
      else {
        setMessage('Posted successfully');
        e.target.reset();
        setImages([]);
        setCodeLang([]);
        setCodes([]);
        setCodeSnippet("");
        setSelectedLanguage("JavaScript");
        setTags([])
        setTagInput("")
        e.target.elements.caption.value = "";
        fetchUser();
        if (messageRef.current) {
          clearTimeout(messageRef.current);
        }
        messageRef.current = setTimeout(() => { setMessage(null) }, 2000);
      }
    }
    catch (err) {
      setError('could not create post');
      setTimeout(() => { setError(null) }, 2000);
    }
  }

  return (
    <>
      <div className={enterCode ? "blur-sm pointer-events-none select-none min-h-screen" : "min-h-screen w-full overflow-x-hidden bg-background text-white"}>
        <Navbar />
        {error && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 bg-red-500 text-white px-4 py-2 rounded shadow-md transition-all duration-300">
            {error}
          </div>
        )}
        {message && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 bg-green-500 text-white px-4 py-2 rounded shadow-md transition-all duration-300">
            {message}
          </div>
        )}
        <div className="max-w-7xl z-0 mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 hidden lg:block">
              <Sidebar />
            </div>

            {/* Main Feed */}
            <div className="col-span-1 lg:col-span-2 space-y-6">

              <form onSubmit={handleNewPost} className="col-span-1 lg:col-span-2 space-y-6" encType="multipart/form-data">
                {/* Create Post */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <textarea
                        name="caption"
                        required
                        placeholder="Share your code or thoughts with the community..."
                        className="flex-1 min-h-[60px] resize-none bg-transparent border border-zinc-500 rounded px-3 py-2 text-white"

                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex md:justify-between items-center">
                      {/* Image & Code Buttons */}
                      <div className="flex space-x-2">
                        <input
                          onChange={handleImageChange}
                          disabled={posting}
                          type="file"
                          id="image"
                          name="image"
                          accept="image/png, image/jpeg"
                          className="hidden"
                        />
                        <label
                          htmlFor="image"
                          className="px-3 py-1 text-sm border border-zinc-500 rounded bg-zinc-800 cursor-pointer"
                        >
                          📷 Image
                        </label>

                        <input id="codeSnippet" disabled={posting} name="codeSnippet" className="hidden" />
                        <label
                          onClick={() => {
                            setEnterCode(true);
                          }}
                          disabled={enterCode}
                          htmlFor="codeSnippet"
                          className="px-3 py-1 text-sm border border-zinc-500 rounded bg-zinc-800 cursor-pointer"
                        >
                          💻 Code
                        </label>
                      </div>

                      {/* Discard & Post Buttons */}
                      <div className="flex space-x-4 sm:space-x-2">
                        <button
                          onClick={() => {
                            setImages([]);
                            setCodes([]);
                            setCodeLang([]);
                            setTags([]);
                          }}
                          disabled={posting}
                          type="reset"
                          className="px-1 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                        >
                          Discard Post
                        </button>
                        <button
                          type="submit"
                          disabled={posting}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
                        >
                          Post
                        </button>
                      </div>
                    </div>

                    {/* Image Preview */}
                    {images.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {images.map((image, index) => (
                          <div key={index} className="relative">
                            <img src={URL.createObjectURL(image)} alt={`Preview ${index}`} className="w-full h-auto rounded" />
                            <button
                              type="button"
                              onClick={() => setImages(images.filter((_, i) => i !== index))}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Code Preview */}
                    {codes.length > 0 && (
                      <div className="mt-2">
                        {codes.map((code, index) => (
                          <div key={index} title={code} className="flex items-center my-1">
                            <div
                              className="cursor-pointer px-2 py-1 bg-zinc-800 rounded text-xs truncate max-w-full flex-1"
                              onClick={() => {
                                setEnterCode(true);
                                setCodeSnippet(code);
                                setSelectedLanguage(codeLang[index]);
                                setCodeLang(codeLang.filter((_, i) => i !== index));
                                setCodes(codes.filter((_, i) => i !== index));
                              }}
                            >
                              <pre className="inline">
                                {code.replace(/\s+/g, " ").slice(0, 80)}
                                {code.length > 80 ? "..." : ""}
                              </pre>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCodes(codes.filter((_, i) => i !== index));
                                setCodeLang(codeLang.filter((_, i) => i !== index));
                              }}
                              className="ml-2 h-5 w-5 text-red-500 hover:text-red-700 flex-shrink-0"
                            >
                              <X className="w-full h-full" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tags Input */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-white mb-1">Tags</label>
                      <div className="flex flex-wrap gap-2 border border-zinc-500 rounded p-2 min-h-[44px] bg-zinc-800">
                        {tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1"
                          >
                            {tag}
                            <button
                              type="button"
                              className="text-white hover:text-red-300"
                              onClick={() => setTags(tags.filter((_, i) => i !== index))}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if ((e.key === "Enter" || e.key === ",") && tagInput.trim() !== "") {
                              e.preventDefault();
                              if (!tags.includes(tagInput.trim())) {
                                setTags([...tags, tagInput.trim()]);
                              }
                              setTagInput("");
                            }
                          }}
                          placeholder="Type and press Enter"
                          className="flex-1 border-none outline-none bg-transparent text-sm text-white"
                        />
                      </div>
                    </div>

                  </CardContent>
                </Card>

                {/* Posts Feed */}
              </form>
              <div className="space-y-6 overflow-x-auto">
                {!feedLoading && feedPosts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
                {feedLoading && (<div className="flex justify-center h-full gap-2 min-h-[200px]">
                  <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></span>
                  <span className="text-lg text-black">Loading...</span>
                </div>)}
                {!hasMore && <p className="text-center text-black mt-4">🎉 You’re all caught up!</p>}
                {hasMore && !feedLoading && (
                  <button onClick={() => fetchFeed()} className="block mx-auto mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                    Load more
                  </button>
                )}
              </div>

            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1 hidden lg:block">
              <div className="space-y-6">
                {/* Trending Tags */}
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold">Trending Tags</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {trendingTags.map((tag) => (
                        <span key={tag._id} className="px-2 py-1 text-xs border border-zinc-600 rounded bg-zinc-800 text-white">
                          #{tag.tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Suggested Friends */}
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold">Suggested Connections</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {suggestedUsers.map((suggestion) => (
                        <div key={suggestion._id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {suggestion.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-1">
                              <p className="text-sm font-medium">{suggestion.name}</p>
                              <p className="text-sm font-medium">@ {suggestion.username}</p>
                            </div>
                          </div>
                          <button onClick={() => { navigate(`/user?id=${suggestion._id}`) }} className="text-sm border border-zinc-600 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-900">
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
        <ScrollToTopButton />
      </div>
      {enterCode && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg space-y-4">
            <h2 className="text-xl font-semibold">Add Your Code Snippet</h2>

            {/* Code Input */}
            <textarea
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              placeholder="Write your code here..."
              rows={6}
              className="w-full border rounded p-2 font-mono resize-none"
            />

            {/* Language Select */}
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

            {/* Buttons */}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setEnterCode(false);
                  setCodeSnippet("");
                  setSelectedLanguage("");
                }}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Discard
              </button>
              <button
                onClick={() => {
                  setEnterCode(false);
                  setCodes([...codes, codeSnippet]);
                  setCodeLang([...codeLang, selectedLanguage]);
                  setCodeSnippet("");
                  setSelectedLanguage("");
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

export default Home;
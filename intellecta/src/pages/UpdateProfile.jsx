import { form, nav } from "framer-motion/client"
import Navbar from "../components/Navbar"
import { useUser } from "../providers/getUser"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const UpdateProfile = () => {
    const navigate = useNavigate()
    const { user, fetchUser } = useUser()
    const [name, setName] = useState(user.name || "")
    const [username, setUsername] = useState(user.username || "")
    const [bio, setBio] = useState(user.bio || "")

    const [loading, setLoading] = useState(false)
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const handleUpdate = async (e) => {
        e.preventDefault()
        const formData = new FormData()
        formData.append('userId', user._id)
        formData.append('name', name)
        formData.append('username', username)
        formData.append('bio', bio)
        if (e.target.elements.profilePicture.files[0]) formData.append('profilePicture', e.target.elements.profilePicture.files[0])
        setLoading(true)
        const response = await fetch(`${backendUrl}/edit-profile`, {
            method: 'PATCH',
            credentials: 'include',
            body: formData
        })

        if (response.ok) {
            fetchUser()
            navigate('/profile')
            setLoading(false)
        }
    }
    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground dark:bg-black dark:text-white">
                <Navbar />
                <div className="container mx-auto px-4 py-6">
                    <div className="max-w-4xl mx-auto text-center text-lg">Updating...</div>
                </div>
            </div>
        )
    }
    return (
        <div className="min-h-screen bg-background text-foreground bg-[url('/bg_update_profile.png')] shadow-2xl dark:text-white">
            <Navbar />
            <div className="container mx-auto z-10 px-4 py-6">
                <div className="max-w-4xl mx-auto text-white">
                    <h1 className="text-2xl text-white font-bold mb-4">Update Profile</h1>
                    <form onSubmit={handleUpdate} className="space-y-4" encType="multipart/form-datad">
                        <div>
                            <label className="block text-sm text-wihte font-medium mb-2">Name</label>

                            <input
                                type="text"
                                className="w-full bg-transparent text-wihte px-3 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your name"
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />

                        </div>
                        <div>
                            <label className="block text-sm text-wihte font-medium mb-2">Username</label>
                            <input
                                type="text"
                                className="w-full bg-transparent text-wihte px-3 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your username"
                                name="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-wihte font-medium mb-2">Bio</label>
                            <textarea
                                className="w-full bg-transparent text-wihte px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Tell us about yourself"
                                rows="4"
                                name="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm text-wihte font-medium mb-2">Profile Picture</label>
                            <input
                                type="file"
                                className="w-full bg-transparent text-wihte px-3 py-2 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                accept="image/png, image/jpeg"
                                name="profilePicture"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Update Profile
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default UpdateProfile
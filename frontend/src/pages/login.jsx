import { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { FadeInView } from '../components/Animations'
import { useUser } from '../providers/getUser.jsx';
import { User, Lock } from "lucide-react";

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { fetchUser } = useUser();
  const navigate = useNavigate()
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGoogleSignup = async (token) => {
    const response = await fetch(`${backendUrl}/google-signup`, {
      method: 'POST',
      body: JSON.stringify({ token }),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    })
    const result = await response.json();
    if (response.status === 201) {
      navigate('/askForUsername', { state: { from: 'Signup' } });
    }
    else if (response.status === 200) {
      fetchUser();
      navigate('/');
    }
    else {
      setError(result.message || 'An error occurred during signup');
      console.error(result);
      setForm({ email: '', password: '' }); // Reset form on error
      setTimeout(() => setError(''), 2000);
    }
  }

  const handleSubmit = async e => {
    e.preventDefault();
    // Call backend API to signup
    const data = {
      username: e.target.elements.username.value,
      password: e.target.elements.password.value
    }
    const response = await fetch(`${backendUrl}/login`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
      credentials: "include"
    })
    const result = await response.json()
    if (response.status === 200) {
      setTimeout(() => {
        fetchUser();
      }, 100);
      navigate('/')
    }
    else {
      setError(result.message || 'An error occurred during login');
      console.error(result);
      setForm({ email: '', password: '' }); // Reset form on error
      setTimeout(() => setError(''), 2000);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center relative">
      {/* Background Image with opacity */}
      <div className="bg-[url('/bg_login.png')] bg-center z-0 absolute inset-0"></div>

      {/* Foreground Form */}
      {error && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 bg-red-500 text-white px-4 py-2 rounded shadow-md transition-all duration-300">
          {error}
        </div>
      )}
      <FadeInView>

        <form onSubmit={handleSubmit} className=" bg-gradient-to-br from-[#0a3c3d] via-[#0d4748] to-[#0f4f50] relative p-6 rounded shadow w-96 z-10 ring-2 ring-black/10">
          <h2 className="text-2xl text-white font-bold mb-4">Log In</h2>
          <div className='flex flex-col gap-2 rounded-full'>

            <div className='flex gap-2 rounded-full'>
              <User className="w-10 h-10 text-white mb-2" />
              <input
                type="text"
                name="username"
                placeholder="Username"
                required
                onChange={handleChange}
                className="bg-transparent border p-2 text-gray-300 outline-none w-full font-bold mb-2 rounded-2xl"
              />
            </div>
            <div className='flex gap-2 rounded-full'>
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                onChange={handleChange}
                className=" border p-2 bg-transparent text-gray-300 w-full mb-4 font-bold rounded-2xl"
              />
              <Lock className="w-10 h-10 text-white mb-2" />
            </div>
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 my-2 cursor-pointer text-white py-2 px-4 rounded w-full"
          >
            Log In
          </button>
          <GoogleOAuthProvider clientId="215751656376-24vomoq01h0qhlodv3h7qc3u2rjiiidv.apps.googleusercontent.com">
            <GoogleLogin
              onSuccess={credentialResponse => {
                handleGoogleSignup(credentialResponse.credential)
              }}
              onError={() => {
                console.log('Login Failed');
              }}
            />
          </GoogleOAuthProvider>
          <button className='bg-transparent text-blue-300 hover:text-blue-400 text-md cursor-pointer' onClick={() => { navigate('/signup') }}>Don't have an account? Create new account</button>
        </form>
      </FadeInView>
    </div>

  );
}

export default Login;

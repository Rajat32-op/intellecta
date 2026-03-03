import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { FadeInView } from '../components/Animations'
import { useUser } from '../providers/getUser.jsx';
import { User, Lock, Mail ,SunSnow, Sun} from 'lucide-react';

function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { fetchUser } = useUser();
  const navigate = useNavigate();
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const backendUrl=import.meta.env.VITE_BACKEND_URL;

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
  }

  const handleSubmit = async e => {
    e.preventDefault();
    const data = {
      name: e.target.elements.name.value,
      username: e.target.elements.username.value,
      email: e.target.elements.email.value,
      password: e.target.elements.password.value
    }
    const response = await fetch(`${backendUrl}/signup`, {
      method: 'POST',
      credentials: "include",
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    })
    const result = await response.json()
    if (response.status === 200) {
      setTimeout(() => {
        fetchUser();
      }, 100);
      navigate('/')
    }
    else {
      setError(result.message || 'An error occurred during signup');
      console.error(result);
      setForm({ name: '', email: '', password: '' }); // Reset form on error
      setTimeout(() => setError(''), 2000);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-center relative">
      <div className='absolute bg-[url(/bg_signup.png)] bg-center bg-coverz-0 inset-0'></div>

      {error && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 bg-red-500 text-white px-4 py-2 rounded shadow-md transition-all duration-300">
          {error}
        </div>
      )}

      <FadeInView>

        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md p-6 border border-white/30 rounded shadow-xl w-96 relative flex flex-col">
          <h2 className="text-2xl text-white font-bold mb-4">Sign Up</h2>
          <div className='flex flex-col gap-2'>

            <div className='flex gap-2 rounded-full'>
              <SunSnow className='h-10 w-10 text-2xl mr-2 text-white' />
              <input
                type="text"
                name="name"
                placeholder="Name"
                onChange={handleChange}
                required
                className="bg-transparent rounded-full text-gray-300 font-bold border-2 p-2 w-full mb-2 rounded-4xl "
              />
            </div>
            <div className='flex gap-2 rounded-full'>
              <User className='h-10 w-10 text-2xl mr-2 text-white' />
              <input
                type="text"
                name="username"
                placeholder="Username"
                required
                onChange={handleChange}
                className="bg-transparent rounded-full text-gray-300 font-bold outline-none border-2 p-2 w-full mb-2 rounded-4xl "
              />
            </div>
            <div className='flex gap-2 rounded-full'>
              <Mail className='h-10 w-10 text-2xl mr-2 text-white' />
              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
                required
                className="bg-transparent rounded-full text-gray-300 font-bold outline-none border-2 p-2 w-full mb-2 rounded-4xl"
              />
            </div>
            <div className='flex gap-2 rounded-full'>
              <Lock className='h-10 w-10 text-2xl mr-2 text-white' />
              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
                required
                className="bg-transparent rounded-full text-gray-300 font-bold outline-none border-2 p-2 w-full mb-4 rounded-4xl"
              />
            </div>
          </div>
          <button type="submit" className="bg-green-600 text-white my-2 py-2 px-4 hover:bg-green-500 cursor-pointer transition-all duration-100 ease-in-out  rounded w-full">
            Sign Up
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
          <button className='bg-transparent text-blue-200 hover:text-blue-300 text-md cursor-pointer' onClick={() => { navigate('/login') }}>Already have an account? Log in</button>

        </form>
      </FadeInView>
    </div>
  );
}

export default Signup;

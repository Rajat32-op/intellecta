import { useState } from 'react'
import { BrowserRouter,Route,Routes } from 'react-router-dom'
import './App.css'
import Signup  from './pages/signup'
import Home from './pages/home'
import Login from './pages/login'
import AskForUsername from './pages/AskForUsername'
import Profile from './pages/Profile'
import Chat from './pages/Chat'
import Notifications from './pages/Notifications'
import UpdateProfile from './pages/UpdateProfile'
import { ZoominIcon } from './components/Animations'
import UserPage from './pages/User'
import SavedPosts from './pages/SavedPosts'

function App() {
  
  return (
    <>
      <ZoominIcon>

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home/>}></Route>
            <Route index path='/login' element={<Login/>}/>
            <Route path='/signup' element={<Signup/>}/>
            <Route path='/askForUsername' element={<AskForUsername/>}/>
            <Route path='/profile' element={<Profile/>}/>
            <Route path='/update-profile' element={<UpdateProfile/>}/>
            <Route path='/chat' element={<Chat/>}/>
            <Route path='/notifications' element={<Notifications/>}/>
            <Route path='/user' element={<UserPage/>}/>
            <Route path='/savedPosts' element={<SavedPosts/>}/>
        </Routes>
      </BrowserRouter>
      </ZoominIcon>
    </>
  )
}

export default App

import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useLocation } from 'react-router-dom'
import { Route, Routes } from 'react-router-dom'
import UserLogin from './pages/UserLogin'
import Dashboard from './pages/Dashboard'
import UserSignup from './pages/UserSignup'
import Sidebar from './components/SideBar'
import Profile from './pages/Profile'
import UserLogout from './pages/UserLogout'
import UserProtectedWrapper from './pages/UserProtectedWrapper'
import SettingsPage from './pages/Settings'
import Chat from './pages/Chat'

function App() {
  const location = useLocation()
  // Hide sidebar on login and signup pages
  const hideSidebar = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === "/";

  return (
    <>
      <div className="flex min-h-screen">
      {!hideSidebar && <Sidebar />}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Dashboard/>}/>
          <Route path="/login" element={<UserLogin/>}/>
          <Route path="/signup" element={<UserSignup/>} />
          <Route path='/chat' element={<Chat/>}/>
          <Route path="/profile" element={
            <UserProtectedWrapper><Profile/></UserProtectedWrapper>
            }></Route>
          <Route path='/settings' element={<SettingsPage/>}></Route>
          <Route path="/user/logout"
          element={<UserLogout/>}>
          </Route>
        </Routes>
      </div>
    </div>
    </>
  )
}

export default App

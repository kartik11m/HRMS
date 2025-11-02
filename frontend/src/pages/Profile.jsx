import React from 'react'
import { UserContextData } from '../context/UserContext';
import { useContext } from 'react';
import { BookMarked, Clock, Download, Hamburger, HamburgerIcon, Heart, LanguagesIcon, Laptop, LayoutDashboardIcon, ListCollapseIcon, ListIcon, Locate, LogOut, MenuSquareIcon, MessageCircleMore, PlaySquareIcon, PlusSquareIcon, RectangleVerticalIcon, Settings, Trash, UserIcon, UserSearchIcon } from 'lucide-react'

const Profile = () => {

  const {user} = useContext(UserContextData);

  const users = {
        imageUrl : "https://static.vecteezy.com/system/resources/previews/002/318/271/original/user-profile-icon-free-vector.jpg",
    }

  const ProfileLogs = [
        {name: 'Latest Feed' , icon: Heart},
        {name: 'Latest Uploads', icon: Download},
        {name: 'Languages', icon: LanguagesIcon},
        {name: 'Location', icon: Locate},
        {name: 'Files and Documents', icon: PlaySquareIcon},
        {name: 'Display', icon: Laptop},
        {name: 'Recently Deleted', icon: Trash},
        {name: 'Clear History', icon: Clock},
        {name: 'Exit', icon: LogOut},
    ]

  return (
    <div className='ml-[2%] mt-[2%]'>
      <div className="flex justify-between">
        <h1 className='text-2xl font-semibold'>My Profile</h1>
        <button className='cursor-pointer'>
          <MenuSquareIcon className='h-10 w-8'/>
        </button>
      </div>
      <div className='border w-[17%]'></div>
      <div className='flex gap-2 mt-3'>
            <div className='mt-[1%]'>
              <img src={users.imageUrl} alt="sidebar" className='h-20 w-20 rounded-full mx-auto border-2 border-white'/>
            </div>
            <div className="flex flex-col mt-3">
                <p className='mt-2 text-base font-semibold'>{user.fullname.firstname} {user.fullname.lastname}</p>
                <p className='text-xs'>{user.email}</p>
                <button className='bg-blue-500 text-white mt-2 rounded-2xl'>Edit Profile</button>
            </div>
        </div>
        <div className='ml-[3%] mt-9'>
            {ProfileLogs.map(((link,index)=>( 
            <div key={index} className='mb-5'>
                <div className='flex items-center gap-4'>
                  <link.icon className='w-5 h-5 text-gray-700' />
                  <p className='text-base font-medium'>{link.name}</p>
                </div>
                <div className='mt-2 border-b border-gray-300 w-[50%]'></div>
            </div>

            )))}
        </div>
    </div>
  )
}

export default Profile
import React, { useState,useRef } from 'react'
import { UserContextData } from '../context/UserContext';
import { useContext } from 'react';
import { Clock, Download, Heart, LanguagesIcon, Laptop, Locate, LogOut, MenuSquareIcon, PlaySquareIcon, Settings, Trash, UserIcon, X } from 'lucide-react'
import {gsap} from "gsap";
import {useGSAP} from "@gsap/react"
import { Link } from 'react-router-dom';

const Profile = () => {

  const menuPanelRef = React.useRef(null);
  const [openMenu,setOpenMenu] = useState(false);


  useGSAP(() => {
  if (openMenu && menuPanelRef.current) {
    gsap.fromTo(
      menuPanelRef.current,
      { x: 300, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
    );
  }
}, [openMenu]);

  const handleCloseMenu = () => {
    if (menuPanelRef.current) {
      gsap.to(menuPanelRef.current, {
        x: 300,
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => setOpenMenu(false),
      });
    }
  };

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
    const MenuLogs = [
        {name: 'Appreciations' , icon: Heart},
        {name: 'My Referrals', icon: UserIcon},
        {name: 'Settings', icon: Settings},
        {name: 'Logout', icon: LogOut},
    ]

  return (
    <div className='ml-[2%] mt-[2%]'>
      <div className="flex justify-between">
        <h1 className='text-2xl font-semibold'>My Profile</h1>
        <div>
          <button className="cursor-pointer" onClick={() => setOpenMenu(true)}>
            <MenuSquareIcon className="h-10 w-8 mr-12" />
          </button>

          <div
              ref={menuPanelRef}
              className={`fixed top-0 right-0 w-[20%] z-50 bg-white border-l border-b p-4 flex justify-between transition-opacity duration-300 ${
                openMenu ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
            >
              {/* <div>
                {MenuLogs.map((link, index) => (
                  <div key={index} className="mb-5">
                    <div className="flex items-center gap-4">
                      <link.icon className="w-5 h-5 text-gray-400" />
                      <p className="text-base text-gray-400 font-medium">{link.name}</p>
                    </div>
                  </div>
                ))}
              </div> */}
              <div>
                <div className='flex items-center gap-4 mb-2'>
                  <Heart className="w-5 h-5 text-gray-400" />
                  <p className="text-base text-gray-400 font-medium">Apreciation</p>
                </div>
                <div className='flex items-center gap-4 mb-2'>
                  <UserIcon className="w-5 h-5 text-gray-400" />
                  <p className="text-base text-gray-400 font-medium">My Referrals</p>
                </div>
                <div className='flex items-center gap-4 mb-2'>
                  <Settings className="w-5 h-5 text-gray-400" />
                  <p className="text-base text-gray-400 font-medium">Settings</p>
                </div>
                <Link to="/user/logout" className='flex items-center gap-4 mb-2'>
                  <LogOut className="w-5 h-5 text-red-600" />
                  <p className="text-base text-red-600 font-medium cursor-pointer">Logout</p>
                </Link>
              </div>
              <div onClick={handleCloseMenu} className="cursor-pointer">
                <X/>
              </div>
            </div>
        </div>
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
        <div className="flex">
          <div className='ml-[3%] mt-9 w-[60%]'>
            {ProfileLogs.map(((link,index)=>( 
            <div key={index} className='mb-5'>
                <div className='flex items-center gap-4'>
                  <link.icon className='w-5 h-5 text-gray-700' />
                  <p className='text-base font-medium'>{link.name}</p>
                </div>
                <div className='mt-2 border-b border-gray-300 w-[80%]'></div>
            </div>

            )))}
          </div>
          <div>
            <img src="profileR.png" alt="" className=" h-auto object-cover rounded-lg shadow-md mr-20 mt-15"/>
          </div>
        </div>
    </div>
  )
}

export default Profile
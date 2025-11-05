import React, { useState,useRef } from 'react'
import { UserContextData } from '../context/UserContext';
import { useContext } from 'react';
import { Clock, Download, Heart, LanguagesIcon, Laptop, Locate, LogOut, MenuSquareIcon, PlaySquareIcon, Settings, Trash, UserIcon, X } from 'lucide-react'

const SettingsPage = () => {
  const {user} = useContext(UserContextData);

  const users = {
        imageUrl : "https://static.vecteezy.com/system/resources/previews/002/318/271/original/user-profile-icon-free-vector.jpg",
    }

  const SettingsLogs = [
        {name: 'Notification' , icon: Heart},
        {name: 'Dark Mode', icon: Download},
        {name: 'Rate App', icon: LanguagesIcon},
        {name: 'Share Link', icon: Locate},
        {name: 'Privacy Policy', icon: PlaySquareIcon},
        {name: 'Terms and Conditions', icon: Laptop},
        {name: 'Cookies Policy', icon: Trash},
        {name: 'Contact', icon: Clock},
        {name: 'Feedback', icon: LogOut},
        {name: 'Logout', icon: LogOut},
    ]

  return (
    <div className='ml-[2%] mt-[2%]'>
      <div>
        <h1 className='text-2xl font-semibold'>Settings</h1>
      </div>
      <div className='border w-[17%]'></div>
        <div className="flex">
          <div className='ml-[3%] mt-9 w-[60%]'>
            {SettingsLogs.map(((link,index)=>( 
            <div key={index} className='mb-5'>
                <div className='flex items-center gap-4'>
                  <link.icon className='w-5 h-5 text-gray-700' />
                  <p className='text-base font-medium'>{link.name}</p>
                </div>
                <div className='mt-2 border-b border-gray-300 w-[80%]'></div>
            </div>
            )))}
          </div>
          <div className='flex flex-col w-[80%] items-center'>
            <img src="Hrms.png" alt="" className='w-[60%] h-auto object-cover rounded-lg shadow-md mr-20'/>
            <img src="profileR.png" alt="" className="w-[60%] h-auto object-cover rounded-lg shadow-md mr-20 mt-15"/>
          </div>
        </div>
    </div>
  )
}

export default SettingsPage;
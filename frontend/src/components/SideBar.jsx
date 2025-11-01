import React from 'react'
import { BookMarked, LayoutDashboardIcon, ListCollapseIcon, ListIcon, MessageCircleMore, PlusSquareIcon, RectangleVerticalIcon, Settings, UserIcon, UserSearchIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {

    const user = {
        firstName : 'Admin',
        lastName : 'User',
        imageUrl : "https://static.vecteezy.com/system/resources/previews/002/318/271/original/user-profile-icon-free-vector.jpg",
    }

    const adminNavlinks = [
        {name: 'Dashboard', path: '/dashboard' , icon: LayoutDashboardIcon},
        {name: 'Chat', path: '/chat' , icon: MessageCircleMore},
        {name: 'Employees', path: '/employees' , icon: UserSearchIcon},
        {name: 'Feed', path: '/feed' , icon: ListCollapseIcon},
        {name: 'Recognition', path: '/recognition' , icon: BookMarked},
        {name: 'Profile', path: '/profile' , icon: UserIcon},
        {name: 'Settings', path: '/settings' , icon: Settings},

    ]

  return (
    <div className='h-100% md:flex flex-col items-center
    max-w-13 md:max-w-60 w-full border-r border-gray-300/20 text-sm bg-[#266ECD] text-white'>
        <img src="logo.png" alt="" className='w-[60%] mr-20 mb-2'/>
        <div className='flex gap-4 mr-10'>
            <img src={user.imageUrl} alt="sidebar" className='h-9 md:h-14 w-9 md:w-14 rounded-full mx-auto border-2 border-white'/>
            <div className="flex flex-col">
                <p className='mt-2 text-base max-md:hidden font-semibold'>{user.firstName} {user.lastName}</p>
                <p className='text-xs'>HR Manager</p>
            </div>
        </div>
        <div className='w-full'>
            {adminNavlinks.map(((link,index)=>( 
                <NavLink key={index} to={link.path} end className={({isActive}) => 
                    `relative flex items-center 
                    max-md:justify-center gap-2 w-full py-2.5 min-md:pl-10 first:mt-7 mt-7 
                    ${isActive ? 'bg-[#D9D9D9] text-[#266ECD]' : 'text-purple-100 hover:bg-[#006eff] hover:text-white'} group transition-colors duration-200`
                }>
                    {({isActive})=>(
                        <>
                        <link.icon className='w-5 h-5'/>
                        <p className='max-md:hidden'>{link.name}</p>
                        <span className={`w-1.5 h-10 rounded-1 right-0 absolute ${isActive ? 'bg-yellow-300' : ''}`}></span>
                        </>
                    )}
                </NavLink>
            )))}
        </div>
    </div>
  )
}

export default Sidebar;
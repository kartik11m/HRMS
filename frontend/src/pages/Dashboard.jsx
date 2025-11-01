import React from 'react'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  return (
    <div>
      <Link to={"/login"} className='text-blue-600'>Login</Link>
    </div>
  )
}

export default Dashboard
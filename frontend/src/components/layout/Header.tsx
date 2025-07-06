import React from 'react'
import { Link } from 'react-router-dom'
import { isAuthenticated } from '@/utils/auth'

const Header: React.FC = () => {
  const authenticated = isAuthenticated()
  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
      <div className="kt-container-fixed flex items-center justify-between h-20">
        {/* Left: Logo and Menu */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="font-bold text-lg text-gray-900 hidden md:block">Metronic</span>
          </Link>
          {/* Menu */}
          <nav className="hidden lg:flex gap-6 text-gray-700 text-sm font-medium">
            <Link to="#" className="hover:text-blue-600">Boards</Link>
            <Link to="#" className="hover:text-blue-600">Profiles</Link>
            <Link to="#" className="hover:text-blue-600">Account</Link>
            <Link to="#" className="hover:text-blue-600">Network</Link>
            <Link to="#" className="hover:text-blue-600">Store</Link>
            <Link to="#" className="hover:text-blue-600">Auth</Link>
            <Link to="#" className="hover:text-blue-600">Help</Link>
          </nav>
        </div>
        {/* Right: User Avatar or Auth Buttons */}
        <div className="flex items-center gap-4">
          {authenticated ? (
            <button className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-lg font-bold ml-2">S</button>
          ) : (
            <div className="flex gap-2 ml-2">
              <Link to="/login" className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">Sign In</Link>
              <Link to="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header 
import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { isAuthenticated, removeToken } from '@/utils/auth'

const Header: React.FC = () => {
  const authenticated = isAuthenticated()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  const handleLogout = () => {
    removeToken()
    navigate('/')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/stocks/${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
      <div className="kt-container-fixed flex items-center justify-between h-20">
        {/* Left: Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <img src="/smadau.png" alt="smadau logo" className="h-10 w-auto" />
          </Link>
        </div>
        
        {/* Center: Search Box */}
        <div className="flex-1 flex justify-center max-w-md">
          <form onSubmit={handleSearch} className="w-full">
            <input
              type="text"
              placeholder="Search stocks by symbol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </form>
        </div>
        
        {/* Right: Logout Button */}
        <div className="flex items-center gap-4">
          {authenticated ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Logout
            </button>
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
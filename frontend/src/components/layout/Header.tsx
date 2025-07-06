import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { isAuthenticated, removeToken } from '@/utils/auth'

const navLinksAuth = [
  { path: '/', label: 'Home' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/bhavcopy', label: 'Download Data' },
  { path: '/process', label: 'Process Data' },
  { path: '/stocks', label: 'All Stocks' },
  { path: '/stock-master', label: 'Stock Master' },
  { path: '/delivery-spikes', label: 'Delivery Spikes' },
  { path: '/watchlist', label: 'Watchlist' },
]
const navLinksGuest = [
  { path: '/', label: 'Home' },
]

const Header: React.FC = () => {
  const authenticated = isAuthenticated()
  const location = useLocation()
  const navigate = useNavigate()
  const navLinks = authenticated ? navLinksAuth : navLinksGuest

  const handleLogout = () => {
    removeToken()
    navigate('/')
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
        {/* Center: Navigation Menu */}
        <nav className="flex-1 flex justify-center gap-6 text-gray-700 text-sm font-medium">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-2 py-1 border-b-2 transition-colors duration-150 ${
                location.pathname === link.path
                  ? 'border-blue-600 text-blue-700' : 'border-transparent hover:text-blue-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {/* Right: Auth Buttons or Logout */}
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
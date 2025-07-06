import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { isAuthenticated } from '@/utils/auth'

const Sidebar: React.FC = () => {
  const location = useLocation()
  const authenticated = isAuthenticated()

  const menuItems = authenticated
    ? [
        { path: '/', label: 'Home', icon: '🏠' },
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/bhavcopy', label: 'Download Data', icon: '📥' },
        { path: '/process', label: 'Process Data', icon: '⚙️' },
        { path: '/stocks', label: 'All Stocks', icon: '📋' },
        { path: '/stock-master', label: 'Stock Master', icon: '🏢' },
        { path: '/delivery-spikes', label: 'Delivery Spikes', icon: '📈' },
        { path: '/watchlist', label: 'Watchlist', icon: '⭐' },
      ]
    : [
        { path: '/', label: 'Home', icon: '🏠' },
      ]

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="ml-2 text-lg font-semibold text-gray-900">AI Stocks</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
          {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">U</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">User</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar 
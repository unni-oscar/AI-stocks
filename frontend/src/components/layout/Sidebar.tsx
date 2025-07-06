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
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Navigation</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <div key={item.path} className="border border-gray-200 p-1">
              <Link
                to={item.path}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar 
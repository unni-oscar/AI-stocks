import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { isAuthenticated, getToken, removeToken } from '@/utils/auth'

const sections = [
  {
    header: 'Main',
    links: [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/bhavcopy', label: 'Download Data' },
      { path: '/process', label: 'Process Data' },
      { path: '/stocks', label: 'All Stocks' },
      { path: '/stock-master', label: 'Stock Master' },
      { path: '/delivery-spikes', label: 'Delivery Spikes' },
      { path: '/top-gainers', label: 'Top Gainers' },
      { path: '/top-losers', label: 'Top Losers' },
      { path: '/52-week-high', label: '52 Week High' },
      { path: '/52-week-low', label: '52 Week Low' },
      { path: '/most-active', label: 'Most Active' },
      { path: '/watchlist', label: 'Watchlist' },
      { path: '/profile', label: 'Profile' },
      { path: '/dummy', label: 'Dummy' },
    ],
  },
  {
    header: 'Billing',
    links: [
      { path: '/billing/plans', label: 'Plans' },
      { path: '/billing/payment-methods', label: 'Payment Methods' },
      { path: '/billing/invoices', label: 'Invoices' },
    ],
  },
  {
    header: 'Security',
    links: [],
  },
  {
    header: 'Members & Roles',
    links: [],
  },
  {
    header: 'Integrations',
    links: [],
  },
  {
    header: 'Notifications',
    links: [],
  },
  {
    header: 'API Keys',
    links: [],
  },
  {
    header: 'More',
    links: [],
  },
]

const Sidebar: React.FC = () => {
  const location = useLocation()
  
  // Find which section contains the current path
  const getCurrentSection = () => {
    for (const section of sections) {
      if (section.links.some(link => link.path === location.pathname)) {
        return section.header
      }
    }
    return 'Main' // Default to Main section
  }
  
  const currentSection = getCurrentSection()
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({ 
    [currentSection]: true 
  })

  const handleToggle = (header: string) => {
    setOpenSections((prev) => ({ ...prev, [header]: !prev[header] }))
  }

  return (
    <aside className="w-64 min-h-screen bg-white">
      <div className="flex flex-col h-full">       
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-2">
            {sections.map((section) => (
              <div key={section.header}>
                <button
                  className="flex items-center w-full text-left text-base font-bold text-gray-900 py-2 focus:outline-none"
                  onClick={() => handleToggle(section.header)}
                >
                  {section.header}
                  {section.links.length > 0 && (
                    <span className="ml-2 text-xs">{openSections[section.header] ? '▾' : '▸'}</span>
                  )}
                </button>
                {section.links.length > 0 && openSections[section.header] && (
                  <div className="pl-4 space-y-1">
                    {section.links.map((item) => (
              <Link
                        key={item.path}
                to={item.path}
                        className={`block py-1 text-sm font-normal rounded transition-all duration-200 ${
                  location.pathname === item.path
                            ? 'text-blue-700 font-semibold'
                            : 'text-gray-700 hover:text-blue-800'
                }`}
              >
                {item.label}
              </Link>
                    ))}
                  </div>
                )}
            </div>
          ))}
          </div>
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar 
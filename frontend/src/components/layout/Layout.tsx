import React from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import { isAuthenticated } from '@/utils/auth'
import { useLocation } from 'react-router-dom'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const authenticated = isAuthenticated()
  const location = useLocation()
  const showSidebar = authenticated && location.pathname !== '/'

  return (
    <div className="flex grow flex-col">
      {/* Header */}
      <Header />
      {/* Content with Sidebar for authenticated users except on Home page */}
      <div className="flex grow pt-20">
        {showSidebar && <Sidebar />}
        <main className="grow" id="content" role="content">
          {/* Container */}
          <div className="kt-container-fixed" id="contentContainer">
            {children}
          </div>
          {/* End of Container */}
        </main>
      </div>
    </div>
  )
}

export default Layout 
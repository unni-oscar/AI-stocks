import React from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'
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
    <div className="flex grow flex-col bg-white">
      {/* Header */}
      <Header />
      {/* Content with Sidebar for authenticated users except on Home page */}
      <div className="flex grow pt-20">
        <div className="kt-container-fixed flex w-full">
          {showSidebar && <Sidebar />}
          <main className="grow" id="content" role="content">
          {children}
        </main>
      </div>
      </div>
      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Layout 
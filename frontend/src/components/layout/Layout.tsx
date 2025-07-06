import React from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import { isAuthenticated } from '@/utils/auth'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const authenticated = isAuthenticated()

  return (
    <div className="flex grow flex-col">
      {/* Header */}
      <Header />
      
      {/* Content */}
      <main className="grow" id="content" role="content">
        {/* Container */}
        <div className="kt-container-fixed" id="contentContainer">
          {children}
        </div>
        {/* End of Container */}
        </main>
    </div>
  )
}

export default Layout 
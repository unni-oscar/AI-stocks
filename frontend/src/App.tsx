import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from '@/components/layout/Layout'
import HomePage from '@/pages/HomePage'
import DashboardPage from '@/pages/DashboardPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import BhavcopyFetcherPage from '@/pages/BhavcopyFetcherPage'
import CsvProcessorPage from '@/pages/CsvProcessorPage'
import AllStocksPage from '@/pages/AllStocksPage'
import StockDetailPage from '@/pages/StockDetailPage'
import WatchlistPage from '@/pages/WatchlistPage'
import DeliverySpikesPage from '@/pages/DeliverySpikesPage'
import StockMasterPage from '@/pages/StockMasterPage'
import DummyPage from '@/pages/DummyPage'
import { isAuthenticated } from '@/utils/auth'
import './index.css'

function RequireAuth({ children }: { children: JSX.Element }) {
  const location = useLocation()
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}

function App() {
  const authed = isAuthenticated()
  console.log('Authentication status:', authed)
  console.log('Token in localStorage:', localStorage.getItem('auth_token'))
  
  return (
    <div className="antialiased flex h-full text-base text-foreground bg-background [--header-height-default:95px] data-kt-[sticky-header=on]:[--header-height:60px] [--header-height:var(--header-height-default)] [--header-height-mobile:70px]">
      <Toaster position="top-right" />
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {authed ? <>
          <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
          <Route path="/bhavcopy" element={<RequireAuth><BhavcopyFetcherPage /></RequireAuth>} />
          <Route path="/process" element={<RequireAuth><CsvProcessorPage /></RequireAuth>} />
            <Route path="/stocks/:symbol" element={
              <RequireAuth>
                <div>
                  <div style={{background: 'red', color: 'white', padding: '10px'}}>
                    ROUTE MATCHED - StockDetailPage should render here
                  </div>
                  <StockDetailPage />
                </div>
              </RequireAuth>
            } />
          <Route path="/stocks" element={<RequireAuth><AllStocksPage /></RequireAuth>} />
            <Route path="/stock-master" element={<RequireAuth><StockMasterPage /></RequireAuth>} />
          <Route path="/watchlist" element={<RequireAuth><WatchlistPage /></RequireAuth>} />
          <Route path="/delivery-spikes" element={<RequireAuth><DeliverySpikesPage /></RequireAuth>} />
          <Route path="/dummy" element={<DummyPage />} />
        </> : <Route path="*" element={<Navigate to="/" replace />} />}
      </Routes>
    </Layout>
    </div>
  )
}

export default App 
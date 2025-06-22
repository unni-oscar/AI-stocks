import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { removeToken } from '@/utils/auth'

interface ApiResponse {
  status: string
  message: string
  data: {
    framework: string
    version: string
    database: string
    port: string
    timestamp: string
  }
}

const DashboardPage: React.FC = () => {
  const [apiData, setApiData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchApiData = async () => {
      try {
        setLoading(true)
        // Use direct backend URL since we removed the proxy
        const response = await fetch('http://localhost:3034/api/test', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setApiData(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
        console.error('API Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchApiData()
  }, [])

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Real-time market overview and key statistics
          </p>
        </div>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          onClick={() => {
            removeToken()
            navigate('/login')
          }}
        >
          Logout
        </button>
      </div>

      {/* API Communication Status */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Backend API Status</h2>
        {loading && (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Connecting to backend...</span>
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-600 text-xl mr-2">❌</span>
              <div>
                <p className="font-medium text-red-800">API Connection Failed</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {apiData && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-green-600 text-xl mr-2">✅</span>
              <div>
                <p className="font-medium text-green-800">Backend Connected Successfully!</p>
                <div className="mt-2 text-sm text-green-700">
                  <p><strong>Message:</strong> {apiData.message}</p>
                  <p><strong>Framework:</strong> {apiData.data.framework} {apiData.data.version}</p>
                  <p><strong>Database:</strong> {apiData.data.database}</p>
                  <p><strong>Port:</strong> {apiData.data.port}</p>
                  <p><strong>Timestamp:</strong> {new Date(apiData.data.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-2xl">📈</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">NIFTY 50</p>
              <p className="text-2xl font-bold text-gray-900">19,425.35</p>
              <p className="text-sm text-green-600">+1.25%</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">SENSEX</p>
              <p className="text-2xl font-bold text-gray-900">64,363.78</p>
              <p className="text-sm text-green-600">+0.98%</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-purple-600 text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Market Cap</p>
              <p className="text-2xl font-bold text-gray-900">₹3.2T</p>
              <p className="text-sm text-green-600">+2.1%</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-orange-600 text-2xl">📋</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Volume</p>
              <p className="text-2xl font-bold text-gray-900">2.8B</p>
              <p className="text-sm text-red-600">-0.5%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Top Gainers</h2>
          <div className="space-y-3">
            {[
              { name: 'RELIANCE', price: '₹2,450.00', change: '+3.2%' },
              { name: 'TCS', price: '₹3,680.50', change: '+2.8%' },
              { name: 'HDFC BANK', price: '₹1,650.25', change: '+2.1%' },
              { name: 'INFOSYS', price: '₹1,480.75', change: '+1.9%' },
            ].map((stock, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{stock.name}</p>
                  <p className="text-sm text-gray-600">{stock.price}</p>
                </div>
                <span className="text-green-600 font-semibold">{stock.change}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Top Losers</h2>
          <div className="space-y-3">
            {[
              { name: 'WIPRO', price: '₹420.30', change: '-2.8%' },
              { name: 'TECH MAHINDRA', price: '₹1,180.45', change: '-2.1%' },
              { name: 'BHARTI AIRTEL', price: '₹890.20', change: '-1.7%' },
              { name: 'ITC', price: '₹450.80', change: '-1.3%' },
            ].map((stock, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{stock.name}</p>
                  <p className="text-sm text-gray-600">{stock.price}</p>
                </div>
                <span className="text-red-600 font-semibold">{stock.change}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Market Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">NIFTY 50 breaks 19,400 level</p>
              <p className="text-sm text-gray-600">Strong buying in banking and IT stocks</p>
            </div>
            <span className="text-sm text-gray-500">2 hours ago</span>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">RELIANCE announces Q3 results</p>
              <p className="text-sm text-gray-600">Net profit up 15% year-on-year</p>
            </div>
            <span className="text-sm text-gray-500">4 hours ago</span>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">RBI policy meeting scheduled</p>
              <p className="text-sm text-gray-600">Market expects status quo on interest rates</p>
            </div>
            <span className="text-sm text-gray-500">6 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage 
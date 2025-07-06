import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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

interface DeliveryAnalysis {
  symbol: string
  series: string
  latest_close: number
  latest_volume: string
  delivery_percentages: {
    latest: number
    avg_3_days: number
    avg_7_days: number
    avg_30_days: number
    avg_180_days: number
  }
  condition_met: number
  condition_type: string
  is_green: boolean
}

interface AnalysisResponse {
  status: string
  data: {
    stocks: DeliveryAnalysis[]
    total_stocks: number
    latest_date: string
    analysis_date: string
  }
}

const DashboardPage: React.FC = () => {
  const [apiData, setApiData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deliveryAnalysis, setDeliveryAnalysis] = useState<AnalysisResponse | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchApiData = async () => {
      try {
        setLoading(true)
        // Use direct backend URL since we removed the proxy
        const response = await fetch('/api/test', {
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

  useEffect(() => {
    const fetchDeliveryAnalysis = async () => {
      try {
        setAnalysisLoading(true)
        setAnalysisError(null)
        
        const token = localStorage.getItem('auth_token')
        const response = await fetch('/api/analysis/delivery', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setDeliveryAnalysis(data)
        } else {
          const errorData = await response.json()
          setAnalysisError(errorData.message || 'Failed to fetch delivery analysis')
        }
      } catch (err) {
        setAnalysisError('Network error occurred')
        console.error('Delivery Analysis Error:', err)
      } finally {
        setAnalysisLoading(false)
      }
    }

    fetchDeliveryAnalysis()
  }, [])

  const getConditionColor = (conditionMet: number) => {
    switch (conditionMet) {
      case 1:
        return 'bg-green-100 text-green-800 border-green-200'
      case 2:
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 3:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 4:
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getConditionBadge = (conditionMet: number) => {
    switch (conditionMet) {
      case 1:
        return '🔥 Best'
      case 2:
        return '⭐ Strong'
      case 3:
        return '📈 Good'
      case 4:
        return '✅ Positive'
      default:
        return '❓ Unknown'
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Real-time market overview and delivery percentage analysis
          </p>
        </div>
        <div className="flex space-x-4">
          <Link
            to="/bhavcopy"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            NSE Data Fetcher
          </Link>
          <Link
            to="/process"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            CSV Processor
          </Link>
          <Link
            to="/stocks"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            All Stocks
          </Link>
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

      {/* Quick Access Tools */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Access Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/bhavcopy"
            className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="p-2 bg-blue-100 rounded-lg mr-4">
              <span className="text-blue-600 text-2xl">📥</span>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">NSE Data Fetcher</h3>
              <p className="text-sm text-blue-700">Download NSE bhavcopy CSV files</p>
            </div>
          </Link>
          
          <Link
            to="/process"
            className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <div className="p-2 bg-green-100 rounded-lg mr-4">
              <span className="text-green-600 text-2xl">⚙️</span>
            </div>
            <div>
              <h3 className="font-semibold text-green-900">CSV Processor</h3>
              <p className="text-sm text-green-700">Process CSV files into database</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Delivery Percentage Analysis */}
      <div className="card mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Delivery Percentage Analysis</h2>
          {deliveryAnalysis && (
            <div className="text-sm text-gray-600">
              Latest: {deliveryAnalysis.data.latest_date} | 
              Found: {deliveryAnalysis.data.total_stocks} stocks
            </div>
          )}
        </div>

        {analysisLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Analyzing delivery data...</span>
          </div>
        )}

        {analysisError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-600 text-xl mr-2">❌</span>
              <div>
                <p className="font-medium text-red-800">Analysis Failed</p>
                <p className="text-sm text-red-600">{analysisError}</p>
              </div>
            </div>
          </div>
        )}

        {deliveryAnalysis && deliveryAnalysis.data.stocks.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volume
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Latest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    3 Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    7 Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    30 Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    180 Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condition
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deliveryAnalysis.data.stocks.map((stock, index) => (
                  <tr key={index} className={stock.is_green ? 'bg-green-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{stock.symbol}</div>
                      <div className="text-sm text-gray-500">{stock.series}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{stock.latest_close}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stock.latest_volume}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${stock.delivery_percentages.latest > 50 ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.delivery_percentages.latest}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${stock.delivery_percentages.avg_3_days > 50 ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.delivery_percentages.avg_3_days}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${stock.delivery_percentages.avg_7_days > 50 ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.delivery_percentages.avg_7_days}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${stock.delivery_percentages.avg_30_days > 50 ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.delivery_percentages.avg_30_days}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${stock.delivery_percentages.avg_180_days > 50 ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.delivery_percentages.avg_180_days}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getConditionColor(stock.condition_met)}`}>
                        {getConditionBadge(stock.condition_met)}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {stock.condition_type}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {deliveryAnalysis && deliveryAnalysis.data.stocks.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No stocks found matching the delivery percentage conditions.</p>
            <p className="text-sm text-gray-400 mt-2">Try processing more data or check if data exists in the database.</p>
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
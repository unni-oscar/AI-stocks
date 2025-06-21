import React from 'react'

const DashboardPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Real-time market overview and key statistics
        </p>
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
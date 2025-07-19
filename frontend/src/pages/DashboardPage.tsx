import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { removeToken } from '@/utils/auth'

const tabList = [
  { key: 'gainers', label: 'Top Gainers', link: '/top-gainers', api: '/analysis/top-gainers', icon: '📈' },
  { key: 'losers', label: 'Top Losers', link: '/top-losers', api: '/analysis/top-losers', icon: '📉' },
  { key: 'active', label: 'Most Active', link: '/most-active', api: '/analysis/most-active', icon: '🔥' },
  { key: 'high', label: '52 Week High', link: '/top-gainers', api: '/analysis/52-week-high', icon: '🏆' },
  { key: 'low', label: '52 Week Low', link: '/52-week-low', api: '/analysis/52-week-low', icon: '📊' },
  { key: 'highest_deliv', label: 'Highest Delivery %', link: '/highest-deliv-per', api: '/analysis/highest-deliv-per', icon: '🚚' },
];

const API_BASE_URL = 'http://localhost:3035/api';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('gainers');
  const [tabData, setTabData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTabData = async () => {
      setLoading(true);
      setError(null);
      setTabData([]);
      const tab = tabList.find(t => t.key === activeTab);
      if (!tab) return;
      try {
        const response = await fetch(`${API_BASE_URL}${tab.api}`);
        if (!response.ok) {
          setError('Failed to fetch data');
          setTabData([]);
          setLoading(false);
          return;
        }
        const result = await response.json();
        // All endpoints return { status, data: { stocks: [...] } }
        setTabData(result.data?.stocks || []);
      } catch (err) {
        setError('Network error');
        setTabData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTabData();
  }, [activeTab]);

  const showData = tabData.slice(0, 5);
  const moreLink = tabList.find(tab => tab.key === activeTab)?.link || '#';

  // Table header/cell classes from /watchlist
  const getSortableHeaderClass = (field: string) => {
    let widthClass = '';
    let alignmentClass = '';
    switch (field) {
      case 'company_name':
        widthClass = 'w-1/2';
        alignmentClass = 'text-left';
        break;
      case 'current_price':
      case 'price_change_percent':
      case 'price_change_absolute':
        widthClass = 'w-1/6';
        alignmentClass = 'text-right';
        break;
      default:
        widthClass = 'w-1/6';
        alignmentClass = 'text-right';
    }
    return `px-4 py-3 ${alignmentClass} ${widthClass}`;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mt-4 mb-6">
        <h1 className="text-3xl text-gray-900">Dashboard</h1>
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
      

      {/* Tab Content */}
      <div className="card mb-8">
        {/* Tab Bar */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabList.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <span className="mr-2 text-lg align-middle">{tab.icon}</span>{tab.label}
            </button>
          ))}
        </nav>
      </div>
        {/* <h2 className="text-xl font-semibold mb-4">{tabList.find(tab => tab.key === activeTab)?.label}</h2> */}
        <div className="overflow-x-auto rounded border">
          <table className="min-w-full bg-white" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr className="text-left text-xs text-gray-500">
                <th className={getSortableHeaderClass('company_name')}>Name</th>
                <th className={getSortableHeaderClass('current_price')}>Current Price</th>
                <th className={getSortableHeaderClass('price_change_percent')}>Change %</th>
                <th className={getSortableHeaderClass('price_change_absolute')}>Change ₹</th>
                {activeTab === 'highest_deliv' && (
                  <th className={getSortableHeaderClass('delivery_percent')}>Delivery %</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-red-500">{error}</td></tr>
              ) : showData.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No data found.</td></tr>
              ) : (
                showData.map((item, idx) => (
                  <tr key={item.symbol + '-' + idx} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-left">
                      <div>
                        <a
                          href={`/stocks/${encodeURIComponent(item.symbol || '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-900 hover:text-gray-700"
                        >
                          {item.company_name || 'Unknown Company'}
                        </a>
                        {/* <div className="text-xs text-gray-500 mt-1">
                          {item.symbol || 'Unknown Symbol'}
                        </div> */}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      ₹{Number(item.current_price ?? item.latest_close ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        Number(item.price_change_percent ?? item.change_percent ?? 0) >= 0
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {Number(item.price_change_percent ?? item.change_percent ?? 0) >= 0 ? '+' : ''}{Number(item.price_change_percent ?? item.change_percent ?? 0).toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={Number(item.price_change_absolute ?? item.change_absolute ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {Number(item.price_change_absolute ?? item.change_absolute ?? 0) >= 0 ? '+' : ''}₹{Number(item.price_change_absolute ?? item.change_absolute ?? 0).toFixed(2)}
                      </span>
                    </td>
                    {activeTab === 'highest_deliv' && (
                      <td className="px-4 py-3 text-right">
                        <span className="inline-block px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                          {Number(item.delivery_percent ?? 0).toFixed(2)}%
                        </span>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {tabData.length > 5 && !loading && !error && (
          <div className="flex justify-end mt-2">
            <Link to={moreLink} className="text-blue-600 hover:underline font-medium cursor-pointer">show more...</Link>
          </div>
        )}
      </div>

      {/* ...rest of the dashboard (recent market activity, etc.) ... */}
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
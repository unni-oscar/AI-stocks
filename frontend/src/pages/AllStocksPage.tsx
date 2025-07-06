import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { handleUnauthorized } from '@/utils/auth'

interface EqStock {
  symbol: string
  series: string
  trade_date: string
  close_price: number
  open_price: number
  high_price: number
  low_price: number
  total_traded_qty: number
  deliv_per: number
  turnover_lacs: number
  price_movement_pct: number | null
  avg_180_days_deliv: number | null
  avg_30_days_deliv: number | null
  avg_7_days_deliv: number | null
  avg_3_days_deliv: number | null
}

interface EqStocksResponse {
  status: string
  data: {
    stocks: EqStock[]
    pagination: {
      current_page: number
      last_page: number
      per_page: number
      total: number
      from: number
      to: number
    }
  }
}

// Helper to determine which delivery condition is met
function getConditionMet(stock: EqStock) {
  const d1 = Number(stock.deliv_per)
  const d3 = Number(stock.avg_3_days_deliv)
  const d7 = Number(stock.avg_7_days_deliv)
  const d30 = Number(stock.avg_30_days_deliv)
  const d180 = Number(stock.avg_180_days_deliv)
  
  // Check for perfect sequence (Best)
  if (d1 >= d3 && d3 >= d7 && d7 >= d30 && d30 >= d180) return 1
  
  // Count how many conditions are green
  let greenCount = 0
  if (d30 >= d180) greenCount++ // 30d >= 180d
  if (d7 >= d30) greenCount++   // 7d >= 30d
  if (d3 >= d7) greenCount++    // 3d >= 7d
  if (d1 >= d3) greenCount++    // 1d >= 3d
  
  // If 3 or more conditions are green, it's Strong
  if (greenCount >= 3) return 2
  
  // Check for remaining conditions
  if (d7 >= d30 && d30 >= d180) return 3  // 7d >= 30d >= 180d
  if (d30 >= d180) return 4               // 30d >= 180d
  return 0
}

// Helper to count consecutive green columns from the left (up to 4, for 5 columns)
function countConsecutiveGreen(stock: EqStock) {
  let count = 0;
  // 1. 30d >= 180d
  if (Number(stock.avg_30_days_deliv) >= Number(stock.avg_180_days_deliv)) {
    count++;
  } else {
    return count;
  }
  // 2. 7d > 30d
  if (stock.avg_7_days_deliv !== null && stock.avg_30_days_deliv !== null && stock.avg_7_days_deliv > stock.avg_30_days_deliv) {
    count++;
  } else {
    return count;
  }
  // 3. 3d > 7d
  if (stock.avg_3_days_deliv !== null && stock.avg_7_days_deliv !== null && stock.avg_3_days_deliv > stock.avg_7_days_deliv) {
    count++;
  } else {
    return count;
  }
  // 4. 1d > 3d
  if (stock.deliv_per !== null && stock.avg_3_days_deliv !== null && Number(stock.deliv_per) > Number(stock.avg_3_days_deliv)) {
    count++;
  } else {
    return count;
  }
  return count;
}

// Helper to count total green columns (not just consecutive)
function countTotalGreen(stock: EqStock) {
  let count = 0;
  if (Number(stock.avg_30_days_deliv) >= Number(stock.avg_180_days_deliv)) count++;
  if (stock.avg_7_days_deliv !== null && stock.avg_30_days_deliv !== null && stock.avg_7_days_deliv > stock.avg_30_days_deliv) count++;
  if (stock.avg_3_days_deliv !== null && stock.avg_7_days_deliv !== null && stock.avg_3_days_deliv > stock.avg_7_days_deliv) count++;
  if (stock.deliv_per !== null && stock.avg_3_days_deliv !== null && Number(stock.deliv_per) > Number(stock.avg_3_days_deliv)) count++;
  return count;
}

// Helper to check if a column is the max so far (for highlighting)
function isMaxSoFar(stock: EqStock, idx: number) {
  const arr = [
    Number(stock.avg_180_days_deliv),
    Number(stock.avg_30_days_deliv),
    Number(stock.avg_7_days_deliv),
    Number(stock.avg_3_days_deliv),
    Number(stock.deliv_per)
  ];
  if (idx === 0) return true;
  for (let i = 0; i < idx; i++) {
    if (arr[idx] < arr[i]) return false;
  }
  return true;
}

// Helper to count green columns from left (for sorting)
function getGreenPattern(stock: EqStock) {
  const green30d = Number(stock.avg_30_days_deliv) >= Number(stock.avg_180_days_deliv);
  const green7d = stock.avg_7_days_deliv !== null && stock.avg_30_days_deliv !== null && Number(stock.avg_7_days_deliv) >= Number(stock.avg_30_days_deliv);
  const green3d = stock.avg_3_days_deliv !== null && stock.avg_7_days_deliv !== null && Number(stock.avg_3_days_deliv) >= Number(stock.avg_7_days_deliv);
  const green1d = stock.deliv_per !== null && stock.avg_3_days_deliv !== null && Number(stock.deliv_per) >= Number(stock.avg_3_days_deliv);
  // Return a pattern string for sorting, e.g. '1111', '1110', etc.
  return `${green30d ? '1' : '0'}${green7d ? '1' : '0'}${green3d ? '1' : '0'}${green1d ? '1' : '0'}`;
}

// Custom sort order for green pattern
const greenSortOrder = ['1111', '1110', '1100', '1000'];

// Add these helper functions (copied from DashboardPage)
function getConditionColor(conditionMet: number) {
  switch (conditionMet) {
    case 1:
      return 'bg-green-100 text-green-800 border-green-200';
    case 2:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 3:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 4:
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}
function getConditionBadge(conditionMet: number) {
  switch (conditionMet) {
    case 1:
      return '🔥 Best';
    case 2:
      return '⭐ Strong';
    case 3:
      return '📈 Good';
    case 4:
      return '✅ Positive';
    default:
      return '❓ Unknown';
  }
}

const AllStocksPage: React.FC = () => {
  const [eqStocks, setEqStocks] = useState<EqStocksResponse | null>(null)
  const [eqStocksLoading, setEqStocksLoading] = useState(false)
  const [eqStocksError, setEqStocksError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    const fetchEqStocks = async () => {
      try {
        setEqStocksLoading(true)
        setEqStocksError(null)
        const token = localStorage.getItem('auth_token')
        const params = new URLSearchParams({
          page: currentPage.toString(),
          per_page: '50'
        })
        if (searchTerm) {
          params.append('search', searchTerm)
        }
        if (selectedDate) {
          params.append('date', selectedDate)
        }
        const response = await fetch(`/api/bhavcopy/eq-stocks?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })
        if (response.status === 401) {
          handleUnauthorized()
          return
        }
        if (response.ok) {
          const data = await response.json()
          setEqStocks(data)
        } else {
          const errorData = await response.json()
          setEqStocksError(errorData.message || 'Failed to fetch EQ stocks')
        }
      } catch (err) {
        setEqStocksError('Network error occurred')
        console.error('EQ Stocks Error:', err)
      } finally {
        setEqStocksLoading(false)
      }
    }
    fetchEqStocks()
  }, [currentPage, searchTerm, selectedDate])

  // Fetch last available bhavcopy date on mount
  useEffect(() => {
    const fetchLastDate = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/bhavcopy/database-stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.data && data.data.date_range && data.data.date_range.end_date) {
            setSelectedDate(data.data.date_range.end_date);
          }
        }
      } catch (err) {
        // fallback: today
        setSelectedDate(new Date().toISOString().slice(0, 10));
      }
    };
    fetchLastDate();
  }, []);

  // Helper to get value for sorting
  function getSortValue(stock: EqStock, key: string) {
    switch (key) {
      case 'symbol': return stock.symbol;
      case 'price_movement_pct': return stock.price_movement_pct ?? -Infinity;
      case 'avg_180_days_deliv': return stock.avg_180_days_deliv ?? -Infinity;
      case 'avg_30_days_deliv': return stock.avg_30_days_deliv ?? -Infinity;
      case 'avg_7_days_deliv': return stock.avg_7_days_deliv ?? -Infinity;
      case 'avg_3_days_deliv': return stock.avg_3_days_deliv ?? -Infinity;
      case 'deliv_per': return stock.deliv_per ?? -Infinity;
      case 'turnover_lacs': return stock.turnover_lacs ?? -Infinity;
      default: return '';
    }
  }

  let sortedStocks = eqStocks?.data.stocks.map(stock => ({ ...stock })) || [];

  if (sortConfig) {
    sortedStocks.sort((a, b) => {
      const aValue = getSortValue(a, sortConfig.key);
      const bValue = getSortValue(b, sortConfig.key);
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  } else {
    // Default: custom green-pattern sorting
    sortedStocks.sort((a, b) => {
      const aPattern = getGreenPattern(a);
      const bPattern = getGreenPattern(b);
      const aIdx = greenSortOrder.indexOf(aPattern);
      const bIdx = greenSortOrder.indexOf(bPattern);
      if (aIdx !== bIdx) {
        if (aIdx === -1 && bIdx === -1) return 0;
        if (aIdx === -1) return 1;
        if (bIdx === -1) return -1;
        return aIdx - bIdx;
      }
      return Number(b.deliv_per) - Number(a.deliv_per);
    });
  }

  // Helper to handle sort click
  function handleSort(key: string) {
    setSortConfig(prev => {
      if (prev && prev.key === key) {
        // Toggle direction
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'desc' };
    });
  }

  // Helper to render sort arrow
  function renderSortArrow(key: string) {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  }

  return (
    <div>
      <div className="mt-4 mb-6">
        <h1 className="text-3xl text-gray-900">All EQ Stocks</h1>
        <p className="text-gray-500 text-base mt-1">Browse and analyze all available EQ stocks</p>
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Search stocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-sm"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <label htmlFor="date-picker" className="text-sm text-gray-700">Date:</label>
          <input
            id="date-picker"
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            style={{ minWidth: 0 }}
          />
        </div>
      </div>
      <div className="overflow-x-auto rounded border bg-white">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="text-left text-xs text-gray-500">
              <th className="px-4 py-3">Symbol</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">% (180d)</th>
              <th className="px-4 py-3 text-right">% (30d)</th>
              <th className="px-4 py-3 text-right">% (7d)</th>
              <th className="px-4 py-3 text-right">% (3d)</th>
              <th className="px-4 py-3 text-right">% (1d)</th>
              <th className="px-4 py-3 text-right">Turnover (Cr)</th>
              <th className="px-4 py-3">Strength</th>
            </tr>
          </thead>
          <tbody>
            {eqStocksLoading ? (
              <tr><td colSpan={9} className="text-center py-6">Loading...</td></tr>
            ) : eqStocksError ? (
              <tr><td colSpan={9} className="text-center py-6 text-red-500">{eqStocksError}</td></tr>
            ) : eqStocks && eqStocks.data.stocks.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-6">No data</td></tr>
            ) : (
              sortedStocks.map((stock, index) => {
                const conditionMet = getConditionMet(stock);
                return (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-gray-900 text-sm">
                          <a
                            href={`/stocks/${encodeURIComponent(stock.symbol)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {stock.symbol}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {stock.price_movement_pct !== null ? `${Number(stock.price_movement_pct).toFixed(2)}` : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{stock.avg_180_days_deliv !== null ? `${Number(stock.avg_180_days_deliv).toFixed(2)}` : 'N/A'}</td>
                    <td className={`px-4 py-3 text-sm text-right ${Number(stock.avg_30_days_deliv) >= Number(stock.avg_180_days_deliv) ? 'bg-green-100 text-gray-900' : 'text-gray-900'}`}>{stock.avg_30_days_deliv !== null ? `${Number(stock.avg_30_days_deliv).toFixed(2)}` : 'N/A'}</td>
                    <td className={`px-4 py-3 text-sm text-right ${stock.avg_7_days_deliv !== null && stock.avg_30_days_deliv !== null && Number(stock.avg_7_days_deliv) >= Number(stock.avg_30_days_deliv) ? 'bg-green-100 text-gray-900' : 'text-gray-900'}`}>{stock.avg_7_days_deliv !== null ? `${Number(stock.avg_7_days_deliv).toFixed(2)}` : 'N/A'}</td>
                    <td className={`px-4 py-3 text-sm text-right ${stock.avg_3_days_deliv !== null && stock.avg_7_days_deliv !== null && Number(stock.avg_3_days_deliv) >= Number(stock.avg_7_days_deliv) ? 'bg-green-100 text-gray-900' : 'text-gray-900'}`}>{stock.avg_3_days_deliv !== null ? `${Number(stock.avg_3_days_deliv).toFixed(2)}` : 'N/A'}</td>
                    <td className={`px-4 py-3 text-sm text-right ${stock.deliv_per !== null && stock.avg_3_days_deliv !== null && Number(stock.deliv_per) >= Number(stock.avg_3_days_deliv) ? 'bg-green-100 text-gray-900' : 'text-gray-900'}`}><span>{stock.deliv_per !== null ? `${Number(stock.deliv_per).toFixed(2)}` : 'N/A'}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {stock.turnover_lacs !== null ? Number(stock.turnover_lacs).toFixed(2) : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getConditionColor(conditionMet)}`}>{getConditionBadge(conditionMet)}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AllStocksPage;
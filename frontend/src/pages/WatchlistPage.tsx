import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleUnauthorized } from '@/utils/auth'
import { FaTrash } from 'react-icons/fa';

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

function getConditionMet(stock: EqStock) {
  const d1 = Number(stock.deliv_per)
  const d3 = Number(stock.avg_3_days_deliv)
  const d7 = Number(stock.avg_7_days_deliv)
  const d30 = Number(stock.avg_30_days_deliv)
  const d180 = Number(stock.avg_180_days_deliv)
  if (d1 >= d3 && d3 >= d7 && d7 >= d30 && d30 >= d180) return 1
  let greenCount = 0
  if (d30 >= d180) greenCount++
  if (d7 >= d30) greenCount++
  if (d3 >= d7) greenCount++
  if (d1 >= d3) greenCount++
  if (greenCount >= 3) return 2
  if (d7 >= d30 && d30 >= d180) return 3
  if (d30 >= d180) return 4
  return 0
}
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

const WatchlistPage: React.FC = () => {
  const [eqStocks, setEqStocks] = useState<EqStocksResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      handleUnauthorized();
      return;
    }
    async function fetchWatchlistStocks() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/bhavcopy/eq-stocks?watchlist=1', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
        if (response.status === 401) {
          handleUnauthorized()
          return
        }
        const data = await response.json();
        if (response.ok && data.status === 'success') {
          setEqStocks(data);
        } else {
          setError(data.message || 'Failed to fetch watchlist stocks');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    }
    fetchWatchlistStocks();
  }, []);

  async function handleRemove(symbol: string) {
    setRemoving(symbol);
    setRemoveError(null);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/watchlist/${encodeURIComponent(symbol)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (response.status === 401) {
        handleUnauthorized()
        return
      }
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        // Remove from table
        setEqStocks(prev => prev ? {
          ...prev,
          data: {
            ...prev.data,
            stocks: prev.data.stocks.filter(s => s.symbol !== symbol)
          }
        } : prev);
      } else {
        setRemoveError(data.message || 'Failed to remove from watchlist');
      }
    } catch (err) {
      setRemoveError('Network error');
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Watchlist</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
      {loading && <div>Loading watchlist...</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {removeError && <div className="text-red-600 mb-2">{removeError}</div>}
      {!loading && eqStocks && eqStocks.data.stocks.length === 0 && (
        <div className="text-gray-500">Your watchlist is empty.</div>
      )}
      {!loading && eqStocks && eqStocks.data.stocks.length > 0 && (
        <div className="card p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th rowSpan={2} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                <th rowSpan={2} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Close Price</th>
                <th colSpan={5} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Average Delivery Percentage</th>
                <th rowSpan={2} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Turnover (Cr)</th>
                <th rowSpan={2} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Strength</th>
                <th rowSpan={2} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Remove</th>
              </tr>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">180 days</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">30 days</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">7 days</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">3 days</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">1 day</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {eqStocks.data.stocks.map((stock, index) => {
                const conditionMet = getConditionMet(stock);
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={`/stocks/${encodeURIComponent(stock.symbol)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:underline font-medium"
                      >
                        {stock.symbol}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700 font-semibold text-right">
                      {stock.close_price !== null && stock.close_price !== undefined ? Number(stock.close_price).toFixed(2) : 'N/A'}
                    </td>
                    <td className={"px-6 py-4 whitespace-nowrap text-sm text-gray-900"}>{stock.avg_180_days_deliv !== null ? `${Number(stock.avg_180_days_deliv).toFixed(2)}%` : 'N/A'}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      Number(stock.avg_30_days_deliv) >= Number(stock.avg_180_days_deliv) ? 'bg-green-100 text-gray-900 font-bold' : 'text-gray-900'
                    }`}>{stock.avg_30_days_deliv !== null ? `${Number(stock.avg_30_days_deliv).toFixed(2)}%` : 'N/A'}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      stock.avg_7_days_deliv !== null && stock.avg_30_days_deliv !== null && Number(stock.avg_7_days_deliv) > Number(stock.avg_30_days_deliv) ? 'bg-green-100 text-gray-900 font-bold' : 'text-gray-900'
                    }`}>{stock.avg_7_days_deliv !== null ? `${Number(stock.avg_7_days_deliv).toFixed(2)}%` : 'N/A'}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      stock.avg_3_days_deliv !== null && stock.avg_7_days_deliv !== null && Number(stock.avg_3_days_deliv) > Number(stock.avg_7_days_deliv) ? 'bg-green-100 text-gray-900 font-bold' : 'text-gray-900'
                    }`}>{stock.avg_3_days_deliv !== null ? `${Number(stock.avg_3_days_deliv).toFixed(2)}%` : 'N/A'}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      stock.deliv_per !== null && stock.avg_3_days_deliv !== null && Number(stock.deliv_per) > Number(stock.avg_3_days_deliv) ? 'bg-green-100 text-gray-900 font-bold' : 'text-gray-900'
                    }`}>{stock.deliv_per !== null ? `${Number(stock.deliv_per).toFixed(2)}%` : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{stock.turnover_lacs !== null && stock.turnover_lacs !== undefined ? Number(stock.turnover_lacs / 100).toFixed(2) : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-center">{getConditionBadge(getConditionMet(stock))}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        className="text-red-600 hover:text-red-800 p-2 rounded-full border border-transparent hover:border-red-200 transition disabled:opacity-50"
                        onClick={() => handleRemove(stock.symbol)}
                        disabled={removing === stock.symbol}
                        title="Remove from Watchlist"
                      >
                        {removing === stock.symbol ? (
                          <span className="inline-block w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WatchlistPage; 
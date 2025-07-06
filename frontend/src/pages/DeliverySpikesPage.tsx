import React, { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';

interface StockDeliverySpikes {
  symbol: string;
  spikes_1w: number;
  spikes_1m: number;
  spikes_3m: number;
  spikes_6m: number;
}

type SortKey = 'spikes_1w' | 'spikes_1m' | 'spikes_3m' | 'spikes_6m' | 'symbol';

type SortDirection = 'asc' | 'desc';

const DeliverySpikesPage: React.FC = () => {
  const [stocks, setStocks] = useState<StockDeliverySpikes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const [sortKey, setSortKey] = useState<SortKey>('spikes_1w');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    fetchDeliverySpikes();
  }, []);

  const fetchDeliverySpikes = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/delivery-spikes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (response.status === 401) {
        window.location.href = '/login';
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch delivery spikes data');
      }
      const data = await response.json();
      if (data.status === 'success') {
        setStocks(data.data);
        setCurrentPage(1);
      } else {
        setError(data.message || 'Failed to fetch delivery spikes data');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  // Sorting logic
  const sortedStocks = [...stocks].sort((a, b) => {
    let valA = a[sortKey];
    let valB = b[sortKey];
    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else if (typeof valA === 'number' && typeof valB === 'number') {
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    }
    return 0;
  });

  const paginatedStocks = sortedStocks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection(key === 'symbol' ? 'asc' : 'desc'); // Default: symbol asc, numbers desc
    }
    setCurrentPage(1);
  };

  const sortArrow = (key: SortKey) => {
    if (sortKey !== key) return null;
    return sortDirection === 'asc' ? <span> ▲</span> : <span> ▼</span>;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
        <div className="text-lg text-gray-800 font-semibold">Loading delivery spikes data...</div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-4 pt-6 pb-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2 bg-gradient-to-r from-sky-500 to-gray-600 bg-clip-text text-transparent">
          Delivery Spikes
        </h1>
        <p className="text-gray-600">Stocks with the highest delivery percentage spikes in the last 1 week, 1 month, 3 months, and 6 months.</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Stocks Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <th
                className="px-4 py-2 text-left font-semibold text-gray-700 border-b border-gray-100 cursor-pointer select-none"
                onClick={() => handleSort('symbol')}
              >
                Stock{sortArrow('symbol')}
              </th>
              <th
                className="px-4 py-2 text-right font-semibold text-gray-700 border-b border-gray-100 cursor-pointer select-none"
                onClick={() => handleSort('spikes_1w')}
              >
                1 Week{sortArrow('spikes_1w')}
              </th>
              <th
                className="px-4 py-2 text-right font-semibold text-gray-700 border-b border-gray-100 cursor-pointer select-none"
                onClick={() => handleSort('spikes_1m')}
              >
                1 Month{sortArrow('spikes_1m')}
              </th>
              <th
                className="px-4 py-2 text-right font-semibold text-gray-700 border-b border-gray-100 cursor-pointer select-none"
                onClick={() => handleSort('spikes_3m')}
              >
                3 Months{sortArrow('spikes_3m')}
              </th>
              <th
                className="px-4 py-2 text-right font-semibold text-gray-700 border-b border-gray-100 cursor-pointer select-none"
                onClick={() => handleSort('spikes_6m')}
              >
                6 Months{sortArrow('spikes_6m')}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedStocks.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No stocks found with delivery spikes in the selected periods.
                </td>
              </tr>
            ) : (
              paginatedStocks.map((stock, index) => (
                <tr
                  key={stock.symbol}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => window.location.href = `/stock/${stock.symbol}`}
                >
                  <td className="px-4 py-2 font-semibold text-blue-700">{stock.symbol}</td>
                  <td className="px-4 py-2 text-right font-bold text-blue-600">{stock.spikes_1w}</td>
                  <td className="px-4 py-2 text-right font-bold text-indigo-600">{stock.spikes_1m}</td>
                  <td className="px-4 py-2 text-right font-bold text-green-600">{stock.spikes_3m}</td>
                  <td className="px-4 py-2 text-right font-bold text-gray-700">{stock.spikes_6m}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {stocks.length > itemsPerPage && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, stocks.length)} of {stocks.length} stocks
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, Math.ceil(stocks.length / itemsPerPage)) }, (_, i) => {
                let pageNum;
                const totalPages = Math.ceil(stocks.length / itemsPerPage);
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 text-sm border rounded-md ${
                      currentPage === pageNum
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === Math.ceil(stocks.length / itemsPerPage)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliverySpikesPage; 
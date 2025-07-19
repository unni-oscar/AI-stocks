import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { FaTrash } from 'react-icons/fa';

interface WatchlistItem {
  symbol: string;
  company_name: string;
  current_price: number;
  price_change_percent: number;
  price_change_absolute: number;
  trade_date: string;
}

type SortField = 'symbol' | 'company_name' | 'current_price' | 'price_change_percent' | 'price_change_absolute';
type SortOrder = 'asc' | 'desc';

const WatchlistPage: React.FC = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>('price_change_percent');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Inline handleUnauthorized function
  const handleUnauthorized = () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  };

  // Fetch watchlist data
  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          handleUnauthorized();
          return;
        }

        const response = await fetch('http://localhost:3035/api/watchlist', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            handleUnauthorized();
            return;
          }
          throw new Error('Failed to fetch watchlist');
        }

        const data = await response.json();
        console.log('Watchlist API response:', data);
        
        if (data.status === 'success') {
          setWatchlist(data.data || []);
          console.log('Watchlist data set:', data.data);
        } else {
          toast.error('Failed to fetch watchlist data');
        }
      } catch (error) {
        console.error('Error fetching watchlist:', error);
        toast.error('Error fetching watchlist data');
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, []);

  // Remove stock from watchlist
  const removeFromWatchlist = async (symbol: string, companyName: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(`http://localhost:3035/api/watchlist/${encodeURIComponent(symbol)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized();
          return;
        }
        throw new Error('Failed to remove from watchlist');
      }

      // Remove from local state
      setWatchlist(prev => prev.filter(item => item.symbol !== symbol));
      
      // Show toast with company name
      const displayName = companyName || symbol;
      toast.success(`${displayName} has been removed from watchlist`);
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      toast.error('Error removing from watchlist');
    }
  };

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = watchlist.filter(item =>
      (item.symbol?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.company_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      // Handle numeric values
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Handle string values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });

    return filtered;
  }, [watchlist, searchTerm, sortField, sortOrder]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredAndSortedData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Helper function to render sort indicator
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  // Helper function to get sortable header class
  const getSortableHeaderClass = (field: SortField) => {
    let widthClass = '';
    let alignmentClass = '';
    switch (field) {
      case 'symbol':
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
    
    const baseClass = `px-4 py-3 cursor-pointer hover:bg-gray-50 select-none ${alignmentClass} ${widthClass}`;
    const activeClass = sortField === field ? "bg-blue-50 text-blue-700" : "";
    return `${baseClass} ${activeClass}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading watchlist...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mt-4 mb-6">
        <h1 className="text-3xl text-gray-900">My Watchlist</h1>
        <p className="text-gray-500 text-base mt-1">
          Track your favorite stocks and their performance.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Search Stocks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-3 py-2 w-full md:w-64 text-sm"
        />
        <div className="flex-1" />
        {/* <div className="text-sm text-gray-500">
          {filteredAndSortedData.length} stock{filteredAndSortedData.length !== 1 ? 's' : ''} in watchlist
        </div> */}
      </div>
      
      <div className="overflow-x-auto rounded border">
        <table className="min-w-full bg-white" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr className="text-left text-xs text-gray-500">
              <th 
                className={getSortableHeaderClass('company_name')}
                onClick={() => handleSort('company_name')}
              >
                Name{renderSortIndicator('company_name')}
              </th>
              <th 
                className={getSortableHeaderClass('current_price')}
                onClick={() => handleSort('current_price')}
              >
                Current Price{renderSortIndicator('current_price')}
              </th>
              <th 
                className={getSortableHeaderClass('price_change_percent')}
                onClick={() => handleSort('price_change_percent')}
              >
                Change %{renderSortIndicator('price_change_percent')}
              </th>
              <th 
                className={getSortableHeaderClass('price_change_absolute')}
                onClick={() => handleSort('price_change_absolute')}
              >
                Change ₹{renderSortIndicator('price_change_absolute')}
              </th>
              <th className="px-4 py-3 text-center w-1/6">
                
              </th>
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  {searchTerm ? 'No stocks match your search' : 'No stocks in your watchlist'}
                </td>
              </tr>
            ) : (
              currentData.map((item, idx) => (
                <tr key={`${item.symbol}-${idx}`} className="border-t hover:bg-gray-50">
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
                      <div className="text-xs text-gray-500 mt-1">
                        {item.symbol || 'Unknown Symbol'}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    ₹{(item.current_price || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      (item.price_change_percent || 0) >= 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {(item.price_change_percent || 0) >= 0 ? '+' : ''}{(item.price_change_percent || 0).toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span className={(item.price_change_absolute || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {(item.price_change_absolute || 0) >= 0 ? '+' : ''}₹{(item.price_change_absolute || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => removeFromWatchlist(item.symbol, item.company_name)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
                      title="Remove from watchlist"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {filteredAndSortedData.length > 0 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            Rows per page
            <select 
              value={itemsPerPage} 
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="border rounded px-2 py-1"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span>
              {startIndex + 1}-{Math.min(endIndex, filteredAndSortedData.length)} of {filteredAndSortedData.length}
            </span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-gray-100 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &lt;
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-7 h-7 flex items-center justify-center rounded border text-sm ${
                      currentPage === page
                        ? 'border-blue-200 bg-blue-50 text-blue-700 font-semibold'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <>
                  {currentPage > 3 && <span className="px-2">...</span>}
                  {currentPage > 3 && (
                    <button
                      onClick={() => handlePageChange(currentPage)}
                      className="w-7 h-7 flex items-center justify-center rounded border border-blue-200 bg-blue-50 text-blue-700 font-semibold text-sm"
                    >
                      {currentPage}
                    </button>
                  )}
                  {currentPage < totalPages - 2 && <span className="px-2">...</span>}
                  {currentPage < totalPages - 2 && (
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-700 text-sm"
                    >
                      {totalPages}
                    </button>
                  )}
                </>
              )}
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-gray-100 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchlistPage; 
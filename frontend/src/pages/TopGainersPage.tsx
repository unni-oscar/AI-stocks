import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface TopGainer {
  symbol: string;
  series: string;
  company_name: string;
  current_price: number;
  previous_price: number;
  price_change_percent: number;
  price_change_absolute: number;
  current_deliv_per: number;
  previous_deliv_per: number;
  deliv_per_change: number;
}

interface ApiResponse {
  status: string;
  data: {
    stocks: TopGainer[];
    total_stocks: number;
    latest_date: string;
    previous_date: string;
    analysis_date: string;
  };
}

type SortField = 'symbol' | 'current_price' | 'price_change_percent' | 'price_change_absolute';
type SortOrder = 'asc' | 'desc';

const TopGainersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TopGainer[]>([]);
  const [latestDate, setLatestDate] = useState('');
  const [previousDate, setPreviousDate] = useState('');
  const [sortField, setSortField] = useState<SortField>('price_change_percent');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [dateAdjusted, setDateAdjusted] = useState<boolean>(false);

  // Fetch data from API
  useEffect(() => {
    const fetchTopGainers = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedDate) {
          params.append('date', selectedDate);
        }
        const response = await fetch(`/api/analysis/top-gainers?${params}`);
        const result: ApiResponse = await response.json();
        
        if (result.status === 'success') {
          setData(result.data.stocks);
          setLatestDate(result.data.latest_date);
          setPreviousDate(result.data.previous_date);
          setCurrentPage(1); // Reset to first page when new data loads
          
          // Check if the date was automatically adjusted
          const requestedDate = selectedDate || new Date().toISOString().slice(0, 10);
          setDateAdjusted(requestedDate !== result.data.latest_date);
        } else {
          toast.error('Failed to fetch top gainers data');
        }
      } catch (error) {
        console.error('Error fetching top gainers:', error);
        toast.error('Error fetching top gainers data');
      } finally {
        setLoading(false);
      }
    };

    fetchTopGainers();
  }, [selectedDate]);

  // Fetch last available date on mount
  useEffect(() => {
    // Set today's date as default
    const today = new Date().toISOString().slice(0, 10);
    setSelectedDate(today);
  }, []);

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
    let filtered = data.filter(stock =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.series.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Only apply frontend sorting if user has explicitly changed from default
    // Default should match backend sorting (price_change_percent desc)
    if (sortField !== 'price_change_percent' || sortOrder !== 'desc') {
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
    }

    return filtered;
  }, [data, searchTerm, sortField, sortOrder]);

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
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Helper function to render sort indicator
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  // Helper function to get sortable header class
  const getSortableHeaderClass = (field: SortField) => {
    let widthClass = '';
    switch (field) {
      case 'current_price':
        widthClass = 'w-1/6';
        break;
      case 'price_change_percent':
        widthClass = 'w-1/6';
        break;
      case 'price_change_absolute':
        widthClass = 'w-1/6';
        break;
      default:
        widthClass = 'w-1/6';
    }
    
    const baseClass = `px-4 py-3 cursor-pointer hover:bg-gray-50 select-none text-right ${widthClass}`;
    const activeClass = sortField === field ? "bg-blue-50 text-blue-700" : "";
    return `${baseClass} ${activeClass}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading top gainers...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mt-4 mb-6">
        <h1 className="text-3xl text-gray-900">Top Gainers</h1>
        <p className="text-gray-500 text-base mt-1">
          Stocks that have increased in price from {previousDate} to {latestDate}.
          {dateAdjusted && (
            <span className="text-blue-600 text-sm ml-2">
              (Showing last available trading day data)
            </span>
          )}
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
      
      <div className="overflow-x-auto rounded border">
        <table className="min-w-full bg-white" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr className="text-left text-xs text-gray-500">
              <th className="px-4 py-3 text-left w-1/2">
                Name
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
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              currentData.map((stock, idx) => (
                <tr key={`${stock.symbol}-${idx}`} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-left">
                    <div>
                      <a
                        href={`/stocks/${encodeURIComponent(stock.symbol)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 hover:text-gray-700"
                      >
                        {stock.company_name}
                      </a>
                      <div className="text-xs text-gray-500 mt-1">
                        {stock.symbol}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    ₹{stock.current_price}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-block px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                      +{stock.price_change_percent}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-green-600 text-right">
                    +₹{stock.price_change_absolute}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
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
    </div>
  );
};

export default TopGainersPage; 
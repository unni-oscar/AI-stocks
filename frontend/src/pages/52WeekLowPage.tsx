import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Stock52WeekLow {
  symbol: string;
  series: string;
  company_name: string;
  current_price: number;
  fifty_two_week_low: number;
  fifty_two_week_low_date: string;
  current_volume: string;
  current_deliv_per: number;
  change_percent: number;
  change_absolute: number;
}

interface ApiResponse {
  status: string;
  data: {
    stocks: Stock52WeekLow[];
    total_stocks: number;
    latest_date: string;
    fifty_two_weeks_ago: string;
    analysis_date: string;
  };
}

type SortField = 'symbol' | 'current_price' | 'current_volume' | 'change_percent' | 'change_absolute';
type SortOrder = 'asc' | 'desc';

const WeekLowPage: React.FC = () => {
  const [data, setData] = useState<Stock52WeekLow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('change_percent');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [latestDate, setLatestDate] = useState<string>('');
  const [fiftyTwoWeeksAgo, setFiftyTwoWeeksAgo] = useState<string>('');
  const [dateAdjusted, setDateAdjusted] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetch52WeekLow = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedDate) {
          params.append('date', selectedDate);
        }
        const response = await fetch(`/api/analysis/52-week-low?${params}`);
        const result: ApiResponse = await response.json();
        
        if (result.status === 'success') {
          setData(result.data.stocks);
          setLatestDate(result.data.latest_date);
          setFiftyTwoWeeksAgo(result.data.fifty_two_weeks_ago);
          setCurrentPage(1); // Reset to first page when new data loads

          // Set the date picker to the latest date from the database if not already set
          if (!selectedDate) {
            setSelectedDate(result.data.latest_date);
          }
          // Check if the date was automatically adjusted
          const requestedDate = selectedDate || new Date().toISOString().slice(0, 10);
          setDateAdjusted(requestedDate !== result.data.latest_date);
        } else {
          toast.error('Failed to fetch 52 week low data');
        }
      } catch (error) {
        console.error('Error fetching 52 week low:', error);
        toast.error('Error fetching 52 week low data');
      } finally {
        setLoading(false);
      }
    };

    fetch52WeekLow();
    // Only run on mount or when selectedDate changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

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
    // Default should match backend sorting (change_percent desc - biggest losers first)
    if (sortField !== 'change_percent' || sortOrder !== 'desc') {
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
      case 'current_volume':
        widthClass = 'w-1/6';
        break;
      case 'change_percent':
        widthClass = 'w-1/6';
        break;
      case 'change_absolute':
        widthClass = 'w-1/6';
        break;
      default:
        widthClass = 'w-1/6';
    }
    
    const baseClass = `px-4 py-3 cursor-pointer hover:bg-gray-50 select-none text-right ${widthClass}`;
    const activeClass = sortField === field ? "bg-red-50 text-red-700" : "";
    return `${baseClass} ${activeClass}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading 52 week low...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mt-4 mb-6">
        <h1 className="text-3xl text-gray-900">52 Week Low</h1>
        <p className="text-gray-500 text-base mt-1">
          Stocks with their 52-week low prices from {fiftyTwoWeeksAgo} to {latestDate}.
          {dateAdjusted && (
            <span className="text-red-600 text-sm ml-2">
              (Showing last available trading day data)
            </span>
          )}
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by company name or symbol..."
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
            className="border border-gray-300 rounded-lg px-2 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
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
                className={getSortableHeaderClass('change_percent')}
                onClick={() => handleSort('change_percent')}
              >
                Change %{renderSortIndicator('change_percent')}
              </th>
              <th 
                className={getSortableHeaderClass('change_absolute')}
                onClick={() => handleSort('change_absolute')}
              >
                Change ₹{renderSortIndicator('change_absolute')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              currentData.map((stock, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
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
                  <td className="px-4 py-3 text-right">
                    ₹{stock.current_price !== undefined && stock.current_price !== null && !isNaN(Number(stock.current_price))
                      ? Number(stock.current_price).toFixed(2)
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      Number(stock.change_percent) >= 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {stock.change_percent !== undefined && stock.change_percent !== null && !isNaN(Number(stock.change_percent))
                        ? `${Number(stock.change_percent) >= 0 ? '+' : ''}${Number(stock.change_percent).toFixed(2)}%`
                        : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={Number(stock.change_absolute) >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {stock.change_absolute !== undefined && stock.change_absolute !== null && !isNaN(Number(stock.change_absolute))
                        ? `₹${Number(stock.change_absolute) >= 0 ? '+' : ''}${Number(stock.change_absolute).toFixed(2)}`
                        : '-'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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

export default WeekLowPage; 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface DatabaseDates {
  [year: string]: {
    [month: number]: number[];
  };
}

interface FetchResult {
  success: string[];
  failed: Array<{ date: string; error: string }>;
  total_processed: number;
}

const BhavcopyPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [databaseDates, setDatabaseDates] = useState<DatabaseDates>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingMonths, setFetchingMonths] = useState<Set<number>>(new Set());
  const [fetchResults, setFetchResults] = useState<{ [month: number]: FetchResult }>({});

  // Generate years from current year to 20 years ago
  const years = Array.from({ length: 21 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    console.log('BhavcopyPage useEffect triggered, selectedYear:', selectedYear);
    loadDatabaseDates();
  }, [selectedYear]);

  const loadDatabaseDates = async () => {
    console.log('loadDatabaseDates called for year:', selectedYear);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/login');
        return;
      }

      console.log('Making API request to database-dates...');
      const response = await fetch(`/api/bhavcopy/database-dates?year=${selectedYear}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Database dates received:', data);
        console.log('Data type:', typeof data);
        console.log('Data keys:', Object.keys(data));
        if (data[selectedYear.toString()]) {
          console.log('Year data:', data[selectedYear.toString()]);
          console.log('Year data keys:', Object.keys(data[selectedYear.toString()]));
        }
        setDatabaseDates(data);
      } else if (response.status === 401) {
        console.log('Unauthorized, redirecting to login');
        navigate('/login');
      } else {
        console.log('API response not ok:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading database dates:', error);
    }
  };

  const fetchMonth = async (month: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      setFetchingMonths(prev => new Set(prev).add(month));

      const response = await fetch('/api/bhavcopy/fetch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year: selectedYear,
          month: month,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFetchResults(prev => ({
          ...prev,
          [month]: data.results
        }));
        
        // Reload database dates to show updated status
        await loadDatabaseDates();
      } else if (response.status === 401) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching month:', error);
    } finally {
      setFetchingMonths(prev => {
        const newSet = new Set(prev);
        newSet.delete(month);
        return newSet;
      });
    }
  };

  const isDateInDatabase = (month: number, day: number): boolean => {
    const yearStr = selectedYear.toString();
    const monthData = databaseDates[yearStr]?.[month];
    const result = Array.isArray(monthData) && monthData.includes(day);
    console.log(`Checking ${yearStr}-${month}-${day}:`, {
      yearStr,
      month,
      day,
      monthData,
      isArray: Array.isArray(monthData),
      result,
      allData: databaseDates
    });
    return result;
  };

  const getMonthName = (month: number): string => {
    const date = new Date(selectedYear, month - 1);
    return date.toLocaleString('default', { month: 'long' });
  };

  const getDaysInMonth = (month: number): number => {
    return new Date(selectedYear, month, 0).getDate();
  };

  const renderCalendar = (month: number) => {
    const daysInMonth = getDaysInMonth(month);
    const monthName = getMonthName(month);
    const isFetching = fetchingMonths.has(month);
    const monthResult = fetchResults[month];

    return (
      <div key={month} className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">{monthName} {selectedYear}</h3>
          <button
            onClick={() => fetchMonth(month)}
            disabled={isFetching}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              isFetching
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isFetching ? 'Fetching...' : 'Fetch Month'}
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
          
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const date = new Date(selectedYear, month - 1, day);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const isFuture = date > new Date();
            const isInDatabase = isDateInDatabase(month, day);
            
            return (
              <div
                key={day}
                className={`text-center py-2 text-sm border rounded ${
                  isWeekend || isFuture
                    ? 'bg-gray-100 text-gray-400'
                    : isInDatabase
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : 'bg-white text-gray-800 border-gray-200'
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Fetch Results */}
        {monthResult && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Fetch Results:</h4>
            <div className="text-sm space-y-1">
              <div className="text-green-600">
                ✅ Successfully processed: {monthResult.success.length} days
              </div>
              {monthResult.failed.length > 0 && (
                <div className="text-red-600">
                  ❌ Failed: {monthResult.failed.length} days
                </div>
              )}
              <div className="text-gray-600">
                Total processed: {monthResult.total_processed} days
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            NSE Bhavcopy Fetcher
          </h1>
          <p className="text-gray-600">
            Download and manage NSE bhavcopy data for analysis
          </p>
        </div>

        {/* Year Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <label htmlFor="year-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select Year
          </label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => renderCalendar(month))}
        </div>

        {/* Legend */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
              <span>Data Available in Database</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-white border border-gray-200 rounded mr-2"></div>
              <span>No Data Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-100 rounded mr-2"></div>
              <span>Weekend/Future Date</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BhavcopyPage; 
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { removeToken, handleUnauthorized } from '@/utils/auth'

interface ProcessedDates {
  [year: string]: {
    [month: string]: number[]
  }
}

interface FetchStatus {
  year: number
  month: number
  status: 'idle' | 'fetching' | 'success' | 'error'
  progress?: number
  message?: string
}

const BhavcopyFetcherPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [processedDates, setProcessedDates] = useState<ProcessedDates>({})
  const [fetchStatus, setFetchStatus] = useState<FetchStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [processingDay, setProcessingDay] = useState<{year: number, month: number, day: number} | null>(null)
  const navigate = useNavigate()

  // Generate years from current year to 20 years ago
  const years = Array.from({ length: 21 }, (_, i) => new Date().getFullYear() - i)

  // Get processed dates for selected year
  useEffect(() => {
    const fetchProcessedDates = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('auth_token')
        const response = await fetch(`/api/bhavcopy/processed-dates?year=${selectedYear}`, {
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
          setProcessedDates(data)
        } else {
          console.error('Failed to fetch processed dates')
        }
      } catch (error) {
        console.error('Error fetching processed dates:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProcessedDates()
  }, [selectedYear])

  const handleFetchMonth = async (year: number, month: number) => {
    try {
      setFetchStatus({ year, month, status: 'fetching', progress: 0 })
      
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/bhavcopy/fetch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ year, month })
      })

      if (response.status === 401) {
        handleUnauthorized()
        return
      }

      if (response.ok) {
        const responseData = await response.json()
        const { data } = responseData
        
        // Check if files were actually downloaded
        if (data.success_count > 0) {
          setFetchStatus({ 
            year, 
            month, 
            status: 'success', 
            progress: 100,
            message: `Downloaded ${data.success_count} files successfully`
          })
        } else if (data.error_count > 0) {
          // Check if errors are mostly non-trading days (expected for weekends/holidays)
          const isMostlyNonTradingDays = data.errors.every((error: string) => 
            error.includes('HTTP 404') || error.includes('non-trading day')
          )
          
          if (isMostlyNonTradingDays && data.error_count > 0) {
            setFetchStatus({ 
              year, 
              month, 
              status: 'success', 
              progress: 100,
              message: `Completed: ${data.success_count} files downloaded, ${data.error_count} non-trading days (weekends/holidays)`
            })
          } else {
            setFetchStatus({ 
              year, 
              month, 
              status: 'error', 
              message: `Failed to download ${data.error_count} files. ${data.errors.slice(0, 2).join(', ')}`
            })
          }
        } else {
          // No files downloaded, no errors - probably all files already exist
          setFetchStatus({ 
            year, 
            month, 
            status: 'success', 
            progress: 100,
            message: 'All files already exist'
          })
        }
        
        // Refresh processed dates
        const datesResponse = await fetch(`/api/bhavcopy/processed-dates?year=${year}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })
        if (datesResponse.status === 401) {
          handleUnauthorized()
          return
        }
        if (datesResponse.ok) {
          const data = await datesResponse.json()
          setProcessedDates(data)
        }
      } else {
        const errorData = await response.json()
        setFetchStatus({ 
          year, 
          month, 
          status: 'error', 
          message: errorData.message || 'Failed to fetch month data' 
        })
      }
    } catch (error) {
      setFetchStatus({ 
        year, 
        month, 
        status: 'error', 
        message: 'Network error occurred' 
      })
    }
  }

  const isDateProcessed = (year: number, month: number, day: number): boolean => {
    const yearStr = year.toString()
    const monthStr = month.toString()
    return processedDates[yearStr]?.[monthStr]?.includes(day) || false
  }

  const getMonthDays = (year: number, month: number): number[] => {
    const daysInMonth = new Date(year, month, 0).getDate()
    return Array.from({ length: daysInMonth }, (_, i) => i + 1)
  }

  const getMonthName = (month: number): string => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return months[month - 1]
  }

  const getStatusForMonth = (year: number, month: number): FetchStatus | null => {
    if (fetchStatus && fetchStatus.year === year && fetchStatus.month === month) {
      return fetchStatus
    }
    return null
  }

  // Add this function to handle CSV fetch/store and process (no browser download)
  const handleFetchDayCsv = async (year: number, month: number, day: number) => {
    setProcessingDay({ year, month, day })
    const token = localStorage.getItem('auth_token')
    const fetchUrl = `/api/bhavcopy/fetch-day`
    const processUrl = `/api/bhavcopy/process`
    try {
      // Step 1: Fetch/store the CSV file
      const fetchResponse = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ year, month, day })
      })
      if (fetchResponse.status === 401) {
        handleUnauthorized()
        setProcessingDay(null)
        return
      }
      const fetchData = await fetchResponse.json()
      if (!fetchResponse.ok || fetchData.status !== 'success') {
        setProcessingDay(null)
        return
      }
      // Step 2: Process the CSV into the database
      const processResponse = await fetch(processUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ year, month, day })
      })
      if (processResponse.status === 401) {
        handleUnauthorized()
        setProcessingDay(null)
        return
      }
      const processData = await processResponse.json()
      if (processResponse.ok && processData.status === 'success') {
        // Refresh processed dates
        const datesResponse = await fetch(`/api/bhavcopy/processed-dates?year=${year}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })
        if (datesResponse.ok) {
          const datesData = await datesResponse.json()
          setProcessedDates(datesData)
        }
      }
      setProcessingDay(null)
    } catch (err) {
      setProcessingDay(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">NSE Bhavcopy Fetcher</h1>
          <p className="text-gray-600">
            Download and manage NSE market data by year and month
          </p>
        </div>
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

      {/* Year Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Year
        </label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading processed dates...</span>
        </div>
      )}

      {/* Month Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
          const monthStatus = getStatusForMonth(selectedYear, month)
          const days = getMonthDays(selectedYear, month)
          const processedDays = days.filter(day => isDateProcessed(selectedYear, month, day))
          
          return (
            <div key={month} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {getMonthName(month)}
                </h3>
                <div className="text-sm text-gray-500">
                  {processedDays.length}/{days.length} days
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <div key={`header-${month}-${selectedYear}-${index}-${day}`} className="text-xs text-gray-500 text-center py-1">
                    {day}
                  </div>
                ))}
                {Array.from({ length: new Date(selectedYear, month - 1, 1).getDay() }, (_, i) => (
                  <div key={`empty-${month}-${selectedYear}-${i}`} className="py-1"></div>
                ))}
                {days.map(day => {
                  const isProcessed = isDateProcessed(selectedYear, month, day)
                  const today = new Date()
                  const isFuture =
                    selectedYear > today.getFullYear() ||
                    (selectedYear === today.getFullYear() && month > today.getMonth() + 1) ||
                    (selectedYear === today.getFullYear() && month === today.getMonth() + 1 && day > today.getDate())
                  return (
                  <div
                    key={`day-${month}-${selectedYear}-${day}`}
                      className={`text-xs text-center py-1 rounded cursor-pointer transition-all duration-200 ${
                        isFuture
                          ? 'text-gray-400 cursor-not-allowed'
                          : isProcessed
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                      onClick={() => {
                        if (!isFuture) {
                          handleFetchDayCsv(selectedYear, month, day)
                        }
                      }}
                      title={isFuture ? 'Future date' : isProcessed ? 'Download CSV' : 'Try to download CSV'}
                      style={{ pointerEvents: isFuture ? 'none' : 'auto' }}
                    >
                      {processingDay && processingDay.year === selectedYear && processingDay.month === month && processingDay.day === day ? (
                        <span className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        day
                      )}
                  </div>
                  )
                })}
              </div>

              {/* Fetch Button */}
              <button
                onClick={() => handleFetchMonth(selectedYear, month)}
                disabled={monthStatus?.status === 'fetching'}
                className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  monthStatus?.status === 'fetching'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : monthStatus?.status === 'success'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : monthStatus?.status === 'error'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {monthStatus?.status === 'fetching' ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Fetching...
                  </div>
                ) : monthStatus?.status === 'success' ? (
                  '✓ Completed'
                ) : monthStatus?.status === 'error' ? (
                  '✗ Error'
                ) : (
                  'Fetch Data'
                )}
              </button>

              {/* Error Message */}
              {monthStatus?.status === 'error' && monthStatus.message && (
                <div className="mt-2 text-xs text-red-600">
                  {monthStatus.message}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BhavcopyFetcherPage 
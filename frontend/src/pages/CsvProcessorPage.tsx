import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { removeToken, handleUnauthorized } from '@/utils/auth'

interface ProcessedDates {
  [year: string]: {
    [month: string]: number[]
  }
}

interface DatabaseDates {
  [year: string]: {
    [month: string]: number[]
  }
}

interface ProcessStatus {
  year: number
  month: number
  day?: number
  status: 'idle' | 'processing' | 'success' | 'error'
  progress?: number
  message?: string
}

interface DatabaseStats {
  total_records: number
  unique_symbols: number
  date_range: {
    start_date: string
    end_date: string
  }
  last_updated: string
}

const CsvProcessorPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [processedDates, setProcessedDates] = useState<ProcessedDates>({})
  const [databaseDates, setDatabaseDates] = useState<DatabaseDates>({})
  const [processStatus, setProcessStatus] = useState<ProcessStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(null)
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

  // Get database dates for selected year
  useEffect(() => {
    const fetchDatabaseDates = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch(`/api/bhavcopy/database-dates?year=${selectedYear}`, {
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
          setDatabaseDates(data)
        } else {
          console.error('Failed to fetch database dates')
        }
      } catch (error) {
        console.error('Error fetching database dates:', error)
      }
    }

    fetchDatabaseDates()
  }, [selectedYear])

  // Fetch database stats
  useEffect(() => {
    const fetchDatabaseStats = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch('/api/bhavcopy/database-stats', {
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
          setDatabaseStats(data.data)
        }
      } catch (error) {
        console.error('Error fetching database stats:', error)
      }
    }

    fetchDatabaseStats()
  }, [])

  const handleProcessDay = async (year: number, month: number, day: number) => {
    try {
      setProcessStatus({ year, month, day, status: 'processing', progress: 0 })
      
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/bhavcopy/process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ year, month, day })
      })

      if (response.status === 401) {
        handleUnauthorized()
        return
      }

      if (response.ok) {
        const responseData = await response.json()
        const { data } = responseData
        
        if (data.exit_code === 0) {
          setProcessStatus({ 
            year, 
            month, 
            day,
            status: 'success', 
            progress: 100,
            message: `Day ${day} processed successfully`
          })
          
          // Refresh processed dates and database stats
          await refreshData()
        } else {
          setProcessStatus({ 
            year, 
            month, 
            day,
            status: 'error', 
            message: `Processing failed: ${data.output}`
          })
        }
      } else {
        const errorData = await response.json()
        setProcessStatus({ 
          year, 
          month, 
          day,
          status: 'error', 
          message: errorData.message || 'Failed to process data' 
        })
      }
    } catch (error) {
      setProcessStatus({ 
        year, 
        month, 
        day,
        status: 'error', 
        message: 'Network error occurred' 
      })
    }
  }

  const handleProcessMonth = async (year: number, month: number) => {
    try {
      setProcessStatus({ year, month, status: 'processing', progress: 0 })
      
      const days = getMonthDays(year, month)
      const daysToProcess = days.filter(day => !isDateProcessed(year, month, day))
      
      if (daysToProcess.length === 0) {
        setProcessStatus({ 
          year, 
          month, 
          status: 'success', 
          progress: 100,
          message: 'All days already processed'
        })
        return
      }

      const token = localStorage.getItem('auth_token')
      
      for (let i = 0; i < daysToProcess.length; i++) {
        const day = daysToProcess[i]
        const progress = Math.round(((i + 1) / daysToProcess.length) * 100)
        
        setProcessStatus({ 
          year, 
          month, 
          day,
          status: 'processing', 
          progress,
          message: `Processing day ${day} (${i + 1}/${daysToProcess.length})`
        })

        const response = await fetch('/api/bhavcopy/process', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ year, month, day })
        })

        if (response.status === 401) {
          handleUnauthorized()
          return
        }

        if (response.ok) {
          const responseData = await response.json()
          const { data } = responseData
          
          if (data.exit_code === 0) {
            // Refresh processed dates after each successful day
            await refreshProcessedDates()
          } else {
            setProcessStatus({ 
              year, 
              month, 
              day,
              status: 'error', 
              message: `Failed to process day ${day}: ${data.output}`
            })
            return
          }
        } else {
          const errorData = await response.json()
          setProcessStatus({ 
            year, 
            month, 
            day,
            status: 'error', 
            message: `Failed to process day ${day}: ${errorData.message || 'Unknown error'}`
          })
          return
        }
      }

      // All days processed successfully
      setProcessStatus({ 
        year, 
        month, 
        status: 'success', 
        progress: 100,
        message: `All ${daysToProcess.length} days processed successfully`
      })
      
      // Refresh database stats
      await refreshDatabaseStats()
      
    } catch (error) {
      setProcessStatus({ 
        year, 
        month, 
        status: 'error', 
        message: 'Network error occurred' 
      })
    }
  }

  const refreshProcessedDates = async () => {
    try {
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
      }
    } catch (error) {
      console.error('Error refreshing processed dates:', error)
    }
  }

  const refreshDatabaseDates = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/bhavcopy/database-dates?year=${selectedYear}`, {
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
        setDatabaseDates(data)
      }
    } catch (error) {
      console.error('Error refreshing database dates:', error)
    }
  }

  const refreshDatabaseStats = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/bhavcopy/database-stats', {
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
        setDatabaseStats(data.data)
      }
    } catch (error) {
      console.error('Error refreshing database stats:', error)
    }
  }

  const refreshData = async () => {
    await Promise.all([refreshProcessedDates(), refreshDatabaseDates(), refreshDatabaseStats()])
  }

  const isDateProcessed = (year: number, month: number, day: number): boolean => {
    const yearStr = year.toString()
    const monthStr = month.toString()
    return processedDates[yearStr]?.[monthStr]?.includes(day) || false
  }

  const isDateInDatabase = (year: number, month: number, day: number): boolean => {
    const yearStr = year.toString()
    const monthStr = month.toString()
    return databaseDates[yearStr]?.[monthStr]?.includes(day) || false
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

  const getStatusForMonth = (year: number, month: number): ProcessStatus | null => {
    if (processStatus && processStatus.year === year && processStatus.month === month && !processStatus.day) {
      return processStatus
    }
    return null
  }

  const getStatusForDay = (year: number, month: number, day: number): ProcessStatus | null => {
    if (processStatus && processStatus.year === year && processStatus.month === month && processStatus.day === day) {
      return processStatus
    }
    return null
  }

  const getProcessedDaysCount = (year: number, month: number): number => {
    const days = getMonthDays(year, month)
    return days.filter(day => isDateProcessed(year, month, day)).length
  }

  return (
    <div>
      <div className="mt-4 mb-6">
        <h1 className="text-3xl text-gray-900">CSV Data Processor</h1>
        <p className="text-gray-500 text-base mt-1">Process downloaded CSV files into the database for analysis</p>
      </div>

      

      {/* Year Selection */}
      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Select Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="flex-1" />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading processed dates...</span>
        </div>
      )}

      {/* Month Grid */}
      <div className="overflow-x-auto rounded border">
        <div className="grid grid-cols-3 gap-6 p-6 bg-white">
          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
            const monthStatus = getStatusForMonth(selectedYear, month)
            const days = getMonthDays(selectedYear, month)
            const processedDays = days.filter(day => isDateProcessed(selectedYear, month, day))
            const hasData = processedDays.length > 0
            
            return (
              <div key={month} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {getMonthName(month)}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-500">
                      {processedDays.length}/{days.length} days
                    </div>
                    <button
                      onClick={() => handleProcessMonth(selectedYear, month)}
                      disabled={monthStatus?.status === 'processing'}
                      className={`p-2 rounded-full transition-colors ${
                        monthStatus?.status === 'processing'
                          ? 'text-gray-400 cursor-not-allowed'
                          : monthStatus?.status === 'success'
                          ? 'text-green-600 hover:text-green-700'
                          : monthStatus?.status === 'error'
                          ? 'text-red-600 hover:text-red-700'
                          : 'text-blue-600 hover:text-blue-700'
                      }`}
                      title={
                        monthStatus?.status === 'processing' ? 'Processing...' :
                        monthStatus?.status === 'success' ? 'Completed' :
                        monthStatus?.status === 'error' ? 'Error occurred' :
                        'Process month data'
                      }
                    >
                      {monthStatus?.status === 'processing' ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : monthStatus?.status === 'success' ? (
                        <span className="text-sm">✅</span>
                      ) : monthStatus?.status === 'error' ? (
                        <span className="text-sm">❌</span>
                      ) : (
                        <span className="text-sm">⚙️</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-4 relative z-10">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <div key={`csv-header-${month}-${selectedYear}-${index}-${day}-${Date.now()}`} className="text-xs text-gray-500 text-center py-1">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: new Date(selectedYear, month - 1, 1).getDay() }, (_, i) => (
                    <div key={`csv-empty-${month}-${selectedYear}-${i}-${Date.now()}`} className="py-1"></div>
                  ))}
                  {days.map(day => {
                    const dayStatus = getStatusForDay(selectedYear, month, day)
                    const isProcessed = isDateProcessed(selectedYear, month, day)
                    const hasDatabaseRecords = isDateInDatabase(selectedYear, month, day)
                    const isProcessing = dayStatus?.status === 'processing'
                    const isSuccess = dayStatus?.status === 'success'
                    const isError = dayStatus?.status === 'error'
                    
                    return (
                      <button
                        key={`csv-day-${month}-${selectedYear}-${day}-${Date.now()}`}
                        onClick={() => {
                          console.log(`Processing day ${day} for ${month}/${selectedYear}`)
                          handleProcessDay(selectedYear, month, day)
                        }}
                        disabled={isProcessing}
                        className={`text-xs text-center py-1 px-1 rounded transition-all duration-200 cursor-pointer min-w-[20px] min-h-[20px] flex items-center justify-center relative z-20 pointer-events-auto ${
                          isProcessing
                            ? 'bg-yellow-100 text-yellow-800 cursor-not-allowed'
                            : isSuccess
                            ? 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer'
                            : isError
                            ? 'bg-red-100 text-red-800 hover:bg-red-200 cursor-pointer'
                            : hasDatabaseRecords
                            ? 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer'
                            : 'text-gray-700 hover:bg-blue-100 hover:text-blue-800 cursor-pointer'
                        }`}
                        title={
                          isProcessing ? 'Processing...' : 
                          hasDatabaseRecords ? 'Has records in database' : 
                          isProcessed ? 'File processed but no database records' : 
                          `Process day ${day}`
                        }
                      >
                        {isProcessing ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-600"></div>
                        ) : (
                          day
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Status Message */}
                {monthStatus?.message && (
                  <div className={`mt-2 text-xs ${
                    monthStatus.status === 'error' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {monthStatus.message}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CsvProcessorPage 
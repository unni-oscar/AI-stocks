import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { removeToken, handleUnauthorized } from '@/utils/auth'

interface DatabaseDates {
  [year: string]: {
    [month: number]: number[]
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
  const [databaseDates, setDatabaseDates] = useState<DatabaseDates>({})
  const [fetchStatus, setFetchStatus] = useState<FetchStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [processingDay, setProcessingDay] = useState<{year: number, month: number, day: number} | null>(null)
  const navigate = useNavigate()

  // Generate years from current year to 20 years ago
  const years = Array.from({ length: 21 }, (_, i) => new Date().getFullYear() - i)

  // Get database dates for selected year
  useEffect(() => {
    const fetchDatabaseDates = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://localhost:3035/api/bhavcopy/database-dates?year=${selectedYear}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Accept': 'application/json'
          }
        })
        
        if (response.status === 401) {
          handleUnauthorized()
          return
        }
        
        if (response.ok) {
          const data = await response.json()
          console.log('Database dates received:', data);
          setDatabaseDates(data)
        } else {
          console.error('Failed to fetch database dates')
        }
      } catch (error) {
        console.error('Error fetching database dates:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDatabaseDates()
  }, [selectedYear])

  const handleFetchMonth = async (year: number, month: number) => {
    try {
      setFetchStatus({ year, month, status: 'fetching', progress: 0 })
      
      const token = localStorage.getItem('auth_token')
      const fetchUrl = `http://localhost:3035/api/bhavcopy/fetch-day`
      const processUrl = `http://localhost:3035/api/bhavcopy/process`
      
      // Get all days in the month
      const daysInMonth = new Date(year, month, 0).getDate()
      let successCount = 0
      let errorCount = 0
      const errors: string[] = []
      
      console.log(`Processing month ${month}/${year} with ${daysInMonth} days`)
      
      // Process each day from 1 to end of month
      for (let day = 1; day <= daysInMonth; day++) {
        try {
          console.log(`Processing day ${day}/${month}/${year}`)
          
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
            return
          }
          
          const fetchData = await fetchResponse.json()
          if (!fetchResponse.ok || fetchData.status !== 'success') {
            errorCount++
            errors.push(`Day ${day}: ${fetchData.message || 'Fetch failed'}`)
            continue
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
            return
          }
          
          const processData = await processResponse.json()
          if (processResponse.ok && processData.status === 'success') {
            successCount++
            console.log(`Successfully processed day ${day}/${month}/${year}`)
          } else {
            errorCount++
            errors.push(`Day ${day}: ${processData.message || 'Processing failed'}`)
          }
          
          // Update progress
          const progress = Math.round((day / daysInMonth) * 100)
          setFetchStatus({ 
            year, 
            month, 
            status: 'fetching', 
            progress,
            message: `Processing day ${day}/${month}/${year} (${progress}%)`
          })
          
        } catch (error) {
          errorCount++
          errors.push(`Day ${day}: Network error`)
          console.error(`Error processing day ${day}/${month}/${year}:`, error)
        }
      }
      
      // Final status update
      console.log(`Month processing complete: ${successCount} successful, ${errorCount} failed`)
      console.log('Errors:', errors)
      
      if (successCount > 0) {
        setFetchStatus({ 
          year, 
          month, 
          status: 'success', 
          progress: 100,
          message: `Successfully processed ${successCount} days, ${errorCount} failed`
        })
      } else {
        setFetchStatus({ 
          year, 
          month, 
          status: 'error', 
          message: `Failed to process any days. Errors: ${errors.slice(0, 3).join(', ')}`
        })
      }
      
      // Refresh database dates
      const datesResponse = await fetch(`http://localhost:3035/api/bhavcopy/database-dates?year=${year}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json'
        }
      })
      if (datesResponse.status === 401) {
        handleUnauthorized()
        return
      }
      if (datesResponse.ok) {
        const data = await datesResponse.json()
        console.log('Database dates after processing:', data)
        setDatabaseDates(data)
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

  const isDateInDatabase = (year: number, month: number, day: number): boolean => {
    const yearStr = year.toString()
    const monthData = databaseDates[yearStr]?.[month]
    const result = Array.isArray(monthData) && monthData.includes(day)
    console.log(`Checking ${yearStr}-${month}-${day}:`, {
      yearStr,
      month,
      day,
      monthData,
      monthDataLength: monthData?.length,
      includesCheck: monthData?.includes(day),
      isArray: Array.isArray(monthData),
      result
    })
    return result
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
    const fetchUrl = `http://localhost:3035/api/bhavcopy/fetch-day`
    const processUrl = `http://localhost:3035/api/bhavcopy/process`
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
        // Refresh database dates
        const datesResponse = await fetch(`http://localhost:3035/api/bhavcopy/database-dates?year=${year}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Accept': 'application/json'
          }
        })
        if (datesResponse.ok) {
          const datesData = await datesResponse.json()
          setDatabaseDates(datesData)
        }
      }
      setProcessingDay(null)
    } catch (err) {
      setProcessingDay(null)
    }
  }

  return (
    <div>
      <div className="mt-4 mb-6">
        <h1 className="text-3xl text-gray-900">NSE Bhavcopy Fetcher</h1>
        <p className="text-gray-500 text-base mt-1">Download and manage NSE market data by year and month</p>
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
            const processedDays = days.filter(day => isDateInDatabase(selectedYear, month, day))
            
            return (
              <div key={month} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{getMonthName(month)}</h3>
                  <div
                    onClick={() => monthStatus?.status !== 'fetching' && handleFetchMonth(selectedYear, month)}
                    className={`cursor-pointer p-1 rounded-full hover:bg-gray-100 transition-colors ${
                      monthStatus?.status === 'fetching' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title={monthStatus?.status === 'fetching' ? 
                      `Processing... ${monthStatus.progress || 0}%` : 
                      'Download Month'
                    }
                  >
                    {monthStatus?.status === 'fetching' ? (
                      <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="h-4 w-4 text-blue-600 hover:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  
                  {monthStatus && (
                    <div className={`text-xs p-2 rounded ${
                      monthStatus.status === 'success' ? 'bg-green-50 text-green-700' :
                      monthStatus.status === 'error' ? 'bg-red-50 text-red-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {monthStatus.message}
                    </div>
                  )}

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 mt-3">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                      <div key={`header-${month}-${selectedYear}-${index}-${day}`} className="text-xs text-gray-500 text-center py-1">
                        {day}
                      </div>
                    ))}
                    {Array.from({ length: new Date(selectedYear, month - 1, 1).getDay() }, (_, i) => (
                      <div key={`empty-${month}-${selectedYear}-${i}`} className="py-1"></div>
                    ))}
                    {days.map(day => {
                      const isProcessed = isDateInDatabase(selectedYear, month, day)
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
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default BhavcopyFetcherPage 
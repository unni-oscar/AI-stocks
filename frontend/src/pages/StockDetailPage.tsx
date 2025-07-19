import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { handleUnauthorized } from '@/utils/auth'
import { FaStar, FaRegStar, FaTrash, FaSpinner } from 'react-icons/fa';
import { createChart, DeepPartial, ChartOptions, CandlestickData, ColorType, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import { toast } from 'react-hot-toast';

interface OhlcData {
  trade_date: string;
  open_price: number;
  high_price: number;
  low_price: number;
  close_price: number;
  turnover_lacs: number;
  total_traded_qty: number;
  deliv_per: number;
}

interface StockDetails {
  symbol: string;
  company_name: string;
  series: string;
  hierarchy: {
    sector_name: string | null;
    industry_new_name: string | null;
    igroup_name: string | null;
    isubgroup_name: string | null;
  };
  metadata: {
    isin: string;
    face_value: number;
    is_active: boolean;
    is_nifty50: boolean;
    is_nifty100: boolean;
    is_nifty500: boolean;
  };
}

const StockDetailPage: React.FC = () => {
  console.log('StockDetailPage component is loading...');
  const { symbol } = useParams<{ symbol: string }>();
  console.log('Symbol from URL:', symbol);
  const [ohlc, setOhlc] = useState<OhlcData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [inWatchlist, setInWatchlist] = useState<boolean | null>(null);
  const [watchlistError, setWatchlistError] = useState<string | null>(null);
  const [stockDetails, setStockDetails] = useState<StockDetails | null>(null);
  const [stockDetailsLoading, setStockDetailsLoading] = useState(false);
  const [stockDetailsError, setStockDetailsError] = useState<string | null>(null);
  const [rawStockDetailsResponse, setRawStockDetailsResponse] = useState<any>(null);

  useEffect(() => {
    const fetchOhlc = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`http://localhost:3035/api/bhavcopy/ohlc/${encodeURIComponent(symbol || '')}`, {
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
        console.log('OHLC API response:', data);
        if (data.status === 'success') {
          console.log('OHLC data sample:', data.data.slice(0, 3));
          setOhlc(data.data);
        } else {
          setError(data.message || 'Failed to fetch data');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    if (symbol) fetchOhlc();
  }, [symbol]);

  // Fetch if this stock is in the user's watchlist
  useEffect(() => {
    async function fetchWatchlistStatus() {
      if (!symbol) return;
      setWatchlistLoading(true);
      setWatchlistError(null);
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`http://localhost:3035/api/watchlist/${encodeURIComponent(symbol)}`, {
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
          setInWatchlist(!!data.in_watchlist);
        } else {
          setWatchlistError(data.message || 'Failed to fetch watchlist status');
        }
      } catch (err) {
        setWatchlistError('Network error');
      } finally {
        setWatchlistLoading(false);
      }
    }
    fetchWatchlistStatus();
  }, [symbol]);

  // Fetch stock details with hierarchical classification
  useEffect(() => {
    async function fetchStockDetails() {
      if (!symbol) return;
      setStockDetailsLoading(true);
      setStockDetailsError(null);
      try {
        const token = localStorage.getItem('auth_token');
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        };
        console.log('Fetching stock details for:', symbol);
        console.log('Token:', token);
        console.log('Headers:', headers);
        const response = await fetch(`http://localhost:3035/api/analysis/stock/${encodeURIComponent(symbol)}`, {
          headers,
        });
        console.log('Stock details response status:', response.status);
        const data = await response.json();
        setRawStockDetailsResponse(data);
        console.log('Stock details response:', data);
        if (response.ok && data.status === 'success') {
          setStockDetails(data.data);
          console.log('Stock details set:', data.data);
          console.log('Stock hierarchy:', data.data.hierarchy);
          console.log('Sector name:', data.data.hierarchy?.sector_name);
          console.log('Debug info:', data.data.debug_info);
        } else {
          setStockDetailsError(data.message || 'Failed to fetch stock details');
          console.log('Stock details error:', data.message);
        }
      } catch (err) {
        console.error('Stock details fetch error:', err);
        setStockDetailsError('Network error');
      } finally {
        setStockDetailsLoading(false);
      }
    }
    fetchStockDetails();
  }, [symbol]);

  // Only include rows with all price fields present
  const filteredOhlc = ohlc.filter(row =>
    row.open_price !== null && row.open_price !== undefined &&
    row.high_price !== null && row.high_price !== undefined &&
    row.low_price !== null && row.low_price !== undefined &&
    row.close_price !== null && row.close_price !== undefined
  );

  const chartData = filteredOhlc.map((row) => ({
    x: row.trade_date,
    y: [
      Number(row.open_price),
      Number(row.high_price),
      Number(row.low_price),
      Number(row.close_price),
    ],
  }));

  // Chart width: 100% of container, height: 700px
  const chartWidth = '100%';
  const chartHeight = 700;

  // Prepare x-axis labels: show only day, but if month changes, show day/month
  function getXAxisLabels(dates: string[]) {
    let prevMonth = '';
    return dates.map(dateStr => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      let label = day;
      if (month !== prevMonth) {
        label = `${day}/${month}`;
        prevMonth = month;
      }
      return label;
    });
  }
  const categories = filteredOhlc.map(row => row.trade_date);
  const xAxisLabels = getXAxisLabels(categories);

  // Data for delivery percentage and volume chart
  const deliveryVolumeData = filteredOhlc.filter(row =>
    row.total_traded_qty !== null && row.total_traded_qty !== undefined &&
    (row as any).deliv_per !== undefined && (row as any).deliv_per !== null
  );
  const volumeSeries = deliveryVolumeData.map(row => Number(row.total_traded_qty));
  const delivPerSeries = deliveryVolumeData.map(row => (row as any).deliv_per !== undefined ? Number((row as any).deliv_per) : null);
  const deliveryCategories = deliveryVolumeData.map(row => row.trade_date);
  const deliveryXAxisLabels = getXAxisLabels(deliveryCategories);

  // Prepare delivery percentage series for the candlestick chart
  const delivPerLineSeries = filteredOhlc.map(row => ({
    x: row.trade_date,
    y: row.deliv_per !== undefined && row.deliv_per !== null ? Number(row.deliv_per) : null
  }));

  // Calculate rolling averages for delivery % for 1, 3, 7, 30, 180 days
  function rollingAvg(arr: (number | null)[], window: number): (number | null)[] {
    return arr.map((_: number | null, i: number) => {
      const start = Math.max(0, i - window + 1);
      const slice = arr.slice(start, i + 1).filter((v: number | null) => v !== null && v !== undefined) as number[];
      if (slice.length === 0) return null;
      return Number((slice.reduce((a: number, b: number) => a + b, 0) / slice.length).toFixed(2));
    });
  }
  const delivPerArr = filteredOhlc.map(row => row.deliv_per !== undefined && row.deliv_per !== null ? Number(row.deliv_per) : null);
  const avg1 = rollingAvg(delivPerArr, 1);
  const avg3 = rollingAvg(delivPerArr, 3);
  const avg7 = rollingAvg(delivPerArr, 7);
  const avg30 = rollingAvg(delivPerArr, 30);
  const avg180 = rollingAvg(delivPerArr, 180);

  const avg1Series = filteredOhlc.map((row, idx) => ({ x: row.trade_date, y: avg1[idx] }));
  const avg3Series = filteredOhlc.map((row, idx) => ({ x: row.trade_date, y: avg3[idx] }));
  const avg7Series = filteredOhlc.map((row, idx) => ({ x: row.trade_date, y: avg7[idx] }));
  const avg30Series = filteredOhlc.map((row, idx) => ({ x: row.trade_date, y: avg30[idx] }));
  const avg180Series = filteredOhlc.map((row, idx) => ({ x: row.trade_date, y: avg180[idx] }));

  // Find days where 1d > 3d, 3d > 7d, 7d > 30d, 30d > 180d
  const specialGreenDays = filteredOhlc.map((row, idx) => {
    const a1 = avg1[idx], a3 = avg3[idx], a7 = avg7[idx], a30 = avg30[idx], a180 = avg180[idx];
    return (
      a1 !== null && a3 !== null && a7 !== null && a30 !== null && a180 !== null &&
      a1 > a3 && a3 > a7 && a7 > a30 && a30 > a180
    );
  });

  // Helper to count delivery % spikes in a given date range
  function countDeliverySpikes(days: number) {
    const now = new Date();
    const spikes = filteredOhlc.filter((row, idx) => {
      const rowDate = new Date(row.trade_date);
      const diffDays = (now.getTime() - rowDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > days) return false;
      // Calculate rolling averages for this index
      const delivPerArr = filteredOhlc.map(r => r.deliv_per !== undefined && r.deliv_per !== null ? Number(r.deliv_per) : null);
      function rollingAvg(arr: (number | null)[], window: number): (number | null)[] {
        return arr.map((_: number | null, i: number) => {
          const start = Math.max(0, i - window + 1);
          const slice = arr.slice(start, i + 1).filter((v: number | null) => v !== null && v !== undefined) as number[];
          if (slice.length === 0) return null;
          return Number((slice.reduce((a: number, b: number) => a + b, 0) / slice.length).toFixed(2));
        });
      }
      const avg1 = rollingAvg(delivPerArr, 1);
      const avg3 = rollingAvg(delivPerArr, 3);
      const avg7 = rollingAvg(delivPerArr, 7);
      const avg30 = rollingAvg(delivPerArr, 30);
      const avg180 = rollingAvg(delivPerArr, 180);
      const a1 = avg1[idx], a3 = avg3[idx], a7 = avg7[idx], a30 = avg30[idx], a180 = avg180[idx];
      
      // Use adaptive logic based on available data
      let isSpike = false;
      
      if (filteredOhlc.length >= 180) {
        // Full analysis with 180-day average
        isSpike = (
          a1 !== null && a3 !== null && a7 !== null && a30 !== null && a180 !== null &&
          a1 > a3 && a3 > a7 && a7 > a30 && a30 > a180
        );
      } else if (filteredOhlc.length >= 30) {
        // Use 30-day as the longest average
        isSpike = (
          a1 !== null && a3 !== null && a7 !== null && a30 !== null &&
          a1 > a3 && a3 > a7 && a7 > a30
        );
      } else if (filteredOhlc.length >= 7) {
        // Use 7-day as the longest average
        isSpike = (
          a1 !== null && a3 !== null && a7 !== null &&
          a1 > a3 && a3 > a7
        );
      } else if (filteredOhlc.length >= 3) {
        // Use 3-day as the longest average
        isSpike = (
          a1 !== null && a3 !== null &&
          a1 > a3
        );
      }
      
      if (isSpike) {
        console.log(`Delivery spike found on ${row.trade_date}:`, { a1, a3, a7, a30, a180 });
      }
      
      return isSpike;
    });
    
    console.log(`Delivery spikes for ${days} days:`, {
      totalDataPoints: filteredOhlc.length,
      dateRange: days,
      spikesFound: spikes.length,
      spikeDates: spikes.map(s => s.trade_date)
    });
    
    return spikes.length;
  }
  const spikes1w = countDeliverySpikes(7);
  const spikes1m = countDeliverySpikes(30);
  const spikes3m = countDeliverySpikes(90);
  const spikes6m = countDeliverySpikes(180);

  // Helper to get average close price at delivery spikes in a given date range
  function avgPriceAtDeliverySpikes(days: number): number | null {
    const now = new Date();
    const delivPerArr = filteredOhlc.map(r => r.deliv_per !== undefined && r.deliv_per !== null ? Number(r.deliv_per) : null);
    function rollingAvg(arr: (number | null)[], window: number): (number | null)[] {
      return arr.map((_: number | null, i: number) => {
        const start = Math.max(0, i - window + 1);
        const slice = arr.slice(start, i + 1).filter((v: number | null) => v !== null && v !== undefined) as number[];
        if (slice.length === 0) return null;
        return Number((slice.reduce((a: number, b: number) => a + b, 0) / slice.length).toFixed(2));
      });
    }
    const avg1 = rollingAvg(delivPerArr, 1);
    const avg3 = rollingAvg(delivPerArr, 3);
    const avg7 = rollingAvg(delivPerArr, 7);
    const avg30 = rollingAvg(delivPerArr, 30);
    const avg180 = rollingAvg(delivPerArr, 180);
    const prices = filteredOhlc.filter((row, idx) => {
      const rowDate = new Date(row.trade_date);
      const diffDays = (now.getTime() - rowDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > days) return false;
      
      const a1 = avg1[idx], a3 = avg3[idx], a7 = avg7[idx], a30 = avg30[idx], a180 = avg180[idx];
      
      // Use adaptive logic based on available data (same as countDeliverySpikes)
      let isSpike = false;
      
      if (filteredOhlc.length >= 180) {
        // Full analysis with 180-day average
        isSpike = (
          a1 !== null && a3 !== null && a7 !== null && a30 !== null && a180 !== null &&
          a1 > a3 && a3 > a7 && a7 > a30 && a30 > a180
        );
      } else if (filteredOhlc.length >= 30) {
        // Use 30-day as the longest average
        isSpike = (
          a1 !== null && a3 !== null && a7 !== null && a30 !== null &&
          a1 > a3 && a3 > a7 && a7 > a30
        );
      } else if (filteredOhlc.length >= 7) {
        // Use 7-day as the longest average
        isSpike = (
          a1 !== null && a3 !== null && a7 !== null &&
          a1 > a3 && a3 > a7
        );
      } else if (filteredOhlc.length >= 3) {
        // Use 3-day as the longest average
        isSpike = (
          a1 !== null && a3 !== null &&
          a1 > a3
        );
      }
      
      return isSpike;
    }).map(row => row.close_price);
    
    if (prices.length === 0) return null;
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    console.log(`Average price at delivery spikes for ${days} days:`, {
      totalDataPoints: filteredOhlc.length,
      dateRange: days,
      pricesFound: prices.length,
      averagePrice: avg,
      priceValues: prices
    });
    
    return avg;
  }
  const avgPrice1w = avgPriceAtDeliverySpikes(7);
  const avgPrice1m = avgPriceAtDeliverySpikes(30);
  const avgPrice3m = avgPriceAtDeliverySpikes(90);
  const avgPrice6m = avgPriceAtDeliverySpikes(180);

  // Get the latest close price for comparison
  const latestClose = filteredOhlc.length > 0 ? filteredOhlc[filteredOhlc.length - 1].close_price : null;

  // Add to watchlist
  async function handleAddToWatchlist() {
    if (!symbol) return;
    setWatchlistLoading(true);
    setWatchlistError(null);
    try {
      const token = localStorage.getItem('auth_token');
              const response = await fetch('http://localhost:3035/api/watchlist', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol }),
      });
      if (response.status === 401) {
        handleUnauthorized()
        return
      }
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setInWatchlist(true);
        // Show success toast with company name
        const displayName = stockDetails?.company_name || symbol;
        toast.success(`${displayName} has been added to watchlist`);
      } else {
        const errorMessage = data.message || 'Failed to add to watchlist';
        setWatchlistError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage = 'Network error';
      setWatchlistError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setWatchlistLoading(false);
    }
  }

  // Remove from watchlist
  async function handleRemoveFromWatchlist() {
    if (!symbol) return;
    setWatchlistLoading(true);
    setWatchlistError(null);
    try {
      const token = localStorage.getItem('auth_token');
              const response = await fetch(`http://localhost:3035/api/watchlist/${encodeURIComponent(symbol)}`, {
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
        setInWatchlist(false);
        // Show success toast with company name
        const displayName = stockDetails?.company_name || symbol;
        toast.success(`${displayName} has been removed from watchlist`);
      } else {
        const errorMessage = data.message || 'Failed to remove from watchlist';
        setWatchlistError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage = 'Network error';
      setWatchlistError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setWatchlistLoading(false);
    }
  }

  // TradingView-style chart component
  const TradingViewChart: React.FC<{ data: OhlcData[]; symbol?: string }> = ({ data, symbol }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);
    const [hoveredCandle, setHoveredCandle] = useState<OhlcData | null>(null);

    // Helper to get green marker indices for special days
    function getGreenMarkerIndices(data: OhlcData[]) {
      const delivPerArr = data.map(row => row.deliv_per !== undefined && row.deliv_per !== null ? Number(row.deliv_per) : null);
      const avg = (arr: (number | null)[], window: number) => arr.map((_, idx) => {
        const start = Math.max(0, idx - window + 1);
        const slice = arr.slice(start, idx + 1).filter(v => v !== null && v !== undefined) as number[];
        if (slice.length === 0) return null;
        return Number((slice.reduce((a, b) => a + b, 0) / slice.length).toFixed(2));
      });
      const avg1 = avg(delivPerArr, 1);
      const avg3 = avg(delivPerArr, 3);
      const avg7 = avg(delivPerArr, 7);
      const avg30 = avg(delivPerArr, 30);
      const avg180 = avg(delivPerArr, 180);
      
      const indices = data.map((row, idx) => {
        const a1 = avg1[idx], a3 = avg3[idx], a7 = avg7[idx], a30 = avg30[idx], a180 = avg180[idx];
        
        // Use shorter timeframes when there's insufficient data
        let isGreenMarker = false;
        
        if (data.length >= 180) {
          // Full analysis with 180-day average
          isGreenMarker = (
            a1 !== null && a3 !== null && a7 !== null && a30 !== null && a180 !== null &&
            a1 > a3 && a3 > a7 && a7 > a30 && a30 > a180
          );
        } else if (data.length >= 30) {
          // Use 30-day as the longest average
          isGreenMarker = (
            a1 !== null && a3 !== null && a7 !== null && a30 !== null &&
            a1 > a3 && a3 > a7 && a7 > a30
          );
        } else if (data.length >= 7) {
          // Use 7-day as the longest average
          isGreenMarker = (
            a1 !== null && a3 !== null && a7 !== null &&
            a1 > a3 && a3 > a7
          );
        } else if (data.length >= 3) {
          // Use 3-day as the longest average
          isGreenMarker = (
            a1 !== null && a3 !== null &&
            a1 > a3
          );
        }
        
        if (isGreenMarker) {
          console.log(`Green marker found on ${row.trade_date}:`, { a1, a3, a7, a30, a180, dataLength: data.length });
        }
        
        return isGreenMarker ? idx : null;
      }).filter((v): v is number => v !== null);
      
      console.log('Green marker analysis:', {
        dataLength: data.length,
        delivPerArr: delivPerArr.slice(0, 10), // First 10 values
        avg1Sample: avg1.slice(0, 10),
        avg3Sample: avg3.slice(0, 10),
        avg7Sample: avg7.slice(0, 10),
        avg30Sample: avg30.slice(0, 10),
        avg180Sample: avg180.slice(0, 10),
        foundIndices: indices,
        totalMarkers: indices.length,
        // Show actual delivery percentage values
        sampleDelivPer: data.slice(0, 5).map(row => ({ date: row.trade_date, deliv_per: row.deliv_per }))
      });
      
      return indices;
    }

    // State for green dot marker positions
    const [dotPositions, setDotPositions] = useState<{ left: number; top: number; key: string }[]>([]);

    useEffect(() => {
      if (!chartContainerRef.current) return;
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      const chartOptions: DeepPartial<ChartOptions> = {
        layout: { background: { type: ColorType.Solid, color: '#fff' }, textColor: '#222' },
        width: chartContainerRef.current.offsetWidth,
        height: 533,
        grid: { vertLines: { color: '#eee' }, horzLines: { color: '#eee' } },
        timeScale: { timeVisible: true, secondsVisible: false },
      };
      const chart = createChart(chartContainerRef.current, chartOptions);
      chartRef.current = chart;
      const candleSeries = chart.addSeries(CandlestickSeries);
      chartRef.current.candleSeries = candleSeries;
      const candleData: CandlestickData[] = data.map(row => ({
        time: row.trade_date,
        open: Number(row.open_price),
        high: Number(row.high_price),
        low: Number(row.low_price),
        close: Number(row.close_price),
      }));
      candleSeries.setData(candleData);

      // Add volume histogram series (use addSeries(HistogramSeries, ...))
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: 'volume' },
        color: '#94a3b8',
        priceScaleId: '', // overlay price scale
        lastValueVisible: false,
      });
      volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });
      // Prepare volume data with color by up/down day
      const volumeData = data.map(row => {
        const up = row.close_price >= row.open_price;
        return {
          time: row.trade_date,
          value: row.total_traded_qty ?? 0,
          color: up ? '#16a34a' : '#dc2626',
        };
      });
      volumeSeries.setData(volumeData);
      chartRef.current.volumeSeries = volumeSeries;

      // Subscribe to crosshair move to show overlay for all candles
      function handleCrosshairMove(param: any) {
        if (!param || !param.time) {
          setHoveredCandle(null);
          return;
        }
        // Try to match time as string or number
        let timeStr = typeof param.time === 'string' ? param.time : String(param.time);
        let candle = data.find(row => row.trade_date === timeStr);
        // Fallback: try to match as date (if param.time is a timestamp)
        if (!candle && typeof param.time === 'number') {
          const d = new Date(param.time * 1000);
          const y = d.getFullYear();
          const m = (d.getMonth() + 1).toString().padStart(2, '0');
          const day = d.getDate().toString().padStart(2, '0');
          const dateStr = `${y}-${m}-${day}`;
          candle = data.find(row => row.trade_date === dateStr);
        }
        if (candle) {
          setHoveredCandle(candle);
        } else {
          setHoveredCandle(null);
        }
      }
      chart.subscribeCrosshairMove(handleCrosshairMove);
      return () => {
        chart.unsubscribeCrosshairMove(handleCrosshairMove);
        chart.remove();
        chartRef.current = null;
      };
    }, [data]);

    // Green dot marker effect: update on data, zoom, or pan
    useEffect(() => {
      if (!chartRef.current || !chartRef.current.candleSeries) return;
      const chart = chartRef.current;
      const candleSeries = chart.candleSeries;
      const timeScale = chart.timeScale();
      function updateDotPositions() {
        const indices = getGreenMarkerIndices(data);
        const positions = indices.map(idx => {
          const row = data[idx];
          const x = timeScale.timeToCoordinate(row.trade_date);
          const y = candleSeries.priceToCoordinate(row.high_price ?? row.close_price);
          if (x === null || y === null) return null;
          return {
            left: x,
            top: y - 20,
            key: row.trade_date + '-dot',
          };
        }).filter(Boolean) as { left: number; top: number; key: string }[];
        
        console.log('Dot positions update:', {
          indicesCount: indices.length,
          positionsCount: positions.length,
          positions: positions.slice(0, 3) // First 3 positions
        });
        
        setDotPositions(positions);
      }
      updateDotPositions();
      const unsub = timeScale.subscribeVisibleLogicalRangeChange(updateDotPositions);
      window.addEventListener('resize', updateDotPositions);
      return () => {
        unsub && timeScale.unsubscribeVisibleLogicalRangeChange(updateDotPositions);
        window.removeEventListener('resize', updateDotPositions);
      };
    }, [data]);

    return (
      <div ref={chartContainerRef} style={{ width: '100%', height: 533, marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
        {hoveredCandle && (
          <div
            style={{
              position: 'absolute',
              left: 12,
              top: 12,
              background: 'rgba(255,255,255,0.97)',
              border: '1px solid #e5e7eb',
              borderRadius: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
              padding: '6px 12px',
              zIndex: 30,
              minWidth: 0,
              fontSize: 13,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              lineHeight: 1.15,
            }}
          >
            {/* OHLC, change, delivery %, turnover, averages - each with fixed width */}
            {(() => {
              const o = hoveredCandle.open_price;
              const h = hoveredCandle.high_price;
              const l = hoveredCandle.low_price;
              const c = hoveredCandle.close_price;
              const prevCandle = data[data.findIndex(d => d.trade_date === hoveredCandle.trade_date) - 1];
              const prevClose = prevCandle ? prevCandle.close_price : null;
              const change = prevClose !== null && c !== null ? c - prevClose : null;
              const changePct = prevClose !== null && c !== null && prevClose !== 0 ? ((c - prevClose) / prevClose) * 100 : null;
              const up = change !== null && change > 0;
              const down = change !== null && change < 0;
              const color = up ? '#16a34a' : down ? '#dc2626' : '#6b7280';
              const sign = up ? '+' : '';
              // Delivery % and Turnover
              const delivPer = hoveredCandle.deliv_per !== undefined && hoveredCandle.deliv_per !== null ? hoveredCandle.deliv_per.toFixed(2) + '%' : 'N/A';
              // Show turnover in crores
              const turnoverCr = hoveredCandle.turnover_lacs !== undefined && hoveredCandle.turnover_lacs !== null ? (hoveredCandle.turnover_lacs / 100).toFixed(2) : 'N/A';
              // Rolling averages
              const idx = data.findIndex(d => d.trade_date === hoveredCandle.trade_date);
              function rollingAvg(arr: (number | null)[], window: number): (number | null)[] {
                return arr.map((_: number | null, i: number) => {
                  const start = Math.max(0, i - window + 1);
                  const slice = arr.slice(start, i + 1).filter((v: number | null) => v !== null && v !== undefined) as number[];
                  if (slice.length === 0) return null;
                  return Number((slice.reduce((a: number, b: number) => a + b, 0) / slice.length).toFixed(2));
                });
              }
              const delivPerArr = data.map(row => row.deliv_per !== undefined && row.deliv_per !== null ? Number(row.deliv_per) : null);
              const avg1 = rollingAvg(delivPerArr, 1);
              const avg3 = rollingAvg(delivPerArr, 3);
              const avg7 = rollingAvg(delivPerArr, 7);
              const avg30 = rollingAvg(delivPerArr, 30);
              const avg180 = rollingAvg(delivPerArr, 180);
              const avg1Val = avg1[idx];
              const avg3Val = avg3[idx];
              const avg7Val = avg7[idx];
              const avg30Val = avg30[idx];
              const avg180Val = avg180[idx];
              function highlight(val: number | null | undefined, prev: number | null | undefined) {
                if (val !== null && val !== undefined && prev !== null && prev !== undefined && val > prev) {
                  return <span style={{ background: '#a7f3d0', padding: '2px 4px', borderRadius: 3 }}>{val.toFixed(2)}%</span>;
                }
                return val !== null && val !== undefined ? <>{val.toFixed(2)}%</> : <>N/A</>;
              }
              const cellStyle = { minWidth: 62, maxWidth: 80, display: 'inline-block', textAlign: 'left' as const, color: '#6b7280', fontWeight: 500 };
              return <>
                <span style={cellStyle}>Open<br /><span style={{ color: '#6b7280', fontWeight: 700 }}>{o?.toFixed(2) ?? 'N/A'}</span></span><br />
                <span style={cellStyle}>High<br /><span style={{ color: '#6b7280', fontWeight: 700 }}>{h?.toFixed(2) ?? 'N/A'}</span></span><br />
                <span style={cellStyle}>Low<br /><span style={{ color: '#6b7280', fontWeight: 700 }}>{l?.toFixed(2) ?? 'N/A'}</span></span><br />
                <span style={cellStyle}>Close<br /><span style={{ color, fontWeight: 700 }}>{c?.toFixed(2) ?? 'N/A'}</span></span><br />
                {change !== null && changePct !== null && (
                  <span style={{ ...cellStyle, color, fontWeight: 600 }}>
                    {sign}{change.toFixed(2)} ({sign}{changePct.toFixed(2)}%)
                  </span>
                )}
                <span style={cellStyle}>Del% <span style={{ color: '#6b7280', fontWeight: 700 }}>{delivPer}</span></span>
                {/* Turnover label and value on next line, in crores */}
                <span style={{ ...cellStyle, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', minWidth: 70 }}>
                  Turnover
                  <span style={{ color: '#6b7280', fontWeight: 700, marginTop: 2 }}>{turnoverCr} Cr</span>
                </span>
                {/* Volume after Turnover */}
                <span style={{ ...cellStyle, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', minWidth: 70 }}>
                  Volume
                  <span style={{ color: '#6b7280', fontWeight: 700, marginTop: 2 }}>{hoveredCandle.total_traded_qty !== undefined && hoveredCandle.total_traded_qty !== null ? hoveredCandle.total_traded_qty.toLocaleString() : 'N/A'}</span>
                </span>
                <span style={cellStyle}>1 d <br />{highlight(avg1Val, avg3Val)}</span>
                <span style={cellStyle}>Avg 3 d <br />{highlight(avg3Val, avg7Val)}</span>
                <span style={cellStyle}>Avg 7 d <br />{highlight(avg7Val, avg30Val)}</span>
                <span style={cellStyle}>Avg 30 d <br />{highlight(avg30Val, avg180Val)}</span>
                <span style={cellStyle}>Avg 180 d <br />{avg180Val !== null && avg180Val !== undefined ? <>{avg180Val.toFixed(2)}%</> : <>N/A</>}</span>
              </>;
            })()}
          </div>
        )}
        {/* Green dot markers for special days */}
        {dotPositions.map(dot => (
          <div
            key={dot.key}
            style={{
              position: 'absolute',
              left: dot.left - 6,
              top: dot.top - 6,
              width: 12,
              height: 12,
              background: '#22c55e',
              borderRadius: '50%',
              border: '2px solid #14532d',
              zIndex: 10,
              boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
              pointerEvents: 'none',
            }}
            title="Strong Delivery %"
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="mt-4 mb-6">
        <div className="flex items-center">
          <h1 className="text-3xl text-gray-900">{stockDetails?.company_name || symbol}</h1>
          {inWatchlist !== null && (
            <button
              className={`ml-4 p-2 rounded-full border border-transparent transition ${inWatchlist ? 'text-red-600 hover:text-red-800 hover:border-red-200' : 'text-yellow-500 hover:text-yellow-600 hover:border-yellow-200'}`}
              onClick={inWatchlist ? handleRemoveFromWatchlist : handleAddToWatchlist}
              disabled={watchlistLoading}
              title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              {watchlistLoading ? (
                <FaSpinner className="animate-spin" />
              ) : inWatchlist ? (
                <FaTrash />
              ) : (
                inWatchlist === false ? <FaRegStar /> : <FaStar />
              )}
            </button>
          )}
        </div>
        <p className="text-gray-500 text-base mt-1">
          {symbol}
        </p>
      </div>
      
      {/* Stock Hierarchy Information */}
      {stockDetails && stockDetails.hierarchy && (
        <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="font-medium text-gray-700">Sector/Industry:</span>
            {stockDetails.hierarchy.sector_name && (
              <>
                <span className="text-gray-600 font-normal">{stockDetails.hierarchy.sector_name}</span>
                <span className="text-gray-400">›</span>
              </>
            )}
            {stockDetails.hierarchy.industry_new_name && (
              <>
                <span className="text-gray-600 font-normal">{stockDetails.hierarchy.industry_new_name}</span>
                <span className="text-gray-400">›</span>
              </>
            )}
            {stockDetails.hierarchy.igroup_name && (
              <>
                <span className="text-gray-600 font-normal">{stockDetails.hierarchy.igroup_name}</span>
                <span className="text-gray-400">›</span>
              </>
            )}
            {stockDetails.hierarchy.isubgroup_name && (
              <span className="text-gray-600 font-normal">{stockDetails.hierarchy.isubgroup_name}</span>
            )}
          </div>
        </div>
      )}
      
      {/* Clean and vibrant Delivery spikes and Avg price info table */}
      <div className="flex justify-end w-full mb-3">
        <div className="bg-white shadow-sm border border-gray-100 rounded-lg overflow-hidden">
          <table className="text-xs">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b border-gray-100"></th>
                <th className="px-3 py-2 text-right font-semibold text-gray-700 border-b border-gray-100">1w</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-700 border-b border-gray-100">1m</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-700 border-b border-gray-100">3m</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-700 border-b border-gray-100">6m</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-3 py-2 font-semibold text-gray-800 whitespace-nowrap">Delivery Spikes</td>
                <td className="px-3 py-2 text-right font-bold text-blue-600">{spikes1w}</td>
                <td className="px-3 py-2 text-right font-bold text-blue-600">{spikes1m}</td>
                <td className="px-3 py-2 text-right font-bold text-blue-600">{spikes3m}</td>
                <td className="px-3 py-2 text-right font-bold text-blue-600">{spikes6m}</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-3 py-2 font-semibold text-gray-800 whitespace-nowrap">Avg Price at Spike</td>
                <td className={`px-3 py-2 text-right font-bold ${avgPrice1w !== null && latestClose !== null && avgPrice1w > latestClose ? 'text-green-600' : 'text-red-600'}`}>
                  {avgPrice1w !== null ? avgPrice1w.toFixed(2) : 'N/A'}
                </td>
                <td className={`px-3 py-2 text-right font-bold ${avgPrice1m !== null && latestClose !== null && avgPrice1m > latestClose ? 'text-green-600' : 'text-red-600'}`}>
                  {avgPrice1m !== null ? avgPrice1m.toFixed(2) : 'N/A'}
                </td>
                <td className={`px-3 py-2 text-right font-bold ${avgPrice3m !== null && latestClose !== null && avgPrice3m > latestClose ? 'text-green-600' : 'text-red-600'}`}>
                  {avgPrice3m !== null ? avgPrice3m.toFixed(2) : 'N/A'}
                </td>
                <td className={`px-3 py-2 text-right font-bold ${avgPrice6m !== null && latestClose !== null && avgPrice6m > latestClose ? 'text-green-600' : 'text-red-600'}`}>
                  {avgPrice6m !== null ? avgPrice6m.toFixed(2) : 'N/A'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {watchlistError && <div className="text-red-600 mb-2">{watchlistError}</div>}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
          <div className="text-lg text-gray-800 font-semibold">Loading stock data...</div>
        </div>
      )}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && filteredOhlc.length > 0 && (
        <TradingViewChart data={filteredOhlc} symbol={symbol} />
      )}
    </div>
  );
};

export default StockDetailPage; 
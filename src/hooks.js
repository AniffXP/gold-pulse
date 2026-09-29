import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchTechnicalData } from './api';

const REFRESH_INTERVAL = 5_000; // 5 detik

/**
 * Custom hook: ambil data teknikal real-time + auto-refresh
 */
export const useTechnicalData = () => {
  const [data, setData] = useState(null);
  const [timeframe, setTimeframe] = useState('1D');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  const refresh = useCallback(async (tf) => {
    const result = await fetchTechnicalData(tf);
    if (result) {
      setData(result);
      setLastUpdated(new Date());
      setLoading(false);
    }
  }, []);

  // Fetch saat timeframe berubah + start interval
  useEffect(() => {
    setLoading(true);
    refresh(timeframe);

    // Clear interval lama
    if (intervalRef.current) clearInterval(intervalRef.current);
    // Set interval baru
    intervalRef.current = setInterval(() => refresh(timeframe), REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timeframe, refresh]);

  return { data, timeframe, setTimeframe, lastUpdated, loading };
};

/**
 * Hook: jam real-time
 */
export const useClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
};

import { useState, useEffect, useCallback } from 'react';
import { centerAPI } from '../api/index';

export const useMyCenter = () => {
  const [center, setCenter] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await centerAPI.getMy();
      const centerData = data.data;
      setCenter(centerData);

      if (centerData?._id) {
        const { data: statsData } = await centerAPI.getStats(centerData._id);
        setStats(statsData.stats);
      } else {
        setStats(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load center');
      setCenter(null);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { center, stats, loading, error, refresh, setCenter };
};

export default useMyCenter;

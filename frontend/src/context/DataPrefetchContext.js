import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { fetchPots, fetchAllBlessings } from '../lib/api';

const DataPrefetchContext = createContext();

export function DataPrefetchProvider({ children }) {
  const [potsData, setPotsData] = useState(null);
  const [wishesData, setWishesData] = useState(null);
  const [potsLoading, setPotsLoading] = useState(true);
  const [wishesLoading, setWishesLoading] = useState(true);
  const [potsError, setPotsError] = useState(null);
  
  // Track last fetch time to avoid unnecessary refetches
  const lastFetchRef = useRef(0);
  const CACHE_DURATION = 30000; // 30 seconds - short enough to get fresh data

  // Fetch function that can be called on app load or to refresh
  const fetchAllData = useCallback(async (force = false) => {
    const now = Date.now();
    
    // Skip if we fetched recently (unless forced)
    if (!force && potsData && (now - lastFetchRef.current) < CACHE_DURATION) {
      return;
    }

    lastFetchRef.current = now;

    // Fetch pots
    setPotsLoading(true);
    fetchPots()
      .then(r => {
        setPotsData(r.data);
        setPotsError(null);
      })
      .catch(e => {
        setPotsError(e.response?.data?.detail || "Could not load collections");
      })
      .finally(() => setPotsLoading(false));

    // Fetch wishes  
    setWishesLoading(true);
    fetchAllBlessings()
      .then(r => setWishesData(r.data))
      .catch(() => {}) // Silently fail for wishes
      .finally(() => setWishesLoading(false));
  }, [potsData]);

  // Prefetch data on app load
  useEffect(() => {
    fetchAllData();
  }, []);

  // Force refresh - clears cache timestamp and fetches fresh
  const refreshData = useCallback(() => {
    lastFetchRef.current = 0; // Reset cache
    return fetchAllData(true);
  }, [fetchAllData]);

  // Clear prefetched data (call after contribution)
  const clearPrefetchedData = useCallback(() => {
    setPotsData(null);
    setWishesData(null);
    lastFetchRef.current = 0;
  }, []);

  return (
    <DataPrefetchContext.Provider value={{
      potsData,
      wishesData,
      potsLoading,
      wishesLoading,
      potsError,
      refreshData,
      clearPrefetchedData,
    }}>
      {children}
    </DataPrefetchContext.Provider>
  );
}

export const useDataPrefetch = () => useContext(DataPrefetchContext);

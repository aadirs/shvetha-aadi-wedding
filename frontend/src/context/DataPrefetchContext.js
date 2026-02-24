import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchPots, fetchAllBlessings } from '../lib/api';

const DataPrefetchContext = createContext();

export function DataPrefetchProvider({ children }) {
  const [potsData, setPotsData] = useState(null);
  const [wishesData, setWishesData] = useState(null);
  const [potsLoading, setPotsLoading] = useState(true);
  const [wishesLoading, setWishesLoading] = useState(true);
  const [potsError, setPotsError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  // Prefetch data on app load
  const prefetchBlessingsData = useCallback(async (force = false) => {
    // Don't refetch if data is fresh (less than 2 minutes old) unless forced
    if (!force && lastFetched && Date.now() - lastFetched < 120000 && potsData) {
      return;
    }

    try {
      setPotsLoading(true);
      setWishesLoading(true);

      // Fetch both in parallel
      const [potsResponse, wishesResponse] = await Promise.all([
        fetchPots(),
        fetchAllBlessings()
      ]);

      setPotsData(potsResponse.data);
      setWishesData(wishesResponse.data);
      setPotsError(null);
      setLastFetched(Date.now());
    } catch (error) {
      setPotsError(error.response?.data?.detail || "Could not load data");
    } finally {
      setPotsLoading(false);
      setWishesLoading(false);
    }
  }, [lastFetched, potsData]);

  // Prefetch on mount
  useEffect(() => {
    prefetchBlessingsData();
  }, []);

  // Refresh data function (for after a contribution)
  const refreshData = useCallback(() => {
    prefetchBlessingsData(true);
  }, [prefetchBlessingsData]);

  return (
    <DataPrefetchContext.Provider value={{
      potsData,
      wishesData,
      potsLoading,
      wishesLoading,
      potsError,
      prefetchBlessingsData,
      refreshData,
    }}>
      {children}
    </DataPrefetchContext.Provider>
  );
}

export const useDataPrefetch = () => useContext(DataPrefetchContext);

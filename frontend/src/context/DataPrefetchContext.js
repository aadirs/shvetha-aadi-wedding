import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchPots, fetchAllBlessings } from '../lib/api';

const DataPrefetchContext = createContext();

export function DataPrefetchProvider({ children }) {
  const [potsData, setPotsData] = useState(null);
  const [wishesData, setWishesData] = useState(null);

  // Prefetch data on app load - fire and forget, no complex caching
  useEffect(() => {
    // Prefetch pots
    fetchPots()
      .then(r => setPotsData(r.data))
      .catch(() => {}); // Silently fail - page will fetch its own data
    
    // Prefetch wishes
    fetchAllBlessings()
      .then(r => setWishesData(r.data))
      .catch(() => {}); // Silently fail
  }, []);

  // Clear prefetched data (call after contribution to ensure fresh data)
  const clearPrefetchedData = useCallback(() => {
    setPotsData(null);
    setWishesData(null);
  }, []);

  return (
    <DataPrefetchContext.Provider value={{
      prefetchedPots: potsData,
      prefetchedWishes: wishesData,
      clearPrefetchedData,
    }}>
      {children}
    </DataPrefetchContext.Provider>
  );
}

export const useDataPrefetch = () => useContext(DataPrefetchContext);

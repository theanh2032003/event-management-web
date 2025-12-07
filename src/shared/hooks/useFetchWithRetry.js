import { useState, useEffect } from "react";

/**
 * Custom hook to fetch data with automatic retry on failure
 * @param {Function} fetchFunction - The API function to call
 * @param {Array} dependencies - Dependencies array for useEffect
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @returns {Object} { data, loading, error, refetch }
 */
export const useFetchWithRetry = (fetchFunction, dependencies = [], maxRetries = 3) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchFunction();
      setData(response.data?.data || response.data || response);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error(`Fetch error (attempt ${retryCount + 1}/${maxRetries}):`, err);
      
      if (retryCount < maxRetries - 1) {
        // Retry after a delay (exponential backoff)
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, delay);
      } else {
        // Max retries reached
        setError(err.response?.data?.message || err.message || "Không thể tải dữ liệu");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [...dependencies, retryCount]);

  const refetch = () => {
    setRetryCount(0);
    fetchData();
  };

  return { data, loading, error, refetch };
};

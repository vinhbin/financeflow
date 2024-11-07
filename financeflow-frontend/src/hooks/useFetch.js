// src/hooks/useFetch.js
import { useState, useEffect } from 'react';
import api from '../utils/api'; // Import the configured Axios instance

const useFetch = (url, config = {}, trigger = false) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!!url); // Initialize as true if URL is provided
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return; // Exit if no URL is provided

    let isMounted = true; // Prevent state updates if the component is unmounted

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api(url, config); // Use the configured Axios instance
        if (isMounted) {
          setData(response.data);
          setError(null);
        }
      } catch (err) {
        console.error('useFetch Error:', err.response ? err.response.data : err.message);
        if (isMounted) {
          setError(err.response ? err.response.data.error : err.message);
          setData(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false; // Cleanup flag on unmount
    };
  }, [url, config, trigger]); // Re-run when URL, config, or trigger changes

  return { data, loading, error };
};

export default useFetch;

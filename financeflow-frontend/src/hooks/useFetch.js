// src/hooks/useFetch.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const useFetch = (url, config, trigger = false) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!!url); // Set to true if URL is provided
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return;

    let isMounted = true; // To prevent state updates on unmounted components

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios(url, config);
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
      isMounted = false; // Clean up flag on unmount
    };
  }, [url, config, trigger]); // Re-run when URL, config, or trigger changes

  return { data, loading, error };
};

export default useFetch;

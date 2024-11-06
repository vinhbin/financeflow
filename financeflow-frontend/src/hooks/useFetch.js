// src/hooks/useFetch.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return; // Skip if no URL

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios(url, options);
        setData(response.data);
      } catch (err) {
        if (err.response) {
          // Server responded with a status other than 2xx
          setError(err.response.data.error || err.response.data.message || 'An error occurred');
        } else if (err.request) {
          // Request was made but no response received
          setError('No response from server');
        } else {
          // Something else caused the error
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, options]);

  return { data, loading, error };
};

export default useFetch;

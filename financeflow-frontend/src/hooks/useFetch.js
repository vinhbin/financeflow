// useFetch.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

const useFetch = (path) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`Fetching: ${API_BASE_URL}${path}`); // Log the full URL
        const response = await axios.get(`${API_BASE_URL}${path}`);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error); // Log the error
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [path]);

  return { data, loading, error };
};

export default useFetch;
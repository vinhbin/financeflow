// src/hooks/useFetch.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../utils/api'; // Ensure this is your configured Axios instance

const useFetch = (url, config = {}, trigger = false) => {
  const [data, setData] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(!!url); // True if URL is provided
  const [isRefetching, setIsRefetching] = useState(false); // Indicates if a refetch is in progress
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) {
      console.log('useFetch: No URL provided, skipping fetch.');
      return; // Exit if no URL is provided
    }

    const source = axios.CancelToken.source(); // Create a cancel token

    const fetchData = async () => {
      if (data) {
        setIsRefetching(true); // Start refetching
      } else {
        setIsInitialLoading(true); // Start initial loading
      }

      console.log(`useFetch: Starting fetch for ${url}`);
      try {
        const response = await api({
          url,
          ...config,
          cancelToken: source.token, // Attach the cancel token
        });
        console.log(`useFetch: Fetch successful for ${url}`, response.data);
        setData(response.data);
        setError(null);
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log(`useFetch: Fetch canceled for ${url}`);
        } else {
          console.error(`useFetch: Error fetching ${url}:`, err.response ? err.response.data : err.message);
          setError(err.response ? err.response.data.error : err.message);
          // Optionally retain previous data instead of setting it to null
        }
      } finally {
        if (data) {
          setIsRefetching(false); // Refetch completed
        } else {
          setIsInitialLoading(false); // Initial load completed
        }
        console.log(`useFetch: Fetch completed for ${url}`);
      }
    };

    fetchData();

    return () => {
      console.log(`useFetch: Canceling fetch for ${url}`);
      source.cancel(`Fetch canceled for ${url}`);
    };
  }, [url, config, trigger]); // Include 'trigger' in dependency array

  return { data, isLoading: isInitialLoading || isRefetching, error };
};

export default useFetch;

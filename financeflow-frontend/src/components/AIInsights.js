import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const AIInsights = ({ userID }) => {
  const [insight, setInsight] = useState('');

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/ai-insights/generate`, { userID });
        setInsight(response.data.insight);
      } catch (error) {
        console.error('Error fetching AI insights:', error);
      }
    };

    fetchInsights();
}, [userID]);


  return (
    <div>
      <h3>Your AI Financial Insight</h3>
      {insight ? <p>{insight}</p> : <p>Loading insights...</p>}
    </div>
  );
};

export default AIInsights;

// src/components/AIInsights.js
import React from 'react';
import useFetch from '../hooks/useFetch';

const AIInsights = ({ userID }) => {
  const { data: insight, loading, error } = useFetch('/api/ai-insights/generate', {
    method: 'POST',
    data: { userID },
  });

  if (loading) return <p>Loading insights...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h3>Your AI Financial Insight</h3>
      <p>{insight}</p>
    </div>
  );
};

export default AIInsights;

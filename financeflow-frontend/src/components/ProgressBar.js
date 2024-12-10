// src/components/ProgressBar.js
import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ progress }) => {
  const getColor = (progress) => {
    if (progress < 50) return '#e74c3c'; // Red
    if (progress < 75) return '#f1c40f'; // Yellow
    return '#2ecc71'; // Green
  };

  return (
    <div className="progress-bar">
      <div
        className="progress-bar-fill"
        style={{ width: `${progress}%`, backgroundColor: getColor(progress) }}
      ></div>
    </div>
  );
};

export default ProgressBar;

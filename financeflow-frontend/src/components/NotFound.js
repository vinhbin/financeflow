// src/components/NotFound.js
import React from 'react';
import './NotFound.css'; // Ensure this CSS file exists

const NotFound = () => {
  return (
    <div className="not-found-container">
      <h2>404 - Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
};

export default NotFound;

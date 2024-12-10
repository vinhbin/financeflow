// src/components/Card.js
import React from 'react';
import './Card.css';

// Wrap the Card component with React.forwardRef
const Card = React.forwardRef(({ title, children, className }, ref) => (
  <div className={`card ${className ? className : ''}`} ref={ref}>
    <h3>{title}</h3>
    <div className="card-content">{children}</div>
  </div>
));

export default React.memo(Card); // Optional: Memoize for performance

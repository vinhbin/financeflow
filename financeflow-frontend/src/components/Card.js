// src/components/Card.js
import React from 'react';
import './Card.css';

const Card = ({ title, children, className }) => (
  <div className={`card ${className ? className : ''}`}>
    <h3>{title}</h3>
    <div className="card-content">{children}</div>
  </div>
);

export default Card;

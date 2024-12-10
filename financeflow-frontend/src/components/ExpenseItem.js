// src/components/ExpenseItem.js
import React, { useState, useEffect, useRef } from 'react';
import './ExpenseItem.css'; // Import the CSS specific to ExpenseItem

const ExpenseItem = ({ expense, categories, currencySymbol, onDelete }) => {
  const [isShifted, setIsShifted] = useState(false);
  const expenseRef = useRef(null);

  const handleArrowClick = (e) => {
    e.stopPropagation();
    setIsShifted(!isShifted);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(expense.expenseID);
  };

  const handleClickOutside = (e) => {
    if (expenseRef.current && !expenseRef.current.contains(e.target)) {
      setIsShifted(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);

  // **Retrieve Category Name Dynamically**
  const categoryName = categories[expense.categoryID] || 'Unknown Category';

  return (
    <li
      ref={expenseRef}
      className={`expense-item ${isShifted ? 'shifted' : ''}`}
    >
      <div className="expense-content">
        <div className="expense-info">
          <div className="expense-row">
            <span className="expense-description">{expense.description}</span>
            <span className="expense-date">
              {new Date(expense.date).toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: '2-digit',
              })}
            </span>
          </div>
          <div className="expense-details">
            <span className="expense-category">
              {categoryName}
            </span>
            <span className="expense-amount">
              {currencySymbol(expense.currency || 'USD')}
              {Number(expense.amount).toFixed(2)}
            </span>
          </div>
        </div>
        {/* Arrow icon on the right */}
        <span className="expense-arrow" onClick={handleArrowClick}>
          &#x2190; {/* Unicode for left arrow */}
        </span>
      </div>
      {/* Delete button */}
      <button className="expense-delete-button" onClick={handleDeleteClick}>
        X
      </button>
    </li>
  );
};

export default ExpenseItem;

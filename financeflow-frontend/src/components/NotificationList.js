// src/components/NumberRoll.js
import React, { useEffect, useState } from 'react';
import './NumberRoll.css'; // Ensure the updated CSS is imported

const NumberRoll = ({ value }) => {
  const [digits, setDigits] = useState([]);

  useEffect(() => {
    const valueStr = value.toFixed(2); // Ensuring two decimal places
    const newDigits = valueStr.split('');
    
    // Initialize digits on first render
    if (digits.length === 0) {
      const initialDigits = newDigits.map((digit) => ({
        current: digit,
        target: digit,
        animating: false,
      }));
      setDigits(initialDigits);
    } else {
      // Update digits with animation flags
      const updatedDigits = newDigits.map((digit, index) => {
        const prevDigit = digits[index]?.current || '0';
        if (digit !== prevDigit) {
          return { current: prevDigit, target: digit, animating: true };
        } else {
          return { current: digit, target: digit, animating: false };
        }
      });
      setDigits(updatedDigits);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Handler to finalize the animation
  const handleAnimationEnd = (index) => {
    setDigits((prevDigits) => {
      const newDigits = [...prevDigits];
      newDigits[index] = { current: newDigits[index].target, target: newDigits[index].target, animating: false };
      return newDigits;
    });
  };

  return (
    <span className="number-roll">
      {digits.map((digitObj, index) => (
        <span key={index} className="digit">
          <span
            className={`digit-inner ${digitObj.animating ? 'animate' : ''}`}
            onTransitionEnd={() => handleAnimationEnd(index)}
          >
            <span className="digit-current">{digitObj.current}</span>
            <span className="digit-target">{digitObj.target}</span>
          </span>
        </span>
      ))}
    </span>
  );
};

export default NumberRoll;

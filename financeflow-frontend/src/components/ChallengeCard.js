// src/components/ChallengeCard.js
import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import Card from './Card';
import './ChallengeCard.css';
import { toast } from 'react-toastify';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import './ScrollableContainer.css'; // Ensure this CSS file exists and defines .scrollable-container

const ChallengeCard = () => {
  const [challenges, setChallenges] = useState([]);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false); // To disable button during generation
  const [showDeleteAll, setShowDeleteAll] = useState(false); // To toggle Delete All button
  const cardRef = useRef(null);

  // Fetch challenges from the backend
  const fetchChallenges = async () => {
    try {
      const response = await api.get('/api/challenges');
      if (response.data.challenges) {
        setChallenges(response.data.challenges);
      } else {
        setChallenges([]);
      }
    } catch (err) {
      console.error('Error fetching challenges:', err.response?.data || err.message);
      setError('Failed to fetch challenges');
      toast.error('Failed to fetch challenges');
    }
  };

  // Generate new challenges via the backend
  const generateChallenges = async () => {
    setGenerating(true);
    setError('');
    try {
      const response = await api.post('/api/challenges/generate');
      if (response.data.challenges && response.data.challenges.length > 0) {
        // Append new challenges to the existing list, ensuring max 20
        setChallenges((prevChallenges) => {
          const combined = [...prevChallenges, ...response.data.challenges];
          // Remove duplicates based on description
          const unique = [];
          const descriptions = new Set();
          for (let c of combined) {
            const descLower = c.description.toLowerCase();
            if (!descriptions.has(descLower)) {
              descriptions.add(descLower);
              unique.push(c);
            }
          }
          return unique.slice(-20); // Keep the latest 20
        });
        toast.success('New challenges generated!');
      } else if (response.data.message) {
        toast.info(response.data.message);
      } else {
        setChallenges([]);
        toast.info('No challenges were generated.');
      }
    } catch (err) {
      console.error('Error generating challenges:', err.response?.data || err.message);
      setError('Failed to generate challenges');
      toast.error('Failed to generate challenges');
    } finally {
      setGenerating(false);
      fetchChallenges(); // Refresh challenges after generation
    }
  };

  // Complete a challenge
  const completeChallenge = async (challengeID) => {
    try {
      await api.put(`/api/challenges/${challengeID}/complete`);
      // Remove the challenge from the list after 3 seconds with animation
      setTimeout(() => {
        setChallenges((prevChallenges) => prevChallenges.filter((c) => c.challengeID !== challengeID));
      }, 3000);
      toast.success('Challenge completed!');
    } catch (err) {
      console.error('Error completing challenge:', err.response?.data || err.message);
      setError('Failed to complete challenge');
      toast.error('Failed to complete challenge');
    }
  };

  // Delete all challenges without confirmation
  const deleteAllChallenges = async () => {
    try {
      await api.delete('/api/challenges/delete-all');
      setChallenges([]);
      toast.success('All challenges deleted successfully!');
      setShowDeleteAll(false); // Hide the delete button after deletion
    } catch (err) {
      console.error('Error deleting all challenges:', err.response?.data || err.message);
      setError('Failed to delete all challenges');
      toast.error('Failed to delete all challenges');
    }
  };

  useEffect(() => {
    fetchChallenges();

    // Event listener to close the delete button when clicking outside
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setShowDeleteAll(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle checkbox change
  const handleCheckboxChange = (e, challengeID) => {
    if (e.target.checked) {
      completeChallenge(challengeID);
    }
  };

  // Handle arrow click to toggle Delete All button
  const handleArrowClick = () => {
    setShowDeleteAll(!showDeleteAll);
  };

  return (
    <Card title="Weekly Challenges" ref={cardRef} className="challenge-card">
      {/* Container for Arrow and Delete Button */}
      <div className="arrow-delete-container">
        {/* Delete All Challenges Text */}
        <span
          className={`delete-all-text ${showDeleteAll ? 'visible' : ''}`}
          onClick={deleteAllChallenges}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter') deleteAllChallenges();
          }}
          aria-label="Delete All Challenges"
        >
          Delete All Challenges
        </span>

        {/* Arrow Button */}
        <button
          className={`arrow-button ${showDeleteAll ? 'arrow-left' : ''}`}
          onClick={handleArrowClick}
          aria-label="Toggle Delete All Challenges"
        >
          {showDeleteAll ? '▲' : '▼'}
        </button>
      </div>

      {/* Error Message */}
      {error && <p className="error-message">{error}</p>}

      {/* Generate Challenges Button */}
      <button className="glass-button" onClick={generateChallenges} disabled={generating}>
        {generating ? 'Generating...' : 'Generate Challenges'}
      </button>

      {/* Challenges List */}
      <div className="challenge-list scrollable-container">
        <TransitionGroup>
          {challenges.map((challenge) => (
            <CSSTransition key={challenge.challengeID} timeout={300} classNames="challenge" unmountOnExit>
              <div className="challenge-item">
                <label>
                  <input
                    type="checkbox"
                    onChange={(e) => handleCheckboxChange(e, challenge.challengeID)}
                  />
                  {challenge.description}
                </label>
              </div>
            </CSSTransition>
          ))}
        </TransitionGroup>
        {challenges.length === 0 && <p>No challenges available. Generate a new challenge!</p>}
      </div>
    </Card>
  );
};

export default ChallengeCard;

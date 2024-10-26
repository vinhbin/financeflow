import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import Expenses from './components/Expenses';
import PlaidLinkButton from './components/PlaidLinkButton';
import AIInsights from './components/AIInsights';
import TransactionsList from './components/TransactionsList';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userID, setUserID] = useState(null);

  // Check if user is authenticated and retrieve userID
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userIDFromStorage = localStorage.getItem('userID');
    setIsLoggedIn(!!token);
    setUserID(userIDFromStorage);
  }, []);

  // Mock function to log out
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userID');
    localStorage.removeItem('userName');
    setIsLoggedIn(false);
    setUserID(null);
  };

  return (
    <Router>
      <div>
        {/* Logout button for authenticated users */}
        {isLoggedIn && (
          <button onClick={handleLogout} style={{ float: 'right', margin: '10px' }}>
            Logout
          </button>
        )}
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={isLoggedIn ? <Dashboard userID={userID} /> : <Navigate to="/login" />}
          />
          <Route
            path="/expenses"
            element={isLoggedIn ? <Expenses userID={userID} /> : <Navigate to="/login" />}
          />
          <Route
            path="/plaid-link"
            element={isLoggedIn ? <PlaidLinkButton userID={userID} /> : <Navigate to="/login" />}
          />
          <Route
            path="/ai-insights"
            element={isLoggedIn ? <AIInsights userID={userID} /> : <Navigate to="/login" />}
          />
          <Route
            path="/transactions"
            element={isLoggedIn ? <TransactionsList userID={userID} /> : <Navigate to="/login" />}
          />

          {/* Default Route */}
          <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

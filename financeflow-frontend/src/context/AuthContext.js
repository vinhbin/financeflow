// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Create the AuthContext with default values
export const AuthContext = createContext({
  isAuthenticated: false,
  userID: null,
  userName: null,
  login: () => {},
  logout: () => {},
});

// Define the AuthProvider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userID, setUserID] = useState(null);
  const [userName, setUserName] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state to handle async initialization
  const navigate = useNavigate();

  // Initialize authentication state from localStorage
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const storedUserID = localStorage.getItem('userID');
      const storedUserName = localStorage.getItem('userName');

      if (token && storedUserID && storedUserName) {
        setIsAuthenticated(true);
        setUserID(storedUserID);
        setUserName(storedUserName);
        console.log('AuthProvider: User is authenticated.');
      } else {
        setIsAuthenticated(false);
        setUserID(null);
        setUserName(null);
        console.log('AuthProvider: No authenticated user.');
      }
    } catch (error) {
      console.error('AuthProvider: Error accessing localStorage:', error);
      // Optionally, handle errors (e.g., clear invalid localStorage entries)
    } finally {
      setLoading(false); // Set loading to false after initialization
    }
  }, []);

  // Function to handle login
  const login = (token, userID, userName) => {
    console.log('AuthContext: login function called with:', { token, userID, userName });
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('userID', userID);
      localStorage.setItem('userName', userName);
      setIsAuthenticated(true);
      setUserID(userID);
      setUserName(userName);
      console.log(`AuthProvider: User logged in with userID: ${userID} and userName: ${userName}`);
    } catch (error) {
      console.error('AuthProvider: Error setting localStorage:', error);
      // Optionally, handle errors (e.g., notify user)
    }
  };

  // Function to handle logout
  const logout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('userID');
      localStorage.removeItem('userName');
      setIsAuthenticated(false);
      setUserID(null);
      setUserName(null);
      console.log('AuthProvider: User logged out.');
      navigate('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error('AuthProvider: Error removing from localStorage:', error);
      // Optionally, handle errors
    }
  };

  // If still loading, show a loading indicator
  if (loading) {
    return <div>Loading...</div>; // You can replace this with a spinner or a more sophisticated loader
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userID, userName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

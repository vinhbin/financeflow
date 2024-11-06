// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

// Create the AuthContext with default values
export const AuthContext = createContext({
  token: null,
  userID: null,
  userName: null,
  login: () => {},
  logout: () => {},
});

// Define the AuthProvider component
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [userID, setUserID] = useState(null);
  const [userName, setUserName] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state to handle async initialization

  // Initialize authentication state from localStorage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUserID = localStorage.getItem('userID');
      const storedUserName = localStorage.getItem('userName');

      if (storedToken && storedUserID && storedUserName) {
        setToken(storedToken);
        setUserID(storedUserID);
        setUserName(storedUserName);
        console.log('AuthProvider: User is authenticated.');
      } else {
        setToken(null);
        setUserID(null);
        setUserName(null);
        console.log('AuthProvider: No authenticated user.');
      }
    } catch (error) {
      console.error('AuthProvider: Error accessing localStorage:', error);
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
      setToken(token);
      setUserID(userID);
      setUserName(userName);
      console.log(`AuthProvider: User logged in with userID: ${userID} and userName: ${userName}`);
    } catch (error) {
      console.error('AuthProvider: Error setting localStorage:', error);
    }
  };

  // Function to handle logout
  const logout = () => {
    console.log('AuthContext: logout function called.');
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('userID');
      localStorage.removeItem('userName');
      setToken(null);
      setUserID(null);
      setUserName(null);
      console.log('AuthProvider: User logged out.');
    } catch (error) {
      console.error('AuthProvider: Error removing from localStorage:', error);
    }
  };

  // If still loading, show a loading indicator
  if (loading) {
    return <div>Loading...</div>; // Replace with a spinner or a more sophisticated loader if desired
  }

  return (
    <AuthContext.Provider value={{ token, userID, userName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

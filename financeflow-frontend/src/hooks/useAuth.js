// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userID, setUserID] = useState(null);
  const [userName, setUserName] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserID = localStorage.getItem('userID');
    const storedUserName = localStorage.getItem('userName');

    if (token && storedUserID) {
      setIsAuthenticated(true);
      setUserID(storedUserID);
      setUserName(storedUserName);
    } else {
      setIsAuthenticated(false);
      setUserID(null);
      setUserName(null);
    }
  }, []);

  const login = (token, userID, userName) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userID', userID);
    localStorage.setItem('userName', userName);
    setIsAuthenticated(true);
    setUserID(userID);
    setUserName(userName);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userID');
    localStorage.removeItem('userName');
    setIsAuthenticated(false);
    setUserID(null);
    setUserName(null);
    navigate('/login');
  };

  return { isAuthenticated, userID, userName, login, logout };
};

export default useAuth;

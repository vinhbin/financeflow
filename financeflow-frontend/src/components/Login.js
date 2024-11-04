// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Login.css'; // External CSS file for styling

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(''); // Reset message on new login attempt

    try {
      // Make a POST request to the backend API
      const response = await api.post('/api/users/login', { email, password });
      
      // Store the token, userID, and email in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userID', response.data.userID);
      localStorage.setItem('userName', email);

      // Set success message and navigate to dashboard
      setMessage('Login successful!');
      console.log("Redirecting to dashboard...");
      navigate('/dashboard');
      console.log("Token set in localStorage:", localStorage.getItem('token')); // Debugging line
    } catch (error) {
      console.error('Error logging in:', error.response ? error.response.data : error.message);
      setMessage(error.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };
  
  return (
    <div className="login-container">
      <h1 className="login-title">FinanceFlow</h1>
      <div className="login-form">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="glass-button">Login</button>
        </form>

        {/* Display success or error message */}
        <p>{message}</p>

        {/* Link to register page */}
        <p>Don't have an account? 
          <button className="glass-button" onClick={() => navigate('/register')}>
            Register Here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;

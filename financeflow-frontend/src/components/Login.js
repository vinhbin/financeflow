import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import './Login.css';  // External CSS file for styling

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userID', response.data.userID);
      localStorage.setItem('userName', email);
      setMessage('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      setMessage('Login failed. Please try again.');
      console.error('Error logging in:', error);
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
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="glass-button">Login</button>
        </form>

        <p>{message}</p>

        <p>Don't have an account? <button className="glass-button" onClick={() => navigate('/register')}>Register Here</button></p>
      </div>
    </div>
  );
};

export default Login;

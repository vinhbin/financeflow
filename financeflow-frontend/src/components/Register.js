// src/components/Register.js
import React, { useState } from 'react';
import api from '../utils/api'; // Import the axios instance for API calls

const Register = () => {
  const [name, setName] = useState(''); // State for storing name
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    
    console.log('Registering with:', { name, email, password }); // Debugging log

    try {
      // Send name, email, and password to the backend
      const response = await api.post('/api/users/register', { name, email, password });
      console.log('Registration successful:', response.data);
      setMessage('Registration successful!');
    } catch (error) {
      console.error('Error registering:', error.response ? error.response.data : error.message);
      setMessage(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div>
      <form onSubmit={handleRegister}>
        <div>
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default Register;

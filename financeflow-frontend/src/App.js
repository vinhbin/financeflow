// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import Layout from './components/Layout'; // Import Layout
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import LinkAccount from './components/LinkAccount';
import AddExpense from './components/AddExpense';
import NotFound from './components/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Root Route: Redirect to /login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Layout Route: Wrap all other routes */}
          <Route path="/" element={<Layout />}>
            {/* Authentication Routes */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            {/* Protected Routes */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="link-account" element={<LinkAccount />} />
            <Route path="add-expense" element={<AddExpense />} />

            {/* Catch-All Route for 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

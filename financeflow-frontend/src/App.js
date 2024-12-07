// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import RequestReset from './components/RequestReset';
import ResetPassword from './components/ResetPassword';
import AddExpense from './components/AddExpense';
import NotFound from './components/NotFound';
import ProtectedRoute from './components/ProtectedRoute'; // Import the ProtectedRoute component

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
            
            {/* Request Reset Password Route */}
            <Route path="reset-password" element={<RequestReset />} />
            
            {/* Reset Password with Token Route */}
            <Route path="reset-password/:token" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="add-expense"
              element={
                <ProtectedRoute>
                  <AddExpense />
                </ProtectedRoute>
              }
            />

            {/* Catch-All Route for 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

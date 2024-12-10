// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Statistics from './components/Statistics'; // Import Statistics component
import Login from './components/Login';
import Register from './components/Register';
import RequestReset from './components/RequestReset';
import ResetPassword from './components/ResetPassword';
import AddExpense from './components/AddExpense';
import NotFound from './components/NotFound';
import ProtectedRoute from './components/ProtectedRoute'; // Import the ProtectedRoute component
import { AnimatePresence } from 'framer-motion'; // Import AnimatePresence

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    // AnimatePresence enables exit animations when components are removed from the tree
    <AnimatePresence mode="wait"> {/* Updated prop from exitBeforeEnter to mode="wait" */}
      <Routes location={location} key={location.pathname}>
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
          <Route
            path="statistics"
            element={
              <ProtectedRoute>
                <Statistics />
              </ProtectedRoute>
            }
          />

          {/* Catch-All Route for 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AnimatedRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;

// src/components/Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import './Layout.css'; // Ensure the import matches the file name

const Layout = () => {
  return (
    <div className="layout-container">
      {/* Gradient Background */}
      <div className="gradient-bg">
        <div className="g1"></div>
        <div className="g2"></div>
        <div className="g3"></div>
        <div className="g4"></div>
        <div className="g5"></div>
        <div className="interactive"></div>
      </div>
      
      {/* Main Content */}
      <div className="content">
        <Outlet /> {/* Render nested routes here */}
      </div>
    </div>
  );
};

export default Layout;

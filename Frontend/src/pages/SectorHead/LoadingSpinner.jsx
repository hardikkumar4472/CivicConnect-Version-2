import React from 'react';

const LoadingSpinner = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: '#0a192f',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  }}>
    <div style={{
      width: '50px',
      height: '50px',
      border: '5px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '50%',
      borderTopColor: '#64ffda',
      animation: 'spin 1s ease-in-out infinite',
      marginBottom: '20px',
    }}></div>
    <p style={{ fontSize: '1.1rem', color: '#64ffda' }}>Loading your dashboard...</p>
  </div>
);

export default LoadingSpinner;
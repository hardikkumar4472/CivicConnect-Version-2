import React from 'react';

const StatusFilterBar = ({ activeStatus, setActiveStatus }) => {
  const statuses = ['Pending', 'In Progress', 'Resolved', 'Escalated', 'Closed'];
  
  const statusStyles = {
    'Pending': { backgroundColor: 'rgba(255, 193, 7, 0.2)', color: '#ffc107' },
    'In Progress': { backgroundColor: 'rgba(33, 150, 243, 0.2)', color: '#2196f3' },
    'Resolved': { backgroundColor: 'rgba(76, 175, 80, 0.2)', color: '#4caf50' },
    'Escalated': { backgroundColor: 'rgba(156, 39, 176, 0.2)', color: '#9c27b0' },
    'Closed': { backgroundColor: 'rgba(244, 67, 54, 0.2)', color: '#f44336' },
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
      marginBottom: '20px',
      flexWrap: 'wrap'
    }}>
      <button 
        style={{
          padding: '8px 16px',
          borderRadius: '20px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: '600',
          backgroundColor: !activeStatus ? '#64ffda' : '#1e2a47',
          color: !activeStatus ? '#0a192f' : '#64ffda',
          transition: 'all 0.3s ease'
        }}
        onClick={() => setActiveStatus(null)}
      >
        All Issues
      </button>
      {statuses.map(status => (
        <button
          key={status}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            backgroundColor: activeStatus === status ? statusStyles[status].color : statusStyles[status].backgroundColor,
            color: activeStatus === status ? '#0a192f' : statusStyles[status].color,
            transition: 'all 0.3s ease'
          }}
          onClick={() => setActiveStatus(status)}
        >
          {status}
        </button>
      ))}
    </div>
  );
};

export default StatusFilterBar;
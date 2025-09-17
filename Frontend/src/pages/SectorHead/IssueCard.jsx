import React from 'react';

const IssueCard = ({ issue, isSelected, onClick }) => {
  // Status mapping to match your backend enum
  const statusMap = {
    'Pending': 'pending',
    'In Progress': 'in-progress',
    'Resolved': 'resolved',
    'Escalated': 'escalated',
    'Closed': 'closed'
  };

  // Reverse mapping for display
  const displayStatusMap = {
    'pending': 'Pending',
    'in-progress': 'In Progress',
    'resolved': 'Resolved',
    'escalated': 'Escalated',
    'closed': 'Closed'
  };

  const statusStyles = {
    'Pending': { backgroundColor: 'rgba(255, 193, 7, 0.2)', color: '#ffc107' },
    'In Progress': { backgroundColor: 'rgba(33, 150, 243, 0.2)', color: '#2196f3' },
    'Resolved': { backgroundColor: 'rgba(76, 175, 80, 0.2)', color: '#4caf50' },
    'Escalated': { backgroundColor: 'rgba(156, 39, 176, 0.2)', color: '#9c27b0' },
    'Closed': { backgroundColor: 'rgba(244, 67, 54, 0.2)', color: '#f44336' },
  };

  // Convert backend status to display format
  const displayStatus = displayStatusMap[issue.status] || issue.status;

  return (
    <div
      style={{
        background: '#1e2a47',
        borderRadius: '30px',
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
        border: isSelected ? '2px solid #64ffda' : '2px solid transparent',
      }}
      onClick={onClick}
    >
      <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
        <img
          src={issue.imageUrl || "https://via.placeholder.com/300x150?text=No+Image"}
          alt={issue.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'all 0.3s ease',
            filter: isSelected ? 'brightness(1.1)' : 'brightness(1)',
            transform: isSelected ? 'scale(1.05)' : 'scale(1)',
          }}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x150?text=No+Image";
          }}
        />
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '5px 10px',
          borderRadius: '20px',
          fontSize: '0.7rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          ...statusStyles[displayStatus]
        }}>
          {displayStatus}
        </div>
      </div>
      <div style={{ padding: '15px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ margin: '0 0 10px', color: '#ffffffff', fontSize: '1.1rem' }}>{issue.title}</h3>
        <p style={{ color: '#eaff00ff', fontSize: '0.9rem', marginBottom: '15px', lineHeight: '1.5', flexGrow: 1 }}>
          {issue.description.length > 100 
            ? `${issue.description.substring(0, 100)}...` 
            : issue.description}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <p style={{ color: '#64ffda', fontSize: '0.8rem', margin: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <i className="far fa-calendar-alt"></i> {new Date(issue.createdAt).toLocaleDateString()}
          </p>
          <p style={{ color: '#8892b0', fontSize: '0.7rem', fontFamily: 'monospace', margin: 0 }}>
            ID: {issue._id.substring(0, 6)}...
          </p>
        </div>
      </div>
    </div>
  );
};
export default IssueCard;
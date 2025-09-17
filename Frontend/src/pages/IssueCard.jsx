import React from "react";

export default function IssueCard({
  issue,
  isSelected,
  onClick,
  onFeedbackClick,
  feedback
}) {
  const statusColors = {
    'pending': '#FFA500',
    'in-progress': '#1E90FF',
    'resolved': '#32CD32',
    'escalated': '#FF4500',
    'closed': '#808080'
  };

  const normalizeStatus = (status) => {
    return status ? status.toLowerCase().replace(/\s+/g, '-') : '';
  };

  const status = normalizeStatus(issue.status);
  const statusColor = statusColors[status] || '#CCCCCC';

  return (
    <div
      className="issue-card"
      onClick={onClick}
      style={{
        backgroundColor: isSelected ? '#233554' : '#112240',
        borderRadius: '20px',
        padding: '15px',
        cursor: 'pointer',
        borderLeft: `4px solid ${statusColor}`,
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        <h3 style={{
          margin: 0,
          color: '#64ffda',
          fontSize: '1.7rem',
          fontWeight: '600'
        }}>
          {issue.category}
        </h3>
        <span style={{
          backgroundColor: statusColor,
          color: '#fff',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '0.7rem',
          fontWeight: '600',
          textTransform: 'capitalize'
        }}>
          {issue.status}
        </span>
      </div>
      
      <p style={{
        color: '#8892b0',
        fontSize: '0.9rem',
        margin: '8px 0',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {issue.description}
      </p>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '15px',
        fontSize: '0.8rem',
        color: '#64ffda'
      }}>
        <span>
          <i className="fas fa-calendar-alt" style={{ marginRight: '5px' }}></i>
          {new Date(issue.createdAt).toLocaleDateString()}
        </span>
        <span>
          <i className="fas fa-map-marker-alt" style={{ marginRight: '5px' }}></i>
          {issue.sector}
        </span>
      </div>

      {issue.status?.toLowerCase() === 'closed' && !issue.hasFeedback && (
        <div style={{ marginTop: '15px', borderTop: '1px solid #233554', paddingTop: '10px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFeedbackClick && onFeedbackClick();
            }}
            style={{
              width: '100%',
              padding: '8px',
              background: '#64ffda',
              color: '#0a192f',
              border: 'none',
              borderRadius: '100px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px'
            }}
          >
            <i className="fas fa-star"></i>
            Provide Rating
          </button>
        </div>
      )}

      {issue.status?.toLowerCase() === 'closed' && issue.hasFeedback && (
        <div style={{ marginTop: '15px', borderTop: '1px solid #233554', paddingTop: '10px' }}>
          <div style={{
            width: '100%',
            padding: '8px',
            background: '#233554',
            color: '#64ffda',
            borderRadius: '4px',
            fontWeight: '600',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            border: '1px solid #64ffda'
          }}>
            <i className="fas fa-check-circle"></i>
            Feedback Submitted Successfully
          </div>
        </div>
      )}
    </div>
  );
}
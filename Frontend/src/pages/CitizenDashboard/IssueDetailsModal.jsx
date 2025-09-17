import React from "react";

export default function IssueDetailsModal({ selectedIssue, onClose, isCitizenView, feedback }) {
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

  const status = normalizeStatus(selectedIssue.status);
  const statusColor = statusColors[status] || '#CCCCCC';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        backgroundColor: 'rgba(0,0,0,0)',
        borderRadius: '30px',
        padding: '25px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(30px)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #233554',
          paddingBottom: '15px'
        }}>
          <h2 style={{
            color: '#64ffda',
            margin: 0,
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <i className="fas fa-exclamation-circle"></i>
            Issue Details
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#ccd6f6',
              fontSize: '1.5rem',
              cursor: 'pointer'
            }}
          >
            &times;
          </button>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '20px'
        }}>
          <div>
            <h3 style={{ color: '#ccd6f6', marginBottom: '10px' }}>Basic Information</h3>
            <div style={{ marginBottom: '15px' }}>
              <p style={{ color: '#8892b0', margin: '5px 0', fontSize: '0.9rem' }}>
                <strong style={{ color: '#ccd6f6' }}>Category:</strong> {selectedIssue.category}
              </p>
              <p style={{ color: '#8892b0', margin: '5px 0', fontSize: '0.9rem' }}>
                <strong style={{ color: '#ccd6f6' }}>Sector:</strong> {selectedIssue.sector}
              </p>
              <p style={{ color: '#8892b0', margin: '5px 0', fontSize: '0.9rem' }}>
                <strong style={{ color: '#ccd6f6' }}>House ID:</strong> {selectedIssue.houseId}
              </p>
              <p style={{ color: '#8892b0', margin: '5px 0', fontSize: '0.9rem' }}>
                <strong style={{ color: '#ccd6f6' }}>Reported On:</strong> {new Date(selectedIssue.createdAt).toLocaleString()}
              </p>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '15px'
            }}>
              <span style={{
                backgroundColor: statusColor,
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '30px',
                fontSize: '0.8rem',
                fontWeight: '600',
                textTransform: 'capitalize'
              }}>
                {selectedIssue.status}
              </span>
              
              {isCitizenView && selectedIssue.status.toLowerCase() === 'pending' && (
                <button
                  style={{
                    padding: '4px 10px',
                    borderRadius: '30px',
                    border: 'none',
                    background: '#ff6b6b',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}
                >
                  Request Escalation
                </button>
              )}
            </div>
          </div>
          
          <div>
            <h3 style={{ color: '#ccd6f6', marginBottom: '10px' }}>Location Details</h3>
            <p style={{ color: '#8892b0', margin: '5px 0', fontSize: '0.9rem' }}>
              <strong style={{ color: '#ccd6f6' }}>Address:</strong> {selectedIssue.address || 'Not specified'}
            </p>
            {selectedIssue.latitude && selectedIssue.longitude && (
              <p style={{ color: '#8892b0', margin: '5px 0', fontSize: '0.9rem' }}>
                <strong style={{ color: '#ccd6f6' }}>Coordinates:</strong> {selectedIssue.latitude}, {selectedIssue.longitude}
              </p>
            )}
            
            {selectedIssue.imageUrl && (
              <div style={{ marginTop: '15px' }}>
                <h4 style={{ color: '#ccd6f6', marginBottom: '10px', fontSize: '0.9rem' }}>
                  Attached Image:
                </h4>
                <img
                  src={selectedIssue.imageUrl}
                  alt="Issue"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '150px',
                    borderRadius: '30px',
                    border: '1px solid #233554'
                  }}
                />
              </div>
            )}
          </div>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#ccd6f6', marginBottom: '10px' }}>Description</h3>
          <div style={{
            backgroundColor: '#0a192f',
            padding: '15px',
            borderRadius: '30px',
            color: '#ccd6f6',
            lineHeight: '1.5'
          }}>
            {selectedIssue.description}
          </div>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#ccd6f6', marginBottom: '10px' }}>
            <i className="fas fa-comments" style={{ marginRight: '8px' }}></i>
            Updates from Sector Head
          </h3>
          <div style={{
            backgroundColor: '#0a192f',
            padding: '15px',
            borderRadius: '30px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {selectedIssue.comments && selectedIssue.comments.length > 0 ? (
              selectedIssue.comments.map((comment, index) => (
                <div key={index} style={{
                  marginBottom: '15px',
                  paddingBottom: '15px',
                  borderBottom: index < selectedIssue.comments.length - 1 ? '1px solid #233554' : 'none'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{
                        backgroundColor: '#64ffda',
                        color: '#0a192f',
                        padding: '4px 8px',
                        borderRadius: '30px',
                        fontSize: '0.7rem',
                        fontWeight: '600'
                      }}>
                        Sector Head
                      </span>
                      <span style={{ color: '#8892b0', fontSize: '0.8rem' }}>
                        {new Date(comment.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <p style={{ color: '#ccd6f6', margin: 0 }}>
                    {comment.text}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ color: '#8892b0', textAlign: 'center' }}>
                No updates from sector head yet.
              </p>
            )}
          </div>
        </div>

        {feedback && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#ccd6f6', marginBottom: '10px' }}>
              <i className="fas fa-star" style={{ marginRight: '8px', color: '#ffd700' }}></i>
              Your Feedback
            </h3>
            <div style={{
              backgroundColor: '#0a192f',
              padding: '15px',
              borderRadius: '30px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      style={{
                        fontSize: '20px',
                        color: star <= feedback.rating ? '#ffd700' : '#8892b0'
                      }}
                    >
                      {star <= feedback.rating ? '★' : '☆'}
                    </span>
                  ))}
                </div>
                <span style={{ color: '#ffd700' }}>({feedback.rating}/5)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
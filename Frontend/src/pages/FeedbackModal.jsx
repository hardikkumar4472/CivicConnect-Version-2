import React, { useState } from 'react';

export default function FeedbackModal({ issue, existingFeedback, onSubmit, onClose }) {
  const [rating, setRating] = useState(existingFeedback?.rating || 0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return;
    
    setSubmitting(true);
    try {
      await onSubmit( rating );
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#112240',
        padding: '25px',
        borderRadius: '30px',
        width: '90%',
        maxWidth: '500px',
        color: '#ccd6f6'
      }}>
        <h2 style={{ marginTop: 0, color: '#64ffda' }}>
          <i className="fas fa-star" style={{ marginRight: '10px' }}></i>
          Submit Feedback
        </h2>
        <p>For issue: <strong>{issue?.category}</strong></p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              Rate this issue (1-5 stars)
            </label>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '32px',
                    cursor: 'pointer',
                    color: star <= rating ? '#ffd700' : '#8892b0',
                    transition: 'transform 0.2s',
                    transform: star <= rating ? 'scale(1.1)' : 'scale(1)'
                  }}
                >
                  {star <= rating ? '★' : '☆'}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                borderRadius: '30px',
                border: 'none',
                background: '#ff6b6b',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rating === 0 || submitting}
              style={{
                padding: '10px 20px',
                borderRadius: '30px',
                border: 'none',
                background: '#64ffda',
                color: '#0a192f',
                cursor: 'pointer',
                fontSize: '16px',
                opacity: rating === 0 ? 0.6 : 1
              }}
            >
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Submitting...
                </>
              ) : (
                'Submit Rating'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
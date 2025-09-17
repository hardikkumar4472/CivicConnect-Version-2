import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BroadcastPage = () => {
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/sectorHead-login');
        return;
      }

      const response = await axios.post(
        'https://civicconnect-backend.onrender.com/api/sector-head/broadcast',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/sector-dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send broadcast');
      console.error('Broadcast error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            <i className="fas fa-bullhorn" style={styles.icon}></i> Send Broadcast Message
          </h2>
          <p style={styles.subtitle}>Send important announcements to all citizens in your sector</p>
        </div>
        
        {success ? (
          <div style={styles.successMessage}>
            <div style={styles.successContent}>
              <i className="fas fa-check-circle" style={styles.successIcon}></i>
              <h3 style={styles.successTitle}>Broadcast Sent Successfully!</h3>
              <p style={styles.successText}>Your message has been delivered to all citizens.</p>
              <div style={styles.loadingBar}>
                <div style={styles.loadingProgress}></div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label htmlFor="subject" style={styles.label}>
                Subject <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="Enter message subject"
                maxLength="100"
              />
              <div style={styles.charCount}>
                {formData.subject.length}/100 characters
              </div>
            </div>
            
            <div style={styles.formGroup}>
              <label htmlFor="message" style={styles.label}>
                Message <span style={styles.required}>*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                style={styles.textarea}
                placeholder="Type your broadcast message here..."
                rows="6"
                maxLength="1000"
              />
              <div style={styles.charCount}>
                {formData.message.length}/1000 characters
              </div>
            </div>
            
            {error && (
              <div style={styles.errorMessage}>
                <i className="fas fa-exclamation-circle" style={styles.errorIcon}></i> 
                <span>{error}</span>
              </div>
            )}
            
            <div style={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => navigate('/sectorHead-dashboard')}
                style={styles.cancelButton}
                disabled={loading}
              >
                <i className="fas fa-times"></i> Cancel
              </button>
              <button
                type="submit"
                style={loading ? styles.submitButtonDisabled : styles.submitButton}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Sending...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i> Send Broadcast
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        @keyframes progressBar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        
        body, html {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow-x: hidden;
          font-family: 'Poppins', sans-serif;
        }
        
        #root {
          height: 100%;
        }
        
        /* Input focus effects */
        input:focus, textarea:focus {
          border-color: #64ffda !important;
          box-shadow: 0 0 0 2px rgba(100, 255, 218, 0.3) !important;
        }
        
        /* Button hover effects */
        button:not(:disabled):hover {
          transform: translateY(-2px) !important;
        }
        
        button:not(:disabled):active {
          transform: translateY(0) !important;
        }
        
        /* Card animation */
        .broadcast-card {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#0a192f',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    fontFamily: "'Poppins', sans-serif",
    margin: 0,
    boxSizing: 'border-box',
    background: 'linear-gradient(135deg, #0a192f 0%, #0f2746 100%)',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '3px solid #233554',
    borderRadius: '16px',
    boxShadow: '0 0px 10px rgba(238, 238, 238, 0.4)',
    padding: '40px',
    width: '100%',
    maxWidth: '700px',
    color: '#ccd6f606',
    margin: '0 auto',
    animation: 'fadeIn 0.6s ease-out',
    backdropFilter: 'blur(30px)',
    transition: 'all 0.3s ease',
    ':hover': {
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
      transform: 'translateY(-5px)'
    }
  },
  header: {
    marginBottom: '30px',
    textAlign: 'center'
  },
  title: {
    color: '#64ffda',
    margin: '0 0 10px 0',
    fontSize: '1.8rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    textShadow: '0 0 10px rgba(100, 255, 218, 0.3)'
  },
  subtitle: {
    color: '#8892b0',
    margin: 0,
    fontSize: '0.95rem',
    opacity: 0.8
  },
  icon: {
    fontSize: '1.8rem',
    animation: 'pulse 2s infinite'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    position: 'relative'
  },
  label: {
    color: '#8892b0',
    fontSize: '0.95rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  required: {
    color: '#ff6b6b',
    fontSize: '1.2rem'
  },
  input: {
    padding: '14px 20px',
    borderRadius: '30px',
    border: '1px solid #233554',
    backgroundColor: 'rgba(10, 25, 47, 0.7)',
    color: '#e6f1ff',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.3s ease',
    width: '100%',
    boxSizing: 'border-box',
    ':focus': {
      borderColor: '#64ffda',
      boxShadow: '0 0 0 2px rgba(100, 255, 218, 0.3)'
    }
  },
  textarea: {
    padding: '14px 20px',
    borderRadius: '30px',
    border: '1px solid #233554',
    backgroundColor: 'rgba(10, 25, 47, 0.7)',
    color: '#e6f1ff',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.3s ease',
    resize: 'vertical',
    minHeight: '150px',
    width: '100%',
    boxSizing: 'border-box',
    lineHeight: '1.6',
    ':focus': {
      borderColor: '#64ffda',
      boxShadow: '0 0 0 2px rgba(100, 255, 218, 0.3)'
    }
  },
  charCount: {
    color: '#8892b0',
    fontSize: '0.8rem',
    textAlign: 'right',
    marginTop: '5px'
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px',
    marginTop: '20px',
  },
  cancelButton: {
    padding: '14px 25px',
    backgroundColor: 'transparent',
    color: '#ff6b6b',
    border: '1px solid #ff6b6b',
    borderRadius: '30px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600',
    ':hover:not(:disabled)': {
      backgroundColor: 'rgba(255, 107, 107, 0.1)',
      transform: 'translateY(-2px)',
      boxShadow: '0 5px 15px rgba(255, 107, 107, 0.2)'
    },
    ':disabled': {
      opacity: 0.6,
      cursor: 'not-allowed'
    }
  },
  submitButton: {
    padding: '14px 25px',
    background: 'linear-gradient(135deg, #1e2a47 0%, #233554 100%)',
    color: '#64ffda',
    border: 'none',
    borderRadius: '30px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(30, 42, 71, 0.4)',
    ':hover:not(:disabled)': {
      background: 'linear-gradient(135deg, #233554 0%, #1e2a47 100%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 20px rgba(30, 42, 71, 0.6)'
    },
    ':disabled': {
      cursor: 'not-allowed'
    }
  },
  submitButtonDisabled: {
    padding: '14px 25px',
    backgroundColor: '#1e2a47',
    color: '#64ffda',
    border: 'none',
    borderRadius: '12px',
    cursor: 'not-allowed',
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600',
    opacity: 0.7
  },
  errorMessage: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    color: '#ff6b6b',
    padding: '14px 20px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.9rem',
    border: '1px solid rgba(255, 107, 107, 0.3)',
    animation: 'fadeIn 0.3s ease-out'
  },
  errorIcon: {
    fontSize: '1.2rem'
  },
  successMessage: {
    backgroundColor: 'rgba(100, 255, 218, 0.1)',
    color: '#64ffda',
    padding: '30px',
    borderRadius: '12px',
    textAlign: 'center',
    fontSize: '1rem',
    border: '1px solid rgba(100, 255, 218, 0.3)',
    animation: 'fadeIn 0.5s ease-out'
  },
  successContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px'
  },
  successIcon: {
    fontSize: '3.5rem',
    color: '#64ffda',
    filter: 'drop-shadow(0 0 10px rgba(100, 255, 218, 0.5))'
  },
  successTitle: {
    margin: 0,
    fontSize: '1.5rem',
    color: '#64ffda'
  },
  successText: {
    margin: 0,
    color: '#8892b0',
    fontSize: '1rem'
  },
  loadingBar: {
    width: '100%',
    height: '4px',
    backgroundColor: 'rgba(100, 255, 218, 0.2)',
    borderRadius: '2px',
    marginTop: '20px',
    overflow: 'hidden'
  },
  loadingProgress: {
    height: '100%',
    width: '0%',
    backgroundColor: '#64ffda',
    borderRadius: '2px',
    animation: 'progressBar 2s linear forwards'
  }
};

export default BroadcastPage;

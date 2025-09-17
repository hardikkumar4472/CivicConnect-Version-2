import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const SectorHeadResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await axios.post(
        `https://civicconnect-backend.onrender.com/api/sector-head/reset-password/${token}`,
        { password }
      );
      
      toast.success('Password reset successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error resetting password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Reset Password</h2>
        <p style={styles.subtitle}>Enter your new password below</p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              style={styles.input}
              required
              minLength={6}
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              style={styles.input}
              required
              minLength={6}
            />
          </div>
          
          <button 
            type="submit" 
            style={styles.button} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span style={{ marginRight: '8px' }}>Resetting...</span>
                <i className="fas fa-spinner fa-spin"></i>
              </>
            ) : 'Reset Password'}
          </button>
        </form>
        
        <button 
          onClick={() => navigate('/')} 
          style={styles.backButton}
        >
          <i className="fas fa-arrow-left" style={{ marginRight: '8px' }}></i>
          Back to Login
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    padding: '20px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center'
  },
  title: {
    color: '#1a1a1a',
    marginBottom: '8px',
    fontSize: '28px',
    fontWeight: 'bold'
  },
  subtitle: {
    color: '#666',
    marginBottom: '30px',
    fontSize: '16px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '30px'
  },
  inputGroup: {
    textAlign: 'left'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#333',
    fontWeight: '500',
    fontSize: '14px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e1e5e9',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border-color 0.3s ease',
    boxSizing: 'border-box'
  },
  button: {
    backgroundColor: '#ff6b35',
    color: 'white',
    padding: '14px 24px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  backButton: {
    backgroundColor: 'transparent',
    color: '#666',
    padding: '12px 20px',
    border: '2px solid #e1e5e9',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};

export default SectorHeadResetPassword;

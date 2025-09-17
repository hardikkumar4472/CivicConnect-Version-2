import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const ResetPassword = () => {
  const { token } = useParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.width = '100%';
    document.body.style.overflowX = 'hidden';
    document.body.style.backgroundColor = '#0a0a0a';
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await axios.post(
        `https://civicconnect-backend.onrender.com/api/citizen/reset-password/${token}`,
        { password: formData.password }
      );
      
      toast.success(response.data.message || 'Password reset successfully!', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        theme: "dark",
        style: {
          background: '#1e293b',
          color: '#f8fafc',
        }
      });
      
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      if (err.response?.status === 400) {
        setIsValidToken(false);
        toast.error('Invalid or expired token. Please request a new password reset link.', {
          theme: "dark",
          style: {
            background: '#1e293b',
            color: '#f8fafc',
          }
        });
      } else {
        toast.error(err.response?.data?.message || 'Error resetting password. Please try again.', {
          theme: "dark",
          style: {
            background: '#1e293b',
            color: '#f8fafc',
          }
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={styles.container}
      >
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={styles.card}
        >
          <div style={styles.header}>
            <h2 style={styles.title}>Invalid Token</h2>
            <p style={styles.subtitle}>The password reset link is invalid or has expired</p>
          </div>
          <motion.button 
            onClick={() => navigate('/forgot-password')} 
            style={styles.button}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Request New Reset Link
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={styles.container}
    >
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        style={styles.card}
      >
        <div style={styles.header}>
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <h2 style={styles.title}>Reset Your Password</h2>
            <p style={styles.subtitle}>Create a new password for your account</p>
          </motion.div>
        </div>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <motion.div 
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            style={styles.inputGroup}
          >
            <label style={styles.label}>New Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter new password"
              style={{
                ...styles.input,
                ...(errors.password && styles.inputError)
              }}
              required
            />
            {errors.password && (
              <motion.span 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={styles.errorText}
              >
                {errors.password}
              </motion.span>
            )}
          </motion.div>
          
          <motion.div 
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            style={styles.inputGroup}
          >
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              style={{
                ...styles.input,
                ...(errors.confirmPassword && styles.inputError)
              }}
              required
            />
            {errors.confirmPassword && (
              <motion.span 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={styles.errorText}
              >
                {errors.confirmPassword}
              </motion.span>
            )}
          </motion.div>
          
          <motion.button 
            type="submit" 
            style={styles.button} 
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Resetting Password...
              </motion.span>
            ) : (
              'Reset Password'
            )}
          </motion.button>
        </form>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.3 }}
          style={styles.footer}
        >
          <motion.button 
            onClick={() => navigate('/')} 
            style={styles.secondaryButton}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Back to Login
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Animated background elements */}
      <motion.div 
        style={styles.orb1}
        animate={{
          x: [0, 20, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      <motion.div 
        style={styles.orb2}
        animate={{
          x: [0, -20, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
    </motion.div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100vw',
    padding: '20px',
    backgroundColor: '#0a0a0a',
    fontFamily: "'Inter', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: '30px',
    padding: '40px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
    width: '100%',
    maxWidth: '450px',
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    position: 'relative',
    zIndex: 2,
    backdropFilter: 'blur(10px)',
    background: 'rgba(17, 24, 39, 0.85)',
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    color: '#f8fafc',
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '12px',
    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '15px',
    marginBottom: '0',
    lineHeight: '1.5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  inputGroup: {
    textAlign: 'left',
    position: 'relative',
  },
  label: {
    display: 'block',
    marginBottom: '10px',
    color: '#e2e8f0',
    fontSize: '14px',
    fontWeight: '500',
  },
  input: {
    width: '93%',
    padding: '14px 16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '30px',
    fontSize: '15px',
    color: '#f8fafc',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    transition: 'all 0.3s ease',
    outline: 'none',
    ':focus': {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.2)',
    },
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  errorText: {
    display: 'block',
    marginTop: '8px',
    color: '#ef4444',
    fontSize: '13px',
    fontWeight: '500',
  },
  button: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
    color: 'white',
    border: 'none',
    borderRadius: '30px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '8px',
    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
    position: 'relative',
    overflow: 'hidden',
    ':hover': {
      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
    },
    ':disabled': {
      background: 'linear-gradient(90deg, #1e40af, #4c1d95)',
      cursor: 'not-allowed',
    },
  },
  secondaryButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '30px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    ':hover': {
      backgroundColor: 'rgba(148, 163, 184, 0.1)',
      color: '#e2e8f0',
    },
  },
  footer: {
    marginTop: '28px',
    paddingTop: '28px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
  },
  orb1: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0) 70%)',
    top: '-100px',
    left: '-100px',
    zIndex: 1,
  },
  orb2: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0) 70%)',
    bottom: '-150px',
    right: '-150px',
    zIndex: 1,
  },
};

export default ResetPassword;

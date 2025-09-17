import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Home() {
  const [selectedRole, setSelectedRole] = useState("citizen");
  const [loading, setLoading] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState("");
  const navigate = useNavigate();
  const municipalImages = [
    "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df",
    "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b",
    "https://images.unsplash.com/photo-1449824913935-59a10b8d2000",
    "https://images.unsplash.com/photo-1467269204594-9661b134dd2b"
  ];

  useEffect(() => {
    const randomImage = municipalImages[Math.floor(Math.random() * municipalImages.length)];
    setBackgroundImage(randomImage);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const [loginData, setLoginData] = useState({
    admin: { email: "", password: "", error: "", isLoading: false },
    citizen: { email: "", password: "", error: "", isLoading: false },
    sectorHead: { email: "", password: "", error: "", isLoading: false }
  });

  const handleLogin = async (role, e) => {
    e.preventDefault();
    const endpoint = {
      admin: "/api/auth/login",
      citizen: "/api/citizen/login",
      sectorHead: "/api/sector-head/login"
    }[role];

    setLoginData(prev => ({ 
      ...prev, 
      [role]: { 
        ...prev[role], 
        isLoading: true, 
        error: "" 
      } 
    }));

    try {
      const url = `https://civicconnect-backend.onrender.com${endpoint}`;
      const res = await axios.post(url, {
        email: loginData[role].email,
        password: loginData[role].password
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", role);
      localStorage.setItem("name", res.data[role]?.name || "");

      navigate(`/${role}-dashboard`);
    } catch (err) {
      const errorMsg = err.response?.data?.message || `Login failed for ${role.charAt(0).toUpperCase() + role.slice(1)}`;
      setLoginData(prev => ({ 
        ...prev, 
        [role]: { 
          ...prev[role], 
          error: errorMsg, 
          isLoading: false 
        } 
      }));
    } finally {
      setLoginData(prev => ({ 
        ...prev, 
        [role]: { 
          ...prev[role], 
          isLoading: false 
        } 
      }));
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loadingContent}>
          <img 
            src="https://thumbs2.imgbox.com/d8/c3/F2FTK2fb_t.png" 
            alt="CivicConnect Logo" 
            style={styles.loadingLogo}
          />
          <h1 style={styles.blinkingText}>CivicConnect</h1>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Initializing Municipal Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.appContainer, backgroundImage: `url(${backgroundImage})` }}>
      {}
      <div style={styles.darkOverlay}></div>
      
      {}
      <div style={styles.fullScreenContent}>
        {}
        <header style={styles.header}>
          <img
            src="https://thumbs2.imgbox.com/d8/c3/F2FTK2fb_t.png"
            alt="CivicConnect Logo"
            style={styles.headerLogo}
          />
          <h1 style={styles.headerTitle}>Municipal Services Portal</h1>
        </header>

        {}
        <div style={styles.roleSelector}>
          <button 
            onClick={() => setSelectedRole("citizen")}
            style={{
              ...styles.roleButton,
              ...(selectedRole === "citizen" && styles.activeRoleButton)
            }}
          >
            <i className="fas fa-user" style={styles.roleIcon}></i> Citizen
          </button>
          <button 
            onClick={() => setSelectedRole("sectorHead")}
            style={{
              ...styles.roleButton,
              ...(selectedRole === "sectorHead" && styles.activeRoleButton)
            }}
          >
            <i className="fas fa-user-tie" style={styles.roleIcon}></i> Sector Head
          </button>
          <button 
            onClick={() => setSelectedRole("admin")}
            style={{
              ...styles.roleButton,
              ...(selectedRole === "admin" && styles.activeRoleButton)
            }}
          >
            <i className="fas fa-user-shield" style={styles.roleIcon}></i> Admin
          </button>
        </div>

        {}
        <div style={styles.formContainer}>
          {selectedRole === "admin" && (
            <form onSubmit={(e) => handleLogin("admin", e)} style={styles.loginForm}>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>
                  <i className="fas fa-envelope" style={styles.labelIcon}></i> Email
                </label>
                <input
                  type="email"
                  value={loginData.admin.email}
                  onChange={(e) => setLoginData(prev => ({
                    ...prev,
                    admin: { ...prev.admin, email: e.target.value }
                  }))}
                  placeholder="admin@gmail.com"
                  style={styles.inputField}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>
                  <i className="fas fa-lock" style={styles.labelIcon}></i> Password
                </label>
                <input
                  type="password"
                  value={loginData.admin.password}
                  onChange={(e) => setLoginData(prev => ({
                    ...prev,
                    admin: { ...prev.admin, password: e.target.value }
                  }))}
                  placeholder="••••••••"
                  style={styles.inputField}
                  required
                />
              </div>

              {loginData.admin.error && <div style={styles.errorMessage}>{loginData.admin.error}</div>}

              <button 
                type="submit" 
                style={styles.loginButton} 
                disabled={loginData.admin.isLoading}
              >
                {loginData.admin.isLoading ? (
                  <span style={styles.buttonLoader}></span>
                ) : (
                  <>
                    <span>Login</span>
                    <i className="fas fa-arrow-right" style={styles.arrowIcon}></i>
                  </>
                )}
              </button>
            </form>
          )}

          {selectedRole === "citizen" && (
            <form onSubmit={(e) => handleLogin("citizen", e)} style={styles.loginForm}>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>
                  <i className="fas fa-envelope" style={styles.labelIcon}></i> Email
                </label>
                <input
                  type="email"
                  value={loginData.citizen.email}
                  onChange={(e) => setLoginData(prev => ({
                    ...prev,
                    citizen: { ...prev.citizen, email: e.target.value }
                  }))}
                  placeholder="citizen@gmail.com"
                  style={styles.inputField}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>
                  <i className="fas fa-lock" style={styles.labelIcon}></i> Password
                </label>
                <input
                  type="password"
                  value={loginData.citizen.password}
                  onChange={(e) => setLoginData(prev => ({
                    ...prev,
                    citizen: { ...prev.citizen, password: e.target.value }
                  }))}
                  placeholder="••••••••"
                  style={styles.inputField}
                  required
                />
              </div>

              {loginData.citizen.error && <div style={styles.errorMessage}>{loginData.citizen.error}</div>}

              <button 
                type="submit" 
                style={styles.loginButton} 
                disabled={loginData.citizen.isLoading}
              >
                {loginData.citizen.isLoading ? (
                  <span style={styles.buttonLoader}></span>
                ) : (
                  <>
                    <span>Login</span>
                    <i className="fas fa-arrow-right" style={styles.arrowIcon}></i>
                  </>
                )}
              </button>
            </form>
          )}

          {selectedRole === "sectorHead" && (
            <form onSubmit={(e) => handleLogin("sectorHead", e)} style={styles.loginForm}>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>
                  <i className="fas fa-envelope" style={styles.labelIcon}></i> Email
                </label>
                <input
                  type="email"
                  value={loginData.sectorHead.email}
                  onChange={(e) => setLoginData(prev => ({
                    ...prev,
                    sectorHead: { ...prev.sectorHead, email: e.target.value }
                  }))}
                  placeholder="sector@gmail.com"
                  style={styles.inputField}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>
                  <i className="fas fa-lock" style={styles.labelIcon}></i> Password
                </label>
                <input
                  type="password"
                  value={loginData.sectorHead.password}
                  onChange={(e) => setLoginData(prev => ({
                    ...prev,
                    sectorHead: { ...prev.sectorHead, password: e.target.value }
                  }))}
                  placeholder="••••••••"
                  style={styles.inputField}
                  required
                />
              </div>

              {loginData.sectorHead.error && <div style={styles.errorMessage}>{loginData.sectorHead.error}</div>}

              <button 
                type="submit" 
                style={styles.loginButton} 
                disabled={loginData.sectorHead.isLoading}
              >
                {loginData.sectorHead.isLoading ? (
                  <span style={styles.buttonLoader}></span>
                ) : (
                  <>
                    <span>Login</span>
                    <i className="fas fa-arrow-right" style={styles.arrowIcon}></i>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {}
        <footer style={styles.footer}>
          <div style={styles.loginFooter}>
            <Link to="/forgot-password" style={styles.forgotPassword}>Forgot Password?</Link>
            <div style={styles.secureLogin}>
              <i className="fas fa-shield-alt" style={styles.shieldIcon}></i> Secure Municipal Portal
            </div>
          </div>
          <p style={styles.footerText}>© {new Date().getFullYear()} CivicConnect</p>
        </footer>
      </div>

      <ToastContainer position="top-center" autoClose={5000} />

      {}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');
        
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes buttonHover {
          0% { transform: translateY(0); box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          100% { transform: translateY(-3px); box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15); }
        }

        input:focus {
          outline: none;
          border-color: #4fc3f7;
          background: rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 0 3px rgba(79, 195, 247, 0.2);
        }
        
        button:hover {
          animation: buttonHover 0.3s forwards;
        }
        
        button:hover::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.7s ease;
          z-index: -1;
        }
        
        button:hover::before {
          left: 100%;
        }
        
        a:hover {
          color: #4fc3f7;
        }
        
        [role="button"]:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.2) !important;
          background: rgba(79, 195, 247, 0.6) !important;
        }
        
        [role="button"]:hover i {
          transform: scale(1.1);
          transition: transform 0.3s ease;
        }
        
        .header-logo:hover {
          transform: scale(1.05);
          transition: transform 0.3s ease;
          filter: drop-shadow(0 0 15px rgba(79, 195, 247, 0.8)) !important;
        }
      `}</style>
    </div>
  );
}

const styles = {
  loadingScreen: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(115deg, #ff9d00ff, #ffffffff, #73ff00ff)',
    backgroundSize: '400% 400%',
    animation: 'gradientBG 8s ease infinite',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingContent: {
    textAlign: 'center',
    color: 'white',
  },
  loadingLogo: {
    width: '180px',
    marginBottom: '20px',
    animation: 'pulse 2s infinite',
    borderRadius: '50px',
    filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.7))',
  },
  blinkingText: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '20px',
    animation: 'blink 1.5s infinite',
    textShadow: '0 0 10px rgba(255, 255, 255, 0.7)',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50%',
    borderTopColor: 'white',
    animation: 'spin 1s ease-in-out infinite',
    margin: '0 auto',
  },
  loadingText: {
    fontSize: '1.1rem',
    opacity: 0.8,
    animation: 'fadeInOut 2s infinite',
  },
  appContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    fontFamily: "'Poppins', sans-serif",
    overflow: 'hidden',
  },
  darkOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 0,
  },
  fullScreenContent: {
    position: 'relative',
    zIndex: 1,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '20px',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px 0',
    animation: 'fadeIn 0.8s ease',
    marginBottom: '20px',
  },
  headerLogo: {
    width: '80px',
    height: '80px',
    objectFit: 'contain',
    marginBottom: '10px',
    borderRadius: '10px',
    filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.7))',
  },
  headerTitle: {
    color: '#fff',
    fontSize: '1.8rem',
    fontWeight: '600',
    textAlign: 'center',
    margin: 0,
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  roleSelector: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    margin: '10px 0',
    flexWrap: 'wrap',
  },
  roleButton: {
    padding: '10px 15px',
    backgroundColor: 'rgba(12, 12, 12, 0)',
    color: '#fff',
    border: 'none',
    borderRadius: '40px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    backdropFilter: 'blur(30px)',
  },
  activeRoleButton: {
    backgroundColor: 'rgba(79, 195, 247, 0.8)',
    boxShadow: '0 0 0 2px rgba(255,255,255,0.2)',
  },
  roleIcon: {
    fontSize: '0.9rem',
  },
  formContainer: {
    backgroundColor: 'rgba(19, 28, 46, 0)',
    borderRadius: '50px',
    // padding: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(5px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    margin: '5px auto',
    paddingTop: '50px',
    paddingLeft: '10px',
    animation: 'fadeIn 0.8s ease',
    width: '100%',
    maxWidth: '450px',
    height: '100%',
    maxHeight: '300px',
  },
  loginForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  inputGroup: {
    position: 'relative',
  },
  inputLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  labelIcon: {
    color: '#4fc3f7',
    fontSize: '0.9rem',
  },
  inputField: {
    width: '86%',
    padding: '12px 12px 12px 40px',
    background: 'rgba(33, 31, 31, 0.56)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '60px',
    color: 'white',
    fontSize: '0.8rem',
    transition: 'all 0.3s ease',
  },
  errorMessage: {
    color: '#ff6b6b',
    fontSize: '0.9rem',
    textAlign: 'center',
    marginTop: '-200px',
    marginBottom: '160px',
  },
  loginButton: {
    padding: '12px',
    background: 'linear-gradient(135deg, #4fc3f7, #1976d2)',
    border: 'none',
    borderRadius: '30px',
    color: 'white',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    position: 'relative',
    overflow: 'hidden',
    zIndex: 1,
    transition: 'all 0.3s ease',
    width: '30%',
    marginLeft: '145px'
  },
  buttonLoader: {
    width: '18px',
    height: '18px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50%',
    borderTopColor: 'white',
    animation: 'spin 1s ease-in-out infinite',
  },
  arrowIcon: {
    transition: 'transform 0.3s ease',
  },
  loginFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '20px',
    fontSize: '0.8rem',
  },
  forgotPassword: {
    color: 'rgba(255, 255, 255, 0.6)',
    textDecoration: 'none',
    transition: 'color 0.3s ease',
  },
  secureLogin: {
    color: 'rgba(255, 255, 255, 0.5)',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  shieldIcon: {
    color: '#4fc3f7',
  },
  footer: {
    textAlign: 'center',
    padding: '10px 0',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.8rem',
  },
  footerText: {
    margin: 0,
  },
};

export default Home;

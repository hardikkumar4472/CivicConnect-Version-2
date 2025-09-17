import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnalyticsModal from './AnalyticsModal'; 

const SectorHeadHeader = ({ sectorName, onShowDashboard }) => {
  const navigate = useNavigate();
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    totalIssues: 0,
    issuesByCategory: [],
    mostReportedCategory: 'N/A',
    avgResolutionTime: 'N/A',
    avgFeedbackRating: 'N/A'
  });

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://civicconnect-backend.onrender.com/api/sector-head/analytics", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setAnalyticsData(data);
      setShowAnalytics(true);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  return (
    <>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        backgroundColor: '#112240',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, color: '#64ffda', fontSize: '1.8rem' }}>Sector Head Portal</h1>
          <p style={{ margin: '5px 0 0', fontSize: '0.9rem', color: '#8892b0' }}>Area: {sectorName}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={onShowDashboard}
            style={{
              padding: '10px 20px',
              backgroundColor: '#1e2a47',
              color: '#64ffda',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              fontSize: '0.9rem',
            }}
          >
            <i className="fas fa-tachometer-alt"></i> Dashboard
          </button>
          <button 
            onClick={fetchAnalytics}
            style={{
              padding: '10px 20px',
              backgroundColor: '#1e2a47',
              color: '#4d9de0',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              fontSize: '0.9rem',
            }}
            disabled={loadingAnalytics}
          >
            {loadingAnalytics ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-chart-bar"></i>
            )}{' '}
            Analytics
          </button>
          <button 
            onClick={() => navigate("/send-broadcast")}
            style={{
              padding: '10px 20px',
              backgroundColor: '#1e2a47',
              color: '#ff9800',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              fontSize: '0.9rem',
            }}
          >
            <i className="fas fa-bullhorn"></i> Broadcast
          </button>
          <button onClick={logout} style={{
            padding: '10px 20px',
            backgroundColor: '#1e2a47',
            color: '#ff6b6b',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            fontSize: '0.9rem',
          }}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>

      {showAnalytics && (
        <AnalyticsModal 
          analytics={analyticsData} 
          loading={loadingAnalytics}
          onClose={() => setShowAnalytics(false)} 
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }
      `}</style>
    </>
  );
};

export default SectorHeadHeader;

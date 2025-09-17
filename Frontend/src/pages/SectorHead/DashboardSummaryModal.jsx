import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const DashboardSummaryModal = ({ dashboardSummary: initialSummary, onClose }) => {
  const [summary, setSummary] = useState(initialSummary || {});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await axios.get("https://civicconnect-backend.onrender.com/api/sector-head/dashboard-summary");
        console.log("Fetched summary from backend:", data);
        setSummary(data);
      } catch (err) {
        console.error("Error fetching summary:", err);
      }
    };
    fetchSummary();
  }, []);

  useEffect(() => {
    if (summary) {
      console.log("Updated summary state:", summary);
    }
  }, [summary]);

  const handleViewAllIssues = () => {
    onClose();
    navigate('/sectorHead-dashboard');
  };

  // Prepare data for charts
  const statusData = {
    labels: ['Pending', 'In Progress', 'Resolved', 'Escalated', 'Closed'],
    datasets: [
      {
        label: 'Issues by Status',
        data: [
          summary.pendingIssues,
          summary.inProgressIssues || 0,
          summary.resolvedIssues || 0,
          summary.escalatedIssues || 0,
          summary.closedIssues
        ],
        backgroundColor: [
          'rgba(255, 193, 7, 0.7)',
          'rgba(33, 150, 243, 0.7)',
          'rgba(76, 175, 80, 0.7)',
          'rgba(156, 39, 176, 0.7)',
          'rgba(244, 67, 54, 0.7)'
        ],
        borderColor: [
          'rgba(255, 193, 7, 1)',
          'rgba(33, 150, 243, 1)',
          'rgba(76, 175, 80, 1)',
          'rgba(156, 39, 176, 1)',
          'rgba(244, 67, 54, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const categoryData = {
    labels: summary.issuesByCategory?.map(item => item.category) || [],
    datasets: [
      {
        label: 'Issues by Category',
        data: summary.issuesByCategory?.map(item => item.count) || [],
        backgroundColor: 'rgba(100, 255, 218, 0.7)',
        borderColor: 'rgba(100, 255, 218, 1)',
        borderWidth: 1,
      },
    ],
  };

  const resolutionRate = summary.totalIssues > 0 
    ? Math.round((summary.resolvedIssues / summary.totalIssues) * 100)
    : 0;

  // Responsive styles
  const chartsContainerStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '30px',
    marginBottom: '30px'
  };

  // Apply media query for larger screens
  if (window.innerWidth >= 768) {
    chartsContainerStyle.gridTemplateColumns = '1fr 1fr';
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(30px)',
    }} onClick={onClose}>
      <div style={{
        background: '#11224000',
        padding: '25px',
        borderRadius: '10px',
        width: '90%',
        maxWidth: '1000px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        color: '#ccd6f6',
      }} onClick={(e) => e.stopPropagation()}>
        <button
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'transparent',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#7a86a8ff',
            transition: 'color 0.3s ease',
            padding: '5px',
          }}
          onClick={onClose}
        >
          <i className="fas fa-times"></i>
        </button>
        
        <h2 style={{ color: '#64ffda', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fas fa-tachometer-alt"></i> Sector Dashboard Summary
        </h2>
        
        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <SummaryCard 
            icon="fa-exclamation-circle"
            title="Total Issues"
            value={summary.totalIssues}
            color="#64ffda"
          />
          
          <SummaryCard 
            icon="fa-clock"
            title="Pending Issues"
            value={summary.pendingIssues}
            color="#ffc107"
          />
          
          <SummaryCard 
            icon="fa-spinner"
            title="In Progress"
            value={summary.inProgressIssues || 0}
            color="#2196f3"
          />
          
          <SummaryCard 
            icon="fa-check-circle"
            title="Resolved Issues"
            value={summary.resolvedIssues || 0}
            color="#4caf50"
          />
          
          <SummaryCard 
            icon="fa-exclamation-triangle"
            title="Escalated Issues"
            value={summary.escalatedIssues || 0}
            color="#9c27b0"
          />
          
          <SummaryCard 
            icon="fa-check-square"
            title="Closed Issues"
            value={summary.closedIssues}
            color="#f44336"
          />
          
          <SummaryCard 
            icon="fa-users"
            title="Total Citizens"
            value={summary.totalCitizens}
            color="#64ffda"
          />
          
          <SummaryCard 
            icon="fa-chart-line"
            title="Resolution Rate"
            value={`${resolutionRate}%`}
            color="#4d9de0"
          />
        </div>
        
        {/* Charts Section */}
        <div style={chartsContainerStyle}>
          <div style={{ 
            background: '#1e2a47',
            borderRadius: '30px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ color: '#64ffda', marginTop: 0, marginBottom: '20px' }}>
              <i className="fas fa-chart-pie"></i> Issues by Status
            </h3>
            <div style={{ height: '300px' }}>
              <Pie 
                data={statusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: '#8892b0',
                        font: {
                          size: 12
                        }
                      }
                    },
                    tooltip: {
                      backgroundColor: '#112240',
                      titleColor: '#64ffda',
                      bodyColor: '#ccd6f6',
                      borderColor: '#64ffda',
                      borderWidth: 1
                    }
                  }
                }}
              />
            </div>
          </div>
          
          <div style={{ 
            background: '#1e2a47',
            borderRadius: '30px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ color: '#64ffda', marginTop: 0, marginBottom: '20px' }}>
              <i className="fas fa-chart-bar"></i> Issues by Category
            </h3>
            <div style={{ height: '300px' }}>
              <Bar 
                data={categoryData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        color: '#8892b0'
                      },
                      grid: {
                        color: 'rgba(136, 146, 176, 0.1)'
                      }
                    },
                    x: {
                      ticks: {
                        color: '#8892b0'
                      },
                      grid: {
                        color: 'rgba(136, 146, 176, 0.1)'
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      backgroundColor: '#112240',
                      titleColor: '#64ffda',
                      bodyColor: '#ccd6f6',
                      borderColor: '#64ffda',
                      borderWidth: 1
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Additional Metrics */}
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
          <button 
            onClick={handleViewAllIssues}
            style={{
              padding: '10px 20px',
              backgroundColor: '#1e2a47',
              color: '#64ffda',
              border: 'none',
              borderRadius: '30px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#64ffda';
              e.currentTarget.style.color = '#0a192f';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#1e2a47';
              e.currentTarget.style.color = '#64ffda';
            }}
          >
            <i className="fas fa-list"></i> View All Issues
          </button>
        </div>
      
      </div>
    </div>
  );
};

const SummaryCard = ({ icon, title, value, color }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div 
      style={{ 
        background: '#1e2a47', 
        borderRadius: '30px', 
        padding: '20px', 
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.3s ease',
        transform: isHovered ? 'translateY(-5px)' : 'none'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
        <i className={`fas ${icon}`} style={{ color, fontSize: '1.2rem' }}></i>
        <h3 style={{ margin: 0, fontSize: '1rem', color: '#8892b0' }}>{title}</h3>
      </div>
      <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#e6f1ff', textAlign: 'center' }}>
        {value}
      </div>
    </div>
  );
};

const MetricItem = ({ label, value, icon }) => (
  <div style={{ 
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    background: 'rgba(100, 255, 218, 0.1)',
    borderRadius: '30px'
  }}>
    <i className={`fas ${icon}`} style={{ color: '#64ffda', fontSize: '1rem' }}></i>
    <div>
      <div style={{ fontSize: '0.8rem', color: '#8892b0' }}>{label}</div>
      <div style={{ fontSize: '1rem', color: '#e6f1ff', fontWeight: '500' }}>{value}</div>
    </div>
  </div>
);

export default DashboardSummaryModal;

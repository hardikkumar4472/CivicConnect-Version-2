import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AnalyticsModal from "./AnalyticsModal";
import LoadingSpinner from "./LoadingSpinner";
import IssueCard from "./IssueCard";
import DashboardSummaryModal from "./DashboardSummaryModal";
import IssueDetailsModal from "./IssueDetailsModal";
import CreateCitizen from "./CreateCitizen";
import BroadcastPage from "./BroadcastPage";

export default function SectorHeadDashboard() {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sectorName, setSectorName] = useState("");
  const [citizenDetails, setCitizenDetails] = useState({
    name: "Loading...",
    email: "Loading...",
    phone: "Loading..."
  });
  const [loadingCitizenDetails, setLoadingCitizenDetails] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalIssues: 0,
    issuesByCategory: [],
    mostReportedCategory: 'N/A',
    avgResolutionTime: 'N/A',
    avgFeedbackRating: 'N/A'
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [dashboardSummary, setDashboardSummary] = useState({
    totalIssues: 0,
    openIssues: 0,
    closedIssues: 0,
    pendingIssues: 0,
    totalCitizens: 0
  });
  const [showDashboard, setShowDashboard] = useState(false);
  const [showCreateCitizen, setShowCreateCitizen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Status options for filtering
  const statusFilters = [
    { id: "all", label: "All Issues" },
    { id: "pending", label: "Pending" },
    { id: "in-progress", label: "In Progress" },
    { id: "resolved", label: "Resolved" },
    { id: "escalated", label: "Escalated" },
    { id: "closed", label: "Closed" }
  ];

  // First load all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/sectorHead-login");
          return;
        }
        
        const [sectorRes, issuesRes, summaryRes] = await Promise.all([
          axios.get("https://civicconnect-backend.onrender.com/api/sector-head/me", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("https://civicconnect-backend.onrender.com/api/sector-head/issues", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("https://civicconnect-backend.onrender.com/api/sector-head/dashboard-summary", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setSectorName(sectorRes.data.sector || "Unknown Sector");
        const issuesData = Array.isArray(issuesRes.data) ? issuesRes.data : issuesRes.data?.issues || [];
        setIssues(issuesData);
        setFilteredIssues(issuesData);
        setDashboardSummary(summaryRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/sectorHead-login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Filter issues based on active filter
  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredIssues(issues);
    } else {
      const normalize = str => str?.toLowerCase().replace(/[\s_]+/g, "-"); 
      setFilteredIssues(
        issues.filter(
          issue => normalize(issue.status) === normalize(activeFilter)
        )
      );
    }
  }, [activeFilter, issues]);

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://civicconnect-backend.onrender.com/api/sector-head/analytics",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnalytics(response.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchCitizenDetails = async (issue) => {
    if (!issue?.raisedBy) {
      console.warn('No raisedBy field in issue:', issue);
      return;
    }
    
    setLoadingCitizenDetails(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://civicconnect-backend.onrender.com/api/sector-head/citizen/${issue.raisedBy}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCitizenDetails({
        name: response.data?.name || "Anonymous",
        email: response.data?.email || "Not provided",
        phone: response.data?.phone || "Not provided"
      });
    } catch (error) {
      console.error("Citizen details fetch failed:", error);
      setCitizenDetails({
        name: "Anonymous",
        email: "Not provided",
        phone: "Not provided"
      });
    } finally {
      setLoadingCitizenDetails(false);
    }
  };

  const handleIssueClick = (issue) => {
    setSelectedIssue(issue);
    fetchCitizenDetails(issue);
  };

  const updateIssueStatus = async (issueId, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://civicconnect-backend.onrender.com/api/issues/${issueId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setIssues(issues.map(issue => 
        issue._id === issueId ? { ...issue, status } : issue
      ));
      
      if (selectedIssue && selectedIssue._id === issueId) {
        setSelectedIssue({ ...selectedIssue, status });
      }
    } catch (error) {
      console.error("Error updating issue status:", error);
    }
  };

  const closeModal = () => {
    setSelectedIssue(null);
    setCitizenDetails({
      name: "Loading...",
      email: "Loading...",
      phone: "Loading..."
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a192f',
      fontFamily: "'Poppins', sans-serif",
      color: '#ccd6f6',
      display: 'flex',
      flexDirection: 'column',
      margin: 0,
      padding: 0,
      width: '100vw',
      overflowX: 'hidden'
    }}>
      {/* Custom Navbar */}
      <div style={{
        backgroundColor: '#0a192f',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #233554',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}>
          <h2 style={{
            color: '#64ffda',
            margin: 0,
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textShadow: '0 0 10px rgba(100, 255, 218, 0.3)',
            transition: 'all 0.3s ease'
          }}>
            <i className="fas fa-map-marked-alt" style={{ transform: 'rotate(-15deg)' }}></i>
            {sectorName}
          </h2>
        </div>
        
        {/* Mobile Menu Button (hidden on larger screens) */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            color: '#64ffda',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '5px',
            borderRadius: '5px',
            transition: 'all 0.3s ease',
            ':hover': {
              background: '#112240'
            },
            '@media (max-width: 768px)': {
              display: 'block'
            }
          }}
        >
          <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
        
        {/* Main Navigation (hidden on mobile when menu is closed) */}
        <div style={{
          display: 'flex',
          gap: '15px',
          alignItems: 'center',
          '@media (max-width: 768px)': {
            display: isMenuOpen ? 'flex' : 'none',
            position: 'absolute',
            top: '100%',
            right: '20px',
            backgroundColor: '#0a192f',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
            flexDirection: 'column',
            alignItems: 'flex-end',
            border: '1px solid #233554',
            zIndex: 1000
          }
        }}>
          <button 
            onClick={() => setShowCreateCitizen(true)}
            style={{
              padding: '10px 15px',
              backgroundColor: '#64ffda',
              border: 'none',
              borderRadius: '30px',
              color: '#0a192f',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 10px rgba(100, 255, 218, 0.3)',
              ':hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 15px rgba(100, 255, 218, 0.5)'
              },
              ':active': {
                transform: 'translateY(0)'
              }
            }}
          >
            <i className="fas fa-user-plus"></i>
            <span>Create Citizen</span>
          </button>

          <button 
            onClick={() => navigate('/send-broadcast')}
            style={{
              padding: '10px 15px',
              backgroundColor: '#112240',
              border: '1px solid #233554',
              borderRadius: '30px',
              color: '#ccd6f6',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              ':hover': {
                backgroundColor: '#1a2e4a',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
              },
              ':active': {
                transform: 'translateY(0)'
              }
            }}
          >
            <i className="fas fa-bullhorn"></i>
            <span>Broadcast</span>
          </button>

          <button 
            onClick={() => setShowDashboard(true)}
            style={{
              padding: '10px 15px',
              backgroundColor: '#112240',
              border: '1px solid #233554',
              borderRadius: '30px',
              color: '#ccd6f6',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              ':hover': {
                backgroundColor: '#1a2e4a',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
              },
              ':active': {
                transform: 'translateY(0)'
              }
            }}
          >
            <i className="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </button>

          <button 
            onClick={() => {
              fetchAnalytics();
              setShowAnalytics(true);
            }}
            disabled={loadingAnalytics}
            style={{
              padding: '10px 15px',
              backgroundColor: '#112240',
              border: '1px solid #233554',
              borderRadius: '30px',
              color: '#ccd6f6',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: loadingAnalytics ? 0.7 : 1,
              ':hover': {
                backgroundColor: loadingAnalytics ? '#112240' : '#1a2e4a',
                transform: loadingAnalytics ? 'none' : 'translateY(-2px)',
                boxShadow: loadingAnalytics ? 'none' : '0 4px 10px rgba(0, 0, 0, 0.2)'
              },
              ':active': {
                transform: 'translateY(0)'
              }
            }}
          >
            {loadingAnalytics ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-chart-line"></i>
            )}
            <span>Analytics</span>
          </button>

          <button 
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/");
            }}
            style={{
              padding: '10px 15px',
              backgroundColor: '#112240',
              border: '1px solid #233554',
              borderRadius: '30px',
              color: '#ccd6f6',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              ':hover': {
                backgroundColor: '#1a2e4a',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
              },
              ':active': {
                transform: 'translateY(0)'
              }
            }}
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div style={{
        flex: 1,
        width: '100%',
        overflowY: 'auto',
        padding: '20px',
        boxSizing: 'border-box',
        background: 'linear-gradient(135deg, #0a192f 0%, #0f2746 100%)'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '100%',
          padding: '0 20px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: '600',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#ccd6f6',
              textShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
              '@media (max-width: 768px)': {
                fontSize: '1.5rem'
              }
            }}>
              <i className="fas fa-exclamation-circle" style={{ 
                color: '#64ffda',
                animation: 'pulse 2s infinite'
              }}></i> 
              Reported Issues in Your Sector
            </h2>
            
            <div style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              '@media (max-width: 768px)': {
                justifyContent: 'center',
                width: '100%'
              }
            }}>
              {statusFilters.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  style={{
                    padding: '8px 15px',
                    borderRadius: '20px',
                    border: 'none',
                    background: activeFilter === filter.id ? 
                      'linear-gradient(135deg, #64ffda 0%, #52dbb7 100%)' : 
                      'linear-gradient(135deg, #112240 0%, #1a2e4a 100%)',
                    color: activeFilter === filter.id ? '#0a192f' : '#ccd6f6',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.8rem',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    boxShadow: activeFilter === filter.id ? 
                      '0 4px 15px rgba(100, 255, 218, 0.4)' : 
                      '0 2px 5px rgba(0, 0, 0, 0.1)',
                    ':hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: activeFilter === filter.id ? 
                        '0 6px 20px rgba(100, 255, 218, 0.6)' : 
                        '0 4px 10px rgba(0, 0, 0, 0.2)'
                    },
                    ':active': {
                      transform: 'translateY(0)'
                    }
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          
          {filteredIssues.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#8892b0',
              backgroundColor: 'rgba(17, 34, 64, 0.7)',
              borderRadius: '12px',
              marginTop: '20px',
              border: '1px dashed #233554',
              transition: 'all 0.3s ease',
              ':hover': {
                backgroundColor: 'rgba(17, 34, 64, 0.9)',
                transform: 'translateY(-3px)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
              }
            }}>
              <i className="fas fa-check-circle" style={{
                fontSize: '3.5rem',
                color: '#64ffda',
                marginBottom: '15px',
                filter: 'drop-shadow(0 0 10px rgba(100, 255, 218, 0.3))'
              }}></i>
              <h3 style={{
                fontSize: '1.3rem',
                marginBottom: '10px',
                color: '#ccd6f6'
              }}>
                {activeFilter === "all" 
                  ? "No issues reported in your sector yet." 
                  : `No ${statusFilters.find(f => f.id === activeFilter)?.label} issues found.`}
              </h3>
              <p style={{ 
                fontSize: '1rem',
                opacity: 0.8
              }}>
                {activeFilter === "all" 
                  ? "When citizens report issues, they'll appear here." 
                  : "Try a different filter or check back later."}
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '25px',
              width: '100%',
              '@media (max-width: 768px)': {
                gridTemplateColumns: '1fr'
              }
            }}>
              {filteredIssues.map((issue) => (
                <IssueCard
                  key={issue._id}
                  issue={issue}
                  isSelected={selectedIssue?._id === issue._id}
                  onClick={() => handleIssueClick(issue)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showDashboard && (
        <DashboardSummaryModal 
          dashboardSummary={dashboardSummary} 
          onClose={() => setShowDashboard(false)} 
        />
      )}

      {showAnalytics && (
        <AnalyticsModal 
          analytics={analytics} 
          loading={loadingAnalytics}
          onClose={() => setShowAnalytics(false)} 
        />
      )}

      {showCreateCitizen && (
        <CreateCitizen 
          sectorName={sectorName} 
          onClose={() => setShowCreateCitizen(false)} 
        />
      )}

      {selectedIssue && (
        <IssueDetailsModal
          selectedIssue={selectedIssue}
          citizenDetails={citizenDetails}
          loadingCitizenDetails={loadingCitizenDetails}
          onClose={closeModal}
          onStatusChange={updateIssueStatus}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }
        
        * {
          box-sizing: border-box;
        }
        
        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }
        
        /* Card hover effect */
        .issue-card {
          transition: all 0.3s ease;
          animation: fadeIn 0.5s ease-out;
        }
        
        .issue-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3) !important;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .navbar-buttons {
            flex-direction: column;
            align-items: flex-end;
          }
          
          .filter-buttons {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

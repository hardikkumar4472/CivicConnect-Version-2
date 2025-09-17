import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [adminName, setAdminName] = useState("");
  const [dashboardData, setDashboardData] = useState({
    totalIssues: 0,
    pendingIssues: 0,
    inProgressIssues: 0,
    resolvedIssues: 0,
    escalatedIssues: 0,
    closedIssues: 0,
    totalCitizens: 0,
    totalFeedbacks: 0,
    issues: []
  });
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [sectorHeadData, setSectorHeadData] = useState({
    name: "",
    email: "",
    sector: ""
  });
  const [sectors, setSectors] = useState([]);
  const [sectorRatings, setSectorRatings] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!token) {
      navigate("/admin-login");
      return;
    }

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    fetchAdminDetails();
    fetchSectors();
    
    if (activeTab === "dashboard") {
      fetchDashboard();
    } else if (activeTab === "ratings") {
      fetchSectorRatings();
    }

    return () => clearTimeout(timer);
  }, [activeTab]);

  const fetchAdminDetails = async () => {
    try {
      const res = await axios.get("https://civicconnect-backend.onrender.com/api/issues/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdminName(res.data.name);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDashboard = async () => {
    try {
      const res = await axios.get("https://civicconnect-backend.onrender.com/api/issues/dashboard-summary", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSectors = async () => {
    try {
      const res = await axios.get("https://civicconnect-backend.onrender.com/api/issues/sectors", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSectors(res.data);
    } catch (err) {
      console.error("Error fetching sectors:", err);
    }
  };

  const fetchSectorRatings = async () => {
    try {
      const res = await axios.get("https://civicconnect-backend.onrender.com/api/feedback/sector-ratings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSectorRatings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendBroadcast = async () => {
    try {
      await axios.post(
        "https://civicconnect-backend.onrender.com/api/issues/broadcast", 
        { subject: broadcastSubject, message: broadcastMsg },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Broadcast sent successfully!");
      setBroadcastSubject("");
      setBroadcastMsg("");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error sending broadcast");
    }
  };

  const createSectorHead = async () => {
    try {
      await axios.post(
        "https://civicconnect-backend.onrender.com/api/sector-head/register",
        sectorHeadData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Sector Head created successfully! Password will be auto-generated and sent to their email.");
      setSectorHeadData({
        name: "",
        email: "",
        sector: ""
      });
    } catch (err) {
      alert(err.response?.data?.message || "Error creating sector head");
    }
  };

  const handleSectorHeadChange = (e) => {
    const { name, value } = e.target;
    setSectorHeadData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const downloadCSV = async () => {
    try {
      const response = await axios.get("https://civicconnect-backend.onrender.com/api/issues/export-issues", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob", 
      });

      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `issues_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert("Failed to export CSV");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0a192f',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '30px',
            borderTopColor: '#64ffda',
            animation: 'spin 1s ease-in-out infinite',
            margin: '0 auto 20px',
          }}></div>
          <p style={{
            fontSize: '1.1rem',
            opacity: 0.8,
            color: 'white'
          }}>Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      backgroundColor: '#0a192f',
      fontFamily: "'Poppins', sans-serif",
      overflow: 'hidden',
    }}>
      {/* Mobile Header with Hamburger Menu */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          backgroundColor: '#112240',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          zIndex: 100,
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: '#64ffda',
              fontSize: '1.5rem',
              cursor: 'pointer'
            }}
          >
            <i className="fas fa-bars"></i>
          </button>
          <div style={{ color: '#64ffda', fontWeight: '600' }}>CivicConnect</div>
          <div style={{ width: '24px' }}></div>
        </div>
      )}

      {}
      <div style={{
        width: '250px',
        height: '100vh',
        padding: '20px 0',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0a192f',
        overflowY: 'auto',
        position: isMobile ? 'fixed' : 'relative',
        left: isMobile ? (sidebarOpen ? '0' : '-250px') : '0',
        top: isMobile ? '60px' : '0',
        zIndex: 99,
        transition: 'left 0.3s ease',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '0 20px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '20px',
        }}>
          <img
            src="https://thumbs2.imgbox.com/d8/c3/F2FTK2fb_t.png"
            alt="CivicConnect Logo"
            style={{
              width: '60px',
              height: '60px',
              objectFit: 'contain',
              marginBottom: '10px',
            }}
          />
          <h2 style={{
            fontSize: '1.2rem',
            fontWeight: '600',
            margin: 0,
            color: '#64ffda'
          }}>CivicConnect Admin</h2>
        </div>
        
        <button 
          onClick={() => {
            setActiveTab("dashboard");
            if (isMobile) setSidebarOpen(false);
          }}
          style={{
            padding: '12px 20px',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.3s ease',
            margin: '5px 0',
            borderRadius: '30',
            textAlign: 'left',
            ...(activeTab === "dashboard" && { 
              backgroundColor: 'rgba(100, 255, 218, 0.1)',
              color: '#64ffda',
              borderLeft: '3px solid #64ffda'
            }),
            color: 'rgba(255,255,255,0.8)'
          }}
        >
          <i className="fas fa-tachometer-alt" style={{ width: '20px', textAlign: 'center' }}></i> Dashboard
        </button>
        
        <button 
          onClick={() => {
            setActiveTab("broadcast");
            if (isMobile) setSidebarOpen(false);
          }}
          style={{
            padding: '12px 20px',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.3s ease',
            margin: '5px 0',
            borderRadius: '30',
            textAlign: 'left',
            ...(activeTab === "broadcast" && { 
              backgroundColor: 'rgba(100, 255, 218, 0.1)',
              color: '#64ffda',
              borderLeft: '3px solid #64ffda'
            }),
            color: 'rgba(255,255,255,0.8)'
          }}
        >
          <i className="fas fa-bullhorn" style={{ width: '20px', textAlign: 'center' }}></i> Broadcast
        </button>
        
        <button 
          onClick={() => {
            setActiveTab("export");
            if (isMobile) setSidebarOpen(false);
          }}
          style={{
            padding: '12px 20px',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.3s ease',
            margin: '5px 0',
            borderRadius: '30',
            textAlign: 'left',
            ...(activeTab === "export" && { 
              backgroundColor: 'rgba(100, 255, 218, 0.1)',
              color: '#64ffda',
              borderLeft: '3px solid #64ffda'
            }),
            color: 'rgba(255,255,255,0.8)'
          }}
        >
          <i className="fas fa-file-export" style={{ width: '20px', textAlign: 'center' }}></i> Export
        </button>
        
        <button 
          onClick={() => {
            setActiveTab("createSectorHead");
            if (isMobile) setSidebarOpen(false);
          }}
          style={{
            padding: '12px 20px',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.3s ease',
            margin: '5px 0',
            borderRadius: '30',
            textAlign: 'left',
            ...(activeTab === "createSectorHead" && { 
              backgroundColor: 'rgba(100, 255, 218, 0.1)',
              color: '#64ffda',
              borderLeft: '3px solid #64ffda'
            }),
            color: 'rgba(255,255,255,0.8)'
          }}
        >
          <i className="fas fa-user-plus" style={{ width: '20px', textAlign: 'center' }}></i> Create Sector Head
        </button>

        <button 
          onClick={() => {
            setActiveTab("ratings");
            if (isMobile) setSidebarOpen(false);
          }}
          style={{
            padding: '12px 20px',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.3s ease',
            margin: '5px 0',
            borderRadius: '30',
            textAlign: 'left',
            ...(activeTab === "ratings" && { 
              backgroundColor: 'rgba(100, 255, 218, 0.1)',
              color: '#64ffda',
              borderLeft: '3px solid #64ffda'
            }),
            color: 'rgba(255,255,255,0.8)'
          }}
        >
          <i className="fas fa-star" style={{ width: '20px', textAlign: 'center' }}></i> Show Ratings
        </button>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0a192f',
        overflow: 'hidden',
        marginLeft: isMobile ? '0' : '-1px',
        paddingTop: isMobile ? '60px' : '0',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '15px 25px',
          zIndex: 1,
          backgroundColor: '#112240',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
          }}>
            <i className="fas fa-user-shield" style={{
              marginRight: '8px',
              color: '#64ffda'
            }}></i>
            Welcome, <span style={{
              fontWeight: '600',
              marginLeft: '5px',
              color: '#64ffda'
            }}>{adminName || "Admin"}</span>
          </div>
          <button onClick={logout} style={{
            padding: '8px 15px',
            border: 'none',
            borderRadius: '30px',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            backgroundColor: '#1e2a47',
            color: '#64ffda'
          }}>
            <i className="fas fa-sign-out-alt" style={{ fontSize: '0.9rem' }}></i> Logout
          </button>
        </div>

        {activeTab === "dashboard" && (
          <div style={{
            flex: 1,
            padding: '20px',
            backgroundColor: '#0a192f',
            overflowY: 'auto',
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#ccd6f6'
            }}>
              <i className="fas fa-tachometer-alt" style={{
                color: '#64ffda',
                fontSize: '1.2rem',
              }}></i> Dashboard Summary
            </h2>

            {}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '15px',
              padding: '10px 0',
            }}>
              {Object.entries({
                totalIssues: dashboardData.totalIssues,
                pendingIssues: dashboardData.pendingIssues,
                inProgressIssues: dashboardData.inProgressIssues,
                resolvedIssues: dashboardData.resolvedIssues,
                escalatedIssues: dashboardData.escalatedIssues,
                closedIssues: dashboardData.closedIssues,
                totalCitizens: dashboardData.totalCitizens,
                totalFeedbacks: dashboardData.totalFeedbacks
              }).map(([key, value]) => (
                <div key={key} style={{
                  borderRadius: '30px',
                  padding: '15px',
                  backgroundColor: '#112240',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}>
                  <div style={{
                    fontSize: '0.9rem',
                    marginBottom: '8px',
                    color: '#8892b0'
                  }}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </div>
                  <div style={{
                    fontSize: '1.6rem',
                    fontWeight: '700',
                    color: '#e6f1ff'
                  }}>
                    {value || 0}
                  </div>
                </div>
              ))}
            </div>

            {}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '15px',
              marginTop: '20px'
            }}>
              {}
              <div style={{ 
                backgroundColor: '#112240', 
                padding: '15px', 
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <h3 style={{ color: '#ccd6f6', marginBottom: '10px', fontSize: '1rem' }}>Issues Status Distribution</h3>
                <Pie
                  data={{
                    labels: ['Pending', 'In Progress', 'Resolved', 'Escalated', 'Closed'],
                    datasets: [
                      {
                        data: [
                          dashboardData.pendingIssues || 0,
                          dashboardData.inProgressIssues || 0,
                          dashboardData.resolvedIssues || 0,
                          dashboardData.escalatedIssues || 0,
                          dashboardData.closedIssues || 0
                        ],
                        backgroundColor: [
                          '#feca57', 
                          '#2e86de', 
                          '#1dd1a1', 
                          '#ff6b6b', 
                          '#576574'  
                        ]
                      }
                    ]
                  }}
                />
              </div>

              {}
              <div style={{ 
                backgroundColor: '#112240', 
                padding: '15px', 
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <h3 style={{ color: '#ccd6f6', marginBottom: '10px', fontSize: '1rem' }}>Citizens vs Feedback</h3>
                <Bar
                  data={{
                    labels: ['Total Citizens', 'Total Feedbacks'],
                    datasets: [
                      {
                        label: 'Count',
                        data: [
                          dashboardData.totalCitizens || 0,
                          dashboardData.totalFeedbacks || 0
                        ],
                        backgroundColor: ['#5f27cd', '#10ac84']
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } }
                  }}
                />
              </div>

              {}
              <div style={{ 
                backgroundColor: '#112240', 
                padding: '15px', 
                borderRadius: '30px',
                border: '1px solid rgba(255,255,255,0.1)',
                gridColumn: '1 / -1'
              }}>
                <h3 style={{ color: '#ccd6f6', marginBottom: '15px', fontSize: '1rem' }}>
                  Recent Issues
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    color: '#e6f1ff'
                  }}>
                    <thead>
                      <tr style={{ 
                        backgroundColor: 'rgba(100, 255, 218, 0.1)',
                        borderBottom: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Citizen</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Sector</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Category</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.issues && dashboardData.issues.slice(0, 5).map((issue) => (
                        <tr key={issue._id} style={{ 
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          '&:hover': { backgroundColor: 'rgba(100, 255, 218, 0.05)' }
                        }}>
                          <td style={{ padding: '10px' }}>{issue._id.substring(18)}</td>
                          <td style={{ padding: '10px' }}>
                            {issue.citizen?.name || 'N/A'}
                          </td>
                          <td style={{ padding: '10px' }}>{issue.sector}</td>
                          <td style={{ padding: '10px' }}>{issue.category}</td>
                          <td style={{ padding: '10px' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '30px',
                              fontSize: '0.8rem',
                              fontWeight: '500',
                              ...(issue.status === 'Pending' && { backgroundColor: 'rgba(254, 202, 87, 0.1)', color: '#feca57' }),
                              ...(issue.status === 'In Progress' && { backgroundColor: 'rgba(46, 134, 222, 0.1)', color: '#2e86de' }),
                              ...(issue.status === 'Resolved' && { backgroundColor: 'rgba(29, 209, 161, 0.1)', color: '#1dd1a1' }),
                              ...(issue.status === 'Escalated' && { backgroundColor: 'rgba(255, 107, 107, 0.1)', color: '#ff6b6b' }),
                              ...(issue.status === 'Closed' && { backgroundColor: 'rgba(87, 101, 116, 0.1)', color: '#576574' }),
                            }}>
                              {issue.status}
                            </span>
                          </td>
                          <td style={{ padding: '10px' }}>
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "broadcast" && (
          <div style={{ 
            flex: 1, 
            padding: '20px', 
            backgroundColor: '#0a192f', 
            overflowY: 'auto' 
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              marginBottom: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              color: '#ccd6f6' 
            }}>
              <i className="fas fa-bullhorn" style={{ color: '#64ffda', fontSize: '1.2rem' }}></i> Send Broadcast Message
            </h2>

            <input
              type="text"
              value={broadcastSubject}
              onChange={(e) => setBroadcastSubject(e.target.value)}
              placeholder="Enter broadcast subject..."
              style={{
                width: '100%',
                padding: '12px 15px',
                marginBottom: '15px',
                borderRadius: '30px',
                fontSize: '0.95rem',
                backgroundColor: '#112240',
                border: '1px solid #1e2a47',
                color: '#e6f1ff',
              }}
            />

            <textarea 
              value={broadcastMsg} 
              onChange={(e) => setBroadcastMsg(e.target.value)} 
              placeholder="Enter your broadcast message here..."
              style={{
                width: '100%',
                height: '150px',
                padding: '15px',
                borderRadius: '30px',
                fontSize: '0.95rem',
                marginBottom: '20px',
                resize: 'none',
                backgroundColor: '#112240',
                border: '1px solid #1e2a47',
                color: '#e6f1ff'
              }}
            />

            <button onClick={sendBroadcast} style={{
              padding: '12px 20px',
              border: 'none',
              borderRadius: '30px',
              fontSize: '0.95rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#64ffda',
              color: '#0a192f'
            }}>
              <i className="fas fa-paper-plane" style={{ fontSize: '0.9rem' }}></i> Send Broadcast
            </button>
          </div>
        )}

        {activeTab === "export" && (
          <div style={{
            flex: 1,
            padding: '20px',
            backgroundColor: '#0a192f',
            overflowY: 'auto',
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#ccd6f6'
            }}>
              <i className="fas fa-file-export" style={{
                color: '#64ffda',
                fontSize: '1.2rem',
              }}></i> Export Issues Data
            </h2>
            <p style={{
              fontSize: '0.95rem',
              marginBottom: '15px',
              color: '#8892b0'
            }}>
              Download a CSV file containing all reported issues with their current status.
            </p>

            <button
              onClick={downloadCSV}
              style={{
                padding: '12px 20px',
                border: 'none',
                borderRadius: '30px',
                fontSize: '0.95rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                backgroundColor: '#64ffda',
                color: '#0a192f'
              }}
            >
              <i className="fas fa-download" style={{ fontSize: '0.9rem' }}></i> Download CSV
            </button>
          </div>
        )}

        {activeTab === "createSectorHead" && (
  <div style={{
    flex: 1,
    padding: '20px',
    backgroundColor: '#0a192f',
    overflowY: 'auto',
  }}>
    <h2 style={{
      fontSize: '1.5rem',
      fontWeight: '600',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      color: '#ccd6f6'
    }}>
      <i className="fas fa-user-plus" style={{
        color: '#64ffda',
        fontSize: '1.2rem',
      }}></i> Create Sector Head
    </h2>
    
    <div style={{ marginBottom: '15px' }}>
      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '8px',
        fontSize: '0.9rem',
        color: '#8892b0'
      }}>
        <i className="fas fa-user" style={{
          color: '#64ffda',
          fontSize: '0.9rem',
        }}></i> Full Name
      </label>
      <input 
        type="text" 
        name="name"
        value={sectorHeadData.name}
        onChange={handleSectorHeadChange}
        placeholder="Enter full name"
        style={{
          width: '100%',
          padding: '12px 15px',
          borderRadius: '30px',
          fontSize: '0.95rem',
          backgroundColor: '#112240',
          border: '1px solid #1e2a47',
          color: '#e6f1ff',
          transition: 'border 0.3s ease',
        }}
      />
    </div>
    
    <div style={{ marginBottom: '15px' }}>
      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '8px',
        fontSize: '0.9rem',
        color: '#8892b0'
      }}>
        <i className="fas fa-envelope" style={{
          color: '#64ffda',
          fontSize: '0.9rem',
        }}></i> Email
      </label>
      <input 
        type="email" 
        name="email"
        value={sectorHeadData.email}
        onChange={handleSectorHeadChange}
        placeholder="Enter email address"
        style={{
          width: '100%',
          padding: '12px 15px',
          borderRadius: '30px',
          fontSize: '0.95rem',
          backgroundColor: '#112240',
          border: '1px solid #1e2a47',
          color: '#e6f1ff',
          transition: 'border 0.3s ease',
        }}
      />
    </div>
    
    <div style={{ marginBottom: '15px' }}>
      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '8px',
        fontSize: '0.9rem',
        color: '#8892b0'
      }}>
        <i className="fas fa-map-marker-alt" style={{
          color: '#64ffda',
          fontSize: '0.9rem',
        }}></i> Sector Name
      </label>
      <input
        type="text"
        name="sector"
        value={sectorHeadData.sector}
        onChange={handleSectorHeadChange}
        placeholder="Enter sector name"
        style={{
          width: '100%',
          padding: '12px 15px',
          borderRadius: '30px',
          fontSize: '0.95rem',
          backgroundColor: '#112240',
          border: '1px solid #1e2a47',
          color: '#e6f1ff',
          transition: 'border 0.3s ease',
        }}
      />
    </div>
    
    <button onClick={createSectorHead} style={{
      padding: '12px 20px',
      border: 'none',
      borderRadius: '30px',
      fontSize: '0.95rem',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.3s ease',
      backgroundColor: '#64ffda',
      color: '#0a192f'
    }}>
      <i className="fas fa-user-plus" style={{ fontSize: '0.9rem' }}></i> Create Sector Head
    </button>
  </div>
)}

        {activeTab === "ratings" && (
          <div style={{ 
            flex: 1, 
            padding: '20px', 
            backgroundColor: '#0a192f', 
            overflowY: 'auto' 
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              marginBottom: '20px', 
              color: '#ccd6f6' 
            }}>
              <i className="fas fa-star" style={{ color: '#64ffda', marginRight: '10px' }}></i>
              Sector-wise Ratings
            </h2>

            {sectorRatings.length > 0 ? (
              <div style={{ 
                backgroundColor: '#112240', 
                padding: '15px', 
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <Bar
                  data={{
                    labels: sectorRatings.map(r => r._id),
                    datasets: [
                      {
                        label: 'Average Rating',
                        data: sectorRatings.map(r => r.averageRating.toFixed(2)),
                        backgroundColor: '#64ffda'
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    plugins: { 
                      legend: { display: false },
                      title: {
                        display: true,
                        text: 'Average Ratings by Sector',
                        color: '#ccd6f6',
                        font: {
                          size: 16
                        }
                      }
                    },
                    scales: { 
                      y: { 
                        min: 0, 
                        max: 5, 
                        ticks: {
                          stepSize: 0.5,
                          color: '#8892b0'
                        },
                        grid: {
                          color: 'rgba(255,255,255,0.1)'
                        }
                      },
                      x: {
                        ticks: {
                          color: '#8892b0'
                        },
                        grid: {
                          color: 'rgba(255,255,255,0.1)'
                        }
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <p style={{ color: '#8892b0' }}>No ratings data available yet.</p>
            )}
          </div>
        )}
      </div>

      {/* Inline CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: 'Poppins', sans-serif;
          overflow: hidden;
        }
        
        .sidebar button:hover, .actionButton:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .dashboardCard:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        textarea:focus, input:focus, select:focus {
          outline: none;
          border-color: #64ffda !important;
          box-shadow: 0 0 0 2px rgba(100, 255, 218, 0.2);
        }
        
        button {
          transition: all 0.3s ease;
        }
        
        button:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}

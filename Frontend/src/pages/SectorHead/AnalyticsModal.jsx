import React, { useState, useEffect } from 'react';

const AnalyticsModal = ({ analytics: initialAnalytics, onClose }) => {
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [loadingRating, setLoadingRating] = useState(false);
  const [loadingTotalIssues, setLoadingTotalIssues] = useState(false);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        setLoadingRating(true);
        const ratingResponse = await fetch(
          "https://civicconnect-backend.onrender.com/api/sector-head/average-rating",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if (ratingResponse.ok) {
          const ratingData = await ratingResponse.json();
          setAnalytics(prev => ({
            ...prev,
            averageRating: parseFloat(ratingData.averageRating) || 0
          }));
        } else {
          setAnalytics(prev => ({
            ...prev,
            averageRating: 0
          }));
        }

        setLoadingTotalIssues(true);
        const analyticsResponse = await fetch(
          "https://civicconnect-backend.onrender.com/api/sector-head/analytics",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          setAnalytics(prev => ({
            ...prev,
            totalIssues: analyticsData.totalIssues || 0,
            mostReportedCategory: analyticsData.mostReportedCategory || 'N/A',
            issuesByCategory: analyticsData.issuesByCategory || []
          }));
        }
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoadingRating(false);
        setLoadingTotalIssues(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#4CAF50'; 
    if (rating >= 3.5) return '#8BC34A'; 
    if (rating >= 2.5) return '#FFEB3B'; 
    if (rating >= 1.5) return '#FF9800'; 
    return '#F44336'; 
  };

  const createPieChartData = (rating) => {
    const normalizedRating = Math.min(Math.max(rating, 0), 5); 
    const filledDegrees = (normalizedRating / 5) * 360;
    return {
      filledDegrees,
      remainingDegrees: 360 - filledDegrees,
      color: getRatingColor(normalizedRating)
    };
  };

  const pieData = createPieChartData(analytics.averageRating);

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeButton} onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        
        <h2 style={styles.modalTitle}>
          <i className="fas fa-chart-bar" style={styles.icon}></i> Sector Analytics
        </h2>
        
        <div style={styles.analyticsGrid}>
          {}
          <div style={styles.analyticsCard}>
            <div style={styles.cardHeader}>
              <i className="fas fa-exclamation-circle" style={styles.cardIcon}></i>
              <h3 style={styles.cardTitle}>Total Issues</h3>
            </div>
            <div style={styles.cardValue}>
              {loadingTotalIssues ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                analytics.totalIssues || 0
              )}
            </div>
          </div>
          
          {}
          <div style={styles.analyticsCard}>
            <div style={styles.cardHeader}>
              <i className="fas fa-star" style={styles.cardIcon}></i>
              <h3 style={styles.cardTitle}>Most Reported</h3>
            </div>
            <div style={styles.cardValue}>
              {loadingTotalIssues ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                analytics.mostReportedCategory || 'N/A'
              )}
            </div>
          </div>
          
          {}
          <div style={styles.analyticsCard}>
            <div style={styles.cardHeader}>
              <i className="fas fa-clock" style={styles.cardIcon}></i>
              <h3 style={styles.cardTitle}>Avg. Resolution Time</h3>
            </div>
            <div style={styles.cardValue}>5-7 days</div>
          </div>
          
          {}
          <div style={styles.analyticsCard}>
            <div style={styles.cardHeader}>
              <i className="fas fa-thumbs-up" style={styles.cardIcon}></i>
              <h3 style={styles.cardTitle}>Avg. Feedback Rating</h3>
            </div>
            <div style={styles.cardValue}>
              {loadingRating ? (
              <i className="fas fa-spinner fa-spin"></i>
              ) : (
              <>
             {(analytics.averageRating ?? 0).toFixed(1)}
              <span style={styles.ratingOutOf}>/5</span>
              </>
              )}
            </div>
          </div>
        </div>

        {}
        <div style={styles.chartSection}>
          <h3 style={styles.sectionTitle}>
            <i className="fas fa-chart-pie"></i> Average Rating Visualization
          </h3>
          <div style={styles.pieChartContainer}>
            {loadingRating ? (
              <div style={styles.loadingContainer}>
                <i className="fas fa-spinner fa-spin"></i> Loading rating...
              </div>
            ) : analytics.averageRating > 0 ? (
              <>
                <div style={styles.pieChartWrapper}>
                  <div style={styles.pieChart}>
                    <div style={{
                      ...styles.pieSegment,
                      backgroundColor: pieData.color,
                      transform: `rotate(${pieData.filledDegrees}deg)`,
                      clipPath: pieData.filledDegrees <= 180 ? 
                        'polygon(50% 50%, 50% 0, 100% 0, 100% 50%)' : 
                        'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 0)'
                    }}></div>
                    <div style={{
                      ...styles.pieSegment,
                      backgroundColor: '#2D3748',
                      transform: `rotate(${pieData.filledDegrees}deg)`,
                      clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 50%)'
                    }}></div>
                  </div>
                  <div style={styles.pieChartCenter}>
                    <div style={styles.ratingValue}>
                      {analytics.averageRating.toFixed(1)}
                      <span style={styles.ratingMax}>/5</span>
                    </div>
                  </div>
                </div>
                <div style={styles.legendContainer}>
                  <div style={styles.legendItem}>
                    <div style={{...styles.legendColor, backgroundColor: '#4CAF50'}}></div>
                    <span>4.5-5 (Excellent)</span>
                  </div>
                  <div style={styles.legendItem}>
                    <div style={{...styles.legendColor, backgroundColor: '#8BC34A'}}></div>
                    <span>3.5-4.4 (Good)</span>
                  </div>
                  <div style={styles.legendItem}>
                    <div style={{...styles.legendColor, backgroundColor: '#FFEB3B'}}></div>
                    <span>2.5-3.4 (Average)</span>
                  </div>
                  <div style={styles.legendItem}>
                    <div style={{...styles.legendColor, backgroundColor: '#FF9800'}}></div>
                    <span>1.5-2.4 (Poor)</span>
                  </div>
                  <div style={styles.legendItem}>
                    <div style={{...styles.legendColor, backgroundColor: '#F44336'}}></div>
                    <span>0-1.4 (Very Poor)</span>
                  </div>
                </div>
              </>
            ) : (
              <div style={styles.noData}>No rating data available</div>
            )}
          </div>
        </div>
        
        {}
        <div style={styles.chartSection}>
          <h3 style={styles.sectionTitle}>
            <i className="fas fa-chart-pie"></i> Issues by Category
          </h3>
          <div style={styles.chartContainer}>
            {loadingTotalIssues ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <i className="fas fa-spinner fa-spin"></i> Loading categories...
              </div>
            ) : (
              analytics.issuesByCategory?.map((category) => (
                <div key={category._id} style={styles.chartBarContainer}>
                  <div style={styles.chartBarLabel}>
                    {category._id}: {category.count}
                  </div>
                  <div style={styles.chartBarBackground}>
                    <div 
                      style={{
                        ...styles.chartBarFill,
                        width: `${(category.count / analytics.totalIssues) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              )) || <div>No category data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 255, 255, 0.1)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(30px)',
  },
  modalContent: {
    background: '#f2f2f206',
    padding: '25px',
    borderRadius: '30px',
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0)',
    backdropFilter: 'blur(10px)',
    color: '#ffffffff',
  },
  closeButton: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#8892b0',
    transition: 'color 0.3s ease',
    padding: '5px',
  },
  modalTitle: {
    color: '#64ffda',
    marginBottom: '30px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  icon: {
    fontSize: '1.5rem',
  },
  analyticsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  analyticsCard: {
    background: '#1e2a47',
    borderRadius: '30px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '15px',
  },
  cardIcon: {
    color: '#64ffda',
    fontSize: '1.2rem',
  },
  cardTitle: {
    margin: 0,
    fontSize: '1rem',
    color: '#8892b0',
  },
  cardValue: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#e6f1ff',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  ratingOutOf: {
    fontSize: '1rem',
    color: '#8892b0',
    marginLeft: '5px',
  },
  chartSection: {
    marginTop: '30px',
  },
  sectionTitle: {
    color: '#64ffda',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  pieChartContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  pieChartWrapper: {
    position: 'relative',
    width: '200px',
    height: '200px',
  },
  pieChart: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    position: 'relative',
    overflow: 'hidden',
    background: '#2D3748',
  },
  pieSegment: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 50%)',
    transformOrigin: 'center',
  },
  pieChartCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '60%',
    height: '60%',
    borderRadius: '50%',
    background: '#112240',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
  },
  ratingValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#64ffda',
    textAlign: 'center',
  },
  ratingMax: {
    fontSize: '1rem',
    color: '#8892b0',
    marginLeft: '5px',
  },
  legendContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '15px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
  },
  legendColor: {
    width: '15px',
    height: '15px',
    borderRadius: '30px',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '20px',
  },
  noData: {
    textAlign: 'center',
    padding: '20px',
    color: '#8892b0',
  },
  chartContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  chartBarContainer: {
    marginBottom: '10px',
  },
  chartBarLabel: {
    marginBottom: '5px',
    fontSize: '0.9rem',
    color: '#8892b0',
  },
  chartBarBackground: {
    height: '10px',
    backgroundColor: '#0a192f',
    borderRadius: '30px',
    overflow: 'hidden',
  },
  chartBarFill: {
    height: '100%',
    background: 'linear-gradient(to right, #64ffda, #4d9de0)',
    borderRadius: '30px',
  },
};

export default AnalyticsModal;

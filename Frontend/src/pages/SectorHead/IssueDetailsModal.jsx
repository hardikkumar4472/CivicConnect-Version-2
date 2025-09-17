import React, { useState, useEffect } from 'react';
import axios from 'axios';

const IssueDetailsModal = ({ 
  selectedIssue, 
  onClose,
  refreshIssues = () => {} // Default empty function if not provided
}) => {
  const [citizenDetails, setCitizenDetails] = useState({
    name: "Loading...",
    email: "Loading...",
    phone: "Loading...",
    houseId: "Not available"
  });
  const [loadingCitizenDetails, setLoadingCitizenDetails] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [addingComment, setAddingComment] = useState(false);

  // Status options exactly matching backend enum
  const statusOptions = ['Pending', 'In Progress', 'Resolved', 'Escalated', 'Closed'];

  const statusStyles = {
    'Pending': { backgroundColor: 'rgba(255, 193, 7, 0.2)', color: '#ffc107' },
    'In Progress': { backgroundColor: 'rgba(33, 150, 243, 0.2)', color: '#2196f3' },
    'Resolved': { backgroundColor: 'rgba(76, 175, 80, 0.2)', color: '#4caf50' },
    'Escalated': { backgroundColor: 'rgba(156, 39, 176, 0.2)', color: '#9c27b0' },
    'Closed': { backgroundColor: 'rgba(244, 67, 54, 0.2)', color: '#f44336' },
  };

  useEffect(() => {
    if (!selectedIssue) return;

    const fetchCitizenDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!selectedIssue.citizen) return;
        
        setLoadingCitizenDetails(true);
        const response = await axios.get(
          `https://civicconnect-backend.onrender.com/sector-head/sector-citizens`,
          { 
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const citizen = response.data.citizens.find(
          c => c._id.toString() === selectedIssue.citizen.toString()
        );

        if (citizen) {
          setCitizenDetails({
            name: citizen.name || "Anonymous",
            email: citizen.email || "Not provided",
            phone: citizen.phone || "Not provided",
            houseId: citizen.houseId || "Not available"
          });
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setCitizenDetails({
          name: "Anonymous",
          email: "Not provided",
          phone: "Not provided",
          houseId: "Not available"
        });
      } finally {
        setLoadingCitizenDetails(false);
      }
    };

    fetchCitizenDetails();

    // Load existing comments from the issue
    if (selectedIssue.comments && selectedIssue.comments.length > 0) {
      setComments(selectedIssue.comments);
    } else {
      setComments([]);
    }
  }, [selectedIssue]);

  const handleStatusChange = async () => {
  if (!newStatus) return;

  try {
    setIsUpdating(true);
    const token = localStorage.getItem("token");

    // Make API call to update status
    const response = await axios.put(
      `https://civicconnect-backend.onrender.com/api/issues/${selectedIssue._id}/status`,
      { status: newStatus },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Status update response:', response.data);

    // Update the parent component's issues list
    if (typeof refreshIssues === 'function') {
      await refreshIssues();
    }

    // Pass the updated issue back to the parent
    if (typeof onClose === 'function') {
      onClose(response.data);
    }

    alert('Status updated successfully!');
    
    // Refresh the page after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 100); // 1 second delay to show the success message

  } catch (error) {
    console.error("Error updating status:", error);
    alert(`Failed to update status: ${error.response?.data?.message || error.message}`);
  } finally {
    setIsUpdating(false);
    setShowStatusModal(false);
  }
};

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    
    setAddingComment(true);
    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.post(
        `https://civicconnect-backend.onrender.com/api/issues/${selectedIssue._id}/comment`,
        { text: comment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Add the new comment to the local state
      const newComment = response.data.comment;
      setComments([...comments, newComment]);
      setComment("");
      
      // Refresh the issues list to show the updated comment
      if (typeof refreshIssues === 'function') {
        await refreshIssues();
      }
      
      alert('Comment added successfully!');
    } catch (error) {
      console.error("Error adding comment:", error);
      alert(`Failed to add comment: ${error.response?.data?.message || error.message}`);
    } finally {
      setAddingComment(false);
    }
  };

  if (!selectedIssue) return null;

  if (loadingCitizenDetails) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '30px',
          borderTopColor: '#64ffda',
          animation: 'spin 1s ease-in-out infinite',
          marginBottom: '20px',
        }}></div>
        <p style={{ color: '#ccd6f6' }}>Loading issue details...</p>
      </div>
    );
  }

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(30px)',
      }} onClick={() => onClose(null)}>
        <div style={{
          background: '#11224005',
          padding: '25px',
          borderRadius: '30px',
          width: '90%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          color: '#ccd6f6',
          // backdropFilter: 'blur(30px)',
  
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
              color: '#8892b0',
              transition: 'color 0.3s ease',
              padding: '5px',
            }}
            onClick={() => onClose(null)}
          >
            ×
          </button>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ margin: 0, color: '#64ffda', fontSize: '1.5rem', flex: 1, minWidth: '200px' }}>{selectedIssue.title}</h2>
              <div style={{
                display: 'inline-block',
                padding: '5px 15px',
                borderRadius: '30px',
                fontSize: '0.8rem',
                fontWeight: '600',
                marginTop: '10px',
                textTransform: 'uppercase',
                ...statusStyles[selectedIssue.status]
              }}>
                {selectedIssue.status}
              </div>
              <p style={{ color: '#8892b0', fontSize: '0.8rem' }}>Issue ID: {selectedIssue._id}</p>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '30px', minWidth: '200px' }}>
              <p><strong>Raised By:</strong> {citizenDetails.name}</p>
              <p><strong>Email:</strong> {citizenDetails.email}</p>
              <p><strong>Phone:</strong> {citizenDetails.phone}</p>
              <p><strong>House ID:</strong> {citizenDetails.houseId}</p>
            </div>
          </div>
          
          <div style={{ margin: '20px 0', borderRadius: '30px', overflow: 'hidden', maxHeight: '400px' }}>
            <img
              src={selectedIssue.imageUrl || "https://via.placeholder.com/600x300?text=No+Image"}
              alt={selectedIssue.title}
              style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/600x300?text=No+Image";
              }}
            />
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#64ffda', fontSize: '1.1rem', marginBottom: '10px' }}>
                Description
              </h3>
              <p style={{ margin: '0 0 10px', lineHeight: '1.6', color: '#8892b0' }}>{selectedIssue.description}</p>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#64ffda', fontSize: '1.1rem', marginBottom: '10px' }}>
                Location Details
              </h3>
              <p style={{ margin: '0 0 10px', lineHeight: '1.6', color: '#8892b0' }}>
                <strong>Address:</strong> {selectedIssue.address}
              </p>
              <p style={{ margin: '0 0 10px', lineHeight: '1.6', color: '#8892b0' }}>
                <strong>Landmark:</strong> {selectedIssue.landmark || "Not specified"}
              </p>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#64ffda', fontSize: '1.1rem', marginBottom: '10px' }}>
                Timeline
              </h3>
              <p style={{ margin: '0 0 10px', lineHeight: '1.6', color: '#8892b0' }}>
                <strong>Reported On:</strong> {new Date(selectedIssue.createdAt).toLocaleString()}
              </p>
              {selectedIssue.updatedAt && (
                <p style={{ margin: '0 0 10px', lineHeight: '1.6', color: '#8892b0' }}>
                  <strong>Last Updated:</strong> {new Date(selectedIssue.updatedAt).toLocaleString()}
                </p>
              )}
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#64ffda', fontSize: '1.1rem', marginBottom: '10px' }}>
                Comments & Updates
              </h3>
              <div style={{
                backgroundColor: 'rgba(0,0,0,0)',
                padding: '15px',
                borderRadius: '30px',
                marginBottom: '15px',
                maxHeight: '200px',
                backdropFilter: 'blur(30px)',
                overflowY: 'auto'

              }}>
                {comments.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    color: '#8892b0',
                    padding: '20px'
                  }}>
                    <i className="fas fa-info-circle" style={{ fontSize: '2rem', marginBottom: '10px', display: 'block' }}></i>
                    <p>No comments yet</p>
                    <p style={{ fontSize: '0.9rem', marginTop: '5px' }}>
                      Add a comment to provide updates to the citizen.
                    </p>
                  </div>
                ) : (
                  comments.map(comment => (
                    <div key={comment._id || comment.id} style={{
                      marginBottom: '10px',
                      paddingBottom: '10px',
                      borderBottom: '1px solid #233554'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '5px'
                      }}>
                        <strong style={{ color: '#64ffda' }}>{comment.author}</strong>
                        <span style={{ color: '#8892b0', fontSize: '0.8rem' }}>
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p style={{ color: '#ccd6f6', margin: 0 }}>{comment.text}</p>
                    </div>
                  ))
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment or update..."
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '30px',
                    border: '1px solid #233554',
                    backgroundColor: '#0a192f',
                    color: '#ccd6f6',
                    fontSize: '0.9rem'
                  }}
                />
                <button
                  onClick={handleAddComment}
                  disabled={addingComment || !comment.trim()}
                  style={{
                    padding: '10px 15px',
                    borderRadius: '30px',
                    border: 'none',
                    background: '#64ffda',
                    color: '#0a192f',
                    cursor: 'pointer',
                    fontWeight: '600',
                    opacity: addingComment || !comment.trim() ? 0.7 : 1
                  }}
                >
                  {addingComment ? 'Adding...' : 'Add Comment'}
                </button>
              </div>
            </div>
            
            <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#64ffda', fontWeight: '500' }}>Current Status: </span>
                <span style={{ 
                  padding: '5px 10px',
                  borderRadius: '30px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  ...statusStyles[selectedIssue.status]
                }}>
                  {selectedIssue.status}
                </span>
              </div>
              <button
                onClick={() => {
                  setNewStatus(selectedIssue.status);
                  setShowStatusModal(true);
                }}
                style={{
                  padding: '10px 15px',
                  borderRadius: '30px',
                  border: 'none',
                  backgroundColor: '#1e2a47',
                  color: '#64ffda',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: 'fit-content',
                }}
              >
                Change Status
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Change Modal */}
      {showStatusModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1001,
        }}>
          <div style={{
            background: '#112240',
            padding: '25px',
            borderRadius: '30px',
            width: '90%',
            maxWidth: '400px',
            position: 'relative',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            color: '#ccd6f6',
          }}>
            <button
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'transparent',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#8892b0',
                padding: '5px',
              }}
              onClick={() => setShowStatusModal(false)}
            >
              ×
            </button>

            <h3 style={{ color: '#64ffda', marginBottom: '20px' }}>
              Update Issue Status
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ marginBottom: '15px' }}>Select new status:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {statusOptions.map((status) => (
                  <label key={status} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={newStatus === status}
                      onChange={() => setNewStatus(status)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ 
                      padding: '5px 10px',
                      borderRadius: '30px',
                      ...statusStyles[status]
                    }}>
                      {status}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleStatusChange}
              disabled={!newStatus || isUpdating}
              style={{
                padding: '10px 20px',
                borderRadius: '30px',
                border: 'none',
                backgroundColor: newStatus ? '#1e2a47' : '#1e2a4770',
                color: newStatus ? '#64ffda' : '#8892b070',
                cursor: newStatus ? 'pointer' : 'not-allowed',
                fontWeight: '600',
                width: '100%',
              }}
            >
              {isUpdating ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default IssueDetailsModal;

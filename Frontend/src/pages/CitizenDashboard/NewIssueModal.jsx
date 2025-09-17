import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} icon={customIcon} /> : null;
}

export default function NewIssueModal({ onSubmit, onClose }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: 'Water',
    description: '',
    imageUrl: '',
    latitude: '28.7041',
    longitude: '77.1025',
    address: '',
    sector: '', 
    houseId: '' 
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [fetchingData, setFetchingData] = useState(true);
  const [mapPosition, setMapPosition] = useState([28.7041, 77.1025]); 
  const [locationName, setLocationName] = useState('Delhi, India');

  useEffect(() => {
    const fetchCitizenData = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Fetching citizen data with token:', token ? 'Present' : 'Missing');
        
        const response = await axios.get('https://civicconnect-backend.onrender.com/api/citizen/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log('Citizen data response:', response.data);
        
        setFormData(prev => ({
          ...prev,
          sector: response.data.data.sector,
          houseId: response.data.data.houseId
        }));
        
        console.log('Updated form data with citizen info');
      } catch (error) {
        console.error('Error fetching citizen data:', error);
        if (error.response?.status === 401) {
          alert('Session expired. Please login again.');
          onClose();
        }
      } finally {
        setFetchingData(false);
      }
    };

    fetchCitizenData();
  }, [onClose]);
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      latitude: mapPosition[0].toFixed(6),
      longitude: mapPosition[1].toFixed(6)
    }));
    fetchLocationName(mapPosition[0], mapPosition[1]);
  }, [mapPosition]);
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      latitude: mapPosition[0].toFixed(6),
      longitude: mapPosition[1].toFixed(6)
    }));
  }, []);

  const fetchLocationName = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      if (data.display_name) {
        setLocationName(data.display_name.split(', ').slice(0, 3).join(', '));
      }
    } catch (error) {
      console.error('Error fetching location name:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('Current form data:', formData);
    if (!formData.description.trim()) {
      alert('Please enter a description for the issue');
      return;
    }
    
    if (!formData.latitude || !formData.longitude) {
      alert('Please select a location on the map');
      return;
    }
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      alert('Invalid coordinates. Please select a location on the map again.');
      return;
    }
    
    if (!formData.sector || !formData.houseId) {
      alert('Missing sector or house ID information. Please refresh the page and try again.');
      return;
    }
    
    setLoading(true);
    try {
      const cleanFormData = {
        category: formData.category,
        description: formData.description.trim(),
        imageUrl: formData.imageUrl,
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
        address: formData.address.trim(),
        sector: formData.sector,
        houseId: formData.houseId
      };
      console.log('Submitting issue with clean data:', cleanFormData);
      const result = await onSubmit(cleanFormData);
      console.log('Submit result:', result);
      alert('Issue submitted successfully! Redirecting to dashboard...');
      onClose();
      navigate('/citizen-dashboard');
      
    } catch (error) {
      console.error('Error submitting issue:', error);
      alert('Failed to submit issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 1)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: '#112240',
          borderRadius: '8px',
          padding: '25px',
          textAlign: 'center'
        }}>
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p style={{ color: '#64ffda', marginTop: '15px' }}>Loading your information...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        backgroundColor: 'rgba(0,0,0,0)',
        backdropFilter: 'blur(40px)',
        borderRadius: '10px',
        padding: '25px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        className: 'modal-scroll',
        boxShadow: '0 3px 3px rgba(165, 165, 165, 1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{
            color: '#64ffda',
            margin: 0,
            fontSize: '1.5rem'
          }}>
            <i className="fas fa-plus-circle" style={{ marginRight: '10px' }}></i>
            Report New Issue
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#ccd6f6',
              fontSize: '1.5rem',
              cursor: 'pointer'
            }}
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Category dropdown remains the same */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              color: '#ccd6f6',
              fontWeight: '500',
            }}>
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '30px',
                border: '1px solid #233554',
                backgroundColor: '#0a192f',
                color: '#ccd6f6',
                fontSize: '1rem'
              }}
            >
              <option value="Water">Water</option>
              <option value="Electricity">Electricity</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Roads">Roads</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          {}
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              color: '#ccd6f6',
              fontWeight: '500'
            }}>
              Sector
            </label>
            <input
              type="text"
              name="sector"
              value={formData.sector}
              readOnly
              style={{
                width: '96%',
                padding: '10px',
                borderRadius: '30px',
                border: '1px solid #233554',
                backgroundColor: '#0a1a2f',
                color: '#8892b0',
                fontSize: '1rem',
                cursor: 'not-allowed'
              }}
            />
          </div>
          
          {}
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              color: '#ccd6f6',
              fontWeight: '500'
            }}>
              House ID
            </label>
            <input
              type="text"
              name="houseId"
              value={formData.houseId}
              readOnly
              style={{
                width: '96%',
                padding: '10px',
                borderRadius: '30px',
                border: '1px solid #233554',
                backgroundColor: '#0a1a2f',
                color: '#8892b0',
                fontSize: '1rem',
                cursor: 'not-allowed'
              }}
            />
          </div>
          
          {}
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              color: '#ccd6f6',
              fontWeight: '500'
            }}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              style={{
                width: '96%',
                padding: '10px',
                borderRadius: '30px',
                border: '1px solid #233554',
                backgroundColor: '#0a192f',
                color: '#ccd6f6',
                fontSize: '1rem',
                resize: 'vertical'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              color: '#ccd6f6',
              fontWeight: '500'
            }}>
              Upload Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{
                width: '96%',
                padding: '10px',
                borderRadius: '30px',
                border: '1px solid #233554',
                backgroundColor: '#0a192f',
                color: '#ccd6f6',
                fontSize: '1rem'
              }}
            />
            {imagePreview && (
              <div style={{ marginTop: '10px' }}>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{
                    maxWidth: '96%',
                    maxHeight: '200px',
                    borderRadius: '30px'
                  }}
                />
              </div>
            )}
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              color: '#ccd6f6',
              fontWeight: '500'
            }}>
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              style={{
                width: '96%',
                padding: '10px',
                borderRadius: '30px',
                border: '1px solid #233554',
                backgroundColor: '#0a192f',
                color: '#ccd6f6',
                fontSize: '1rem'
              }}
            />
          </div>
          
          {}
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              color: '#ccd6f6',
              fontWeight: '500'
            }}>
              Select Location on Map
            </label>
            <div style={{
              border: '1px solid #233554',
              borderRadius: '30px',
              overflow: 'hidden',
              height: '200px'
            }}>
              <MapContainer
                center={mapPosition}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker position={mapPosition} setPosition={setMapPosition} />
              </MapContainer>
            </div>
            <div style={{
              marginTop: '10px',
              padding: '10px',
              backgroundColor: '#0a1a2f',
              borderRadius: '30px',
              border: '1px solid #233554'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                marginBottom: '10px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '5px',
                    color: '#8892b0',
                    fontSize: '0.9rem'
                  }}>
                    Latitude: {formData.latitude}
                  </label>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '5px',
                    color: '#8892b0',
                    fontSize: '0.9rem'
                  }}>
                    Longitude: {formData.longitude}
                  </label>
                </div>
              </div>
              <div style={{
                color: '#64ffda',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                📍 {locationName}
              </div>
            </div>
            <p style={{
              color: '#8892b0',
              fontSize: '0.8rem',
              marginTop: '5px',
              fontStyle: 'italic'
            }}>
              Click on the map to select the exact location of your issue
            </p>
            
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '15px',
            marginTop: '20px'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                borderRadius: '30px',
                border: 'none',
                background: '#ff6b6b',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                borderRadius: '30px',
                border: 'none',
                background: '#64ffda',
                color: '#0a192f',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Submitting...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i> Submit Issue
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

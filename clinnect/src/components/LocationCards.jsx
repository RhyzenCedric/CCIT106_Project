import React, { useState } from 'react';
import '../css/LocationCards.css';

const LocationCards = ({  locations = [], onLocationSelect }) => {
  const [showHospitals, setShowHospitals] = useState(false);
  const [showClinics, setShowClinics] = useState(false);

  const hospitals = locations
    .filter(loc => loc.type === 'hospital')
    .sort((a, b) => a.hospital_name.localeCompare(b.hospital_name));

  const clinics = locations
    .filter(loc => loc.type === 'clinic')
    .sort((a, b) => a.clinic_name.localeCompare(b.clinic_name));

  const handleLocationClick = (location) => {
    // Get the correct coordinates based on location type
    const coordinates = location.type === 'hospital' 
      ? [parseFloat(location.hospital_latitude), parseFloat(location.hospital_longitude)]
      : [parseFloat(location.clinic_latitude), parseFloat(location.clinic_longitude)];
      
    // Pass the coordinates to the parent component
    if (onLocationSelect) {
      onLocationSelect(coordinates);
    }
  };

  if (locations.length === 0) return null;

  return (
    <div className="location-cards-container">
      <div className="location-cards-scroll">
        {hospitals.length > 0 && (
          <div className="location-section">
            <div
              className="section-header hospital-header"
              onClick={() => setShowHospitals(!showHospitals)}
            >
              <span className="section-icon">🏥</span>
              <h2>Hospitals</h2>
              <span className="toggle-icon">{showHospitals ? '▼' : '▶'}</span>
            </div>
            {showHospitals && (
              <div className="cards-grid">
                {hospitals.map((hospital, index) => (
                  <div
                    key={index}
                    className="location-card hospital-card"
                    onClick={() => handleLocationClick(hospital)}
                  >
                    <div className="card-header">
                      <h3>{hospital.hospital_name}</h3>
                    </div>
                    <div className="card-content">
                      <p className="address">{hospital.hospital_address}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {clinics.length > 0 && (
          <div className="location-section">
            <div
              className="section-header clinic-header"
              onClick={() => setShowClinics(!showClinics)}
            >
              <span className="section-icon">⚕️</span>
              <h2>Clinics</h2>
              <span className="toggle-icon">{showClinics ? '▼' : '▶'}</span>
            </div>
            {showClinics && (
              <div className="cards-grid">
                {clinics.map((clinic, index) => (
                  <div
                    key={index}
                    className="location-card clinic-card"
                    onClick={() => handleLocationClick(clinic)}
                  >
                    <div className="card-header">
                      <h3>{clinic.clinic_name}</h3>
                    </div>
                    <div className="card-content">
                      <p className="address">{clinic.clinic_address}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationCards;


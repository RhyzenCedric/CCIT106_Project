import React, { useState } from 'react';
import '../css/LocationCards.css';

const LocationCards = ({ locations, onLocationSelect }) => {
  // Separate locations into hospitals and clinics
  const hospitals = locations
    .filter(loc => loc.type === 'hospital')
    .sort((a, b) => a.hospital_name.localeCompare(b.hospital_name)); // Sort alphabetically by hospital name

  const clinics = locations
    .filter(loc => loc.type === 'clinic')
    .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by clinic name

  // State to manage visibility of each section
  const [showHospitals, setShowHospitals] = useState(false);
  const [showClinics, setShowClinics] = useState(false);

  // Only render if there are locations
  if (locations.length === 0) return null;

  return (
    <div className="location-cards-container">
      <div className="location-cards-scroll">
        {/* Hospitals Section */}
        {hospitals.length > 0 && (
          <div className="location-section">
            <div
              className="section-header hospital-header"
              onClick={() => setShowHospitals(!showHospitals)}
            >
              <span className="section-icon">🏥</span>
              <h2>Hospitals</h2>
              <span className="toggle-icon">
                {showHospitals ? '▼' : '▶'}
              </span>
            </div>
            {showHospitals && (
              <div className="cards-grid">
                {hospitals.map((hospital, index) => (
                  <div
                    key={index}
                    className="location-card hospital-card"
                    onClick={() => onLocationSelect(hospital)} // Pass selected location
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

        {/* Clinics Section */}
        {clinics.length > 0 && (
          <div className="location-section">
            <div
              className="section-header clinic-header"
              onClick={() => setShowClinics(!showClinics)}
            >
              <span className="section-icon">⚕️</span>
              <h2>Clinics</h2>
              <span className="toggle-icon">
                {showClinics ? '▼' : '▶'}
              </span>
            </div>
            {showClinics && (
              <div className="cards-grid">
                {clinics.map((clinic, index) => (
                  <div
                    key={index}
                    className="location-card clinic-card"
                    onClick={() => onLocationSelect(clinic)}
                  >
                    <div className="card-header">
                      <h3>{clinic.name}</h3>
                    </div>
                    <div className="card-content">
                      <p className="address">{clinic.address}</p>
                      <p className="contact">
                        <span className="label">Contact:</span> {clinic.contact}
                      </p>
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


import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import Navbar from './NavbarDashboard';
import '../css/MapComponent.css';
import L from 'leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faHospital, faClinicMedical } from '@fortawesome/free-solid-svg-icons';
import ReactDOMServer from 'react-dom/server';
import axios from 'axios';
import LocationCards from './LocationCards';

// FlyToLocations as a separate component
const FlyToLocations = ({ selectedLocation }) => {
    const map = useMap();

    useEffect(() => {
        if (selectedLocation) {
            const { latitude, longitude } = selectedLocation;
            map.flyTo([latitude, longitude],16, { duration: 1 }); // Fly to the selected location
        }
    }, [selectedLocation, map]);

    return null;
};

const MapComponent = () => {
    const [position, setPosition] = useState([14.077410594300181, 121.14928967621167]); // Default to a fallback location
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null); // State to track selected location

    // Custom marker icons
    const createCustomIcon = (icon, color) => {
        return new L.DivIcon({
            className: 'custom-marker',
            html: ReactDOMServer.renderToString(
                <FontAwesomeIcon 
                    icon={icon} 
                    style={{ color: color, fontSize: '24px' }} 
                />
            ),
        });
    };

    const hospitalIcon = createCustomIcon(faHospital, 'blue');
    const clinicIcon = createCustomIcon(faClinicMedical, 'green');
    const defaultLocationIcon = createCustomIcon(faLocationDot, 'red');

    // Fetch user geolocation on component mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (location) => {
                    const { latitude, longitude } = location.coords;
                    setPosition([latitude, longitude]);
                },
                (error) => {
                    console.error('Error retrieving geolocation:', error);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    }, []);

    // Handle search and update locations
    const handleSearch = async (searchQuery) => {
        if (typeof searchQuery === 'string' && searchQuery.toLowerCase() === 'medicard') {
            try {
                const response = await axios.get(`http://localhost:5000/api/search?query=${searchQuery}`);
                setLocations(response.data);
            } catch (error) {
                console.error('Error fetching locations:', error);
                setLocations([]);
            }
        } else {
            setLocations([]);
        }
    };

    return (
        <div className="app-container">
            <Navbar 
                setPosition={setPosition} 
                onSearch={handleSearch}
            />
            <MapContainer
                center={position}
                zoom={20}
                className='map-container'
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />

                {/* Render additional location markers */}
                {locations.map((loc, index) => (
                    <Marker 
                        key={index} 
                        position={[parseFloat(loc.latitude), parseFloat(loc.longitude)]} 
                        icon={loc.type === 'hospital' ? hospitalIcon : clinicIcon}
                    >
                        <Popup>
                            <div>
                                <strong>{loc.name}</strong>
                                <br />
                                {loc.address}
                                <br />
                                Type: {loc.type.charAt(0).toUpperCase() + loc.type.slice(1)}
                                <br />
                                Contact: {loc.contact}
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Fly to the selected location */}
                {selectedLocation && <FlyToLocations selectedLocation={selectedLocation} />}
            </MapContainer>
            <LocationCards 
                locations={locations} 
                onLocationSelect={setSelectedLocation} // Pass function to handle card selection
            />
        </div>
    );
};

export default MapComponent;

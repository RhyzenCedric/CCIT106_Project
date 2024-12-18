import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import Navbar from './NavbarDashboard';
import '../css/MapComponent.css';
import L from 'leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faHospital, faClinicMedical } from '@fortawesome/free-solid-svg-icons';
import ReactDOMServer from 'react-dom/server';
import axios from 'axios';

// FlyToLocations as a separate component
const FlyToLocations = ({ locations }) => {
    const map = useMap();

    React.useEffect(() => {
        if (locations.length > 0) {
            // Extract coordinates
            const coords = locations.map(loc => [
                parseFloat(loc.latitude), 
                parseFloat(loc.longitude)
            ]);

            // Calculate bounds
            const bounds = L.latLngBounds(coords);

            // Fit bounds with padding
            map.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 12
            });
        }
    }, [locations]);

    return null;
};

const MapComponent = () => {
    const [position, setPosition] = useState([14.077410594300181, 121.14928967621167]); // Default location
    const [locations, setLocations] = useState([]);

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

    // Handle search and update locations
    const handleSearch = async (searchQuery) => {
        // Check if searchQuery is a string and not empty
        if (typeof searchQuery === 'string' && searchQuery.toLowerCase() === 'medicard') {
            try {
                // Client-side logging
                console.log(`[${new Date().toISOString()}] Fetching Medicard Locations`);

                // Fetch locations
                const response = await axios.get(`http://localhost:5000/api/search?query=${searchQuery}`);
                
                // Log fetched locations
                console.log(`[${new Date().toISOString()}] Total Locations Found: ${response.data.length}`);
                
                // Log detailed location information
                response.data.forEach((location, index) => {
                    console.log(`Location ${index + 1}:`, {
                        name: location.name,
                        type: location.type,
                        address: location.address,
                        latitude: location.latitude,
                        longitude: location.longitude
                    });
                });

                // Update locations state
                setLocations(response.data);
            } catch (error) {
                // Error logging
                console.error(`[${new Date().toISOString()}] Error Fetching Locations:`, error);
                setLocations([]);
            }
        } else {
            // Clear locations if search query is not 'medicard'
            setLocations([]);
        }
    };

    return (
        <div>
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
                
                {/* Default location marker */}
                <Marker position={position} icon={defaultLocationIcon}>
                    <Popup>{`You are here`}</Popup>
                </Marker>

                {/* Render additional location markers */}
                {locations.map((loc, index) => (
                    <Marker 
                        key={index} 
                        position={[
                            parseFloat(loc.latitude), 
                            parseFloat(loc.longitude)
                        ]} 
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

                {/* Fly to locations component */}
                {locations.length > 0 && <FlyToLocations locations={locations} />}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
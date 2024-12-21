import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import Navbar from './NavbarDashboard';
import '../css/MapComponent.css';
import L from 'leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faHospital, faClinicMedical } from '@fortawesome/free-solid-svg-icons';
import ReactDOMServer from 'react-dom/server';
import axios from 'axios';
import LocationCards from './LocationCards';

// Haversine formula to calculate distance between two lat/lng points
const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
};

const RouteDisplay = ({ startPoint, endPoint }) => {
    const [routePath, setRoutePath] = useState([]);
    const [trafficSegments, setTrafficSegments] = useState([]);
    const map = useMap();

    useEffect(() => {
        const fetchRoute = async () => {
            if (!startPoint || !endPoint) return;

            try {
                // Fetch route from OSRM
                const response = await axios.get(
                    `http://router.project-osrm.org/route/v1/driving/${startPoint[1]},${startPoint[0]};${endPoint[1]},${endPoint[0]}?overview=full&geometries=geojson`
                );

                if (response.data.routes && response.data.routes[0]) {
                    const coordinates = response.data.routes[0].geometry.coordinates.map(
                        coord => [coord[1], coord[0]]
                    );

                    // Simulate traffic conditions for route segments
                    const segments = [];
                    for (let i = 0; i < coordinates.length - 1; i++) {
                        const trafficCondition = Math.random(); // Simulate traffic (0-1)
                        let color;
                        if (trafficCondition < 0.3) {
                            color = '#4CAF50'; // Green - light traffic
                        } else if (trafficCondition < 0.7) {
                            color = '#FFA500'; // Orange - moderate traffic
                        } else {
                            color = '#FF0000'; // Red - heavy traffic
                        }
                        
                        segments.push({
                            path: [coordinates[i], coordinates[i + 1]],
                            color: color
                        });
                    }

                    setRoutePath(coordinates);
                    setTrafficSegments(segments);

                    // Fit map bounds to show entire route
                    const bounds = L.latLngBounds(coordinates);
                    map.fitBounds(bounds, { padding: [50, 50] });
                }
            } catch (error) {
                console.error('Error fetching route:', error);
            }
        };

        fetchRoute();
    }, [startPoint, endPoint, map]);

    return (
        <>
            {trafficSegments.map((segment, index) => (
                <Polyline
                    key={index}
                    positions={segment.path}
                    pathOptions={{
                        color: segment.color,
                        weight: 5,
                        opacity: 0.7
                    }}
                />
            ))}
        </>
    );
};

const FlyToGeolocation = ({ position }) => {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.flyTo(position, 16, { duration: 1 });
        }
    }, [position, map]);

    return null;
};

const MapComponent = () => {
    const [position, setPosition] = useState(null);
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [pinnedLocation, setPinnedLocation] = useState(null);
    const batangasCoords = [13.942719267909442, 121.16651000059406]; 

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
    const pinnedIcon = createCustomIcon(faLocationDot, 'purple');

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (location) => {
                    const { latitude, longitude } = location.coords;
                    setPosition([latitude, longitude]);
                },
                (error) => {
                    console.error('Error retrieving geolocation:', error);
                    setPosition(batangasCoords);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
            setPosition(batangasCoords);
        }
    }, []);

    const handleSearch = async (searchQuery) => {
        try {
            // Fetch insurance data from the backend
            const response = await axios.get(`http://localhost:5000/api/search?query=${searchQuery}`);
            const fetchedLocations = response.data;
    
            if (fetchedLocations.length === 0) {
                // No matching insurance found
                alert("The term is not an insurance name");

                return;
            }
    
            // Filter locations within 5 km if a match is found
            if (position) {
                const filteredLocations = fetchedLocations.filter(loc => {
                    const distance = haversineDistance(
                        position[0], position[1], 
                        parseFloat(loc.hospital_latitude), parseFloat(loc.hospital_longitude)
                    );
                    return distance <= 5; // Only locations within 5 km
                });
                setLocations(filteredLocations);
            }
        } catch (error) {
            console.error('Error fetching locations:', error);
            setLocations([]); // Clear locations on error
        }
    };

    const handleMapClick = (e) => {
        const { lat, lng } = e.latlng;
        setPinnedLocation([lat, lng]);
    };

    return (
        <div className="app-container">
            <Navbar 
                setPosition={setPosition} 
                onSearch={handleSearch}
            />
            <MapContainer
                center={position || batangasCoords}
                zoom={16}
                className='map-container'
                onClick={handleMapClick} // Add click handler to the map
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />

                {position && (
                    <Marker position={position} icon={defaultLocationIcon}>
                        <Popup>You are here!</Popup>
                    </Marker>
                )}

                {pinnedLocation && (
                    <Marker position={pinnedLocation} icon={pinnedIcon}>
                        <Popup>
                            <div>
                                <strong>Pinned Location</strong>
                                <br />
                                Latitude: {pinnedLocation[0].toFixed(5)}
                                <br />
                                Longitude: {pinnedLocation[1].toFixed(5)}
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Display all hospital and clinic locations within 5km */}
                {locations.map((loc, index) => (
                    <Marker 
                        key={index} 
                        position={[parseFloat(loc.hospital_latitude), parseFloat(loc.hospital_longitude)]} 
                        icon={loc.type === 'hospital' ? hospitalIcon : clinicIcon}
                    >
                        <Popup>
                            <div>
                                <strong>{loc.hospital_name}</strong>
                                <br />
                                {loc.hospital_contact_num && (
                                    <>
                                        Contact: {loc.hospital_contact_num}
                                        <br />
                                    </>
                                )}
                                {loc.hospital_email_address && (
                                    <>
                                        Email: {loc.hospital_email_address}
                                        <br />
                                    </>
                                )}
                                {loc.hospital_links && (
                                    <>
                                        Link: <a href={loc.hospital_links} target="_blank" rel="noopener noreferrer">{loc.hospital_links}</a>
                                        <br />
                                    </>
                                )}
                                {loc.insurances && (
                                    <>
                                        Insurances Accepted: {loc.insurances}
                                        <br />
                                    </>
                                )}
                            </div>
                        </Popup>

                    </Marker>
                ))}

                {/* Display route when location is selected */}
                {position && selectedLocation && (
                    <RouteDisplay 
                        startPoint={position}
                        endPoint={[parseFloat(selectedLocation.hospital_latitude), parseFloat(selectedLocation.hospital_longitude)]}
                    />
                )}

                {position && <FlyToGeolocation position={position} />}
                {selectedLocation && <FlyToGeolocation position={[selectedLocation.hospital_latitude, selectedLocation.hospital_longitude]} />}
            </MapContainer>
            <LocationCards 
                locations={locations}
                onLocationSelect={setSelectedLocation}
            />
        </div>
    );
};

export default MapComponent;

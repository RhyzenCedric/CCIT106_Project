import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import axios from 'axios';

const MapComponent = () => {
    const [position, setPosition] = useState([51.505, -0.09]); // Default location
    const [search, setSearch] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    // Fetch suggestions dynamically as user types
    const handleInputChange = async (e) => {
        const query = e.target.value;
        setSearch(query);

        if (query.length > 2) {
            try {
                const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;
                const response = await axios.get(url);
                setSuggestions(response.data);
                setShowDropdown(true);
                console.log('Suggestions:', response.data); // Debugging log
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            }
        } else {
            setSuggestions([]);
            setShowDropdown(false);
        }
    };

    const FlyToLocation = ({ center }) => {
        const map = useMap();
        map.setView(center, 16); // Zoom in to the location
        return null;
    };

    // Handle selecting a suggestion
    const handleSuggestionClick = (suggestion) => {
        const { lat, lon, display_name } = suggestion;
        const newPosition = [parseFloat(lat), parseFloat(lon)];
        setPosition(newPosition);
        setSearch(display_name);
        setShowDropdown(false); // Close dropdown after selection
    };

    return (
        <div>
            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    placeholder="Search location..."
                    value={search}
                    onChange={handleInputChange}
                    style={{ width: '300px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
                {showDropdown && suggestions.length > 0 && (
                    <ul
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            width: '300px',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            background: 'white',
                            listStyle: 'none',
                            margin: 0,
                            padding: 0,
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            zIndex: 1000,
                        }}
                    >
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                style={{
                                    padding: '8px',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #ddd',
                                    color: '#333', // Ensure text is visible
                                }}
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                {suggestion.display_name || 'No display name available'}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <MapContainer
                center={position}
                zoom={13}
                style={{ height: '500px', width: '100%', marginTop: '20px' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />
                <FlyToLocation center={position} />
                <Marker position={position}>
                    <Popup>{search || 'You are here'}</Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default MapComponent;
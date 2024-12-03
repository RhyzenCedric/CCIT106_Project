import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';

const MapComponent = () => {
    const [position, setPosition] = useState([51.505, -0.09]); // Default location
    const [search, setSearch] = useState('');
    const [results, setResults] = useState([]);

    const handleSearch = async () => {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${search}`;
        const response = await axios.get(url);
        setResults(response.data);

        if (response.data.length > 0) {
            const { lat, lon } = response.data[0];
            setPosition([parseFloat(lat), parseFloat(lon)]);
        }
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Search location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>
            <MapContainer center={position} zoom={13} style={{ height: '500px', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="OpenStreetMap contributors"
                />
                <Marker position={position}>
                    <Popup>You are here</Popup>
                </Marker>
            </MapContainer>
            {results.length > 0 && (
                <ul>
                    {results.map((result, index) => (
                        <li key={index}>
                            {result.display_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MapComponent;

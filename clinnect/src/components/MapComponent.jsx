import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import Navbar from './Navbar';
import '../css/MapComponent.css'; // Include any additional styling if needed

const MapComponent = () => {
    const [position, setPosition] = useState([14.0776, 121.149]); // Default location

    const FlyToLocation = ({ center }) => {
        const map = useMap();
        map.setView(center, 16); // Zoom in to the location
        return null;
    };

    return (
        <div>
            <Navbar setPosition={setPosition} />
            <MapContainer
                center={position}
                zoom={20}
                className='map-container'
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />
                <FlyToLocation center={position} />
                <Marker position={position}>
                    <Popup>{`You are here`}</Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default MapComponent;

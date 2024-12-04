import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import Navbar from './Navbar';
import '../css/MapComponent.css'; // Include any additional styling if needed
import L from 'leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesomeIcon
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import ReactDOMServer from 'react-dom/server';

const MapComponent = () => {
    const [position, setPosition] = useState([14.077410594300181, 121.14928967621167]); // Default location

    const FlyToLocation = ({ center }) => {
        const map = useMap();
        map.setView(center, 30); // Zoom in to the location
        return null;
    };

    // Create a custom marker using FontAwesome
    const locationIcon = new L.DivIcon({
        className: 'custom-marker',
        html: ReactDOMServer.renderToString(
            <FontAwesomeIcon icon={faLocationDot} style={{ color: 'red', fontSize: '24px' }} />
        ),
    });

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
                <Marker position={position} icon={locationIcon}>
                    <Popup>{`You are here`}</Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default MapComponent;

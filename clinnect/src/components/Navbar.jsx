import React, { useState } from 'react';
import axios from 'axios';
import '../css/Navbar.css';

const Navbar = ({ setPosition }) => {
    const [search, setSearch] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleInputChange = async (e) => {
        const query = e.target.value;
        setSearch(query);

        if (query.length > 2) {
            try {
                const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;
                const response = await axios.get(url);
                setSuggestions(response.data);
                setShowDropdown(true);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            }
        } else {
            setSuggestions([]);
            setShowDropdown(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        const { lat, lon, display_name } = suggestion;
        const newPosition = [parseFloat(lat), parseFloat(lon)];
        setPosition(newPosition); // Update the position in the parent component
        setSearch(display_name);
        setShowDropdown(false); // Close dropdown after selection
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && suggestions.length > 0) {
            // Use the first suggestion if available
            handleSuggestionClick(suggestions[0]);
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-title">Clinnect</div>
            <div className="navbar-search">
                <input
                    type="text"
                    placeholder="Search location..."
                    value={search}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className="search-input"
                />
                {showDropdown && suggestions.length > 0 && (
                    <ul className="dropdown">
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                className="dropdown-item"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                {suggestion.display_name || 'No display name available'}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </nav>
    );
};

export default Navbar;

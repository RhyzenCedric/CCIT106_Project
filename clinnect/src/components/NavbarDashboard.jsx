import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import '../css/NavbarDashboard.css';

const NavbarDashboard = ({ setPosition }) => {
    const [search, setSearch] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

    // Check screen size and update view type
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobileView(window.innerWidth < 768); // Typical mobile breakpoint
        };

        // Check on mount and add resize listener
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        // Cleanup listener
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

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
        setPosition(newPosition);
        setSearch(display_name);
        setShowDropdown(false);
        
        // For mobile, close the search
        if (isMobileView) {
            setIsMobileSearchOpen(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && suggestions.length > 0) {
            handleSuggestionClick(suggestions[0]);
        }
    };

    const toggleMobileSearch = () => {
        setIsMobileSearchOpen(!isMobileSearchOpen);
        // Clear search and suggestions when closing
        if (isMobileSearchOpen) {
            setSearch('');
            setSuggestions([]);
            setShowDropdown(false);
        }
    };

    const clearSearch = () => {
        setSearch('');
        setSuggestions([]);
        setShowDropdown(false);
    };

    return (
        <nav className={`navbar ${isMobileView && isMobileSearchOpen ? 'navbar-mobile-search' : ''}`}>
            {/* Desktop Search */}
            {!isMobileView && (
                <>
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
                </>
            )}

            {/* Mobile Search */}
            {isMobileView && (
                <div className="mobile-search-container">
                    {!isMobileSearchOpen ? (
                        <>
                            <div className="navbar-title">Clinnect</div>
                            <div 
                                className="mobile-search-icon" 
                                onClick={toggleMobileSearch}
                            >
                                <FontAwesomeIcon icon={faSearch} />
                            </div>
                        </>
                    ) : (
                        <div className="mobile-search-active">
                            <button 
                                className="mobile-search-back"
                                onClick={toggleMobileSearch}
                            >
                                <FontAwesomeIcon icon={faArrowLeft} />
                            </button>
                            <div className="mobile-search-input-wrapper">
                                <input
                                    type="text"
                                    placeholder="Search location..."
                                    value={search}
                                    onChange={handleInputChange}
                                    onKeyPress={handleKeyPress}
                                    className="mobile-search-input"
                                    autoFocus
                                />
                                {search && (
                                    <button 
                                        className="mobile-search-clear"
                                        onClick={clearSearch}
                                    >
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {isMobileSearchOpen && showDropdown && suggestions.length > 0 && (
                        <ul className="mobile-dropdown">
                            {suggestions.map((suggestion, index) => (
                                <li
                                    key={index}
                                    className="mobile-dropdown-item"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    {suggestion.display_name || 'No display name available'}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </nav>
    );
};

export default NavbarDashboard;
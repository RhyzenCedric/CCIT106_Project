import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import '../css/NavbarDashboard.css';

const NavbarDashboard = ({ setPosition, onSearch }) => {
    const [search, setSearch] = useState('');
    const [isMobileView, setIsMobileView] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

    // Check screen size and update view type
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobileView(window.innerWidth < 768);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const handleSearch = async () => {
        // Pass the search query as a string
        onSearch(search);

        // Reset mobile search if in mobile view
        if (isMobileView) {
            setIsMobileSearchOpen(false);
        }
    };

    const handleInputChange = (e) => {
        setSearch(e.target.value);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const toggleMobileSearch = () => {
        setIsMobileSearchOpen(!isMobileSearchOpen);
        if (isMobileSearchOpen) {
            setSearch('');
        }
    };

    const clearSearch = () => {
        setSearch('');
        onSearch(''); // Clear locations on map
    };

    return (
        <nav className={`navbar ${isMobileView && isMobileSearchOpen ? 'navbar-mobile-search' : ''}`}>
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
                        {search && (
                            <button onClick={handleSearch} className="search-button">
                                <FontAwesomeIcon icon={faSearch} />
                            </button>
                        )}
                    </div>
                </>
            )}

            {isMobileView && (
                <div className="mobile-search-container">
                    {!isMobileSearchOpen ? (
                        <>
                            <div className="navbar-title">Clinnect</div>
                            <div className="mobile-search-icon" onClick={toggleMobileSearch}>
                                <FontAwesomeIcon icon={faSearch} />
                            </div>
                        </>
                    ) : (
                        <div className="mobile-search-active">
                            <button className="mobile-search-back" onClick={toggleMobileSearch}>
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
                                    <>
                                        <button className="mobile-search-clear" onClick={clearSearch}>
                                            <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                        <button onClick={handleSearch} className="mobile-search-submit">
                                            <FontAwesomeIcon icon={faSearch} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default NavbarDashboard;
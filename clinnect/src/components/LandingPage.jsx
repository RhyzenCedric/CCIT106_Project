import React from 'react';
import '../css/LandingPage.css';
import Login from './Login';
import NavbarLandingPage from './NavbarLandingPage';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <nav className="landing-page-navbar">
        <NavbarLandingPage/>
      </nav>
      <div className="landing-page-content">
        <Login/>
      </div>
    </div>
  );
}
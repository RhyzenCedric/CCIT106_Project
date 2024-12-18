import React from 'react';
import '../css/LandingPage.css';
import Login from './Login';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <div className="landing-page-content">
        <Login/>
      </div>
    </div>
  );
}
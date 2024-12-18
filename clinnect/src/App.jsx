import React from 'react';
import Register from './components/Register'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';


function App() {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/landingpage" element={<LandingPage/>} />
          <Route path="/register" element={<Register/>} />
        </Routes>
      </Router>
    );
  }
  

export default App;
 
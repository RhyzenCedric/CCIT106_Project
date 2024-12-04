import React from 'react';
import MapComponent from '../src/components/MapComponent';
import Login from './components/Login';
import Register from './components/Register'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


function App() {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/main" element={<MapComponent />} />
          <Route path="/register" element={<Register/>} />
        </Routes>
      </Router>
    );
  }
  

export default App;
 
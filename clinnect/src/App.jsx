import React from 'react';
import Register from './components/Register'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';


function App() {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/register" element={<Register/>} />
        </Routes>
      </Router>
    );
  }
  

export default App;
 
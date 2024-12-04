import React, { useState } from 'react';
import '../css/Login.css';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

    // Default credentials
    const defaultEmail = "test@example.com";
    const defaultPassword = "password123";
  

  const handleSignup = (e) => {
    e.preventDefault(); 
    navigate('/register'); 
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if email and password match the defaults
    if (email === defaultEmail && password === defaultPassword) {
      alert("Login successful!");
      navigate('/main'); // Navigate to dashboard
    } else {
      alert("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <h1>Welcome to Clinnect!</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>

        <button type="button" onClick={handleSignup}>
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Login;

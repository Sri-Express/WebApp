// src/app/fleet/login/page.tsx - MINIMAL Fleet Login (No Complex Dependencies)
"use client";

import { useState } from 'react';

export default function FleetLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Login successful! User: ${data.user.email} (${data.user.role})`);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = '/fleet/dashboard';
        }, 2000);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const fillTestData = () => {
    setEmail('admin@express.lk');
    setPassword('admin123');
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setSuccess('Auth data cleared');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#1a1a1a', 
      color: 'white',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '400px', margin: '0 auto', paddingTop: '50px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
          🚛 Fleet Manager Login
        </h1>

        <div style={{ 
          backgroundColor: '#333', 
          padding: '10px', 
          borderRadius: '5px', 
          marginBottom: '20px',
          fontSize: '12px'
        }}>
          <strong>Debug Info:</strong><br/>
          API: http://localhost:5000<br/>
          Status: Ready
        </div>

        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={fillTestData}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '5px',
              marginRight: '10px',
              cursor: 'pointer'
            }}
          >
            Fill Test Data
          </button>
          
          <button 
            onClick={clearAuth}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Clear Auth
          </button>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: '#dc3545', 
            padding: '10px', 
            borderRadius: '5px', 
            marginBottom: '20px' 
          }}>
            Error: {error}
          </div>
        )}

        {success && (
          <div style={{ 
            backgroundColor: '#28a745', 
            padding: '10px', 
            borderRadius: '5px', 
            marginBottom: '20px' 
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #555',
                backgroundColor: '#444',
                color: 'white',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your email"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #555',
                backgroundColor: '#444',
                color: 'white',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#666' : '#28a745',
              color: 'white',
              border: 'none',
              padding: '12px',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '14px' }}>
          <a href="/" style={{ color: '#007bff', textDecoration: 'none' }}>
            ← Back to main site
          </a>
        </div>
      </div>
    </div>
  );
}
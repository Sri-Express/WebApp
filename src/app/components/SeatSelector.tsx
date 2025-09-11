// src/app/components/SeatSelector.tsx
"use client";

import { useState, useEffect } from 'react';

export interface SeatAvailabilityData {
  routeId: string;
  travelDate: string;
  departureTime: string;
  capacity: number;
  availability: {
    total: number;
    booked: number;
    available: number;
  };
  bookedSeats: Array<{
    seatNumber: string;
    seatType: string;
  }>;
}

interface SeatSelectorProps {
  routeId: string;
  travelDate: string;
  departureTime: string;
  theme: 'light' | 'dark';
}

export default function SeatSelector({ 
  routeId, 
  travelDate, 
  departureTime, 
  theme 
}: SeatSelectorProps) {
  const [seatData, setSeatData] = useState<SeatAvailabilityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Theme styles
  const isDark = theme === 'dark';
  const styles = {
    container: {
      backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(249, 250, 251, 0.9)',
      color: isDark ? '#f9fafb' : '#1f2937',
      border: `1px solid ${isDark ? 'rgba(75, 85, 99, 0.5)' : 'rgba(209, 213, 219, 0.5)'}`,
    }
  };

  useEffect(() => {
    if (routeId && travelDate && departureTime) {
      fetchSeatAvailability();
    }
  }, [routeId, travelDate, departureTime]);

  const fetchSeatAvailability = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(
        `${baseURL}/api/bookings/seat-availability?routeId=${routeId}&travelDate=${travelDate}&departureTime=${departureTime}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch seat availability: ${response.status}`);
      }

      const data: SeatAvailabilityData = await response.json();
      setSeatData(data);
    } catch (err) {
      console.error('Error fetching seat availability:', err);
      setError(err instanceof Error ? err.message : 'Failed to load seat availability');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ ...styles.container, padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #fef3c7', 
          borderTop: '4px solid #F59E0B', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }}></div>
        <div>Loading seat availability...</div>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...styles.container, padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
        <div style={{ color: '#EF4444', fontWeight: '600', marginBottom: '1rem' }}>Error Loading Seats</div>
        <div style={{ marginBottom: '1rem' }}>{error}</div>
        <button 
          onClick={fetchSeatAvailability}
          style={{
            backgroundColor: '#F59E0B',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!seatData) {
    return (
      <div style={{ ...styles.container, padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
        Select a schedule to view seat availability
      </div>
    );
  }

  return (
    <div style={{ ...styles.container, padding: '1.5rem', borderRadius: '12px' }}>
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 2rem 0', fontWeight: '600', fontSize: '1.2rem' }}>
          Seat Availability
        </h3>
        
        {/* Seat Counts */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '3rem', 
          fontSize: '1rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: '600', color: '#10B981', fontSize: '2rem' }}>
              {seatData.availability.available}
            </div>
            <div>Available</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: '600', color: '#EF4444', fontSize: '2rem' }}>
              {seatData.availability.booked}
            </div>
            <div>Booked</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: '600', color: isDark ? '#9CA3AF' : '#6B7280', fontSize: '2rem' }}>
              {seatData.capacity}
            </div>
            <div>Total</div>
          </div>
        </div>
      </div>
    </div>
  );
}
// src/app/book/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface Route {
  _id: string;
  name: string;
  startLocation: {
    name: string;
    address: string;
  };
  endLocation: {
    name: string;
    address: string;
  };
  schedules: Array<{
    departureTime: string;
    arrivalTime: string;
    daysOfWeek: string[];
    isActive: boolean;
  }>;
  operatorInfo: {
    companyName: string;
    contactNumber: string;
  };
  vehicleInfo: {
    type: 'bus' | 'train';
    capacity: number;
    amenities: string[];
  };
  pricing: {
    basePrice: number;
    discounts: Array<{
      type: 'student' | 'senior' | 'military';
      percentage: number;
    }>;
  };
}

interface BookingData {
  routeId: string;
  scheduleId: string;
  travelDate: string;
  departureTime: string;
  passengerInfo: {
    name: string;
    phone: string;
    email: string;
    idType: 'nic' | 'passport';
    idNumber: string;
    passengerType: 'regular' | 'student' | 'senior' | 'military';
  };
  seatInfo: {
    seatNumber: string;
    seatType: 'window' | 'aisle' | 'middle';
    preferences: string[];
  };
  paymentMethod: 'card' | 'bank' | 'digital_wallet' | 'cash';
}

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeId = searchParams.get('routeId');
  
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    routeId: routeId || '',
    scheduleId: '',
    travelDate: new Date().toISOString().split('T')[0],
    departureTime: '',
    passengerInfo: {
      name: '',
      phone: '',
      email: '',
      idType: 'nic',
      idNumber: '',
      passengerType: 'regular'
    },
    seatInfo: {
      seatNumber: '',
      seatType: 'window',
      preferences: []
    },
    paymentMethod: 'card'
  });

  // Get auth token
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Get user info
  const getUserInfo = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };

  // API call helper
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return null;
    }

    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const fullURL = `${baseURL}/api${endpoint}`;

    try {
      const response = await fetch(fullURL, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          return null;
        }
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call error:', error);
      return null;
    }
  }, [router]);

  // Load route details
  useEffect(() => {
    const loadRouteDetails = async () => {
      if (!routeId) {
        setError('No route selected');
        setLoading(false);
        return;
      }

      setLoading(true);
      const response = await apiCall(`/routes/${routeId}`);
      
      if (response) {
        setRoute(response.route);
        setBookingData(prev => ({ ...prev, routeId }));
        
        // Pre-fill user info if available
        const user = getUserInfo();
        if (user) {
          setBookingData(prev => ({
            ...prev,
            passengerInfo: {
              ...prev.passengerInfo,
              name: user.name || '',
              email: user.email || '',
              phone: user.phone || ''
            }
          }));
        }
      } else {
        setError('Failed to load route details');
      }
      
      setLoading(false);
    };

    loadRouteDetails();
  }, [routeId, apiCall]);

  // Handle form submission
  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      const response = await apiCall('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData)
      });

      if (response) {
        router.push(`/bookings/${response.booking._id}`);
      } else {
        setError('Failed to create booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      setError('Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const calculatePrice = () => {
    if (!route) return 0;
    
    let price = route.pricing.basePrice;
    
    // Apply discounts
    const discount = route.pricing.discounts.find(d => d.type === bookingData.passengerInfo.passengerType);
    if (discount) {
      price -= (price * discount.percentage / 100);
    }
    
    return price;
  };

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  const renderStep1 = () => (
    <div>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>
        Select Schedule
      </h3>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Travel Date
        </label>
        <input
          type="date"
          value={bookingData.travelDate}
          onChange={(e) => setBookingData(prev => ({ ...prev, travelDate: e.target.value }))}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Available Schedules
        </label>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {route?.schedules.filter(s => s.isActive).map((schedule, index) => (
            <div
              key={index}
              onClick={() => setBookingData(prev => ({ 
                ...prev, 
                scheduleId: index.toString(),
                departureTime: schedule.departureTime
              }))}
              style={{
                padding: '1rem',
                border: '2px solid',
                borderColor: bookingData.scheduleId === index.toString() ? '#F59E0B' : '#e5e7eb',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                backgroundColor: bookingData.scheduleId === index.toString() ? '#FEF3C7' : 'white'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: '600' }}>
                    {schedule.departureTime} - {schedule.arrivalTime}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>
                    Days: {schedule.daysOfWeek.join(', ')}
                  </div>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>
                  Available
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>
        Passenger Information
      </h3>
      
      <div style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
            Full Name
          </label>
          <input
            type="text"
            value={bookingData.passengerInfo.name}
            onChange={(e) => setBookingData(prev => ({ 
              ...prev, 
              passengerInfo: { ...prev.passengerInfo, name: e.target.value }
            }))}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Phone Number
            </label>
            <input
              type="tel"
              value={bookingData.passengerInfo.phone}
              onChange={(e) => setBookingData(prev => ({ 
                ...prev, 
                passengerInfo: { ...prev.passengerInfo, phone: e.target.value }
              }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Email Address
            </label>
            <input
              type="email"
              value={bookingData.passengerInfo.email}
              onChange={(e) => setBookingData(prev => ({ 
                ...prev, 
                passengerInfo: { ...prev.passengerInfo, email: e.target.value }
              }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              ID Type
            </label>
            <select
              value={bookingData.passengerInfo.idType}
              onChange={(e) => setBookingData(prev => ({ 
                ...prev, 
                passengerInfo: { ...prev.passengerInfo, idType: e.target.value as 'nic' | 'passport' }
              }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            >
              <option value="nic">National ID Card</option>
              <option value="passport">Passport</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              ID Number
            </label>
            <input
              type="text"
              value={bookingData.passengerInfo.idNumber}
              onChange={(e) => setBookingData(prev => ({ 
                ...prev, 
                passengerInfo: { ...prev.passengerInfo, idNumber: e.target.value }
              }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
            Passenger Type
          </label>
          <select
            value={bookingData.passengerInfo.passengerType}
            onChange={(e) => setBookingData(prev => ({ 
              ...prev, 
              passengerInfo: { ...prev.passengerInfo, passengerType: e.target.value as any }
            }))}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          >
            <option value="regular">Regular</option>
            <option value="student">Student</option>
            <option value="senior">Senior Citizen</option>
            <option value="military">Military</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>
        Seat Preferences & Payment
      </h3>
      
      <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
            Seat Preference
          </label>
          <select
            value={bookingData.seatInfo.seatType}
            onChange={(e) => setBookingData(prev => ({ 
              ...prev, 
              seatInfo: { ...prev.seatInfo, seatType: e.target.value as any }
            }))}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          >
            <option value="window">Window Seat</option>
            <option value="aisle">Aisle Seat</option>
            <option value="middle">Middle Seat</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
            Payment Method
          </label>
          <select
            value={bookingData.paymentMethod}
            onChange={(e) => setBookingData(prev => ({ 
              ...prev, 
              paymentMethod: e.target.value as any
            }))}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          >
            <option value="card">Credit/Debit Card</option>
            <option value="bank">Bank Transfer</option>
            <option value="digital_wallet">Digital Wallet</option>
            <option value="cash">Cash on Booking</option>
          </select>
        </div>
      </div>

      {/* Price Summary */}
      <div style={{
        backgroundColor: '#F9FAFB',
        padding: '1rem',
        borderRadius: '0.5rem',
        border: '1px solid #e5e7eb'
      }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Price Summary
        </h4>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '0.5rem'
        }}>
          <span>Base Price:</span>
          <span>{formatPrice(route?.pricing.basePrice || 0)}</span>
        </div>
        {bookingData.passengerInfo.passengerType !== 'regular' && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.5rem',
            color: '#10B981'
          }}>
            <span>Discount ({bookingData.passengerInfo.passengerType}):</span>
            <span>-{formatPrice((route?.pricing.basePrice || 0) - calculatePrice())}</span>
          </div>
        )}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontWeight: '600',
          fontSize: '1.1rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <span>Total:</span>
          <span style={{ color: '#F59E0B' }}>{formatPrice(calculatePrice())}</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #F59E0B',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <div style={{ color: '#6B7280', fontSize: '16px' }}>Loading route details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem' }}>
        <div style={{ textAlign: 'center', color: '#DC2626' }}>
          <h2>Error</h2>
          <p>{error}</p>
          <Link href="/search" style={{ color: '#F59E0B', textDecoration: 'underline' }}>
            Go back to search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Navigation */}
      <nav style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 0',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}>
            <span style={{ color: '#F59E0B' }}>ශ්‍රී</span>
            <span style={{ color: '#1F2937' }}>Express</span>
          </Link>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link href="/search" style={{
              color: '#6B7280',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              ← Back to Search
            </Link>
          </div>
        </div>
      </nav>

      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1F2937',
            margin: 0
          }}>
            Book Your Ticket
          </h1>
          <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>
            {route?.name} - {route?.startLocation.name} to {route?.endLocation.name}
          </p>
        </div>

        {/* Progress Steps */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2rem'
        }}>
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: step >= stepNumber ? '#F59E0B' : '#E5E7EB',
                color: step >= stepNumber ? 'white' : '#6B7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600'
              }}>
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div style={{
                  width: '60px',
                  height: '2px',
                  backgroundColor: step > stepNumber ? '#F59E0B' : '#E5E7EB',
                  margin: '0 0.5rem'
                }}></div>
              )}
            </div>
          ))}
        </div>

        {/* Booking Form */}
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.75rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          {/* Navigation Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              style={{
                backgroundColor: step === 1 ? '#E5E7EB' : '#6B7280',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: step === 1 ? 'not-allowed' : 'pointer',
                fontWeight: '500'
              }}
            >
              Previous
            </button>
            
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                style={{
                  backgroundColor: '#F59E0B',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  backgroundColor: submitting ? '#9CA3AF' : '#10B981',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontWeight: '500'
                }}
              >
                {submitting ? 'Processing...' : 'Confirm Booking'}
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
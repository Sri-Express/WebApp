// src/app/book/page.tsx - FIXED VERSION WITH PROPER VALIDATION
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface Route {
  _id: string;
  name: string;
  startLocation: { name: string; address: string; };
  endLocation: { name: string; address: string; };
  schedules: Array<{
    departureTime: string;
    arrivalTime: string;
    daysOfWeek: string[];
    isActive: boolean;
  }>;
  operatorInfo: { companyName: string; contactNumber: string; };
  vehicleInfo: { type: 'bus' | 'train'; capacity: number; amenities: string[]; };
  pricing: { basePrice: number; discounts: Array<{ type: 'student' | 'senior' | 'military'; percentage: number; }>; };
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
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
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

  const getToken = () => localStorage.getItem('token');
  const getUserInfo = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };

  // ✅ FIXED: API call with proper error handling
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return null;
    }

    // ✅ FIXED: Consistent URL construction
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const fullURL = `${baseURL}/api${endpoint}`;
    
    console.log('🚀 Booking API Call:', fullURL);
    console.log('📦 Request Data:', options.body);

    try {
      const response = await fetch(fullURL, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      console.log('📡 Response Status:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          return null;
        }
        
        // ✅ FIXED: Better error handling
        const errorData = await response.text();
        console.error('❌ API Error Response:', errorData);
        throw new Error(`API Error ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('✅ API Response:', data);
      return data;
    } catch (error) {
      console.error('💥 API call error:', error);
      throw error;
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
      try {
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
      } catch (error) {
        console.error('Error loading route:', error);
        setError('Failed to load route details');
      } finally {
        setLoading(false);
      }
    };

    loadRouteDetails();
  }, [routeId, apiCall]);

  // ✅ FIXED: Proper validation function
  const validateBookingData = (): string[] => {
    const errors: string[] = [];
    
    // Step 1 validation
    if (!bookingData.routeId) errors.push('Route ID is required');
    if (!bookingData.scheduleId) errors.push('Please select a schedule');
    if (!bookingData.travelDate) errors.push('Travel date is required');
    if (!bookingData.departureTime) errors.push('Departure time is required');
    
    // Step 2 validation
    if (!bookingData.passengerInfo.name.trim()) errors.push('Passenger name is required');
    if (!bookingData.passengerInfo.phone.trim()) errors.push('Phone number is required');
    if (!bookingData.passengerInfo.email.trim()) errors.push('Email is required');
    if (!bookingData.passengerInfo.idNumber.trim()) errors.push('ID number is required');
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (bookingData.passengerInfo.email && !emailRegex.test(bookingData.passengerInfo.email)) {
      errors.push('Please enter a valid email address');
    }
    
    // Phone validation (basic)
    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (bookingData.passengerInfo.phone && !phoneRegex.test(bookingData.passengerInfo.phone)) {
      errors.push('Please enter a valid phone number');
    }
    
    // Step 3 validation
    if (!bookingData.seatInfo.seatNumber) {
      // Generate a seat number if not provided
      bookingData.seatInfo.seatNumber = `${Math.floor(Math.random() * 50) + 1}${bookingData.seatInfo.seatType[0].toUpperCase()}`;
    }
    
    if (!bookingData.paymentMethod) errors.push('Payment method is required');
    
    return errors;
  };

  // ✅ FIXED: Enhanced form submission with validation
  const handleSubmit = async () => {
    console.log('🎫 Starting booking submission...');
    
    // Validate data
    const errors = validateBookingData();
    if (errors.length > 0) {
      setValidationErrors(errors);
      setError(`Validation failed: ${errors.join(', ')}`);
      return;
    }
    
    setSubmitting(true);
    setError('');
    setValidationErrors([]);

    try {
      // ✅ FIXED: Ensure all required fields are present
      const submitData = {
        routeId: bookingData.routeId,
        scheduleId: bookingData.scheduleId,
        travelDate: bookingData.travelDate,
        departureTime: bookingData.departureTime,
        passengerInfo: {
          name: bookingData.passengerInfo.name.trim(),
          phone: bookingData.passengerInfo.phone.trim(),
          email: bookingData.passengerInfo.email.trim(),
          idType: bookingData.passengerInfo.idType,
          idNumber: bookingData.passengerInfo.idNumber.trim(),
          passengerType: bookingData.passengerInfo.passengerType
        },
        seatInfo: {
          seatNumber: bookingData.seatInfo.seatNumber || `${Math.floor(Math.random() * 50) + 1}W`,
          seatType: bookingData.seatInfo.seatType,
          preferences: bookingData.seatInfo.preferences || []
        },
        paymentMethod: bookingData.paymentMethod
      };
      
      console.log('📋 Final booking data:', submitData);

      const response = await apiCall('/bookings', {
        method: 'POST',
        body: JSON.stringify(submitData)
      });

      if (response && response.booking) {
        console.log('✅ Booking created successfully:', response.booking);
        
        // ✅ FIXED: Proper redirect without rendering objects
        const bookingId = response.booking._id || response.booking.bookingId;
        
        // Show success message before redirect
        alert(`✅ Booking confirmed! Booking ID: ${response.booking.bookingId || 'N/A'}`);
        
        // Navigate to booking details page
        router.push(`/bookings/${bookingId}`);
        
      } else {
        throw new Error('Invalid response from booking API');
      }
    } catch (error: unknown) {
      console.error('💥 Booking error:', error);
      
      // ✅ FIXED: Proper error message handling
      let errorMessage = 'Failed to create booking. Please try again.';
      
      if (error instanceof Error && error.message) {
        // Extract readable error message
        if (error.message.includes('validation')) {
          errorMessage = 'Please check all required fields and try again.';
        } else if (error.message.includes('seat')) {
          errorMessage = 'Selected seat is no longer available. Please choose another seat.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
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
    
    return Math.round(price);
  };

  const formatPrice = (price: number) => `Rs. ${price.toLocaleString()}`;

  const renderStep1 = () => (
    <div>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>
        Select Schedule
      </h3>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Travel Date *
        </label>
        <input
          type="date"
          value={bookingData.travelDate}
          onChange={(e) => setBookingData(prev => ({ ...prev, travelDate: e.target.value }))}
          min={new Date().toISOString().split('T')[0]} // Can't book past dates
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
          Available Schedules *
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
                backgroundColor: bookingData.scheduleId === index.toString() ? '#FEF3C7' : 'white',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>
                    {schedule.departureTime} - {schedule.arrivalTime}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>
                    Days: {schedule.daysOfWeek.join(', ')}
                  </div>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#10B981', fontWeight: '500' }}>
                  Available
                </div>
              </div>
            </div>
          ))}
        </div>
        {(!route?.schedules || route.schedules.filter(s => s.isActive).length === 0) && (
          <p style={{ color: '#DC2626', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            No schedules available for this route
          </p>
        )}
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
            Full Name *
          </label>
          <input
            type="text"
            value={bookingData.passengerInfo.name}
            onChange={(e) => setBookingData(prev => ({ 
              ...prev, 
              passengerInfo: { ...prev.passengerInfo, name: e.target.value }
            }))}
            placeholder="Enter your full name"
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
              Phone Number *
            </label>
            <input
              type="tel"
              value={bookingData.passengerInfo.phone}
              onChange={(e) => setBookingData(prev => ({ 
                ...prev, 
                passengerInfo: { ...prev.passengerInfo, phone: e.target.value }
              }))}
              placeholder="+94 XX XXX XXXX"
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
              Email Address *
            </label>
            <input
              type="email"
              value={bookingData.passengerInfo.email}
              onChange={(e) => setBookingData(prev => ({ 
                ...prev, 
                passengerInfo: { ...prev.passengerInfo, email: e.target.value }
              }))}
              placeholder="your.email@example.com"
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
              ID Type *
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
              ID Number *
            </label>
            <input
              type="text"
              value={bookingData.passengerInfo.idNumber}
              onChange={(e) => setBookingData(prev => ({ 
                ...prev, 
                passengerInfo: { ...prev.passengerInfo, idNumber: e.target.value }
              }))}
              placeholder={bookingData.passengerInfo.idType === 'nic' ? 'XXXXXXXXXX' : 'Passport Number'}
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
              passengerInfo: { ...prev.passengerInfo, passengerType: e.target.value as BookingData['passengerInfo']['passengerType'] }
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
            <option value="student">Student (Discount Available)</option>
            <option value="senior">Senior Citizen (Discount Available)</option>
            <option value="military">Military (Discount Available)</option>
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
              seatInfo: { ...prev.seatInfo, seatType: e.target.value as BookingData['seatInfo']['seatType'] }
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
            Payment Method *
          </label>
          <select
            value={bookingData.paymentMethod}
            onChange={(e) => setBookingData(prev => ({ 
              ...prev, 
              paymentMethod: e.target.value as BookingData['paymentMethod']
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
            <option value="card">💳 Credit/Debit Card</option>
            <option value="bank">🏦 Bank Transfer</option>
            <option value="digital_wallet">📱 Digital Wallet</option>
            <option value="cash">💵 Cash on Booking</option>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span>Base Price:</span>
          <span>{formatPrice(route?.pricing.basePrice || 0)}</span>
        </div>
        {bookingData.passengerInfo.passengerType !== 'regular' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#10B981' }}>
            <span>Discount ({bookingData.passengerInfo.passengerType}):</span>
            <span>-{formatPrice((route?.pricing.basePrice || 0) - calculatePrice())}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span>Taxes & Fees:</span>
          <span>{formatPrice(Math.round(calculatePrice() * 0.02))}</span>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontWeight: '600',
          fontSize: '1.1rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <span>Total:</span>
          <span style={{ color: '#F59E0B' }}>{formatPrice(calculatePrice() + Math.round(calculatePrice() * 0.02))}</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #F59E0B', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <div style={{ color: '#6B7280', fontSize: '16px' }}>Loading route details...</div>
        </div>
      </div>
    );
  }

  if (error && !route) {
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
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem 0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>
            <span style={{ color: '#F59E0B' }}>ශ්‍රී</span><span style={{ color: '#1F2937' }}>Express</span>
          </Link>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link href="/search" style={{ color: '#6B7280', textDecoration: 'none', fontWeight: '500' }}>← Back to Search</Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1F2937', margin: 0 }}>Book Your Ticket</h1>
          <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>
            {route?.name} - {route?.startLocation.name} to {route?.endLocation.name}
          </p>
        </div>

        {/* Progress Steps */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: step >= stepNumber ? '#F59E0B' : '#E5E7EB', color: step >= stepNumber ? 'white' : '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600' }}>
                {stepNumber}
              </div>
              {stepNumber < 3 && ( <div style={{ width: '60px', height: '2px', backgroundColor: step > stepNumber ? '#F59E0B' : '#E5E7EB', margin: '0 0.5rem' }}></div> )}
            </div>
          ))}
        </div>

        {/* Booking Form */}
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          {/* Error Messages */}
          {error && (
            <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #FCA5A5', marginTop: '1rem' }}>
              <strong>Error:</strong> {error}
            </div>
          )}
          
          {validationErrors.length > 0 && (
            <div style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #FCD34D', marginTop: '1rem' }}>
              <strong>Please fix the following issues:</strong>
              <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
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
                {submitting ? 'Processing...' : '🎫 Confirm Booking'}
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
// src/app/book/page.tsx - FULLY STYLED & INTEGRATED VERSION (WITH ALL VEHICLES)
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import AnimatedBackground from '@/app/components/AnimatedBackground';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

// --- Data Interfaces (unchanged) ---
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
  const { theme } = useTheme();

  // --- State Management (unchanged logic, just adding theme) ---
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
    passengerInfo: { name: '', phone: '', email: '', idType: 'nic', idNumber: '', passengerType: 'regular' },
    seatInfo: { seatNumber: '', seatType: 'window', preferences: [] },
    paymentMethod: 'card'
  });
  
  // --- Style Definitions from Dashboard ---
  const lightTheme = { mainBg: '#fffbeb', bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)', glassPanelBg: 'rgba(255, 255, 255, 0.92)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)', textPrimary: '#1f2937', textSecondary: '#4B5563', textMuted: '#6B7280', quickActionBg: 'rgba(249, 250, 251, 0.8)', quickActionBorder: '1px solid rgba(209, 213, 219, 0.5)', alertBg: 'rgba(249, 250, 251, 0.6)' };
  const darkTheme = { mainBg: '#0f172a', bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)', glassPanelBg: 'rgba(30, 41, 59, 0.8)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)', textPrimary: '#f9fafb', textSecondary: '#9ca3af', textMuted: '#9ca3af', quickActionBg: 'rgba(51, 65, 85, 0.8)', quickActionBorder: '1px solid rgba(75, 85, 99, 0.5)', alertBg: 'rgba(51, 65, 85, 0.6)' };
  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;
  const animationStyles = `
    @keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }
    @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
  `;
  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    boxSizing: 'border-box' as const,
    border: currentThemeStyles.quickActionBorder,
    backgroundColor: currentThemeStyles.alertBg,
    color: currentThemeStyles.textPrimary
  };
  
  // --- Data Logic (unchanged) ---
  const getToken = () => localStorage.getItem('token');
  const getUserInfo = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };
  
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken();
    if (!token) { router.push('/login'); return null; }
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
        if (response.status === 401) { router.push('/login'); return null; }
        const errorData = await response.text();
        throw new Error(`API Error ${response.status}: ${errorData}`);
      }
      return await response.json();
    } catch (err) {
      console.error('💥 API call error:', err);
      throw err;
    }
  }, [router]);
  
  useEffect(() => {
    const loadRouteDetails = async () => {
      if (!routeId) { setError('No route selected'); setLoading(false); return; }
      setLoading(true);
      try {
        const response = await apiCall(`/routes/${routeId}`);
        if (response && response.route) {
          setRoute(response.route);
          setBookingData(prev => ({ ...prev, routeId }));
          const user = getUserInfo();
          if (user) setBookingData(prev => ({ ...prev, passengerInfo: { ...prev.passengerInfo, name: user.name || '', email: user.email || '', phone: user.phone || '' }}));
        } else {
          setError('Failed to load route details');
        }
      } catch { 
        setError('Failed to load route details');
      } finally { 
        setLoading(false); 
      }
    };
    loadRouteDetails();
  }, [routeId, apiCall]);

  const validateBookingData = (): string[] => { /* ... Unchanged validation logic ... */ 
    const errors: string[] = [];
    if (!bookingData.routeId) errors.push('Route ID is required');
    if (!bookingData.scheduleId) errors.push('Please select a schedule');
    if (!bookingData.travelDate) errors.push('Travel date is required');
    if (!bookingData.departureTime) errors.push('Departure time is required');
    if (!bookingData.passengerInfo.name.trim()) errors.push('Passenger name is required');
    if (!bookingData.passengerInfo.phone.trim()) errors.push('Phone number is required');
    if (!bookingData.passengerInfo.email.trim()) errors.push('Email is required');
    if (!bookingData.passengerInfo.idNumber.trim()) errors.push('ID number is required');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (bookingData.passengerInfo.email && !emailRegex.test(bookingData.passengerInfo.email)) errors.push('Please enter a valid email address');
    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (bookingData.passengerInfo.phone && !phoneRegex.test(bookingData.passengerInfo.phone)) errors.push('Please enter a valid phone number');
    if (!bookingData.seatInfo.seatNumber) bookingData.seatInfo.seatNumber = `${Math.floor(Math.random() * 50) + 1}${bookingData.seatInfo.seatType[0].toUpperCase()}`;
    if (!bookingData.paymentMethod) errors.push('Payment method is required');
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateBookingData();
    if (errors.length > 0) { setValidationErrors(errors); setError(`Validation failed: ${errors.join(', ')}`); return; }
    
    // Redirect to payment gateway with booking data
    const submitData = {
      routeId: bookingData.routeId,
      scheduleId: bookingData.scheduleId,
      travelDate: bookingData.travelDate,
      departureTime: bookingData.departureTime,
      passengerInfo: { ...bookingData.passengerInfo },
      seatInfo: { seatNumber: bookingData.seatInfo.seatNumber || `${Math.floor(Math.random() * 50) + 1}W`, seatType: bookingData.seatInfo.seatType, preferences: bookingData.seatInfo.preferences || [] },
      paymentMethod: bookingData.paymentMethod,
      pricing: {
        basePrice: route?.pricing.basePrice || 0,
        totalAmount: calculatePrice(),
        taxes: 0,
        discounts: (route?.pricing.basePrice || 0) - calculatePrice()
      }
    };
    
    // Store booking data in localStorage for payment gateway
    localStorage.setItem('pendingBooking', JSON.stringify(submitData));
    
    // Redirect to payment gateway
    router.push('/payment-gateway');
  };
  
  // --- Helper and Render Functions ---
  const calculatePrice = () => { /* ... Unchanged ... */ 
    if (!route) return 0;
    let price = route.pricing.basePrice;
    const discount = route.pricing.discounts.find(d => d.type === bookingData.passengerInfo.passengerType);
    if (discount) { price -= (price * discount.percentage / 100); }
    return Math.round(price);
  };
  const formatPrice = (price: number) => `Rs. ${price.toLocaleString()}`;

  const renderStep1 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: currentThemeStyles.textPrimary }}>Select Schedule</h3>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: currentThemeStyles.textSecondary }}>Travel Date *</label>
        <input type="date" value={bookingData.travelDate} onChange={(e) => setBookingData(prev => ({ ...prev, travelDate: e.target.value }))} min={new Date().toISOString().split('T')[0]} style={inputStyle} />
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: currentThemeStyles.textSecondary }}>Available Schedules *</label>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {route?.schedules.filter(s => s.isActive).map((schedule, index) => (
            <div key={index} onClick={() => setBookingData(prev => ({ ...prev, scheduleId: index.toString(), departureTime: schedule.departureTime }))} style={{ padding: '1rem', border: '2px solid', borderColor: bookingData.scheduleId === index.toString() ? '#F59E0B' : currentThemeStyles.quickActionBorder, borderRadius: '0.5rem', cursor: 'pointer', backgroundColor: bookingData.scheduleId === index.toString() ? 'rgba(254, 243, 199, 0.8)' : currentThemeStyles.alertBg, transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '600', color: currentThemeStyles.textPrimary }}>{schedule.departureTime} - {schedule.arrivalTime}</div>
                  <div style={{ fontSize: '0.9rem', color: currentThemeStyles.textSecondary }}>Days: {schedule.daysOfWeek.join(', ')}</div>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#10B981', fontWeight: '500' }}>Available</div>
              </div>
            </div>
          ))}
        </div>
        {(!route?.schedules || route.schedules.filter(s => s.isActive).length === 0) && <p style={{ color: '#DC2626', fontSize: '0.9rem', marginTop: '0.5rem' }}>No schedules available for this route</p>}
      </div>
    </div>
  );
  
  const renderStep2 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: currentThemeStyles.textPrimary }}>Passenger Information</h3>
      <div style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: currentThemeStyles.textSecondary }}>Full Name *</label>
          <input type="text" value={bookingData.passengerInfo.name} onChange={(e) => setBookingData(prev => ({ ...prev, passengerInfo: { ...prev.passengerInfo, name: e.target.value } }))} placeholder="Enter your full name" style={inputStyle} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: currentThemeStyles.textSecondary }}>Phone Number *</label>
            <input type="tel" value={bookingData.passengerInfo.phone} onChange={(e) => setBookingData(prev => ({ ...prev, passengerInfo: { ...prev.passengerInfo, phone: e.target.value } }))} placeholder="+94 XX XXX XXXX" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: currentThemeStyles.textSecondary }}>Email Address *</label>
            <input type="email" value={bookingData.passengerInfo.email} onChange={(e) => setBookingData(prev => ({ ...prev, passengerInfo: { ...prev.passengerInfo, email: e.target.value } }))} placeholder="your.email@example.com" style={inputStyle} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: currentThemeStyles.textSecondary }}>ID Type *</label>
            <select value={bookingData.passengerInfo.idType} onChange={(e) => setBookingData(prev => ({ ...prev, passengerInfo: { ...prev.passengerInfo, idType: e.target.value as 'nic' | 'passport' } }))} style={inputStyle}><option value="nic">National ID Card</option><option value="passport">Passport</option></select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: currentThemeStyles.textSecondary }}>ID Number *</label>
            <input type="text" value={bookingData.passengerInfo.idNumber} onChange={(e) => setBookingData(prev => ({ ...prev, passengerInfo: { ...prev.passengerInfo, idNumber: e.target.value } }))} placeholder={bookingData.passengerInfo.idType === 'nic' ? 'XXXXXXXXXX' : 'Passport Number'} style={inputStyle} />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: currentThemeStyles.textSecondary }}>Passenger Type</label>
          <select value={bookingData.passengerInfo.passengerType} onChange={(e) => setBookingData(prev => ({ ...prev, passengerInfo: { ...prev.passengerInfo, passengerType: e.target.value as 'regular' | 'student' | 'senior' | 'military' } }))} style={inputStyle}>
            <option value="regular">Regular</option><option value="student">Student (Discount Available)</option><option value="senior">Senior Citizen (Discount Available)</option><option value="military">Military (Discount Available)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: currentThemeStyles.textPrimary }}>Seat Preferences & Payment</h3>
      <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: currentThemeStyles.textSecondary }}>Seat Preference</label>
          <select value={bookingData.seatInfo.seatType} onChange={(e) => setBookingData(prev => ({ ...prev, seatInfo: { ...prev.seatInfo, seatType: e.target.value as 'window' | 'aisle' | 'middle' } }))} style={inputStyle}><option value="window">Window Seat</option><option value="aisle">Aisle Seat</option><option value="middle">Middle Seat</option></select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: currentThemeStyles.textSecondary }}>Payment Method *</label>
          <select value={bookingData.paymentMethod} onChange={(e) => setBookingData(prev => ({ ...prev, paymentMethod: e.target.value as 'card' | 'bank' | 'digital_wallet' | 'cash' }))} style={inputStyle}><option value="card">💳 Credit/Debit Card</option><option value="bank">🏦 Bank Transfer</option><option value="digital_wallet">📱 Digital Wallet</option><option value="cash">💵 Cash on Booking</option></select>
        </div>
      </div>
      <div style={{ backgroundColor: currentThemeStyles.quickActionBg, padding: '1rem', borderRadius: '0.5rem', border: currentThemeStyles.quickActionBorder }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: currentThemeStyles.textPrimary }}>Price Summary</h4>
        {bookingData.passengerInfo.passengerType !== 'regular' && (<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#10B981' }}><span>Discount ({bookingData.passengerInfo.passengerType}):</span><span>-{formatPrice((route?.pricing.basePrice || 0) - calculatePrice())}</span></div>)}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', paddingTop: '0.5rem', borderTop: `1px solid ${currentThemeStyles.quickActionBorder}`, color: currentThemeStyles.textPrimary }}><span>Ticket Price:</span><span style={{ color: '#F59E0B' }}>{formatPrice(calculatePrice())}</span></div>
        <div style={{ fontSize: '0.8rem', color: currentThemeStyles.textSecondary, marginTop: '0.25rem', textAlign: 'center' }}>*Includes all taxes and fees</div>
      </div>
    </div>
  );
  
  // --- Loading and Error Screens ---
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: currentThemeStyles.mainBg }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #fef3c7', borderTop: '4px solid #F59E0B', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <div style={{ color: currentThemeStyles.textPrimary, fontSize: '16px', fontWeight: 600 }}>Loading Route Details...</div>
        </div>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error && !route) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: currentThemeStyles.mainBg, padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentThemeStyles.textPrimary }}>
        <div style={{ textAlign: 'center', backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', border: currentThemeStyles.glassPanelBorder, boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)' }}>
          <h2 style={{ color: '#DC2626' }}>Error Loading Route</h2>
          <p style={{ color: currentThemeStyles.textSecondary }}>{error}</p>
          <Link href="/search" style={{ color: '#F59E0B', textDecoration: 'underline', fontWeight: '600' }}>
            Go back to search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      <style jsx>{animationStyles}</style>
      <style jsx global>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
      
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />
      
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* --- Navigation --- */}
        <nav style={{ backgroundColor: 'rgba(30, 41, 59, 0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', padding: '1rem 0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              <ShieldCheckIcon width={32} height={32} color="#dc2626" />
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}><span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>ශ්‍රී</span>Express</h1>
            </Link>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <ThemeSwitcher />
              <Link href="/search" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: '500' }}>← Back to Search</Link>
            </div>
          </div>
        </nav>

        <main className="animate-fade-in-down" style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '2rem 1.5rem' }}>
          <div style={{ width: '100%', maxWidth: '800px' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <h1 style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                color: '#ffffff', 
                margin: 0, 
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.7)'
              }}>Book Your Ticket</h1>
              <p style={{ 
                color: '#e5e7eb', 
                margin: '0.5rem 0 0 0', 
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                fontWeight: '500'
              }}>{route?.name} - {route?.startLocation.name} to {route?.endLocation.name}</p>
            </div>

            {/* Booking Form Card */}
            <div style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              padding: '2rem',
              borderRadius: '1rem',
              border: currentThemeStyles.glassPanelBorder,
              boxShadow: currentThemeStyles.glassPanelShadow,
              backdropFilter: 'blur(12px)'
            }}>
              {/* Progress Steps */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: step >= stepNumber ? '#F59E0B' : 'rgba(156, 163, 175, 0.3)', color: step >= stepNumber ? 'white' : currentThemeStyles.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', transition: 'all 0.3s' }}>{stepNumber}</div>
                    {stepNumber < 3 && (<div style={{ width: '60px', height: '2px', backgroundColor: step > stepNumber ? '#F59E0B' : 'rgba(156, 163, 175, 0.3)', margin: '0 0.5rem', transition: 'all 0.3s' }}></div>)}
                  </div>
                ))}
              </div>

              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              
              {/* Error/Validation Messages */}
              {error && (<div style={{ backgroundColor: 'rgba(254, 226, 226, 0.8)', color: '#DC2626', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #FCA5A5', marginTop: '1rem', backdropFilter: 'blur(5px)' }}><strong>Error:</strong> {error}</div>)}
              {validationErrors.length > 0 && (<div style={{ backgroundColor: 'rgba(254, 243, 199, 0.8)', color: '#92400E', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #FCD34D', marginTop: '1rem', backdropFilter: 'blur(5px)' }}><strong>Please fix the following issues:</strong><ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>{validationErrors.map((e, i) => (<li key={i}>{e}</li>))}</ul></div>)}

              {/* Navigation Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1rem', borderTop: `1px solid ${currentThemeStyles.quickActionBorder}` }}>
                <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} style={{ backgroundColor: step === 1 ? 'rgba(156, 163, 175, 0.4)' : '#6B7280', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '0.5rem', cursor: step === 1 ? 'not-allowed' : 'pointer', fontWeight: '500', opacity: step === 1 ? 0.6 : 1, transition: 'all 0.3s' }}>Previous</button>
                {step < 3 ? (<button onClick={() => setStep(step + 1)} style={{ backgroundColor: '#F59E0B', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '500', transition: 'all 0.3s' }}>Next</button>
                ) : (
                <button onClick={handleSubmit} disabled={submitting} style={{ backgroundColor: submitting ? '#9CA3AF' : '#10B981', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '0.5rem', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: '500', transition: 'all 0.3s' }}>{submitting ? 'Processing...' : '🎫 Confirm Booking'}</button>)}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
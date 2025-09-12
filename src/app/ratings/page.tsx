// src/app/ratings/page.tsx - Bus Rating Dashboard
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import AnimatedBackground from '@/app/components/AnimatedBackground';
import { 
  ShieldCheckIcon, 
  StarIcon, 
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  TicketIcon,
  TruckIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

// --- Data Interfaces ---
interface RateableBooking {
  _id: string;
  bookingId: string;
  routeInfo: {
    name: string;
    startLocation: { name: string };
    endLocation: { name: string };
  };
  travelDate: string;
  departureTime: string;
  seatInfo: {
    seatNumber: string;
    seatType: string;
  };
  passengerInfo: {
    name: string;
  };
  deviceInfo: {
    _id: string;
    vehicleNumber: string;
    vehicleType: string;
  } | null;
  canRate: boolean;
}

interface UserRating {
  _id: string;
  ratingId: string;
  ratings: {
    overall: number;
    cleanliness: number;
    comfort: number;
    condition: number;
    safety: number;
    punctuality: number;
  };
  review?: {
    comment: string;
    busProblems: string[];
    busHighlights: string[];
  };
  journeyInfo: {
    travelDate: string;
    departureTime: string;
    routeName: string;
    vehicleNumber: string;
    seatNumber: string;
  };
  createdAt: string;
  deviceId: {
    vehicleNumber: string;
    vehicleType: string;
  };
}

export default function RatingsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  
  // State Management
  const [rateableBookings, setRateableBookings] = useState<RateableBooking[]>([]);
  const [userRatings, setUserRatings] = useState<UserRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'rate' | 'history'>('rate');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<RateableBooking | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Rating form state
  const [ratings, setRatings] = useState({
    overall: 0,
    cleanliness: 0,
    comfort: 0,
    condition: 0,
    safety: 0,
    punctuality: 0
  });
  const [review, setReview] = useState({
    comment: '',
    busProblems: [] as string[],
    busHighlights: [] as string[]
  });
  const [isAnonymous, setIsAnonymous] = useState(false);

  // --- Theme and Style Definitions ---
  const lightTheme = { mainBg: '#fffbeb', bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)', glassPanelBg: 'rgba(255, 255, 255, 0.92)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)', textPrimary: '#1f2937', textSecondary: '#4B5563', textMuted: '#6B7280', quickActionBorder: '1px solid rgba(209, 213, 219, 0.5)', alertBg: 'rgba(249, 250, 251, 0.6)' };
  const darkTheme = { mainBg: '#0f172a', bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)', glassPanelBg: 'rgba(30, 41, 59, 0.8)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)', textPrimary: '#f9fafb', textSecondary: '#9ca3af', textMuted: '#9ca3af', quickActionBorder: '1px solid rgba(75, 85, 99, 0.5)', alertBg: 'rgba(51, 65, 85, 0.6)' };
  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  // --- API Logic ---
  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
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
          ...options.headers 
        } 
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
      throw error;
    }
  }, [router]);

  // Load rateable bookings and user ratings
  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [rateableResponse, ratingsResponse] = await Promise.all([
        apiCall('/ratings/rateable-bookings'),
        apiCall('/ratings/my-ratings')
      ]);

      if (rateableResponse) {
        setRateableBookings(rateableResponse.rateableBookings || []);
      }

      if (ratingsResponse) {
        setUserRatings(ratingsResponse.ratings || []);
      }

    } catch (error) {
      console.error('Failed to load rating data:', error);
      setError('Failed to load rating information');
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => { 
    loadData(); 
  }, [loadData]);

  // Handle rating submission
  const handleSubmitRating = async () => {
    if (!selectedBooking || ratings.overall === 0) return;

    setSubmitting(true);
    try {
      const response = await apiCall('/ratings', {
        method: 'POST',
        body: JSON.stringify({
          bookingId: selectedBooking._id,
          ratings,
          review: review.comment || review.busProblems.length > 0 || review.busHighlights.length > 0 ? review : undefined,
          isAnonymous
        })
      });

      if (response) {
        setShowRatingModal(false);
        setSelectedBooking(null);
        resetRatingForm();
        loadData(); // Reload data
        alert('Rating submitted successfully!');
      }
    } catch (error) {
      console.error('Failed to submit rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetRatingForm = () => {
    setRatings({ overall: 0, cleanliness: 0, comfort: 0, condition: 0, safety: 0, punctuality: 0 });
    setReview({ comment: '', busProblems: [], busHighlights: [] });
    setIsAnonymous(false);
  };

  const handleOpenRatingModal = (booking: RateableBooking) => {
    setSelectedBooking(booking);
    setShowRatingModal(true);
    resetRatingForm();
  };

  // Star rating component
  const StarRating = ({ rating, onRatingChange, label }: { rating: number; onRatingChange: (rating: number) => void; label: string }) => (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: currentThemeStyles.textSecondary }}>{label}</label>
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0' }}
          >
            {star <= rating ? 
              <StarSolidIcon width={24} height={24} style={{ color: '#F59E0B' }} /> :
              <StarIcon width={24} height={24} style={{ color: currentThemeStyles.textMuted }} />
            }
          </button>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: currentThemeStyles.mainBg }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid rgba(251, 191, 36, 0.3)', borderTop: '4px solid #F59E0B', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <div style={{ color: currentThemeStyles.textSecondary, fontSize: '16px' }}>Loading ratings...</div>
        </div>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        <nav style={{ backgroundColor: 'rgba(30, 41, 59, 0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', padding: '1rem 0' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
              <ShieldCheckIcon width={32} height={32} color="#dc2626" />
              <div><h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}><span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>ශ්‍රී</span>Express</h1></div>
            </Link>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <Link href="/bookings" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ArrowLeftIcon width={16} /> Back to Bookings</Link>
              <ThemeSwitcher />
            </div>
          </div>
        </nav>

        <main style={{ width: '100%', minHeight: 'calc(100vh - 90px)', display: 'flex', justifyContent: 'center', padding: '2rem 1.5rem' }}>
          <div style={{ width: '100%', maxWidth: '1200px' }}>
            <div style={{ marginBottom: '2rem', textAlign: 'center', color: currentThemeStyles.textPrimary }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                <StarIcon width={40} height={40} color="#F59E0B" />
                Rate Your Bus Journeys
              </h1>
              <p style={{ color: currentThemeStyles.textSecondary, margin: '0.5rem 0 0 0', fontSize: '1.1rem' }}>Share your experience and help improve our service.</p>
            </div>

            {/* Tab Navigation */}
            <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '0.5rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(16px)', border: currentThemeStyles.glassPanelBorder, marginBottom: '2rem', display: 'flex', gap: '0.5rem' }}>
              {[
                { key: 'rate', label: 'Rate Journeys', count: rateableBookings.length },
                { key: 'history', label: 'My Ratings', count: userRatings.length }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as 'rate' | 'history')}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    border: 'none',
                    borderRadius: '0.5rem',
                    backgroundColor: activeTab === tab.key ? '#F59E0B' : 'transparent',
                    color: activeTab === tab.key ? 'white' : currentThemeStyles.textPrimary,
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {tab.key === 'rate' ? <PlusIcon width={20} /> : <ChatBubbleLeftRightIcon width={20} />}
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {error && (
              <div style={{ backgroundColor: 'rgba(254, 226, 226, 0.8)', color: '#DC2626', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #FCA5A5', marginBottom: '2rem', backdropFilter: 'blur(5px)' }}>
                {error}
              </div>
            )}

            {/* Rate Journeys Tab */}
            {activeTab === 'rate' && (
              <div>
                {rateableBookings.length > 0 ? (
                  <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {rateableBookings.map(booking => (
                      <div key={booking._id} style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '1.5rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(16px)', border: currentThemeStyles.glassPanelBorder }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                          <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: currentThemeStyles.textPrimary, margin: '0 0 0.5rem 0' }}>
                              {booking.routeInfo.name}
                            </h3>
                            <p style={{ color: currentThemeStyles.textSecondary, margin: 0, fontSize: '0.9rem' }}>
                              {booking.routeInfo.startLocation.name} → {booking.routeInfo.endLocation.name}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: currentThemeStyles.textSecondary, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                              <CalendarDaysIcon width={16} />
                              {new Date(booking.travelDate).toLocaleDateString()}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: currentThemeStyles.textSecondary, fontSize: '0.9rem' }}>
                              <ClockIcon width={16} />
                              {booking.departureTime}
                            </div>
                          </div>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem', paddingTop: '1rem', borderTop: `1px solid ${currentThemeStyles.quickActionBorder}` }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: currentThemeStyles.textMuted, fontSize: '0.9rem' }}>
                              <TicketIcon width={16} />
                              Seat {booking.seatInfo.seatNumber} ({booking.seatInfo.seatType})
                            </div>
                          </div>
                          <div>
                            {booking.deviceInfo && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: currentThemeStyles.textMuted, fontSize: '0.9rem' }}>
                                <TruckIcon width={16} />
                                Bus {booking.deviceInfo.vehicleNumber} ({booking.deviceInfo.vehicleType})
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ paddingTop: '1rem', borderTop: `1px solid ${currentThemeStyles.quickActionBorder}` }}>
                          {booking.canRate ? (
                            <button
                              onClick={() => handleOpenRatingModal(booking)}
                              style={{
                                backgroundColor: '#F59E0B',
                                color: 'white',
                                padding: '0.75rem 1.5rem',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}
                            >
                              <StarIcon width={16} />
                              Rate Bus {booking.deviceInfo?.vehicleNumber}
                            </button>
                          ) : (
                            <div style={{ color: currentThemeStyles.textMuted, fontSize: '0.9rem', fontStyle: 'italic' }}>
                              Unable to rate - bus information not available
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '4rem', color: currentThemeStyles.textSecondary, backgroundColor: currentThemeStyles.glassPanelBg, borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(16px)', border: currentThemeStyles.glassPanelBorder }}>
                    <StarIcon width={48} height={48} style={{ margin: '0 auto 1rem', color: currentThemeStyles.textMuted }} />
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: currentThemeStyles.textPrimary }}>No Journeys to Rate</h3>
                    <p style={{ marginBottom: '1rem' }}>Complete a bus journey to start rating your experience.</p>
                    <Link href="/book" style={{ backgroundColor: '#F59E0B', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: '500', display: 'inline-block' }}>Book a Journey</Link>
                  </div>
                )}
              </div>
            )}

            {/* Rating History Tab */}
            {activeTab === 'history' && (
              <div>
                {userRatings.length > 0 ? (
                  <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {userRatings.map(rating => (
                      <div key={rating._id} style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '1.5rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(16px)', border: currentThemeStyles.glassPanelBorder }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                          <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: currentThemeStyles.textPrimary, margin: '0 0 0.5rem 0' }}>
                              Bus {rating.journeyInfo.vehicleNumber}
                            </h3>
                            <p style={{ color: currentThemeStyles.textSecondary, margin: 0, fontSize: '0.9rem' }}>
                              {rating.journeyInfo.routeName}
                            </p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            {[...Array(5)].map((_, i) => (
                              <StarSolidIcon
                                key={i}
                                width={20}
                                height={20}
                                style={{ color: i < rating.ratings.overall ? '#F59E0B' : currentThemeStyles.textMuted }}
                              />
                            ))}
                            <span style={{ marginLeft: '0.5rem', fontWeight: '600', color: currentThemeStyles.textPrimary }}>
                              {rating.ratings.overall}/5
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                          {[
                            { label: 'Cleanliness', value: rating.ratings.cleanliness },
                            { label: 'Comfort', value: rating.ratings.comfort },
                            { label: 'Condition', value: rating.ratings.condition },
                            { label: 'Safety', value: rating.ratings.safety },
                            { label: 'Punctuality', value: rating.ratings.punctuality }
                          ].map(item => (
                            <div key={item.label} style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '0.8rem', color: currentThemeStyles.textMuted, marginBottom: '0.25rem' }}>
                                {item.label}
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'center', gap: '1px' }}>
                                {[...Array(5)].map((_, i) => (
                                  <StarSolidIcon
                                    key={i}
                                    width={12}
                                    height={12}
                                    style={{ color: i < item.value ? '#F59E0B' : currentThemeStyles.textMuted }}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {rating.review?.comment && (
                          <div style={{ backgroundColor: currentThemeStyles.alertBg, padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                            <p style={{ color: currentThemeStyles.textPrimary, margin: 0, fontSize: '0.9rem' }}>
                              "{rating.review.comment}"
                            </p>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: currentThemeStyles.textMuted, paddingTop: '1rem', borderTop: `1px solid ${currentThemeStyles.quickActionBorder}` }}>
                          <span>
                            {new Date(rating.journeyInfo.travelDate).toLocaleDateString()} at {rating.journeyInfo.departureTime}
                          </span>
                          <span>
                            Rated on {new Date(rating.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '4rem', color: currentThemeStyles.textSecondary, backgroundColor: currentThemeStyles.glassPanelBg, borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(16px)', border: currentThemeStyles.glassPanelBorder }}>
                    <ChatBubbleLeftRightIcon width={48} height={48} style={{ margin: '0 auto 1rem', color: currentThemeStyles.textMuted }} />
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: currentThemeStyles.textPrimary }}>No Ratings Yet</h3>
                    <p>Start rating your bus journeys to see your history here.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Rating Modal */}
      {showRatingModal && selectedBooking && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, border: currentThemeStyles.glassPanelBorder, maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <StarIcon width={24} color="#F59E0B" />
              Rate Bus {selectedBooking.deviceInfo?.vehicleNumber}
            </h3>
            
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: currentThemeStyles.alertBg, borderRadius: '0.5rem' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: currentThemeStyles.textSecondary }}>
                <strong>{selectedBooking.routeInfo.name}</strong><br />
                {new Date(selectedBooking.travelDate).toLocaleDateString()} at {selectedBooking.departureTime}<br />
                Seat {selectedBooking.seatInfo.seatNumber}
              </p>
            </div>

            <StarRating 
              rating={ratings.overall} 
              onRatingChange={(rating) => setRatings(prev => ({ ...prev, overall: rating }))} 
              label="Overall Experience" 
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <StarRating 
                rating={ratings.cleanliness} 
                onRatingChange={(rating) => setRatings(prev => ({ ...prev, cleanliness: rating }))} 
                label="Cleanliness" 
              />
              <StarRating 
                rating={ratings.comfort} 
                onRatingChange={(rating) => setRatings(prev => ({ ...prev, comfort: rating }))} 
                label="Comfort" 
              />
              <StarRating 
                rating={ratings.condition} 
                onRatingChange={(rating) => setRatings(prev => ({ ...prev, condition: rating }))} 
                label="Bus Condition" 
              />
              <StarRating 
                rating={ratings.safety} 
                onRatingChange={(rating) => setRatings(prev => ({ ...prev, safety: rating }))} 
                label="Safety" 
              />
              <StarRating 
                rating={ratings.punctuality} 
                onRatingChange={(rating) => setRatings(prev => ({ ...prev, punctuality: rating }))} 
                label="Punctuality" 
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: currentThemeStyles.textSecondary }}>
                Additional Comments (Optional)
              </label>
              <textarea
                value={review.comment}
                onChange={(e) => setReview(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your experience with this bus..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${currentThemeStyles.quickActionBorder}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  minHeight: '80px',
                  resize: 'vertical',
                  backgroundColor: currentThemeStyles.alertBg,
                  color: currentThemeStyles.textPrimary
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.9rem' }}>
                  Submit anonymously
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowRatingModal(false);
                  setSelectedBooking(null);
                  resetRatingForm();
                }}
                disabled={submitting}
                style={{
                  backgroundColor: '#6B7280',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  opacity: submitting ? 0.7 : 1
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={submitting || ratings.overall === 0}
                style={{
                  backgroundColor: ratings.overall === 0 ? '#9CA3AF' : '#F59E0B',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: ratings.overall === 0 || submitting ? 'not-allowed' : 'pointer',
                  opacity: ratings.overall === 0 || submitting ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {submitting ? 'Submitting...' : (
                  <>
                    <CheckCircleIcon width={16} />
                    Submit Rating
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// src/app/search/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Route {
  _id: string;
  routeId: string;
  name: string;
  startLocation: {
    name: string;
    coordinates: [number, number];
    address: string;
  };
  endLocation: {
    name: string;
    coordinates: [number, number];
    address: string;
  };
  distance: number;
  estimatedDuration: number;
  schedules: Array<{
    departureTime: string;
    arrivalTime: string;
    frequency: number;
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
    pricePerKm: number;
    discounts: Array<{
      type: 'student' | 'senior' | 'military';
      percentage: number;
    }>;
  };
  avgRating: number;
  totalReviews: number;
  status: 'active' | 'inactive' | 'maintenance';
}

interface SearchFilters {
  from: string;
  to: string;
  date: string;
  vehicleType: 'all' | 'bus' | 'train';
  maxPrice: number;
  sortBy: 'price' | 'duration' | 'rating' | 'departure';
}

export default function RouteSearchPage() {
  const router = useRouter();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    from: '',
    to: '',
    date: new Date().toISOString().split('T')[0],
    vehicleType: 'all',
    maxPrice: 10000,
    sortBy: 'departure'
  });

  // Get auth token
  const getToken = () => {
    return localStorage.getItem('token');
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

  // Search routes
  const handleSearch = async () => {
    if (!filters.from || !filters.to) {
      setError('Please enter both departure and destination locations');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      params.append('from', filters.from);
      params.append('to', filters.to);
      params.append('date', filters.date);
      if (filters.vehicleType !== 'all') params.append('vehicleType', filters.vehicleType);
      params.append('maxPrice', filters.maxPrice.toString());
      params.append('sortBy', filters.sortBy);

      const response = await apiCall(`/routes/search?${params.toString()}`);
      
      if (response) {
        setRoutes(response.routes || []);
      } else {
        setError('Failed to search routes');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search routes');
    } finally {
      setLoading(false);
    }
  };

  // Load popular routes on component mount
  useEffect(() => {
    const loadPopularRoutes = async () => {
      setLoading(true);
      const response = await apiCall('/routes?limit=10&sortBy=totalReviews&sortOrder=desc');
      if (response) {
        setRoutes(response.routes || []);
      }
      setLoading(false);
    };

    loadPopularRoutes();
  }, [apiCall]);

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= rating ? '#F59E0B' : '#D1D5DB' }}>
          ★
        </span>
      );
    }
    return stars;
  };

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
            <Link href="/dashboard" style={{
              color: '#6B7280',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Dashboard
            </Link>
            <Link href="/bookings" style={{
              color: '#6B7280',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              My Bookings
            </Link>
          </div>
        </div>
      </nav>

      <div style={{
        maxWidth: '1200px',
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
            Find Your Route
          </h1>
          <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>
            Search and book tickets for buses and trains across Sri Lanka
          </p>
        </div>

        {/* Search Form */}
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.75rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                From
              </label>
              <input
                type="text"
                placeholder="Enter departure location"
                value={filters.from}
                onChange={(e) => setFilters(prev => ({ ...prev, from: e.target.value }))}
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                To
              </label>
              <input
                type="text"
                placeholder="Enter destination"
                value={filters.to}
                onChange={(e) => setFilters(prev => ({ ...prev, to: e.target.value }))}
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                Date
              </label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                Vehicle Type
              </label>
              <select
                value={filters.vehicleType}
                onChange={(e) => setFilters(prev => ({ ...prev, vehicleType: e.target.value as any }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              >
                <option value="all">All Vehicles</option>
                <option value="bus">Bus</option>
                <option value="train">Train</option>
              </select>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                Max Price: {formatPrice(filters.maxPrice)}
              </label>
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
                style={{
                  width: '100%',
                  height: '6px',
                  borderRadius: '3px',
                  background: '#e5e7eb',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              >
                <option value="departure">Departure Time</option>
                <option value="price">Price</option>
                <option value="duration">Duration</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#9CA3AF' : '#F59E0B',
              color: 'white',
              padding: '0.75rem 2rem',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? 'Searching...' : 'Search Routes'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#FEE2E2',
            color: '#DC2626',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid #FCA5A5',
            marginBottom: '2rem'
          }}>
            {error}
          </div>
        )}

        {/* Results */}
        <div>
          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '4rem'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f4f6',
                borderTop: '4px solid #F59E0B',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
          ) : routes.length > 0 ? (
            <div style={{
              display: 'grid',
              gap: '1rem'
            }}>
              {routes.map((route) => (
                <div key={route._id} style={{
                  backgroundColor: 'white',
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '1.2rem',
                        fontWeight: '600',
                        color: '#1F2937',
                        margin: '0 0 0.5rem 0'
                      }}>
                        {route.name}
                      </h3>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        color: '#6B7280',
                        marginBottom: '0.5rem'
                      }}>
                        <span>{route.startLocation.name}</span>
                        <span>→</span>
                        <span>{route.endLocation.name}</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        fontSize: '0.9rem',
                        color: '#6B7280'
                      }}>
                        <span>🚌 {route.vehicleInfo.type}</span>
                        <span>⏱️ {formatDuration(route.estimatedDuration)}</span>
                        <span>📍 {route.distance}km</span>
                        <span>👥 {route.vehicleInfo.capacity} seats</span>
                      </div>
                    </div>
                    <div style={{
                      textAlign: 'right',
                      minWidth: '120px'
                    }}>
                      <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: '#F59E0B',
                        marginBottom: '0.5rem'
                      }}>
                        {formatPrice(route.pricing.basePrice)}
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem',
                        color: '#6B7280'
                      }}>
                        <div>{renderStars(route.avgRating)}</div>
                        <span>({route.totalReviews})</span>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '1rem',
                    borderTop: '1px solid #f3f4f6'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      fontSize: '0.9rem',
                      color: '#6B7280'
                    }}>
                      <span>🏢 {route.operatorInfo.companyName}</span>
                      <span>📞 {route.operatorInfo.contactNumber}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem'
                    }}>
                      <Link
                        href={`/routes/${route._id}`}
                        style={{
                          backgroundColor: '#3B82F6',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          textDecoration: 'none',
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}
                      >
                        View Details
                      </Link>
                      <Link
                        href={`/book?routeId=${route._id}`}
                        style={{
                          backgroundColor: '#F59E0B',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          textDecoration: 'none',
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '4rem',
              color: '#6B7280'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No routes found</h3>
              <p>Try adjusting your search criteria or check back later</p>
            </div>
          )}
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
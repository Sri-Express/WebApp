// src/app/fleet/routes/page.tsx - Fleet Routes Management
"use client";

import { useState, useEffect } from 'react';
import { 
  MapIcon,
  ClockIcon,
  StarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

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
  status: 'active' | 'inactive' | 'maintenance';
  avgRating: number;
  totalReviews: number;
  schedules: Array<{
    departureTime: string;
    arrivalTime: string;
    frequency: number;
    daysOfWeek: string[];
    isActive: boolean;
  }>;
  pricing: {
    basePrice: number;
    pricePerKm: number;
    discounts: Array<{
      type: string;
      percentage: number;
    }>;
  };
  vehicleInfo: {
    type: string;
    capacity: number;
    amenities: string[];
  };
}

interface RouteStats {
  total: number;
  active: number;
  inactive: number;
  maintenance: number;
}

export default function FleetRoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stats, setStats] = useState<RouteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fleet/routes`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load routes');
        }

        const data = await response.json();
        setRoutes(data.routes || []);
        setStats(data.stats);
      } catch (error) {
        console.error('Load routes error:', error);
        setError(error instanceof Error ? error.message : 'Failed to load routes');
      } finally {
        setLoading(false);
      }
    };

    loadRoutes();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'inactive': return '#6b7280';
      case 'maintenance': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon width={16} height={16} />;
      case 'inactive': return <XCircleIcon width={16} height={16} />;
      case 'maintenance': return <ExclamationTriangleIcon width={16} height={16} />;
      default: return <ExclamationTriangleIcon width={16} height={16} />;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toFixed(2)}`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        width={16}
        height={16}
        style={{
          color: i < Math.floor(rating) ? '#f59e0b' : '#374151',
          fill: i < Math.floor(rating) ? '#f59e0b' : 'none'
        }}
      />
    ));
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#f1f5f9'
      }}>
        Loading routes...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>
        {/* Header */}
        <div style={{
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#f1f5f9',
            margin: '0 0 0.5rem 0'
          }}>
            Route Management
          </h1>
          <p style={{
            color: '#94a3b8',
            margin: 0
          }}>
            Monitor and manage your operating routes
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            backgroundColor: '#7f1d1d',
            border: '1px solid #991b1b',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '2rem',
            color: '#fecaca'
          }}>
            {error}
          </div>
        )}

        {/* Statistics */}
        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              backgroundColor: '#1e293b',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              border: '1px solid #334155'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <MapIcon width={32} height={32} color="#3b82f6" />
                <div>
                  <h3 style={{ color: '#3b82f6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                    {stats.total}
                  </h3>
                  <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Total Routes</p>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: '#1e293b',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              border: '1px solid #334155'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <CheckCircleIcon width={32} height={32} color="#10b981" />
                <div>
                  <h3 style={{ color: '#10b981', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                    {stats.active}
                  </h3>
                  <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Active Routes</p>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: '#1e293b',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              border: '1px solid #334155'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <ExclamationTriangleIcon width={32} height={32} color="#f59e0b" />
                <div>
                  <h3 style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                    {stats.maintenance}
                  </h3>
                  <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Under Maintenance</p>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: '#1e293b',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              border: '1px solid #334155'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <XCircleIcon width={32} height={32} color="#6b7280" />
                <div>
                  <h3 style={{ color: '#6b7280', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                    {stats.inactive}
                  </h3>
                  <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Inactive Routes</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Routes Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))',
          gap: '1.5rem'
        }}>
          {routes.map((route) => (
            <div key={route._id} style={{
              backgroundColor: '#1e293b',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              border: '1px solid #334155'
            }}>
              {/* Route Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem'
              }}>
                <div>
                  <h3 style={{
                    color: '#f1f5f9',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    margin: '0 0 0.5rem 0'
                  }}>
                    {route.name}
                  </h3>
                  <p style={{
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    margin: 0
                  }}>
                    {route.startLocation.name} → {route.endLocation.name}
                  </p>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{ color: getStatusColor(route.status) }}>
                    {getStatusIcon(route.status)}
                  </span>
                  <span style={{
                    color: getStatusColor(route.status),
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    textTransform: 'capitalize'
                  }}>
                    {route.status}
                  </span>
                </div>
              </div>

              {/* Route Details */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem',
                padding: '1rem',
                backgroundColor: '#334155',
                borderRadius: '0.5rem'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <MapIcon width={16} height={16} color="#94a3b8" />
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Distance</span>
                  </div>
                  <span style={{ color: '#f1f5f9', fontSize: '0.875rem', fontWeight: '600' }}>
                    {route.distance} km
                  </span>
                </div>
                
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <ClockIcon width={16} height={16} color="#94a3b8" />
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Duration</span>
                  </div>
                  <span style={{ color: '#f1f5f9', fontSize: '0.875rem', fontWeight: '600' }}>
                    {formatDuration(route.estimatedDuration)}
                  </span>
                </div>
                
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <UsersIcon width={16} height={16} color="#94a3b8" />
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Capacity</span>
                  </div>
                  <span style={{ color: '#f1f5f9', fontSize: '0.875rem', fontWeight: '600' }}>
                    {route.vehicleInfo.capacity} passengers
                  </span>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <CurrencyDollarIcon width={16} height={16} color="#94a3b8" />
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Base Price</span>
                  </div>
                  <span style={{ color: '#f1f5f9', fontSize: '0.875rem', fontWeight: '600' }}>
                    {formatCurrency(route.pricing.basePrice)}
                  </span>
                </div>
              </div>

              {/* Rating & Reviews */}
              <div style={{
                backgroundColor: '#334155',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {renderStars(route.avgRating)}
                    </div>
                    <span style={{ color: '#f1f5f9', fontSize: '0.875rem', fontWeight: '600' }}>
                      {route.avgRating.toFixed(1)}
                    </span>
                  </div>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                    {route.totalReviews} reviews
                  </span>
                </div>
              </div>

              {/* Schedules */}
              <div style={{
                backgroundColor: '#334155',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}>
                <h4 style={{
                  color: '#f1f5f9',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  margin: '0 0 0.75rem 0'
                }}>
                  Active Schedules
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {route.schedules
                    .filter(schedule => schedule.isActive)
                    .slice(0, 3)
                    .map((schedule, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.875rem'
                    }}>
                      <span style={{ color: '#f1f5f9' }}>
                        {schedule.departureTime} - {schedule.arrivalTime}
                      </span>
                      <span style={{ color: '#94a3b8' }}>
                        {schedule.daysOfWeek.join(', ')}
                      </span>
                    </div>
                  ))}
                  {route.schedules.filter(s => s.isActive).length > 3 && (
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                      +{route.schedules.filter(s => s.isActive).length - 3} more schedules
                    </span>
                  )}
                </div>
              </div>

              {/* Amenities */}
              {route.vehicleInfo.amenities.length > 0 && (
                <div style={{
                  backgroundColor: '#334155',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{
                    color: '#f1f5f9',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    margin: '0 0 0.75rem 0'
                  }}>
                    Amenities
                  </h4>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    {route.vehicleInfo.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        style={{
                          backgroundColor: '#1e293b',
                          color: '#10b981',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem'
                        }}
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: '0.5rem'
              }}>
                <button
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  View Details
                </button>
                
                <button
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  Manage Schedule
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {routes.length === 0 && !loading && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: '#1e293b',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <MapIcon width={48} height={48} style={{ margin: '0 auto 1rem', opacity: 0.5, color: '#94a3b8' }} />
            <h3 style={{ color: '#f1f5f9', marginBottom: '0.5rem' }}>No routes found</h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
              Your fleet routes will appear here once they are configured.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
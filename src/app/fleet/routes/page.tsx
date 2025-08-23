// src/app/fleet/routes/page.tsx - Fleet Routes Management with Theme Integration
"use client";

import { useState, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
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
  const { theme } = useTheme();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stats, setStats] = useState<RouteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Theme and Style Definitions
  const lightTheme = { 
    mainBg: '#fffbeb', 
    bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)', 
    glassPanelBg: 'rgba(255, 255, 255, 0.92)', 
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', 
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)', 
    textPrimary: '#1f2937', 
    textSecondary: '#4B5563', 
    textMuted: '#6B7280', 
    quickActionBg: 'rgba(249, 250, 251, 0.8)', 
    quickActionBorder: '1px solid rgba(209, 213, 219, 0.5)', 
    alertBg: 'rgba(249, 250, 251, 0.6)'
  };
  
  const darkTheme = { 
    mainBg: '#0f172a', 
    bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)', 
    glassPanelBg: 'rgba(30, 41, 59, 0.8)', 
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', 
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)', 
    textPrimary: '#f9fafb', 
    textSecondary: '#9ca3af', 
    textMuted: '#9ca3af', 
    quickActionBg: 'rgba(51, 65, 85, 0.8)', 
    quickActionBorder: '1px solid rgba(75, 85, 99, 0.5)', 
    alertBg: 'rgba(51, 65, 85, 0.6)'
  };
  
  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  // Combined animation and responsive styles
  const combinedStyles = `
    @keyframes spin { 
      0% { transform: rotate(0deg); } 
      100% { transform: rotate(360deg); } 
    }
    
    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .animate-fade-in-down {
      animation: fadeInDown 0.8s ease-out forwards;
    }
    
    .animate-fade-in-up {
      animation: fadeInUp 0.8s ease-out forwards;
    }
    
    .route-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
    }
    
    .stat-card:hover {
      transform: translateY(-2px);
    }
    
    .action-btn:hover {
      transform: translateY(-1px);
    }

    .animation-delay-100 { animation-delay: 0.1s; }
    .animation-delay-200 { animation-delay: 0.2s; }
    .animation-delay-300 { animation-delay: 0.3s; }
    .animation-delay-400 { animation-delay: 0.4s; }
    
    @media (max-width: 768px) {
      .route-card {
        grid-template-columns: 1fr !important;
      }
      .routes-grid {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)) !important;
      }
    }
  `;

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
          color: i < Math.floor(rating) ? '#f59e0b' : (theme === 'dark' ? '#374151' : '#d1d5db'),
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
        color: currentThemeStyles.textPrimary
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: `4px solid ${theme === 'dark' ? '#fef3c7' : '#fde68a'}`, 
            borderTop: '4px solid #F59E0B', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite', 
            margin: '0 auto 16px' 
          }}></div>
          <div style={{ 
            color: currentThemeStyles.textPrimary, 
            fontSize: '16px', 
            fontWeight: '600' 
          }}>
            Loading Routes...
          </div>
        </div>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      paddingTop: '2rem'
    }}>
      <style jsx>{combinedStyles}</style>
      
      <div className="animate-fade-in-down" style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 1.5rem 2rem'
      }}>
        {/* Header */}
        <div style={{
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: currentThemeStyles.textPrimary,
            margin: '0 0 0.5rem 0',
            textShadow: theme === 'dark' ? '0 2px 4px rgba(0,0,0,0.5)' : '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            Route Management
          </h1>
          <p style={{
            color: currentThemeStyles.textSecondary,
            margin: 0
          }}>
            Monitor and manage your operating routes
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="animate-fade-in-down" style={{
            backgroundColor: theme === 'dark' ? '#7f1d1d' : '#fef2f2',
            border: `1px solid ${theme === 'dark' ? '#991b1b' : '#f87171'}`,
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '2rem',
            color: theme === 'dark' ? '#fecaca' : '#dc2626',
            backdropFilter: 'blur(12px)'
          }}>
            {error}
          </div>
        )}

        {/* Statistics */}
        {stats && (
          <div className="animate-fade-in-up" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div className="stat-card animation-delay-100" style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              padding: '2rem',
              borderRadius: '1rem',
              border: currentThemeStyles.glassPanelBorder,
              boxShadow: currentThemeStyles.glassPanelShadow,
              backdropFilter: 'blur(12px)',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <MapIcon width={32} height={32} color="#3b82f6" />
                <div>
                  <h3 style={{ color: '#3b82f6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                    {stats.total}
                  </h3>
                  <p style={{ color: currentThemeStyles.textSecondary, margin: '0.5rem 0 0 0', fontWeight: '600' }}>Total Routes</p>
                </div>
              </div>
            </div>

            <div className="stat-card animation-delay-200" style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              padding: '2rem',
              borderRadius: '1rem',
              border: currentThemeStyles.glassPanelBorder,
              boxShadow: currentThemeStyles.glassPanelShadow,
              backdropFilter: 'blur(12px)',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <CheckCircleIcon width={32} height={32} color="#10b981" />
                <div>
                  <h3 style={{ color: '#10b981', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                    {stats.active}
                  </h3>
                  <p style={{ color: currentThemeStyles.textSecondary, margin: '0.5rem 0 0 0', fontWeight: '600' }}>Active Routes</p>
                </div>
              </div>
            </div>

            <div className="stat-card animation-delay-300" style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              padding: '2rem',
              borderRadius: '1rem',
              border: currentThemeStyles.glassPanelBorder,
              boxShadow: currentThemeStyles.glassPanelShadow,
              backdropFilter: 'blur(12px)',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <ExclamationTriangleIcon width={32} height={32} color="#f59e0b" />
                <div>
                  <h3 style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                    {stats.maintenance}
                  </h3>
                  <p style={{ color: currentThemeStyles.textSecondary, margin: '0.5rem 0 0 0', fontWeight: '600' }}>Under Maintenance</p>
                </div>
              </div>
            </div>

            <div className="stat-card animation-delay-400" style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              padding: '2rem',
              borderRadius: '1rem',
              border: currentThemeStyles.glassPanelBorder,
              boxShadow: currentThemeStyles.glassPanelShadow,
              backdropFilter: 'blur(12px)',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <XCircleIcon width={32} height={32} color="#6b7280" />
                <div>
                  <h3 style={{ color: '#6b7280', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                    {stats.inactive}
                  </h3>
                  <p style={{ color: currentThemeStyles.textSecondary, margin: '0.5rem 0 0 0', fontWeight: '600' }}>Inactive Routes</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Routes Grid */}
        <div className="animate-fade-in-up animation-delay-300 routes-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))',
          gap: '1.5rem'
        }}>
          {routes.map((route, index) => (
            <div key={route._id} className="route-card" style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              padding: '2rem',
              borderRadius: '1rem',
              border: currentThemeStyles.glassPanelBorder,
              boxShadow: currentThemeStyles.glassPanelShadow,
              backdropFilter: 'blur(12px)',
              transition: 'all 0.3s ease',
              animationDelay: `${index * 0.1}s`
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
                    color: currentThemeStyles.textPrimary,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    margin: '0 0 0.5rem 0'
                  }}>
                    {route.name}
                  </h3>
                  <p style={{
                    color: currentThemeStyles.textSecondary,
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
                backgroundColor: currentThemeStyles.alertBg,
                borderRadius: '0.5rem',
                border: currentThemeStyles.quickActionBorder,
                backdropFilter: 'blur(8px)'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <MapIcon width={16} height={16} color={currentThemeStyles.textMuted} />
                    <span style={{ color: currentThemeStyles.textMuted, fontSize: '0.75rem' }}>Distance</span>
                  </div>
                  <span style={{ color: currentThemeStyles.textPrimary, fontSize: '0.875rem', fontWeight: '600' }}>
                    {route.distance} km
                  </span>
                </div>
                
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <ClockIcon width={16} height={16} color={currentThemeStyles.textMuted} />
                    <span style={{ color: currentThemeStyles.textMuted, fontSize: '0.75rem' }}>Duration</span>
                  </div>
                  <span style={{ color: currentThemeStyles.textPrimary, fontSize: '0.875rem', fontWeight: '600' }}>
                    {formatDuration(route.estimatedDuration)}
                  </span>
                </div>
                
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <UsersIcon width={16} height={16} color={currentThemeStyles.textMuted} />
                    <span style={{ color: currentThemeStyles.textMuted, fontSize: '0.75rem' }}>Capacity</span>
                  </div>
                  <span style={{ color: currentThemeStyles.textPrimary, fontSize: '0.875rem', fontWeight: '600' }}>
                    {route.vehicleInfo.capacity} passengers
                  </span>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <CurrencyDollarIcon width={16} height={16} color={currentThemeStyles.textMuted} />
                    <span style={{ color: currentThemeStyles.textMuted, fontSize: '0.75rem' }}>Base Price</span>
                  </div>
                  <span style={{ color: currentThemeStyles.textPrimary, fontSize: '0.875rem', fontWeight: '600' }}>
                    {formatCurrency(route.pricing.basePrice)}
                  </span>
                </div>
              </div>

              {/* Rating & Reviews */}
              <div style={{
                backgroundColor: currentThemeStyles.alertBg,
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                border: currentThemeStyles.quickActionBorder,
                backdropFilter: 'blur(8px)'
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
                    <span style={{ color: currentThemeStyles.textPrimary, fontSize: '0.875rem', fontWeight: '600' }}>
                      {route.avgRating.toFixed(1)}
                    </span>
                  </div>
                  <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>
                    {route.totalReviews} reviews
                  </span>
                </div>
              </div>

              {/* Schedules */}
              <div style={{
                backgroundColor: currentThemeStyles.alertBg,
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                border: currentThemeStyles.quickActionBorder,
                backdropFilter: 'blur(8px)'
              }}>
                <h4 style={{
                  color: currentThemeStyles.textPrimary,
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
                      <span style={{ color: currentThemeStyles.textPrimary }}>
                        {schedule.departureTime} - {schedule.arrivalTime}
                      </span>
                      <span style={{ color: currentThemeStyles.textSecondary }}>
                        {schedule.daysOfWeek.join(', ')}
                      </span>
                    </div>
                  ))}
                  {route.schedules.filter(s => s.isActive).length > 3 && (
                    <span style={{ color: currentThemeStyles.textMuted, fontSize: '0.75rem' }}>
                      +{route.schedules.filter(s => s.isActive).length - 3} more schedules
                    </span>
                  )}
                </div>
              </div>

              {/* Amenities */}
              {route.vehicleInfo.amenities.length > 0 && (
                <div style={{
                  backgroundColor: currentThemeStyles.alertBg,
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  border: currentThemeStyles.quickActionBorder,
                  backdropFilter: 'blur(8px)'
                }}>
                  <h4 style={{
                    color: currentThemeStyles.textPrimary,
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
                          backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc',
                          color: '#10b981',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          border: currentThemeStyles.glassPanelBorder,
                          backdropFilter: 'blur(4px)'
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
                  className="action-btn"
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    flex: 1,
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                    e.currentTarget.style.boxShadow = '0 8px 12px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(59, 130, 246, 0.3)';
                  }}
                >
                  View Details
                </button>
                
                <button
                  className="action-btn"
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    flex: 1,
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#059669';
                    e.currentTarget.style.boxShadow = '0 8px 12px rgba(16, 185, 129, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#10b981';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(16, 185, 129, 0.3)';
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
          <div className="animate-fade-in-up" style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: currentThemeStyles.glassPanelBg,
            borderRadius: '1rem',
            border: currentThemeStyles.glassPanelBorder,
            boxShadow: currentThemeStyles.glassPanelShadow,
            backdropFilter: 'blur(12px)'
          }}>
            <MapIcon width={48} height={48} style={{ 
              margin: '0 auto 1rem', 
              opacity: 0.5, 
              color: currentThemeStyles.textMuted
            }} />
            <h3 style={{ 
              color: currentThemeStyles.textPrimary, 
              marginBottom: '0.5rem',
              fontSize: '1.25rem',
              fontWeight: 'bold'
            }}>
              No routes found
            </h3>
            <p style={{ 
              color: currentThemeStyles.textSecondary, 
              marginBottom: '1.5rem',
              fontSize: '1rem'
            }}>
              Your fleet routes will appear here once they are configured.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
// Updated src/app/fleet/routes/page.tsx - Fleet Routes with Approval Status
"use client";

import { useState, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import Link from 'next/link';
import { 
  MapIcon,
  ClockIcon,
  StarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  InformationCircleIcon
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
  
  // Approval Status
  approvalStatus: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: {
    name: string;
    email: string;
  };
  rejectionReason?: string;
  adminNotes?: string;
  
  // Operational Status
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
  pending: number;
  approved: number;
  rejected: number;
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
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
        
        if (data.message) {
          setError(data.message);
        }
      } catch (error) {
        console.error('Load routes error:', error);
        setError(error instanceof Error ? error.message : 'Failed to load routes');
      } finally {
        setLoading(false);
      }
    };

    loadRoutes();
  }, []);

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getApprovalStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon width={16} height={16} />;
      case 'pending': return <ClockIcon width={16} height={16} />;
      case 'rejected': return <XCircleIcon width={16} height={16} />;
      default: return <ExclamationTriangleIcon width={16} height={16} />;
    }
  };

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

  const handleDeleteRoute = async (routeId: string) => {
    if (!confirm('Are you sure you want to delete this route application?')) return;
    
    setActionLoading(`delete-${routeId}`);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fleet/routes/${routeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete route');
      }

      // Remove route from state
      setRoutes(prev => prev.filter(route => route._id !== routeId));
      
      // Update stats
      if (stats) {
        const deletedRoute = routes.find(r => r._id === routeId);
        if (deletedRoute) {
          setStats(prev => prev ? {
            ...prev,
            total: prev.total - 1,
            [deletedRoute.approvalStatus]: prev[deletedRoute.approvalStatus] - 1
          } : null);
        }
      }
    } catch (error) {
      console.error(`Error deleting route ${routeId}:`, error);
      alert('Failed to delete route. Please try again.');
    } finally {
      setActionLoading(null);
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: currentThemeStyles.textPrimary,
              margin: '0 0 0.5rem 0',
              textShadow: theme === 'dark' ? '0 2px 4px rgba(0,0,0,0.5)' : '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              My Routes
            </h1>
            <p style={{
              color: currentThemeStyles.textSecondary,
              margin: 0
            }}>
              Manage your route applications and track approval status
            </p>
          </div>
          
          <Link href="/fleet/routes/add" style={{ textDecoration: 'none' }}>
            <button style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1rem',
              boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)'
            }}>
              <PlusIcon width={20} height={20} />
              Add New Route
            </button>
          </Link>
        </div>

        {/* Error Display */}
        {error && (
          <div className="animate-fade-in-down" style={{
            backgroundColor: theme === 'dark' ? '#1e293b' : '#fef2f2',
            border: `1px solid ${theme === 'dark' ? '#334155' : '#f87171'}`,
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '2rem',
            color: theme === 'dark' ? '#94a3b8' : '#dc2626',
            backdropFilter: 'blur(12px)'
          }}>
            <InformationCircleIcon width={20} height={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
            {error}
          </div>
        )}

        {/* Statistics */}
        {stats && (
          <div className="animate-fade-in-up" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div className="stat-card animation-delay-100" style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              padding: '1.5rem',
              borderRadius: '1rem',
              border: currentThemeStyles.glassPanelBorder,
              boxShadow: currentThemeStyles.glassPanelShadow,
              backdropFilter: 'blur(12px)',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <MapIcon width={28} height={28} color="#3b82f6" />
                <div>
                  <h3 style={{ color: '#3b82f6', fontSize: '1.75rem', fontWeight: 'bold', margin: 0 }}>
                    {stats.total}
                  </h3>
                  <p style={{ color: currentThemeStyles.textSecondary, margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>Total Routes</p>
                </div>
              </div>
            </div>

            <div className="stat-card animation-delay-200" style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              padding: '1.5rem',
              borderRadius: '1rem',
              border: currentThemeStyles.glassPanelBorder,
              boxShadow: currentThemeStyles.glassPanelShadow,
              backdropFilter: 'blur(12px)',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <ClockIcon width={28} height={28} color="#f59e0b" />
                <div>
                  <h3 style={{ color: '#f59e0b', fontSize: '1.75rem', fontWeight: 'bold', margin: 0 }}>
                    {stats.pending}
                  </h3>
                  <p style={{ color: currentThemeStyles.textSecondary, margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>Pending</p>
                </div>
              </div>
            </div>

            <div className="stat-card animation-delay-300" style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              padding: '1.5rem',
              borderRadius: '1rem',
              border: currentThemeStyles.glassPanelBorder,
              boxShadow: currentThemeStyles.glassPanelShadow,
              backdropFilter: 'blur(12px)',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <CheckCircleIcon width={28} height={28} color="#10b981" />
                <div>
                  <h3 style={{ color: '#10b981', fontSize: '1.75rem', fontWeight: 'bold', margin: 0 }}>
                    {stats.approved}
                  </h3>
                  <p style={{ color: currentThemeStyles.textSecondary, margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>Approved</p>
                </div>
              </div>
            </div>

            <div className="stat-card animation-delay-400" style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              padding: '1.5rem',
              borderRadius: '1rem',
              border: currentThemeStyles.glassPanelBorder,
              boxShadow: currentThemeStyles.glassPanelShadow,
              backdropFilter: 'blur(12px)',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <XCircleIcon width={28} height={28} color="#ef4444" />
                <div>
                  <h3 style={{ color: '#ef4444', fontSize: '1.75rem', fontWeight: 'bold', margin: 0 }}>
                    {stats.rejected}
                  </h3>
                  <p style={{ color: currentThemeStyles.textSecondary, margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>Rejected</p>
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
                  <span style={{ color: getApprovalStatusColor(route.approvalStatus) }}>
                    {getApprovalStatusIcon(route.approvalStatus)}
                  </span>
                  <span style={{
                    color: getApprovalStatusColor(route.approvalStatus),
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    textTransform: 'capitalize'
                  }}>
                    {route.approvalStatus}
                  </span>
                </div>
              </div>

              {/* Approval Status Info */}
              <div style={{
                backgroundColor: currentThemeStyles.alertBg,
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                border: currentThemeStyles.quickActionBorder,
                backdropFilter: 'blur(8px)'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '0.5rem'
                }}>
                  <div>
                    <span style={{ color: currentThemeStyles.textMuted, fontSize: '0.75rem' }}>Submitted: </span>
                    <span style={{ color: currentThemeStyles.textPrimary, fontSize: '0.875rem' }}>
                      {formatDateTime(route.submittedAt)}
                    </span>
                  </div>
                  
                  {route.reviewedAt && (
                    <div>
                      <span style={{ color: currentThemeStyles.textMuted, fontSize: '0.75rem' }}>Reviewed: </span>
                      <span style={{ color: currentThemeStyles.textPrimary, fontSize: '0.875rem' }}>
                        {formatDateTime(route.reviewedAt)}
                      </span>
                      {route.reviewedBy && (
                        <>
                          <span style={{ color: currentThemeStyles.textMuted, fontSize: '0.75rem' }}> by </span>
                          <span style={{ color: currentThemeStyles.textPrimary, fontSize: '0.875rem' }}>
                            {route.reviewedBy.name}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Rejection Reason */}
              {route.rejectionReason && (
                <div style={{
                  backgroundColor: theme === 'dark' ? '#7f1d1d' : '#fef2f2',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  border: `1px solid ${theme === 'dark' ? '#991b1b' : '#f87171'}`
                }}>
                  <h4 style={{
                    color: theme === 'dark' ? '#fca5a5' : '#dc2626',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    margin: '0 0 0.5rem 0'
                  }}>
                    Rejection Reason:
                  </h4>
                  <p style={{
                    color: theme === 'dark' ? '#fecaca' : '#dc2626',
                    fontSize: '0.875rem',
                    margin: 0
                  }}>
                    {route.rejectionReason}
                  </p>
                </div>
              )}

              {/* Admin Notes */}
              {route.adminNotes && (
                <div style={{
                  backgroundColor: theme === 'dark' ? '#064e3b' : '#f0fdf4',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  border: `1px solid ${theme === 'dark' ? '#059669' : '#10b981'}`
                }}>
                  <h4 style={{
                    color: theme === 'dark' ? '#6ee7b7' : '#047857',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    margin: '0 0 0.5rem 0'
                  }}>
                    Admin Notes:
                  </h4>
                  <p style={{
                    color: theme === 'dark' ? '#6ee7b7' : '#047857',
                    fontSize: '0.875rem',
                    margin: 0
                  }}>
                    {route.adminNotes}
                  </p>
                </div>
              )}

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

              {/* Rating & Reviews (only for approved routes) */}
              {route.approvalStatus === 'approved' && (
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
                        {route.avgRating > 0 ? route.avgRating.toFixed(1) : 'No ratings'}
                      </span>
                    </div>
                    <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>
                      {route.totalReviews} reviews
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => setSelectedRoute(route)}
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
                    boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
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
                  <EyeIcon width={14} height={14} />
                  View Details
                </button>
                
                {(route.approvalStatus === 'pending' || route.approvalStatus === 'rejected') && (
                  <>
                    <Link href={`/fleet/routes/edit/${route._id}`} style={{ textDecoration: 'none', flex: 1 }}>
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
                          width: '100%',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
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
                        <PencilIcon width={14} height={14} />
                        Edit
                      </button>
                    </Link>
                    
                    <button
                      onClick={() => handleDeleteRoute(route._id)}
                      disabled={actionLoading === `delete-${route._id}`}
                      className="action-btn"
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        border: 'none',
                        fontSize: '0.875rem',
                        cursor: actionLoading === `delete-${route._id}` ? 'not-allowed' : 'pointer',
                        flex: 1,
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 6px rgba(239, 68, 68, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        opacity: actionLoading === `delete-${route._id}` ? 0.7 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!actionLoading) {
                          e.currentTarget.style.backgroundColor = '#dc2626';
                          e.currentTarget.style.boxShadow = '0 8px 12px rgba(239, 68, 68, 0.4)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!actionLoading) {
                          e.currentTarget.style.backgroundColor = '#ef4444';
                          e.currentTarget.style.boxShadow = '0 4px 6px rgba(239, 68, 68, 0.3)';
                        }
                      }}
                    >
                      <TrashIcon width={14} height={14} />
                      {actionLoading === `delete-${route._id}` ? 'Deleting...' : 'Delete'}
                    </button>
                  </>
                )}
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
              Create your first route application to get started.
            </p>
            <Link href="/fleet/routes/add" style={{ textDecoration: 'none' }}>
              <button style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)'
              }}>
                <PlusIcon width={20} height={20} />
                Add New Route
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Route Details Modal */}
      {selectedRoute && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            padding: '2rem',
            borderRadius: '0.75rem',
            border: currentThemeStyles.glassPanelBorder,
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            backdropFilter: 'blur(12px)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                color: currentThemeStyles.textPrimary,
                fontSize: '1.25rem',
                fontWeight: 'bold',
                margin: 0
              }}>
                {selectedRoute.name} - Route Details
              </h3>
              <button
                onClick={() => setSelectedRoute(null)}
                style={{
                  backgroundColor: 'transparent',
                  color: currentThemeStyles.textMuted,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.5rem'
                }}
              >
                ×
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem'
            }}>
              <div>
                <h4 style={{ color: currentThemeStyles.textPrimary, marginBottom: '1rem' }}>Route Information</h4>
                <div style={{
                  backgroundColor: currentThemeStyles.alertBg,
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: currentThemeStyles.textMuted, fontSize: '0.875rem' }}>Route ID:</span>
                    <p style={{ color: currentThemeStyles.textPrimary, margin: '0.25rem 0 0 0' }}>{selectedRoute.routeId}</p>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: currentThemeStyles.textMuted, fontSize: '0.875rem' }}>Start Address:</span>
                    <p style={{ color: currentThemeStyles.textPrimary, margin: '0.25rem 0 0 0' }}>{selectedRoute.startLocation.address}</p>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: currentThemeStyles.textMuted, fontSize: '0.875rem' }}>End Address:</span>
                    <p style={{ color: currentThemeStyles.textPrimary, margin: '0.25rem 0 0 0' }}>{selectedRoute.endLocation.address}</p>
                  </div>
                  <div>
                    <span style={{ color: currentThemeStyles.textMuted, fontSize: '0.875rem' }}>Vehicle Type:</span>
                    <p style={{ color: currentThemeStyles.textPrimary, margin: '0.25rem 0 0 0', textTransform: 'capitalize' }}>{selectedRoute.vehicleInfo.type}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ color: currentThemeStyles.textPrimary, marginBottom: '1rem' }}>Pricing & Amenities</h4>
                <div style={{
                  backgroundColor: currentThemeStyles.alertBg,
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: currentThemeStyles.textMuted, fontSize: '0.875rem' }}>Price per KM:</span>
                    <p style={{ color: currentThemeStyles.textPrimary, margin: '0.25rem 0 0 0' }}>{formatCurrency(selectedRoute.pricing.pricePerKm)}</p>
                  </div>
                  <div>
                    <span style={{ color: currentThemeStyles.textMuted, fontSize: '0.875rem' }}>Amenities:</span>
                    <p style={{ color: currentThemeStyles.textPrimary, margin: '0.25rem 0 0 0' }}>
                      {selectedRoute.vehicleInfo.amenities.length > 0 
                        ? selectedRoute.vehicleInfo.amenities.join(', ')
                        : 'None specified'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              marginTop: '1.5rem',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <button
                onClick={() => setSelectedRoute(null)}
                style={{
                  backgroundColor: currentThemeStyles.quickActionBg,
                  color: currentThemeStyles.textPrimary,
                  padding: '0.5rem 1rem',
                  border: currentThemeStyles.quickActionBorder,
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
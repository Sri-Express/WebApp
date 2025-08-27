// src/app/fleet/dashboard/page.tsx - Fleet Manager Dashboard with Theme Integration
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/app/context/ThemeContext';
import { 
  TruckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  MapIcon,
  ChartBarIcon,
  CogIcon,
  PlusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface FleetStats {
  complianceScore: number;
  totalVehicles: number;
  activeVehicles: number;
  operatingRoutes: number;
  totalRoutes: number;
  onlineVehicles: number;
  maintenanceVehicles: number;
}

interface Fleet {
  _id: string;
  companyName: string;
  status: string;
  complianceScore: number;
  totalVehicles: number;
  activeVehicles: number;
}

interface DashboardData {
  fleet: Fleet;
  stats: FleetStats;
  routes: any[];
  vehicles: any[];
  alerts: any[];
}

export default function FleetDashboardPage() {
  const { theme } = useTheme();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

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

  // Combined styles
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
    
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.02); }
    }
    
    .animate-fade-in-down {
      animation: fadeInDown 0.8s ease-out forwards;
    }
    
    .animate-fade-in-up {
      animation: fadeInUp 0.8s ease-out forwards;
    }
    
    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
    }
    
    .quick-action:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    }
    
    .compliance-bar {
      transition: width 0.8s ease-in-out;
    }
    
    .online-indicator {
      animation: pulse 2s infinite;
    }
    
    .refresh-btn:hover {
      transform: translateY(-1px);
    }

    .animation-delay-100 { animation-delay: 0.1s; }
    .animation-delay-200 { animation-delay: 0.2s; }
    .animation-delay-300 { animation-delay: 0.3s; }
    .animation-delay-400 { animation-delay: 0.4s; }
    .animation-delay-500 { animation-delay: 0.5s; }
    .animation-delay-600 { animation-delay: 0.6s; }
    
    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important;
      }
      .quick-actions-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)) !important;
      }
      .overview-grid {
        grid-template-columns: 1fr !important;
      }
    }
  `;

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/fleet/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load dashboard');
        }

        const data = await response.json();
        setDashboardData(data);
        setLastRefresh(new Date());
      } catch (error) {
        console.error('Dashboard error:', error);
        setError(error instanceof Error ? error.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/fleet/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load dashboard');
      }

      const data = await response.json();
      setDashboardData(data);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Dashboard error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setError('');
    loadDashboard();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      case 'suspended': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon width={20} height={20} />;
      case 'pending': return <ClockIcon width={20} height={20} />;
      case 'rejected': return <ExclamationTriangleIcon width={20} height={20} />;
      case 'suspended': return <ExclamationTriangleIcon width={20} height={20} />;
      default: return <ClockIcon width={20} height={20} />;
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return '#10b981';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
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
            Loading Fleet Dashboard...
          </div>
        </div>
        <style jsx>{combinedStyles}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        color: '#ef4444',
        gap: '1rem',
        padding: '2rem'
      }}>
        <ExclamationTriangleIcon width={48} height={48} />
        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', textAlign: 'center' }}>
          Error: {error}
        </div>
        <Link 
          href="/dashboard"
          style={{
            backgroundColor: '#6b7280',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        color: currentThemeStyles.textPrimary
      }}>
        No fleet data found
      </div>
    );
  }

  const { fleet, stats } = dashboardData;

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
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1rem'
          }}>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: currentThemeStyles.textPrimary,
                margin: '0 0 0.5rem 0',
                textShadow: theme === 'dark' ? '0 2px 4px rgba(0,0,0,0.5)' : '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                {fleet.companyName}
              </h1>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ color: getStatusColor(fleet.status) }}>
                  {getStatusIcon(fleet.status)}
                </span>
                <span style={{
                  color: getStatusColor(fleet.status),
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}>
                  Fleet Status: {fleet.status}
                </span>
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: currentThemeStyles.textMuted,
                marginTop: '0.5rem'
              }}>
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {fleet.status === 'approved' && (
                <Link
                  href="/fleet/vehicles/add"
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                  }}
                >
                  <PlusIcon width={20} height={20} />
                  Add Vehicle
                </Link>
              )}
            </div>
          </div>

          {/* Fleet Status Alert */}
          {fleet.status !== 'approved' && (
            <div className="animate-fade-in-down animation-delay-200" style={{
              backgroundColor: fleet.status === 'pending' 
                ? (theme === 'dark' ? '#92400e' : '#fef3c7') 
                : (theme === 'dark' ? '#7f1d1d' : '#fef2f2'),
              border: `1px solid ${fleet.status === 'pending' 
                ? (theme === 'dark' ? '#b45309' : '#f59e0b') 
                : (theme === 'dark' ? '#991b1b' : '#ef4444')}`,
              borderRadius: '0.5rem',
              padding: '1rem',
              marginTop: '1rem',
              backdropFilter: 'blur(12px)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <ExclamationTriangleIcon width={20} height={20} color="#fbbf24" />
                <span style={{ color: fleet.status === 'pending' ? '#f59e0b' : '#ef4444', fontWeight: '600' }}>
                  {fleet.status === 'pending' ? 'Application Under Review' : 'Fleet Suspended'}
                </span>
              </div>
              <p style={{ 
                color: fleet.status === 'pending' 
                  ? (theme === 'dark' ? '#fcd34d' : '#92400e')
                  : (theme === 'dark' ? '#fecaca' : '#b91c1c'), 
                margin: 0, 
                fontSize: '0.875rem' 
              }}>
                {fleet.status === 'pending' 
                  ? 'Your fleet application is currently being reviewed by our team. You will be notified once approved.'
                  : 'Your fleet has been suspended. Please contact support for more information.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Statistics Grid */}
        <div className="animate-fade-in-up stats-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Compliance Score */}
          <div className="stat-card animation-delay-100" style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            padding: '2rem',
            borderRadius: '1rem',
            border: currentThemeStyles.glassPanelBorder,
            boxShadow: currentThemeStyles.glassPanelShadow,
            backdropFilter: 'blur(12px)',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', fontWeight: '600' }}>Compliance Score</span>
                <span style={{
                  color: getComplianceColor(fleet.complianceScore),
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}>
                  {fleet.complianceScore}%
                </span>
              </div>
              <div style={{
                backgroundColor: theme === 'dark' ? '#334155' : '#f1f5f9',
                borderRadius: '0.5rem',
                height: '8px',
                overflow: 'hidden'
              }}>
                <div className="compliance-bar" style={{
                  backgroundColor: getComplianceColor(fleet.complianceScore),
                  height: '100%',
                  width: `${fleet.complianceScore}%`,
                  borderRadius: '0.5rem'
                }} />
              </div>
            </div>
            <p style={{ color: currentThemeStyles.textMuted, fontSize: '0.75rem', margin: 0 }}>
              {fleet.complianceScore >= 90 ? 'Excellent compliance' : 
               fleet.complianceScore >= 70 ? 'Good compliance' : 
               'Needs improvement'}
            </p>
          </div>

          {/* Total Vehicles */}
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
              <TruckIcon width={32} height={32} color="#3b82f6" />
              <div>
                <h3 style={{ color: '#3b82f6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {stats.totalVehicles}
                </h3>
                <p style={{ color: currentThemeStyles.textSecondary, margin: '0.5rem 0 0 0', fontWeight: '600' }}>Total Vehicles</p>
              </div>
            </div>
          </div>

          {/* Active Vehicles */}
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
              <CheckCircleIcon width={32} height={32} color="#10b981" />
              <div>
                <h3 style={{ color: '#10b981', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {stats.activeVehicles}
                </h3>
                <p style={{ color: currentThemeStyles.textSecondary, margin: '0.5rem 0 0 0', fontWeight: '600' }}>Active Vehicles</p>
              </div>
            </div>
          </div>

          {/* Online Vehicles */}
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
              <div className="online-indicator" style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: 'white'
                }} />
              </div>
              <div>
                <h3 style={{ color: '#10b981', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {stats.onlineVehicles}
                </h3>
                <p style={{ color: currentThemeStyles.textSecondary, margin: '0.5rem 0 0 0', fontWeight: '600' }}>Online Now</p>
              </div>
            </div>
          </div>

          {/* Routes */}
          <div className="stat-card animation-delay-500" style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            padding: '2rem',
            borderRadius: '1rem',
            border: currentThemeStyles.glassPanelBorder,
            boxShadow: currentThemeStyles.glassPanelShadow,
            backdropFilter: 'blur(12px)',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <MapIcon width={32} height={32} color="#f59e0b" />
              <div>
                <h3 style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {stats.totalRoutes}
                </h3>
                <p style={{ color: currentThemeStyles.textSecondary, margin: '0.5rem 0 0 0', fontWeight: '600' }}>Active Routes</p>
              </div>
            </div>
          </div>

          {/* Maintenance */}
          <div className="stat-card animation-delay-600" style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            padding: '2rem',
            borderRadius: '1rem',
            border: currentThemeStyles.glassPanelBorder,
            boxShadow: currentThemeStyles.glassPanelShadow,
            backdropFilter: 'blur(12px)',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <CogIcon width={32} height={32} color="#ef4444" />
              <div>
                <h3 style={{ color: '#ef4444', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {stats.maintenanceVehicles}
                </h3>
                <p style={{ color: currentThemeStyles.textSecondary, margin: '0.5rem 0 0 0', fontWeight: '600' }}>In Maintenance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="animate-fade-in-up animation-delay-300" style={{
          backgroundColor: currentThemeStyles.glassPanelBg,
          padding: '2rem',
          borderRadius: '1rem',
          border: currentThemeStyles.glassPanelBorder,
          boxShadow: currentThemeStyles.glassPanelShadow,
          backdropFilter: 'blur(12px)',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            color: currentThemeStyles.textPrimary,
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem'
          }}>
            Quick Actions
          </h2>

          <div className="quick-actions-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <Link href="/fleet/vehicles" className="quick-action" style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)'
            }}>
              <TruckIcon width={24} height={24} />
              Manage Vehicles
            </Link>

            <Link href="/fleet/routes" className="quick-action" style={{
              backgroundColor: '#f59e0b',
              color: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(245, 158, 11, 0.3)'
            }}>
              <MapIcon width={24} height={24} />
              View Routes
            </Link>

            <Link href="/fleet/analytics" className="quick-action" style={{
              backgroundColor: '#8b5cf6',
              color: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(139, 92, 246, 0.3)'
            }}>
              <ChartBarIcon width={24} height={24} />
              View Analytics
            </Link>

            <Link href="/fleet/profile" className="quick-action" style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)'
            }}>
              <CogIcon width={24} height={24} />
              Update Profile
            </Link>
          </div>
        </div>

        {/* Fleet Overview */}
        <div className="animate-fade-in-up animation-delay-400" style={{
          backgroundColor: currentThemeStyles.glassPanelBg,
          padding: '2rem',
          borderRadius: '1rem',
          border: currentThemeStyles.glassPanelBorder,
          boxShadow: currentThemeStyles.glassPanelShadow,
          backdropFilter: 'blur(12px)'
        }}>
          <h2 style={{
            color: currentThemeStyles.textPrimary,
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem'
          }}>
            Fleet Overview
          </h2>

          <div className="overview-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {/* Fleet Status Summary */}
            <div style={{
              backgroundColor: currentThemeStyles.alertBg,
              padding: '1.5rem',
              borderRadius: '0.5rem',
              border: currentThemeStyles.quickActionBorder,
              backdropFilter: 'blur(8px)'
            }}>
              <h3 style={{ color: currentThemeStyles.textPrimary, marginBottom: '1rem', fontWeight: 'bold' }}>Fleet Status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: currentThemeStyles.textSecondary }}>Company Status:</span>
                  <span style={{ color: getStatusColor(fleet.status), textTransform: 'capitalize', fontWeight: '600' }}>
                    {fleet.status}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: currentThemeStyles.textSecondary }}>Vehicle Utilization:</span>
                  <span style={{ color: currentThemeStyles.textPrimary, fontWeight: '600' }}>
                    {Math.round((stats.activeVehicles / stats.totalVehicles) * 100)}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: currentThemeStyles.textSecondary }}>Online Vehicles:</span>
                  <span style={{ color: '#10b981', fontWeight: '600' }}>
                    {stats.onlineVehicles}/{stats.totalVehicles}
                  </span>
                </div>
              </div>
            </div>

            {/* Alerts & Notifications */}
            <div style={{
              backgroundColor: currentThemeStyles.alertBg,
              padding: '1.5rem',
              borderRadius: '0.5rem',
              border: currentThemeStyles.quickActionBorder,
              backdropFilter: 'blur(8px)'
            }}>
              <h3 style={{ color: currentThemeStyles.textPrimary, marginBottom: '1rem', fontWeight: 'bold' }}>Alerts & Notifications</h3>
              <div style={{ 
                color: currentThemeStyles.textMuted, 
                textAlign: 'center', 
                padding: '2rem 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircleIcon width={32} height={32} color="#10b981" />
                <div>No active alerts</div>
                <div style={{ fontSize: '0.75rem' }}>Your fleet is operating normally</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
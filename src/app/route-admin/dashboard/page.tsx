// src/app/route-admin/dashboard/page.tsx - Enhanced Route Admin Dashboard
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapIcon,
  TruckIcon,
  UserIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CpuChipIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import AnimatedBackground from '@/app/sysadmin/components/AnimatedBackground'; // IMPORT THE ANIMATED BACKGROUND

interface Route {
  _id: string;
  routeId: string;
  name: string;
  startLocation: { name: string; address: string };
  endLocation: { name: string; address: string };
  distance: number;
  estimatedDuration: number;
  vehicleInfo: {
    type: string;
    capacity: number;
  };
  pricing: {
    basePrice: number;
    pricePerKm: number;
  };
}

interface Assignment {
  _id: string;
  vehicleId: {
    _id: string;
    vehicleNumber: string;
    vehicleType: string;
    status: string;
  };
  fleetId: {
    _id: string;
    companyName: string;
    contactNumber: string;
  };
  status: string;
  assignedAt: string;
}

interface DashboardStats {
  assignedRoute: {
    name: string;
    routeId: string;
    distance: number;
    estimatedDuration: number;
  };
  vehicles: {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
  };
  fleets: {
    total: number;
    details: Array<{
      _id: string;
      companyName: string;
      vehicleCount: number;
      activeVehicles: number;
    }>;
  };
  performance: {
    totalTrips: number;
    totalRevenue: number;
    avgRating: number;
  };
}

// Mock data for fallback
const mockRoute: Route = {
  _id: '64b5f1c2a3d4e5f6g7h8i9j0',
  routeId: 'RT-COL-KDY-001',
  name: 'Colombo - Kandy Express',
  startLocation: { 
    name: 'Colombo Fort Railway Station', 
    address: 'Fort, Colombo 01, Sri Lanka' 
  },
  endLocation: { 
    name: 'Kandy Railway Station', 
    address: 'Railway Station Rd, Kandy 20000, Sri Lanka' 
  },
  distance: 116,
  estimatedDuration: 180,
  vehicleInfo: {
    type: 'luxury_bus',
    capacity: 45
  },
  pricing: {
    basePrice: 850,
    pricePerKm: 12.50
  }
};

const mockAssignments: Assignment[] = [
  {
    _id: '1',
    vehicleId: { _id: 'v1', vehicleNumber: 'NC-2847', vehicleType: 'luxury_bus', status: 'online' },
    fleetId: { _id: 'f1', companyName: 'Ceylon Express Pvt Ltd', contactNumber: '+94771234567' },
    status: 'active',
    assignedAt: new Date().toISOString()
  },
  {
    _id: '2',
    vehicleId: { _id: 'v2', vehicleNumber: 'WP-4523', vehicleType: 'semi_luxury', status: 'online' },
    fleetId: { _id: 'f2', companyName: 'Golden Route Tours', contactNumber: '+94771234568' },
    status: 'active',
    assignedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    _id: '3',
    vehicleId: { _id: 'v3', vehicleNumber: 'CP-7891', vehicleType: 'luxury_bus', status: 'maintenance' },
    fleetId: { _id: 'f3', companyName: 'Mountain View Transport', contactNumber: '+94771234569' },
    status: 'inactive',
    assignedAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    _id: '4',
    vehicleId: { _id: 'v4', vehicleNumber: 'KY-3456', vehicleType: 'semi_luxury', status: 'offline' },
    fleetId: { _id: 'f4', companyName: 'Hill Country Express', contactNumber: '+94771234570' },
    status: 'active',
    assignedAt: new Date(Date.now() - 259200000).toISOString()
  }
];

const mockStats: DashboardStats = {
  assignedRoute: {
    name: 'Colombo - Kandy Express',
    routeId: 'RT-COL-KDY-001',
    distance: 116,
    estimatedDuration: 180
  },
  vehicles: {
    total: 12,
    active: 9,
    inactive: 2,
    suspended: 1
  },
  fleets: {
    total: 6,
    details: [
      { _id: 'f1', companyName: 'Ceylon Express Pvt Ltd', vehicleCount: 3, activeVehicles: 3 },
      { _id: 'f2', companyName: 'Golden Route Tours', vehicleCount: 2, activeVehicles: 2 },
      { _id: 'f3', companyName: 'Mountain View Transport', vehicleCount: 2, activeVehicles: 1 },
      { _id: 'f4', companyName: 'Hill Country Express', vehicleCount: 3, activeVehicles: 2 },
      { _id: 'f5', companyName: 'Scenic Lanka Tours', vehicleCount: 1, activeVehicles: 1 },
      { _id: 'f6', companyName: 'Express Line Buses', vehicleCount: 1, activeVehicles: 0 }
    ]
  },
  performance: {
    totalTrips: 1247,
    totalRevenue: 2847650,
    avgRating: 4.6
  }
};

export default function RouteAdminDashboard() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [hasAssignedRoute, setHasAssignedRoute] = useState(false);
  const [assignedRoute, setAssignedRoute] = useState<Route | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/route-admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load dashboard');
      }

      const data = await response.json();

      setHasAssignedRoute(data.hasAssignedRoute);
      if (data.hasAssignedRoute) {
        setAssignedRoute(data.assignedRoute);
        setAssignments(data.assignments || []);
        setStats(data.stats);
        setUsingMockData(false);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      
      // Use mock data as fallback
      setHasAssignedRoute(true);
      setAssignedRoute(mockRoute);
      setAssignments(mockAssignments);
      setStats(mockStats);
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  // Theme definitions
  const lightTheme = {
    mainBg: '#fffbeb',
    bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)',
    glassPanelBg: 'rgba(255, 255, 255, 0.92)',
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)',
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)',
    textPrimary: '#1f2937',
    textSecondary: '#4B5563',
    textMuted: '#6B7280',
    cardBg: 'rgba(249, 250, 251, 0.8)',
    cardBorder: '1px solid rgba(209, 213, 219, 0.5)',
    navBg: 'rgba(30, 41, 59, 0.92)'
  };

  const darkTheme = {
    mainBg: '#0f172a',
    bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)',
    glassPanelBg: 'rgba(30, 41, 59, 0.8)',
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)',
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    cardBg: 'rgba(51, 65, 85, 0.8)',
    cardBorder: '1px solid rgba(75, 85, 99, 0.5)',
    navBg: 'rgba(30, 41, 59, 0.92)'
  };

  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  // Animation styles
  const animationStyles = `
    @keyframes fade-in-up { 
      from { opacity: 0; transform: translateY(20px); } 
      to { opacity: 1; transform: translateY(0); } 
    }
    .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
    @keyframes pulse-glow { 
      0%, 100% { box-shadow: 0 0 15px rgba(59, 130, 246, 0.3); } 
      50% { box-shadow: 0 0 25px rgba(59, 130, 246, 0.5); } 
    }
    .pulse-glow { animation: pulse-glow 2s infinite; }
  `;

  const formatCurrency = (amount: number) => `LKR ${amount.toFixed(2)}`;
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div style={{ 
        backgroundColor: currentThemeStyles.mainBg, 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative'
      }}>
        <AnimatedBackground currentThemeStyles={currentThemeStyles} />
        <div style={{ textAlign: 'center', color: currentThemeStyles.textPrimary, position: 'relative', zIndex: 10 }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>Loading dashboard...</p>
        </div>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!hasAssignedRoute || (error && !usingMockData)) {
    return (
      <div style={{ 
        backgroundColor: currentThemeStyles.mainBg, 
        minHeight: '100vh',
        position: 'relative'
      }}>
        <AnimatedBackground currentThemeStyles={currentThemeStyles} />
        <div style={{ padding: '2rem', position: 'relative', zIndex: 10 }}>
          <div style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            border: currentThemeStyles.glassPanelBorder,
            borderRadius: '0.75rem',
            padding: '2rem',
            textAlign: 'center',
            backdropFilter: 'blur(12px)',
            boxShadow: currentThemeStyles.glassPanelShadow
          }}>
            <ExclamationTriangleIcon width={48} height={48} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              No Route Assigned
            </h2>
            <p style={{ color: currentThemeStyles.textSecondary, marginBottom: '1rem' }}>
              {error || 'You have not been assigned to manage any route yet.'}
            </p>
            <p style={{ color: currentThemeStyles.textMuted, fontSize: '0.875rem' }}>
              Please contact the system administrator to have a route assigned to you.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <style jsx>{animationStyles}</style>
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />

      {/* Navigation */}
      <nav style={{ 
        backgroundColor: currentThemeStyles.navBg, 
        backdropFilter: 'blur(12px)', 
        borderBottom: currentThemeStyles.glassPanelBorder, 
        padding: '1rem 0',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <MapIcon width={32} height={32} color="#8b5cf6" />
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>
                Route Administration
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>
                Route Management Dashboard
                {usingMockData && <span style={{ color: '#f59e0b', marginLeft: '0.5rem' }}>⚠ Using demo data</span>}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <ThemeSwitcher />
            <div style={{ position: 'relative' }}>
              <BellIcon width={20} height={20} color="#F59E0B" />
              <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '16px', height: '16px', backgroundColor: '#ef4444', borderRadius: '50%', fontSize: '0.625rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</div>
            </div>
            <div style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}>ROUTE ADMIN</div>
          </div>
        </div>
      </nav>

      <div style={{ padding: '2rem', position: 'relative', zIndex: 10 }}>
        {/* Welcome Header */}
        <div className="animate-fade-in-up" style={{
          backgroundColor: currentThemeStyles.glassPanelBg,
          padding: '2rem',
          borderRadius: '0.75rem',
          border: currentThemeStyles.glassPanelBorder,
          marginBottom: '2rem',
          backdropFilter: 'blur(12px)',
          boxShadow: currentThemeStyles.glassPanelShadow
        }}>
          <h1 style={{
            color: currentThemeStyles.textPrimary,
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem'
          }}>
            Welcome to Route Administration
          </h1>
          <p style={{ color: currentThemeStyles.textSecondary }}>
            Managing route: <strong style={{ color: '#8b5cf6' }}>{assignedRoute?.name}</strong>
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {[
            { label: 'Route Distance', value: `${assignedRoute?.distance} km`, icon: MapIcon, color: '#3b82f6' },
            { label: 'Assigned Vehicles', value: stats?.vehicles.total || 0, icon: TruckIcon, color: '#10b981' },
            { label: 'Active Vehicles', value: stats?.vehicles.active || 0, icon: CheckCircleIcon, color: '#059669' },
            { label: 'Partner Fleets', value: stats?.fleets.total || 0, icon: BuildingOfficeIcon, color: '#8b5cf6' }
          ].map((metric, index) => (
            <div key={metric.label} className="animate-fade-in-up" style={{
              backgroundColor: currentThemeStyles.glassPanelBg,
              padding: '1.5rem',
              borderRadius: '0.75rem',
              border: currentThemeStyles.glassPanelBorder,
              backdropFilter: 'blur(12px)',
              boxShadow: currentThemeStyles.glassPanelShadow,
              animationDelay: `${index * 0.1}s`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <metric.icon width={32} height={32} color={metric.color} />
                <div>
                  <h3 style={{ color: metric.color, fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                    {metric.value}
                  </h3>
                  <p style={{ color: currentThemeStyles.textSecondary, margin: '0.25rem 0 0 0' }}>{metric.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Route Details & Recent Assignments */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Route Details */}
          <div className="animate-fade-in-up" style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            padding: '2rem',
            borderRadius: '0.75rem',
            border: currentThemeStyles.glassPanelBorder,
            backdropFilter: 'blur(12px)',
            boxShadow: currentThemeStyles.glassPanelShadow
          }}>
            <h2 style={{
              color: currentThemeStyles.textPrimary,
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <MapIcon width={20} height={20} color="#8b5cf6" />
              Route Details
            </h2>

            {assignedRoute && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <span style={{ color: currentThemeStyles.textMuted, fontSize: '0.875rem' }}>Route ID:</span>
                  <p style={{ color: currentThemeStyles.textPrimary, margin: '0.25rem 0 0 0' }}>{assignedRoute.routeId}</p>
                </div>

                <div>
                  <span style={{ color: currentThemeStyles.textMuted, fontSize: '0.875rem' }}>From:</span>
                  <p style={{ color: currentThemeStyles.textPrimary, margin: '0.25rem 0 0 0' }}>{assignedRoute.startLocation.name}</p>
                </div>

                <div>
                  <span style={{ color: currentThemeStyles.textMuted, fontSize: '0.875rem' }}>To:</span>
                  <p style={{ color: currentThemeStyles.textPrimary, margin: '0.25rem 0 0 0' }}>{assignedRoute.endLocation.name}</p>
                </div>

                <div>
                  <span style={{ color: currentThemeStyles.textMuted, fontSize: '0.875rem' }}>Duration:</span>
                  <p style={{ color: currentThemeStyles.textPrimary, margin: '0.25rem 0 0 0' }}>{formatDuration(assignedRoute.estimatedDuration)}</p>
                </div>

                <div>
                  <span style={{ color: currentThemeStyles.textMuted, fontSize: '0.875rem' }}>Vehicle Type:</span>
                  <p style={{ color: currentThemeStyles.textPrimary, margin: '0.25rem 0 0 0', textTransform: 'capitalize' }}>
                    {assignedRoute.vehicleInfo.type.replace('_', ' ')} ({assignedRoute.vehicleInfo.capacity} seats)
                  </p>
                </div>

                <div>
                  <span style={{ color: currentThemeStyles.textMuted, fontSize: '0.875rem' }}>Base Price:</span>
                  <p style={{ color: currentThemeStyles.textPrimary, margin: '0.25rem 0 0 0' }}>
                    {formatCurrency(assignedRoute.pricing.basePrice)} + {formatCurrency(assignedRoute.pricing.pricePerKm)}/km
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Recent Vehicle Assignments */}
          <div className="animate-fade-in-up" style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            padding: '2rem',
            borderRadius: '0.75rem',
            border: currentThemeStyles.glassPanelBorder,
            backdropFilter: 'blur(12px)',
            boxShadow: currentThemeStyles.glassPanelShadow,
            animationDelay: '0.2s'
          }}>
            <h2 style={{
              color: currentThemeStyles.textPrimary,
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <TruckIcon width={20} height={20} color="#10b981" />
              Recent Vehicle Assignments
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {assignments.length > 0 ? (
                assignments.slice(0, 5).map((assignment, index) => (
                  <div key={assignment._id} style={{
                    backgroundColor: currentThemeStyles.cardBg,
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: currentThemeStyles.cardBorder,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    animation: `fade-in-up 0.5s ease-out ${index * 0.1}s both`
                  }}>
                    <div>
                      <p style={{ color: currentThemeStyles.textPrimary, fontWeight: '500', margin: 0 }}>
                        {assignment.vehicleId.vehicleNumber}
                      </p>
                      <p style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                        Fleet: {assignment.fleetId.companyName}
                      </p>
                    </div>
                    <div style={{
                      backgroundColor: assignment.vehicleId.status === 'online' ? '#059669' : assignment.vehicleId.status === 'maintenance' ? '#f59e0b' : '#6b7280',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {assignment.vehicleId.status}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: currentThemeStyles.textSecondary, textAlign: 'center', padding: '2rem' }}>
                  No vehicles assigned yet
                </p>
              )}
            </div>

            {assignments.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <Link href="/route-admin/vehicles" style={{
                  color: '#8b5cf6',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  View all assignments →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="animate-fade-in-up" style={{
          backgroundColor: currentThemeStyles.glassPanelBg,
          padding: '2rem',
          borderRadius: '0.75rem',
          border: currentThemeStyles.glassPanelBorder,
          backdropFilter: 'blur(12px)',
          boxShadow: currentThemeStyles.glassPanelShadow,
          animationDelay: '0.4s'
        }}>
          <h2 style={{
            color: currentThemeStyles.textPrimary,
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem'
          }}>
            Quick Actions
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            {[
              { name: 'Manage Vehicles', href: '/route-admin/vehicles', icon: TruckIcon, color: '#10b981', desc: 'Assign or remove vehicles' },
              { name: 'View Analytics', href: '/route-admin/analytics', icon: ChartBarIcon, color: '#3b82f6', desc: 'Route performance data' },
              { name: 'Manage Schedules', href: '/route-admin/schedules', icon: ClockIcon, color: '#f59e0b', desc: 'Update route schedules' },
              { name: 'Profile Settings', href: '/route-admin/profile', icon: UserIcon, color: '#8b5cf6', desc: 'Update your profile' }
            ].map((action, index) => (
              <Link key={action.name} href={action.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  backgroundColor: currentThemeStyles.cardBg,
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  border: currentThemeStyles.cardBorder,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  animation: `fade-in-up 0.5s ease-out ${index * 0.1}s both`
                }}>
                  <action.icon width={24} height={24} color={action.color} />
                  <div>
                    <h3 style={{ color: currentThemeStyles.textPrimary, margin: 0, fontSize: '1rem' }}>{action.name}</h3>
                    <p style={{ color: currentThemeStyles.textSecondary, margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                      {action.desc}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        {stats?.performance && (
          <div className="animate-fade-in-up" style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            padding: '2rem',
            borderRadius: '0.75rem',
            border: currentThemeStyles.glassPanelBorder,
            backdropFilter: 'blur(12px)',
            boxShadow: currentThemeStyles.glassPanelShadow,
            marginTop: '2rem',
            animationDelay: '0.6s'
          }}>
            <h2 style={{
              color: currentThemeStyles.textPrimary,
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <ChartBarIcon width={20} height={20} color="#3b82f6" />
              Performance Summary
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#3b82f6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {stats.performance.totalTrips.toLocaleString()}
                </h3>
                <p style={{ color: currentThemeStyles.textSecondary, margin: '0.5rem 0 0 0' }}>Total Trips</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#10b981', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {formatCurrency(stats.performance.totalRevenue)}
                </h3>
                <p style={{ color: currentThemeStyles.textSecondary, margin: '0.5rem 0 0 0' }}>Total Revenue</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {stats.performance.avgRating.toFixed(1)} ⭐
                </h3>
                <p style={{ color: currentThemeStyles.textSecondary, margin: '0.5rem 0 0 0' }}>Average Rating</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
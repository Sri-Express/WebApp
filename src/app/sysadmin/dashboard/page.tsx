// src/app/sysadmin/dashboard/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  UsersIcon, 
  DevicePhoneMobileIcon, 
  TruckIcon, 
  CpuChipIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ServerIcon,
  ArrowPathIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalDevices: number;
  activeDevices: number;
  offlineDevices: number;
  maintenanceDevices: number;
  totalAlerts: number;
  totalTrips: number;
  todayTrips: number;
  systemUptime: number;
  apiRequests: number;
  errorRate: number;
  recentActivity: {
    newUsers: number;
    newTrips: number;
  };
  usersByRole: Record<string, number>;
  devicesByStatus: {
    online: number;
    offline: number;
    maintenance: number;
  };
}

interface FleetStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  suspended: number;
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: string;
  title: string;
  message: string;
  device?: {
    id: string;
    deviceId: string;
    vehicleNumber: string;
  };
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
}

interface AlertsResponse {
  alerts: SystemAlert[];
  summary: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
}

interface User {
  name: string;
  email: string;
  role: string;
  _id?: string;
}

export default function SystemAdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [fleetStats, setFleetStats] = useState<FleetStats | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [alertsSummary, setAlertsSummary] = useState<AlertsResponse['summary'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // Get auth token - wrapped in useCallback
  const getAuthToken = useCallback(() => {
    return localStorage.getItem('token');
  }, []);

  // Fetch system stats - wrapped in useCallback
  const fetchSystemStats = useCallback(async () => {
    const token = getAuthToken();
    if (!token) throw new Error('No auth token');

    const response = await fetch(`${API_BASE_URL}/admin/system/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }, [API_BASE_URL, getAuthToken]);

  // Fetch fleet stats - wrapped in useCallback
  const fetchFleetStats = useCallback(async () => {
    const token = getAuthToken();
    if (!token) throw new Error('No auth token');

    const response = await fetch(`${API_BASE_URL}/admin/fleet/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }, [API_BASE_URL, getAuthToken]);

  // Fetch system alerts - wrapped in useCallback
  const fetchSystemAlerts = useCallback(async () => {
    const token = getAuthToken();
    if (!token) throw new Error('No auth token');

    const response = await fetch(`${API_BASE_URL}/admin/system/alerts`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }, [API_BASE_URL, getAuthToken]);

  // Load all dashboard data - now includes all dependencies
  const loadDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);

    try {
      // Check if user is system admin
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'system_admin') {
          router.push('/sysadmin/login');
          return;
        }
        setUser(parsedUser);
      } else {
        router.push('/sysadmin/login');
        return;
      }

      // Fetch all data in parallel
      const [systemStatsData, fleetStatsData, alertsData] = await Promise.all([
        fetchSystemStats(),
        fetchFleetStats().catch(() => ({ total: 0, approved: 0, pending: 0, rejected: 0, suspended: 0 })), // Fallback for fleet stats
        fetchSystemAlerts()
      ]);

      setStats(systemStatsData);
      setFleetStats(fleetStatsData);
      setAlerts(alertsData.alerts || []);
      setAlertsSummary(alertsData.summary || { total: 0, high: 0, medium: 0, low: 0 });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router, fetchSystemStats, fetchFleetStats, fetchSystemAlerts]);

  // Initial load
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, loadDashboardData]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/sysadmin/login');
  };

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  const quickActions = [
    {
      name: 'User Management',
      description: 'Create and manage users',
      href: '/sysadmin/users',
      icon: UsersIcon,
      color: '#3b82f6',
      count: stats?.totalUsers
    },
    {
      name: 'Device Management',
      description: 'Monitor and control devices',
      href: '/sysadmin/devices',
      icon: DevicePhoneMobileIcon,
      color: '#10b981',
      count: stats?.activeDevices
    },
    {
      name: 'Fleet Approvals',
      description: 'Review fleet registrations',
      href: '/sysadmin/fleet',
      icon: TruckIcon,
      color: '#f59e0b',
      count: fleetStats?.pending || 0,
      urgent: (fleetStats?.pending || 0) > 0
    },
    {
      name: 'AI Module',
      description: 'Control AI systems',
      href: '/sysadmin/ai',
      icon: CpuChipIcon,
      color: '#8b5cf6'
    },
    {
      name: 'System Analytics',
      description: 'View system metrics',
      href: '/sysadmin/analytics',
      icon: ChartBarIcon,
      color: '#ef4444'
    },
    {
      name: 'Global Map',
      description: 'View all vehicles',
      href: '/sysadmin/devices/monitor',
      icon: GlobeAltIcon,
      color: '#06b6d4'
    }
  ];

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const formatUptime = (uptime: number | undefined) => {
    if (uptime === undefined || uptime === null || isNaN(uptime)) {
      return '---';
    }
    return `${uptime.toFixed(1)}%`;
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null || isNaN(num)) {
      return '---';
    }
    return num.toLocaleString();
  };

  if (loading && !stats) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#f1f5f9'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <ArrowPathIcon width={32} height={32} className="animate-spin" />
          <div>Loading system dashboard...</div>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#f1f5f9'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          backgroundColor: '#1e293b',
          borderRadius: '0.75rem',
          border: '1px solid #ef4444'
        }}>
          <ExclamationTriangleIcon width={48} height={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Failed to Load Dashboard</h2>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>{error}</p>
          <button
            onClick={() => loadDashboardData()}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
      {/* Navigation */}
      <nav style={{
        backgroundColor: '#1e293b',
        borderBottom: '1px solid #334155',
        padding: '1rem 0'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <ShieldCheckIcon width={32} height={32} color="#dc2626" />
            <div>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#f1f5f9',
                margin: 0
              }}>
                System Administration
              </h1>
              <p style={{
                fontSize: '0.875rem',
                color: '#94a3b8',
                margin: 0
              }}>
                Central Management Console
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Auto Refresh Toggle */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#94a3b8',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                style={{ accentColor: '#3b82f6' }}
              />
              Auto Refresh
            </label>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                backgroundColor: '#374151',
                color: '#f9fafb',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                opacity: refreshing ? 0.7 : 1
              }}
            >
              <ArrowPathIcon 
                width={16} 
                height={16} 
                style={{ 
                  animation: refreshing ? 'spin 1s linear infinite' : 'none'
                }} 
              />
            </button>

            <div style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }}>
              SUPERUSER
            </div>
            <span style={{ color: '#94a3b8' }}>Welcome, {user?.name || 'Administrator'}</span>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: '#374151',
                color: '#f9fafb',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>
        {/* System Status Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
              <UsersIcon width={32} height={32} color="#3b82f6" />
              <div>
                <h3 style={{ color: '#3b82f6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {formatNumber(stats?.totalUsers)}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Total Users</p>
                {stats && (
                  <p style={{ color: '#10b981', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                    {formatNumber(stats.activeUsers)} active • {formatNumber(stats.recentActivity.newUsers)} new this week
                  </p>
                )}
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
              <DevicePhoneMobileIcon width={32} height={32} color="#10b981" />
              <div>
                <h3 style={{ color: '#10b981', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {formatNumber(stats?.activeDevices)}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Active Devices</p>
                {stats && (
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                    {formatNumber(stats.offlineDevices)} offline • {formatNumber(stats.maintenanceDevices)} maintenance
                  </p>
                )}
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
              <TruckIcon width={32} height={32} color="#f59e0b" />
              <div>
                <h3 style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {formatNumber(fleetStats?.total)}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Fleet Companies</p>
                {fleetStats && (
                  <p style={{ 
                    color: (fleetStats.pending || 0) > 0 ? '#f59e0b' : '#94a3b8', 
                    fontSize: '0.875rem', 
                    margin: '0.25rem 0 0 0' 
                  }}>
                    {formatNumber(fleetStats.approved)} approved • {formatNumber(fleetStats.pending)} pending
                  </p>
                )}
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
              <ServerIcon width={32} height={32} color="#8b5cf6" />
              <div>
                <h3 style={{ color: '#8b5cf6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {formatUptime(stats?.systemUptime)}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>System Uptime</p>
                {stats && (
                  <p style={{ 
                    color: stats.errorRate < 1 ? '#10b981' : '#f59e0b', 
                    fontSize: '0.875rem', 
                    margin: '0.25rem 0 0 0' 
                  }}>
                    {stats.errorRate}% error rate
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Status Bar */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <ExclamationTriangleIcon width={20} height={20} color="#dc2626" />
            <span style={{ color: '#dc2626' }}>
              Some data may be outdated due to connection issues. Last successful update: {stats ? 'Just now' : 'Unknown'}
            </span>
          </div>
        )}

        {/* Quick Actions */}
        <div style={{
          backgroundColor: '#1e293b',
          padding: '2rem',
          borderRadius: '0.75rem',
          border: '1px solid #334155',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            color: '#f1f5f9',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem'
          }}>
            Quick Actions
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {quickActions.map((action) => (
              <Link
                key={action.name}
                href={action.href}
                style={{
                  backgroundColor: '#334155',
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  border: action.urgent ? '1px solid #f59e0b' : '1px solid #475569',
                  transition: 'all 0.2s',
                  display: 'block',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <action.icon width={24} height={24} color={action.color} />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      color: '#f1f5f9', 
                      fontSize: '1.1rem', 
                      fontWeight: '600',
                      margin: 0
                    }}>
                      {action.name}
                    </h3>
                    <p style={{ 
                      color: '#94a3b8', 
                      fontSize: '0.875rem',
                      margin: '0.25rem 0 0 0'
                    }}>
                      {action.description}
                    </p>
                  </div>
                  {action.count !== undefined && (
                    <div style={{
                      backgroundColor: action.urgent ? '#f59e0b' : action.color,
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem',
                      fontWeight: 'bold'
                    }}>
                      {formatNumber(action.count)}
                    </div>
                  )}
                </div>
                {action.urgent && (
                  <div style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#f59e0b',
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                  }} />
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* System Alerts */}
        <div style={{
          backgroundColor: '#1e293b',
          padding: '2rem',
          borderRadius: '0.75rem',
          border: '1px solid #334155'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <ExclamationTriangleIcon width={24} height={24} color="#f59e0b" />
              <h2 style={{
                color: '#f1f5f9',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                margin: 0
              }}>
                System Alerts
              </h2>
            </div>
            
            {alertsSummary && (
              <div style={{
                display: 'flex',
                gap: '1rem',
                fontSize: '0.875rem'
              }}>
                <span style={{ color: '#ef4444' }}>
                  {alertsSummary.high} High
                </span>
                <span style={{ color: '#f59e0b' }}>
                  {alertsSummary.medium} Medium
                </span>
                <span style={{ color: '#3b82f6' }}>
                  {alertsSummary.low} Low
                </span>
              </div>
            )}
          </div>
          
          {alerts.length > 0 ? (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} style={{
                  backgroundColor: '#334155',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  borderLeft: `4px solid ${getAlertColor(alert.type)}`
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        color: '#f1f5f9',
                        margin: 0,
                        fontWeight: '500'
                      }}>
                        {alert.title}
                      </p>
                      <p style={{
                        color: '#94a3b8',
                        fontSize: '0.875rem',
                        margin: '0.25rem 0',
                        lineHeight: '1.4'
                      }}>
                        {alert.message}
                      </p>
                      <div style={{
                        display: 'flex',
                        gap: '1rem',
                        fontSize: '0.75rem',
                        color: '#64748b'
                      }}>
                        <span>Category: {alert.category}</span>
                        {alert.device && (
                          <span>Device: {alert.device.vehicleNumber}</span>
                        )}
                        <span>{new Date(alert.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    <div style={{
                      backgroundColor: getAlertColor(alert.type),
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      marginLeft: '1rem'
                    }}>
                      {alert.priority}
                    </div>
                  </div>
                </div>
              ))}
              
              {alerts.length > 5 && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <Link 
                    href="/sysadmin/health"
                    style={{
                      color: '#3b82f6',
                      textDecoration: 'none',
                      fontSize: '0.875rem'
                    }}
                  >
                    View all {alerts.length} alerts →
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem',
              color: '#94a3b8' 
            }}>
              <CheckCircleIcon width={48} height={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
              <p style={{ margin: 0 }}>No active alerts - All systems operational</p>
            </div>
          )}
        </div>

        {/* Last Updated */}
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          color: '#64748b',
          fontSize: '0.875rem'
        }}>
          Last updated: {new Date().toLocaleString()}
          {refreshing && (
            <span style={{ marginLeft: '0.5rem', color: '#3b82f6' }}>
              • Refreshing...
            </span>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

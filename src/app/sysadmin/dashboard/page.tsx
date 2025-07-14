// src/app/sysadmin/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react';
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
  ServerIcon
} from '@heroicons/react/24/outline';

interface SystemStats {
  totalUsers: number;
  activeDevices: number;
  totalFleets: number;
  systemUptime: number;
  apiRequests: number;
  errorRate: number;
  activeRoutes: number;
  pendingApprovals: number;
}

export default function SystemAdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);

  // Get auth token
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // API call helper
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken();
    if (!token) {
      router.push('/sysadmin/login');
      return null;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
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
          router.push('/sysadmin/login');
          return null;
        }
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call error:', error);
      return null;
    }
  };

  // Load dashboard data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
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
        }

        // Load system stats (mock data for now)
        const mockStats: SystemStats = {
          totalUsers: 1547,
          activeDevices: 89,
          totalFleets: 12,
          systemUptime: 99.8,
          apiRequests: 245780,
          errorRate: 0.2,
          activeRoutes: 156,
          pendingApprovals: 3
        };
        setStats(mockStats);

        // Load alerts (mock data)
        const mockAlerts = [
          {
            id: 1,
            type: 'warning',
            message: 'High API usage detected - 90% of rate limit',
            timestamp: new Date(Date.now() - 300000).toISOString()
          },
          {
            id: 2,
            type: 'info',
            message: 'Fleet registration pending approval',
            timestamp: new Date(Date.now() - 1800000).toISOString()
          },
          {
            id: 3,
            type: 'error',
            message: 'Device offline: Bus #LK-4567',
            timestamp: new Date(Date.now() - 3600000).toISOString()
          }
        ];
        setAlerts(mockAlerts);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/sysadmin/login');
  };

  const quickActions = [
    {
      name: 'User Management',
      description: 'Create and manage users',
      href: '/sysadmin/users',
      icon: UsersIcon,
      color: '#3b82f6'
    },
    {
      name: 'Device Management',
      description: 'Monitor and control devices',
      href: '/sysadmin/devices',
      icon: DevicePhoneMobileIcon,
      color: '#10b981'
    },
    {
      name: 'Fleet Approvals',
      description: 'Review fleet registrations',
      href: '/sysadmin/fleet',
      icon: TruckIcon,
      color: '#f59e0b'
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
      href: '/sysadmin/map',
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

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(1)}%`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
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
        <div>Loading system dashboard...</div>
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
                  {stats ? formatNumber(stats.totalUsers) : '0'}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Total Users</p>
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
                  {stats ? formatNumber(stats.activeDevices) : '0'}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Active Devices</p>
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
                  {stats ? formatNumber(stats.totalFleets) : '0'}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Fleet Companies</p>
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
                  {stats ? formatUptime(stats.systemUptime) : '0%'}
                </h3>
                <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>System Uptime</p>
              </div>
            </div>
          </div>
        </div>

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
                  border: '1px solid #475569',
                  transition: 'all 0.2s',
                  display: 'block'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <action.icon width={24} height={24} color={action.color} />
                  <div>
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
                </div>
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
            gap: '1rem',
            marginBottom: '1.5rem'
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
          
          {alerts.length > 0 ? (
            alerts.map((alert) => (
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
                  alignItems: 'center'
                }}>
                  <div>
                    <p style={{
                      color: '#f1f5f9',
                      margin: 0,
                      fontWeight: '500'
                    }}>
                      {alert.message}
                    </p>
                    <p style={{
                      color: '#94a3b8',
                      fontSize: '0.875rem',
                      margin: '0.25rem 0 0 0'
                    }}>
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div style={{
                    backgroundColor: getAlertColor(alert.type),
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase' as const
                  }}>
                    {alert.type}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#94a3b8' }}>No active alerts</p>
          )}
        </div>
      </div>
    </div>
  );
}
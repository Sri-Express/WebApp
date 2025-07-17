// src/app/sysadmin/users/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  ChatBubbleLeftRightIcon,
  TruckIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'client' | 'customer_service' | 'route_admin' | 'company_admin' | 'system_admin';
  phone?: string;
  department?: string;
  company?: string;
  permissions?: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserActivity {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

interface UserStats {
  totalLogins: number;
  devicesManaged?: number;
  ticketsHandled?: number;
  tripsBooked?: number;
  lastActiveDate: string;
}

export default function UserDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Load user details
        const userResponse = await apiCall(`/admin/users/${userId}`);
        if (userResponse) {
          setUser(userResponse);
        } else {
          setError('User not found');
          return;
        }

        // Mock user stats and activity (replace with real API calls)
        const mockStats: UserStats = {
          totalLogins: 47,
          devicesManaged: userResponse.role === 'route_admin' ? 12 : 
                          userResponse.role === 'company_admin' ? 25 : undefined,
          ticketsHandled: userResponse.role === 'customer_service' ? 156 : undefined,
          tripsBooked: userResponse.role === 'client' ? 23 : undefined,
          lastActiveDate: userResponse.lastLogin || userResponse.updatedAt
        };

        const mockActivity: UserActivity[] = [
          {
            id: '1',
            action: 'login',
            description: 'User logged in successfully',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          {
            id: '2',
            action: 'profile_update',
            description: 'Updated profile information',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            ipAddress: '192.168.1.100'
          },
          {
            id: '3',
            action: userResponse.role === 'client' ? 'trip_booking' : 
                   userResponse.role === 'customer_service' ? 'ticket_resolved' :
                   userResponse.role === 'route_admin' ? 'device_configured' : 'system_access',
            description: userResponse.role === 'client' ? 'Booked trip: Colombo to Kandy' :
                        userResponse.role === 'customer_service' ? 'Resolved support ticket #12345' :
                        userResponse.role === 'route_admin' ? 'Configured device DEV001' :
                        'Accessed system management panel',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            ipAddress: '192.168.1.100'
          },
          {
            id: '4',
            action: 'password_change',
            description: 'Changed account password',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            ipAddress: '192.168.1.100'
          }
        ];

        setUserStats(mockStats);
        setRecentActivity(mockActivity);
      } catch (err) {
        setError('Failed to load user details');
        console.error('Error loading user:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadUserData();
    }
  }, [userId]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'client':
        return <UserIcon width={20} height={20} />;
      case 'customer_service':
        return <ChatBubbleLeftRightIcon width={20} height={20} />;
      case 'route_admin':
        return <TruckIcon width={20} height={20} />;
      case 'company_admin':
        return <BuildingOfficeIcon width={20} height={20} />;
      case 'system_admin':
        return <ShieldCheckIcon width={20} height={20} />;
      default:
        return <UserIcon width={20} height={20} />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'client':
        return '#3b82f6';
      case 'customer_service':
        return '#10b981';
      case 'route_admin':
        return '#f59e0b';
      case 'company_admin':
        return '#8b5cf6';
      case 'system_admin':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'client':
        return 'Client';
      case 'customer_service':
        return 'Customer Service';
      case 'route_admin':
        return 'Route Administrator';
      case 'company_admin':
        return 'Company Administrator';
      case 'system_admin':
        return 'System Administrator';
      default:
        return 'Unknown';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login':
        return <CheckCircleIcon width={16} height={16} color="#10b981" />;
      case 'logout':
        return <XCircleIcon width={16} height={16} color="#6b7280" />;
      case 'profile_update':
        return <PencilIcon width={16} height={16} color="#3b82f6" />;
      case 'password_change':
        return <KeyIcon width={16} height={16} color="#f59e0b" />;
      case 'trip_booking':
        return <TruckIcon width={16} height={16} color="#06b6d4" />;
      case 'ticket_resolved':
        return <ChatBubbleLeftRightIcon width={16} height={16} color="#10b981" />;
      case 'device_configured':
        return <Cog6ToothIcon width={16} height={16} color="#8b5cf6" />;
      default:
        return <ClockIcon width={16} height={16} color="#94a3b8" />;
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    
    setActionLoading('toggle');
    try {
      await apiCall(`/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
      });
      
      // Update local state
      setUser(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
    } catch (error) {
      console.error('Error toggling user status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async () => {
    setActionLoading('delete');
    try {
      await apiCall(`/admin/users/${userId}`, {
        method: 'DELETE',
      });
      router.push('/sysadmin/users');
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setActionLoading(null);
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeSince = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
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
        <div>Loading user details...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#f1f5f9',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <ExclamationTriangleIcon width={48} height={48} color="#ef4444" />
        <div>{error || 'User not found'}</div>
        <Link
          href="/sysadmin/users"
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            textDecoration: 'none'
          }}
        >
          Back to Users
        </Link>
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
            <Link href="/sysadmin/users" style={{
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: '0.875rem'
            }}>
              ← Back to Users
            </Link>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ color: getRoleColor(user.role) }}>
                {getRoleIcon(user.role)}
              </span>
              <div>
                <h1 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#f1f5f9',
                  margin: 0
                }}>
                  {user.name}
                </h1>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#94a3b8',
                  margin: 0
                }}>
                  {getRoleLabel(user.role)}
                </p>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleToggleStatus}
              disabled={actionLoading === 'toggle'}
              style={{
                backgroundColor: user.isActive ? '#f59e0b' : '#10b981',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: actionLoading === 'toggle' ? 0.7 : 1
              }}
            >
              {user.isActive ? <XCircleIcon width={16} height={16} /> : <CheckCircleIcon width={16} height={16} />}
              {actionLoading === 'toggle' ? 'Updating...' : user.isActive ? 'Deactivate' : 'Activate'}
            </button>
            <Link
              href={`/sysadmin/users/${userId}/edit`}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <PencilIcon width={16} height={16} />
              Edit
            </Link>
            {user.role !== 'system_admin' && (
              <button
                onClick={() => setShowDeleteModal(true)}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <TrashIcon width={16} height={16} />
                Delete
              </button>
            )}
          </div>
        </div>
      </nav>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>
        {/* User Status */}
        <div style={{
          backgroundColor: '#1e293b',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          border: `1px solid ${user.isActive ? '#10b981' : '#ef4444'}`,
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <span style={{ color: user.isActive ? '#10b981' : '#ef4444' }}>
              {user.isActive ? <CheckCircleIcon width={32} height={32} /> : <XCircleIcon width={32} height={32} />}
            </span>
            <div>
              <h2 style={{
                color: '#f1f5f9',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                margin: 0
              }}>
                Account Status: {user.isActive ? 'Active' : 'Inactive'}
              </h2>
              <p style={{
                color: '#94a3b8',
                margin: '0.25rem 0 0 0'
              }}>
                {user.isActive ? 'User can access the system' : 'User is blocked from accessing the system'}
              </p>
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '2rem'
        }}>
          {/* User Information */}
          <div style={{
            backgroundColor: '#1e293b',
            padding: '2rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <h2 style={{
              color: '#f1f5f9',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <UserIcon width={20} height={20} />
              User Information
            </h2>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div>
                <label style={{
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  display: 'block',
                  marginBottom: '0.25rem'
                }}>
                  Full Name
                </label>
                <span style={{
                  color: '#f1f5f9',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}>
                  {user.name}
                </span>
              </div>

              <div>
                <label style={{
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  display: 'block',
                  marginBottom: '0.25rem'
                }}>
                  Email Address
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <EnvelopeIcon width={16} height={16} color="#94a3b8" />
                  <span style={{
                    color: '#f1f5f9',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}>
                    {user.email}
                  </span>
                </div>
              </div>

              {user.phone && (
                <div>
                  <label style={{
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    display: 'block',
                    marginBottom: '0.25rem'
                  }}>
                    Phone Number
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <PhoneIcon width={16} height={16} color="#94a3b8" />
                    <span style={{
                      color: '#f1f5f9',
                      fontSize: '1rem',
                      fontWeight: '500'
                    }}>
                      {user.phone}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label style={{
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  display: 'block',
                  marginBottom: '0.25rem'
                }}>
                  Role
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{ color: getRoleColor(user.role) }}>
                    {getRoleIcon(user.role)}
                  </span>
                  <span style={{
                    color: getRoleColor(user.role),
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>
              </div>

              {user.department && (
                <div>
                  <label style={{
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    display: 'block',
                    marginBottom: '0.25rem'
                  }}>
                    Department
                  </label>
                  <span style={{
                    color: '#f1f5f9',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}>
                    {user.department}
                  </span>
                </div>
              )}

              {user.company && (
                <div>
                  <label style={{
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    display: 'block',
                    marginBottom: '0.25rem'
                  }}>
                    Company
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <BuildingOfficeIcon width={16} height={16} color="#94a3b8" />
                    <span style={{
                      color: '#f1f5f9',
                      fontSize: '1rem',
                      fontWeight: '500'
                    }}>
                      {user.company}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label style={{
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  display: 'block',
                  marginBottom: '0.25rem'
                }}>
                  Account Created
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <CalendarIcon width={16} height={16} color="#94a3b8" />
                  <span style={{
                    color: '#f1f5f9',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}>
                    {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>

              {user.lastLogin && (
                <div>
                  <label style={{
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    display: 'block',
                    marginBottom: '0.25rem'
                  }}>
                    Last Login
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <ClockIcon width={16} height={16} color="#94a3b8" />
                    <span style={{
                      color: '#f1f5f9',
                      fontSize: '1rem',
                      fontWeight: '500'
                    }}>
                      {formatDateTime(user.lastLogin)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Statistics */}
          <div style={{
            backgroundColor: '#1e293b',
            padding: '2rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <h2 style={{
              color: '#f1f5f9',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <ChartBarIcon width={20} height={20} />
              Activity Statistics
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem'
            }}>
              <div style={{
                backgroundColor: '#334155',
                padding: '1rem',
                borderRadius: '0.5rem',
                textAlign: 'center'
              }}>
                <div style={{
                  color: '#3b82f6',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  marginBottom: '0.25rem'
                }}>
                  {userStats?.totalLogins}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                  Total Logins
                </div>
              </div>

              {userStats?.devicesManaged && (
                <div style={{
                  backgroundColor: '#334155',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  textAlign: 'center'
                }}>
                  <div style={{
                    color: '#10b981',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    marginBottom: '0.25rem'
                  }}>
                    {userStats.devicesManaged}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                    Devices Managed
                  </div>
                </div>
              )}

              {userStats?.ticketsHandled && (
                <div style={{
                  backgroundColor: '#334155',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  textAlign: 'center'
                }}>
                  <div style={{
                    color: '#f59e0b',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    marginBottom: '0.25rem'
                  }}>
                    {userStats.ticketsHandled}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                    Tickets Handled
                  </div>
                </div>
              )}

              {userStats?.tripsBooked && (
                <div style={{
                  backgroundColor: '#334155',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  textAlign: 'center'
                }}>
                  <div style={{
                    color: '#06b6d4',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    marginBottom: '0.25rem'
                  }}>
                    {userStats.tripsBooked}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                    Trips Booked
                  </div>
                </div>
              )}
            </div>

            <div style={{
              backgroundColor: '#334155',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginTop: '1rem'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                  Last Activity
                </span>
                <span style={{ color: '#f1f5f9', fontWeight: '500' }}>
                  {getTimeSince(userStats?.lastActiveDate || user.updatedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Permissions */}
          {user.permissions && user.permissions.length > 0 && (
            <div style={{
              backgroundColor: '#1e293b',
              padding: '2rem',
              borderRadius: '0.75rem',
              border: '1px solid #334155'
            }}>
              <h2 style={{
                color: '#f1f5f9',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <KeyIcon width={20} height={20} />
                Permissions
              </h2>

              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                {user.permissions.map((permission) => (
                  <span key={permission} style={{
                    backgroundColor: '#334155',
                    color: '#f1f5f9',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.875rem',
                    border: '1px solid #475569'
                  }}>
                    {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div style={{
            backgroundColor: '#1e293b',
            padding: '2rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <h2 style={{
              color: '#f1f5f9',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <ClockIcon width={20} height={20} />
              Recent Activity
            </h2>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {recentActivity.map((activity) => (
                <div key={activity.id} style={{
                  backgroundColor: '#334155',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  {getActionIcon(activity.action)}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      color: '#f1f5f9',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      marginBottom: '0.25rem'
                    }}>
                      {activity.description}
                    </div>
                    <div style={{
                      color: '#94a3b8',
                      fontSize: '0.75rem'
                    }}>
                      {getTimeSince(activity.timestamp)}
                      {activity.ipAddress && ` • ${activity.ipAddress}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Admin Note */}
        {user.role === 'system_admin' && (
          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #ef4444',
            marginTop: '2rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <ExclamationTriangleIcon width={20} height={20} color="#ef4444" />
              <h3 style={{
                color: '#f1f5f9',
                fontSize: '1rem',
                fontWeight: '600',
                margin: 0
              }}>
                System Administrator Account
              </h3>
            </div>
            <p style={{
              color: '#94a3b8',
              margin: 0,
              lineHeight: '1.5'
            }}>
              This is a system administrator account with full access to all system functions. 
              Deletion and deactivation require special authorization and cannot be performed through this interface.
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
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
            backgroundColor: '#1e293b',
            padding: '2rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{
              color: '#f1f5f9',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <ExclamationTriangleIcon width={24} height={24} color="#ef4444" />
              Confirm Delete User
            </h3>
            <p style={{
              color: '#94a3b8',
              marginBottom: '2rem',
              lineHeight: '1.5'
            }}>
              Are you sure you want to delete <strong>{user.name}</strong>? 
              This action cannot be undone and will permanently remove:
            </p>
            <ul style={{
              color: '#94a3b8',
              marginBottom: '2rem',
              paddingLeft: '1.5rem'
            }}>
              <li>User account and profile information</li>
              <li>All associated activity logs</li>
              <li>Access permissions and role assignments</li>
              {user.role === 'client' && <li>Trip booking history</li>}
              {user.role === 'route_admin' && <li>Device management assignments</li>}
            </ul>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  backgroundColor: '#374151',
                  color: '#f9fafb',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={actionLoading === 'delete'}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  opacity: actionLoading === 'delete' ? 0.7 : 1
                }}
              >
                {actionLoading === 'delete' ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// src/app/sysadmin/users/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  UsersIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  ShieldCheckIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  BuildingOfficeIcon,
  TruckIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'client' | 'customer_service' | 'route_admin' | 'company_admin' | 'system_admin';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  permissions?: string[];
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  byRole: {
    client: number;
    customer_service: number;
    route_admin: number;
    company_admin: number;
    system_admin: number;
  };
}

export default function SystemAdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

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

  // Load users data
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      
      try {
        // Mock data for now
        const mockUsers: User[] = [
          {
            _id: '1',
            name: 'Saman Perera',
            email: 'saman@example.com',
            role: 'client',
            isActive: true,
            createdAt: '2025-01-10T10:30:00Z',
            lastLogin: '2025-01-14T08:15:00Z'
          },
          {
            _id: '2',
            name: 'Chamila Silva',
            email: 'chamila@sriexpress.com',
            role: 'customer_service',
            isActive: true,
            createdAt: '2025-01-05T14:20:00Z',
            lastLogin: '2025-01-14T09:45:00Z'
          },
          {
            _id: '3',
            name: 'Kasun Fernando',
            email: 'kasun@sriexpress.com',
            role: 'route_admin',
            isActive: true,
            createdAt: '2025-01-01T09:00:00Z',
            lastLogin: '2025-01-14T07:30:00Z'
          },
          {
            _id: '4',
            name: 'Priyantha Transport',
            email: 'admin@priyantha.com',
            role: 'company_admin',
            isActive: true,
            createdAt: '2024-12-15T11:45:00Z',
            lastLogin: '2025-01-13T16:20:00Z'
          },
          {
            _id: '5',
            name: 'Nimal Rajapaksa',
            email: 'nimal@example.com',
            role: 'client',
            isActive: false,
            createdAt: '2025-01-08T13:15:00Z',
            lastLogin: '2025-01-12T12:00:00Z'
          }
        ];

        const mockStats: UserStats = {
          totalUsers: 1547,
          activeUsers: 1432,
          byRole: {
            client: 1398,
            customer_service: 12,
            route_admin: 45,
            company_admin: 8,
            system_admin: 3
          }
        };

        setUsers(mockUsers);
        setStats(mockStats);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'client':
        return <UserIcon width={20} height={20} />;
      case 'customer_service':
        return <ChatBubbleLeftRightIcon width={20} height={20} />;
      case 'route_admin':
        return <PhoneIcon width={20} height={20} />;
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
        return 'Route Admin';
      case 'company_admin':
        return 'Company Admin';
      case 'system_admin':
        return 'System Admin';
      default:
        return 'Unknown';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.isActive) ||
                         (filterStatus === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleDeleteUser = async (userId: string) => {
    // Implementation for user deletion
    console.log('Deleting user:', userId);
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleBulkAction = async (action: string) => {
    // Implementation for bulk actions
    console.log('Bulk action:', action, 'for users:', selectedUsers);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
        <div>Loading users...</div>
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
            <Link href="/sysadmin/dashboard" style={{
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: '0.875rem'
            }}>
              ← Dashboard
            </Link>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <UsersIcon width={24} height={24} color="#3b82f6" />
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#f1f5f9',
                margin: 0
              }}>
                User Management
              </h1>
            </div>
          </div>
          
          <Link
            href="/sysadmin/users/create"
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '500'
            }}
          >
            <PlusIcon width={20} height={20} />
            Create User
          </Link>
        </div>
      </nav>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>
        {/* Stats Cards */}
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
            <h3 style={{ color: '#3b82f6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
              {stats?.totalUsers.toLocaleString()}
            </h3>
            <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Total Users</p>
          </div>

          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <h3 style={{ color: '#10b981', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
              {stats?.activeUsers.toLocaleString()}
            </h3>
            <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Active Users</p>
          </div>

          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <h3 style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
              {stats?.byRole.client.toLocaleString()}
            </h3>
            <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Clients</p>
          </div>

          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }}>
            <h3 style={{ color: '#8b5cf6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
              {(stats?.byRole.customer_service || 0) + (stats?.byRole.route_admin || 0) + (stats?.byRole.company_admin || 0) + (stats?.byRole.system_admin || 0)}
            </h3>
            <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Administrators</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div style={{
          backgroundColor: '#1e293b',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          border: '1px solid #334155',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap' as const,
            gap: '1rem',
            alignItems: 'center'
          }}>
            {/* Search */}
            <div style={{
              position: 'relative' as const,
              flex: '1 1 300px'
            }}>
              <MagnifyingGlassIcon 
                width={20} 
                height={20} 
                color="#94a3b8" 
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 3rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #475569',
                  backgroundColor: '#334155',
                  color: '#f1f5f9',
                  fontSize: '1rem',
                  boxSizing: 'border-box' as const,
                  outline: 'none'
                }}
              />
            </div>

            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #475569',
                backgroundColor: '#334155',
                color: '#f1f5f9',
                fontSize: '1rem',
                outline: 'none'
              }}
            >
              <option value="all">All Roles</option>
              <option value="client">Client</option>
              <option value="customer_service">Customer Service</option>
              <option value="route_admin">Route Admin</option>
              <option value="company_admin">Company Admin</option>
              <option value="system_admin">System Admin</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #475569',
                backgroundColor: '#334155',
                color: '#f1f5f9',
                fontSize: '1rem',
                outline: 'none'
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '0.75rem',
          border: '1px solid #334155',
          overflow: 'hidden'
        }}>
          <div style={{
            overflowX: 'auto' as const
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse' as const
            }}>
              <thead>
                <tr style={{
                  backgroundColor: '#334155',
                  borderBottom: '1px solid #475569'
                }}>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left' as const,
                    color: '#f1f5f9',
                    fontWeight: '600'
                  }}>
                    <input type="checkbox" />
                  </th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left' as const,
                    color: '#f1f5f9',
                    fontWeight: '600'
                  }}>User</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left' as const,
                    color: '#f1f5f9',
                    fontWeight: '600'
                  }}>Role</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left' as const,
                    color: '#f1f5f9',
                    fontWeight: '600'
                  }}>Status</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left' as const,
                    color: '#f1f5f9',
                    fontWeight: '600'
                  }}>Created</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left' as const,
                    color: '#f1f5f9',
                    fontWeight: '600'
                  }}>Last Login</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left' as const,
                    color: '#f1f5f9',
                    fontWeight: '600'
                  }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user._id} style={{
                    borderBottom: index < filteredUsers.length - 1 ? '1px solid #334155' : 'none',
                    backgroundColor: index % 2 === 0 ? '#1e293b' : '#1a2332'
                  }}>
                    <td style={{ padding: '1rem' }}>
                      <input type="checkbox" />
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <div style={{
                          color: '#f1f5f9',
                          fontWeight: '500'
                        }}>
                          {user.name}
                        </div>
                        <div style={{
                          color: '#94a3b8',
                          fontSize: '0.875rem'
                        }}>
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
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
                          fontWeight: '500'
                        }}>
                          {getRoleLabel(user.role)}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        backgroundColor: user.isActive ? '#10b981' : '#6b7280',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#94a3b8' }}>
                      {formatDate(user.createdAt)}
                    </td>
                    <td style={{ padding: '1rem', color: '#94a3b8' }}>
                      {user.lastLogin ? formatDateTime(user.lastLogin) : 'Never'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem'
                      }}>
                        <Link
                          href={`/sysadmin/users/${user._id}`}
                          style={{
                            color: '#3b82f6',
                            textDecoration: 'none',
                            padding: '0.25rem'
                          }}
                        >
                          <EyeIcon width={16} height={16} />
                        </Link>
                        <Link
                          href={`/sysadmin/users/${user._id}/edit`}
                          style={{
                            color: '#f59e0b',
                            textDecoration: 'none',
                            padding: '0.25rem'
                          }}
                        >
                          <PencilIcon width={16} height={16} />
                        </Link>
                        <button
                          onClick={() => {
                            setUserToDelete(user._id);
                            setShowDeleteModal(true);
                          }}
                          style={{
                            color: '#ef4444',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.25rem'
                          }}
                        >
                          <TrashIcon width={16} height={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div style={{
          display: 'flex',
          justifyContent: 'between',
          alignItems: 'center',
          marginTop: '2rem',
          color: '#94a3b8'
        }}>
          <div>
            Showing {filteredUsers.length} of {users.length} users
          </div>
          <div>
            {/* Add pagination controls here */}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed' as const,
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
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{
              color: '#f1f5f9',
              marginBottom: '1rem'
            }}>
              Confirm Delete
            </h3>
            <p style={{
              color: '#94a3b8',
              marginBottom: '2rem'
            }}>
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
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
                onClick={() => userToDelete && handleDeleteUser(userToDelete)}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
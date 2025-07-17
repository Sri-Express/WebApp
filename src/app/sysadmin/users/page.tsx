// src/app/sysadmin/users/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  UsersIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  UserIcon,
  ShieldCheckIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  BuildingOfficeIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'client' | 'customer_service' | 'route_admin' | 'company_admin' | 'system_admin';
  phone?: string;
  department?: string;
  company?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  permissions?: string[];
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  recentRegistrations: number;
  byRole: Record<string, number>;
}

export default function SystemAdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNext: false,
    hasPrev: false
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleting, setDeleting] = useState(false);

  // Get auth token
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // API call helper
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
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
  }, [router]);

  // Load users data from real API
  const loadUsers = useCallback(async (page = 1, search = '', role = 'all', status = 'all') => {
    setLoading(true);
    
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (search) params.append('search', search);
      if (role !== 'all') params.append('role', role);
      if (status !== 'all') params.append('status', status);

      // Get users with pagination and filtering
      const usersResponse = await apiCall(`/admin/users?${params.toString()}`);
      
      // Get user statistics
      const statsResponse = await apiCall('/admin/users/stats');

      if (usersResponse && statsResponse) {
        setUsers(usersResponse.users || []);
        setPagination(usersResponse.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalUsers: 0,
          hasNext: false,
          hasPrev: false
        });
        setStats(statsResponse);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      // Show error message to user
      alert('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Initial load
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle search and filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadUsers(1, searchTerm, filterRole, filterStatus);
      setCurrentPage(1);
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterRole, filterStatus, loadUsers]);

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadUsers(page, searchTerm, filterRole, filterStatus);
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    if (!userId) return;

    setDeleting(true);
    try {
      const response = await apiCall(`/admin/users/${userId}`, {
        method: 'DELETE'
      });

      if (response) {
        // Reload users list
        await loadUsers(currentPage, searchTerm, filterRole, filterStatus);
        setShowDeleteModal(false);
        setUserToDelete(null);
        // Show success message
        alert('User deleted successfully');
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  // Handle user status toggle
  const handleToggleUserStatus = async (userId: string) => {
    try {
      const response = await apiCall(`/admin/users/${userId}/toggle-status`, {
        method: 'PATCH'
      });

      if (response) {
        // Reload users list
        await loadUsers(currentPage, searchTerm, filterRole, filterStatus);
        alert(`User ${response.user.isActive ? 'activated' : 'deactivated'} successfully`);
      } else {
        alert('Failed to update user status');
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Failed to update user status');
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      alert('Please select users first');
      return;
    }

    try {
      if (action === 'delete') {
        const confirmed = confirm(`Are you sure you want to delete ${selectedUsers.length} users?`);
        if (confirmed) {
          // Delete selected users one by one
          for (const userId of selectedUsers) {
            await apiCall(`/admin/users/${userId}`, { method: 'DELETE' });
          }
          setSelectedUsers([]);
          await loadUsers(currentPage, searchTerm, filterRole, filterStatus);
          alert('Users deleted successfully');
        }
      } else if (action === 'activate' || action === 'deactivate') {
        // Toggle status for selected users
        for (const userId of selectedUsers) {
          await apiCall(`/admin/users/${userId}/toggle-status`, { method: 'PATCH' });
        }
        setSelectedUsers([]);
        await loadUsers(currentPage, searchTerm, filterRole, filterStatus);
        alert(`Users ${action}d successfully`);
      }
    } catch (error) {
      console.error('Bulk action error:', error);
      alert('Failed to perform bulk action');
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Handle checkbox selection
  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user._id));
    }
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <ArrowPathIcon width={24} height={24} className="animate-spin" />
          Loading users...
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
              <h3 style={{ color: '#3b82f6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                {stats.totalUsers.toLocaleString()}
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
                {stats.activeUsers.toLocaleString()}
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
                {(stats.byRole?.client || 0).toLocaleString()}
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
                {stats.recentRegistrations.toLocaleString()}
              </h3>
              <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Recent (30 days)</p>
            </div>
          </div>
        )}

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
            alignItems: 'center',
            marginBottom: '1rem'
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

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center'
            }}>
              <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                {selectedUsers.length} selected
              </span>
              <button
                onClick={() => handleBulkAction('activate')}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                style={{
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Deactivate
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Delete
              </button>
            </div>
          )}
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
                    <input 
                      type="checkbox" 
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onChange={handleSelectAll}
                    />
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
                {users.map((user, index) => (
                  <tr key={user._id} style={{
                    borderBottom: index < users.length - 1 ? '1px solid #334155' : 'none',
                    backgroundColor: index % 2 === 0 ? '#1e293b' : '#1a2332'
                  }}>
                    <td style={{ padding: '1rem' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleSelectUser(user._id)}
                      />
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
                        {user.company && (
                          <div style={{
                            color: '#94a3b8',
                            fontSize: '0.75rem'
                          }}>
                            {user.company}
                          </div>
                        )}
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
                      <button
                        onClick={() => handleToggleUserStatus(user._id)}
                        style={{
                          backgroundColor: user.isActive ? '#10b981' : '#6b7280',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </button>
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
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '2rem',
          color: '#94a3b8'
        }}>
          <div>
            Showing {users.length} of {pagination.totalUsers} users (Page {pagination.currentPage} of {pagination.totalPages})
          </div>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
              style={{
                backgroundColor: pagination.hasPrev ? '#374151' : '#1f2937',
                color: pagination.hasPrev ? '#f9fafb' : '#6b7280',
                padding: '0.5rem',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: pagination.hasPrev ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ChevronLeftIcon width={16} height={16} />
            </button>
            
            <span style={{ 
              padding: '0.5rem 1rem',
              backgroundColor: '#374151',
              borderRadius: '0.375rem',
              color: '#f9fafb'
            }}>
              {pagination.currentPage}
            </span>

            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
              style={{
                backgroundColor: pagination.hasNext ? '#374151' : '#1f2937',
                color: pagination.hasNext ? '#f9fafb' : '#6b7280',
                padding: '0.5rem',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: pagination.hasNext ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ChevronRightIcon width={16} height={16} />
            </button>
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
                disabled={deleting}
                style={{
                  backgroundColor: '#374151',
                  color: '#f9fafb',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  opacity: deleting ? 0.7 : 1
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => userToDelete && handleDeleteUser(userToDelete)}
                disabled={deleting}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  opacity: deleting ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {deleting && <ArrowPathIcon width={16} height={16} className="animate-spin" />}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
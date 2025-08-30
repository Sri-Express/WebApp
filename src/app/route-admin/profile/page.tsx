// src/app/route-admin/profile/page.tsx - Route Admin Profile Management
"use client";

import { useState, useEffect } from 'react';
import {
  UserIcon,
  MapIcon,
  EnvelopeIcon,
  PhoneIcon,
  KeyIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  company?: string;
  createdAt: string;
  lastLogin?: string;
}

interface AssignedRoute {
  _id: string;
  routeId: string;
  name: string;
  startLocation: { name: string };
  endLocation: { name: string };
  distance: number;
  estimatedDuration: number;
  routeAdminAssignment: {
    assignedAt: string;
    assignedBy: {
      name: string;
      email: string;
    };
    status: string;
  };
}

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function RouteAdminProfile() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [user, setUser] = useState<User | null>(null);
  const [assignedRoute, setAssignedRoute] = useState<AssignedRoute | null>(null);
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: ''
  });
  
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Load user profile
      const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
        headers
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUser(profileData.user);
        setProfileForm({
          name: profileData.user.name || '',
          email: profileData.user.email || '',
          phone: profileData.user.phone || ''
        });
      }

      // Load assigned route info
      const routeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/route-admin/route`, {
        headers
      });

      if (routeResponse.ok) {
        const routeData = await routeResponse.json();
        setAssignedRoute(routeData.route);
      }
    } catch (err) {
      console.error('Load profile error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('update-profile');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const result = await response.json();
      setUser(result.user);
      setSuccess('Profile updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setActionLoading('change-password');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
      setSuccess('Password changed successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Change password error:', err);
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        color: '#f1f5f9'
      }}>
        Loading profile...
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#1e293b',
        padding: '2rem',
        borderRadius: '0.75rem',
        border: '1px solid #334155',
        marginBottom: '2rem'
      }}>
        <h1 style={{
          color: '#f1f5f9',
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem'
        }}>
          Profile Settings
        </h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>
          Manage your route administrator profile and security settings
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid #10b981',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircleIcon width={20} height={20} color="#10b981" />
          <span style={{ color: '#10b981' }}>{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: 'rgba(127, 29, 29, 0.8)',
          border: '1px solid #991b1b',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <ExclamationTriangleIcon width={20} height={20} color="#fca5a5" />
          <span style={{ color: '#fecaca' }}>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#fca5a5',
              cursor: 'pointer',
              marginLeft: 'auto'
            }}
          >
            ×
          </button>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Profile Information */}
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
            Personal Information
          </h2>

          <form onSubmit={handleProfileUpdate}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                color: '#f1f5f9',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                display: 'block'
              }}>
                Full Name
              </label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                style={{
                  width: '100%',
                  backgroundColor: '#334155',
                  border: '1px solid #475569',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  color: '#f1f5f9',
                  fontSize: '0.875rem'
                }}
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                color: '#f1f5f9',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                display: 'block'
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                style={{
                  width: '100%',
                  backgroundColor: '#334155',
                  border: '1px solid #475569',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  color: '#f1f5f9',
                  fontSize: '0.875rem'
                }}
                required
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                color: '#f1f5f9',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                display: 'block'
              }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                style={{
                  width: '100%',
                  backgroundColor: '#334155',
                  border: '1px solid #475569',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  color: '#f1f5f9',
                  fontSize: '0.875rem'
                }}
                placeholder="Enter phone number"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading === 'update-profile'}
              style={{
                backgroundColor: actionLoading === 'update-profile' ? '#6b7280' : '#8b5cf6',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: actionLoading === 'update-profile' ? 'not-allowed' : 'pointer',
                opacity: actionLoading === 'update-profile' ? 0.7 : 1
              }}
            >
              {actionLoading === 'update-profile' ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Account Details */}
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
            <CalendarDaysIcon width={20} height={20} />
            Account Details
          </h2>

          {user && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{
                backgroundColor: '#334155',
                padding: '1rem',
                borderRadius: '0.5rem'
              }}>
                <div style={{
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  marginBottom: '0.25rem'
                }}>
                  Role
                </div>
                <div style={{
                  color: '#f1f5f9',
                  fontWeight: '500',
                  textTransform: 'capitalize'
                }}>
                  {user.role.replace('_', ' ')}
                </div>
              </div>

              <div style={{
                backgroundColor: '#334155',
                padding: '1rem',
                borderRadius: '0.5rem'
              }}>
                <div style={{
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  marginBottom: '0.25rem'
                }}>
                  Department
                </div>
                <div style={{
                  color: '#f1f5f9',
                  fontWeight: '500'
                }}>
                  {user.department || 'Route Management'}
                </div>
              </div>

              <div style={{
                backgroundColor: '#334155',
                padding: '1rem',
                borderRadius: '0.5rem'
              }}>
                <div style={{
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  marginBottom: '0.25rem'
                }}>
                  Company
                </div>
                <div style={{
                  color: '#f1f5f9',
                  fontWeight: '500'
                }}>
                  {user.company || 'Sri Express'}
                </div>
              </div>

              <div style={{
                backgroundColor: '#334155',
                padding: '1rem',
                borderRadius: '0.5rem'
              }}>
                <div style={{
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  marginBottom: '0.25rem'
                }}>
                  Account Created
                </div>
                <div style={{
                  color: '#f1f5f9',
                  fontWeight: '500'
                }}>
                  {formatDateTime(user.createdAt)}
                </div>
              </div>

              {user.lastLogin && (
                <div style={{
                  backgroundColor: '#334155',
                  padding: '1rem',
                  borderRadius: '0.5rem'
                }}>
                  <div style={{
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    marginBottom: '0.25rem'
                  }}>
                    Last Login
                  </div>
                  <div style={{
                    color: '#f1f5f9',
                    fontWeight: '500'
                  }}>
                    {formatDateTime(user.lastLogin)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Assigned Route Information */}
      <div style={{
        backgroundColor: '#1e293b',
        padding: '2rem',
        borderRadius: '0.75rem',
        border: '1px solid #334155',
        marginBottom: '2rem'
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
          <MapIcon width={20} height={20} />
          Assigned Route
        </h2>

        {assignedRoute ? (
          <div style={{
            backgroundColor: '#334155',
            padding: '1.5rem',
            borderRadius: '0.5rem'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2rem'
            }}>
              <div>
                <div style={{
                  color: '#f1f5f9',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem'
                }}>
                  {assignedRoute.name}
                </div>
                <div style={{
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  marginBottom: '1rem'
                }}>
                  Route ID: {assignedRoute.routeId}
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>From: </span>
                  <span style={{ color: '#f1f5f9', fontSize: '0.875rem' }}>
                    {assignedRoute.startLocation.name}
                  </span>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>To: </span>
                  <span style={{ color: '#f1f5f9', fontSize: '0.875rem' }}>
                    {assignedRoute.endLocation.name}
                  </span>
                </div>
              </div>

              <div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Distance: </span>
                  <span style={{ color: '#f1f5f9', fontSize: '0.875rem' }}>
                    {assignedRoute.distance} km
                  </span>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Duration: </span>
                  <span style={{ color: '#f1f5f9', fontSize: '0.875rem' }}>
                    {formatDuration(assignedRoute.estimatedDuration)}
                  </span>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Assigned: </span>
                  <span style={{ color: '#f1f5f9', fontSize: '0.875rem' }}>
                    {formatDateTime(assignedRoute.routeAdminAssignment.assignedAt)}
                  </span>
                </div>

                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Assigned by: </span>
                  <span style={{ color: '#f1f5f9', fontSize: '0.875rem' }}>
                    {assignedRoute.routeAdminAssignment.assignedBy.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            backgroundColor: '#7c2d12',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <ExclamationTriangleIcon width={32} height={32} color="#fed7a1" style={{ margin: '0 auto 0.5rem' }} />
            <p style={{ color: '#fed7a1', margin: 0 }}>
              No route assigned. Contact your system administrator.
            </p>
          </div>
        )}
      </div>

      {/* Security Section */}
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
          Security Settings
        </h2>

        {!showPasswordForm ? (
          <div>
            <p style={{
              color: '#94a3b8',
              marginBottom: '1.5rem'
            }}>
              Keep your account secure by regularly updating your password.
            </p>
            
            <button
              onClick={() => setShowPasswordForm(true)}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Change Password
            </button>
          </div>
        ) : (
          <form onSubmit={handlePasswordChange}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                color: '#f1f5f9',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                display: 'block'
              }}>
                Current Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  style={{
                    width: '100%',
                    backgroundColor: '#334155',
                    border: '1px solid #475569',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    paddingRight: '3rem',
                    color: '#f1f5f9',
                    fontSize: '0.875rem'
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8'
                  }}
                >
                  {showCurrentPassword ? (
                    <EyeSlashIcon width={20} height={20} />
                  ) : (
                    <EyeIcon width={20} height={20} />
                  )}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                color: '#f1f5f9',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                display: 'block'
              }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  style={{
                    width: '100%',
                    backgroundColor: '#334155',
                    border: '1px solid #475569',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    paddingRight: '3rem',
                    color: '#f1f5f9',
                    fontSize: '0.875rem'
                  }}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8'
                  }}
                >
                  {showNewPassword ? (
                    <EyeSlashIcon width={20} height={20} />
                  ) : (
                    <EyeIcon width={20} height={20} />
                  )}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                color: '#f1f5f9',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                display: 'block'
              }}>
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  style={{
                    width: '100%',
                    backgroundColor: '#334155',
                    border: '1px solid #475569',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    paddingRight: '3rem',
                    color: '#f1f5f9',
                    fontSize: '0.875rem'
                  }}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8'
                  }}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon width={20} height={20} />
                  ) : (
                    <EyeIcon width={20} height={20} />
                  )}
                </button>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem'
            }}>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
                style={{
                  backgroundColor: '#374151',
                  color: '#f9fafb',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading === 'change-password'}
                style={{
                  backgroundColor: actionLoading === 'change-password' ? '#6b7280' : '#ef4444',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: actionLoading === 'change-password' ? 'not-allowed' : 'pointer',
                  opacity: actionLoading === 'change-password' ? 0.7 : 1
                }}
              >
                {actionLoading === 'change-password' ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
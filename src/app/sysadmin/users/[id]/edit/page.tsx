// src/app/sysadmin/users/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { 
  UserIcon,
  PencilIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  KeyIcon,
  ChatBubbleLeftRightIcon,
  TruckIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface EditUserForm {
  name: string;
  email: string;
  role: 'client' | 'customer_service' | 'route_admin' | 'company_admin' | 'system_admin';
  phone?: string;
  department?: string;
  company?: string;
  permissions: string[];
  isActive: boolean;
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [formData, setFormData] = useState<EditUserForm | null>(null);
  const [originalData, setOriginalData] = useState<EditUserForm | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      
      try {
        const userResponse = await apiCall(`/admin/users/${userId}`);
        if (userResponse) {
          const userData: EditUserForm = {
            name: userResponse.name,
            email: userResponse.email,
            role: userResponse.role,
            phone: userResponse.phone || '',
            department: userResponse.department || '',
            company: userResponse.company || '',
            permissions: userResponse.permissions || [],
            isActive: userResponse.isActive
          };
          setFormData(userData);
          setOriginalData(userData);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setErrors({ submit: 'Failed to load user data' });
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadUserData();
    }
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!formData) return;

    const { name, value, type } = e.target;

    setFormData(prev => prev ? ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }) : null);

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (!formData) return;

    setFormData(prev => prev ? ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, permission]
        : prev.permissions.filter(p => p !== permission)
    }) : null);
  };

  const validateForm = () => {
    if (!formData) return false;

    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Role-specific validation
    if (formData.role === 'company_admin' && !formData.company?.trim()) {
      newErrors.company = 'Company name is required for company administrators';
    }

    if (formData.role === 'customer_service' && !formData.department?.trim()) {
      newErrors.department = 'Department is required for customer service agents';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hasChanges = () => {
    if (!formData || !originalData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData || !validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const response = await apiCall(`/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });

      if (response) {
        router.push(`/sysadmin/users/${userId}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to update user' });
    } finally {
      setSaving(false);
    }
  };

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

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'client':
        return 'Can register, track buses, and book tickets';
      case 'customer_service':
        return 'Handles customer inquiries and support tickets';
      case 'route_admin':
        return 'Manages routes, schedules, and confirms departures';
      case 'company_admin':
        return 'Manages company fleet and private transport';
      case 'system_admin':
        return 'Full system access and administration';
      default:
        return '';
    }
  };

  const getAvailablePermissions = () => {
    if (!formData) return [];

    const basePermissions = [
      'read_users',
      'write_users',
      'read_routes',
      'write_routes',
      'read_vehicles',
      'write_vehicles',
      'read_analytics',
      'write_analytics'
    ];

    const rolePermissions = {
      'client': ['read_routes', 'read_vehicles'],
      'customer_service': ['read_users', 'read_routes', 'read_vehicles'],
      'route_admin': ['read_routes', 'write_routes', 'read_vehicles', 'write_vehicles'],
      'company_admin': ['read_users', 'write_users', 'read_vehicles', 'write_vehicles'],
      'system_admin': basePermissions
    };

    return rolePermissions[formData.role as keyof typeof rolePermissions] || [];
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
        <div>Loading user data...</div>
      </div>
    );
  }

  if (!formData) {
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
        <div>User not found</div>
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
            <Link href={`/sysadmin/users/${userId}`} style={{
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: '0.875rem'
            }}>
              ← Back to User
            </Link>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <PencilIcon width={24} height={24} color="#f59e0b" />
              <div>
                <h1 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#f1f5f9',
                  margin: 0
                }}>
                  Edit User: {formData.name}
                </h1>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#94a3b8',
                  margin: 0
                }}>
                  {formData.email}
                </p>
              </div>
            </div>
          </div>

          {/* Save Status */}
          {hasChanges() && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#f59e0b'
            }}>
              <ExclamationTriangleIcon width={16} height={16} />
              <span style={{ fontSize: '0.875rem' }}>Unsaved changes</span>
            </div>
          )}
        </div>
      </nav>

      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>
        <form onSubmit={handleSubmit}>
          {/* General Error */}
          {errors.submit && (
            <div style={{
              backgroundColor: '#991b1b',
              color: '#fecaca',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '2rem',
              border: '1px solid #dc2626'
            }}>
              {errors.submit}
            </div>
          )}

          {/* Basic Information */}
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
              marginBottom: '1.5rem'
            }}>
              Basic Information
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {/* Name */}
              <div>
                <label style={{
                  display: 'block',
                  color: '#e2e8f0',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${errors.name ? '#dc2626' : '#475569'}`,
                    backgroundColor: '#334155',
                    color: '#f1f5f9',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <p style={{
                    color: '#fecaca',
                    fontSize: '0.875rem',
                    marginTop: '0.25rem'
                  }}>
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label style={{
                  display: 'block',
                  color: '#e2e8f0',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  Email Address *
                </label>
                <div style={{ position: 'relative' }}>
                  <EnvelopeIcon 
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
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem 0.875rem 3rem',
                      borderRadius: '0.5rem',
                      border: `1px solid ${errors.email ? '#dc2626' : '#475569'}`,
                      backgroundColor: '#334155',
                      color: '#f1f5f9',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                    placeholder="user@example.com"
                  />
                </div>
                {errors.email && (
                  <p style={{
                    color: '#fecaca',
                    fontSize: '0.875rem',
                    marginTop: '0.25rem'
                  }}>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label style={{
                  display: 'block',
                  color: '#e2e8f0',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  Phone Number
                </label>
                <div style={{ position: 'relative' }}>
                  <PhoneIcon 
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
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem 0.875rem 3rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #475569',
                      backgroundColor: '#334155',
                      color: '#f1f5f9',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                    placeholder="+94 77 123 4567"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Role & Permissions */}
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
              marginBottom: '1.5rem'
            }}>
              Role & Permissions
            </h2>

            {/* Role Selection */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                color: '#e2e8f0',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                User Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #475569',
                  backgroundColor: '#334155',
                  color: getRoleColor(formData.role),
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  outline: 'none',
                  fontWeight: '600'
                }}
              >
                <option value="client">👤 Client</option>
                <option value="customer_service">💬 Customer Service</option>
                <option value="route_admin">🚌 Route Administrator</option>
                <option value="company_admin">🏢 Company Administrator</option>
                <option value="system_admin">🔧 System Administrator</option>
              </select>

              {/* Role Description */}
              <div style={{
                backgroundColor: '#334155',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ color: getRoleColor(formData.role) }}>
                  {getRoleIcon(formData.role)}
                </span>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                  {getRoleDescription(formData.role)}
                </span>
              </div>
            </div>

            {/* Role-specific fields */}
            {formData.role === 'customer_service' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  color: '#e2e8f0',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  Department *
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${errors.department ? '#dc2626' : '#475569'}`,
                    backgroundColor: '#334155',
                    color: '#f1f5f9',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                  placeholder="e.g., Customer Support"
                />
                {errors.department && (
                  <p style={{
                    color: '#fecaca',
                    fontSize: '0.875rem',
                    marginTop: '0.25rem'
                  }}>
                    {errors.department}
                  </p>
                )}
              </div>
            )}

            {formData.role === 'company_admin' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  color: '#e2e8f0',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  Company Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <BuildingOfficeIcon 
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
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem 0.875rem 3rem',
                      borderRadius: '0.5rem',
                      border: `1px solid ${errors.company ? '#dc2626' : '#475569'}`,
                      backgroundColor: '#334155',
                      color: '#f1f5f9',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                    placeholder="e.g., ABC Transport Company"
                  />
                </div>
                {errors.company && (
                  <p style={{
                    color: '#fecaca',
                    fontSize: '0.875rem',
                    marginTop: '0.25rem'
                  }}>
                    {errors.company}
                  </p>
                )}
              </div>
            )}

            {/* Permissions */}
            <div>
              <label style={{
                display: 'block',
                color: '#e2e8f0',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                Permissions
              </label>
              <div style={{
                backgroundColor: '#334155',
                padding: '1rem',
                borderRadius: '0.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                {getAvailablePermissions().map((permission) => (
                  <label key={permission} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#e2e8f0',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(permission)}
                      onChange={(e) => handlePermissionChange(permission, e.target.checked)}
                      style={{
                        accentColor: '#3b82f6'
                      }}
                    />
                    {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Account Settings */}
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
              marginBottom: '1.5rem'
            }}>
              Account Settings
            </h2>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#e2e8f0',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  style={{
                    accentColor: '#3b82f6'
                  }}
                />
                <div>
                  <div style={{ fontWeight: '500' }}>Active Account</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                    User can login and access the system
                  </div>
                </div>
              </label>

              {!formData.isActive && (
                <div style={{
                  backgroundColor: '#991b1b',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #dc2626'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#fecaca'
                  }}>
                    <ExclamationTriangleIcon width={16} height={16} />
                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                      Account Deactivated
                    </span>
                  </div>
                  <p style={{
                    color: '#fecaca',
                    fontSize: '0.875rem',
                    margin: '0.5rem 0 0 0'
                  }}>
                    This user will not be able to login or access any system features until reactivated.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end'
          }}>
            <Link
              href={`/sysadmin/users/${userId}`}
              style={{
                backgroundColor: '#374151',
                color: '#f9fafb',
                padding: '0.875rem 1.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || !hasChanges()}
              style={{
                backgroundColor: hasChanges() ? '#f59e0b' : '#6b7280',
                color: 'white',
                padding: '0.875rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: '500',
                cursor: hasChanges() ? 'pointer' : 'not-allowed',
                opacity: saving ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {saving ? 'Saving Changes...' : 'Save Changes'}
              {hasChanges() && <CheckCircleIcon width={20} height={20} />}
            </button>
          </div>

          {/* System Admin Warning */}
          {formData.role === 'system_admin' && (
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
                  System Administrator Role
                </h3>
              </div>
              <p style={{
                color: '#94a3b8',
                margin: 0,
                lineHeight: '1.5'
              }}>
                You are editing a system administrator account. This role has full access to all system 
                functions and should only be assigned to trusted personnel. Changes to system administrator 
                accounts are logged and monitored.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
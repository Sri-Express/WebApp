// src/app/sysadmin/devices/[id]/edit/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { 
  DevicePhoneMobileIcon,
  TruckIcon,
  MapPinIcon,
  CpuChipIcon,
  UserIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface EditDeviceForm {
  deviceId: string;
  vehicleNumber: string;
  vehicleType: 'bus' | 'train';
  assignedTo: {
    type: 'route_admin' | 'company_admin' | 'system';
    userId: string;
    name: string;
  };
  firmwareVersion: string;
  installDate: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  route?: {
    routeId: string;
    name: string;
  };
  status: 'online' | 'offline' | 'maintenance';
  isActive: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function EditDevicePage() {
  const router = useRouter();
  const params = useParams();
  const deviceId = params.id as string;

  const [formData, setFormData] = useState<EditDeviceForm | null>(null);
  const [originalData, setOriginalData] = useState<EditDeviceForm | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Get auth token
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // API call helper - wrapped in useCallback to fix dependency warning
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

  // Load device data and users
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        // Load device data
        const deviceResponse = await apiCall(`/admin/devices/${deviceId}`);
        if (deviceResponse) {
          const deviceData: EditDeviceForm = {
            deviceId: deviceResponse.deviceId,
            vehicleNumber: deviceResponse.vehicleNumber,
            vehicleType: deviceResponse.vehicleType,
            assignedTo: deviceResponse.assignedTo,
            firmwareVersion: deviceResponse.firmwareVersion,
            installDate: deviceResponse.installDate.split('T')[0], // Convert to date format
            location: deviceResponse.location,
            route: deviceResponse.route,
            status: deviceResponse.status,
            isActive: deviceResponse.isActive
          };
          setFormData(deviceData);
          setOriginalData(deviceData);
        }

        // Load available users
        setLoadingUsers(true);
        const usersResponse = await apiCall('/admin/users?limit=100&role=route_admin,company_admin');
        if (usersResponse?.users) {
          setAvailableUsers(usersResponse.users);
        }
        setLoadingUsers(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setErrors({ submit: 'Failed to load device data' });
      } finally {
        setLoading(false);
      }
    };

    if (deviceId) {
      loadData();
    }
  }, [deviceId, apiCall]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!formData) return;

    const { name, value, type } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => prev ? ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof EditDeviceForm] as Record<string, string | number>,
          [child]: type === 'number' ? parseFloat(value) : value
        }
      }) : null);
    } else {
      setFormData(prev => prev ? ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }) : null);
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAssignmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!formData) return;

    const { name, value } = e.target;
    
    if (name === 'assignedTo.type') {
      if (value === 'system') {
        setFormData(prev => prev ? ({
          ...prev,
          assignedTo: {
            type: 'system',
            userId: '',
            name: 'System Control'
          }
        }) : null);
      } else {
        setFormData(prev => prev ? ({
          ...prev,
          assignedTo: {
            ...prev.assignedTo,
            type: value as 'route_admin' | 'company_admin',
            userId: '',
            name: ''
          }
        }) : null);
      }
    } else if (name === 'assignedTo.userId') {
      const selectedUser = availableUsers.find(user => user._id === value);
      setFormData(prev => prev ? ({
        ...prev,
        assignedTo: {
          ...prev.assignedTo,
          userId: value,
          name: selectedUser?.name || ''
        }
      }) : null);
    }
  };

  const validateForm = () => {
    if (!formData) return false;

    const newErrors: Record<string, string> = {};

    // Device ID validation
    if (!formData.deviceId.trim()) {
      newErrors.deviceId = 'Device ID is required';
    }

    // Vehicle number validation
    if (!formData.vehicleNumber.trim()) {
      newErrors.vehicleNumber = 'Vehicle number is required';
    }

    // Firmware version validation
    if (!formData.firmwareVersion.trim()) {
      newErrors.firmwareVersion = 'Firmware version is required';
    }

    // Install date validation
    if (!formData.installDate) {
      newErrors.installDate = 'Install date is required';
    }

    // Location validation
    if (!formData.location.address.trim()) {
      newErrors['location.address'] = 'Address is required';
    }

    // Assignment validation
    if (formData.assignedTo.type !== 'system' && !formData.assignedTo.userId) {
      newErrors['assignedTo.userId'] = 'Please select a user for assignment';
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
      const response = await apiCall(`/admin/devices/${deviceId}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });

      if (response) {
        router.push(`/sysadmin/devices/${deviceId}`);
      }
    } catch (error) {
      console.error('Error updating device:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to update device' });
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return '#10b981';
      case 'offline':
        return '#ef4444';
      case 'maintenance':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const filteredUsers = availableUsers.filter(user => 
    formData?.assignedTo.type === 'route_admin' ? user.role === 'route_admin' : 
    formData?.assignedTo.type === 'company_admin' ? user.role === 'company_admin' : 
    false
  );

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
        <div>Loading device data...</div>
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
        <div>Device not found</div>
        <Link
          href="/sysadmin/devices"
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            textDecoration: 'none'
          }}
        >
          Back to Devices
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
            <Link href={`/sysadmin/devices/${deviceId}`} style={{
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: '0.875rem'
            }}>
              ← Back to Device
            </Link>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <DevicePhoneMobileIcon width={24} height={24} color="#f59e0b" />
              <div>
                <h1 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#f1f5f9',
                  margin: 0
                }}>
                  Edit Device: {formData.deviceId}
                </h1>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#94a3b8',
                  margin: 0
                }}>
                  {formData.vehicleNumber} • {formData.vehicleType}
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

          {/* Device Information */}
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
              <CpuChipIcon width={20} height={20} />
              Device Information
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {/* Device ID */}
              <div>
                <label style={{
                  display: 'block',
                  color: '#e2e8f0',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  Device ID *
                </label>
                <input
                  type="text"
                  name="deviceId"
                  value={formData.deviceId}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${errors.deviceId ? '#dc2626' : '#475569'}`,
                    backgroundColor: '#334155',
                    color: '#f1f5f9',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                  placeholder="e.g., DEV001, BUS-001"
                />
                {errors.deviceId && (
                  <p style={{
                    color: '#fecaca',
                    fontSize: '0.875rem',
                    marginTop: '0.25rem'
                  }}>
                    {errors.deviceId}
                  </p>
                )}
              </div>

              {/* Firmware Version */}
              <div>
                <label style={{
                  display: 'block',
                  color: '#e2e8f0',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  Firmware Version *
                </label>
                <input
                  type="text"
                  name="firmwareVersion"
                  value={formData.firmwareVersion}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${errors.firmwareVersion ? '#dc2626' : '#475569'}`,
                    backgroundColor: '#334155',
                    color: '#f1f5f9',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                  placeholder="e.g., 2.1.4, v3.0.1"
                />
                {errors.firmwareVersion && (
                  <p style={{
                    color: '#fecaca',
                    fontSize: '0.875rem',
                    marginTop: '0.25rem'
                  }}>
                    {errors.firmwareVersion}
                  </p>
                )}
              </div>

              {/* Install Date */}
              <div>
                <label style={{
                  display: 'block',
                  color: '#e2e8f0',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  Install Date *
                </label>
                <input
                  type="date"
                  name="installDate"
                  value={formData.installDate}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${errors.installDate ? '#dc2626' : '#475569'}`,
                    backgroundColor: '#334155',
                    color: '#f1f5f9',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
                {errors.installDate && (
                  <p style={{
                    color: '#fecaca',
                    fontSize: '0.875rem',
                    marginTop: '0.25rem'
                  }}>
                    {errors.installDate}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label style={{
                  display: 'block',
                  color: '#e2e8f0',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  Device Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #475569',
                    backgroundColor: '#334155',
                    color: getStatusColor(formData.status),
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                    fontWeight: '600'
                  }}
                >
                  <option value="online">🟢 Online</option>
                  <option value="offline">🔴 Offline</option>
                  <option value="maintenance">🟡 Maintenance</option>
                </select>
              </div>

              {/* Active Status */}
              <div>
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
                  Device is active
                </label>
                <p style={{
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  margin: '0.25rem 0 0 0'
                }}>
                  Inactive devices are hidden from monitoring
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
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
              <TruckIcon width={20} height={20} />
              Vehicle Information
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {/* Vehicle Number */}
              <div>
                <label style={{
                  display: 'block',
                  color: '#e2e8f0',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  Vehicle Number *
                </label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${errors.vehicleNumber ? '#dc2626' : '#475569'}`,
                    backgroundColor: '#334155',
                    color: '#f1f5f9',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                  placeholder="e.g., LK-1234, BUS-456"
                />
                {errors.vehicleNumber && (
                  <p style={{
                    color: '#fecaca',
                    fontSize: '0.875rem',
                    marginTop: '0.25rem'
                  }}>
                    {errors.vehicleNumber}
                  </p>
                )}
              </div>

              {/* Vehicle Type */}
              <div>
                <label style={{
                  display: 'block',
                  color: '#e2e8f0',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  Vehicle Type *
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #475569',
                    backgroundColor: '#334155',
                    color: '#f1f5f9',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                >
                  <option value="bus">🚌 Bus</option>
                  <option value="train">🚊 Train</option>
                </select>
              </div>

              {/* Route (Optional) */}
              <div>
                <label style={{
                  display: 'block',
                  color: '#e2e8f0',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  Route Name (Optional)
                </label>
                <input
                  type="text"
                  name="route.name"
                  value={formData.route?.name || ''}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #475569',
                    backgroundColor: '#334155',
                    color: '#f1f5f9',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                  placeholder="e.g., Colombo - Kandy"
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
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
              <MapPinIcon width={20} height={20} />
              Current Location
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem'
            }}>
              {/* Latitude */}
              <div>
                <label style={{
                  display: 'block',
                  color: '#e2e8f0',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="location.latitude"
                  value={formData.location.latitude}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #475569',
                    backgroundColor: '#334155',
                    color: '#f1f5f9',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                  placeholder="6.9271"
                />
              </div>

              {/* Longitude */}
              <div>
                <label style={{
                  display: 'block',
                  color: '#e2e8f0',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="location.longitude"
                  value={formData.location.longitude}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #475569',
                    backgroundColor: '#334155',
                    color: '#f1f5f9',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                  placeholder="79.8612"
                />
              </div>

              {/* Address */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{
                  display: 'block',
                  color: '#e2e8f0',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  Address *
                </label>
                <input
                  type="text"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${errors['location.address'] ? '#dc2626' : '#475569'}`,
                    backgroundColor: '#334155',
                    color: '#f1f5f9',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                  placeholder="e.g., Colombo Central Bus Station"
                />
                {errors['location.address'] && (
                  <p style={{
                    color: '#fecaca',
                    fontSize: '0.875rem',
                    marginTop: '0.25rem'
                  }}>
                    {errors['location.address']}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Assignment Information */}
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
              <UserIcon width={20} height={20} />
              Device Assignment
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {/* Assignment Type */}
              <div>
                <label style={{
                  display: 'block',
                  color: '#e2e8f0',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  Assign To *
                </label>
                <select
                  name="assignedTo.type"
                  value={formData.assignedTo.type}
                  onChange={handleAssignmentChange}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #475569',
                    backgroundColor: '#334155',
                    color: '#f1f5f9',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                >
                  <option value="system">🏛️ System Control</option>
                  <option value="route_admin">🚌 Route Administrator</option>
                  <option value="company_admin">🏢 Company Administrator</option>
                </select>
              </div>

              {/* User Selection */}
              {formData.assignedTo.type !== 'system' && (
                <div>
                  <label style={{
                    display: 'block',
                    color: '#e2e8f0',
                    fontWeight: '600',
                    marginBottom: '0.5rem'
                  }}>
                    Select User *
                  </label>
                  <select
                    name="assignedTo.userId"
                    value={formData.assignedTo.userId}
                    onChange={handleAssignmentChange}
                    disabled={loadingUsers}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      borderRadius: '0.5rem',
                      border: `1px solid ${errors['assignedTo.userId'] ? '#dc2626' : '#475569'}`,
                      backgroundColor: '#334155',
                      color: '#f1f5f9',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                      outline: 'none',
                      opacity: loadingUsers ? 0.7 : 1
                    }}
                  >
                    <option value="">
                      {loadingUsers ? 'Loading users...' : 'Select a user'}
                    </option>
                    {filteredUsers.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                  {errors['assignedTo.userId'] && (
                    <p style={{
                      color: '#fecaca',
                      fontSize: '0.875rem',
                      marginTop: '0.25rem'
                    }}>
                      {errors['assignedTo.userId']}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Assignment Info */}
            <div style={{
              backgroundColor: '#334155',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginTop: '1rem'
            }}>
              <p style={{
                color: '#94a3b8',
                fontSize: '0.875rem',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <InformationCircleIcon width={16} height={16} />
                Currently assigned to: <strong>{formData.assignedTo.name}</strong>
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end'
          }}>
            <Link
              href={`/sysadmin/devices/${deviceId}`}
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
        </form>
      </div>
    </div>
  );
}

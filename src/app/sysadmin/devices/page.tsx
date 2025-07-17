// src/app/sysadmin/devices/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  DevicePhoneMobileIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  MapPinIcon,
  BoltIcon, // Replaced BatteryIcon with BoltIcon
  TruckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface Device {
  _id: string;
  deviceId: string;
  vehicleNumber: string;
  vehicleType: 'bus' | 'train';
  status: 'online' | 'offline' | 'maintenance';
  lastSeen: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    lastUpdated: string;
  };
  batteryLevel: number;
  signalStrength: number;
  assignedTo: {
    type: 'route_admin' | 'company_admin' | 'system';
    userId?: string;
    name: string;
  };
  route?: {
    routeId: string;
    name: string;
  };
  firmwareVersion: string;
  installDate: string;
  lastMaintenance?: string;
  alerts: {
    count: number;
    messages: string[];
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DeviceStats {
  totalDevices: number;
  activeDevices: number;
  offlineDevices: number;
  maintenanceDevices: number;
  totalAlerts: number;
}

export default function SystemAdminDevicesPage() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [stats, setStats] = useState<DeviceStats | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDevices: 0,
    hasNext: false,
    hasPrev: false
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  // Load devices data from real API
  const loadDevices = useCallback(async (page = 1, search = '', status = 'all', type = 'all') => {
    setLoading(true);
    
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy: 'lastSeen',
        sortOrder: 'desc'
      });

      if (search) params.append('search', search);
      if (status !== 'all') params.append('status', status);
      if (type !== 'all') params.append('vehicleType', type);

      // Get devices with pagination and filtering
      const devicesResponse = await apiCall(`/admin/devices?${params.toString()}`);
      
      // Get device statistics
      const statsResponse = await apiCall('/admin/devices/stats');

      if (devicesResponse && statsResponse) {
        setDevices(devicesResponse.devices || []);
        setPagination(devicesResponse.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalDevices: 0,
          hasNext: false,
          hasPrev: false
        });
        setStats(statsResponse);
      }
    } catch (error) {
      console.error('Error loading devices:', error);
      // Show error message to user
      alert('Failed to load devices. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Initial load
  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  // Handle search and filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadDevices(1, searchTerm, filterStatus, filterType);
      setCurrentPage(1);
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterStatus, filterType, loadDevices]);

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadDevices(page, searchTerm, filterStatus, filterType);
  };

  // Handle device deletion
  const handleDeleteDevice = async (deviceId: string) => {
    if (!deviceId) return;

    setDeleting(true);
    try {
      const response = await apiCall(`/admin/devices/${deviceId}`, {
        method: 'DELETE'
      });

      if (response) {
        // Reload devices list
        await loadDevices(currentPage, searchTerm, filterStatus, filterType);
        setShowDeleteModal(false);
        setDeviceToDelete(null);
        // Show success message
        alert('Device deleted successfully');
      } else {
        alert('Failed to delete device');
      }
    } catch (error) {
      console.error('Error deleting device:', error);
      alert('Failed to delete device');
    } finally {
      setDeleting(false);
    }
  };

  // Handle device status update
  const handleUpdateDeviceStatus = async (deviceId: string, newStatus: string) => {
    try {
      const response = await apiCall(`/admin/devices/${deviceId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      if (response) {
        // Reload devices list
        await loadDevices(currentPage, searchTerm, filterStatus, filterType);
        alert(`Device status updated to ${newStatus}`);
      } else {
        alert('Failed to update device status');
      }
    } catch (error) {
      console.error('Error updating device status:', error);
      alert('Failed to update device status');
    }
  };

  // Handle clear device alerts
  const handleClearAlerts = async (deviceId: string) => {
    try {
      const response = await apiCall(`/admin/devices/${deviceId}/alerts`, {
        method: 'DELETE'
      });

      if (response) {
        // Reload devices list
        await loadDevices(currentPage, searchTerm, filterStatus, filterType);
        alert('Device alerts cleared successfully');
      } else {
        alert('Failed to clear device alerts');
      }
    } catch (error) {
      console.error('Error clearing device alerts:', error);
      alert('Failed to clear device alerts');
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDevices(currentPage, searchTerm, filterStatus, filterType);
    setRefreshing(false);
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedDevices.length === 0) {
      alert('Please select devices first');
      return;
    }

    try {
      if (action === 'delete') {
        const confirmed = confirm(`Are you sure you want to delete ${selectedDevices.length} devices?`);
        if (confirmed) {
          // Delete selected devices one by one
          for (const deviceId of selectedDevices) {
            await apiCall(`/admin/devices/${deviceId}`, { method: 'DELETE' });
          }
          setSelectedDevices([]);
          await loadDevices(currentPage, searchTerm, filterStatus, filterType);
          alert('Devices deleted successfully');
        }
      } else if (action === 'maintenance' || action === 'online') {
        // Update status for selected devices
        for (const deviceId of selectedDevices) {
          await apiCall(`/admin/devices/${deviceId}`, { 
            method: 'PUT',
            body: JSON.stringify({ status: action })
          });
        }
        setSelectedDevices([]);
        await loadDevices(currentPage, searchTerm, filterStatus, filterType);
        alert(`Devices updated to ${action} successfully`);
      }
    } catch (error) {
      console.error('Bulk action error:', error);
      alert('Failed to perform bulk action');
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircleIcon width={20} height={20} />;
      case 'offline':
        return <XCircleIcon width={20} height={20} />;
      case 'maintenance':
        return <ClockIcon width={20} height={20} />;
      default:
        return <ExclamationTriangleIcon width={20} height={20} />;
    }
  };

  const getSignalBars = (strength: number) => {
    const bars = [];
    for (let i = 1; i <= 5; i++) {
      bars.push(
        <div
          key={i}
          style={{
            width: '2px',
            height: `${4 + i * 2}px`,
            backgroundColor: i <= strength ? '#10b981' : '#374151',
            margin: '0 1px'
          }}
        />
      );
    }
    return (
      <div style={{ display: 'flex', alignItems: 'end' }}>
        {bars}
      </div>
    );
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return '#10b981';
    if (level > 20) return '#f59e0b';
    return '#ef4444';
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

  // Handle checkbox selection
  const handleSelectDevice = (deviceId: string) => {
    setSelectedDevices(prev => 
      prev.includes(deviceId) 
        ? prev.filter(id => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDevices.length === devices.length) {
      setSelectedDevices([]);
    } else {
      setSelectedDevices(devices.map(device => device._id));
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
          Loading devices...
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
              <DevicePhoneMobileIcon width={24} height={24} color="#10b981" />
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#f1f5f9',
                margin: 0
              }}>
                Device Management
              </h1>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link
              href="/sysadmin/devices/monitor"
              style={{
                backgroundColor: '#374151',
                color: '#f9fafb',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '500'
              }}
            >
              <MapPinIcon width={20} height={20} />
              Global Map
            </Link>
            <Link
              href="/sysadmin/devices/add"
              style={{
                backgroundColor: '#10b981',
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
              Add Device
            </Link>
          </div>
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
                <DevicePhoneMobileIcon width={32} height={32} color="#3b82f6" />
                <div>
                  <h3 style={{ color: '#3b82f6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                    {stats.totalDevices}
                  </h3>
                  <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Total Devices</p>
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
                <CheckCircleIcon width={32} height={32} color="#10b981" />
                <div>
                  <h3 style={{ color: '#10b981', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                    {stats.activeDevices}
                  </h3>
                  <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Online</p>
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
                <XCircleIcon width={32} height={32} color="#ef4444" />
                <div>
                  <h3 style={{ color: '#ef4444', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                    {stats.offlineDevices}
                  </h3>
                  <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Offline</p>
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
                <ExclamationTriangleIcon width={32} height={32} color="#f59e0b" />
                <div>
                  <h3 style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                    {stats.totalAlerts}
                  </h3>
                  <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Alerts</p>
                </div>
              </div>
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
                placeholder="Search devices..."
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
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="maintenance">Maintenance</option>
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
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
              <option value="all">All Types</option>
              <option value="bus">Bus</option>
              <option value="train">Train</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: refreshing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: refreshing ? 0.7 : 1
              }}
            >
              <ArrowPathIcon width={20} height={20} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedDevices.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center'
            }}>
              <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                {selectedDevices.length} selected
              </span>
              <button
                onClick={() => handleBulkAction('online')}
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
                Set Online
              </button>
              <button
                onClick={() => handleBulkAction('maintenance')}
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
                Set Maintenance
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

        {/* Devices Table */}
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
              borderCollapse: 'collapse' as const,
              minWidth: '1200px'
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
                      checked={selectedDevices.length === devices.length && devices.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left' as const,
                    color: '#f1f5f9',
                    fontWeight: '600'
                  }}>Device</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left' as const,
                    color: '#f1f5f9',
                    fontWeight: '600'
                  }}>Vehicle</th>
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
                  }}>Location</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left' as const,
                    color: '#f1f5f9',
                    fontWeight: '600'
                  }}>Signal</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left' as const,
                    color: '#f1f5f9',
                    fontWeight: '600'
                  }}>Battery</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left' as const,
                    color: '#f1f5f9',
                    fontWeight: '600'
                  }}>Assigned To</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left' as const,
                    color: '#f1f5f9',
                    fontWeight: '600'
                  }}>Last Seen</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left' as const,
                    color: '#f1f5f9',
                    fontWeight: '600'
                  }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device, index) => (
                  <tr key={device._id} style={{
                    borderBottom: index < devices.length - 1 ? '1px solid #334155' : 'none',
                    backgroundColor: index % 2 === 0 ? '#1e293b' : '#1a2332'
                  }}>
                    <td style={{ padding: '1rem' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedDevices.includes(device._id)}
                        onChange={() => handleSelectDevice(device._id)}
                      />
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <div style={{
                          color: '#f1f5f9',
                          fontWeight: '500'
                        }}>
                          {device.deviceId}
                        </div>
                        <div style={{
                          color: '#94a3b8',
                          fontSize: '0.875rem'
                        }}>
                          v{device.firmwareVersion}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <TruckIcon width={16} height={16} color="#94a3b8" />
                        <div>
                          <div style={{
                            color: '#f1f5f9',
                            fontWeight: '500'
                          }}>
                            {device.vehicleNumber}
                          </div>
                          <div style={{
                            color: '#94a3b8',
                            fontSize: '0.875rem',
                            textTransform: 'capitalize'
                          }}>
                            {device.vehicleType}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span style={{ color: getStatusColor(device.status) }}>
                          {getStatusIcon(device.status)}
                        </span>
                        <div>
                          <button
                            onClick={() => handleUpdateDeviceStatus(device._id, 
                              device.status === 'online' ? 'maintenance' : 'online'
                            )}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: getStatusColor(device.status),
                              fontWeight: '500',
                              textTransform: 'capitalize',
                              cursor: 'pointer',
                              padding: 0
                            }}
                          >
                            {device.status}
                          </button>
                          {device.alerts.count > 0 && (
                            <div style={{
                              color: '#ef4444',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                            onClick={() => handleClearAlerts(device._id)}
                            >
                              {device.alerts.count} alerts (click to clear)
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <MapPinIcon width={16} height={16} color="#94a3b8" />
                        <div>
                          <div style={{
                            color: '#f1f5f9',
                            fontSize: '0.875rem'
                          }}>
                            {device.location.address}
                          </div>
                          <div style={{
                            color: '#94a3b8',
                            fontSize: '0.75rem'
                          }}>
                            {device.location.latitude.toFixed(4)}, {device.location.longitude.toFixed(4)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        {getSignalBars(device.signalStrength)}
                        <span style={{
                          color: '#94a3b8',
                          fontSize: '0.875rem'
                        }}>
                          {device.signalStrength}/5
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <BoltIcon width={16} height={16} color={getBatteryColor(device.batteryLevel)} />
                        <span style={{
                          color: getBatteryColor(device.batteryLevel),
                          fontWeight: '500'
                        }}>
                          {device.batteryLevel}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <div style={{
                          color: '#f1f5f9',
                          fontSize: '0.875rem'
                        }}>
                          {device.assignedTo.name}
                        </div>
                        <div style={{
                          color: '#94a3b8',
                          fontSize: '0.75rem',
                          textTransform: 'capitalize'
                        }}>
                          {device.assignedTo.type.replace('_', ' ')}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{
                        color: device.status === 'online' ? '#10b981' : '#94a3b8',
                        fontSize: '0.875rem'
                      }}>
                        {getTimeSince(device.lastSeen)}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem'
                      }}>
                        <Link
                          href={`/sysadmin/devices/${device._id}`}
                          style={{
                            color: '#3b82f6',
                            textDecoration: 'none',
                            padding: '0.25rem'
                          }}
                        >
                          <EyeIcon width={16} height={16} />
                        </Link>
                        <Link
                          href={`/sysadmin/devices/${device._id}/edit`}
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
                            setDeviceToDelete(device._id);
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
            Showing {devices.length} of {pagination.totalDevices} devices (Page {pagination.currentPage} of {pagination.totalPages})
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
              Are you sure you want to delete this device? This action cannot be undone.
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
                onClick={() => deviceToDelete && handleDeleteDevice(deviceToDelete)}
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